1. 🎯 Tarea principal que dejó el profesor

La tarea inmediata es organizar claramente la metodología de desarrollo.

El profesor pidió que para la siguiente revisión quede claro:

Qué se hace en cada fase.
Qué se hace en cada sprint.
Cuál es el alcance de cada sprint.
Qué se entrega al finalizar cada sprint.
Qué historias de usuario corresponden a cada sprint.
Cómo se valida con usuarios.
Qué ajustes se realizan después de validar.

Él lo resumió explícitamente como: cada sprint dura dos semanas, debe tener alcance y entregable, e incluir validación con usuario y ajustes.

2. 🔎 Fase de descubrimiento: hay que definir sus entregables

Este es uno de los pendientes más importantes.

El profesor preguntó directamente:

¿Cuál va a ser el entregable de la fase de descubrimiento?

Y planteó si serían mockups, wireframes y si incluirían validación.

Por tanto, no basta con escribir:

“Fase de descubrimiento: Design Thinking”.

Hay que poner:

Actividad	Entregable
Empatizar	Registro de entrevistas / hallazgos
Definir	Problema + personas + pregunta generadora refinada
Idear	Primeros mockups/wireframes
Historias de usuario	Product Backlog
Prototipado	Prototipo UX/UI
Validación	Evidencia + resultados
Ajustes	Prototipo corregido

De hecho, en una reunión posterior el profesor dio ejemplos prácticamente literales: empatización → registro de entrevistas; historias de usuario → backlog; ideación → primeros mockups + manual de marca.

⚠️ Pendiente

Agregar una columna "Entregables" a la metodología.

El profesor fue muy explícito en que no quiere otra tabla de cronograma, sino una tabla metodológica:

Fase → Actividad → Entregable.

3. 🧩 Hay que definir claramente las funcionalidades de cada rol

Este es probablemente el punto más importante para construir posteriormente el Scrum.

El profesor quiere que puedas decir:

“Primero voy a hacer Agencia y Agencia tendrá estas funcionalidades: 1, 2, 3, 4.”

Después:

“Guía tendrá estas funcionalidades…”

Después:

“Administrador tendrá…”

Y finalmente:

“Turista tendrá…”

Por eso, antes de llenar el Kanban, hay que construir esta matriz:

Rol	Funcionalidades	HU	Sprint
🏢 Agencia	...	HU02 + derivadas	S1
🧑‍🏫 Guía	...	HU03 + HU04	S2
🛡️ Administrador	...	HU01	S3
🧳 Turista	...	HU05 + HU06	S4

Esto es lo que todavía tenemos que aterrizar con precisión.

4. 🟦 Orden de los sprints

Con la indicación del profesor que ya identificamos, yo mantendría:

Sprint 0

Descubrimiento

Sprint 1

Agencia

Sprint 2

Guía

Sprint 3

Administrador

Sprint 4

Turista

El documento actual todavía tiene otra distribución —primero Admin/registro, luego Agencia, después Guía y finalmente Turista—.

Por eso este es un pendiente de actualización del documento, no simplemente del tablero.

5. 🔄 Scrum no significa “primero analizar y después programar”

El profesor hizo una aclaración muy importante.

No quiere esto:

Semanas 1-3 → análisis
Semanas 4-5 → diseño
Semanas 6-10 → desarrollo

Quiere que cada sprint recorra el ciclo completo:

Refinar HU
     ↓
Diseñar
     ↓
Implementar
     ↓
Desplegar
     ↓
Validar con usuario
     ↓
Ajustar
     ↓
Entregar

Lo dijo expresamente al explicar qué entiende por Scrum.

Por tanto, cada sprint debe contener:
Refinamiento.
Diseño.
Desarrollo.
Pruebas.
Despliegue/incremento.
Validación.
Ajustes.
Review.
Retrospectiva.
6. 🧪 Validación con usuarios en TODOS los sprints

Este punto no debe quedar escondido en el Sprint 4.

El profesor pidió expresamente:

“Incluir validación con el usuario y ajustes en cada sprint.”

Por ejemplo:

Sprint Agencia

Usuario: representante de agencia.

Validar:

