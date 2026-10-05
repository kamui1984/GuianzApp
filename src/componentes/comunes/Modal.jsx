import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ abierto, alCerrar, titulo, children, anchoMaximo = '600px' }) => {
  const refFondoMouseDown = useRef(false);

  useEffect(() => {
    const alPresionarEscape = (e) => {
      if (e.key === 'Escape' && abierto) alCerrar();
    };
    window.addEventListener('keydown', alPresionarEscape);
    if (abierto) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', alPresionarEscape);
      document.body.style.overflow = 'auto';
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  const manejarMouseDownFondo = (e) => {
    // Registra que el mousedown ocurrió estrictamente sobre el fondo oscuro
    refFondoMouseDown.current = e.target === e.currentTarget;
  };

  const manejarMouseUpFondo = (e) => {
    // Solo cierra si tanto mousedown como mouseup ocurrieron en el fondo oscuro
    // Evita cerrar el modal si el usuario arrastró para seleccionar texto en un input
    if (refFondoMouseDown.current && e.target === e.currentTarget) {
      alCerrar();
    }
    refFondoMouseDown.current = false;
  };

  return (
    <div
      className="modal-overlay-movil"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(23, 74, 91, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onMouseDown={manejarMouseDownFondo}
      onMouseUp={manejarMouseUpFondo}
    >
      <div
        className="animar-aparicion modal-contenido-movil"
        style={{
          width: '100%',
          maxWidth: anchoMaximo,
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--borde-sutil)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(23, 74, 91, 0.25)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--borde-sutil)',
            backgroundColor: 'var(--fondo-secundario)'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primario)' }}>{titulo}</h3>
          <button
            onClick={alCerrar}
            style={{
              background: 'var(--color-primario-claro)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--color-primario)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>{children}</div>
      </div>
    </div>
  );
};
