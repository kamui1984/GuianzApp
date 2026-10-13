import { solicitarApi } from './clienteHttp';

export const servicioCalificaciones = {
  /**
   * Enviar evaluación de una reserva completada (Tour y Guía por separado).
   */
  crearEvaluacion: async ({ idReserva, calificacionTour, comentarioTour, calificacionGuia, comentarioGuia }) => {
    return solicitarApi('/api/evaluaciones', {
      method: 'POST',
      body: JSON.stringify({
        idReserva,
        calificacionTour,
        comentarioTour,
        calificacionGuia,
        comentarioGuia
      })
    });
  },

  /**
   * Consultar ranking separado y comentarios de un Tour.
   */
  obtenerRankingTour: async (idPaquete) => {
    return solicitarApi(`/api/evaluaciones/paquete/${idPaquete}`);
  },

  /**
   * Consultar ranking separado y comentarios de un Guía turístico.
   */
  obtenerRankingGuia: async (idGuia) => {
    return solicitarApi(`/api/evaluaciones/guia/${idGuia}`);
  },

  /**
   * Consultar ranking acumulado y comentarios de una Agencia.
   */
  obtenerRankingAgencia: async (idAgencia) => {
    return solicitarApi(`/api/evaluaciones/agencia/${idAgencia}`);
  },

  /**
   * Consultar evaluaciones realizadas por el turista autenticado.
   */
  listarMisEvaluaciones: async () => {
    const res = await solicitarApi('/api/evaluaciones/mis-evaluaciones');
    return res.evaluaciones || [];
  },

  /**
   * Responder públicamente a una evaluación (Agencia u Operador).
   */
  responderEvaluacion: async (idEvaluacion, textoRespuesta) => {
    return solicitarApi(`/api/evaluaciones/${idEvaluacion}/responder`, {
      method: 'POST',
      body: JSON.stringify({ textoRespuesta })
    });
  },

  /**
   * Reportar una reseña ofensiva para moderación administrativa.
   */
  reportarEvaluacion: async (idEvaluacion, motivoReporte) => {
    return solicitarApi(`/api/evaluaciones/${idEvaluacion}/reportar`, {
      method: 'POST',
      body: JSON.stringify({ motivoReporte })
    });
  },

  /**
   * Marcar una reserva como completada para habilitar su evaluación.
   */
  completarReserva: async (idReserva) => {
    return solicitarApi(`/api/evaluaciones/reservas/${idReserva}/completar`, {
      method: 'PATCH'
    });
  },

  /**
   * Consultar reservas del turista autenticado.
   */
  listarMisReservasTurista: async () => {
    const res = await solicitarApi('/api/paquetes/reservas/turista');
    return res.reservas || [];
  }
};
