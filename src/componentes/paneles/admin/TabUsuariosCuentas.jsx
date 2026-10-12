import React, { useState } from 'react';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Shield,
  Building2,
  Compass,
  User,
  ShieldAlert,
  Loader2,
  Calendar,
  Mail,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { Modal } from '../../comunes/Modal';

export const TabUsuariosCuentas = ({
  usuarios,
  cargando,
  alCambiarEstado,
  alDescargarCSV
}) => {
  const [rolFiltro, setRolFiltro] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal de bloqueo / reactivación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [accionTipo, setAccionTipo] = useState('bloquear'); // 'bloquear' | 'reactivar'
  const [justificacion, setJustificacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const usuariosFiltrados = usuarios.filter((u) => {
    if (rolFiltro !== 'todos' && u.rol !== rolFiltro) return false;
    if (estadoFiltro !== 'todos') {
      if (estadoFiltro === 'activo' && u.estado !== 'aprobado') return false;
      if (estadoFiltro === 'bloqueado' && u.estado !== 'bloqueado' && u.estado !== 'suspendido') return false;
      if (estadoFiltro === 'pendiente' && u.estado !== 'pendiente') return false;
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const n = (u.nombre || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      const r = (u.numeroRnt || '').toLowerCase();
      if (!n.includes(q) && !e.includes(q) && !r.includes(q)) return false;
    }
    return true;
  });

  const abrirModalAccion = (usuario, accion) => {
    setUsuarioSeleccionado(usuario);
    setAccionTipo(accion);
    setJustificacion(
      accion === 'bloquear'
        ? 'Incumplimiento reiterado de términos y condiciones de GuianzApp o denuncia en trámite.'
        : 'Reactivación tras verificación administrativa y subsanación.'
    );
    setModalAbierto(true);
  };

  const confirmarCambioEstado = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    setGuardando(true);
    try {
      const nuevoEstado = accionTipo === 'bloquear' ? 'bloqueado' : 'activo';
      await alCambiarEstado(usuarioSeleccionado.id, nuevoEstado, justificacion);
      setModalAbierto(false);
    } finally {
      setGuardando(false);
    }
  };

  const obtenerIconoRol = (rol) => {
    switch (rol) {
      case 'agencia':
        return <Building2 size={16} color="var(--color-primario)" />;
      case 'guia':
        return <Compass size={16} color="var(--color-secundario)" />;
      case 'administrador':
        return <Shield size={16} color="var(--color-acento-bogota)" />;
      default:
        return <User size={16} color="var(--color-dorado-hover)" />;
    }
  };

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Privacidad y Habeas Data */}
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
            Gestión de Usuarios y Cuentas de la Plataforma
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
            Supervisión de estados de acceso de agencias, guías y turistas registrados.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--color-primario-claro)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: 'var(--color-primario)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ShieldAlert size={14} />
            <span>Ley 1581 (Habeas Data): Contraseñas y datos sensibles protegidos</span>
          </div>

          <button
            onClick={() => alDescargarCSV('usuarios')}
            className="boton boton-contorno boton-pequeno"
            style={{ gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <FileDown size={14} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
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
            placeholder="Buscar por nombre, correo o RNT..."
            className="campo-formulario"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--fondo-principal)', padding: '3px', borderRadius: '8px' }}>
          {['todos', 'agencia', 'guia', 'turista', 'administrador'].map((r) => (
            <button
              key={r}
              onClick={() => setRolFiltro(r)}
              style={{
                border: 'none',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: rolFiltro === r ? 'var(--color-primario)' : 'transparent',
                color: rolFiltro === r ? '#FFFFFF' : 'var(--texto-secundario)',
                textTransform: 'capitalize'
              }}
            >
              {r === 'todos' ? 'Todos' : r}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--fondo-principal)', padding: '3px', borderRadius: '8px' }}>
          {['todos', 'activo', 'bloqueado', 'pendiente'].map((est) => (
            <button
              key={est}
              onClick={() => setEstadoFiltro(est)}
              style={{
                border: 'none',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: estadoFiltro === est ? 'var(--color-primario)' : 'transparent',
                color: estadoFiltro === est ? '#FFFFFF' : 'var(--texto-secundario)',
                textTransform: 'capitalize'
              }}
            >
              {est === 'todos' ? 'Cualquier estado' : est}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={32} color="var(--color-primario)" style={{ animation: 'girar 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>Consultando cuentas registradas...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--borde-sutil)'
          }}
        >
          <Users size={36} color="var(--texto-atenuado)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primario)' }}>
            No se encontraron usuarios coincidentes
          </h4>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--borde-sutil)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-sutil)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)' }}>Usuario / Entidad</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)' }}>Rol</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)' }}>Correo Electrónico</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)' }}>RNT / ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)' }}>Estado</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primario)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const esBloqueado = u.estado === 'bloqueado' || u.estado === 'suspendido';
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--borde-sutil)',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--fondo-principal)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {obtenerIconoRol(u.rol)}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--texto-principal)', display: 'block' }}>{u.nombre}</strong>
                            <span style={{ fontSize: '0.74rem', color: 'var(--texto-atenuado)' }}>
                              Registrado: {new Date(u.creadoEn).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor:
                              u.rol === 'agencia'
                                ? 'var(--color-primario-claro)'
                                : u.rol === 'guia'
                                ? 'var(--color-secundario-claro)'
                                : 'var(--color-dorado-claro)',
                            color:
                              u.rol === 'agencia'
                                ? 'var(--color-primario)'
                                : u.rol === 'guia'
                                ? 'var(--color-secundario)'
                                : 'var(--color-advertencia)'
                          }}
                        >
                          {u.rol}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--texto-secundario)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={13} color="var(--texto-atenuado)" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--texto-secundario)' }}>
                        {u.numeroRnt ? <strong>{u.numeroRnt}</strong> : <span style={{ color: 'var(--texto-atenuado)' }}>N/A</span>}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: esBloqueado
                              ? 'var(--color-peligro-fondo)'
                              : u.estado === 'pendiente'
                              ? 'var(--color-advertencia-fondo)'
                              : 'var(--color-exito-fondo)',
                            color: esBloqueado
                              ? 'var(--color-peligro)'
                              : u.estado === 'pendiente'
                              ? 'var(--color-advertencia)'
                              : 'var(--color-exito)'
                          }}
                        >
                          {u.estado}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {u.rol !== 'administrador' && (
                          esBloqueado ? (
                            <button
                              onClick={() => abrirModalAccion(u, 'reactivar')}
                              className="boton boton-contorno boton-pequeno"
                              style={{ gap: '0.3rem', fontSize: '0.76rem', borderColor: 'var(--color-exito)', color: 'var(--color-exito)' }}
                            >
                              <Unlock size={13} />
                              <span>Reactivar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => abrirModalAccion(u, 'bloquear')}
                              className="boton boton-contorno boton-pequeno"
                              style={{ gap: '0.3rem', fontSize: '0.76rem', borderColor: 'var(--color-peligro)', color: 'var(--color-peligro)' }}
                            >
                              <Lock size={13} />
                              <span>Bloquear</span>
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Bloqueo / Reactivación */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={accionTipo === 'bloquear' ? 'Bloquear Cuenta de Usuario' : 'Reactivar Cuenta de Usuario'}
        anchoMaximo="520px"
      >
        <form onSubmit={confirmarCambioEstado}>
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
            {accionTipo === 'bloquear'
              ? `Estás a punto de bloquear la cuenta de "${usuarioSeleccionado?.nombre}". No podrá iniciar sesión ni ofrecer servicios.`
              : `Estás a punto de reactivar la cuenta de "${usuarioSeleccionado?.nombre}". Podrá volver a ingresar normalmente.`}
          </p>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Justificación administrativa obligatoria</span>
            </label>
            <textarea
              required
              rows={4}
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              className="area-texto-formulario"
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
              className={`boton ${accionTipo === 'bloquear' ? 'boton-peligro' : 'boton-primario'}`}
              style={{ flex: 2 }}
            >
              {guardando ? 'Guardando...' : accionTipo === 'bloquear' ? 'Confirmar Bloqueo' : 'Confirmar Reactivación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
