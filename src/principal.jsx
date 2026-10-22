import React from 'react';
import ReactDOM from 'react-dom/client';
import { Aplicacion } from './Aplicacion';
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion';
import './estilos/globales.css';
import { registerSW } from 'virtual:pwa-register';

// Registro de actualización automática de PWA sin requerir borrado de caché manual
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    <ProveedorAutenticacion>
      <Aplicacion />
    </ProveedorAutenticacion>
  </React.StrictMode>
);
