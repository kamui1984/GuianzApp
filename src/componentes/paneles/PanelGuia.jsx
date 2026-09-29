import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioGuias } from '../../api/guiasServicio';
import { servicioAdministracion } from '../../api/administracionServicio';
import { Cargando } from '../comunes/Cargando';
import { InsigniaEstado } from '../comunes/InsigniaEstado';
import { Modal } from '../comunes/Modal';
import { SelectorEspecialidades } from '../comunes/SelectorEspecialidades';
import {
  Compass,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Award,
  Languages,
  AlertCircle,
  Loader2,
  Save,
  Camera,
  Bell,
  Building2,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  MessageCircle,
  ShieldCheck,
  FileText,
  Tag,
  Sparkles
} from 'lucide-react';

export const PanelGuia = () => {
  const { usuarioActual, mostrarNotificacion, recargarUsuario } = useAutenticacion();
  const [pestanaActiva, setPestanaActiva] = useState('disponibilidad'); // 'disponibilidad' | 'tours-asignados' | 'perfil'
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [toursAsignados, setToursAsignados] = useState([]);
  const [perfilGuia, setPerfilGuia] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para modal de disponibilidad
  const [modalDisponibilidadAbierto, setModalDisponibilidadAbierto] = useState(false);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [modoPeriodo, setModoPeriodo] = useState('rango'); // 'puntual' | 'rango'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [horaFin, setHoraFin] = useState('15:00');
  const [estaDisponible, setEstaDisponible] = useState(true);
  const [notas, setNotas] = useState('');
  const [guardandoDisponibilidad, setGuardandoDisponibilidad] = useState(false);

  // Estados para formulario de perfil profesional (perfil_guias)
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tarjetaProfesional, setTarjetaProfesional] = useState('');
  const [numeroRnt, setNumeroRnt] = useState('');
  const [telefonoPrincipal, setTelefonoPrincipal] = useState('');
  const [tieneWhatsapp, setTieneWhatsapp] = useState(true);
  const [telefonoAlternativo, setTelefonoAlternativo] = useState('');
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState('');
  const [contactoEmergenciaTel, setContactoEmergenciaTel] = useState('');
  const [reseñaCorta, setReseñaCorta] = useState('');
  const [experienciaDetalle, setExperienciaDetalle] = useState('');
  const [competenciasTec, setCompetenciasTec] = useState('');
  const [idiomas, setIdiomas] = useState('Español');
  const [especialidadesIds, setEspecialidadesIds] = useState([]);
  const [fotoRostroArchivo, setFotoRostroArchivo] = useState(null);
  const [previsualizacionFoto, setPrevisualizacionFoto] = useState(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Estados para reenvío de solicitud si fue rechazado
  const [modalReenvioAbierto, setModalReenvioAbierto] = useState(false);
  const [nuevoArchivoRnt, setNuevoArchivoRnt] = useState(null);
  const [nuevaTarjetaProfesional, setNuevaTarjetaProfesional] = useState(null);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);

  const esGuiaRechazado = usuarioActual?.estado === 'rechazado';

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaDisp, tours, perfil] = await Promise.all([
        servicioGuias.listarDisponibilidad().catch(() => []),
        servicioGuias.listarToursAsignados().catch(() => []),
        servicioGuias.obtenerPerfil().catch(() => null)
      ]);
      setDisponibilidades(listaDisp);
      setToursAsignados(tours);
      if (perfil) {
        setPerfilGuia(perfil);
        setNombreCompleto(perfil.nombreCompleto || '');
        const rntVal = perfil.tarjetaProfesional || perfil.numeroRnt || '';
        setTarjetaProfesional(rntVal);
        setNumeroRnt(rntVal);
        setTelefonoPrincipal(perfil.telefonoPrincipal || '');
        setTieneWhatsapp(perfil.tieneWhatsapp !== false);
        setTelefonoAlternativo(perfil.telefonoAlternativo || '');
        setContactoEmergenciaNombre(perfil.contactoEmergenciaNombre || '');
        setContactoEmergenciaTel(perfil.contactoEmergenciaTel || '');
        setReseñaCorta(perfil.reseñaCorta || perfil.resenaCorta || '');
        setExperienciaDetalle(perfil.experienciaDetalle || '');
        setCompetenciasTec(perfil.competenciasTec || '');
        setIdiomas(perfil.idiomas || 'Español');
        setEspecialidadesIds(perfil.especialidadesIds || []);
        setPrevisualizacionFoto(perfil.urlFotoRostro || null);
      }
    } catch (error) {
      console.error('Error al cargar panel de guía:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCrearDisponibilidad = () => {
    setIdEnEdicion(null);
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
    setHoraInicio('07:00');
    setHoraFin('15:00');
    setEstaDisponible(true);
    setNotas('');
    setModoPeriodo('rango');
    setModalDisponibilidadAbierto(true);
  };

  const abrirEditarDisponibilidad = (item) => {
    setIdEnEdicion(item.id);
    setFechaInicio(item.fecha);
    setFechaFin(item.fecha);
    setHoraInicio(item.horaInicio || '07:00');
    setHoraFin(item.horaFin || '15:00');
    setEstaDisponible(item.estaDisponible !== false);
    setNotas(item.notas || '');
    setModoPeriodo('puntual');
    setModalDisponibilidadAbierto(true);
  };

  const manejarGuardarDisponibilidad = async (e) => {
    e.preventDefault();
    setGuardandoDisponibilidad(true);

    try {
      const payload = {
        fecha: fechaInicio,
        fechaInicio,
        fechaFin: modoPeriodo === 'rango' ? fechaFin : fechaInicio,
        horaInicio,
        horaFin,
        estaDisponible,
        notas
      };

      if (idEnEdicion) {
        await servicioGuias.actualizarDisponibilidad(idEnEdicion, payload);
        mostrarNotificacion('Disponibilidad actualizada.');
      } else {
        const res = await servicioGuias.crearDisponibilidad(payload);
        mostrarNotificacion(res.mensaje || 'Disponibilidad registrada correctamente.');
      }

      setModalDisponibilidadAbierto(false);
      const listaActualizada = await servicioGuias.listarDisponibilidad();
      setDisponibilidades(listaActualizada);
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al guardar disponibilidad.', 'error');
    } finally {
      setGuardandoDisponibilidad(false);
    }
  };

  const manejarEliminarDisponibilidad = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta fecha de tu calendario de disponibilidad?')) return;

    try {
      await servicioGuias.eliminarDisponibilidad(id);
      mostrarNotificacion('Franja eliminada.');
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al eliminar.', 'error');
    }
  };

  const manejarSeleccionarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFotoRostroArchivo(archivo);
      setPrevisualizacionFoto(URL.createObjectURL(archivo));
    }
  };

  const manejarGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    try {
      const datosForm = new FormData();
      datosForm.append('nombreCompleto', nombreCompleto);
      datosForm.append('tarjetaProfesional', tarjetaProfesional);
      datosForm.append('numeroRnt', tarjetaProfesional);
      datosForm.append('telefonoPrincipal', telefonoPrincipal);
      datosForm.append('tieneWhatsapp', tieneWhatsapp);
      datosForm.append('telefonoAlternativo', telefonoAlternativo);
      datosForm.append('contactoEmergenciaNombre', contactoEmergenciaNombre);
      datosForm.append('contactoEmergenciaTel', contactoEmergenciaTel);
      datosForm.append('reseñaCorta', reseñaCorta);
      datosForm.append('experienciaDetalle', experienciaDetalle);
      datosForm.append('competenciasTec', competenciasTec);
      datosForm.append('idiomas', idiomas);
      datosForm.append('especialidadesIds', JSON.stringify(especialidadesIds));

      if (fotoRostroArchivo) {
        datosForm.append('fotoRostro', fotoRostroArchivo);
      }

      await servicioGuias.actualizarPerfil(datosForm);
      mostrarNotificacion('¡Perfil profesional y especialidades de guía actualizados exitosamente!');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al actualizar perfil.', 'error');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const manejarReenviarSolicitud = async (e) => {
    e.preventDefault();
    setEnviandoReenvio(true);

    try {
      const datosForm = new FormData();
      datosForm.append('nombreCompleto', nombreCompleto);
      datosForm.append('numeroRnt', tarjetaProfesional || numeroRnt);
      datosForm.append('tarjetaProfesional', tarjetaProfesional || numeroRnt);
      datosForm.append('especialidadesIds', JSON.stringify(especialidadesIds));
      datosForm.append('idiomas', idiomas);
      if (nuevoArchivoRnt) {
        datosForm.append('rntDocument', nuevoArchivoRnt);
      }
      if (nuevaTarjetaProfesional) {
        datosForm.append('professionalCard', nuevaTarjetaProfesional);
      }

      await servicioAdministracion.reenviarSolicitud(datosForm);
      mostrarNotificacion('¡Solicitud de guía reenviada! El administrador la revisará.');
      setModalReenvioAbierto(false);
      await recargarUsuario();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al reenviar solicitud.', 'error');
    } finally {
      setEnviandoReenvio(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="contenedor">
        {/* Cabecera del Panel de Guía */}
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
            {previsualizacionFoto ? (
              <img
                src={previsualizacionFoto}
                alt="Foto de rostro"
                style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
              />
            ) : (
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <Compass size={28} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {perfilGuia?.nombreCompleto || usuarioActual?.nombreCompleto || 'Mi Perfil de Guía'}
                </h1>
                <InsigniaEstado estado={usuarioActual?.estado} />
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
                RNT Guía: <strong>{perfilGuia?.numeroRnt || usuarioActual?.numeroRnt || 'En validación'}</strong> · {usuarioActual?.correo}
              </p>
            </div>
          </div>

          <button onClick={abrirCrearDisponibilidad} className="boton boton-primario" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            <span>Registrar Disponibilidad</span>
          </button>
        </div>

        {/* Banner de Rechazo de Solicitud */}
        {esGuiaRechazado && (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              color: '#fecaca',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '1rem', color: '#f87171', display: 'block', marginBottom: '0.3rem' }}>
                  Tu solicitud de guía profesional ha sido observada por el administrador
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#f3f4f6', lineHeight: 1.5 }}>
                  <strong>Motivo de rechazo:</strong>{' '}
                  {usuarioActual?.motivoRechazo || 'Tarjeta profesional o RNT ilegibles o desactualizados.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalReenvioAbierto(true)}
                className="boton boton-primario boton-pequeno"
                style={{ gap: '0.4rem', backgroundColor: '#ef4444' }}
              >
                <Send size={15} />
                <span>Corregir Documentos y Reenviar Solicitud</span>
              </button>
            </div>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPestanaActiva('disponibilidad')}
            className={`boton ${pestanaActiva === 'disponibilidad' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Calendar size={17} />
            <span>Mi Disponibilidad ({disponibilidades.length})</span>
          </button>
          <button
            onClick={() => setPestanaActiva('tours-asignados')}
            className={`boton ${pestanaActiva === 'tours-asignados' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Bell size={17} />
            <span>Tours Asignados ({toursAsignados.length})</span>
          </button>
          <button
            onClick={() => setPestanaActiva('perfil')}
            className={`boton ${pestanaActiva === 'perfil' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Edit2 size={17} />
            <span>Mi Perfil & Foto de Rostro</span>
          </button>
        </div>

        {/* Contenido */}
        {cargando ? (
          <Cargando mensaje="Cargando disponibilidad y perfil..." />
        ) : pestanaActiva === 'disponibilidad' ? (
          /* Pestaña: Mi Disponibilidad */
          <div>
            {disponibilidades.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.12)'
                }}
              >
                <Calendar size={40} color="#9ca3af" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No tienes disponibilidad configurada
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                  Registra tus días puntuales o periodos largos (ej. del 23 al 30 de septiembre de 07:00 a 15:00) para que las agencias puedan asignarte recorridos turísticos.
                </p>
                <button onClick={abrirCrearDisponibilidad} className="boton boton-primario">
                  <Plus size={16} />
                  <span>Registrar Primer Periodo o Fecha</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {disponibilidades.map((item) => {
                  // Verificar si hay algún tour asignado que coincida con esta fecha o periodo
                  const toursEnEstaFecha = (toursAsignados || []).filter((tour) => {
                    const fTour = tour.fechaReserva || tour.fecha_reserva;
                    if (!fTour) return false;
                    if (item.fechaFin) {
                      return fTour >= item.fecha && fTour <= item.fechaFin;
                    }
                    return fTour === item.fecha;
                  });

                  const estaComprometidoEnTour = toursEnEstaFecha.length > 0;

                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: estaComprometidoEnTour
                          ? '2px solid var(--color-dorado)'
                          : '1px solid var(--borde-sutil)',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                        boxShadow: estaComprometidoEnTour
                          ? '0 4px 16px rgba(198, 161, 91, 0.15)'
                          : '0 2px 8px rgba(30, 41, 51, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primario)', fontWeight: 800 }}>
                          <Calendar size={16} />
                          <span>{item.fecha} {item.fechaFin && item.fechaFin !== item.fecha ? `al ${item.fechaFin}` : ''}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: estaComprometidoEnTour
                              ? 'var(--color-advertencia-fondo)'
                              : item.estaDisponible
                              ? 'var(--color-exito-fondo)'
                              : 'var(--color-peligro-fondo)',
                            color: estaComprometidoEnTour
                              ? '#785311'
                              : item.estaDisponible
                              ? 'var(--color-exito)'
                              : 'var(--color-peligro)',
                            border: estaComprometidoEnTour
                              ? '1px solid var(--color-dorado)'
                              : 'none'
                          }}
                        >
                          {estaComprometidoEnTour
                            ? '🔒 Comprometido en Tour'
                            : item.estaDisponible
                            ? 'Disponible'
                            : 'Ocupado'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--texto-secundario)', fontSize: '0.85rem' }}>
                        <Clock size={15} />
                        <span>{item.horaInicio || '07:00'} - {item.horaFin || '15:00'}</span>
                      </div>

                      {item.notas && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--texto-principal)', backgroundColor: 'var(--fondo-secundario)', padding: '0.5rem', borderRadius: '6px', margin: 0 }}>
                          {item.notas}
                        </p>
                      )}

                      {/* Alerta de Tour Asignado por Agencia */}
                      {estaComprometidoEnTour && (
                        <div
                          style={{
                            marginTop: '0.4rem',
                            padding: '0.75rem 0.85rem',
                            backgroundColor: 'var(--color-advertencia-fondo)',
                            border: '1.5px solid var(--color-dorado)',
                            borderRadius: '10px',
                            color: 'var(--texto-principal)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#785311', marginBottom: '0.35rem', fontSize: '0.84rem' }}>
                            <AlertTriangle size={15} color="#9A6B16" />
                            <span>¡Tour Asignado por Agencia!</span>
                          </div>
                          {toursEnEstaFecha.map((t) => (
                            <div key={t.id} style={{ fontSize: '0.82rem', marginBottom: '0.35rem', lineHeight: 1.4 }}>
                              • <strong>{t.tituloPaquete}</strong> ({t.horaReserva || '09:00 AM'})
                              <div style={{ fontSize: '0.76rem', color: 'var(--texto-secundario)', marginLeft: '0.7rem' }}>
                                Agencia: <strong style={{ color: 'var(--texto-principal)' }}>{t.nombreAgencia || t.agencia?.nombreAgencia || 'Agencia Operadora'}</strong>
                              </div>
                            </div>
                          ))}
                          <div style={{ fontSize: '0.73rem', color: '#785311', marginTop: '0.35rem', fontStyle: 'italic', borderTop: '1px dashed rgba(198, 161, 91, 0.4)', paddingTop: '0.35rem' }}>
                            🔒 Comprometido oficialmente. Ya no figuras disponible para otras agencias en este horario mientras el tour esté asignado.
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--borde-sutil)',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0.5rem'
                        }}
                      >
                        <button
                          onClick={() => abrirEditarDisponibilidad(item)}
                          className="boton boton-contorno boton-pequeno"
                          title="Editar franja"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => manejarEliminarDisponibilidad(item.id)}
                          className="boton boton-peligro boton-pequeno"
                          title="Eliminar franja"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : pestanaActiva === 'tours-asignados' ? (
          /* Pestaña: Tours y Recorridos Asignados */
          <div>
            {toursAsignados.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.12)'
                }}
              >
                <Bell size={40} color="#38bdf8" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No tienes tours asignados por agencias en este momento
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto' }}>
                  Cuando una agencia operadora te asigne a un tour vendido que coincida con tus horarios disponibles, aparecerá la notificación y los detalles aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {toursAsignados.map((tour) => (
                  <div
                    key={tour.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '16px',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.1rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {/* Encabezado con Título y Estado */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.82rem',
                            color: '#10b981',
                            fontWeight: 700,
                            marginBottom: '0.25rem'
                          }}
                        >
                          <Sparkles size={14} />
                          ¡Has sido asignado oficialmente por la Agencia!
                        </span>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                          {tour.tituloPaquete}
                        </h3>
                      </div>
                      <span
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#059669',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '9999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle size={14} />
                        Confirmado / Asignado
                      </span>
                    </div>

                    {/* Resumen de Fecha, Horario y Turistas */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.9rem 1.1rem',
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                        <Calendar size={18} color="#0284c7" />
                        <span>Fecha: <strong style={{ color: '#0f172a' }}>{tour.fechaReserva}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                        <Clock size={18} color="#0284c7" />
                        <span>Horario: <strong style={{ color: '#0f172a' }}>{tour.horaReserva}</strong> ({tour.duracion})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                        <Phone size={18} color="#0284c7" />
                        <span>Turista: <strong style={{ color: '#0f172a' }}>{tour.nombreTitular}</strong> ({tour.cantidadPersonas} pers.)</span>
                      </div>
                    </div>

                    {/* Descripción Completa del Tour */}
                    <div
                      style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '12px',
                        padding: '1rem 1.15rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem', color: '#0369a1', fontWeight: 700, fontSize: '0.9rem' }}>
                        <FileText size={17} />
                        <span>Descripción del Tour / Itinerario:</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.55 }}>
                        {tour.descripcionTour || tour.descripcion || 'Recorrido turístico guiado en Bogotá.'}
                      </p>
                    </div>

                    {/* Datos de Contacto de la Agencia (Nombre, Teléfono, Correo) */}
                    <div
                      style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#b45309', fontWeight: 700, fontSize: '0.92rem' }}>
                        <Building2 size={17} />
                        <span>Datos de Contacto de la Agencia Operadora:</span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '0.75rem',
                          fontSize: '0.88rem'
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Nombre de la Agencia:</span>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{tour.nombreAgencia || 'Agencia Operadora'}</strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Teléfono de Contacto:</span>
                          <a
                            href={`tel:${tour.telefonoAgencia || '3001234567'}`}
                            style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Phone size={14} />
                            {tour.telefonoAgencia || '3001234567'}
                          </a>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Correo Electrónico:</span>
                          <a
                            href={`mailto:${tour.correoAgencia || 'contacto@agencia.com'}`}
                            style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Mail size={14} />
                            {tour.correoAgencia || 'contacto@agencia.com'}
                          </a>
                        </div>
                      </div>

                      {/* Acciones Rápidas para el Guía (WhatsApp directo y Correo) */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                        <a
                          href={`https://wa.me/57${String(tour.telefonoAgencia || '3001234567').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${tour.nombreAgencia || 'Agencia'}, te escribe tu guía asignado para el tour "${tour.tituloPaquete}" programado para el ${tour.fechaReserva} a las ${tour.horaReserva}. Quedo atento a las indicaciones previas.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="boton boton-pequeno"
                          style={{
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            textDecoration: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '0.45rem 0.9rem',
                            borderRadius: '8px'
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>Contactar Agencia por WhatsApp</span>
                        </a>

                        {tour.correoAgencia && (
                          <a
                            href={`mailto:${tour.correoAgencia}?subject=${encodeURIComponent(
                              `Guía Asignado - Tour: ${tour.tituloPaquete}`
                            )}&body=${encodeURIComponent(
                              `Hola ${tour.nombreAgencia},\n\nHe recibido la asignación para el tour "${tour.tituloPaquete}" con fecha ${tour.fechaReserva} a las ${tour.horaReserva}.\n\nQuedo a su disposición para coordinar los detalles de logística.\n\nSaludos cordiales.`
                            )}`}
                            className="boton boton-contorno boton-pequeno"
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.9rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Mail size={15} />
                            <span>Enviar Correo a la Agencia</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Formulario de Perfil Profesional y Foto de Rostro */
          <div
            style={{
              maxWidth: '680px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '2rem'
            }}
          >
            <form onSubmit={manejarGuardarPerfil}>
              {/* Carga de Foto de Rostro */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{ position: 'relative' }}>
                  {previsualizacionFoto ? (
                    <img
                      src={previsualizacionFoto}
                      alt="Foto de rostro"
                      style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #38bdf8' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}
                    >
                      <Camera size={32} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="boton boton-contorno boton-pequeno" style={{ cursor: 'pointer', gap: '0.4rem' }}>
                    <Camera size={15} />
                    <span>Cambiar Foto de Rostro</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={manejarSeleccionarFoto}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                    Foto de perfil nítida para que las agencias y turistas reconozcan al guía.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Nombre Completo Comercial</label>
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="campo-formulario"
                    placeholder="Ej: Laura Sofía Mendoza"
                  />
                </div>

                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Registro Nacional de Turismo / Tarjeta Profesional</label>
                  <input
                    type="text"
                    required
                    value={tarjetaProfesional}
                    onChange={(e) => setTarjetaProfesional(e.target.value)}
                    className="campo-formulario"
                    placeholder="Ej: RNT-84920"
                  />
                </div>
              </div>

              {/* Teléfonos y WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Teléfono Móvil Principal (con indicativo)</label>
                  <input
                    type="tel"
                    required
                    value={telefonoPrincipal}
                    onChange={(e) => setTelefonoPrincipal(e.target.value)}
                    placeholder="+573001234567"
                    className="campo-formulario"
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#10b981' }}>
                    <input
                      type="checkbox"
                      checked={tieneWhatsapp}
                      onChange={(e) => setTieneWhatsapp(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>Tiene WhatsApp activo en este número (para chat directo con agencias)</span>
                  </label>
                </div>

                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Teléfono Alternativo (Opcional)</label>
                  <input
                    type="tel"
                    value={telefonoAlternativo}
                    onChange={(e) => setTelefonoAlternativo(e.target.value)}
                    placeholder="Ej: +573109876543"
                    className="campo-formulario"
                  />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Segundo número de contacto si falla el principal.</span>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} />
                  <span>Protocolo de Seguridad: Contacto de Emergencia</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="grupo-formulario" style={{ marginBottom: 0 }}>
                    <label className="etiqueta-formulario">Nombre del Contacto</label>
                    <input
                      type="text"
                      required
                      value={contactoEmergenciaNombre}
                      onChange={(e) => setContactoEmergenciaNombre(e.target.value)}
                      placeholder="Ej: Carlos Mendoza (Hermano)"
                      className="campo-formulario"
                    />
                  </div>
                  <div className="grupo-formulario" style={{ marginBottom: 0 }}>
                    <label className="etiqueta-formulario">Teléfono de Emergencia</label>
                    <input
                      type="tel"
                      required
                      value={contactoEmergenciaTel}
                      onChange={(e) => setContactoEmergenciaTel(e.target.value)}
                      placeholder="Ej: +573154443322"
                      className="campo-formulario"
                    />
                  </div>
                </div>
              </div>

              {/* Gancho comercial / Reseña corta */}
              <div className="grupo-formulario" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="etiqueta-formulario" style={{ marginBottom: 0 }}>Reseña Corta de Presentación (Gancho comercial)</label>
                  <span style={{ fontSize: '0.75rem', color: reseñaCorta.length > 280 ? '#f59e0b' : '#9ca3af' }}>
                    {reseñaCorta.length}/300 caracteres
                  </span>
                </div>
                <textarea
                  required
                  maxLength={300}
                  rows={2}
                  value={reseñaCorta}
                  onChange={(e) => setReseñaCorta(e.target.value)}
                  placeholder="Ej: Guía bilingüe apasionado por el patrimonio colonial y la historia social de Bogotá. Más de 6 años liderando rutas inolvidables en La Candelaria y Cerros Orientales."
                  className="campo-formulario"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Experiencia detallada */}
              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Experiencia y Fortalezas Detalladas</label>
                <textarea
                  required
                  rows={3}
                  value={experienciaDetalle}
                  onChange={(e) => setExperienciaDetalle(e.target.value)}
                  placeholder="Detalla tu trayectoria, tours destacados que has operado, perfil de turistas que atiendes (familias, académicos, grupos corporativos)..."
                  className="campo-formulario"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Competencias técnicas e Idiomas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Competencias Técnicas y Certificaciones</label>
                  <input
                    type="text"
                    value={competenciasTec}
                    onChange={(e) => setCompetenciasTec(e.target.value)}
                    placeholder="Ej: Primeros auxilios WFA, Certificación WAFA, Manejo de cuerdas"
                    className="campo-formulario"
                  />
                </div>

                <div className="grupo-formulario">
                  <label className="etiqueta-formulario">Idiomas que Dominas</label>
                  <input
                    type="text"
                    required
                    value={idiomas}
                    onChange={(e) => setIdiomas(e.target.value)}
                    placeholder="Ej: Español nativo, Inglés C1, Francés B2"
                    className="campo-formulario"
                  />
                </div>
              </div>

              {/* Selector de Especialidades por Categorías */}
              <div style={{ marginTop: '1.25rem' }}>
                <SelectorEspecialidades
                  seleccionadas={especialidadesIds}
                  alCambiar={setEspecialidadesIds}
                  titulo="Mis Especialidades y Rutas Temáticas"
                  subtitulo="Marca las categorías y subcategorías que dominas. Las agencias verán tu perfil recomendado automáticamente al crear tours con estas etiquetas."
                />
              </div>

              <button
                type="submit"
                disabled={guardandoPerfil}
                className="boton boton-primario"
                style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
              >
                {guardandoPerfil ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                    <span>Guardando perfil y especialidades...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar Perfil Profesional y Especialidades</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Disponibilidad con soporte para Periodos Largos */}
      <Modal
        abierto={modalDisponibilidadAbierto}
        alCerrar={() => setModalDisponibilidadAbierto(false)}
        titulo={idEnEdicion ? 'Editar Franja' : 'Registrar Disponibilidad'}
        anchoMaximo="520px"
      >
        <form onSubmit={manejarGuardarDisponibilidad}>
          {!idEnEdicion && (
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}
            >
              <button
                type="button"
                onClick={() => setModoPeriodo('rango')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: modoPeriodo === 'rango' ? '#0ea5e9' : 'transparent',
                  color: modoPeriodo === 'rango' ? '#fff' : '#9ca3af',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Periodo Largo (Rango de Fechas)
              </button>
              <button
                type="button"
                onClick={() => setModoPeriodo('puntual')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: modoPeriodo === 'puntual' ? '#0ea5e9' : 'transparent',
                  color: modoPeriodo === 'puntual' ? '#fff' : '#9ca3af',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Día Puntual
              </button>
            </div>
          )}

          {modoPeriodo === 'rango' && !idEnEdicion ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Fecha Inicial</label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="campo-formulario"
                />
              </div>
              <div className="grupo-formulario">
                <label className="etiqueta-formulario">Fecha Final</label>
                <input
                  type="date"
                  required
                  min={fechaInicio}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="campo-formulario"
                />
              </div>
            </div>
          ) : (
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">Fecha</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="campo-formulario"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">Hora Inicio</label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="campo-formulario"
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">Hora Fin</label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="campo-formulario"
              />
            </div>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Notas / Observaciones (Opcional)</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Disponible de 7 am a 3 pm para La Candelaria y Monserrate"
              className="campo-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setModalDisponibilidadAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoDisponibilidad}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {guardandoDisponibilidad ? (
                <>
                  <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Disponibilidad</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Reenvío de Solicitud de Guía */}
      <Modal
        abierto={modalReenvioAbierto}
        alCerrar={() => setModalReenvioAbierto(false)}
        titulo="Corregir y Reenviar Solicitud de Guía"
        anchoMaximo="540px"
      >
        <form onSubmit={manejarReenviarSolicitud}>
          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Nombre completo</label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Número de RNT / Tarjeta Profesional</label>
            <input
              type="text"
              required
              value={numeroRnt || tarjetaProfesional}
              onChange={(e) => {
                setNumeroRnt(e.target.value);
                setTarjetaProfesional(e.target.value);
              }}
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Nuevo Certificado RNT (PDF o Imagen)</label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setNuevoArchivoRnt(e.target.files[0])}
              className="campo-formulario"
              style={{ padding: '0.5rem' }}
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Nueva Tarjeta Profesional (PDF o Imagen)</label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setNuevaTarjetaProfesional(e.target.files[0])}
              className="campo-formulario"
              style={{ padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setModalReenvioAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviandoReenvio}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {enviandoReenvio ? (
                <>
                  <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                  <span>Reenviando...</span>
                </>
              ) : (
                <span>Reenviar a Verificación</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
