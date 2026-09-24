---

description: "Implementation tasks for secure trilingual commerce submission"
---

# Tasks: Alta segura y trilingüe de comercios

**Input**: Design documents from `/specs/005-secure-commerce-submission/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/commerce-submission-contract.md`, `quickstart.md`

**Tests**: La SPEC exige validación local reproducible. Los probes y fixtures serán temporales bajo
`/private/tmp`; no se añaden frameworks, dependencias ni archivos de prueba permanentes.

**Organization**: Las tareas se agrupan por historia de usuario y mantienen los dos repositorios
coordinados. Una tarea solo se marca completada cuando existe la evidencia descrita.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo porque no toca el mismo archivo ni depende de una tarea
  incompleta.
- **[Story]**: historia de usuario de `spec.md`.
- Las rutas sin prefijo pertenecen a `guiapineda-astro`; las rutas backend se identifican
  explícitamente como `guiapineda-strapi`.

---

## Phase 1: Setup — baseline, alcance y harness local

**Purpose**: congelar el estado real, comprobar el allowlist del PLAN y preparar evidencia estricta
sin modificar aplicación.

- [X] T001 Capturar `git status --short`, `git diff --name-only`, versiones y baseline de build/rutas en ambos repositorios según `specs/005-secure-commerce-submission/quickstart.md`; confirmar que `guiapineda-strapi/src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json` y las rutas CA/ES existentes son la fuente real y que no hay cambios previos de aplicación
- [X] T002 [P] Crear el harness temporal estricto `/private/tmp/commerce-submission-qa.mjs` y fixtures deterministas en `/private/tmp/guiapineda-commerce-qa/` con aserciones que lanzan, salida no-cero ante fallo y PASS únicamente al final; usar solo Node y Sharp ya instalado en `guiapineda-strapi/package.json`
- [X] T003 Auditar con `rg` todos los consumidores reales de `src/lib/emailVerification.ts`, `src/lib/emailVerificationController.ts`, `src/lib/netlifySubmission.ts`, `netlify/functions/_shared/submission-verification.mjs`, `netlify/functions/_shared/submission-http.mjs` y `netlify/functions/_shared/strapi-submission.mjs`; registrar en el probe los scopes/handlers encontrados y detener IMPLEMENT si aparece un consumidor no cubierto por PLAN

**Checkpoint**: baseline limpio, inventario completo y harness fuera del repositorio.

---

## Phase 2: Foundational — verificación por propósito y transportes compartidos

**Purpose**: crear las garantías compartidas que bloquean todas las historias. Cada archivo se toca
solo por la necesidad indicada.

**⚠️ CRITICAL**: ninguna historia puede cerrarse antes de superar T010.

