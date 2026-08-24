GuianzApp - Sprint 1 (Agencias)

Este repositorio contiene un scaffold mínimo para iniciar el desarrollo del MVP de GuianzApp.

Quick start:

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor:

```bash
npm start
```

El servidor servirá los archivos estáticos de `client/` y la API local en `http://localhost:3000`.

Estructura principal:
- `server/` : backend Express que sirve la PWA.
- `client/` : frontend estático con manifest y service worker.
- `docs/` : resumen y backlog.

## Flujo disponible

- Registrar una agencia con nombre, correo, contraseña, RNT y documento RNT (PDF/JPG/PNG).
- Iniciar sesión con un token firmado localmente y consultar el estado de validación.
- Crear borradores de paquetes con título, descripción, precio, política de cancelación y múltiples archivos.
- Consultar únicamente los paquetes pertenecientes a la agencia autenticada.

La persistencia del entorno de desarrollo usa `server/data/` y los archivos se guardan en `server/uploads/`; ambas carpetas están ignoradas por Git. La validación administrativa y el despliegue cloud quedan para la siguiente iteración, cuando se conecte una base de datos y almacenamiento administrado.

## API local

- `POST /api/auth/register` (multipart: `agencyName`, `email`, `password`, `rntNumber`, `rntDocument`)
- `POST /api/auth/login` (JSON: `email`, `password`)
- `GET /api/me` (Bearer token)
- `GET /api/packages` (Bearer token)
- `POST /api/packages` (multipart: `title`, `description`, `price`, `cancellationPolicy`, `files[]`)
- `GET /health`
