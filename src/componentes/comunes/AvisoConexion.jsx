import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const AvisoConexion = () => {
  const [estaEnLinea, setEstaEnLinea] = useState(navigator.onLine);
  const [mostrarReconexion, setMostrarReconexion] = useState(false);

  useEffect(() => {
    const alConectar = () => {
      setEstaEnLinea(true);
      setMostrarReconexion(true);
      const timer = setTimeout(() => setMostrarReconexion(false), 3500);
      return () => clearTimeout(timer);
    };

    const alDesconectar = () => {
      setEstaEnLinea(false);
      setMostrarReconexion(false);
    };

    window.addEventListener('online', alConectar);
    window.addEventListener('offline', alDesconectar);

    return () => {
      window.removeEventListener('online', alConectar);
      window.removeEventListener('offline', alDesconectar);
    };
  }, []);

  if (estaEnLinea && !mostrarReconexion) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="animar-aparicion"
      style={{
        position: 'fixed',
        top: '74px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        backgroundColor: estaEnLinea ? 'var(--color-exito)' : '#991B1B',
        color: '#FFFFFF',
        padding: '0.45rem 1rem',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        pointerEvents: 'none'
      }}
    >
      {estaEnLinea ? (
        <>
          <Wifi size={15} />
          <span>Conexión restablecida</span>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>Modo sin conexión · Navegando datos guardados</span>
        </>
      )}
    </div>
  );
};
