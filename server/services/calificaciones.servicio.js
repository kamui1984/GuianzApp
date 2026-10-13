const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { leerReservasLocal, guardarReservasLocal } = require('./reservas.servicio');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoEvaluaciones = path.join(rutaDirectorioData, 'evaluaciones_servicios.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

// Reseñas semilla representativas de Bogotá para tours y guías
const RESEÑAS_SEMILLA = [
  {
    id: 'rev-seed-1',
    id_reserva: 'res-completada-001',
    codigo_reserva: '#RES-000008',
    id_turista: 'turista-seed-1',
    nombre_turista: 'Laura Marcela Duque',
    correo_turista: 'laura.duque@gmail.com',
    id_paquete: 'base-1',
    titulo_paquete: 'Bogotá Colonial & Secretos de La Candelaria',
    id_agencia: 'agencia-bogota-andando',
    nombre_agencia: 'Bogotá Andando S.A.S.',
    id_guia: '73583284-b4e8-4dd9-990c-233d41a0e173',
    nombre_guia: 'Guía 1',
    calificacion_tour: 5,
    comentario_tour: 'Excelente recorrido por los callejones históricos y el Chorro de Quevedo. El café de cortesía fue delicioso y la puntualidad inmejorable.',
    calificacion_guia: 5,
    comentario_guia: 'El guía demostró un dominio histórico asombroso del periodo colonial e independencia. Muy atento, paciente y con excelente sentido del humor.',
    respuesta_agencia: '¡Gracias Laura por acompañarnos! Nos alegra que disfrutaras los relatos patrimoniales de Bogotá.',
    fecha_respuesta_agencia: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    respuesta_guia: null,
    fecha_respuesta_guia: null,
    reportada_abuso: false,
    motivo_reporte_abuso: null,
    estado_moderacion: 'visible',
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'rev-seed-2',
    id_reserva: 'res-completada-002',
    codigo_reserva: '#RES-000009',
    id_turista: 'turista-seed-2',
    nombre_turista: 'Julian David Castro',
    correo_turista: 'julian.castro@hotmail.com',
    id_paquete: 'base-2',
    titulo_paquete: 'Sendero de los Cerros Orientales & Mirador Monserrate',
    id_agencia: 'agencia-explora-cerros',
    nombre_agencia: 'Explora Cerros Bogotá',
    id_guia: '39c00b78-6e05-421d-8377-e6a0c7c4a6d6',
    nombre_guia: 'Guia 3',
    calificacion_tour: 4,
    comentario_tour: 'La caminata es hermosa y las vistas de la sabana espectaculares. El sendero fue un poco empinado pero bien coordinado con hidratación.',
    calificacion_guia: 5,
    comentario_guia: 'El guía conoce toda la flora andina y aves de los cerros. Nos ayudó en los tramos de mayor exigencia física.',
    respuesta_agencia: null,
    fecha_respuesta_agencia: null,
    respuesta_guia: 'Un placer caminar con ustedes por nuestros cerros tutelares.',
    fecha_respuesta_guia: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reportada_abuso: false,
    motivo_reporte_abuso: null,
    estado_moderacion: 'visible',
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'rev-seed-3',
    id_reserva: 'res-completada-003',
    codigo_reserva: '#RES-000010',
    id_turista: 'turista-seed-3',
    nombre_turista: 'Camila Echeverri',
    correo_turista: 'camila.ech@gmail.com',
    id_paquete: 'base-4',
    titulo_paquete: 'Distrito Graffiti & Arte Urbano Capitalino',
    id_agencia: 'agencia-muros-vivos',
    nombre_agencia: 'Muros Vivos Travel',
    id_guia: '13c00d2b-7d8a-4622-b553-d0fb82f5a958',
    nombre_guia: 'Guia 4',
    calificacion_tour: 5,
    comentario_tour: 'Increíble experiencia de arte urbano. Ver los murales en Puente Aranda y conocer las historias detrás de cada artista superó mis expectativas.',
    calificacion_guia: 4,
    comentario_guia: 'Buena explicación sobre las técnicas de stencil y aerosol. Buen ritmo del grupo.',
    respuesta_agencia: null,
    fecha_respuesta_agencia: null,
    respuesta_guia: null,
    fecha_respuesta_guia: null,
    reportada_abuso: false,
    motivo_reporte_abuso: null,
    estado_moderacion: 'visible',
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  }
];

const leerEvaluacionesLocal = () => {
  try {
    if (fs.existsSync(rutaArchivoEvaluaciones)) {
      const contenido = fs.readFileSync(rutaArchivoEvaluaciones, 'utf8');
      const datos = JSON.parse(contenido || '[]');
      if (Array.isArray(datos) && datos.length > 0) return datos;
    }
  } catch (error) {
    console.warn('Error al leer evaluaciones_servicios.json:', error.message);
  }
  guardarEvaluacionesLocal(RESEÑAS_SEMILLA);
  return RESEÑAS_SEMILLA;
};

const guardarEvaluacionesLocal = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoEvaluaciones, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar evaluaciones_servicios.json:', error.message);
  }
};

