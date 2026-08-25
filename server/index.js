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
  agencyName: profile.agency_name,
  rntNumber: profile.rnt_number,
  status: profile.status,
  createdAt: profile.created_at
});

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
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email: email?.toLowerCase(), password: password || '' });
  if (error || !data.user || !data.session) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single();
  if (profileError || !profile) return res.status(403).json({ error: 'El perfil de usuario no está configurado' });
  res.json({ token: data.session.access_token, user: publicUser(data.user, profile) });
});
app.get('/api/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user.auth, req.user.profile) }));
app.get('/api/packages', requireAuth, async (req, res) => {
  const { data: packages, error } = await supabaseAdmin.from('packages').select('*, package_files(*)').eq('agency_id', req.user.auth.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'No se pudieron cargar los paquetes' });
  const result = await Promise.all(packages.map(async (item) => ({ id: item.id, agencyId: item.agency_id, title: item.title, description: item.description, price: item.price, cancellationPolicy: item.cancellation_policy || '', status: item.status, createdAt: item.created_at, files: await Promise.all((item.package_files || []).map(async (file) => ({ name: file.original_name, url: await signedUrl('package-files', file.storage_path), type: file.mime_type }))) })));
  res.json({ packages: result });
});
app.post('/api/packages', requireAuth, upload.array('files'), async (req, res) => {
  const { title, description, price, cancellationPolicy } = req.body;
  if (req.user.profile.role !== 'agency') return res.status(403).json({ error: 'Solo una agencia puede crear paquetes' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });
  const { data: packageData, error: packageError } = await supabaseAdmin.from('packages').insert({ agency_id: req.user.auth.id, title, description, price: Number(price), cancellation_policy: cancellationPolicy || '', status: 'draft' }).select().single();
  if (packageError) return res.status(500).json({ error: 'No se pudo guardar el paquete. Verifica que el estado draft exista en Supabase.' });
  const files = [];
  try {
    for (const file of req.files || []) {
      const storagePath = `${req.user.auth.id}/${packageData.id}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('package-files').upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: fileData, error: fileError } = await supabaseAdmin.from('package_files').insert({ package_id: packageData.id, storage_path: storagePath, original_name: file.originalname, mime_type: file.mimetype }).select().single();
      if (fileError) throw fileError;
      files.push({ name: fileData.original_name, url: await signedUrl('package-files', storagePath), type: fileData.mime_type });
    }
    res.status(201).json({ package: { id: packageData.id, agencyId: packageData.agency_id, title: packageData.title, description: packageData.description, price: packageData.price, cancellationPolicy: packageData.cancellation_policy || '', files, status: packageData.status, createdAt: packageData.created_at } });
  } catch (error) {
    await supabaseAdmin.from('packages').delete().eq('id', packageData.id);
    res.status(500).json({ error: 'No se pudieron guardar los archivos del paquete' });
  }
});
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
