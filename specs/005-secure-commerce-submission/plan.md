# Implementation Plan: Alta segura y trilingüe de comercios

**Branch**: `005-secure-commerce-submission` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-secure-commerce-submission/spec.md`

## Summary

Convertir el alta guiada de comercios ya existente en CA y ES en un único flujo funcional CA/ES/EN.
El navegador conservará la interfaz actual, añadirá la ruta inglesa y enviará un único multipart a
una Netlify Function solo después de verificar el email privado con un token ligado al propósito
`comercio`. La Function aplicará una allowlist estricta, validará estructura y límites —incluido el
máximo individual y agregado canónico de 4.000.000 bytes—, consumirá el token una sola vez y reenviará por el canal interno
autenticado. Strapi revalidará contenido, relaciones y archivos, normalizará todas las imágenes a la
cuarentena privada y creará una única `solicitud-comercio` en `pendent`. La moderación será manual y
ningún estado creará, modificará ni publicará un `comercio`.

## Technical Context

**Language/Version**: Astro/TypeScript y JavaScript ESM sobre Node.js >=22.12 en frontend/Functions;
JavaScript CommonJS sobre Node.js 20–24 en Strapi

**Primary Dependencies**: Astro 7.2.4, Tailwind CSS 4.3.3, Netlify Functions, Upstash Redis y Resend
ya usados por la verificación, Strapi 5.41.1 y Sharp 0.33.5 ya usado por la cuarentena

**Storage**: Upstash temporal existente para challenge/token; colección privada
`solicitud-comercio` y almacenamiento privado de cuarentena ya existente en Strapi

**Testing**: probes Node estrictos con dobles y fixtures locales, matriz manual de navegador
CA/ES/EN, builds de Astro y Strapi, generación de tipos Strapi, inspección de diffs y regresión de
formularios/verificación/directorio; E2E desplegado diferido

**Target Platform**: sitio Astro estático en navegador moderno, Netlify Functions y Strapi privado

**Project Type**: aplicación web distribuida en dos repositorios Git coordinados

**Performance Goals**: cero consultas runtime a Strapi al cargar el formulario; un único envío
navegador→Function y una única recepción Function→Strapi; hasta seis imágenes con suma
<=4.000.000 bytes

**Constraints**: static-first, CA/ES/EN, sin dependencias/servicios/infraestructura nuevos, sin
uploads separados, sin publicación automática, sin persistencia de IP o material de verificación,
sin TTL o política de retención nueva

**Scale/Scope**: tres rutas públicas sobre una plantilla y un componente compartidos, un endpoint
de Function, una sección interna ya existente ampliada y un content type privado ya existente

## Constitution Check

*GATE: superado antes de Phase 0 y revalidado tras Phase 1.*

| Principio | Evaluación inicial | Revisión tras diseño |
|---|---|---|
| I. Producto local y participación editorial | PASS: el visitante propone una ficha; el equipo editorial decide. | PASS: `aprovat` solo resuelve la solicitud y no crea contenido público. |
| II. Arquitectura static-first | PASS: categorías y subcategorías siguen integrándose durante build. | PASS: solo el envío explícito cruza Function→Strapi; no se añade lectura dinámica pública. |
| III. Privacidad y seguridad | PASS: se reutilizan verificación, uso único, autenticación interna y cuarentena. | PASS: el propósito `comercio` se liga criptográficamente, los datos técnicos se eliminan antes de Strapi, las imágenes quedan privadas y el email se elimina al cerrar moderación. |
| IV. Integridad e infraestructura | PASS: no hay migración, despliegue ni infraestructura nueva. | PASS: el schema se amplía sin eliminar los campos Media heredados; quedan ocultos e inutilizados por el flujo para evitar una modificación destructiva. |
| V. Simplicidad y coste proporcional | PASS: se usan las capacidades ya instaladas. | PASS: una rama dedicada sobre helpers existentes evita servicios o dependencias adicionales. |
| VI. Paridad multidioma y no regresión | PASS: el mismo formulario cubrirá CA/ES/EN. | PASS: ruta, copy, reglas, éxito y errores quedan definidos para los tres idiomas y se exige regresión del directorio. |
| VII. Repositorios coordinados y contratos explícitos | PASS: la feature necesita frontend/Function y backend. | PASS: [contracts/commerce-submission-contract.md](./contracts/commerce-submission-contract.md) fija ambos límites de confianza y el orden coordinado. |

No existen violaciones constitucionales ni excepciones que justificar.

## Architecture and Flow

### Superficie pública y adaptación del formulario

Se conservan `src/pages/alta-comerc.astro`, `src/pages/es/alta-comercio.astro`,
`CommerceSignupPage.astro` y `CommerceSignupFlow.astro`. Se crea únicamente la ruta inglesa
`src/pages/en/businesses/add-a-business.astro`. La plantilla pasa a aceptar `ca | es | en`, elige
`nombre`, `nombre_es` o `nombre_en` sin cambiar el catálogo construido estáticamente y mantiene
desactivado cualquier acceso runtime a Strapi. Los CTA ingleses dejan de mostrar *Coming soon* y
apuntan a la nueva ruta.

`CommerceSignupFlow.astro` conserva sus pantallas, previews y navegación. Se transforma su
contenedor en un formulario real, completa copy EN y añade nombres/hidden fields para la
serialización. La categoría/subcategoría seleccionadas son `documentId`; horarios, servicios y redes
se serializan como JSON canónico justo antes de enviar. La colección de galería mantenida por la UI
se incorpora explícitamente al `FormData`, por lo que quitar o añadir imágenes en varias selecciones
no depende del último valor del `<input>`.

Un helper dedicado `src/lib/commerceSubmission.ts` contiene el límite, la construcción del multipart
y el fetch específico de Comercio. Rechaza tipo, cantidad, tamaño individual o suma superior a
4.000.000 bytes antes de llamar a la red y exige JSON `{ ok: true }`. No modifica ni reutiliza
`netlifySubmission.ts`, cuyo contrato compartido permanece intacto. `CommerceSignupFlow.astro`
sigue siendo la fuente de verdad de estado/presentación y no se rediseña ni se migra a otro
framework.

El último paso incorpora `EmailVerificationBlock` con scope `comercio`. El botón final solo se
habilita si el formulario completo y la autorización del mismo email son válidos. El envío usa el
transporte seguro existente, espera JSON `{ ok: true }` y solo entonces navega a `/enviat/`,
`/es/enviado/` o `/en/sent/`. En cualquier fallo conserva los valores y archivos que el navegador
mantenga, muestra un error localizado y reinicia la verificación porque el token puede haberse
consumido.

### Verificación ligada al propósito

La allowlist cerrada de scopes pasa a ser:

```text
agenda | veu | comunicat | communicat-report | foto-mes | millora | comercio
```

El navegador envía `scope` tanto al solicitar como al confirmar el código. El formato persistido del
challenge no cambia: el hash del código incluye scope y el token se almacena bajo un hash que también
incluye scope. La Function de comercio consume con `{ token, email, scope: "comercio" }`; un token emitido
para cualquier otro propósito produce cero solicitudes y tampoco se consume bajo su clave correcta.
Todos los handlers existentes pasan su scope fijo al consumidor compartido, de modo que la mejora no
debilita Agenda, Veus, Comunicats, denuncias, Foto del mes ni Millorem Pineda. Challenges/tokens
cuyos hashes se generaron antes de incluir el scope fallan de forma segura y exigen una nueva
verificación, sin necesitar una marca de scope persistida.

### Function pública

`comercio-submission.mjs` implementa la validación pura y separación entre:

- `verificationEmail`, usado solo para consumir el token;
- `payload`, que contiene únicamente los datos editoriales allowlisted;
- `images`, con los roles `imagen_principal`, `logo` y `galeria`.

`comercio-submission-http.mjs` contiene su parser multipart específico y acepta solo
`POST multipart/form-data`, limita el request a 5.000.000 bytes,
rechaza duplicados textuales y cualquier file field desconocido, exige exactamente una principal,
como máximo un logo y como máximo cuatro galerías, y revalida cada archivo y el agregado
<=4.000.000 bytes. Tras
validar por completo, consume el token `comercio` y llama una sola vez al transporte interno. Declara
el patrón existente de rate limit Netlify por `ip` y `domain`, pero el código no lee ni persiste la
IP. No hay idempotency key ni retry automático.

El helper compartido `submission-http.mjs` permanece intacto y se usa únicamente como referencia de
patrones/respuestas y como objetivo de regresión single-image. El transporte a Strapi conserva la
rama `image` existente y añade la sección `comercio` con nombres técnicos por rol; jamás reenvía
los nombres originales.

### Recepción privada en Strapi

El endpoint interno autenticado existente `/api/internal/submissions/:section` ya despacha al
servicio genérico. Se añade `comercio` a su configuración, sin crear una ruta pública ni otro
controller. El middleware actual autentica antes del body parser y limita el multipart interno a 5
MB.

`internal-submission-request.js` incorpora una rama de comercio que:

1. parsea un payload JSON <=16 KB y rechaza cualquier clave fuera de la allowlist;
2. valida tipos, longitudes, URL/email, consentimiento, contacto mínimo y grupos repetibles;
3. resuelve categoría activa/publicada y sus subcategorías activas/publicadas mediante Documents
   Service; exige subcategoría solo si existe al menos una vigente y comprueba su pertenencia;
4. preflighta todos los archivos y su suma antes de escribir ninguno;
5. normaliza y guarda secuencialmente en cuarentena, registrando cada ID creado;
6. crea una sola solicitud con estado server-owned `pendent` y relaciones ya validadas;
7. ante cualquier error después del primer archivo, elimina todos los IDs creados; si esa limpieza
   excepcional falla, el job existente de huérfanos los recoge tras su periodo de gracia.

No se llama nunca al Documents Service de `api::comercio.comercio` durante creación o moderación.
Las coincidencias y duplicados no se consultan.

### Modelo y moderación

El content type `solicitud-comercio` se reutiliza. Se añade idioma `en`, límites declarativos
compatibles, referencias privadas separadas para principal/logo/galería y los campos internos de
auditoría que usa la moderación existente. Los campos Media heredados `imagen_principal`, `logo` y
`galeria` no se eliminan —evitando una operación destructiva—, pero dejan de ser obligatorios, quedan
privados/no configurables/no visibles y el nuevo flujo nunca los escribe ni promociona hacia ellos.
El schema permite `email_contacto = null` para el estado terminal, mientras la recepción server-side
lo exige y valida para toda creación `pendent`.

La moderación registra la sección `comercio`. `start-review`, `approve` y `reject` realizan solo las
transiciones permitidas, la auditoría y el borrado terminal del email descrito a continuación; la
rama comercio no ejecuta `promotePrivateImage`, no elimina las imágenes y no invoca ninguna
operación sobre `comercio`. `email_contacto` puede existir en
`pendent` y `en_revisio`, pero toda transición a `aprovat` o `rebutjat` lo escribe como `null` en
la misma actualización de cierre. El panel privado muestra
principal, logo y hasta cuatro imágenes de galería mediante la ruta Admin autenticada; esta acepta
solo rol cerrado e índice 0–3 y nunca expone IDs de cuarentena. El copy de confirmación de comercio
deja explícito que aprobar/rechazar no publica ni mueve imágenes a Media.

`src/index.js` registra durante el arranque el middleware de Document Service definido en
`src/services/commerce-submission-write-guard.js`. El guard se limita al UID privado de
`solicitud-comercio`, utiliza un marcador `Symbol` exclusivamente interno y bloquea creación,
eliminación, clonación, publicación y mutaciones directas de estado, lifecycle y demás campos
server-owned. Las únicas escrituras protegidas autorizadas son la creación interna `pendent` y las
transiciones B1/H1 validadas; `observaciones_internas` continúa siendo editorial.

`private-submission-image-cleanup.js` considera protegidas todas las referencias de la solicitud de
comercio, en cualquier estado. Fuera de la eliminación constitucional del email al cerrar, no se
añaden TTL, jobs ni anonimización/borrado automático de otros datos privados; la política general de
conservación se resolverá fuera de esta feature.

## Cross-repository Coordination

1. Ajustar primero schema, recepción, cuarentena múltiple y moderación del backend.
2. Regenerar tipos y probar el backend sin tocar contenido público.
3. Extender de forma compatible el propósito de verificación y pasar scopes fijos en todos los
   handlers existentes.
4. Implementar validador/handler/transporte de comercio.
5. Activar el formulario CA/ES/EN y los CTA ingleses.
6. Ejecutar contratos, matriz y regresiones en ambos repositorios.

El despliegue no forma parte de la feature. En un futuro despliegue coordinado, backend compatible
debe preceder a la Function/frontend; el recorrido real queda `DEFERRED — predeployment`.

## Project Structure

### Documentation (this feature)

```text
specs/005-secure-commerce-submission/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── commerce-submission-contract.md
└── checklists/
    └── requirements.md