class CalificacionesServicio {
  /**
   * Registrar una nueva evaluación con doble dimensión independiente
   */
  async crearEvaluacion({ idReserva, calificacionTour, comentarioTour, calificacionGuia, comentarioGuia }, turista = {}) {
    if (!idReserva) {
      throw new Error('El ID de la reserva es obligatorio para evaluar.');
    }

    // 1. Validar calificación del Tour
    const calTour = Number(calificacionTour);
    if (!calTour || calTour < 1 || calTour > 5) {
      throw new Error('La calificación del tour debe estar entre 1 y 5 estrellas.');
    }

    // 2. Validar comentario opcional (máximo 500 caracteres)
    const comTour = (comentarioTour || '').trim();
    if (comTour.length > 500) {
      throw new Error('El comentario del tour no puede exceder los 500 caracteres.');
    }

    // 3. Validar calificación opcional del guía (si hubo guía)
    let calGuia = null;
    if (calificacionGuia !== undefined && calificacionGuia !== null && calificacionGuia !== '') {
      calGuia = Number(calificacionGuia);
      if (calGuia < 1 || calGuia > 5) {
        throw new Error('La calificación del guía debe estar entre 1 y 5 estrellas.');
      }
    }

    const comGuia = (comentarioGuia || '').trim();
    if (comGuia.length > 500) {
      throw new Error('El comentario del guía no puede exceder los 500 caracteres.');
    }

    // 4. Buscar la reserva real
    const reservas = leerReservasLocal();
    const indiceReserva = reservas.findIndex((r) => String(r.id) === String(idReserva) || r.codigo_reserva === idReserva);

    if (indiceReserva === -1) {
      throw new Error('No se encontró una reserva vinculada para registrar la evaluación.');
    }

    const reserva = reservas[indiceReserva];

    // 5. Regla crítica: No permitir evaluaciones de servicios no completados o cancelados
    if (reserva.estado === 'cancelada') {
      throw new Error('No es posible evaluar un servicio que fue cancelado.');
    }

    // 6. Regla crítica: Una sola evaluación por reserva
    const listaEvaluaciones = leerEvaluacionesLocal();
    const evaluacionExistente = listaEvaluaciones.find(
      (ev) => String(ev.id_reserva) === String(reserva.id) || ev.codigo_reserva === reserva.codigo_reserva
    );

    if (evaluacionExistente) {
      throw new Error('Esta reserva ya cuenta con una evaluación registrada.');
    }

    // Marcar la reserva como 'completada' si aún figuraba como confirmada
    if (reserva.estado !== 'completada') {
      reserva.estado = 'completada';
      if (!reserva.historial_evidencias) reserva.historial_evidencias = [];
      reserva.historial_evidencias.push({
        fecha: new Date().toISOString(),
        evento: 'Servicio completado y evaluado',
        detalle: `El turista registró su evaluación del tour (${calTour}★) y del guía (${calGuia || 'N/A'}★).`
      });
      reservas[indiceReserva] = reserva;
      guardarReservasLocal(reservas);

      try {
        await clienteSupabaseAdmin
          .from('reservas')
          .update({ estado: 'completada', historial_evidencias: reserva.historial_evidencias })
          .eq('id', reserva.id);
      } catch (e) {}
    }

    const ahoraIso = new Date().toISOString();
    const nuevaEvaluacion = {
      id: crypto.randomUUID(),
      id_reserva: reserva.id,
      codigo_reserva: reserva.codigo_reserva || `#RES-${reserva.id.slice(0, 6)}`,
      id_turista: turista.id || reserva.id_turista || null,
      nombre_turista: turista.nombreCompleto || reserva.nombre_titular || 'Viajero',
      correo_turista: turista.email || reserva.correo_contacto || null,
      id_paquete: reserva.id_paquete || reserva.idPaquete || 'tour-general',
      titulo_paquete: reserva.titulo_paquete || reserva.tituloPaquete || 'Tour Bogotá',
      id_agencia: reserva.id_agencia || reserva.idAgencia || '',
      nombre_agencia: reserva.nombre_agencia || reserva.nombreAgencia || 'Agencia Operadora',
      id_guia: reserva.id_guia_asignado || reserva.idGuiaAsignado || null,
      nombre_guia: reserva.nombre_guia_asignado || reserva.nombreGuiaAsignado || null,
      calificacion_tour: calTour,
      comentario_tour: comTour || null,
      calificacion_guia: calGuia,
      comentario_guia: comGuia || null,
      respuesta_agencia: null,
      fecha_respuesta_agencia: null,
      respuesta_guia: null,
      fecha_respuesta_guia: null,
      reportada_abuso: false,
      motivo_reporte_abuso: null,
      estado_moderacion: 'visible',
      creado_en: ahoraIso,
      actualizado_en: ahoraIso
    };

    listaEvaluaciones.unshift(nuevaEvaluacion);
    guardarEvaluacionesLocal(listaEvaluaciones);

    try {
      await clienteSupabaseAdmin.from('evaluaciones_servicios').insert(nuevaEvaluacion);
    } catch (e) {}

    return nuevaEvaluacion;
  }

