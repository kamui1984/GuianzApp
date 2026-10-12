const fs = require('fs');
const path = require('path');
const { clienteSupabaseAdmin } = require('../config/supabase');
const { ESPECIALIDADES_CATALOGO, AGRUPACION_CATEGORIAS } = require('../data/catalogoEspecialidades');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoDinamico = path.join(rutaDirectorioData, 'catalogo_especialidades_dinamico.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

const leerCatalogoDinamico = () => {
  try {
    if (fs.existsSync(rutaArchivoDinamico)) {
      const contenido = fs.readFileSync(rutaArchivoDinamico, 'utf8');
      const datos = JSON.parse(contenido || '[]');
      if (Array.isArray(datos) && datos.length > 0) return datos;
    }
  } catch (error) {
    console.warn('Error al leer catalogo_especialidades_dinamico.json:', error.message);
  }
  // Inicializar a partir del catálogo semilla oficial
  const inicial = ESPECIALIDADES_CATALOGO.map((item) => ({
    ...item,
    activo: item.activo !== false
  }));
  guardarCatalogoDinamico(inicial);
  return inicial;
};

const guardarCatalogoDinamico = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoDinamico, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar catalogo_especialidades_dinamico.json:', error.message);
  }
};

/**
 * Servicio para consultar y gestionar el catálogo común y transversal de especialidades turísticas.
 */
class EspecialidadesServicio {
  /**
   * Obtiene la lista de especialidades activas para agencias y guías.
   */
  async obtenerEspecialidades() {
    const listaCompleta = await this.obtenerTodasParaAdmin();
    // Para el público general y prestadores, solo devolver activas
    return listaCompleta.filter((item) => item.activo !== false);
  }

  /**
   * Obtiene la lista completa de especialidades (activas e inactivas) para el administrador.
   */
  async obtenerTodasParaAdmin() {
    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('especialidades')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return this.enriquecerConMetadatos(data);
      }
    } catch (e) {
      // Continuar con almacenamiento dinámico local
    }

    const local = leerCatalogoDinamico();
    return this.enriquecerConMetadatos(local);
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
          icono: item.icono || '📍',
          descripcion: '',
          especialidades: []
        };
      }
      mapa[item.categoria_macro].especialidades.push(item);
    });

    return Object.values(mapa);
  }

  /**
   * Crea una nueva especialidad asegurando que no existan duplicados.
   */
  async crearEspecialidad({ categoria_macro, subcategoria, descripcion_ayuda = '', icono = '📍' }) {
    if (!categoria_macro || !subcategoria) {
      throw new Error('La macro categoría y el nombre de la especialidad son obligatorios.');
    }

    const subcategoriaNorm = subcategoria.trim().toLowerCase();
    const categoriaNorm = categoria_macro.trim().toLowerCase();

    const lista = leerCatalogoDinamico();

    // Validar duplicado
    const existe = lista.some(
      (item) =>
        (item.subcategoria || '').trim().toLowerCase() === subcategoriaNorm &&
        (item.categoria_macro || '').trim().toLowerCase() === categoriaNorm
    );

    if (existe) {
      throw new Error(`La especialidad "${subcategoria}" ya existe dentro de la categoría "${categoria_macro}".`);
    }

    const nuevoId = lista.length > 0 ? Math.max(...lista.map((i) => Number(i.id) || 0)) + 1 : 1;

    const nueva = {
      id: nuevoId,
      categoria_macro: categoria_macro.trim(),
      subcategoria: subcategoria.trim(),
      descripcion_ayuda: descripcion_ayuda.trim(),
      icono: icono || '📍',
      activo: true,
      creado_en: new Date().toISOString()
    };

    lista.push(nueva);
    guardarCatalogoDinamico(lista);

    try {
      await clienteSupabaseAdmin.from('especialidades').insert({
        categoria_macro: nueva.categoria_macro,
        subcategoria: nueva.subcategoria,
        descripcion_ayuda: nueva.descripcion_ayuda,
        icono: nueva.icono,
        activo: true
      });
    } catch (e) {
      // Fallback
    }

    return nueva;
  }

  /**
   * Actualiza el nombre, descripción o icono de una especialidad existente.
   */
  async actualizarEspecialidad(id, { categoria_macro, subcategoria, descripcion_ayuda, icono, activo }) {
    const lista = leerCatalogoDinamico();
    const indice = lista.findIndex((item) => String(item.id) === String(id));

    if (indice === -1) {
      throw new Error('Especialidad no encontrada.');
    }

    // Si se cambia el nombre o la categoría, verificar duplicado contra otros
    if (subcategoria || categoria_macro) {
      const nuevaSub = (subcategoria || lista[indice].subcategoria).trim().toLowerCase();
      const nuevaCat = (categoria_macro || lista[indice].categoria_macro).trim().toLowerCase();

      const duplicado = lista.some(
        (item) =>
          String(item.id) !== String(id) &&
          (item.subcategoria || '').trim().toLowerCase() === nuevaSub &&
          (item.categoria_macro || '').trim().toLowerCase() === nuevaCat
      );

      if (duplicado) {
        throw new Error(`Ya existe otra especialidad con el nombre "${subcategoria}" en esa categoría.`);
      }
    }

    const actual = lista[indice];
    const actualizada = {
      ...actual,
      categoria_macro: categoria_macro ? categoria_macro.trim() : actual.categoria_macro,
      subcategoria: subcategoria ? subcategoria.trim() : actual.subcategoria,
      descripcion_ayuda: descripcion_ayuda !== undefined ? descripcion_ayuda.trim() : actual.descripcion_ayuda,
      icono: icono || actual.icono,
      activo: activo !== undefined ? Boolean(activo) : actual.activo,
      actualizado_en: new Date().toISOString()
    };

    lista[indice] = actualizada;
    guardarCatalogoDinamico(lista);

    try {
      await clienteSupabaseAdmin
        .from('especialidades')
        .update({
          categoria_macro: actualizada.categoria_macro,
          subcategoria: actualizada.subcategoria,
          descripcion_ayuda: actualizada.descripcion_ayuda,
          icono: actualizada.icono,
          activo: actualizada.activo
        })
        .eq('id', id);
    } catch (e) {
      // Fallback
    }

    return actualizada;
  }

  /**
   * Cambia el estado de activación de una especialidad.
   */
  async cambiarEstadoEspecialidad(id, activo) {
    return this.actualizarEspecialidad(id, { activo: Boolean(activo) });
  }

  /**
   * Enriquecer registros de especialidades con iconos y descripciones.
   */
  enriquecerConMetadatos(registros) {
    const mapaSemilla = new Map(ESPECIALIDADES_CATALOGO.map((item) => [String(item.id), item]));
    const mapaPorNombre = new Map(ESPECIALIDADES_CATALOGO.map((item) => [(item.subcategoria || '').toLowerCase(), item]));

    return registros.map((r) => {
      const semilla = mapaSemilla.get(String(r.id)) || mapaPorNombre.get((r.subcategoria || '').toLowerCase());
      return {
        id: r.id,
        categoria_macro: r.categoria_macro || semilla?.categoria_macro || 'General',
        subcategoria: r.subcategoria || semilla?.subcategoria || '',
        descripcion_ayuda: r.descripcion_ayuda || semilla?.descripcion_ayuda || '',
        icono: r.icono || semilla?.icono || '📍',
        activo: r.activo !== false
      };
    });
  }
}

module.exports = new EspecialidadesServicio();
