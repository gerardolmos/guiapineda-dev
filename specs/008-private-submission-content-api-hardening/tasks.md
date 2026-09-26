# Tasks: Endurecimiento de Content API para solicitudes privadas de Agenda y Veus

**Input**: Design documents from `specs/008-private-submission-content-api-hardening/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/removed-content-api.md`, `quickstart.md`

**Tests**: La SPEC exige validación local determinista. El harness persistente se construye y valida
antes de retirar rutas; ninguna eliminación puede comenzar hasta cerrar el gate pre-cambio.

**Organization**: Las tareas se agrupan por baseline compartido y por las tres historias de usuario.
La matriz QA01–QA22 de este documento usa la numeración de la autorización humana más reciente: las
cinco operaciones Veus ocupan QA06–QA10 por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo porque afecta archivos distintos y comparte un gate previo.
- **[Story]**: historia de usuario trazada desde `spec.md`.
- Todos los paths backend son relativos a `guiapineda-strapi/`; los SDD son relativos a
  `guiapineda-astro/`.

## Phase 1: Setup — Precheck and immutable baselines

**Purpose**: fijar alcance, datos de referencia y seguridad antes de crear el harness o arrancar la
instancia aislada.

- [X] T001 Verificar `main...origin/main`, 0 ahead/behind, ausencia de staged y conjunto esperado de Feature 008 en ambos repositorios; registrar hashes HEAD y evidencia en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T002 Inventariar los seis factories autorizados y confirmar mediante búsqueda global que solo `src/api/solicitud-agenda/routes/solicitud-agenda.js` y `src/api/solicitud-veu/routes/solicitud-veu.js` registran la Content API y que sus cuatro wrappers controller/service no tienen consumidores; registrar evidencia en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T003 Registrar SHA-256 de los dos schemas privados, `types/generated/contentTypes.d.ts`, APIs públicas Agenda/Veu y schemas de Comunicats/Millorem/Foto del Mes/Comercio como baseline read-only en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T004 Capturar sin motor SQLite el SHA-256, tamaño, mtime y estado de sidecars `-wal`/`-shm`/`-journal` de `guiapineda-strapi/.tmp/data.db`, confirmar ausencia de procesos Strapi y registrar el gate en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T005 Auditar el allowlist y prohibiciones de seguridad de `specs/008-private-submission-content-api-hardening/plan.md`: sin schemas, config, paquetes, permisos, autenticación, tokens, rate limiting, frontend funcional, infraestructura ni SQLite real; detenerse y volver a PLAN ante cualquier necesidad adicional

**Checkpoint**: baselines Git, código, schemas y SQLite registrados; ningún runtime ni archivo de
producto modificado.

---

## Phase 2: Foundational — Harness and mandatory pre-change gate

**Purpose**: crear el único artefacto QA autorizado y demostrar antes de eliminar nada que las diez
rutas existen, el runtime temporal funciona y las superficies legítimas permanecen identificables.

**⚠️ CRITICAL**: T006–T016 bloquean toda eliminación de factories.

