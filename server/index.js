const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Configura SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en .env');
}

const app = express();
const port = process.env.PORT || 3000;
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 10 }, fileFilter: (req, file, callback) => callback(null, /^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.mimetype)) });
const signedUrl = async (bucket, storagePath) => {
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
};
const publicUser = (authUser, profile) => ({
  id: authUser.id,
  email: authUser.email,
  role: profile.role,
  agencyName: profile.agency_name || profile.full_name || '',
  fullName: profile.full_name || '',
  rntNumber: profile.rnt_number,
  status: profile.status,
  createdAt: profile.created_at
});

const serializePackageItem = async (item) => {
  const files = await Promise.all((item.package_files || []).map(async (file) => ({
    id: file.id,
    name: file.original_name,
    url: await signedUrl('package-files', file.storage_path),
    type: file.mime_type,
    storagePath: file.storage_path
  })));

  return {
    id: item.id,
    agencyId: item.agency_id,
    title: item.title,
    description: item.description,
    price: item.price,
    cancellationPolicy: item.cancellation_policy || '',
    status: item.status,
    createdAt: item.created_at,
    files
  };
};

const serializeGuideAvailability = (item) => ({
  id: item.id,
  guideId: item.guide_id,
  date: item.available_date,
  startTime: item.start_time,
  endTime: item.end_time,
  isAvailable: item.is_available,
  notes: item.notes || ''
});

const serializeReviewProfile = async (profile) => {
  const rntDocumentUrl = profile.rnt_document_path ? await signedUrl('rnt-documents', profile.rnt_document_path).catch(() => null) : null;
  const professionalCardUrl = profile.professional_card_path ? await signedUrl('guide-documents', profile.professional_card_path).catch(() => null) : null;

  return {
    id: profile.id,
    role: profile.role,
    agencyName: profile.agency_name || '',
    fullName: profile.full_name || '',
    rntNumber: profile.rnt_number || '',
    status: profile.status,
    createdAt: profile.created_at,
    specialties: profile.specialties || '',
    languages: profile.languages || '',
    rntDocumentUrl,
    professionalCardUrl
  };
};

app.use(express.json());
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Se requiere iniciar sesión' });
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) return res.status(401).json({ error: 'Sesión inválida o vencida' });
  const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('*').eq('id', authData.user.id).single();
  if (profileError || !profile) return res.status(403).json({ error: 'El perfil de usuario no está configurado' });
  req.user = { auth: authData.user, profile };
  next();
}

