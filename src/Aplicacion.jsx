import React, { useState, useEffect, useMemo } from 'react';
import { useAutenticacion } from './contextos/ContextoAutenticacion';
import { servicioPaquetes } from './api/paquetesServicio';
import { BarraNavegacion } from './componentes/comunes/BarraNavegacion';
import { PiePagina } from './componentes/comunes/PiePagina';
import { NotificacionToast } from './componentes/comunes/NotificacionToast';
import { Cargando } from './componentes/comunes/Cargando';
import { SeccionHero } from './componentes/inicio/SeccionHero';
import { CarruselZonas } from './componentes/inicio/CarruselZonas';
import { FiltrosBusqueda } from './componentes/inicio/FiltrosBusqueda';
import { CuadriculaPaquetes } from './componentes/inicio/CuadriculaPaquetes';
import { SeccionBeneficios } from './componentes/inicio/SeccionBeneficios';
import { SeccionPrestadores } from './componentes/inicio/SeccionPrestadores';
import { ModalDetallePaquete } from './componentes/inicio/ModalDetallePaquete';
import { ModalReserva } from './componentes/inicio/ModalReserva';
import { ModalAutenticacion } from './componentes/autenticacion/ModalAutenticacion';
import { PanelAgencia } from './componentes/paneles/PanelAgencia';
import { PanelGuia } from './componentes/paneles/PanelGuia';
import { PanelAdministrador } from './componentes/paneles/PanelAdministrador';
import { Sparkles, Calendar, Compass } from 'lucide-react';

