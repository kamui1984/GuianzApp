if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const mostrarMensaje = (text, error = false) => {
  const messageEl = $('#app-shell').hidden ? $('#message') : $('#app-message');
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.hidden = !text;
    messageEl.classList.toggle('error', error);
    if (text) {
      setTimeout(() => {
        messageEl.hidden = true;
      }, 4500);
    }
  }
};

const obtenerToken = () => localStorage.getItem('guianz_token');

const solicitar = async (url, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (obtenerToken()) headers.Authorization = `Bearer ${obtenerToken()}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación');
  return data;
};

// Estado global
let usuarioActual = null;
let listaPaquetes = [];
let listaGuias = [];
let listaDisponibilidad = [];
let idPaqueteEnEdicion = null;
let idDisponibilidadEnEdicion = null;
const archivosEliminadosDelFormulario = new Set();

// Estado de Landing Page
let listaPaquetesLanding = [];
let filtroCategoriaLanding = 'all';
let busquedaLanding = '';

// Catálogo base de experiencias en Bogotá con agencias verificadas RNT
const PAQUETES_DESTACADOS_BOGOTA = [
  /*{
    id: 'dest-1',
    titulo: 'Bogotá Colonial & Secretos de La Candelaria',
    descripcion: 'Recorrido a pie por las calles históricas, plazas coloniales, el Chorro de Quevedo y degustación de chicha y café de origen. Guiado por historiadores y profesionales certificados.',
    precio: 55000,
    categoria: 'centro',
    zona: 'Candelaria',
    politicaCancelacion: 'Cancelación gratuita hasta 24 horas antes del tour.',
    nombreAgencia: 'Bogotá Andando S.A.S.',
    numeroRnt: '48920',
    rating: '4.9',
    duracion: '3.5 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80', nombre: 'candelaria.jpg' }
    ]
  },
  {
    id: 'dest-2',
    titulo: 'Sendero de los Cerros Orientales & Mirador Monserrate',
    descripcion: 'Ascenso ecológico por caminos reales de los cerros orientales con avistamiento de aves de alta montaña, historia indígena Muisca y vistas panorámicas de la sabana.',
    precio: 68000,
    categoria: 'naturaleza',
    zona: 'Monserrate',
    politicaCancelacion: 'Cancelación con 12h de anticipación.',
    nombreAgencia: 'Explora Cerros Bogotá',
    numeroRnt: '51230',
    rating: '5.0',
    duracion: '4 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?auto=format&fit=crop&w=800&q=80', nombre: 'cerros.jpg' }
    ]
  },
  {
    id: 'dest-3',
    titulo: 'Ruta del Café Especial Colombiano & Barismo',
    descripcion: 'Experiencia sensorial completa catando cafés de origen de Cundinamarca y Huila con baristas profesionales en los mejores tostadores artesanales de Usaquén y Chapinero.',
    precio: 85000,
    categoria: 'gastronomia',
    zona: 'Usaquén',
    politicaCancelacion: 'Cancelación flexible sin penalidad hasta 24 horas antes.',
    nombreAgencia: 'Origen Capital Coffee Tours',
    numeroRnt: '39481',
    rating: '4.9',
    duracion: '3 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80', nombre: 'cafe.jpg' }
    ]
  },
  {
    id: 'dest-4',
    titulo: 'Distrito Graffiti & Arte Urbano Capitalino',
    descripcion: 'Inmersión en el mayor museo al aire libre de arte urbano en Bogotá. Conoce la historia de los muralistas, las narrativas sociales y técnicas de stencil en Puente Aranda.',
    precio: 48000,
    categoria: 'arte',
    zona: 'Graffiti',
    politicaCancelacion: 'Cancelación gratuita hasta 24h antes.',
    nombreAgencia: 'Street Art Bogotá Collective',
    numeroRnt: '60192',
    rating: '4.8',
    duracion: '2.5 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', nombre: 'graffiti.jpg' }
    ]
  },
  {
    id: 'dest-5',
    titulo: 'Bicitour Sabana & Cerros Orientales',
    descripcion: 'Ruta cicloturística guiada por la red de ciclorrutas de Bogotá y senderos periurbanos. Incluye bicicleta de montaña, casco, hidratación y guía bilingüe.',
    precio: 92000,
    categoria: 'bici',
    zona: 'Cerros',
    politicaCancelacion: 'Cancelación hasta 24 horas antes.',
    nombreAgencia: 'BiciBogotá Tours RNT',
    numeroRnt: '42391',
    rating: '4.9',
    duracion: '4.5 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=800&q=80', nombre: 'bici.jpg' }
    ]
  },
  {
    id: 'dest-6',
    titulo: 'Tour Gastronómico Plaza Paloquemao Tradicional',
    descripcion: 'Degustación de frutas exóticas colombianas, amasijos típicos, lechona, ajiaco santafereño y flores en la plaza de mercado más emblemática de Bogotá.',
    precio: 72000,
    categoria: 'gastronomia',
    zona: 'Paloquemao',
    politicaCancelacion: 'Cancelación flexible con 24h de anticipación.',
    nombreAgencia: 'Sabores y Tradiciones Capitalinas',
    numeroRnt: '53180',
    rating: '5.0',
    duracion: '3 horas',
    archivos: [
      { tipo: 'image/jpeg', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', nombre: 'gastronomia.jpg' }
    ]
 }*/
];
// =========================================================
// NAVEGACIÓN Y CONTROL DE VISTAS (LANDING, AUTH, APP)
// =========================================================
function mostrarLanding() {
  const landingEl = $('#landing-shell');
  const authEl = $('#auth-shell');
  const appEl = $('#app-shell');
  if (landingEl) landingEl.hidden = false;
  if (authEl) authEl.hidden = true;
  if (appEl) appEl.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cargarPaquetesLanding();
}

function mostrarAuth(tabDestino = 'login-form') {
  const landingEl = $('#landing-shell');
  const authEl = $('#auth-shell');
  const appEl = $('#app-shell');
  if (landingEl) landingEl.hidden = true;
  if (authEl) authEl.hidden = false;
  if (appEl) appEl.hidden = true;

  $$('.tabs .tab').forEach((tab) => {
    const coincide = tab.dataset.target === tabDestino;
    tab.classList.toggle('active', coincide);
  });
  $('#login-form').hidden = tabDestino !== 'login-form';
  $('#register-agency-form').hidden = tabDestino !== 'register-agency-form';
  $('#register-guide-form').hidden = tabDestino !== 'register-guide-form';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  mostrarMensaje('');
}

window.mostrarAuthTab = (tabDestino) => mostrarAuth(tabDestino);
window.filtrarLandingPorZona = (zona) => {
  busquedaLanding = zona;
  const searchInput = $('#landing-search-input');
  if (searchInput) searchInput.value = zona;
  filtroCategoriaLanding = 'all';
  $$('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
  const paquetesSec = $('#paquetes-destacados');
  if (paquetesSec) paquetesSec.scrollIntoView({ behavior: 'smooth' });
  renderizarPaquetesLanding();
};

// =========================================================
// RENDERIZADO Y CONTROL DE VISTAS POR ROL
// =========================================================
function configurarVistaSegunRol(usuario) {
  const rol = usuario.rol || 'agencia';

  $$('.sidebar-vista').forEach((side) => {
    const coincide = side.dataset.rol === rol;
    side.classList.toggle('activa', coincide);
    side.hidden = !coincide;
  });

  $$('.vista').forEach((view) => {
    const coincide = view.dataset.rol === rol;
    view.classList.toggle('activa', coincide);
    view.hidden = !coincide;
  });

  const nombre = usuario.nombreAgencia || usuario.nombreCompleto || usuario.correo || 'Usuario';
  let rolLabel = 'Agencia';
  if (rol === 'guia') rolLabel = 'Guía de turismo';
  else if (rol === 'administrador') rolLabel = 'Administrador';
  else if (rol === 'turista') rolLabel = 'Turista';

  const iniciales = (nombre.split(' ').map(w => w[0]).slice(0, 2).join('') || 'GU').toUpperCase();

  $('#nombre-usuario').textContent = nombre;
  $('#rol-usuario').textContent = rolLabel;
  $('#avatar-usuario').textContent = iniciales;
  $('#logged-role-label').textContent = `Panel de ${rolLabel}`;

  if (rol === 'agencia') {
    actualizarBannerEstadoAgencia(usuario.estado);
    cargarPaquetesAgencia();
    cargarGuiasEnPlataforma();
  } else if (rol === 'guia') {
    cargarPerfilGuia();
    cargarDisponibilidadGuia();
  } else if (rol === 'administrador') {
    cargarColaAdministracion();
  } else if (rol === 'turista') {
    cargarExplorarTurista();
  }
}

function cambiarSubvista(targetSubvistaId) {
  const vistaActiva = $('.vista.activa');
  if (!vistaActiva) return;

  vistaActiva.querySelectorAll('.subvista').forEach((sub) => {
    sub.classList.remove('activa');
    sub.hidden = true;
  });

  const target = $(`#${targetSubvistaId}`);
  if (target) {
    target.classList.add('activa');
    target.hidden = false;
  }

  const sidebarActivo = $('.sidebar-vista.activa');
  if (sidebarActivo) {
    sidebarActivo.querySelectorAll('a.item').forEach((item) => {
      item.classList.toggle('activo', item.dataset.targetSubview === targetSubvistaId);
    });
  }
}

