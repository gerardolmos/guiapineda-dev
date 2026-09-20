# Tasks: Paridad EN para el envío de Comunicats

**Input**: Design documents from `specs/002-communicat-en-parity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: No se añade framework ni suite persistente. Las tareas de validación usan builds,
sondas locales desechables, inspección y la matriz manual local aprobada.

**Organization**: Las tareas se agrupan por historia de usuario. Los paths de Strapi se expresan
relativos a `../guiapineda-strapi`; el resto, relativos a `guiapineda-astro`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque afecta archivos distintos y no depende de una tarea
  incompleta.
- **[Story]**: Relaciona la tarea con US1, US2 o US3 de `spec.md`.

## Phase 1: Setup (Scope Baseline)

**Purpose**: Confirmar un punto de partida limpio y evitar ampliar el alcance durante IMPLEMENT.

- [X] T001 Inspeccionar `git status` en `guiapineda-astro` y `../guiapineda-strapi`, contrastar los cambios existentes con `specs/002-communicat-en-parity/plan.md` y detener IMPLEMENT si aparece cualquier archivo de aplicación fuera de los ocho autorizados o del artefacto generado derivado `../guiapineda-strapi/types/generated/contentTypes.d.ts`

**Checkpoint**: Ambos repositorios tienen un baseline conocido y el alcance autorizado está
confirmado.

---

## Phase 2: Foundational (Existing Shared Guarantees)

**Purpose**: Confirmar que las piezas comunes ya soportan EN y deben reutilizarse sin cambios.

**⚠️ CRITICAL**: Esta fase bloquea las historias; cualquier incompatibilidad real exige detenerse
antes de modificar un archivo fuera del PLAN.

- [X] T002 [P] Verificar que `src/lib/comunicatSubmissionFlow.ts`, `src/lib/netlifySubmission.ts`, `src/components/EmailVerificationBlock.astro`, `src/lib/emailVerificationController.ts`, `src/components/SubmissionSendingOverlay.astro` y `src/pages/en/sent.astro` ya cubren flujo compartido, endpoint, verificación y estados EN sin requerir modificación
- [X] T003 [P] Verificar que `netlify/functions/comunicat-submission-http.mjs`, `netlify/functions/_shared/submission-verification.mjs`, `netlify/functions/_shared/strapi-submission.mjs`, `../guiapineda-strapi/src/services/internal-submission-auth.js`, `../guiapineda-strapi/src/services/private-submission-image.js` y `../guiapineda-strapi/src/services/submission-moderation-lifecycle.js` preservan token de un uso, autenticación interna, cuarentena y moderación privada sin cambios

**Checkpoint**: Las garantías compartidas se reutilizan; no se abre ningún circuito EN alternativo.

---

## Phase 3: User Story 1 - Enviar un Comunicat desde la experiencia EN (Priority: P1) 🎯 MVP

**Goal**: Habilitar la CTA, ruta y formulario EN completos, reutilizando exactamente la estructura y
el comportamiento CA/ES hasta la revisión.

**Independent Test**: Abrir `/en/comunicats/`, seguir la CTA a
`/en/comunicats/send-an-announcement/`, comprobar todo el copy EN, bloquear datos inválidos y llegar
a revisión con datos válidos sin usar rutas ni textos CA/ES.

### Implementation for User Story 1

- [X] T004 [P] [US1] Completar `comunicats.ctaTitle` y `comunicats.ctaButton` con copy inglés no vacío, preservando `ctaText` y `ctaNote`, en `src/i18n/en.json`
- [X] T005 [P] [US1] Ampliar `submitUrl` para que EN apunte exactamente a `/en/comunicats/send-an-announcement/` sin alterar los destinos CA/ES en `src/pages/comunicats/index.astro`
- [X] T006 [P] [US1] Crear el wrapper estático que monta `CommunicatSubmissionPage` con `lang="en"` en `src/pages/en/comunicats/send-an-announcement.astro`
- [X] T007 [P] [US1] Ampliar el tipo de idioma y definir título/descripción EN, conservando literalmente los metadatos CA/ES, en `src/templates/CommunicatSubmissionPage.astro`
- [X] T008 [US1] Sustituir las ramas binarias por copy exhaustivo CA/ES/EN, configurar `/en/sent/` y preservar el mismo markup, valores internos y reglas (`autor` 1–140, `titol` 8–120, `resum` 30–280, `contingut` 80–8000, `nombre_contacto` opcional máximo 120 y `email_contacto` máximo 180) en `src/components/CommunicatSubmissionFlow.astro`
- [X] T009 [US1] Validar según las secciones 1 y 5 de `specs/002-communicat-en-parity/quickstart.md` que la CTA y ruta directa EN funcionan, no hay texto visible CA/ES, los casos inválidos bloquean Continuar y los datos válidos alcanzan revisión

**Checkpoint**: US1 es observable e independientemente validable hasta revisión. Todavía no se
considera completa la feature sin el contrato seguro de US2.

---

## Phase 4: User Story 2 - Mantener el envío inglés privado y moderado (Priority: P1)

**Goal**: Admitir `idioma_solicitud: "en"` a través de Function y Strapi sin relajar verificación,
privacidad, autenticación, cuarentena ni moderación.

**Independent Test**: Las sondas locales aceptan un payload EN válido y rechazan un idioma ajeno;
la UI no permite enviar sin verificación y consentimiento; una creación controlada sin persistencia
produce solo datos privados con estado inicial `pendent`.

### Implementation for User Story 2

- [X] T010 [P] [US2] Añadir exclusivamente `en` al conjunto `LANGUAGES`, manteniendo honeypot, campos protegidos, email, consentimiento y reglas de payload sin cambios, en `netlify/functions/comunicat-submission.mjs`
- [X] T011 [P] [US2] Añadir exclusivamente `en` al enum `idioma_solicitud`, conservando todos los demás atributos y estados, en `../guiapineda-strapi/src/api/solicitud-comunicat/content-types/solicitud-comunicat/schema.json`
- [X] T012 [US2] Ampliar `SECTION_CONFIG.comunicat.allowedLanguages` a `ca`, `es`, `en` sin cambiar `allowedFields`, `requiredFields` ni otras secciones en `../guiapineda-strapi/src/services/internal-submission-request.js` (depends on T011)

### Local validation for User Story 2

- [X] T013 [P] [US2] Ejecutar una sonda Node desechable contra `buildComunicatPayload` de `netlify/functions/comunicat-submission.mjs` y demostrar que un payload EN con `tipus_remitent` permitido, `autor` 1–140, `titol` 8–120, `resum` 30–280, `contingut` 80–8000, email válido y `aceptacion_privacidad: "true"` conserva `en`, mientras `fr` devuelve `idioma_solicitud:invalid` (depends on T010)
- [X] T014 [US2] Ejecutar una sonda Node desechable contra `parseSubmissionPayload` de `../guiapineda-strapi/src/services/internal-submission-request.js` y demostrar que `comunicat/en` conserva `en`, que un idioma ajeno devuelve `submission:invalid-language` y que el schema enumera exactamente `ca`, `es`, `en` (depends on T011, T012)
- [X] T015 [P] [US2] Ejecutar una sonda local desechable sobre `netlify/functions/_shared/verification-token.mjs` para confirmar vinculación al email, consumo único y rechazo de reutilización sin enviar emails ni usar servicios externos
- [X] T016 [US2] Validar localmente en `src/components/CommunicatSubmissionFlow.astro` y `src/lib/comunicatSubmissionFlow.ts` que EN mantiene Send bloqueado sin email verificado o consentimiento, conserva el error EN ante fallo controlado, navega a `/en/sent/` solo tras `{ok:true}` y aplica las mismas restricciones de imagen opcional sin realizar un envío real (depends on T008, T010)
- [X] T017 [US2] Ejecutar una creación local controlada con `createInternalSubmission` y un adaptador Strapi en memoria desde `../guiapineda-strapi/src/services/internal-submission-request.js`, sin escribir registros, para confirmar que EN genera `estado_solicitud: "pendent"`; revisar además que contacto, autenticación, transporte, normalización y cuarentena siguen los paths existentes documentados en `specs/002-communicat-en-parity/contracts/communicat-en-submission-contract.md` (depends on T012)

**Checkpoint**: US2 acepta EN en ambas fronteras y conserva todas las garantías sensibles sin E2E
remoto ni datos permanentes.

---

## Phase 5: User Story 3 - Preservar CA y ES sin regresiones (Priority: P1)

**Goal**: Demostrar que la extensión EN no modifica rutas, copy, validaciones ni contratos CA/ES.

**Independent Test**: CA y ES conservan sus rutas y textos; payloads representativos válidos siguen
siendo aceptados con su idioma y casos inválidos mantienen la misma categoría de rechazo; ambos
formularios alcanzan revisión bajo las reglas anteriores.

### Regression validation for User Story 3

- [X] T018 [P] [US3] Ejecutar la sonda de regresión CA/ES contra `buildComunicatPayload` en `netlify/functions/comunicat-submission.mjs`, confirmando preservación del idioma y de las categorías de rechazo para idioma, campos protegidos, honeypot, email y consentimiento (depends on T010)
- [X] T019 [P] [US3] Ejecutar la sonda de regresión CA/ES contra `parseSubmissionPayload` en `../guiapineda-strapi/src/services/internal-submission-request.js`, confirmando aceptación CA/ES y rechazo sin cambios de campos extra, email inválido y consentimiento ausente (depends on T012)
- [X] T020 [US3] Validar representativamente `/envia-un-comunicat/` y `/es/enviar-comunicado/` contra `src/templates/CommunicatSubmissionPage.astro` y `src/components/CommunicatSubmissionFlow.astro`: rutas/copy intactos, mismos campos y límites, bloqueo inválido y llegada a revisión con valores válidos, sin solicitar email ni enviar datos reales (depends on T008)

**Checkpoint**: CA, ES y EN son variantes funcionalmente equivalentes y las regresiones seleccionadas
están documentadas.

---

## Phase 6: Final Validation and Scope Review

**Purpose**: Ejecutar los gates locales finales y comprobar coherencia entre repositorios.

- [X] T021 [P] Ejecutar `npm run build` en `guiapineda-astro` y confirmar en la salida generada las rutas `/envia-un-comunicat/`, `/es/enviar-comunicado/` y `/en/comunicats/send-an-announcement/` según `specs/002-communicat-en-parity/quickstart.md`
- [X] T022 [P] Regenerar automáticamente `../guiapineda-strapi/types/generated/contentTypes.d.ts` desde el schema mediante el flujo normal de Strapi, ejecutar `npm run build` en `../guiapineda-strapi` y confirmar que el enum CA/ES/EN compila sin introducir migraciones ni cambios de datos
- [X] T023 Consolidar los resultados de T009 y T013–T022 contra `specs/002-communicat-en-parity/quickstart.md`, ejecutar solo cualquier comprobación local aún no cubierta y dejar el E2E de infraestructura explícitamente como `DEFERRED — predeployment`, nunca como PASS
- [X] T024 Revisar los diffs completos, ejecutar `git diff --check` y `git status --short` en `guiapineda-astro` y `../guiapineda-strapi`, y confirmar contra `specs/002-communicat-en-parity/plan.md` que no hay dependencias, infraestructura ni archivos fuera de los ocho de aplicación y el artefacto generado derivado autorizados

**Checkpoint**: Toda evidencia local exigida está completa y el único gate no ejecutado es el E2E
integrado de predespliegue.

---

## Deferred Predeployment Gate (Not an IMPLEMENT Task)

No ejecutar durante esta feature mientras no exista un entorno GUIAPINEDA integrado. Antes de un
despliegue futuro se deberá comprobar con datos desechables:

- entrega real del código EN;
- consumo real y no reutilización del token;
- recepción real por la Function y transporte autenticado a Strapi;
- creación privada `pendent` y cuarentena real de imagen;
- regresión integrada representativa CA/ES.

Su estado al cerrar IMPLEMENT debe ser `DEFERRED — predeployment`; no es una brecha funcional si las
24 tareas locales han pasado.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: sin dependencias.
- **Phase 2**: depende de T001 y bloquea toda modificación.
- **US1 / Phase 3**: depende de Phase 2.
- **US2 / Phase 4**: T010 y T011 pueden comenzar tras Phase 2 en paralelo con US1; T016 depende de la
  UI EN de US1 y el checkpoint completo de US2 requiere T008 y T010–T017.
- **US3 / Phase 5**: depende de las modificaciones completas de US1 y US2 para medir regresión sobre
  el estado final.
- **Phase 6**: depende de US1, US2 y US3 completas.

### User Story Dependencies

```text
Setup → Foundation ─┬─→ US1: experiencia EN ─┐
                    └─→ US2: contrato seguro ─┼─→ US3: regresión CA/ES → Final
                         (T016 ← US1)  │
