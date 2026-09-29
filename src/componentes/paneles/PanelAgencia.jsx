import React, { useState, useEffect, useMemo } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioPaquetes } from '../../api/paquetesServicio';
import { servicioGuias } from '../../api/guiasServicio';
import { servicioAdministracion } from '../../api/administracionServicio';
import { Cargando } from '../comunes/Cargando';
import { InsigniaEstado } from '../comunes/InsigniaEstado';
import { Modal } from '../comunes/Modal';
import { SelectorEspecialidades } from '../comunes/SelectorEspecialidades';
import { ConfiguradorProgramacionTour } from './ConfiguradorProgramacionTour';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Users,
  Building2,
  FileUp,
  Image,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  UserCheck,
  AlertTriangle,
  Loader2,
  Languages,
  Award,
  Phone,
  Mail,
  Send,
  Sparkles,
  Check,
  Tag,
  MessageCircle,
  Eye,
  FileText
} from 'lucide-react';

export const PanelAgencia = () => {
  const { usuarioActual, mostrarNotificacion, recargarUsuario } = useAutenticacion();
  const [pestanaActiva, setPestanaActiva] = useState('paquetes'); // 'paquetes' | 'reservas' | 'guias'
  const [paquetes, setPaquetes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [guias, setGuias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para Modal de Crear/Editar Paquete
  const [modalPaqueteAbierto, setModalPaqueteAbierto] = useState(false);
  const [paqueteEnEdicion, setPaqueteEnEdicion] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('3.5 horas');
  const [politicaCancelacion, setPoliticaCancelacion] = useState('');
  const [especialidadesIds, setEspecialidadesIds] = useState([]);
  const [salidasTour, setSalidasTour] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const [archivosEliminados, setArchivosEliminados] = useState([]);
  const [guardandoPaquete, setGuardandoPaquete] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // Estados para Modal de Asignación de Guía
  const [modalAsignarGuiaAbierto, setModalAsignarGuiaAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mostrarTodosLosGuias, setMostrarTodosLosGuias] = useState(false);
  const [asignandoGuiaId, setAsignandoGuiaId] = useState(null);
  const [guiaSeleccionadoDetalle, setGuiaSeleccionadoDetalle] = useState(null);

  // Estados para Modal de Reenvío de Solicitud de Aprobación
  const [modalReenvioAbierto, setModalReenvioAbierto] = useState(false);
  const [nombreAgenciaReenvio, setNombreAgenciaReenvio] = useState(usuarioActual?.nombreAgencia || '');
  const [numeroRntReenvio, setNumeroRntReenvio] = useState(usuarioActual?.numeroRnt || '');
  const [nuevoArchivoRnt, setNuevoArchivoRnt] = useState(null);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);

  const esAgenciaAprobada = usuarioActual?.estado === 'aprobado';
  const esAgenciaRechazada = usuarioActual?.estado === 'rechazado';

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [misPaquetes, listaReservas, listaGuias] = await Promise.all([
        servicioPaquetes.listarMisPaquetes().catch(() => []),
        servicioPaquetes.listarReservasAgencia().catch(() => []),
        servicioGuias.listarGuiasPublicos().catch(() => [])
      ]);
      setPaquetes(misPaquetes);
      setReservas(listaReservas);
      setGuias(listaGuias);
    } catch (error) {
      console.error('Error al cargar datos de agencia:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCrearPaquete = () => {
    setPaqueteEnEdicion(null);
    setTitulo('');
    setDescripcion('');
    setPrecio('');
    setDuracion('3.5 horas');
    setPoliticaCancelacion('Cancelación gratuita hasta 24 horas antes del tour.');
    setEspecialidadesIds([]);
    setSalidasTour([]);
    setArchivosNuevos([]);
    setArchivosEliminados([]);
    setErrorModal('');
    setModalPaqueteAbierto(true);
  };

  const abrirEditarPaquete = (paquete) => {
    setPaqueteEnEdicion(paquete);
    setTitulo(paquete.titulo);
    setDescripcion(paquete.descripcion);
    setPrecio(String(paquete.precio));
    setDuracion(paquete.duracion || '3.5 horas');
    setPoliticaCancelacion(paquete.politicaCancelacion || '');
    setEspecialidadesIds(paquete.especialidadesIds || []);
    // Filtrar cualquier salida precargada/por defecto (def-) para que la agencia solo vea y gestione sus horarios reales
    const salidasConfiguradas = (paquete.salidas || paquete.programacion || []).filter(
      (s) => !String(s.id || '').startsWith('def-')
    );
    setSalidasTour(salidasConfiguradas);
    setArchivosNuevos([]);
    setArchivosEliminados([]);
    setErrorModal('');
    setModalPaqueteAbierto(true);
  };

  const manejarGuardarPaquete = async (e) => {
    e.preventDefault();
    setErrorModal('');
    setGuardandoPaquete(true);

    try {
      const datosForm = new FormData();
      datosForm.append('titulo', titulo);
      datosForm.append('descripcion', descripcion);
      datosForm.append('precio', precio);
      datosForm.append('duracion', duracion);
      datosForm.append('duracionHoras', parseInt(duracion) || 4);
      datosForm.append('politicaCancelacion', politicaCancelacion);
      datosForm.append('especialidadesIds', JSON.stringify(especialidadesIds));
      datosForm.append('salidas', JSON.stringify(salidasTour));

      for (const archivo of archivosNuevos) {
        datosForm.append('archivos', archivo);
      }

      if (paqueteEnEdicion) {
        if (archivosEliminados.length > 0) {
          datosForm.append('idsArchivosEliminados', archivosEliminados.join(','));
        }
        await servicioPaquetes.actualizarPaquete(paqueteEnEdicion.id, datosForm);
        mostrarNotificacion('Paquete actualizado correctamente.');
      } else {
        await servicioPaquetes.crearPaquete(datosForm);
        mostrarNotificacion('¡Paquete creado exitosamente!');
      }

      setModalPaqueteAbierto(false);
      await cargarDatos();
    } catch (error) {
      setErrorModal(error.message || 'No se pudo guardar el paquete.');
    } finally {
      setGuardandoPaquete(false);
    }
  };

  const manejarEliminarPaquete = async (idPaquete) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este paquete turístico?')) return;

    try {
      await servicioPaquetes.eliminarPaquete(idPaquete);
      mostrarNotificacion('Paquete eliminado.');
      setPaquetes((prev) => prev.filter((p) => p.id !== idPaquete));
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al eliminar paquete.', 'error');
    }
  };

  const manejarEliminarReserva = async (idReserva) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tour vendido / reserva?')) return;

    try {
      await servicioPaquetes.eliminarReserva(idReserva);
      mostrarNotificacion('Reserva o tour vendido eliminado.');
      setReservas((prev) => prev.filter((r) => r.id !== idReserva));
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al eliminar la reserva.', 'error');
    }
  };

  const abrirModalAsignarGuia = async (reserva) => {
    setReservaSeleccionada(reserva);
    setMostrarTodosLosGuias(false);
    setModalAsignarGuiaAbierto(true);
    try {
      const guiasActualizados = await servicioGuias.listarGuiasPublicos();
      if (Array.isArray(guiasActualizados) && guiasActualizados.length > 0) {
        setGuias(guiasActualizados);
      }
    } catch (e) {
      // Continuar con los guías actuales
    }
  };

  const manejarAsignarGuia = async (idGuia, nombreGuia, estadoGuia, cumpleAmbos = false) => {
    if (estadoGuia !== 'aprobado') {
      mostrarNotificacion(
        `No puedes asignar a ${nombreGuia}. Su estado de validación de RNT es "${estadoGuia}". Solo se pueden asignar guías con RNT aprobado.`,
        'error'
      );
      return;
    }

    if (!cumpleAmbos) {
      mostrarNotificacion(
        'Solo se puede asignar un guía cuando se cumplan simultáneamente ambos criterios: horario disponible y 100% de especialidades del tour.',
        'error'
      );
      return;
    }

    const paqueteReserva = paquetes.find(
      (p) => String(p.id) === String(reservaSeleccionada?.idPaquete) || p.titulo === reservaSeleccionada?.tituloPaquete
    );

    setAsignandoGuiaId(idGuia);
    try {
      await servicioPaquetes.asignarGuia(reservaSeleccionada.id, idGuia, nombreGuia, {
        nombreAgencia: usuarioActual?.nombreAgencia || 'Agencia Operadora',
        correoAgencia: usuarioActual?.correo || '',
        telefonoAgencia: usuarioActual?.telefono || '3001234567',
        descripcionTour: paqueteReserva?.descripcion || reservaSeleccionada?.descripcionTour || ''
      });
      mostrarNotificacion(`¡Guía ${nombreGuia} asignado oficialmente al tour!`);
      setModalAsignarGuiaAbierto(false);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al asignar el guía.', 'error');
    } finally {
      setAsignandoGuiaId(null);
    }
  };

  const manejarDesasignarGuia = async (idReserva) => {
    try {
      setAsignandoGuiaId(idReserva);
      await servicioPaquetes.desasignarGuia(idReserva);
      mostrarNotificacion('Guía desasignado exitosamente. Su disponibilidad ha sido liberada para otras asignaciones.');
      setReservas((prev) =>
        prev.map((r) =>
          r.id === idReserva
            ? { ...r, idGuiaAsignado: null, id_guia_asignado: null, nombreGuiaAsignado: null, nombre_guia_asignado: null }
            : r
        )
      );
      if (reservaSeleccionada?.id === idReserva) {
        setReservaSeleccionada((prev) =>
          prev ? { ...prev, idGuiaAsignado: null, id_guia_asignado: null, nombreGuiaAsignado: null, nombre_guia_asignado: null } : null
        );
      }
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al desasignar el guía.', 'error');
    } finally {
      setAsignandoGuiaId(null);
    }
  };

  const manejarReenviarSolicitud = async (e) => {
    e.preventDefault();
    setEnviandoReenvio(true);

    try {
      const datosForm = new FormData();
      datosForm.append('nombreAgencia', nombreAgenciaReenvio);
      datosForm.append('numeroRnt', numeroRntReenvio);
      if (nuevoArchivoRnt) {
        datosForm.append('rntDocument', nuevoArchivoRnt);
      }

      await servicioAdministracion.reenviarSolicitud(datosForm);
      mostrarNotificacion('¡Solicitud de aprobación reenviada! El administrador la revisará a la brevedad.');
      setModalReenvioAbierto(false);
      await recargarUsuario();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al reenviar la solicitud.', 'error');
    } finally {
      setEnviandoReenvio(false);
    }
  };

  // Helper para convertir cualquier formato de hora (ej: "09:00 AM", "15:00:00") a minutos desde medianoche
  const parsearMinutosHora = (horaStr) => {
    if (!horaStr) return null;
    const texto = String(horaStr).trim().toLowerCase();
    const esPM = texto.includes('pm');
    const esAM = texto.includes('am');

    const match = texto.match(/(\d{1,2}):(\d{2})/);
    if (!match) {
      const soloNum = parseInt(texto.replace(/\D/g, ''), 10);
      if (isNaN(soloNum)) return null;
      let h = soloNum;
      if (esPM && h < 12) h += 12;
      if (esAM && h === 12) h = 0;
      return h * 60;
    }

    let horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);

    if (esPM && horas < 12) {
      horas += 12;
    } else if (esAM && horas === 12) {
      horas = 0;
    }

    return horas * 60 + minutos;
  };

  const formatearHora12 = (horaStr) => {
    if (!horaStr) return '';
    const minTotales = parsearMinutosHora(horaStr);
    if (minTotales === null) return horaStr;
    let horas = Math.floor(minTotales / 60);
    const minutos = minTotales % 60;
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12;
    return `${horas < 10 ? '0' + horas : horas}:${minutos < 10 ? '0' + minutos : minutos} ${ampm}`;
  };

  // Cruce inteligente de especialidades y disponibilidad de horario de guías con el tour vendido
  const guiasAnalizados = useMemo(() => {
    if (!reservaSeleccionada) return [];

    const fechaTour = reservaSeleccionada.fechaReserva; // Ej: "2026-10-01"
    const horaTourRaw = (reservaSeleccionada.horaReserva || '09:00').trim();
    const minutosTour = parsearMinutosHora(horaTourRaw) ?? (9 * 60);

    // Buscar paquete para obtener sus especialidades requeridas
    const paqueteReserva = paquetes.find(
      (p) => String(p.id) === String(reservaSeleccionada.idPaquete) || p.titulo === reservaSeleccionada.tituloPaquete
    );
    const tourEspIds = (paqueteReserva?.especialidadesIds || []).map(Number);
    const totalRequeridas = tourEspIds.length;

    const lista = guias.map((guia) => {
      const listaDisp = guia.disponibilidades || [];

      // 1. Coincidencia de agenda: comprobar si el guía marcó disponibilidad en esa fecha y horario
      const slotCoincidente = listaDisp.find((slot) => {
        if (slot.estaDisponible === false) return false;

        // Comprobar fecha exacta o rango de periodo
        const coincideFecha = slot.fecha === fechaTour ||
          (slot.fechaFin && fechaTour >= slot.fecha && fechaTour <= slot.fechaFin);
        if (!coincideFecha) return false;

        // Comprobar horario si está delimitado
        if (slot.horaInicio || slot.horaFin) {
          const inicioMin = parsearMinutosHora(slot.horaInicio) ?? 0;
          const finMin = parsearMinutosHora(slot.horaFin) ?? (24 * 60);
          return minutosTour >= inicioMin && minutosTour <= finMin;
        }

        // Si no tiene horas específicas, el guía está disponible todo el día
        return true;
      });

      // 1.1 Verificar si el guía ya tiene asignado OTRO tour en esa misma fecha y horario
      const toursAsignadosDelGuia = [
        ...(guia.toursAsignados || []),
        ...reservas
          .filter((r) => {
            const idG = String(r.idGuiaAsignado || r.id_guia_asignado || '').trim();
            return idG && (idG === String(guia.id) || idG === String(guia.usuarioId));
          })
          .map((r) => ({
            id: r.id,
            fechaReserva: r.fechaReserva,
            horaReserva: r.horaReserva,
            tituloPaquete: r.tituloPaquete,
            nombreAgencia: r.nombreAgencia
          }))
      ];
      const tourConflicto = toursAsignadosDelGuia.find((t) => {
        // Ignorar si es la misma reserva que ya tiene asignada
        if (String(t.id) === String(reservaSeleccionada.id)) return false;
        if (t.fechaReserva !== fechaTour) return false;

        // Verificar solapamiento de horario (3 horas estimadas de recorrido)
        const minInicioOtro = parsearMinutosHora(t.horaReserva) ?? 0;
        const duracionMin = 180;
        const minFinOtro = minInicioOtro + duracionMin;
        const minFinTour = minutosTour + duracionMin;

        return (minutosTour < minFinOtro) && (minFinTour > minInicioOtro);
      });

      const estaOcupadoConOtroTour = Boolean(tourConflicto);
      const tieneHorarioDisponible = Boolean(slotCoincidente) && !estaOcupadoConOtroTour;
      const detalleDisponibilidad = estaOcupadoConOtroTour
        ? `Ocupado en otro tour (${tourConflicto.horaReserva})`
        : slotCoincidente
        ? (slotCoincidente.horaInicio && slotCoincidente.horaFin
            ? `${formatearHora12(slotCoincidente.horaInicio)} - ${formatearHora12(slotCoincidente.horaFin)}`
            : 'Todo el día')
        : null;

      // 2. Coincidencia de Especialidades (Matching de Etiquetas)
      const guiaEspIds = (guia.especialidadesIds || []).map(Number);
      const coincidentes = tourEspIds.filter((id) => guiaEspIds.includes(id));
      const porcentajeMatch = totalRequeridas > 0 ? Math.round((coincidentes.length / totalRequeridas) * 100) : 100;
      const esMatchEspecialidades = totalRequeridas === 0 || (coincidentes.length === totalRequeridas);
      const coincideEspecialidades = totalRequeridas === 0 || coincidentes.length > 0;

      // 3. Criterios de Asignación Obligatorios:
      // Criterio 1: Especialidades que coincidan con las del tour (100% requeridas)
      // Criterio 2: Horario disponible que coincida con el marcado por el guía en esa fecha/hora Y no estar ocupado con otro tour
      const cumpleAmbosCriterios = tieneHorarioDisponible && esMatchEspecialidades && !estaOcupadoConOtroTour;
      const cumpleSoloHorario = tieneHorarioDisponible && !esMatchEspecialidades && !estaOcupadoConOtroTour;
      const cumpleSoloEspecialidades = !tieneHorarioDisponible && esMatchEspecialidades && !estaOcupadoConOtroTour;
      const cumpleSoloUno = cumpleSoloHorario || cumpleSoloEspecialidades;
      const esRecomendado = (cumpleAmbosCriterios || cumpleSoloUno || coincideEspecialidades) && !estaOcupadoConOtroTour;

      // Formatear enlace WhatsApp con mensaje predeterminado
      const telLimpio = String(guia.telefonoPrincipal || guia.contactoEmergenciaTel || '3100000000').replace(/\D/g, '');
      const numWa = telLimpio.startsWith('57') ? telLimpio : `57${telLimpio}`;
      const textoWa = encodeURIComponent(
        `Hola ${guia.nombreCompleto}, te contactamos desde ${usuarioActual?.nombreAgencia || 'la agencia'} en GuianzApp respecto al tour "${reservaSeleccionada.tituloPaquete}" programado para el ${reservaSeleccionada.fechaReserva} a las ${reservaSeleccionada.horaReserva} (${reservaSeleccionada.cantidadPersonas} personas). Quisiéramos coordinar contigo la prestación de este servicio.`
      );
      const enlaceWhatsApp = `https://wa.me/${numWa}?text=${textoWa}`;

      return {
        ...guia,
        esRecomendado,
        cumpleAmbosCriterios,
        cumpleSoloHorario,
        cumpleSoloEspecialidades,
        cumpleSoloUno,
        tieneHorarioDisponible,
        detalleDisponibilidad,
        estaOcupadoConOtroTour,
        tourConflicto,
        enlaceWhatsApp,
        matchingEspecialidades: {
          coincidentes: coincidentes.length,
          totalRequeridas,
          porcentaje: porcentajeMatch,
          esMatchPerfecto: esMatchEspecialidades,
          idsCoincidentes: coincidentes
        }
      };
    });

    // Ordenar: primero los que cumplen AMBOS criterios (100% match) y no están ocupados
    lista.sort((a, b) => {
      // 0. Si uno está ocupado con otro tour, mandar al final
      if (a.estaOcupadoConOtroTour && !b.estaOcupadoConOtroTour) return 1;
      if (!a.estaOcupadoConOtroTour && b.estaOcupadoConOtroTour) return -1;

      // 1. Cumple ambos criterios (Horario + 100% Especialidades)
      if (a.cumpleAmbosCriterios && !b.cumpleAmbosCriterios) return -1;
      if (!a.cumpleAmbosCriterios && b.cumpleAmbosCriterios) return 1;

      // 2. Recomendados que cumplen 1 de los 2 criterios
      if (a.cumpleSoloUno && !b.cumpleSoloUno) return -1;
      if (!a.cumpleSoloUno && b.cumpleSoloUno) return 1;

      // 3. Disponibilidad de horario
      if (a.tieneHorarioDisponible && !b.tieneHorarioDisponible) return -1;
      if (!a.tieneHorarioDisponible && b.tieneHorarioDisponible) return 1;

      // 4. Cantidad y porcentaje de especialidades coincidentes
      const coincA = a.matchingEspecialidades?.coincidentes || 0;
      const coincB = b.matchingEspecialidades?.coincidentes || 0;
      if (coincA !== coincB) return coincB - coincA;

      return (b.matchingEspecialidades?.porcentaje || 0) - (a.matchingEspecialidades?.porcentaje || 0);
    });

    return lista;
  }, [guias, reservaSeleccionada, paquetes, usuarioActual, reservas]);

  const guiasConAmbosCriterios = guiasAnalizados.filter((g) => g.cumpleAmbosCriterios);
  const guiasRecomendados = guiasAnalizados.filter((g) => g.esRecomendado);
  const guiasParaMostrar = mostrarTodosLosGuias
    ? guiasAnalizados
    : guiasConAmbosCriterios.length > 0
    ? guiasConAmbosCriterios
    : guiasRecomendados.length > 0
    ? guiasRecomendados
    : guiasAnalizados;

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="contenedor">
        {/* Cabecera del Panel de Agencia */}
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
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24'
              }}
            >
              <Building2 size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {usuarioActual?.nombreAgencia || 'Mi Agencia'}
                </h1>
                <InsigniaEstado estado={usuarioActual?.estado} />
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
                RNT: <strong>{usuarioActual?.numeroRnt || 'En validación'}</strong> · {usuarioActual?.correo}
              </p>
            </div>
          </div>

          {esAgenciaAprobada && (
            <button onClick={abrirCrearPaquete} className="boton boton-primario" style={{ gap: '0.5rem' }}>
              <Plus size={18} />
              <span>Nuevo Paquete</span>
            </button>
          )}
        </div>

        {/* Banner de Rechazo de Solicitud con Feedback y Reenvío */}
        {esAgenciaRechazada && (
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
                  Tu solicitud de registro ha sido rechazada por el administrador
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#f3f4f6', lineHeight: 1.5 }}>
                  <strong>Motivo de rechazo:</strong>{' '}
                  {usuarioActual?.motivoRechazo || 'El documento RNT adjunto no coincide con la razón social o está desactualizado.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setNombreAgenciaReenvio(usuarioActual?.nombreAgencia || '');
                  setNumeroRntReenvio(usuarioActual?.numeroRnt || '');
                  setModalReenvioAbierto(true);
                }}
                className="boton boton-primario boton-pequeno"
                style={{ gap: '0.4rem', backgroundColor: '#ef4444' }}
              >
                <Send size={15} />
                <span>Corregir Datos y Reenviar Solicitud</span>
              </button>
            </div>
          </div>
        )}

        {/* Alerta si está pendiente de validación */}
        {usuarioActual?.estado === 'pendiente' && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              color: '#fef3c7',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <AlertCircle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem', color: '#fbbf24' }}>
                Tu cuenta de agencia se encuentra en revisión de RNT
              </strong>
              <p style={{ fontSize: '0.88rem', color: '#e5e7eb' }}>
                Nuestro equipo administrativo está validando la vigencia de tu Registro Nacional de Turismo. Podrás publicar paquetes en cuanto sea aprobada.
              </p>
            </div>
          </div>
        )}

        {/* Pestañas de Navegación del Panel */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPestanaActiva('paquetes')}
            className={`boton ${pestanaActiva === 'paquetes' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Package size={17} />
            <span>Mis Paquetes ({paquetes.length})</span>
          </button>
          <button
            onClick={() => setPestanaActiva('reservas')}
            className={`boton ${pestanaActiva === 'reservas' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Calendar size={17} />
            <span>Tours Vendidos y Reservas ({reservas.length})</span>
          </button>
          <button
            onClick={() => setPestanaActiva('guias')}
            className={`boton ${pestanaActiva === 'guias' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ gap: '0.5rem' }}
          >
            <Users size={17} />
            <span>Directorio de Guías ({guias.length})</span>
          </button>
        </div>

        {/* Contenido Principal */}
        {cargando ? (
          <Cargando mensaje="Cargando información de tu panel..." />
        ) : pestanaActiva === 'paquetes' ? (
          /* Pestaña: Mis Paquetes */
          <div>
            {paquetes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.12)'
                }}
              >
                <Package size={40} color="#9ca3af" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Aún no has creado ningún paquete turístico
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                  Publica tu primera experiencia guiada en Bogotá con fotografías, duración estimada y políticas de reserva.
                </p>
                {esAgenciaAprobada && (
                  <button onClick={abrirCrearPaquete} className="boton boton-primario">
                    <Plus size={16} />
                    <span>Crear Mi Primer Paquete</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {paquetes.map((paquete) => (
                  <div
                    key={paquete.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                      <img
                        src={paquete.archivos?.[0]?.url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80'}
                        alt={paquete.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <InsigniaEstado estado={paquete.estado} />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(11, 15, 25, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#38bdf8',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Clock size={13} />
                        <span>{paquete.duracion || '3.5 horas'}</span>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{paquete.titulo}</h3>
                      {/* Especialidades Requeridas del Tour */}
                      {paquete.especialidades && paquete.especialidades.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                          {paquete.especialidades.map((esp) => (
                            <span
                              key={esp.id}
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '8px',
                                backgroundColor: 'var(--color-primario-claro, rgba(23, 74, 91, 0.1))',
                                border: '1px solid rgba(23, 74, 91, 0.25)',
                                color: 'var(--color-primario, #174a5b)',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <span>{esp.icono || '🏷️'}</span>
                              <span>{esp.subcategoria}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Contador de Salidas Programadas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                        <Calendar size={13} color="var(--color-primario)" />
                        <span>
                          <strong>{paquete.salidas?.length || paquete.programacion?.length || 0}</strong> salidas programadas
                        </span>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid var(--borde-sutil, rgba(0,0,0,0.08))',
                          paddingTop: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <strong style={{ fontSize: '1.15rem', color: '#38bdf8' }}>
                          {formatearPrecio(paquete.precio)}
                        </strong>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => abrirEditarPaquete(paquete)}
                            disabled={!esAgenciaAprobada}
                            className="boton boton-contorno boton-pequeno"
                            title="Editar paquete"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => manejarEliminarPaquete(paquete.id)}
                            disabled={!esAgenciaAprobada}
                            className="boton boton-peligro boton-pequeno"
                            title="Eliminar paquete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : pestanaActiva === 'reservas' ? (
          /* Pestaña: Tours Vendidos y Reservas */
          <div>
            {reservas.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.12)'
                }}
              >
                <Calendar size={40} color="#38bdf8" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No tienes tours reservados aún
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto' }}>
                  Cuando los viajeros reserven tus experiencias desde la plataforma, podrás ver sus datos de contacto y asignar guías disponibles según sus horarios.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reservas.map((reserva) => (
                  <div
                    key={reserva.id}
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
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                          Tour: {reserva.tituloPaquete}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{reserva.nombreTitular}</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Total pagado</span>
                        <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                          {formatearPrecio(reserva.precioTotal)}
                        </strong>
                      </div>
                    </div>

                    {/* Datos del Tour y Contacto del Turista */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '1rem',
                        borderRadius: '10px',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                        <Calendar size={16} color="#38bdf8" />
                        <span>Fecha: <strong>{reserva.fechaReserva}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                        <Clock size={16} color="#38bdf8" />
                        <span>Hora: <strong>{reserva.horaReserva}</strong> ({reserva.duracion})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                        <Mail size={16} color="#38bdf8" />
                        <span>{reserva.correoContacto}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                        <Phone size={16} color="#38bdf8" />
                        <span>{reserva.telefonoContacto || 'No registrado'}</span>
                      </div>
                    </div>

                    {/* Estado del Guía Asignado */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: '0.85rem',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={18} color={reserva.idGuiaAsignado ? '#10b981' : '#f59e0b'} />
                        <span style={{ fontSize: '0.88rem' }}>
                          Guía Asignado:{' '}
                          <strong>
                            {reserva.nombreGuiaAsignado || 'Sin guía asignado aún'}
                          </strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => abrirModalAsignarGuia(reserva)}
                          className="boton boton-primario boton-pequeno"
                          style={{ gap: '0.4rem' }}
                        >
                          <UserCheck size={15} />
                          <span>{reserva.idGuiaAsignado ? 'Reasignar Guía' : 'Asignar Guía al Tour'}</span>
                        </button>

                        {reserva.idGuiaAsignado && (
                          <button
                            onClick={() => manejarDesasignarGuia(reserva.id)}
                            className="boton boton-contorno boton-pequeno"
                            style={{
                              gap: '0.35rem',
                              borderColor: '#A64040',
                              color: '#A64040'
                            }}
                            title="Desasignar el guía actual y liberar su disponibilidad para otras agencias"
                          >
                            <UserCheck size={14} />
                            <span>Desasignar Guía</span>
                          </button>
                        )}

                        <button
                          onClick={() => manejarEliminarReserva(reserva.id)}
                          className="boton boton-pequeno"
                          style={{
                            gap: '0.35rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#f87171',
                            cursor: 'pointer'
                          }}
                          title="Eliminar tour vendido / reserva"
                        >
                          <Trash2 size={14} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Pestaña: Directorio de Guías */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {guias.map((guia) => (
              <div
                key={guia.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {guia.urlFotoRostro ? (
                    <img
                      src={guia.urlFotoRostro}
                      alt={guia.nombreCompleto}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}
                    >
                      {guia.nombreCompleto?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{guia.nombreCompleto}</h3>
                    <InsigniaEstado estado={guia.estado} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600 }}>
                  <span>RNT Guía: {guia.numeroRnt}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 600 }}>
                    <Award size={15} />
                    <span>Especialidades Certificadas:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {Array.isArray(guia.especialidades) && guia.especialidades.length > 0 ? (
                      guia.especialidades.map((esp, idx) => {
                        const nombre = typeof esp === 'object' ? (esp.subcategoria || esp.nombre) : esp;
                        const icono = typeof esp === 'object' ? esp.icono : '🏷️';
                        return (
                          <span
                            key={esp.id || idx}
                            style={{
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              color: '#38bdf8',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span>{icono || '🏷️'}</span>
                            <span>{nombre}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {typeof guia.especialidades === 'string' ? guia.especialidades : 'Patrimonio y cultura urbana'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                  <Languages size={16} color="#38bdf8" />
                  <span><strong>Idiomas:</strong> {guia.idiomas || 'Español'}</span>
                </div>

                {guia.telefonoPrincipal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#10b981' }}>
                    <Phone size={14} />
                    <span>{guia.telefonoPrincipal}</span>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--borde-sutil)' }}>
                  {(() => {
                    const telLimpio = String(guia.telefonoPrincipal || guia.contactoEmergenciaTel || '3100000000').replace(/\D/g, '');
                    const numWa = telLimpio.startsWith('57') ? telLimpio : `57${telLimpio}`;
                    const textoWa = encodeURIComponent(
                      `Hola ${guia.nombreCompleto}, te contactamos desde ${usuarioActual?.nombreAgencia || 'nuestra agencia'} en GuianzApp para coordinar posibles asignaciones y servicios en nuestros tours turísticos.`
                    );
                    return (
                      <a
                        href={`https://wa.me/${numWa}?text=${textoWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="boton boton-primario"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          backgroundColor: '#1F5D50',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          textDecoration: 'none'
                        }}
                        title={`Contactar a ${guia.nombreCompleto} por WhatsApp`}
                      >
                        <MessageCircle size={18} />
                        <span>Contactar por WhatsApp</span>
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Paquete */}
      <Modal
        abierto={modalPaqueteAbierto}
        alCerrar={() => setModalPaqueteAbierto(false)}
        titulo={paqueteEnEdicion ? 'Editar Paquete Turístico' : 'Crear Nuevo Paquete Turístico'}
        anchoMaximo="640px"
      >
        <form onSubmit={manejarGuardarPaquete}>
          {errorModal && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.88rem',
                marginBottom: '1rem'
              }}
            >
              {errorModal}
            </div>
          )}

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Título del Tour / Experiencia</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Bogotá Colonial & Secretos de La Candelaria"
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Descripción detallada</label>
            <textarea
              required
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el itinerario, puntos de interés, qué incluye y qué recomendaciones se deben tener..."
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">Precio por persona (COP)</label>
              <input
                type="number"
                required
                min={0}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 55000"
                className="campo-formulario"
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">Duración del Tour</label>
              <input
                type="text"
                required
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder="Ej: 3 horas, 4.5 horas, Día completo"
                className="campo-formulario"
              />
            </div>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Política de Cancelación</label>
            <input
              type="text"
              value={politicaCancelacion}
              onChange={(e) => setPoliticaCancelacion(e.target.value)}
              placeholder="Ej: Cancelación con 24h de anticipación"
              className="campo-formulario"
            />
          </div>

          {/* Selector de Categorías y Especialidades Requeridas (tour_especialidades) */}
          <SelectorEspecialidades
            seleccionadas={especialidadesIds}
            alCambiar={setEspecialidadesIds}
            titulo="Especialidades Requeridas para el Tour (tour_especialidades)"
            subtitulo="Marca las categorías y etiquetas que debe dominar el guía para este recorrido. El sistema recomendará con máxima prioridad a los guías que tengan estas mismas casillas activas en su perfil."
          />

          {/* Configurador de Horarios de Salida y Cupos (programacion_tours) */}
          <ConfiguradorProgramacionTour
            salidas={salidasTour}
            alCambiarSalidas={setSalidasTour}
            duracion={duracion}
          />

          {/* Subida de Archivos Multimedia */}
          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Fotografías del Paquete (JPG, PNG, WEBP)</span>
              <FileUp size={15} color="#38bdf8" />
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setArchivosNuevos(Array.from(e.target.files))}
              className="campo-formulario"
              style={{ padding: '0.5rem' }}
            />
          </div>

          {/* Lista de archivos actuales si está editando */}
          {paqueteEnEdicion && paqueteEnEdicion.archivos && paqueteEnEdicion.archivos.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>
                Fotos actuales del paquete:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {paqueteEnEdicion.archivos.map((arch) => {
                  const estaMarcado = archivosEliminados.includes(arch.id);
                  return (
                    <div
                      key={arch.id}
                      style={{
                        position: 'relative',
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: estaMarcado ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                        opacity: estaMarcado ? 0.4 : 1
                      }}
                    >
                      <img src={arch.url} alt={arch.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          if (estaMarcado) {
                            setArchivosEliminados((prev) => prev.filter((id) => id !== arch.id));
                          } else {
                            setArchivosEliminados((prev) => [...prev, arch.id]);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: estaMarcado ? '#10b981' : '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        {estaMarcado ? '+' : '×'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setModalPaqueteAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoPaquete}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {guardandoPaquete ? (
                <>
                  <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                  <span>Guardando paquete...</span>
                </>
              ) : (
                <span>{paqueteEnEdicion ? 'Actualizar Paquete' : 'Publicar Paquete'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Asignación Inteligente de Guías */}
      <Modal
        abierto={modalAsignarGuiaAbierto}
        alCerrar={() => setModalAsignarGuiaAbierto(false)}
        titulo="Asignar Guía Certificado al Tour"
        anchoMaximo="680px"
      >
        {reservaSeleccionada && (
          <div style={{ color: 'var(--texto-principal)' }}>
            {/* Ficha del Tour Vendido con Estilo Oficial de Marca */}
            <div
              style={{
                backgroundColor: 'var(--color-primario-claro)',
                border: '1.5px solid var(--color-primario)',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 8px rgba(23, 74, 91, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>Tour Vendido:</span>
                <strong style={{ color: 'var(--color-primario)', fontSize: '1.05rem', fontWeight: 800 }}>
                  {reservaSeleccionada.tituloPaquete}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.86rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ color: 'var(--texto-secundario)', fontWeight: 600 }}>Fecha y Hora Solicitada:</span>
                <strong style={{ color: 'var(--texto-principal)' }}>
                  {reservaSeleccionada.fechaReserva} a las {reservaSeleccionada.horaReserva}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <span style={{ color: 'var(--texto-secundario)', fontWeight: 600 }}>Turista / Titular:</span>
                <span style={{ color: 'var(--texto-principal)', fontWeight: 600 }}>
                  {reservaSeleccionada.nombreTitular} ({reservaSeleccionada.cantidadPersonas} personas)
                </span>
              </div>
            </div>

            {/* Selector / Recomendación */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-primario)', fontWeight: 800, fontSize: '0.94rem' }}>
                <Sparkles size={17} color="var(--color-secundario)" />
                <span>
                  {guiasConAmbosCriterios.length > 0 && !mostrarTodosLosGuias
                    ? `Guías con Match Completo (100% Especialidades + Horario) (${guiasConAmbosCriterios.length})`
                    : guiasRecomendados.length > 0 && !mostrarTodosLosGuias
                    ? `Guías Recomendados (Cumplen 1 de los 2 Criterios) (${guiasRecomendados.length})`
                    : `Listado General de Guías (${guias.length})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMostrarTodosLosGuias(!mostrarTodosLosGuias)}
                className="boton boton-texto boton-pequeno"
                style={{ fontSize: '0.82rem', color: 'var(--color-primario)', fontWeight: 700, textDecoration: 'underline' }}
              >
                {mostrarTodosLosGuias ? 'Ver solo sugeridos / recomendados' : 'Ver todos los guías'}
              </button>
            </div>

            {/* Aviso si no hay guías que cumplan ambos criterios */}
            {guiasConAmbosCriterios.length === 0 && (
              <div
                style={{
                  padding: '0.9rem 1.1rem',
                  backgroundColor: 'var(--color-advertencia-fondo)',
                  border: '1.5px solid var(--color-dorado)',
                  borderRadius: '12px',
                  color: '#785311',
                  fontSize: '0.86rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <AlertCircle size={20} color="#9A6B16" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#785311', fontSize: '0.9rem' }}>
                    Ningún guía coincide simultáneamente con disponibilidad de horario y 100% de especialidades para el {reservaSeleccionada.fechaReserva} a las {reservaSeleccionada.horaReserva}.
                  </strong>
                  <p style={{ margin: 0, color: '#573D0D', fontSize: '0.83rem', lineHeight: 1.45 }}>
                    A continuación se listan guías que cumplen solo <strong>uno de los dos criterios</strong>. Puedes contactarlos vía WhatsApp para coordinar su disponibilidad o especialidad, pero la asignación solo se permite cuando se cumplan ambos criterios.
                  </p>
                </div>
              </div>
            )}

            {/* Listado de Guías para Asignar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {guiasParaMostrar.map((guia) => {
                const esAprobado = guia.estado === 'aprobado';
                const esElAsignadoActual = reservaSeleccionada.idGuiaAsignado === guia.id;
                const estaOcupado = guia.estaOcupadoConOtroTour;

                return (
                  <div
                    key={guia.id}
                    style={{
                      backgroundColor: esElAsignadoActual
                        ? 'var(--color-secundario-claro)'
                        : estaOcupado
                        ? '#FFFBEB'
                        : '#FFFFFF',
                      border: esElAsignadoActual
                        ? '2px solid var(--color-secundario)'
                        : guia.cumpleAmbosCriterios
                        ? '2px solid var(--color-secundario)'
                        : estaOcupado
                        ? '1.5px solid #F59E0B'
                        : guia.cumpleSoloUno
                        ? '1.5px solid var(--color-dorado)'
                        : '1px solid var(--borde-sutil)',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      boxShadow: esElAsignadoActual || guia.cumpleAmbosCriterios ? '0 2px 10px rgba(31, 93, 80, 0.08)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {guia.urlFotoRostro ? (
                        <img
                          src={guia.urlFotoRostro}
                          alt={guia.nombreCompleto}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primario)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primario-claro)',
                            color: 'var(--color-primario)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            border: '1.5px solid var(--color-primario)'
                          }}
                        >
                          {guia.nombreCompleto?.charAt(0) || 'G'}
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <strong
                            onClick={() => setGuiaSeleccionadoDetalle(guia)}
                            role="button"
                            tabIndex={0}
                            style={{
                              fontSize: '1rem',
                              cursor: 'pointer',
                              color: 'var(--texto-principal)',
                              textDecoration: 'underline decoration-dotted',
                              textUnderlineOffset: '3px'
                            }}
                            title="Haz clic para ver el resumen completo del perfil del guía"
                          >
                            {guia.nombreCompleto}
                          </strong>
                          <InsigniaEstado estado={guia.estado} />

                          {/* Estado de Coincidencia o Conflicto */}
                          {estaOcupado ? (
                            <span
                              onClick={() => setGuiaSeleccionadoDetalle(guia)}
                              role="button"
                              tabIndex={0}
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: '1.5px solid #EF4444',
                                padding: '0.22rem 0.65rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: 'pointer'
                              }}
                              title={`Ocupado con otro tour: ${guia.tourConflicto?.tituloPaquete || ''} (${guia.tourConflicto?.horaReserva || ''})`}
                            >
                              <AlertTriangle size={13} />
                              <span>🚫 Ocupado en otro tour ({guia.tourConflicto?.horaReserva || ''})</span>
                            </span>
                          ) : guia.cumpleAmbosCriterios ? (
                            <span
                              onClick={() => setGuiaSeleccionadoDetalle(guia)}
                              role="button"
                              tabIndex={0}
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                backgroundColor: 'var(--color-secundario-claro)',
                                color: 'var(--color-secundario)',
                                border: '1.5px solid var(--color-secundario)',
                                padding: '0.22rem 0.7rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(31, 93, 80, 0.12)'
                              }}
                              title="Haz clic para ver el resumen completo del perfil del guía"
                            >
                              <Check size={13} />
                              <span>🌟 Match Completo: 100% Especialidades + Horario ({guia.detalleDisponibilidad})</span>
                              <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--color-secundario)', color: '#FFFFFF', fontWeight: 800, borderRadius: '4px', padding: '0.05rem 0.35rem', marginLeft: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Eye size={10} />
                                <span>Ver Perfil</span>
                              </span>
                            </span>
                          ) : guia.cumpleSoloHorario ? (
                            <span
                              onClick={() => setGuiaSeleccionadoDetalle(guia)}
                              role="button"
                              tabIndex={0}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: 'var(--color-dorado-claro)',
                                color: '#785311',
                                border: '1px solid var(--color-dorado)',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: 'pointer'
                              }}
                              title="Haz clic para ver el resumen del perfil del guía"
                            >
                              <AlertTriangle size={13} color="#9A6B16" />
                              <span>⚠️ Cumple horario ({guia.detalleDisponibilidad}) pero NO todas las especialidades ({guia.matchingEspecialidades.coincidentes}/{guia.matchingEspecialidades.totalRequeridas} · {guia.matchingEspecialidades.porcentaje}%)</span>
                              <Eye size={11} style={{ marginLeft: '0.2rem', opacity: 0.8 }} />
                            </span>
                          ) : guia.cumpleSoloEspecialidades ? (
                            <span
                              onClick={() => setGuiaSeleccionadoDetalle(guia)}
                              role="button"
                              tabIndex={0}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: 'var(--color-dorado-claro)',
                                color: '#785311',
                                border: '1px solid var(--color-dorado)',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: 'pointer'
                              }}
                              title="Haz clic para ver el resumen del perfil del guía"
                            >
                              <AlertTriangle size={13} color="#9A6B16" />
                              <span>⚠️ Cumple 100% Especialidades pero NO tiene horario registrado en esta fecha/hora</span>
                              <Eye size={11} style={{ marginLeft: '0.2rem', opacity: 0.8 }} />
                            </span>
                          ) : (
                            <span
                              onClick={() => setGuiaSeleccionadoDetalle(guia)}
                              role="button"
                              tabIndex={0}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                backgroundColor: '#F3F4F6',
                                color: 'var(--texto-secundario)',
                                border: '1px solid var(--borde-sutil)',
                                padding: '0.18rem 0.55rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                cursor: 'pointer'
                              }}
                              title="Haz clic para ver el perfil del guía"
                            >
                              <Clock size={12} />
                              <span>Sin agenda registrada · Especialidades {guia.matchingEspecialidades.porcentaje}% ({guia.matchingEspecialidades.coincidentes}/{guia.matchingEspecialidades.totalRequeridas})</span>
                              <Eye size={10} style={{ marginLeft: '0.2rem', opacity: 0.7 }} />
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', lineHeight: 1.45 }}>
                          <span>RNT: <strong style={{ color: 'var(--texto-principal)' }}>{guia.numeroRnt}</strong></span>
                          {guia.telefonoPrincipal && (
                            <span> · Tel: <strong style={{ color: 'var(--texto-principal)' }}>{guia.telefonoPrincipal}</strong></span>
                          )}
                          {guia.contactoEmergenciaNombre && (
                            <span> · Emergencia: <em style={{ color: 'var(--texto-principal)' }}>{guia.contactoEmergenciaNombre} ({guia.contactoEmergenciaTel || 'N/A'})</em></span>
                          )}
                        </div>

                        {/* Etiquetas de Especialidad del Guía */}
                        {guia.especialidades && guia.especialidades.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                            {guia.especialidades.map((esp) => {
                              const coincide = guia.matchingEspecialidades?.idsCoincidentes?.includes(esp.id);
                              return (
                                <span
                                  key={esp.id}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '6px',
                                    backgroundColor: coincide ? 'var(--color-secundario-claro)' : 'var(--fondo-secundario)',
                                    color: coincide ? 'var(--color-secundario)' : 'var(--texto-secundario)',
                                    border: coincide ? '1px solid var(--color-secundario)' : '1px solid var(--borde-sutil)',
                                    fontWeight: coincide ? 700 : 500
                                  }}
                                >
                                  {coincide ? '✓ ' : ''}{esp.icono || '🏷️'} {esp.subcategoria}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones de Contacto y Asignación */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '190px', flexShrink: 0 }}>
                      {!esAprobado ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            color: '#991B1B',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: '#FEE2E2',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #EF4444'
                          }}
                        >
                          <AlertTriangle size={14} />
                          <span>RNT {guia.estado}</span>
                        </div>
                      ) : estaOcupado ? (
                        /* Caso Guía Ocupado en otro Tour */
                        <>
                          <a
                            href={guia.enlaceWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="boton boton-pequeno"
                            style={{
                              backgroundColor: '#1F5D50',
                              color: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '8px'
                            }}
                            title="Contactar vía WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>Contactar por WhatsApp</span>
                          </a>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#991B1B',
                              backgroundColor: '#FEE2E2',
                              border: '1px dashed #EF4444',
                              borderRadius: '8px',
                              padding: '0.4rem 0.5rem',
                              textAlign: 'center',
                              fontWeight: 700,
                              lineHeight: 1.3
                            }}
                          >
                            🔒 Ocupado con otra reserva
                          </div>
                        </>
                      ) : guia.cumpleAmbosCriterios ? (
                        /* Caso 1: Coinciden ambos criterios -> Botón de Contactar vía WhatsApp y DEBAJO el botón de Asignar */
                        <>
                          <a
                            href={guia.enlaceWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="boton boton-pequeno"
                            style={{
                              backgroundColor: '#1F5D50',
                              color: '#FFFFFF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.75rem',
                              borderRadius: '8px',
                              boxShadow: '0 2px 6px rgba(31, 93, 80, 0.2)'
                            }}
                            title="Abrir WhatsApp para iniciar contacto con el guía"
                          >
                            <MessageCircle size={15} />
                            <span>Contactar por WhatsApp</span>
                          </a>

                          {esElAsignadoActual ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div
                                style={{
                                  backgroundColor: 'var(--color-secundario-claro)',
                                  color: 'var(--color-secundario)',
                                  border: '1px solid var(--color-secundario)',
                                  borderRadius: '8px',
                                  padding: '0.35rem 0.5rem',
                                  textAlign: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8rem'
                                }}
                              >
                                Asignado a este Tour ✓
                              </div>
                              <button
                                type="button"
                                onClick={() => manejarDesasignarGuia(reservaSeleccionada.id)}
                                disabled={asignandoGuiaId === reservaSeleccionada.id}
                                className="boton boton-pequeno"
                                style={{
                                  width: '100%',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  padding: '0.35rem 0.5rem',
                                  backgroundColor: 'transparent',
                                  color: '#A64040',
                                  border: '1px solid #A64040'
                                }}
                              >
                                Desasignar Guía
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => manejarAsignarGuia(guia.id, guia.nombreCompleto, guia.estado, true)}
                              disabled={asignandoGuiaId === guia.id}
                              className="boton boton-primario boton-pequeno"
                              style={{
                                width: '100%',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                padding: '0.45rem 0.75rem'
                              }}
                            >
                              {asignandoGuiaId === guia.id ? (
                                <Loader2 size={14} style={{ animation: 'girar 1s linear infinite' }} />
                              ) : (
                                'Asignar Guía al Tour'
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        /* Caso 2: Cumple solo 1 criterio o ninguno -> Se puede recomendar/contactar pero NO asignar */
                        <>
                          <a
                            href={guia.enlaceWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="boton boton-contorno boton-pequeno"
                            style={{
                              borderColor: '#1F5D50',
                              color: '#1F5D50',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              padding: '0.4rem 0.6rem',
                              borderRadius: '8px'
                            }}
                            title="Contactar vía WhatsApp para consultar disponibilidad o especialidad"
                          >
                            <MessageCircle size={14} />
                            <span>Contactar WhatsApp</span>
                          </a>

                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#785311',
                              backgroundColor: 'var(--color-dorado-claro)',
                              border: '1px dashed var(--color-dorado)',
                              borderRadius: '8px',
                              padding: '0.4rem 0.5rem',
                              textAlign: 'center',
                              fontWeight: 600,
                              lineHeight: 1.3
                            }}
                          >
                            {guia.cumpleSoloHorario
                              ? '⚠️ Requiere 100% especialidades para asignar'
                              : guia.cumpleSoloEspecialidades
                              ? '⚠️ Sin horario registrado para asignar'
                              : '❌ No cumple criterios para asignación'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button onClick={() => setModalAsignarGuiaAbierto(false)} className="boton boton-contorno">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Resumen del Perfil del Guía Certificado */}
      <Modal
        abierto={Boolean(guiaSeleccionadoDetalle)}
        alCerrar={() => setGuiaSeleccionadoDetalle(null)}
        titulo={`Perfil del Guía: ${guiaSeleccionadoDetalle?.nombreCompleto || 'Guía'}`}
        anchoMaximo="640px"
      >
        {guiaSeleccionadoDetalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--texto-principal)' }}>
            {/* Cabecera del Perfil con Foto y Datos Principales */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.1rem',
                backgroundColor: 'var(--fondo-secundario)',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--borde-sutil)'
              }}
            >
              {guiaSeleccionadoDetalle.urlFotoRostro ? (
                <img
                  src={guiaSeleccionadoDetalle.urlFotoRostro}
                  alt={guiaSeleccionadoDetalle.nombreCompleto}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--color-secundario)' }}
                />
              ) : (
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secundario-claro)',
                    color: 'var(--color-secundario)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    border: '2px solid var(--color-secundario)'
                  }}
                >
                  {guiaSeleccionadoDetalle.nombreCompleto?.charAt(0) || 'G'}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primario)' }}>
                    {guiaSeleccionadoDetalle.nombreCompleto}
                  </h3>
                  <InsigniaEstado estado={guiaSeleccionadoDetalle.estado} />
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--texto-secundario)', lineHeight: 1.5 }}>
                  <span>RNT / Tarjeta Profesional: <strong style={{ color: 'var(--texto-principal)' }}>{guiaSeleccionadoDetalle.numeroRnt || '16093'}</strong></span>
                  {guiaSeleccionadoDetalle.idiomas && (
                    <span style={{ display: 'block' }}>Idiomas certificados: <strong style={{ color: 'var(--texto-principal)' }}>{guiaSeleccionadoDetalle.idiomas}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Globo de Coincidencia con el Tour */}
            <div
              style={{
                backgroundColor: guiaSeleccionadoDetalle.estaOcupadoConOtroTour
                  ? '#FFFBEB'
                  : guiaSeleccionadoDetalle.cumpleAmbosCriterios
                  ? 'var(--color-secundario-claro)'
                  : 'var(--color-dorado-claro)',
                border: guiaSeleccionadoDetalle.estaOcupadoConOtroTour
                  ? '1.5px solid #F59E0B'
                  : guiaSeleccionadoDetalle.cumpleAmbosCriterios
                  ? '1.5px solid var(--color-secundario)'
                  : '1.5px solid var(--color-dorado)',
                borderRadius: '12px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: guiaSeleccionadoDetalle.cumpleAmbosCriterios ? 'var(--color-secundario)' : '#785311', fontWeight: 800, fontSize: '0.92rem' }}>
                <Sparkles size={16} />
                <span>
                  {guiaSeleccionadoDetalle.estaOcupadoConOtroTour
                    ? 'Guía Actualmente Ocupado en Otro Tour'
                    : guiaSeleccionadoDetalle.cumpleAmbosCriterios
                    ? 'Match Completo con el Tour Vendido'
                    : 'Match Parcial con el Tour Vendido'}
                </span>
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--texto-principal)' }}>
                • <strong>Disponibilidad de Horario:</strong> {guiaSeleccionadoDetalle.detalleDisponibilidad || (guiaSeleccionadoDetalle.tieneHorarioDisponible ? 'Disponible' : 'Sin agenda registrada')} {reservaSeleccionada ? `(Solicitado: ${reservaSeleccionada.fechaReserva} a las ${reservaSeleccionada.horaReserva})` : ''}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--texto-principal)' }}>
                • <strong>Especialidades Requeridas:</strong> {guiaSeleccionadoDetalle.matchingEspecialidades?.porcentaje}% ({guiaSeleccionadoDetalle.matchingEspecialidades?.coincidentes || 0} de {guiaSeleccionadoDetalle.matchingEspecialidades?.totalRequeridas || 0} etiquetas de especialidad)
              </div>
            </div>

            {/* Reseña Corta / Biografía */}
            {(guiaSeleccionadoDetalle.reseñaCorta || guiaSeleccionadoDetalle.resenaCorta || guiaSeleccionadoDetalle.experienciaDetalle) && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--borde-sutil)'
                }}
              >
                <strong style={{ fontSize: '0.86rem', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <FileText size={15} />
                  Perfil Profesional y Experiencia:
                </strong>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--texto-principal)', lineHeight: 1.5 }}>
                  {guiaSeleccionadoDetalle.reseñaCorta || guiaSeleccionadoDetalle.resenaCorta || guiaSeleccionadoDetalle.experienciaDetalle}
                </p>
                {guiaSeleccionadoDetalle.competenciasTec && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
                    <strong>Competencias técnicas:</strong> {guiaSeleccionadoDetalle.competenciasTec}
                  </p>
                )}
              </div>
            )}

            {/* Datos de Contacto y Emergencia */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--fondo-secundario)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--borde-sutil)',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--texto-secundario)', display: 'block', fontSize: '0.76rem', fontWeight: 600 }}>Teléfono Principal / WhatsApp:</span>
                <strong style={{ color: 'var(--texto-principal)' }}>{guiaSeleccionadoDetalle.telefonoPrincipal || '3001234567'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--texto-secundario)', display: 'block', fontSize: '0.76rem', fontWeight: 600 }}>Contacto de Emergencia:</span>
                <span style={{ color: 'var(--texto-principal)' }}>
                  {guiaSeleccionadoDetalle.contactoEmergenciaNombre || 'Contacto Familiar'} ({guiaSeleccionadoDetalle.contactoEmergenciaTel || 'N/A'})
                </span>
              </div>
            </div>

            {/* Especialidades Registradas */}
            <div>
              <span style={{ fontSize: '0.84rem', color: 'var(--texto-principal)', fontWeight: 700, display: 'block', marginBottom: '0.45rem' }}>
                Especialidades del Guía (etiquetas que domina):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                {(guiaSeleccionadoDetalle.especialidades || []).map((esp) => {
                  const coincide = guiaSeleccionadoDetalle.matchingEspecialidades?.idsCoincidentes?.includes(esp.id);
                  return (
                    <span
                      key={esp.id}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: coincide ? 'var(--color-secundario-claro)' : 'var(--fondo-secundario)',
                        color: coincide ? 'var(--color-secundario)' : 'var(--texto-secundario)',
                        border: coincide ? '1px solid var(--color-secundario)' : '1px solid var(--borde-sutil)',
                        fontWeight: coincide ? 700 : 500
                      }}
                    >
                      {coincide ? '✓ ' : ''}{esp.icono || '🏷️'} {esp.subcategoria}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href={guiaSeleccionadoDetalle.enlaceWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="boton boton-pequeno"
                style={{
                  backgroundColor: '#1F5D50',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  fontWeight: 700,
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={16} />
                <span>Contactar por WhatsApp</span>
              </a>

              {guiaSeleccionadoDetalle.cumpleAmbosCriterios && !guiaSeleccionadoDetalle.estaOcupadoConOtroTour && (
                <button
                  type="button"
                  onClick={() => {
                    const g = guiaSeleccionadoDetalle;
                    setGuiaSeleccionadoDetalle(null);
                    manejarAsignarGuia(g.id, g.nombreCompleto, g.estado, true);
                  }}
                  className="boton boton-primario boton-pequeno"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700, padding: '0.55rem 1rem' }}
                >
                  Asignar Guía al Tour
                </button>
              )}

              <button
                type="button"
                onClick={() => setGuiaSeleccionadoDetalle(null)}
                className="boton boton-contorno boton-pequeno"
                style={{ padding: '0.55rem 1rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Reenvío de Solicitud de Aprobación */}
      <Modal
        abierto={modalReenvioAbierto}
        alCerrar={() => setModalReenvioAbierto(false)}
        titulo="Corregir Datos y Reenviar Solicitud de Aprobación"
        anchoMaximo="540px"
      >
        <form onSubmit={manejarReenviarSolicitud}>
          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Nombre de la Agencia</label>
            <input
              type="text"
              required
              value={nombreAgenciaReenvio}
              onChange={(e) => setNombreAgenciaReenvio(e.target.value)}
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">Número de RNT</label>
            <input
              type="text"
              required
              value={numeroRntReenvio}
              onChange={(e) => setNumeroRntReenvio(e.target.value)}
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Adjuntar Nuevo Certificado RNT (PDF o Imagen)</span>
              <FileUp size={15} color="#38bdf8" />
            </label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setNuevoArchivoRnt(e.target.files[0])}
              className="campo-formulario"
              style={{ padding: '0.5rem' }}
            />
            <span className="texto-ayuda">Adjunta el certificado actualizado si el anterior fue observado.</span>
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
                <span>Reenviar a Cola de Verificación</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
