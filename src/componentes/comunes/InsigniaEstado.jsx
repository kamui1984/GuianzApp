import React from 'react';
import { CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';

export const InsigniaEstado = ({ estado, numeroRnt }) => {
  if (numeroRnt) {
    return (
      <span className="insignia insignia-rnt">
        <ShieldCheck size={13} />
        RNT: {numeroRnt}
      </span>
    );
  }

  const configuraciones = {
    aprobado: {
      clase: 'insignia-aprobado',
      texto: 'Verificado',
      icono: <CheckCircle size={13} />
    },
    pendiente: {
      clase: 'insignia-pendiente',
      texto: 'En Revisión',
      icono: <Clock size={13} />
    },
    rechazado: {
      clase: 'insignia-rechazado',
      texto: 'Rechazado',
      icono: <XCircle size={13} />
    },
    borrador: {
      clase: 'insignia-borrador',
      texto: 'Borrador',
      icono: <Clock size={13} />
    }
  };

  const config = configuraciones[estado] || configuraciones.pendiente;

  return (
    <span className={`insignia ${config.clase}`}>
      {config.icono}
      {config.texto}
    </span>
  );
};
