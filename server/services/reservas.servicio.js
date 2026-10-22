const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarReserva } = require('./serializacion.servicio');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoReservas = path.join(rutaDirectorioData, 'reservas.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

const leerReservasLocal = () => {
  try {
    if (fs.existsSync(rutaArchivoReservas)) {
      const contenido = fs.readFileSync(rutaArchivoReservas, 'utf8');
      return JSON.parse(contenido || '[]');
    }
  } catch (error) {
    console.warn('Error al leer reservas.json:', error.message);
  }
  return [];
};

const guardarReservasLocal = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoReservas, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar en reservas.json:', error.message);
  }
};

/**
 * Registra una nueva reserva de tour vendido con persistencia garantizada y trazabilidad legal.
 */
const crearReserva = async (datosReserva) => {
  const idReserva = crypto.randomUUID();
  const idAgenciaNormalizado = String(datosReserva.idAgencia || datosReserva.id_agencia || '').trim();

  // Generar código de reserva amigable (#RES-000015) y único garantizado
  let maxConsecutivo = 0;
  try {
    const { data: supaCodigos } = await clienteSupabaseAdmin
      .from('reservas')
      .select('codigo_reserva');
    if (supaCodigos && supaCodigos.length > 0) {
      for (const item of supaCodigos) {
        const num = parseInt(String(item.codigo_reserva || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > maxConsecutivo) maxConsecutivo = num;
      }
    }
  } catch (e) {}

  const listaLocalActual = leerReservasLocal();
  for (const item of listaLocalActual) {
    const num = parseInt(String(item.codigo_reserva || item.codigoReserva || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > maxConsecutivo) maxConsecutivo = num;
  }
  if (listaLocalActual.length > maxConsecutivo) {
    maxConsecutivo = listaLocalActual.length;
  }

  const consecutivo = String(maxConsecutivo + 1).padStart(6, '0');
  let codigoReserva = `#RES-${consecutivo}`;

  const fechaActualIso = new Date().toISOString();

  // Snapshot de condiciones acordadas en el momento de la contratación
  const condicionesSnapshot = {
    responsable_servicio: datosReserva.nombreAgencia || 'Agencia Operadora',
    rnt_responsable: datosReserva.rntAgencia || 'RNT Registrado en MinCIT',
    que_incluye: datosReserva.queIncluye || 'Servicio de guianza turística y recorrido coordinado según paquete.',
    que_no_incluye: datosReserva.queNoIncluye || 'Gastos personales o servicios no especificados en la descripción.',
    punto_encuentro: datosReserva.puntoEncuentro || 'Punto de encuentro concertado con la agencia.',
    politica_cancelacion: datosReserva.politicaCancelacion || 'Cancelación según políticas oficiales de la agencia.',
    especialidades_requeridas: datosReserva.especialidades || [],
    aviso_legal_plataforma:
      'GuianzApp actúa exclusivamente como plataforma tecnológica que facilita la publicación, reserva y coordinación entre usuarios y prestadores turísticos (Art. 53 Ley 1480/2011). Las condiciones particulares del servicio corresponden al prestador indicado en la reserva.'
  };

  const historialEvidencias = [
    {
      fecha: fechaActualIso,
      evento: 'Reserva creada y registrada',
      detalle: `El turista ${datosReserva.nombreTitular || 'Turista'} aceptó los Términos y Condiciones de GuianzApp (v1.0-co) y las condiciones del prestador ${datosReserva.nombreAgencia || 'Agencia'} (RNT ${datosReserva.rntAgencia || 'Registrado'}). Estado: En espera de confirmación.`
    }
  ];

  const esUuidValido = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || '').trim());
  const idTuristaLimpio = esUuidValido(datosReserva.idTurista || datosReserva.id_turista) ? String(datosReserva.idTurista || datosReserva.id_turista).trim() : null;
  const idAgenciaLimpia = esUuidValido(idAgenciaNormalizado) ? idAgenciaNormalizado : null;

  const registro = {
    id: idReserva,
    codigo_reserva: codigoReserva,
    id_paquete: datosReserva.idPaquete || datosReserva.id_paquete || '',
    id_agencia: idAgenciaLimpia,
    nombre_agencia: datosReserva.nombreAgencia || 'Agencia Operadora',
    rnt_agencia: datosReserva.rntAgencia || 'RNT-Activo',
    id_turista: idTuristaLimpio,
    nombre_titular: datosReserva.nombreTitular || datosReserva.nombre_titular || 'Turista Explorador',
    correo_contacto: datosReserva.correoContacto || datosReserva.correo_contacto || '',
    telefono_contacto: datosReserva.telefonoContacto || datosReserva.telefono_contacto || '',
    fecha_reserva: String(datosReserva.fechaReserva || datosReserva.fecha_reserva || '').split('T')[0].split(' ')[0].trim(),
    hora_reserva: datosReserva.horaReserva || datosReserva.hora_reserva || '09:00 AM',
    cantidad_personas: Number(datosReserva.cantidadPersonas || datosReserva.cantidad_personas || 1),
    precio_total: Number(datosReserva.precioTotal || datosReserva.precio_total || 0),
    duracion: datosReserva.duracion || '3.5 horas',
    titulo_paquete: datosReserva.tituloPaquete || 'Experiencia en Bogotá',
    id_guia_asignado: null,
    nombre_guia_asignado: null,
    rnt_guia: null,
    fecha_asignacion_guia: null,
    estado: 'en espera de confirmacion', // Inicialmente en espera de revisión por la agencia
    aceptacion_terminos_turista: true,
    fecha_aceptacion_terminos: fechaActualIso,
    version_terminos: 'v1.0-co',
    condiciones_snapshot: condicionesSnapshot,
    historial_evidencias: historialEvidencias,
    creado_en: fechaActualIso
  };

  // 1. Guardar en almacenamiento persistente local
  const listaLocal = leerReservasLocal();
  listaLocal.unshift(registro);
  guardarReservasLocal(listaLocal);

  // 2. Guardar en Supabase con trazabilidad y reintento contra duplicados
  try {
    let { error: errorSupa } = await clienteSupabaseAdmin.from('reservas').insert(registro);
    if (errorSupa && errorSupa.message?.includes('reservas_codigo_reserva_key')) {
      const nuevoCodigo = `#RES-${consecutivo}-${Date.now().toString().slice(-4)}`;
      registro.codigo_reserva = nuevoCodigo;
      const resRetry = await clienteSupabaseAdmin.from('reservas').insert(registro);
      errorSupa = resRetry.error;
    }
    if (errorSupa) {
      console.warn('Aviso al insertar en tabla reservas Supabase:', errorSupa.message);
    }
  } catch (err) {
    console.warn('Excepción al insertar en reservas Supabase:', err.message);
  }

  return serializarReserva(registro);
};