- [X] T004 Añadir la allowlist exacta `agenda|veu|comunicat|communicat-report|foto-mes|millora|comercio` en `netlify/functions/_shared/verification-core.mjs` y demostrar mediante inspección/probe que el scope sobrevive ligado a los hashes de código/token sin cambiar el formato persistido del challenge; `netlify/functions/_shared/verification-store.mjs` es solo inspección/regresión y debe permanecer intacto
- [X] T005 Ligar scope+email al hash de código y scope al hash/consumo del token en `netlify/functions/_shared/verification-request.mjs`, `netlify/functions/_shared/verification-check.mjs` y `netlify/functions/_shared/verification-token.mjs`; exigir uso único, rechazo de scope/email discordante y fallo seguro de hashes legacy creados sin scope, sin alterar el registro persistido del challenge
- [X] T006 Exigir y transmitir el scope validado en `netlify/functions/verification-request-code.mjs`, `netlify/functions/verification-verify-code.mjs`, `src/lib/emailVerification.ts`, `src/lib/emailVerificationController.ts` y ampliar solo la unión de props de `src/components/EmailVerificationBlock.astro` con `comercio`; la necesidad es que el `data-verification-scope` existente deje de ser decorativo
- [X] T007 Pasar un literal de scope propiedad de cada handler a `netlify/functions/_shared/submission-verification.mjs` desde `netlify/functions/agenda-submission-http.mjs`, `netlify/functions/veu-submission-http.mjs`, `netlify/functions/comunicat-submission-http.mjs`, `netlify/functions/communicat-report-http.mjs`, `netlify/functions/foto-mes-submission-http.mjs` y `netlify/functions/millora-submission-http.mjs`; modificar estos handlers solo porque sin el literal un token `comercio` podría usarse en otro propósito
- [X] T008 [P] Congelar mediante inspección y probe el contrato single-image actual de `netlify/functions/_shared/submission-http.mjs`; registrar su hash/diff baseline, demostrar su regresión y mantenerlo intacto porque el parser multipart multiimagen residirá exclusivamente en los módulos nuevos de Comercio
- [X] T009 [P] Extender `netlify/functions/_shared/strapi-submission.mjs` con sección `comercio` y transporte de principal/logo/galería con nombres técnicos, manteniendo sin cambios la rama `image` existente; esta es la única necesidad para modificar el transporte interno compartido
- [X] T010 Ejecutar en `/private/tmp/commerce-submission-qa.mjs` la regresión fundacional de request→verify→consume para los seis scopes existentes y `comercio`, incluyendo token reutilizado, email/scope incorrectos, multipart de una imagen y transporte interno previo; exigir cero llamadas downstream en fallos y PASS inequívoco antes de seguir

**Checkpoint**: propósito y transportes compartidos listos, con regresión de todos los consumidores
reales inventariados.

---

## Phase 3: User Story 1 — enviar un alta completa CA/ES/EN (Priority: P1) 🎯 MVP

**Goal**: una solicitud válida recorre formulario→Function→Strapi y crea exactamente una entidad
privada `pendent`, sin consultar ni mutar comercios públicos.

**Independent Test**: una entrada válida por idioma, con relaciones/grupos/imágenes válidos y token
sintético `comercio`, produce un único create privado; CA/ES/EN navegan a su confirmación y el doble
`api::comercio.comercio` registra cero llamadas.

