# GUianzApp — Dirección de marca v0.1

> **Estado:** propuesta inicial basada en las respuestas proporcionadas.

## 1. Esencia de marca

**Nombre:** GuianzApp

**Propuesta de valor:** Somos GuianzApp, ayudamos a los prestadores de servicios turísticos de Bogotá a coordinar la oferta de sus servicios de manera ágil mediante una PWA.

**Públicos:** agencias de viajes de Bogotá, guías turísticos que operan en Bogotá y turistas nacionales y extranjeros.

**Personalidad:** dinámica, bogotana, cultural, humana, confiable, moderna y cálida.

**Evitar:** caos, frialdad, ruido, suciedad, estética excesivamente corporativa o estridente.

### Concepto rector

**Bogotá se conecta. Tú la descubres.**

La identidad representa la conexión **Agencia ↔ Guía ↔ Turista** y **personas ↔ experiencias ↔ territorio**. Debe combinar una base digital/tecnológica con referencias sutiles a cerros, arquitectura, ladrillo, patrimonio, cultura y naturaleza.

---

## 2. Investigación visual y decisión cromática

La identidad de GuianzApp debe sentirse bogotana sin copiar la Marca Ciudad de Bogotá. La identidad oficial tiene lineamientos propios y una paleta que incluye rojo/coral y amarillos; por eso se propone una paleta propia, más sobria y orientada a producto digital. citeturn0search0turn0search48

La bandera de Bogotá utiliza amarillo y rojo, con significados oficiales ligados a justicia, virtud, libertad y prosperidad. GuianzApp puede tomar esa referencia cultural indirectamente mediante tonos apagados y terrosos, sin reproducir la identidad oficial. citeturn0search6

### Paleta recomendada

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Primary | Azul Andino | `#174A5B` | Marca, navegación, CTAs principales |
| Secondary | Verde Cerros | `#1F5D50` | Naturaleza, categorías y estados secundarios |
| Accent | Dorado Patrimonio | `#C6A15B` | Ratings, destacados y detalles culturales |
| Accent 2 | Ladrillo Bogotá | `#A64B3C` | Cultura, patrimonio y recursos editoriales |
| Background | Marfil Bogotá | `#F7F2E8` | Fondo general cálido |
| Surface | Blanco | `#FFFFFF` | Cards y superficies |
| Text | Carbón | `#1E2933` | Texto principal |
| Muted | Gris Piedra | `#64727A` | Texto secundario |
| Border | Gris Niebla | `#D8DEE0` | Bordes |

### Por qué esta combinación

- **Azul Andino:** confianza, tecnología y estabilidad.
- **Verde Cerros:** naturaleza y territorio.
- **Dorado Patrimonio:** patrimonio, calidez y luz sin recurrir a amarillo brillante.
- **Ladrillo Bogotá:** referencia sutil a la arquitectura y materialidad bogotana.
- **Marfil Bogotá:** reduce la sensación fría de una interfaz puramente tecnológica.

### Proporción de uso

- 60% neutrales: blanco, marfil y grises.
- 25% azul andino.
- 10% verde cerros.
- 5% acentos: dorado y ladrillo.

Los acentos deben dirigir la atención, no dominar la interfaz.

---

## 3. Tokens CSS iniciales

```css
:root {
  --color-primary: #174A5B;
  --color-primary-hover: #123D4B;
  --color-primary-active: #0E303B;
  --color-primary-soft: #E7F0F2;

  --color-secondary: #1F5D50;
  --color-secondary-hover: #184B40;
  --color-secondary-soft: #E7F1EE;

  --color-accent: #C6A15B;
  --color-accent-hover: #A98649;
  --color-accent-soft: #F5EDDC;

  --color-accent-cultural: #A64B3C;
  --color-accent-cultural-hover: #863C31;
  --color-accent-cultural-soft: #F5E8E5;

  --color-success: #28745A;
  --color-warning: #9A6B16;
  --color-error: #A64040;
  --color-info: #286A82;

  --color-background: #F7F2E8;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFFFFF;

  --color-text-primary: #1E2933;
  --color-text-secondary: #46545B;
  --color-text-muted: #64727A;
  --color-text-inverse: #FFFFFF;

  --color-border: #D8DEE0;
  --color-border-strong: #AEB9BD;
  --color-focus: #174A5B;

  --font-family-display: "Manrope", system-ui, sans-serif;
  --font-family-body: "Inter", system-ui, sans-serif;
  --font-family-mono: "JetBrains Mono", monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  --shadow-sm: 0 1px 3px rgb(30 41 51 / 0.08);
  --shadow-md: 0 4px 12px rgb(30 41 51 / 0.10);
  --shadow-lg: 0 12px 32px rgb(30 41 51 / 0.14);
}
```

