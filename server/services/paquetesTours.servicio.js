const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { ESPECIALIDADES_CATALOGO } = require('../data/catalogoEspecialidades');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoToursLocal = path.join(rutaDirectorioData, 'paquetes_tours.json');
const rutaArchivoProgLocal = path.join(rutaDirectorioData, 'programacion_tours.json');
const rutaArchivoTourEspLocal = path.join(rutaDirectorioData, 'tour_especialidades.json');

const leerLocal = (archivo) => {
  try {
    if (fs.existsSync(archivo)) {
      return JSON.parse(fs.readFileSync(archivo, 'utf8') || '[]');
    }
  } catch (err) {
    console.warn(`Error al leer ${archivo}:`, err.message);
  }
  return [];
};

const guardarLocal = (archivo, datos) => {
  try {
    const dir = path.dirname(archivo);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(archivo, JSON.stringify(datos, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Error al guardar en ${archivo}:`, err.message);
  }
};

/**
 * Servicio para gestionar paquetes_tours, tour_especialidades y programacion_tours.
 */
class PaquetesToursServicio {
  /**
   * Resuelve el ID numérico entero de paquetes_tours para un tourId (que puede ser UUID o numérico).
   */
  async resolverTourIdNumerico(tourId) {
    if (!tourId) return null;
    if (Number.isInteger(Number(tourId)) && Number(tourId) > 0) {
      return Number(tourId);
    }
    try {
      const { data: paq } = await clienteSupabaseAdmin
        .from('paquetes')
        .select('titulo, id_agencia')
        .eq('id', tourId)
        .maybeSingle();

      if (paq) {
        const { data: pt } = await clienteSupabaseAdmin
          .from('paquetes_tours')
          .select('id')
          .eq('agencia_id', paq.id_agencia)
          .eq('nombre_tour', paq.titulo)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pt) return pt.id;
      }
    } catch (e) {
      // Ignorar error de consulta
    }
    return null;
  }

  /**
   * Helper para normalizar horas a formato HH:mm (24 horas) para comparaciones precisas
   */
  normalizarHora(h) {
    if (!h) return '';
    const str = String(h).trim().toLowerCase();
    const esPM = str.includes('pm') || str.includes('p.m.');
    const esAM = str.includes('am') || str.includes('a.m.');
    const numeros = str.replace(/[^0-9:]/g, '').split(':');
    let hora = parseInt(numeros[0] || '0', 10);
    const min = parseInt(numeros[1] || '0', 10);
    if (esPM && hora < 12) hora += 12;
    if (esAM && hora === 12) hora = 0;
    return `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  /**
   * Helper para determinar si una fecha y hora están vigentes en hora local de Bogotá (UTC-5)
   */
  esSalidaVigente(fechaStr, horaStr) {
    if (!fechaStr) return false;
    const ahora = new Date();
    const formatoCol = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(ahora);

    const anioActual = formatoCol.find((p) => p.type === 'year')?.value;
    const mesActual = formatoCol.find((p) => p.type === 'month')?.value;
    const diaActual = formatoCol.find((p) => p.type === 'day')?.value;
    const hoyStr = `${anioActual}-${mesActual}-${diaActual}`;

    if (fechaStr < hoyStr) return false;
    if (fechaStr > hoyStr) return true;

    // Si es hoy, validar la hora
    if (!horaStr) return false;
    const horaActualNum = parseInt(formatoCol.find((p) => p.type === 'hour')?.value || '0', 10);
    const minActualNum = parseInt(formatoCol.find((p) => p.type === 'minute')?.value || '0', 10);

    const horaSalidaNorm = this.normalizarHora(horaStr);
    const [hSal, mSal] = horaSalidaNorm.split(':').map((n) => parseInt(n, 10));

    if (hSal > horaActualNum) return true;
    if (hSal === horaActualNum && mSal > minActualNum) return true;
    return false;
  }

  /**
   * Obtener programación de salidas disponibles para un tour determinado.
   * Filtra fechas/horas pasadas y descuenta cupos según las reservas confirmadas o activas.
   */
  async obtenerProgramacion(tourId, soloVigentes = true) {
    const tourIdStr = String(tourId);
    const idNumerico = await this.resolverTourIdNumerico(tourId);
    let salidas = [];

    // 1. Intentar consultar desde Supabase con ID numérico
    if (idNumerico) {
      try {
        const { data, error } = await clienteSupabaseAdmin
          .from('programacion_tours')
          .select('*')
          .eq('tour_id', idNumerico)
          .order('fecha', { ascending: true })
          .order('hora_inicio', { ascending: true });

        if (data && data.length > 0) {
          salidas = data;
        }
      } catch (err) {
        // Continuar con local
      }
    }

    // 2. Si no hay en Supabase, consultar local
    const progLocales = leerLocal(rutaArchivoProgLocal);
    const localesCoincidentes = progLocales.filter((p) => {
      const matchUuid = String(p.tour_id) === tourIdStr;
      const matchNum = idNumerico && String(p.tour_id) === String(idNumerico);
      return matchUuid || matchNum;
    });

    if (localesCoincidentes.length > 0) {
      // Filtrar salidas personalizadas creadas por la agencia
      const personalizadas = localesCoincidentes.filter((p) => !String(p.id || '').startsWith('def-'));
      if (personalizadas.length > 0) {
        salidas = personalizadas;
        // Purgar salidas 'def-' antiguas si quedaron registradas
        const nuevasLocales = progLocales.filter((p) => {
          const esDeEsteTour = String(p.tour_id) === tourIdStr || (idNumerico && String(p.tour_id) === String(idNumerico));
          return !(esDeEsteTour && String(p.id || '').startsWith('def-'));
        });
        if (nuevasLocales.length !== progLocales.length) {
          guardarLocal(rutaArchivoProgLocal, nuevasLocales);
        }
      } else if (salidas.length === 0) {
        salidas = localesCoincidentes;
      }
    }

    // Deduplicar por fecha y hora para evitar repeticiones por UUID e ID numérico
    const clavesVistas = new Set();
    const salidasUnicas = [];
    for (const s of salidas) {
      const clave = `${s.fecha}_${s.hora_inicio || s.horaInicio}`;
      if (!clavesVistas.has(clave)) {
        clavesVistas.add(clave);
        salidasUnicas.push(s);
      }
    }

    // Obtener identificadores complementarios del tour (UUID, ID numérico y título)
    let idUuid = tourIdStr.length === 36 ? tourIdStr : null;
    let tituloTourNorm = '';

    try {
      if (idUuid) {
        const { data: p } = await clienteSupabaseAdmin
          .from('paquetes')
          .select('id, titulo')
          .eq('id', idUuid)
          .maybeSingle();
        if (p?.titulo) {
          tituloTourNorm = p.titulo.toLowerCase().trim();
        }
      } else if (idNumerico) {
        const { data: pt } = await clienteSupabaseAdmin
          .from('paquetes_tours')
          .select('id, nombre_tour')
          .eq('id', idNumerico)
          .maybeSingle();
        if (pt?.nombre_tour) {
          tituloTourNorm = pt.nombre_tour.toLowerCase().trim();
          const { data: paqMatch } = await clienteSupabaseAdmin
            .from('paquetes')
            .select('id')
            .eq('titulo', pt.nombre_tour)
            .maybeSingle();
          if (paqMatch?.id) {
            idUuid = paqMatch.id;
          }
        }
      }
    } catch (e) {}

    // Consultar reservas activas para descontar cupos en tiempo real
    const rutaArchivoReservas = path.join(rutaDirectorioData, 'reservas.json');
    let reservasActivas = leerLocal(rutaArchivoReservas);
    try {
      const { data: supaRes } = await clienteSupabaseAdmin
        .from('reservas')
        .select('*');
      if (supaRes && supaRes.length > 0) {
        const mapaReservas = new Map();
        reservasActivas.forEach((r) => mapaReservas.set(String(r.id), r));
        supaRes.forEach((r) => mapaReservas.set(String(r.id), r));
        reservasActivas = Array.from(mapaReservas.values());
      }
    } catch (e) {
      // Usar reservas locales
    }

    const normFecha = (f) => String(f || '').split('T')[0].split(' ')[0].trim();

    // Filtrar salidas vigentes y descontar cupos
    const resultado = [];
    for (const s of salidasUnicas) {
      const horaStr = s.hora_inicio || s.horaInicio;
      if (soloVigentes && !this.esSalidaVigente(s.fecha, horaStr)) {
        // Ignorar salidas con fecha y hora en el pasado para que el turista no pueda verlas ni reservarlas
        continue;
      }

      const horaSalidaNorm = this.normalizarHora(horaStr);
      const cuposMaximos = Number(s.cupos_maximos || s.cuposMaximos || 15);
      const fechaSalidaNorm = normFecha(s.fecha);

      // Calcular cupos ya reservados para este tour, fecha y hora
      const cuposReservados = reservasActivas
        .filter((r) => {
          const idPaqueteRes = String(r.id_paquete || r.idPaquete || '').trim();
          const tituloResNorm = String(r.titulo_paquete || r.tituloPaquete || '').toLowerCase().trim();

          const coincideTour =
            (idUuid && idPaqueteRes === idUuid) ||
            (idNumerico && idPaqueteRes === String(idNumerico)) ||
            (idPaqueteRes === tourIdStr) ||
            (tituloTourNorm && tituloResNorm && tituloTourNorm === tituloResNorm);

          if (!coincideTour) return false;

          const fechaResNorm = normFecha(r.fecha_reserva || r.fechaReserva);
          if (fechaResNorm !== fechaSalidaNorm) return false;

          const horaResNorm = this.normalizarHora(r.hora_reserva || r.horaReserva);
          if (horaResNorm && horaSalidaNorm && horaResNorm !== horaSalidaNorm) return false;

          const estado = (r.estado || '').toLowerCase().trim();
          return estado !== 'cancelada' && estado !== 'rechazada';
        })
        .reduce((total, r) => total + (Number(r.cantidad_personas || r.cantidadPersonas) || 1), 0);

      const cuposDisponibles = Math.max(0, cuposMaximos - cuposReservados);
      const estado = cuposDisponibles === 0 ? 'Completo' : (s.estado || 'Disponible');

      resultado.push({
        id: s.id,
        tourId: s.tour_id,
        guiaId: s.guia_id || null,
        fecha: s.fecha,
        horaInicio: horaStr,
        cuposMaximos,
        cuposDisponibles,
        cuposReservados,
        estado
      });
    }

    return resultado;
  }

  /**
   * Obtener las especialidades requeridas para un tour.
   */
  async obtenerEspecialidadesTour(tourId) {
    const tourIdStr = String(tourId);
    let ids = [];

    try {
      const { data } = await clienteSupabaseAdmin
        .from('tour_especialidades')
        .select('especialidad_id')
        .eq('tour_id', tourId);

      if (data && data.length > 0) {
        ids = data.map((d) => Number(d.especialidad_id));
      }
    } catch (err) {
      // Continuar
    }

    if (ids.length === 0) {
      const locales = leerLocal(rutaArchivoTourEspLocal);
      ids = locales
        .filter((t) => String(t.tour_id) === tourIdStr)
        .map((t) => Number(t.especialidad_id));
    }

    const objetos = ESPECIALIDADES_CATALOGO.filter((e) => ids.includes(e.id));
    return {
      ids,
      objetos
    };
  }

  /**
   * Registrar o actualizar las especialidades de un tour.
   */
  async guardarEspecialidadesTour(tourId, especialidadesIds = [], idNumerico = null) {
    const idsNumericos = (especialidadesIds || []).map(Number).filter((id) => !isNaN(id) && id > 0);
    const tourIdInt = idNumerico || (Number.isInteger(Number(tourId)) && Number(tourId) > 0 ? Number(tourId) : null);

    // 1. Supabase (solo si tenemos un tour_id entero que coincida con paquetes_tours.id)
    if (tourIdInt) {
      try {
        await clienteSupabaseAdmin
          .from('tour_especialidades')
          .delete()
          .eq('tour_id', tourIdInt);

        if (idsNumericos.length > 0) {
          const filas = idsNumericos.map((espId) => ({
            tour_id: tourIdInt,
            especialidad_id: espId
          }));
          await clienteSupabaseAdmin.from('tour_especialidades').insert(filas);
        }
      } catch (err) {
        console.warn('Nota tour_especialidades Supabase:', err.message);
      }
    }

    // 2. Local (guarda bajo tourId string y bajo tourIdInt para máxima compatibilidad)
    let locales = leerLocal(rutaArchivoTourEspLocal);
    const keysParaEliminar = new Set([String(tourId)]);
    if (tourIdInt) keysParaEliminar.add(String(tourIdInt));

    locales = locales.filter((t) => !keysParaEliminar.has(String(t.tour_id)));
    idsNumericos.forEach((espId) => {
      locales.push({
        tour_id: String(tourId),
        especialidad_id: espId
      });
      if (tourIdInt && String(tourIdInt) !== String(tourId)) {
        locales.push({
          tour_id: String(tourIdInt),
          especialidad_id: espId
        });
      }
    });
    guardarLocal(rutaArchivoTourEspLocal, locales);
  }

  /**
   * Registrar o actualizar los horarios de salida de un tour.
   */
  async guardarProgramacionTour(tourId, salidas = [], idNumerico = null) {
    const tourIdInt = idNumerico || (await this.resolverTourIdNumerico(tourId));

    const registrosLocales = (salidas || []).map((s, index) => {
      const cuposMax = Number(s.cuposMaximos || s.cupos_maximos || 15);
      const rawHora = s.horaInicio || s.hora_inicio || '09:00:00';
      const horaFinal = rawHora.length === 5 ? `${rawHora}:00` : rawHora;
      return {
        id: s.id || `prog-${tourId}-${Date.now()}-${index}`,
        tour_id: String(tourId),
        guia_id: s.guiaId || s.guia_id || null,
        fecha: s.fecha,
        hora_inicio: horaFinal,
        cupos_maximos: cuposMax,
        cupos_disponibles: Number(s.cuposDisponibles ?? s.cupos_disponibles ?? cuposMax),
        estado: s.estado || 'Disponible'
      };
    });

    // 1. Supabase (inserta sin 'id' de texto para que Postgres use su identity INT)
    if (tourIdInt) {
      try {
        await clienteSupabaseAdmin
          .from('programacion_tours')
          .delete()
          .eq('tour_id', tourIdInt);

        if (registrosLocales.length > 0) {
          const filasSupabase = registrosLocales.map((s) => ({
            tour_id: tourIdInt,
            guia_id: s.guia_id || null,
            fecha: s.fecha,
            hora_inicio: s.hora_inicio,
            cupos_maximos: s.cupos_maximos,
            cupos_disponibles: s.cupos_disponibles,
            estado: s.estado
          }));

          await clienteSupabaseAdmin.from('programacion_tours').insert(filasSupabase);
        }
      } catch (err) {
        console.warn('Nota programacion_tours Supabase:', err.message);
      }
    }

    // 2. Local: eliminar siempre salidas previas (incluyendo las def-) y guardar las nuevas
    let locales = leerLocal(rutaArchivoProgLocal);
    const keysParaEliminar = new Set([String(tourId)]);
    if (tourIdInt) keysParaEliminar.add(String(tourIdInt));

    locales = locales.filter((p) => !keysParaEliminar.has(String(p.tour_id)));
    if (registrosLocales.length > 0) {
      locales.push(...registrosLocales);
      if (tourIdInt && String(tourIdInt) !== String(tourId)) {
        registrosLocales.forEach((r) => {
          locales.push({
            ...r,
            tour_id: String(tourIdInt)
          });
        });
      }
    }
    guardarLocal(rutaArchivoProgLocal, locales);

    return registrosLocales;
  }

  /**
   * Reducir cupos de una salida cuando se confirma una reserva.
   * Actualiza tanto en la base de datos Supabase como en el archivo local.
   */
  async descontarCupos(tourId, fecha, horaInicio, cantidadPersonas = 1) {
    const cant = Number(cantidadPersonas || 1);
    const tourIdStr = String(tourId);
    const tourIdInt = await this.resolverTourIdNumerico(tourId);
    const horaNorm = this.normalizarHora(horaInicio);
    const fechaNorm = String(fecha || '').split('T')[0].split(' ')[0].trim();

    // 1. Actualizar en Supabase si la salida existe allí
    try {
      const { data: supaSalidas, error: errSupa } = await clienteSupabaseAdmin
        .from('programacion_tours')
        .select('*')
        .eq('fecha', fechaNorm);

      if (!errSupa && supaSalidas && supaSalidas.length > 0) {
        const salidaSupa = supaSalidas.find((s) => {
          const matchTour = String(s.tour_id) === tourIdStr || (tourIdInt && String(s.tour_id) === String(tourIdInt));
          const matchHora = this.normalizarHora(s.hora_inicio || s.horaInicio) === horaNorm;
          return matchTour && matchHora;
        });

        if (salidaSupa) {
          const cuposBase = Number(salidaSupa.cupos_disponibles ?? salidaSupa.cupos_maximos ?? 15);
          const nuevosCupos = Math.max(0, cuposBase - cant);
          const nuevoEstado = nuevosCupos === 0 ? 'Completo' : (salidaSupa.estado || 'Disponible');

          await clienteSupabaseAdmin
            .from('programacion_tours')
            .update({
              cupos_disponibles: nuevosCupos,
              estado: nuevoEstado
            })
            .eq('id', salidaSupa.id);
        }
      }
    } catch (err) {
      console.warn('Aviso al descontar cupos en Supabase:', err.message);
    }

    // 2. Actualizar en almacenamiento local si existe
    let locales = leerLocal(rutaArchivoProgLocal);
    const salidaLocal = locales.find((s) => {
      const matchTour = String(s.tour_id) === tourIdStr || (tourIdInt && String(s.tour_id) === String(tourIdInt));
      const matchFecha = String(s.fecha || '').split('T')[0].split(' ')[0].trim() === fechaNorm;
      const matchHora = this.normalizarHora(s.hora_inicio || s.horaInicio) === horaNorm;
      return matchTour && matchFecha && matchHora;
    });

    if (salidaLocal) {
      salidaLocal.cupos_disponibles = Math.max(0, (salidaLocal.cupos_disponibles ?? salidaLocal.cupos_maximos ?? 15) - cant);
      if (salidaLocal.cupos_disponibles === 0) {
        salidaLocal.estado = 'Completo';
      }
      guardarLocal(rutaArchivoProgLocal, locales);
    }
  }

  /**
   * Generar horarios predeterminados para tours que aún no tengan programación explícita.
   */
  generarSalidasPorDefecto(tourId) {
    const salidas = [];
    const hoy = new Date();

    // Generar para los próximos 14 días
    for (let i = 1; i <= 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];

      // Salida matutina
      salidas.push({
        id: `def-${tourId}-${fechaStr}-1`,
        tour_id: tourId,
        guia_id: null,
        fecha: fechaStr,
        hora_inicio: '09:00:00',
        cupos_maximos: 15,
        cupos_disponibles: 10 + (i % 5),
        estado: 'Disponible'
      });

      // Salida vespertina
      salidas.push({
        id: `def-${tourId}-${fechaStr}-2`,
        tour_id: tourId,
        guia_id: null,
        fecha: fechaStr,
        hora_inicio: '14:00:00',
        cupos_maximos: 15,
        cupos_disponibles: 8 + (i % 7),
        estado: 'Disponible'
      });

      // Salida de fin de semana tarde/noche (sábado o domingo)
      if (fecha.getDay() === 0 || fecha.getDay() === 6) {
        salidas.push({
          id: `def-${tourId}-${fechaStr}-3`,
          tour_id: tourId,
          guia_id: null,
          fecha: fechaStr,
          hora_inicio: '18:00:00',
          cupos_maximos: 12,
          cupos_disponibles: (i % 2 === 0) ? 0 : 4,
          estado: (i % 2 === 0) ? 'Completo' : 'Disponible'
        });
      }
    }

    return salidas;
  }
}

module.exports = new PaquetesToursServicio();
