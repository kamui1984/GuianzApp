const crypto = require('crypto');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarPerfilRevision, serializarUsuario } = require('../services/serializacion.servicio');
const { subirArchivo } = require('../services/almacenamiento.servicio');
const { obtenerMetaPerfil, guardarMetaPerfil } = require('../services/perfilesMeta.servicio');

/**
 * Consultar cola de perfiles pendientes o rechazados para verificación.
 */
const obtenerColaRevision = async (peticion, respuesta) => {
  try {
    const perfilUsuario = peticion.usuario.perfil;

    if (perfilUsuario.rol !== 'administrador') {
      return respuesta.status(403).json({ error: 'Solo un administrador puede acceder a la cola de verificación.' });
    }

    const { data: perfiles, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, rol, nombre_agencia, nombre_completo, numero_rnt, estado, ruta_documento_rnt, ruta_tarjeta_profesional, especialidades, idiomas, creado_en')
      .in('rol', ['agencia', 'guia'])
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al cargar perfiles en revisión:', error);
      return respuesta.status(500).json({ error: 'No se pudo cargar la cola de revisión.' });
    }

    const perfilesSerializados = await Promise.all(
      (perfiles || []).map(async (perfil) => {
        const meta = obtenerMetaPerfil(perfil.id);
        const base = await serializarPerfilRevision(perfil);
        return {
          ...base,
          motivoRechazo: meta.motivoRechazo || '',
          urlFotoRostro: meta.rutaFotoRostro ? base.urlFotoRostro : null
        };
      })
    );

    const pendientes = perfilesSerializados.filter(
      (p) => p.estado === 'pendiente' || p.estado === 'rechazado'
    );

    return respuesta.json({
      perfiles: pendientes,
      profiles: pendientes
    });
  } catch (error) {
    console.error('Error general en obtenerColaRevision:', error);
    return respuesta.status(500).json({ error: 'Error interno al consultar la cola de revisión.' });
  }
};

/**
 * Aprobar la documentación y activar un perfil de Agencia o Guía.
 */
const aprobarPerfil = async (peticion, respuesta) => {
  try {
    const perfilUsuario = peticion.usuario.perfil;
    const idObjetivo = peticion.params.id;

    if (perfilUsuario.rol !== 'administrador') {
      return respuesta.status(403).json({ error: 'Solo un administrador puede aprobar perfiles.' });
    }

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'aprobado' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil para aprobar.' });
    }

    guardarMetaPerfil(idObjetivo, { motivoRechazo: null });

    // Sincronizar también con perfil_guias si el perfil es de un guía
    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'aprobado' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {
      // Continuar si la tabla aún no existe
    }

    const perfilSerializado = serializarUsuario({ id: data.id, email: '' }, data);
    return respuesta.json({
      perfil: perfilSerializado,
      profile: perfilSerializado,
      mensaje: 'Perfil verificado y aprobado exitosamente.'
    });
  } catch (error) {
    console.error('Error al aprobar perfil:', error);
    return respuesta.status(500).json({ error: 'Error interno al aprobar el perfil.' });
  }
};

/**
 * Rechazar una solicitud de perfil con razones y retroalimentación explícita.
 */
const rechazarPerfil = async (peticion, respuesta) => {
  try {
    const perfilUsuario = peticion.usuario.perfil;
    const idObjetivo = peticion.params.id;
    const motivoRechazo = peticion.body.motivoRechazo || peticion.body.razonesRechazo || 'Documentación incompleta o no vigente.';

    if (perfilUsuario.rol !== 'administrador') {
      return respuesta.status(403).json({ error: 'Solo un administrador puede rechazar perfiles.' });
    }

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'rechazado' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil a rechazar.' });
    }

    guardarMetaPerfil(idObjetivo, { motivoRechazo });

    // Sincronizar también con perfil_guias si el perfil es de un guía
    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'rechazado' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {
      // Continuar si la tabla aún no existe
    }

    const perfilSerializado = serializarUsuario({ id: data.id, email: '' }, data);
    return respuesta.json({
      perfil: perfilSerializado,
      profile: perfilSerializado,
      mensaje: 'Perfil marcado como rechazado con motivo registrado.'
    });
  } catch (error) {
    console.error('Error al rechazar perfil:', error);
    return respuesta.status(500).json({ error: 'Error interno al rechazar el perfil.' });
  }
};

/**
 * Reenviar solicitud de aprobación tras corrección de datos o documentos por parte de la agencia o guía.
 */
const reenviarSolicitudPerfil = async (peticion, respuesta) => {
  try {
    const idUsuario = peticion.usuario.auth.id;

    const { nombreAgencia, nombreCompleto, numeroRnt, especialidades, idiomas } = peticion.body;
    const actualizaciones = {
      estado: 'pendiente'
    };

    if (nombreAgencia) actualizaciones.nombre_agencia = nombreAgencia;
    if (nombreCompleto) actualizaciones.nombre_completo = nombreCompleto;
    if (numeroRnt) actualizaciones.numero_rnt = numeroRnt;
    if (especialidades) actualizaciones.especialidades = especialidades;
    if (idiomas) actualizaciones.idiomas = idiomas;

    // Procesar nuevo documento RNT si se adjuntó
    if (peticion.files?.rntDocument?.[0]) {
      const archRnt = peticion.files.rntDocument[0];
      const extension = path.extname(archRnt.originalname).toLowerCase();
      const rutaRnt = `${idUsuario}/rnt-reenvio-${crypto.randomUUID()}${extension}`;
      await subirArchivo('rnt-documents', rutaRnt, archRnt.buffer, archRnt.mimetype);
      actualizaciones.ruta_documento_rnt = rutaRnt;
    }

    // Procesar nueva Tarjeta Profesional si se adjuntó
    if (peticion.files?.professionalCard?.[0]) {
      const archTarjeta = peticion.files.professionalCard[0];
      const extension = path.extname(archTarjeta.originalname).toLowerCase();
      const rutaTarjeta = `${idUsuario}/tarjeta-reenvio-${crypto.randomUUID()}${extension}`;
      await subirArchivo('guide-documents', rutaTarjeta, archTarjeta.buffer, archTarjeta.mimetype);
      actualizaciones.ruta_tarjeta_profesional = rutaTarjeta;
    }

    const { data: perfilActualizado, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update(actualizaciones)
      .eq('id', idUsuario)
      .select()
      .single();

    if (error || !perfilActualizado) {
      return respuesta.status(500).json({ error: 'No se pudo reenviar la solicitud.' });
    }

    guardarMetaPerfil(idUsuario, { motivoRechazo: null });

    const usuario = serializarUsuario(peticion.usuario.auth, perfilActualizado);
    return respuesta.json({
      usuario,
      mensaje: '¡Solicitud reenviada con éxito! Tu documentación ha vuelto a la cola de verificación.'
    });
  } catch (error) {
    console.error('Error al reenviar solicitud:', error);
    return respuesta.status(500).json({ error: 'Error al procesar el reenvío de la solicitud.' });
  }
};

module.exports = {
  obtenerColaRevision,
  aprobarPerfil,
  rechazarPerfil,
  reenviarSolicitudPerfil
};
