import { solicitarApi } from './clienteHttp';

export const servicioPaquetes = {
  /**
   * Obtener el catálogo público de paquetes para la landing.
   */
  explorarPaquetes: async () => {
    const respuesta = await solicitarApi('/api/paquetes/explorar');
    return respuesta.paquetes || respuesta.packages || [];
  },

  /**
   * Obtener los paquetes de la agencia autenticada.
   */
  listarMisPaquetes: async () => {
    const respuesta = await solicitarApi('/api/paquetes/mis-paquetes');
    return respuesta.paquetes || respuesta.packages || [];
  },

  /**
   * Obtener los horarios de salida programados de un paquete turístico.
   */
  obtenerProgramacion: async (idPaquete) => {
    const respuesta = await solicitarApi(`/api/paquetes/${idPaquete}/programacion`);
    return respuesta.programacion || respuesta.salidas || [];
  },

  /**
   * Crear un nuevo paquete turístico con archivos y duración.
   */
  crearPaquete: async (datosFormData) => {
    const respuesta = await solicitarApi('/api/paquetes', {
      method: 'POST',
      body: datosFormData
    });
    return respuesta.paquete || respuesta.package;
  },

  /**
   * Actualizar un paquete turístico existente.
   */
  actualizarPaquete: async (idPaquete, datosFormData) => {
    const respuesta = await solicitarApi(`/api/paquetes/${idPaquete}`, {
      method: 'PUT',
      body: datosFormData
    });
    return respuesta.paquete || respuesta.package;
  },

  /**
   * Eliminar un paquete turístico.
   */
  eliminarPaquete: async (idPaquete) => {
    return solicitarApi(`/api/paquetes/${idPaquete}`, {
      method: 'DELETE'
    });
  },

  /**
   * Registrar una reserva de tour por parte de un turista.
   */
  registrarReserva: async (datosReserva) => {
    return solicitarApi('/api/paquetes/reservar', {
      method: 'POST',
      body: JSON.stringify(datosReserva)
    });
  },

  /**
   * Listar las reservas y tours vendidos de la agencia.
   */
  listarReservasAgencia: async () => {
    const respuesta = await solicitarApi('/api/paquetes/reservas/agencia');
    return respuesta.reservas || [];
  },

  /**
   * Asignar un guía a un tour vendido.
   */
  asignarGuia: async (idReserva, idGuia, nombreGuia, datosAdicionales = {}) => {
    return solicitarApi(`/api/paquetes/reservas/${idReserva}/asignar-guia`, {
      method: 'POST',
      body: JSON.stringify({ idGuia, nombreGuia, ...datosAdicionales })
    });
  },

  /**
   * Desasignar un guía de un tour vendido y liberar su disponibilidad.
   */
  desasignarGuia: async (idReserva) => {
    return solicitarApi(`/api/paquetes/reservas/${idReserva}/desasignar-guia`, {
      method: 'POST'
    });
  },

  /**
   * Eliminar una reserva / tour vendido de la agencia.
   */
  eliminarReserva: async (idReserva) => {
    return solicitarApi(`/api/paquetes/reservas/${idReserva}`, {
      method: 'DELETE'
    });
  }
};

