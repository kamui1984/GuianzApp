import React from 'react';
import { Modal } from './Modal';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Scale,
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ModalEvidenciaReserva = ({ reserva, abierto, alCerrar }) => {
  if (!reserva) return null;

  const codigo = reserva.codigoReserva || reserva.codigo_reserva || `#RES-${String(reserva.id || '').substring(0, 8).toUpperCase()}`;
  const condiciones = reserva.condicionesSnapshot || reserva.condiciones_snapshot || {};
  const historial = reserva.historialEvidencias || reserva.historial_evidencias || [];
  const especialidades = condiciones.especialidades_requeridas || reserva.especialidades || [];
  const estadoActual = reserva.estado || 'en espera de confirmacion';

  const formatearFechaHora = (fechaIso) => {
    if (!fechaIso) return 'Pendiente';
    try {
      const d = new Date(fechaIso);
      return d.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return fechaIso;
    }
  };

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const manejarImprimir = () => {
    window.print();
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={`Expediente y Evidencia Legal: ${codigo}`}
      anchoMaximo="720px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner de Identificación Jurídica y Validez */}
        <div
          style={{
            backgroundColor: '#12303B',
            color: '#FFFFFF',
            padding: '1.2rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Scale size={20} color="#FFD480" />
              <span style={{ fontSize: '0.78rem', letterSpacing: '0.05em', color: '#D8DEE0', textTransform: 'uppercase', fontWeight: 700 }}>
                Certificado Digital de Trazabilidad Turística
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--fuente-titulos)' }}>
              {codigo}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#D8DEE0' }}>
              Tour: <strong>{reserva.tituloPaquete}</strong>
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 800,
                backgroundColor:
                  estadoActual === 'confirmada'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                color: estadoActual === 'confirmada' ? '#34d399' : '#fbbf24',
                border:
                  estadoActual === 'confirmada'
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(245, 158, 11, 0.5)'
              }}
            >
              {estadoActual === 'confirmada' ? '● Reserva Confirmada' : '⏱ En Espera de Confirmación'}
            </span>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.35rem' }}>
              Ref. Ley 1480/2011 & Ley 2068/2020
            </div>
          </div>
        </div>

        {/* ÁRBOL DE EVIDENCIAS Y TRAZABILIDAD (Estructura Solicitada) */}
        <div
          style={{
            backgroundColor: 'var(--fondo-secundario)',
            border: '1px solid var(--borde-sutil)',
            borderRadius: '12px',
            padding: '1.25rem',
            fontFamily: 'monospace',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: 'var(--texto-principal)'
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--color-primario)', marginBottom: '0.6rem', fontSize: '0.92rem' }}>
            📋 REGISTRO DE CADENA DE CUSTODIA DEL SERVICIO:
          </div>
          <div style={{ paddingLeft: '0.5rem', borderLeft: '2px dashed var(--borde-sutil)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Paquete publicado por:</strong> {reserva.nombreAgencia || condiciones.responsable_servicio || 'Agencia Operadora'}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>RNT Agencia Operadora:</strong> {reserva.rntAgencia || condiciones.rnt_responsable || 'RNT Registrado en MinCIT'}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Fecha del Tour:</strong> {reserva.fechaReserva} | <strong>Hora:</strong> {reserva.horaReserva} ({reserva.duracion})
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Especialidades requeridas para la ruta:</strong>
              {especialidades && especialidades.length > 0 ? (
                <div style={{ paddingLeft: '1.5rem', color: 'var(--color-primario)' }}>
                  {especialidades.map((esp, i) => (
                    <div key={i}>
                      │    ├── {typeof esp === 'string' ? esp : esp.subcategoria || esp.nombre || esp}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--texto-secundario)' }}> Estándar de guianza urbana y cultural</span>
              )}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Guía profesional asignado:</strong>{' '}
              {reserva.nombreGuiaAsignado ? (
                <span style={{ color: '#059669', fontWeight: 700 }}>{reserva.nombreGuiaAsignado}</span>
              ) : (
                <span style={{ color: '#d97706', fontStyle: 'italic' }}>Pendiente por asignar por la agencia</span>
              )}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>RNT / Tarjeta Profesional Guía:</strong>{' '}
              {reserva.rntGuia || (reserva.nombreGuiaAsignado ? 'Certificado con Tarjeta Profesional' : 'Pendiente')}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Fecha y hora de asignación del guía:</strong>{' '}
              {reserva.fechaAsignacionGuia ? formatearFechaHora(reserva.fechaAsignacionGuia) : 'A la espera de asignación'}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Aceptación del servicio por el Turista:</strong>{' '}
              <span style={{ color: '#059669' }}>
                Aceptado digitalmente el {formatearFechaHora(reserva.fechaAceptacionTerminos || reserva.creadoEn)}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong>Condiciones pactadas (Snapshot):</strong>
              <div style={{ paddingLeft: '1.5rem', color: 'var(--texto-secundario)', fontSize: '0.8rem' }}>
                <div>• <em>Incluye:</em> {condiciones.que_incluye || 'Servicio de guianza y recorrido coordinado según paquete.'}</div>
                <div>• <em>No incluye:</em> {condiciones.que_no_incluye || 'Gastos personales no especificados.'}</div>
                <div>• <em>Cancelación:</em> {condiciones.politica_cancelacion || 'Cancelación según políticas oficiales de la agencia.'}</div>
              </div>
            </div>
            <div>
              └── <strong>Estado jurídico final:</strong>{' '}
              <strong style={{ color: estadoActual === 'confirmada' ? '#059669' : '#d97706' }}>
                {estadoActual.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>

        {/* Relaciones Jurídicas Claras */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--color-primario-claro)',
              borderRadius: '8px',
              border: '1px solid rgba(23, 74, 91, 0.15)'
            }}
          >
            <strong style={{ color: 'var(--color-primario)', display: 'block', marginBottom: '0.3rem' }}>
              Relación 1: Turista ↔ Agencia
            </strong>
            <span style={{ color: 'var(--texto-secundario)', lineHeight: 1.4 }}>
              La agencia <strong>{reserva.nombreAgencia}</strong> es la única responsable directa del servicio, qué incluye, no incluye, precios, seguridad y cancelaciones.
            </span>
          </div>

          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'rgba(255, 212, 128, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(198, 161, 91, 0.3)'
            }}
          >
            <strong style={{ color: '#785311', display: 'block', marginBottom: '0.3rem' }}>
              Relación 2: Agencia ↔ Guía
            </strong>
            <span style={{ color: 'var(--texto-secundario)', lineHeight: 1.4 }}>
              El guía presta el servicio autónomamente bajo los términos acordados con la agencia. <strong>GuianzApp</strong> actúa como plataforma tecnológica facilitadora.
            </span>
          </div>
        </div>

        {/* Historial Cronológico de Evidencias */}
        {historial.length > 0 && (
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--texto-secundario)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Historial de Auditoría y Eventos:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {historial.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'var(--fondo-secundario)',
                    borderRadius: '8px',
                    border: '1px solid var(--borde-sutil)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span><strong>{ev.evento}</strong>: {ev.detalle}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', whiteSpace: 'nowrap' }}>
                    {formatearFechaHora(ev.fecha)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--borde-sutil)', paddingTop: '0.85rem' }}>
          <button
            type="button"
            onClick={manejarImprimir}
            className="boton boton-contorno boton-pequeno"
            style={{ gap: '0.4rem' }}
          >
            <Printer size={15} />
            <span>Imprimir / Descargar Evidencia</span>
          </button>
          <button type="button" onClick={alCerrar} className="boton boton-primario boton-pequeno">
            Cerrar Expediente
          </button>
        </div>
      </div>
    </Modal>
  );
};