- [X] T006 Crear la estructura del harness con CLI cerrada `--expect-private-routes=present|absent` y `--group=routes|internal|admin|regression|all`, resultados normalizados QA01–QA22 y fallo fail-fast en `scripts/qa/private-submission-content-api-hardening-qa.mjs`
- [X] T007 Implementar en `scripts/qa/private-submission-content-api-hardening-qa.mjs` el análisis estático dual que exige las diez firmas de ruta antes del cambio y su ausencia después, sin aceptar middleware, alias, política runtime ni `401`/`403` como sustituto
- [X] T008 Implementar en `scripts/qa/private-submission-content-api-hardening-qa.mjs` fingerprints y aserciones read-only para schemas, tipos generados, UIDs internos, mapas de moderación/Admin, APIs públicas Agenda/Veu y los cuatro flujos privados no afectados
- [X] T009 Implementar en `scripts/qa/private-submission-content-api-hardening-qa.mjs` el gate de SQLite real: SHA-256, tamaño, mtime y sidecars pre/post sin conexión del motor, con aborto previo si el path temporal resuelve a `guiapineda-strapi/.tmp/data.db`
- [X] T010 Implementar en `scripts/qa/private-submission-content-api-hardening-qa.mjs` el runtime aislado con `mkdtemp`, SQLite/uploads temporales, secretos sintéticos, telemetría y comprobaciones de actualización desactivadas mediante controles efímeros del harness, cron desactivado antes de `load()`, y una guarda instalada antes de `createStrapi().load()` sobre las primitivas relevantes de conexión saliente de Node/Strapi que permita únicamente los destinos loopback exactos necesarios (`127.0.0.1`, `::1`, `localhost`), haga FAIL inmediato y registre evidencia determinista ante cualquier destino no-loopback; demostrar la guarda con una sonda negativa sintética interceptada antes de toda conexión efectiva, escuchar solo en loopback/puerto `0` y restaurar todas las primitivas interceptadas junto con `app.destroy()` y la limpieza temporal en `finally`
- [X] T011 Implementar QA01–QA10 en `scripts/qa/private-submission-content-api-hardening-qa.mjs`: mapa real de rutas en baseline y requests HTTP GET/POST/GET-item/PUT/DELETE para Agenda y Veus con expectativa seleccionada por CLI
- [X] T012 Implementar QA11–QA14 en `scripts/qa/private-submission-content-api-hardening-qa.mjs`: disponibilidad/autenticación de ambos canales internos y creación sintética `pendent` mediante `strapi.documents(uid).create` en la SQLite temporal
- [X] T013 Implementar QA15–QA17 en `scripts/qa/private-submission-content-api-hardening-qa.mjs`: moderación Agenda/Veus y resolución de ambos content-types mediante Content Manager, sin usar routers/controllers/services Content API
- [X] T014 Implementar QA18–QA22 en `scripts/qa/private-submission-content-api-hardening-qa.mjs`: contenido público Agenda/Veu, cuatro flujos privados, CA/ES/EN, fingerprints de schemas/tipos y SQLite real intacta
- [X] T015 Ejecutar `node --check scripts/qa/private-submission-content-api-hardening-qa.mjs` y corregir únicamente ese archivo hasta obtener código 0, sin ejecutar todavía la eliminación autorizada
- [X] T016 Ejecutar el gate pre-cambio con `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=present --group=all` y permitir PASS solo con evidencia de diez firmas actuales, canal interno/Admin compatibles, telemetría y update checks desactivados, guarda no-loopback instalada antes de `createStrapi().load()`, sonda negativa PASS sin conexión externa efectiva, cero tráfico externo real, guarda restaurada, runtime temporal limpio y SQLite real idéntica; ante cualquier fallo registrar el bloqueo en `specs/008-private-submission-content-api-hardening/tasks.md` y no desbloquear T017/T018

**Checkpoint — PRE-CHANGE GATE**: las diez rutas están demostradas, el harness es reproducible, las
superficies internas/administrativas están identificadas y la SQLite real permanece intacta. Solo
un PASS explícito de T016 desbloquea T017/T018.

---

## Phase 3: User Story 1 — Mantener privadas las solicitudes de Agenda y Veus (Priority: P1) 🎯 MVP

**Goal**: retirar por diseño las diez operaciones Content API privadas y observar la semántica
natural de Strapi (`404` en los cuatro `GET`; `405` en los seis mutadores) sin introducir
mecanismos de rechazo o normalización alternativos.

**Independent Test**: los seis factories no existen, el mapa Strapi no contiene ninguna de las diez
firmas privadas Agenda/Veu ni alias/shadowing equivalente, los cuatro `GET` reales devuelven `404`,
los seis mutadores devuelven `405` con `Allow: HEAD, GET` igual que una ruta control inexistente y
ninguno expone contenido privado ni produce efectos persistentes.

### Implementation and verification