- [X] T011 [P] [US1] Ajustar `guiapineda-strapi/src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json`: idioma exacto `ca|es|en`; categoría requerida; principal privada requerida por referencia; logo opcional; galería privada 0–4; contacto privado nombre 1–120/email <=180/teléfono <=30/consentimiento true, dejando `email_contacto` nullable en schema para el cierre terminal aunque el servicio lo exige al crear; estados exactos y auditoría; conservar pero hacer privados/no visibles/no configurables y no obligatorios los tres Media legacy, sin eliminar columnas
- [X] T012 [US1] Implementar en `guiapineda-strapi/src/services/internal-submission-request.js` la sección `comercio`, allowlist cerrada y validación de idioma; nombre 1–100; descripciones 1–160/1–900; dirección 1–180; contacto público teléfono/WhatsApp <=30, email <=180 o URL HTTP(S) <=250 y al menos uno; información adicional <=800; consentimiento exactamente true y contacto privado aprobado únicamente
- [X] T013 [US1] Añadir en `guiapineda-strapi/src/services/internal-submission-request.js` la validación de grupos y relaciones: siete días únicos con al menos uno abierto, tramos completos con inicio < fin y primer cierre <= segunda apertura; 1–6 servicios con nombre 1–100/descripción <=300; redes únicas limitadas a `instagram|facebook|tiktok|youtube|linkedin|x` con URL HTTP(S) <=250; categoría/subcategoría activas y publicadas, subcategoría requerida solo si existen opciones y perteneciente a la categoría
- [X] T014 [US1] Implementar en `guiapineda-strapi/src/services/internal-submission-request.js` el camino válido multiimagen que guarda principal, logo opcional y galería ordenada en cuarentena, construye relaciones solo tras resolver el catálogo y ejecuta un único create de `solicitud-comercio` con estado server-owned `pendent`; prohibir cualquier consulta de similitud o operación sobre `api::comercio.comercio`
- [X] T015 [P] [US1] Crear `netlify/functions/comercio-submission.mjs` con parser/normalizador puro de la allowlist Browser→Function: escalares, cinco booleanos, JSON de horarios/servicios/redes, contacto privado y consentimiento; devolver por separado `verificationEmail`, payload editorial e imágenes y excluir honeypot/token/estado/auditoría/campos editoriales
- [X] T016 [US1] Crear `netlify/functions/comercio-submission-http.mjs` en `/api/submissions/comercio` con POST multipart <=5.000.000 bytes, honeypot, rate limit existente `ip/domain`, validación completa antes de consumo, token literal `comercio`, una llamada interna y éxito `201 {ok:true}` solo tras aceptación de Strapi
- [X] T017 [P] [US1] Crear `src/lib/commerceSubmission.ts` para construir el único `FormData` desde el estado real —incluida la colección vigente de galería— y serializar categoría, subcategoría condicional, horarios, modalidades, 1–6 servicios, redes exactas y contactos sin incorporar metadata UI/editorial
- [X] T018 [P] [US1] Ampliar `src/templates/CommerceSignupPage.astro` a `ca|es|en`, localizar catálogo con `nombre/nombre_es/nombre_en` y crear `src/pages/en/businesses/add-a-business.astro`, preservando sin cambios las rutas CA `/alta-comerc/` y ES `/es/alta-comercio/` y sin consultas runtime
- [X] T019 [P] [US1] Activar exclusivamente el CTA inglés hacia `/en/businesses/add-a-business/` y retirar *Coming soon* en `src/pages/index.astro`, `src/templates/CategoryPage.astro`, `src/templates/SubcategoryPage.astro` y `src/i18n/en.json`, sin alterar enlaces CA/ES ni otras superficies
- [X] T020 [US1] Completar, después de T017, el fetch directo específico en `src/lib/commerceSubmission.ts` hacia `/api/submissions/comercio`, con respuesta JSON `{ok:true}`, timeout/errores compatibles y el `FormData` ya construido; inspeccionar y probar `src/lib/netlifySubmission.ts` sin modificarlo
- [X] T021 [US1] Adaptar `src/components/CommerceSignupFlow.astro` sin rediseñarlo: copy completo EN; form real; names/hidden fields; categoría/subcategoría condicional; horarios, servicios, redes y previews actuales; contacto público; principal/logo/galería; contacto privado nombre/email/teléfono/consentimiento; serialización exacta mediante `src/lib/commerceSubmission.ts`
- [X] T022 [US1] Integrar en `src/components/CommerceSignupFlow.astro` `EmailVerificationBlock scope="comercio"`, controlador y transporte verificado; exponer `form[data-commerce-submission-flow]` y el mensaje localizado `data-commerce-submission-error` para los gates documentados, habilitar envío solo con el mismo email autorizado y datos válidos, efectuar una petición y navegar a `/enviat/`, `/es/enviado/` o `/en/sent/` únicamente tras `{ok:true}`
- [X] T023 [US1] Regenerar, sin edición manual, `guiapineda-strapi/types/generated/contentTypes.d.ts` desde el schema y comprobar que el diff derivado representa solo los cambios autorizados de `solicitud-comercio`
- [X] T024 [US1] Ejecutar el bloque happy-path de `/private/tmp/commerce-submission-qa.mjs` para CA/ES/EN, catálogo condicional, siete días, 1/6 servicios, seis redes, contactos separados, un multipart y una sola solicitud `pendent`; exigir cero consultas/mutaciones de comercios y PASS estricto

**Checkpoint**: el recorrido válido completo funciona localmente en los tres idiomas y no publica.

---

## Phase 4: User Story 2 — datos e imágenes seguras (Priority: P1)

**Goal**: cerrar manipulación, límites, privacidad, uso único, normalización y atomicidad sin debilitar
los flujos compartidos.

**Independent Test**: los límites exactos se aceptan, todos los casos manipulados se rechazan antes
de crear, las imágenes válidas quedan privadas y cualquier fallo deja cero solicitud parcial y cero
referencias huérfanas creadas por el intento.