$$('.sidebar a.item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (link.dataset.targetSubview) {
      cambiarSubvista(link.dataset.targetSubview);
    }
  });
});

// =========================================================
// 1. MÓDULO AGENCIA
// =========================================================
function actualizarBannerEstadoAgencia(estado) {
  const dot = $('#agency-status-dot');
  const label = $('#agency-status-label');
  const copy = $('#agency-status-copy');
  const btnCrear = $('#btn-abrir-modal-paquete');

  if (estado === 'aprobado') {
    dot.style.background = 'var(--verde-cerros)';
    label.textContent = 'Perfil Aprobado y Autorizado';
    copy.textContent = 'Tu agencia cuenta con validación de RNT activa y puede crear y publicar paquetes turísticos.';
    if (btnCrear) btnCrear.disabled = false;
  } else if (estado === 'rechazado') {
    dot.style.background = 'var(--rojo-error)';
    label.textContent = 'Documentación Rechazada';
    copy.textContent = 'Tu RNT no pudo ser validado. Contacta al administrador para más información.';
  } else {
    dot.style.background = 'var(--dorado-patrimonio)';
    label.textContent = 'Registro en Revisión';
    copy.textContent = 'Tu documentación RNT está en proceso de validación administrativa. Te notificaremos cuando esté lista.';
  }
}

