import { solicitarApi } from './clienteHttp';

export const servicioAdministracion = {
  /**
   * Obtener la cola de perfiles en revisión (Agencias y Guías).
   */
  obtenerColaRevision: async () => {
    const respuesta = await solicitarApi('/api/administracion/cola-revision');
    return respuesta.perfiles || respuesta.profiles || [];
  },

  /**
   * Aprobar un perfil verificado.
   */
  aprobarPerfil: async (idPerfil) => {
    return solicitarApi(`/api/administracion/perfiles/${idPerfil}/aprobar`, {
      method: 'POST'
    });
  },

  /**
   * Rechazar un perfil con motivo o razones detalladas.
   */
  rechazarPerfil: async (idPerfil, motivoRechazo) => {
    return solicitarApi(`/api/administracion/perfiles/${idPerfil}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivoRechazo, razonesRechazo: motivoRechazo })
    });
  },

  /**
   * Reenviar solicitud de perfil con documentos corregidos.
   */
  reenviarSolicitud: async (datosFormData) => {
    return solicitarApi('/api/administracion/reenviar-solicitud', {
      method: 'POST',
      body: datosFormData
    });
  }
};