- [X] T017 [P] [US1] Eliminar exactamente `src/api/solicitud-agenda/routes/solicitud-agenda.js`, `src/api/solicitud-agenda/controllers/solicitud-agenda.js` y `src/api/solicitud-agenda/services/solicitud-agenda.js` después del PASS de T016
- [X] T018 [P] [US1] Eliminar exactamente `src/api/solicitud-veu/routes/solicitud-veu.js`, `src/api/solicitud-veu/controllers/solicitud-veu.js` y `src/api/solicitud-veu/services/solicitud-veu.js` después del PASS de T016
- [X] T019 [US1] Auditar inmediatamente `src/api/solicitud-agenda/` y `src/api/solicitud-veu/`: seis eliminaciones exactas, ambos `content-types/*/schema.json` presentes y byte-idénticos, cero archivo backend adicional modificado; detenerse ante cualquier diferencia
- [X] T020 [US1] Actualizar exclusivamente `scripts/qa/private-submission-content-api-hardening-qa.mjs` y ejecutar `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=absent --group=routes`: exigir los seis factories ausentes, mapa real sin las diez firmas heredadas ni alias/shadowing, QA01/QA03/QA06/QA08 con `404` natural, QA02/QA04/QA05/QA07/QA09/QA10 con `405` natural y `Allow: HEAD, GET`, cero creación/modificación/eliminación mediante conteos/estados pre/post en SQLite temporal, cero metadata privada y equivalencia auxiliar con `/api/feature008-definitely-nonexistent` (`GET` `404`; `POST`/`PUT`/`DELETE` `405` con el mismo `Allow`) sin registrar esa ruta ni crear QA23; no aceptar un `405` aislado como PASS ni fabricar/normalizar respuestas mediante harness, middleware, custom router, alias, política runtime, configuración o interceptor productivo

**Checkpoint — POST-CHANGE ROUTE GATE**: User Story 1 es funcional e independientemente verificable;
las rutas no existen y el contrato negativo se cumple.

---

## Phase 4: User Story 2 — Preservar recepción interna y moderación humana (Priority: P1)

**Goal**: demostrar que retirar Content API no afecta recepción servidor-servidor, Documents
Service, moderación humana ni Content Manager.

**Independent Test**: las dos submissions sintéticas se crean como privadas en la SQLite temporal,
pueden recorrer las superficies internas/administrativas y no generan contenido público.

### Internal and administrative regressions

- [X] T021 [US2] Ejecutar QA11–QA14 con `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=absent --group=internal` y exigir ambos canales autenticados y ambas creaciones `pendent` mediante Documents Service
- [X] T022 [US2] Ejecutar QA15–QA17 con `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=absent --group=admin` y exigir moderación Agenda/Veus y ambos content-types disponibles en Content Manager
- [X] T023 [US2] Comparar conteos/estados públicos antes y después de las submissions sintéticas dentro de `scripts/qa/private-submission-content-api-hardening-qa.mjs` y registrar en `specs/008-private-submission-content-api-hardening/tasks.md` que no hubo publicación automática ni cambio editorial

**Checkpoint — POST-CHANGE INTERNAL GATE**: User Stories 1 y 2 funcionan independientemente; la
superficie pública privada desapareció y los caminos legítimos permanecen.

---

## Phase 5: User Story 3 — Verificar el hardening sin regresiones (Priority: P2)

**Goal**: obtener evidencia determinista de regresión cero, neutralidad lingüística e integridad de
schemas/SQLite.

**Independent Test**: dos ejecuciones completas producen los mismos QA01–QA22 normalizados y los
harnesses existentes permanecen PASS, sin residuo ni cambio fuera de allowlist.

### Regression and determinism

- [X] T024 [US3] Ejecutar QA18–QA22 con `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=absent --group=regression` y exigir Agenda/Veu públicos, Comunicats/Millorem/Foto del Mes/Comercio, CA/ES/EN, schemas/tipos y SQLite real intactos
- [X] T025 [US3] Ejecutar la matriz completa con `node scripts/qa/private-submission-content-api-hardening-qa.mjs --expect-private-routes=absent --group=all` y registrar QA01–QA22 PASS en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T026 [US3] Repetir el comando completo de T025 y comparar resultados normalizados, exigiendo determinismo exacto y ausencia de paths, puertos, IDs o timestamps temporales en `scripts/qa/private-submission-content-api-hardening-qa.mjs`
- [X] T027 [P] [US3] Ejecutar la regresión existente `node scripts/qa/commerce-submission-qa.mjs` desde `guiapineda-astro/` y registrar PASS sin modificar `scripts/qa/commerce-submission-qa.mjs`
- [X] T028 [P] [US3] Ejecutar la regresión existente `node scripts/qa/multisection-reporting-qa.mjs` desde `guiapineda-astro/` y registrar PASS sin modificar `scripts/qa/multisection-reporting-qa.mjs`

