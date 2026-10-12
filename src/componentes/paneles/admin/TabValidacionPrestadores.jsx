import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Compass,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Ban,
  UserCheck
} from 'lucide-react';
import { InsigniaEstado } from '../../comunes/InsigniaEstado';
import { Modal } from '../../comunes/Modal';

export const TabValidacionPrestadores = ({
  prestadores,
  cargando,
  alActualizar,
  alAprobar,
  alRechazar,
  alSolicitarCorreccion,
  alSuspender,
  alReactivar,
  procesandoId
}) => {
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalRechazoAbierto, setModalRechazoAbierto] = useState(false);
  const [modalCorreccionAbierto, setModalCorreccionAbierto] = useState(false);
  const [modalSuspensionAbierto, setModalSuspensionAbierto] = useState(false);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);

  const [motivoTexto, setMotivoTexto] = useState('');
  const [enviandoAccion, setEnviandoAccion] = useState(false);

  // Filtrado reactivo en cliente
  const prestadoresFiltrados = prestadores.filter((p) => {
    if (filtroRol !== 'todos' && p.rol !== filtroRol) return false;
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const nombre = (p.nombreAgencia || p.nombreCompleto || '').toLowerCase();
      const rnt = (p.numeroRnt || '').toLowerCase();
      if (!nombre.includes(q) && !rnt.includes(q)) return false;
    }
    return true;
  });

  const abrirModalRechazo = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setMotivoTexto('El certificado de Registro Nacional de Turismo (RNT) o Tarjeta Profesional adjunto no corresponde al titular o se encuentra vencido según verificación ante MinCIT.');
    setModalRechazoAbierto(true);
  };

  const abrirModalCorreccion = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setMotivoTexto('El documento adjunto está borroso o incompleto. Por favor adjunta una copia nítida en formato PDF o imagen legible.');
    setModalCorreccionAbierto(true);
  };

  const abrirModalSuspension = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setMotivoTexto('Suspensión temporal justificada por reporte de usuario o irregularidad en prestación.');
    setModalSuspensionAbierto(true);
  };

  const confirmarRechazo = async (e) => {
    e.preventDefault();
    if (!prestadorSeleccionado) return;
    setEnviandoAccion(true);
    try {
      await alRechazar(prestadorSeleccionado.id, motivoTexto);
      setModalRechazoAbierto(false);
    } finally {
      setEnviandoAccion(false);
    }
  };

  const confirmarCorreccion = async (e) => {
    e.preventDefault();
    if (!prestadorSeleccionado) return;
    setEnviandoAccion(true);
    try {
      await alSolicitarCorreccion(prestadorSeleccionado.id, motivoTexto);
      setModalCorreccionAbierto(false);
    } finally {
      setEnviandoAccion(false);
    }
  };

  const confirmarSuspension = async (e) => {
    e.preventDefault();
    if (!prestadorSeleccionado) return;
    setEnviandoAccion(true);
    try {
      await alSuspender(prestadorSeleccionado.id, motivoTexto);
      setModalSuspensionAbierto(false);
    } finally {
      setEnviandoAccion(false);
    }
  };

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Barra de Controles y Filtros */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--borde-sutil)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
              Validación Legal de Prestadores Turísticos (RNT & Guías)
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
              Revisión de documentos oficiales, expedición de RNT y control de estado de prestadores en Bogotá.
            </p>
          </div>

          <button
            onClick={alActualizar}
            className="boton boton-contorno boton-pequeno"
            style={{ gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} />
            <span>Actualizar Listado</span>
          </button>
        </div>

        {/* Filtros y Buscador */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Buscador */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="var(--texto-atenuado)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o RNT..."
              className="campo-formulario"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
            />
          </div>

          {/* Filtro por Rol */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--fondo-principal)', padding: '3px', borderRadius: '8px' }}>
            {['todos', 'agencia', 'guia'].map((rol) => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: filtroRol === rol ? 'var(--color-primario)' : 'transparent',
                  color: filtroRol === rol ? '#FFFFFF' : 'var(--texto-secundario)',
                  textTransform: 'capitalize'
                }}
              >
                {rol === 'todos' ? 'Todos los roles' : rol === 'agencia' ? 'Agencias' : 'Guías'}
              </button>
            ))}
          </div>

          {/* Filtro por Estado */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--fondo-principal)', padding: '3px', borderRadius: '8px' }}>
            {['todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'].map((est) => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                style={{
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: filtroEstado === est ? 'var(--color-primario)' : 'transparent',
                  color: filtroEstado === est ? '#FFFFFF' : 'var(--texto-secundario)',
                  textTransform: 'capitalize'
                }}
              >
                {est}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listado de Prestadores */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={32} color="var(--color-primario)" style={{ animation: 'girar 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>Consultando prestadores...</p>
        </div>
      ) : prestadoresFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--borde-sutil)'
          }}
        >
          <CheckCircle size={40} color="var(--color-exito)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '0.25rem' }}>
            No se encontraron prestadores con los filtros seleccionados
          </h4>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>
            Modifica los filtros o el término de búsqueda para ver más resultados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {prestadoresFiltrados.map((prestador) => {
            const esAgencia = prestador.rol === 'agencia';
            const nombreTitular = prestador.nombreAgencia || prestador.nombreCompleto || 'Prestador Turístico';
            const estaProcesando = procesandoId === prestador.id;

            return (
              <div
                key={prestador.id}
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
                {/* Cabecera del Prestador */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {prestador.urlFotoRostro ? (
                      <img
                        src={prestador.urlFotoRostro}
                        alt={nombreTitular}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-dorado)' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: esAgencia ? 'rgba(23, 74, 91, 0.1)' : 'rgba(31, 93, 80, 0.1)',
                          color: esAgencia ? 'var(--color-primario)' : 'var(--color-secundario)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {esAgencia ? <Building2 size={24} /> : <Compass size={24} />}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
                        {nombreTitular}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                          Tipo: <strong>{esAgencia ? 'Agencia Operadora' : 'Guía Profesional'}</strong>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                          RNT / Tarjeta: <strong style={{ color: 'var(--color-primario)' }}>{prestador.numeroRnt || 'Sin registro'}</strong>
                        </span>
                        {prestador.idiomas && (
                          <>
                            <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>•</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)' }}>
                              Idiomas: {prestador.idiomas}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <InsigniaEstado estado={prestador.estado} />
                  </div>
                </div>

                {/* Motivos previos registrados o advertencias */}
                {prestador.motivoRechazo && prestador.estado === 'rechazado' && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--color-peligro-fondo)',
                      border: '1px solid rgba(166, 64, 64, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--color-peligro)'
                    }}
                  >
                    <strong>Motivo de rechazo registrado:</strong> {prestador.motivoRechazo}
                  </div>
                )}

                {prestador.motivoSuspension && prestador.estado === 'suspendido' && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--color-advertencia-fondo)',
                      border: '1px solid rgba(154, 107, 22, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--color-advertencia)'
                    }}
                  >
                    <strong>Motivo de suspensión:</strong> {prestador.motivoSuspension}
                  </div>
                )}

                {prestador.observacionesAdmin && prestador.estado === 'pendiente' && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--color-primario-claro)',
                      border: '1px solid rgba(23, 74, 91, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--color-primario)'
                    }}
                  >
                    <strong>Correcciones solicitadas:</strong> {prestador.observacionesAdmin}
                  </div>
                )}

                {/* Documentación Adjunta Verificable */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    backgroundColor: 'var(--fondo-principal)',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                    Documentos verificables:
                  </span>

                  {prestador.urlDocumentoRnt ? (
                    <a
                      href={prestador.urlDocumentoRnt}
                      target="_blank"
                      rel="noreferrer"
                      className="boton boton-contorno boton-pequeno"
                      style={{ gap: '0.35rem', fontSize: '0.78rem' }}
                    >
                      <FileText size={14} color="var(--color-dorado-hover)" />
                      <span>Ver Certificado RNT</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--texto-atenuado)' }}>
                      Sin documento RNT adjunto
                    </span>
                  )}

                  {prestador.urlTarjetaProfesional && (
                    <a
                      href={prestador.urlTarjetaProfesional}
                      target="_blank"
                      rel="noreferrer"
                      className="boton boton-contorno boton-pequeno"
                      style={{ gap: '0.35rem', fontSize: '0.78rem' }}
                    >
                      <FileText size={14} color="var(--color-secundario)" />
                      <span>Ver Tarjeta Profesional</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Acciones de Validación y Administración */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.6rem',
                    flexWrap: 'wrap',
                    borderTop: '1px solid var(--borde-sutil)',
                    paddingTop: '0.75rem'
                  }}
                >
                  {prestador.estado !== 'aprobado' && (
                    <button
                      onClick={() => alAprobar(prestador.id, nombreTitular)}
                      disabled={estaProcesando}
                      className="boton boton-primario boton-pequeno"
                      style={{ gap: '0.35rem', backgroundColor: 'var(--color-exito)' }}
                    >
                      {estaProcesando ? (
                        <Loader2 size={14} style={{ animation: 'girar 1s linear infinite' }} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      <span>Aprobar y Activar RNT</span>
                    </button>
                  )}

                  {prestador.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => abrirModalCorreccion(prestador)}
                        disabled={estaProcesando}
                        className="boton boton-contorno boton-pequeno"
                        style={{ gap: '0.35rem' }}
                      >
                        <MessageSquare size={14} />
                        <span>Solicitar Corrección</span>
                      </button>

                      <button
                        onClick={() => abrirModalRechazo(prestador)}
                        disabled={estaProcesando}
                        className="boton boton-peligro boton-pequeno"
                        style={{ gap: '0.35rem' }}
                      >
                        <XCircle size={14} />
                        <span>Rechazar con Motivo</span>
                      </button>
                    </>
                  )}

                  {prestador.estado === 'aprobado' && (
                    <button
                      onClick={() => abrirModalSuspension(prestador)}
                      disabled={estaProcesando}
                      className="boton boton-peligro boton-pequeno"
                      style={{ gap: '0.35rem', backgroundColor: 'transparent', color: 'var(--color-peligro)', border: '1px solid var(--color-peligro)' }}
                    >
                      <Ban size={14} />
                      <span>Suspender Perfil</span>
                    </button>
                  )}

                  {prestador.estado === 'suspendido' && (
                    <button
                      onClick={() => alReactivar(prestador.id, nombreTitular)}
                      disabled={estaProcesando}
                      className="boton boton-primario boton-pequeno"
                      style={{ gap: '0.35rem', backgroundColor: 'var(--color-secundario)' }}
                    >
                      <UserCheck size={14} />
                      <span>Reactivar Prestador</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Rechazar con Motivo */}
      <Modal
        abierto={modalRechazoAbierto}
        alCerrar={() => setModalRechazoAbierto(false)}
        titulo="Rechazar Solicitud de Prestador"
        anchoMaximo="520px"
      >
        <form onSubmit={confirmarRechazo}>
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            Explica a <strong>{prestadorSeleccionado?.nombreAgencia || prestadorSeleccionado?.nombreCompleto}</strong> las razones del rechazo legal para registro formal en auditoría.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Motivo legal detallado del rechazo</span>
              <MessageSquare size={15} color="var(--color-peligro)" />
            </label>
            <textarea
              required
              rows={4}
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalRechazoAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviandoAccion}
              className="boton boton-peligro"
              style={{ flex: 2 }}
            >
              {enviandoAccion ? 'Registrando rechazo...' : 'Confirmar Rechazo y Notificar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Solicitar Correcciones */}
      <Modal
        abierto={modalCorreccionAbierto}
        alCerrar={() => setModalCorreccionAbierto(false)}
        titulo="Solicitar Correcciones de Documentos"
        anchoMaximo="520px"
      >
        <form onSubmit={confirmarCorreccion}>
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            Detalla los documentos o datos que el prestador debe corregir o volver a cargar.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Instrucciones de corrección para el prestador</span>
            </label>
            <textarea
              required
              rows={4}
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalCorreccionAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviandoAccion}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {enviandoAccion ? 'Enviando...' : 'Solicitar Corrección'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Suspender Perfil */}
      <Modal
        abierto={modalSuspensionAbierto}
        alCerrar={() => setModalSuspensionAbierto(false)}
        titulo="Suspender Prestador Preventivamente"
        anchoMaximo="520px"
      >
        <form onSubmit={confirmarSuspension}>
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            Ingresa la justificación de la suspensión preventiva para <strong>{prestadorSeleccionado?.nombreAgencia || prestadorSeleccionado?.nombreCompleto}</strong>. Sus paquetes o disponibilidad quedarán inactivos temporalmente.
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Justificación administrativa de la suspensión</span>
            </label>
            <textarea
              required
              rows={4}
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              className="area-texto-formulario"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalSuspensionAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviandoAccion}
              className="boton boton-peligro"
              style={{ flex: 2 }}
            >
              {enviandoAccion ? 'Suspendiendo...' : 'Confirmar Suspensión'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
