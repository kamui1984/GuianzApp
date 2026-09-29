const express = require('express');
const router = express.Router();
const {
  registrarAgencia,
  registrarGuia,
  registrarTurista,
  iniciarSesion,
  obtenerUsuarioActual
} = require('../controllers/autenticacion.controlador');
const { requerirAutenticacion } = require('../middlewares/autenticacion.middleware');
const { cargaArchivos } = require('../middlewares/cargaArchivos.middleware');
const { validarEsquema, esquemaInicioSesion } = require('../middlewares/validacion.middleware');

// Rutas públicas de autenticación
router.post('/registro', cargaArchivos.single('rntDocument'), registrarAgencia);
router.post(
  '/registro-guia',
  cargaArchivos.fields([
    { name: 'rntDocument', maxCount: 1 },
    { name: 'professionalCard', maxCount: 1 }
  ]),
  registrarGuia
);
router.post('/registro-turista', registrarTurista);
router.post('/inicio-sesion', validarEsquema(esquemaInicioSesion), iniciarSesion);

// Ruta protegida para validar sesión
router.get('/usuario-actual', requerirAutenticacion, obtenerUsuarioActual);

module.exports = router;