**Checkpoint**: las tres historias están completas y la matriz de privacidad, continuidad y
regresión es determinista.

---

## Phase 6: Final audit and security gates

**Purpose**: cerrar IMPLEMENT con evidencia de alcance, integridad y ausencia de residuos antes de
CONVERGE.

- [X] T029 Ejecutar `node --check scripts/qa/private-submission-content-api-hardening-qa.mjs` y confirmar que el harness final conserva QA01–QA22 completos, observa respuestas Strapi reales sin fabricarlas, implementa Option A con cuatro `404`, seis `405`, `Allow: HEAD, GET`, ruta control auxiliar y cero efectos persistentes en `scripts/qa/private-submission-content-api-hardening-qa.mjs`
- [X] T030 Ejecutar `git diff --check`, revisar el diff backend completo y confirmar en `specs/008-private-submission-content-api-hardening/tasks.md` que solo existen seis eliminaciones autorizadas y `scripts/qa/private-submission-content-api-hardening-qa.mjs` nuevo/modificado, sin segundo harness, middleware, custom router, alias, configuración, política runtime ni interceptor productivo
- [X] T031 Verificar por hashes/diff que schemas, `types/generated/contentTypes.d.ts`, config, package/lockfile, permisos, autenticación, tokens, rate limiting, cron, cleanup, frontend funcional y otros content-types permanecen read-only; registrar evidencia en `specs/008-private-submission-content-api-hardening/tasks.md`
- [X] T032 Repetir el gate final de `guiapineda-strapi/.tmp/data.db` sin motor SQLite y exigir SHA-256, tamaño, mtime y sidecars iguales a T004, temporales eliminados, puerto cerrado, cero proceso Strapi, guarda de red restaurada, cero monkeypatch/interceptor global residual y evidencia de cero tráfico externo real; detenerse sin restaurar si existe cualquier diferencia
- [X] T033 Auditar Constitución, Option A y seguridad en `specs/008-private-submission-content-api-hardening/tasks.md`: privacidad por diseño, mínima superficie, CA/ES/EN, coordinación de repositorios, seis factories ausentes, mapa sin diez firmas ni alias/shadowing, cuatro `GET` en `404`, seis mutadores en `405` con `Allow: HEAD, GET`, ruta control equivalente, cero efectos persistentes, cero infraestructura/dependencias, sin permisos manuales como evidencia y sin middleware/custom router/config/política/interceptor ni normalización `405` → `404`
- [X] T034 Confirmar `git status --short --branch` sin staged ni untracked inesperados en ambos repositorios, contabilizar todas las tareas en `specs/008-private-submission-content-api-hardening/tasks.md` y documentar ausencia de commit, push y deploy antes de pasar a CONVERGE

---

## QA01–QA22 Traceability

| QA | Requirement | Primary task |
|---|---|---|
| QA01 | GET collection Agenda → `404` | T011, T020 |
| QA02 | POST collection Agenda → `405`, `Allow: HEAD, GET`, zero writes | T011, T020 |
| QA03 | GET item Agenda → `404` | T011, T020 |
| QA04 | PUT item Agenda → `405`, `Allow: HEAD, GET`, zero updates | T011, T020 |
| QA05 | DELETE item Agenda → `405`, `Allow: HEAD, GET`, zero deletes | T011, T020 |
| QA06 | GET collection Veus → `404` | T011, T020 |
| QA07 | POST collection Veus → `405`, `Allow: HEAD, GET`, zero writes | T011, T020 |
| QA08 | GET item Veus → `404` | T011, T020 |
| QA09 | PUT item Veus → `405`, `Allow: HEAD, GET`, zero updates | T011, T020 |
| QA10 | DELETE item Veus → `405`, `Allow: HEAD, GET`, zero deletes | T011, T020 |
| QA11 | Internal Agenda route available/authenticated | T012, T021 |
| QA12 | Internal Veu route available/authenticated | T012, T021 |
| QA13 | Internal Agenda creation uses Documents Service | T012, T021 |
| QA14 | Internal Veu creation uses Documents Service | T012, T021 |
| QA15 | Agenda moderation compatible | T013, T022 |
| QA16 | Veu moderation compatible | T013, T022 |
| QA17 | Content Manager retains both content-types | T013, T022 |
| QA18 | Public Agenda unchanged | T014, T023, T024 |
| QA19 | Public Veu unchanged | T014, T023, T024 |
| QA20 | Comunicats, Millorem, Foto del Mes and Comercio unchanged | T014, T024, T027, T028 |
| QA21 | CA/ES/EN neutral | T014, T024 |
| QA22 | Schemas/types and real SQLite unchanged | T009, T014, T024, T031, T032 |

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1**: starts immediately and is sequential because each baseline enriches the same gate.
- **Phase 2**: depends on T001–T005. T006–T014 build one harness sequentially; T015 validates syntax;
  T016 is the mandatory pre-change gate.
