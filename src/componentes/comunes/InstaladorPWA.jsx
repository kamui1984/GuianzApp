import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const InstaladorPWA = () => {
  const [eventoInstalacion, setEventoInstalacion] = useState(null);
  const [esInstalable, setEsInstalable] = useState(false);
  const [esIos, setEsIos] = useState(false);
  const [mostrarGuiaIos, setMostrarGuiaIos] = useState(false);
  const [yaInstalada, setYaInstalada] = useState(false);
  const [descartado, setDescartado] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está corriendo como PWA independiente (standalone)
    const esModoStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (esModoStandalone) {
      setYaInstalada(true);
      return;
    }

    // 2. Detectar si es iOS (Safari)
    const agente = window.navigator.userAgent.toLowerCase();
    const esDispositivoIos = /iphone|ipad|ipod/.test(agente);
    setEsIos(esDispositivoIos);

    // 3. Capturar evento de instalación nativo (Android / Chromium)
    const manejarBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setEventoInstalacion(e);
      setEsInstalable(true);
    };

    window.addEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);

    // 4. Detectar cuando la app se instala con éxito
    window.addEventListener('appinstalled', () => {
      setYaInstalada(true);
      setEsInstalable(false);
      setEventoInstalacion(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
    };
  }, []);

  const manejarInstalacion = async () => {
    if (eventoInstalacion) {
      eventoInstalacion.prompt();
      const eleccion = await eventoInstalacion.userChoice;
      if (eleccion.outcome === 'accepted') {
        setYaInstalada(true);
      }
      setEventoInstalacion(null);
      setEsInstalable(false);
    } else if (esIos) {
      setMostrarGuiaIos(true);
    }
  };

  // No mostrar si ya está en modo app, o si el usuario descartó el banner, o si no aplica
  if (yaInstalada || descartado || (!esInstalable && !esIos)) {
    return null;
  }

  return (
    <>
      {/* Banner flotante de instalación optimizado para móvil y escritorio */}
      <aside
        aria-label="Instalación de la aplicación"
        className="animar-aparicion"
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          left: '1.25rem',
          maxWidth: '440px',
          marginLeft: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(23, 74, 91, 0.22), 0 0 0 1px rgba(198, 161, 91, 0.35)',
          padding: '0.85rem 1rem',
          zIndex: 950,
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <img
          src="/icons/pwa-192x192.png"
          alt="GuianzApp"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(23, 74, 91, 0.15)',
            flexShrink: 0
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--fuente-titulos)',
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--color-primario)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>Instalar GuianzApp</span>
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: 'var(--color-acento-bogota)',
                color: '#FFFFFF',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 700
              }}
            >
              App Oficial
            </span>
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--texto-secundario)',
              margin: '2px 0 0 0',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Accede más rápido y explora paquetes offline
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <button
            onClick={manejarInstalacion}
            className="boton boton-primario"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Download size={15} />
            <span>Instalar</span>
          </button>
          <button
            onClick={() => setDescartado(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--texto-secundario)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
            title="Cerrar"
            aria-label="Cerrar aviso"
          >
            <X size={18} />
          </button>
        </div>
      </aside>

      {/* Modal didáctico exclusivo para usuarios de iOS Safari */}
      {mostrarGuiaIos && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 74, 91, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setMostrarGuiaIos(false)}
        >
          <div
            className="animar-aparicion"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px 20px 16px 16px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Smartphone size={22} color="var(--color-primario)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primario)' }}>
                  Instalar en tu iPhone / iPad
                </h4>
              </div>
              <button
                onClick={() => setMostrarGuiaIos(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '6px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1.25rem' }}>
              Para disfrutar de GuianzApp a pantalla completa como una app nativa:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primario-claro)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primario)',
                    flexShrink: 0
                  }}
                >
                  <Share2 size={18} />
                </div>
                <div>
                  <strong>Paso 1:</strong> Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primario-claro)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primario)',
                    flexShrink: 0
                  }}
                >
                  <PlusSquare size={18} />
                </div>
                <div>
                  <strong>Paso 2:</strong> Desplázate hacia abajo y selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-exito-fondo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-exito)',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <strong>Paso 3:</strong> Presiona <strong>"Añadir"</strong> en la esquina superior derecha ¡y listo!
                </div>
              </div>
            </div>

            <button
              onClick={() => setMostrarGuiaIos(false)}
              className="boton boton-primario"
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
