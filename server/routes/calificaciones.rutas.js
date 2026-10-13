const express = require('express');
const router = express.Router();
const {
  crearEvaluacion,
  obtenerRankingTour,
  obtenerRankingGuia,
  listarMisEvaluaciones,
  responderEvaluacion,
  reportarEvaluacion,
  completarReserva
} = require('../controllers/calificaciones.controlador');
const { requerirAutenticacion } = require('../middlewares/autenticacion.middleware');

// Rutas públicas de consulta de rankings
router.get('/paquete/:idPaquete', obtenerRankingTour);
router.get('/guia/:idGuia', obtenerRankingGuia);

// Rutas protegidas para turistas
router.post('/', requerirAutenticacion, crearEvaluacion);
router.get('/mis-evaluaciones', requerirAutenticacion, listarMisEvaluaciones);
router.patch('/reservas/:id/completar', requerirAutenticacion, completarReserva);

// Rutas protegidas para agencias y guías
router.post('/:id/responder', requerirAutenticacion, responderEvaluacion);
router.post('/:id/reportar', requerirAutenticacion, reportarEvaluacion);

module.exports = router;
