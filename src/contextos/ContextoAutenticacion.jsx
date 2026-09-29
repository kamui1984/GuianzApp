import React, { createContext, useContext, useState, useEffect } from 'react';
import { servicioAutenticacion } from '../api/autenticacionServicio';
import {
  guardarTokenAutenticacion,
  obtenerTokenAutenticacion,
  eliminarTokenAutenticacion
} from '../api/clienteHttp';

const ContextoAutenticacion = createContext(null);

export const ProveedorAutenticacion = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [notificacion, setNotificacion] = useState(null); // { mensaje, tipo: 'exito' | 'error' | 'advertencia' }

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4500);
  };

  const limpiarNotificacion = () => setNotificacion(null);

  const cargarUsuarioDesdeToken = async () => {
    const token = obtenerTokenAutenticacion();
    if (!token) {
      setUsuarioActual(null);
      setCargandoUsuario(false);
      return;
    }

    try {
      const respuesta = await servicioAutenticacion.obtenerUsuarioActual();
      setUsuarioActual(respuesta.usuario || respuesta.user);
    } catch (error) {
      console.warn('Token expirado o inválido. Cerrando sesión...');
      eliminarTokenAutenticacion();
      setUsuarioActual(null);
    } finally {
      setCargandoUsuario(false);
    }
  };

  useEffect(() => {
    cargarUsuarioDesdeToken();
  }, []);

  const iniciarSesion = async (correo, contrasena) => {
    const respuesta = await servicioAutenticacion.iniciarSesion(correo, contrasena);
    if (respuesta.token) {
      guardarTokenAutenticacion(respuesta.token);
    }
    const usuario = respuesta.usuario || respuesta.user;
    setUsuarioActual(usuario);
    mostrarNotificacion(`¡Bienvenido de nuevo, ${usuario.nombreCompleto || usuario.nombreAgencia || 'usuario'}!`);
    return usuario;
  };

  const cerrarSesion = () => {
    eliminarTokenAutenticacion();
    setUsuarioActual(null);
    mostrarNotificacion('Has cerrado sesión correctamente.', 'advertencia');
  };

  const actualizarUsuario = (datosActualizados) => {
    setUsuarioActual((prev) => ({ ...prev, ...datosActualizados }));
  };

  const valor = {
    usuarioActual,
    cargandoUsuario,
    notificacion,
    estaAutenticado: Boolean(usuarioActual),
    esAgencia: usuarioActual?.rol === 'agencia',
    esGuia: usuarioActual?.rol === 'guia',
    esAdministrador: usuarioActual?.rol === 'administrador',
    esTurista: usuarioActual?.rol === 'turista',
    iniciarSesion,
    cerrarSesion,
    actualizarUsuario,
    mostrarNotificacion,
    limpiarNotificacion,
    recargarUsuario: cargarUsuarioDesdeToken
  };

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de un ProveedorAutenticacion');
  }
  return contexto;
};
