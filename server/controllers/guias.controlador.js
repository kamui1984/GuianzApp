const crypto = require('crypto');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarDisponibilidad, serializarUsuario } = require('../services/serializacion.servicio');
const { obtenerUrlFirmada, subirArchivo } = require('../services/almacenamiento.servicio');
const { listarReservasPorGuia, leerReservasLocal } = require('../services/reservas.servicio');
const { obtenerMetaPerfil, guardarMetaPerfil } = require('../services/perfilesMeta.servicio');
const perfilGuiasServicio = require('../services/perfilGuias.servicio');

/**
 * Listado público de guías turísticos para catálogo y asignación en agencias con disponibilidad y especialidades incluidas.
 */
const listarGuiasPublicos = async (peticion, respuesta) => {
  try {
    const tourEspecialidadesQuery = peticion.query.especialidades
      ? String(peticion.query.especialidades).split(',').map(Number).filter(Boolean)
      : [];

    // 1. Consultar perfiles de guías enriquecidos desde perfil_guias / perfiles
    const guias = await perfilGuiasServicio.listarGuiasParaAgencias();

    // 2. Consultar registros de disponibilidad de guías para cruzarlos
    let listaDisponibilidades = [];
    try {
      const { data: dispData } = await clienteSupabaseAdmin
        .from('disponibilidad_guias')
        .select('*');
      if (dispData) listaDisponibilidades = dispData;
    } catch (err) {
      console.warn('No se pudo consultar disponibilidad_guias:', err.message);
    }

    const mapaDisponibilidad = {};
    listaDisponibilidades.forEach((d) => {
      const idG = d.id_guia;
      if (!mapaDisponibilidad[idG]) mapaDisponibilidad[idG] = [];
      mapaDisponibilidad[idG].push(serializarDisponibilidad(d));
    });

    // 3. Consultar reservas activas asignadas a guías para alertar y bloquear solapamientos
    const todasLasReservas = leerReservasLocal();
    const reservasConGuia = todasLasReservas.filter((r) => r.id_guia_asignado || r.idGuiaAsignado);

    const listaFormateada = guias.map((g) => {
      const usuarioId = g.usuarioId || g.id;
      const disps = mapaDisponibilidad[usuarioId] || mapaDisponibilidad[g.id] || [];

      // Tours activos actualmente asignados a este guía (en cualquier agencia)
      const toursAsignados = reservasConGuia.filter((r) => {
        const idGuiaRes = String(r.id_guia_asignado || r.idGuiaAsignado || '').trim();
        return idGuiaRes === String(usuarioId).trim() || idGuiaRes === String(g.id).trim();
      }).map((r) => ({
        id: r.id,
        idPaquete: r.id_paquete || r.idPaquete,
        tituloPaquete: r.titulo_paquete || r.tituloPaquete || 'Tour Bogotá',
        fechaReserva: r.fecha_reserva || r.fechaReserva,
        horaReserva: r.hora_reserva || r.horaReserva,
        duracion: r.duracion || '3 horas',
        nombreAgencia: r.nombre_agencia || r.nombreAgencia || 'Agencia Aliada',
        idAgencia: r.id_agencia || r.idAgencia
      }));

      // Si se solicitaron especialidades del tour, calcular coincidencia de matching
      let matching = null;
      if (tourEspecialidadesQuery.length > 0) {
        matching = perfilGuiasServicio.calcularMatching(g.especialidadesIds, tourEspecialidadesQuery);
      }

      return {
        ...g,
        disponibilidades: disps,
        toursAsignados,
        matching
      };
    });

    // Ordenar: si hay matching, primero los que tienen 100% match y mayor número de coincidencias
    if (tourEspecialidadesQuery.length > 0) {
      listaFormateada.sort((a, b) => {
        const coincA = a.matching?.coincidencias || 0;
        const coincB = b.matching?.coincidencias || 0;
        return coincB - coincA;
      });
    }

    return respuesta.json({
      guias: listaFormateada,
      guides: listaFormateada
    });
  } catch (error) {
    console.error('Error general en listarGuiasPublicos:', error);
    return respuesta.status(500).json({ error: 'Error interno al consultar guías.' });
  }
};

/**
 * Obtener perfil completo del guía autenticado con foto de rostro, WhatsApp y especialidades.
 */
const obtenerPerfilGuia = async (peticion, respuesta) => {
  try {
    const idUsuario = peticion.usuario.auth.id;
    const perfil = peticion.usuario.perfil;

    if (perfil.rol !== 'guia') {
      return respuesta.status(403).json({ error: 'Solo un guía puede consultar este perfil.' });
    }

    const perfilGuia = await perfilGuiasServicio.obtenerPorUsuarioId(idUsuario);

    return respuesta.json({ perfil: perfilGuia || {} });
  } catch (error) {
    console.error('Error al obtener perfil de guía:', error);
    return respuesta.status(500).json({ error: 'Error al consultar el perfil del guía.' });
  }
};