- [X] T025 [P] [US2] Endurecer `src/lib/commerceSubmission.ts` y su integración en `src/components/CommerceSignupFlow.astro`: principal exactamente 1, logo 0–1, galería 0–4, JPEG/PNG/WebP, cada archivo >0 y <=4.000.000 bytes y suma <=4.000.000 bytes antes de fetch; mantener valores editables y no iniciar red ante fallo
- [X] T026 [P] [US2] Endurecer `netlify/functions/comercio-submission.mjs` y `netlify/functions/comercio-submission-http.mjs`: rechazar texto duplicado, files desconocidos/vacíos, cardinalidad, MIME, tamaño individual y agregado canónico de 4.000.000 bytes, JSON malformado, campos extras, IP/identificadores y material de verificación; completar toda validación antes de consumir el token
- [X] T027 [P] [US2] Completar el preflight y compensación en `guiapineda-strapi/src/services/internal-submission-request.js`: validar todos los stats, MIME y suma <=4.000.000 bytes antes de escribir; reutilizar sin modificar `guiapineda-strapi/src/services/private-submission-image.js` para firma real, <=40.000.000 píxeles, WebP sin metadata, sin ampliación, <=3000×3000 y <=4.000.000 bytes; pasarle límites explícitos desde la rama Comercio sin modificar ese helper, y rastrear/borrar todas las imágenes creadas si falla una normalización o el create
- [X] T028 [P] [US2] Ejecutar en `/private/tmp/commerce-submission-qa.mjs` la matriz de verificación/privacidad: sin verificar, expirado, reutilizado, email discordante y scope ajeno crean cero solicitudes; payload/registro excluyen IP, honeypot, challenge, código, token, temporizador, estado verificado, secretos, credenciales y campos editoriales no expuestos
- [X] T029 [US2] Ejecutar en `/private/tmp/commerce-submission-qa.mjs` la matriz binaria y atómica con fixtures JPEG/PNG/WebP, 4.000.000 bytes exactos, 4.000.001 bytes, MIME/firma discordantes, corrupta, >40M píxeles, fallo en segunda imagen y fallo de base de datos; comprobar salida privada normalizada, metadata ausente, rollback total, cero solicitud parcial y PASS estricto

**Checkpoint**: seguridad, minimización y atomicidad demostradas localmente.

---

## Phase 5: User Story 3 — moderación humana sin publicación (Priority: P1)

**Goal**: revisar contenido e imágenes privadas y transicionar estados sin efectos públicos.

**Independent Test**: un editor autenticado puede previsualizar cada rol y ejecutar la secuencia de
estados; dobles estrictos prueban cero upload a Media y cero operación sobre comercios.

- [X] T030 [P] [US3] Extender `guiapineda-strapi/src/services/private-submission-image-cleanup.js` para proteger principal, logo y todos los IDs de galería de `solicitud-comercio` en cualquier estado, manteniendo intacta la política/gracia existente y sin introducir TTL, borrado o job nuevo
- [X] T031 [P] [US3] Añadir resolución cerrada `principal|logo|galeria[0..3]` para sección `comercio` en `guiapineda-strapi/src/services/private-moderation-image.js` y pasar solo role/index desde `guiapineda-strapi/src/api/internal-moderation/controllers/internal-moderation.js`; conservar autenticación, no-cache y ocultación del ID
- [X] T032 [P] [US3] Añadir la rama private-only `comercio` en `guiapineda-strapi/src/services/submission-moderation-lifecycle.js`: `pendent -> en_revisio -> aprovat|rebutjat`, auditoría manual y borrado de `email_contacto` (`null`) en la misma actualización terminal; conservar nombre/teléfono/refs, no añadir otra política de anonimización, ejecutar cero `promotePrivateImage` y cero create/update/publish/unpublish/delete de comercio
- [X] T033 [US3] Ampliar `guiapineda-strapi/src/admin/components/PrivateModerationImagePanel.jsx` para registrar el modelo de comercio, mostrar principal/logo/0–4 galerías mediante el endpoint privado y usar confirmaciones que indiquen que aprobar/rechazar no publica ni mueve imágenes a Media
- [X] T034 [US3] Ejecutar la matriz de moderación de `/private/tmp/commerce-submission-qa.mjs`: auth/rol/índice inválidos, previews sin IDs, transiciones válidas e inválidas, email presente solo en `pendent/en_revisio` y `null` tras ambos cierres terminales, conservación de nombre/teléfono/refs, observaciones internas editoriales y cero llamadas a Media/`api::comercio.comercio`; exigir PASS estricto

