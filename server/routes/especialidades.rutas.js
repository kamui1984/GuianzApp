const express = require('express');
const router = express.Router();
const especialidadesServicio = require('../services/especialidades.servicio');

/**
 * Obtener todas las especialidades disponibles en el catálogo.
 */
router.get('/', async (peticion, respuesta) => {
  try {
    const especialidades = await especialidadesServicio.obtenerEspecialidades();
    const agrupadas = await especialidadesServicio.obtenerPorCategorias();

    return respuesta.json({
      especialidades,
      agrupadas
    });
  } catch (error) {
    console.error('Error al obtener catálogo de especialidades:', error);
    return respuesta.status(500).json({ error: 'Error al consultar especialidades.' });
  }
});

/**
 * Obtener especialidades agrupadas por macro categoría para la interfaz de usuario.
 */
router.get('/categorias', async (peticion, respuesta) => {
  try {
    const categorias = await especialidadesServicio.obtenerPorCategorias();
    return respuesta.json({ categorias });
  } catch (error) {
    console.error('Error al obtener categorías de especialidades:', error);
    return respuesta.status(500).json({ error: 'Error al consultar categorías.' });
  }
});

module.exports = router;