/**
 * Obtener las reservas asociadas a la agencia.
 */
const listarReservasPorAgencia = async (idAgencia) => {
  const idBuscado = String(idAgencia || '').trim();
  let reservasSupabase = [];

  try {
    const { data, error } = await clienteSupabaseAdmin
      .from('reservas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (data && !error) {
      reservasSupabase = data.filter((r) => {
        const agenciaRes = String(r.id_agencia || r.idAgencia || '').trim();
        return !agenciaRes || agenciaRes === idBuscado;
      });
    }
  } catch (err) {
    console.warn('Aviso: Consultando reservas locales por:', err.message);
  }

  const listaLocal = leerReservasLocal();
  const coincidentesLocal = listaLocal.filter((r) => {
    const agenciaReserva = String(r.id_agencia || r.idAgencia || '').trim();
    return !agenciaReserva || agenciaReserva === idBuscado;
  });

  const mapa = new Map();
  coincidentesLocal.forEach((r) => mapa.set(String(r.id), r));
  reservasSupabase.forEach((r) => mapa.set(String(r.id), r));

  const combinadas = Array.from(mapa.values());
  return combinadas.map((r) => serializarReserva(r));
};

/**
 * Obtener las reservas asignadas a un guía turístico con descripción completa del tour y datos de contacto de la agencia.
 */
