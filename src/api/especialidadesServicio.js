import { solicitarApi } from './clienteHttp';

export const servicioEspecialidades = {
  /**
   * Obtener el catálogo completo de especialidades.
   */
  obtenerEspecialidades: async () => {
    const respuesta = await solicitarApi('/api/especialidades');
    return respuesta.especialidades || [];
  },

  /**
   * Obtener especialidades agrupadas por macro categoría.
   */
  obtenerPorCategorias: async () => {
    const respuesta = await solicitarApi('/api/especialidades/categorias');
    return respuesta.categorias || [];
  }
};