**Checkpoint**: moderación privada completa sin publicación automática.

---

## Phase 6: User Story 4 — errores recuperables y reintento seguro (Priority: P2)

**Goal**: evitar pérdida innecesaria, falsos éxitos, duplicados por retry y reutilización del token
tras un fallo posterior.

**Independent Test**: 4xx/413/415/503 controlados conservan datos editables, no navegan ni reintentan;
si el token pudo consumirse, el siguiente intento queda bloqueado hasta una nueva verificación.

- [X] T035 [P] [US4] Implementar en `src/components/CommerceSignupFlow.astro` mensajes localizados CA/ES/EN y recuperación: conservar estado/archivos disponibles, mostrar error, no mostrar éxito ni navegar, llamar `reset` de verificación después de todo fallo de envío potencialmente posterior al consumo y no ejecutar retries automáticos
- [X] T036 [P] [US4] Revalidar en `netlify/functions/comercio-submission-http.mjs` el orden validación→consumo único→llamada Strapi y las respuestas inequívocas 4xx/413/415/503/201; no añadir idempotency keys, colas ni retries y garantizar que un fallo posterior al consumo exige un token nuevo
- [X] T037 [US4] Ejecutar en `/private/tmp/commerce-submission-qa.mjs` y navegador la matriz de fallo antes/después de consumo, doble clic, respuesta JSON inválida, red caída, normalización fallida y 503 de Strapi; comprobar cero éxito falso, cero retry ciego, cero duplicado confirmado y nueva verificación obligatoria cuando corresponda

**Checkpoint**: errores y reintentos cumplen el contrato sin infraestructura adicional.

---

## Phase 7: Polish & Cross-Cutting — validación final y no regresión

**Purpose**: demostrar cobertura completa, regresión de compartidos, builds y diff mínimo antes de
ANALYZE.