Estos valores son una **propuesta inicial**, no una aprobación definitiva. Deben probarse en componentes reales y validarse con contraste WCAG antes de congelar la versión final.

---

## 4. Tipografía propuesta

### Display — Manrope
Para H1, H2, H3, cifras y elementos de identidad. Aporta una personalidad moderna, tecnológica y amigable.

### Body — Inter
Para navegación, formularios, dashboards, reservas y textos. Aporta legibilidad y neutralidad.

**Regla:** máximo dos familias tipográficas principales en la interfaz.

---

## 5. Dirección de UI

**Marketplace turístico + Travel-tech + identidad cultural bogotana.**

La interfaz debe ser moderna, ordenada, visual, cálida y fotográfica, con cards claras y acciones fáciles de localizar. Debe evitar parecer gubernamental, bancaria, infantil o una plataforma turística saturada de colores.

### Cards

- Fondo blanco.
- `border-radius: 16px`.
- Sombra sutil.
- Imagen protagonista.
- Título en Carbón.
- Metadatos en Gris Piedra.
- CTA en Azul Andino.
- Rating en Dorado Patrimonio.
- Badge de verificación en Verde Cerros.

### Roles y color

| Actor | Color asociado | Uso |
|---|---|---|
| Plataforma | Azul Andino | Acciones globales |
| Guía | Verde Cerros | Perfil y badges |
| Agencia | Azul Andino | Dashboard y gestión |
| Turista | Dorado Patrimonio | Descubrimiento y favoritos |

El color nunca debe ser la única forma de identificar un rol o estado.

---

## 6. Referentes visuales

Los referentes indicados son **Despegar, BTODigital y SB Box**.

BTODigital comunica actualmente tecnología, innovación, resultados y branding, y ofrece diseño web y branding/identidad visual. citeturn1view1turn0search12

SB Box utiliza una experiencia web visual basada en fotografía, actividades y categorías de servicios, útil como referencia para la presentación de experiencias. citeturn1view0

Despegar es un referente funcional por su contexto de viajes y marketplace. citeturn0search49

**Principios a tomar:** claridad de marketplace, orientación a conversión, fotografía, personalidad digital, cercanía y organización por servicios.

**No copiar:** logos, paletas, tipografías, composiciones ni elementos distintivos.

---

## 7. Bogotá como lenguaje visual

Recursos recomendados: siluetas abstractas de los cerros, líneas de mapas y rutas, texturas inspiradas en ladrillo, patrones geométricos discretos, arquitectura patrimonial y fotografía de personas viviendo experiencias.

Evitar utilizar el logo oficial de Bogotá como propio o hacer que GuianzApp parezca una entidad gubernamental. La Marca Ciudad está institucionalizada y tiene reglas específicas; existe además un proceso de autorización/licenciamiento para empresas que desean usarla. citeturn0search3turn0search4

---

## 8. Hipótesis de logo

Concepto: **conexión + ruta + guía + Bogotá**.

Posibles recursos: pin construido con una ruta, líneas que convergen, símbolo abstracto mapa/persona, cerros integrados con una ruta o una `G` construida mediante recorrido.

Debe funcionar en navbar, favicon, icono PWA, redes sociales y material promocional.

---

## 9. Principio visual central

> **GuianzApp no vende únicamente lugares. Conecta personas para crear experiencias en Bogotá.**

Por ello, las personas deben tener tanta importancia visual como los destinos.

---


---

# GUianzApp — Validación del modelo de plataforma v0.2

## 10.1 Decisión estratégica: modelo híbrido

**GuianzApp es ambas cosas:**

1. Un **marketplace turístico** donde los turistas consultan y reservan paquetes turísticos.
2. Una **plataforma de coordinación y gestión** donde las agencias organizan su oferta y asignan guías según sus competencias y disponibilidad.

### Ecosistema principal

```text
ADMINISTRADOR
    │ verifica y aprueba prestadores
    ▼
AGENCIA ──────────────── GUÍA
  │ crea paquetes          │ perfil profesional
  │ y recorridos           │ especialidades
  │                        │ competencias
  │ consulta perfiles      │ idiomas
  └────── asigna guía ──── │ disponibilidad
               │
               ▼
            TURISTA
               │
   consulta → compara → reserva
               │
        futuro: pago integrado
```

### Flujos clave

**Turista:** Explora paquetes → consulta información → verifica prestador → reserva.

**Agencia:** Crea paquete/recorrido → consulta disponibilidad y competencias → selecciona guía → asigna guía → gestiona la experiencia.

Esta coordinación entre agencias y guías es uno de los principales diferenciadores de GuianzApp frente a un marketplace turístico convencional.

---

# 11. Confianza y verificación

La confianza pasa a ser uno de los pilares de la identidad y del producto.

## Regla de acceso de prestadores

