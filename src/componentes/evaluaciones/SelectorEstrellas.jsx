import React, { useState } from 'react';
import { Star } from 'lucide-react';

const SIGNIFICADOS = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Aceptable',
  4: 'Muy bueno',
  5: 'Excelente'
};

export const SelectorEstrellas = ({
  valor = 0,
  alCambiar,
  etiqueta = 'Calificación',
  descripcion = '',
  soloLectura = false,
  tamano = 26
}) => {
  const [hoverValor, setHoverValor] = useState(0);

  const puntuacionEfectiva = hoverValor || valor;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {etiqueta && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--texto-principal)' }}>
            {etiqueta}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: puntuacionEfectiva ? 'var(--color-dorado-hover)' : 'var(--texto-atenuado)'
            }}
          >
            {puntuacionEfectiva ? `${puntuacionEfectiva} ★ · ${SIGNIFICADOS[puntuacionEfectiva]}` : 'Sin calificar'}
          </span>
        </div>
      )}

      {descripcion && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
          {descripcion}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.2rem' }}>
        {[1, 2, 3, 4, 5].map((estrella) => {
          const activa = estrella <= puntuacionEfectiva;

          return (
            <button
              key={estrella}
              type="button"
              disabled={soloLectura}
              onClick={() => alCambiar && alCambiar(estrella)}
              onMouseEnter={() => !soloLectura && setHoverValor(estrella)}
              onMouseLeave={() => !soloLectura && setHoverValor(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: soloLectura ? 'default' : 'pointer',
                borderRadius: '8px',
                transition: 'transform 0.15s ease',
                transform: !soloLectura && hoverValor === estrella ? 'scale(1.2)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`${estrella} estrellas - ${SIGNIFICADOS[estrella]}`}
            >
              <Star
                size={tamano}
                fill={activa ? '#C6A15B' : 'none'}
                color={activa ? '#C6A15B' : '#9ca3af'}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
