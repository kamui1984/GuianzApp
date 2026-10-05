const CLAVE_TOKEN_LOCAL = 'guianz_token';

export const obtenerTokenAutenticacion = () => {
  try {
    return localStorage.getItem(CLAVE_TOKEN_LOCAL);
  } catch {
    return null;
  }
};

export const guardarTokenAutenticacion = (token) => {
  try {
    if (token) {
      localStorage.setItem(CLAVE_TOKEN_LOCAL, token);
    } else {
      localStorage.removeItem(CLAVE_TOKEN_LOCAL);
    }
  } catch (error) {
    console.error('Error al guardar token local:', error);
  }
};

export const eliminarTokenAutenticacion = () => {
  try {
    localStorage.removeItem(CLAVE_TOKEN_LOCAL);
  } catch (error) {
    console.error('Error al eliminar token local:', error);
  }
};

/**
 * Cliente HTTP unificado para realizar peticiones a la API REST.
 * @param {string} ruta - Endpoint relativo (ej: '/api/paquetes/explorar')
 * @param {object} opciones - Opciones de fetch (method, headers, body, etc.)
 */
export const solicitarApi = async (ruta, opciones = {}) => {
  const cabeceras = { ...(opciones.headers || {}) };
  const token = obtenerTokenAutenticacion();

  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  // Si el cuerpo no es FormData, fijar Content-Type a application/json
  if (opciones.body && !(opciones.body instanceof FormData) && !cabeceras['Content-Type']) {
    cabeceras['Content-Type'] = 'application/json';
  }

  try {
    const urlBase = import.meta.env.VITE_API_URL || '';
    const urlDestino = ruta.startsWith('http') ? ruta : `${urlBase}${ruta}`;

    const respuesta = await fetch(urlDestino, {
      ...opciones,
      headers: cabeceras
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      const mensajeError = datos.error || `Error ${respuesta.status}: No se pudo completar la operación`;
      const error = new Error(mensajeError);
      error.detalles = datos.detalles;
      error.codigoEstado = respuesta.status;
      throw error;
    }

    return datos;
  } catch (error) {
    console.error(`Fallo en petición a ${ruta}:`, error.message);
    throw error;
  }
};
