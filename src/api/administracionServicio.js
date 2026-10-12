import { solicitarApi, obtenerTokenAutenticacion } from './clienteHttp';

export const servicioAdministracion = {
  /**
   * Obtener métricas e indicadores generales de la plataforma y tareas pendientes.
   */
  obtenerResumenIndicadores: async () => {
    return solicitarApi('/api/administracion/resumen-indicadores');
  },

  /**
   * Listar prestadores turísticos (agencias y guías) con filtros y búsqueda.
   */
  listarPrestadores: async ({ rol = 'todos', estado = 'todos', busqueda = '' } = {}) => {
    const params = new URLSearchParams();
    if (rol !== 'todos') params.append('rol', rol);
    if (estado !== 'todos') params.append('estado', estado);
    if (busqueda) params.append('busqueda', busqueda);
    const querystring = params.toString() ? `?${params.toString()}` : '';

    const respuesta = await solicitarApi(`/api/administracion/prestadores${querystring}`);
    return respuesta.prestadores || [];
  },

  /**
   * Obtener la cola de perfiles en revisión (compatibilidad).
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
   * Solicitar corrección de datos o documentos a un prestador.
   */
  solicitarCorrecciones: async (idPerfil, observaciones) => {
    return solicitarApi(`/api/administracion/perfiles/${idPerfil}/solicitar-correcciones`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    });
  },

  /**
   * Suspender el perfil de un prestador con justificación.
   */
  suspenderPerfil: async (idPerfil, motivoSuspension) => {
    return solicitarApi(`/api/administracion/perfiles/${idPerfil}/suspender`, {
      method: 'POST',
      body: JSON.stringify({ motivoSuspension })
    });
  },

  /**
   * Reactivar el perfil de un prestador suspendido.
   */
  reactivarPerfil: async (idPerfil, motivoReactivacion) => {
    return solicitarApi(`/api/administracion/perfiles/${idPerfil}/reactivar`, {
      method: 'POST',
      body: JSON.stringify({ motivoReactivacion })
    });
  },

  /**
   * Consultar lista de usuarios registrados con filtros por rol y estado.
   */
  listarUsuarios: async ({ rol = 'todos', estado = 'todos', busqueda = '' } = {}) => {
    const params = new URLSearchParams();
    if (rol !== 'todos') params.append('rol', rol);
    if (estado !== 'todos') params.append('estado', estado);
    if (busqueda) params.append('busqueda', busqueda);
    const querystring = params.toString() ? `?${params.toString()}` : '';

    const respuesta = await solicitarApi(`/api/administracion/usuarios${querystring}`);
    return respuesta.usuarios || [];
  },

  /**
   * Bloquear o desbloquear cuenta de usuario con justificación obligatoria.
   */
  cambiarEstadoUsuario: async (idUsuario, nuevoEstado, justificacion) => {
    return solicitarApi(`/api/administracion/usuarios/${idUsuario}/cambiar-estado`, {
      method: 'POST',
      body: JSON.stringify({ nuevoEstado, justificacion })
    });
  },

  /**
   * Listar catálogo completo de especialidades para administración.
   */
  listarEspecialidadesAdmin: async () => {
    const respuesta = await solicitarApi('/api/administracion/especialidades');
    return respuesta.especialidades || [];
  },

  /**
   * Crear nueva especialidad / categoría.
   */
  crearEspecialidad: async ({ categoria_macro, subcategoria, descripcion_ayuda, icono }) => {
    return solicitarApi('/api/administracion/especialidades', {
      method: 'POST',
      body: JSON.stringify({ categoria_macro, subcategoria, descripcion_ayuda, icono })
    });
  },

  /**
   * Editar una especialidad existente.
   */
  actualizarEspecialidad: async (id, datos) => {
    return solicitarApi(`/api/administracion/especialidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  },

  /**
   * Activar o desactivar una opción del catálogo.
   */
  cambiarEstadoEspecialidad: async (id, activo) => {
    return solicitarApi(`/api/administracion/especialidades/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo })
    });
  },

  /**
   * Listar reportes y reclamaciones de la plataforma.
   */
  listarReportes: async ({ estado = 'todos', motivo = 'todos', busqueda = '', prioridad = 'todos' } = {}) => {
    const params = new URLSearchParams();
    if (estado !== 'todos') params.append('estado', estado);
    if (motivo !== 'todos') params.append('motivo', motivo);
    if (prioridad !== 'todos') params.append('prioridad', prioridad);
    if (busqueda) params.append('busqueda', busqueda);
    const querystring = params.toString() ? `?${params.toString()}` : '';

    const respuesta = await solicitarApi(`/api/administracion/reportes${querystring}`);
    return respuesta.reportes || [];
  },

  /**
   * Actualizar el seguimiento, estado o dictamen de una reclamación.
   */
  actualizarSeguimientoReporte: async (idReporte, datos) => {
    return solicitarApi(`/api/administracion/reportes/${idReporte}`, {
      method: 'PATCH',
      body: JSON.stringify(datos)
    });
  },

  /**
   * Consultar historial de auditoría administrativa.
   */
  listarAuditoria: async ({ accion = 'todos', entidadTipo = 'todos', busqueda = '', limite = 100 } = {}) => {
    const params = new URLSearchParams();
    if (accion !== 'todos') params.append('accion', accion);
    if (entidadTipo !== 'todos') params.append('entidadTipo', entidadTipo);
    if (busqueda) params.append('busqueda', busqueda);
    if (limite) params.append('limite', limite);
    const querystring = params.toString() ? `?${params.toString()}` : '';

    const respuesta = await solicitarApi(`/api/administracion/auditoria${querystring}`);
    return respuesta.auditoria || [];
  },

  /**
   * Descargar reporte CSV administrativo.
   */
  descargarReporteCSV: async (tipo) => {
    const token = obtenerTokenAutenticacion();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/administracion/exportar/${tipo}`, { headers });
    if (!res.ok) throw new Error('No se pudo generar la exportación.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guianzapp_${tipo}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