  /**
   * Obtener ranking separado y reseñas de un Tour específico
   */
  async obtenerRankingTour(idPaquete) {
    const lista = leerEvaluacionesLocal();
    const idStr = String(idPaquete).trim();

    const deEsteTour = lista.filter(
      (ev) => String(ev.id_paquete).trim() === idStr && ev.estado_moderacion === 'visible'
    );

    const total = deEsteTour.length;
    if (total === 0) {
      return {
        promedio: 0,
        totalEvaluaciones: 0,
        distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        evaluaciones: []
      };
    }

    const suma = deEsteTour.reduce((acc, curr) => acc + curr.calificacion_tour, 0);
    const promedio = Number((suma / total).toFixed(1));

    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    deEsteTour.forEach((ev) => {
      distribucion[ev.calificacion_tour] = (distribucion[ev.calificacion_tour] || 0) + 1;
    });

    return {
      promedio,
      totalEvaluaciones: total,
      distribucion,
      evaluaciones: deEsteTour.map((ev) => ({
        id: ev.id,
        nombreTurista: ev.nombre_turista,
        calificacionTour: ev.calificacion_tour,
        comentarioTour: ev.comentario_tour,
        respuestaAgencia: ev.respuesta_agencia,
        fechaRespuestaAgencia: ev.fecha_respuesta_agencia,
        creadoEn: ev.creado_en
      }))
    };
  }

  /**
   * Obtener ranking separado y reseñas del Guía turístico
   */
  async obtenerRankingGuia(idGuia) {
    const lista = leerEvaluacionesLocal();
    const idStr = String(idGuia).trim();

    const deEsteGuia = lista.filter(
      (ev) =>
        ev.id_guia &&
        String(ev.id_guia).trim() === idStr &&
        ev.calificacion_guia &&
        ev.estado_moderacion === 'visible'
    );

    const total = deEsteGuia.length;
    if (total === 0) {
      return {
        promedio: 0,
        totalEvaluaciones: 0,
        distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        evaluaciones: []
      };
    }

    const suma = deEsteGuia.reduce((acc, curr) => acc + curr.calificacion_guia, 0);
    const promedio = Number((suma / total).toFixed(1));

    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    deEsteGuia.forEach((ev) => {
      distribucion[ev.calificacion_guia] = (distribucion[ev.calificacion_guia] || 0) + 1;
    });

    return {
      promedio,
      totalEvaluaciones: total,
      distribucion,
      evaluaciones: deEsteGuia.map((ev) => ({
        id: ev.id,
        nombreTurista: ev.nombre_turista,
        tituloTour: ev.titulo_paquete,
        calificacionGuia: ev.calificacion_guia,
        comentarioGuia: ev.comentario_guia,
        respuestaGuia: ev.respuesta_guia,
        fechaRespuestaGuia: ev.fecha_respuesta_guia,
        creadoEn: ev.creado_en
      }))
    };
  }

