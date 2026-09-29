import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../comunes/Modal';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioPaquetes } from '../../api/paquetesServicio';

export const ModalReserva = ({ paquete, abierto, alCerrar }) => {
  const { usuarioActual, mostrarNotificacion } = useAutenticacion();
  const [salidasProgramadas, setSalidasProgramadas] = useState([]);
  const [cargandoSalidas, setCargandoSalidas] = useState(false);

  // Estados de navegación del calendario interactivo
  const [mesActual, setMesActual] = useState(new Date());
  const [fechaReserva, setFechaReserva] = useState('');
  const [horaReserva, setHoraReserva] = useState('');
  const [salidaSeleccionada, setSalidaSeleccionada] = useState(null);

  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [nombreTitular, setNombreTitular] = useState(usuarioActual?.nombreCompleto || '');
  const [correoContacto, setCorreoContacto] = useState(usuarioActual?.correo || '');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  // Cargar programación de salidas al abrir el modal para el paquete
  useEffect(() => {
    if (!paquete || !abierto) return;

    const cargarHorarios = async () => {
      setCargandoSalidas(true);
      try {
        // Consultar programación fresca para reflejar los horarios y cupos reales definidos por la agencia
        const salidas = await servicioPaquetes.obtenerProgramacion(paquete.id);
        const salidasValidas = (salidas || []).filter((s) => !String(s.id || '').startsWith('def-'));
        setSalidasProgramadas(salidasValidas);

        // Seleccionar automáticamente la primera fecha con disponibilidad
        const primeraConCupos = salidasValidas.find(
          (s) => (s.cuposDisponibles ?? s.cupos_disponibles ?? s.cuposMaximos) > 0 && s.estado !== 'Completo'
        );

        if (primeraConCupos) {
          setFechaReserva(primeraConCupos.fecha);
          const h12 = formatearHora12(primeraConCupos.horaInicio || primeraConCupos.hora_inicio);
          setHoraReserva(h12);
          setSalidaSeleccionada(primeraConCupos);
        } else {
          setFechaReserva('');
          setHoraReserva('');
          setSalidaSeleccionada(null);
        }
      } catch (err) {
        console.error('Error al cargar salidas programadas:', err);
      } finally {
        setCargandoSalidas(false);
      }
    };

    cargarHorarios();
  }, [paquete, abierto]);

  // Mapa de fechas que tienen salidas programadas (declarado al nivel superior)
  const mapaFechasSalidas = useMemo(() => {
    const mapa = {};
    (salidasProgramadas || []).forEach((s) => {
      if (!mapa[s.fecha]) mapa[s.fecha] = [];
      mapa[s.fecha].push(s);
    });
    return mapa;
  }, [salidasProgramadas]);

  // Salidas del día actualmente seleccionado en el calendario
  const salidasDelDiaSeleccionado = useMemo(() => {
    if (!fechaReserva) return [];
    return mapaFechasSalidas[fechaReserva] || [];
  }, [fechaReserva, mapaFechasSalidas]);

  if (!paquete) return null;

  const totalCalculado = (paquete.precio || 0) * cantidadPersonas;

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  function formatearHora12(horaStr) {
    if (!horaStr) return '';
    const partes = horaStr.split(':');
    let horas = parseInt(partes[0], 10);
    const minutos = partes[1] || '00';
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12;
    return `${horas < 10 ? '0' + horas : horas}:${minutos} ${ampm}`;
  }

  // Lógica del calendario interactivo
  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth();
  const nombreMes = mesActual.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const primerDiaMes = new Date(anio, mes, 1);
  const ultimoDiaMes = new Date(anio, mes + 1, 0);

  // En JS 0 es domingo, ajustamos a lunes = 0
  let diaInicioSemana = primerDiaMes.getDay() - 1;
  if (diaInicioSemana === -1) diaInicioSemana = 6;

  const diasEnMes = ultimoDiaMes.getDate();
  const celdasCalendario = [];

  for (let i = 0; i < diaInicioSemana; i++) {
    celdasCalendario.push(null);
  }
  for (let d = 1; d <= diasEnMes; d++) {
    const mesFormateado = String(mes + 1).padStart(2, '0');
    const diaFormateado = String(d).padStart(2, '0');
    const fechaStr = `${anio}-${mesFormateado}-${diaFormateado}`;
    celdasCalendario.push({ dia: d, fechaStr });
  }

  const cambiarMes = (delta) => {
    const nuevo = new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1);
    setMesActual(nuevo);
  };

  const seleccionarDia = (fechaStr) => {
    setFechaReserva(fechaStr);
    const salidas = mapaFechasSalidas[fechaStr] || [];
    const disponible = salidas.find(
      (s) => (s.cuposDisponibles ?? s.cupos_disponibles ?? s.cuposMaximos) > 0 && s.estado !== 'Completo'
    );
    if (disponible) {
      const h12 = formatearHora12(disponible.horaInicio || disponible.hora_inicio);
      setHoraReserva(h12);
      setSalidaSeleccionada(disponible);
    } else {
      setHoraReserva('');
      setSalidaSeleccionada(null);
    }
  };

  const seleccionarHora = (salida) => {
    const h12 = formatearHora12(salida.horaInicio || salida.hora_inicio);
    setHoraReserva(h12);
    setSalidaSeleccionada(salida);
  };

  const manejarEnvioReserva = async (e) => {
    e.preventDefault();
    if (!fechaReserva || !horaReserva) {
      setErrorMensaje('Debes seleccionar una fecha y un horario de inicio disponible.');
      return;
    }

    setErrorMensaje('');
    setCargando(true);

    try {
      await servicioPaquetes.registrarReserva({
        idPaquete: paquete.id,
        idAgencia: paquete.idAgencia,
        nombreTitular,
        correoContacto,
        telefonoContacto,
        fechaReserva,
        horaReserva,
        cantidadPersonas,
        precioTotal: totalCalculado,
        duracion: paquete.duracion || '3.5 horas',
        tituloPaquete: paquete.titulo,
        nombreAgencia: paquete.nombreAgencia
      });

      setReservaConfirmada(true);
      mostrarNotificacion('¡Reserva confirmada con éxito! La agencia ha recibido tu solicitud.');
    } catch (error) {
      setErrorMensaje(error.message || 'No se pudo completar la reserva.');
    } finally {
      setCargando(false);
    }
  };

  const reiniciarYCerrar = () => {
    setReservaConfirmada(false);
    alCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={reiniciarYCerrar}
      titulo={reservaConfirmada ? '¡Reserva Exitosa!' : `Reservar: ${paquete.titulo}`}
      anchoMaximo="640px"
    >
      {reservaConfirmada ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }} className="animar-aparicion">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-secundario-claro)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--color-secundario)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--texto-principal)', fontFamily: 'var(--fuente-titulos)' }}>
            ¡Tu reserva ha sido confirmada!
          </h3>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            Hemos descontado los cupos y notificado a <strong>{paquete.nombreAgencia}</strong>. En breve recibirás un correo en{' '}
            <strong>{correoContacto}</strong> con el itinerario, punto de encuentro y voucher oficial.
          </p>

          <div
            style={{
              backgroundColor: 'var(--fondo-secundario)',
              borderRadius: '12px',
              border: '1px solid var(--borde-sutil)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.88rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--texto-secundario)' }}>Fecha programada:</span>
              <strong style={{ color: 'var(--texto-principal)' }}>{fechaReserva}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--texto-secundario)' }}>Horario oficial de salida:</span>
              <strong style={{ color: 'var(--color-primario)' }}>{horaReserva}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--texto-secundario)' }}>Duración estimada:</span>
              <strong style={{ color: 'var(--texto-principal)' }}>{paquete.duracion || '3.5 horas'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--texto-secundario)' }}>Asistentes:</span>
              <strong style={{ color: 'var(--texto-principal)' }}>{cantidadPersonas} personas</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--borde-sutil)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--texto-secundario)' }}>Total pagado / acordado:</span>
              <strong style={{ color: 'var(--color-primario)', fontSize: '1.15rem', fontFamily: 'var(--fuente-titulos)', fontWeight: 800 }}>
                {formatearPrecio(totalCalculado)}
              </strong>
            </div>
          </div>

          <button onClick={reiniciarYCerrar} className="boton boton-primario" style={{ width: '100%' }}>
            Entendido, volver al inicio
          </button>
        </div>
      ) : (
        <form onSubmit={manejarEnvioReserva} className="animar-aparicion">
          {errorMensaje && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-peligro-fondo)',
                border: '1px solid var(--color-peligro)',
                borderRadius: '8px',
                color: 'var(--color-peligro)',
                fontSize: '0.88rem',
                marginBottom: '1rem'
              }}
            >
              {errorMensaje}
            </div>
          )}

          {/* Banner de Operador y Etiquetas de Especialidad del Paquete */}
          <div
            style={{
              backgroundColor: 'var(--color-primario-claro)',
              border: '1px solid rgba(23, 74, 91, 0.2)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Operado por</span>
                <strong style={{ color: 'var(--color-primario)', fontSize: '0.94rem' }}>{paquete.nombreAgencia}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Duración del Tour</span>
                <strong style={{ color: 'var(--texto-principal)', fontSize: '0.88rem' }}>{paquete.duracion || '3.5 horas'}</strong>
              </div>
            </div>

            {/* Especialidades Requeridas del Paquete */}
            {paquete.especialidades && paquete.especialidades.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(23, 74, 91, 0.15)', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Especialidades certificadas del tour:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {paquete.especialidades.map((esp) => (
                    <span
                      key={esp.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--borde-sutil)',
                        borderRadius: '12px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--color-primario)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>{esp.icono || '🏷️'}</span>
                      <span>{esp.subcategoria}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: EL CALENDARIO INTERACTIVO (Resalta días con salidas programadas) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label className="etiqueta-formulario" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                <CalendarIcon size={16} color="var(--color-primario)" />
                <span>Paso 2: Selecciona la Fecha en el Calendario</span>
              </label>
              <span style={{ fontSize: '0.76rem', color: 'var(--texto-secundario)' }}>
                Días resaltados tienen salidas disponibles
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--fondo-tarjeta)',
                border: '1px solid var(--borde-sutil)',
                borderRadius: '12px',
                padding: '0.85rem'
              }}
            >
              {/* Controles de Mes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => cambiarMes(-1)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--borde-sutil)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <strong style={{ fontSize: '0.92rem', textTransform: 'capitalize', color: 'var(--texto-principal)' }}>
                  {nombreMes}
                </strong>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--borde-sutil)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Días de la semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '4px' }}>
                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
                  <span key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--texto-secundario)' }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Cuadrícula de Días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {celdasCalendario.map((celda, idx) => {
                  if (!celda) {
                    return <div key={`vacio-${idx}`} style={{ height: '36px' }} />;
                  }

                  const tieneSalidas = Boolean(mapaFechasSalidas[celda.fechaStr]);
                  const esSeleccionado = fechaReserva === celda.fechaStr;
                  const salidasDia = mapaFechasSalidas[celda.fechaStr] || [];
                  const hayCupos = salidasDia.some(
                    (s) => (s.cuposDisponibles ?? s.cupos_disponibles ?? s.cuposMaximos) > 0 && s.estado !== 'Completo'
                  );

                  return (
                    <button
                      key={celda.fechaStr}
                      type="button"
                      disabled={!tieneSalidas}
                      onClick={() => seleccionarDia(celda.fechaStr)}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        border: esSeleccionado
                          ? '2px solid var(--color-primario)'
                          : tieneSalidas
                          ? '1px solid rgba(23, 74, 91, 0.3)'
                          : '1px solid transparent',
                        backgroundColor: esSeleccionado
                          ? 'var(--color-primario)'
                          : tieneSalidas
                          ? (hayCupos ? 'var(--color-primario-claro)' : 'rgba(239, 68, 68, 0.08)')
                          : 'transparent',
                        color: esSeleccionado
                          ? '#FFFFFF'
                          : tieneSalidas
                          ? 'var(--texto-principal)'
                          : 'rgba(0,0,0,0.25)',
                        cursor: tieneSalidas ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.84rem', fontWeight: tieneSalidas ? 700 : 400 }}>{celda.dia}</span>
                      {tieneSalidas && (
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: esSeleccionado
                              ? '#FFFFFF'
                              : (hayCupos ? 'var(--color-secundario, #10b981)' : '#ef4444'),
                            marginTop: '2px'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PASO 3: SELECCIÓN DE LA HORA (Píldoras de tiempo horizontales con cupos) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="etiqueta-formulario" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Clock size={16} color="var(--color-primario)" />
              <span>Paso 3: Horarios de Inicio Disponibles</span>
              {fechaReserva && <span style={{ fontWeight: 500, color: 'var(--texto-secundario)', fontSize: '0.82rem' }}>({fechaReserva})</span>}
            </label>

            {cargandoSalidas ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--texto-secundario)', fontSize: '0.84rem' }}>
                Cargando salidas programadas...
              </div>
            ) : !fechaReserva ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--fondo-secundario)', borderRadius: '8px', color: 'var(--texto-secundario)', fontSize: '0.84rem' }}>
                Por favor toca un día con salidas resaltadas en el calendario superior.
              </div>
            ) : salidasDelDiaSeleccionado.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--fondo-secundario)', borderRadius: '8px', color: 'var(--texto-secundario)', fontSize: '0.84rem' }}>
                No hay salidas programadas para el {fechaReserva}. Elige otro día resaltado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {salidasDelDiaSeleccionado.map((salida, idx) => {
                  const h12 = formatearHora12(salida.horaInicio || salida.hora_inicio);
                  const cuposDisponibles = Number(salida.cuposDisponibles ?? salida.cupos_disponibles ?? salida.cuposMaximos);
                  const agotado = cuposDisponibles <= 0 || salida.estado === 'Completo';
                  const esSeleccionado = horaReserva === h12;

                  return (
                    <button
                      key={salida.id || idx}
                      type="button"
                      disabled={agotado}
                      onClick={() => seleccionarHora(salida)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        border: esSeleccionado
                          ? '2px solid var(--color-primario)'
                          : '1.5px solid var(--borde-sutil)',
                        backgroundColor: esSeleccionado
                          ? 'var(--color-primario)'
                          : agotado
                          ? 'rgba(0,0,0,0.04)'
                          : 'var(--fondo-tarjeta)',
                        color: esSeleccionado ? '#FFFFFF' : 'var(--texto-principal)',
                        cursor: agotado ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        opacity: agotado ? 0.6 : 1
                      }}
                    >
                      <span>[ {h12} ]</span>
                      {agotado ? (
                        <span style={{ fontSize: '0.76rem', color: esSeleccionado ? '#FFFFFF' : '#ef4444', fontWeight: 700 }}>
                          🔴 Agotado
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: esSeleccionado ? '#FFFFFF' : 'var(--color-secundario, #059669)', fontWeight: 700 }}>
                          🟢 Quedan {cuposDisponibles} cupos
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DATOS DEL TURISTA Y ASISTENTES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Número de Asistentes</span>
                <Users size={15} color="var(--texto-secundario)" />
              </label>
              <input
                type="number"
                required
                min={1}
                max={salidaSeleccionada ? Math.min(20, salidaSeleccionada.cuposDisponibles ?? salidaSeleccionada.cupos_disponibles ?? 20) : 20}
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(Math.max(1, parseInt(e.target.value) || 1))}
                className="campo-formulario"
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Nombre del Titular</span>
                <User size={15} color="var(--texto-secundario)" />
              </label>
              <input
                type="text"
                required
                value={nombreTitular}
                onChange={(e) => setNombreTitular(e.target.value)}
                placeholder="Tu nombre completo"
                className="campo-formulario"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Correo de Confirmación</span>
                <Mail size={15} color="var(--texto-secundario)" />
              </label>
              <input
                type="email"
                required
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
                placeholder="tu@correo.com"
                className="campo-formulario"
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Teléfono WhatsApp</span>
                <Phone size={15} color="var(--texto-secundario)" />
              </label>
              <input
                type="tel"
                required
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                placeholder="Ej: +57 310 1234567"
                className="campo-formulario"
              />
            </div>
          </div>

          {/* Resumen de Precio */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--fondo-secundario)',
              borderRadius: '12px',
              border: '1px solid var(--borde-sutil)',
              marginTop: '0.5rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>
                {cantidadPersonas} {cantidadPersonas === 1 ? 'persona' : 'personas'} × {formatearPrecio(paquete.precio)}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-primario)', fontWeight: 700 }}>
                Salida: {fechaReserva || 'Fecha por elegir'} a las {horaReserva || 'Horario por elegir'}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', display: 'block', fontWeight: 600 }}>Total a pagar</span>
              <strong style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)' }}>
                {formatearPrecio(totalCalculado)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={alCerrar} className="boton boton-contorno" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || !fechaReserva || !horaReserva}
              className="boton boton-primario"
              style={{ flex: 2, padding: '0.85rem' }}
            >
              {cargando ? (
                <>
                  <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                  <span>Procesando reserva...</span>
                </>
              ) : (
                <span>Confirmar Salida Programada</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
