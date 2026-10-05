import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Repeat,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  AlertCircle,
  X,
  ChevronDown
} from 'lucide-react';

// Días de la semana para el selector estilo Google Calendar (0 = Domingo, 1 = Lunes, ...)
const DIAS_SEMANA = [
  { id: 1, label: 'L', nombre: 'Lunes' },
  { id: 2, label: 'M', nombre: 'Martes' },
  { id: 3, label: 'M', nombre: 'Miércoles' },
  { id: 4, label: 'J', nombre: 'Jueves' },
  { id: 5, label: 'V', nombre: 'Viernes' },
  { id: 6, label: 'S', nombre: 'Sábado' },
  { id: 0, label: 'D', nombre: 'Domingo' }
];

const HORARIOS_PREDEFINIDOS = ['08:00', '09:00', '10:00', '14:00', '15:30', '17:00'];

const parsearFechaLocal = (str) => {
  if (!str) return new Date();
  const [a, m, d] = str.split('-').map(Number);
  return new Date(a, m - 1, d);
};

const formatearFechaISO = (d) => {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const formatearFechaLegible = (str) => {
  if (!str) return '';
  const d = parsearFechaLocal(str);
  const texto = d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const formatearHora12 = (horaStr) => {
  if (!horaStr) return '';
  const partes = horaStr.split(':');
  let horas = parseInt(partes[0], 10);
  const minutos = partes[1] || '00';
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12;
  return `${horas < 10 ? '0' + horas : horas}:${minutos} ${ampm}`;
};

export const ConfiguradorProgramacionTour = ({
  salidas = [],
  alCambiarSalidas,
  duracion = '4 horas'
}) => {
  const hoy = new Date();
  const hoyStr = formatearFechaISO(hoy);

  // Fecha 14 días adelante por defecto para el rango
  const fechaFinDefecto = new Date();
  fechaFinDefecto.setDate(hoy.getDate() + 14);
  const fechaFinDefectoStr = formatearFechaISO(fechaFinDefecto);

  // Modo de programación: 'unico' (Día puntual) | 'recurrente' (Periodo / Google Calendar)
  const [modoProgramacion, setModoProgramacion] = useState('recurrente');

  // --- Estados para DÍA PUNTUAL ---
  const [fechaPuntual, setFechaPuntual] = useState(hoyStr);
  const [horariosPuntuales, setHorariosPuntuales] = useState(['09:00', '14:00']);
  const [horaPuntualInput, setHoraPuntualInput] = useState('09:00');
  const [cuposPuntual, setCuposPuntual] = useState(15);

  // --- Estados para PERIODO RECURRENTE (Google Calendar) ---
  const [fechaInicioRecurrente, setFechaInicioRecurrente] = useState(hoyStr);
  const [fechaFinRecurrente, setFechaFinRecurrente] = useState(fechaFinDefectoStr);
  const [patronRecurrencia, setPatronRecurrencia] = useState('todos'); // 'todos', 'laborables', 'fin_semana', 'personalizado'
  const [diasActivos, setDiasActivos] = useState([1, 2, 3, 4, 5, 6, 0]); // Por defecto todos seleccionados
  const [horariosRecurrentes, setHorariosRecurrentes] = useState(['09:00', '14:00']);
  const [horaRecurrenteInput, setHoraRecurrenteInput] = useState('09:00');
  const [cuposRecurrente, setCuposRecurrente] = useState(15);

  // Mensajes de feedback temporal
  const [mensajeExito, setMensajeExito] = useState('');

  const mostrarExito = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(''), 4000);
  };

  // Manejar selector de patrón estilo Google Calendar
  const cambiarPatron = (nuevoPatron) => {
    setPatronRecurrencia(nuevoPatron);
    if (nuevoPatron === 'todos') {
      setDiasActivos([1, 2, 3, 4, 5, 6, 0]);
    } else if (nuevoPatron === 'laborables') {
      setDiasActivos([1, 2, 3, 4, 5]);
    } else if (nuevoPatron === 'fin_semana') {
      setDiasActivos([6, 0]);
    }
  };

  const alternarDiaSemana = (diaId) => {
    setPatronRecurrencia('personalizado');
    if (diasActivos.includes(diaId)) {
      if (diasActivos.length === 1) return; // Mínimo un día activo
      setDiasActivos(diasActivos.filter((d) => d !== diaId));
    } else {
      setDiasActivos([...diasActivos, diaId]);
    }
  };

  // Agregar horario a la lista puntual
  const agregarHorarioPuntual = (hora) => {
    const h = hora || horaPuntualInput;
    if (!h) return;
    if (!horariosPuntuales.includes(h)) {
      setHorariosPuntuales([...horariosPuntuales, h].sort());
    }
  };

  const eliminarHorarioPuntual = (hora) => {
    if (horariosPuntuales.length <= 1) return;
    setHorariosPuntuales(horariosPuntuales.filter((h) => h !== hora));
  };

  // Agregar horario a la serie recurrente
  const agregarHorarioRecurrente = (hora) => {
    const h = hora || horaRecurrenteInput;
    if (!h) return;
    if (!horariosRecurrentes.includes(h)) {
      setHorariosRecurrentes([...horariosRecurrentes, h].sort());
    }
  };

  const eliminarHorarioRecurrente = (hora) => {
    if (horariosRecurrentes.length <= 1) return;
    setHorariosRecurrentes(horariosRecurrentes.filter((h) => h !== hora));
  };

  // Atajos rápidos para fecha fin
  const sumarDiasFechaFin = (dias) => {
    const inicio = parsearFechaLocal(fechaInicioRecurrente);
    inicio.setDate(inicio.getDate() + dias);
    setFechaFinRecurrente(formatearFechaISO(inicio));
  };

  // Previsualización y conteo en tiempo real de salidas que se generarían
  const resumenRecurrente = useMemo(() => {
    if (!fechaInicioRecurrente || !fechaFinRecurrente) {
      return { diasCoincidentes: 0, totalSalidas: 0 };
    }

    const inicio = parsearFechaLocal(fechaInicioRecurrente);
    const fin = parsearFechaLocal(fechaFinRecurrente);

    if (fin < inicio) {
      return { diasCoincidentes: 0, totalSalidas: 0, error: 'La fecha fin no puede ser anterior a la de inicio' };
    }

    let contadorDias = 0;
    const actual = new Date(inicio);

    // Limitar cálculo a máximo 365 días por seguridad
    let iteraciones = 0;
    while (actual <= fin && iteraciones < 365) {
      const diaSemana = actual.getDay();
      if (diasActivos.includes(diaSemana)) {
        contadorDias++;
      }
      actual.setDate(actual.getDate() + 1);
      iteraciones++;
    }

    return {
      diasCoincidentes: contadorDias,
      totalSalidas: contadorDias * horariosRecurrentes.length,
      error: null
    };
  }, [fechaInicioRecurrente, fechaFinRecurrente, diasActivos, horariosRecurrentes]);

  // Acción 1: Añadir salidas de DÍA PUNTUAL
  const aplicarSalidasPuntuales = (e) => {
    e?.preventDefault();
    if (!fechaPuntual || horariosPuntuales.length === 0) return;

    const nuevasSalidas = [...salidas];
    let agregadas = 0;

    horariosPuntuales.forEach((h) => {
      const horaFormato = h.length === 5 ? `${h}:00` : h;
      const existe = nuevasSalidas.some(
        (s) => s.fecha === fechaPuntual && (s.horaInicio === horaFormato || s.hora_inicio === horaFormato)
      );

      if (!existe) {
        nuevasSalidas.push({
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          fecha: fechaPuntual,
          horaInicio: horaFormato,
          hora_inicio: horaFormato,
          cuposMaximos: Number(cuposPuntual || 15),
          cupos_maximos: Number(cuposPuntual || 15),
          cuposDisponibles: Number(cuposPuntual || 15),
          cupos_disponibles: Number(cuposPuntual || 15),
          estado: 'Disponible'
        });
        agregadas++;
      }
    });

    // Ordenar cronológicamente
    nuevasSalidas.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return (a.horaInicio || a.hora_inicio || '').localeCompare(b.horaInicio || b.hora_inicio || '');
    });

    alCambiarSalidas(nuevasSalidas);
    mostrarExito(`✓ Se agregaron ${agregadas} salida(s) para el ${formatearFechaLegible(fechaPuntual)}.`);
  };

  // Acción 2: Generar programación RECURRENTE (Google Calendar)
  const aplicarProgramacionRecurrente = (e) => {
    e?.preventDefault();
    if (resumenRecurrente.error || resumenRecurrente.totalSalidas === 0) return;

    const inicio = parsearFechaLocal(fechaInicioRecurrente);
    const fin = parsearFechaLocal(fechaFinRecurrente);
    const nuevasSalidas = [...salidas];
    let contadorAgregadas = 0;

    const actual = new Date(inicio);
    let iteraciones = 0;

    while (actual <= fin && iteraciones < 365) {
      const diaSemana = actual.getDay();
      if (diasActivos.includes(diaSemana)) {
        const fechaStr = formatearFechaISO(actual);

        horariosRecurrentes.forEach((h) => {
          const horaFormato = h.length === 5 ? `${h}:00` : h;
          const existe = nuevasSalidas.some(
            (s) => s.fecha === fechaStr && (s.horaInicio === horaFormato || s.hora_inicio === horaFormato)
          );

          if (!existe) {
            nuevasSalidas.push({
              id: `auto-${fechaStr}-${h.replace(':', '')}-${Math.random().toString(36).substr(2, 4)}`,
              fecha: fechaStr,
              horaInicio: horaFormato,
              hora_inicio: horaFormato,
              cuposMaximos: Number(cuposRecurrente || 15),
              cupos_maximos: Number(cuposRecurrente || 15),
              cuposDisponibles: Number(cuposRecurrente || 15),
              cupos_disponibles: Number(cuposRecurrente || 15),
              estado: 'Disponible'
            });
            contadorAgregadas++;
          }
        });
      }
      actual.setDate(actual.getDate() + 1);
      iteraciones++;
    }

    // Ordenar cronológicamente
    nuevasSalidas.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return (a.horaInicio || a.hora_inicio || '').localeCompare(b.horaInicio || b.hora_inicio || '');
    });

    alCambiarSalidas(nuevasSalidas);
    mostrarExito(`✓ ¡Éxito! Se programaron ${contadorAgregadas} salidas recurrentes según tu calendario.`);
  };

  // Eliminar salida individual
  const eliminarSalida = (indice) => {
    const filtradas = salidas.filter((_, i) => i !== indice);
    alCambiarSalidas(filtradas);
  };

  // Eliminar todas las salidas de una fecha específica
  const eliminarSalidasDeFecha = (fecha) => {
    const filtradas = salidas.filter((s) => s.fecha !== fecha);
    alCambiarSalidas(filtradas);
  };

  // Limpiar todas las salidas
  const limpiarTodasLasSalidas = () => {
    if (salidas.length === 0) return;
    if (window.confirm('¿Deseas vaciar todas las salidas programadas de este paquete?')) {
      alCambiarSalidas([]);
      mostrarExito('Se han eliminado todas las salidas programadas.');
    }
  };

  // Agrupar salidas por fecha para vista estilo Google Calendar
  const salidasAgrupadasPorFecha = useMemo(() => {
    const grupos = {};
    salidas.forEach((s, idx) => {
      if (!grupos[s.fecha]) {
        grupos[s.fecha] = [];
      }
      grupos[s.fecha].push({ ...s, indiceOriginal: idx });
    });

    // Ordenar fechas
    return Object.keys(grupos)
      .sort()
      .map((fecha) => ({
        fecha,
        fechaLegible: formatearFechaLegible(fecha),
        items: grupos[fecha].sort((a, b) => (a.horaInicio || a.hora_inicio).localeCompare(b.horaInicio || b.hora_inicio))
      }));
  }, [salidas]);

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Encabezado Principal */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label className="etiqueta-formulario" style={{ marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.96rem' }}>
            <Calendar size={18} color="var(--color-primario)" />
            <span>Programación de Salidas y Horarios de Inicio (programacion_tours)</span>
          </label>

          {salidas.length > 0 && (
            <button
              type="button"
              onClick={limpiarTodasLasSalidas}
              style={{
                background: 'none',
                border: '1px solid var(--borde-sutil)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                color: 'var(--color-peligro, #ef4444)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={13} />
              <span>Limpiar todo ({salidas.length})</span>
            </button>
          )}
        </div>

        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.84rem', margin: '0.2rem 0 0.75rem' }}>
          Define con precisión de Google Calendar los días y horarios en los que operará el tour. Puedes programar un día específico o una serie periódica de varios días.
        </p>

        {mensajeExito && (
          <div
            style={{
              backgroundColor: 'var(--color-primario-claro)',
              color: 'var(--color-primario)',
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem',
              border: '1px solid var(--color-primario)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Pestañas de Modo Estilo Google Calendar */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--fondo-secundario)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--borde-sutil)',
            width: 'fit-content',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setModoProgramacion('recurrente')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: modoProgramacion === 'recurrente' ? 700 : 500,
              backgroundColor: modoProgramacion === 'recurrente' ? '#FFFFFF' : 'transparent',
              color: modoProgramacion === 'recurrente' ? 'var(--color-primario)' : 'var(--texto-secundario)',
              boxShadow: modoProgramacion === 'recurrente' ? 'var(--sombra-sutil)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Repeat size={15} />
            <span>Periodo Recurrente (Varios días)</span>
          </button>

          <button
            type="button"
            onClick={() => setModoProgramacion('unico')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: modoProgramacion === 'unico' ? 700 : 500,
              backgroundColor: modoProgramacion === 'unico' ? '#FFFFFF' : 'transparent',
              color: modoProgramacion === 'unico' ? 'var(--color-primario)' : 'var(--texto-secundario)',
              boxShadow: modoProgramacion === 'unico' ? 'var(--sombra-sutil)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CalendarDays size={15} />
            <span>Día Puntual (Fecha única)</span>
          </button>
        </div>
      </div>

      {/* --- PANEL MODO RECURRENTE (Google Calendar) --- */}
      {modoProgramacion === 'recurrente' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--borde-sutil)',
            padding: '1.25rem',
            boxShadow: 'var(--sombra-sutil)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primario)', fontWeight: 700, fontSize: '0.9rem' }}>
            <CalendarRange size={16} />
            <span>Configuración de Recurrencia de Salidas</span>
          </div>

          {/* 1. Rango de Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Desde (Fecha de Inicio)</label>
              <input
                type="date"
                min={hoyStr}
                value={fechaInicioRecurrente}
                onChange={(e) => setFechaInicioRecurrente(e.target.value)}
                className="campo-formulario"
                style={{ padding: '0.5rem', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Hasta (Fecha de Fin)</label>
              <input
                type="date"
                min={fechaInicioRecurrente || hoyStr}
                value={fechaFinRecurrente}
                onChange={(e) => setFechaFinRecurrente(e.target.value)}
                className="campo-formulario"
                style={{ padding: '0.5rem', fontSize: '0.86rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)', marginBottom: '0.35rem' }}>Atajos de periodo:</span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => sumarDiasFechaFin(7)}
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--borde-sutil)', background: 'var(--fondo-secundario)', cursor: 'pointer' }}
                >
                  +1 Sem.
                </button>
                <button
                  type="button"
                  onClick={() => sumarDiasFechaFin(14)}
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--borde-sutil)', background: 'var(--fondo-secundario)', cursor: 'pointer' }}
                >
                  +2 Sem.
                </button>
                <button
                  type="button"
                  onClick={() => sumarDiasFechaFin(30)}
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--borde-sutil)', background: 'var(--fondo-secundario)', cursor: 'pointer' }}
                >
                  +1 Mes
                </button>
                <button
                  type="button"
                  onClick={() => sumarDiasFechaFin(90)}
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--borde-sutil)', background: 'var(--fondo-secundario)', cursor: 'pointer' }}
                >
                  +3 Meses
                </button>
              </div>
            </div>
          </div>

          {/* 2. Días de Repetición (Google Calendar: L M M J V S D) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="etiqueta-formulario" style={{ fontSize: '0.8rem', margin: 0 }}>
                Se repite cada semana en:
              </label>

              {/* Selector de plantilla de repetición */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => cambiarPatron('todos')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: patronRecurrencia === 'todos' ? 'var(--color-primario)' : 'var(--borde-sutil)',
                    backgroundColor: patronRecurrencia === 'todos' ? 'var(--color-primario-claro)' : 'transparent',
                    color: patronRecurrencia === 'todos' ? 'var(--color-primario)' : 'var(--texto-secundario)',
                    cursor: 'pointer',
                    fontWeight: patronRecurrencia === 'todos' ? 700 : 500
                  }}
                >
                  Todos los días
                </button>
                <button
                  type="button"
                  onClick={() => cambiarPatron('laborables')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: patronRecurrencia === 'laborables' ? 'var(--color-primario)' : 'var(--borde-sutil)',
                    backgroundColor: patronRecurrencia === 'laborables' ? 'var(--color-primario-claro)' : 'transparent',
                    color: patronRecurrencia === 'laborables' ? 'var(--color-primario)' : 'var(--texto-secundario)',
                    cursor: 'pointer',
                    fontWeight: patronRecurrencia === 'laborables' ? 700 : 500
                  }}
                >
                  Lun a Vie
                </button>
                <button
                  type="button"
                  onClick={() => cambiarPatron('fin_semana')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: patronRecurrencia === 'fin_semana' ? 'var(--color-primario)' : 'var(--borde-sutil)',
                    backgroundColor: patronRecurrencia === 'fin_semana' ? 'var(--color-primario-claro)' : 'transparent',
                    color: patronRecurrencia === 'fin_semana' ? 'var(--color-primario)' : 'var(--texto-secundario)',
                    cursor: 'pointer',
                    fontWeight: patronRecurrencia === 'fin_semana' ? 700 : 500
                  }}
                >
                  Fines de semana
                </button>
              </div>
            </div>

            {/* Pastillas circulares interactivas de Google Calendar */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {DIAS_SEMANA.map((dia) => {
                const activo = diasActivos.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => alternarDiaSemana(dia.id)}
                    title={dia.nombre}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: activo ? '2px solid var(--color-primario)' : '1px solid var(--borde-sutil)',
                      backgroundColor: activo ? 'var(--color-primario)' : '#FFFFFF',
                      color: activo ? '#FFFFFF' : 'var(--texto-secundario)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: activo ? '0 2px 6px rgba(23, 74, 91, 0.25)' : 'none'
                    }}
                  >
                    {dia.label}
                  </button>
                );
              })}
              <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', marginLeft: '0.5rem' }}>
                ({diasActivos.length} {diasActivos.length === 1 ? 'día seleccionado' : 'días seleccionados'})
              </span>
            </div>
          </div>

          {/* 3. Horarios y Cupos por cada salida */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                Horarios de salida diarios a programar:
              </label>

              {/* Chips de horarios seleccionados */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {horariosRecurrentes.map((h) => (
                  <span
                    key={h}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      backgroundColor: 'var(--color-primario-claro)',
                      border: '1px solid var(--color-primario)',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-primario)'
                    }}
                  >
                    <Clock size={12} />
                    <span>{formatearHora12(h)}</span>
                    {horariosRecurrentes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarHorarioRecurrente(h)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-primario)' }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Añadir otro horario */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input
                  type="time"
                  value={horaRecurrenteInput}
                  onChange={(e) => setHoraRecurrenteInput(e.target.value)}
                  className="campo-formulario"
                  style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={() => agregarHorarioRecurrente(horaRecurrenteInput)}
                  className="boton boton-contorno"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  <Plus size={14} />
                  <span>Añadir horario</span>
                </button>
              </div>

              {/* Atajos de horas predefinidas */}
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {HORARIOS_PREDEFINIDOS.map((hp) => (
                  <button
                    key={hp}
                    type="button"
                    onClick={() => agregarHorarioRecurrente(hp)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid var(--borde-sutil)',
                      background: 'var(--fondo-secundario)',
                      cursor: 'pointer'
                    }}
                  >
                    +{hp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                Cupos máximos por salida:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={cuposRecurrente}
                  onChange={(e) => setCuposRecurrente(Math.max(1, parseInt(e.target.value) || 1))}
                  className="campo-formulario"
                  style={{ width: '110px', padding: '0.45rem 0.6rem', fontSize: '0.86rem' }}
                />
                <span style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
                  turistas por cada horario de salida
                </span>
              </div>
            </div>
          </div>

          {/* 4. Previsualización en vivo estilo Google Calendar */}
          <div
            style={{
              backgroundColor: 'var(--fondo-principal)',
              border: '1px dashed var(--borde-dorado)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Calendar size={20} color="var(--color-dorado)" />
              <div>
                <strong style={{ fontSize: '0.86rem', color: 'var(--texto-principal)', display: 'block' }}>
                  Resumen de la programación:
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                  {resumenRecurrente.error ? (
                    <span style={{ color: 'var(--color-peligro)' }}>{resumenRecurrente.error}</span>
                  ) : (
                    <>
                      Se generarán <strong>{resumenRecurrente.totalSalidas} salidas</strong> ({resumenRecurrente.diasCoincidentes} días × {horariosRecurrentes.length} horario(s)) de {cuposRecurrente} cupos c/u.
                    </>
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={aplicarProgramacionRecurrente}
              disabled={Boolean(resumenRecurrente.error) || resumenRecurrente.totalSalidas === 0}
              className="boton boton-primario"
              style={{
                fontSize: '0.86rem',
                padding: '0.55rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles size={16} />
              <span>Generar Programación Recurrente ({resumenRecurrente.totalSalidas})</span>
            </button>
          </div>
        </div>
      )}

      {/* --- PANEL MODO DÍA PUNTUAL --- */}
      {modoProgramacion === 'unico' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--borde-sutil)',
            padding: '1.25rem',
            boxShadow: 'var(--sombra-sutil)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primario)', fontWeight: 700, fontSize: '0.9rem' }}>
            <CalendarDays size={16} />
            <span>Configurar Salidas para una Fecha Específica</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Fecha de la Salida</label>
              <input
                type="date"
                min={hoyStr}
                value={fechaPuntual}
                onChange={(e) => setFechaPuntual(e.target.value)}
                className="campo-formulario"
                style={{ padding: '0.5rem', fontSize: '0.86rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', marginTop: '0.2rem', display: 'block' }}>
                {formatearFechaLegible(fechaPuntual)}
              </span>
            </div>

            <div>
              <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Cupos Máximos</label>
              <input
                type="number"
                min={1}
                max={100}
                value={cuposPuntual}
                onChange={(e) => setCuposPuntual(Math.max(1, parseInt(e.target.value) || 1))}
                className="campo-formulario"
                style={{ padding: '0.5rem', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          {/* Horarios para este día puntual */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="etiqueta-formulario" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              Horarios de Salida en esta Fecha:
            </label>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {horariosPuntuales.map((h) => (
                <span
                  key={h}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'var(--color-primario-claro)',
                    border: '1px solid var(--color-primario)',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-primario)'
                  }}
                >
                  <Clock size={12} />
                  <span>{formatearHora12(h)}</span>
                  {horariosPuntuales.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarHorarioPuntual(h)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-primario)' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="time"
                value={horaPuntualInput}
                onChange={(e) => setHoraPuntualInput(e.target.value)}
                className="campo-formulario"
                style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
              />
              <button
                type="button"
                onClick={() => agregarHorarioPuntual(horaPuntualInput)}
                className="boton boton-contorno"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <Plus size={14} />
                <span>Añadir horario</span>
              </button>

              <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem', flexWrap: 'wrap' }}>
                {HORARIOS_PREDEFINIDOS.slice(0, 4).map((hp) => (
                  <button
                    key={hp}
                    type="button"
                    onClick={() => agregarHorarioPuntual(hp)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid var(--borde-sutil)',
                      background: 'var(--fondo-secundario)',
                      cursor: 'pointer'
                    }}
                  >
                    +{hp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={aplicarSalidasPuntuales}
            className="boton boton-primario"
            style={{ fontSize: '0.86rem', padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={16} />
            <span>Añadir salidas para el {formatearFechaLegible(fechaPuntual)}</span>
          </button>
        </div>
      )}

      {/* --- LISTA DE SALIDAS PROGRAMADAS (AGENDA CALENDARIO) --- */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <strong style={{ fontSize: '0.88rem', color: 'var(--texto-principal)' }}>
            🗓️ Agenda de Salidas Configuradas ({salidas.length} horarios en {salidasAgrupadasPorFecha.length} fechas)
          </strong>
        </div>

        {salidas.length === 0 ? (
          <div
            style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px dashed var(--borde-sutil)',
              borderRadius: '12px',
              color: 'var(--texto-secundario)',
              fontSize: '0.86rem'
            }}
          >
            <Calendar size={32} color="var(--color-primario)" style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
            <p style={{ fontWeight: 600, color: 'var(--texto-principal)', margin: '0 0 0.25rem' }}>
              No hay salidas programadas para este tour
            </p>
            <span style={{ fontSize: '0.8rem' }}>
              Utiliza la pestaña <strong>Periodo Recurrente</strong> arriba para generar los días y horarios que desees estilo Google Calendar.
            </span>
          </div>
        ) : (
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              paddingRight: '6px'
            }}
          >
            {salidasAgrupadasPorFecha.map((grupo) => (
              <div
                key={grupo.fecha}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--borde-sutil)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.6rem'
                }}
              >
                {/* Cabecera del Día */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '180px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primario-claro)',
                      color: 'var(--color-primario)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Calendar size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--texto-principal)', display: 'block' }}>
                      {grupo.fechaLegible}
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)' }}>
                      {grupo.fecha}
                    </span>
                  </div>
                </div>

                {/* Lista de Horarios para esta fecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                  {grupo.items.map((item) => {
                    const hora12 = formatearHora12(item.horaInicio || item.hora_inicio);
                    const cupos = item.cuposMaximos || item.cupos_maximos || 15;

                    return (
                      <span
                        key={item.id || item.indiceOriginal}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.3rem 0.65rem',
                          backgroundColor: 'var(--fondo-principal)',
                          border: '1px solid var(--borde-sutil)',
                          borderRadius: '6px',
                          fontSize: '0.82rem'
                        }}
                      >
                        <Clock size={12} color="var(--color-primario)" />
                        <strong style={{ color: 'var(--color-primario)' }}>{hora12}</strong>
                        <span style={{ color: 'var(--texto-secundario)', fontSize: '0.76rem' }}>
                          👥 {cupos}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarSalida(item.indiceOriginal)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-peligro, #ef4444)',
                            padding: '1px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Eliminar este horario"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Botón para borrar toda la fecha */}
                <button
                  type="button"
                  onClick={() => eliminarSalidasDeFecha(grupo.fecha)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-peligro, #ef4444)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.75
                  }}
                  title={`Eliminar todas las salidas del ${grupo.fechaLegible}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
