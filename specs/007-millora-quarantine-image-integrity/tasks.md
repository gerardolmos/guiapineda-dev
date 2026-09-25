---

description: "Dependency-ordered tasks for Millora private quarantine image integrity"
---

# Tasks: Integridad de imágenes privadas en cuarentena de Millorem Pineda

**Input**: Design documents from `specs/007-millora-quarantine-image-integrity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, Constitution v1.0.0

**Tests**: Required. The approved persistent harness is written before the product fix, must prove
the current Millora omission in RED, and then validates the full deterministic matrix without real
Strapi, SQLite, cron, external services or user files.

**Organization**: Tasks follow the three specification user stories while preserving the mandatory
sequence PRECHECK → safe harness/RED → minimal fix → orphan QA → shared regression → final audit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it is read-only or uses a different file and has no dependency on an incomplete task.
- **[Story]**: Maps the task to US1, US2 or US3 from `spec.md`.
- Every edit must remain inside the closed allowlist below.

## Closed Implementation Allowlist

### Product — backend

- **MODIFY only**: `../guiapineda-strapi/src/services/private-submission-image-cleanup.js`

### QA — backend

- **CREATE only**: `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`

### SDD — frontend

- **UPDATE during workflow/evidence only**: `specs/007-millora-quarantine-image-integrity/tasks.md`
- `spec.md`, `checklists/requirements.md`, `plan.md`, `research.md`, `data-model.md` and
  `quickstart.md` remain read-only unless a formal return to the corresponding SDD phase is approved.

If IMPLEMENT needs any other file, stop before editing and return to PLAN. In particular, schemas,
cron, helpers, package files, lockfiles, configuration, frontend product files, SQLite, generated
types and the existing Commerce harness are read-only.

## Phase 1: Precheck and Baseline

**Purpose**: Prove that implementation starts from the approved repositories and that no previous
functional change, running service or expanded scope can contaminate the result.

- [X] T001 Record `git status --short --branch`, HEAD and origin relation for both repositories in `specs/007-millora-quarantine-image-integrity/tasks.md`; require frontend `main...origin/main` with only Feature 007 SDD untracked/modified and backend `main...origin/main` clean
- [X] T002 [P] Reconcile the exact product, QA and SDD allowlist in `specs/007-millora-quarantine-image-integrity/plan.md` with `specs/007-millora-quarantine-image-integrity/tasks.md`; stop if any required write falls outside it
- [X] T003 [P] Confirm by read-only inspection of `../guiapineda-strapi/config/server.js` and `../guiapineda-strapi/config/cron-tasks.js` that IMPLEMENT will not start Strapi or execute the real cron, and record the prohibition in `specs/007-millora-quarantine-image-integrity/tasks.md`
- [X] T004 [P] Inspect `../guiapineda-strapi/src/services/private-submission-image-cleanup.js`, `../guiapineda-strapi/src/services/private-submission-image.js` and `../guiapineda-strapi/src/api/solicitud-millora/content-types/solicitud-millora/schema.json` read-only; reconfirm UID, scalar field, 32-character format, batch 100, 24-hour grace and exact-boundary eligibility without accessing SQLite
- [X] T005 Gate implementation in `specs/007-millora-quarantine-image-integrity/tasks.md`: require zero pre-existing backend diff, zero frontend functional diff, no Strapi process intentionally started for this feature, no SQLite access and no dependency/config/schema change before Phase 2

**Checkpoint**: Baseline and allowlist accepted; no functional file has been changed.

---

## Phase 2: Foundational Harness and RED Proof

**Purpose**: Build the isolated, persistent evidence boundary and demonstrate the present defect
before changing product behavior.

**⚠️ CRITICAL**: No product edit is allowed until T009 records a controlled RED caused only by the
missing Millora UID.

- [X] T006 Create the persistent harness shell in `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` using `node:assert`, a fresh `fs.mkdtemp` root, fixed synthetic 32-hex IDs, fixed `now`/`graceMs`, controlled mtimes, an in-memory `strapi.documents(uid).findMany` double, path guards, environment restoration and recursive temporary cleanup in `finally`
- [X] T007 Extend `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` with registry invariants: the five existing UIDs remain exact, Millora is required exactly once, non-Commerce sections request only `imatge_quarantena_id`, Commerce keeps its three fields, batch remains 100, grace remains 86,400,000 ms and cron remains `17 3 * * *`
- [X] T008 Add safety assertions to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` that the quarantine root is inside the newly created OS temporary directory, no real Strapi instance or cron is loaded, the Documents double exposes reads only, no SQLite module/path is opened, no network is used and no repository/user file can be deleted
- [X] T009 Run `node --check scripts/qa/millora-quarantine-image-integrity-qa.mjs` and then the harness from `../guiapineda-strapi`; require syntax PASS followed by a non-zero RED whose sole unmet invariant is the absent `api::solicitud-millora.solicitud-millora`, while all five existing-section registry assertions and safety guards pass, and record concise evidence in `specs/007-millora-quarantine-image-integrity/tasks.md`

