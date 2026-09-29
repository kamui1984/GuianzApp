import React from 'react';
import { Search, MapPin, Sparkles, Compass } from 'lucide-react';

export const SeccionHero = ({ alBuscar, busqueda, alCambiarBusqueda }) => {
  return (
    <section style={{ position: 'relative', padding: '2rem 0 3rem' }}>
      <div className="contenedor">
        <div className="hero-card-muisca">
          <div
            style={{
              background: 'linear-gradient(135deg, #174A5B 0%, #17424F 60%, #1F5D50 100%)',
              borderRadius: 'calc(var(--radio-grande) - 2px)',
              color: '#FFFFFF',
              padding: 'clamp(2.5rem, 5vw, 3.5rem)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* SVG Muisca y Curvas de Nivel de Fondo */}
            <svg
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '55%',
                height: '120%',
                opacity: 0.12,
                pointerEvents: 'none'
              }}
            >
              <path d="M200 20 L360 150 L200 280 L40 150 Z" stroke="#C6A15B" strokeWidth="2.5" strokeDasharray="6 4" />
              <path d="M200 50 L320 150 L200 250 L80 150 Z" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M200 80 L280 150 L200 220 L120 150 Z" stroke="#C6A15B" strokeWidth="1.5" />
              <circle cx="200" cy="150" r="14" fill="#C6A15B" fillOpacity="0.4" />
              <path d="M0 260 C100 200 240 290 400 180" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>

            {/* Contenido */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
              {/* Etiqueta Superior */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.95rem',
                  backgroundColor: 'rgba(198, 161, 91, 0.2)',
                  border: '1px solid rgba(198, 161, 91, 0.45)',
                  borderRadius: '9999px',
                  color: '#F8E8C8',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.05em'
                }}
              >
                <Compass size={14} />
                <span>Ecosistema de Rutas & Territorio Andino · RNT</span>
              </div>

              {/* Título Principal */}
              <h1
                style={{
                  fontFamily: 'var(--fuente-titulos)',
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  marginBottom: '1rem'
                }}
              >
                Bogotá se conecta.<br />
                <span style={{ color: '#E6C57E', textShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                  Tú la descubres.
                </span>
              </h1>

              {/* Descripción */}
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  color: 'rgba(255, 255, 255, 0.92)',
                  lineHeight: 1.6,
                  marginBottom: '2rem'
                }}
              >
                Experiencias con raíces: conecta directamente con agencias locales de turismo receptivo y guías certificados con Registro Nacional de Turismo.
              </p>

              {/* Módulo de Búsqueda Flotante en Superficie Blanca */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radio-medio)',
                  padding: '0.5rem 0.65rem 0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
                  border: '1px solid #E5E0D5'
                }}
              >
                <Search size={18} color="var(--color-primario)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => alCambiarBusqueda(e.target.value)}
                  placeholder="¿Qué experiencia buscas? (Candelaria, Café, Monserrate, Páramo...)"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--texto-principal)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--fuente-cuerpo)',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={alBuscar}
                  className="boton boton-dorado"
                  style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
                >
                  Explorar Rutas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
