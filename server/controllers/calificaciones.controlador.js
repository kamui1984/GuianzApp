const calificacionesServicio = require('../services/calificaciones.servicio');
const { leerReservasLocal, guardarReservasLocal } = require('../services/reservas.servicio');
const { clienteSupabaseAdmin } = require('../config/supabase');

/**
 * 1. Registrar una nueva evaluación con doble dimensión
 */
const crearEvaluacion = async (peticion, respuesta) => {
  try {
    const usuario = peticion.usuario ? peticion.usuario.perfil : {};
    const { idReserva, calificacionTour, comentarioTour, calificacionGuia, comentarioGuia } = peticion.body;

    const evaluacion = await calificacionesServicio.crearEvaluacion(
      { idReserva, calificacionTour, comentarioTour, calificacionGuia, comentarioGuia },
      usuario
    );

    return respuesta.status(201).json({
      evaluacion,
      mensaje: '¡Gracias por tu evaluación! Tus opiniones permiten mejorar la calidad del turismo en Bogotá.'
    });
  } catch (error) {
    console.error('Error al registrar evaluación:', error);
    return respuesta.status(400).json({ error: error.message || 'Error al procesar la calificación.' });
  }
};

/**
 * 2. Obtener ranking y comentarios del Tour
 */
const obtenerRankingTour = async (peticion, respuesta) => {
  try {
    const idPaquete = peticion.params.idPaquete;
    const datos = await calificacionesServicio.obtenerRankingTour(idPaquete);
    return respuesta.json(datos);
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar ranking del tour.' });
  }
};

/**
 * 3. Obtener ranking y comentarios del Guía
 */
const obtenerRankingGuia = async (peticion, respuesta) => {
  try {
    const idGuia = peticion.params.idGuia;
    const datos = await calificacionesServicio.obtenerRankingGuia(idGuia);
    return respuesta.json(datos);
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar ranking del guía.' });
  }
};

/**
 * 4. Consultar evaluaciones hechas por el turista autenticado
 */
const listarMisEvaluaciones = async (peticion, respuesta) => {
  try {
    const idTurista = peticion.usuario?.auth?.id || peticion.usuario?.perfil?.id;
    const email = peticion.usuario?.auth?.email;
    const lista = await calificacionesServicio.obtenerEvaluacionesPorTurista(idTurista, email);
    return respuesta.json({ evaluaciones: lista });
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar evaluaciones del usuario.' });
  }
};

/**
 * 5. Responder formalmente a una evaluación (Derecho de respuesta)
 */
const responderEvaluacion = async (peticion, respuesta) => {
  try {
    const idEvaluacion = peticion.params.id;
    const { textoRespuesta } = peticion.body;
    const perfil = peticion.usuario.perfil;

    const actualizada = await calificacionesServicio.responderEvaluacion(idEvaluacion, {
      textoRespuesta,
      tipoUsuario: perfil.rol,
      idUsuario: perfil.id,
      nombreUsuario: perfil.nombre_agencia || perfil.nombre_completo || 'Prestador'
    });

    return respuesta.json({
      evaluacion: actualizada,
      mensaje: 'Tu respuesta ha sido publicada en la reseña.'
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al registrar respuesta.' });
  }
};

/**
 * 6. Reportar reseña ofensiva para moderación
 */
const reportarEvaluacion = async (peticion, respuesta) => {
  try {
    const idEvaluacion = peticion.params.id;
    const { motivoReporte } = peticion.body;
    const perfil = peticion.usuario.perfil;

    const actualizada = await calificacionesServicio.reportarEvaluacion(idEvaluacion, {
      motivoReporte,
      usuarioReportante: perfil
    });

    return respuesta.json({
      evaluacion: actualizada,
      mensaje: 'La reseña fue reportada al equipo de moderación para su revisión.'
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al reportar reseña.' });
  }
};

/**
 * 7. Marcar reserva como completada para habilitar evaluación
 */
const completarReserva = async (peticion, respuesta) => {
  try {
    const idReserva = peticion.params.id;
    const reservas = leerReservasLocal();
    let indice = reservas.findIndex((r) => String(r.id) === String(idReserva));

    if (indice === -1) {
      try {
        const { data: supaRes } = await clienteSupabaseAdmin
          .from('reservas')
          .select('*')
          .eq('id', idReserva)
          .maybeSingle();
        if (supaRes) {
          reservas.unshift(supaRes);
          indice = 0;
        }
      } catch (e) {}
    }

    if (indice === -1) {
      return respuesta.status(404).json({ error: 'No se encontró la reserva.' });
    }

    const reserva = reservas[indice];
    reserva.estado = 'completada';
    if (!reserva.historial_evidencias) reserva.historial_evidencias = [];
    reserva.historial_evidencias.push({
      fecha: new Date().toISOString(),
      evento: 'Servicio completado',
      detalle: 'El recorrido turístico finalizó con éxito. Servicio habilitado para evaluación del turista.'
    });

    reservas[indice] = reserva;
    guardarReservasLocal(reservas);

    try {
      await clienteSupabaseAdmin
        .from('reservas')
        .update({ estado: 'completada', historial_evidencias: reserva.historial_evidencias })
        .eq('id', idReserva);
    } catch (e) {}

    return respuesta.json({
      reserva,
      mensaje: '¡Tour marcado como completado! Ya puedes calificar la experiencia.'
    });
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al completar la reserva.' });
  }
};

/**
 * 7. Obtener ranking y comentarios de la Agencia
 */
const obtenerRankingAgencia = async (peticion, respuesta) => {
  try {
    const idAgencia = peticion.params.idAgencia;
    const datos = await calificacionesServicio.obtenerRankingAgencia(idAgencia);
    return respuesta.json(datos);
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar ranking de la agencia.' });
  }
};

module.exports = {
  crearEvaluacion,
  obtenerRankingTour,
  obtenerRankingGuia,
  obtenerRankingAgencia,
  listarMisEvaluaciones,
  responderEvaluacion,
  reportarEvaluacion,
  completarReserva
};
