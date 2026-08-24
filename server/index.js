const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const usersFile = path.join(dataDir, 'users.json');
const packagesFile = path.join(dataDir, 'packages.json');
const tokenSecret = process.env.TOKEN_SECRET || 'guianzapp-local-secret';

for (const directory of [dataDir, uploadsDir]) fs.mkdirSync(directory, { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
if (!fs.existsSync(packagesFile)) fs.writeFileSync(packagesFile, '[]');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
const publicUser = ({ passwordHash, ...user }) => user;
const hashPassword = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(`${salt}:${key.toString('hex')}`));
});
const verifyPassword = (password, stored) => new Promise((resolve, reject) => {
  const [salt, key] = stored.split(':');
  crypto.scrypt(password, salt, 64, (error, derivedKey) => {
    if (error) return reject(error);
    resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
  });
});
const createToken = (user) => jwt.sign({ role: user.role }, tokenSecret, { subject: user.id, expiresIn: '1d' });
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 10 }, fileFilter: (req, file, callback) => callback(null, /^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.mimetype)) });

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Se requiere iniciar sesión' });
  try {
    const claims = jwt.verify(token, tokenSecret);
    req.user = readJson(usersFile).find((user) => user.id === claims.sub);
    if (!req.user) throw new Error();
    next();
  } catch (error) { res.status(401).json({ error: 'Sesión inválida o vencida' }); }
}

app.post('/api/auth/register', upload.single('rntDocument'), async (req, res) => {
  const { agencyName, email, password, rntNumber } = req.body;
  if (!agencyName || !email || !password || !rntNumber || !req.file) return res.status(400).json({ error: 'Completa todos los campos y adjunta el RNT' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  const users = readJson(usersFile);
  if (users.some((user) => user.email === email.toLowerCase())) return res.status(409).json({ error: 'El correo ya está registrado' });
  const user = { id: crypto.randomUUID(), role: 'agency', agencyName, email: email.toLowerCase(), rntNumber, rntDocument: req.file.filename, status: 'pending', createdAt: new Date().toISOString(), passwordHash: await hashPassword(password) };
  users.push(user); writeJson(usersFile, users);
  res.status(201).json({ user: publicUser(user), message: 'Registro recibido. Ya puedes entrar y crear paquetes mientras validamos tu documentación.' });
});
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = readJson(usersFile).find((item) => item.email === email?.toLowerCase());
  if (!user || !(await verifyPassword(password || '', user.passwordHash))) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  res.json({ token: createToken(user), user: publicUser(user) });
});
app.get('/api/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/packages', requireAuth, (req, res) => res.json({ packages: readJson(packagesFile).filter((item) => item.agencyId === req.user.id) }));
app.post('/api/packages', requireAuth, upload.array('files'), (req, res) => {
  const { title, description, price, cancellationPolicy } = req.body;
  if (req.user.role !== 'agency') return res.status(403).json({ error: 'Solo una agencia puede crear paquetes' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });
  const packageItem = { id: crypto.randomUUID(), agencyId: req.user.id, title, description, price: Number(price), cancellationPolicy: cancellationPolicy || '', files: (req.files || []).map((file) => ({ name: file.originalname, url: `/uploads/${file.filename}`, type: file.mimetype })), status: 'draft', createdAt: new Date().toISOString() };
  const packages = readJson(packagesFile); packages.push(packageItem); writeJson(packagesFile, packages);
  res.status(201).json({ package: packageItem });
});
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