const listarReservasPorGuia = async (idGuia) => {
  const idBuscado = String(idGuia || '').trim();
  let reservasSupabase = [];

  try {
    const { data, error } = await clienteSupabaseAdmin
      .from('reservas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (data && !error) {
      reservasSupabase = data.filter((r) => {
        const guiaRes = String(r.id_guia_asignado || r.idGuiaAsignado || '').trim();
        return guiaRes === idBuscado;
      });
    }
  } catch (err) {
    console.warn('Aviso: Consultando reservas locales para guía:', err.message);
  }

  const listaLocal = leerReservasLocal();
  const asignadasLocal = listaLocal.filter((r) => {
    const guiaReserva = String(r.id_guia_asignado || r.idGuiaAsignado || '').trim();
    return guiaReserva === idBuscado;
  });

  const mapa = new Map();
  asignadasLocal.forEach((r) => mapa.set(String(r.id), r));
  reservasSupabase.forEach((r) => mapa.set(String(r.id), r));

  const asignadas = Array.from(mapa.values());

  const enriquecidas = await Promise.all(
    asignadas.map(async (r) => {
      let descripcionTour = r.descripcion_tour || r.descripcionTour;
      let nombreAgencia = r.nombre_agencia || r.nombreAgencia;
      let telefonoAgencia = r.telefono_agencia || r.telefonoAgencia;
      let correoAgencia = r.correo_agencia || r.correoAgencia;

      // 1. Si no tiene descripción del tour, buscar en paquetes
      if (!descripcionTour && r.id_paquete) {
        try {
          const { data: pkg } = await clienteSupabaseAdmin
            .from('paquetes')
            .select('descripcion, titulo')
            .eq('id', r.id_paquete)
            .maybeSingle();
          if (pkg?.descripcion) {
            descripcionTour = pkg.descripcion;
          }
        } catch (e) {
          // Continuar
        }
      }

      // 2. Si faltan datos de la agencia, consultar perfil y auth
      const idAgencia = r.id_agencia || r.idAgencia;
      if (idAgencia && (!correoAgencia || !nombreAgencia)) {
        try {
          const { data: authData } = await clienteSupabaseAdmin.auth.admin.getUserById(idAgencia);
          if (authData?.user?.email && !correoAgencia) {
            correoAgencia = authData.user.email;
          }
          const { data: perfilData } = await clienteSupabaseAdmin
            .from('perfiles')
            .select('nombre_agencia, nombre_completo')
            .eq('id', idAgencia)
            .maybeSingle();
          if (perfilData?.nombre_agencia && !nombreAgencia) {
            nombreAgencia = perfilData.nombre_agencia;
          }
        } catch (e) {
          // Continuar
        }
      }

      if (!telefonoAgencia) {
        telefonoAgencia = '3001234567';
      }

      return {
        ...r,
        descripcion_tour: descripcionTour || 'Recorrido turístico guiado por Bogotá.',
        nombre_agencia: nombreAgencia || 'Agencia Operadora',
        telefono_agencia: telefonoAgencia,
        correo_agencia: correoAgencia || 'contacto@agencia.com'
      };
    })
  );

  return enriquecidas.map((r) => serializarReserva(r));
};

/**
 * Asignar un guía certificado a una reserva de tour vendido.
 */
