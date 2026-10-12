import React, { useState } from 'react';
import {
  Tag,
  PlusCircle,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Layers,
  HelpCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Modal } from '../../comunes/Modal';

const MACRO_CATEGORIAS_BOGOTA = [
  'Historia, Patrimonio y Cultura Urbana',
  'Gastronomía, Estilo de Vida y Entretenimiento',
  'Naturaleza, Biodiversidad y Aventura',
  'Turismo Comunitario, Social y Rural'
];

export const TabEspecialidadesCategorias = ({
  especialidades,
  cargando,
  alCrear,
  alActualizar,
  alCambiarEstado
}) => {
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

  // Formulario de creación/edición
  const [categoriaMacro, setCategoriaMacro] = useState(MACRO_CATEGORIAS_BOGOTA[0]);
  const [subcategoria, setSubcategoria] = useState('');
  const [descripcionAyuda, setDescripcionAyuda] = useState('');
  const [icono, setIcono] = useState('🏛️');
  const [errorDuplicado, setErrorDuplicado] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Filtrado de catálogo
  const filtradas = especialidades.filter((esp) => {
    if (categoriaFiltro !== 'todos' && esp.categoria_macro !== categoriaFiltro) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const nombre = (esp.subcategoria || '').toLowerCase();
      const desc = (esp.descripcion_ayuda || '').toLowerCase();
      if (!nombre.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  const abrirModalCrear = () => {
    setCategoriaMacro(MACRO_CATEGORIAS_BOGOTA[0]);
    setSubcategoria('');
    setDescripcionAyuda('');
    setIcono('🏛️');
    setErrorDuplicado('');
    setModalCrearAbierto(true);
  };

  const abrirModalEditar = (esp) => {
    setEspecialidadSeleccionada(esp);
    setCategoriaMacro(esp.categoria_macro);
    setSubcategoria(esp.subcategoria);
    setDescripcionAyuda(esp.descripcion_ayuda || '');
    setIcono(esp.icono || '📍');
    setErrorDuplicado('');
    setModalEditarAbierto(true);
  };

  const validarDuplicado = (nombre, cat, idExcluir = null) => {
    const nombreNorm = nombre.trim().toLowerCase();
    const catNorm = cat.trim().toLowerCase();
    return especialidades.some(
      (e) =>
        (idExcluir ? String(e.id) !== String(idExcluir) : true) &&
        (e.subcategoria || '').trim().toLowerCase() === nombreNorm &&
        (e.categoria_macro || '').trim().toLowerCase() === catNorm
    );
  };

  const manejarGuardarCrear = async (e) => {
    e.preventDefault();
    setErrorDuplicado('');

    if (validarDuplicado(subcategoria, categoriaMacro)) {
      setErrorDuplicado(`Ya existe una especialidad registrada con el nombre "${subcategoria}" en esta macro categoría.`);
      return;
    }

    setGuardando(true);
    try {
      await alCrear({
        categoria_macro: categoriaMacro,
        subcategoria,
        descripcion_ayuda: descripcionAyuda,
        icono
      });
      setModalCrearAbierto(false);
    } catch (err) {
      setErrorDuplicado(err.message || 'Error al guardar la especialidad.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!especialidadSeleccionada) return;
    setErrorDuplicado('');

    if (validarDuplicado(subcategoria, categoriaMacro, especialidadSeleccionada.id)) {
      setErrorDuplicado(`Ya existe otra especialidad registrada con el nombre "${subcategoria}" en esta macro categoría.`);
      return;
    }

    setGuardando(true);
    try {
      await alActualizar(especialidadSeleccionada.id, {
        categoria_macro: categoriaMacro,
        subcategoria,
        descripcion_ayuda: descripcionAyuda,
        icono
      });
      setModalEditarAbierto(false);
    } catch (err) {
      setErrorDuplicado(err.message || 'Error al actualizar la especialidad.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="animar-aparicion" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Control Transversal */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--borde-sutil)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primario)', margin: 0 }}>
              Catálogo Transversal de Especialidades y Categorías
            </h3>
            <span
              style={{
                backgroundColor: 'var(--color-dorado-claro)',
                color: 'var(--color-advertencia)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px'
              }}
            >
              Prioridad Crítica
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--texto-secundario)' }}>
            Estructura única que enlaza los paquetes de las agencias con los perfiles certificados de los guías. Impide categorías libres o duplicadas.
          </p>
        </div>

        <button
          id="btn-crear-especialidad"
          onClick={abrirModalCrear}
          className="boton boton-primario"
          style={{ gap: '0.4rem', fontSize: '0.88rem' }}
        >
          <PlusCircle size={16} />
          <span>Nueva Especialidad</span>
        </button>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--borde-sutil)',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="var(--texto-atenuado)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar especialidad o palabras clave..."
            className="campo-formulario"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="campo-formulario"
          style={{ height: '38px', fontSize: '0.84rem', flex: '0 1 280px' }}
        >
          <option value="todos">Todas las macro categorías</option>
          {MACRO_CATEGORIAS_BOGOTA.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Especialidades */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={32} color="var(--color-primario)" style={{ animation: 'girar 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>Cargando catálogo maestro...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--borde-sutil)'
          }}
        >
          <Tag size={36} color="var(--texto-atenuado)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primario)' }}>
            No se encontraron especialidades con ese criterio
          </h4>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1rem'
          }}
        >
          {filtradas.map((esp) => (
            <div
              key={esp.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--borde-sutil)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: esp.activo ? 1 : 0.65,
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--color-primario)',
                      backgroundColor: 'var(--color-primario-claro)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px'
                    }}
                  >
                    {esp.categoria_macro}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                      backgroundColor: esp.activo ? 'var(--color-exito-fondo)' : 'var(--color-peligro-fondo)',
                      color: esp.activo ? 'var(--color-exito)' : 'var(--color-peligro)'
                    }}
                  >
                    {esp.activo ? 'Activa' : 'Desactivada'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.35rem' }}>{esp.icono || '📍'}</span>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--texto-principal)', margin: 0 }}>
                    {esp.subcategoria}
                  </h4>
                </div>

                {esp.descripcion_ayuda && (
                  <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: 'var(--texto-secundario)', lineHeight: 1.45 }}>
                    {esp.descripcion_ayuda}
                  </p>
                )}
              </div>

              {/* Acciones de la tarjeta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--borde-sutil)'
                }}
              >
                <button
                  onClick={() => alCambiarEstado(esp.id, !esp.activo)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: esp.activo ? 'var(--color-peligro)' : 'var(--color-exito)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {esp.activo ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{esp.activo ? 'Desactivar opción' : 'Activar opción'}</span>
                </button>

                <button
                  onClick={() => abrirModalEditar(esp)}
                  className="boton boton-contorno boton-pequeno"
                  style={{ gap: '0.3rem', fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                >
                  <Edit2 size={13} />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Crear Especialidad */}
      <Modal
        abierto={modalCrearAbierto}
        alCerrar={() => setModalCrearAbierto(false)}
        titulo="Crear Nueva Especialidad Transversal"
        anchoMaximo="520px"
      >
        <form onSubmit={manejarGuardarCrear}>
          {errorDuplicado && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-peligro-fondo)',
                border: '1px solid var(--color-peligro)',
                borderRadius: '8px',
                color: 'var(--color-peligro)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorDuplicado}</span>
            </div>
          )}

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Categoría Macro</span>
            </label>
            <select
              value={categoriaMacro}
              onChange={(e) => setCategoriaMacro(e.target.value)}
              className="campo-formulario"
              required
            >
              {MACRO_CATEGORIAS_BOGOTA.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Nombre de la Especialidad / Recorrido</span>
            </label>
            <input
              type="text"
              required
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              placeholder="Ej: Distrito Graffiti & Muralismo Social"
              className="campo-formulario"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Icono</span>
              </label>
              <input
                type="text"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                maxLength={4}
                className="campo-formulario"
                style={{ textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Descripción orientadora</span>
              </label>
              <input
                type="text"
                value={descripcionAyuda}
                onChange={(e) => setDescripcionAyuda(e.target.value)}
                placeholder="Ej: Recorridos por Puente Aranda y Calle 26."
                className="campo-formulario"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalCrearAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {guardando ? 'Guardando en catálogo...' : 'Crear Especialidad'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar Especialidad */}
      <Modal
        abierto={modalEditarAbierto}
        alCerrar={() => setModalEditarAbierto(false)}
        titulo="Editar Especialidad"
        anchoMaximo="520px"
      >
        <form onSubmit={manejarGuardarEdicion}>
          {errorDuplicado && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-peligro-fondo)',
                border: '1px solid var(--color-peligro)',
                borderRadius: '8px',
                color: 'var(--color-peligro)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorDuplicado}</span>
            </div>
          )}

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Categoría Macro</span>
            </label>
            <select
              value={categoriaMacro}
              onChange={(e) => setCategoriaMacro(e.target.value)}
              className="campo-formulario"
              required
            >
              {MACRO_CATEGORIAS_BOGOTA.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grupo-formulario">
            <label className="etiqueta-formulario">
              <span>Nombre de la Especialidad</span>
            </label>
            <input
              type="text"
              required
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              className="campo-formulario"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem' }}>
            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Icono</span>
              </label>
              <input
                type="text"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                maxLength={4}
                className="campo-formulario"
                style={{ textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>

            <div className="grupo-formulario">
              <label className="etiqueta-formulario">
                <span>Descripción orientadora</span>
              </label>
              <input
                type="text"
                value={descripcionAyuda}
                onChange={(e) => setDescripcionAyuda(e.target.value)}
                className="campo-formulario"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setModalEditarAbierto(false)}
              className="boton boton-contorno"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="boton boton-primario"
              style={{ flex: 2 }}
            >
              {guardando ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
