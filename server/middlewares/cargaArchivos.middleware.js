const multer = require('multer');

// Almacenamiento en memoria para procesamiento rápido y retransmisión a Supabase Storage
const almacenamientoMemoria = multer.memoryStorage();

// Filtro de formatos seguros (PDF para documentos legales, JPEG/PNG/WEBP para imágenes)
const filtroFormatoArchivos = (peticion, archivo, callback) => {
  const tiposPermitidos = /^(application\/pdf|image\/(jpeg|png|webp|jpg))$/i;
  if (tiposPermitidos.test(archivo.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WEBP) o documentos PDF.'), false);
  }
};

const cargaArchivos = multer({
  storage: almacenamientoMemoria,
  limits: {
    fileSize: 10 * 1024 * 1024, // Máximo 10MB por archivo
    files: 10 // Máximo 10 archivos por petición
  },
  fileFilter: filtroFormatoArchivos
});

module.exports = {
  cargaArchivos
};
