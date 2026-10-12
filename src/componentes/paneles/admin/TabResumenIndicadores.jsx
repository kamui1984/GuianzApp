import React from 'react';
import {
  ShieldCheck,
  Building2,
  Compass,
  Users,
  AlertTriangle,
  Package,
  CalendarCheck,
  Tag,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  FileDown
} from 'lucide-react';

export const TabResumenIndicadores = ({ metricas, auditoriaReciente, alCambiarTab, alDescargarReporte }) => {
  if (!metricas) return null;

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Alerta de acción prioritaria si hay prestadores pendientes */}
      {metricas.pendientesValidacion > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(198, 161, 91, 0.15) 0%, rgba(23, 74, 91, 0.08) 100%)',
            border: '1px solid var(--color-dorado)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
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
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-dorado)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--color-primario)', fontSize: '1.05rem', margin: 0 }}>
                {metricas.pendientesValidacion} prestador(es) esperando validación legal de RNT
              </h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--texto-secundario)' }}>
                Existen solicitudes de registro con documentos RNT y Tarjetas Profesionales listos para revisión y dictamen.
              </p>
            </div>
          </div>
          <button
            id="btn-ir-validacion-pendiente"
            onClick={() => alCambiarTab('validacion')}
            className="boton boton-primario boton-pequeno"
            style={{ gap: '0.4rem', backgroundColor: 'var(--color-primario)' }}
          >
            <span>Revisar Solicitudes</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Tarjetas de Indicadores Clave */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--color-dorado)" />
            <span>Métricas Generales de la Plataforma</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => alDescargarReporte('prestadores')}
              className="boton boton-contorno boton-pequeno"
              style={{ gap: '0.4rem', fontSize: '0.8rem' }}
              title="Descargar listado oficial en CSV"
            >
              <FileDown size={14} />
              <span>Exportar Prestadores</span>
            </button>
            <button
              onClick={() => alDescargarReporte('reportes')}
              className="boton boton-contorno boton-pequeno"
              style={{ gap: '0.4rem', fontSize: '0.8rem' }}
              title="Descargar reporte de incidencias en CSV"
            >
              <FileDown size={14} />
              <span>Exportar Reclamaciones</span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Tarjeta 1: Agencias */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--borde-sutil)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(23, 74, 91, 0.1)',
                color: 'var(--color-primario)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>Agencias Registradas</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--color-primario)' }}>
                {metricas.totalAgencias}
              </h2>
            </div>
          </div>

          {/* Tarjeta 2: Guías */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--borde-sutil)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(31, 93, 80, 0.1)',
                color: 'var(--color-secundario)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Compass size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>Guías Profesionales</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--color-secundario)' }}>
                {metricas.totalGuias}
              </h2>
            </div>
          </div>

          {/* Tarjeta 3: Turistas */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--borde-sutil)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(198, 161, 91, 0.15)',
                color: 'var(--color-dorado-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>Turistas / Clientes</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--color-primario)' }}>
                {metricas.totalTuristas}
              </h2>
            </div>
          </div>

          {/* Tarjeta 4: Paquetes Activos */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--borde-sutil)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(166, 75, 60, 0.1)',
                color: 'var(--color-acento-bogota)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>Tours Publicados</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--color-acento-bogota)' }}>
                {metricas.paquetesTotal}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Fila secundaria: Estados de Prestadores y Reclamaciones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Desglose de Estado de Prestadores */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--borde-sutil)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--color-primario)', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCheck2 size={18} color="var(--color-primario)" />
              <span>Estado de Validación RNT</span>
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
              Total: {metricas.totalAgencias + metricas.totalGuias} prestadores
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-exito-fondo)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-exito)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Aprobados y Vigentes
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-exito)' }}>{metricas.aprobados}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-advertencia-fondo)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-advertencia)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> En Cola de Revisión
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-advertencia)' }}>{metricas.pendientesValidacion}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-peligro-fondo)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-peligro)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> Rechazados / Incompletos
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-peligro)' }}>{metricas.rechazados}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--texto-secundario)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🚫 Suspendidos Preventivamente
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--texto-principal)' }}>{metricas.suspendidos}</strong>
            </div>
          </div>
        </div>

        {/* Resumen de Reclamaciones e Incidencias */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--borde-sutil)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--color-primario)', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--color-acento-bogota)" />
              <span>Atención de Incidentes & Reportes</span>
            </h4>
            <button
              onClick={() => alCambiarTab('reportes')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primario)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Ver bandeja →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'rgba(23, 74, 91, 0.04)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--texto-principal)', fontWeight: 500 }}>
                Total Reclamaciones Radicadas
              </span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-primario)' }}>{metricas.reportesTotal}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-advertencia-fondo)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--color-advertencia)', fontWeight: 600 }}>
                Casos en Trámite o Recibidos
              </span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-advertencia)' }}>{metricas.reportesPendientes}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', backgroundColor: 'var(--color-exito-fondo)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--color-exito)', fontWeight: 600 }}>
                Casos Resueltos / Conciliados
              </span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-exito)' }}>{metricas.reportesResueltos}</strong>
            </div>

            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(23, 74, 91, 0.03)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
              ℹ️ GuianzApp provee el canal de intermediación y trazabilidad formal para dar respuesta expedita según el Art. 53 de la Ley 1480 de 2011.
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente de Auditoría Administrativa */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--borde-sutil)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontWeight: 800, color: 'var(--color-primario)', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--color-dorado)" />
              <span>Últimas Acciones y Trazabilidad de Auditoría</span>
            </h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
              Registro inmutable de decisiones tomadas por el rol administrador.
            </p>
          </div>
          <button
            onClick={() => alCambiarTab('auditoria')}
            className="boton boton-contorno boton-pequeno"
            style={{ fontSize: '0.8rem' }}
          >
            Ver historial completo →
          </button>
        </div>

        {auditoriaReciente && auditoriaReciente.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditoriaReciente.map((evento) => (
              <div
                key={evento.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(247, 244, 236, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid var(--borde-sutil)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor:
                        evento.accion.includes('aprobar')
                          ? 'var(--color-exito-fondo)'
                          : evento.accion.includes('rechazar') || evento.accion.includes('suspender')
                          ? 'var(--color-peligro-fondo)'
                          : 'var(--color-primario-claro)',
                      color:
                        evento.accion.includes('aprobar')
                          ? 'var(--color-exito)'
                          : evento.accion.includes('rechazar') || evento.accion.includes('suspender')
                          ? 'var(--color-peligro)'
                          : 'var(--color-primario)'
                    }}
                  >
                    {evento.accion.replace(/_/g, ' ')}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--texto-principal)' }}>{evento.entidad_nombre}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', marginLeft: '0.5rem' }}>
                      ({evento.entidad_tipo})
                    </span>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                      {evento.motivo}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--texto-atenuado)' }}>
                  <div>Por: <strong>{evento.admin_nombre}</strong></div>
                  <div>{new Date(evento.creado_en).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', fontStyle: 'italic', margin: 0 }}>
            No hay registros de auditoría recientes.
          </p>
        )}
      </div>
    </div>
  );
};
