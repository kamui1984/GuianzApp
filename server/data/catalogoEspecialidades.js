/**
 * Catálogo Maestro de Especialidades de GuianzApp
 * 4 Categorías Macro con sus respectivas subcategorías y descripciones de ayuda.
 */
const ESPECIALIDADES_CATALOGO = [
  // Categoría 1: Historia, Patrimonio y Cultura Urbana 🏛️
  {
    id: 1,
    categoria_macro: 'Historia, Patrimonio y Cultura Urbana',
    subcategoria: 'Centros Históricos y Localidades (La Candelaria, Teusaquillo, Usaquén)',
    descripcion_ayuda: 'La Candelaria, Teusaquillo, Usaquén Histórico, arquitectura y calles coloniales.',
    icono: '🏛️'
  },
  {
    id: 2,
    categoria_macro: 'Historia, Patrimonio y Cultura Urbana',
    subcategoria: 'Arquitectura y Monumentos (Colonial, Barroco, Republicano, Moderno)',
    descripcion_ayuda: 'Época colonial, Barroco neogranadino, Periodo republicano, Arquitectura moderna y contemporánea.',
    icono: '🏛️'
  },
  {
    id: 3,
    categoria_macro: 'Historia, Patrimonio y Cultura Urbana',
    subcategoria: 'Historia, Antropología y Arqueología (Museos, Mitos, Precolombino)',
    descripcion_ayuda: 'Museos (Oro, Nacional, Botero, MAMU), mitos, leyendas y herencia precolombina/ancestral.',
    icono: '🏛️'
  },
  {
    id: 4,
    categoria_macro: 'Historia, Patrimonio y Cultura Urbana',
    subcategoria: 'Arte Urbano, Graffiti y Contracultura',
    descripcion_ayuda: 'Distritos de arte (Distrito Graffiti, Calle 26, Chapinero), muralismo y contracultura.',
    icono: '🏛️'
  },
  {
    id: 5,
    categoria_macro: 'Historia, Patrimonio y Cultura Urbana',
    subcategoria: 'Turismo Religioso y Miradores (Monserrate, Guadalupe, Iglesias)',
    descripcion_ayuda: 'Monserrate, Guadalupe, Iglesias coloniales del centro, Septimazo.',
    icono: '🏛️'
  },

  // Categoría 2: Gastronomía, Estilo de Vida y Entretenimiento ☕
  {
    id: 6,
    categoria_macro: 'Gastronomía, Estilo de Vida y Entretenimiento',
    subcategoria: 'Cafés de Especialidad y Catas de Barismo',
    descripcion_ayuda: 'Rutas de cafés premium (estilo Quinta Camacho o Chapinero), barismo y procesos del café.',
    icono: '☕'
  },
  {
    id: 7,
    categoria_macro: 'Gastronomía, Estilo de Vida y Entretenimiento',
    subcategoria: 'Plazas de Mercado, Frutas Tropicales y Comida Tradicional',
    descripcion_ayuda: 'Paloquemao, La Perseverancia, El Restrepo (catas de jugos, frutas exóticas, comida tradicional).',
    icono: '☕'
  },
  {
    id: 8,
    categoria_macro: 'Gastronomía, Estilo de Vida y Entretenimiento',
    subcategoria: 'Alta Cocina, Zonas Gourmet y Rutas Gastronómicas',
    descripcion_ayuda: 'Zonas Gourmet (Zona G, Zona T, Usaquén, Quinta Camacho), cocina fusión y de autor.',
    icono: '☕'
  },
  {
    id: 9,
    categoria_macro: 'Gastronomía, Estilo de Vida y Entretenimiento',
    subcategoria: 'Vida Nocturna, Rumba, Bares de Salsa, Cerveza Artesanal y Tejo',
    descripcion_ayuda: 'Andrés Carne de Res, rumba en la Zona T / Chapinero, bares de salsa, clubes de tejo (deporte nacional) y destilerías locales/cerveza artesanal.',
    icono: '☕'
  },
  {
    id: 10,
    categoria_macro: 'Gastronomía, Estilo de Vida y Entretenimiento',
    subcategoria: 'Compras, Mercados de Pulgas y Artesanías',
    descripcion_ayuda: 'Mercados de pulgas (Usaquén, San Alejo), centros comerciales, pasajes artesanales y diseño independiente.',
    icono: '☕'
  },

  // Categoría 3: Naturaleza, Biodiversidad y Aventura 🥾
  {
    id: 11,
    categoria_macro: 'Naturaleza, Biodiversidad y Aventura',
    subcategoria: 'Senderismo y Montañismo (Cerros Orientales, Páramos, Chicaque)',
    descripcion_ayuda: 'Cerros Orientales (Quebrada La Vieja, Las Delicias, Vicachá), Chingaza, Páramo de Cruz Verde, Chicaque, la Chorrera, Matarredonda.',
    icono: '🥾'
  },
  {
    id: 12,
    categoria_macro: 'Naturaleza, Biodiversidad y Aventura',
    subcategoria: 'Avistamiento de Aves y Reconocimiento de Humedales',
    descripcion_ayuda: 'Humedales de Bogotá (Santa María del Lago, La Conejera), Observatorio de Colibríes.',
    icono: '🥾'
  },
  {
    id: 13,
    categoria_macro: 'Naturaleza, Biodiversidad y Aventura',
    subcategoria: 'Turismo de Aventura, Escalada, Ciclomontañismo y Espeleología',
    descripcion_ayuda: 'Espeleología, escalada en roca (Suesca/cercanías), ciclomontañismo.',
    icono: '🥾'
  },
  {
    id: 14,
    categoria_macro: 'Naturaleza, Biodiversidad y Aventura',
    subcategoria: 'Biciturismo Urbano y Ciclovía dominical',
    descripcion_ayuda: 'Recorridos en bicicleta por la infraestructura de la ciudad y planes de domingo en la Ciclovía.',
    icono: '🥾'
  },
  {
    id: 15,
    categoria_macro: 'Naturaleza, Biodiversidad y Aventura',
    subcategoria: 'Bienestar, Conexión Natural, Termales y Baños de Bosque',
    descripcion_ayuda: 'Retiros, termales (cercanías), meditación y baños de bosque.',
    icono: '🥾'
  },

  // Categoría 4: Turismo Comunitario, Social y Rural 🌍
  {
    id: 16,
    categoria_macro: 'Turismo Comunitario, Social y Rural',
    subcategoria: 'Transformación Social y Muralismo Comunitario (Ciudad Bolívar, San Cristóbal)',
    descripcion_ayuda: 'Ciudad Bolívar (TransMiCable, El Paraíso), San Cristóbal (Ruta del Fucha, experiencias del vidrio).',
    icono: '🌍'
  },
  {
    id: 17,
    categoria_macro: 'Turismo Comunitario, Social y Rural',
    subcategoria: 'Turismo de Memoria, Paz y Reconciliación',
    descripcion_ayuda: 'Centro de Memoria, Fragmentos, recorridos históricos sobre el conflicto y la resiliencia urbana.',
    icono: '🌍'
  },
  {
    id: 18,
    categoria_macro: 'Turismo Comunitario, Social y Rural',
    subcategoria: 'Cultura Campesina, Ruralidad y Huertas Urbanas (Usme, Sumapaz)',
    descripcion_ayuda: 'Usme Rural (Ruta de la fresa, necrópolis arqueológica), Sumapaz agropecuario, huertas urbanas comunitarias.',
    icono: '🌍'
  },
  {
    id: 19,
    categoria_macro: 'Turismo Comunitario, Social y Rural',
    subcategoria: 'Etnografía, Saberes Ancestrales y Medicina Tradicional',
    descripcion_ayuda: 'Experiencias con comunidades indígenas de la ciudad, medicina tradicional y tejidos.',
    icono: '🌍'
  }
];

const AGRUPACION_CATEGORIAS = [
  {
    nombre: 'Historia, Patrimonio y Cultura Urbana',
    icono: '🏛️',
    descripcion: 'Ideal para agencias que venden City Tours clásicos, caminatas históricas o rutas de arte urbano.'
  },
  {
    nombre: 'Gastronomía, Estilo de Vida y Entretenimiento',
    icono: '☕',
    descripcion: 'Para agencias que venden experiencias sensoriales, Bogotá de noche, compras o inmersión local.'
  },
  {
    nombre: 'Naturaleza, Biodiversidad y Aventura',
    icono: '🥾',
    descripcion: 'Para agencias enfocadas en turismo activo, ecoturismo y deportes al aire libre en la periferia o cerros.'
  },
  {
    nombre: 'Turismo Comunitario, Social y Rural',
    icono: '🌍',
    descripcion: 'Para agencias que venden turismo de impacto, experiencias inmersivas humanas y relatos de resiliencia.'
  }
];

module.exports = {
  ESPECIALIDADES_CATALOGO,
  AGRUPACION_CATEGORIAS
};
