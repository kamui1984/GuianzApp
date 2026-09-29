const { clienteSupabaseAdmin } = require('../config/supabase');

/**
 * Middleware para validar el token JWT y obtener el perfil del usuario.
 */
async function requerirAutenticacion(peticion, respuesta, siguiente) {
  try {
    const cabeceraAutorizacion = peticion.headers.authorization;
    const token = cabeceraAutorizacion?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return respuesta.status(401).json({ error: 'Se requiere iniciar sesión para acceder a este recurso.' });
    }

    const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.getUser(token);
    if (errorAuth || !datosAuth?.user) {
      return respuesta.status(401).json({ error: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.' });
    }

    const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('*')
      .eq('id', datosAuth.user.id)
      .single();

    if (errorPerfil || !perfil) {
      return respuesta.status(403).json({ error: 'El perfil de usuario no está configurado.' });
    }

    // Adjuntar usuario autenticado y perfil a la petición
    peticion.usuario = {
      auth: datosAuth.user,
      perfil
    };
    peticion.user = peticion.usuario; // Compatibilidad

    siguiente();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return respuesta.status(500).json({ error: 'Error interno de autenticación.' });
  }
}

/**
 * Middleware para restringir rutas a roles específicos ('agencia', 'guia', 'administrador', 'turista').
 */
function requerirRol(rolesPermitidos = []) {
  return (peticion, respuesta, siguiente) => {
    if (!peticion.usuario || !peticion.usuario.perfil) {
      return respuesta.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const rolUsuario = peticion.usuario.perfil.rol;
    const listaRoles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

    if (!listaRoles.includes(rolUsuario)) {
      return respuesta.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${listaRoles.join(', ')}.` 
      });
    }

    siguiente();
  };
}

module.exports = {
  requerirAutenticacion,
  requerirRol
};