**Checkpoint**: The harness is safe and reproducible, and the current defect is proven without real
cleanup, service startup or data access.

---

## Phase 3: User Story 1 — Preserve a Referenced Millora Image (Priority: P1) 🎯 MVP

**Goal**: Any Millora image referenced by an existing request is protected before age is evaluated,
equally for CA, ES and EN.

**Independent Test**: With controlled recent and old Millora files plus CA/ES/EN rows, both files
remain present, count as referenced and never enter the deletion set.

### Tests for User Story 1

- [X] T010 [US1] Add pre-fix cases to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` for a referenced recent Millora image, a referenced image older than grace, duplicate references and equivalent CA/ES/EN request rows; require exact-ID protection independent of age, language and duplication

### Implementation for User Story 1

- [X] T011 [US1] Add only `api::solicitud-millora.solicitud-millora` once, before the Commerce special case, to `SECTION_UIDS` in `../guiapineda-strapi/src/services/private-submission-image-cleanup.js`; do not change branching, validation, pagination, grace, listing, deletion, exports or logging
- [X] T012 [US1] Run the US1 cases in `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` and require both referenced ages plus CA/ES/EN to pass with the files preserved and zero deletion attempts for their IDs
- [X] T013 [US1] Inspect the product diff of `../guiapineda-strapi/src/services/private-submission-image-cleanup.js` and record in `specs/007-millora-quarantine-image-integrity/tasks.md` that the only functional delta is the single exact UID entry and that no second product file changed

**Checkpoint**: MVP complete—Millora references are visible to the existing collector and referenced
images survive independently of age or language.

---

## Phase 4: User Story 2 — Clean Only Genuine Orphans (Priority: P1)

**Goal**: Millora gains reference protection without retaining genuine orphans or changing temporal,
failure and deletion semantics.

**Independent Test**: A controlled mixed fixture preserves recent/future orphans, removes only old
and exact-boundary orphans, ignores unusable references, paginates fully and never deletes after an
incomplete inventory.

### Tests and Validation for User Story 2

- [X] T014 [US2] Add Millora orphan cases to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`: inside grace preserved, future mtime preserved, older than grace deleted and exactly equal to grace deleted under the existing `ageMs < graceMs` boundary
- [X] T015 [US2] Add reference-shape cases to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`: null, absent, empty string, non-string, malformed non-empty string and valid-format nonexistent ID; require that none protects or deletes any different valid fixture ID
- [X] T016 [US2] Add 101-row Millora pagination and conservative-failure cases to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`; require `start=0` then `start=100`, complete ID collection, rejection on a later query throw or non-array result, and preservation of an otherwise eligible sentinel file
- [X] T017 [US2] Add a mixed-set assertion to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` that compares exact before/after IDs and proves zero deletions outside the expected old and exact-boundary orphan set
- [X] T018 [US2] Add two distinct checks to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`: deterministic equality after rebuilding identical fixtures with fixed clock/mtimes, and idempotent convergence on a consecutive run where no already-deleted orphan reappears even though summary counts may differ
- [X] T019 [US2] Execute the complete US2 matrix from `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`; require all grace, malformed-reference, pagination, fail-closed, exact-deletion, determinism and idempotence assertions to pass without touching real storage

**Checkpoint**: Genuine orphan cleanup is unchanged and the safety boundary is proven independently.

---

## Phase 5: User Story 3 — Preserve Existing Sections (Priority: P2)

**Goal**: Agenda, Veus, Comunicats, Foto del Mes and Comercio retain their existing reference and
orphan behavior after the Millora correction.

**Independent Test**: Old referenced fixtures for all five sections survive, Commerce protects
principal/logo/gallery, and only explicitly prepared old orphans are deleted in repeated runs.

