import React, { useState, useEffect } from 'react';
import { Modal } from '../comunes/Modal';
import { FormularioInicioSesion } from './FormularioInicioSesion';
import { FormularioRegistroAgencia } from './FormularioRegistroAgencia';
import { FormularioRegistroGuia } from './FormularioRegistroGuia';
import { FormularioRegistroTurista } from './FormularioRegistroTurista';
import { FormularioRecuperarClave } from './FormularioRecuperarClave';
import { User, Building2, Compass, Sparkles } from 'lucide-react';

export const ModalAutenticacion = ({ abierto, alCerrar, modoInicial = 'iniciar-sesion' }) => {
  const [pestanaPrincipal, setPestanaPrincipal] = useState('iniciar-sesion'); // 'iniciar-sesion' | 'registro' | 'recuperar-clave'
  const [tipoRegistro, setTipoRegistro] = useState('turista'); // 'turista' | 'agencia' | 'guia'

  useEffect(() => {
    if (modoInicial === 'registro') {
      setPestanaPrincipal('registro');
    } else if (modoInicial === 'recuperar-clave') {
      setPestanaPrincipal('recuperar-clave');
    } else {
      setPestanaPrincipal('iniciar-sesion');
    }
  }, [modoInicial, abierto]);

  const obtenerTituloModal = () => {
    if (pestanaPrincipal === 'recuperar-clave') return 'Recuperar Contraseña';
    if (pestanaPrincipal === 'registro') return 'Crear Cuenta en GuianzApp';
    return 'Iniciar Sesión en GuianzApp';
  };

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={obtenerTituloModal()} anchoMaximo="540px">
      {/* Selector de pestañas principales: Iniciar Sesión / Registrarse (Oculto en recuperación de clave) */}
      {pestanaPrincipal !== 'recuperar-clave' && (
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            onClick={() => setPestanaPrincipal('iniciar-sesion')}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: pestanaPrincipal === 'iniciar-sesion' ? '#0ea5e9' : 'transparent',
              color: pestanaPrincipal === 'iniciar-sesion' ? '#ffffff' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setPestanaPrincipal('registro')}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: pestanaPrincipal === 'registro' ? '#0ea5e9' : 'transparent',
              color: pestanaPrincipal === 'registro' ? '#ffffff' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Registrarse
          </button>
        </div>
      )}

      {pestanaPrincipal === 'recuperar-clave' ? (
        <FormularioRecuperarClave
          alVolverAInicioSesion={() => setPestanaPrincipal('iniciar-sesion')}
          alCompletar={alCerrar}
        />
      ) : pestanaPrincipal === 'iniciar-sesion' ? (
        <FormularioInicioSesion
          alCompletar={alCerrar}
          alRecuperarClave={() => setPestanaPrincipal('recuperar-clave')}
        />
      ) : (
        <div>
          {/* Selector de tipo de cuenta */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: '0.5rem' }}>
              SELECCIONA TU TIPO DE CUENTA:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setTipoRegistro('turista')}
                style={{
                  padding: '0.65rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: tipoRegistro === 'turista' ? '1px solid #0ea5e9' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tipoRegistro === 'turista' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  color: tipoRegistro === 'turista' ? '#38bdf8' : '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Sparkles size={18} />
                <span>Viajero</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoRegistro('agencia')}
                style={{
                  padding: '0.65rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: tipoRegistro === 'agencia' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tipoRegistro === 'agencia' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  color: tipoRegistro === 'agencia' ? '#fbbf24' : '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Building2 size={18} />
                <span>Agencia RNT</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoRegistro('guia')}
                style={{
                  padding: '0.65rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: tipoRegistro === 'guia' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: tipoRegistro === 'guia' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  color: tipoRegistro === 'guia' ? '#34d399' : '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Compass size={18} />
                <span>Guía RNT</span>
              </button>
            </div>
          </div>

          {tipoRegistro === 'turista' && <FormularioRegistroTurista alCompletar={alCerrar} />}
          {tipoRegistro === 'agencia' && <FormularioRegistroAgencia alCompletar={alCerrar} />}
          {tipoRegistro === 'guia' && <FormularioRegistroGuia alCompletar={alCerrar} />}
        </div>
      )}
    </Modal>
  );
};
