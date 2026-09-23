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
const clienteSupabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const clienteSupabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const cargaArchivos = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 10 }, fileFilter: (peticion, archivo, callback) => callback(null, /^(application\/pdf|image\/(jpeg|png|webp))$/.test(archivo.mimetype)) });
const supabaseAuth = clienteSupabaseAuth;
const supabaseAdmin = clienteSupabaseAdmin;
const upload = cargaArchivos;
const crearUrlFirmada = async (deposito, rutaAlmacenamiento) => {
  const { data, error } = await clienteSupabaseAdmin.storage.from(deposito).createSignedUrl(rutaAlmacenamiento, 3600);
  if (error) throw error;
  return data.signedUrl;
};
const serializarUsuario = (usuarioAuth, perfil) => ({
  id: usuarioAuth.id,
  correo: usuarioAuth.email,
  rol: perfil.rol,
  nombreAgencia: perfil.nombre_agencia || perfil.nombre_completo || '',
  nombreCompleto: perfil.nombre_completo || '',
  numeroRnt: perfil.numero_rnt,
  estado: perfil.estado,
  creadoEn: perfil.creado_en,
  correoElectronico: usuarioAuth.email
});

const serializarPaquete = async (paquete) => {
  const archivos = await Promise.all((paquete.archivos_paquete || []).map(async (archivo) => ({
    id: archivo.id,
    nombre: archivo.original_name,
    url: await crearUrlFirmada('package-files', archivo.ruta_almacenamiento),
    tipo: archivo.tipo_mime,
    rutaAlmacenamiento: archivo.ruta_almacenamiento
  })));

  const nombreAgencia = paquete.nombreAgencia ||
                        paquete.nombre_agencia ||
                        paquete.perfiles?.nombre_agencia ||
                        paquete.perfiles?.nombre_completo ||
                        '';

  return {
    id: paquete.id,
    idAgencia: paquete.id_agencia,
    nombreAgencia,
    agencyName: nombreAgencia,
    numeroRnt: paquete.perfiles?.numero_rnt || paquete.numero_rnt || '',
    titulo: paquete.titulo,
    descripcion: paquete.descripcion,
    precio: paquete.precio,
    politicaCancelacion: paquete.politica_cancelacion || '',
    estado: paquete.estado,
    creadoEn: paquete.creado_en,
    archivos,
    agencyId: paquete.id_agencia,
    title: paquete.titulo,
    description: paquete.descripcion,
    price: paquete.precio,
    cancellationPolicy: paquete.politica_cancelacion || '',
    status: paquete.estado,
    createdAt: paquete.creado_en,
    files: archivos
  };
};

const serializarDisponibilidad = (disponibilidad) => ({
  id: disponibilidad.id,
  idGuia: disponibilidad.id_guia,
  fecha: disponibilidad.fecha_disponible,
  horaInicio: disponibilidad.hora_inicio,
  horaFin: disponibilidad.hora_fin,
  estaDisponible: disponibilidad.esta_disponible,
  notas: disponibilidad.notes || '',
  guideId: disponibilidad.id_guia,
  date: disponibilidad.fecha_disponible,
  startTime: disponibilidad.hora_inicio,
  endTime: disponibilidad.hora_fin,
  isAvailable: disponibilidad.esta_disponible,
  notes: disponibilidad.notes || ''
});
const signedUrl = crearUrlFirmada;
const publicUser = serializarUsuario;
const serializePackageItem = serializarPaquete;
const serializeGuideAvailability = serializarDisponibilidad;

const serializarPerfilRevision = async (perfil) => {
  const urlDocumentoRnt = perfil.ruta_documento_rnt ? await crearUrlFirmada('rnt-documents', perfil.ruta_documento_rnt).catch(() => null) : null;
  const urlTarjetaProfesional = perfil.ruta_tarjeta_profesional ? await crearUrlFirmada('guide-documents', perfil.ruta_tarjeta_profesional).catch(() => null) : null;

  return {
    id: perfil.id,
    rol: perfil.rol,
    nombreAgencia: perfil.nombre_agencia || '',
    nombreCompleto: perfil.nombre_completo || '',
    numeroRnt: perfil.numero_rnt || '',
    estado: perfil.estado,
    creadoEn: perfil.creado_en,
    especialidades: perfil.especialidades || '',
    idiomas: perfil.idiomas || '',
    urlDocumentoRnt,
    urlTarjetaProfesional
  };
};
const serializeReviewProfile = serializarPerfilRevision;

