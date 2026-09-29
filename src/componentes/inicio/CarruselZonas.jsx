import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';

const ZONAS_BOGOTA = [
  {
    id: 'candelaria',
    titulo: 'La Candelaria',
    subtitulo: 'Centro Histórico · 3-4 h',
    filtro: 'Candelaria',
    imagen: 'https://images.unsplash.com/photo-1715503052107-34c1ec2ec84a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'monserrate',
    titulo: 'Monserrate & Cerros',
    subtitulo: 'Miradores & Naturaleza',
    filtro: 'Monserrate',
    imagen: 'https://images.unsplash.com/photo-1681145553148-14ad720913c1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'usaquen',
    titulo: 'Usaquén Colonial',
    subtitulo: 'Gastronomía & Mercados',
    filtro: 'Usaquén',
    imagen: 'https://images.unsplash.com/photo-1677472914929-d25a4e851f7a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'graffiti',
    titulo: 'Distrito Graffiti',
    subtitulo: 'Arte Urbano · Puente Aranda',
    filtro: 'Graffiti',
    imagen: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'chicaque',
    titulo: 'Bosques de Niebla',
    subtitulo: 'Ecoturismo & Páramo',
    filtro: 'Niebla',
    imagen: 'https://images.unsplash.com/photo-1674558350402-84bf8cee7c2a?auto=format&fit=crop&w=400&q=80'
  }
];

export const CarruselZonas = ({ alSeleccionarZona }) => {
  const contenedorRef = useRef(null);

  const desplazar = (direccion) => {
    if (contenedorRef.current) {
      const cantidad = direccion === 'izquierda' ? -300 : 300;
      contenedorRef.current.scrollBy({ left: cantidad, behavior: 'smooth' });
    }
  };

  return (
    <section id="zonas-bogota" style={{ padding: '2rem 0' }}>
      <div className="contenedor">
        {/* Cabecera del carrusel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Continúa tu búsqueda
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--texto-principal)', marginTop: '0.2rem' }}>
              Te puede interesar en Bogotá
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => desplazar('izquierda')}
              className="boton boton-contorno"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => desplazar('derecha')}
              className="boton boton-contorno"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Contenedor desplazable */}
        <div
          ref={contenedorRef}
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            scrollbarWidth: 'none'
          }}
        >
          {ZONAS_BOGOTA.map((zona) => (
            <div
              key={zona.id}
              onClick={() => alSeleccionarZona(zona.filtro)}
              className="tarjeta-zona-muisca"
              style={{
                minWidth: '260px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.65rem 1rem 0.65rem 0.65rem',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: 'var(--borde-sutil)'
                }}
              >
                <img
                  src={zona.imagen}
                  alt={zona.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-secundario)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Paquetes
                </span>
                <strong style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--texto-principal)', margin: '1px 0' }}>
                  {zona.titulo}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                  {zona.subtitulo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
