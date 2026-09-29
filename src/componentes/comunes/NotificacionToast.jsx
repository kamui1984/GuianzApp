import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

export const NotificacionToast = () => {
  const { notificacion, limpiarNotificacion } = useAutenticacion();

  if (!notificacion) return null;

  const iconos = {
    exito: <CheckCircle2 size={20} color="#10b981" />,
    error: <AlertCircle size={20} color="#ef4444" />,
    advertencia: <AlertTriangle size={20} color="#f59e0b" />
  };

  const bordes = {
    exito: '1px solid rgba(16, 185, 129, 0.4)',
    error: '1px solid rgba(239, 68, 68, 0.4)',
    advertencia: '1px solid rgba(245, 158, 11, 0.4)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        border: bordes[notificacion.tipo] || bordes.exito,
        maxWidth: '420px',
        animation: 'aparecerSuave 0.25s ease-out'
      }}
    >
      {iconos[notificacion.tipo] || iconos.exito}
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notificacion.mensaje}</span>
      <button
        onClick={limpiarNotificacion}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