creación de paquete;
campos;
flujo;
facilidad de uso.

Después:

Feedback → ajustes → nueva versión.

Sprint Guía

Usuario: guía.

Validar:

perfil;
especialidades;
idiomas;
disponibilidad.
Sprint Administrador

Usuario: administrador.

Validar:

revisión;
aprobación;
rechazo;
consulta de documentos.
Sprint Turista

Usuario: turista.

Validar:

búsqueda;
filtros;
resultados;
contacto;
PWA.
7. 📦 Cada actividad debe tener un entregable

Este es un cambio que considero fundamental.

El profesor no quiere solamente:

“Configuración de BD”.

Quiere:

Actividad: Configuración de BD
Entregable: Base de datos configurada y accesible.

Tampoco:

“Diseño módulo Agencia”.

Sino:

Actividad: Diseño módulo Agencia
Entregable: Wireframes/prototipo de módulo Agencia.

Esto lo explicó directamente cuando pidió que cada actividad tuviera su entregable.

8. 📋 Hay que preparar el Product Backlog

El profesor espera que las historias de usuario alimenten el backlog.

La relación debe quedar:

Necesidad
   ↓
Historia de Usuario
   ↓
Criterios de aceptación
   ↓
Product Backlog
   ↓
Priorización
   ↓
Sprint Backlog
   ↓
Tareas

El documento ya tiene un Anexo A dedicado a las HU, prerrequisitos y criterios de aceptación.

Pero falta llevarlas a una estructura realmente utilizable en Scrum/Kanban.

9. 📝 Revisar y posiblemente descomponer las HU

Las HU actuales son un buen punto de partida, pero algunas pueden ser demasiado grandes para una tarjeta de sprint.

Por ejemplo:

HU05

Buscador con:

zona;
precio;
idioma;
especialidad;
resultados;
contacto.

Eso puede terminar siendo varias tareas o incluso varias HU pequeñas.

Por eso debemos distinguir:

HU

Lo que el usuario necesita.

Task

Lo que ustedes deben hacer para construir la HU.

Criterio de aceptación

Cómo sabemos que funciona correctamente.

DoD

Cuándo podemos declarar que realmente está terminada.

10. ✅ El DoD debe quedar formalizado

El documento actual ya incluye el DoD inicial como entregable de Discovery.

Pero el pendiente es convertirlo en una definición operativa.

Yo dejaría un DoD general:

Una HU está DONE cuando:
 HU refinada.
 Criterios de aceptación definidos.
 Diseño terminado.
 Desarrollo terminado.
 Código integrado.
 Pruebas ejecutadas.
 Criterios de aceptación cumplidos.
 Usuario objetivo la probó.
 Feedback registrado.
 Ajustes realizados.
 Sin errores críticos.
 Evidencias almacenadas.
 Funcionalidad demostrable en Sprint Review.

Así el DONE del Kanban significa realmente algo.

11. 📊 Hay que separar Sprint Backlog de Product Backlog
Product Backlog

Todo lo que eventualmente necesita GuianzApp.

Sprint Backlog

Lo que se compromete a hacer durante las dos semanas.

Por ejemplo:

PRODUCT BACKLOG
│
├── HU02 Agencia
├── HU03 Guía
├── HU04 Disponibilidad
├── HU01 Admin
├── HU05 Turista
└── HU06 PWA

Y:

SPRINT 1
│
└── HU02
    ├── Refinamiento
    ├── Diseño
    ├── Desarrollo
    ├── Pruebas
    ├── Validación
    └── Ajustes
12. 📈 Seguimiento del sprint

El documento ya contempla elementos como:

Sprint Backlog.
Burndown.
Retrospectiva.
Velocidad.

Eso debemos conservarlo.

Para cada sprint yo registraría:

Métrica	Resultado
Story Points planificados	X
Story Points terminados	X
HU comprometidas	X
HU terminadas	X
Bugs encontrados	X
Bugs críticos	X
Hallazgos de usuarios	X
Ajustes realizados	X
Velocidad	X
13. 🧠 Business Model Canvas: todavía es un pendiente separado

El profesor no pidió resolverlo inmediatamente en esta reunión.