app.use(express.json());
async function requerirAutenticacion(peticion, respuesta, siguiente) {
  const token = peticion.headers.authorization?.replace('Bearer ', '');
  if (!token) return respuesta.status(401).json({ error: 'Se requiere iniciar sesión' });
  const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.getUser(token);
  if (errorAuth || !datosAuth.user) return respuesta.status(401).json({ error: 'Sesión inválida o vencida' });
  const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin.from('perfiles').select('*').eq('id', datosAuth.user.id).single();
  if (errorPerfil || !perfil) return respuesta.status(403).json({ error: 'El perfil de usuario no está configurado' });
  peticion.usuario = { auth: datosAuth.user, perfil };
  peticion.user = { auth: datosAuth.user, profile: perfil };
  siguiente();
}
const requireAuth = requerirAutenticacion;

app.post('/api/autenticacion/registro', cargaArchivos.single('rntDocument'), async (req, res) => {
  const nombreAgencia = req.body.nombreAgencia || req.body.agencyName;
  const correo = req.body.correo || req.body.email;
  const contrasena = req.body.contrasena || req.body.password;
  const numeroRnt = (req.body.numeroRnt || req.body.rntNumber || '').trim();

  if (!nombreAgencia || !correo || !contrasena || !numeroRnt || !req.file) {
    return res.status(400).json({ error: 'Completa todos los campos y adjunta el documento RNT.' });
  }
  if (contrasena.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  // 1. Validar que el número de RNT no esté ya registrado en la base de datos
  const { data: rntExistente, error: errorCheckRnt } = await clienteSupabaseAdmin
    .from('perfiles')
    .select('id, rol, nombre_agencia, nombre_completo')
    .eq('numero_rnt', numeroRnt)
    .maybeSingle();

  if (rntExistente) {
    return res.status(409).json({ error: `El número de RNT "${numeroRnt}" ya se encuentra registrado en la plataforma por otra cuenta.` });
  }

  const correoNormalizado = correo.toLowerCase().trim();

  // 2. Crear usuario en Supabase Auth (valida unicidad de correo)
  const { data: datosAuth, error: errorAuth } = await clienteSupabaseAdmin.auth.admin.createUser({
    email: correoNormalizado,
    password: contrasena,
    email_confirm: true
  });

  if (errorAuth) {
    const yaExiste = errorAuth.message.toLowerCase().includes('already') || errorAuth.message.toLowerCase().includes('registered');
    return res.status(yaExiste ? 409 : 400).json({
      error: yaExiste ? 'Ya existe una cuenta registrada con este correo electrónico.' : errorAuth.message
    });
  }

  const idUsuario = datosAuth.user.id;
  const rutaDocumento = `${idUsuario}/${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;

  try {
    const { error: errorCarga } = await clienteSupabaseAdmin.storage
      .from('rnt-documents')
      .upload(rutaDocumento, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (errorCarga) throw errorCarga;

    const { data: perfil, error: errorPerfil } = await clienteSupabaseAdmin
      .from('perfiles')
      .insert({
        id: idUsuario,
        rol: 'agencia',
        nombre_agencia: nombreAgencia,
        numero_rnt: numeroRnt,
        ruta_documento_rnt: rutaDocumento,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (errorPerfil) throw errorPerfil;

    const usuario = serializarUsuario(datosAuth.user, perfil);
    res.status(201).json({
      usuario,
      user: usuario,
      mensaje: 'Registro recibido. Tu solicitud de agencia ha sido enviada para validación.',
      message: 'Registro recibido. Tu solicitud de agencia ha sido enviada para validación.'
    });
  } catch (error) {
    await clienteSupabaseAdmin.auth.admin.deleteUser(idUsuario);
    res.status(500).json({ error: 'No se pudo guardar el registro. Verifica los buckets y vuelve a intentarlo.' });
  }
});

app.post('/api/autenticacion/registro-guia', upload.fields([{ name: 'rntDocument', maxCount: 1 }, { name: 'professionalCard', maxCount: 1 }]), async (req, res) => {
  const fullName = req.body.nombreCompleto || req.body.fullName;
  const email = req.body.correo || req.body.email;
  const password = req.body.contrasena || req.body.password;
  const rntNumber = (req.body.numeroRnt || req.body.rntNumber || '').trim();
  const specialties = req.body.especialidades || req.body.specialties;
  const languages = req.body.idiomas || req.body.languages;
  const rntDocument = req.files?.rntDocument?.[0];
  const professionalCard = req.files?.professionalCard?.[0];

  if (!fullName || !email || !password || !rntNumber || !specialties || !languages || !rntDocument || !professionalCard) {
    return res.status(400).json({ error: 'Completa nombre, RNT, especialidades, idiomas y adjunta ambos documentos.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  // 1. Validar que el número de RNT no esté ya registrado en la base de datos
  const { data: rntExistente, error: errorCheckRnt } = await supabaseAdmin
    .from('perfiles')
    .select('id, rol, nombre_completo')
    .eq('numero_rnt', rntNumber)
    .maybeSingle();

  if (rntExistente) {
    return res.status(409).json({ error: `El número de RNT "${rntNumber}" ya se encuentra registrado en la plataforma por otra cuenta.` });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Crear usuario en Supabase Auth (valida unicidad de correo)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true
  });

  if (authError) {
    const yaExiste = authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('registered');
    return res.status(yaExiste ? 409 : 400).json({
      error: yaExiste ? 'Ya existe una cuenta registrada con este correo electrónico.' : authError.message
    });
  }

  const userId = authData.user.id;
  const rntDocumentPath = `${userId}/rnt-${crypto.randomUUID()}${path.extname(rntDocument.originalname).toLowerCase()}`;
  const professionalCardPath = `${userId}/card-${crypto.randomUUID()}${path.extname(professionalCard.originalname).toLowerCase()}`;

  try {
    const { error: rntUploadError } = await supabaseAdmin.storage
      .from('rnt-documents')
      .upload(rntDocumentPath, rntDocument.buffer, { contentType: rntDocument.mimetype, upsert: false });

    if (rntUploadError) throw rntUploadError;

    const { error: cardUploadError } = await supabaseAdmin.storage
      .from('guide-documents')
      .upload(professionalCardPath, professionalCard.buffer, { contentType: professionalCard.mimetype, upsert: false });

    if (cardUploadError) throw cardUploadError;

    const profilePayload = {
      id: userId,
      rol: 'guia',
      nombre_completo: fullName,
      numero_rnt: rntNumber,
      ruta_documento_rnt: rntDocumentPath,
      especialidades: specialties,
      idiomas: languages,
      ruta_tarjeta_profesional: professionalCardPath,
      estado: 'pendiente'
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('perfiles')
      .insert(profilePayload)
      .select()
      .single();

    if (profileError) throw profileError;

    const usuario = publicUser(authData.user, profile);
    res.status(201).json({
      usuario,
      user: usuario,
      mensaje: 'Registro del guía recibido. La documentación quedará en revisión antes de activar tu perfil.',
      message: 'Registro del guía recibido. La documentación quedará en revisión antes de activar tu perfil.'
    });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    res.status(500).json({ error: 'No se pudo guardar el perfil del guía. Verifica los buckets de documentos y la estructura de perfiles.' });
  }
});

app.post('/api/autenticacion/inicio-sesion', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email: email?.toLowerCase(), password: password || '' });
  if (error || !data.user || !data.session) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  const { data: profile, error: profileError } = await supabaseAdmin.from('perfiles').select('*').eq('id', data.user.id).single();
  if (profileError || !profile) return res.status(403).json({ error: 'El perfil de usuario no está configurado' });
  const usuario = publicUser(data.user, profile);
  res.json({ token: data.session.access_token, usuario, user: usuario });
});

app.get('/api/usuario', requireAuth, (req, res) => { const usuario = publicUser(req.user.auth, req.user.profile); res.json({ usuario }); });

app.get('/api/administracion/cola', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'administrador') return res.status(403).json({ error: 'Solo un administrador puede ver esta cola' });

  const { data: profiles, error } = await supabaseAdmin.from('perfiles').select('*').in('rol', ['agencia', 'guia']).order('creado_en', { ascending: false });
  if (error) return res.status(500).json({ error: 'No se pudo cargar la cola de revisión' });

  const queue = await Promise.all(profiles.map((profile) => serializeReviewProfile(profile)));
  const perfiles = queue.filter((profile) => profile.estado === 'pendiente' || profile.estado === 'rechazado');
  res.json({ perfiles, profiles: perfiles });
});

app.post('/api/administracion/perfiles/:id/aprobar', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'administrador') return res.status(403).json({ error: 'Solo un administrador puede aprobar perfiles' });

  const { data, error } = await supabaseAdmin.from('perfiles').update({ estado: 'aprobado' }).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'No se encontró el perfil a aprobar' });

  const perfil = serializarUsuario({ id: data.id, email: '' }, data);
  res.json({ perfil, profile: perfil, mensaje: 'Perfil aprobado correctamente.', message: 'Perfil aprobado correctamente.' });
});

app.post('/api/administracion/perfiles/:id/rechazar', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'administrador') return res.status(403).json({ error: 'Solo un administrador puede rechazar perfiles' });

  const { data, error } = await supabaseAdmin.from('perfiles').update({ estado: 'rechazado' }).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'No se encontró el perfil a rechazar' });

  const perfil = serializarUsuario({ id: data.id, email: '' }, data);
  res.json({ perfil, profile: perfil, mensaje: 'Perfil rechazado.', message: 'Perfil rechazado.' });
});

app.get('/api/guia/perfil', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede acceder a este perfil' });

  const perfil = {
    id: req.user.auth.id,
    nombreCompleto: req.user.profile.nombre_completo || '',
    numeroRnt: req.user.profile.numero_rnt || '',
    urlDocumentoRnt: req.user.profile.ruta_documento_rnt ? await signedUrl('rnt-documents', req.user.profile.ruta_documento_rnt) : null,
    especialidades: req.user.profile.especialidades || '',
    idiomas: req.user.profile.idiomas || '',
    urlTarjetaProfesional: req.user.profile.ruta_tarjeta_profesional ? await signedUrl('guide-documents', req.user.profile.ruta_tarjeta_profesional) : null,
    estado: req.user.profile.estado,
    creadoEn: req.user.profile.creado_en
  };

  res.json({ perfil });
});

app.get('/api/guia/disponibilidad', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede consultar disponibilidad' });

  const { data: availability, error } = await supabaseAdmin.from('disponibilidad_guias').select('*').eq('id_guia', req.user.auth.id).order('fecha_disponible', { ascending: true });
  if (error) return res.status(500).json({ error: 'No se pudo cargar la disponibilidad' });

  const disponibilidad = availability.map(serializeGuideAvailability);
  res.json({ disponibilidad, availability: disponibilidad });
});

app.post('/api/guia/disponibilidad', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede gestionar disponibilidad' });

  const date = req.body.fecha || req.body.date;
  const startTime = req.body.horaInicio || req.body.startTime;
  const endTime = req.body.horaFin || req.body.endTime;
  const isAvailable = req.body.estaDisponible ?? req.body.isAvailable;
  const notes = req.body.notas || req.body.notes;
  if (!date) return res.status(400).json({ error: 'La fecha es obligatoria' });

  const { data, error } = await supabaseAdmin.from('disponibilidad_guias').insert({
    id_guia: req.user.auth.id,
    fecha_disponible: date,
    hora_inicio: startTime || '',
    hora_fin: endTime || '',
    esta_disponible: isAvailable !== false,
    notes: notes || ''
  }).select().single();

  if (error) {
    console.error('Error saving availability:', error);
    return res.status(500).json({ error: `No se pudo guardar la disponibilidad: ${error.message || 'Error desconocido'}` });
  }

  const disponibilidad = serializeGuideAvailability(data);
  res.status(201).json({ disponibilidad, availability: disponibilidad });
});

app.put('/api/guia/disponibilidad/:id', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede editar su disponibilidad' });

  const id = req.params.id;
  const date = req.body.fecha || req.body.date;
  const startTime = req.body.horaInicio || req.body.startTime;
  const endTime = req.body.horaFin || req.body.endTime;
  const isAvailable = req.body.estaDisponible ?? req.body.isAvailable;
  const notes = req.body.notas || req.body.notes;

  if (!date) return res.status(400).json({ error: 'La fecha es obligatoria' });

  const { data, error } = await supabaseAdmin
    .from('disponibilidad_guias')
    .update({
      fecha_disponible: date,
      hora_inicio: startTime || '',
      hora_fin: endTime || '',
      esta_disponible: isAvailable !== false,
      notes: notes || ''
    })
    .eq('id', id)
    .eq('id_guia', req.user.auth.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({ error: 'No se pudo actualizar la disponibilidad en la base de datos' });
  }

  const disponibilidad = serializeGuideAvailability(data);
  res.json({ disponibilidad, availability: disponibilidad, mensaje: 'Disponibilidad actualizada exitosamente.' });
});

app.delete('/api/guia/disponibilidad/:id', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede gestionar disponibilidad' });

  const { error } = await supabaseAdmin.from('disponibilidad_guias').delete().eq('id', req.params.id).eq('id_guia', req.user.auth.id);
  if (error) return res.status(500).json({ error: 'No se pudo eliminar la disponibilidad' });

  res.json({ success: true, message: 'Disponibilidad eliminada.' });
});

app.get('/api/paquetes', requireAuth, async (req, res) => {
  const { data: packages, error } = await supabaseAdmin.from('paquetes').select('*, archivos_paquete(*)').eq('id_agencia', req.user.auth.id).order('creado_en', { ascending: false });
  if (error) return res.status(500).json({ error: 'No se pudieron cargar los paquetes' });
  const result = await Promise.all(packages.map(serializePackageItem));
  res.json({ paquetes: result, packages: result });
});

app.post('/api/paquetes', requireAuth, upload.any(), async (req, res) => {
  const title = req.body.titulo || req.body.title;
  const description = req.body.descripcion || req.body.description;
  const price = req.body.precio || req.body.price;
  const cancellationPolicy = req.body.politicaCancelacion || req.body.cancellationPolicy;
  if (req.user.profile.rol !== 'agencia') return res.status(403).json({ error: 'Solo una agencia puede crear paquetes' });
  if (req.user.profile.estado !== 'aprobado') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes crear paquetes hasta que se apruebe el RNT.' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });

  const { data: packageData, error: packageError } = await supabaseAdmin.from('paquetes').insert({
    id_agencia: req.user.auth.id,
    titulo: title,
    descripcion: description,
    precio: Number(price),
    politica_cancelacion: cancellationPolicy || '',
    estado: 'borrador'
  }).select().single();

  if (packageError) return res.status(500).json({ error: 'No se pudo guardar el paquete. Verifica que el estado borrador exista en Supabase.' });

  const files = [];
  try {
    for (const file of req.files || []) {
      const storagePath = `${req.user.auth.id}/${packageData.id}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('package-files').upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: fileData, error: fileError } = await supabaseAdmin.from('archivos_paquete').insert({
        id_paquete: packageData.id,
        ruta_almacenamiento: storagePath,
        nombre_original: file.originalname,
        tipo_mime: file.mimetype
      }).select().single();

      if (fileError) throw fileError;
      files.push({ id: fileData.id, name: fileData.nombre_original, url: await signedUrl('package-files', storagePath), type: fileData.tipo_mime, storagePath: fileData.ruta_almacenamiento });
    }

    const paquete = serializarPaquete({ ...packageData, archivos_paquete: files.map((archivo) => ({ id: archivo.id, nombre_original: archivo.name, ruta_almacenamiento: archivo.storagePath, tipo_mime: archivo.type })) });
    res.status(201).json({ paquete, package: paquete });
  } catch (error) {
    await supabaseAdmin.from('paquetes').delete().eq('id', packageData.id);
    res.status(500).json({ error: 'No se pudieron guardar los archivos del paquete' });
  }
});

