import React from 'react';
import { ShieldCheck, MapPin, Calendar, Clock, Star, ArrowRight } from 'lucide-react';

const IMAGENES_POR_DEFECTO = [
  'https://images.unsplash.com/photo-1715503052107-34c1ec2ec84a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1681145553148-14ad720913c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1677472914929-d25a4e851f7a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551225183-94acb7d595b6?auto=format&fit=crop&w=800&q=80'
];

export const TarjetaPaquete = ({ paquete, alVerDetalles, alReservar, indice = 0 }) => {
  const urlImagen = paquete.archivos?.[0]?.url || IMAGENES_POR_DEFECTO[indice % IMAGENES_POR_DEFECTO.length];

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="tarjeta-paquete-dorada">
      {/* Imagen del Paquete */}
      <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
        <img
          src={urlImagen}
          alt={paquete.titulo}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Badge RNT */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#FFFFFF',
            color: 'var(--color-secundario)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid var(--borde-sutil)'
          }}
        >
          <ShieldCheck size={14} color="var(--color-secundario)" />
          <span>RNT: {paquete.numeroRnt || 'Validado'}</span>
        </div>

        {/* Rating simulado */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(23, 74, 91, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <Star size={13} color="#FFD480" fill="#FFD480" />
          <span>4.9</span>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Agencia & Duración */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primario)' }}>
            {paquete.nombreAgencia || 'Agencia Operadora Bogotá'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--texto-secundario)', fontSize: '0.78rem', fontWeight: 600 }}>
            <Clock size={13} color="var(--color-primario)" />
            <span>{paquete.duracion || '3.5 horas'}</span>
          </div>
        </div>

        {/* Título */}
        <h3
          style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: 'var(--texto-principal)',
            marginBottom: '0.5rem',
            lineHeight: 1.3
          }}
        >
          {paquete.titulo}
        </h3>

        {/* Descripción corta */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--texto-secundario)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {paquete.descripcion}
        </p>

        {/* Separador y Precio / Acciones al pie */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.9rem',
            borderTop: '1px solid var(--borde-sutil)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--texto-secundario)', fontWeight: 700, textTransform: 'uppercase' }}>
              Precio por persona
            </div>
            <div
              style={{
                fontFamily: 'var(--fuente-titulos)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-primario)'
              }}
            >
              {formatearPrecio(paquete.precio)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              onClick={() => alVerDetalles?.(paquete)}
              className="boton boton-contorno"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              Detalles
            </button>
            <button
              onClick={() => alReservar?.(paquete)}
              className="boton boton-primario"
              style={{ padding: '0.5rem 0.95rem', fontSize: '0.82rem' }}
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
