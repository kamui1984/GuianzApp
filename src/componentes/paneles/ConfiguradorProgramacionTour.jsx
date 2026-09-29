import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export const ConfiguradorProgramacionTour = ({
  salidas = [],
  alCambiarSalidas,
  duracion = '4 horas'
}) => {
  const hoyStr = new Date().toISOString().split('T')[0];
  const [nuevaFecha, setNuevaFecha] = useState(hoyStr);
  const [nuevaHora, setNuevaHora] = useState('09:00');
  const [nuevosCupos, setNuevosCupos] = useState(15);

  const agregarSalida = (e) => {
    e?.preventDefault();
    if (!nuevaFecha || !nuevaHora) return;

    // Formatear hora a HH:MM:00
    const horaFormateada = nuevaHora.length === 5 ? `${nuevaHora}:00` : nuevaHora;

    const salidaExistente = salidas.some(
      (s) => s.fecha === nuevaFecha && (s.horaInicio === horaFormateada || s.hora_inicio === horaFormateada)
    );

    if (salidaExistente) {
      alert('Ya existe una salida programada para esa misma fecha y hora.');
      return;
    }

    const nueva = {
      id: `temp-${Date.now()}`,
      fecha: nuevaFecha,
      horaInicio: horaFormateada,
      hora_inicio: horaFormateada,
      cuposMaximos: Number(nuevosCupos || 15),
      cupos_maximos: Number(nuevosCupos || 15),
      cuposDisponibles: Number(nuevosCupos || 15),
      cupos_disponibles: Number(nuevosCupos || 15),
      estado: 'Disponible'
    };

    alCambiarSalidas([...salidas, nueva]);
  };

  const eliminarSalida = (indice) => {
    const filtradas = salidas.filter((_, i) => i !== indice);
    alCambiarSalidas(filtradas);
  };

  const generarSalidasAutomaticas = () => {
    const nuevasGeneradas = [];
    const baseFecha = new Date();

    // Generar salidas para los próximos 14 días
    for (let i = 1; i <= 14; i++) {
      const f = new Date(baseFecha);
      f.setDate(baseFecha.getDate() + i);
      const fStr = f.toISOString().split('T')[0];

      // Salida mañana
      nuevasGeneradas.push({
        id: `auto-${fStr}-1`,
        fecha: fStr,
        horaInicio: '09:00:00',
        hora_inicio: '09:00:00',
        cuposMaximos: 15,
        cupos_maximos: 15,
        cuposDisponibles: 15,
        cupos_disponibles: 15,
        estado: 'Disponible'
      });

      // Salida tarde
      nuevasGeneradas.push({
        id: `auto-${fStr}-2`,
        fecha: fStr,
        horaInicio: '14:00:00',
        hora_inicio: '14:00:00',
        cuposMaximos: 15,
        cupos_maximos: 15,
        cuposDisponibles: 15,
        cupos_disponibles: 15,
        estado: 'Disponible'
      });
    }

    alCambiarSalidas(nuevasGeneradas);
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

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <label className="etiqueta-formulario" style={{ marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <Clock size={16} color="var(--color-primario)" />
            <span>Programación de Salidas y Horarios de Inicio (programacion_tours)</span>
          </label>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.82rem', margin: 0 }}>
            Define qué días y a qué horas exactas saldrá este tour. Los turistas solo podrán reservar en estas fechas y horarios configurados.
          </p>
        </div>

        <button
          type="button"
          onClick={generarSalidasAutomaticas}
          className="boton boton-contorno"
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Sparkles size={14} color="var(--color-primario)" />
          <span>Generar 14 días (09:00 AM y 02:00 PM)</span>
        </button>
      </div>

      {/* Formulario para agregar una salida individual */}
      <div
        style={{
          backgroundColor: 'var(--fondo-secundario)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--borde-sutil)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 120px auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Fecha de Salida</label>
            <input
              type="date"
              min={hoyStr}
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="campo-formulario"
              style={{ padding: '0.45rem 0.6rem', fontSize: '0.86rem' }}
            />
          </div>

          <div>
            <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Hora de Inicio</label>
            <input
              type="time"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              className="campo-formulario"
              style={{ padding: '0.45rem 0.6rem', fontSize: '0.86rem' }}
            />
          </div>

          <div>
            <label className="etiqueta-formulario" style={{ fontSize: '0.78rem' }}>Cupos Máx.</label>
            <input
              type="number"
              min={1}
              max={100}
              value={nuevosCupos}
              onChange={(e) => setNuevosCupos(Math.max(1, parseInt(e.target.value) || 1))}
              className="campo-formulario"
              style={{ padding: '0.45rem 0.6rem', fontSize: '0.86rem' }}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={agregarSalida}
              className="boton boton-primario"
              style={{ padding: '0.5rem 1rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={16} />
              <span>Añadir Salida</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de salidas configuradas */}
      {salidas.length === 0 ? (
        <div
          style={{
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: 'var(--fondo-tarjeta)',
            border: '1px dashed var(--borde-sutil)',
            borderRadius: '10px',
            color: 'var(--texto-secundario)',
            fontSize: '0.86rem'
          }}
        >
          No hay salidas programadas aún. Añade horarios puntuales arriba o genera los próximos 14 días automáticamente.
        </div>
      ) : (
        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '4px' }}>
          {salidas.map((s, index) => {
            const hora12 = formatearHora12(s.horaInicio || s.hora_inicio);
            const cuposDisponibles = s.cuposDisponibles ?? s.cupos_disponibles ?? s.cuposMaximos;

            return (
              <div
                key={s.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'var(--fondo-tarjeta)',
                  border: '1px solid var(--borde-sutil)',
                  borderRadius: '8px',
                  fontSize: '0.86rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--texto-principal)', fontWeight: 600 }}>
                    <Calendar size={14} color="var(--color-primario)" />
                    <span>{s.fecha}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primario)', fontWeight: 700 }}>
                    <Clock size={14} />
                    <span>{hora12}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--texto-secundario)', fontSize: '0.8rem' }}>
                    <Users size={13} />
                    <span>
                      {cuposDisponibles} / {s.cuposMaximos || s.cupos_maximos} cupos disponibles
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarSalida(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-peligro, #ef4444)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  title="Eliminar horario"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
