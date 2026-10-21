# Tasks — Feature019

IMPLEMENT → QA → CONVERGE authorized by the user on 2026-10-20. No commit/push authorized. Paths frontend-relative.

## Phase1 — Setup
- [x] T001 Verify authorization, pinned baseline, Git and protected55files; record scope/checklist in specs/019-footer-keyboard-focus-visibility/qa-report.md (FR007,SC004).
## Phase2 — Foundation
- [x] T002 Create isolated specs/019-footer-keyboard-focus-visibility/qa.mjs with actual footer/header and static translations, pinned baseline, blocked real services and owned cleanup; reproduce keyboard defect and capture unfocused/header controls (FR001–007).
## Phase3 — US1 visible keyboard focus, P1
Independent test: every footer keyboard focus has complete visible indicator.
- [x] T003 [US1] Add only scoped footer descendant focus-visible outline-style solid rule in src/components/SiteFooter.astro; inspect compiled scope/cascade; no shared-component change (FR001,FR003,FR006).
- [x] T004 [US1] In specs/019-footer-keyboard-focus-visibility/qa.mjs run120forward/108reverse visits across12configurations; verify computed styles, actual screenshots, no clipping and actual-background contrast≥3:1 for brand/nav/email/languages; record results in qa-report.md in same directory (FR001–005,SC001/002).
## Phase4 — US2 unchanged navigation/appearance, P2
Independent test: controls outside the change remain baseline-identical.
- [x] T005 [US2] Using specs/019-footer-keyboard-focus-visibility/qa.mjs compare no-focus footer/header images, computed styles, focus states outside footer, href/labels/order/count and selected-language span; record results in specs/019-footer-keyboard-focus-visibility/qa-report.md (FR002/005/006,SC003).
## Phase5 — Closure
- [x] T006 Review exact diff and isolation/cleanup, backend/protected docs; run authorized CONVERGE and record limitations in specs/019-footer-keyboard-focus-visibility/qa-report.md without commit/push/deploy (FR007,SC004).

Dependencies T001→T002→T003→T004→T005→T006. US1 is minimal increment; release acceptance includes US2. No parallel file editing; matrix cases independent only after harness readiness. No tasks for017,shared fixes, infrastructure or generalized accessibility redesign.

## Execution outcome — 2026-10-20
T001–T003 complete. T004 FAIL: ES desktop selected ES span obscures right outline of focused CA link. T005 partial; matrix stopped as required. T006 reviewed with QA report: CONVERGE FAIL, HIGH1; successful closure withheld. No further implementation authorized by this result.

## Phase6 — Authorized QA recovery
- [x] T007 Reproduce paint overlap in isolated probe, compare stacking versus inset and document evidence/justified offset amendment (FR003/004).
- [x] T008 Preserve solid rule and add only footer language-link focus offset-2px in SiteFooter.astro (FR001/003/004/006).
- [x] T009 Complete full forward/reverse pixel matrix, review both language-link screenshots, regression controls and final scope preservation; record recovery and convergence (FR001–007,SC001–004).

## Recovery completion
All T001–T009 complete. Historical failure retained above. Full matrix, visual review and final convergence PASS; HIGH resolved. See qa-report.md final recovery section. No commit/push.