app.post('/api/auth/register', upload.single('rntDocument'), async (req, res) => {
  const { agencyName, email, password, rntNumber } = req.body;
  if (!agencyName || !email || !password || !rntNumber || !req.file) return res.status(400).json({ error: 'Completa todos los campos y adjunta el RNT' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  const normalizedEmail = email.toLowerCase();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true });
  if (authError) return res.status(authError.message.includes('already') ? 409 : 400).json({ error: authError.message });
  const userId = authData.user.id;
  const documentPath = `${userId}/${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
  try {
    const { error: uploadError } = await supabaseAdmin.storage.from('rnt-documents').upload(documentPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').insert({ id: userId, role: 'agency', agency_name: agencyName, rnt_number: rntNumber, rnt_document_path: documentPath, status: 'pending' }).select().single();
    if (profileError) throw profileError;
    res.status(201).json({ user: publicUser(authData.user, profile), message: 'Registro recibido. Ya puedes entrar y crear paquetes mientras validamos tu documentación.' });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    res.status(500).json({ error: 'No se pudo guardar el registro. Verifica los buckets y vuelve a intentarlo.' });
  }
});

app.post('/api/auth/register-guide', upload.single('professionalCard'), async (req, res) => {
  const { fullName, email, password, specialties, languages } = req.body;
  if (!fullName || !email || !password || !specialties || !languages || !req.file) {
    return res.status(400).json({ error: 'Completa nombre, especialidades, idiomas y adjunta la tarjeta profesional.' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  const normalizedEmail = email.toLowerCase();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true });
  if (authError) return res.status(authError.message.includes('already') ? 409 : 400).json({ error: authError.message });

  const userId = authData.user.id;
  const documentPath = `${userId}/${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;

  try {
    const { error: uploadError } = await supabaseAdmin.storage.from('guide-documents').upload(documentPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;

    const profilePayload = {
      id: userId,
      role: 'guide',
      full_name: fullName,
      specialties,
      languages,
      professional_card_path: documentPath,
      status: 'pending'
    };

    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').insert(profilePayload).select().single();
    if (profileError) throw profileError;

    res.status(201).json({ user: publicUser(authData.user, profile), message: 'Registro del guía recibido. La documentación quedará en revisión antes de activar tu perfil.' });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    res.status(500).json({ error: 'No se pudo guardar el perfil del guía. Verifica el bucket guide-documents y la estructura de perfiles.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email: email?.toLowerCase(), password: password || '' });
  if (error || !data.user || !data.session) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single();
  if (profileError || !profile) return res.status(403).json({ error: 'El perfil de usuario no está configurado' });
  res.json({ token: data.session.access_token, user: publicUser(data.user, profile) });
});

app.get('/api/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user.auth, req.user.profile) }));

app.get('/api/admin/queue', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Solo un administrador puede ver esta cola' });

  const { data: profiles, error } = await supabaseAdmin.from('profiles').select('*').in('role', ['agency', 'guide']).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'No se pudo cargar la cola de revisión' });

  const queue = await Promise.all(profiles.map((profile) => serializeReviewProfile(profile)));
  res.json({ profiles: queue.filter((profile) => profile.status === 'pending' || profile.status === 'rejected') });
});

app.post('/api/admin/profiles/:id/approve', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Solo un administrador puede aprobar perfiles' });

  const { data, error } = await supabaseAdmin.from('profiles').update({ status: 'approved' }).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'No se encontró el perfil a aprobar' });

  res.json({ profile: publicUser({ id: data.id, email: '' }, data), message: 'Perfil aprobado correctamente.' });
});

app.post('/api/admin/profiles/:id/reject', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'admin') return res.status(403).json({ error: 'Solo un administrador puede rechazar perfiles' });

  const { data, error } = await supabaseAdmin.from('profiles').update({ status: 'rejected' }).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'No se encontró el perfil a rechazar' });

  res.json({ profile: publicUser({ id: data.id, email: '' }, data), message: 'Perfil rechazado.' });
});

app.get('/api/guide/profile', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'guide') return res.status(403).json({ error: 'Solo un guía puede acceder a este perfil' });

  const profile = {
    id: req.user.auth.id,
    fullName: req.user.profile.full_name || '',
    specialties: req.user.profile.specialties || '',
    languages: req.user.profile.languages || '',
    professionalCardUrl: req.user.profile.professional_card_path ? await signedUrl('guide-documents', req.user.profile.professional_card_path) : null,
    status: req.user.profile.status,
    createdAt: req.user.profile.created_at
  };

  res.json({ profile });
});

app.get('/api/guide/availability', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'guide') return res.status(403).json({ error: 'Solo un guía puede consultar disponibilidad' });

  const { data: availability, error } = await supabaseAdmin.from('guide_availability').select('*').eq('guide_id', req.user.auth.id).order('available_date', { ascending: true });
  if (error) return res.status(500).json({ error: 'No se pudo cargar la disponibilidad' });

  res.json({ availability: availability.map(serializeGuideAvailability) });
});