scripts/qa/commerce-submission-qa.mjs              # CREATE: persistent local QA harness; never bundled
```

`tasks.md` no se crea durante PLAN.

### Source Code (authorized implementation scope)

```text
# guiapineda-astro — frontend
src/pages/en/businesses/add-a-business.astro        # CREATE
src/pages/index.astro                               # MODIFY: EN CTA
src/templates/CategoryPage.astro                    # MODIFY: EN CTA
src/templates/SubcategoryPage.astro                 # MODIFY: EN CTA
src/templates/CommerceSignupPage.astro              # MODIFY: lang EN and localized catalogue
src/components/CommerceSignupFlow.astro             # MODIFY: EN, real form, verification and submit
src/components/EmailVerificationBlock.astro         # MODIFY: add comercio scope
src/i18n/en.json                                    # MODIFY: remove Coming soon copy
src/lib/commerceSubmission.ts                       # CREATE: multipart/image guard and direct fetch
src/lib/emailVerification.ts                        # MODIFY: transmit scope
src/lib/emailVerificationController.ts              # MODIFY: read/transmit scope

# guiapineda-astro — Functions
netlify/functions/comercio-submission.mjs           # CREATE: pure validation/payload split
netlify/functions/comercio-submission-http.mjs      # CREATE: HTTP orchestration
netlify/functions/verification-request-code.mjs     # MODIFY: accept validated scope
netlify/functions/verification-verify-code.mjs      # MODIFY: accept validated scope
netlify/functions/agenda-submission-http.mjs        # MODIFY: fixed scope on token consume
netlify/functions/veu-submission-http.mjs           # MODIFY: fixed scope on token consume
netlify/functions/comunicat-submission-http.mjs     # MODIFY: fixed scope on token consume
netlify/functions/communicat-report-http.mjs        # MODIFY: fixed scope on token consume
netlify/functions/foto-mes-submission-http.mjs      # MODIFY: fixed scope on token consume
netlify/functions/millora-submission-http.mjs       # MODIFY: fixed scope on token consume
netlify/functions/_shared/verification-core.mjs     # MODIFY: closed scope validator
netlify/functions/_shared/verification-request.mjs  # MODIFY: bind challenge/code to scope
netlify/functions/_shared/verification-check.mjs    # MODIFY: verify scope and mint scoped token
netlify/functions/_shared/verification-token.mjs    # MODIFY: consume token with expected scope
netlify/functions/_shared/submission-verification.mjs # MODIFY: require handler-owned scope
netlify/functions/_shared/strapi-submission.mjs      # MODIFY: comercio and multiimage transport

