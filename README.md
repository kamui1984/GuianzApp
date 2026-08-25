GuianzApp - Sprint 1 (Agencias)

Este repositorio contiene un scaffold mínimo para iniciar el desarrollo del MVP de GuianzApp.

Quick start:

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` a partir de `.env.example` y completar los valores desde Supabase:

- `SUPABASE_URL`: Project URL.
- `SUPABASE_ANON_KEY`: clave pública anon.
- `SUPABASE_SERVICE_ROLE_KEY`: clave service role, solo para el backend.

3. En Supabase, ejecutar [docs/supabase-migration.sql](docs/supabase-migration.sql) y crear los buckets privados `rnt-documents` y `package-files` desde Storage.

4. Iniciar servidor:

```bash
npm start
```

El servidor servirá los archivos estáticos de `client/` y la API en `http://localhost:3000`.

Estructura principal:
- `server/` : backend Express que sirve la PWA.
- `client/` : frontend estático con manifest y service worker.
- `docs/` : resumen y backlog.

## Flujo disponible

- Registrar una agencia con nombre, correo, contraseña, RNT y documento RNT (PDF/JPG/PNG).
- Iniciar sesión con Supabase Auth y consultar el estado de validación.
- Crear borradores de paquetes con título, descripción, precio, política de cancelación y múltiples archivos.
- Consultar únicamente los paquetes pertenecientes a la agencia autenticada.

La persistencia usa las tablas `profiles`, `packages` y `package_files` de Supabase. Los documentos RNT y archivos de paquetes se guardan en buckets privados y se entregan mediante URLs firmadas con una hora de duración. `SUPABASE_SERVICE_ROLE_KEY` nunca debe llegar al frontend ni publicarse.

Los usuarios existentes en `server/data/users.json` no se migran automáticamente: sus contraseñas usan un hash local incompatible con Supabase Auth. Deben registrarse nuevamente o recibir un flujo de restablecimiento de contraseña.

## API local

- `POST /api/auth/register` (multipart: `agencyName`, `email`, `password`, `rntNumber`, `rntDocument`)
- `POST /api/auth/login` (JSON: `email`, `password`)
- `GET /api/me` (Bearer token)
- `GET /api/packages` (Bearer token)
- `POST /api/packages` (multipart: `title`, `description`, `price`, `cancellationPolicy`, `files[]`)
- `GET /health`