app.post('/api/guide/availability', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'guide') return res.status(403).json({ error: 'Solo un guía puede gestionar disponibilidad' });

  const { date, startTime, endTime, isAvailable, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'La fecha es obligatoria' });

  const { data, error } = await supabaseAdmin.from('guide_availability').insert({
    guide_id: req.user.auth.id,
    available_date: date,
    start_time: startTime || '',
    end_time: endTime || '',
    is_available: isAvailable !== false,
    notes: notes || ''
  }).select().single();

  if (error) {
    console.error('Error saving availability:', error);
    return res.status(500).json({ error: `No se pudo guardar la disponibilidad: ${error.message || 'Error desconocido'}` });
  }

  res.status(201).json({ availability: serializeGuideAvailability(data) });
});

app.delete('/api/guide/availability/:id', requireAuth, async (req, res) => {
  if (req.user.profile.role !== 'guide') return res.status(403).json({ error: 'Solo un guía puede gestionar disponibilidad' });

  const { error } = await supabaseAdmin.from('guide_availability').delete().eq('id', req.params.id).eq('guide_id', req.user.auth.id);
  if (error) return res.status(500).json({ error: 'No se pudo eliminar la disponibilidad' });

  res.json({ success: true, message: 'Disponibilidad eliminada.' });
});

app.get('/api/packages', requireAuth, async (req, res) => {
  const { data: packages, error } = await supabaseAdmin.from('packages').select('*, package_files(*)').eq('agency_id', req.user.auth.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'No se pudieron cargar los paquetes' });
  const result = await Promise.all(packages.map(serializePackageItem));
  res.json({ packages: result });
});

app.post('/api/packages', requireAuth, upload.array('files'), async (req, res) => {
  const { title, description, price, cancellationPolicy } = req.body;
  if (req.user.profile.role !== 'agency') return res.status(403).json({ error: 'Solo una agencia puede crear paquetes' });
  if (req.user.profile.status !== 'approved') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes crear paquetes hasta que se apruebe el RNT.' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });

  const { data: packageData, error: packageError } = await supabaseAdmin.from('packages').insert({
    agency_id: req.user.auth.id,
    title,
    description,
    price: Number(price),
    cancellation_policy: cancellationPolicy || '',
    status: 'draft'
  }).select().single();

  if (packageError) return res.status(500).json({ error: 'No se pudo guardar el paquete. Verifica que el estado draft exista en Supabase.' });

  const files = [];
  try {
    for (const file of req.files || []) {
      const storagePath = `${req.user.auth.id}/${packageData.id}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('package-files').upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: fileData, error: fileError } = await supabaseAdmin.from('package_files').insert({
        package_id: packageData.id,
        storage_path: storagePath,
        original_name: file.originalname,
        mime_type: file.mimetype
      }).select().single();

      if (fileError) throw fileError;
      files.push({ id: fileData.id, name: fileData.original_name, url: await signedUrl('package-files', storagePath), type: fileData.mime_type, storagePath: fileData.storage_path });
    }

    const responsePackage = { id: packageData.id, agencyId: packageData.agency_id, title: packageData.title, description: packageData.description, price: packageData.price, cancellationPolicy: packageData.cancellation_policy || '', files, status: packageData.status, createdAt: packageData.created_at };
    res.status(201).json({ package: responsePackage });
  } catch (error) {
    await supabaseAdmin.from('packages').delete().eq('id', packageData.id);
    res.status(500).json({ error: 'No se pudieron guardar los archivos del paquete' });
  }
});

app.put('/api/packages/:id', requireAuth, upload.array('files'), async (req, res) => {
  const packageId = req.params.id;
  const { title, description, price, cancellationPolicy, removeFileIds } = req.body;

  if (req.user.profile.role !== 'agency') return res.status(403).json({ error: 'Solo una agencia puede editar paquetes' });
  if (req.user.profile.status !== 'approved') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes editar paquetes hasta que se apruebe el RNT.' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });

  const { data: existingPackage, error: packageLookupError } = await supabaseAdmin.from('packages').select('*').eq('id', packageId).eq('agency_id', req.user.auth.id).single();
  if (packageLookupError || !existingPackage) return res.status(404).json({ error: 'Paquete no encontrado' });

  const idsToRemove = String(removeFileIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (idsToRemove.length) {
    const { data: filesToRemove, error: filesSelectError } = await supabaseAdmin.from('package_files').select('*').in('id', idsToRemove).eq('package_id', packageId);
    if (filesSelectError) return res.status(500).json({ error: 'No se pudieron localizar los archivos a quitar' });

    const storagePaths = filesToRemove.map((file) => file.storage_path);
    if (storagePaths.length) await supabaseAdmin.storage.from('package-files').remove(storagePaths);
    await supabaseAdmin.from('package_files').delete().in('id', idsToRemove).eq('package_id', packageId);
  }

  const { error: updateError } = await supabaseAdmin.from('packages').update({
    title,
    description,
    price: Number(price),
    cancellation_policy: cancellationPolicy || '',
    updated_at: new Date().toISOString()
  }).eq('id', packageId).eq('agency_id', req.user.auth.id);

  if (updateError) return res.status(500).json({ error: 'No se pudo actualizar el paquete' });

  try {
    for (const file of req.files || []) {
      const storagePath = `${req.user.auth.id}/${packageId}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('package-files').upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: fileData, error: fileError } = await supabaseAdmin.from('package_files').insert({
        package_id: packageId,
        storage_path: storagePath,
        original_name: file.originalname,
        mime_type: file.mimetype
      }).select().single();

      if (fileError) throw fileError;
    }

    const { data: refreshedPackage, error: refreshedError } = await supabaseAdmin.from('packages').select('*, package_files(*)').eq('id', packageId).single();
    if (refreshedError || !refreshedPackage) return res.status(500).json({ error: 'No se pudo recargar el paquete actualizado' });

    const packageResult = await serializePackageItem(refreshedPackage);
    res.json({ package: packageResult, message: 'Paquete actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron guardar los nuevos archivos del paquete' });
  }
});