### Tests and Validation for User Story 3

- [X] T020 [US3] Add the five-section regression matrix to `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`: Agenda, Veus, Comunicats and Foto del Mes each protect scalar `imatge_quarantena_id`; Comercio protects principal, optional logo and every gallery ID; include recent and old orphan controls
- [X] T021 [US3] Execute `node scripts/qa/millora-quarantine-image-integrity-qa.mjs` from `../guiapineda-strapi` and require a single final PASS only after US1–US3, all 22 required QA cases, safety guards and exact summary/ID assertions succeed
- [X] T022 [US3] Run the existing read-only regression `node scripts/qa/commerce-submission-qa.mjs` from the frontend repository root and record its result in `specs/007-millora-quarantine-image-integrity/tasks.md`; do not modify `scripts/qa/commerce-submission-qa.mjs`

**Checkpoint**: All three user stories pass independently and together; Feature 005 cleanup behavior
remains intact.

---

## Phase 6: Final Safety and Scope Audit

**Purpose**: Prove syntax, reproducibility, closed scope and absence of side effects before CONVERGE.

- [X] T023 [P] Run `node --check src/services/private-submission-image-cleanup.js` and `node --check scripts/qa/millora-quarantine-image-integrity-qa.mjs` from `../guiapineda-strapi`; require both syntax checks to pass
- [X] T024 Re-run `node scripts/qa/millora-quarantine-image-integrity-qa.mjs` from `../guiapineda-strapi` after all checks and require the same final PASS with no leftover temporary directory, environment mutation or repository fixture
- [X] T025 [P] Run `git diff --check` and `git status --short --branch` in both repositories and record results in `specs/007-millora-quarantine-image-integrity/tasks.md`
- [X] T026 Audit the complete diff and untracked inventory against `specs/007-millora-quarantine-image-integrity/plan.md`; require only `../guiapineda-strapi/src/services/private-submission-image-cleanup.js`, `../guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` and Feature 007 SDD artifacts to differ
- [X] T027 Confirm by command log, harness source and Git audit in `specs/007-millora-quarantine-image-integrity/tasks.md` that IMPLEMENT started no Strapi/cron, accessed no SQLite, deleted no user file, changed no schema/config/package/lockfile/dependency/frontend product code, created no backup or migration, and performed no commit, push or deploy

**Checkpoint**: IMPLEMENT evidence is complete and the feature is ready for its explicit next gate;
do not commit, push or deploy from these tasks.

---

## QA Coverage Traceability

| Required case | Task coverage |
|---|---|
| 1. Millora referenced + recent | T010, T012, T021 |
| 2. Millora referenced + old | T010, T012, T021 |
| 3. Millora orphan inside grace | T014, T019, T021 |
| 4. Millora orphan outside grace | T014, T017, T019, T021 |
| 5. Exact grace boundary | T014, T019, T021 |
| 6. Null reference | T015, T019, T021 |
| 7. Absent reference | T015, T019, T021 |
| 8. Invalid/malformed reference | T015, T019, T021 |
| 9. Well-formed nonexistent reference | T015, T019, T021 |
| 10. Inventory pagination | T016, T019, T021 |
| 11. Partial/conservative inventory failure | T016, T019, T021 |
| 12. No unexpected deletion | T017, T019, T021 |
| 13. Agenda regression | T020, T021 |
| 14. Veus regression | T020, T021 |
| 15. Comunicats regression | T020, T021 |
| 16. Foto del Mes regression | T020, T021 |
| 17. Comercio regression | T020, T021, T022 |
| 18. CA/ES/EN neutrality | T010, T012, T021 |
| 19. Determinism across equivalent runs | T018, T019, T021 |
| 20. No real storage access | T006, T008, T019, T024, T027 |
| 21. No SQLite access | T008, T027 |
| 22. No Strapi startup | T003, T008, T027 |
| Separate idempotent convergence | T018, T019, T021 |

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Precheck**: no dependencies; T001 must complete before its final gate T005.
- **Phase 2 — Harness/RED**: depends on T005; T006 → T007/T008 → T009. T009 blocks every product edit.
- **Phase 3 — US1/MVP**: depends on controlled RED T009; T010 → T011 → T012 → T013.
- **Phase 4 — US2**: depends on the minimal fix T011; T014–T018 extend the same harness sequentially, then T019 validates them.
- **Phase 5 — US3**: depends on T019; T020 → T021 → T022.
- **Phase 6 — Final audit**: depends on all selected stories; T023–T027 complete the gate.

