# Implementation Plan: Denuncia privada de Comunicats

**Branch**: `003-communicat-reporting` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-communicat-reporting/spec.md`

## Summary

Añadir a cada detalle estático de Comunicat una acción secundaria de denuncia en CA, ES y EN.
El visitante completará un formulario privado, verificará su email mediante el mecanismo temporal
existente y enviará la denuncia a una Netlify Function. La Function consumirá el token de un solo
uso, eliminará email y token del payload y llamará mediante autenticación interna a Strapi. Un
servicio backend específico comprobará que el `documentId` y el slug corresponden a un Comunicat
publicado y creará una entrada privada independiente con estado `pendiente`. No se consultará
Strapi al leer el artículo ni se modificará el Comunicat como efecto de una denuncia.

## Technical Context

**Language/Version**: TypeScript/JavaScript ESM; Node.js >=22.12 en frontend/Functions y Node.js
20–24 en backend

**Primary Dependencies**: Astro 7.2.4, Tailwind CSS 4.3.3, Netlify Functions, Upstash Redis ya
existente para verificación temporal, Strapi 5.41.1

**Storage**: almacenamiento temporal de verificación existente en Upstash; nueva colección privada
de Strapi en el almacenamiento ya configurado por el backend

**Testing**: builds de Astro y Strapi, generación de tipos de Strapi, comprobaciones Node locales
con dobles controlados, inspección de HTML estático CA/ES/EN y matriz manual local del formulario;
E2E desplegado diferido

**Target Platform**: sitio estático Astro en navegador moderno; Netlify Functions; Strapi privado

**Project Type**: aplicación web distribuida en dos repositorios Git coordinados

**Performance Goals**: coste dinámico cero durante la lectura; cargar y ejecutar el flujo solo en
la página de detalle; una única llamada interna a Strapi por envío aceptable

**Constraints**: static-first; CA/ES/EN; sin dependencias, servicios o infraestructura nuevos; email
verificado pero no persistido; sin nombre, IP ni otros identificadores personales en la denuncia;
sin adjuntos; sin retirada o modificación automática del Comunicat

**Scale/Scope**: una superficie pública compartida, un formulario multidioma, un endpoint público
de Function, una sección interna y una colección privada de moderación

## Constitution Check

*GATE: superado antes de Phase 0 y revalidado tras Phase 1.*

| Principio | Evaluación inicial | Revisión tras diseño |
|---|---|---|
| I. Producto local y participación editorial | PASS: la denuncia entra en moderación privada y no crea conversación ni publicación ciudadana. | PASS: el modelo solo admite revisión humana. |
| II. Arquitectura static-first | PASS: la lectura no hace consultas runtime; solo el envío explícito usa Function. | PASS: `documentId` y slug se incorporan al HTML generado y Strapi se consulta solo dentro del canal privado. |
| III. Privacidad y seguridad | PASS: se conserva verificación, token de un solo uso, rate limiting y autenticación interna. | PASS: email y token se consumen en la Function y no cruzan al registro editorial; no se persisten nombre ni IP. |
| IV. Integridad e infraestructura verificada | PASS: no hay migración, despliegue ni infraestructura nueva. | PASS: se añade un content type nuevo y no se modifica contenido existente. |
| V. Simplicidad y coste proporcional | PASS: solo se reutilizan capacidades ya instaladas. | PASS: no hay dependencias ni servicios nuevos y se evita una abstracción compartida innecesaria. |
| VI. Paridad multidioma y no regresión | PASS: una plantilla y un componente compartidos cubren CA/ES/EN. | PASS: copy, estados y validaciones quedan definidos para los tres idiomas y se valida regresión. |
| VII. Repositorios coordinados y contratos explícitos | PASS: frontend/Function y backend son necesarios y sus contratos se documentan. | PASS: el cambio coordinado y el orden de validación quedan definidos en `contracts/`. |

No existen violaciones constitucionales ni excepciones que justificar.

## Architecture and Flow

### Public surface and browser flow

`src/templates/ComunicatArticlePage.astro`, compartida por CA/ES/EN, insertará
`CommunicatReportFlow` inmediatamente después de `StrapiBlocks` y antes de la sección de
relacionados. Recibirá `lang`, `comunicat.documentId` y `comunicat.slug`; el identificador estable es
el `documentId` editorial y el slug es solo contexto público reconocible y comprobación adicional.

El componente presentará una acción secundaria que despliega el formulario en la propia página.
Incluirá copy explícito CA/ES/EN, un motivo cerrado, explicación de hasta 1.000 caracteres,
email, el bloque de verificación existente y estados de error/confirmación. No pedirá nombre,
teléfono, consentimiento comercial, adjuntos ni ningún dato público. La explicación será
obligatoria y no vacía solo para `otro`.

Un controlador dedicado inicializará `EmailVerificationBlock`, bloqueará el envío hasta que el
email esté verificado, conservará motivo/explicación ante fallos recuperables y enviará multipart a
`/api/submissions/communicat-report`. Solo `{ ok: true }` mostrará confirmación. Un fallo posterior
al intento de envío reiniciará la autorización temporal para que un token posiblemente consumido no
produzca reintentos engañosos. No se amplía el transporte compartido de otros formularios porque su
navegación a páginas de éxito no coincide con esta confirmación contextual.

### Function boundary

La Function se divide como los flujos existentes en un módulo validable y un adaptador HTTP. Acepta
solo los campos del contrato, multipart sin archivos y con tamaño acotado. Valida idioma, motivo,
reglas de explicación, email, identificador, slug, campos inesperados y honeypot. Después consume el
token de un solo uso vinculado al email mediante `consumeSubmissionVerification`.

La separación del resultado validado será explícita: `verificationEmail` se usa exclusivamente al
consumir el token y `payload` contiene solo datos editoriales autorizados. El transporte interno
recibirá la nueva sección `communicat_report`; nunca recibirá email, token, IP o nombre.

La protección básica combina honeypot, validación estricta, límites de tamaño, verificación de email
ya limitada temporalmente y el rate limit declarativo existente de Netlify agregado por `ip` y
`domain`. Esa agregación es una protección temporal de la plataforma: el código de aplicación no lee,
transmite ni almacena la IP y la denuncia editorial no contiene identificadores personales.

### Private backend and moderation

El endpoint interno genérico protegido por bearer token se conserva. Su controlador despachará
solo `communicat_report` a un servicio nuevo y mantendrá sin cambios el servicio de solicitudes
existente para el resto de secciones. No se reutiliza el lifecycle de moderación actual porque sus
estados y efectos están ligados a solicitudes publicables y no son válidos para una denuncia.

El servicio nuevo vuelve a validar una allowlist exacta y consulta con el Documents Service de
Strapi el `api::comunicat.comunicat` indicado, exigiendo estado publicado y coincidencia del slug.
Solo entonces crea `api::denuncia-comunicat.denuncia-comunicat` con estado inicial `pendiente`. La
colección no tendrá rutas Content API propias; se gestionará desde Content Manager mediante la
autenticación y RBAC administrativas existentes. Cambiar `pendiente` a `revisada` o `cerrada` será
una acción editorial manual y no ejecutará efectos sobre el Comunicat.

## Cross-repository Coordination

1. Definir primero el schema privado y el servicio backend con validación del Comunicat publicado.
2. Extender el dispatcher interno sin alterar el comportamiento de secciones existentes.
3. Regenerar los tipos derivados de Strapi y validar el backend.
4. Implementar el contrato de Function, incluida la eliminación de datos de verificación.
5. Implementar el componente y controlador compartidos CA/ES/EN.
6. Ejecutar contrato local coordinado y regresión en ambos repositorios.

El resultado final exige que Function y backend reconozcan conjuntamente `communicat_report`; no se
considerará completa una mitad aislada. El despliegue coordinado no forma parte de esta feature y el
E2E real permanecerá `DEFERRED — predeployment`.

## Project Structure

### Documentation (this feature)

```text
specs/003-communicat-reporting/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── communicat-report-contract.md
└── checklists/
    └── requirements.md