app.delete('/api/packages/:id', requireAuth, async (req, res) => {
  const packageId = req.params.id;

  if (req.user.profile.status !== 'approved') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes eliminar paquetes hasta que se apruebe el RNT.' });

  const { data: existingPackage, error: packageLookupError } = await supabaseAdmin.from('packages').select('*').eq('id', packageId).eq('agency_id', req.user.auth.id).single();
  if (packageLookupError || !existingPackage) return res.status(404).json({ error: 'Paquete no encontrado' });

  const { data: filesToDelete, error: filesError } = await supabaseAdmin.from('package_files').select('*').eq('package_id', packageId);
  if (filesError) return res.status(500).json({ error: 'No se pudieron consultar los archivos del paquete' });

  const storagePaths = (filesToDelete || []).map((file) => file.storage_path);
  if (storagePaths.length) await supabaseAdmin.storage.from('package-files').remove(storagePaths);
  await supabaseAdmin.from('package_files').delete().eq('package_id', packageId);
  await supabaseAdmin.from('packages').delete().eq('id', packageId).eq('agency_id', req.user.auth.id);

  res.json({ success: true, message: 'Paquete eliminado.' });
});

app.delete('/api/packages/:id/files/:fileId', requireAuth, async (req, res) => {
  const { id: packageId, fileId } = req.params;

  if (req.user.profile.status !== 'approved') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes editar paquetes hasta que se apruebe el RNT.' });

  const { data: fileRow, error: fileLookupError } = await supabaseAdmin.from('package_files').select('*').eq('id', fileId).eq('package_id', packageId).single();
  if (fileLookupError || !fileRow) return res.status(404).json({ error: 'Archivo no encontrado' });

  await supabaseAdmin.storage.from('package-files').remove([fileRow.storage_path]);
  await supabaseAdmin.from('package_files').delete().eq('id', fileId).eq('package_id', packageId);

  res.json({ success: true, message: 'Archivo eliminado.' });
});

app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
