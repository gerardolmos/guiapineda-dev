# Tasks: Denuncia privada de Comunicats

**Input**: Design documents from `/specs/003-communicat-reporting/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/communicat-report-contract.md`, `quickstart.md`

**Tests**: La feature exige validación funcional local. No se añade un framework ni una suite persistente: las comprobaciones usan builds, inspección de salida y probes locales con dobles controlados y temporales fuera de ambos repositorios.

**Organization**: Las tareas se agrupan por historia. Como las tres tienen prioridad P1, US2 se implementa primero porque proporciona la recepción privada necesaria para que US1 pueda demostrar un envío completo; US3 verifica seguridad y recuperación sobre el flujo ya integrado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo tras completar sus dependencias explícitas porque afecta archivos distintos.
- **[Story]**: historia de usuario de `spec.md` a la que aporta trazabilidad.
- Los paths de frontend/Function son relativos a `guiapineda-astro`; los paths `../guiapineda-strapi/` pertenecen al repositorio backend coordinado.

## Phase 1: Setup and scope baseline

**Purpose**: fijar el estado inicial y las garantías que no pueden degradarse.

- [x] T001 Registrar el baseline de `git status` de ambos repositorios y confirmar contra `specs/003-communicat-reporting/plan.md` que solo se modificarán los archivos autorizados, sin dependencias, infraestructura, despliegue ni superficies distintas de Comunicats

**Checkpoint**: alcance y estados iniciales conocidos antes de modificar aplicación.

---

## Phase 2: Foundational shared integration

**Purpose**: habilitar los dos puntos compartidos mínimos que necesitará el contrato coordinado.

**⚠️ CRITICAL**: completar esta fase antes de las historias.

- [x] T002 [P] Añadir exclusivamente la sección interna `communicat_report` a la allowlist de `netlify/functions/_shared/strapi-submission.mjs`, preservando todas las secciones y la autenticación existentes
- [x] T003 [P] Ampliar exclusivamente el tipo de `scope` para la denuncia en `src/components/EmailVerificationBlock.astro`, sin cambiar la UI, los endpoints ni las garantías compartidas de verificación

**Checkpoint**: el canal interno y el bloque de verificación admiten la nueva feature sin alterar los flujos existentes.

---

## Phase 3: User Story 2 - Recepción y revisión privada (Priority: P1)

**Goal**: recibir una denuncia mínima, privada y ligada inequívocamente a un Comunicat publicado, accesible solo al equipo editorial y sin efectos automáticos.

**Independent Test**: invocar el servicio interno con un Comunicat publicado controlado y comprobar que crea una entrada privada `pendiente` con los campos exactos; referencias inexistentes, no publicadas o discordantes no crean nada y nunca se actualiza el Comunicat.

### Implementation for User Story 2

- [x] T004 [P] [US2] Crear el content type privado en `../guiapineda-strapi/src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json` con `comunicat_document_id` string requerido de 1–128 caracteres, `comunicat_slug` string requerido, `motivo` enum exacto de cinco valores, `explicacion` text opcional máximo 1.000, `idioma_solicitud` enum `ca|es|en`, `estado_denuncia` enum `pendiente|revisada|cerrada` requerido con default `pendiente`, `draftAndPublish: false` y ningún campo personal, relación, media o componente
- [x] T005 [P] [US2] Crear en `../guiapineda-strapi/src/services/internal-communicat-report.js` la validación de allowlist exacta, ausencia de archivos/campos personales, `documentId`, slug, idioma, cinco motivos y explicación de hasta 1.000 caracteres obligatoria y no blanca para `otro`
- [x] T006 [US2] Completar `../guiapineda-strapi/src/services/internal-communicat-report.js` para resolver por `documentId` un `api::comunicat.comunicat` publicado, exigir coincidencia del slug y crear una denuncia independiente en `pendiente` con solo los datos autorizados, sin deduplicar ni llamar update/delete/publish/unpublish sobre el Comunicat (depende de T004 y T005)
- [x] T007 [US2] Incorporar en `../guiapineda-strapi/src/api/internal-submission/controllers/internal-submission.js` un despacho explícito de `communicat_report` al servicio nuevo, conservando autenticación, respuestas y servicio anterior para todas las demás secciones (depende de T006)
- [x] T008 [US2] Regenerar mediante el comando normal de Strapi `../guiapineda-strapi/types/generated/contentTypes.d.ts` desde el schema y comprobar que el diff generado representa únicamente `api::denuncia-comunicat.denuncia-comunicat`, sin edición manual (depende de T004)
- [x] T009 [US2] Ejecutar la matriz local del modelo/servicio descrita en `specs/003-communicat-reporting/quickstart.md`: aceptación publicada, rechazo inexistente/no publicado/slug discordante, estados exactos, dos denuncias independientes, acceso privado sin rutas Content API y cero mutaciones del Comunicat (depende de T006–T008)