# guiapineda-strapi — backend
src/index.js                                           # MODIFY: register comercio Document Service write guard
src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json # MODIFY
src/services/commerce-submission-write-guard.js        # CREATE: enforce B1/H1 and server-owned lifecycle
src/services/internal-submission-request.js          # MODIFY: comercio validator/atomic create
src/services/private-submission-image-cleanup.js     # MODIFY: protect all comercio references
src/services/private-moderation-image.js             # MODIFY: role/index image resolution
src/services/submission-moderation-lifecycle.js      # MODIFY: private-only comercio lifecycle
src/api/internal-moderation/controllers/internal-moderation.js # MODIFY: role/index query
src/admin/components/PrivateModerationImagePanel.jsx # MODIFY: comercio panel and safe copy

# guiapineda-strapi — generated derivative
types/generated/contentTypes.d.ts                    # REGENERATE from schema
```

Las rutas CA/ES existentes se reutilizan sin modificación. Los paths de la lista son los únicos
archivos de aplicación autorizados para modificación o creación. Si IMPLEMENT descubre una
necesidad real fuera de esta lista, debe detenerse y volver a PLAN antes de tocarla.

Los siguientes archivos son exclusivamente de **inspección y regresión** y MUST permanecer sin
modificación durante IMPLEMENT:

```text
src/lib/netlifySubmission.ts
netlify/functions/_shared/verification-store.mjs
netlify/functions/_shared/submission-http.mjs
```

El purpose se liga mediante los hashes de código/token sin alterar el formato persistido por
`verification-store.mjs`; el multipart multiimagen se parsea solo en
`comercio-submission-http.mjs`; y `commerceSubmission.ts` construye y envía directamente el
`FormData` de Comercio. Los tres archivos se incluyen en la regresión para demostrar su invariancia.

**Structure Decision**: se mantienen los dos repositorios y los límites actuales. El formulario
compartido absorbe la paridad visual; la Function separa el límite público del secreto interno; el
servicio Strapi existente recibe una rama explícita de comercio; la cuarentena y el panel de
moderación se amplían sin crear almacenamiento o APIs públicas nuevas.

## Validation Strategy

- Builds completos de Astro y Strapi y regeneración de tipos sin instalar dependencias.
- Harness Node estricto versionado en `scripts/qa/commerce-submission-qa.mjs`, con dobles limitados
  a fronteras externas y fixtures Sharp temporales; cualquier aserción lanza y `PASS` solo aparece
  al final. Las fixtures pueden residir en el directorio temporal del sistema, pero el harness no
  depende de artefactos persistentes fuera del repositorio ni participa en el bundle de Astro.
- Matriz de navegador CA/ES/EN sobre las tres rutas con el único shim estricto de `window.fetch`
  documentado en quickstart: seis recorridos, catálogo localizado, grupos, límites, verificación
  simulada, fallo recuperable y navegación de éxito; sin email ni servicios desplegados.
- Contrato de Function: allowlist, multipart, 1+0/1+0..4 archivos, tipos, 4.000.000 bytes
  individual/agregado,
  orden validación→consumo→Strapi, 4xx/503/201 y cero retry.
- Contrato backend: relaciones vigentes, componentes exactos, normalización, rollback de todos los
  archivos, una creación privada y cero llamadas a `api::comercio.comercio`.
- Moderación: cuatro estados, imágenes privadas por rol, observaciones internas y cero promoción a
  Media, publicación o mutación pública.
- Regresión de los seis scopes previos de verificación y de Agenda/Veu/Comunicats/denuncia/Foto del
  mes/Millorem Pineda, además de directorio, categorías, subcategorías y fichas CA/ES/EN.
- `git diff --check`, diff completo y `git status` en ambos repositorios.
- Email real, Upstash/Netlify reales, Function→Strapi desplegado y Content Manager desplegado:
  `DEFERRED — predeployment`.

## Risks and Mitigations

| Riesgo | Mitigación |
|---|---|
| El componente existente es grande y concentra estado UI | Cambio quirúrgico: conservar navegación/previews y extraer solo construcción/guardas del multipart. |
| Un token se consume y Strapi falla al normalizar o crear | No mostrar éxito, reiniciar autorización y exigir un código nuevo; sin retry automático. |
| Un archivo falla después de guardar otros | Registro de IDs y rollback de todos; limpieza de huérfanos existente como defensa secundaria. |
| Multipart de imágenes más campos supera el margen | Máximo agregado canónico de 4.000.000 bytes, texto acotado y request público/interno de 5.000.000 bytes bajo el límite buffered indicado. |
| Ampliar propósito rompe formularios existentes | Scope fijo en todos los handlers y matriz de regresión completa; registros legacy fallan seguro. |
| Campos Media heredados inducen publicación accidental | Ocultarlos y no configurarlos, no eliminarlos, y prohibir su escritura/promoción en servicio y lifecycle. |
| Categoría construida queda obsoleta | Revalidación activa/publicada y relación exacta en Strapi antes de guardar imágenes. |
| No existe política general de retención cerrada | Aplicar solo el borrado obligatorio de `email_contacto` al cerrar moderación; no inventar TTL o borrado de otros datos y registrar la política general como riesgo posterior no bloqueante. |

No hay bloqueos técnicos ni ambigüedades pendientes antes de TASKS. La única evidencia no disponible
es el recorrido con infraestructura desplegada, ya clasificado como `DEFERRED — predeployment`.

## Complexity Tracking

No aplica: el diseño no introduce excepciones constitucionales.
