import React from 'react';
import ReactDOM from 'react-dom/client';
import { Aplicacion } from './Aplicacion';
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion';
import './estilos/globales.css';

ReactDOM.createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    <ProveedorAutenticacion>
      <Aplicacion />
    </ProveedorAutenticacion>
  </React.StrictMode>
);
