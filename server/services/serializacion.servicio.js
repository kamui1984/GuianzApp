const { obtenerUrlFirmada } = require('./almacenamiento.servicio');

/**
 * Serializa los datos del usuario combinando datos de Auth y de Perfiles.
 */
const serializarUsuario = (usuarioAuth, perfil) => ({
  id: usuarioAuth?.id || perfil?.id,
  correo: usuarioAuth?.email || perfil?.correo || '',
  rol: perfil?.rol || 'turista',
  nombreAgencia: perfil?.nombre_agencia || perfil?.nombre_completo || '',
  nombreCompleto: perfil?.nombre_completo || '',
  numeroRnt: perfil?.numero_rnt || '',
  estado: perfil?.estado || 'activo',
  motivoRechazo: perfil?.motivo_rechazo || '',
  fotoRostro: perfil?.foto_rostro || '',
  creadoEn: perfil?.creado_en || new Date().toISOString(),
  correoElectronico: usuarioAuth?.email || perfil?.correo || ''
});

const paquetesToursServicio = require('./paquetesTours.servicio');

/**
 * Serializa un paquete turístico con sus archivos, duración, especialidades y salidas programadas.
 */
const serializarPaquete = async (paquete) => {
  const archivos = await Promise.all((paquete.archivos_paquete || []).map(async (archivo) => ({
    id: archivo.id,
    nombre: archivo.original_name || archivo.nombre_original,
    url: await obtenerUrlFirmada('package-files', archivo.ruta_almacenamiento),
    tipo: archivo.tipo_mime,
    rutaAlmacenamiento: archivo.ruta_almacenamiento
  })));

  const nombreAgencia = paquete.nombreAgencia ||
                        paquete.nombre_agencia ||
                        paquete.perfiles?.nombre_agencia ||
                        paquete.perfiles?.nombre_completo ||
                        '';

  const numeroRnt = paquete.perfiles?.numero_rnt || paquete.numero_rnt || '';

  // Obtener especialidades requeridas y salidas programadas
  let especialidadesIds = [];
  let especialidades = [];
  let programacion = [];

  try {
    const infoEsp = await paquetesToursServicio.obtenerEspecialidadesTour(paquete.id);
    especialidadesIds = infoEsp.ids;
    especialidades = infoEsp.objetos;
    programacion = await paquetesToursServicio.obtenerProgramacion(paquete.id);
  } catch (err) {
    // Continuar con valores por defecto
  }

  return {
    id: paquete.id,
    idAgencia: paquete.id_agencia,
    nombreAgencia,
    numeroRnt,
    titulo: paquete.titulo || paquete.nombre_tour,
    descripcion: paquete.descripcion,
    duracion: paquete.duracion || paquete.duration || (paquete.duracion_horas ? `${paquete.duracion_horas} horas` : '3.5 horas'),
    duracionHoras: paquete.duracion_horas || parseInt(paquete.duracion) || 4,
    precio: Number(paquete.precio),
    politicaCancelacion: paquete.politica_cancelacion || '',
    estado: paquete.estado,
    creadoEn: paquete.creado_en,
    actualizadoEn: paquete.actualizado_en,
    archivos,
    especialidadesIds,
    especialidades,
    programacion,
    salidas: programacion
  };
};

/**
 * Serializa un registro de disponibilidad de guía turístico.
 */
const serializarDisponibilidad = (disponibilidad) => ({
  id: disponibilidad.id,
  idGuia: disponibilidad.id_guia,
  fecha: disponibilidad.fecha_disponible,
  fechaFin: disponibilidad.fecha_fin || disponibilidad.fecha_disponible,
  horaInicio: disponibilidad.hora_inicio || '',
  horaFin: disponibilidad.hora_fin || '',
  estaDisponible: disponibilidad.esta_disponible !== false,
  notas: disponibilidad.notes || disponibilidad.notas || ''
});

/**
 * Serializa un perfil en la cola de revisión de administración.
 */
const serializarPerfilRevision = async (perfil) => {
  const urlDocumentoRnt = perfil.ruta_documento_rnt 
    ? await obtenerUrlFirmada('rnt-documents', perfil.ruta_documento_rnt) 
    : null;
  const urlTarjetaProfesional = perfil.ruta_tarjeta_profesional 
    ? await obtenerUrlFirmada('guide-documents', perfil.ruta_tarjeta_profesional) 
    : null;
  const urlFotoRostro = perfil.ruta_foto_rostro 
    ? await obtenerUrlFirmada('guide-documents', perfil.ruta_foto_rostro) 
    : null;

  return {
    id: perfil.id,
    rol: perfil.rol,
    nombreAgencia: perfil.nombre_agencia || '',
    nombreCompleto: perfil.nombre_completo || '',
    numeroRnt: perfil.numero_rnt || '',
    estado: perfil.estado,
    motivoRechazo: perfil.motivo_rechazo || '',
    creadoEn: perfil.creado_en,
    especialidades: perfil.especialidades || '',
    idiomas: perfil.idiomas || '',
    urlDocumentoRnt,
    urlTarjetaProfesional,
    urlFotoRostro
  };
};

/**
 * Serializa una reserva / tour vendido.
 */
const serializarReserva = (reserva, paquete = null, guia = null) => ({
  id: reserva.id,
  idPaquete: reserva.id_paquete || reserva.idPaquete,
  tituloPaquete: paquete?.titulo || reserva.titulo_paquete || reserva.tituloPaquete || 'Experiencia Turística',
  descripcionTour: reserva.descripcion_tour || reserva.descripcionTour || paquete?.descripcion || '',
  idAgencia: reserva.id_agencia || reserva.idAgencia,
  nombreAgencia: paquete?.nombreAgencia || reserva.nombre_agencia || reserva.nombreAgencia || 'Agencia Operadora',
  telefonoAgencia: reserva.telefono_agencia || reserva.telefonoAgencia || '3001234567',
  correoAgencia: reserva.correo_agencia || reserva.correoAgencia || '',
  idGuiaAsignado: reserva.id_guia_asignado || reserva.idGuiaAsignado || null,
  nombreGuiaAsignado: guia?.nombreCompleto || reserva.nombre_guia_asignado || reserva.nombreGuiaAsignado || null,
  idTurista: reserva.id_turista || reserva.idTurista || null,
  nombreTitular: reserva.nombre_titular || reserva.nombreTitular,
  correoContacto: reserva.correo_contacto || reserva.correoContacto,
  telefonoContacto: reserva.telefono_contacto || reserva.telefonoContacto,
  fechaReserva: reserva.fecha_reserva || reserva.fechaReserva,
  horaReserva: reserva.hora_reserva || reserva.horaReserva || '09:00',
  cantidadPersonas: Number(reserva.cantidad_personas || reserva.cantidadPersonas || 1),
  precioTotal: Number(reserva.precio_total || reserva.precioTotal || 0),
  duracion: reserva.duracion || paquete?.duracion || '3.5 horas',
  estado: reserva.estado || 'confirmada',
  creadoEn: reserva.creado_en || reserva.creadoEn || new Date().toISOString()
});

module.exports = {
  serializarUsuario,
  serializarPaquete,
  serializarDisponibilidad,
  serializarPerfilRevision,
  serializarReserva
};