// Catálogo base de Bogotá garantizado con agencias formales
const PAQUETES_DESTACADOS_BOGOTA = [
  {
    id: 'base-1',
    titulo: 'Bogotá Colonial & Secretos de La Candelaria',
    descripcion: 'Recorrido a pie por las calles coloniales, el Chorro de Quevedo, museos de la zona histórica y degustación de café de origen colombiano.',
    precio: 55000,
    duracion: '3.5 horas',
    categoria: 'centro',
    nombreAgencia: 'Bogotá Andando S.A.S.',
    numeroRnt: '48920',
    politicaCancelacion: 'Cancelación gratuita hasta 24 horas antes del tour.',
    archivos: [
      { url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80', nombre: 'candelaria.jpg' }
    ]
  },
  {
    id: 'base-2',
    titulo: 'Sendero de los Cerros Orientales & Mirador Monserrate',
    descripcion: 'Ascenso ecológico por caminos reales de montaña con avistamiento de flora andina, historia de la sabana y panorámicas inigualables de Bogotá.',
    precio: 68000,
    duracion: '4 horas',
    categoria: 'naturaleza',
    nombreAgencia: 'Explora Cerros Bogotá',
    numeroRnt: '51230',
    politicaCancelacion: 'Cancelación flexible con 12 horas de anticipación.',
    archivos: [
      { url: 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?auto=format&fit=crop&w=800&q=80', nombre: 'monserrate.jpg' }
    ]
  },
  {
    id: 'base-3',
    titulo: 'Ruta del Café Especial Colombiano & Barismo en Usaquén',
    descripcion: 'Experiencia sensorial catando cafés de origen de Huila y Cundinamarca con baristas profesionales en los mejores tostadores artesanales.',
    precio: 85000,
    duracion: '3 horas',
    categoria: 'gastronomia',
    nombreAgencia: 'Origen Capital Coffee Tours',
    numeroRnt: '39481',
    politicaCancelacion: 'Cancelación sin penalidad hasta 24 horas antes.',
    archivos: [
      { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80', nombre: 'cafe.jpg' }
    ]
  },
  {
    id: 'base-4',
    titulo: 'Distrito Graffiti & Arte Urbano Capitalino',
    descripcion: 'Inmersión en el mayor museo al aire libre de arte urbano en Bogotá. Conoce la historia de los muralistas y técnicas de stencil en Puente Aranda.',
    precio: 48000,
    duracion: '2.5 horas',
    categoria: 'arte',
    nombreAgencia: 'Muros Vivos Travel',
    numeroRnt: '45102',
    politicaCancelacion: 'Cancelación gratuita hasta 24 horas antes.',
    archivos: [
      { url: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?auto=format&fit=crop&w=800&q=80', nombre: 'graffiti.jpg' }
    ]
  },
  {
    id: 'base-5',
    titulo: 'Ecoturismo en Bosques de Niebla & Páramo',
    descripcion: 'Caminata guiada por senderos de alta montaña, bosque de niebla y cascadas naturales con guías certificados en ecología andina.',
    precio: 92000,
    duracion: '6 horas',
    categoria: 'ecoturismo',
    nombreAgencia: 'Andes Ecotours Colombia',
    numeroRnt: '52890',
    politicaCancelacion: 'Cancelación con 48h de anticipación para reembolsos.',
    archivos: [
      { url: 'https://images.unsplash.com/photo-1674558350402-84bf8cee7c2a?auto=format&fit=crop&w=800&q=80', nombre: 'paramo.jpg' }
    ]
  }
];

export const Aplicacion = () => {
  const { usuarioActual, estaAutenticado, esAgencia, esGuia, esAdministrador } = useAutenticacion();
  const [vistaActual, setVistaActual] = useState('inicio'); // 'inicio' | 'panel'
  const [paquetes, setPaquetes] = useState([]);
  const [cargandoPaquetes, setCargandoPaquetes] = useState(true);

  // Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');

  // Estados de Modales
  const [modalAutenticacionAbierto, setModalAutenticacionAbierto] = useState(false);
  const [modoAutenticacionInicial, setModoAutenticacionInicial] = useState('iniciar-sesion');
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);

  // Cargar paquetes desde el backend
  useEffect(() => {
    const obtenerPaquetes = async () => {
      setCargandoPaquetes(true);
      try {
        const respuesta = await servicioPaquetes.explorarPaquetes();
        if (respuesta && respuesta.length > 0) {
          setPaquetes(respuesta);
        } else {
          setPaquetes(PAQUETES_DESTACADOS_BOGOTA);
        }
      } catch (error) {
        console.warn('Usando catálogo base de Bogotá debido a:', error.message);
        setPaquetes(PAQUETES_DESTACADOS_BOGOTA);
      } finally {
        setCargandoPaquetes(false);
      }
    };

    obtenerPaquetes();
  }, []);

  // Filtrado reactivo de paquetes
  const paquetesFiltrados = useMemo(() => {
    return paquetes.filter((paquete) => {
      const coincideBusqueda =
        !busqueda ||
        paquete.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        paquete.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        paquete.nombreAgencia?.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      if (categoriaSeleccionada === 'todos') return true;

      const textoCompleto = `${paquete.titulo || ''} ${paquete.descripcion || ''} ${paquete.categoria || ''}`.toLowerCase();

      switch (categoriaSeleccionada) {
        case 'centro':
          return textoCompleto.includes('candelaria') || textoCompleto.includes('colonial') || textoCompleto.includes('histórico') || textoCompleto.includes('museo');
        case 'naturaleza':
          return textoCompleto.includes('cerros') || textoCompleto.includes('monserrate') || textoCompleto.includes('montaña') || textoCompleto.includes('bosque');
        case 'gastronomia':
          return textoCompleto.includes('café') || textoCompleto.includes('gastronomía') || textoCompleto.includes('usaquén') || textoCompleto.includes('cata');
        case 'arte':
          return textoCompleto.includes('graffiti') || textoCompleto.includes('arte') || textoCompleto.includes('mural') || textoCompleto.includes('aranda');
        case 'ecoturismo':
          return textoCompleto.includes('niebla') || textoCompleto.includes('páramo') || textoCompleto.includes('ecoturismo') || textoCompleto.includes('chicaque');
        default:
          return true;
      }
    });
  }, [paquetes, busqueda, categoriaSeleccionada]);

  const abrirModalAutenticacion = (modo = 'iniciar-sesion') => {
    setModoAutenticacionInicial(modo);
    setModalAutenticacionAbierto(true);
  };

  const abrirDetallesPaquete = (paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalDetallesAbierto(true);
  };

  const abrirReservaPaquete = (paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalReservaAbierto(true);
  };

  return (
    <>
      <NotificacionToast />

      <BarraNavegacion
        alAbrirAutenticacion={abrirModalAutenticacion}
        vistaActual={vistaActual}
        alCambiarVista={setVistaActual}
      />

      <main style={{ flex: 1 }}>
        {vistaActual === 'inicio' ? (
          <>
            <SeccionHero
              busqueda={busqueda}
              alCambiarBusqueda={setBusqueda}
              alBuscar={() => {
                const seccion = document.getElementById('catalogo-paquetes');
                seccion?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <CarruselZonas
              alSeleccionarZona={(zona) => {
                setBusqueda(zona);
              }}
            />

            <section id="catalogo-paquetes" style={{ padding: '2rem 0 4rem' }}>
              <div className="contenedor">
                <FiltrosBusqueda
                  categoriaSeleccionada={categoriaSeleccionada}
                  alCambiarCategoria={setCategoriaSeleccionada}
                  totalResultados={paquetesFiltrados.length}
                />

                {cargandoPaquetes ? (
                  <Cargando mensaje="Cargando experiencias turísticas..." />
                ) : (
                  <CuadriculaPaquetes
                    paquetes={paquetesFiltrados}
                    alVerDetalles={abrirDetallesPaquete}
                    alReservar={abrirReservaPaquete}
                    alLimpiarFiltros={() => {
                      setBusqueda('');
                      setCategoriaSeleccionada('todos');
                    }}
                  />
                )}
              </div>
            </section>

            <SeccionBeneficios />

            <SeccionPrestadores
              alRegistrarPrestador={(tipo) => {
                abrirModalAutenticacion('registro');
              }}
            />
          </>
        ) : (
          /* Vista de Panel según Rol */
          <div>
            {esAgencia && <PanelAgencia />}
            {esGuia && <PanelGuia />}
            {esAdministrador && <PanelAdministrador />}
            {!esAgencia && !esGuia && !esAdministrador && (
              <div style={{ padding: '3rem 0 5rem' }}>
                <div className="contenedor contenedor-estrecho">
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid var(--borde-sutil)',
                      boxShadow: 'var(--sombra-media)',
                      padding: '2.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primario-claro)',
                        color: 'var(--color-primario)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                      }}
                    >
                      <Sparkles size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)' }}>
                      ¡Hola, {usuarioActual?.nombreCompleto || 'Viajero'}!
                    </h2>
                    <p style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                      Bienvenido a tu panel de experiencias turísticas en Bogotá. Explora el catálogo y disfruta de recorridos certificados con agencias y guías con RNT.
                    </p>
                    <button
                      onClick={() => setVistaActual('inicio')}
                      className="boton boton-primario"
                      style={{ padding: '0.85rem 1.75rem' }}
                    >
                      Explorar Paquetes Disponibles
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PiePagina />

      {/* Modales Globales */}
      <ModalAutenticacion
        abierto={modalAutenticacionAbierto}
        alCerrar={() => setModalAutenticacionAbierto(false)}
        modoInicial={modoAutenticacionInicial}
      />

      {paqueteSeleccionado && (
        <>
          <ModalDetallePaquete
            paquete={paqueteSeleccionado}
            abierto={modalDetallesAbierto}
            alCerrar={() => setModalDetallesAbierto(false)}
            alReservar={abrirReservaPaquete}
          />

          <ModalReserva
            paquete={paqueteSeleccionado}
            abierto={modalReservaAbierto}
            alCerrar={() => setModalReservaAbierto(false)}
          />
        </>
      )}
    </>
  );
};