/**
 * Actualizar datos del perfil de guía, incluyendo subida de foto de rostro y etiquetas de especialidades.
 */
const actualizarPerfilGuia = async (peticion, respuesta) => {
  try {
    const idUsuario = peticion.usuario.auth.id;
    const perfil = peticion.usuario.perfil;

    if (perfil.rol !== 'guia') {
      return respuesta.status(403).json({ error: 'Solo un guía puede editar su perfil.' });
    }

    const {
      nombreCompleto,
      tarjetaProfesional,
      numeroRnt,
      telefonoPrincipal,
      tieneWhatsapp,
      telefonoAlternativo,
      contactoEmergenciaNombre,
      contactoEmergenciaTel,
      reseñaCorta,
      experienciaDetalle,
      competenciasTec,
      idiomas,
      especialidadesIds
    } = peticion.body;

    let idsParseados = [];
    if (typeof especialidadesIds === 'string') {
      try {
        idsParseados = JSON.parse(especialidadesIds);
      } catch (e) {
        idsParseados = especialidadesIds.split(',').map(Number).filter(Boolean);
      }
    } else if (Array.isArray(especialidadesIds)) {
      idsParseados = especialidadesIds.map(Number).filter(Boolean);
    }

    const datosGuia = {
      nombre_completo: nombreCompleto,
      tarjeta_profesional: tarjetaProfesional || numeroRnt,
      telefono_principal: telefonoPrincipal,
      tiene_whatsapp: tieneWhatsapp !== false && tieneWhatsapp !== 'false',
      telefono_alternativo: telefonoAlternativo,
      contacto_emergencia_nombre: contactoEmergenciaNombre,
      contacto_emergencia_tel: contactoEmergenciaTel,
      reseña_corta: reseñaCorta,
      experiencia_detalle: experienciaDetalle,
      competencias_tec: competenciasTec,
      idiomas: idiomas,
      estado: perfil.estado || 'aprobado'
    };

    // Procesar foto de rostro si fue adjuntada
    if (peticion.file) {
      const extension = path.extname(peticion.file.originalname).toLowerCase();
      const rutaFoto = `${idUsuario}/rostro-${crypto.randomUUID()}${extension}`;
      await subirArchivo('guide-documents', rutaFoto, peticion.file.buffer, peticion.file.mimetype);
      datosGuia.ruta_foto_rostro = rutaFoto;
      guardarMetaPerfil(idUsuario, { rutaFotoRostro: rutaFoto });
    }

    const perfilActualizado = await perfilGuiasServicio.guardarOActualizarPerfil(
      idUsuario,
      datosGuia,
      idsParseados
    );

    const usuario = serializarUsuario(peticion.usuario.auth, {
      ...perfil,
      nombre_completo: datosGuia.nombre_completo,
      numero_rnt: datosGuia.tarjeta_profesional
    });

    return respuesta.json({
      usuario,
      perfil: perfilActualizado,
      mensaje: 'Perfil profesional y especialidades de guía actualizados exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar perfil de guía:', error);
    return respuesta.status(500).json({ error: 'Error interno al actualizar perfil.' });
  }
};

/**
 * Listar la disponibilidad horaria del guía autenticado.
 */
const listarDisponibilidad = async (peticion, respuesta) => {
  try {
    const idGuia = peticion.usuario.auth.id;

    const { data: registros, error } = await clienteSupabaseAdmin
      .from('disponibilidad_guias')
      .select('*')
      .eq('id_guia', idGuia)
      .order('fecha_disponible', { ascending: true });

    if (error) {
      return respuesta.status(500).json({ error: 'No se pudo cargar la disponibilidad.' });
    }

    const disponibilidad = (registros || []).map(serializarDisponibilidad);
    return respuesta.json({ disponibilidad, availability: disponibilidad });
  } catch (error) {
    console.error('Error al listar disponibilidad:', error);
    return respuesta.status(500).json({ error: 'Error al consultar disponibilidad.' });
  }
};

/**
 * Agregar disponibilidad (fecha puntual o rango de periodo largo: ej. del 23 al 30 de sept).
 */
const crearDisponibilidad = async (peticion, respuesta) => {
  try {
    const idGuia = peticion.usuario.auth.id;
    const fecha = peticion.body.fecha || peticion.body.date || peticion.body.fechaInicio;
    const fechaFin = peticion.body.fechaFin || peticion.body.fecha;
    const horaInicio = peticion.body.horaInicio || peticion.body.startTime;
    const horaFin = peticion.body.horaFin || peticion.body.endTime;
    const estaDisponible = peticion.body.estaDisponible ?? peticion.body.isAvailable;
    const notas = peticion.body.notas || peticion.body.notes;

    if (!fecha) {
      return respuesta.status(400).json({ error: 'La fecha o fecha de inicio es obligatoria.' });
    }

    const registrosInsertar = [];

    if (fechaFin && fechaFin !== fecha) {
      const fechaActual = new Date(fecha + 'T00:00:00');
      const fechaLimite = new Date(fechaFin + 'T00:00:00');

      let contador = 0;
      while (fechaActual <= fechaLimite && contador < 60) {
        registrosInsertar.push({
          id_guia: idGuia,
          fecha_disponible: fechaActual.toISOString().split('T')[0],
          hora_inicio: horaInicio || '07:00',
          hora_fin: horaFin || '15:00',
          esta_disponible: estaDisponible !== false,
          notes: notas || `Periodo: ${fecha} al ${fechaFin}`
        });
        fechaActual.setDate(fechaActual.getDate() + 1);
        contador++;
      }
    } else {
      registrosInsertar.push({
        id_guia: idGuia,
        fecha_disponible: fecha,
        hora_inicio: horaInicio || '',
        hora_fin: horaFin || '',
        esta_disponible: estaDisponible !== false,
        notes: notas || ''
      });
    }

    const { data, error } = await clienteSupabaseAdmin
      .from('disponibilidad_guias')
      .insert(registrosInsertar)
      .select();

    if (error) {
      console.error('Error al insertar disponibilidad:', error);
      return respuesta.status(500).json({ error: 'No se pudo guardar la franja de disponibilidad.' });
    }

    const resultado = (data || []).map(serializarDisponibilidad);
    return respuesta.status(201).json({
      disponibilidad: resultado[0],
      disponibilidades: resultado,
      mensaje: `Se registraron ${registrosInsertar.length} fecha(s) de disponibilidad exitosamente.`
    });
  } catch (error) {
    console.error('Error en crearDisponibilidad:', error);
    return respuesta.status(500).json({ error: 'Error al registrar la disponibilidad.' });
  }
};

/**
 * Actualizar una franja de disponibilidad existente.
 */
const actualizarDisponibilidad = async (peticion, respuesta) => {
  try {
    const id = peticion.params.id;
    const idGuia = peticion.usuario.auth.id;
    const fecha = peticion.body.fecha || peticion.body.date;
    const horaInicio = peticion.body.horaInicio || peticion.body.startTime;
    const horaFin = peticion.body.horaFin || peticion.body.endTime;
    const estaDisponible = peticion.body.estaDisponible ?? peticion.body.isAvailable;
    const notas = peticion.body.notas || peticion.body.notes;

    if (!fecha) {
      return respuesta.status(400).json({ error: 'La fecha es obligatoria.' });
    }

    const { data, error } = await clienteSupabaseAdmin
      .from('disponibilidad_guias')
      .update({
        fecha_disponible: fecha,
        hora_inicio: horaInicio || '',
        hora_fin: horaFin || '',
        esta_disponible: estaDisponible !== false,
        notes: notas || ''
      })
      .eq('id', id)
      .eq('id_guia', idGuia)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(500).json({ error: 'No se pudo actualizar el registro de disponibilidad.' });
    }

    const resultado = serializarDisponibilidad(data);
    return respuesta.json({
      disponibilidad: resultado,
      mensaje: 'Disponibilidad actualizada exitosamente.'
    });
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    return respuesta.status(500).json({ error: 'Error al editar la disponibilidad.' });
  }
};

