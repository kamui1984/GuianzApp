const express = require('express');
const router = express.Router();
const {
  listarGuiasPublicos,
  obtenerPerfilGuia,
  actualizarPerfilGuia,
  listarDisponibilidad,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  listarToursAsignados
} = require('../controllers/guias.controlador');
const { requerirAutenticacion, requerirRol } = require('../middlewares/autenticacion.middleware');
const { cargaArchivos } = require('../middlewares/cargaArchivos.middleware');

// Directorio público
router.get('/publicos', listarGuiasPublicos);

// Perfil de guía con subida de foto de rostro
router.get('/perfil', requerirAutenticacion, requerirRol('guia'), obtenerPerfilGuia);
router.put('/perfil', requerirAutenticacion, requerirRol('guia'), cargaArchivos.single('fotoRostro'), actualizarPerfilGuia);

// Gestión de disponibilidad
router.get('/disponibilidad', requerirAutenticacion, requerirRol('guia'), listarDisponibilidad);
router.post('/disponibilidad', requerirAutenticacion, requerirRol('guia'), crearDisponibilidad);
router.put('/disponibilidad/:id', requerirAutenticacion, requerirRol('guia'), actualizarDisponibilidad);
router.delete('/disponibilidad/:id', requerirAutenticacion, requerirRol('guia'), eliminarDisponibilidad);

// Tours asignados
router.get('/tours-asignados', requerirAutenticacion, requerirRol('guia'), listarToursAsignados);

module.exports = router;
