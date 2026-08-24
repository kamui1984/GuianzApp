**Resumen Ejecutivo**

GuianzApp es una aplicación web progresiva (PWA) para centralizar y coordinar prestadores de servicios turísticos legalmente constituidos en Bogotá (agencias y guías). Su objetivo es facilitar agendamiento inmediato, validación documental (RNT y tarjeta profesional), búsqueda filtrada y operación offline básica. El proyecto se plantea como un MVP desarrollado en 12 semanas por sprints.

**Objetivos**
- Unificar la oferta turística legal en Bogotá en un solo escenario digital.
- Reducir la informalidad validando RNT y tarjeta profesional.
- Permitir agendamiento inmediato y coordinación entre agencias y guías.
- Ofrecer experiencia instalable (PWA) y funcionamiento offline básico.

**Requisitos funcionales clave**
- Registro y validación de prestadores (subida de PDF/JPG, estado: Pendiente/Aprobado/Rechazado).
- Módulo Agencia: CRUD de paquetes turísticos (título, descripción, precio, imágenes, política de cancelación).
- Módulo Guía: Perfil profesional (idiomas, especialidades, número de tarjeta), calendario de disponibilidad.
- Turista: Buscador con filtros por zona, precio, idioma y especialidad; vista de paquete y contacto/agendamiento.
- Admin: Panel para validar documentos y aprobar prestadores y paquetes.
- PWA: manifest, service worker, página offline y banner de instalación.
- Notificaciones y asignaciones en tiempo real (sugerido: Firebase o WebSockets).

**Requisitos no funcionales**
- Escalabilidad: desplegar en nube (AWS/Azure/GCP).
- Seguridad: autenticación basada en JWT, almacenamiento seguro de documentos.
- Disponibilidad: funcionamiento offline parcial y rápido tiempo de respuesta para búsquedas.
- Internacionalización: soporte mínimo para español e inglés (opcional en MVP).

**Arquitectura propuesta**
- Frontend: React (PWA), TypeScript.
- Backend: Node.js + Express (TypeScript opcional), API REST y eventos en tiempo real (Firebase o Socket.IO).
- Base de datos: Supabase localmente luego se desplegará
- Todo el desarrollo y las pruebas se harán de manera local en el equipo de cómputo personal y más adelante se hará el despliegue  
- Infraestructura: despliegue en cloud, CDN para assets, almacenamiento de archivos (S3/GCS/Azure Blob).


**Cronograma (resumen)**
- Sprint 0 (Design): investigación, UX/UI, backlog inicial.
- Sprint 1: Crear registro como agencia o como guía setup, auth, registro y validación RNT, creación de paquetes turísticos
- Sprint 2: gestión de oferta y paquetes.
- Sprint 3: perfiles de guías y calendarios.
- Sprint 4: buscador, PWA core y pruebas finales.


**Riesgos y dependencias**
- Verificación automática del RNT puede requerir APIs externas o validación manual.
- Coordinación con actores (IDT, gremios) para adopción y datos.
- Costos de hosting, mantenimiento y certificaciones.

**Siguientes pasos recomendados**
1. Validar con stakeholders las HU y criterios de aceptación detallados.
2. Establecer el backlog técnico y priorizar MVP mínimo viable.
3. Preparar entorno de desarrollo (repositorio, CI básico, plantilla PWA).