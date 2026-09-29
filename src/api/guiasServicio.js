import { solicitarApi } from './clienteHttp';

export const servicioGuias = {
  /**
   * Obtener el directorio de guías turísticos públicos, opcionalmente filtrados/clasificados por especialidades de tour.
   */
  listarGuiasPublicos: async (especialidadesIds = []) => {
    const query = Array.isArray(especialidadesIds) && especialidadesIds.length > 0
      ? `?especialidades=${especialidadesIds.join(',')}`
      : '';
    const respuesta = await solicitarApi(`/api/guias/publicos${query}`);
    return respuesta.guias || respuesta.guides || [];
  },

  /**
   * Obtener el perfil del guía autenticado con foto de rostro.
   */
  obtenerPerfil: async () => {
    const respuesta = await solicitarApi('/api/guias/perfil');
    return respuesta.perfil;
  },

  /**
   * Actualizar el perfil del guía con soporte para FormData (foto de rostro).
   */
  actualizarPerfil: async (datos) => {
    const esFormData = datos instanceof FormData;
    const respuesta = await solicitarApi('/api/guias/perfil', {
      method: 'PUT',
      body: esFormData ? datos : JSON.stringify(datos)
    });
    return respuesta;
  },

  /**
   * Obtener la disponibilidad horaria del guía.
   */
  listarDisponibilidad: async () => {
    const respuesta = await solicitarApi('/api/guias/disponibilidad');
    return respuesta.disponibilidad || respuesta.availability || [];
  },

  /**
   * Registrar disponibilidad (puntual o rango de periodo largo).
   */
  crearDisponibilidad: async (datos) => {
    const respuesta = await solicitarApi('/api/guias/disponibilidad', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    return respuesta;
  },

  /**
   * Actualizar una franja de disponibilidad existente.
   */
  actualizarDisponibilidad: async (idDisponibilidad, datos) => {
    const respuesta = await solicitarApi(`/api/guias/disponibilidad/${idDisponibilidad}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
    return respuesta.disponibilidad || respuesta.availability;
  },

  /**
   * Eliminar una franja de disponibilidad.
   */
  eliminarDisponibilidad: async (idDisponibilidad) => {
    return solicitarApi(`/api/guias/disponibilidad/${idDisponibilidad}`, {
      method: 'DELETE'
    });
  },

  /**
   * Listar tours asignados al guía autenticado.
   */
  listarToursAsignados: async () => {
    const respuesta = await solicitarApi('/api/guias/tours-asignados');
    return respuesta.tours || [];
  }
};
