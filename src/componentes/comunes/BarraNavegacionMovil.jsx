import React from 'react';
import { Compass, MapPin, Briefcase, User, LayoutDashboard } from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

export const BarraNavegacionMovil = ({
  alCambiarVista,
  vistaActual,
  alAbrirAutenticacion
}) => {
  const { estaAutenticado, usuarioActual } = useAutenticacion();

  const desplazarASeccion = (idSeccion) => {
    alCambiarVista('inicio');
    setTimeout(() => {
      const elemento = document.getElementById(idSeccion);
      if (!elemento) return;
      const posicionY = elemento.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({
        top: Math.max(0, posicionY),
        behavior: 'smooth'
      });
    }, 50);
  };

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="barra-inferior-movil"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--borde-sutil)',
        boxShadow: '0 -4px 16px rgba(23, 74, 91, 0.08)',
        zIndex: 900,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'none' // Se habilita mediante media query en CSS
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          height: '62px',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => desplazarASeccion('catalogo-paquetes')}
          className="boton-tab-movil"
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            color: 'var(--color-primario)',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <Compass size={20} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Tours</span>
        </button>

        <button
          onClick={() => desplazarASeccion('zonas-bogota')}
          className="boton-tab-movil"
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            color: 'var(--texto-secundario)',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <MapPin size={20} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Zonas</span>
        </button>

        <button
          onClick={() => desplazarASeccion('para-prestadores')}
          className="boton-tab-movil"
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            color: 'var(--texto-secundario)',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <Briefcase size={20} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Prestadores</span>
        </button>

        {estaAutenticado ? (
          <button
            onClick={() => alCambiarVista(usuarioActual.rol || 'agencia')}
            className="boton-tab-movil"
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: 'var(--color-acento-bogota)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <LayoutDashboard size={20} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Panel</span>
          </button>
        ) : (
          <button
            onClick={() => alAbrirAutenticacion('login')}
            className="boton-tab-movil"
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: 'var(--texto-secundario)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <User size={20} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Ingresar</span>
          </button>
        )}
      </div>
    </nav>
  );
};