Los perfiles de **agencias y guías** deben ser aprobados por un administrador antes de operar como prestadores activos.

Requisito funcional indicado para el proyecto:

> El prestador debe demostrar un **RNT vigente** para ser aprobado dentro de la plataforma.

## Estados que debe contemplar el Design System

| Estado | Etiqueta | Tratamiento |
|---|---|---|
| Pendiente | En revisión | Información/neutro |
| Aprobado | Verificado | Verde + icono |
| Requiere acción | Documentación pendiente | Advertencia |
| No aprobado | No aprobado | Error |
| Suspendido | Perfil suspendido | Estado restrictivo |

El color nunca debe comunicar el estado por sí solo: debe acompañarse de texto y, cuando sea útil, iconografía.

La insignia visual de verificación debe comunicar **verificación dentro de GuianzApp** y no aparentar una certificación gubernamental.

---

# 12. Evolución del modelo de negocio

## Fase 1 — Lanzamiento

- Consulta de paquetes.
- Reserva.
- Perfiles de agencias y guías.
- Especialidades y competencias.
- Idiomas.
- Agenda y disponibilidad.
- Verificación de prestadores.
- Asignación de guías por agencias.
- Sin comisión inicial.
- Sin pago integrado inicialmente.

## Fase 2 — Monetización

Posibilidades:

- Comisión por reserva.
- Suscripción para agencias.
- Suscripción para guías.
- Planes con funciones avanzadas.
- Mayor visibilidad de perfiles o experiencias.

## Fase 3 — Evolución

- Pago integrado.
- Automatización de reservas.
- Analítica.
- Gestión más avanzada de disponibilidad.
- Nuevos mecanismos de coordinación.

**Implicación de marca:** aunque inicialmente no procese pagos, GuianzApp debe transmitir desde el principio confianza suficiente para evolucionar hacia transacciones económicas sin requerir un rediseño total.

---

# 13. Alcance geográfico

## Presente

**Bogotá es el territorio central de la plataforma.**

## Futuro

Existe la posibilidad de extenderse posteriormente a otras regiones de Colombia.

### Regla de identidad

> **Bogotá debe ser el origen de la marca, no una limitación de su sistema visual.**

Podemos inspirarnos en cerros, rutas, patrimonio, arquitectura, cultura y naturaleza sin depender exclusivamente de un monumento específico.

---

# 14. Modo visual

## Decisión

**Modo oscuro: no en la primera versión.**

El sistema se optimizará para:

- Fondo cálido.
- Superficies blancas.
- Fotografías turísticas.
- Buena legibilidad en móviles.
- Uso en exteriores.
- Dashboards profesionales.

Los tokens seguirán siendo semánticos para permitir un modo oscuro futuro.

---

# 15. Design System para React

Como la librería de componentes todavía no está definida, el manual no debe depender de una librería concreta.

Primero se definen:

1. Tokens.
2. Tipografía.
3. Color.
4. Espaciado.
5. Estados.
6. Componentes base.
7. Componentes de negocio.

Después se seleccionará la librería que mejor se adapte a la identidad.

## Componentes base

Button, IconButton, Input, Select, Textarea, Checkbox, Radio, Switch, Modal, Drawer, Dropdown, Tooltip, Toast, Alert, Tabs, Badge, Chip, Avatar, Pagination, Skeleton y Empty State.

## Componentes propios de GuianzApp

- PackageCard.
- ExperienceCard.
- AgencyCard.
- GuideCard.
- GuideAvailability.
- GuideSpecialtyBadge.
- LanguageBadge.
- VerificationBadge.
- ReservationCard.
- BookingStatus.
- AssignmentCard.
- GuideSelector.
- AvailabilityCalendar.
- TourSchedule.
- TouristSummary.
- AgencyDashboardCard.

---

# 16. Regla de diseño para los dos mundos de GuianzApp

GuianzApp combina dos contextos visuales.

## Descubrimiento turístico

Debe ser:

**inspirador · visual · cultural · cálido · cercano**

Con mayor presencia de fotografía, experiencias, personas y destinos.

## Gestión profesional

Debe ser:

**claro · confiable · organizado · ágil · tecnológico**

Con calendarios, disponibilidad, filtros, datos y acciones.

### Principio

> **La parte turística inspira; la parte de gestión organiza. Ambas pertenecen a la misma marca.**

Ejemplos:

- **Home turística:** más fotografía y descubrimiento.
- **Dashboard de agencia:** mayor densidad de información.
- **Perfil de guía:** equilibrio humano y profesional.
- **Reserva:** máxima claridad y mínima distracción.

---

# 17. Navegación conceptual

## Turista

```text
Inicio
├─ Explorar experiencias
│  ├─ Categorías
│  ├─ Resultados
│  └─ Detalle del paquete
├─ Agencias
├─ Guías
├─ Mis reservas
└─ Mi perfil
```

