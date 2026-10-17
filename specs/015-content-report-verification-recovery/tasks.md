# Tasks: 015 Recuperación de verificación

Input: spec/plan/research/contracts. Sin commit/push ni Feature 016.

## Phase 1: Setup
- [x] T001 Verificar Git/Constitution, contratos 006/012, consumidor y recuperación; registrar en specs/015-content-report-verification-recovery/research.md (FR-08/10).

## Phase 2: Foundational
- [x] T002 Crear specs/015-content-report-verification-recovery/qa.mjs; reproducir baseline verification:required/invalid y probar expectativas nuevas antes de editar producto (FR-01/02).

## Phase 3: US1 — Recuperación (P1)
- [x] T003 [US1] Reutilizar classifySubmissionFailure y mapear verification-invalid a verificationRequired en src/lib/contentReportFlow.ts, ampliar union sin cambiar reset/copy/consumidor (FR-01/02/04/05/06/07/09).
- [x] T004 [US1] Ejecutar QA unit/browser desde specs/015-content-report-verification-recovery/qa.mjs: ambos reasons, CA/ES/EN y cuatro tipos, motivo/contexto conservados, email/código/token limpiados, nuevo token exitoso y cero retry automático (FR-01/02/04/05/06/07/09, SC-01/02/04).

## Phase 4: US2 — Regresión (P1)
- [x] T005 [US2] Comprobar referencia inválida, demás 400/envelopes/status, 429/503, cierre/reapertura y Reports/Comunicats mediante qa.mjs y evidencia funcional previa de Comunicats, excluyendo de recovery el script histórico y su salvaguarda SQLite; registrar build y resultados en specs/015-content-report-verification-recovery/qa-report.md (FR-03/08, SC-03/04).

## Phase 5: Cierre
- [x] T006 Revisar diff/allowlist/Git/limpieza y ejecutar CONVERGE con specs/015-content-report-verification-recovery/spec.md, plan.md y tasks.md; informar safe to commit y parada antes de 016 (FR-08/10).

## Dependencies / strategy
T001 → T002 → T003 → T004 → T005 → T006. US1 aporta el cambio; US2 garantiza contrato/regresión. Sin paralelizar ediciones del mismo harness. Pruebas de tuplas independientes dentro de cada matriz. No tareas ajenas ni commit.
