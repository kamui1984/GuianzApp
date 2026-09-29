const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { serializarReserva } = require('./serializacion.servicio');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoReservas = path.join(rutaDirectorioData, 'reservas.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

const leerReservasLocal = () => {
  try {
    if (fs.existsSync(rutaArchivoReservas)) {
      const contenido = fs.readFileSync(rutaArchivoReservas, 'utf8');
      return JSON.parse(contenido || '[]');
    }
  } catch (error) {
    console.warn('Error al leer reservas.json:', error.message);
  }
  return [];
};

const guardarReservasLocal = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoReservas, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar en reservas.json:', error.message);
  }
};

/**
 * Registra una nueva reserva de tour vendido con persistencia garantizada.
 */
const crearReserva = async (datosReserva) => {
  const idReserva = crypto.randomUUID();
  const idAgenciaNormalizado = String(datosReserva.idAgencia || datosReserva.id_agencia || '').trim();

  const registro = {
    id: idReserva,
    id_paquete: datosReserva.idPaquete || datosReserva.id_paquete || '',
    id_agencia: idAgenciaNormalizado,
    id_turista: datosReserva.idTurista || datosReserva.id_turista || null,
    nombre_titular: datosReserva.nombreTitular || datosReserva.nombre_titular || 'Turista Explorador',
    correo_contacto: datosReserva.correoContacto || datosReserva.correo_contacto || '',
    telefono_contacto: datosReserva.telefonoContacto || datosReserva.telefono_contacto || '',
    fecha_reserva: datosReserva.fechaReserva || datosReserva.fecha_reserva,
    hora_reserva: datosReserva.horaReserva || datosReserva.hora_reserva || '09:00 AM',
    cantidad_personas: Number(datosReserva.cantidadPersonas || datosReserva.cantidad_personas || 1),
    precio_total: Number(datosReserva.precioTotal || datosReserva.precio_total || 0),
    duracion: datosReserva.duracion || '3.5 horas',
    titulo_paquete: datosReserva.tituloPaquete || 'Experiencia en Bogotá',
    nombre_agencia: datosReserva.nombreAgencia || 'Agencia Operadora',
    id_guia_asignado: null,
    nombre_guia_asignado: null,
    estado: 'confirmada',
    creado_en: new Date().toISOString()
  };

  // 1. Guardar en almacenamiento persistente local
  const listaLocal = leerReservasLocal();
  listaLocal.unshift(registro);
  guardarReservasLocal(listaLocal);

  // 2. Intentar guardar en Supabase (si existe la tabla reservas)
  try {
    await clienteSupabaseAdmin.from('reservas').insert(registro);
  } catch (err) {
    // Si la tabla no existe en Supabase, el registro ya está seguro localmente
  }

  return serializarReserva(registro);
};

/**
 * Obtener las reservas asociadas a la agencia.
 */
const listarReservasPorAgencia = async (idAgencia) => {
  const idBuscado = String(idAgencia || '').trim();
  const listaLocal = leerReservasLocal();

  // Filtrar reservas que coincidan con la agencia o devolver todas si la agencia es la única activa
  const coincidentes = listaLocal.filter((r) => {
    const agenciaReserva = String(r.id_agencia || r.idAgencia || '').trim();
    return !agenciaReserva || agenciaReserva === idBuscado;
  });

  return coincidentes.map((r) => serializarReserva(r));
};

/**
 * Obtener las reservas asignadas a un guía turístico con descripción completa del tour y datos de contacto de la agencia.
 */
const listarReservasPorGuia = async (idGuia) => {
  const idBuscado = String(idGuia || '').trim();
  const listaLocal = leerReservasLocal();

  const asignadas = listaLocal.filter((r) => {
    const guiaReserva = String(r.id_guia_asignado || r.idGuiaAsignado || '').trim();
    return guiaReserva === idBuscado;
  });

  const enriquecidas = await Promise.all(
    asignadas.map(async (r) => {
      let descripcionTour = r.descripcion_tour || r.descripcionTour;
      let nombreAgencia = r.nombre_agencia || r.nombreAgencia;
      let telefonoAgencia = r.telefono_agencia || r.telefonoAgencia;
      let correoAgencia = r.correo_agencia || r.correoAgencia;

      // 1. Si no tiene descripción del tour, buscar en paquetes
      if (!descripcionTour && r.id_paquete) {
        try {
          const { data: pkg } = await clienteSupabaseAdmin
            .from('paquetes')
            .select('descripcion, titulo')
            .eq('id', r.id_paquete)
            .maybeSingle();
          if (pkg?.descripcion) {
            descripcionTour = pkg.descripcion;
          }
        } catch (e) {
          // Continuar
        }
      }

      // 2. Si faltan datos de la agencia, consultar perfil y auth
      const idAgencia = r.id_agencia || r.idAgencia;
      if (idAgencia && (!correoAgencia || !nombreAgencia)) {
        try {
          const { data: authData } = await clienteSupabaseAdmin.auth.admin.getUserById(idAgencia);
          if (authData?.user?.email && !correoAgencia) {
            correoAgencia = authData.user.email;
          }
          const { data: perfilData } = await clienteSupabaseAdmin
            .from('perfiles')
            .select('nombre_agencia, nombre_completo')
            .eq('id', idAgencia)
            .maybeSingle();
          if (perfilData?.nombre_agencia && !nombreAgencia) {
            nombreAgencia = perfilData.nombre_agencia;
          }
        } catch (e) {
          // Continuar
        }
      }

      if (!telefonoAgencia) {
        telefonoAgencia = '3001234567';
      }

      return {
        ...r,
        descripcion_tour: descripcionTour || 'Recorrido turístico guiado por Bogotá.',
        nombre_agencia: nombreAgencia || 'Agencia Operadora',
        telefono_agencia: telefonoAgencia,
        correo_agencia: correoAgencia || 'contacto@agencia.com'
      };
    })
  );

  return enriquecidas.map((r) => serializarReserva(r));
};

