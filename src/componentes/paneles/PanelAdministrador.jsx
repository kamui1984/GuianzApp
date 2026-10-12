import React, { useState, useEffect } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { servicioAdministracion } from '../../api/administracionServicio';
import { Cargando } from '../comunes/Cargando';
import { TabResumenIndicadores } from './admin/TabResumenIndicadores';
import { TabValidacionPrestadores } from './admin/TabValidacionPrestadores';
import { TabEspecialidadesCategorias } from './admin/TabEspecialidadesCategorias';
import { TabUsuariosCuentas } from './admin/TabUsuariosCuentas';
import { TabReportesReclamaciones } from './admin/TabReportesReclamaciones';
import { TabHistorialAuditoria } from './admin/TabHistorialAuditoria';
import {
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Tag,
  Users,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileDown
} from 'lucide-react';

export const PanelAdministrador = () => {
  const { mostrarNotificacion } = useAutenticacion();

  // Pestaña activa: 'resumen' | 'validacion' | 'especialidades' | 'usuarios' | 'reportes' | 'auditoria'
  const [tabActivo, setTabActivo] = useState('resumen');

  // Estados de datos
  const [cargando, setCargando] = useState(true);
  const [metricas, setMetricas] = useState(null);
  const [auditoriaReciente, setAuditoriaReciente] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [auditoriaCompleta, setAuditoriaCompleta] = useState([]);

  // Estados de procesamiento individual
  const [procesandoId, setProcesandoId] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resumenData, prestadoresData, especialidadesData, usuariosData, reportesData, auditoriaData] =
        await Promise.allSettled([
          servicioAdministracion.obtenerResumenIndicadores(),
          servicioAdministracion.listarPrestadores(),
          servicioAdministracion.listarEspecialidadesAdmin(),
          servicioAdministracion.listarUsuarios(),
          servicioAdministracion.listarReportes(),
          servicioAdministracion.listarAuditoria({ limite: 100 })
        ]);

      if (resumenData.status === 'fulfilled' && resumenData.value) {
        setMetricas(resumenData.value.metricas || null);
        setAuditoriaReciente(resumenData.value.auditoriaReciente || []);
      }

      if (prestadoresData.status === 'fulfilled' && prestadoresData.value) {
        setPrestadores(prestadoresData.value);
      }

      if (especialidadesData.status === 'fulfilled' && especialidadesData.value) {
        setEspecialidades(especialidadesData.value);
      }

      if (usuariosData.status === 'fulfilled' && usuariosData.value) {
        setUsuarios(usuariosData.value);
      }

      if (reportesData.status === 'fulfilled' && reportesData.value) {
        setReportes(reportesData.value);
      }

      if (auditoriaData.status === 'fulfilled' && auditoriaData.value) {
        setAuditoriaCompleta(auditoriaData.value);
      }
    } catch (error) {
      console.error('Error al cargar panel de administración:', error);
      mostrarNotificacion('Error al sincronizar datos del panel administrativo.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 1. Validaciones de Prestadores
  const manejarAprobarPerfil = async (idPerfil, nombre) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.aprobarPerfil(idPerfil);
      mostrarNotificacion(`Perfil y RNT de "${nombre}" aprobado exitosamente.`);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al aprobar perfil.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarRechazarPerfil = async (idPerfil, motivo) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.rechazarPerfil(idPerfil, motivo);
      mostrarNotificacion('Solicitud rechazada con motivo registrado.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al rechazar solicitud.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarSolicitarCorreccion = async (idPerfil, observaciones) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.solicitarCorrecciones(idPerfil, observaciones);
      mostrarNotificacion('Correcciones solicitadas al prestador.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al solicitar correcciones.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarSuspenderPerfil = async (idPerfil, motivo) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.suspenderPerfil(idPerfil, motivo);
      mostrarNotificacion('Perfil suspendido justificadamente.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al suspender perfil.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarReactivarPerfil = async (idPerfil, nombre) => {
    setProcesandoId(idPerfil);
    try {
      await servicioAdministracion.reactivarPerfil(idPerfil, 'Reactivación administrativa');
      mostrarNotificacion(`Perfil de "${nombre}" reactivado exitosamente.`);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al reactivar perfil.', 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  // 2. Especialidades
  const manejarCrearEspecialidad = async (datos) => {
    try {
      await servicioAdministracion.crearEspecialidad(datos);
      mostrarNotificacion(`Especialidad "${datos.subcategoria}" agregada al catálogo común.`);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al crear especialidad.', 'error');
      throw error;
    }
  };

  const manejarActualizarEspecialidad = async (id, datos) => {
    try {
      await servicioAdministracion.actualizarEspecialidad(id, datos);
      mostrarNotificacion('Especialidad actualizada exitosamente.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al actualizar especialidad.', 'error');
      throw error;
    }
  };

  const manejarCambiarEstadoEspecialidad = async (id, activo) => {
    try {
      await servicioAdministracion.cambiarEstadoEspecialidad(id, activo);
      mostrarNotificacion(`Especialidad ${activo ? 'activada' : 'desactivada'} en el catálogo.`);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al cambiar estado.', 'error');
    }
  };

  // 3. Usuarios
  const manejarCambiarEstadoUsuario = async (idUsuario, nuevoEstado, justificacion) => {
    try {
      await servicioAdministracion.cambiarEstadoUsuario(idUsuario, nuevoEstado, justificacion);
      mostrarNotificacion(`Estado de la cuenta actualizado a "${nuevoEstado}".`);
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al cambiar estado de cuenta.', 'error');
    }
  };

  // 4. Reportes
  const manejarActualizarSeguimientoReporte = async (idReporte, datos) => {
    try {
      await servicioAdministracion.actualizarSeguimientoReporte(idReporte, datos);
      mostrarNotificacion('Caso y seguimiento de reclamación actualizados.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al actualizar caso.', 'error');
    }
  };

  // 5. Descargas CSV
  const manejarDescargarCSV = async (tipo) => {
    try {
      mostrarNotificacion(`Generando archivo CSV de ${tipo}...`);
      await servicioAdministracion.descargarReporteCSV(tipo);
      mostrarNotificacion(`Archivo CSV de ${tipo} descargado.`);
    } catch (error) {
      mostrarNotificacion('No se pudo generar la exportación CSV.', 'error');
    }
  };

  // Conteo para insignias de pestañas
  const conteoPendientes = metricas?.pendientesValidacion || 0;
  const conteoReportesPendientes = metricas?.reportesPendientes || 0;

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="contenedor">
        {/* Cabecera Principal del Panel de Administrador */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--borde-sutil)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.75rem',
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
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'rgba(23, 74, 91, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primario)',
                boxShadow: 'inset 0 0 0 1px rgba(23, 74, 91, 0.2)'
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0, letterSpacing: '-0.02em' }}>
                  Panel de Administración GuianzApp
                </h1>
                <span
                  style={{
                    backgroundColor: 'var(--color-dorado)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}
                >
                  Supervisión & Control
                </span>
              </div>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
                Supervisión de prestadores turísticos con RNT, administración del catálogo transversal y trazabilidad legal de la plataforma.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              id="btn-actualizar-datos-admin"
              onClick={cargarDatos}
              disabled={cargando}
              className="boton boton-contorno"
              style={{ gap: '0.4rem', fontSize: '0.88rem' }}
            >
              <RefreshCw size={15} style={{ animation: cargando ? 'girar 1s linear infinite' : 'none' }} />
              <span>Sincronizar Panel</span>
            </button>
          </div>
        </div>

        {/* Menú de Navegación del Administrador (Pestañas) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--borde-sutil)',
            borderRadius: '14px',
            padding: '6px',
            marginBottom: '2rem',
            overflowX: 'auto',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          {/* Pestaña 1: Resumen */}
          <button
            id="tab-admin-resumen"
            onClick={() => setTabActivo('resumen')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'resumen' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'resumen' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={16} />
            <span>Panel de administración</span>
          </button>

          {/* Pestaña 2: Validación de prestadores */}
          <button
            id="tab-admin-validacion"
            onClick={() => setTabActivo('validacion')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'validacion' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'validacion' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <FileCheck2 size={16} />
            <span>Validación de prestadores</span>
            {conteoPendientes > 0 && (
              <span
                style={{
                  backgroundColor: tabActivo === 'validacion' ? '#FFFFFF' : 'var(--color-peligro)',
                  color: tabActivo === 'validacion' ? 'var(--color-peligro)' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {conteoPendientes}
              </span>
            )}
          </button>

          {/* Pestaña 3: Especialidades y categorías */}
          <button
            id="tab-admin-especialidades"
            onClick={() => setTabActivo('especialidades')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'especialidades' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'especialidades' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Tag size={16} />
            <span>Especialidades y categorías</span>
          </button>

          {/* Pestaña 4: Usuarios y cuentas */}
          <button
            id="tab-admin-usuarios"
            onClick={() => setTabActivo('usuarios')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'usuarios' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'usuarios' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            <span>Usuarios y cuentas</span>
          </button>

          {/* Pestaña 5: Reportes y reclamaciones */}
          <button
            id="tab-admin-reportes"
            onClick={() => setTabActivo('reportes')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'reportes' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'reportes' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <AlertTriangle size={16} />
            <span>Reportes y reclamaciones</span>
            {conteoReportesPendientes > 0 && (
              <span
                style={{
                  backgroundColor: tabActivo === 'reportes' ? '#FFFFFF' : 'var(--color-advertencia)',
                  color: tabActivo === 'reportes' ? 'var(--color-advertencia)' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {conteoReportesPendientes}
              </span>
            )}
          </button>

          {/* Pestaña 6: Historial de auditoría */}
          <button
            id="tab-admin-auditoria"
            onClick={() => setTabActivo('auditoria')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1.15rem',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: tabActivo === 'auditoria' ? 'var(--color-primario)' : 'transparent',
              color: tabActivo === 'auditoria' ? '#FFFFFF' : 'var(--texto-secundario)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Clock size={16} />
            <span>Historial de auditoría</span>
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        {cargando && !metricas ? (
          <Cargando mensaje="Cargando panel de administración de GuianzApp..." />
        ) : (
          <div>
            {tabActivo === 'resumen' && (
              <TabResumenIndicadores
                metricas={metricas}
                auditoriaReciente={auditoriaReciente}
                alCambiarTab={setTabActivo}
                alDescargarReporte={manejarDescargarCSV}
              />
            )}

            {tabActivo === 'validacion' && (
              <TabValidacionPrestadores
                prestadores={prestadores}
                cargando={cargando}
                alActualizar={cargarDatos}
                alAprobar={manejarAprobarPerfil}
                alRechazar={manejarRechazarPerfil}
                alSolicitarCorreccion={manejarSolicitarCorreccion}
                alSuspender={manejarSuspenderPerfil}
                alReactivar={manejarReactivarPerfil}
                procesandoId={procesandoId}
              />
            )}

            {tabActivo === 'especialidades' && (
              <TabEspecialidadesCategorias
                especialidades={especialidades}
                cargando={cargando}
                alCrear={manejarCrearEspecialidad}
                alActualizar={manejarActualizarEspecialidad}
                alCambiarEstado={manejarCambiarEstadoEspecialidad}
              />
            )}

            {tabActivo === 'usuarios' && (
              <TabUsuariosCuentas
                usuarios={usuarios}
                cargando={cargando}
                alCambiarEstado={manejarCambiarEstadoUsuario}
                alDescargarCSV={manejarDescargarCSV}
              />
            )}

            {tabActivo === 'reportes' && (
              <TabReportesReclamaciones
                reportes={reportes}
                cargando={cargando}
                alActualizarSeguimiento={manejarActualizarSeguimientoReporte}
                alDescargarCSV={manejarDescargarCSV}
              />
            )}

            {tabActivo === 'auditoria' && (
              <TabHistorialAuditoria
                auditoria={auditoriaCompleta}
                cargando={cargando}
                alActualizar={cargarDatos}
                alDescargarCSV={manejarDescargarCSV}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