- **Phase 3**: T017 and T018 depend on T016 and may run in parallel. T019 requires both; T020 requires
  T019.
- **Phase 4**: depends on T020 so regressions never mask a failed route-removal gate.
- **Phase 5**: depends on T023. T027/T028 may run in parallel after T026.
- **Phase 6**: depends on T024–T028 and is the final audit before CONVERGE.

### Critical path

```text
T001 → T002 → T003 → T004 → T005
  → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016
  → {T017 || T018} → T019 → T020
  → T021 → T022 → T023
  → T024 → T025 → T026 → {T027 || T028}
  → T029 → T030 → T031 → T032 → T033 → T034
```

### Story dependencies

- **US1 (P1)**: begins only after the pre-change gate T016.
- **US2 (P1)**: requires the post-change route gate T020, because continuity must be proven against
  the final topology.
- **US3 (P2)**: requires US1 and US2; it is the cross-surface regression/determinism story.

## Parallel Opportunities

### Agenda and Veus removals

```text
Task: T017 — delete the three Agenda factories
Task: T018 — delete the three Veus factories
```

Both start only after T016 and touch disjoint files.

### Existing supplementary regressions

```text
Task: T027 — commerce-submission-qa.mjs
Task: T028 — multisection-reporting-qa.mjs
```

Both are read-only executions of separate existing harnesses after the full Feature 008 matrix.

## Implementation Strategy

### MVP technical increment

1. Complete Phase 1 baselines.
2. Complete Phase 2 harness and mandatory pre-change PASS.
3. Complete Phase 3 removal and the real Option A gate: four `404`, six `405`, exact `Allow`, route
   control, route-map absence and zero persistent effects.
4. Stop and validate US1 independently.

US1 is the smallest functional security increment, but it MUST NOT be considered ready for closure
or delivery until US2, US3 and Phase 6 also pass.

### Safe incremental sequence

1. Baseline everything before mutation.
2. Prove the test mechanism against the existing exposed topology.
3. Remove only the six authorized factories.
4. Prove route absence before testing broader regressions.
5. Prove internal/admin continuity.
6. Prove public/private/language/data regressions and determinism.
7. Audit Constitution, Git, filesystem and SQLite.

## Notes

- No task authorizes schema, migration, database cleanup, deploy, Railway, PostgreSQL, Cloudinary,
  Resend, Upstash or live-permission work.
- No task authorizes `npm run develop`, `npm run start`, external network access or interactive Admin.
- No task authorizes commit or push.
- Manual permissions are never primary evidence; route nonexistence is verified from the real router
  and real HTTP behavior.
- The latest human QA mapping is authoritative for task execution: QA01–QA10 are the ten individual
  removed operations. This refines labels only and does not change PLAN coverage.
- Any unexpected file, runtime dependency or required modification outside the closed allowlist is a
  blocking condition requiring return to PLAN.

## Implementation evidence

- **T001–T005**: frontend `31f921157a3140e8b7da2816cd9bb0b3b492985a` and backend
  `44429875a09b0630625d7c09f6109c9e660b6990` were on `main...origin/main`, with no staged files;
  the only frontend changes were the eight Feature 008 SDD artifacts and backend was clean. The six
  factories existed, only the two route factories registered the private Content API, and the four
  controller/service wrappers had no consumers. Protected hashes were captured in the harness.