const asignarGuiaAReserva = async (idReserva, idGuia, nombreGuia, datosAdicionales = {}) => {
  const listaLocal = leerReservasLocal();
  const indice = listaLocal.findIndex((r) => r.id === idReserva);

  if (indice === -1) {
    throw new Error('No se encontró la reserva para asignar el guía.');
  }

  const reserva = listaLocal[indice];
  let descripcionTour = datosAdicionales.descripcionTour || reserva.descripcion_tour;
  let nombreAgencia = datosAdicionales.nombreAgencia || reserva.nombre_agencia;
  let telefonoAgencia = datosAdicionales.telefonoAgencia || reserva.telefono_agencia;
  let correoAgencia = datosAdicionales.correoAgencia || reserva.correo_agencia;
  const rntGuia = datosAdicionales.rntGuia || datosAdicionales.tarjetaProfesional || 'TP-Certificado';
  const fechaAsignacion = new Date().toISOString();

  // Buscar descripción del paquete si no se especificó
  if (!descripcionTour && reserva.id_paquete) {
    try {
      const { data: pkg } = await clienteSupabaseAdmin
        .from('paquetes')
        .select('descripcion')
        .eq('id', reserva.id_paquete)
        .maybeSingle();
      if (pkg?.descripcion) {
        descripcionTour = pkg.descripcion;
      }
    } catch (e) {
      // Continuar
    }
  }

  // Buscar correo de agencia si no viene
  const idAgencia = reserva.id_agencia || reserva.idAgencia;
  if (idAgencia && !correoAgencia) {
    try {
      const { data: authData } = await clienteSupabaseAdmin.auth.admin.getUserById(idAgencia);
      if (authData?.user?.email) {
        correoAgencia = authData.user.email;
      }
    } catch (e) {
      // Continuar
    }
  }

  reserva.id_guia_asignado = idGuia;
  reserva.idGuiaAsignado = idGuia;
  reserva.nombre_guia_asignado = nombreGuia;
  reserva.nombreGuiaAsignado = nombreGuia;
  reserva.rnt_guia = rntGuia;
  reserva.fecha_asignacion_guia = fechaAsignacion;
  reserva.estado = 'confirmada'; // Al tener guía y revisión queda formalmente confirmada
  reserva.descripcion_tour = descripcionTour || 'Recorrido turístico guiado por Bogotá.';
  reserva.nombre_agencia = nombreAgencia || 'Agencia Operadora';
  reserva.telefono_agencia = telefonoAgencia || '3001234567';
  reserva.correo_agencia = correoAgencia || 'contacto@agencia.com';

  if (!reserva.historial_evidencias) {
    reserva.historial_evidencias = [];
  }
  reserva.historial_evidencias.push({
    fecha: fechaAsignacion,
    evento: 'Guía asignado al tour',
    detalle: `La agencia asignó al guía certificado ${nombreGuia} (Tarjeta/RNT: ${rntGuia}). Tour y cupos confirmados.`
  });

  guardarReservasLocal(listaLocal);

  try {
    await clienteSupabaseAdmin
      .from('reservas')
      .update({
        id_guia_asignado: idGuia,
        nombre_guia_asignado: nombreGuia,
        rnt_guia: rntGuia,
        fecha_asignacion_guia: fechaAsignacion,
        estado: 'confirmada',
        descripcion_tour: reserva.descripcion_tour,
        nombre_agencia: reserva.nombre_agencia,
        telefono_agencia: reserva.telefono_agencia,
        correo_agencia: reserva.correo_agencia,
        historial_evidencias: reserva.historial_evidencias
      })
      .eq('id', idReserva);
  } catch (err) {
    // Continuar
  }

  return serializarReserva(reserva);
};

/**
 * Confirmar una reserva por parte de la agencia operadora.
 */
