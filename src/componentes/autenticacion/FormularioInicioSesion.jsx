import React, { useState } from 'react';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
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

  return (
    <form onSubmit={manejarEnvio} className="animar-aparicion">
      {errorMensaje && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#f87171',
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
          <Mail size={15} color="#9ca3af" />
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
          <Lock size={15} color="#9ca3af" />
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
    </form>
  );
};
