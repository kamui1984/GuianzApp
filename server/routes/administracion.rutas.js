const express = require('express');
const router = express.Router();
const {
  obtenerColaRevision,
  aprobarPerfil,
  rechazarPerfil,
  reenviarSolicitudPerfil
} = require('../controllers/administracion.controlador');
const { requerirAutenticacion, requerirRol } = require('../middlewares/autenticacion.middleware');
const { cargaArchivos } = require('../middlewares/cargaArchivos.middleware');

// Reenvío de solicitud para prestadores (Agencia o Guía con sesión activa)
router.post(
  '/reenviar-solicitud',
  requerirAutenticacion,
  cargaArchivos.fields([
    { name: 'rntDocument', maxCount: 1 },
    { name: 'professionalCard', maxCount: 1 }
  ]),
  reenviarSolicitudPerfil
);

// Rutas exclusivas para administradores
router.get('/cola-revision', requerirAutenticacion, requerirRol('administrador'), obtenerColaRevision);
router.post('/perfiles/:id/aprobar', requerirAutenticacion, requerirRol('administrador'), aprobarPerfil);
router.post('/perfiles/:id/rechazar', requerirAutenticacion, requerirRol('administrador'), rechazarPerfil);

module.exports = router;
