const crypto = require('crypto');
const path = require('path');
const { clienteSupabaseAuth, clienteSupabaseAdmin } = require('../config/supabase');
const { serializarUsuario } = require('../services/serializacion.servicio');
const { subirArchivo } = require('../services/almacenamiento.servicio');
const perfilGuiasServicio = require('../services/perfilGuias.servicio');

/**
 * Registro para empresas u operadores turísticos (Agencias).
 */
const registrarAgencia = async (peticion, respuesta) => {
  try {
    const nombreAgencia = peticion.body.nombreAgencia || peticion.body.agencyName;
    const correo = peticion.body.correo || peticion.body.email;
    const contrasena = peticion.body.contrasena || peticion.body.password;
    const numeroRnt = (peticion.body.numeroRnt || peticion.body.rntNumber || '').trim();
    const archivoRnt = peticion.file;

    if (!nombreAgencia || !correo || !contrasena || !numeroRnt || !archivoRnt) {
      return respuesta.status(400).json({ error: 'Completa todos los campos y adjunta el documento RNT.' });
    }

    if (contrasena.length < 8) {
      return respuesta.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // 1. Validar que el número RNT no esté registrado previamente
    const { data: rntExistente } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, numero_rnt')
      .eq('numero_rnt', numeroRnt)
      .maybeSingle();

    if (rntExistente) {
      return respuesta.status(409).json({
        error: `El número de RNT "${numeroRnt}" ya se encuentra registrado en la plataforma por otra cuenta.`
      });
    }

    const correoNormalizado = correo.toLowerCase().trim();

    // 2. Crear usuario en Supabase Auth
    const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.admin.createUser({
      email: correoNormalizado,
      password: contrasena,
      email_confirm: true
    });

    if (errorAuth) {
      const yaExiste = errorAuth.message.toLowerCase().includes('already') || errorAuth.message.toLowerCase().includes('registered');
      return respuesta.status(yaExiste ? 409 : 400).json({
        error: yaExiste ? 'Ya existe una cuenta registrada con este correo electrónico.' : errorAuth.message
      });
    }

    const idUsuario = datosAuth.user.id;
    const extension = path.extname(archivoRnt.originalname).toLowerCase();
    const rutaDocumento = `${idUsuario}/${crypto.randomUUID()}${extension}`;

    try {
      // Subir archivo a Supabase Storage
      await subirArchivo('rnt-documents', rutaDocumento, archivoRnt.buffer, archivoRnt.mimetype);

      // Crear perfil en la tabla de perfiles
      const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
        .from('perfiles')
        .insert({
          id: idUsuario,
          rol: 'agencia',
          nombre_agencia: nombreAgencia,
          numero_rnt: numeroRnt,
          ruta_documento_rnt: rutaDocumento,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (errorPerfil) throw errorPerfil;

      const usuario = serializarUsuario(datosAuth.user, perfil);
      return respuesta.status(201).json({
        usuario,
        mensaje: 'Registro recibido. Tu solicitud de agencia ha sido enviada para validación y activación.'
      });
    } catch (errorInterno) {
      await clienteSupabaseAdmin.auth.admin.deleteUser(idUsuario);
      console.error('Error al guardar perfil de agencia:', errorInterno);
      return respuesta.status(500).json({ error: 'No se pudo guardar el registro. Verifica los archivos y vuelve a intentarlo.' });
    }
  } catch (error) {
    console.error('Error general en registro de agencia:', error);
    return respuesta.status(500).json({ error: 'Ocurrió un error inesperado durante el registro.' });
  }
};

/**
 * Registro para Guías Turísticos profesionales certificados.
 */
const registrarGuia = async (peticion, respuesta) => {
  try {
    const nombreCompleto = peticion.body.nombreCompleto || peticion.body.fullName;
    const correo = peticion.body.correo || peticion.body.email;
    const contrasena = peticion.body.contrasena || peticion.body.password;
    const numeroRnt = (peticion.body.numeroRnt || peticion.body.rntNumber || '').trim();
    const especialidades = peticion.body.especialidades || peticion.body.specialties;
    const idiomas = peticion.body.idiomas || peticion.body.languages || 'Español';
    const telefonoPrincipal = peticion.body.telefonoPrincipal || peticion.body.telefono || '';
    const tieneWhatsapp = peticion.body.tieneWhatsapp !== 'false' && peticion.body.tieneWhatsapp !== false;
    const telefonoAlternativo = peticion.body.telefonoAlternativo || '';
    const contactoEmergenciaNombre = peticion.body.contactoEmergenciaNombre || 'Contacto Familiar';
    const contactoEmergenciaTel = peticion.body.contactoEmergenciaTel || '';
    const reseñaCorta = peticion.body.reseñaCorta || peticion.body.resenaCorta || 'Guía turístico certificado de Bogotá.';
    const experienciaDetalle = peticion.body.experienciaDetalle || 'Recorridos históricos y culturales.';
    const competenciasTec = peticion.body.competenciasTec || 'Primeros auxilios.';
    const rawEspecialidadesIds = peticion.body.especialidadesIds;

    let especialidadesIds = [];
    if (typeof rawEspecialidadesIds === 'string') {
      try {
        especialidadesIds = JSON.parse(rawEspecialidadesIds);
      } catch (e) {
        especialidadesIds = rawEspecialidadesIds.split(',').map(Number).filter(Boolean);
      }
    } else if (Array.isArray(rawEspecialidadesIds)) {
      especialidadesIds = rawEspecialidadesIds.map(Number).filter(Boolean);
    }

    const archivoRnt = peticion.files?.rntDocument?.[0];
    const archivoTarjeta = peticion.files?.professionalCard?.[0];

    if (!nombreCompleto || !correo || !contrasena || !numeroRnt || !archivoRnt || !archivoTarjeta) {
      return respuesta.status(400).json({
        error: 'Completa tu nombre, RNT, contraseña y adjunta ambos documentos (RNT y Tarjeta Profesional).'
      });
    }

    if (contrasena.length < 8) {
      return respuesta.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const { data: rntExistente } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, numero_rnt')
      .eq('numero_rnt', numeroRnt)
      .maybeSingle();

    if (rntExistente) {
      return respuesta.status(409).json({
        error: `El número de RNT "${numeroRnt}" ya se encuentra registrado en la plataforma.`
      });
    }

    const correoNormalizado = correo.toLowerCase().trim();

    const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.admin.createUser({
      email: correoNormalizado,
      password: contrasena,
      email_confirm: true
    });

    if (errorAuth) {
      const yaExiste = errorAuth.message.toLowerCase().includes('already') || errorAuth.message.toLowerCase().includes('registered');
      return respuesta.status(yaExiste ? 409 : 400).json({
        error: yaExiste ? 'Ya existe una cuenta registrada con este correo electrónico.' : errorAuth.message
      });
    }

    const idUsuario = datosAuth.user.id;
    const extensionRnt = path.extname(archivoRnt.originalname).toLowerCase();
    const extensionTarjeta = path.extname(archivoTarjeta.originalname).toLowerCase();
    const rutaDocumentoRnt = `${idUsuario}/rnt-${crypto.randomUUID()}${extensionRnt}`;
    const rutaTarjeta = `${idUsuario}/tarjeta-${crypto.randomUUID()}${extensionTarjeta}`;

    try {
      await subirArchivo('rnt-documents', rutaDocumentoRnt, archivoRnt.buffer, archivoRnt.mimetype);
      await subirArchivo('guide-documents', rutaTarjeta, archivoTarjeta.buffer, archivoTarjeta.mimetype);

      const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
        .from('perfiles')
        .insert({
          id: idUsuario,
          rol: 'guia',
          nombre_completo: nombreCompleto,
          numero_rnt: numeroRnt,
          ruta_documento_rnt: rutaDocumentoRnt,
          ruta_tarjeta_profesional: rutaTarjeta,
          especialidades: especialidades || 'Centro histórico, Museos',
          idiomas,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (errorPerfil) throw errorPerfil;

      // Registrar también en perfil_guias y guia_especialidades
      await perfilGuiasServicio.guardarOActualizarPerfil(
        idUsuario,
        {
          nombre_completo: nombreCompleto,
          tarjeta_profesional: numeroRnt,
          telefono_principal: telefonoPrincipal,
          tiene_whatsapp: tieneWhatsapp,
          telefono_alternativo: telefonoAlternativo,
          contacto_emergencia_nombre: contactoEmergenciaNombre,
          contacto_emergencia_tel: contactoEmergenciaTel,
          reseña_corta: reseñaCorta,
          experiencia_detalle: experienciaDetalle,
          competencias_tec: competenciasTec,
          idiomas,
          ruta_documento_rnt: rutaDocumentoRnt,
          ruta_tarjeta_profesional: rutaTarjeta,
          estado: 'pendiente'
        },
        especialidadesIds
      );

      const usuario = serializarUsuario(datosAuth.user, perfil);
      return respuesta.status(201).json({
        usuario,
        mensaje: 'Registro del guía recibido. La documentación quedará en revisión antes de activar tu perfil.'
      });
    } catch (errorInterno) {
      await clienteSupabaseAdmin.auth.admin.deleteUser(idUsuario);
      console.error('Error al guardar perfil de guía:', errorInterno);
      return respuesta.status(500).json({ error: 'No se pudo guardar el perfil del guía. Verifica los documentos e intenta de nuevo.' });
    }
  } catch (error) {
    console.error('Error general en registro de guía:', error);
    return respuesta.status(500).json({ error: 'Ocurrió un error inesperado durante el registro.' });
  }
};

/**
 * Registro de Turistas (Usuarios finales / exploradores).
 */
const registrarTurista = async (peticion, respuesta) => {
  try {
    const nombreCompleto = peticion.body.nombreCompleto || peticion.body.fullName;
    const correo = peticion.body.correo || peticion.body.email;
    const contrasena = peticion.body.contrasena || peticion.body.password;

    if (!nombreCompleto || !correo || !contrasena) {
      return respuesta.status(400).json({ error: 'Completa nombre, correo y contraseña.' });
    }

    if (contrasena.length < 6) {
      return respuesta.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const correoNormalizado = correo.toLowerCase().trim();

    const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.admin.createUser({
      email: correoNormalizado,
      password: contrasena,
      email_confirm: true
    });

    if (errorAuth) {
      const yaExiste = errorAuth.message.toLowerCase().includes('already') || errorAuth.message.toLowerCase().includes('registered');
      return respuesta.status(yaExiste ? 409 : 400).json({
        error: yaExiste ? 'Ya existe una cuenta registrada con este correo electrónico.' : errorAuth.message
      });
    }

    const idUsuario = datosAuth.user.id;

    const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
      .from('perfiles')
      .insert({
        id: idUsuario,
        rol: 'turista',
        nombre_completo: nombreCompleto,
        estado: 'aprobado'
      })
      .select()
      .single();

    if (errorPerfil) {
      await clienteSupabaseAdmin.auth.admin.deleteUser(idUsuario);
      throw errorPerfil;
    }

    // Iniciar sesión inmediatamente para devolver token
    const { data: loginData } = await clienteSupabaseAuth.auth.signInWithPassword({
      email: correoNormalizado,
      password: contrasena
    });

    const usuario = serializarUsuario(datosAuth.user, perfil);
    return respuesta.status(201).json({
      token: loginData?.session?.access_token || '',
      usuario,
      mensaje: '¡Bienvenido a GuianzApp!'
    });
  } catch (error) {
    console.error('Error en registro de turista:', error);
    return respuesta.status(500).json({ error: 'Error al registrar la cuenta de turista.' });
  }
};

/**
 * Inicio de sesión común para todos los perfiles.
 */
const iniciarSesion = async (peticion, respuesta) => {
  try {
    const correo = peticion.body.correo || peticion.body.email;
    const contrasena = peticion.body.contrasena || peticion.body.password;

    if (!correo || !contrasena) {
      return respuesta.status(400).json({ error: 'Ingresa correo y contraseña.' });
    }

    const { data: sesionData, error: errorSesion } = await clienteSupabaseAuth.auth.signInWithPassword({
      email: correo.toLowerCase().trim(),
      password: contrasena
    });

    if (errorSesion || !sesionData?.user || !sesionData?.session) {
      return respuesta.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
    }

    const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('*')
      .eq('id', sesionData.user.id)
      .single();

    if (errorPerfil || !perfil) {
      return respuesta.status(403).json({ error: 'El perfil asociado a este usuario no se encuentra configurado.' });
    }

    const usuario = serializarUsuario(sesionData.user, perfil);

    return respuesta.json({
      token: sesionData.session.access_token,
      usuario,
      user: usuario // Compatibilidad
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return respuesta.status(500).json({ error: 'Ocurrió un error al intentar iniciar sesión.' });
  }
};

/**
 * Obtener perfil del usuario autenticado actual.
 */
const obtenerUsuarioActual = (peticion, respuesta) => {
  const usuario = serializarUsuario(peticion.usuario.auth, peticion.usuario.perfil);
  return respuesta.json({ usuario, user: usuario });
};

module.exports = {
  registrarAgencia,
  registrarGuia,
  registrarTurista,
  iniciarSesion,
  obtenerUsuarioActual
};
