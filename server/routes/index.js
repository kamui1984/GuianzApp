const express = require('express');
const router = express.Router();

const rutasAutenticacion = require('./autenticacion.rutas');
const rutasPaquetes = require('./paquetes.rutas');
const rutasGuias = require('./guias.rutas');
const rutasAdministracion = require('./administracion.rutas');
const rutasEspecialidades = require('./especialidades.rutas');

// Controladores para rutas heredadas / aliases de compatibilidad
const {
  iniciarSesion,
  registrarAgencia,
  registrarGuia,
  obtenerUsuarioActual
} = require('../controllers/autenticacion.controlador');
const { explorarPaquetes } = require('../controllers/paquetes.controlador');
const { listarGuiasPublicos } = require('../controllers/guias.controlador');
const { requerirAutenticacion } = require('../middlewares/autenticacion.middleware');
const { cargaArchivos } = require('../middlewares/cargaArchivos.middleware');

// Rutas modulares modernas
router.use('/autenticacion', rutasAutenticacion);
router.use('/paquetes', rutasPaquetes);
router.use('/guias', rutasGuias);
router.use('/administracion', rutasAdministracion);
router.use('/especialidades', rutasEspecialidades);

// Aliases para retrocompatibilidad total con endpoints anteriores
router.post('/autenticacion/registro', cargaArchivos.single('rntDocument'), registrarAgencia);
router.post(
  '/autenticacion/registro-guia',
  cargaArchivos.fields([
    { name: 'rntDocument', maxCount: 1 },
    { name: 'professionalCard', maxCount: 1 }
  ]),
  registrarGuia
);
router.post('/autenticacion/inicio-sesion', iniciarSesion);
router.get('/usuario', requerirAutenticacion, obtenerUsuarioActual);
router.get('/explorar/paquetes', explorarPaquetes);
router.get('/guias', listarGuiasPublicos);

module.exports = router;
