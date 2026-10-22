# Tasks recuperadas —017 · STOP

Revisadas después de SPEC/PLAN el2026-10-18. Sustituyen las13 tareas anteriores, que asumían alcance y coordinación no demostrados. Ninguna tarea de implementación autorizada. Tareas pendientes futuras bajo gates; no inflar en seis copias de hook.

## Phase 1 — Gates de diseño
- [ ] T001 Ratificar separación conceptual y permisos de campo/legacy en specs/017-private-data-lifecycle-retention/plan.md; ninguna nueva feature automática (FR07/11).
- [ ] T002 Resolver H01 en specs/017-private-data-lifecycle-retention/contracts/media-concurrency.md con coordinación de todos los writers/cleaner y procesos; no asumir Map actual suficiente ni habilitar deletes antes de análisis limpio (FR05/09).

## Phase 2 — US1 Invariante email
- [ ] T003 [US1] Tras autorización futura, validar subscriber común propuesto para seis UIDs en specs/017-private-data-lifecycle-retention/qa.mjs: create/update/updateMany, Admin normal, filtro atómico activo, conflicto concurrente, terminal sin email y no reintroducción; sin writes recursivos, sinDB (FR01).

## Phase 3 — US2 Rechazo/Comercio
- [ ] T004 [US2] Validar schema clonado de Comercio y entrada estricta en specs/017-private-data-lifecycle-retention/qa.mjs: solo dos required removidos, null interno autorizado, active obligatorio, aprobación conserva materiales, guard y parsers sin bypass (FR03/04).
- [ ] T005 [US2] Después de T002, validar los12 escenarios del contrato en specs/017-private-data-lifecycle-retention/qa.mjs con mocks y barreras: owner, media pública/shared, delete/update/ENOENT, retry/no-op y logs sinPII. No ejecución de cleaner real (FR02/05/06/09).
- [ ] T006 [US2] Validar Admin activo/rechazado-null/aprobado/error con fixtures en specs/017-private-data-lifecycle-retention/qa.mjs; modificar únicamente copy/feedback de src/admin/components/PrivateModerationImagePanel.jsx cuando se autorice, sin refactor (FR08).

## Phase 4 — US3 Caducidad bloqueada
- [ ] T007 [US3] Solo tras decisión T001, completar specs/017-private-data-lifecycle-retention/contracts/lifecycle-activity.md: last_activity_at y writers, legacy desconocido, resultado/actor de caducidad,59/60/61, writes técnicos/noop, CAS y limpieza por sección. Ningún schema adicional se modifica; volver a STOP si exige nuevos cambios no aprobados (FR07/10/11).

## Phase 5 — Nueva puerta
- [ ] T008 Reejecutar ANALYZE en specs/017-private-data-lifecycle-retention/analysis-recovery.md después de resolver T001/T002/T007, cubrir seis secciones y Constitution; generar tareas de código solo con diseño completo y autorización. No CONVERGE de implementación inexistente (FR01–11).

## Dependencias / pruebas independientes
T001/T002 gates; US1T003 puede diseñarse independientemente de media; US2T004/T006 independientes de reloj, T005 depende ownership; US3T007 requiere permiso adicional. Todo→T008. No agentes paralelos ni comandos QA ahora. No tareas para migrations, DB o deploy. Esta lista refleja STOP/revisión y no pretende ser backlog de implementación listo.