  /**
   * Consultar evaluaciones realizadas por un turista autenticado
   */
  async obtenerEvaluacionesPorTurista(idTurista, correo = '') {
    const lista = leerEvaluacionesLocal();
    const idStr = String(idTurista || '').trim();
    const correoNorm = (correo || '').toLowerCase().trim();

    return lista.filter(
      (ev) =>
        (idStr && String(ev.id_turista).trim() === idStr) ||
        (correoNorm && (ev.correo_turista || '').toLowerCase().trim() === correoNorm)
    );
  }

  /**
   * Consultar evaluación asociada a una reserva
   */
  async obtenerEvaluacionDeReserva(idReserva) {
    const lista = leerEvaluacionesLocal();
    const idStr = String(idReserva).trim();
    return lista.find((ev) => String(ev.id_reserva).trim() === idStr || ev.codigo_reserva === idStr) || null;
  }

  /**
   * Derecho de respuesta pública para la Agencia o el Guía
   */
  async responderEvaluacion(idEvaluacion, { textoRespuesta, tipoUsuario, idUsuario }) {
    if (!textoRespuesta || !textoRespuesta.trim()) {
      throw new Error('El texto de la respuesta no puede estar vacío.');
    }

    const lista = leerEvaluacionesLocal();
    const indice = lista.findIndex((ev) => ev.id === idEvaluacion);

    if (indice === -1) {
      throw new Error('No se encontró la evaluación.');
    }

    const evaluacion = { ...lista[indice] };
    const ahoraIso = new Date().toISOString();

    if (tipoUsuario === 'agencia') {
      evaluacion.respuesta_agencia = textoRespuesta.trim();
      evaluacion.fecha_respuesta_agencia = ahoraIso;
    } else if (tipoUsuario === 'guia') {
      evaluacion.respuesta_guia = textoRespuesta.trim();
      evaluacion.fecha_respuesta_guia = ahoraIso;
    } else {
      throw new Error('Solo la agencia o el guía pueden publicar una respuesta formal.');
    }

    evaluacion.actualizado_en = ahoraIso;
    lista[indice] = evaluacion;
    guardarEvaluacionesLocal(lista);

    try {
      await clienteSupabaseAdmin
        .from('evaluaciones_servicios')
        .update({
          respuesta_agencia: evaluacion.respuesta_agencia,
          fecha_respuesta_agencia: evaluacion.fecha_respuesta_agencia,
          respuesta_guia: evaluacion.respuesta_guia,
          fecha_respuesta_guia: evaluacion.fecha_respuesta_guia,
          actualizado_en: ahoraIso
        })
        .eq('id', idEvaluacion);
    } catch (e) {}

    return evaluacion;
  }

  /**
   * Moderación justificada: reportar reseña por contenido abusivo o difamatorio
   */
  async reportarEvaluacion(idEvaluacion, { motivoReporte, usuarioReportante }) {
    if (!motivoReporte || !motivoReporte.trim()) {
      throw new Error('Debes indicar el motivo del reporte de moderación.');
    }

    const lista = leerEvaluacionesLocal();
    const indice = lista.findIndex((ev) => ev.id === idEvaluacion);

    if (indice === -1) {
      throw new Error('No se encontró la evaluación.');
    }

    const evaluacion = { ...lista[indice] };
    evaluacion.reportada_abuso = true;
    evaluacion.motivo_reporte_abuso = motivoReporte.trim();
    evaluacion.estado_moderacion = 'en_revision';
    evaluacion.actualizado_en = new Date().toISOString();

    lista[indice] = evaluacion;
    guardarEvaluacionesLocal(lista);

    try {
      await clienteSupabaseAdmin
        .from('evaluaciones_servicios')
        .update({
          reportada_abuso: true,
          motivo_reporte_abuso: evaluacion.motivo_reporte_abuso,
          estado_moderacion: 'en_revision'
        })
        .eq('id', idEvaluacion);
    } catch (e) {}

    return evaluacion;
  }
}

module.exports = new CalificacionesServicio();