**Checkpoint**: US2 puede demostrarse directamente en backend sin navegador ni infraestructura externa.

---

## Phase 4: User Story 1 - Denunciar desde un Comunicat publicado (Priority: P1) 🎯 MVP público

**Goal**: ofrecer en cada detalle CA/ES/EN un formulario privado completo, verificar el email y confirmar solo una denuncia aceptada por el canal privado.

**Independent Test**: abrir un detalle construido en cada idioma, encontrar la acción tras el cuerpo y antes de relacionados, completar una denuncia válida con un token simulado de un solo uso y observar confirmación sin cambios en el Comunicat.

### Implementation for User Story 1

- [x] T010 [P] [US1] Crear en `netlify/functions/communicat-report.mjs` el validador puro del request: campos exactos, `ca|es|en`, cinco motivos, explicación <=1.000 y requerida/no blanca para `otro`, email/token requeridos, `documentId`/slug válidos y salida estructuralmente separada entre `verificationEmail` y payload editorial sin email, token, nombre ni IP
- [x] T011 [US1] Crear `netlify/functions/communicat-report-http.mjs` para aceptar solo POST multipart acotado sin archivos, consumir el token vinculado al email antes de cualquier llamada interna, enviar exclusivamente el payload editorial a `communicat_report` y devolver `201 {ok:true}` solo tras aceptación del backend (depende de T002, T009 y T010)
- [x] T012 [US1] Completar en `netlify/functions/communicat-report-http.mjs` honeypot, respuestas JSON no-cache, errores seguros y rate limiting temporal mediante el patrón existente `ip`/`domain`, sin leer, copiar ni persistir IP en código o payload (depende de T011)
- [x] T013 [P] [US1] Crear `src/components/CommunicatReportFlow.astro` con acción secundaria, formulario compartido, cinco motivos y copy completo de etiquetas, ayuda, validación, errores y confirmación en CA/ES/EN; incluir `documentId`, slug e idioma, explicación privada de máximo 1.000, email y `EmailVerificationBlock`, sin nombre, adjuntos ni otros datos personales
- [x] T014 [P] [US1] Crear en `src/lib/communicatReportFlow.ts` la validación del navegador y el bloqueo de envío hasta disponer de motivo válido, explicación no blanca cuando sea `otro`, longitud <=1.000 y email verificado, inicializando el controlador de verificación compartido (depende de T003 y T013)
- [x] T015 [US1] Completar `src/lib/communicatReportFlow.ts` para enviar a `/api/submissions/communicat-report`, mostrar confirmación solo con `{ok:true}`, conservar motivo/explicación ante fallos y reiniciar la autorización temporal tras un intento fallido que pueda haber consumido el token (depende de T011, T012 y T014)
- [x] T016 [P] [US1] Insertar `CommunicatReportFlow` en `src/templates/ComunicatArticlePage.astro` inmediatamente después de `StrapiBlocks` y antes de relacionados, pasándole `lang`, `comunicat.documentId` y `comunicat.slug` sin añadir consultas runtime ni alterar contenido, imagen, navegación o relacionados (depende de T013)
- [x] T017 [US1] Ejecutar la matriz local CA/ES/EN de `specs/003-communicat-reporting/quickstart.md` para ubicación, cinco motivos, copy, reglas de `otro`, límite 1.000, verificación, bloqueo, aceptación controlada y confirmación privada sin ocultar ni modificar el Comunicat (depende de T015 y T016)

**Checkpoint**: US1 funciona localmente en los tres idiomas contra dobles controlados del canal privado.

---

## Phase 5: User Story 3 - Flujo seguro y recuperable (Priority: P1)

**Goal**: rechazar abuso, referencias manipuladas y fallos sin filtrar datos, crear falsos positivos ni degradar sistemas compartidos.

**Independent Test**: ejecutar casos malformados, automatizados, token reutilizado y dependencia no disponible; solo el caso válido obtiene confirmación, los datos permitidos permanecen recuperables y el Comunicat sigue inalterado.