app.put('/api/paquetes/:id', requireAuth, upload.any(), async (req, res) => {
  const packageId = req.params.id;
  const title = req.body.titulo || req.body.title;
  const description = req.body.descripcion || req.body.description;
  const price = req.body.precio || req.body.price;
  const cancellationPolicy = req.body.politicaCancelacion || req.body.cancellationPolicy;
  const removeFileIds = req.body.idsArchivosEliminados || req.body.removeFileIds;

  if (req.user.profile.rol !== 'agencia') return res.status(403).json({ error: 'Solo una agencia puede editar paquetes' });
  if (req.user.profile.estado !== 'aprobado') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes editar paquetes hasta que se apruebe el RNT.' });
  if (!title || !description || !price) return res.status(400).json({ error: 'Título, descripción y precio son obligatorios' });

  const { data: existingPackage, error: packageLookupError } = await supabaseAdmin.from('paquetes').select('*').eq('id', packageId).eq('id_agencia', req.user.auth.id).single();
  if (packageLookupError || !existingPackage) return res.status(404).json({ error: 'Paquete no encontrado' });

  const idsToRemove = String(removeFileIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (idsToRemove.length) {
    const { data: filesToRemove, error: filesSelectError } = await supabaseAdmin.from('archivos_paquete').select('*').in('id', idsToRemove).eq('id_paquete', packageId);
    if (filesSelectError) return res.status(500).json({ error: 'No se pudieron localizar los archivos a quitar' });

    const storagePaths = filesToRemove.map((file) => file.ruta_almacenamiento);
    if (storagePaths.length) await supabaseAdmin.storage.from('package-files').remove(storagePaths);
    await supabaseAdmin.from('archivos_paquete').delete().in('id', idsToRemove).eq('id_paquete', packageId);
  }

  const { error: updateError } = await supabaseAdmin.from('paquetes').update({
    titulo: title,
    descripcion: description,
    precio: Number(price),
    politica_cancelacion: cancellationPolicy || '',
    actualizado_en: new Date().toISOString()
  }).eq('id', packageId).eq('id_agencia', req.user.auth.id);

  if (updateError) return res.status(500).json({ error: 'No se pudo actualizar el paquete' });

  try {
    for (const file of req.files || []) {
      const storagePath = `${req.user.auth.id}/${packageId}/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('package-files').upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: fileData, error: fileError } = await supabaseAdmin.from('archivos_paquete').insert({
        id_paquete: packageId,
        ruta_almacenamiento: storagePath,
        nombre_original: file.originalname,
        tipo_mime: file.mimetype
      }).select().single();

      if (fileError) throw fileError;
    }

    const { data: refreshedPackage, error: refreshedError } = await supabaseAdmin.from('paquetes').select('*, archivos_paquete(*)').eq('id', packageId).single();
    if (refreshedError || !refreshedPackage) return res.status(500).json({ error: 'No se pudo recargar el paquete actualizado' });

    const packageResult = await serializePackageItem(refreshedPackage);
    res.json({ paquete: packageResult, package: packageResult, mensaje: 'Paquete actualizado correctamente.', message: 'Paquete actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron guardar los nuevos archivos del paquete' });
  }
});

app.delete('/api/paquetes/:id', requireAuth, async (req, res) => {
  const packageId = req.params.id;

  if (req.user.profile.estado !== 'aprobado') return res.status(403).json({ error: 'Tu agencia está en revisión. No puedes eliminar paquetes hasta que se apruebe el RNT.' });

  const { data: existingPackage, error: packageLookupError } = await supabaseAdmin.from('paquetes').select('*').eq('id', packageId).eq('id_agencia', req.user.auth.id).single();
  if (packageLookupError || !existingPackage) return res.status(404).json({ error: 'Paquete no encontrado' });

  const { data: filesToDelete, error: filesError } = await supabaseAdmin.from('archivos_paquete').select('*').eq('id_paquete', packageId);
  if (filesError) return res.status(500).json({ error: 'No se pudieron consultar los archivos del paquete' });

  const storagePaths = (filesToDelete || []).map((file) => file.ruta_almacenamiento);
  if (storagePaths.length) await supabaseAdmin.storage.from('package-files').remove(storagePaths);
  await supabaseAdmin.from('archivos_paquete').delete().eq('id_paquete', packageId);
  await supabaseAdmin.from('paquetes').delete().eq('id', packageId).eq('id_agencia', req.user.auth.id);

  res.json({ success: true, message: 'Paquete eliminado.' });
});

app.get('/api/guias', async (req, res) => {
  try {
    const { data: guides, error } = await supabaseAdmin
      .from('perfiles')
      .select('id, nombre_completo, numero_rnt, especialidades, idiomas, estado, creado_en')
      .eq('rol', 'guia')
      .order('creado_en', { ascending: false });

    if (error) return res.status(500).json({ error: 'No se pudieron consultar los guías' });

    const guias = (guides || []).map((g) => ({
      id: g.id,
      nombreCompleto: g.nombre_completo || 'Guía profesional',
      numeroRnt: g.numero_rnt || '',
      especialidades: g.especialidades || 'Turismo cultural, Centro histórico',
      idiomas: g.idiomas || 'Español',
      estado: g.estado,
      creadoEn: g.creado_en
    }));

    res.json({ guias, guides: guias });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar guías' });
  }
});

app.put('/api/guia/perfil', requireAuth, async (req, res) => {
  if (req.user.profile.rol !== 'guia') return res.status(403).json({ error: 'Solo un guía puede editar su perfil' });

  const { nombreCompleto, specialties, languages, especialidades, idiomas, rntNumber, numeroRnt } = req.body;
  const updates = {};
  if (nombreCompleto) updates.nombre_completo = nombreCompleto;
  if (specialties || especialidades) updates.especialidades = specialties || especialidades;
  if (languages || idiomas) updates.idiomas = languages || idiomas;
  if (rntNumber || numeroRnt) updates.numero_rnt = rntNumber || numeroRnt;

  const { data: updatedProfile, error } = await supabaseAdmin
    .from('perfiles')
    .update(updates)
    .eq('id', req.user.auth.id)
    .select()
    .single();

  if (error || !updatedProfile) return res.status(500).json({ error: 'No se pudo actualizar el perfil en Supabase' });

  const usuario = publicUser(req.user.auth, updatedProfile);
  res.json({ usuario, perfil: updatedProfile, mensaje: 'Perfil actualizado correctamente.' });
});

app.get('/api/explorar/paquetes', async (req, res) => {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('paquetes')
      .select('*, archivos_paquete(*)')
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al cargar paquetes:', error);
      return res.status(500).json({ error: 'No se pudieron cargar los paquetes' });
    }

    const agencyIds = [...new Set((packages || []).map(p => p.id_agencia).filter(Boolean))];
    let agencyMap = {};
    if (agencyIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('perfiles')
        .select('id, nombre_agencia, nombre_completo, numero_rnt, estado')
        .in('id', agencyIds);

      if (profiles) {
        profiles.forEach(p => {
          agencyMap[p.id] = p;
        });
      }
    }

    const serialized = await Promise.all((packages || []).map(async (pkg) => {
      const agency = agencyMap[pkg.id_agencia];
      const base = await serializePackageItem(pkg);
      const agencyName = agency?.nombre_agencia || agency?.nombre_completo || base.nombreAgencia || 'Agencia Operadora';
      const rnt = agency?.numero_rnt || base.numeroRnt || 'Validado';
      return {
        ...base,
        nombreAgencia: agencyName,
        agencyName: agencyName,
        numeroRnt: rnt,
        rntNumber: rnt
      };
    }));

    res.json({ paquetes: serialized, packages: serialized });
  } catch (error) {
    console.error('Error en /api/explorar/paquetes:', error);
    res.status(500).json({ error: 'Error al explorar paquetes' });
  }
});

app.use('/brand-assets', express.static(path.join(__dirname, '..', 'Brand')));
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
