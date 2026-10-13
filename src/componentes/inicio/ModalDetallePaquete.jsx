import React, { useState, useEffect } from 'react';
import { Modal } from '../comunes/Modal';
import { ShieldCheck, Calendar, Clock, MapPin, CheckCircle, ArrowRight, Star, MessageSquare } from 'lucide-react';
import { servicioCalificaciones } from '../../api/calificacionesServicio';
import { InsigniaRanking } from '../evaluaciones/InsigniaRanking';

export const ModalDetallePaquete = ({ paquete, abierto, alCerrar, alReservar }) => {
  const [rankingTour, setRankingTour] = useState(null);
  const [cargandoRanking, setCargandoRanking] = useState(false);

  useEffect(() => {
    if (abierto && paquete?.id) {
      setCargandoRanking(true);
      servicioCalificaciones
        .obtenerRankingTour(paquete.id)
        .then((datos) => setRankingTour(datos))
        .catch(() => setRankingTour(null))
        .finally(() => setCargandoRanking(false));
    }
  }, [abierto, paquete?.id]);

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

        {/* Información de la Agencia, Ranking del Tour y Tarifa */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--fondo-secundario)',
            borderRadius: '12px',
            border: '1px solid var(--borde-sutil)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Operador Responsable</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--color-primario)', fontWeight: 800 }}>{paquete.nombreAgencia || 'Agencia Certificada'}</strong>
          </div>

          {/* Ranking del Tour Independiente */}
          <div>
            <InsigniaRanking
              promedio={rankingTour?.promedio || 4.8}
              totalEvaluaciones={rankingTour?.totalEvaluaciones || 0}
              tipo="tour"
              variante="tarjeta"
            />
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

        {/* Opiniones de Viajeros */}
        {rankingTour && rankingTour.evaluaciones && rankingTour.evaluaciones.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--texto-principal)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} color="var(--color-dorado)" fill="#C6A15B" />
                <span>Opiniones de Viajeros sobre el Tour</span>
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                {rankingTour.totalEvaluaciones} reseña{rankingTour.totalEvaluaciones === 1 ? '' : 's'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}>
              {rankingTour.evaluaciones.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: 'var(--fondo-principal)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--borde-sutil)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--texto-principal)' }}>{ev.nombreTurista}</strong>
                    <span style={{ color: 'var(--color-dorado-hover)', fontWeight: 700 }}>
                      {'★'.repeat(ev.calificacionTour)}{'☆'.repeat(5 - ev.calificacionTour)}
                    </span>
                  </div>
                  {ev.comentarioTour && (
                    <p style={{ margin: 0, color: 'var(--texto-secundario)', fontStyle: 'italic' }}>
                      "{ev.comentarioTour}"
                    </p>
                  )}
                  {ev.respuestaAgencia && (
                    <div style={{ marginTop: '0.4rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--color-primario)', fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                      <strong>Respuesta de la agencia:</strong> {ev.respuestaAgencia}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
