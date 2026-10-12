const express = require('express');
const router = express.Router();
const {
  obtenerResumenIndicadores,
  listarPrestadores,
  obtenerColaRevision,
  aprobarPerfil,
  rechazarPerfil,
  solicitarCorreccionesPerfil,
  suspenderPerfil,
  reactivarPerfil,
  listarUsuarios,
  cambiarEstadoUsuario,
  listarEspecialidadesAdmin,
  crearEspecialidad,
  actualizarEspecialidad,
  cambiarEstadoEspecialidad,
  listarReportes,
  actualizarSeguimientoReporte,
  listarAuditoria,
  exportarDatosCSV,
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

// Middleware común para rutas administrativas
const soloAdministrador = [requerirAutenticacion, requerirRol('administrador')];

// 1. Resumen de actividad e indicadores
router.get('/resumen-indicadores', ...soloAdministrador, obtenerResumenIndicadores);

// 2. Validación y gestión de prestadores turísticos (Agencias y Guías)
router.get('/prestadores', ...soloAdministrador, listarPrestadores);
router.get('/cola-revision', ...soloAdministrador, obtenerColaRevision);
router.post('/perfiles/:id/aprobar', ...soloAdministrador, aprobarPerfil);
router.post('/perfiles/:id/rechazar', ...soloAdministrador, rechazarPerfil);
router.post('/perfiles/:id/solicitar-correcciones', ...soloAdministrador, solicitarCorreccionesPerfil);
router.post('/perfiles/:id/suspender', ...soloAdministrador, suspenderPerfil);
router.post('/perfiles/:id/reactivar', ...soloAdministrador, reactivarPerfil);

// 3. Usuarios y cuentas
router.get('/usuarios', ...soloAdministrador, listarUsuarios);
router.post('/usuarios/:id/cambiar-estado', ...soloAdministrador, cambiarEstadoUsuario);

// 4. Catálogo común de especialidades y categorías
router.get('/especialidades', ...soloAdministrador, listarEspecialidadesAdmin);
router.post('/especialidades', ...soloAdministrador, crearEspecialidad);
router.put('/especialidades/:id', ...soloAdministrador, actualizarEspecialidad);
router.patch('/especialidades/:id/estado', ...soloAdministrador, cambiarEstadoEspecialidad);

// 5. Gestión de reportes y reclamaciones
router.get('/reportes', ...soloAdministrador, listarReportes);
router.patch('/reportes/:id', ...soloAdministrador, actualizarSeguimientoReporte);

// 6. Historial de auditoría
router.get('/auditoria', ...soloAdministrador, listarAuditoria);

// 7. Exportación de datos administrativos
router.get('/exportar/:tipo', ...soloAdministrador, exportarDatosCSV);

module.exports = router;