### User Story Dependencies

- **US1 (P1)**: starts after the foundational RED proof and contains the only product change.
- **US2 (P1)**: behavior is independently testable, but execution follows US1 because it shares the
  harness and validates the fixed integrated service.
- **US3 (P2)**: depends on the fixed integrated service and the completed orphan matrix, then proves
  the shared cleanup did not regress.

### Parallel Opportunities

- T002, T003 and T004 may run in parallel after T001 because they are independent read-only audits.
- T007 and T008 may be prepared in parallel only after T006 creates the harness shell; they edit the
  same file, so their patches must be serialized when executed by one worker.
- T023 and T025 may run in parallel after T022 because syntax validation and repository audit do not
  modify files.
- No product or harness edits are marked `[P]`; the closed two-file implementation deliberately
  favors a single auditable sequence over artificial parallelism.

## Parallel Example: Precheck

```text
Task T002: reconcile plan and task allowlists.
Task T003: inspect cron configuration and preserve the no-start gate.
Task T004: reconfirm UID, field, formats and timing constants read-only.
```

## Implementation Strategy

### MVP First — User Story 1

1. Complete Phase 1 and accept the baseline.
2. Create the isolated harness and obtain the exact RED in Phase 2.
3. Add US1 reference cases.
4. Add the single UID entry.
5. Prove referenced recent/old and CA/ES/EN PASS.
6. Stop and inspect the one-line product diff before expanding QA.

### Incremental Completion

1. MVP protects valid Millora images.
2. US2 proves orphan, boundary, malformed-reference, pagination and failure semantics remain exact.
3. US3 proves the five previously supported sections remain unchanged.
4. Final audit confirms the allowlist, safety gates and repository state.

## Notes

- `[P]` marks only genuinely independent read-only checks.
- No task creates an HTTP contract, schema, migration, backup, dependency or infrastructure.
- The known SQLite baseline remains
  `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`;
  no task opens it to re-derive that value.
- No task authorizes `npm run develop`, `npm run start`, real cron execution, commit, push or deploy.
- `$speckit-analyze` is the recommended next phase; it is not executed by this task list.

## Implementation Evidence

- **T001–T005 PASS**: frontend `fd978f0834c665c7b2c69ceeb39fffab888450db` and backend `e65584fbaa6ad9f9a8cecd1f6b759cdfb00b63c7` are `main...origin/main` at `0/0`; backend began clean, frontend contained only Feature 007 SDD, ports 1337/4321/5173 were free, and read-only inspection reconfirmed the closed allowlist, scalar private 32-character field, batch 100, 24-hour grace, exact-boundary eligibility and cron `17 3 * * *`. No service or SQLite access occurred.
- **T006–T009 PASS (controlled RED)**: `node --check` returned 0. The harness reported PASS for the five existing UIDs/projections, batch/grace/cron invariants and isolated safety guards, then returned 1 solely because `SECTION_UIDS` lacked `api::solicitud-millora.solicitud-millora`. No product file had changed at the RED gate.
- **T010–T013 PASS**: the pre-fix US1 fixtures were added before product code; after the RED gate, T011 added exactly one UID line before Commerce. US1 then preserved referenced recent/old images, duplicate references and equivalent CA/ES/EN rows with zero deletion attempts for those IDs; the product diff contains no other change.
- **T014–T019 PASS**: controlled fixtures proved inside/future grace preservation, old/exact-boundary deletion, null/absent/empty/non-string/malformed/nonexistent reference behavior, 101-row pagination, throw/non-array fail-closed preservation, exact deletion sets, deterministic rebuilt runs and separate idempotent convergence.
- **T020–T022 PASS**: the integrated harness reported `QA_CASES 22/22` and separate idempotence PASS; Agenda, Veus, Comunicats, Foto del Mes and Comercio retained their reference/orphan behavior. The read-only Commerce regression reported complete PASS.
- **T023–T027 PASS**: both syntax checks and the final targeted harness rerun passed; no OS/repository temporary remained. `git diff --check` passed in both repositories. Backend contains exactly the one-line service modification plus the new harness; frontend contains only Feature 007 SDD. Audit found no schema, config, package, lockfile, generated type, dependency or frontend-product change, no secret, staging, SQLite/user-file access, backup/migration, service/cron startup, commit, push or deploy.
