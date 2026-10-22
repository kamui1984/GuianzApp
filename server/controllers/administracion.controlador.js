const crypto = require('crypto');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarPerfilRevision, serializarUsuario } = require('../services/serializacion.servicio');
const { subirArchivo } = require('../services/almacenamiento.servicio');
const { obtenerMetaPerfil, guardarMetaPerfil, leerMetaPerfiles } = require('../services/perfilesMeta.servicio');
const auditoriaServicio = require('../services/auditoria.servicio');
const reportesServicio = require('../services/reportes.servicio');
const especialidadesServicio = require('../services/especialidades.servicio');
const { leerReservasLocal } = require('../services/reservas.servicio');
const { notificarOperadorAccionAdmin } = require('../services/correo.servicio');

const obtenerCorreoUsuario = async (userId) => {
  try {
    const { data: usuarioAuth } = await clienteSupabaseAdmin.auth.admin.getUserById(userId);
    return usuarioAuth?.user?.email || null;
  } catch (e) {
    return null;
  }
};


/**
 * 1. Resumen ejecutivo de indicadores de la plataforma y tareas pendientes
 */
const obtenerResumenIndicadores = async (peticion, respuesta) => {
  try {
    // 1. Conteo de perfiles por rol y estado
    let perfiles = [];
    try {
      const { data } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('id, rol, estado, nombre_agencia, nombre_completo, creado_en');
      if (data) perfiles = data;
    } catch (e) {
      console.warn('Error al consultar perfiles para métricas:', e.message);
    }

    const totalAgencias = perfiles.filter((p) => p.rol === 'agencia').length;
    const totalGuias = perfiles.filter((p) => p.rol === 'guia').length;
    const totalTuristas = perfiles.filter((p) => p.rol === 'turista').length;

    const pendientesValidacion = perfiles.filter((p) => p.estado === 'pendiente' && (p.rol === 'agencia' || p.rol === 'guia')).length;
    const aprobados = perfiles.filter((p) => p.estado === 'aprobado').length;
    const suspendidos = perfiles.filter((p) => p.estado === 'suspendido' || p.estado === 'bloqueado').length;
    const rechazados = perfiles.filter((p) => p.estado === 'rechazado').length;

    // 2. Conteo de paquetes
    let paquetesTotal = 0;
    try {
      const { count } = await clienteSupabaseAdmin
        .from('paquetes_tours')
        .select('*', { count: 'exact', head: true });
      paquetesTotal = count || 0;
    } catch (e) {
      paquetesTotal = 5; // Catálogo base
    }

    // 3. Conteo de reservas
    const reservas = leerReservasLocal();
    const reservasTotal = reservas.length;

    // 4. Conteo de reclamaciones y reportes
    const reportes = await reportesServicio.listarReportes();
    const reportesPendientes = reportes.filter((r) => r.estado === 'recibido' || r.estado === 'en_revision').length;
    const reportesResueltos = reportes.filter((r) => r.estado === 'resuelto' || r.estado === 'cerrado').length;

    // 5. Especialidades activas
    const especialidades = await especialidadesServicio.obtenerTodasParaAdmin();
    const especialidadesActivas = especialidades.filter((e) => e.activo !== false).length;

    // 6. Actividad reciente de auditoría
    const auditoriaReciente = await auditoriaServicio.listarEventos({ limite: 5 });

    return respuesta.json({
      metricas: {
        totalAgencias,
        totalGuias,
        totalTuristas,
        totalUsuarios: perfiles.length,
        pendientesValidacion,
        aprobados,
        suspendidos,
        rechazados,
        paquetesTotal: paquetesTotal || 5,
        reservasTotal,
        reportesTotal: reportes.length,
        reportesPendientes,
        reportesResueltos,
        especialidadesTotal: especialidades.length,
        especialidadesActivas
      },
      auditoriaReciente
    });
  } catch (error) {
    console.error('Error al generar resumen de indicadores:', error);
    return respuesta.status(500).json({ error: 'Error al consultar indicadores de la plataforma.' });
  }
};

