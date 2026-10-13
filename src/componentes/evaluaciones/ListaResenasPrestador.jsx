import React, { useState } from 'react';
import { InsigniaRanking } from './InsigniaRanking';
import { Modal } from '../comunes/Modal';
import {
  Star,
  MessageSquare,
  Send,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Compass,
  Calendar,
  Loader2
} from 'lucide-react';

export const ListaResenasPrestador = ({
  rankingData,
  tipoPrestador = 'guia', // 'guia' | 'agencia'
  nombrePrestador = '',
  alActualizar
}) => {
  const [modalRespuestaAbierto, setModalRespuestaAbierto] = useState(false);
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [resenaSeleccionada, setResenaSeleccionada] = useState(null);

  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [motivoReporte, setMotivoReporte] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const evaluaciones = rankingData?.evaluaciones || [];
  const promedio = rankingData?.promedio || 0;
  const total = rankingData?.totalEvaluaciones || 0;

  const abrirResponder = (resena) => {
    setResenaSeleccionada(resena);
    setTextoRespuesta('');
    setModalRespuestaAbierto(true);
  };

  const abrirReportar = (resena) => {
    setResenaSeleccionada(resena);
    setMotivoReporte('Contenido ofensivo, datos personales o información falsa.');
    setModalReporteAbierto(true);
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!resenaSeleccionada || !textoRespuesta.trim()) return;
    setProcesando(true);
    try {
      if (alActualizar) {
        await alActualizar('responder', resenaSeleccionada.id, textoRespuesta);
      }
      setMensajeExito('Respuesta publicada exitosamente.');
      setTimeout(() => setMensajeExito(''), 3500);
      setModalRespuestaAbierto(false);
    } catch (err) {
      alert(err.message || 'Error al responder.');
    } finally {
      setProcesando(false);
    }
  };

  const enviarReporte = async (e) => {
    e.preventDefault();
    if (!resenaSeleccionada || !motivoReporte.trim()) return;
    setProcesando(true);
    try {
      if (alActualizar) {
        await alActualizar('reportar', resenaSeleccionada.id, motivoReporte);
      }
      setMensajeExito('Reseña reportada para moderación administrativa.');
      setTimeout(() => setMensajeExito(''), 3500);
      setModalReporteAbierto(false);
    } catch (err) {
      alert(err.message || 'Error al reportar.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tarjeta de Resumen de Ranking */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--borde-sutil)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(198, 161, 91, 0.15)',
              color: 'var(--color-dorado-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Star size={26} fill="#C6A15B" color="#C6A15B" />
            <strong style={{ fontSize: '1.1rem', marginTop: '2px', color: 'var(--texto-principal)' }}>
              {total > 0 ? Number(promedio).toFixed(1) : '—'}
            </strong>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
                {tipoPrestador === 'guia' ? 'Ranking Oficial del Guía' : 'Ranking de Experiencia de Tours'}
              </h3>
              <span
                style={{
                  backgroundColor: 'var(--fondo-principal)',
                  color: 'var(--texto-secundario)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}
              >
                Métrica Independiente
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--texto-secundario)' }}>
              {tipoPrestador === 'guia'
                ? `Puntuación obtenida por ${nombrePrestador || 'el guía'} basada en conocimiento, amabilidad y cumplimiento, separada de los paquetes.`
                : 'Puntuación consolidada del cumplimiento, puntualidad y relación calidad-precio de tus recorridos turísticos.'}
            </p>
          </div>
        </div>

        <InsigniaRanking
          promedio={promedio}
          totalEvaluaciones={total}
          tipo={tipoPrestador}
          variante="tarjeta"
        />
      </div>

      {mensajeExito && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-exito-fondo)',
            border: '1px solid var(--color-exito)',
            borderRadius: '10px',
            color: 'var(--color-exito)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Listado de Evaluaciones */}
      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primario)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MessageSquare size={18} color="var(--color-dorado)" />
          <span>Opiniones y Calificaciones de los Viajeros ({evaluaciones.length})</span>
        </h4>

        {evaluaciones.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed var(--borde-sutil)',
              padding: '3rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <Star size={38} color="var(--texto-atenuado)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '0.25rem' }}>
              Aún no tienes evaluaciones registradas
            </h4>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.86rem' }}>
              Una vez que los turistas completen recorridos con tu servicio, sus calificaciones y comentarios se publicarán aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {evaluaciones.map((resena) => {
              const puntuacion = tipoPrestador === 'guia' ? resena.calificacionGuia : resena.calificacionTour;
              const comentario = tipoPrestador === 'guia' ? resena.comentarioGuia : resena.comentarioTour;
              const respuesta = tipoPrestador === 'guia' ? resena.respuestaGuia : resena.respuestaAgencia;

              return (
                <div
                  key={resena.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid var(--borde-sutil)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <strong style={{ fontSize: '0.96rem', color: 'var(--texto-principal)' }}>
                          {resena.nombreTurista}
                        </strong>
                        <span style={{ color: 'var(--color-dorado-hover)', fontWeight: 800, fontSize: '0.95rem' }}>
                          {'★'.repeat(puntuacion || 5)}{'☆'.repeat(5 - (puntuacion || 5))} ({puntuacion}/5)
                        </span>
                      </div>
                      {resena.tituloTour && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                          Tour: {resena.tituloTour}
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.74rem', color: 'var(--texto-atenuado)' }}>
                      {new Date(resena.creadoEn).toLocaleDateString('es-CO')}
                    </span>
                  </div>

                  {comentario && (
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--texto-secundario)', lineHeight: 1.5 }}>
                      "{comentario}"
                    </p>
                  )}

                  {/* Respuesta existente */}
                  {respuesta && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--fondo-principal)',
                        borderLeft: '3px solid var(--color-primario)',
                        borderRadius: '8px',
                        fontSize: '0.82rem'
                      }}
                    >
                      <strong style={{ color: 'var(--color-primario)' }}>Tu respuesta pública:</strong>{' '}
                      <span style={{ color: 'var(--texto-secundario)' }}>{respuesta}</span>
                    </div>
                  )}

                  {/* Acciones de la reseña: Responder / Reportar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.6rem',
                      borderTop: '1px solid var(--borde-sutil)',
                      paddingTop: '0.65rem'
                    }}
                  >
                    {!respuesta && (
                      <button
                        onClick={() => abrirResponder(resena)}
                        className="boton boton-primario boton-pequeno"
                        style={{ gap: '0.35rem', fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
                      >
                        <MessageSquare size={13} />
                        <span>Ejercer Derecho de Respuesta</span>
                      </button>
                    )}

                    <button
                      onClick={() => abrirReportar(resena)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--texto-atenuado)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Reportar reseña si contiene difamación o datos prohibidos"
                    >
                      <Flag size={12} />
                      <span>Reportar contenido</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Derecho de Respuesta */}
      <Modal
        abierto={modalRespuestaAbierto}
        alCerrar={() => setModalRespuestaAbierto(false)}
        titulo="Derecho de Respuesta Pública"
        anchoMaximo="520px"
      >
        <form onSubmit={enviarRespuesta}>
          <p style={{ fontSize: '0.86rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            Escribe una respuesta cordial a la opinión de <strong>{resenaSeleccionada?.nombreTurista}</strong>. Esta respuesta será visible públicamente para otros viajeros.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Texto de tu respuesta pública</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={500}
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              placeholder="Ej: Agradecemos tus comentarios sobre el recorrido. Hemos ajustado los horarios para mejorar la experiencia..."
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalRespuestaAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {procesando ? 'Publicando...' : 'Publicar Respuesta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reportar Reseña Ofensiva */}
      <Modal
        abierto={modalReporteAbierto}
        alCerrar={() => setModalReporteAbierto(false)}
        titulo="Reportar Reseña para Moderación"
        anchoMaximo="520px"
      >
        <form onSubmit={enviarReporte}>
          <p style={{ fontSize: '0.86rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            Las opiniones no pueden modificarse arbitrariamente por ser desfavorables. Solo se moderan reseñas que incluyan insultos, falsedades comprobables o divulgación de datos personales.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Motivo del reporte</span>
            </label>
            <textarea
              required
              rows={4}
              value={motivoReporte}
              onChange={(e) => setMotivoReporte(e.target.value)}
              placeholder="Explica detalladamente por qué consideras que esta reseña infringe las políticas..."
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalReporteAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className="boton boton-peligro"
              style={{ flex: 2 }}
            >
              {procesando ? 'Reportando...' : 'Confirmar Reporte'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
