import React from 'react';
import { Loader2 } from 'lucide-react';

export const Cargando = ({ mensaje = 'Cargando información...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        color: '#9ca3af'
      }}
    >
      <Loader2 size={36} color="#0ea5e9" style={{ animation: 'girar 1s linear infinite' }} />
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{mensaje}</p>
      <style>{`
        @keyframes girar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