/**
 * 2. Consultar listado completo de prestadores turísticos con filtros
 */
const listarPrestadores = async (peticion, respuesta) => {
  try {
    const rolFiltro = peticion.query.rol || 'todos'; // 'todos', 'agencia', 'guia'
    const estadoFiltro = peticion.query.estado || 'todos'; // 'todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'
    const busqueda = (peticion.query.busqueda || '').toLowerCase().trim();

    const { data: perfiles, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, rol, nombre_agencia, nombre_completo, numero_rnt, estado, ruta_documento_rnt, ruta_tarjeta_profesional, especialidades, idiomas, creado_en')
      .in('rol', ['agencia', 'guia'])
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al cargar prestadores:', error);
      return respuesta.status(500).json({ error: 'No se pudo cargar el listado de prestadores.' });
    }

    const perfilesSerializados = await Promise.all(
      (perfiles || []).map(async (perfil) => {
        const meta = obtenerMetaPerfil(perfil.id);
        const base = await serializarPerfilRevision(perfil);
        return {
          ...base,
          motivoRechazo: meta.motivoRechazo || '',
          motivoSuspension: meta.motivoSuspension || '',
          observacionesAdmin: meta.observacionesAdmin || '',
          urlFotoRostro: meta.rutaFotoRostro ? base.urlFotoRostro : null
        };
      })
    );

    const filtrados = perfilesSerializados.filter((p) => {
      if (rolFiltro !== 'todos' && p.rol !== rolFiltro) return false;
      if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false;

      if (busqueda) {
        const nombre = (p.nombreAgencia || p.nombreCompleto || '').toLowerCase();
        const rnt = (p.numeroRnt || '').toLowerCase();
        if (!nombre.includes(busqueda) && !rnt.includes(busqueda)) return false;
      }

      return true;
    });

    return respuesta.json({ prestadores: filtrados });
  } catch (error) {
    console.error('Error al listar prestadores:', error);
    return respuesta.status(500).json({ error: 'Error al consultar prestadores turísticos.' });
  }
};

/**
 * 3. Consultar cola de perfiles pendientes o rechazados (compatibilidad)
 */
const obtenerColaRevision = async (peticion, respuesta) => {
  try {
    const { data: perfiles, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, rol, nombre_agencia, nombre_completo, numero_rnt, estado, ruta_documento_rnt, ruta_tarjeta_profesional, especialidades, idiomas, creado_en')
      .in('rol', ['agencia', 'guia'])
      .order('creado_en', { ascending: false });

    if (error) {
      return respuesta.status(500).json({ error: 'No se pudo cargar la cola de revisión.' });
    }

    const perfilesSerializados = await Promise.all(
      (perfiles || []).map(async (perfil) => {
        const meta = obtenerMetaPerfil(perfil.id);
        const base = await serializarPerfilRevision(perfil);
        return {
          ...base,
          motivoRechazo: meta.motivoRechazo || '',
          observacionesAdmin: meta.observacionesAdmin || '',
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
    return respuesta.status(500).json({ error: 'Error interno al consultar la cola de revisión.' });
  }
};

/**
 * 4. Aprobar la documentación y activar un perfil de Agencia o Guía con auditoría
 */
const aprobarPerfil = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'aprobado' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil para aprobar.' });
    }

    guardarMetaPerfil(idObjetivo, { motivoRechazo: null, motivoSuspension: null });

    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'aprobado' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {}

    // Registrar en auditoría
    const nombrePrestador = data.nombre_agencia || data.nombre_completo || 'Prestador Turístico';
    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'aprobar_prestador',
      entidadTipo: 'prestador',
      entidadId: idObjetivo,
      entidadNombre: nombrePrestador,
      motivo: 'Documentación legal y certificado RNT/Tarjeta Profesional verificados satisfactoriamente.',
      detalles: { rol: data.rol, rnt: data.numero_rnt }
    });

    const perfilSerializado = serializarUsuario({ id: data.id, email: '' }, data);

    // Notificar al prestador por correo electrónico
    obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
      if (correoOperador) {
        notificarOperadorAccionAdmin({
          correo: correoOperador,
          nombre: nombrePrestador,
          rol: data.rol,
          accion: 'aprobado'
        }).catch((e) => console.warn('Aviso correo operador aprobado:', e.message));
      }
    });

    return respuesta.json({
      perfil: perfilSerializado,
      profile: perfilSerializado,
      mensaje: `Perfil de "${nombrePrestador}" verificado y aprobado exitosamente.`
    });
  } catch (error) {
    console.error('Error al aprobar perfil:', error);
    return respuesta.status(500).json({ error: 'Error interno al aprobar el perfil.' });
  }
};

