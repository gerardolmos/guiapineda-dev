# Tasks: Header Active Section Accuracy

IMPLEMENT → QA → CONVERGE authorized by user on 2026-10-20. Progress and evidence: qa-report.md. No commit/push authorization. Paths relative to frontend unless stated.

## Phase1 — Setup
- [x] T001 Verify authorization and both Git baselines; preserve017/prerequisite files; record allowed scope and environment in specs/018-header-active-section-accuracy/qa-report.md (FR-007/008, SC-004).

## Phase2 — Foundation
- [x] T002 Create the isolated actual-header rendering harness at specs/018-header-active-section-accuracy/qa.mjs per quickstart.md; audit no CMS/backend/.env/real data imports, reproduce baseline and capture DOM/style controls before editing src/components/SiteHeader.astro (FR-001–008).

## Phase3 — US1, P1: Correct Agenda/Veus orientation
Independent test: 36 language/route/view combinations produce no active link.
- [x] T003 [US1] Modify only activeSection logic in src/components/SiteHeader.astro to classify exact /agenda or /veus and slash descendants as null after existing normalization; retain all other conditions/rendering (FR-001/002/006/007).
- [x] T004 [US1] Use specs/018-header-active-section-accuracy/qa.mjs to verify all affected routes, three languages, desktop/mobile, attribute omission, inactive styling, trailing slash and pathname behavior; record evidence in qa-report.md in this feature directory (FR-001/002/003/006; SC-001).

## Phase4 — US2, P2: Preserve other navigation
Independent test: actual header baseline/final controls keep destinations and states.
- [x] T005 [US2] Verify control matrix, similar-prefix controls, localized aliases, four links/labels/order, language navigation, mobile Escape/link close, keyboard and visual comparison using specs/018-header-active-section-accuracy/qa.mjs; record no unrelated behavior change in specs/018-header-active-section-accuracy/qa-report.md (FR-003/004/005/006; SC-002/003).

## Phase5 — Final review
- [x] T006 Review exact product/document diff, both Git states and owned-resource cleanup; document QA limits and perform authorized post-implementation CONVERGE against spec/plan/tasks, recording results in specs/018-header-active-section-accuracy/qa-report.md; no commit/push/deploy (FR-007/008; SC-004).

## Dependencies and incremental strategy
T001→T002→T003→T004→T005→T006. Single bounded product increment; US1 is MVP but full closure includes US2 regressions. No parallel editing: one product component and one harness. Individual CA/ES/EN fixtures are independent execution cases after harness readiness, not authorization to spawn agents or edit concurrently. All requirements mapped; no separate refactor/security/backend task.
