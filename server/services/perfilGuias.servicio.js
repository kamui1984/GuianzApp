const fs = require('fs');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { ESPECIALIDADES_CATALOGO } = require('../data/catalogoEspecialidades');
const { obtenerUrlFirmada } = require('./almacenamiento.servicio');
const { obtenerMetaPerfil, guardarMetaPerfil } = require('./perfilesMeta.servicio');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoGuiasLocal = path.join(rutaDirectorioData, 'perfil_guias.json');
const rutaArchivoGuiaEspLocal = path.join(rutaDirectorioData, 'guia_especialidades.json');

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
 * Servicio para gestionar la tabla perfil_guias y sus especialidades asociadas.
 */
class PerfilGuiasServicio {
  /**
   * Obtiene el perfil completo de un guía por su usuario_id (Auth UUID) o por id numérico.
   */
  async obtenerPorUsuarioId(usuarioId) {
    // 1. Intentar consultar en Supabase
    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('perfil_guias')
        .select('*')
        .or(`usuario_id.eq.${usuarioId},tarjeta_profesional.eq.${usuarioId}`)
        .maybeSingle();

      if (data) {
        const especialidadesIds = await this.obtenerEspecialidadesIdsGuia(data.id, usuarioId);
        return this.enriquecerPerfilGuia(data, especialidadesIds);
      }
    } catch (err) {
      // Supabase table might not exist yet
    }

    // 2. Intentar buscar en almacenamiento local
    const guiasLocales = leerLocal(rutaArchivoGuiasLocal);
    const guiaLocal = guiasLocales.find((g) => g.usuario_id === usuarioId || g.id === usuarioId);
    if (guiaLocal) {
      try {
        const { data: pDb } = await clienteSupabaseAdmin
          .from('perfiles')
          .select('estado')
          .eq('id', guiaLocal.usuario_id || usuarioId)
          .maybeSingle();
        if (pDb?.estado) {
          guiaLocal.estado = pDb.estado;
        }
      } catch (e) {
        // Continuar
      }
      const especialidadesIds = await this.obtenerEspecialidadesIdsGuia(guiaLocal.id, usuarioId);
      return this.enriquecerPerfilGuia(guiaLocal, especialidadesIds);
    }

    // 3. Fallback: buscar en la tabla perfiles (compatibilidad retroactiva)
    try {
      const { data: perfilLegacy } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('*')
        .eq('id', usuarioId)
        .single();

      if (perfilLegacy && (perfilLegacy.rol === 'guia' || perfilLegacy.nombre_completo)) {
        const perfilMigrado = {
          id: perfilLegacy.id,
          usuario_id: perfilLegacy.id,
          nombre_completo: perfilLegacy.nombre_completo || 'Guía Turístico',
          tarjeta_profesional: perfilLegacy.numero_rnt || '',
          telefono_principal: '',
          tiene_whatsapp: true,
          telefono_alternativo: '',
          contacto_emergencia_nombre: 'Familiar allegado',
          contacto_emergencia_tel: '',
          reseña_corta: 'Guía profesional certificado en recorridos de Bogotá.',
          experiencia_detalle: 'Experiencia en patrimonio cultural, museos y turismo urbano.',
          competencias_tec: 'Primeros auxilios y manejo de grupos.',
          idiomas: perfilLegacy.idiomas || 'Español',
          estado: perfilLegacy.estado || 'aprobado',
          ruta_documento_rnt: perfilLegacy.ruta_documento_rnt || null,
          ruta_tarjeta_profesional: perfilLegacy.ruta_tarjeta_profesional || null,
          creado_en: perfilLegacy.creado_en || new Date().toISOString()
        };

        const especialidadesIds = this.inferirEspecialidadesDesdeTexto(perfilLegacy.especialidades);
        return this.enriquecerPerfilGuia(perfilMigrado, especialidadesIds);
      }
    } catch (err) {
      // No encontrado
    }