- [X] T038 Ejecutar de principio a fin `/private/tmp/commerce-submission-qa.mjs` con todos los casos de `specs/005-secure-commerce-submission/quickstart.md`; exigir proceso 0 y un único PASS final después de todas las aserciones, sin email/red/servicios desplegados
- [X] T039 Ejecutar exactamente el único shim estricto de `window.fetch` documentado en `quickstart.md` para la matriz CA `/alta-comerc/`, ES `/es/alta-comercio/` y EN `/en/businesses/add-a-business/`: instalar tras cada carga, usar solo `qa-commerce@example.invalid`/`123456`, interceptar únicamente request-code/verify-code/envío exactos, permitir solo las lecturas locales cerradas del SVG de marca y de previews `blob:` identificadas allí y hacer fallar todo otro `fetch` sin passthrough, completar fallo 503 y éxito 201 por idioma, exigir seis PASS sin `console.assert` y verificar restauración en `finally`
- [X] T040 Reejecutar la regresión final de todos los sistemas compartidos: Agenda, Veus, Comunicats, denuncia de Comunicats, Foto del Mes, Millorem y cualquier consumidor adicional inventariado en T003; cubrir request/verify/consume por scope, token de un uso, payload, single-image multipart, transporte Strapi, moderación y comportamiento público
- [X] T041 [P] Validar regresión completa del directorio público CA/ES/EN —home, categorías, subcategorías, fichas, rutas, contenido, imágenes y navegación— y demostrar que envío/aprobación/rechazo de solicitudes ejecutan cero mutaciones sobre `guiapineda-strapi/src/api/comercio/`
- [X] T042 Ejecutar primero en `guiapineda-strapi` `npm run strapi -- ts:generate-types` y después `npm run build`; comprobar que `types/generated/contentTypes.d.ts` está sincronizado, no aparecen artefactos no autorizados y el build PASS; si Astro requiere datos, dejar a continuación un Strapi local estable
- [X] T043 Ejecutar solo después de T042 en `guiapineda-astro` `npm run build`, con Strapi local estable si el build lo necesita; comprobar generación de las tres rutas, paridad CA/ES/EN, ausencia de consultas runtime añadidas y build PASS sin instalar dependencias
- [X] T044 Ejecutar `git diff --check`, `git status --short` y revisión del diff completo en ambos repositorios; comparar cada archivo con el allowlist de `specs/005-secure-commerce-submission/plan.md`, confirmar expresamente que `src/lib/netlifySubmission.ts`, `netlify/functions/_shared/verification-store.mjs` y `netlify/functions/_shared/submission-http.mjs` permanecen intactos, que ningún shared autorizado pero innecesario amplió el diff, que no hay dependencias/config/infraestructura/backend público fuera de alcance ni temporales, y registrar E2E real como `DEFERRED — predeployment` sin desplegar

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1**: inicio; T003 depende del baseline T001. T002 puede ejecutarse en paralelo.
- **Phase 2**: depende de T001–T003. T004 → T005 → T006 → T007; las comprobaciones de invariancia
  T008 y el transporte T009 pueden avanzar en paralelo tras T003. T010 depende de T004–T009 y
  bloquea historias.
- **US1 / Phase 3**: depende de T010. Backend: T011 → T012 → T013 → T014. Function: T015 → T016 y
  requiere la baseline T008 y T009. Frontend: T017, T018 y T019 pueden comenzar en paralelo;
  T017 → T020 porque ambos trabajan en `commerceSubmission.ts`; T021 depende de T017–T020; T022
  depende de T006, T016, T020 y T021. T023 depende de T011. T024 depende de T011–T023.
- **US2 / Phase 4**: depende de US1. T025 y T026 pueden comenzar sobre el recorrido válido; T027
  depende de T014; T028 depende de T025–T026 y T005–T007; T029 depende de T025–T027.
- **US3 / Phase 5**: depende de US1 y de la atomicidad US2. T030–T032 pueden ejecutarse en paralelo;
  T033 depende de T031–T032; T034 depende de T030–T033.
- **US4 / Phase 6**: depende de US1–US2; T035 y T036 afectan extremos distintos y pueden prepararse
  en paralelo, pero T037 requiere ambos y la moderación terminada.
- **Phase 7**: depende de las cuatro historias. T041 puede ejecutarse en paralelo con T038. T042
  genera tipos y construye Strapi; después se deja Strapi local estable si Astro lo necesita; T043
  construye Astro. T042 y T043 nunca se ejecutan en paralelo. T044 es siempre la última tarea.

### Critical path

```text
T001 → T003 → T004 → T005 → T006 → T007 → T010
     → T011 → T012 → T013 → T014
     → T015 → T016
     → T021 → T022 → T024
     → T025/T026/T027 → T029
     → T030/T031/T032 → T033 → T034
     → T035/T036 → T037
     → T038/T039/T040 → T042 → T043 → T044
```

## Shared-file necessity and regression map

