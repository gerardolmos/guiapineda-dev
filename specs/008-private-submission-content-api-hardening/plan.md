# Implementation Plan: Endurecimiento de Content API para solicitudes privadas de Agenda y Veus

**Branch**: `008-private-submission-content-api-hardening` | **Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-private-submission-content-api-hardening/spec.md`

## Summary

En el baseline pre-IMPLEMENT, Agenda y Veus eran los únicos flujos privados que todavía registraban
routers Content API estándar. Cada router sin filtros publicaba cinco operaciones heredadas y
dejaba la privacidad dependiente de permisos externos al código. El diseño elimina los dos routers
y los cuatro wrappers estándar de controller/service que quedarían huérfanos, conservando sin
cambios los content-types privados y todos sus consumidores legítimos mediante Documents Service,
Content Manager y rutas internas.

En el working tree actual post-T019, los seis factories ya están eliminados y el harness backend
persistente ya existe. T001–T019 están completadas; T020–T034 permanecen pendientes. Si el siguiente
ANALYZE queda limpio, IMPLEMENT se reanudará en T020 para actualizar y ejecutar el harness conforme
a Option A. No se ha realizado commit, push ni deploy.

Una vez actualizado y ejecutado desde T020, el harness combinará comprobaciones estáticas y dobles
aislados con un smoke HTTP sobre una instancia Strapi programática, una SQLite temporal nueva y una
cuarentena temporal. Solo esa comprobación runtime demostrará la semántica natural: `404` para los
cuatro `GET` y `405` con `Allow: HEAD, GET` y cero efectos persistentes para los seis métodos
mutadores. Nunca se arrancará Strapi contra la SQLite real para esta feature.

## Technical Context

**Language/Version**: JavaScript CommonJS y ESM sobre Node.js 20–24

**Primary Dependencies**: Strapi 5.41.1; Documents Service; módulos estándar de Node.js; sin
dependencias nuevas

**Storage**: schemas y SQLite existentes sin cambios; el smoke runtime usa exclusivamente una
SQLite temporal descartable

**Testing**: harness Node persistente con `node:assert`, inspección de topología/rutas, dobles del
Documents Service y smoke HTTP Strapi aislado

**Target Platform**: backend Strapi local; frontend Astro permanece funcionalmente fuera de alcance

**Project Type**: aplicación web en dos repositorios; cambio funcional exclusivamente backend y SDD
en frontend

**Performance Goals**: cero coste runtime nuevo y diez rutas Content API privadas menos registradas

**Constraints**: ausencia real demostrada por eliminación de factories, mapa de rutas, semántica
HTTP natural y ruta control; sin middleware de rechazo ni normalización `405` → `404`; sin schema,
migración, datos, tipos generados, permisos, config, package/lockfile, infraestructura ni
dependencia nueva; CA/ES/EN neutral

**Scale/Scope**: dos content-types privados, diez rutas retiradas, seis wrappers estándar eliminados,
un harness QA y 22 categorías mínimas de validación

## Constitution Check

*GATE inicial y posterior al diseño reconciliado con Option A: PASS.*

| Principio | Evaluación antes de research | Evaluación después del diseño |
|---|---|---|
| I. Producto local y participación editorial | PASS: se preservan recepción privada, moderación humana y publicación editorial separada. | PASS: no cambia ningún estado ni se automatiza publicación. |
| II. Arquitectura static-first | PASS: se reduce acceso público directo a Strapi. | PASS: no se añade consulta runtime pública ni cambio frontend. |
| III. Participación moderada, privacidad y seguridad | PASS: la privacidad deja de depender de permisos públicos para estas colecciones. | PASS: canal interno, autenticación, cuarentena y moderación permanecen intactos. |
| IV. Integridad e infraestructura verificada | PASS: ningún schema, dato o SQLite forma parte del cambio. | PASS: runtime QA usa SQLite y cuarentena temporales, con gate de checksum sobre la base real. |
| V. Simplicidad y coste proporcional | PASS: retirar superficie sin consumidores es más simple que mantener una política runtime. | PASS: seis eliminaciones, un harness y cero infraestructura/dependencias. |
| VI. Paridad CA/ES/EN y no regresión | PASS: la decisión de ruta es independiente del idioma. | PASS: la matriz exige resultados idénticos CA/ES/EN y regresión pública/privada. |
| VII. Repositorios coordinados y contratos | PASS: backend contiene el cambio; frontend contiene SDD. | PASS: el contrato negativo queda documentado y no se introduce interfaz nueva. |
| Workflow y quality gates | PASS: SPECIFY y CLARIFY están cerrados antes de PLAN. | PASS: research, modelo, contrato, quickstart, allowlist y riesgos quedan explícitos. |

No existen violaciones constitucionales ni excepciones que justificar. La revisión previa confirma
que Option A reduce superficie sin añadir runtime; la revisión posterior confirma que aceptar la
semántica natural `404`/`405` preserva simplicidad, privacidad por diseño, integridad SQLite,
mantenibilidad, cero infraestructura nueva y gobernanza SDD.

## Baseline Pre-IMPLEMENT Architecture and Dependency Findings

Esta sección conserva la evidencia histórica de partida anterior a T017. No describe el working
tree actual post-T019, donde los seis factories enumerados ya no existen.

### Agenda

- `src/api/solicitud-agenda/routes/solicitud-agenda.js` exporta
  `createCoreRouter('api::solicitud-agenda.solicitud-agenda')` sin `only` ni `except`.
- El `pluralName` `solicitudes-agenda` produce `GET`/`POST /api/solicitudes-agenda` y
  `GET`/`PUT`/`DELETE /api/solicitudes-agenda/:id`.
- Controller y service son wrappers vacíos de `createCoreController` y `createCoreService`.

### Veus

- `src/api/solicitud-veu/routes/solicitud-veu.js` exporta
  `createCoreRouter('api::solicitud-veu.solicitud-veu')` sin `only` ni `except`.
- El `pluralName` `solicitudes-veu` produce `GET`/`POST /api/solicitudes-veu` y
  `GET`/`PUT`/`DELETE /api/solicitudes-veu/:id`.
- Controller y service son wrappers vacíos de las mismas factories estándar.

### Real dependencies

- Solo los dos archivos `routes/*.js` registran la Content API. Eliminarlos basta funcionalmente
  para retirar las diez firmas heredadas. El catch-all `GET` global de Strapi hace que los métodos
  mutadores sobre cualquier path inexistente respondan `405`; esa respuesta no registra ni
  restituye una Content API.
- Ningún import, frontend, Function, cron, helper, prueba o documento llama a los cuatro wrappers de
  controller/service. Sin routers quedan completamente huérfanos.
- El canal interno resuelve los UID en `internal-submission-request.js` y crea con
  `strapi.documents(uid).create`; no llama a controller, service ni router estándar.
- Moderación, preview privado y cleanup consultan o actualizan con Documents Service.
- Content Manager descubre los content-types por sus schemas y opera mediante el plugin Admin. El
  panel propio llama exclusivamente a `/api/internal/moderation/...`.
- Los tipos generados proceden de los schemas; retirar factories HTTP no cambia su definición.
- Comunicats, Millorem, Foto del Mes y Comercio ya siguen el patrón schema-only para solicitudes
  privadas.

## Technical Design

1. Eliminar los routers estándar de Agenda y Veus para impedir su registro por Strapi.
2. Eliminar también sus controllers/services estándar porque su única función era soportar esos
   routers, no tienen consumidores y quedarían como código muerto.
3. Conservar exactamente ambos `schema.json`. Así continúan registrados los content-types para
   Documents Service y Content Manager sin cambios persistentes.
4. No añadir routers negativos, middleware, `401`, `403`, política de permisos, configuración
   runtime ni normalización artificial. La ausencia produce `404` para `GET` y el comportamiento
   global natural de Strapi produce `405` para `POST`, `PUT` y `DELETE`.
5. No regenerar ni modificar `types/generated/contentTypes.d.ts`: no cambia ningún schema.
6. Añadir un único harness backend sin script de paquete ni dependencia nueva.

## QA Design

`guiapineda-strapi/scripts/qa/private-submission-content-api-hardening-qa.mjs` ya fue creado durante
IMPLEMENT parcial. Permanece pendiente de actualización y ejecución desde T020 con una fase
estática/aislada y una fase runtime controlada conforme a Option A.

### Static/isolated phase

Se ejecutará sin Strapi real ni SQLite y deberá:

- comprobar ausencia exacta de los seis wrappers eliminados y presencia/hash de ambos schemas;
- comprobar que los diez métodos/rutas retirados constan en el contrato negativo y no reaparecen en
  ningún router;
- verificar con dobles que Agenda y Veus siguen mapeadas a sus UID y que la creación interna llama a
  `strapi.documents(uid).create`;
- verificar que moderación, preview y cleanup conservan ambos UID y usan Documents Service;
- comprobar que Content Manager conserva ambos modelos por schema, tipos generados y mapa del panel;
- verificar fingerprints de las APIs públicas Agenda/Veus y de los cuatro flujos privados no
  afectados;
- ejecutar casos equivalentes CA, ES y EN y repetir la matriz para demostrar determinismo.

### Controlled runtime phase

Es necesario arrancar una instancia Strapi aislada únicamente para demostrar la semántica HTTP
real. El harness deberá rechazar la ejecución si no puede cumplir todos estos gates:

1. confirmar que no existe otro proceso Strapi y reservar loopback/puerto efímero;
2. capturar checksum, tamaño, mtime y sidecars de la SQLite real sin conectarse a ella;
3. crear con `mkdtemp` fuera de ambos repositorios una SQLite nueva y un root de cuarentena nuevo;
4. calcular `DATABASE_FILENAME` relativo al backend y verificar que resuelve exactamente a la base
   temporal y nunca a `.tmp/data.db`;
5. fijar `GUIAPINEDA_PRIVATE_UPLOAD_DIR` al temporal y usar secretos sintéticos, sin imprimirlos;
6. crear Strapi con `createStrapi`, desactivar cron en memoria antes de `load()`, cargar la app y
   escuchar en `127.0.0.1` con puerto `0`, sin `npm run start` ni proceso externo;
7. inspeccionar el mapa de rutas, comprobar cuatro `404` de lectura y seis `405` mutadores con
   `Allow: HEAD, GET`, comparar esos `405` con una ruta control inequívocamente inexistente,
   demostrar cero efectos persistentes, crear submissions sintéticas Agenda/Veu por el canal
   interno y verificar Documents Service, moderación y Content Manager;
8. ejecutar `app.destroy()` en `finally`, retirar el temporal y comprobar puerto/proceso cerrados;
9. exigir checksum, tamaño, mtime y sidecars idénticos para la SQLite real y cero residuos Git.

El runtime no usa datos ciudadanos, Functions reales ni servicios externos. Ningún status se
aceptará aisladamente como prueba de ausencia: debe coincidir con la eliminación de factories, el
mapa sin firmas heredadas, la ruta control y los conteos persistentes invariantes.

### Canonical QA01–QA22 matrix

Esta matriz reproduce la numeración vigente de `tasks.md` y es la única asignación válida para
PLAN, quickstart e IMPLEMENT:

| QA | Requirement |
|---|---|
| QA01 | `GET /api/solicitudes-agenda` → `404` natural |
| QA02 | `POST /api/solicitudes-agenda` → `405` natural, `Allow: HEAD, GET`, zero writes |
| QA03 | `GET /api/solicitudes-agenda/:id` → `404` natural |
| QA04 | `PUT /api/solicitudes-agenda/:id` → `405` natural, `Allow: HEAD, GET`, zero updates |
| QA05 | `DELETE /api/solicitudes-agenda/:id` → `405` natural, `Allow: HEAD, GET`, zero deletes |
| QA06 | `GET /api/solicitudes-veu` → `404` natural |
| QA07 | `POST /api/solicitudes-veu` → `405` natural, `Allow: HEAD, GET`, zero writes |
| QA08 | `GET /api/solicitudes-veu/:id` → `404` natural |
| QA09 | `PUT /api/solicitudes-veu/:id` → `405` natural, `Allow: HEAD, GET`, zero updates |
| QA10 | `DELETE /api/solicitudes-veu/:id` → `405` natural, `Allow: HEAD, GET`, zero deletes |
| QA11 | Internal Agenda route available/authenticated |
| QA12 | Internal Veu route available/authenticated |
| QA13 | Internal Agenda creation uses Documents Service |
| QA14 | Internal Veu creation uses Documents Service |
| QA15 | Agenda moderation compatible |
| QA16 | Veu moderation compatible |
| QA17 | Content Manager retains both content-types |
| QA18 | Public Agenda unchanged |
| QA19 | Public Veu unchanged |
| QA20 | Comunicats, Millorem, Foto del Mes and Comercio unchanged |
| QA21 | CA/ES/EN neutral |
| QA22 | Schemas/types and real SQLite unchanged |

### Negative-contract proof and control route

QA01–QA10 remain the complete product matrix; no QA23 is added. The harness uses the synthetic path
`/api/feature008-definitely-nonexistent` only as auxiliary QA evidence and never registers it. It
must prove `GET` → `404`, `POST`/`PUT`/`DELETE` → `405`, and exact `Allow: HEAD, GET`, with the same
zero-write invariant used for Agenda and Veus. `HEAD` appearing in `Allow` is global framework
metadata, not evidence of a retained private route; the route map remains authoritative for the ten
removed signatures. A `405` by itself never proves either presence or absence.

### Current post-T019 task state and future resume point

- **T001–T005 are completed and remain valid**: Git, dependency, fingerprint, SQLite and allowlist baselines are
  independent of the revised post-removal HTTP status.
- **T006–T010 are completed and remain valid**: harness structure, static checks, protected fingerprints, SQLite gate
  and isolated runtime/network controls are unchanged.
- **T011 is completed and remains valid**: it implemented the dual route-map and HTTP request framework; its
  post-removal expected values require reconciliation in the still-pending T020 work, not reopening
  the completed construction task.
- **T012–T016 are completed and remain valid**: internal/Admin/regression cases and the pre-change gate proved the
  original routes were present; they did not claim post-removal mutators returned `404`.
- **T017–T019 are completed and remain valid**: the six exact deletions and byte-identical retained schemas are direct
  evidence of route removal and do not depend on response normalization.
- **T020–T034 are pending; tasks reopened: none.** IMPLEMENT is paused for SDD
  reconciliation/analysis. If the subsequent ANALYZE is clean, it resumes at T020, which must update
  the harness expectation/control-route evidence within the already authorized QA artifact and then
  rerun the post-removal route gate. T001–T019 are not reopened.

## Implementation Allowlist

### Product files — backend: DELETE

- `guiapineda-strapi/src/api/solicitud-agenda/routes/solicitud-agenda.js`
- `guiapineda-strapi/src/api/solicitud-agenda/controllers/solicitud-agenda.js`
- `guiapineda-strapi/src/api/solicitud-agenda/services/solicitud-agenda.js`
- `guiapineda-strapi/src/api/solicitud-veu/routes/solicitud-veu.js`
- `guiapineda-strapi/src/api/solicitud-veu/controllers/solicitud-veu.js`
- `guiapineda-strapi/src/api/solicitud-veu/services/solicitud-veu.js`

### QA file — backend: CREATE/UPDATE within the same artifact

- `guiapineda-strapi/scripts/qa/private-submission-content-api-hardening-qa.mjs`

The file already created during T006–T016 may be updated at T020 only to reconcile its expected
`404`/`405` values and complete the auxiliary control-route assertions. This does not add a product
file or expand the product allowlist.

No se autoriza modificar `package.json`, lockfile, configuración, tipos generados ni otro archivo
backend.

### SDD artifacts that form part of the feature — frontend

- `specs/008-private-submission-content-api-hardening/spec.md`
- `specs/008-private-submission-content-api-hardening/checklists/requirements.md`
- `specs/008-private-submission-content-api-hardening/plan.md`
- `specs/008-private-submission-content-api-hardening/research.md`
- `specs/008-private-submission-content-api-hardening/data-model.md`
- `specs/008-private-submission-content-api-hardening/quickstart.md`
- `specs/008-private-submission-content-api-hardening/contracts/removed-content-api.md`
- `specs/008-private-submission-content-api-hardening/tasks.md`

### SDD — WRITE during IMPLEMENT

- `specs/008-private-submission-content-api-hardening/tasks.md`

### SDD — READ-ONLY during IMPLEMENT

- `specs/008-private-submission-content-api-hardening/spec.md`
- `specs/008-private-submission-content-api-hardening/checklists/requirements.md`
- `specs/008-private-submission-content-api-hardening/plan.md`
- `specs/008-private-submission-content-api-hardening/research.md`
- `specs/008-private-submission-content-api-hardening/data-model.md`
- `specs/008-private-submission-content-api-hardening/quickstart.md`
- `specs/008-private-submission-content-api-hardening/contracts/removed-content-api.md`

### Read-only implementation inputs and regressions

- Los dos `src/api/solicitud-*/content-types/*/schema.json` afectados.
- `src/services/internal-submission-request.js`
- `src/api/internal-submission/routes/internal-submission.js`
- `src/services/private-moderation-image.js`
- `src/services/submission-moderation-lifecycle.js`
- `src/services/private-submission-image-cleanup.js`
- `src/api/internal-moderation/**`
- `src/admin/app.js` y `src/admin/components/PrivateModerationImagePanel.jsx`
- `src/api/agenda/**` y `src/api/veu/**`
- Los cuatro `src/api/solicitud-{comunicat,millora,foto-mes,comercio}/content-types/**`.
- `types/generated/contentTypes.d.ts`
- `config/{api,middlewares,server,cron-tasks,database}.js`
- `package.json` y `package-lock.json`

Todo lo que no sea una de las seis eliminaciones backend, la creación del único harness o la
escritura de `tasks.md` queda READ-ONLY durante IMPLEMENT. Si IMPLEMENT necesita tocar cualquier
otro archivo, debe detenerse, volver formalmente a PLAN y ampliar explícitamente el allowlist; no se
permiten ampliaciones implícitas.

## Project Structure

### Documentation

```text
specs/008-private-submission-content-api-hardening/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── removed-content-api.md
├── checklists/
│   └── requirements.md
└── tasks.md                              # artefacto existente de $speckit-tasks
```

### Source Code

```text
../guiapineda-strapi/
├── src/api/solicitud-agenda/
│   └── content-types/solicitud-agenda/schema.json  # conservar
├── src/api/solicitud-veu/
│   └── content-types/solicitud-veu/schema.json     # conservar
└── scripts/qa/
    └── private-submission-content-api-hardening-qa.mjs # creado; actualizar/ejecutar desde T020

guiapineda-astro/
└── specs/008-private-submission-content-api-hardening/ # SDD únicamente
```

**Structure Decision**: el backend conserva schemas y consumidores internos, elimina toda la capa
Content API estándar privada y aloja su harness. El frontend no cambia funcionalmente y mantiene los
artefactos SDD centrales.

## Risks and Mitigations

| Riesgo | Mitigación de diseño |
|---|---|
| Romper el canal interno por confundir Content API con Documents Service | Dobles y runtime prueban `strapi.documents(uid).create` para ambos UID. |
| Romper Content Manager | Schemas y tipos permanecen; QA verifica ambos content-types mediante el plugin. |
| Romper moderación | Comprobaciones de UID/Documents Service y rutas internas para ambas secciones. |
| Mantener código muerto | Se eliminan controllers/services sin imports junto a sus routers. |
| Eliminar código todavía importado | Búsqueda global y harness fallan ante cualquier import/registro inesperado. |
| Confundir `405` con una ruta todavía registrada | Exigir factories ausentes, mapa sin las diez firmas y comparación con la ruta control; nunca aceptar `405` aisladamente. |
| Aceptar `405` sin probar efectos | Comparar conteos/estados antes y después de cada método mutador. |
| Route shadowing o alias inesperado | Auditar mapa completo y fallar ante cualquier firma equivalente o path alternativo. |
| `Allow` o comportamiento `HEAD` inesperado | Exigir exactamente `Allow: HEAD, GET`; tratar `HEAD` como metadata global y verificar que no revela datos privados. |
| Diferencia Agenda/Veus | Ejecutar la misma matriz y los mismos invariantes para ambos tipos. |
| Harness normaliza respuestas | Usar la respuesta real de Strapi; prohibir interceptores de producción, middleware y transformación `405` → `404`. |
| Reaparece el contrato universal `404` | PLAN, contrato, quickstart y TASKS deben permanecer convergentes antes de reanudar IMPLEMENT desde T020. |
| Ampliar arquitectura o configuración | Allowlist cerrado; cualquier necesidad adicional obliga a volver a PLAN. |
| Alterar generación de tipos | Schemas y `contentTypes.d.ts` quedan fuera del allowlist y se verifican. |
| Modificar SQLite real durante QA | Runtime usa path temporal validado; checksum, tamaño, mtime y sidecars reales quedan idénticos. |
| Cron toca imágenes reales | Cron se desactiva en memoria y la cuarentena apunta además al temporal. |
| Regresión de contenido público | Fingerprints y mapa de rutas de `api::agenda.agenda` y `api::veu.veu`. |
| Regresión de otras submissions | Auditoría individual de Comunicats, Millorem, Foto del Mes y Comercio. |
| Diferencia CA/ES/EN | Casos equivalentes y ausencia de ramas de idioma. |
| Residuo de QA o proceso vivo | `finally` destruye Strapi, elimina temporales y audita puerto/Git. |

## Complexity Tracking

No aplica. El diseño reduce superficie y código, no introduce proyectos, abstracciones,
infraestructura ni excepciones constitucionales.