const confirmarReserva = async (idReserva, idAgencia = null) => {
  const listaLocal = leerReservasLocal();
  let indice = listaLocal.findIndex((r) => String(r.id) === String(idReserva));

  // Si no está en reservas local, buscar en Supabase
  if (indice === -1) {
    try {
      const { data: resSupa } = await clienteSupabaseAdmin
        .from('reservas')
        .select('*')
        .eq('id', idReserva)
        .maybeSingle();

      if (resSupa) {
        listaLocal.unshift(resSupa);
        indice = 0;
      }
    } catch (e) {
      console.warn('Error al buscar reserva en Supabase para confirmar:', e.message);
    }
  }

  if (indice === -1) {
    throw new Error('No se encontró la reserva para confirmar.');
  }

  const reserva = listaLocal[indice];
  if (idAgencia) {
    const reservaAgencia = String(reserva.id_agencia || reserva.idAgencia || '').trim();
    const idBuscado = String(idAgencia).trim();
    // Permitir confirmación si no tiene agencia fija asignada, si coincide exactamente o si es la agencia del catálogo
    if (reservaAgencia && reservaAgencia !== idBuscado) {
      // Si la reserva no tenía asignado este ID de agencia, sincronizarlo con el operador que confirma
      reserva.id_agencia = idBuscado;
      reserva.idAgencia = idBuscado;
    }
  }

  const fechaConfirmacion = new Date().toISOString();
  reserva.estado = 'confirmada';

  if (!reserva.historial_evidencias) {
    reserva.historial_evidencias = [];
  }
  reserva.historial_evidencias.push({
    fecha: fechaConfirmacion,
    evento: 'Reserva confirmada por la agencia',
    detalle: `La agencia ${reserva.nombre_agencia || 'operadora'} revisó y confirmó oficialmente la reserva y cupos del tour.`
  });

  guardarReservasLocal(listaLocal);

  try {
    await clienteSupabaseAdmin
      .from('reservas')
      .update({
        estado: 'confirmada',
        id_agencia: reserva.id_agencia || idAgencia,
        historial_evidencias: reserva.historial_evidencias
      })
      .eq('id', idReserva);
  } catch (err) {
    // Continuar
  }

  return serializarReserva(reserva);
};

/**
 * Desasignar un guía de una reserva.
 */
const desasignarGuiaReserva = async (idReserva, idAgencia = null) => {
  const listaLocal = leerReservasLocal();
  let indice = listaLocal.findIndex((r) => String(r.id) === String(idReserva));

  if (indice === -1) {
    try {
      const { data: resSupa } = await clienteSupabaseAdmin
        .from('reservas')
        .select('*')
        .eq('id', idReserva)
        .maybeSingle();

      if (resSupa) {
        listaLocal.unshift(resSupa);
        indice = 0;
      }
    } catch (e) {}
  }

  if (indice === -1) {
    throw new Error('No se encontró la reserva.');
  }

  const reserva = listaLocal[indice];
  const nombreGuiaAnterior = reserva.nombre_guia_asignado;
  reserva.id_guia_asignado = null;
  reserva.idGuiaAsignado = null;
  reserva.nombre_guia_asignado = null;
  reserva.nombreGuiaAsignado = null;
  reserva.rnt_guia = null;
  reserva.fecha_asignacion_guia = null;

  if (!reserva.historial_evidencias) {
    reserva.historial_evidencias = [];
  }
  reserva.historial_evidencias.push({
    fecha: new Date().toISOString(),
    evento: 'Guía desasignado',
    detalle: `Se liberó la asignación de ${nombreGuiaAnterior || 'guía'}. El tour queda a la espera de asignación.`
  });

  guardarReservasLocal(listaLocal);

  try {
    await clienteSupabaseAdmin
      .from('reservas')
      .update({
        id_guia_asignado: null,
        nombre_guia_asignado: null,
        rnt_guia: null,
        fecha_asignacion_guia: null,
        historial_evidencias: reserva.historial_evidencias
      })
      .eq('id', idReserva);
  } catch (err) {
    // Continuar
  }

  return serializarReserva(reserva);
};

/**
 * Eliminar una reserva / tour vendido con soporte para datos en Supabase y local.
 */
