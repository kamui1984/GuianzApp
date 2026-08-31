if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
const $ = (selector) => document.querySelector(selector);
const showMessage = (text, error = false) => { const message = $('#message'); if (message) { message.textContent = text; message.hidden = !text; message.classList.toggle('error', error); } };
const getToken = () => localStorage.getItem('guianz_token');
const request = async (url, options = {}) => { const headers = { ...(options.headers || {}) }; if (getToken()) headers.Authorization = `Bearer ${getToken()}`; const response = await fetch(url, { ...options, headers }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación'); return data; };
let currentUser = null;
let packageList = [];
let currentEditingPackageId = null;
const packageFormRemovedFiles = new Set();

const canManagePackages = () => currentUser?.status === 'approved';
const isGuideRole = () => currentUser?.role === 'guide';
const isAdminRole = () => currentUser?.role === 'admin';

function resetPackageForm() {
  $('#package-form').reset();
  $('#package-form').hidden = true;
  $('#new-package').hidden = false;
  $('#package-form-preview').innerHTML = '';
  currentEditingPackageId = null;
  packageFormRemovedFiles.clear();
  $('#package-form-title').textContent = 'Nuevo paquete turístico';
  $('#package-form-submit').innerHTML = 'Guardar borrador <span>→</span>';
}

function renderPackageFormPreview(files = []) {
  const images = (files || []).filter((file) => file.type.startsWith('image/'));
  if (!images.length) {
    $('#package-form-preview').innerHTML = '<p class="form-preview-empty">No hay imágenes guardadas en este paquete.</p>';
    return;
  }

  $('#package-form-preview').innerHTML = images.map((file) => `
    <div class="form-preview-thumb">
      <img src="${file.url}" alt="${file.name}">
      <button type="button" class="chip-remove" data-remove-file-id="${file.id}" aria-label="Quitar ${file.name}">×</button>
    </div>
  `).join('');
}

function showPackageForm(mode = 'create', packageItem = null) {
  if (!canManagePackages()) {
    showMessage('Tu agencia está en revisión. Cuando esté aprobada podrás crear paquetes.', true);
    resetPackageForm();
    return;
  }

  $('#package-form').hidden = false;
  $('#new-package').hidden = true;
  packageFormRemovedFiles.clear();

  if (mode === 'edit' && packageItem) {
    currentEditingPackageId = packageItem.id;
    $('#package-form-title').textContent = 'Editar paquete turístico';
    $('#package-form-submit').innerHTML = 'Guardar cambios <span>→</span>';
    $('#package-form').querySelector('[name="title"]').value = packageItem.title || '';
    $('#package-form').querySelector('[name="price"]').value = packageItem.price || 0;
    $('#package-form').querySelector('[name="description"]').value = packageItem.description || '';
    $('#package-form').querySelector('[name="cancellationPolicy"]').value = packageItem.cancellationPolicy || '';
    renderPackageFormPreview(packageItem.files || []);
    return;
  }

  $('#package-form').reset();
  currentEditingPackageId = null;
  $('#package-form-title').textContent = 'Nuevo paquete turístico';
  $('#package-form-submit').innerHTML = 'Guardar borrador <span>→</span>';
  $('#package-form-preview').innerHTML = '<p class="form-preview-empty">Aún no hay imágenes agregadas.</p>';
}

function getPrimaryImage(item) { return (item.files || []).find((file) => file.type.startsWith('image/')) || null; }

function showApp(user) { currentUser = user; $('#auth-view').hidden = true; $('#app-view').hidden = false; const displayName = user.agencyName || user.fullName || user.name || 'Perfil'; $('#welcome').textContent = displayName; const isApproved = user.status === 'approved'; $('#status-label').textContent = isApproved ? 'Perfil aprobado' : 'Registro en revisión'; $('#status-copy').textContent = isApproved ? 'Tu perfil puede operar en GuianzApp.' : 'Validaremos tu documentación y te avisaremos cuando esté listo.'; $('#guide-profile').hidden = !isGuideRole(); $('#agency-packages').hidden = isGuideRole() || isAdminRole(); $('#admin-panel').hidden = !isAdminRole(); $('#new-package').hidden = !canManagePackages(); if (!canManagePackages()) resetPackageForm(); if (user.role === 'agency') loadPackages(); if (user.role === 'guide') loadGuideProfile(); if (user.role === 'admin') loadAdminQueue(); }
function closePackageDetail() { $('#package-detail').classList.add('hidden'); $('#package-detail-content').innerHTML = ''; }
function openPackageDetail(packageItem) { if (!packageItem || currentUser?.status !== 'approved') return; const files = packageItem.files || []; const images = files.filter((file) => file.type.startsWith('image/')); const content = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">TOUR</p>
        <h3>${packageItem.title}</h3>
      </div>
      <span class="package-price detail-price">$${Number(packageItem.price).toLocaleString('es-CO')}</span>
    </div>
    <div class="detail-gallery">
      ${images.length ? images.map((file) => `<div class="detail-gallery-item"><img src="${file.url}" alt="${packageItem.title}"></div>`).join('') : '<div class="detail-empty">No hay imágenes cargadas para este tour.</div>'}
    </div>
    <div class="detail-body">
      <p>${packageItem.description}</p>
      <div class="detail-meta">
        <span><strong>Cancelación:</strong> ${packageItem.cancellationPolicy || 'Sin política registrada'}</span>
      </div>
      ${files.length ? `<div class="detail-files"><strong>Archivos adjuntos:</strong>${files.map((file) => `<a href="${file.url}" target="_blank" rel="noreferrer">${file.name}</a>`).join('')}</div>` : ''}
    </div>
  `;
  $('#package-detail-content').innerHTML = content;
  $('#package-detail').classList.remove('hidden'); }

async function loadPackages() {
  const { packages } = await request('/api/packages');
  packageList = packages;
  $('#packages').innerHTML = packages.length ? packages.map((item) => {
    const primaryImage = getPrimaryImage(item);
    return `
      <article class="package package-card" data-package-id="${item.id}" aria-label="${item.title}">
        <div class="package-card-main">
          <div class="package-thumb">${primaryImage ? `<img src="${primaryImage.url}" alt="${item.title}">` : '<span>Sin imagen</span>'}</div>
          <div class="package-copy">
            <h3>${item.title}</h3>
            <p>${item.description} · ${item.files.length} archivo(s)</p>
          </div>
        </div>
        <div class="package-side">
          <span class="package-price">$${Number(item.price).toLocaleString('es-CO')}</span>
          <div class="package-actions">
            <button type="button" class="text-button package-action" data-package-action="edit" data-package-id="${item.id}">Editar</button>
            <button type="button" class="text-button package-action danger" data-package-action="delete" data-package-id="${item.id}">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join('') : '<p class="empty">Aún no tienes paquetes. Crea el primero para comenzar.</p>';

  document.querySelectorAll('.package-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('.package-action')) return;
      const selected = packageList.find((item) => item.id === card.dataset.packageId);
      openPackageDetail(selected);
    });
  });
}

