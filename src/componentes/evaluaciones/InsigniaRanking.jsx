import React from 'react';
import { Star } from 'lucide-react';

export const InsigniaRanking = ({
  promedio = 0,
  totalEvaluaciones = 0,
  tipo = 'tour', // 'tour' | 'guia'
  variante = 'tarjeta' // 'tarjeta' | 'detalle' | 'compacto'
}) => {
  const tieneEvaluaciones = totalEvaluaciones > 0;
  const textoPromedio = tieneEvaluaciones ? Number(promedio).toFixed(1) : 'Nuevo';

  if (variante === 'compacto') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(198, 161, 91, 0.12)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.76rem',
          fontWeight: 700,
          color: 'var(--color-dorado-hover)'
        }}
        title={tieneEvaluaciones ? `Ranking ${tipo === 'guia' ? 'del Guía' : 'del Tour'}: ${textoPromedio}/5 basado en ${totalEvaluaciones} evaluaciones` : 'Aún sin evaluaciones'}
      >
        <Star size={12} fill="#C6A15B" color="#C6A15B" />
        <span>{textoPromedio}</span>
        {tieneEvaluaciones && <span style={{ color: 'var(--texto-atenuado)' }}>({totalEvaluaciones})</span>}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--borde-sutil)',
        padding: '0.4rem 0.85rem',
        borderRadius: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: 'rgba(198, 161, 91, 0.15)',
          color: 'var(--color-dorado-hover)'
        }}
      >
        <Star size={15} fill="#C6A15B" color="#C6A15B" />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <strong style={{ fontSize: '0.92rem', color: 'var(--texto-principal)' }}>
            {textoPromedio}
          </strong>
          {tieneEvaluaciones && (
            <span style={{ fontSize: '0.74rem', color: 'var(--texto-atenuado)' }}>/ 5</span>
          )}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', display: 'block', lineHeight: 1.1 }}>
          {tieneEvaluaciones
            ? `${totalEvaluaciones} evaluación${totalEvaluaciones === 1 ? '' : 'es'}`
            : 'Sin calificaciones'}
        </span>
      </div>
    </div>
  );
};
