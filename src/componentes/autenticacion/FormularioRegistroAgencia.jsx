import React, { useState } from 'react';
import { Building2, Mail, Lock, ShieldCheck, FileUp, Loader2, Scale } from 'lucide-react';
import { servicioAutenticacion } from '../../api/autenticacionServicio';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { ModalTerminosCondiciones } from '../comunes/ModalTerminosCondiciones';

export const FormularioRegistroAgencia = ({ alCompletar }) => {
  const { mostrarNotificacion } = useAutenticacion();
  const [nombreAgencia, setNombreAgencia] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [numeroRnt, setNumeroRnt] = useState('');
  const [archivoRnt, setArchivoRnt] = useState(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [modalTerminosAbierto, setModalTerminosAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!archivoRnt) {
      setErrorMensaje('Debes adjuntar el certificado de Registro Nacional de Turismo (RNT).');
      return;
    }

    if (!aceptaTerminos) {
      setErrorMensaje('Debes aceptar los Términos y Condiciones y declarar contar con RNT activo y pólizas vigentes.');
      return;
    }

    setErrorMensaje('');
    setCargando(true);

    try {
      const datosForm = new FormData();
      datosForm.append('nombreAgencia', nombreAgencia);
      datosForm.append('correo', correo);
      datosForm.append('contrasena', contrasena);
      datosForm.append('numeroRnt', numeroRnt);
      datosForm.append('rntDocument', archivoRnt);
      datosForm.append('aceptaTerminos', 'true');

      const respuesta = await servicioAutenticacion.registrarAgencia(datosForm);
      mostrarNotificacion(respuesta.mensaje || 'Registro recibido para validación.');
      alCompletar();
    } catch (error) {
      setErrorMensaje(error.message || 'No se pudo completar el registro de la agencia.');
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
          <span>Nombre de la Agencia / Razón Social</span>
          <Building2 size={15} color="#9ca3af" />
        </label>
        <input
          type="text"
          required
          value={nombreAgencia}
          onChange={(e) => setNombreAgencia(e.target.value)}
          placeholder="Ej: Bogotá Andando S.A.S."
          className="campo-formulario"
        />
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Correo corporativo</span>
          <Mail size={15} color="#9ca3af" />
        </label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="contacto@agencia.co"
          className="campo-formulario"
        />
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Número de RNT</span>
          <ShieldCheck size={15} color="#fbbf24" />
        </label>
        <input
          type="text"
          required
          value={numeroRnt}
          onChange={(e) => setNumeroRnt(e.target.value)}
          placeholder="Ej: 48920"
          className="campo-formulario"
        />
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Contraseña (mínimo 8 caracteres)</span>
          <Lock size={15} color="#9ca3af" />
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="••••••••"
          className="campo-formulario"
        />
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Certificado RNT vigente (PDF o Imagen)</span>
          <FileUp size={15} color="#38bdf8" />
        </label>
        <input
          type="file"
          required
          accept=".pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setArchivoRnt(e.target.files[0])}
          className="campo-formulario"
          style={{ padding: '0.5rem' }}
        />
        <span className="texto-ayuda">Documento expedido por la Cámara de Comercio.</span>
      </div>

      {/* Checkbox Términos y Condiciones para Agencias */}
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
          Declaro contar con Registro Nacional de Turismo (RNT) activo y pólizas de seguro vigentes. He leído y acepto los{' '}
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
            Términos y Condiciones para Prestadores
          </button>{' '}
          y la Política de Tratamiento de Datos (Ley 1581 de 2012).
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
            <span>Enviando solicitud...</span>
          </>
        ) : (
          <>
            <Building2 size={18} />
            <span>Registrar Agencia Operadora</span>
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
