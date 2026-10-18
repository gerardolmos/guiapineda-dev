# Tasks — 016 Comunicats language switch

Input: spec.md, plan.md, research.md, contracts/language-switch.md. Sin commit/push.

## Phase 1: Setup
- [x] T001 Verificar baseline Git y contratos de drafts/controller/rutas, registrar en specs/016-comunicats-language-switch/research.md (FR10/11).

## Phase 2: Foundational
- [x] T002 Crear QA independiente en specs/016-comunicats-language-switch/qa.mjs y reproducir ausencia de selector sobre base antes de editar producto (FR01/02/09).

## Phase 3: US1 — Idiomas y borrador (P1)
Prueba independiente: seis cambios con siete campos restaurados, dos viewports y tres pasos.
- [x] T003 [US1] Reutilizar LanguageSwitcher en src/templates/CommunicatSubmissionPage.astro con rutas CA/ES/EN y label localizado, fuera de pasos; no modificar lógica de drafts (FR01/02/03/09).
- [x] T004 [US1] Probar seis transiciones dirigidas CA↔ES, CA↔EN, ES↔EN en specs/016-comunicats-language-switch/qa.mjs, desktop/mobile, rutas y siete campos exactos (FR01/02/03/09; SC01/04).

## Phase 4: US2 — Seguridad y regresión (P1)
Prueba independiente: cambiar con verificación/archivo/consentimiento, confirmar exclusiones, reverificar y enviar; reset y éxito limpian draft.
- [x] T005 [US2] Probar en specs/016-comunicats-language-switch/qa.mjs exclusiones de archivo/consentimiento/token/código/verified, reverificación con token nuevo y submission posterior (FR04–08; SC02/03).
- [x] T006 [US2] Probar reset, limpieza por éxito y build aislado en specs/016-comunicats-language-switch/qa.mjs; registrar resultados en specs/016-comunicats-language-switch/qa-report.md (FR08–11; SC03/04).

## Phase 5: Cierre
- [x] T007 Revisar allowlist/diff, backend limpio, temporales/procesos y CONVERGE; registrar en specs/016-comunicats-language-switch/qa-report.md; parar sin commit/push (FR10/11).

## Dependencies / execution strategy
T001 → T002 → T003 → T004/T005/T006 (misma matriz browser) → T007. US1 aporta selector; US2 valida mecanismos existentes sin nuevas ediciones. MVP US1 no basta para cierre sin US2. Sin paralelización de agentes o escrituras: un único archivo productivo y un harness. Casos de las seis parejas son independientes pero se ejecutan secuencialmente en navegador aislado para evitar contaminación del storage.