const eliminarReserva = async (idReserva, idAgencia = null) => {
  const listaLocal = leerReservasLocal();
  const indice = listaLocal.findIndex((r) => String(r.id) === String(idReserva));

  let encontradaLocal = false;
  if (indice !== -1) {
    listaLocal.splice(indice, 1);
    guardarReservasLocal(listaLocal);
    encontradaLocal = true;
  }

  // Eliminar siempre en Supabase si existe
  let encontradaSupa = false;
  try {
    const { error } = await clienteSupabaseAdmin
      .from('reservas')
      .delete()
      .eq('id', idReserva);
    if (!error) {
      encontradaSupa = true;
    }
  } catch (err) {
    // Continuar
  }

  return encontradaLocal || encontradaSupa;
};

/**
 * Listar reservas de un turista autenticado por su ID o correo.
 * Soporta almacenamiento dual (Supabase + local) y enriquece con punto exacto de encuentro y recomendaciones.
 */
const listarReservasPorTurista = async (idTurista, correo = '') => {
  const listaLocal = leerReservasLocal();
  const idStr = String(idTurista || '').trim();
  const correoNorm = (correo || '').toLowerCase().trim();

  let reservasSupabase = [];
  try {
    const { data } = await clienteSupabaseAdmin
      .from('reservas')
      .select('*')
      .order('creado_en', { ascending: false });
    if (data && data.length > 0) {
      reservasSupabase = data;
    }
  } catch (err) {
    // Continuar con locales
  }

  const mapa = new Map();
  listaLocal.forEach((r) => mapa.set(String(r.id), r));
  reservasSupabase.forEach((r) => mapa.set(String(r.id), { ...mapa.get(String(r.id)), ...r }));

  const todas = Array.from(mapa.values());
  const coincidentes = todas.filter((r) => {
    const idMatch = idStr && String(r.id_turista || r.idTurista || '').trim() === idStr;
    const correoMatch = correoNorm && String(r.correo_contacto || r.correoContacto || '').toLowerCase().trim() === correoNorm;
    return idMatch || correoMatch;
  });

  // Enriquecer con punto de encuentro, que_incluye, que_no_incluye y recomendaciones
  const enriquecidas = await Promise.all(
    coincidentes.map(async (r) => {
      let puntoEncuentro = r.condiciones_snapshot?.punto_encuentro || r.punto_encuentro || r.puntoEncuentro;
      let queIncluye = r.condiciones_snapshot?.que_incluye || r.que_incluye || r.queIncluye;
      let queNoIncluye = r.condiciones_snapshot?.que_no_incluye || r.que_no_incluye || r.queNoIncluye;
      let recomendaciones = r.recomendaciones;

      if ((!puntoEncuentro || !recomendaciones) && r.id_paquete) {
        try {
          const { data: pkg } = await clienteSupabaseAdmin
            .from('paquetes')
            .select('punto_encuentro, que_incluye, que_no_incluye, recomendaciones')
            .eq('id', r.id_paquete)
            .maybeSingle();

          if (pkg) {
            if (!puntoEncuentro) puntoEncuentro = pkg.punto_encuentro;
            if (!queIncluye) queIncluye = pkg.que_incluye;
            if (!queNoIncluye) queNoIncluye = pkg.que_no_incluye;
            if (!recomendaciones) recomendaciones = pkg.recomendaciones;
          }
        } catch (e) {}
      }

      return {
        ...r,
        punto_encuentro: puntoEncuentro || 'Punto de encuentro concertado con la agencia operadora en Bogotá.',
        que_incluye: queIncluye || 'Servicio de guianza profesional y recorrido coordinado.',
        que_no_incluye: queNoIncluye || 'Gastos personales no especificados.',
        recomendaciones: recomendaciones || 'Llevar calzado cómodo, hidratación, ropa adecuada para el clima de Bogotá y documento de identidad.'
      };
    })
  );

  return enriquecidas.map((r) => serializarReserva(r));
};

module.exports = {
  crearReserva,
  listarReservasPorAgencia,
  listarReservasPorGuia,
  listarReservasPorTurista,
  asignarGuiaAReserva,
  confirmarReserva,
  desasignarGuiaReserva,
  eliminarReserva,
  leerReservasLocal
};

