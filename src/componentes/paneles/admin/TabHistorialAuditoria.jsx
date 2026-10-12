import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  Tag,
  MessageSquare,
  FileDown,
  Loader2,
  Calendar
} from 'lucide-react';

export const TabHistorialAuditoria = ({
  auditoria,
  cargando,
  alActualizar,
  alDescargarCSV
}) => {
  const [accionFiltro, setAccionFiltro] = useState('todos');
  const [entidadFiltro, setEntidadFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const filtrados = auditoria.filter((ev) => {
    if (accionFiltro !== 'todos' && ev.accion !== accionFiltro) return false;
    if (entidadFiltro !== 'todos' && ev.entidad_tipo !== entidadFiltro) return false;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const admin = (ev.admin_nombre || '').toLowerCase();
      const entidad = (ev.entidad_nombre || '').toLowerCase();
      const motivo = (ev.motivo || '').toLowerCase();
      const acc = (ev.accion || '').toLowerCase();
      if (!admin.includes(q) && !entidad.includes(q) && !motivo.includes(q) && !acc.includes(q)) return false;
    }
    return true;
  });

  const obtenerIconoAccion = (accion) => {
    if (accion.includes('aprobar')) return <CheckCircle size={15} color="var(--color-exito)" />;
    if (accion.includes('rechazar')) return <XCircle size={15} color="var(--color-peligro)" />;
    if (accion.includes('suspender') || accion.includes('bloquear')) return <Ban size={15} color="var(--color-peligro)" />;
    if (accion.includes('reactivar')) return <UserCheck size={15} color="var(--color-secundario)" />;
    if (accion.includes('especialidad')) return <Tag size={15} color="var(--color-primario)" />;
    if (accion.includes('reporte')) return <MessageSquare size={15} color="var(--color-dorado-hover)" />;
    return <Clock size={15} color="var(--texto-atenuado)" />;
  };

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Trazabilidad */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
              Bitácora Inmutable de Auditoría Administrativa
            </h3>
            <span
              style={{
                backgroundColor: 'var(--color-secundario-claro)',
                color: 'var(--color-secundario)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px'
              }}
            >
              Trazabilidad Completa
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
            Registro cronológico inmutable de aprobaciones, suspensiones, cambios en especialidades y mediación de disputas.
          </p>
        </div>

        <button
          onClick={() => alDescargarCSV('auditoria')}
          className="boton boton-primario boton-pequeno"
          style={{ gap: '0.35rem', fontSize: '0.82rem' }}
        >
          <FileDown size={14} />
          <span>Exportar Bitácora CSV</span>
        </button>
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
            placeholder="Buscar por motivo, administrador o entidad..."
            className="campo-formulario"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>

        <select
          value={accionFiltro}
          onChange={(e) => setAccionFiltro(e.target.value)}
          className="campo-formulario"
          style={{ height: '38px', fontSize: '0.84rem', flex: '0 1 200px' }}
        >
          <option value="todos">Todas las acciones</option>
          <option value="aprobar_prestador">Aprobar prestador</option>
          <option value="rechazar_prestador">Rechazar prestador</option>
          <option value="suspender_prestador">Suspender prestador</option>
          <option value="reactivar_prestador">Reactivar prestador</option>
          <option value="bloquear_usuario">Bloquear usuario</option>
          <option value="reactivar_usuario">Reactivar usuario</option>
          <option value="crear_especialidad">Crear especialidad</option>
          <option value="actualizar_especialidad">Actualizar especialidad</option>
          <option value="atender_reporte">Atender reporte</option>
        </select>

        <select
          value={entidadFiltro}
          onChange={(e) => setEntidadFiltro(e.target.value)}
          className="campo-formulario"
          style={{ height: '38px', fontSize: '0.84rem', flex: '0 1 180px' }}
        >
          <option value="todos">Todas las entidades</option>
          <option value="prestador">Prestadores</option>
          <option value="usuario">Usuarios</option>
          <option value="especialidad">Especialidades</option>
          <option value="reporte">Reclamaciones</option>
        </select>
      </div>

      {/* Lista de Registros */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={32} color="var(--color-primario)" style={{ animation: 'girar 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>Consultando bitácora de auditoría...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--borde-sutil)'
          }}
        >
          <Clock size={40} color="var(--texto-atenuado)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primario)' }}>
            No se encontraron eventos de auditoría con esos criterios
          </h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtrados.map((ev) => (
            <div
              key={ev.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--borde-sutil)',
                padding: '1.15rem 1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {obtenerIconoAccion(ev.accion)}
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(23, 74, 91, 0.08)',
                      color: 'var(--color-primario)'
                    }}
                  >
                    {ev.accion.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
                    sobre <strong>{ev.entidad_nombre || ev.entidad_id}</strong> ({ev.entidad_tipo})
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--texto-atenuado)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} />
                  <span>{new Date(ev.creado_en).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--fondo-principal)',
                  padding: '0.65rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.83rem',
                  color: 'var(--texto-principal)',
                  lineHeight: 1.45
                }}
              >
                <strong>Motivo / Sustento:</strong> {ev.motivo}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--texto-atenuado)' }}>
                <span>Administrador actuante: <strong>{ev.admin_nombre}</strong> ({ev.admin_email || 'admin@guianzapp.co'})</span>
                <span>ID Referencia: {ev.entidad_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