| Shared file(s) | Required change | Necessity | Regression evidence |
|---|---|---|---|
| `verification-core.mjs` | T004 | closed scope validation | T010, T040 |
| `verification-store.mjs` | T004 (inspection only) | no change: purpose binding lives in hashes; persisted challenge format stays fixed | T010, T040, T044 |
| `verification-request.mjs`, `verification-check.mjs`, `verification-token.mjs` | T005 | cryptographic purpose binding and one-use consume | T010, T028, T040 |
| verification endpoints, `emailVerification.ts`, controller, block | T006 | carry the existing UI scope end to end | T010, T039, T040 |
| `submission-verification.mjs` and six existing HTTP handlers | T007 | handler-owned expected scope prevents cross-purpose use | T010, T040 |
| `submission-http.mjs` | T008 (inspection only) | no change: Comercio owns its multipart parser | T010, T040, T044 |
| `strapi-submission.mjs` | T009 | authenticated multiimage transport and `comercio` section | T010, T024, T040 |
| `netlifySubmission.ts` | T020 (inspection only) | no change: `commerceSubmission.ts` owns FormData and direct fetch | T039, T040, T044 |

T003 must add any real consumer discovered to T010/T040 before shared-helper changes. T044 rejects
any diff in the three inspection-only files and rejects a diff in another authorized shared file if
IMPLEMENT cannot tie it to the necessity above.

## Parallel execution examples

### Foundation

```text
After T003:
- T004–T007: verification-purpose chain
- T008: invariant single-image parser regression (no source modification)
- T009: backward-compatible internal transport
```

### User Story 1

```text
After T010:
- Backend chain: T011 → T012 → T013 → T014
- Function validator: T015
- Browser multipart helper/direct transport: T017 → T020
- EN route/template: T018
- EN CTAs: T019
```

### User Story 3

```text
After T029:
- T030: orphan-reference protection
- T031: private image role resolver
- T032: private-only lifecycle
```

## Requirement coverage

| Required area | Tasks |
|---|---|
| Baseline, scope, no unnecessary diff | T001, T003, T044 |
| EN route and CA/ES/EN parity; preserve form | T018, T019, T021, T039 |
| Category/subcategory and real catalogue | T013, T021, T024 |
| Schedules, 1–6 services, exact networks | T013, T017, T021, T024 |
| Public/private contact and consent | T012, T021, T022, T028 |
| Purpose-bound one-use token and forced reverify; unchanged challenge store | T004–T007, T010, T022, T028, T035–T037, T044 |
| Sensitive/non-authorized data exclusion | T012, T015, T026, T028 |
| Single multipart and all image cardinalities/limits | T008–T009, T014–T017, T020, T025–T027, T029 |
| 40M pixels, 3000×3000, metadata, quarantine | T027, T029 |
| Preflight, rollback, no partial requests | T026–T027, T029 |
| Complete server allowlist and validation | T012–T016, T026–T027 |
| States, terminal email deletion, private moderation, no publication | T030–T034 |
| No dedupe/idempotency/blind retry | T014, T016, T035–T037 |
| Abuse and recoverable errors | T016, T026, T035–T037 |
| Shared-system and directory regressions | T010, T040–T041 |
| Generated types and builds | T023, T042–T043 |
| Reproducible local E2E and deferred real E2E | T002, T024, T028–T029, T034, T037–T044 |

## Implementation strategy

### MVP sequence

1. Complete baseline and shared foundation through T010.
2. Complete US1 through T024 to obtain one valid private submission per language.
3. Do not deploy: validate the MVP only with local doubles.
4. Complete security/atomicity, moderation and error recovery before considering the feature done.

### Completion rule

The feature is implementation-complete only after T044. Passing the happy path does not waive image
rollback, shared regressions, both builds or the deferred predeployment gate.

## Notes

- No task authorizes new dependencies, infrastructure, Railway, PostgreSQL, Cloudinary or deployment.
- No task authorizes a public route for solicitudes or automatic creation/publication of commerce.
- Temporary QA artifacts stay outside both repositories.
- If an implementation need falls outside the PLAN allowlist, stop before editing and return to PLAN.
- E2E with real services remains `DEFERRED — predeployment`; local doubles are not deployed evidence.

## Phase 8: Convergence