Dijo que en la siguiente semana iban a trabajar:

dónde incorporar el Business Model Canvas;
cuándo hacerlo;
cuándo realizar la validación del negocio.

Por tanto:

No lo mezclaría todavía con las HU técnicas.

Lo dejaría como:

Pendiente metodológico: ubicar BMC y validación del modelo de negocio.

Y después lo conectamos con la parte de emprendimiento del trabajo.

14. ⚠️ Hay una inconsistencia importante en el documento

Actualmente el documento dice:

Sprint 1 = Base y Registro / Admin.

Sprint 2 = Oferta y Paquetes.

Sprint 3 = Perfiles y Agendas.

Sprint 4 = Turista.

Pero la instrucción que recibiste posteriormente del profesor es:

Agencia → Guía → Administrador → Turista.

Por tanto, no deberíamos simplemente copiar el cronograma actual al Kanban.

Hay que actualizar:

Tabla de metodología.
Cronograma.
Anexo de HU.
Sprint Backlogs.
Entregables.
Dependencias.
Posiblemente objetivos/alcances relacionados.
15. 🟢 Lista maestra de pendientes de la reunión

Yo dejaría tu checklist así:

🔴 Prioridad alta
 Definir entregable de Discovery.
 Crear tabla metodológica Fase → Actividad → Entregable.
 Definir funcionalidades de Agencia.
 Definir funcionalidades de Guía.
 Definir funcionalidades de Administrador.
 Definir funcionalidades de Turista.
 Reorganizar los sprints según Agencia → Guía → Admin → Turista.
 Definir alcance de cada sprint.
 Definir entregable final de cada sprint.
 Incorporar validación con usuario en cada sprint.
 Incorporar ajustes posteriores a la validación.
 Construir/refinar Product Backlog.
 Definir Sprint Backlog de cada sprint.
 Formalizar DoD.
 Relacionar HU → tareas → criterios de aceptación → DoD.
🟡 Prioridad media
 Revisar pregunta generadora.
 Alinear objetivos con la validación de la solución.
 Revisar alcance y limitaciones.
 Definir dependencias entre roles.
 Definir métricas de cada sprint.
 Preparar estructura de Sprint Review.
 Preparar estructura de retrospectiva.
 Definir dónde entrará Business Model Canvas.
 Definir cuándo se hará la validación del modelo de negocio.
🟢 Posterior
 Ejecutar desarrollo de cada sprint.
 Ejecutar pruebas con usuarios.
 Registrar evidencias.
 Ajustar funcionalidades.
 UAT.
 Despliegue.
 Documentación final.
16. Lo que yo considero que el profesor quiere ver en la próxima revisión

Si tuviera que reducir toda la reunión a una sola entrega, sería esta tabla:

Fase/Sprint	Actividades	HU	Alcance	Entregables	Validación
Discovery	Empatizar, definir, idear, prototipar	HU iniciales	Problema + solución	Entrevistas, personas, Backlog, wireframes, mockups, prototipo, DoD	Usuarios
S1 Agencia	Refinar → diseñar → desarrollar → probar → validar	HU Agencia	Funcionalidades Agencia	Módulo Agencia	Agencia
S2 Guía	Refinar → diseñar → desarrollar → probar → validar	HU Guía	Perfil + disponibilidad	Módulo Guía	Guía
S3 Admin	Refinar → diseñar → desarrollar → probar → validar	HU Admin	Validación/control	Módulo Admin	Administrador
S4 Turista	Refinar → diseñar → desarrollar → probar → validar	HU Turista	Búsqueda + PWA	PMV integrado	Turistas
Cierre	UAT → fixes → deploy	Todas	Producto completo	Software desplegado + documentación	Usuarios finales

Eso es, en esencia, lo que el profesor está pidiendo.

Y hay una frase de la reunión que resume perfectamente el criterio de evaluación: al profesor le interesa que al final de cada sprint puedas decir exactamente qué le vas a entregar.

Por eso, antes de tocar el tablero Kanban, el próximo trabajo debería ser construir esta tabla maestra con las funcionalidades reales de Agencia, Guía, Administrador y Turista, y de ahí derivar todas las HU y tareas.