async function cargarPaquetesAgencia() {
  const tbody = $('#lista-tabla-paquetes');
  tbody.innerHTML = '<tr><td colspan="6" class="empty" style="text-align:center; padding:24px;">Cargando paquetes...</td></tr>';

  try {
    const data = await solicitar('/api/paquetes');
    listaPaquetes = data.paquetes || [];
    $('#metric-paquetes-count').textContent = listaPaquetes.length;

    if (!listaPaquetes.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty" style="text-align:center; padding:32px;">No has creado ningún paquete aún. Haz clic en <strong>+ Crear paquete</strong>.</td></tr>';
      return;
    }

    tbody.innerHTML = listaPaquetes.map((p) => {
      const fecha = p.creadoEn ? new Date(p.creadoEn).toLocaleDateString('es-CO') : 'Reciente';
      const numArchivos = (p.archivos || []).length;
      return `
        <tr>
          <td>
            <strong>${p.titulo}</strong>
            <p style="font-size:12px; color:var(--gris-piedra); max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.descripcion}</p>
          </td>
          <td><strong>$${Number(p.precio || 0).toLocaleString('es-CO')}</strong> COP</td>
          <td><span class="chip">${numArchivos} adjunto${numArchivos === 1 ? '' : 's'}</span></td>
          <td><span class="etiqueta etiqueta-dorado">${p.estado || 'borrador'}</span></td>
          <td style="color:var(--gris-piedra); font-size:13px;">${fecha}</td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-texto btn-sm" data-action="detail" data-id="${p.id}" title="Ver detalle">Ver</button>
            <button class="btn btn-texto btn-sm" data-action="edit" data-id="${p.id}" title="Editar">Editar</button>
            <button class="btn btn-texto btn-sm" style="color:var(--rojo-error);" data-action="delete" data-id="${p.id}" title="Eliminar">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="message error">${error.message}</td></tr>`;
  }
}

async function cargarGuiasEnPlataforma() {
  const container = $('#directorio-guias-agencia');
  container.innerHTML = '<p class="empty">Cargando guías...</p>';

  try {
    const data = await solicitar('/api/guias');
    listaGuias = data.guias || [];
    $('#metric-guias-count').textContent = listaGuias.length;

    if (!listaGuias.length) {
      container.innerHTML = '<p class="empty">No hay guías registrados en este momento.</p>';
      return;
    }

    container.innerHTML = listaGuias.map((g) => `
      <div class="tarjeta">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h3>${g.nombreCompleto}</h3>
            <span class="chip" style="margin-top:4px;">RNT: ${g.numeroRnt || 'En validación'}</span>
          </div>
          <span class="etiqueta ${g.estado === 'aprobado' ? 'etiqueta-verde' : 'etiqueta-dorado'}">${g.estado === 'aprobado' ? 'Verificado' : 'En revisión'}</span>
        </div>
        <div style="margin-bottom:12px;">
          <small style="color:var(--gris-piedra); font-weight:600; display:block; margin-bottom:4px;">Especialidades:</small>
          <div class="chips-fila">${(g.especialidades || '').split(',').map(s => `<span class="chip">${s.trim()}</span>`).join('')}</div>
        </div>
        <div>
          <small style="color:var(--gris-piedra); font-weight:600; display:block; margin-bottom:4px;">Idiomas:</small>
          <div class="chips-fila">${(g.idiomas || '').split(',').map(i => `<span class="chip">${i.trim()}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

function abrirModalPaquete(modo = 'crear', paquete = null) {
  const modal = $('#overlay-paquete');
  const form = $('#form-modal-paquete');
  const titulo = $('#modal-paquete-titulo');
  const submitBtn = $('#btn-submit-modal-paquete');
  const preview = $('#modal-preview-archivos');

  form.reset();
  preview.innerHTML = '';
  archivosEliminadosDelFormulario.clear();

  if (modo === 'editar' && paquete) {
    idPaqueteEnEdicion = paquete.id;
    titulo.textContent = 'Editar paquete turístico';
    submitBtn.textContent = 'Guardar cambios';

    form.titulo.value = paquete.titulo || '';
    form.descripcion.value = paquete.descripcion || '';
    form.precio.value = paquete.precio || '';
    form.politicaCancelacion.value = paquete.politicaCancelacion || '';

    if (paquete.archivos && paquete.archivos.length) {
      preview.innerHTML = paquete.archivos.map(archivo => `
        <div class="form-preview-thumb" id="thumb-${archivo.id}">
          <img src="${archivo.url}" alt="${archivo.nombre}">
          <button type="button" class="chip-remove" data-remove-file-id="${archivo.id}" title="Quitar archivo">✕</button>
        </div>
      `).join('');
    }
  } else {
    idPaqueteEnEdicion = null;
    titulo.textContent = 'Nuevo paquete turístico';
    submitBtn.innerHTML = 'Guardar paquete <span>→</span>';
  }

  modal.classList.add('activo');
}

function cerrarModalPaquete() {
  $('#overlay-paquete').classList.remove('activo');
  idPaqueteEnEdicion = null;
  archivosEliminadosDelFormulario.clear();
}

$('#form-modal-paquete')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  if (archivosEliminadosDelFormulario.size > 0) {
    formData.append('removeFileIds', Array.from(archivosEliminadosDelFormulario).join(','));
  }

  try {
    if (idPaqueteEnEdicion) {
      await solicitar(`/api/paquetes/${idPaqueteEnEdicion}`, {
        method: 'PUT',
        body: formData
      });
      mostrarMensaje('Paquete actualizado correctamente.');
    } else {
      await solicitar('/api/paquetes', {
        method: 'POST',
        body: formData
      });
      mostrarMensaje('Paquete creado exitosamente.');
    }

    cerrarModalPaquete();
    await cargarPaquetesAgencia();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

// =========================================================
// 2. MÓDULO GUÍA
// =========================================================
async function cargarPerfilGuia() {
  try {
    const data = await solicitar('/api/guia/perfil');
    const p = data.perfil || {};

    const dot = $('#guide-status-dot');
    const label = $('#guide-status-label');
    const copy = $('#guide-status-copy');

    if (p.estado === 'aprobado') {
      dot.style.background = 'var(--verde-cerros)';
      label.textContent = 'Perfil Verificado y Activo';
      copy.textContent = 'Tu tarjeta profesional y RNT han sido validados. Las agencias pueden ver tu perfil y asignarte experiencias.';
    } else if (p.estado === 'rechazado') {
      dot.style.background = 'var(--rojo-error)';
      label.textContent = 'Perfil Rechazado';
      copy.textContent = 'Tu documentación no pudo ser verificada. Por favor revisa los documentos cargados.';
    } else {
      dot.style.background = 'var(--dorado-patrimonio)';
      label.textContent = 'Documentación en Revisión';
      copy.textContent = 'Tu tarjeta profesional y RNT están siendo verificados por la administración.';
    }

    const nombre = p.nombreCompleto || 'Guía de Turismo';
    $('#guide-name-display').textContent = nombre;
    $('#guide-avatar-badge').textContent = (nombre.split(' ').map(w => w[0]).slice(0, 2).join('') || 'GU').toUpperCase();

    const specContainer = $('#guide-specialties-chips');
    const specs = (p.especialidades || '').split(',').map(s => s.trim()).filter(Boolean);
    specContainer.innerHTML = specs.length
      ? specs.map(s => `<span class="chip">${s}</span>`).join('')
      : '<span class="empty">Sin especialidades registradas</span>';

    const langContainer = $('#guide-languages-list');
    const langs = (p.idiomas || '').split(',').map(l => l.trim()).filter(Boolean);
    langContainer.innerHTML = langs.length
      ? langs.map(l => `<span class="chip">${l}</span>`).join('')
      : '<span class="empty">Sin idiomas registrados</span>';

    const docsContainer = $('#guide-docs-list');
    docsContainer.innerHTML = `
      ${p.urlDocumentoRnt ? `<a href="${p.urlDocumentoRnt}" target="_blank" rel="noreferrer" class="chip">📄 Documento RNT ↗</a>` : '<span class="empty">RNT no adjunto</span>'}
      ${p.urlTarjetaProfesional ? `<a href="${p.urlTarjetaProfesional}" target="_blank" rel="noreferrer" class="chip">🪪 Tarjeta Profesional ↗</a>` : '<span class="empty">Tarjeta profesional no adjunta</span>'}
    `;
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

async function cargarDisponibilidadGuia() {
  const tbody = $('#lista-disponibilidad-guia');
  tbody.innerHTML = '<tr><td colspan="5" class="empty" style="text-align:center; padding:20px;">Cargando disponibilidad...</td></tr>';

  try {
    const data = await solicitar('/api/guia/disponibilidad');
    listaDisponibilidad = data.disponibilidad || [];

    if (!listaDisponibilidad.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty" style="text-align:center; padding:24px;">No has registrado fechas u horarios disponibles aún.</td></tr>';
      return;
    }

    tbody.innerHTML = listaDisponibilidad.map((d) => `
      <tr>
        <td><strong>${d.fecha}</strong></td>
        <td>${d.horaInicio ? `${d.horaInicio} - ${d.horaFin || 'Fin de jornada'}` : 'Todo el día'}</td>
        <td><span class="etiqueta ${d.estaDisponible ? 'etiqueta-verde' : 'etiqueta-gris'}">${d.estaDisponible ? 'Disponible' : 'No disponible'}</span></td>
        <td style="color:var(--gris-piedra);">${d.notas || '—'}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-texto btn-sm" data-edit-disp-id="${d.id}">Editar</button>
          <button class="btn btn-texto btn-sm" style="color:var(--rojo-error);" data-remove-disp-id="${d.id}">✕</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="message error">${error.message}</td></tr>`;
  }
}

function cancelarEdicionDisponibilidad() {
  idDisponibilidadEnEdicion = null;
  const form = $('#form-guia-disponibilidad');
  if (form) form.reset();
  const titulo = $('#form-guia-disp-titulo');
  if (titulo) titulo.textContent = 'Registrar nueva fecha u horario';
  const btnSubmit = $('#btn-submit-guia-disp');
  if (btnSubmit) btnSubmit.textContent = '+ Agregar';
  const btnCancelar = $('#btn-cancelar-guia-disp');
  if (btnCancelar) btnCancelar.style.display = 'none';
}

$('#btn-cancelar-guia-disp')?.addEventListener('click', cancelarEdicionDisponibilidad);

$('#form-guia-disponibilidad')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    fecha: form.fecha.value,
    horaInicio: form.horaInicio.value,
    horaFin: form.horaFin.value,
    notas: form.notas.value,
    estaDisponible: true
  };

  try {
    if (idDisponibilidadEnEdicion) {
      await solicitar(`/api/guia/disponibilidad/${idDisponibilidadEnEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      mostrarMensaje('Disponibilidad actualizada.');
    } else {
      await solicitar('/api/guia/disponibilidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      mostrarMensaje('Fecha agregada con éxito.');
    }

    cancelarEdicionDisponibilidad();
    await cargarDisponibilidadGuia();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

// Modal Edición Perfil Guía
$('#btn-editar-perfil-guia')?.addEventListener('click', async () => {
  try {
    const data = await solicitar('/api/guia/perfil');
    const p = data.perfil || {};
    const form = $('#form-modal-perfil-guia');
    form.nombreCompleto.value = p.nombreCompleto || '';
    form.numeroRnt.value = p.numeroRnt || '';
    form.especialidades.value = p.especialidades || '';
    form.idiomas.value = p.idiomas || '';
    $('#overlay-editar-perfil-guia').classList.add('activo');
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

$('#btn-cerrar-modal-perfil')?.addEventListener('click', () => {
  $('#overlay-editar-perfil-guia').classList.remove('activo');
});
$('#btn-cancelar-modal-perfil')?.addEventListener('click', () => {
  $('#overlay-editar-perfil-guia').classList.remove('activo');
});

$('#form-modal-perfil-guia')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    nombreCompleto: form.nombreCompleto.value,
    numeroRnt: form.numeroRnt.value,
    especialidades: form.especialidades.value,
    idiomas: form.idiomas.value
  };

  try {
    await solicitar('/api/guia/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Perfil actualizado con éxito.');
    $('#overlay-editar-perfil-guia').classList.remove('activo');
    await cargarPerfilGuia();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

// =========================================================
// 3. MÓDULO TURISTA (PANEL)
// =========================================================
async function cargarExplorarTurista() {
  const gridPaquetes = $('#turista-paquetes-grid');
  const gridGuias = $('#turista-guias-grid');
  gridPaquetes.innerHTML = '<p class="empty">Cargando paquetes...</p>';

  try {
    const dataPaquetes = await solicitar('/api/explorar/paquetes');
    const paquetes = dataPaquetes.paquetes || [];

    if (!paquetes.length) {
      gridPaquetes.innerHTML = '<p class="empty">No hay paquetes publicados actualmente.</p>';
    } else {
      gridPaquetes.innerHTML = paquetes.map((p) => `
        <div class="tarjeta" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span class="eyebrow-tag" style="margin-bottom:6px; display:inline-block;">PAQUETE DESTACADO</span>
            <h3>${p.titulo}</h3>
            <p style="font-size:13.5px; color:var(--gris-piedra); margin:8px 0 14px; line-height:1.4;">${p.descripcion}</p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:12px; border-top:1px solid var(--gris-niebla);">
            <strong>$${Number(p.precio || 0).toLocaleString('es-CO')} COP</strong>
            <button class="btn btn-primario btn-sm" onclick='abrirDetallePaquete(${JSON.stringify(p)})'>Ver detalle</button>
          </div>
        </div>
      `).join('');
    }

    const dataGuias = await solicitar('/api/guias');
    const guias = dataGuias.guias || [];

    if (!guias.length) {
      gridGuias.innerHTML = '<p class="empty">No hay guías disponibles.</p>';
    } else {
      gridGuias.innerHTML = guias.map((g) => `
        <div class="tarjeta">
          <span class="etiqueta etiqueta-verde" style="margin-bottom:8px;">✓ Guía RNT</span>
          <h3>${g.nombreCompleto}</h3>
          <p style="font-size:12.5px; color:var(--gris-piedra); margin:6px 0 10px;">${g.especialidades || 'Turismo general'}</p>
          <small style="color:var(--carbon); font-weight:600;">Idiomas: ${g.idiomas || 'Español'}</small>
        </div>
      `).join('');
    }
  } catch (error) {
    gridPaquetes.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

// =========================================================
// 4. MÓDULO ADMINISTRACIÓN
// =========================================================
async function cargarColaAdministracion() {
  const queue = $('#admin-queue');
  queue.innerHTML = '<p class="empty">Cargando perfiles pendientes...</p>';

  try {
    const data = await solicitar('/api/administracion/cola');
    const perfiles = data.perfiles || [];

    if (!perfiles.length) {
      queue.innerHTML = '<p class="empty" style="padding:24px 0;">No hay registros pendientes por validar.</p>';
      return;
    }

    queue.innerHTML = perfiles.map((p) => `
      <article class="admin-item">
        <div>
          <span class="eyebrow-tag">${p.rol === 'agencia' ? 'AGENCIA DE VIAJES' : 'GUÍA PROFESIONAL'}</span>
          <h3 style="margin-top:4px;">${p.nombreAgencia || p.nombreCompleto || 'Sin nombre'}</h3>
          <p>RNT: ${p.numeroRnt || 'Sin RNT registrado'}</p>
          <div style="margin-top:8px; display:flex; gap:12px; font-size:13px;">
            ${p.urlDocumentoRnt ? `<a href="${p.urlDocumentoRnt}" target="_blank" rel="noreferrer">📄 Documento RNT ↗</a>` : ''}
            ${p.urlTarjetaProfesional ? `<a href="${p.urlTarjetaProfesional}" target="_blank" rel="noreferrer">🪪 Tarjeta Profesional ↗</a>` : ''}
          </div>
        </div>
        <div class="admin-actions">
          <button type="button" class="btn btn-primario btn-sm" data-admin-action="approve" data-admin-id="${p.id}">Aprobar perfil</button>
          <button type="button" class="btn btn-outline btn-sm" style="color:var(--rojo-error);" data-admin-action="reject" data-admin-id="${p.id}">Rechazar</button>
        </div>
      </article>
    `).join('');
  } catch (error) {
    queue.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

// =========================================================
// MÓDULO LANDING PAGE PÚBLICA (DESPEGAR / BRAND_V2)
// =========================================================
async function cargarPaquetesLanding() {
  const grid = $('#landing-paquetes-grid');
  const countBadge = $('#landing-packages-count-badge');
  if (!grid) return;

  try {
    const data = await solicitar('/api/explorar/paquetes').catch(() => ({ paquetes: [] }));
    const paquetesRemotos = (data.paquetes || []).map((pkg, idx) => ({
      ...pkg,
      categoria: pkg.categoria || (idx % 2 === 0 ? 'centro' : 'naturaleza'),
      zona: pkg.zona || 'Bogotá',
      nombreAgencia: pkg.nombreAgencia || pkg.agencyName || 'Agencia Operadora',
      numeroRnt: pkg.numeroRnt || 'Validado',
      rating: '5.0',
      duracion: 'Día completo'
    }));

    const idsRemotos = new Set(paquetesRemotos.map(p => String(p.id)));
    const destacadosFiltrados = PAQUETES_DESTACADOS_BOGOTA.filter(p => !idsRemotos.has(String(p.id)));
    listaPaquetesLanding = [...paquetesRemotos, ...destacadosFiltrados];

    renderizarPaquetesLanding();
  } catch (error) {
    listaPaquetesLanding = [...PAQUETES_DESTACADOS_BOGOTA];
    renderizarPaquetesLanding();
  }
}

function renderizarPaquetesLanding() {
  const grid = $('#landing-paquetes-grid');
  const countBadge = $('#landing-packages-count-badge');
  if (!grid) return;

  const query = (busquedaLanding || '').toLowerCase().trim();
  const categoria = filtroCategoriaLanding || 'all';

  const filtrados = listaPaquetesLanding.filter((pkg) => {
    const coincideCat = categoria === 'all' || pkg.categoria === categoria;
    const coincideTexto = !query ||
      (pkg.titulo || '').toLowerCase().includes(query) ||
      (pkg.descripcion || '').toLowerCase().includes(query) ||
      (pkg.zona || '').toLowerCase().includes(query) ||
      (pkg.nombreAgencia || '').toLowerCase().includes(query);
    return coincideCat && coincideTexto;
  });

  if (countBadge) {
    countBadge.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'experiencia encontrada' : 'experiencias encontradas'}`;
  }

  if (!filtrados.length) {
    grid.innerHTML = `
      <div class="landing-empty-state">
        <p style="font-size:16px; font-weight:600; color:var(--carbon); margin-bottom:8px;">No se encontraron paquetes para tu búsqueda</p>
        <p style="color:var(--gris-piedra); margin-bottom:16px;">Prueba buscando otra zona de Bogotá o seleccionando la categoría "Todos".</p>
        <button class="btn btn-outline" onclick="window.filtrarLandingPorZona('')">Restablecer filtros</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtrados.map((pkg) => {
    const files = pkg.archivos || [];
    const imagen = files.find(f => f.tipo && f.tipo.startsWith('image/'))?.url ||
                   (files[0]?.url) ||
                   'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80';

    const precioFormateado = Number(pkg.precio || 0).toLocaleString('es-CO');
    const agencia = pkg.nombreAgencia || 'Agencia Operadora';

    return `
      <article class="landing-package-card">
        <div class="landing-pkg-media">
          <img src="${imagen}" alt="${pkg.titulo}" class="landing-pkg-img" loading="lazy">
          <span class="landing-pkg-badge-agency">${agencia}</span>
          <span class="landing-pkg-badge-rnt">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            RNT Verificado
          </span>
        </div>
        <div class="landing-pkg-body">
          <div class="landing-pkg-rating">
            <span>⭐ ${pkg.rating || '4.9'}</span>
            <span style="color:var(--gris-piedra); font-weight:normal;">· Experiencia guiada</span>
          </div>
          <h3 class="landing-pkg-title">${pkg.titulo}</h3>
          <p class="landing-pkg-desc">${pkg.descripcion}</p>
          <div class="landing-pkg-features">
            <span class="landing-pkg-tag">📍 ${pkg.zona || 'Bogotá'}</span>
            ${pkg.duracion ? `<span class="landing-pkg-tag">⏱️ ${pkg.duracion}</span>` : ''}
            <span class="landing-pkg-tag">🛡️ Cancelación fácil</span>
          </div>
          <div class="landing-pkg-footer">
            <div class="landing-pkg-price-box">
              <span class="landing-pkg-price-label">Precio por persona</span>
              <div class="landing-pkg-price">$ ${precioFormateado} <small style="font-size:12px; font-weight:normal; color:var(--gris-piedra);">COP</small></div>
            </div>
            <button class="landing-pkg-btn" data-landing-pkg-id="${pkg.id}">Ver detalle <span>→</span></button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// =========================================================
// MODAL DETALLE DE PAQUETE
// =========================================================
function abrirDetallePaquete(paquete) {
  if (!paquete) return;
  const files = paquete.archivos || [];
  const images = files.filter(f => f.tipo && f.tipo.startsWith('image/'));
  const fallbackImg = images[0]?.url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80';

  const content = `
    <div class="detail-header">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="eyebrow-tag">PAQUETE TURÍSTICO BOGOTÁ</span>
          <span class="chip" style="background:var(--verde-cerros-tinte); color:var(--verde-cerros); font-weight:700;">✓ RNT Verificado</span>
        </div>
        <h2>${paquete.titulo}</h2>
        <p style="color:var(--gris-piedra); font-size:13.5px; margin-top:2px;">Operado por: <strong>${paquete.nombreAgencia || 'Agencia Certificada en Bogotá'}</strong></p>
      </div>
      <div class="detail-price">
        <small style="display:block; font-size:11px; color:var(--gris-piedra); font-weight:normal;">Tarifa en COP</small>
        $${Number(paquete.precio || 0).toLocaleString('es-CO')}
      </div>
    </div>
    <div class="detail-gallery">
      ${images.length ? images.map(img => `<div class="detail-gallery-item"><img src="${img.url}" alt="${paquete.titulo}"></div>`).join('') : `<div class="detail-gallery-item"><img src="${fallbackImg}" alt="${paquete.titulo}"></div>`}
    </div>
    <div class="detail-body">
      <h3 style="margin-bottom:8px;">Descripción de la experiencia</h3>
      <p style="font-size:15px; line-height:1.6; margin-bottom:18px; color:var(--carbon);">${paquete.descripcion}</p>
      
      <div class="detail-meta" style="background:var(--fondo-marfil); padding:14px 18px; border-radius:10px; border-left:4px solid var(--dorado-bogota); margin-bottom:16px;">
        <strong>Política de cancelación:</strong> ${paquete.politicaCancelacion || 'Cancelación estándar sin recargo hasta 24 horas antes del inicio de la experiencia.'}
      </div>

      ${files.length && files.some(f => !f.tipo || !f.tipo.startsWith('image/')) ? `
        <div style="margin-top:14px; font-size:13px;">
          <strong>Archivos y folletos adjuntos:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
            ${files.map(f => `<a href="${f.url}" target="_blank" rel="noreferrer" class="chip">${f.nombre || 'Ver archivo'} ↗</a>`).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-top:24px; padding-top:18px; border-top:1px solid var(--gris-niebla); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span style="font-size:12.5px; color:var(--gris-piedra); display:block;">¿Listo para vivir esta experiencia?</span>
          <strong style="color:var(--azul-andino);">Conexión directa con la agencia operadora</strong>
        </div>
        <button type="button" class="btn btn-primario" onclick="cerrarDetallePaquete(); mostrarAuthTab('login-form');">
          Reservar / Conectar con la agencia <span>→</span>
        </button>
      </div>
    </div>
  `;
  $('#package-detail-content').innerHTML = content;
  $('#package-detail').classList.remove('hidden');
}

function cerrarDetallePaquete() {
  $('#package-detail').classList.add('hidden');
  $('#package-detail-content').innerHTML = '';
}

// =========================================================
// EVENT LISTENERS GLOBALES
// =========================================================
document.addEventListener('click', async (event) => {
  const landingPkgBtn = event.target.closest('[data-landing-pkg-id]');
  if (landingPkgBtn) {
    const id = landingPkgBtn.dataset.landingPkgId;
    const pkg = listaPaquetesLanding.find(p => String(p.id) === String(id));
    if (pkg) abrirDetallePaquete(pkg);
    return;
  }

  const editDispBtn = event.target.closest('[data-edit-disp-id]');
  if (editDispBtn) {
    const id = editDispBtn.dataset.editDispId;
    const item = listaDisponibilidad.find((d) => String(d.id) === String(id));
    if (item) {
      idDisponibilidadEnEdicion = id;
      const form = $('#form-guia-disponibilidad');
      if (form) {
        form.fecha.value = item.fecha || '';
        form.horaInicio.value = item.horaInicio || '';
        form.horaFin.value = item.horaFin || '';
        form.notas.value = item.notas || '';
      }
      const titulo = $('#form-guia-disp-titulo');
      if (titulo) titulo.textContent = 'Editar fecha u horario de disponibilidad';
      const btnSubmit = $('#btn-submit-guia-disp');
      if (btnSubmit) btnSubmit.textContent = 'Guardar cambios';
      const btnCancelar = $('#btn-cancelar-guia-disp');
      if (btnCancelar) btnCancelar.style.display = 'inline-flex';

      $('#form-guia-disponibilidad')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const delDispBtn = event.target.closest('[data-remove-disp-id]');
  if (delDispBtn) {
    const id = delDispBtn.dataset.removeDispId;
    try {
      await solicitar(`/api/guia/disponibilidad/${id}`, { method: 'DELETE' });
      mostrarMensaje('Disponibilidad eliminada.');
      if (idDisponibilidadEnEdicion === id) {
        cancelarEdicionDisponibilidad();
      }
      await cargarDisponibilidadGuia();
    } catch (err) {
      mostrarMensaje(err.message, true);
    }
    return;
  }

  const removeFileBtn = event.target.closest('[data-remove-file-id]');
  if (removeFileBtn) {
    const fileId = removeFileBtn.dataset.removeFileId;
    archivosEliminadosDelFormulario.add(fileId);
    removeFileBtn.closest('.form-preview-thumb')?.remove();
    return;
  }

  const pkgActionBtn = event.target.closest('[data-action]');
  if (pkgActionBtn) {
    const action = pkgActionBtn.dataset.action;
    const id = pkgActionBtn.dataset.id;
    const pkg = listaPaquetes.find(p => String(p.id) === String(id));

    if (action === 'detail' && pkg) {
      abrirDetallePaquete(pkg);
    } else if (action === 'edit' && pkg) {
      abrirModalPaquete('editar', pkg);
    } else if (action === 'delete' && pkg) {
      if (confirm(`¿Eliminar definitivamente el paquete "${pkg.titulo}"?`)) {
        try {
          await solicitar(`/api/paquetes/${id}`, { method: 'DELETE' });
          mostrarMensaje('Paquete eliminado.');
          await cargarPaquetesAgencia();
        } catch (err) {
          mostrarMensaje(err.message, true);
        }
      }
    }
    return;
  }

  const adminBtn = event.target.closest('[data-admin-action]');
  if (adminBtn) {
    const action = adminBtn.dataset.adminAction;
    const id = adminBtn.dataset.adminId;
    try {
      await solicitar(`/api/administracion/perfiles/${id}/${action === 'approve' ? 'aprobar' : 'rechazar'}`, { method: 'POST' });
      mostrarMensaje(action === 'approve' ? 'Perfil aprobado con éxito.' : 'Perfil rechazado.');
      await cargarColaAdministracion();
    } catch (err) {
      mostrarMensaje(err.message, true);
    }
  }
});

// Botones de navegación en la Landing Page
$('#landing-btn-login')?.addEventListener('click', () => mostrarAuth('login-form'));
$('#landing-btn-register')?.addEventListener('click', () => mostrarAuth('register-agency-form'));
$('#landing-logo-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarLanding();
});
$('#btn-volver-landing')?.addEventListener('click', mostrarLanding);

// Carrusel rápido (Controles prev/next)
$('#btn-quick-prev')?.addEventListener('click', () => {
  const carousel = $('#landing-quick-carousel');
  if (carousel) carousel.scrollBy({ left: -280, behavior: 'smooth' });
});
$('#btn-quick-next')?.addEventListener('click', () => {
  const carousel = $('#landing-quick-carousel');
  if (carousel) carousel.scrollBy({ left: 280, behavior: 'smooth' });
});

// Buscador de la Landing
$('#landing-search-input')?.addEventListener('input', (e) => {
  busquedaLanding = e.target.value;
  renderizarPaquetesLanding();
});

// Filtros de categoría de la Landing
$$('.cat-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    $$('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filtroCategoriaLanding = pill.dataset.filter || 'all';
    renderizarPaquetesLanding();
  });
});

// Modales
$('#btn-abrir-modal-paquete')?.addEventListener('click', () => abrirModalPaquete('crear'));
$('#btn-cerrar-modal-paquete')?.addEventListener('click', cerrarModalPaquete);
$('#btn-cancelar-modal-paquete')?.addEventListener('click', cerrarModalPaquete);
$('#overlay-paquete')?.addEventListener('click', (e) => {
  if (e.target.id === 'overlay-paquete') cerrarModalPaquete();
});

$('#close-package-detail')?.addEventListener('click', cerrarDetallePaquete);
document.addEventListener('click', (e) => {
  if (e.target.dataset.closeDetail === 'true') cerrarDetallePaquete();
});

// Pestañas de Login / Registro
$$('.tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tabs .tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    $('#login-form').hidden = tab.dataset.target !== 'login-form';
    $('#register-agency-form').hidden = tab.dataset.target !== 'register-agency-form';
    $('#register-guide-form').hidden = tab.dataset.target !== 'register-guide-form';
    mostrarMensaje('');
  });
});

// =========================================================
// AUTENTICACIÓN (LOGIN, REGISTRO, LOGOUT)
// =========================================================
function mostrarAplicacion(usuario) {
  usuarioActual = usuario;
  $('#landing-shell').hidden = true;
  $('#auth-shell').hidden = true;
  $('#app-shell').hidden = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
  configurarVistaSegunRol(usuario);
}

$('#login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await solicitar('/api/autenticacion/inicio-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    });
    localStorage.setItem('guianz_token', data.token);
    mostrarAplicacion(data.usuario);
    mostrarMensaje('Sesión iniciada correctamente.');
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

$('#register-agency-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await solicitar('/api/autenticacion/registro', {
      method: 'POST',
      body: new FormData(e.target)
    });
    mostrarMensaje(data.mensaje);
    e.target.reset();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

$('#register-guide-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const specialties = Array.from(new Set(formData.getAll('specialties'))).join(', ');
    const languages = Array.from(new Set(formData.getAll('languages'))).join(', ');
    if (!specialties || !languages) {
      mostrarMensaje('Selecciona al menos una especialidad y un idioma', true);
      return;
    }
    formData.set('especialidades', specialties);
    formData.set('idiomas', languages);
    const data = await solicitar('/api/autenticacion/registro-guia', {
      method: 'POST',
      body: formData
    });
    mostrarMensaje(data.mensaje);
    e.target.reset();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

$('#logout')?.addEventListener('click', () => {
  localStorage.removeItem('guianz_token');
  usuarioActual = null;
  $('#app-shell').hidden = true;
  $('#auth-shell').hidden = true;
  $('#landing-shell').hidden = false;
  window.history.replaceState({}, document.title, window.location.pathname);
  mostrarLanding();
});

// Inicialización de la aplicación
if (obtenerToken()) {
  solicitar('/api/usuario')
    .then(({ usuario }) => {
      mostrarAplicacion(usuario);
    })
    .catch(() => {
      localStorage.removeItem('guianz_token');
      mostrarLanding();
    });
} else {
  mostrarLanding();
}
