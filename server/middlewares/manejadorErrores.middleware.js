/**
 * Middleware centralizado para captura de excepciones no controladas.
 */
const manejadorErrores = (error, peticion, respuesta, siguiente) => {
  console.error('⚠️ Excepción capturada en middleware global:', error);

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return respuesta.status(400).json({ error: 'El archivo excede el tamaño máximo permitido (10MB).' });
    }
    return respuesta.status(400).json({ error: `Error en la carga del archivo: ${error.message}` });
  }

  const codigoEstado = error.status || error.statusCode || 500;
  const mensaje = error.message || 'Error interno en el servidor';

  return respuesta.status(codigoEstado).json({
    error: mensaje,
    ...(process.env.NODE_ENV === 'development' && { pila: error.stack })
  });
};

module.exports = {
  manejadorErrores
};