## Agencia

```text
Dashboard
├─ Paquetes
├─ Recorridos
│  └─ Asignar guía
├─ Guías
│  ├─ Filtrar por competencia
│  ├─ Filtrar por idioma
│  └─ Consultar disponibilidad
├─ Agenda
└─ Perfil
```

## Guía

```text
Dashboard
├─ Mi perfil
│  ├─ Especialidades
│  ├─ Competencias
│  └─ Idiomas
├─ Mi disponibilidad
├─ Mis asignaciones
├─ Mi agenda
└─ Estado de verificación
```

## Administrador

```text
Dashboard
├─ Solicitudes
│  ├─ Guías
│  └─ Agencias
├─ Verificaciones
├─ Prestadores aprobados
├─ Reservas
└─ Gestión de plataforma
```

---

# 18. Decisiones consolidadas

| Tema | Decisión |
|---|---|
| Modelo | Marketplace + gestión |
| Ciudad inicial | Bogotá |
| Expansión futura | Posible expansión a regiones de Colombia |
| Turista | Consulta y reserva inicialmente |
| Pago | Futuro |
| Monetización | Futura: comisiones y/o suscripciones |
| Guías | Perfil con competencias, especialidades, idiomas y disponibilidad |
| Agencias | Crean paquetes y asignan guías |
| Asignación | Según perfil y disponibilidad |
| Prestadores | Requieren aprobación administrativa |
| Verificación | Sí |
| Requisito operativo indicado | RNT vigente |
| Perfiles públicos | Guías y agencias aprobados |
| Modo oscuro | No |
| Frontend | React |
| Librería UI | Pendiente |
| Logo | Aún no existe |

---

# 19. Posicionamiento actualizado

Propuesta larga:

> **GuianzApp conecta la oferta turística de Bogotá: las agencias crean experiencias, los guías aportan su conocimiento y disponibilidad, y los turistas descubren y reservan recorridos confiables.**

Propuesta corta:

> **Conectamos agencias, guías y turistas para vivir Bogotá.**

Propuesta orientada al producto:

> **La plataforma que organiza y conecta la experiencia turística de Bogotá.**

Estas son alternativas de trabajo; el eslogan definitivo todavía requiere validación.

---

# 20. Pendientes para congelar la identidad v1.0

Quedan principalmente estas decisiones:

1. ¿La interfaz se lanzará en español o español + inglés?
2. ¿Qué rango de edad y perfil económico es prioritario para los turistas?
3. ¿Qué categorías de turismo tendrá la plataforma?
4. ¿Se permitirán reseñas y calificaciones?
5. ¿Existirá chat entre turista, agencia y guía?
6. ¿La marca hablará de "tú", "usted" o dependerá del idioma?
7. ¿El logo debe ser principalmente tipográfico o tener un símbolo fuerte para la PWA?
8. ¿La estética será más sobria/minimalista o incorporará patrones e ilustraciones culturales en zonas específicas?



# BRAND.md — Manual de Marca / Brief para Plataforma Turística de Bogotá

> **Objetivo:** definir una identidad visual coherente para una plataforma web que conecta **agencias de viaje, guías turísticos y turistas en Bogotá**.
>
> Este documento es el cuestionario base que debemos completar antes de fijar definitivamente colores, tipografías, componentes, iconografía y reglas de uso.
>
> **Interpretación de "identx":** por ahora lo tomo como **identidad visual + tokens CSS**. Si te referías a `index.html`, dímelo y lo incorporamos.

---

## 0. Cómo responder

No necesitas responder con lenguaje técnico. Puedes copiar este documento y responder debajo de cada pregunta.

Cuando una pregunta no aplique, escribe `N/A`.

Las preguntas marcadas con **[DECISIVA]** pueden cambiar significativamente la propuesta visual final.

---

# 1. Identidad estratégica

### 1.1 Nombre de la plataforma [DECISIVA]
- Nombre exacto:
- ¿Tiene una abreviatura?
- ¿Ya existe un dominio?
- ¿El nombre está registrado o es provisional?

### 1.2 Propósito
Completa:

> Nuestra plataforma existe para __________________________________________.

### 1.3 Propuesta de valor [DECISIVA]
¿Qué problema principal resuelve?

- Para turistas:
- Para guías:
- Para agencias:

### 1.4 Diferenciador [DECISIVA]
¿Por qué alguien usaría esta plataforma en lugar de:
- Google Maps?
- TripAdvisor?
- GetYourGuide?
- Viator?
- Airbnb Experiences?
- contactar directamente a una agencia o guía?

Respuesta:

### 1.5 Personalidad de marca [DECISIVA]

Escoge entre cada par (o indica una posición intermedia):