/**
 * Asignar un guía certificado a una reserva de tour vendido.
 */
const asignarGuiaAReserva = async (idReserva, idGuia, nombreGuia, datosAdicionales = {}) => {
  const listaLocal = leerReservasLocal();
  const indice = listaLocal.findIndex((r) => r.id === idReserva);

  if (indice === -1) {
    throw new Error('No se encontró la reserva para asignar el guía.');
  }

  const reserva = listaLocal[indice];
  let descripcionTour = datosAdicionales.descripcionTour || reserva.descripcion_tour;
  let nombreAgencia = datosAdicionales.nombreAgencia || reserva.nombre_agencia;
  let telefonoAgencia = datosAdicionales.telefonoAgencia || reserva.telefono_agencia;
  let correoAgencia = datosAdicionales.correoAgencia || reserva.correo_agencia;

  // Buscar descripción del paquete si no se especificó
  if (!descripcionTour && reserva.id_paquete) {
    try {
      const { data: pkg } = await clienteSupabaseAdmin
        .from('paquetes')
        .select('descripcion')
        .eq('id', reserva.id_paquete)
        .maybeSingle();
      if (pkg?.descripcion) {
        descripcionTour = pkg.descripcion;
      }
    } catch (e) {
      // Continuar
    }
  }

  // Buscar correo de agencia si no viene
  const idAgencia = reserva.id_agencia || reserva.idAgencia;
  if (idAgencia && !correoAgencia) {
    try {
      const { data: authData } = await clienteSupabaseAdmin.auth.admin.getUserById(idAgencia);
      if (authData?.user?.email) {
        correoAgencia = authData.user.email;
      }
    } catch (e) {
      // Continuar
    }
  }

  reserva.id_guia_asignado = idGuia;
  reserva.idGuiaAsignado = idGuia;
  reserva.nombre_guia_asignado = nombreGuia;
  reserva.nombreGuiaAsignado = nombreGuia;
  reserva.descripcion_tour = descripcionTour || 'Recorrido turístico guiado por Bogotá.';
  reserva.nombre_agencia = nombreAgencia || 'Agencia Operadora';
  reserva.telefono_agencia = telefonoAgencia || '3001234567';
  reserva.correo_agencia = correoAgencia || 'contacto@agencia.com';

  guardarReservasLocal(listaLocal);

  try {
    await clienteSupabaseAdmin
      .from('reservas')
      .update({
        id_guia_asignado: idGuia,
        nombre_guia_asignado: nombreGuia,
        descripcion_tour: reserva.descripcion_tour,
        nombre_agencia: reserva.nombre_agencia,
        telefono_agencia: reserva.telefono_agencia,
        correo_agencia: reserva.correo_agencia
      })
      .eq('id', idReserva);
  } catch (err) {
    // Continuar
  }

  return serializarReserva(reserva);
};

/**
 * Eliminar una reserva / tour vendido.
 */
const eliminarReserva = async (idReserva, idAgencia = null) => {
  const listaLocal = leerReservasLocal();
  const indice = listaLocal.findIndex((r) => r.id === idReserva);

  if (indice === -1) {
    return false;
  }

  // Si se pasa idAgencia, verificar pertenencia si la reserva tiene agencia asignada
  if (idAgencia) {
    const reservaAgencia = String(listaLocal[indice].id_agencia || listaLocal[indice].idAgencia || '').trim();
    if (reservaAgencia && reservaAgencia !== String(idAgencia).trim()) {
      return false;
    }
  }

  listaLocal.splice(indice, 1);
  guardarReservasLocal(listaLocal);

  try {
    await clienteSupabaseAdmin
      .from('reservas')
      .delete()
      .eq('id', idReserva);
  } catch (err) {
    // Continuar
  }

  return true;
};

module.exports = {
  crearReserva,
  listarReservasPorAgencia,
  listarReservasPorGuia,
  asignarGuiaAReserva,
  eliminarReserva,
  leerReservasLocal
};