/**
 * 5. Rechazar una solicitud con motivo legal y registro de auditoría
 */
const rechazarPerfil = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;
    const motivoRechazo = peticion.body.motivoRechazo || peticion.body.razonesRechazo || 'Documentación incompleta o no vigente según requerimientos legales.';

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

    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'rechazado' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {}

    const nombrePrestador = data.nombre_agencia || data.nombre_completo || 'Prestador Turístico';
    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'rechazar_prestador',
      entidadTipo: 'prestador',
      entidadId: idObjetivo,
      entidadNombre: nombrePrestador,
      motivo: motivoRechazo,
      detalles: { rol: data.rol, rnt: data.numero_rnt }
    });

    const perfilSerializado = serializarUsuario({ id: data.id, email: '' }, data);

    // Notificar al prestador por correo electrónico
    obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
      if (correoOperador) {
        notificarOperadorAccionAdmin({
          correo: correoOperador,
          nombre: nombrePrestador,
          rol: data.rol,
          accion: 'rechazado',
          motivo: motivoRechazo
        }).catch((e) => console.warn('Aviso correo operador rechazado:', e.message));
      }
    });

    return respuesta.json({
      perfil: perfilSerializado,
      profile: perfilSerializado,
      mensaje: `Solicitud de "${nombrePrestador}" rechazada. Se notificó al prestador con el motivo registrado.`
    });
  } catch (error) {
    console.error('Error al rechazar perfil:', error);
    return respuesta.status(500).json({ error: 'Error interno al rechazar el perfil.' });
  }
};

/**
 * 6. Solicitar correcciones a un prestador (documento ilegible, actualización de datos)
 */
const solicitarCorreccionesPerfil = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;
    const observaciones = peticion.body.observaciones || 'Se requiere corregir o volver a cargar la documentación adjunta.';

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'pendiente' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil para solicitar correcciones.' });
    }

    guardarMetaPerfil(idObjetivo, { observacionesAdmin: observaciones });

    const nombrePrestador = data.nombre_agencia || data.nombre_completo || 'Prestador';
    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'solicitar_correccion',
      entidadTipo: 'prestador',
      entidadId: idObjetivo,
      entidadNombre: nombrePrestador,
      motivo: observaciones,
      detalles: { rol: data.rol }
    });

    // Notificar al prestador por correo electrónico
    obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
      if (correoOperador) {
        notificarOperadorAccionAdmin({
          correo: correoOperador,
          nombre: nombrePrestador,
          rol: data.rol,
          accion: 'solicitud_correccion',
          motivo: observaciones
        }).catch((e) => console.warn('Aviso correo operador correcciones:', e.message));
      }
    });

    return respuesta.json({
      mensaje: `Se registró la solicitud de corrección para "${nombrePrestador}".`
    });
  } catch (error) {
    console.error('Error al solicitar corrección:', error);
    return respuesta.status(500).json({ error: 'Error al solicitar correcciones.' });
  }
};

/**
 * 7. Suspender temporalmente un prestador con motivo justificado
 */