| Eje | Opción A | Opción B | Tu posición |
|---|---|---|---|
| 1 | Seria | Divertida | |
| 2 | Premium | Accesible | |
| 3 | Tradicional | Moderna | |
| 4 | Institucional | Cercana | |
| 5 | Sobria | Vibrante | |
| 6 | Minimalista | Expresiva | |
| 7 | Local | Internacional | |
| 8 | Aventurera | Tranquila | |
| 9 | Tecnológica | Humana | |
| 10 | Exclusiva | Inclusiva | |

### 1.6 Tres a cinco adjetivos
¿Cómo quieres que una persona describa la marca después de verla?

1.
2.
3.
4.
5.

### 1.7 ¿Qué NO debe transmitir?
Ejemplos: barata, infantil, gubernamental, corporativa, aburrida, genérica, peligrosa, elitista.

Respuesta:

---

# 2. Público objetivo

## 2.1 Turistas [DECISIVA]

- Edad principal:
- Países/ciudades de procedencia:
- ¿Colombianos, extranjeros o ambos?
- Nivel de presupuesto: bajo / medio / alto / mixto
- Viajan solos / pareja / familia / grupos:
- ¿Viajeros de negocios también?
- ¿Qué buscan principalmente?
- ¿Qué les genera desconfianza al contratar un servicio turístico?
- ¿Qué necesitan ver antes de reservar?

## 2.2 Guías [DECISIVA]

- Edad aproximada:
- ¿Guías independientes, empresas o ambos?
- ¿Guías certificados?
- ¿Qué servicios ofrecen?
- ¿Qué necesitan de la plataforma?
- ¿Qué les preocupa?
- ¿Qué información mostrarán públicamente?

## 2.3 Agencias [DECISIVA]

- Tamaño: pequeñas / medianas / grandes
- ¿Agencias tradicionales, operadores receptivos, agencias online o todas?
- ¿Qué necesitan gestionar?
- ¿Qué información mostrarán?
- ¿Qué acciones realizarán dentro de la plataforma?

---

# 3. Modelo de plataforma

### 3.1 Roles
Confirma si estos serán los roles:

- [ ] Turista
- [ ] Guía
- [ ] Agencia
- [ ] Administrador

Otros:

### 3.2 ¿Cómo se conectan?
Describe el flujo ideal:

> Turista → __________________ → __________________ → reserva

### 3.3 Funciones principales [DECISIVA]

Marca las que existirán:

- [ ] Buscar experiencias
- [ ] Buscar guías
- [ ] Buscar agencias
- [ ] Filtrar por precio
- [ ] Filtrar por ubicación
- [ ] Filtrar por categoría
- [ ] Reservar
- [ ] Pagar
- [ ] Chat
- [ ] Calificaciones
- [ ] Reseñas
- [ ] Favoritos
- [ ] Mapas
- [ ] Geolocalización
- [ ] Calendario
- [ ] Panel de agencia
- [ ] Panel de guía
- [ ] Verificación de identidad
- [ ] Verificación de agencias
- [ ] Verificación de guías
- [ ] Otro:

### 3.4 Nivel de confianza requerido [DECISIVA]
Del 1 al 10:

`1 = plataforma experimental`  
`10 = plataforma donde confiaría inmediatamente mi dinero y mis datos`

Respuesta:

---

# 4. Bogotá y territorio

### 4.1 ¿Qué tan importante es Bogotá visualmente?

- [ ] La marca debe ser claramente bogotana.
- [ ] Debe inspirarse en Bogotá pero poder crecer a otras ciudades.
- [ ] Bogotá es solo el mercado inicial y la marca debe ser internacional.

### 4.2 ¿Qué elementos de Bogotá te interesan?

Marca:

- [ ] Monserrate
- [ ] Cerros Orientales
- [ ] TransMilenio
- [ ] Arquitectura colonial
- [ ] La Candelaria
- [ ] Grafiti / arte urbano
- [ ] Cultura
- [ ] Gastronomía
- [ ] Café
- [ ] Naturaleza
- [ ] Bicicleta
- [ ] Historia
- [ ] Música
- [ ] Diversidad
- [ ] Vida nocturna
- [ ] Otro:

### 4.3 ¿Qué elementos NO quieres usar?

Respuesta:

### 4.4 ¿Quieres que la identidad se parezca a la marca oficial de Bogotá?

- [ ] Sí
- [ ] No
- [ ] Solo inspiración sutil
- [ ] No tengo preferencia

**Nota:** la plataforma debe evitar aparentar ser una entidad gubernamental o utilizar indebidamente elementos oficiales. La marca ciudad Bogotá tiene lineamientos específicos de uso.

---

# 5. Competidores y referentes

### 5.1 Competidores directos

Indica cuáles consideras competidores:

1.
2.
3.
4.
5.

