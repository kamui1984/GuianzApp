const crypto = require('crypto');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarPaquete } = require('../services/serializacion.servicio');
const { subirArchivo, eliminarArchivos } = require('../services/almacenamiento.servicio');
const {
  crearReserva,
  listarReservasPorAgencia,
  asignarGuiaAReserva,
  eliminarReserva
} = require('../services/reservas.servicio');
const paquetesToursServicio = require('../services/paquetesTours.servicio');
const perfilGuiasServicio = require('../services/perfilGuias.servicio');

/**
 * Explorar todos los paquetes turísticos para la Landing / Catálogo público.
 */
const explorarPaquetes = async (peticion, respuesta) => {
  try {
    const { data: paquetes, error } = await clienteSupabaseAdmin
      .from('paquetes')
      .select('*, archivos_paquete(*)')
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al explorar paquetes:', error);
      return respuesta.status(500).json({ error: 'No se pudieron cargar los paquetes turísticos.' });
    }

    const idsAgencias = [...new Set((paquetes || []).map((p) => p.id_agencia).filter(Boolean))];
    const mapaAgencias = {};

    if (idsAgencias.length > 0) {
      const { data: perfiles } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('id, nombre_agencia, nombre_completo, numero_rnt, estado')
        .in('id', idsAgencias);

      if (perfiles) {
        perfiles.forEach((perfil) => {
          mapaAgencias[perfil.id] = perfil;
        });
      }
    }

    const paquetesSerializados = await Promise.all((paquetes || []).map(async (paquete) => {
      const agencia = mapaAgencias[paquete.id_agencia];
      const base = await serializarPaquete(paquete);
      const nombreAgencia = agencia?.nombre_agencia || agencia?.nombre_completo || base.nombreAgencia || 'Agencia Operadora';
      const numeroRnt = agencia?.numero_rnt || base.numeroRnt || 'Validado';

      return {
        ...base,
        nombreAgencia,
        agencyName: nombreAgencia,
        numeroRnt,
        rntNumber: numeroRnt
      };
    }));

    return respuesta.json({
      paquetes: paquetesSerializados,
      packages: paquetesSerializados
    });
  } catch (error) {
    console.error('Error general al explorar paquetes:', error);
    return respuesta.status(500).json({ error: 'Error al consultar el catálogo de paquetes.' });
  }
};

/**
 * Listar los paquetes creados por la agencia actualmente autenticada.
 */
const listarMisPaquetes = async (peticion, respuesta) => {
  try {
    const idAgencia = peticion.usuario.auth.id;

    const { data: paquetes, error } = await clienteSupabaseAdmin
      .from('paquetes')
      .select('*, archivos_paquete(*)')
      .eq('id_agencia', idAgencia)
      .order('creado_en', { ascending: false });

    if (error) {
      return respuesta.status(500).json({ error: 'No se pudieron cargar los paquetes de la agencia.' });
    }

    const resultado = await Promise.all(paquetes.map(serializarPaquete));
    return respuesta.json({ paquetes: resultado, packages: resultado });
  } catch (error) {
    console.error('Error al listar paquetes de agencia:', error);
    return respuesta.status(500).json({ error: 'Error interno al consultar tus paquetes.' });
  }
};

/**
 * Crear un nuevo paquete turístico con duración y subida de archivos.
 */