```

- **US1**: independientemente demostrable hasta revisión.
- **US2**: Function y backend pueden implementarse en paralelo con US1; su validación UI necesita
  que US1 exista.
- **US3**: se ejecuta después de ambas para validar el resultado integrado sin repetir sus pruebas EN.

### Critical Path

`T001 → T002/T003 → T008 → T009 → T016 → T020 → T021/T022 → T023 → T024`

El contrato backend coordinado sigue `T011 → T012 → T014/T017 → T019` y debe estar completo
antes de Phase 6.

### Parallel Opportunities

- T002 y T003.
- T004, T005, T006 y T007; T008 puede desarrollarse en paralelo si se mantiene su archivo exclusivo.
- T010 y T011 entre repositorios; T015 no depende de cambios de aplicación.
- T013, T014 y T015 tras sus prerrequisitos respectivos.
- T018 y T019.
- T021 y T022.

---

## Parallel Examples

### User Story 1

```text
Task T004: CTA EN en src/i18n/en.json
Task T005: URL EN en src/pages/comunicats/index.astro
Task T006: nueva ruta src/pages/en/comunicats/send-an-announcement.astro
Task T007: soporte EN en src/templates/CommunicatSubmissionPage.astro
```

### User Story 2

```text
Task T010: allowlist EN en netlify/functions/comunicat-submission.mjs
Task T011: enum EN en ../guiapineda-strapi/.../schema.json
Task T015: regresión local del token existente sin modificar archivos
```

### User Story 3

```text
Task T018: sonda CA/ES de la Function
Task T019: sonda CA/ES de Strapi
```

---

## Implementation Strategy

### MVP observable

1. Completar Setup y Foundation.
2. Implementar T004–T008.
3. Ejecutar T009 y demostrar US1 hasta revisión.

US1 es el MVP observable, pero no es entregable como feature completa hasta cerrar US2 y US3.

### Incremental delivery

1. **US1**: CTA, ruta y formulario EN.
2. **US2**: contrato EN seguro y privado de extremo local a extremo local.
3. **US3**: regresión CA/ES sobre el resultado integrado.
4. **Final**: builds, cobertura restante, diff y estado Git.

No desplegar, no ejecutar el gate remoto y no introducir infraestructura durante ninguna fase.

## Notes

- Cada tarea de aplicación se limita a un archivo autorizado por `plan.md`; `types/generated/contentTypes.d.ts`
  no contiene lógica manual y se conserva únicamente como salida versionada regenerada desde el schema.
- Las sondas desechables deben ejecutarse fuera del repositorio o en memoria y no dejar archivos.
- No modificar las piezas compartidas inspeccionadas en T002/T003 salvo defecto real; si aparece uno,
  detener IMPLEMENT y solicitar revisión de alcance.
- No confundir build o respuesta controlada con E2E desplegado.
- Marcar una tarea completada solo cuando su evidencia concreta exista.