### 5.2 Referentes visuales [DECISIVA]

Escribe hasta 5 marcas cuyo estilo visual te guste, aunque no sean turísticas.

Ejemplo:

- Airbnb
- Booking
- Spotify
- Duolingo
- National Geographic

Tus referentes:

1.
2.
3.
4.
5.

### 5.3 Marcas que NO te gustan

1.
2.
3.

¿Por qué?

---

# 6. Color

## 6.1 Preferencias [DECISIVA]

¿Qué colores te gustaría considerar?

- [ ] Azul
- [ ] Verde
- [ ] Amarillo
- [ ] Rojo
- [ ] Naranja
- [ ] Morado
- [ ] Turquesa
- [ ] Rosa
- [ ] Beige
- [ ] Negro
- [ ] Blanco
- [ ] Otro:

### 6.2 Colores prohibidos

¿Hay colores que definitivamente NO quieres?

### 6.3 Sensación cromática

Escoge:

- [ ] Natural
- [ ] Urbana
- [ ] Tropical
- [ ] Elegante
- [ ] Premium
- [ ] Tecnológica
- [ ] Juvenil
- [ ] Cultural
- [ ] Aventurera
- [ ] Institucional
- [ ] Cálida
- [ ] Fría

### 6.4 ¿Quieres modo oscuro?

- [ ] Sí
- [ ] No
- [ ] Sí, pero secundario
- [ ] No estoy seguro

### 6.5 ¿La interfaz debe ser accesible?

Recomendación: **sí**.

- [ ] WCAG AA
- [ ] WCAG AAA cuando sea razonable
- [ ] No definido todavía

---

# 7. Logotipo

### 7.1 ¿Existe logo actualmente?

- [ ] Sí
- [ ] No

Si existe, adjúntalo.

### 7.2 Tipo de logo preferido

- [ ] Wordmark
- [ ] Isotipo
- [ ] Imagotipo
- [ ] Isologo
- [ ] No sé

### 7.3 Conceptos que podría representar

- [ ] Ubicación / mapa
- [ ] Pin
- [ ] Viaje
- [ ] Conexión
- [ ] Personas
- [ ] Guía
- [ ] Camino
- [ ] Brújula
- [ ] Bogotá
- [ ] Experiencias
- [ ] Comunidad
- [ ] Otro:

### 7.4 ¿Quieres un símbolo que funcione como favicon/app icon?

- [ ] Sí
- [ ] No

---

# 8. Tipografía

### 8.1 Personalidad tipográfica

- [ ] Geométrica
- [ ] Humanista
- [ ] Editorial
- [ ] Moderna
- [ ] Tecnológica
- [ ] Amigable
- [ ] Elegante

### 8.2 ¿Solo Google Fonts?

- [ ] Sí
- [ ] No
- [ ] Preferiblemente

### 8.3 Fuentes que te gustan

1.
2.
3.

### 8.4 ¿La interfaz será principalmente en español?

- [ ] Sí
- [ ] Español + inglés
- [ ] Multidioma

Idiomas:

---

# 9. Fotografía

### 9.1 Estilo fotográfico

- [ ] Fotografías reales
- [ ] Fotografías profesionales
- [ ] UGC / contenido de turistas
- [ ] Ilustraciones
- [ ] Una mezcla

### 9.2 ¿Qué debe mostrar la fotografía?

- [ ] Personas
- [ ] Lugares
- [ ] Experiencias
- [ ] Gastronomía
- [ ] Cultura
- [ ] Naturaleza
- [ ] Arquitectura
- [ ] Guías
- [ ] Agencias

### 9.3 Tratamiento

- [ ] Colores naturales
- [ ] Alto contraste
- [ ] Cálido
- [ ] Frío
- [ ] Saturado
- [ ] Desaturado
- [ ] Editorial
- [ ] Espontáneo

---

# 10. Iconografía

### 10.1 Estilo

- [ ] Lineal
- [ ] Filled
- [ ] Duotono
- [ ] Geométrico
- [ ] Redondeado
- [ ] Minimalista

### 10.2 Librería

- [ ] Lucide
- [ ] Material Symbols
- [ ] Font Awesome
- [ ] Otra:
- [ ] Diseñaremos una propia

---

# 11. UI / Diseño de interfaz

### 11.1 Estilo general [DECISIVA]

- [ ] Minimalista
- [ ] Marketplace
- [ ] Editorial
- [ ] Travel-tech
- [ ] Premium
- [ ] Colorido
- [ ] Card-based
- [ ] Muy visual
- [ ] Muy funcional

### 11.2 Bordes

- [ ] Rectos
- [ ] Poco redondeados
- [ ] Medianamente redondeados
- [ ] Muy redondeados

### 11.3 Sombras

