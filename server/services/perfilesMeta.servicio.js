const fs = require('fs');
const path = require('path');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoMeta = path.join(rutaDirectorioData, 'perfiles_meta.json');

// Asegurar existencia del directorio data
if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

const leerMetaPerfiles = () => {
  try {
    if (fs.existsSync(rutaArchivoMeta)) {
      const contenido = fs.readFileSync(rutaArchivoMeta, 'utf8');
      return JSON.parse(contenido || '{}');
    }
  } catch (error) {
    console.warn('Error al leer perfiles_meta.json:', error.message);
  }
  return {};
};

const guardarMetaPerfil = (idUsuario, datosMeta) => {
  try {
    const mapaActual = leerMetaPerfiles();
    mapaActual[idUsuario] = {
      ...(mapaActual[idUsuario] || {}),
      ...datosMeta
    };
    fs.writeFileSync(rutaArchivoMeta, JSON.stringify(mapaActual, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar en perfiles_meta.json:', error.message);
  }
};

const obtenerMetaPerfil = (idUsuario) => {
  const mapaActual = leerMetaPerfiles();
  return mapaActual[idUsuario] || {};
};

module.exports = {
  leerMetaPerfiles,
  guardarMetaPerfil,
  obtenerMetaPerfil
};