    return null;
  }

  /**
   * Obtiene los IDs de especialidades seleccionadas por un guía.
   */
  async obtenerEspecialidadesIdsGuia(guiaId, usuarioId) {
    try {
      const { data } = await clienteSupabaseAdmin
        .from('guia_especialidades')
        .select('especialidad_id')
        .eq('guia_id', guiaId);

      if (data && data.length > 0) {
        return data.map((d) => Number(d.especialidad_id));
      }
    } catch (err) {
      // Continuar con local
    }

    const pivotLocales = leerLocal(rutaArchivoGuiaEspLocal);
    const coincidencias = pivotLocales.filter((p) => p.guia_id === guiaId || p.usuario_id === usuarioId);
    return coincidencias.map((p) => Number(p.especialidad_id));
  }

  /**
   * Guarda o actualiza el perfil del guía y sus etiquetas de especialidad.
   */
  async guardarOActualizarPerfil(usuarioId, datosPerfil, especialidadesIds = []) {
    const idsNumericos = (especialidadesIds || []).map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0);

    const registro = {
      usuario_id: usuarioId,
      nombre_completo: datosPerfil.nombre_completo || datosPerfil.nombreCompleto || 'Guía Profesional',
      tarjeta_profesional: (datosPerfil.tarjeta_profesional || datosPerfil.tarjetaProfesional || datosPerfil.numeroRnt || '').trim(),
      telefono_principal: datosPerfil.telefono_principal || datosPerfil.telefonoPrincipal || '',
      tiene_whatsapp: datosPerfil.tiene_whatsapp ?? datosPerfil.tieneWhatsapp ?? true,
      telefono_alternativo: datosPerfil.telefono_alternativo || datosPerfil.telefonoAlternativo || '',
      contacto_emergencia_nombre: datosPerfil.contacto_emergencia_nombre || datosPerfil.contactoEmergenciaNombre || 'Contacto Familiar',
      contacto_emergencia_tel: datosPerfil.contacto_emergencia_tel || datosPerfil.contactoEmergenciaTel || '',
      reseña_corta: (datosPerfil.reseña_corta || datosPerfil.resenaCorta || datosPerfil.reseñaCorta || '').slice(0, 300),
      experiencia_detalle: datosPerfil.experiencia_detalle || datosPerfil.experienciaDetalle || '',
      competencias_tec: datosPerfil.competencias_tec || datosPerfil.competenciasTec || '',
      idiomas: datosPerfil.idiomas || 'Español',
      estado: datosPerfil.estado || 'aprobado'
    };

    if (datosPerfil.ruta_documento_rnt) registro.ruta_documento_rnt = datosPerfil.ruta_documento_rnt;
    if (datosPerfil.ruta_tarjeta_profesional) registro.ruta_tarjeta_profesional = datosPerfil.ruta_tarjeta_profesional;
    if (datosPerfil.ruta_foto_rostro) registro.ruta_foto_rostro = datosPerfil.ruta_foto_rostro;

    // 1. Guardar en Supabase perfil_guias
    let guiaIdGuardado = null;
    try {
      // Verificar si ya existe registro por usuario_id
      const { data: existente } = await clienteSupabaseAdmin
        .from('perfil_guias')
        .select('id')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (existente) {
        const { data: actualizado } = await clienteSupabaseAdmin
          .from('perfil_guias')
          .update(registro)
          .eq('id', existente.id)
          .select()
          .single();
        guiaIdGuardado = actualizado.id;
      } else {
        const { data: insertado } = await clienteSupabaseAdmin
          .from('perfil_guias')
          .insert(registro)
          .select()
          .single();
        guiaIdGuardado = insertado.id;
      }

      // Actualizar guia_especialidades en Supabase
      if (guiaIdGuardado && idsNumericos.length >= 0) {
        await clienteSupabaseAdmin
          .from('guia_especialidades')
          .delete()
          .eq('guia_id', guiaIdGuardado);

        if (idsNumericos.length > 0) {
          const filasPivote = idsNumericos.map((espId) => ({
            guia_id: guiaIdGuardado,
            especialidad_id: espId
          }));
          await clienteSupabaseAdmin.from('guia_especialidades').insert(filasPivote);
        }
      }
    } catch (err) {
      console.warn('Advertencia guardando en Supabase perfil_guias:', err.message);
    }

    // 2. Guardar en almacenamiento local como respaldo garantizado
    const guiasLocales = leerLocal(rutaArchivoGuiasLocal);
    const indice = guiasLocales.findIndex((g) => g.usuario_id === usuarioId);
    const idLocal = guiaIdGuardado || (indice >= 0 ? guiasLocales[indice].id : guiasLocales.length + 1);

    const objetoCompleto = {
      ...registro,
      id: idLocal,
      actualizado_en: new Date().toISOString()
    };

    if (indice >= 0) {
      guiasLocales[indice] = objetoCompleto;
    } else {
      guiasLocales.push(objetoCompleto);
    }
    guardarLocal(rutaArchivoGuiasLocal, guiasLocales);

    // Guardar pivote local
    let pivotLocales = leerLocal(rutaArchivoGuiaEspLocal);
    pivotLocales = pivotLocales.filter((p) => p.guia_id !== idLocal && p.usuario_id !== usuarioId);
    idsNumericos.forEach((espId) => {
      pivotLocales.push({
        guia_id: idLocal,
        usuario_id: usuarioId,
        especialidad_id: espId
      });
    });
    guardarLocal(rutaArchivoGuiaEspLocal, pivotLocales);

    // 3. Sincronizar también con tabla perfiles para no romper sesión ni auth existente
    try {
      const resumenEspecialidades = ESPECIALIDADES_CATALOGO
        .filter((e) => idsNumericos.includes(e.id))
        .map((e) => e.subcategoria)
        .join(', ');

      const datosPerfilesSync = {
        nombre_completo: registro.nombre_completo,
        numero_rnt: registro.tarjeta_profesional,
        idiomas: registro.idiomas
      };
      if (resumenEspecialidades) {
        datosPerfilesSync.especialidades = resumenEspecialidades;
      }
      if (registro.ruta_documento_rnt) datosPerfilesSync.ruta_documento_rnt = registro.ruta_documento_rnt;
      if (registro.ruta_tarjeta_profesional) datosPerfilesSync.ruta_tarjeta_profesional = registro.ruta_tarjeta_profesional;

      await clienteSupabaseAdmin
        .from('perfiles')
        .update(datosPerfilesSync)
        .eq('id', usuarioId);
    } catch (err) {
      // Ignorar si perfiles falla
    }

    return this.enriquecerPerfilGuia(objetoCompleto, idsNumericos);
  }

  /**
   * Listar todos los guías turísticos para catálogo y asignación de agencias.
   */
  async listarGuiasParaAgencias() {
    let lista = [];

    // 1. Intentar consultar desde Supabase perfil_guias
    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('perfil_guias')
        .select('*')
        .order('creado_en', { ascending: false });

      if (data && data.length > 0) {
        lista = data;
      }
    } catch (err) {
      // Continuar con perfiles y local
    }

    // 2. Fusionar con guías de la tabla perfiles que aún no estén en perfil_guias
    try {
      const { data: perfilesGuias } = await clienteSupabaseAdmin
        .from('perfiles')
        .select('*')
        .eq('rol', 'guia');

      if (perfilesGuias) {
        perfilesGuias.forEach((pg) => {
          const yaExiste = lista.some((l) => l.usuario_id === pg.id || l.tarjeta_profesional === pg.numero_rnt);
          if (!yaExiste) {
            lista.push({
              id: pg.id,
              usuario_id: pg.id,
              nombre_completo: pg.nombre_completo || 'Guía profesional',
              tarjeta_profesional: pg.numero_rnt || '',
              telefono_principal: '',
              tiene_whatsapp: true,
              telefono_alternativo: '',
              contacto_emergencia_nombre: 'Contacto familiar',
              contacto_emergencia_tel: '',
              reseña_corta: 'Guía profesional verificado en Bogotá.',
              experiencia_detalle: 'Experiencia en recorridos históricos, culturales y naturales.',
              competencias_tec: 'Primeros auxilios y orientación en ciudad.',
              idiomas: pg.idiomas || 'Español',
              estado: pg.estado || 'aprobado',
              ruta_documento_rnt: pg.ruta_documento_rnt || null,
              ruta_tarjeta_profesional: pg.ruta_tarjeta_profesional || null,
              especialidadesLegacy: pg.especialidades,
              creado_en: pg.creado_en
            });
          }
        });
      }
    } catch (err) {
      // Continuar
    }

    // Si aún está vacía, leer local
    if (lista.length === 0) {
      lista = leerLocal(rutaArchivoGuiasLocal);
    }

    // Enriquecer cada guía con sus especialidades e imágenes
    const resultado = await Promise.all(
      lista.map(async (g) => {
        const idGuia = g.id;
        const usuarioId = g.usuario_id || g.id;
        let espIds = await this.obtenerEspecialidadesIdsGuia(idGuia, usuarioId);

        if (espIds.length === 0 && g.especialidadesLegacy) {
          espIds = this.inferirEspecialidadesDesdeTexto(g.especialidadesLegacy);
        }

        return this.enriquecerPerfilGuia(g, espIds);
      })
    );

    return resultado;
  }

  /**
   * Enriquecer los datos del guía con URLs firmadas, objetos de especialidad y link a WhatsApp.
   */
  async enriquecerPerfilGuia(guia, especialidadesIds = []) {
    const usuarioId = guia.usuario_id || guia.id;
    const meta = obtenerMetaPerfil(usuarioId);

    const rutaFoto = guia.ruta_foto_rostro || meta.rutaFotoRostro;
    const urlFotoRostro = rutaFoto ? await obtenerUrlFirmada('guide-documents', rutaFoto) : null;

    const urlRnt = guia.ruta_documento_rnt ? await obtenerUrlFirmada('rnt-documents', guia.ruta_documento_rnt) : null;
    const urlTarjeta = guia.ruta_tarjeta_profesional ? await obtenerUrlFirmada('guide-documents', guia.ruta_tarjeta_profesional) : null;

    const objetosEspecialidades = ESPECIALIDADES_CATALOGO.filter((e) => especialidadesIds.includes(e.id));

    // Formatear enlace a WhatsApp
    const telefonoLimpio = String(guia.telefono_principal || '').replace(/[^\d+]/g, '');
    const enlaceWhatsApp = guia.tiene_whatsapp && telefonoLimpio
      ? `https://wa.me/${telefonoLimpio.startsWith('+') ? telefonoLimpio.slice(1) : '57' + telefonoLimpio}`
      : null;

    return {
      id: guia.id,
      usuarioId: guia.usuario_id || guia.id,
      nombreCompleto: guia.nombre_completo || 'Guía profesional',
      tarjetaProfesional: guia.tarjeta_profesional || guia.numero_rnt || '',
      numeroRnt: guia.tarjeta_profesional || guia.numero_rnt || '',
      telefonoPrincipal: guia.telefono_principal || '',
      tieneWhatsapp: guia.tiene_whatsapp !== false,
      telefonoAlternativo: guia.telefono_alternativo || '',
      contactoEmergenciaNombre: guia.contacto_emergencia_nombre || '',
      contactoEmergenciaTel: guia.contacto_emergencia_tel || '',
      reseñaCorta: guia.reseña_corta || guia.resena_corta || '',
      experienciaDetalle: guia.experiencia_detalle || '',
      competenciasTec: guia.competencias_tec || '',
      idiomas: guia.idiomas || 'Español',
      estado: guia.estado || 'aprobado',
      motivoRechazo: meta.motivoRechazo || '',
      especialidadesIds,
      especialidades: objetosEspecialidades,
      enlaceWhatsApp,
      urlFotoRostro,
      urlDocumentoRnt: urlRnt,
      urlTarjetaProfesional: urlTarjeta,
      creadoEn: guia.creado_en
    };
  }

  /**
   * Algoritmo de Matching entre el paquete/tour y el perfil del guía.
   * Calcula el porcentaje y cantidad de especialidades que coinciden.
   */
  calcularMatching(guiaEspecialidadesIds = [], tourEspecialidadesIds = []) {
    const idsRequeridos = (tourEspecialidadesIds || []).map(Number);
    const idsGuia = new Set((guiaEspecialidadesIds || []).map(Number));

    if (idsRequeridos.length === 0) {
      return {
        coincidencias: 0,
        totalRequeridas: 0,
        porcentaje: 100,
        esMatchPerfecto: true,
        especialidadesCoincidentes: []
      };
    }

    const coincidentes = idsRequeridos.filter((id) => idsGuia.has(id));
    const porcentaje = Math.round((coincidentes.length / idsRequeridos.length) * 100);
    const esMatchPerfecto = coincidentes.length === idsRequeridos.length;

    const objetosCoincidentes = ESPECIALIDADES_CATALOGO.filter((e) => coincidentes.includes(e.id));

    return {
      coincidencias: coincidentes.length,
      totalRequeridas: idsRequeridos.length,
      porcentaje,
      esMatchPerfecto,
      especialidadesCoincidentes: objetosCoincidentes
    };
  }

  /**
   * Helper para deducir IDs de especialidades a partir de textos heredados.
   */
  inferirEspecialidadesDesdeTexto(texto) {
    if (!texto) return [1, 2]; // Por defecto centro histórico y arquitectura
    const t = texto.toLowerCase();
    const ids = [];

    if (t.includes('centro') || t.includes('candelaria') || t.includes('histórico')) ids.push(1);
    if (t.includes('arquitectura') || t.includes('colonial') || t.includes('monumentos')) ids.push(2);
    if (t.includes('museo') || t.includes('oro') || t.includes('arqueología')) ids.push(3);
    if (t.includes('arte') || t.includes('graffiti') || t.includes('mural')) ids.push(4);
    if (t.includes('monserrate') || t.includes('religioso') || t.includes('mirador')) ids.push(5);
    if (t.includes('café') || t.includes('barismo') || t.includes('cata')) ids.push(6);
    if (t.includes('plaza') || t.includes('mercado') || t.includes('frutas')) ids.push(7);
    if (t.includes('gastronom') || t.includes('cocina')) ids.push(8);
    if (t.includes('nocturna') || t.includes('rumba') || t.includes('tejo') || t.includes('cerveza')) ids.push(9);
    if (t.includes('compra') || t.includes('artesan')) ids.push(10);
    if (t.includes('sender') || t.includes('montaña') || t.includes('páramo') || t.includes('cerros')) ids.push(11);
    if (t.includes('ave') || t.includes('bird') || t.includes('humedal')) ids.push(12);
    if (t.includes('aventura') || t.includes('escalada') || t.includes('espeleo')) ids.push(13);
    if (t.includes('bici') || t.includes('ciclovía')) ids.push(14);
    if (t.includes('bienestar') || t.includes('termal') || t.includes('bosque')) ids.push(15);
    if (t.includes('comunitario') || t.includes('bolívar') || t.includes('social')) ids.push(16);
    if (t.includes('paz') || t.includes('memoria') || t.includes('reconciliación')) ids.push(17);
    if (t.includes('campesin') || t.includes('rural') || t.includes('usme') || t.includes('sumapaz')) ids.push(18);
    if (t.includes('ancestral') || t.includes('indígena') || t.includes('medicina')) ids.push(19);

    return ids.length > 0 ? ids : [1, 2];
  }
}

module.exports = new PerfilGuiasServicio();
