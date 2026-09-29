import React, { useState } from 'react';
import { User, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import { servicioAutenticacion } from '../../api/autenticacionServicio';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { guardarTokenAutenticacion } from '../../api/clienteHttp';

export const FormularioRegistroTurista = ({ alCompletar }) => {
  const { mostrarNotificacion, recargarUsuario } = useAutenticacion();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorMensaje('');
    setCargando(true);

    try {
      const respuesta = await servicioAutenticacion.registrarTurista({
        nombreCompleto,
        correo,
        contrasena
      });

      if (respuesta.token) {
        guardarTokenAutenticacion(respuesta.token);
        await recargarUsuario();
      }

      mostrarNotificacion('¡Cuenta creada exitosamente! Explora las mejores experiencias en Bogotá.');
      alCompletar();
    } catch (error) {
      setErrorMensaje(error.message || 'Error al crear la cuenta.');
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
          <span>Nombre completo</span>
          <User size={15} color="#9ca3af" />
        </label>
        <input
          type="text"
          required
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Ej: Laura Martínez"
          className="campo-formulario"
        />
      </div>

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
          <span>Contraseña (mínimo 6 caracteres)</span>
          <Lock size={15} color="#9ca3af" />
        </label>
        <input
          type="password"
          required
          minLength={6}
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
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Crear Cuenta de Viajero</span>
          </>
        )}
      </button>
    </form>
  );
};
