import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, Loader2, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { servicioAutenticacion } from '../../api/autenticacionServicio';

export const FormularioRecuperarClave = ({ alVolverAInicioSesion, alCompletar }) => {
  const [paso, setPaso] = useState('solicitar'); // 'solicitar' | 'restablecer'
  const [correo, setCorreo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [tokenRecuperacion, setTokenRecuperacion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');

  // Detectar si la URL contiene fragmento de recuperación de Supabase Auth
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || hash.includes('restablecer-clave')) {
      setPaso('restablecer');
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) setTokenRecuperacion(token);
    }
  }, []);

  const manejarSolicitud = async (e) => {
    e.preventDefault();
    setErrorMensaje('');
    setMensajeExito('');
    setCargando(true);

    try {
      const respuesta = await servicioAutenticacion.solicitarRecuperacionClave(correo);
      setMensajeExito(
        respuesta.mensaje ||
          'Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor verifica tu bandeja de entrada o spam.'
      );
    } catch (err) {
      setErrorMensaje(err.message || 'Error al procesar la solicitud de recuperación.');
    } finally {
      setCargando(false);
    }
  };

  const manejarRestablecer = async (e) => {
    e.preventDefault();
    setErrorMensaje('');
    setMensajeExito('');

    if (nuevaContrasena.length < 8) {
      setErrorMensaje('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorMensaje('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await servicioAutenticacion.restablecerContrasena({
        correo,
        nuevaContrasena,
        token: tokenRecuperacion
      });

      setMensajeExito(respuesta.mensaje || '¡Contraseña restablecida exitosamente!');
      setTimeout(() => {
        if (alVolverAInicioSesion) alVolverAInicioSesion();
      }, 2500);
    } catch (err) {
      setErrorMensaje(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="animar-aparicion">
      {/* Botón Volver */}
      <button
        type="button"
        onClick={alVolverAInicioSesion}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-primario)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          marginBottom: '1rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        <span>Volver a Iniciar Sesión</span>
      </button>

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

      {mensajeExito && (
        <div
          style={{
            padding: '0.9rem 1rem',
            backgroundColor: 'var(--color-exito-fondo)',
            border: '1px solid var(--color-exito)',
            borderRadius: '10px',
            color: 'var(--color-exito)',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {paso === 'solicitar' ? (
        <form onSubmit={manejarSolicitud}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--texto-principal)', marginBottom: '0.35rem' }}>
              ¿Olvidaste tu contraseña?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', lineHeight: 1.5 }}>
              Ingresa el correo electrónico asociado a tu cuenta (agencia, guía o turista). Te enviaremos un enlace seguro para restablecerla.
            </p>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Correo electrónico registrado</span>
              <Mail size={15} color="var(--texto-atenuado)" />
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className="campo-formulario"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="boton boton-primario"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {cargando ? (
              <>
                <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                <span>Enviando solicitud...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Enviar Instrucciones de Recuperación</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={manejarRestablecer}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--texto-principal)', marginBottom: '0.35rem' }}>
              Crear Nueva Contraseña
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', lineHeight: 1.5 }}>
              Ingresa tu nueva clave de acceso de al menos 8 caracteres para reactivar tu sesión.
            </p>
          </div>

          {!tokenRecuperacion && (
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Confirma tu correo registrado</span>
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
          )}

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Nueva Contraseña (mínimo 8 caracteres)</span>
              <Lock size={15} color="var(--texto-atenuado)" />
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="••••••••"
              className="campo-formulario"
              autoFocus
            />
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Confirmar Nueva Contraseña</span>
              <Lock size={15} color="var(--texto-atenuado)" />
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="••••••••"
              className="campo-formulario"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="boton boton-primario"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {cargando ? (
              <>
                <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
                <span>Actualizando contraseña...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Guardar Nueva Contraseña</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