const suspenderPerfil = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;
    const motivoSuspension = peticion.body.motivoSuspension || peticion.body.motivo || 'Suspensión preventiva por requerimiento administrativo o reporte en trámite.';

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'suspendido' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil para suspender.' });
    }

    guardarMetaPerfil(idObjetivo, { motivoSuspension });

    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'suspendido' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {}

    const nombrePrestador = data.nombre_agencia || data.nombre_completo || 'Prestador';
    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'suspender_prestador',
      entidadTipo: 'prestador',
      entidadId: idObjetivo,
      entidadNombre: nombrePrestador,
      motivo: motivoSuspension,
      detalles: { rol: data.rol }
    });

    // Notificar al prestador por correo electrónico
    obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
      if (correoOperador) {
        notificarOperadorAccionAdmin({
          correo: correoOperador,
          nombre: nombrePrestador,
          rol: data.rol,
          accion: 'suspendido',
          motivo: motivoSuspension
        }).catch((e) => console.warn('Aviso correo operador suspendido:', e.message));
      }
    });

    return respuesta.json({
      mensaje: `El perfil de "${nombrePrestador}" ha sido suspendido justificadamente.`
    });
  } catch (error) {
    console.error('Error al suspender perfil:', error);
    return respuesta.status(500).json({ error: 'Error al suspender el perfil.' });
  }
};

/**
 * 8. Reactivar un perfil suspendido
 */
const reactivarPerfil = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;
    const motivoReactivacion = peticion.body.motivoReactivacion || 'Causa de suspensión subsanada satisfactoriamente.';

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: 'aprobado' })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el perfil para reactivar.' });
    }

    guardarMetaPerfil(idObjetivo, { motivoSuspension: null });

    try {
      await clienteSupabaseAdmin
        .from('perfil_guias')
        .update({ estado: 'aprobado' })
        .or(`usuario_id.eq.${idObjetivo},id.eq.${idObjetivo}`);
    } catch (e) {}

    const nombrePrestador = data.nombre_agencia || data.nombre_completo || 'Prestador';
    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'reactivar_prestador',
      entidadTipo: 'prestador',
      entidadId: idObjetivo,
      entidadNombre: nombrePrestador,
      motivo: motivoReactivacion,
      detalles: { rol: data.rol }
    });

    // Notificar al prestador por correo electrónico
    obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
      if (correoOperador) {
        notificarOperadorAccionAdmin({
          correo: correoOperador,
          nombre: nombrePrestador,
          rol: data.rol,
          accion: 'reactivado',
          motivo: motivoReactivacion
        }).catch((e) => console.warn('Aviso correo operador reactivado:', e.message));
      }
    });

    return respuesta.json({
      mensaje: `El perfil de "${nombrePrestador}" ha sido reactivado exitosamente.`
    });
  } catch (error) {
    console.error('Error al reactivar perfil:', error);
    return respuesta.status(500).json({ error: 'Error al reactivar el perfil.' });
  }
};

/**
 * 9. Consultar usuarios registrados (filtrado por rol, sin contraseñas ni datos sensibles)
 */
