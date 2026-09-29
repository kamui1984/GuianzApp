const { clienteSupabaseAdmin } = require('../config/supabase');
const { ESPECIALIDADES_CATALOGO, AGRUPACION_CATEGORIAS } = require('../data/catalogoEspecialidades');

/**
 * Servicio para consultar y gestionar el catálogo de especialidades turísticas.
 */
class EspecialidadesServicio {
  /**
   * Obtiene la lista completa de especialidades agrupadas por macro categoría.
   */
  async obtenerEspecialidades() {
    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('especialidades')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback al catálogo semilla enriquecido
        return this.enriquecerConMetadatos(ESPECIALIDADES_CATALOGO);
      }

      return this.enriquecerConMetadatos(data);
    } catch (error) {
      console.warn('Usando catálogo estático de especialidades:', error.message);
      return this.enriquecerConMetadatos(ESPECIALIDADES_CATALOGO);
    }
  }

  /**
   * Retorna las especialidades organizadas por categoría macro.
   */
  async obtenerPorCategorias() {
    const lista = await this.obtenerEspecialidades();
    const mapa = {};

    AGRUPACION_CATEGORIAS.forEach((cat) => {
      mapa[cat.nombre] = {
        nombre: cat.nombre,
        icono: cat.icono,
        descripcion: cat.descripcion,
        especialidades: []
      };
    });

    lista.forEach((item) => {
      if (!mapa[item.categoria_macro]) {
        mapa[item.categoria_macro] = {
          nombre: item.categoria_macro,
          icono: item.icono || '🏷️',
          descripcion: '',
          especialidades: []
        };
      }
      mapa[item.categoria_macro].especialidades.push(item);
    });

    return Object.values(mapa);
  }

  /**
   * Enriquecer registros de especialidades con iconos y descripciones si vienen de Supabase básico.
   */
  enriquecerConMetadatos(registros) {
    const mapaSemilla = new Map(ESPECIALIDADES_CATALOGO.map((item) => [item.id, item]));
    const mapaPorNombre = new Map(ESPECIALIDADES_CATALOGO.map((item) => [item.subcategoria.toLowerCase(), item]));

    return registros.map((r) => {
      const semilla = mapaSemilla.get(r.id) || mapaPorNombre.get((r.subcategoria || '').toLowerCase());
      return {
        id: r.id,
        categoria_macro: r.categoria_macro || semilla?.categoria_macro || 'General',
        subcategoria: r.subcategoria || semilla?.subcategoria || '',
        descripcion_ayuda: r.descripcion_ayuda || semilla?.descripcion_ayuda || '',
        icono: semilla?.icono || '📍'
      };
    });
  }
}

module.exports = new EspecialidadesServicio();
