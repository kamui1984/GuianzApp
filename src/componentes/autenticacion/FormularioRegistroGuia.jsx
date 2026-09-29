import React, { useState } from 'react';
import {
  Compass,
  Mail,
  Lock,
  ShieldCheck,
  Languages,
  Award,
  FileUp,
  Loader2,
  Phone,
  FileText,
  Sparkles
} from 'lucide-react';
import { servicioAutenticacion } from '../../api/autenticacionServicio';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { SelectorEspecialidades } from '../comunes/SelectorEspecialidades';

export const FormularioRegistroGuia = ({ alCompletar }) => {
  const { mostrarNotificacion } = useAutenticacion();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [numeroRnt, setNumeroRnt] = useState('');
  const [telefonoPrincipal, setTelefonoPrincipal] = useState('');
  const [tieneWhatsapp, setTieneWhatsapp] = useState(true);
  const [telefonoAlternativo, setTelefonoAlternativo] = useState('');
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState('');
  const [contactoEmergenciaTel, setContactoEmergenciaTel] = useState('');
  const [reseñaCorta, setReseñaCorta] = useState('');
  const [experienciaDetalle, setExperienciaDetalle] = useState('');
  const [competenciasTec, setCompetenciasTec] = useState('');
  const [idiomas, setIdiomas] = useState('Español');
  const [especialidadesIds, setEspecialidadesIds] = useState([]);
  const [archivoRnt, setArchivoRnt] = useState(null);
  const [archivoTarjeta, setArchivoTarjeta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!archivoRnt || !archivoTarjeta) {
      setErrorMensaje('Debes adjuntar tanto el certificado RNT como la Tarjeta Profesional de Guía.');
      return;
    }

    if (especialidadesIds.length === 0) {
      setErrorMensaje('Por favor selecciona al menos una especialidad o ruta temática.');
      return;
    }

    setErrorMensaje('');
    setCargando(true);

    try {
      const datosForm = new FormData();
      datosForm.append('nombreCompleto', nombreCompleto);
      datosForm.append('correo', correo);
      datosForm.append('contrasena', contrasena);
      datosForm.append('numeroRnt', numeroRnt);
      datosForm.append('tarjetaProfesional', numeroRnt);
      datosForm.append('telefonoPrincipal', telefonoPrincipal);
      datosForm.append('tieneWhatsapp', tieneWhatsapp);
      datosForm.append('telefonoAlternativo', telefonoAlternativo);
      datosForm.append('contactoEmergenciaNombre', contactoEmergenciaNombre);
      datosForm.append('contactoEmergenciaTel', contactoEmergenciaTel);
      datosForm.append('reseñaCorta', reseñaCorta);
      datosForm.append('experienciaDetalle', experienciaDetalle || 'Guía certificado para Bogotá y alrededores.');
      datosForm.append('competenciasTec', competenciasTec || 'Primeros auxilios básicos.');
      datosForm.append('idiomas', idiomas);
      datosForm.append('especialidadesIds', JSON.stringify(especialidadesIds));
      datosForm.append('rntDocument', archivoRnt);
      datosForm.append('professionalCard', archivoTarjeta);

      const respuesta = await servicioAutenticacion.registrarGuia(datosForm);
      mostrarNotificacion(respuesta.mensaje || 'Registro de guía recibido para validación.');
      alCompletar();
    } catch (error) {
      setErrorMensaje(error.message || 'No se pudo completar el registro del guía.');
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

      {/* Datos básicos y credenciales */}
      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Nombre completo comercial</span>
          <Compass size={15} color="#9ca3af" />
        </label>
        <input
          type="text"
          required
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Ej: Carlos Alberto Gómez"
          className="campo-formulario"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
            placeholder="guia@correo.com"
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
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Número RNT personal (Tarjeta Profesional)</span>
          <ShieldCheck size={15} color="#fbbf24" />
        </label>
        <input
          type="text"
          required
          value={numeroRnt}
          onChange={(e) => setNumeroRnt(e.target.value)}
          placeholder="Ej: 51230"
          className="campo-formulario"
        />
      </div>

      {/* Contacto y WhatsApp */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="grupo-formulario">
          <label className="etiqueta-formulario">
            <span>Teléfono Móvil Principal</span>
            <Phone size={15} color="#10b981" />
          </label>
          <input
            type="tel"
            required
            value={telefonoPrincipal}
            onChange={(e) => setTelefonoPrincipal(e.target.value)}
            placeholder="+573001234567"
            className="campo-formulario"
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: '#10b981' }}>
            <input
              type="checkbox"
              checked={tieneWhatsapp}
              onChange={(e) => setTieneWhatsapp(e.target.checked)}
              style={{ accentColor: '#10b981' }}
            />
            <span>Tiene WhatsApp activo</span>
          </label>
        </div>

        <div className="grupo-formulario">
          <label className="etiqueta-formulario">
            <span>Teléfono Alternativo</span>
            <Phone size={15} color="#9ca3af" />
          </label>
          <input
            type="tel"
            value={telefonoAlternativo}
            onChange={(e) => setTelefonoAlternativo(e.target.value)}
            placeholder="+573109876543"
            className="campo-formulario"
          />
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f87171', display: 'block', marginBottom: '0.5rem' }}>
          🛡️ Contacto de Emergencia (Seguridad en Ruta)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <input
            type="text"
            required
            value={contactoEmergenciaNombre}
            onChange={(e) => setContactoEmergenciaNombre(e.target.value)}
            placeholder="Nombre familiar / allegado"
            className="campo-formulario"
            style={{ marginBottom: 0 }}
          />
          <input
            type="tel"
            required
            value={contactoEmergenciaTel}
            onChange={(e) => setContactoEmergenciaTel(e.target.value)}
            placeholder="Teléfono familiar"
            className="campo-formulario"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {/* Gancho comercial */}
      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Reseña Corta de Presentación (máx 300 caracteres)</span>
          <FileText size={15} color="#38bdf8" />
        </label>
        <textarea
          required
          maxLength={300}
          rows={2}
          value={reseñaCorta}
          onChange={(e) => setReseñaCorta(e.target.value)}
          placeholder="Ej: Guía especializado en patrimonio colonial y centros históricos con 5 años de experiencia."
          className="campo-formulario"
          style={{ resize: 'vertical' }}
        />
        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#9ca3af' }}>
          {reseñaCorta.length}/300
        </div>
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Idiomas dominados</span>
          <Languages size={15} color="#38bdf8" />
        </label>
        <input
          type="text"
          required
          value={idiomas}
          onChange={(e) => setIdiomas(e.target.value)}
          placeholder="Ej: Español nativo, Inglés C1"
          className="campo-formulario"
        />
      </div>

      {/* Catálogo de Especialidades por Categorías */}
      <div style={{ marginBottom: '1.25rem' }}>
        <SelectorEspecialidades
          seleccionadas={especialidadesIds}
          alCambiar={setEspecialidadesIds}
          titulo="Selecciona tus Especialidades Turísticas"
          subtitulo="Marca las categorías y subcategorías para que el algoritmo te recomiende automáticamente a las agencias."
        />
      </div>

      {/* Documentos */}
      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Certificado RNT (PDF o Imagen)</span>
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
      </div>

      <div className="grupo-formulario">
        <label className="etiqueta-formulario">
          <span>Tarjeta Profesional de Guía de Turismo</span>
          <FileUp size={15} color="#38bdf8" />
        </label>
        <input
          type="file"
          required
          accept=".pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setArchivoTarjeta(e.target.files[0])}
          className="campo-formulario"
          style={{ padding: '0.5rem' }}
        />
        <span className="texto-ayuda">Emitida por el Consejo Profesional de Guías de Turismo.</span>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="boton boton-primario"
        style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
      >
        {cargando ? (
          <>
            <Loader2 size={18} style={{ animation: 'girar 1s linear infinite' }} />
            <span>Enviando solicitud y especialidades...</span>
          </>
        ) : (
          <>
            <Compass size={18} />
            <span>Registrar Guía Profesional</span>
          </>
        )}
      </button>
    </form>
  );
};
