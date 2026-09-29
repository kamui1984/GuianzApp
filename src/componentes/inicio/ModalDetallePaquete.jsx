import React from 'react';
import { Modal } from '../comunes/Modal';
import { ShieldCheck, Calendar, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export const ModalDetallePaquete = ({ paquete, abierto, alCerrar, alReservar }) => {
  if (!paquete) return null;

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const urlImagen = paquete.archivos?.[0]?.url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=80';

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={paquete.titulo} anchoMaximo="720px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Imagen Principal */}
        <div style={{ height: '260px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={urlImagen}
            alt={paquete.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--borde-sutil)',
              color: 'var(--color-secundario)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <ShieldCheck size={16} color="var(--color-secundario)" />
            <span>RNT: {paquete.numeroRnt || 'Validado'}</span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(23, 74, 91, 0.92)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Clock size={15} color="#FFD480" />
            <span>Duración: {paquete.duracion || '3.5 horas'}</span>
          </div>
        </div>

        {/* Información de la Agencia y Tarifa */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--fondo-secundario)',
            borderRadius: '12px',
            border: '1px solid var(--borde-sutil)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Operador Responsable</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--color-primario)', fontWeight: 800 }}>{paquete.nombreAgencia || 'Agencia Certificada'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Tarifa por persona</span>
            <strong style={{ fontSize: '1.35rem', color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)', fontWeight: 800 }}>{formatearPrecio(paquete.precio)}</strong>
          </div>
        </div>

        {/* Descripción Completa */}
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--texto-principal)', fontFamily: 'var(--fuente-titulos)' }}>
            Acerca de la experiencia
          </h4>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.94rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {paquete.descripcion}
          </p>
        </div>

        {/* Políticas de Cancelación */}
        {paquete.politicaCancelacion && (
          <div
            style={{
              padding: '0.85rem 1.1rem',
              backgroundColor: 'var(--color-dorado-claro)',
              border: '1px solid rgba(198, 161, 91, 0.4)',
              borderRadius: '10px'
            }}
          >
            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--texto-principal)', marginBottom: '0.25rem' }}>
              Política de Cancelación
            </h5>
            <p style={{ fontSize: '0.84rem', color: 'var(--texto-secundario)', lineHeight: 1.4 }}>
              {paquete.politicaCancelacion}
            </p>
          </div>
        )}

        {/* Galería adicional */}
        {paquete.archivos && paquete.archivos.length > 1 && (
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--texto-secundario)' }}>
              Más fotos del recorrido
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
              {paquete.archivos.slice(1).map((archivo, idx) => (
                <img
                  key={archivo.id || idx}
                  src={archivo.url}
                  alt={archivo.nombre || 'Foto recorrido'}
                  style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--borde-sutil)' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Botón de Acción Principal */}
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
          <button onClick={alCerrar} className="boton boton-contorno" style={{ flex: 1 }}>
            Cerrar
          </button>
          <button
            onClick={() => {
              alCerrar();
              alReservar(paquete);
            }}
            className="boton boton-primario"
            style={{ flex: 2, gap: '0.5rem' }}
          >
            <span>Continuar a Reserva</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
