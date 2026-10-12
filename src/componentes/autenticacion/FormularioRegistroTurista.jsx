import React, { useState } from 'react';
import { User, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import { servicioAutenticacion } from '../../api/autenticacionServicio';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { guardarTokenAutenticacion } from '../../api/clienteHttp';
import { ModalTerminosCondiciones } from '../comunes/ModalTerminosCondiciones';

export const FormularioRegistroTurista = ({ alCompletar }) => {
  const { mostrarNotificacion, recargarUsuario } = useAutenticacion();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [modalTerminosAbierto, setModalTerminosAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      setErrorMensaje('Debes aceptar los Términos y Condiciones de Uso y la Política de Privacidad.');
      return;
    }

    setErrorMensaje('');
    setCargando(true);

    try {
      const respuesta = await servicioAutenticacion.registrarTurista({
        nombreCompleto,
        correo,
        contrasena,
        aceptaTerminos: true
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

      {/* Checkbox Términos y Condiciones */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          fontSize: '0.82rem',
          color: '#d1d5db',
          lineHeight: 1.45,
          marginTop: '0.85rem',
          marginBottom: '0.85rem',
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          required
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          style={{ marginTop: '2px', accentColor: '#0ea5e9', width: '16px', height: '16px' }}
        />
        <span>
          He leído y acepto los{' '}
          <button
            type="button"
            onClick={(ev) => {
              ev.preventDefault();
              setModalTerminosAbierto(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#38bdf8',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Términos y Condiciones de Uso
          </button>{' '}
          y la Política de Privacidad de GuianzApp (Ley 1581 de 2012 y Ley 1480 de 2011).
        </span>
      </label>

      <button
        type="submit"
        disabled={cargando || !aceptaTerminos}
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

      {/* Modal de Términos y Condiciones */}
      <ModalTerminosCondiciones
        abierto={modalTerminosAbierto}
        alCerrar={() => setModalTerminosAbierto(false)}
        rolInicial="turistas"
      />
    </form>
  );
};
