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
   * Obtener programación de salidas disponibles para un tour determinado.
   */
  async obtenerProgramacion(tourId) {
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

    return salidasUnicas.map((s) => ({
      id: s.id,
      tourId: s.tour_id,
      guiaId: s.guia_id || null,
      fecha: s.fecha,
      horaInicio: s.hora_inicio || s.horaInicio,
      cuposMaximos: Number(s.cupos_maximos || s.cuposMaximos || 15),
      cuposDisponibles: Number(s.cupos_disponibles ?? s.cuposDisponibles ?? s.cupos_maximos ?? s.cuposMaximos ?? 15),
      estado: s.estado || 'Disponible'
    }));
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
   */
  async descontarCupos(tourId, fecha, horaInicio, cantidadPersonas = 1) {
    const cant = Number(cantidadPersonas || 1);
    const tourIdInt = await this.resolverTourIdNumerico(tourId);
    let locales = leerLocal(rutaArchivoProgLocal);

    const salida = locales.find((s) => {
      const matchTour = String(s.tour_id) === String(tourId) || (tourIdInt && String(s.tour_id) === String(tourIdInt));
      const matchFecha = s.fecha === fecha;
      const matchHora = String(s.hora_inicio).includes(horaInicio.slice(0, 5)) || String(s.hora_inicio) === horaInicio;
      return matchTour && matchFecha && matchHora;
    });

    if (salida) {
      salida.cupos_disponibles = Math.max(0, (salida.cupos_disponibles || salida.cupos_maximos) - cant);
      if (salida.cupos_disponibles === 0) {
        salida.estado = 'Completo';
      }
      guardarLocal(rutaArchivoProgLocal, locales);

      try {
        await clienteSupabaseAdmin
          .from('programacion_tours')
          .update({
            cupos_disponibles: salida.cupos_disponibles,
            estado: salida.estado
          })
          .eq('id', salida.id);
      } catch (err) {
        // Continuar
      }
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
