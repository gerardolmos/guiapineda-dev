# Tasks: 014 Agenda y Veus

Input: spec.md, plan.md, research.md, contracts/navigation.md. Ejecución secuencial sin commit/push.

## Phase 1: Setup
- [x] T001 Verificar ambos repos por Git, Constitution y alternativas; registrar alcance y F06 pendiente en specs/014-agenda-veus-stable-access/research.md (FR-07/08/09/10).

## Phase 2: Foundational
- [x] T002 Crear QA aislada en specs/014-agenda-veus-stable-access/qa.mjs y reproducir ausencia de accesos con cero contenido antes de editar código (FR-01/02/04).

## Phase 3: US1 — Agenda (P1)
Goal/test independiente: Home → índice Agenda → formulario en los tres idiomas con y sin contenido.
- [x] T003 [US1] Añadir URL/entrada Agenda en src/components/SiteFooter.astro y footer.agenda en src/i18n/ca.json, src/i18n/es.json, src/i18n/en.json, según contracts/navigation.md (FR-01/03/04/05).

## Phase 4: US2 — Veus (P1)
Goal/test independiente: Home → índice Veus → formulario en los tres idiomas con y sin contenido.
- [x] T004 [US2] Añadir URL/entrada Veus en src/components/SiteFooter.astro y footer.veus en src/i18n/ca.json, src/i18n/es.json, src/i18n/en.json (FR-02/03/04/05).

## Phase 5: QA y cierre
- [x] T005 Ejecutar specs/014-agenda-veus-stable-access/qa.mjs: build vacío/publicado; CA, ES, EN; navegación Home/producto → índices → formularios; vacío; detalles presentes; foco/escritorio/móvil; filtros Tauler y menú; destinos previos footer/header. Registrar en qa-report.md (FR-01 a FR-08, SC-01 a SC-04).
- [x] T006 Revisar diff/status y allowlist, sin backend/SQLite/dependencias; preparar qa-report.md y ejecutar CONVERGE contra spec/plan/tasks sin modificar tareas si no hay gaps (FR-07/08/09/10).

## Dependencies and strategy
T001 → T002 → T003 → T004 → T005 → T006. Agenda es MVP incremental, pero entrega exige ambas historias. No paralelizar ediciones: comparten footer/diccionarios. Las seis comprobaciones de idioma/sección son independientes y se ejecutan en la misma matriz QA. Sin tareas preventivas de refactor ni infraestructura.
