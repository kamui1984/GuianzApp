if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
const $ = (selector) => document.querySelector(selector);
const showMessage = (text, error = false) => { $('#message').textContent = text; $('#message').hidden = !text; $('#message').classList.toggle('error', error); };
const getToken = () => localStorage.getItem('guianz_token');
const request = async (url, options = {}) => { const headers = { ...(options.headers || {}) }; if (getToken()) headers.Authorization = `Bearer ${getToken()}`; const response = await fetch(url, { ...options, headers }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación'); return data; };
let currentUser = null;
let packageList = [];
function showApp(user) { currentUser = user; $('#auth-view').hidden = true; $('#app-view').hidden = false; $('#welcome').textContent = user.agencyName; $('#status-label').textContent = user.status === 'approved' ? 'Agencia aprobada' : 'Registro en revisión'; $('#status-copy').textContent = user.status === 'approved' ? 'Tu agencia puede operar en GuianzApp.' : 'Validaremos tu RNT y te avisaremos cuando esté listo.'; loadPackages(); }
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
      ${images.length ? images.map((file) => `<img src="${file.url}" alt="${packageItem.title}">`).join('') : '<div class="detail-empty">No hay imágenes cargadas para este tour.</div>'}
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
async function loadPackages() { const { packages } = await request('/api/packages'); packageList = packages; $('#packages').innerHTML = packages.length ? packages.map((item) => `<article class="package ${currentUser?.status === 'approved' ? 'package-card' : ''}" data-package-id="${item.id}" aria-label="${item.title}"><div><h3>${item.title}</h3><p>${item.description} · ${item.files.length} archivo(s)</p></div><span class="package-price">$${Number(item.price).toLocaleString('es-CO')}</span></article>`).join('') : '<p class="empty">Aún no tienes paquetes. Crea el primero para comenzar.</p>'; document.querySelectorAll('.package-card').forEach((card) => card.addEventListener('click', () => { const selected = packageList.find((item) => item.id === card.dataset.packageId); openPackageDetail(selected); })); }

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); $('#login-form').hidden = tab.dataset.target !== 'login-form'; $('#register-form').hidden = tab.dataset.target !== 'register-form'; showMessage(''); }));
$('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const data = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); localStorage.setItem('guianz_token', data.token); showApp(data.user); showMessage(''); } catch (error) { showMessage(error.message, true); } });
$('#register-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const data = await request('/api/auth/register', { method: 'POST', body: new FormData(event.target) }); showMessage(data.message); event.target.reset(); } catch (error) { showMessage(error.message, true); } });
$('#new-package').addEventListener('click', () => { $('#package-form').hidden = false; $('#new-package').hidden = true; });
$('#cancel-package').addEventListener('click', () => { $('#package-form').hidden = true; $('#new-package').hidden = false; });
$('#package-form').addEventListener('submit', async (event) => { event.preventDefault(); try { await request('/api/packages', { method: 'POST', body: new FormData(event.target) }); event.target.reset(); $('#package-form').hidden = true; $('#new-package').hidden = false; showMessage('Paquete guardado como borrador.'); await loadPackages(); } catch (error) { showMessage(error.message, true); } });
$('#close-package-detail').addEventListener('click', closePackageDetail);
document.addEventListener('click', (event) => { if (event.target instanceof HTMLElement && event.target.dataset.closeDetail === 'true') closePackageDetail(); });
$('#logout').addEventListener('click', () => { localStorage.removeItem('guianz_token'); location.reload(); });
if (getToken()) request('/api/me').then(({ user }) => showApp(user)).catch(() => localStorage.removeItem('guianz_token'));