async function loadGuideProfile() {
  try {
    const { profile } = await request('/api/guide/profile');
    $('#guide-name').textContent = profile.fullName || 'Guía sin nombre';
    $('#guide-specialties').textContent = `Especialidades: ${profile.specialties || 'Sin especialidades registradas'}`;
    $('#guide-languages').textContent = `Idiomas: ${profile.languages || 'Sin idiomas registrados'}`;
    const { availability = [] } = await request('/api/guide/availability');
    $('#guide-availability-list').innerHTML = availability.length ? availability.map((item) => `
      <div class="availability-item">
        <span>${item.date}</span>
        <span>${item.isAvailable ? 'Disponible' : 'No disponible'}</span>
        <span>${item.startTime || '--'} - ${item.endTime || '--'}</span>
        <button type="button" class="text-button danger" data-remove-availability="${item.id}">Eliminar</button>
      </div>
    `).join('') : '<p class="empty">Aún no registras disponibilidad.</p>';
  } catch (error) {
    $('#guide-availability-list').innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

async function loadAdminQueue() {
  try {
    const { profiles = [] } = await request('/api/admin/queue');
    $('#admin-queue').innerHTML = profiles.length ? profiles.map((profile) => `
      <article class="admin-item">
        <div>
          <p class="eyebrow">${profile.role === 'agency' ? 'AGENCIA' : 'GUÍA'}</p>
          <h3>${profile.agencyName || profile.fullName || 'Sin nombre'}</h3>
          <p>${profile.role === 'agency' ? `RNT: ${profile.rntNumber || 'Sin RNT'}` : `Especialidades: ${profile.specialties || 'Sin especialidades'}`}</p>
          <p>${profile.role === 'agency' ? 'Estado: pendiente de aprobación' : `Idiomas: ${profile.languages || 'Sin idiomas'}`}</p>
          ${profile.rntDocumentUrl ? `<a href="${profile.rntDocumentUrl}" target="_blank" rel="noreferrer">Ver documento RNT</a>` : ''}
          ${profile.professionalCardUrl ? `<a href="${profile.professionalCardUrl}" target="_blank" rel="noreferrer">Ver tarjeta profesional</a>` : ''}
        </div>
        <div class="admin-actions">
          <button type="button" class="secondary" data-admin-action="approve" data-admin-id="${profile.id}">Aprobar</button>
          <button type="button" class="text-button danger" data-admin-action="reject" data-admin-id="${profile.id}">Rechazar</button>
        </div>
      </article>
    `).join('') : '<p class="empty">No hay perfiles pendientes por revisar.</p>';
  } catch (error) {
    $('#admin-queue').innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

$('#guide-availability-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isGuideRole()) return;

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    date: formData.get('date'),
    startTime: formData.get('startTime') || '',
    endTime: formData.get('endTime') || '',
    isAvailable: formData.get('isAvailable') !== null,
    notes: formData.get('notes') || ''
  };

  try {
    await request('/api/guide/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    form.reset();
    await loadGuideProfile();
    showMessage('Disponibilidad guardada.');
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.addEventListener('click', (event) => {
  const adminAction = event.target.closest('[data-admin-action]');
  if (adminAction) {
    const action = adminAction.dataset.adminAction;
    const profileId = adminAction.dataset.adminId;
    request(`/api/admin/profiles/${profileId}/${action}`, { method: 'POST' })
      .then(async () => {
        showMessage(action === 'approve' ? 'Perfil aprobado.' : 'Perfil rechazado.');
        await loadAdminQueue();
      })
      .catch((error) => showMessage(error.message, true));
    return;
  }

  const deleteAvailabilityButton = event.target.closest('[data-remove-availability]');
  if (deleteAvailabilityButton) {
    const availabilityId = deleteAvailabilityButton.dataset.removeAvailability;
    request(`/api/guide/availability/${availabilityId}`, { method: 'DELETE' })
      .then(async () => {
        showMessage('Disponibilidad eliminada.');
        await loadGuideProfile();
      })
      .catch((error) => showMessage(error.message, true));
    return;
  }

  if (event.target instanceof HTMLElement && event.target.dataset.closeDetail === 'true') closePackageDetail();
  const removeButton = event.target.closest('[data-remove-file-id]');
  if (removeButton) {
    const fileId = removeButton.dataset.removeFileId;
    if (!fileId) return;
    packageFormRemovedFiles.add(fileId);
    const previewChip = removeButton.closest('.form-preview-thumb');
    if (previewChip) previewChip.remove();
  }

  const actionButton = event.target.closest('[data-package-action]');
  if (!actionButton) return;

  if (!canManagePackages()) {
    showMessage('Tu agencia está en revisión. Las acciones de paquete se habilitan cuando se apruebe el RNT.', true);
    return;
  }

  const packageId = actionButton.dataset.packageId;
  const action = actionButton.dataset.packageAction;
  const selectedPackage = packageList.find((item) => String(item.id) === String(packageId));

  if (action === 'edit' && selectedPackage) {
    showPackageForm('edit', selectedPackage);
    return;
  }

  if (action === 'delete' && selectedPackage) {
    const confirmed = window.confirm(`¿Eliminar el paquete “${selectedPackage.title}”?`);
    if (!confirmed) return;
    request(`/api/packages/${selectedPackage.id}`, { method: 'DELETE' })
      .then(() => {
        showMessage('Paquete eliminado.');
        resetPackageForm();
        return loadPackages();
      })
      .catch((error) => showMessage(error.message, true));
  }
});

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); $('#login-form').hidden = tab.dataset.target !== 'login-form'; $('#register-agency-form').hidden = tab.dataset.target !== 'register-agency-form'; $('#register-guide-form').hidden = tab.dataset.target !== 'register-guide-form'; showMessage(''); }));
$('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const data = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); localStorage.setItem('guianz_token', data.token); showApp(data.user); showMessage(''); } catch (error) { showMessage(error.message, true); } });
$('#register-agency-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const data = await request('/api/auth/register', { method: 'POST', body: new FormData(event.target) }); showMessage(data.message); event.target.reset(); } catch (error) { showMessage(error.message, true); } });
$('#register-guide-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const formData = new FormData(event.target); const specialties = Array.from(formData.getAll('specialties')).join(', '); const languages = Array.from(formData.getAll('languages')).join(', '); if (!specialties || !languages) { showMessage('Selecciona al menos una especialidad y un idioma', true); return; } formData.set('specialties', specialties); formData.set('languages', languages); const data = await request('/api/auth/register-guide', { method: 'POST', body: formData }); showMessage(data.message); event.target.reset(); } catch (error) { showMessage(error.message, true); } });
$('#new-package').addEventListener('click', () => showPackageForm('create'));
$('#cancel-package').addEventListener('click', resetPackageForm);
$('#package-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!canManagePackages()) {
    showMessage('Tu agencia está en revisión. No puedes crear o editar paquetes aún.', true);
    resetPackageForm();
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);

  if (currentEditingPackageId) {
    formData.append('removeFileIds', Array.from(packageFormRemovedFiles).join(','));
    try {
      const data = await request(`/api/packages/${currentEditingPackageId}`, { method: 'PUT', body: formData });
      form.reset();
      resetPackageForm();
      showMessage(data.message || 'Paquete actualizado.');
      await loadPackages();
    } catch (error) {
      showMessage(error.message, true);
    }
    return;
  }

  try {
    const data = await request('/api/packages', { method: 'POST', body: formData });
    form.reset();
    resetPackageForm();
    showMessage('Paquete guardado como borrador.');
    packageList = [...packageList, data.package];
    await loadPackages();
  } catch (error) {
    showMessage(error.message, true);
  }
});

$('#close-package-detail').addEventListener('click', closePackageDetail);
$('#logout').addEventListener('click', () => { localStorage.removeItem('guianz_token'); location.reload(); });
if (getToken()) request('/api/me').then(({ user }) => showApp(user)).catch(() => localStorage.removeItem('guianz_token'));