- **SQLite baseline (T004)**: filesystem-only SHA-256
  `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`, size `1847296`,
  mtime `2026-09-24T20:35:07+0200`; WAL/SHM/journal absent. Ports 1337/4321/5173 were free and the
  read-only process check found no Strapi/Astro/Vite process.
- **T006–T016**: `node --check` PASS. The final pre-change run with
  `--expect-private-routes=present --group=all` returned QA01–QA22 PASS, proved all ten current route
  signatures, authenticated internal creation and moderation/Content Manager continuity, used only
  a disposable SQLite/uploads root, blocked its synthetic non-loopback probe before connection,
  made zero effective external requests, restored all guards, removed the temporary root and left
  the real SQLite filesystem snapshot identical.
- **T017–T019**: exactly the six authorized Agenda/Veus Content API factories were deleted. Both
  retained schema hashes remained `4807248506b2864ead5bf6f874b463cecc127a76cc500fa0da3b5d19c9180c58`
  and `64d5b17dcb66629f4f1a532f0735f2dddd2df48bb2d596ad6d499e28148c8197`; no additional backend
  product file changed.
- **T020 historical blocker — resolved by CLARIFY/PLAN before the successful retry**: the real route map contains zero removed private signatures and GET requests
  return `404`, but POST returns `405` with `Allow: HEAD, GET`. A POST to the unrelated control path
  `/api/feature008-definitely-nonexistent` returns the same `405`. The source is Strapi's existing
  `strapi::public` catch-all GET route `/((?!uploads/).+)` combined with router `allowedMethods()`.
  La expectativa anterior quedó sustituida por Option A: conservar esa semántica natural sin
  middleware/configuración, completar en T020 la ruta control y los invariantes pre/post, y exigir
  evidencia conjunta de factories/mapa/status/efectos antes de PASS.
- **T020 PASS**: el reintento con autorización limitada al bind loopback ejecutó el gate `routes`
  completo. QA01/QA03/QA06/QA08 devolvieron `404`; QA02/QA04/QA05/QA07/QA09/QA10 devolvieron
  `405` con `Allow: HEAD, GET`, equivalencia con la ruta control y snapshots privados idénticos
  antes/después. Los seis factories y las diez firmas/alias/shadows permanecieron ausentes; hubo
  cero metadata privada, cero tráfico externo efectivo, guarda restaurada, temporal eliminado y
  SQLite real idéntica.
- **T021–T024 PASS**: QA11–QA17 confirmaron autenticación interna, creaciones Agenda/Veus mediante
  Documents Service, moderación y ambos content-types en Content Manager. QA18–QA22 confirmaron
  cero publicación automática, Agenda/Veus públicas intactas, los cuatro flujos privados intactos,
  neutralidad CA/ES/EN y fingerprints/SQLite real sin cambios.
- **T025–T026 PASS**: dos ejecuciones completas consecutivas devolvieron la misma salida normalizada
  QA01–QA22 y el mismo resumen final, sin paths, puertos, IDs ni timestamps temporales en dicha
  salida; Option A, aislamiento y limpieza fueron PASS en ambas ejecuciones.
- **T027–T028 PASS**: los harnesses existentes de Commerce y reporting multisección completaron
  todos sus grupos sin modificación, incluida la regresión Feature 003 y los grupos solicitados de
  Feature 006.
- **T029–T033 PASS**: sintaxis, diff/allowlist, fingerprints, SQLite/filesystem, procesos/puertos,
  limpieza y auditoría constitucional/Option A quedaron validados. Existe un único harness; no hay
  middleware, custom router, alias, shadowing, configuración, política, interceptor productivo,
  normalización, infraestructura ni dependencia nueva.
- **T034 PASS**: 34/34 tareas completadas. Frontend y backend permanecen en `main...origin/main`,
  `HEAD == origin/main`, 0 ahead/behind y sin staged; los únicos untracked son los ocho artefactos
  SDD de Feature 008 y el único harness autorizado. No hubo commit, push ni deploy.
