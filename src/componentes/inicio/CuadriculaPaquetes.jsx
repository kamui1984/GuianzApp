import React from 'react';
import { TarjetaPaquete } from './TarjetaPaquete';
import { Sparkles, RefreshCw } from 'lucide-react';

export const CuadriculaPaquetes = ({ paquetes, alVerDetalles, alReservar, alLimpiarFiltros }) => {
  if (!paquetes || paquetes.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px dashed var(--borde-sutil)',
          boxShadow: 'var(--sombra-sutil)',
          margin: '2rem 0'
        }}
      >
        <Sparkles size={40} color="var(--color-dorado)" style={{ margin: '0 auto 1rem', opacity: 0.9 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)' }}>
          No encontramos paquetes para estos filtros
        </h3>
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          Intenta buscar con otra palabra clave o selecciona una categoría diferente de actividades en Bogotá.
        </p>
        <button onClick={alLimpiarFiltros} className="boton boton-primario" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} />
          <span>Ver todos los paquetes</span>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '1.75rem',
        marginBottom: '4rem'
      }}
    >
      {paquetes.map((paquete, indice) => (
        <TarjetaPaquete
          key={paquete.id || indice}
          paquete={paquete}
          alVerDetalles={alVerDetalles}
          alReservar={alReservar}
          indice={indice}
        />
      ))}
    </div>
  );
};
