import React, { useState } from 'react';
import { Mail, Lock, LogIn, Loader2, ShieldCheck, Building2, Compass } from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

export const FormularioInicioSesion = ({ alCompletar }) => {
  const { iniciarSesion } = useAutenticacion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorMensaje('');
    setCargando(true);

    try {
      await iniciarSesion(correo, contrasena);
      alCompletar();
    } catch (error) {
      setErrorMensaje(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  const autocompletarCuenta = (emailDemo) => {
    setCorreo(emailDemo);
    setErrorMensaje('');
  };

  return (
    <form onSubmit={manejarEnvio} className="animar-aparicion">
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

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Correo electrónico</span>
          <Mail size={15} color="var(--texto-atenuado)" />
        </label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tu@correo.com"
          className="campo-formulario"
        />
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Contraseña</span>
          <Lock size={15} color="var(--texto-atenuado)" />
        </label>
        <input
          type="password"
          required
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="••••••••"
          className="campo-formulario"
        />
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="boton boton-primario"
        style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
      >
        {cargando ? (
          <>
            <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Iniciar Sesión</span>
          </>
        )}
      </button>

      {/* Cuentas sugeridas para evaluación de roles */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px dashed var(--borde-sutil)',
          fontSize: '0.78rem',
          color: 'var(--texto-secundario)'
        }}
      >
        <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
          Autocompletar para pruebas de rol:
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => autocompletarCuenta('x1984kamui@gmail.com')}
            style={{
              padding: '0.3rem 0.55rem',
              backgroundColor: 'var(--color-primario-claro)',
              color: 'var(--color-primario)',
              border: '1px solid rgba(23, 74, 91, 0.2)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ShieldCheck size={13} />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </form>
  );
};