### Validation and regression for User Story 3

- [x] T018 [P] [US3] Ejecutar probes locales del contrato Function en `netlify/functions/communicat-report.mjs` y `netlify/functions/communicat-report-http.mjs` para campos duplicados/inesperados, archivos, honeypot, tamaño, motivo/idioma/explicación inválidos, token ausente/reutilizado, orden consumo->backend y ausencia de email/token/nombre/IP en la llamada interna
- [x] T019 [P] [US3] Ejecutar probes de fallos coordinados sobre `netlify/functions/communicat-report-http.mjs` y `../guiapineda-strapi/src/services/internal-communicat-report.js`, comprobando que referencia obsoleta o manipulada y backend no disponible no crean denuncia, no muestran éxito y no modifican el Comunicat
- [x] T020 [US3] Verificar regresión del mecanismo compartido mediante `src/components/EmailVerificationBlock.astro`, `src/lib/emailVerificationController.ts` y `netlify/functions/_shared/submission-verification.mjs`: CA/ES/EN, vinculación al email, cambio de email, token de un solo uso y reset conservan el comportamiento previo sin enviar emails reales
- [x] T021 [US3] Verificar regresión del canal interno mediante `netlify/functions/_shared/strapi-submission.mjs` y `../guiapineda-strapi/src/api/internal-submission/controllers/internal-submission.js`, confirmando que las secciones existentes mantienen allowlist, autenticación, payload y despacho anteriores
- [x] T022 [US3] Inspeccionar las salidas públicas CA/ES/EN generadas desde `src/templates/ComunicatArticlePage.astro` para demostrar lectura static-first sin requests editoriales, contenido/imágenes/navegación/relacionados sin regresión y ausencia de la denuncia en Agenda, Veus, comercios, Millorem Pineda y otras superficies

**Checkpoint**: US3 demuestra localmente rechazo, recuperación, privacidad y no regresión.

---

## Phase 6: Cross-repository validation and closure readiness

**Purpose**: verificar el resultado coordinado completo sin confundir dobles locales con infraestructura real.

- [x] T023 [P] Ejecutar `npm run build` en `guiapineda-astro` y registrar PASS/FAIL conforme a `specs/003-communicat-reporting/quickstart.md`
- [x] T024 [P] Ejecutar `npm run build` en `../guiapineda-strapi` después de T008 y confirmar que schema, servicio, dispatcher y tipos generados son coherentes
- [x] T025 Ejecutar la matriz local extremo a extremo de `specs/003-communicat-reporting/quickstart.md` con navegador/DOM local y dobles controlados: navegador -> verificación -> Function -> autenticación interna -> validación de Comunicat publicado -> denuncia privada, sin servicios externos ni emails reales (depende de T017–T024)
- [x] T026 Auditar `netlify/functions/communicat-report.mjs`, `netlify/functions/communicat-report-http.mjs`, `../guiapineda-strapi/src/services/internal-communicat-report.js` y `../guiapineda-strapi/src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json` para confirmar cero persistencia/transmisión editorial de email, token, nombre, IP u otros identificadores y cero efectos automáticos sobre Comunicats
- [x] T027 Ejecutar `git diff --check`, revisar `git status` y el diff completo de ambos repositorios, confirmando que solo existen archivos autorizados por `specs/003-communicat-reporting/plan.md`, sin temporales, dependencias, infraestructura o cambios en otras superficies
- [x] T028 Registrar en `specs/003-communicat-reporting/tasks.md` que entrega real de email, token/Upstash desplegado, enforcement Netlify, Function -> Strapi real, Content Manager desplegado y permanencia pública tras envío real quedan `DEFERRED — predeployment`; esta tarea verifica la clasificación y no declara ejecutado el E2E

**Checkpoint**: implementación local completa y preparada para ANALYZE/CONVERGE posterior; E2E real permanece diferido.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1**: sin dependencias.
- **Phase 2**: depende de T001 y bloquea las historias.
- **Phase 3 / US2**: depende de T002; T004 y T005 pueden empezar en paralelo. T006 depende de ambas, T007 de T006, T008 de T004 y T009 de T006–T008.
- **Phase 4 / US1**: T010 y T013 pueden comenzar en paralelo tras Phase 2; T011 necesita T009 y T010; T014 necesita T003 y T013; T015 integra T011–T014; T016 necesita T013; T017 necesita T015–T016.
- **Phase 5 / US3**: depende de US1 y US2 completos. T018 y T019 pueden ejecutarse en paralelo; T020–T022 son regresiones focalizadas posteriores a la implementación.
- **Phase 6**: depende de las tres historias. T023 y T024 pueden ejecutarse en paralelo; T025 requiere ambos builds y todas las matrices previas; T026–T028 cierran privacidad, alcance y evidencia diferida.