- [ ] Sin sombras
- [ ] Sutiles
- [ ] Visibles
- [ ] Profundas

### 11.4 Densidad

- [ ] Compacta
- [ ] Equilibrada
- [ ] Espaciosa

### 11.5 Botones

Preferencia:

- [ ] Rectangulares
- [ ] Rounded
- [ ] Pill

---

# 12. Componentes que deben definirse en el manual

Confirma cuáles necesitarás:

- [ ] Navbar
- [ ] Footer
- [ ] Botones
- [ ] Inputs
- [ ] Selects
- [ ] Checkboxes
- [ ] Radio buttons
- [ ] Switches
- [ ] Cards
- [ ] Badges
- [ ] Chips
- [ ] Modales
- [ ] Toasts
- [ ] Alerts
- [ ] Tooltips
- [ ] Tabs
- [ ] Breadcrumbs
- [ ] Pagination
- [ ] Dropdowns
- [ ] Rating
- [ ] Calendario
- [ ] Mapa
- [ ] Perfil de usuario
- [ ] Perfil de guía
- [ ] Perfil de agencia
- [ ] Tarjeta de experiencia
- [ ] Tarjeta de reserva
- [ ] Estados vacíos
- [ ] Loading / skeleton
- [ ] Error states

---

# 13. Estados funcionales y semánticos

Necesitamos definir colores para:

- Primary
- Secondary
- Accent
- Success
- Warning
- Error
- Info
- Neutral
- Disabled
- Focus
- Hover
- Active
- Selected

### ¿Quieres que Success/Warning/Error sigan convenciones estándar?

- [ ] Sí
- [ ] No
- [ ] Mientras no rompan la identidad

---

# 14. Tecnología

### 14.1 Frontend

- Framework:
- Versión:
- CSS:
- Tailwind:
- Bootstrap:
- CSS Modules:
- Otro:

### 14.2 ¿Usas variables CSS?

- [ ] Sí
- [ ] No
- [ ] Quiero implementarlas

### 14.3 ¿Quieres que el manual entregue tokens listos para código?

- [ ] Sí
- [ ] No

**Recomendado:** sí.

---

# 15. Design tokens

La versión final del manual debería definir, como mínimo:

```css
:root {
  /* Brand */
  --color-primary: ;
  --color-primary-hover: ;
  --color-primary-active: ;

  --color-secondary: ;
  --color-accent: ;

  /* Semantic */
  --color-success: ;
  --color-warning: ;
  --color-error: ;
  --color-info: ;

  /* Surfaces */
  --color-background: ;
  --color-surface: ;
  --color-surface-elevated: ;

  /* Text */
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-text-muted: ;
  --color-text-inverse: ;

  /* Borders */
  --color-border: ;
  --color-border-strong: ;

  /* Focus */
  --color-focus: ;

  /* Typography */
  --font-family-display: ;
  --font-family-body: ;
  --font-family-mono: ;

  /* Radius */
  --radius-sm: ;
  --radius-md: ;
  --radius-lg: ;
  --radius-xl: ;
  --radius-full: ;

  /* Spacing */
  --space-1: ;
  --space-2: ;
  --space-3: ;
  --space-4: ;
  --space-6: ;
  --space-8: ;
  --space-12: ;
  --space-16: ;

  /* Shadows */
  --shadow-sm: ;
  --shadow-md: ;
  --shadow-lg: ;
}
```

---

# 16. Reglas de accesibilidad

La identidad no debe depender únicamente del color.

Para la interfaz web se recomienda trabajar como mínimo con **WCAG 2.2 AA**:

- Texto normal: contraste mínimo **4.5:1**.
- Texto grande: contraste mínimo **3:1**.
- Componentes e indicadores visuales relevantes: mínimo **3:1** frente a colores adyacentes.

La paleta final deberá comprobarse con estos criterios antes de aprobarse.

---

# 17. Uso del color

En el manual final debemos especificar:

### Color primario
- HEX
- RGB
- HSL
- OKLCH, si se usa
- Uso permitido
- Uso prohibido
- Colores de texto compatibles
- Contraste

### Color secundario
Misma información.

### Accent
Misma información.

### Estados semánticos
Success / Warning / Error / Info.

### Escala neutral
Por ejemplo:

`neutral-50 → neutral-100 → ... → neutral-950`

---

# 18. Arquitectura de color

La propuesta final debe indicar porcentajes aproximados de uso:

- Dominante:
- Secundario:
- Acento:
- Neutrales:

**Regla deseada:**

> El color de acento debe utilizarse para acciones importantes y no competir con el contenido turístico.

---

# 19. Responsive design

### Breakpoints actuales

Si ya existen:

- Mobile:
- Tablet:
- Desktop:
- Large desktop:

Si no existen, proponerlos.

### ¿Mobile-first?

- [ ] Sí
- [ ] No

