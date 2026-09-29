const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/paquetes.controlador');
const { requerirAutenticacion, requerirRol } = require('../middlewares/autenticacion.middleware');
const { cargaArchivos } = require('../middlewares/cargaArchivos.middleware');

// Rutas de gestión de tours vendidos y asignación de guías (antes de /:id)
router.get('/reservas/agencia', requerirAutenticacion, requerirRol('agencia'), listarReservasAgencia);
router.post('/reservas/:id/asignar-guia', requerirAutenticacion, requerirRol('agencia'), asignarGuiaReserva);
router.post('/reservas/:id/desasignar-guia', requerirAutenticacion, requerirRol('agencia'), desasignarGuiaReserva);
router.delete('/reservas/:id', requerirAutenticacion, requerirRol('agencia'), eliminarReservaControlador);

// Rutas públicas de catálogo y reservas
router.get('/explorar', explorarPaquetes);
router.get('/:id/programacion', obtenerProgramacionTour);
router.post('/reservar', registrarReserva);

// Rutas protegidas para agencias
router.get('/mis-paquetes', requerirAutenticacion, requerirRol('agencia'), listarMisPaquetes);
router.post('/', requerirAutenticacion, requerirRol('agencia'), cargaArchivos.any(), crearPaquete);
router.put('/:id', requerirAutenticacion, requerirRol('agencia'), cargaArchivos.any(), actualizarPaquete);
router.delete('/:id', requerirAutenticacion, requerirRol('agencia'), eliminarPaquete);

module.exports = router;

