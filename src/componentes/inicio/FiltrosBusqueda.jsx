import React from 'react';
import { Compass, Landmark, Trees, Coffee, Palette, Mountain } from 'lucide-react';

const CATEGORIAS = [
  { id: 'todos', etiqueta: 'Todos los Paquetes', icono: <Compass size={16} /> },
  { id: 'centro', etiqueta: 'Centro & Historia', icono: <Landmark size={16} /> },
  { id: 'naturaleza', etiqueta: 'Naturaleza & Cerros', icono: <Trees size={16} /> },
  { id: 'gastronomia', etiqueta: 'Gastronomía & Café', icono: <Coffee size={16} /> },
  { id: 'arte', etiqueta: 'Arte Urbano & Graffiti', icono: <Palette size={16} /> },
  { id: 'ecoturismo', etiqueta: 'Ecoturismo & Páramo', icono: <Mountain size={16} /> }
];

export const FiltrosBusqueda = ({ categoriaSeleccionada, alCambiarCategoria, totalResultados }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primario)' }}>
            Paquetes Turísticos Disponibles
          </h2>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
            Mostrando {totalResultados} {totalResultados === 1 ? 'experiencia verificada' : 'experiencias verificadas'}
          </p>
        </div>
      </div>

      {/* Barra de pestañas de categorías */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none'
        }}
      >
        {CATEGORIAS.map((cat) => {
          const estaActivo = categoriaSeleccionada === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => alCambiarCategoria(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                backgroundColor: estaActivo ? 'var(--color-primario)' : '#FFFFFF',
                border: estaActivo ? '1px solid var(--color-primario)' : '1px solid var(--borde-sutil)',
                borderRadius: '9999px',
                color: estaActivo ? '#FFFFFF' : 'var(--texto-secundario)',
                fontSize: '0.85rem',
                fontWeight: estaActivo ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: estaActivo ? '0 2px 8px rgba(23, 74, 91, 0.25)' : '0 1px 3px rgba(30, 41, 51, 0.04)'
              }}
            >
              {cat.icono}
              <span>{cat.etiqueta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
