import React, { useState } from 'react';
import { User, LogOut, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

export const BarraNavegacion = ({
  alAbrirAutenticacion,
  vistaActual,
  alCambiarVista
}) => {
  const { usuarioActual, estaAutenticado, cerrarSesion } = useAutenticacion();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const obtenerEtiquetaPanel = () => {
    if (!usuarioActual) return 'Mi Panel';
    switch (usuarioActual.rol) {
      case 'agencia':
        return 'Panel Agencia';
      case 'guia':
        return 'Panel Guía';
      case 'administrador':
        return 'Panel Administración';
      default:
        return 'Mis Experiencias';
    }
  };

  const desplazarASeccion = (idSeccion) => {
    alCambiarVista('inicio');
    setMenuMovilAbierto(false);
    setTimeout(() => {
      const elemento = document.getElementById(idSeccion);
      if (!elemento) return;
      
      const compensacionPorSeccion = {
        'catalogo-paquetes': 80,
        'zonas-bogota': 80,
        'beneficios': 55,
        'para-prestadores': 50
      };

      const alturaOffset = compensacionPorSeccion[idSeccion] || 75;
      const posicionY = elemento.getBoundingClientRect().top + window.pageYOffset - alturaOffset;
      window.scrollTo({
        top: Math.max(0, posicionY),
        behavior: 'smooth'
      });
    }, 40);
  };

  return (
    <>
      <div className="franja-ornamental" />
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--borde-sutil)',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 2px 10px rgba(23, 74, 91, 0.04)'
        }}
      >
        <div
          className="contenedor"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '74px'
          }}
        >
          {/* Logotipo de GuianzApp */}
          <div
            onClick={() => {
              alCambiarVista('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <img
              src="/logos/Versión3/Recurso 11.png"
              alt="GuianzApp"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: 'var(--fuente-titulos)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-primario)'
                }}
              >
                GuianzApp
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--color-acento-bogota)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                Bogotá · Turismo RNT
              </div>
            </div>
          </div>

          {/* Enlaces de Navegación de Escritorio (4 Botones Principales) */}
          <nav className="menu-escritorio">
            <button
              onClick={() => desplazarASeccion('catalogo-paquetes')}
              className="nav-pill-btn"
            >
              Paquetes Turísticos
            </button>
            <button
              onClick={() => desplazarASeccion('zonas-bogota')}
              className="nav-pill-btn"
            >
              Zonas de Bogotá
            </button>
            <button
              onClick={() => desplazarASeccion('beneficios')}
              className="nav-pill-btn"
            >
              Beneficios
            </button>
            <button
              onClick={() => desplazarASeccion('para-prestadores')}
              className="nav-pill-btn"
            >
              Agencias y Guías
            </button>
          </nav>

          {/* Acciones de Autenticación / Usuario */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div className="acciones-auth-superior">
              {estaAutenticado ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => alCambiarVista(usuarioActual.rol || 'agencia')}
                    className="boton boton-contorno"
                    style={{ gap: '0.45rem' }}
                  >
                    <LayoutDashboard size={16} />
                    <span>{obtenerEtiquetaPanel()}</span>
                  </button>
                  <button
                    onClick={cerrarSesion}
                    className="boton boton-texto"
                    style={{ color: 'var(--color-peligro)', padding: '0.5rem' }}
                    title="Cerrar sesión"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    onClick={() => alAbrirAutenticacion('login')}
                    className="boton boton-texto"
                    style={{ gap: '0.4rem', color: 'var(--texto-principal)', fontWeight: 600 }}
                  >
                    <User size={16} color="var(--color-primario)" />
                    <span>Iniciar sesión</span>
                  </button>
                  <button
                    onClick={() => alAbrirAutenticacion('registro-agencia')}
                    className="boton boton-primario"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>

            {/* Botón de Menú Móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="boton boton-contorno boton-menu-movil"
              style={{ padding: '0.5rem', minWidth: '40px', minHeight: '40px' }}
              aria-label="Abrir menú"
            >
              {menuMovilAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {menuMovilAbierto && (
          <div
            className="animar-aparicion"
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--borde-sutil)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <button
              onClick={() => desplazarASeccion('catalogo-paquetes')}
              className="nav-pill-btn"
              style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}
            >
              Paquetes Turísticos
            </button>
            <button
              onClick={() => desplazarASeccion('zonas-bogota')}
              className="nav-pill-btn"
              style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}
            >
              Zonas de Bogotá
            </button>
            <button
              onClick={() => desplazarASeccion('beneficios')}
              className="nav-pill-btn"
              style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}
            >
              Beneficios
            </button>
            <button
              onClick={() => desplazarASeccion('para-prestadores')}
              className="nav-pill-btn"
              style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}
            >
              Agencias y Guías
            </button>

            <div style={{ height: '1px', backgroundColor: 'var(--borde-sutil)', margin: '0.5rem 0' }} />

            {!estaAutenticado ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    alAbrirAutenticacion('login');
                  }}
                  className="boton boton-contorno"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <User size={16} />
                  <span>Iniciar sesión</span>
                </button>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    alAbrirAutenticacion('registro-agencia');
                  }}
                  className="boton boton-primario"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Registrarse como Prestador
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    alCambiarVista(usuarioActual.rol || 'agencia');
                  }}
                  className="boton boton-contorno"
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <LayoutDashboard size={16} />
                  <span>{obtenerEtiquetaPanel()}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    cerrarSesion();
                  }}
                  className="boton boton-texto"
                  style={{ color: 'var(--color-peligro)', width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