```

`tasks.md` no se crea durante PLAN.

### Source Code (authorized implementation scope)

```text
# guiapineda-astro (frontend and Function)
src/
├── templates/
│   └── ComunicatArticlePage.astro                  # MODIFY: action placement and stable context
├── components/
│   ├── CommunicatReportFlow.astro                  # CREATE: shared CA/ES/EN form and copy
│   └── EmailVerificationBlock.astro                # MODIFY: add report scope typing
└── lib/
    └── communicatReportFlow.ts                       # CREATE: browser validation and submission

netlify/functions/
├── communicat-report.mjs                           # CREATE: pure request validation/payload split
├── communicat-report-http.mjs                      # CREATE: HTTP, verification and internal call
└── _shared/
    └── strapi-submission.mjs                       # MODIFY: allow internal report section

# guiapineda-strapi (backend)
src/
├── api/
│   ├── denuncia-comunicat/content-types/denuncia-comunicat/
│   │   └── schema.json                              # CREATE: private report collection
│   └── internal-submission/controllers/
│       └── internal-submission.js                   # MODIFY: explicit report dispatch
└── services/
    └── internal-communicat-report.js                 # CREATE: validate publication and create report

types/generated/
└── contentTypes.d.ts                              # GENERATED: derived from the new schema
```

**Structure Decision**: se conservan los dos repositorios y los puntos de entrada existentes. El
frontend no incorpora rutas nuevas: la acción vive en la plantilla compartida de detalle. La
Function usa el canal interno ya protegido. El backend añade una entidad privada y un servicio
aislado para evitar contaminar el flujo de solicitudes publicables.

## Authorized Application Files

### Frontend / Function (`guiapineda-astro`)

1. `src/templates/ComunicatArticlePage.astro` — modificar.
2. `src/components/CommunicatReportFlow.astro` — crear.
3. `src/components/EmailVerificationBlock.astro` — modificar solo la variante de scope necesaria.
4. `src/lib/communicatReportFlow.ts` — crear.
5. `netlify/functions/communicat-report.mjs` — crear.
6. `netlify/functions/communicat-report-http.mjs` — crear.
7. `netlify/functions/_shared/strapi-submission.mjs` — modificar solo la allowlist de sección.

### Backend (`guiapineda-strapi`)

1. `src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json` — crear.
2. `src/services/internal-communicat-report.js` — crear.
3. `src/api/internal-submission/controllers/internal-submission.js` — modificar para el despacho
   explícito, conservando el resto de secciones.

### Generated derivative

1. `types/generated/contentTypes.d.ts` — regenerar mediante el comando normal de Strapi después
   de crear el schema. Se autoriza como artefacto derivado versionado, no como lógica manual.

Ningún otro archivo de aplicación queda autorizado. Una necesidad real adicional debe detener
IMPLEMENT y volver a PLAN antes de modificarla.

## Validation Strategy

- Builds completos de Astro y Strapi sin dependencias nuevas.
- Regeneración de tipos de Strapi y comprobación de que el diff derivado corresponde solo al nuevo
  content type.
- Inspección del HTML estático CA/ES/EN: acción tras el cuerpo, antes de relacionados, copy completo
  y `documentId`/slug correctos sin petición runtime durante lectura.
- Matriz local CA/ES/EN del formulario: cinco motivos, explicación, email, verificación, errores y
  confirmación.
- Pruebas locales del validador de Function: campos, longitud, motivo `otro`, honeypot, email/token y
  payload interno sin datos personales.
- Prueba local con dobles del consumo de token y transporte interno: orden consumo -> llamada,
  confirmación solo tras aceptación y recuperación ante fallos.
- Pruebas locales del servicio Strapi con dobles: publicado coincidente aceptado; inexistente,
  borrador o slug manipulado rechazados; denuncias repetidas creadas de forma independiente; datos
  persistidos exactos; cero actualizaciones del Comunicat.
- Inspección de privacidad y acceso: sin email/nombre/IP/token en contrato o schema, sin rutas
  Content API de denuncia y acceso editorial mediante Content Manager/RBAC.
- Regresión CA/ES/EN de lectura, contenido, imágenes, navegación y relacionados, además de los flujos
  de solicitudes existentes afectados por el dispatcher y la allowlist.
- `git diff --check`, estados Git y revisión final de ambos repositorios.
- Entrega real de email, token, Function -> backend desplegado y visibilidad en Content Manager del
  entorno real: `DEFERRED — predeployment`.

## Resolved Technical Tensions

- **A — verificación sin persistir email**: el validador devuelve por separado el email de
  verificación y el payload editorial. La Function consume el token vinculado al primero y solo
  transmite el segundo. Backend y schema rechazan/no contienen email.
- **B — workflows incompatibles**: se crea un servicio y un estado propios; no se registra el nuevo
  content type en lifecycles de solicitudes ni se reutilizan efectos de publicación, borrado de email
  o gestión de imágenes.
- **C — rate limit e IP**: se reutiliza agregación temporal administrada por Netlify (`ip`/`domain`)
  sin leer ni guardar IP en la aplicación. Se distingue de la persistencia editorial, que nunca
  recibe ese identificador.
- **D — referencia publicada y static-first**: el HTML estático incluye `documentId` y slug; el
  navegador no consulta Strapi. Al enviar, el servicio privado autenticado comprueba en Strapi que
  el `documentId` existe publicado y que el slug coincide antes de crear la denuncia.

## Risks and Mitigations

| Riesgo | Mitigación |
|---|---|
| El token se consume y después falla Strapi | No confirmar recepción; conservar datos no sensibles y exigir nueva verificación para reintentar. |
| El identificador o slug se manipula en navegador | Revalidar ambos server-side contra un Comunicat publicado. |
| El nuevo despacho altera solicitudes existentes | Rama exclusiva para `communicat_report`, pruebas de regresión y servicio genérico intacto. |
| Una ruta pública expone denuncias | Crear solo schema, sin controllers/routes/services Content API; revisar rutas y RBAC. |
| Copy incompleto en un idioma | Diccionario cerrado dentro del componente y matriz CA/ES/EN. |
| El rate limit de plataforma no puede demostrarse plenamente local | Verificar configuración y rechazo local; enforcement real queda dentro del gate predeployment. |

No hay bloqueos conocidos antes de TASKS. La única limitación operacional es la ausencia de un
entorno GUIAPINEDA desplegado, ya aceptada como validación diferida y no como trabajo funcional de
esta feature.

## Complexity Tracking

No aplica: el diseño no introduce excepciones constitucionales.
