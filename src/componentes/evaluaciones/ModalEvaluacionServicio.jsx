import React, { useState } from 'react';
import { Modal } from '../comunes/Modal';
import { SelectorEstrellas } from './SelectorEstrellas';
import {
  Star,
  Building2,
  Compass,
  AlertTriangle,
  Loader2,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const ModalEvaluacionServicio = ({
  abierto,
  alCerrar,
  reserva,
  alEnviar,
  alReportarProblema
}) => {
  const [calificacionTour, setCalificacionTour] = useState(5);
  const [comentarioTour, setComentarioTour] = useState('');

  const [calificacionGuia, setCalificacionGuia] = useState(5);
  const [comentarioGuia, setComentarioGuia] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  if (!reserva) return null;

  const tieneGuia = Boolean(reserva.id_guia_asignado || reserva.nombre_guia_asignado);
  const nombreGuia = reserva.nombre_guia_asignado || 'Guía asignado';
  const nombreAgencia = reserva.nombre_agencia || 'Agencia operadora';
  const tituloTour = reserva.titulo_paquete || 'Tour Bogotá';

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorValidacion('');

    if (!calificacionTour || calificacionTour < 1 || calificacionTour > 5) {
      setErrorValidacion('Por favor califica la experiencia del tour de 1 a 5 estrellas.');
      return;
    }

    if (tieneGuia && (!calificacionGuia || calificacionGuia < 1 || calificacionGuia > 5)) {
      setErrorValidacion('Por favor califica el desempeño del guía de 1 a 5 estrellas.');
      return;
    }

    setEnviando(true);
    try {
      await alEnviar({
        idReserva: reserva.id,
        calificacionTour,
        comentarioTour,
        calificacionGuia: tieneGuia ? calificacionGuia : null,
        comentarioGuia: tieneGuia ? comentarioGuia : null
      });
      alCerrar();
    } catch (err) {
      setErrorValidacion(err.message || 'No se pudo guardar la evaluación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Evaluar Experiencia del Servicio"
      anchoMaximo="580px"
    >
      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Cabecera del Tour Evaluado */}
        <div
          style={{
            backgroundColor: 'var(--fondo-principal)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--borde-sutil)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-primario)' }}>
                Reserva {reserva.codigo_reserva || `#RES-${reserva.id?.slice(0, 6)}`}
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--texto-principal)', margin: '0.15rem 0' }}>
                {tituloTour}
              </h4>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: 'var(--color-exito-fondo)',
                color: 'var(--color-exito)'
              }}
            >
              Servicio Completado
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--texto-secundario)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Building2 size={13} color="var(--color-primario)" />
              Agencia: <strong>{nombreAgencia}</strong>
            </span>
            {tieneGuia && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Compass size={13} color="var(--color-secundario)" />
                Guía: <strong>{nombreGuia}</strong>
              </span>
            )}
          </div>
        </div>

        {errorValidacion && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-peligro-fondo)',
              border: '1px solid var(--color-peligro)',
              borderRadius: '8px',
              color: 'var(--color-peligro)',
              fontSize: '0.85rem'
            }}
          >
            {errorValidacion}
          </div>
        )}

        {/* DIMENSIÓN A: El Tour o Servicio Turístico */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--borde-sutil)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(23, 74, 91, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primario)'
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
                1. ¿Cómo calificarías el Tour?
              </h5>
              <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                Evalúa la organización, puntualidad, relación calidad-precio y cumplimiento.
              </span>
            </div>
          </div>

          <SelectorEstrellas
            valor={calificacionTour}
            alCambiar={setCalificacionTour}
            etiqueta="Calificación de la experiencia"
            tamano={28}
          />

          <div className="grupo-formulario" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="etiqueta-formulario" style={{ marginBottom: '0.25rem' }}>
                <span>¿Quieres contarnos cómo fue tu experiencia? (Opcional)</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--texto-atenuado)' }}>
                {comentarioTour.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={comentarioTour}
              onChange={(e) => setComentarioTour(e.target.value)}
              placeholder="¿Qué fue lo que más te gustó? ¿Qué podría mejorar la agencia?"
              className="area-texto-formulario"
              style={{ fontSize: '0.84rem' }}
            />
          </div>
        </div>

        {/* DIMENSIÓN B: El Desempeño del Guía (si hubo guía asignado) */}
        {tieneGuia && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid var(--borde-sutil)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(31, 93, 80, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-secundario)'
                }}
              >
                <Compass size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-secundario)', margin: 0 }}>
                  2. ¿Cómo calificarías al Guía ({nombreGuia})?
                </h5>
                <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                  Evalúa el conocimiento, amabilidad, claridad y acompañamiento del guía.
                </span>
              </div>
            </div>

            <SelectorEstrellas
              valor={calificacionGuia}
              alCambiar={setCalificacionGuia}
              etiqueta="Desempeño y atención del guía"
              tamano={28}
            />

            <div className="grupo-formulario" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="etiqueta-formulario" style={{ marginBottom: '0.25rem' }}>
                  <span>Comentario sobre el guía (Opcional)</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--texto-atenuado)' }}>
                  {comentarioGuia.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={comentarioGuia}
                onChange={(e) => setComentarioGuia(e.target.value)}
                placeholder="Destaca aspectos positivos o sugerencias para el guía..."
                className="area-texto-formulario"
                style={{ fontSize: '0.84rem' }}
              />
            </div>
          </div>
        )}

        {/* Separación de Reseñas vs Incidentes Graves */}
        <div
          style={{
            backgroundColor: 'var(--fondo-principal)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            border: '1px dashed var(--borde-sutil)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-secundario)' }}>
            <ShieldAlert size={16} color="var(--color-acento-bogota)" />
            <span>¿Tuviste un incidente grave (fraude, cobro indebido o accidente)?</span>
          </div>
          {alReportarProblema && (
            <button
              type="button"
              onClick={() => {
                alCerrar();
                alReportarProblema(reserva);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-acento-bogota)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.78rem'
              }}
            >
              Radicar reclamación formal →
            </button>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={alCerrar}
            className="boton boton-contorno"
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="boton boton-primario"
            style={{ flex: 2 }}
          >
            {enviando ? (
              <>
                <Loader2 size={16} style={{ animation: 'girar 1s linear infinite' }} />
                <span>Registrando evaluación...</span>
              </>
            ) : (
              <span>Enviar Evaluación</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
