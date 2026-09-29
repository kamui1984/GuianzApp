const { clienteSupabaseAdmin } = require('../config/supabase');

// Caché en memoria para URLs firmadas con tiempo de expiración (TTL)
const cacheUrlsFirmadas = new Map();
const TIEMPO_VIDA_CACHE_MS = 50 * 60 * 1000; // 50 minutos (la URL dura 60 min en Supabase)

/**
 * Obtiene o genera una URL firmada con caché para optimizar el rendimiento y evitar consultas redundantes.
 * @param {string} deposito - Nombre del bucket en Supabase Storage
 * @param {string} rutaAlmacenamiento - Ruta del archivo dentro del bucket
 * @param {number} duracionSegundos - Duración de validez de la URL en segundos
 * @returns {Promise<string>}
 */
const obtenerUrlFirmada = async (deposito, rutaAlmacenamiento, duracionSegundos = 3600) => {
  if (!rutaAlmacenamiento) return null;

  const claveCache = `${deposito}:${rutaAlmacenamiento}`;
  const entradaCache = cacheUrlsFirmadas.get(claveCache);

  const ahora = Date.now();
  if (entradaCache && entradaCache.expiraEn > ahora) {
    return entradaCache.url;
  }

  try {
    const { data, error } = await clienteSupabaseAdmin.storage
      .from(deposito)
      .createSignedUrl(rutaAlmacenamiento, duracionSegundos);

    if (error) throw error;

    cacheUrlsFirmadas.set(claveCache, {
      url: data.signedUrl,
      expiraEn: ahora + TIEMPO_VIDA_CACHE_MS
    });

    return data.signedUrl;
  } catch (error) {
    console.error(`Error al generar URL firmada para ${deposito}/${rutaAlmacenamiento}:`, error.message);
    return null;
  }
};

/**
 * Sube un buffer de archivo a un bucket de Supabase.
 */
const subirArchivo = async (deposito, rutaDestino, buffer, tipoMime) => {
  const { data, error } = await clienteSupabaseAdmin.storage
    .from(deposito)
    .upload(rutaDestino, buffer, {
      contentType: tipoMime,
      upsert: false
    });

  if (error) throw error;
  return data;
};

/**
 * Elimina uno o más archivos de un bucket de Supabase.
 */
const eliminarArchivos = async (deposito, rutasAlmacenamiento) => {
  if (!rutasAlmacenamiento || rutasAlmacenamiento.length === 0) return;
  const { error } = await clienteSupabaseAdmin.storage
    .from(deposito)
    .remove(rutasAlmacenamiento);

  if (error) {
    console.error(`Error al eliminar archivos de ${deposito}:`, error.message);
  }

  // Limpiar caché
  for (const ruta of rutasAlmacenamiento) {
    cacheUrlsFirmadas.delete(`${deposito}:${ruta}`);
  }
};

module.exports = {
  obtenerUrlFirmada,
  subirArchivo,
  eliminarArchivos
};
