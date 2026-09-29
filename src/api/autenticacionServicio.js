import { solicitarApi } from './clienteHttp';

export const servicioAutenticacion = {
  /**
   * Iniciar sesión con correo y contraseña.
   */
  iniciarSesion: async (correo, contrasena) => {
    return solicitarApi('/api/autenticacion/inicio-sesion', {
      method: 'POST',
      body: JSON.stringify({
        correo,
        contrasena,
        email: correo,
        password: contrasena
      })
    });
  },

  /**
   * Registrar una empresa u operadora turística (Agencia).
   */
  registrarAgencia: async (datosFormData) => {
    return solicitarApi('/api/autenticacion/registro', {
      method: 'POST',
      body: datosFormData
    });
  },

  /**
   * Registrar un Guía Turístico profesional certificado.
   */
  registrarGuia: async (datosFormData) => {
    return solicitarApi('/api/autenticacion/registro-guia', {
      method: 'POST',
      body: datosFormData
    });
  },

  /**
   * Registrar un Turista (usuario final).
   */
  registrarTurista: async ({ nombreCompleto, correo, contrasena }) => {
    return solicitarApi('/api/autenticacion/registro-turista', {
      method: 'POST',
      body: JSON.stringify({ nombreCompleto, correo, contrasena })
    });
  },

  /**
   * Obtener los datos del usuario autenticado actual.
   */
  obtenerUsuarioActual: async () => {
    return solicitarApi('/api/autenticacion/usuario-actual');
  }
};