---

# 20. Tono de comunicación

### ¿Cómo habla la marca?

- [ ] Tú
- [ ] Usted
- [ ] Neutral

### Personalidad del texto

- [ ] Cercana
- [ ] Profesional
- [ ] Aventurera
- [ ] Inspiradora
- [ ] Directa
- [ ] Divertida
- [ ] Elegante

### Ejemplo de CTA preferido

- "Explorar Bogotá"
- "Descubrir experiencias"
- "Encontrar un guía"
- "Planear mi viaje"
- Otro:

---

# 21. Confianza y seguridad

Como habrá reservas y posiblemente pagos:

### ¿Qué señales de confianza existirán?

- [ ] Guía verificado
- [ ] Agencia verificada
- [ ] Reseñas verificadas
- [ ] Identidad verificada
- [ ] Pago seguro
- [ ] Soporte
- [ ] Políticas de cancelación
- [ ] Otro:

### ¿Quieres que estos elementos tengan un tratamiento visual especial?

Respuesta:

---

# 22. Escalabilidad

### 22.1 ¿La plataforma crecerá fuera de Bogotá?

- [ ] No
- [ ] Sí, otras ciudades de Colombia
- [ ] Sí, Latinoamérica
- [ ] Sí, internacionalmente

### 22.2 ¿El nombre y la identidad deben funcionar fuera de Bogotá?

- [ ] Sí
- [ ] No

---

# 23. Restricciones

### ¿Existe alguna restricción?

- Presupuesto:
- Tecnológica:
- Institucional:
- Académica:
- Tiempo:
- Legal:
- Otra:

---

# 24. Material existente

¿Ya tienes alguno?

- [ ] Logo
- [ ] Bocetos
- [ ] Wireframes
- [ ] Diseño en Figma
- [ ] Capturas de pantalla
- [ ] Página web
- [ ] Prototipo
- [ ] Paleta inicial
- [ ] Tipografía
- [ ] Nada todavía

**Si existe material visual, adjúntalo.**

---

# 25. Decisión rápida

Si quieres avanzar rápido, responde solamente estas 12 preguntas primero:

1. ¿Cuál es el nombre de la plataforma?
2. ¿Cuál es su propuesta de valor en una frase?
3. ¿Quién es el usuario principal?
4. ¿Qué quieres que transmita la marca?
5. ¿Qué NO quieres que transmita?
6. ¿Debe sentirse más colombiana/bogotana o internacional?
7. ¿Qué 3 colores te gustan?
8. ¿Qué 3 colores no quieres?
9. ¿Qué 3 marcas tienen un estilo que te gusta?
10. ¿Qué 3 marcas tienen un estilo que NO te gusta?
11. ¿Quieres una interfaz minimalista, colorida, premium, tecnológica o una combinación?
12. ¿Qué stack frontend/CSS estás usando?

---

# 26. Entregable final que construiremos

Después de responder el cuestionario, este `BRAND.md` se convertirá en un **manual de marca + sistema de diseño**, incluyendo:

1. Estrategia de marca.
2. Personalidad.
3. Concepto visual.
4. Paleta principal.
5. Paleta secundaria.
6. Escala de neutrales.
7. Colores semánticos.
8. Tabla de contraste.
9. Tipografías.
10. Escala tipográfica.
11. Logo y reglas de uso.
12. Iconografía.
13. Fotografía.
14. Ilustración.
15. Espaciado.
16. Grid.
17. Border radius.
18. Sombras.
19. Estados de interacción.
20. Componentes UI.
21. Responsive.
22. Accesibilidad.
23. Ejemplos de uso correcto/incorrecto.
24. **Variables CSS listas para producción.**
25. **Design tokens listos para implementar en el frontend.**

---

# 27. Fuentes y criterios de investigación

La selección final no se hará únicamente por gusto estético. Se contrastará con:

- Identidad y contexto turístico de Bogotá.
- Referentes de turismo y marketplaces digitales.
- Diferenciación frente a competidores.
- Psicología y semántica del color.
- Legibilidad.
- Accesibilidad WCAG.
- Aplicación en interfaces web.
- Compatibilidad con fotografías de destinos.
- Escalabilidad de la identidad.

Como punto de partida, se tendrá en cuenta que Bogotá dispone de una identidad de marca ciudad con lineamientos oficiales propios, por lo que la identidad de la plataforma deberá distinguirse claramente de una marca gubernamental si no existe una alianza formal.

---

# 28. Resultado esperado

La meta es poder responder:

> **"¿Qué color, fuente, tamaño, espaciado, borde, icono y estilo debo utilizar aquí?"**

sin tener que tomar una decisión de diseño desde cero cada vez.

El manual debe funcionar como la **fuente única de verdad visual (Single Source of Truth)** de la plataforma.