/**
 * Eliminar una franja de disponibilidad.
 */
const eliminarDisponibilidad = async (peticion, respuesta) => {
  try {
    const id = peticion.params.id;
    const idGuia = peticion.usuario.auth.id;

    const { error } = await clienteSupabaseAdmin
      .from('disponibilidad_guias')
      .delete()
      .eq('id', id)
      .eq('id_guia', idGuia);

    if (error) {
      return respuesta.status(500).json({ error: 'No se pudo eliminar la disponibilidad.' });
    }

    return respuesta.json({ exito: true, mensaje: 'Disponibilidad eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    return respuesta.status(500).json({ error: 'Error al borrar el registro.' });
  }
};

/**
 * Listar los tours y recorridos a los que ha sido asignado el guía.
 */
const listarToursAsignados = async (peticion, respuesta) => {
  try {
    const idGuia = peticion.usuario.auth.id;
    const tours = await listarReservasPorGuia(idGuia);
    return respuesta.json({ tours });
  } catch (error) {
    console.error('Error al listar tours asignados al guía:', error);
    return respuesta.status(500).json({ error: 'Error al consultar asignaciones.' });
  }
};

module.exports = {
  listarGuiasPublicos,
  obtenerPerfilGuia,
  actualizarPerfilGuia,
  listarDisponibilidad,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  listarToursAsignados
};
