import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioAdministracion } from '../../api/administracionServicio';
import { Cargando } from '../comunes/Cargando';
import { InsigniaEstado } from '../comunes/InsigniaEstado';
import { Modal } from '../comunes/Modal';
import {
  ShieldCheck,
  Building2,
  Compass,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  AlertTriangle,
  Loader2,
  MessageSquare
} from 'lucide-react';

export const PanelAdministrador = () => {
  const { mostrarNotificacion } = useAutenticacion();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);

  // Estados para Modal de Rechazo con Motivo
  const [modalRechazoAbierto, setModalRechazoAbierto] = useState(false);
  const [solicitudParaRechazar, setSolicitudParaRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [rechazando, setRechazando] = useState(false);

  const cargarColaRevision = async () => {
    setCargando(true);
    try {
      const lista = await servicioAdministracion.obtenerColaRevision();
      setSolicitudes(lista);
    } catch (error) {
      console.error('Error al cargar cola de administración:', error);
      mostrarNotificacion('Error al cargar solicitudes de revisión.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarColaRevision();
  }, []);

  const manejarAprobar = async (idPerfil, nombre) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.aprobarPerfil(idPerfil);
      mostrarNotificacion(`Perfil de "${nombre}" aprobado exitosamente.`);
      setSolicitudes((prev) => prev.filter((s) => s.id !== idPerfil));
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al aprobar perfil.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const abrirModalRechazo = (solicitud) => {
    setSolicitudParaRechazar(solicitud);
    setMotivoRechazo('El certificado de Registro Nacional de Turismo (RNT) o Tarjeta Profesional adjuntos están vencidos, incompletos o no corresponden a la razón social / nombre titular.');
    setModalRechazoAbierto(true);
  };

  const manejarConfirmarRechazo = async (e) => {
    e.preventDefault();
    if (!solicitudParaRechazar) return;

    setRechazando(true);
    const nombre = solicitudParaRechazar.nombreAgencia || solicitudParaRechazar.nombreCompleto;

    try {
      await servicioAdministracion.rechazarPerfil(solicitudParaRechazar.id, motivoRechazo);
      mostrarNotificacion(`Solicitud de "${nombre}" rechazada. Se notificó al prestador con las razones.`);
      setModalRechazoAbierto(false);
      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitudParaRechazar.id));
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al rechazar solicitud.', 'error');
    } finally {
      setRechazando(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="contenedor">
        {/* Cabecera del Panel de Administrador */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                Panel de Validación de Turismo RNT
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
                Cola de verificación legal de Agencias Operadoras y Guías Profesionales de Bogotá.
              </p>
            </div>
          </div>

          <button onClick={cargarColaRevision} className="boton boton-contorno">
            Actualizar Cola
          </button>
        </div>

        {cargando ? (
          <Cargando mensaje="Consultando solicitudes de verificación..." />
        ) : solicitudes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.12)'
            }}
          >
            <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ¡Todo al día! No hay solicitudes pendientes
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
              Todos los registros de prestadores turísticos han sido validados o procesados.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {solicitudes.map((solicitud) => {
              const esAgencia = solicitud.rol === 'agencia';
              const nombreTitular = solicitud.nombreAgencia || solicitud.nombreCompleto || 'Sin nombre';
              const estaProcesando = procesandoId === solicitud.id;

              return (
                <div
                  key={solicitud.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {solicitud.urlFotoRostro ? (
                        <img
                          src={solicitud.urlFotoRostro}
                          alt={nombreTitular}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: esAgencia ? 'rgba(245, 158, 11, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                            color: esAgencia ? '#fbbf24' : '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {esAgencia ? <Building2 size={22} /> : <Compass size={22} />}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{nombreTitular}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          Tipo: <strong>{esAgencia ? 'Agencia Operadora' : 'Guía Profesional'}</strong> · RNT: <strong>{solicitud.numeroRnt}</strong>
                        </span>
                      </div>
                    </div>

                    <InsigniaEstado estado={solicitud.estado} />
                  </div>

                  {solicitud.motivoRechazo && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        color: '#fca5a5'
                      }}
                    >
                      <strong>Observación previa:</strong> {solicitud.motivoRechazo}
                    </div>
                  )}

                  {/* Documentación Adjunta */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px'
                    }}
                  >
                    {solicitud.urlDocumentoRnt && (
                      <a
                        href={solicitud.urlDocumentoRnt}
                        target="_blank"
                        rel="noreferrer"
                        className="boton boton-contorno boton-pequeno"
                        style={{ gap: '0.4rem', fontSize: '0.82rem' }}
                      >
                        <FileText size={15} color="#fbbf24" />
                        <span>Ver Documento RNT</span>
                        <ExternalLink size={13} />
                      </a>
                    )}

                    {solicitud.urlTarjetaProfesional && (
                      <a
                        href={solicitud.urlTarjetaProfesional}
                        target="_blank"
                        rel="noreferrer"
                        className="boton boton-contorno boton-pequeno"
                        style={{ gap: '0.4rem', fontSize: '0.82rem' }}
                      >
                        <FileText size={15} color="#38bdf8" />
                        <span>Ver Tarjeta Profesional</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  {/* Acciones de Validación */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '0.75rem'
                    }}
                  >
                    <button
                      onClick={() => abrirModalRechazo(solicitud)}
                      disabled={estaProcesando}
                      className="boton boton-peligro boton-pequeno"
                      style={{ gap: '0.4rem' }}
                    >
                      <XCircle size={15} />
                      <span>Rechazar con Observación</span>
                    </button>
                    <button
                      onClick={() => manejarAprobar(solicitud.id, nombreTitular)}
                      disabled={estaProcesando}
                      className="boton boton-primario boton-pequeno"
                      style={{ gap: '0.4rem', backgroundColor: '#10b981' }}
                    >
                      {estaProcesando ? (
                        <Loader2 size={15} style={{ animation: 'girar 1s linear infinite' }} />
                      ) : (
                        <CheckCircle size={15} />
                      )}
                      <span>Aprobar y Activar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Motivo de Rechazo */}
      <Modal
        abierto={modalRechazoAbierto}
        alCerrar={() => setModalRechazoAbierto(false)}
        titulo="Rechazar Solicitud de Prestador"
        anchoMaximo="520px"
      >
        <form onSubmit={manejarConfirmarRechazo}>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af', marginBottom: '1rem' }}>
            Explica a <strong>{solicitudParaRechazar?.nombreAgencia || solicitudParaRechazar?.nombreCompleto}</strong> las razones del rechazo para que pueda corregir los documentos y volver a solicitar la aprobación.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Motivo detallado del rechazo</span>
              <MessageSquare size={15} color="#ef4444" />
            </label>
            <textarea
              required
              rows={4}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: El certificado RNT adjunto está vencido. Adjunta el certificado expedido este año."
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setModalRechazoAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rechazando}
              className="boton boton-peligro"
              style={{ flex: 2 }}
            >
              {rechazando ? (
                <>
                  <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                  <span>Procesando rechazo...</span>
                </>
              ) : (
                <span>Confirmar Rechazo y Notificar</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
