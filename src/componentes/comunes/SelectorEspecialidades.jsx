import React, { useState, useEffect } from 'react';
import { servicioEspecialidades } from '../../api/especialidadesServicio';
import { Tag, Check, ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';

export const SelectorEspecialidades = ({
  seleccionadas = [],
  alCambiar,
  titulo = 'Especialidades Turísticas Requeridas',
  subtitulo = 'Selecciona las categorías y etiquetas que definirán el perfil de los guías candidatos recomendados.',
  modoCompacto = false
}) => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const cats = await servicioEspecialidades.obtenerPorCategorias();
        setCategorias(cats);
        // Abrir todas las categorías por defecto en creación
        const abiertasInicial = {};
        cats.forEach((c) => {
          abiertasInicial[c.nombre] = true;
        });
        setCategoriasAbiertas(abiertasInicial);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const alternarCategoria = (nombreCat) => {
    setCategoriasAbiertas((prev) => ({
      ...prev,
      [nombreCat]: !prev[nombreCat]
    }));
  };

  const alternarEspecialidad = (id) => {
    const idNum = Number(id);
    if (seleccionadas.includes(idNum)) {
      alCambiar(seleccionadas.filter((item) => item !== idNum));
    } else {
      alCambiar([...seleccionadas, idNum]);
    }
  };

  const seleccionarTodasDeCategoria = (categoria) => {
    const idsCategoria = categoria.especialidades.map((e) => e.id);
    const todasMarcadas = idsCategoria.every((id) => seleccionadas.includes(id));

    if (todasMarcadas) {
      alCambiar(seleccionadas.filter((id) => !idsCategoria.includes(id)));
    } else {
      const nuevoSet = new Set([...seleccionadas, ...idsCategoria]);
      alCambiar(Array.from(nuevoSet));
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>
        Cargando catálogo de especialidades...
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <label className="etiqueta-formulario" style={{ marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <Tag size={16} color="var(--color-primario)" />
            <span>{titulo}</span>
          </label>
          {subtitulo && (
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.82rem', margin: 0, maxWidth: '580px' }}>
              {subtitulo}
            </p>
          )}
        </div>
        <div
          style={{
            backgroundColor: seleccionadas.length > 0 ? 'var(--color-primario-claro)' : 'var(--fondo-secundario)',
            border: `1px solid ${seleccionadas.length > 0 ? 'var(--color-primario)' : 'var(--borde-sutil)'}`,
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: seleccionadas.length > 0 ? 'var(--color-primario)' : 'var(--texto-secundario)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Sparkles size={14} />
          <span>{seleccionadas.length} especialidad(es) marcada(s)</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categorias.map((categoria) => {
          const estaAbierta = categoriasAbiertas[categoria.nombre] !== false;
          const idsCat = categoria.especialidades.map((e) => e.id);
          const seleccionadasEnCat = idsCat.filter((id) => seleccionadas.includes(id)).length;
          const todasMarcadas = idsCat.length > 0 && seleccionadasEnCat === idsCat.length;

          return (
            <div
              key={categoria.nombre}
              style={{
                backgroundColor: 'var(--fondo-tarjeta)',
                border: '1px solid var(--borde-sutil)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Cabecera de Categoría Macro */}
              <div
                onClick={() => alternarCategoria(categoria.nombre)}
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: estaAbierta ? 'var(--color-primario-claro)' : 'var(--fondo-secundario)',
                  borderBottom: estaAbierta ? '1px solid var(--borde-sutil)' : 'none',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{categoria.icono}</span>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--texto-principal)' }}>
                      {categoria.nombre}
                    </strong>
                    {categoria.descripcion && (
                      <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--texto-secundario)' }}>
                        {categoria.descripcion}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {seleccionadasEnCat > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-primario)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px'
                      }}
                    >
                      {seleccionadasEnCat} / {idsCat.length}
                    </span>
                  )}
                  {estaAbierta ? <ChevronUp size={18} color="var(--texto-secundario)" /> : <ChevronDown size={18} color="var(--texto-secundario)" />}
                </div>
              </div>

              {/* Subcategorías / Etiquetas */}
              {estaAbierta && (
                <div style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => seleccionarTodasDeCategoria(categoria)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primario)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {todasMarcadas ? 'Desmarcar todas en esta categoría' : 'Marcar todas en esta categoría'}
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: modoCompacto ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '0.6rem'
                    }}
                  >
                    {categoria.especialidades.map((esp) => {
                      const marcada = seleccionadas.includes(esp.id);

                      return (
                        <div
                          key={esp.id}
                          onClick={() => alternarEspecialidad(esp.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.65rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: marcada ? 'var(--color-primario-claro)' : 'var(--fondo-secundario)',
                            border: `1.5px solid ${marcada ? 'var(--color-primario)' : 'var(--borde-sutil)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              marginTop: '2px',
                              backgroundColor: marcada ? 'var(--color-primario)' : '#FFFFFF',
                              border: `1.5px solid ${marcada ? 'var(--color-primario)' : 'var(--texto-secundario)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {marcada && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                          </div>

                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: marcada ? 700 : 500,
                                color: marcada ? 'var(--color-primario)' : 'var(--texto-principal)',
                                display: 'block',
                                lineHeight: '1.25'
                              }}
                            >
                              {esp.subcategoria}
                            </span>
                            {esp.descripcion_ayuda && (
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--texto-secundario)',
                                  display: 'block',
                                  marginTop: '0.2rem',
                                  lineHeight: '1.2'
                                }}
                              >
                                {esp.descripcion_ayuda}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