const crearPaquete = async (peticion, respuesta) => {
  try {
    const perfil = peticion.usuario.perfil;
    const idAgencia = peticion.usuario.auth.id;

    if (perfil.rol !== 'agencia') {
      return respuesta.status(403).json({ error: 'Solo una agencia autorizada puede crear paquetes turísticos.' });
    }

    if (perfil.estado !== 'aprobado') {
      return respuesta.status(403).json({
        error: 'Tu agencia está en revisión de RNT. Podrás publicar paquetes en cuanto sea aprobada.'
      });
    }

    const titulo = peticion.body.titulo || peticion.body.title || peticion.body.nombreTour;
    const descripcion = peticion.body.descripcion || peticion.body.description;
    const precio = peticion.body.precio || peticion.body.price;
    const duracion = peticion.body.duracion || peticion.body.duration || '3.5 horas';
    const duracionHoras = parseInt(peticion.body.duracionHoras || peticion.body.duracion) || 4;
    const politicaCancelacion = peticion.body.politicaCancelacion || peticion.body.cancellationPolicy;
    const rawEspecialidades = peticion.body.especialidadesIds || peticion.body.especialidades;
    const rawSalidas = peticion.body.salidas || peticion.body.programacion;

    if (!titulo || !descripcion || !precio) {
      return respuesta.status(400).json({ error: 'Título, descripción y precio son obligatorios.' });
    }

    let especialidadesIds = [];
    if (typeof rawEspecialidades === 'string') {
      try {
        especialidadesIds = JSON.parse(rawEspecialidades);
      } catch (e) {
        especialidadesIds = rawEspecialidades.split(',').map(Number).filter(Boolean);
      }
    } else if (Array.isArray(rawEspecialidades)) {
      especialidadesIds = rawEspecialidades.map(Number).filter(Boolean);
    }

    let salidas = [];
    if (typeof rawSalidas === 'string') {
      try {
        salidas = JSON.parse(rawSalidas);
      } catch (e) {
        salidas = [];
      }
    } else if (Array.isArray(rawSalidas)) {
      salidas = rawSalidas;
    }

    // 1. Guardar primero en paquetes_tours (nueva tabla requerida con id entero)
    let idTourNumerico = null;
    try {
      const { data: ptData, error: errPt } = await clienteSupabaseAdmin
        .from('paquetes_tours')
        .insert({
          agencia_id: idAgencia,
          nombre_tour: titulo,
          descripcion,
          duracion_horas: duracionHoras,
          precio: Number(precio),
          activo: true
        })
        .select()
        .single();

      if (ptData) {
        idTourNumerico = ptData.id;
      }
    } catch (e) {
      console.warn('Nota paquetes_tours:', e.message);
    }

    // 2. Guardar en paquetes (tabla existente, sin duracion que no existe en su esquema)
    const { data: paqueteCreado, error: errorPaquete } = await clienteSupabaseAdmin
      .from('paquetes')
      .insert({
        id_agencia: idAgencia,
        titulo,
        descripcion,
        precio: Number(precio),
        politica_cancelacion: politicaCancelacion || '',
        estado: 'borrador'
      })
      .select()
      .single();

    if (errorPaquete) {
      console.error('Error al crear paquete:', errorPaquete);
      return respuesta.status(500).json({ error: errorPaquete.message || 'No se pudo registrar el paquete en la base de datos.' });
    }

    // 3. Guardar especialidades del tour y salidas programadas
    await paquetesToursServicio.guardarEspecialidadesTour(paqueteCreado.id, especialidadesIds, idTourNumerico);
    if (salidas.length > 0) {
      await paquetesToursServicio.guardarProgramacionTour(paqueteCreado.id, salidas, idTourNumerico);
    }

    const archivosSubidos = [];
    try {
      for (const archivo of peticion.files || []) {
        const extension = path.extname(archivo.originalname).toLowerCase();
        const rutaAlmacenamiento = `${idAgencia}/${paqueteCreado.id}/${crypto.randomUUID()}${extension}`;

        await subirArchivo('package-files', rutaAlmacenamiento, archivo.buffer, archivo.mimetype);

        const { data: datosArchivo, error: errorArchivo } = await clienteSupabaseAdmin
          .from('archivos_paquete')
          .insert({
            id_paquete: paqueteCreado.id,
            ruta_almacenamiento: rutaAlmacenamiento,
            nombre_original: archivo.originalname,
            tipo_mime: archivo.mimetype
          })
          .select()
          .single();

        if (errorArchivo) throw errorArchivo;

        archivosSubidos.push({
          id: datosArchivo.id,
          nombre_original: datosArchivo.nombre_original,
          ruta_almacenamiento: datosArchivo.ruta_almacenamiento,
          tipo_mime: datosArchivo.tipo_mime
        });
      }

      const paqueteCompleto = await serializarPaquete({
        ...paqueteCreado,
        duracion,
        archivos_paquete: archivosSubidos
      });

      return respuesta.status(201).json({
        paquete: paqueteCompleto,
        package: paqueteCompleto,
        mensaje: 'Paquete creado exitosamente con especialidades y programación.'
      });
    } catch (errorSubida) {
      await clienteSupabaseAdmin.from('paquetes').delete().eq('id', paqueteCreado.id);
      console.error('Error al subir archivos del paquete:', errorSubida);
      return respuesta.status(500).json({ error: 'No se pudieron procesar los archivos multimedia del paquete.' });
    }
  } catch (error) {
    console.error('Error general en crearPaquete:', error);
    return respuesta.status(500).json({ error: 'Ocurrió un error inesperado al crear el paquete.' });
  }
};

