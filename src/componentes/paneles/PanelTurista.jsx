import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioCalificaciones } from '../../api/calificacionesServicio';
import { ModalEvaluacionServicio } from '../evaluaciones/ModalEvaluacionServicio';
import { Cargando } from '../comunes/Cargando';
import { InsigniaRanking } from '../evaluaciones/InsigniaRanking';
import {
  Compass,
  Building2,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MapPin,
  Info,
  History,
  Check
} from 'lucide-react';

export const PanelTurista = ({ alExplorarTours, alReportarIncidente }) => {
  const { usuarioActual, mostrarNotificacion } = useAutenticacion();
  const [reservas, setReservas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('activas'); // 'activas' | 'historial'

  // Modal de evaluación
  const [modalEvaluacionAbierto, setModalEvaluacionAbierto] = useState(false);
  const [reservaParaEvaluar, setReservaParaEvaluar] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaReservas, listaEvaluaciones] = await Promise.all([
        servicioCalificaciones.listarMisReservasTurista(),
        servicioCalificaciones.listarMisEvaluaciones()
      ]);
      setReservas(listaReservas);
      setEvaluaciones(listaEvaluaciones);
    } catch (err) {
      console.warn('Carga de panel turista:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mapaEvaluaciones = {};
  evaluaciones.forEach((ev) => {
    mapaEvaluaciones[ev.id_reserva] = ev;
    if (ev.codigo_reserva) mapaEvaluaciones[ev.codigo_reserva] = ev;
  });

  const abrirEvaluar = (reserva) => {
    setReservaParaEvaluar(reserva);
    setModalEvaluacionAbierto(true);
  };

  const manejarEnviarEvaluacion = async (datos) => {
    await servicioCalificaciones.crearEvaluacion(datos);
    mostrarNotificacion('¡Evaluación registrada con éxito! Gracias por tu aporte a la comunidad.');
    await cargarDatos();
  };

  const manejarCompletarReserva = async (idReserva) => {
    try {
      await servicioCalificaciones.completarReserva(idReserva);
      mostrarNotificacion('¡Tour marcado como completado! Ya puedes calificar la experiencia.');
      await cargarDatos();
    } catch (err) {
      mostrarNotificacion(err.message || 'Error al completar tour.', 'error');
    }
  };

  // Clasificar reservas en Activas/Próximas vs Historial de Realizadas
  const hoyStr = new Date().toISOString().split('T')[0];
  const esFechaPasada = (f) => f && f < hoyStr;

  const reservasActivas = reservas.filter((res) => {
    const evaluacionHecha = mapaEvaluaciones[res.id] || mapaEvaluaciones[res.codigo_reserva];
    const esCompletada = res.estado === 'completada' || Boolean(evaluacionHecha);
    const fechaPasada = esFechaPasada(res.fecha_reserva || res.fechaReserva);
    return !esCompletada && !fechaPasada;
  });

  const reservasHistorial = reservas.filter((res) => {
    const evaluacionHecha = mapaEvaluaciones[res.id] || mapaEvaluaciones[res.codigo_reserva];
    const esCompletada = res.estado === 'completada' || Boolean(evaluacionHecha);
    const fechaPasada = esFechaPasada(res.fecha_reserva || res.fechaReserva);
    return esCompletada || fechaPasada;
  });

  const reservasAMostrar = pestanaActiva === 'activas' ? reservasActivas : reservasHistorial;

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="contenedor">
        {/* Cabecera del Panel de Turista */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid var(--borde-sutil)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '16px',
                backgroundColor: 'rgba(198, 161, 91, 0.15)',
                color: 'var(--color-dorado-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Compass size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
                  ¡Hola, {usuarioActual?.nombreCompleto || 'Viajero'}!
                </h1>
                <span
                  style={{
                    backgroundColor: 'var(--color-primario-claro)',
                    color: 'var(--color-primario)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px'
                  }}
                >
                  Turista Explorador
                </span>
              </div>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                Gestiona tus reservas, consulta el punto de encuentro exacto, revisa tu historial y califica tus experiencias en Bogotá.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={cargarDatos}
              className="boton boton-contorno boton-pequeno"
              style={{ gap: '0.35rem' }}
            >
              <RefreshCw size={14} />
              <span>Actualizar</span>
            </button>
            <button
              onClick={alExplorarTours}
              className="boton boton-primario boton-pequeno"
              style={{ gap: '0.4rem' }}
            >
              <Sparkles size={14} />
              <span>Explorar Más Tours</span>
            </button>
          </div>
        </div>

        {cargando ? (
          <Cargando mensaje="Cargando tus experiencias y reservas..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Pestañas de Navegación: Próximas vs Historial de Realizadas */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setPestanaActiva('activas')}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '9px',
                      border: 'none',
                      backgroundColor: pestanaActiva === 'activas' ? '#FFFFFF' : 'transparent',
                      color: pestanaActiva === 'activas' ? 'var(--color-primario)' : 'var(--texto-secundario)',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: pestanaActiva === 'activas' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Calendar size={16} />
                    <span>Tours Próximos y Activos</span>
                    <span
                      style={{
                        backgroundColor: pestanaActiva === 'activas' ? 'var(--color-primario)' : 'rgba(0,0,0,0.1)',
                        color: pestanaActiva === 'activas' ? '#FFFFFF' : 'inherit',
                        fontSize: '0.72rem',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}
                    >
                      {reservasActivas.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPestanaActiva('historial')}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '9px',
                      border: 'none',
                      backgroundColor: pestanaActiva === 'historial' ? '#FFFFFF' : 'transparent',
                      color: pestanaActiva === 'historial' ? 'var(--color-primario)' : 'var(--texto-secundario)',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: pestanaActiva === 'historial' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <History size={16} />
                    <span>Historial de Tours Realizados</span>
                    <span
                      style={{
                        backgroundColor: pestanaActiva === 'historial' ? 'var(--color-primario)' : 'rgba(0,0,0,0.1)',
                        color: pestanaActiva === 'historial' ? '#FFFFFF' : 'inherit',
                        fontSize: '0.72rem',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}
                    >
                      {reservasHistorial.length}
                    </span>
                  </button>
                </div>

                <span style={{ fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
                  Total en cuenta: {reservas.length} reserva{reservas.length === 1 ? '' : 's'}
                </span>
              </div>

              {reservasAMostrar.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px dashed var(--borde-sutil)',
                    padding: '3.5rem 1.5rem',
                    textAlign: 'center'
                  }}
                >
                  <Compass size={44} color="var(--color-dorado)" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '0.4rem' }}>
                    {pestanaActiva === 'activas' ? 'No tienes tours próximos agendados' : 'Aún no registras historial de tours anteriores'}
                  </h4>
                  <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    {pestanaActiva === 'activas'
                      ? 'Explora nuestro catálogo de Bogotá Colonial, Monserrate, Distrito Graffiti o rutas del café y reserva con agencias formales.'
                      : 'Aquí aparecerán todos los recorridos que hayas completado o tomado en fechas anteriores.'}
                  </p>
                  <button onClick={alExplorarTours} className="boton boton-primario">
                    Explorar Paquetes Disponibles
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {reservasAMostrar.map((res) => {
                    const evaluacionHecha = mapaEvaluaciones[res.id] || mapaEvaluaciones[res.codigo_reserva];
                    const fechaPasada = esFechaPasada(res.fecha_reserva || res.fechaReserva);
                    const esCompletada = res.estado === 'completada' || Boolean(evaluacionHecha);
                    const tieneGuia = Boolean(res.id_guia_asignado || res.nombre_guia_asignado);

                    return (
                      <div
                        key={res.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid var(--borde-sutil)',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primario)',
                                  backgroundColor: 'rgba(23, 74, 91, 0.08)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px'
                                }}
                              >
                                {res.codigo_reserva || `#RES-${res.id.slice(0, 6)}`}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>
                                📅 Fecha: {res.fecha_reserva || res.fechaReserva} · ⏰ {res.hora_reserva || res.horaReserva}
                              </span>
                              {fechaPasada && !esCompletada && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                                  Fecha de tour transcurrida
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--texto-principal)', margin: '0.35rem 0 0' }}>
                              {res.titulo_paquete || res.tituloPaquete || 'Tour Bogotá'}
                            </h4>
                          </div>

                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '8px',
                              backgroundColor: esCompletada
                                ? 'var(--color-exito-fondo)'
                                : res.estado === 'confirmada'
                                ? 'var(--color-primario-claro)'
                                : 'var(--color-advertencia-fondo)',
                              color: esCompletada
                                ? 'var(--color-exito)'
                                : res.estado === 'confirmada'
                                ? 'var(--color-primario)'
                                : 'var(--color-advertencia)',
                              textTransform: 'capitalize'
                            }}
                          >
                            {esCompletada ? 'Completada' : res.estado}
                          </span>
                        </div>

                        {/* Datos del Prestador y Guía */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '0.75rem',
                            backgroundColor: 'var(--fondo-principal)',
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.84rem'
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                              Agencia Operadora:
                            </span>
                            <strong style={{ color: 'var(--color-primario)' }}>
                              {res.nombre_agencia || res.nombreAgencia || 'Agencia Formal'}
                            </strong>
                          </div>

                          <div>
                            <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                              Guía Asignado:
                            </span>
                            <strong>
                              {tieneGuia ? res.nombre_guia_asignado || res.nombreGuiaAsignado : 'Por asignar'}
                            </strong>
                          </div>

                          <div>
                            <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                              Asistentes & Valor:
                            </span>
                            <span>{res.cantidad_personas || res.cantidadPersonas || 1} personas · ${(res.precio_total || res.precioTotal || 0).toLocaleString('es-CO')}</span>
                          </div>
                        </div>

                        {/* Punto Exacto de Encuentro */}
                        {res.punto_encuentro && (
                          <div
                            style={{
                              backgroundColor: 'rgba(23, 74, 91, 0.05)',
                              border: '1px solid rgba(23, 74, 91, 0.12)',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.65rem'
                            }}
                          >
                            <MapPin size={18} color="var(--color-primario)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primario)', display: 'block', letterSpacing: '0.5px' }}>
                                Punto Exacto de Encuentro:
                              </span>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: 'var(--texto-principal)', fontWeight: 600 }}>
                                {res.punto_encuentro}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Recomendaciones e Inclusiones */}
                        {(res.recomendaciones || res.que_incluye) && (
                          <div
                            style={{
                              backgroundColor: '#FFFBEB',
                              border: '1px solid #FDE68A',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            {res.recomendaciones && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                <Info size={17} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#B45309', display: 'block' }}>
                                    Recomendaciones para el Tour:
                                  </span>
                                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.83rem', color: '#78350F' }}>
                                    {res.recomendaciones}
                                  </p>
                                </div>
                              </div>
                            )}

                            {res.que_incluye && (
                              <div style={{ fontSize: '0.8rem', color: '#92400E', borderTop: '1px dashed #FDE68A', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                <strong>Incluye:</strong> {res.que_incluye}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sección de Calificación y Acciones */}
                        <div
                          style={{
                            borderTop: '1px solid var(--borde-sutil)',
                            paddingTop: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}
                        >
                          {evaluacionHecha ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-exito)' }}>
                                <CheckCircle2 size={16} />
                                <strong>¡Experiencia calificada!</strong>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                                Tour: <strong>{evaluacionHecha.calificacion_tour} ★</strong>
                                {evaluacionHecha.calificacion_guia && (
                                  <> · Guía: <strong>{evaluacionHecha.calificacion_guia} ★</strong></>
                                )}
                              </span>
                            </div>
                          ) : esCompletada ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-secundario)', fontSize: '0.84rem' }}>
                              <Star size={16} color="var(--color-dorado)" />
                              <span>Tu recorrido finalizó. ¡Cuéntale a otros viajeros cómo fue tu experiencia!</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-atenuado)', fontSize: '0.82rem' }}>
                              <Clock size={15} />
                              <span>
                                {fechaPasada
                                  ? 'La fecha programada ya pasó. Puedes marcarlo como realizado para calificarlo.'
                                  : 'Puedes marcar el tour como realizado una vez lo hayas tomado para evaluarlo.'}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {!evaluacionHecha && esCompletada && (
                              <button
                                onClick={() => abrirEvaluar(res)}
                                className="boton boton-primario boton-pequeno"
                                style={{ gap: '0.35rem' }}
                              >
                                <Star size={14} fill="#FFFFFF" />
                                <span>Calificar Tour y Guía</span>
                              </button>
                            )}

                            {!evaluacionHecha && !esCompletada && (
                              <button
                                onClick={() => manejarCompletarReserva(res.id)}
                                className="boton boton-contorno boton-pequeno"
                                style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                                title="Si ya tomaste o finalizó este recorrido, márcalo como realizado para calificar"
                              >
                                <CheckCircle2 size={14} color="var(--color-primario)" />
                                <span>Marcar como Realizado</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Historial de Evaluaciones Hechas por el Turista */}
            {evaluaciones.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--borde-sutil)',
                  padding: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} color="var(--color-dorado)" />
                    <span>Mis Reseñas y Opiniones Públicas</span>
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                    {evaluaciones.length} reseña{evaluaciones.length === 1 ? '' : 's'} registrada{evaluaciones.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {evaluaciones.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--fondo-principal)',
                        border: '1px solid var(--borde-sutil)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--texto-principal)', margin: 0 }}>
                            {ev.titulo_paquete}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                            Agencia: {ev.nombre_agencia} {ev.nombre_guia ? `· Guía: ${ev.nombre_guia}` : ''}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--texto-atenuado)' }}>
                          {new Date(ev.creado_en).toLocaleDateString('es-CO')}
                        </span>
                      </div>

                      {/* Desglose de Calificaciones */}
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primario)', display: 'block' }}>
                            Experiencia del Tour:
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dorado-hover)' }}>
                            {'★'.repeat(ev.calificacion_tour)}{'☆'.repeat(5 - ev.calificacion_tour)} ({ev.calificacion_tour}/5)
                          </span>
                          {ev.comentario_tour && (
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
                              "{ev.comentario_tour}"
                            </p>
                          )}
                        </div>

                        {ev.calificacion_guia && (
                          <div>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-secundario)', display: 'block' }}>
                              Desempeño del Guía:
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dorado-hover)' }}>
                              {'★'.repeat(ev.calificacion_guia)}{'☆'.repeat(5 - ev.calificacion_guia)} ({ev.calificacion_guia}/5)
                            </span>
                            {ev.comentario_guia && (
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
                                "{ev.comentario_guia}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Respuestas de Agencia o Guía */}
                      {ev.respuesta_agencia && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            borderLeft: '3px solid var(--color-primario)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <strong style={{ color: 'var(--color-primario)' }}>Respuesta de {ev.nombre_agencia}:</strong>{' '}
                          <span style={{ color: 'var(--texto-secundario)' }}>{ev.respuesta_agencia}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Calificación con Doble Dimensión */}
      {reservaParaEvaluar && (
        <ModalEvaluacionServicio
          abierto={modalEvaluacionAbierto}
          alCerrar={() => setModalEvaluacionAbierto(false)}
          reserva={reservaParaEvaluar}
          alEnviar={manejarEnviarEvaluacion}
          alReportarProblema={alReportarIncidente}
        />
      )}
    </div>
  );
};