### User story dependencies

- **US2 (P1)**: primera por dependencia técnica; independientemente demostrable mediante el servicio privado.
- **US1 (P1)**: depende de la recepción privada de US2 para no mostrar una confirmación simulada como resultado funcional.
- **US3 (P1)**: depende del flujo integrado US1+US2 porque valida sus fallos, seguridad y regresiones.

### Critical path

`T001 -> T002 -> T004/T005 -> T006 -> T007 -> T009 -> T010 -> T011 -> T012 -> T015 -> T017 -> T018/T019 -> T023/T024 -> T025 -> T027 -> T028`

## Parallel Opportunities

- T002 y T003: archivos compartidos distintos.
- T004 y T005: schema y servicio nuevo, definidos por contratos cerrados.
- T008 puede avanzar tras T004 mientras T006/T007 continúan.
- T010 y T013: Function pura y componente visual independientes.
- Tras T013, T014 y T016 pueden avanzar en paralelo.
- T018 y T019: matrices Function y coordinada/backend separables.
- T023 y T024: builds en repositorios distintos.

## Parallel Example

```text
Tras T001:
- T002: allowlist interna de Function
- T003: scope del bloque de verificación

En US2:
- T004: schema privado de denuncia
- T005: validación del servicio nuevo

En US1:
- T010: validador puro de Function
- T013: formulario y copy CA/ES/EN

En cierre:
- T023: build Astro
- T024: build Strapi
```

## Implementation Strategy

1. Fijar baseline y extensiones compartidas mínimas.
2. Entregar primero el receptor privado US2 y demostrar que nunca toca el Comunicat.
3. Conectar US1 de extremo a extremo, empezando en paralelo por contrato Function y UI compartida.
4. Ejecutar US3 como hardening y regresión focalizada, sin repetir pruebas ajenas.
5. Ejecutar builds y matriz coordinada local.
6. Auditar privacidad/alcance y registrar el E2E real como `DEFERRED — predeployment`.

## MVP Scope

El incremento mínimo demostrable necesita **US2 + US1**: receptor privado seguido del formulario
público. US1 aislada no puede confirmar legítimamente que una denuncia fue recibida. US3 es
obligatoria antes de considerar completa la feature porque seguridad y recuperación son P1.

## Notes

- Los probes temporales deben permanecer fuera de ambos repositorios.
- No se envían emails reales ni se contactan servicios externos durante la validación local.
- `types/generated/contentTypes.d.ts` se regenera; nunca se edita manualmente.
- El modelo no incluye identidad/contacto y el lifecycle de solicitudes existente no se reutiliza.
- Cualquier archivo adicional o necesidad de infraestructura obliga a detener IMPLEMENT y volver a PLAN.

## Implementation evidence

- **T009, T018–T021, T025–T026 — PASS**: matriz contractual local con dobles controlados para CA/ES/EN, cinco motivos, límites, referencias publicadas/manipuladas, consumo único y vinculado del token, orden verificación -> backend, despacho interno autenticado, errores recuperables, denuncias independientes, payload editorial mínimo y cero mutaciones del Comunicat.
- **T017, T022, T025 — PASS**: build servido localmente y automatización de navegador local sobre los detalles CA/ES/EN; posición cuerpo -> denuncia -> relacionados, copy y campos correctos, bloqueo/recuperación/éxito, permanencia del Comunicat, lectura static-first y ausencia en otras superficies.
- **T023 — PASS**: `npm run build` en `guiapineda-astro`.
- **T008, T024 — PASS**: tipos regenerados mediante Strapi y `npm run build` en `guiapineda-strapi`; el diff generado añade únicamente el content type de denuncia.
- **T027 — PASS**: `git diff --check`, estados y diffs completos revisados en ambos repositorios; solo hay cambios autorizados y los probes temporales permanecen fuera de los repositorios.
- **T028 — DEFERRED — predeployment**: entrega real de email, token/Upstash desplegado, enforcement de rate limiting de Netlify, Function -> Strapi real desplegado, revisión en Content Manager desplegado y permanencia pública después de un envío real. Esta evidencia no se declara ejecutada durante IMPLEMENT local.
