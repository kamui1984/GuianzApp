import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  User,
  Building2,
  Compass,
  FileDown
} from 'lucide-react';
import { Modal } from '../../comunes/Modal';

export const TabReportesReclamaciones = ({
  reportes,
  cargando,
  alActualizarSeguimiento,
  alDescargarCSV
}) => {
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal de seguimiento y gestión de caso
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  // Formulario modal
  const [nuevoEstado, setNuevoEstado] = useState('en_revision');
  const [accionesTomadas, setAccionesTomadas] = useState('');
  const [responsableRemitido, setResponsableRemitido] = useState('');
  const [resolucionFinal, setResolucionFinal] = useState('');
  const [notaAdmin, setNotaAdmin] = useState('');
  const [guardando, setGuardando] = useState(false);

  const reportesFiltrados = reportes.filter((r) => {
    if (estadoFiltro !== 'todos' && r.estado !== estadoFiltro) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const caso = (r.codigo_caso || '').toLowerCase();
      const rep = (r.nombre_reportante || '').toLowerCase();
      const af = (r.nombre_afectado || '').toLowerCase();
      const res = (r.codigo_reserva || '').toLowerCase();
      const desc = (r.descripcion || '').toLowerCase();
      if (!caso.includes(q) && !rep.includes(q) && !af.includes(q) && !res.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  const abrirModalCaso = (reporte) => {
    setReporteSeleccionado(reporte);
    setNuevoEstado(reporte.estado);
    setAccionesTomadas(reporte.acciones_tomadas || '');
    setResponsableRemitido(reporte.responsable_remitido || '');
    setResolucionFinal(reporte.resolucion_final || '');
    setNotaAdmin('');
    setModalAbierto(true);
  };

  const guardarSeguimiento = async (e) => {
    e.preventDefault();
    if (!reporteSeleccionado) return;
    setGuardando(true);
    try {
      await alActualizarSeguimiento(reporteSeleccionado.id, {
        estado: nuevoEstado,
        accionesTomadas,
        responsableRemitido,
        resolucionFinal,
        notaAdmin
      });
      setModalAbierto(false);
    } finally {
      setGuardando(false);
    }
  };

  const colorBadgeEstado = (estado) => {
    switch (estado) {
      case 'recibido':
        return { bg: 'var(--color-primario-claro)', color: 'var(--color-primario)', label: 'Recibido' };
      case 'en_revision':
        return { bg: 'var(--color-advertencia-fondo)', color: 'var(--color-advertencia)', label: 'En Revisión' };
      case 'resuelto':
        return { bg: 'var(--color-exito-fondo)', color: 'var(--color-exito)', label: 'Resuelto' };
      case 'cerrado':
        return { bg: 'rgba(0,0,0,0.06)', color: 'var(--texto-secundario)', label: 'Cerrado' };
      default:
        return { bg: 'var(--fondo-principal)', color: 'var(--texto-secundario)', label: estado };
    }
  };

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Mediación y Trazabilidad */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--borde-sutil)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
            Bandeja de Reportes y Reclamaciones Turísticas
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
            Canal institucional de trazabilidad, mediación y seguimiento entre turistas, agencias y guías.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => alDescargarCSV('reportes')}
            className="boton boton-contorno boton-pequeno"
            style={{ gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <FileDown size={14} />
            <span>Exportar Casos CSV</span>
          </button>
        </div>
      </div>

      {/* Nota de Descargo Legal Institucional */}
      <div
        style={{
          backgroundColor: 'var(--color-primario-claro)',
          border: '1px solid rgba(23, 74, 91, 0.2)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          fontSize: '0.82rem',
          color: 'var(--color-primario)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Art. 53 Ley 1480 de 2011:</strong> GuianzApp actúa como plataforma tecnológica que facilita la trazabilidad y mediación de incidentes, registrando evidencias y remitiendo las actuaciones a los prestadores u operadores legalmente responsables.
        </span>
      </div>

      {/* Barra de Filtros */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--borde-sutil)',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="var(--texto-atenuado)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código #REC, reserva o nombre..."
            className="campo-formulario"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--fondo-principal)', padding: '3px', borderRadius: '8px' }}>
          {['todos', 'recibido', 'en_revision', 'resuelto', 'cerrado'].map((est) => (
            <button
              key={est}
              onClick={() => setEstadoFiltro(est)}
              style={{
                border: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: estadoFiltro === est ? 'var(--color-primario)' : 'transparent',
                color: estadoFiltro === est ? '#FFFFFF' : 'var(--texto-secundario)',
                textTransform: 'capitalize'
              }}
            >
              {est === 'todos' ? 'Todos' : est.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Casos */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={32} color="var(--color-primario)" style={{ animation: 'girar 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>Consultando reclamaciones...</p>
        </div>
      ) : reportesFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--borde-sutil)'
          }}
        >
          <CheckCircle2 size={40} color="var(--color-exito)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primario)' }}>
            No hay reportes que coincidan con los filtros
          </h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reportesFiltrados.map((rep) => {
            const badge = colorBadgeEstado(rep.estado);

            return (
              <div
                key={rep.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--borde-sutil)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                {/* Cabecera del Caso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(23, 74, 91, 0.08)',
                        color: 'var(--color-primario)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px'
                      }}
                    >
                      {rep.codigo_caso}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--texto-principal)', margin: 0 }}>
                        {rep.motivo_legible || rep.motivo_categoria}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                        Radicado el {new Date(rep.creado_en).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: rep.prioridad === 'alta' ? 'var(--color-peligro-fondo)' : 'var(--fondo-principal)',
                        color: rep.prioridad === 'alta' ? 'var(--color-peligro)' : 'var(--texto-secundario)'
                      }}
                    >
                      Prioridad {rep.prioridad}
                    </span>

                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Partes Involucradas y Reserva */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.85rem',
                    backgroundColor: 'var(--fondo-principal)',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reportante ({rep.tipo_reportante}):
                    </span>
                    <strong style={{ color: 'var(--texto-principal)' }}>{rep.nombre_reportante}</strong>
                    <div style={{ color: 'var(--texto-secundario)', fontSize: '0.76rem' }}>{rep.correo_reportante}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Contraparte Reportada ({rep.rol_afectado}):
                    </span>
                    <strong style={{ color: 'var(--texto-principal)' }}>{rep.nombre_afectado}</strong>
                  </div>

                  {rep.codigo_reserva && (
                    <div>
                      <span style={{ color: 'var(--texto-atenuado)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                        Reserva Vinculada:
                      </span>
                      <strong style={{ color: 'var(--color-primario)' }}>{rep.codigo_reserva}</strong>
                      <div style={{ color: 'var(--texto-secundario)', fontSize: '0.76rem' }}>{rep.titulo_tour}</div>
                    </div>
                  )}
                </div>

                {/* Descripción de los Hechos */}
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--texto-secundario)', lineHeight: 1.5 }}>
                  {rep.descripcion}
                </p>

                {/* Acciones Tomadas Actuales */}
                {rep.acciones_tomadas && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'rgba(23, 74, 91, 0.04)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      borderLeft: '3px solid var(--color-primario)'
                    }}
                  >
                    <strong style={{ color: 'var(--color-primario)' }}>Seguimiento registrado:</strong>{' '}
                    <span style={{ color: 'var(--texto-secundario)' }}>{rep.acciones_tomadas}</span>
                    {rep.responsable_remitido && (
                      <div style={{ marginTop: '0.2rem', color: 'var(--texto-atenuado)', fontSize: '0.76rem' }}>
                        Remitido formalmente a: <strong>{rep.responsable_remitido}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón de Gestión */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--borde-sutil)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => abrirModalCaso(rep)}
                    className="boton boton-primario boton-pequeno"
                    style={{ gap: '0.35rem', fontSize: '0.82rem' }}
                  >
                    <MessageSquare size={14} />
                    <span>Gestionar Caso y Dictamen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Gestión de Caso */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={`Gestión Administrativa: ${reporteSeleccionado?.codigo_caso}`}
        anchoMaximo="580px"
      >
        <form onSubmit={guardarSeguimiento}>
          <div style={{ marginBottom: '1rem', fontSize: '0.86rem', color: 'var(--texto-secundario)' }}>
            Caso reportado por <strong>{reporteSeleccionado?.nombre_reportante}</strong> en relación al servicio con{' '}
            <strong>{reporteSeleccionado?.nombre_afectado}</strong>.
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Estado del Caso</span>
            </label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="campo-formulario"
              required
            >
              <option value="recibido">Recibido (Pendiente de contactar partes)</option>
              <option value="en_revision">En Revisión (Evidencias y descargos solicitados)</option>
              <option value="resuelto">Resuelto (Acuerdo conciliatorio logrado)</option>
              <option value="cerrado">Cerrado (Caso finalizado formalmente)</option>
            </select>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Remitir a responsable / prestador</span>
            </label>
            <input
              type="text"
              value={responsableRemitido}
              onChange={(e) => setResponsableRemitido(e.target.value)}
              placeholder="Ej: Representante Legal de Explora Cerros Bogotá"
              className="campo-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Acciones tomadas / Seguimiento</span>
            </label>
            <textarea
              rows={3}
              value={accionesTomadas}
              onChange={(e) => setAccionesTomadas(e.target.value)}
              placeholder="Detalla las comunicaciones enviadas o concertadas..."
              className="area-texto-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Resolución final / Dictamen (si aplica)</span>
            </label>
            <textarea
              rows={2}
              value={resolucionFinal}
              onChange={(e) => setResolucionFinal(e.target.value)}
              placeholder="Ej: La agencia reprogramó la salida y compensó al usuario..."
              className="area-texto-formulario"
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Nueva nota administrativa interna</span>
            </label>
            <input
              type="text"
              value={notaAdmin}
              onChange={(e) => setNotaAdmin(e.target.value)}
              placeholder="Nota privada para la bitácora..."
              className="campo-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {guardando ? 'Guardando caso...' : 'Actualizar Seguimiento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