const listarUsuarios = async (peticion, respuesta) => {
  try {
    const rolFiltro = peticion.query.rol || 'todos'; // 'todos', 'agencia', 'guia', 'turista', 'administrador'
    const estadoFiltro = peticion.query.estado || 'todos'; // 'todos', 'activo', 'bloqueado', 'pendiente', 'suspendido'
    const busqueda = (peticion.query.busqueda || '').toLowerCase().trim();

    const { data: usuarios, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .select('id, rol, nombre_completo, nombre_agencia, numero_rnt, estado, creado_en')
      .order('creado_en', { ascending: false });

    if (error) {
      return respuesta.status(500).json({ error: 'No se pudo consultar el listado de usuarios.' });
    }

    // Obtener emails desde Supabase Auth de forma segura
    let mapaEmails = {};
    try {
      const { data: authData } = await clienteSupabaseAdmin.auth.admin.listUsers({ perPage: 100 });
      if (authData?.users) {
        authData.users.forEach((u) => {
          mapaEmails[u.id] = u.email;
        });
      }
    } catch (e) {
      // Ignorar si permisos no permiten listUsers
    }

    const todos = (usuarios || []).map((u) => {
      const meta = obtenerMetaPerfil(u.id);
      return {
        id: u.id,
        rol: u.rol,
        nombre: u.nombre_agencia || u.nombre_completo || 'Usuario de GuianzApp',
        email: mapaEmails[u.id] || 'usuario@guianzapp.co',
        numeroRnt: u.numero_rnt || null,
        estado: u.estado || 'aprobado',
        motivoBloqueo: meta.motivoBloqueo || meta.motivoSuspension || null,
        creadoEn: u.creado_en
      };
    });

    const filtrados = todos.filter((u) => {
      if (rolFiltro !== 'todos' && u.rol !== rolFiltro) return false;
      if (estadoFiltro !== 'todos') {
        if (estadoFiltro === 'activo' && u.estado !== 'aprobado') return false;
        if (estadoFiltro === 'bloqueado' && u.estado !== 'bloqueado' && u.estado !== 'suspendido') return false;
        if (estadoFiltro === 'pendiente' && u.estado !== 'pendiente') return false;
      }

      if (busqueda) {
        const texto = `${u.nombre || ''} ${u.email || ''} ${u.numeroRnt || ''} ${u.rol || ''}`.toLowerCase();
        if (!texto.includes(busqueda)) return false;
      }

      return true;
    });

    return respuesta.json({ usuarios: filtrados });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return respuesta.status(500).json({ error: 'Error al consultar la lista de usuarios.' });
  }
};

/**
 * 10. Bloquear o reactivar una cuenta de usuario con justificación
 */
const cambiarEstadoUsuario = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const idObjetivo = peticion.params.id;
    const { nuevoEstado, justificacion } = peticion.body;

    if (!nuevoEstado || !justificacion) {
      return respuesta.status(400).json({ error: 'Debes indicar el nuevo estado y una justificación obligatoria.' });
    }

    const estadoDb = nuevoEstado === 'bloqueado' ? 'bloqueado' : 'aprobado';

    const { data, error } = await clienteSupabaseAdmin
      .from('perfiles')
      .update({ estado: estadoDb })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error || !data) {
      return respuesta.status(404).json({ error: 'No se encontró el usuario a actualizar.' });
    }

    guardarMetaPerfil(idObjetivo, {
      motivoBloqueo: nuevoEstado === 'bloqueado' ? justificacion : null
    });

    const nombreUsuario = data.nombre_agencia || data.nombre_completo || 'Usuario';
    const accionAuditoria = nuevoEstado === 'bloqueado' ? 'bloquear_usuario' : 'reactivar_usuario';

    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: accionAuditoria,
      entidadTipo: 'usuario',
      entidadId: idObjetivo,
      entidadNombre: nombreUsuario,
      motivo: justificacion,
      detalles: { rol: data.rol, nuevoEstado: estadoDb }
    });

    if (data.rol === 'agencia' || data.rol === 'guia') {
      obtenerCorreoUsuario(idObjetivo).then((correoOperador) => {
        if (correoOperador) {
          const accion = estadoDb === 'bloqueado' ? 'suspendido' : 'reactivado';
          notificarOperadorAccionAdmin({
            correo: correoOperador,
            nombre: nombreUsuario,
            rol: data.rol,
            accion,
            motivo: justificacion
          }).catch((e) => console.warn('Aviso correo cambiar estado usuario:', e.message));
        }
      });
    }

    return respuesta.json({
      mensaje: `Cuenta de "${nombreUsuario}" actualizada a estado "${estadoDb}" justificadamente.`
    });
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    return respuesta.status(500).json({ error: 'Error al cambiar estado de la cuenta.' });
  }
};

/**
 * 11. Gestión de Especialidades para Administrador (Catálogo Transversal)
 */
const listarEspecialidadesAdmin = async (peticion, respuesta) => {
  try {
    const lista = await especialidadesServicio.obtenerTodasParaAdmin();
    return respuesta.json({ especialidades: lista });
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar especialidades.' });
  }
};

const crearEspecialidad = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const { categoria_macro, subcategoria, descripcion_ayuda, icono } = peticion.body;

    const creada = await especialidadesServicio.crearEspecialidad({
      categoria_macro,
      subcategoria,
      descripcion_ayuda,
      icono
    });

    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'crear_especialidad',
      entidadTipo: 'especialidad',
      entidadId: creada.id,
      entidadNombre: creada.subcategoria,
      motivo: `Nueva especialidad agregada bajo categoría "${creada.categoria_macro}".`,
      detalles: { categoria_macro: creada.categoria_macro }
    });

    return respuesta.status(201).json({
      especialidad: creada,
      mensaje: `Especialidad "${creada.subcategoria}" agregada al catálogo común.`
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al crear especialidad.' });
  }
};

