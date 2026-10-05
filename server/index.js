const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const enrutadorApi = require('./routes');
const { manejadorErrores } = require('./middlewares/manejadorErrores.middleware');

const aplicacion = express();
const puerto = process.env.PORT || 3000;

// Middlewares globales
aplicacion.use(cors());
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

// Servir archivos de marca y logos oficiales
aplicacion.use('/brand-assets', express.static(path.join(__dirname, '..', 'Brand')));
aplicacion.use('/logos', express.static(path.join(__dirname, '..', 'client', 'Logos _PNG')));

// Montaje de rutas de la API REST
aplicacion.use('/api', enrutadorApi);

// Ruta de estado de salud del servidor
aplicacion.get('/health', (peticion, respuesta) => {
  respuesta.json({ estado: 'activo', fecha: new Date().toISOString() });
});

// Cabeceras específicas para Progressive Web App (PWA)
aplicacion.use((peticion, respuesta, siguiente) => {
  if (peticion.path === '/sw.js' || peticion.path === '/registerSW.js') {
    respuesta.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    respuesta.setHeader('Content-Type', 'application/javascript');
  } else if (peticion.path === '/manifest.webmanifest') {
    respuesta.setHeader('Content-Type', 'application/manifest+json');
  }
  siguiente();
});

// Servir el frontend compilado (dist) o fallback
const rutaDistReact = path.join(__dirname, '..', 'dist');
aplicacion.use(express.static(rutaDistReact));
aplicacion.use(express.static(path.join(__dirname, '..', 'client')));

// Redirección SPA para rutas que no correspondan a la API
aplicacion.get('*', (peticion, respuesta, siguiente) => {
  if (peticion.path.startsWith('/api') || peticion.path.startsWith('/health')) {
    return siguiente();
  }
  const rutaIndexDist = path.join(rutaDistReact, 'index.html');
  const rutaIndexClient = path.join(__dirname, '..', 'client', 'index.html');
  respuesta.sendFile(rutaIndexDist, (error) => {
    if (error) {
      respuesta.sendFile(rutaIndexClient);
    }
  });
});

// Middleware global de gestión de errores
aplicacion.use(manejadorErrores);

aplicacion.listen(puerto, () => {
  console.log(`🚀 Servidor de GuianzApp ejecutándose en http://localhost:${puerto}`);
});

module.exports = aplicacion;