/**
 * Actualizar un paquete existente de la agencia con duración.
 */
const actualizarPaquete = async (peticion, respuesta) => {
  try {
    const idPaquete = peticion.params.id;
    const idAgencia = peticion.usuario.auth.id;
    const perfil = peticion.usuario.perfil;

    if (perfil.rol !== 'agencia') {
      return respuesta.status(403).json({ error: 'Solo una agencia puede editar paquetes.' });
    }

    if (perfil.estado !== 'aprobado') {
      return respuesta.status(403).json({ error: 'Tu cuenta de agencia aún no ha sido aprobada.' });
    }

    const titulo = peticion.body.titulo || peticion.body.title;
    const descripcion = peticion.body.descripcion || peticion.body.description;
    const precio = peticion.body.precio || peticion.body.price;
    const duracion = peticion.body.duracion || peticion.body.duration || '3.5 horas';
    const politicaCancelacion = peticion.body.politicaCancelacion || peticion.body.cancellationPolicy;
    const idsArchivosEliminados = peticion.body.idsArchivosEliminados || peticion.body.removeFileIds;

    if (!titulo || !descripcion || !precio) {
      return respuesta.status(400).json({ error: 'Título, descripción y precio son obligatorios.' });
    }

    const { data: paqueteExistente, error: errorBusqueda } = await clienteSupabaseAdmin
      .from('paquetes')
      .select('*')
      .eq('id', idPaquete)
      .eq('id_agencia', idAgencia)
      .single();

    if (errorBusqueda || !paqueteExistente) {
      return respuesta.status(404).json({ error: 'Paquete no encontrado o no pertenece a tu agencia.' });
    }

    // Procesar eliminación de archivos
    const idsParaEliminar = String(idsArchivosEliminados || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (idsParaEliminar.length > 0) {
      const { data: archivosEliminar } = await clienteSupabaseAdmin
        .from('archivos_paquete')
        .select('*')
        .in('id', idsParaEliminar)
        .eq('id_paquete', idPaquete);

      const rutasParaBorrar = (archivosEliminar || []).map((a) => a.ruta_almacenamiento);
      await eliminarArchivos('package-files', rutasParaBorrar);

      await clienteSupabaseAdmin
        .from('archivos_paquete')
        .delete()
        .in('id', idsParaEliminar)
        .eq('id_paquete', idPaquete);
    }

    // Actualizar datos del paquete (solo columnas existentes en la tabla paquetes)
    const { error: errorActualizacion } = await clienteSupabaseAdmin
      .from('paquetes')
      .update({
        titulo,
        descripcion,
        precio: Number(precio),
        politica_cancelacion: politicaCancelacion || ''
      })
      .eq('id', idPaquete)
      .eq('id_agencia', idAgencia);

    if (errorActualizacion) {
      console.error('Error al actualizar paquete:', errorActualizacion);
      return respuesta.status(500).json({ error: errorActualizacion.message || 'No se pudo actualizar los datos del paquete.' });
    }

    // Subir nuevos archivos adjuntos si existen
    for (const archivo of peticion.files || []) {
      const extension = path.extname(archivo.originalname).toLowerCase();
      const rutaAlmacenamiento = `${idAgencia}/${idPaquete}/${crypto.randomUUID()}${extension}`;

      await subirArchivo('package-files', rutaAlmacenamiento, archivo.buffer, archivo.mimetype);

      await clienteSupabaseAdmin
        .from('archivos_paquete')
        .insert({
          id_paquete: idPaquete,
          ruta_almacenamiento: rutaAlmacenamiento,
          nombre_original: archivo.originalname,
          tipo_mime: archivo.mimetype
        });
    }

    // Sincronizar actualización con paquetes_tours (id entero para Supabase)
    const duracionHoras = parseInt(duracion) || 4;
    let idTourNumerico = await paquetesToursServicio.resolverTourIdNumerico(idPaquete);

    try {
      if (idTourNumerico) {
        await clienteSupabaseAdmin
          .from('paquetes_tours')
          .update({
            nombre_tour: titulo,
            descripcion,
            duracion_horas: duracionHoras,
            precio: Number(precio),
            activo: true
          })
          .eq('id', idTourNumerico);
      } else {
        const { data: ptData } = await clienteSupabaseAdmin
          .from('paquetes_tours')
          .insert({
            agencia_id: idAgencia,
            nombre_tour: titulo,
            descripcion,
            duracion_horas: duracionHoras,
            precio: Number(precio),
            activo: true
          })
          .select()
          .maybeSingle();

        if (ptData) {
          idTourNumerico = ptData.id;
        }
      }
    } catch (e) {
      console.warn('Nota actualización paquetes_tours:', e.message);
    }

    // Actualizar especialidades y programación si fueron enviadas
    const rawEspecialidades = peticion.body.especialidadesIds || peticion.body.especialidades;
    const rawSalidas = peticion.body.salidas || peticion.body.programacion;

    if (rawEspecialidades !== undefined) {
      let especialidadesIds = [];
      if (typeof rawEspecialidades === 'string') {
        try {
          especialidadesIds = JSON.parse(rawEspecialidades);
        } catch (e) {
          especialidadesIds = rawEspecialidades.split(',').map(Number).filter(Boolean);
        }
      } else if (Array.isArray(rawEspecialidades)) {
        especialidadesIds = rawEspecialidades.map(Number).filter(Boolean);
      }
      await paquetesToursServicio.guardarEspecialidadesTour(idPaquete, especialidadesIds, idTourNumerico);
    }

    if (rawSalidas !== undefined) {
      let salidas = [];
      if (typeof rawSalidas === 'string') {
        try {
          salidas = JSON.parse(rawSalidas);
        } catch (e) {
          salidas = [];
        }
      } else if (Array.isArray(rawSalidas)) {
        salidas = rawSalidas;
      }
      await paquetesToursServicio.guardarProgramacionTour(idPaquete, salidas, idTourNumerico);
    }

    const { data: paqueteActualizado, error: errorRecarga } = await clienteSupabaseAdmin
      .from('paquetes')
      .select('*, archivos_paquete(*)')
      .eq('id', idPaquete)
      .single();

    if (errorRecarga || !paqueteActualizado) {
      return respuesta.status(500).json({ error: 'No se pudo recargar el paquete actualizado.' });
    }

    const paqueteSerializado = await serializarPaquete(paqueteActualizado);
    return respuesta.json({
      paquete: paqueteSerializado,
      package: paqueteSerializado,
      mensaje: 'Paquete actualizado correctamente.'
    });
  } catch (error) {
    console.error('Error al actualizar paquete:', error);
    return respuesta.status(500).json({ error: 'Error al actualizar el paquete.' });
  }
};

/**
 * Consultar las salidas y programación horaria disponibles de un tour.
 */
const obtenerProgramacionTour = async (peticion, respuesta) => {
  try {
    const idPaquete = peticion.params.id;
    const salidas = await paquetesToursServicio.obtenerProgramacion(idPaquete);
    return respuesta.json({
      programacion: salidas,
      salidas
    });
  } catch (error) {
    console.error('Error al obtener programación de tour:', error);
    return respuesta.status(500).json({ error: 'Error al consultar horarios de salida.' });
  }
};

/**
 * Eliminar un paquete turístico y sus archivos adjuntos.
 */
const eliminarPaquete = async (peticion, respuesta) => {
  try {
    const idPaquete = peticion.params.id;
    const idAgencia = peticion.usuario.auth.id;

    const { data: paqueteExistente } = await clienteSupabaseAdmin
      .from('paquetes')
      .select('*')
      .eq('id', idPaquete)
      .eq('id_agencia', idAgencia)
      .single();

    if (!paqueteExistente) {
      return respuesta.status(404).json({ error: 'Paquete no encontrado.' });
    }

    const { data: archivosParaBorrar } = await clienteSupabaseAdmin
      .from('archivos_paquete')
      .select('ruta_almacenamiento')
      .eq('id_paquete', idPaquete);

    const rutas = (archivosParaBorrar || []).map((a) => a.ruta_almacenamiento);
    await eliminarArchivos('package-files', rutas);

    await clienteSupabaseAdmin.from('archivos_paquete').delete().eq('id', idPaquete);
    await clienteSupabaseAdmin.from('paquetes').delete().eq('id', idPaquete).eq('id_agencia', idAgencia);

    return respuesta.json({ exito: true, mensaje: 'Paquete eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar paquete:', error);
    return respuesta.status(500).json({ error: 'Error al eliminar el paquete turístico.' });
  }
};

/**
 * Registrar una nueva reserva / compra de tour por parte de un turista descontando cupos de la salida seleccionada.
 */
const registrarReserva = async (peticion, respuesta) => {
  try {
    const {
      idPaquete,
      idAgencia,
      nombreTitular,
      correoContacto,
      telefonoContacto,
      fechaReserva,
      horaReserva,
      cantidadPersonas,
      precioTotal,
      duracion,
      tituloPaquete,
      nombreAgencia
    } = peticion.body;

    if (!nombreTitular || !correoContacto || !fechaReserva || !horaReserva) {
      return respuesta.status(400).json({ error: 'Nombre, correo, fecha y hora de inicio son obligatorios.' });
    }

    // Descontar cupos en la tabla programacion_tours para esa fecha y hora
    await paquetesToursServicio.descontarCupos(idPaquete, fechaReserva, horaReserva, cantidadPersonas || 1);

    const reserva = await crearReserva({
      idPaquete,
      idAgencia,
      idTurista: peticion.usuario?.auth?.id || null,
      nombreTitular,
      correoContacto,
      telefonoContacto,
      fechaReserva,
      horaReserva,
      cantidadPersonas: Number(cantidadPersonas || 1),
      precioTotal: Number(precioTotal || 0),
      duracion: duracion || '3.5 horas',
      tituloPaquete,
      nombreAgencia
    });

    return respuesta.status(201).json({
      reserva,
      mensaje: '¡Reserva confirmada con éxito!'
    });
  } catch (error) {
    console.error('Error al registrar reserva:', error);
    return respuesta.status(500).json({ error: 'No se pudo procesar la reserva del tour.' });
  }
};

/**
 * Listar los tours vendidos y reservas para la agencia autenticada.
 */
const listarReservasAgencia = async (peticion, respuesta) => {
  try {
    const idAgencia = peticion.usuario.auth.id;
    const reservas = await listarReservasPorAgencia(idAgencia);
    return respuesta.json({ reservas });
  } catch (error) {
    console.error('Error al listar reservas de agencia:', error);
    return respuesta.status(500).json({ error: 'Error al consultar reservas.' });
  }
};

/**
 * Asignar un guía profesional a un tour vendido.
 */
const asignarGuiaReserva = async (peticion, respuesta) => {
  try {
    const idReserva = peticion.params.id;
    const { idGuia, nombreGuia } = peticion.body;

    if (!idGuia || !nombreGuia) {
      return respuesta.status(400).json({ error: 'Debes seleccionar un guía para la asignación.' });
    }

    // Validar estado del guía (en perfil_guias o perfiles)
    let guiaInfo = await perfilGuiasServicio.obtenerPorUsuarioId(idGuia);

    // Verificación de autoridad directa con la tabla perfiles
    try {
      const { data: perfilDirecto } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('estado, nombre_completo')
        .eq('id', idGuia)
        .maybeSingle();
      if (perfilDirecto?.estado) {
        if (guiaInfo) {
          guiaInfo.estado = perfilDirecto.estado;
        } else {
          guiaInfo = { estado: perfilDirecto.estado, nombreCompleto: perfilDirecto.nombre_completo || nombreGuia };
        }
      }
    } catch (e) {
      // Continuar
    }

    if (guiaInfo && guiaInfo.estado !== 'aprobado') {
      return respuesta.status(403).json({
        error: `No es posible asignar al guía "${guiaInfo.nombreCompleto || nombreGuia}". Su estado de validación de RNT es "${guiaInfo.estado}". Solo se pueden asignar guías oficialmente aprobados.`
      });
    }

    const usuarioAuth = peticion.usuario?.auth;
    const perfilAgencia = peticion.usuario?.perfil;
    const nombreAgencia = peticion.body.nombreAgencia || perfilAgencia?.nombre_agencia || perfilAgencia?.nombre_completo || 'Agencia Operadora';
    const correoAgencia = peticion.body.correoAgencia || usuarioAuth?.email || perfilAgencia?.correo || '';
    const telefonoAgencia = peticion.body.telefonoAgencia || perfilAgencia?.telefono || '3001234567';
    const descripcionTour = peticion.body.descripcionTour || '';

    const reservaActualizada = await asignarGuiaAReserva(idReserva, idGuia, nombreGuia, {
      nombreAgencia,
      correoAgencia,
      telefonoAgencia,
      descripcionTour
    });
    return respuesta.json({
      reserva: reservaActualizada,
      mensaje: `El guía ${nombreGuia} ha sido asignado al tour y notificado.`
    });
  } catch (error) {
    console.error('Error al asignar guía a reserva:', error);
    return respuesta.status(500).json({ error: error.message || 'Error al asignar el guía.' });
  }
};

/**
 * Eliminar una reserva / tour vendido de la agencia.
 */
const eliminarReservaControlador = async (peticion, respuesta) => {
  try {
    const idReserva = peticion.params.id;
    const idAgencia = peticion.usuario.auth.id;

    const eliminada = await eliminarReserva(idReserva, idAgencia);
    if (!eliminada) {
      return respuesta.status(404).json({ error: 'Reserva no encontrada o no pertenece a tu agencia.' });
    }

    return respuesta.json({ mensaje: 'Reserva o tour vendido eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    return respuesta.status(500).json({ error: 'No se pudo eliminar la reserva.' });
  }
};

/**
 * Desasignar un guía de un tour vendido y liberar su disponibilidad.
 */
const desasignarGuiaReserva = async (peticion, respuesta) => {
  try {
    const idReserva = peticion.params.id;
    const reservaActualizada = await asignarGuiaAReserva(idReserva, null, null);
    return respuesta.json({
      reserva: reservaActualizada,
      mensaje: 'El guía ha sido desasignado del tour exitosamente y su disponibilidad ha sido liberada.'
    });
  } catch (error) {
    console.error('Error al desasignar guía de reserva:', error);
    return respuesta.status(500).json({ error: error.message || 'Error al desasignar el guía.' });
  }
};

module.exports = {
  explorarPaquetes,
  listarMisPaquetes,
  crearPaquete,
  actualizarPaquete,
  obtenerProgramacionTour,
  eliminarPaquete,
  registrarReserva,
  listarReservasAgencia,
  asignarGuiaReserva,
  desasignarGuiaReserva,
  eliminarReservaControlador
};