const actualizarEspecialidad = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const id = peticion.params.id;
    const { categoria_macro, subcategoria, descripcion_ayuda, icono, activo } = peticion.body;

    const actualizada = await especialidadesServicio.actualizarEspecialidad(id, {
      categoria_macro,
      subcategoria,
      descripcion_ayuda,
      icono,
      activo
    });

    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'actualizar_especialidad',
      entidadTipo: 'especialidad',
      entidadId: id,
      entidadNombre: actualizada.subcategoria,
      motivo: 'Modificación de parámetros en catálogo común.',
      detalles: { activo: actualizada.activo }
    });

    return respuesta.json({
      especialidad: actualizada,
      mensaje: `Especialidad "${actualizada.subcategoria}" actualizada exitosamente.`
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al actualizar especialidad.' });
  }
};

const cambiarEstadoEspecialidad = async (peticion, respuesta) => {
  try {
    const id = peticion.params.id;
    const activo = Boolean(peticion.body.activo);
    const actualizada = await especialidadesServicio.cambiarEstadoEspecialidad(id, activo);

    return respuesta.json({
      especialidad: actualizada,
      mensaje: `Especialidad "${actualizada.subcategoria}" marcada como ${activo ? 'activa' : 'inactiva'}.`
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al cambiar estado de especialidad.' });
  }
};

/**
 * 12. Gestión de Reportes y Reclamaciones
 */
const listarReportes = async (peticion, respuesta) => {
  try {
    const { estado, motivo, busqueda, prioridad } = peticion.query;
    const lista = await reportesServicio.listarReportes({ estado, motivo, busqueda, prioridad });
    return respuesta.json({ reportes: lista });
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar reportes.' });
  }
};

const actualizarSeguimientoReporte = async (peticion, respuesta) => {
  try {
    const adminPerfil = peticion.usuario.perfil;
    const adminAuth = peticion.usuario.auth;
    const id = peticion.params.id;
    const { estado, accionesTomadas, responsableRemitido, resolucionFinal, notaAdmin } = peticion.body;

    const actualizado = await reportesServicio.actualizarSeguimiento(id, {
      estado,
      accionesTomadas,
      responsableRemitido,
      resolucionFinal,
      notaAdmin,
      adminInfo: {
        id: adminAuth.id,
        nombre: adminPerfil.nombre_completo || 'Administrador GuianzApp'
      }
    });

    await auditoriaServicio.registrarEvento({
      adminId: adminAuth.id,
      adminNombre: adminPerfil.nombre_completo || 'Administrador GuianzApp',
      adminEmail: adminAuth.email,
      accion: 'atender_reporte',
      entidadTipo: 'reporte',
      entidadId: id,
      entidadNombre: actualizado.codigo_caso,
      motivo: `Seguimiento de reclamación actualizado a estado "${actualizado.estado}".`,
      detalles: { responsableRemitido: actualizado.responsable_remitido }
    });

    return respuesta.json({
      reporte: actualizado,
      mensaje: `Caso ${actualizado.codigo_caso} actualizado exitosamente.`
    });
  } catch (error) {
    return respuesta.status(400).json({ error: error.message || 'Error al actualizar reporte.' });
  }
};

/**
 * 13. Historial de Auditoría
 */
const listarAuditoria = async (peticion, respuesta) => {
  try {
    const { accion, entidadTipo, busqueda, limite } = peticion.query;
    const eventos = await auditoriaServicio.listarEventos({
      accion,
      entidadTipo,
      busqueda,
      limite: limite ? Number(limite) : 100
    });
    return respuesta.json({ auditoria: eventos });
  } catch (error) {
    return respuesta.status(500).json({ error: 'Error al consultar auditoría.' });
  }
};

/**
 * 14. Exportar reportes administrativos a formato CSV
 */
const exportarDatosCSV = async (peticion, respuesta) => {
  try {
    const tipo = peticion.params.tipo; // 'prestadores', 'usuarios', 'reportes', 'auditoria'

    let encabezados = [];
    let filas = [];

    if (tipo === 'prestadores') {
      const { data: perfiles } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('*')
        .in('rol', ['agencia', 'guia']);

      encabezados = ['ID', 'Rol', 'Nombre', 'RNT/Tarjeta', 'Estado', 'Fecha Registro'];
      filas = (perfiles || []).map((p) => [
        p.id,
        p.rol,
        `"${(p.nombre_agencia || p.nombre_completo || '').replace(/"/g, '""')}"`,
        p.numero_rnt || '',
        p.estado || '',
        p.creado_en || ''
      ]);
    } else if (tipo === 'reportes') {
      const reportes = await reportesServicio.listarReportes();
      encabezados = ['Codigo', 'Fecha', 'Reportante', 'Contraparte', 'Motivo', 'Estado', 'Prioridad', 'Responsable Remitido'];
      filas = reportes.map((r) => [
        r.codigo_caso,
        r.creado_en,
        `"${(r.nombre_reportante || '').replace(/"/g, '""')}"`,
        `"${(r.nombre_afectado || '').replace(/"/g, '""')}"`,
        `"${(r.motivo_legible || r.motivo_categoria || '').replace(/"/g, '""')}"`,
        r.estado,
        r.prioridad,
        `"${(r.responsable_remitido || '').replace(/"/g, '""')}"`
      ]);
    } else if (tipo === 'auditoria') {
      const eventos = await auditoriaServicio.listarEventos({ limite: 500 });
      encabezados = ['ID', 'Fecha', 'Administrador', 'Accion', 'Entidad Tipo', 'Entidad Nombre', 'Motivo'];
      filas = eventos.map((e) => [
        e.id,
        e.creado_en,
        `"${(e.admin_nombre || '').replace(/"/g, '""')}"`,
        e.accion,
        e.entidad_tipo,
        `"${(e.entidad_nombre || '').replace(/"/g, '""')}"`,
        `"${(e.motivo || '').replace(/"/g, '""')}"`
      ]);
    } else {
      return respuesta.status(400).json({ error: 'Tipo de exportación no soportado.' });
    }

    const csvContenido = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n');

    respuesta.setHeader('Content-Type', 'text/csv; charset=utf-8');
    respuesta.setHeader('Content-Disposition', `attachment; filename=guianzapp_${tipo}_${Date.now()}.csv`);
    return respuesta.send(csvContenido);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    return respuesta.status(500).json({ error: 'Error al generar archivo CSV de exportación.' });
  }
};

/**
 * 15. Reenviar solicitud de perfil tras corrección
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

    if (peticion.files?.rntDocument?.[0]) {
      const archRnt = peticion.files.rntDocument[0];
      const extension = path.extname(archRnt.originalname).toLowerCase();
      const rutaRnt = `${idUsuario}/rnt-reenvio-${crypto.randomUUID()}${extension}`;
      await subirArchivo('rnt-documents', rutaRnt, archRnt.buffer, archRnt.mimetype);
      actualizaciones.ruta_documento_rnt = rutaRnt;
    }

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

    guardarMetaPerfil(idUsuario, { motivoRechazo: null, observacionesAdmin: null });

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
  obtenerResumenIndicadores,
  listarPrestadores,
  obtenerColaRevision,
  aprobarPerfil,
  rechazarPerfil,
  solicitarCorreccionesPerfil,
  suspenderPerfil,
  reactivarPerfil,
  listarUsuarios,
  cambiarEstadoUsuario,
  listarEspecialidadesAdmin,
  crearEspecialidad,
  actualizarEspecialidad,
  cambiarEstadoEspecialidad,
  listarReportes,
  actualizarSeguimientoReporte,
  listarAuditoria,
  exportarDatosCSV,
  reenviarSolicitudPerfil
};