- [X] T045 Impedir en `src/components/CommerceSignupFlow.astro` que una red social marcada se omita silenciosamente cuando su URL está vacía o no es HTTP(S): conservar la intención de selección, bloquear avance/envío y demostrar en CA/ES/EN que el caso crea cero solicitudes, sin debilitar la validación de Function/Strapi, per FR-014 y Edge Cases (contradicts)
- [X] T046 Añadir en `src/components/CommerceSignupFlow.astro` validación de navegador localizada y específica que identifique antes de avanzar o enviar horarios con orden imposible o solapamiento y URLs web/sociales inválidas; ampliar el harness/matriz estricta de navegador para CA/ES/EN y conservar datos, archivos y token cuando el fallo sea determinable antes del consumo, per US4/AC1, FR-011, FR-014 and SC-001/004/006 (partial)

---

## Phase 9: Final convergence remediation

- [X] T047 Corregir en `src/components/CommerceSignupFlow.astro` la navegación `editingFromReview` para que cada handler valide su sección antes de volver al resumen; cubrir web, redes y horarios inválidos/válidos, recorridos normales, foco/ARIA y cero fetch/consumo/backend en errores, per F-001, T045–T046, US4/AC1, FR-011, FR-014 and SC-001/004/006
- [X] T048 Restaurar o reconstruir `/private/tmp/commerce-submission-qa.mjs` como harness completo no versionado de T038/T040, ampliarlo con T045–T050 y registrar en `quickstart.md` el comando exacto, alcance y resultado sin sustituir inspección manual, per F-002
- [X] T049 Formalizar en `plan.md` y verificar la trazabilidad de `guiapineda-strapi/src/index.js` y `guiapineda-strapi/src/services/commerce-submission-write-guard.js`; auditar que su diff se limita al registro del middleware Document Service y a las protecciones B1/H1, y revalidar creación, eliminación, clonación, publicación, lifecycle y campos server-owned frente a bypass de Content Manager, per F-003 and Constitution III/VII
- [X] T050 Recalcular en `src/components/CommerceSignupFlow.astro` el error de horario y su estado ARIA tras quitar el segundo turno, copiar lunes a laborables/toda la semana, editar horas o alternar cerrado/abierto; demostrar eliminación del error solo al quedar válido y conservación localizada del error correcto cuando siga inválido, per F-004, T046 and SC-006

**Dependencies**: T047 y T050 comparten `CommerceSignupFlow.astro` y se ejecutan en ese orden. T048
incorpora sus regresiones después de ambos. T049 formaliza y revalida el backend existente sin
reescribir B1/H1. Las cuatro tareas deben estar PASS antes de marcar `50/50`; el CONVERGE final es
un paso posterior y no forma parte de esta fase de IMPLEMENT.

---

## Phase 10: Persistent final convergence QA

- [X] T051 Make the complete Commerce submission QA harness persistent and reproducible at
  `scripts/qa/commerce-submission-qa.mjs`: execute real client/Function/verification/backend,
  B1/H1, moderation, privacy and Sharp logic wherever locally available; restrict doubles to
  external email/network/storage/Strapi boundaries; generate and remove temporary image fixtures;
  replace every executable `/private/tmp` harness reference in `quickstart.md`; and require a single
  final PASS only after T038/T040/T045–T050 plus M1/M2 and image/atomicity assertions complete, per
  F-005 and FR-037.

**Dependency**: T051 preserves the completed runtime implementation and follows T048. It changes
only the persistent QA harness and the minimum SDD authorization/documentation needed for that
harness. T048 remains complete because its historical acceptance required the then-present
non-versioned remediation probe; T051 adds the newly required cross-session reproducibility.

---

## Phase 11: Post-closure remediation

- [X] T052 Restore the Add a Business CTA on the English home and verify CA/ES/EN parity: remove
  the stale English-only exclusion in `src/pages/index.astro`; preserve the shared localized CTA
  markup and canonical CA `/alta-comerc/`, ES `/es/alta-comercio/` and EN
  `/en/businesses/add-a-business/` destinations; validate generated home and signup HTML, run the
  persistent commerce QA harness, Astro build and `git diff --check`, and confirm the backend
  remains unchanged, per T019, plan: English CTAs and Constitution VI (contradicts).
