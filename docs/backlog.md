# Backlog Técnico por Sprint (Resumen)

Formato: tarea - estimación (horas)

Sprint 0: Design (W1)
- Kickoff y definición de alcance - 4h
- User personas y HU refinadas - 8h
- Wireframes baja fidelidad (home, dashboard admin, perfil guía, detalle paquete) - 12h
- Definición DoD y criterios de aceptación - 4h

Sprint 1: Base, Registro y Validación (W2-W3)
- Setup repo y entorno (Node, Supabase, ESLint, Prettier) - 6h
- Autenticación JWT y roles (Admin/Agencia/Guía/Turista) - 12h
- Upload y almacenamiento seguro de documentos (RNT, tarjeta) - 8h
- Panel Admin: aprobar/rechazar registros - 8h
- Tests unitarios básicos (auth, upload) - 6h

Sprint 2: Gestión de Oferta y Paquetes (W4-W5)
- CRUD paquetes (backend + endpoints) - 10h
- Formulario frontend para creación/edición de paquetes - 12h
- Gestión de imágenes (subida, thumbnails) - 8h
- Revisión y workflow de aprobación de paquete - 6h
- Tests de integración para creación de paquetes - 6h

Sprint 3: Perfiles Profesionales y Agendas (W6-W7)
- Modelo perfil guía (idiomas, especialidades, tarjeta) - 6h
- Calendario de disponibilidad (frontend) - 12h
- Lógica de bloqueo y asignación por fecha/hora (backend) - 10h
- Notificaciones/eventos en tiempo real (Firebase o Socket.IO) - 12h

Sprint 4: Interfaz Turista y PWA Core (W8-W10)
- Buscador con filtros (zona, precio, idioma, especialidad) - 14h
- Página de paquete y contacto/agendamiento - 8h
- PWA: manifest, service worker, offline page - 8h
- Ajustes UX/UI y accesibilidad - 8h
- QA y pruebas E2E básicas - 12h

Cierre y Pruebas (W11-W12)
- UAT con stakeholders - 8h
- Hotfixes y despliegue cloud - 10h
- Documentación técnica y manual de usuario - 8h

Total estimado (MVP): aprox. 180-220 horas

Notas:
- Las estimaciones son orientativas y se pueden convertir a story points.
- Priorizar historias que habiliten el flujo completo: registro → validación → creación de paquete → búsqueda → agendamiento.
- Implementar CI básico (lint, tests) desde Sprint 1.