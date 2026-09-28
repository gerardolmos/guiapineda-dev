---

description: "Task list for Feature 010 Commerce CTA live copy"
---

# Tasks: Commerce CTA — Current Availability Copy

**Input**: Design documents from `specs/010-commerce-cta-live-copy/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Required. A dedicated static harness MUST exist and demonstrate the controlled RED gate
before any product edit, then GREEN and deterministic repeatability after the exact three-line
change.

**Organization**: Tasks follow the three user stories but execute as one strict linear chain. No
task is parallelizable because the feature shares one RED gate, three coupled localized values and
one final evidence set.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: intentionally unused for this small linear feature
- **[Story]**: maps implementation/validation to the corresponding user story
- Every task names the exact file paths it may create, modify or inspect

## Exact IMPLEMENT Write Allowlist

### Product — modify only these existing values

- `src/i18n/ca.json` — only `home.businessCtaText`
- `src/i18n/es.json` — only `home.businessCtaText`
- `src/i18n/en.json` — only `home.businessCtaText`

### QA — create only

- `scripts/qa/commerce-cta-live-copy-qa.mjs`

### SDD evidence — modify only

- `specs/010-commerce-cta-live-copy/tasks.md`

All other paths are READ-ONLY. If another write appears necessary, STOP and return to SDD; do not
expand this allowlist during IMPLEMENT.

---

## Phase 1: Setup and Baseline

**Purpose**: Freeze the exact repositories, SDD selection, current copy and authorized boundary
before creating QA or touching product.

- [X] T001 Before creating `scripts/qa/commerce-cta-live-copy-qa.mjs`, capture and retain only in memory/execution output—without a persistent log or any workspace write—the deterministic PRE baseline required by `specs/010-commerce-cta-live-copy/plan.md`: frontend branch, HEAD/origin `aa8823052b32b9df514941b30847184825e29959`, ahead/behind `0/0`, staged `0`, `git status --porcelain=v1 --untracked-files=all`, staged/unstaged name-status, the complete Git-visible path set with type/permitted metadata and SHA-256 data needed to hash the PRE/POST union, and sorted existence/path/type/size/hash inventories for `.astro`, `dist`, `.veu-010-*`, QA roots and related temporary/cache paths; capture the frontend process/listener baseline with the same read-only mechanism that T004 will repeat; verify `.specify/feature.json` resolves `specs/010-commerce-cta-live-copy` and verify read-only that `../guiapineda-strapi` is clean on `main` at HEAD/origin `47ca26a0a54fd1c0193afd659b6ba3657b264793`, ahead/behind `0/0`; record as scope prohibition without inspecting SQLite: SQLite access `none`, SQLite reads `none`, SQLite hashes `none`, SQLite metadata `none`, SQLite sidecars `none`, SQLite commands `none`, SQLite schema changes `none`, SQLite migrations `none`; defer every `specs/010-commerce-cta-live-copy/tasks.md` evidence/checkbox write until T004 completes the POST comparison, and STOP on any baseline mismatch
- [X] T002 Obtain and validate the three current obsolete `home.businessCtaText` values, the exact protected CA/ES/EN `businessCtaTitle`, `businessCtaButton` and `businessCtaSoon` values, the three normalized locale SHA-256 values and six protected source/QA SHA-256 values from `specs/010-commerce-cta-live-copy/plan.md`; confirm the exact IMPLEMENT write allowlist above and STOP if any current value, fingerprint or path boundary differs; retain this evidence only in memory and execution stdout/output, create no file and do not modify `specs/010-commerce-cta-live-copy/tasks.md`; consider T002 conceptually complete once its evidence is obtained, validated and remains available to T003/T004, and persist the evidence/checkmarks for T001–T004 only after T004 has captured POST, compared PRE/POST, confirmed the exact permitted delta and zero side effects, and fully passed

**Checkpoint**: Baseline and ownership are explicit; no QA or product path has changed.

---

## Phase 2: Foundational — Static Harness and Mandatory RED Gate

**Purpose**: Create the complete read-only acceptance mechanism and prove that it rejects only the
three obsolete CTA values before any product modification.

**⚠️ CRITICAL**: T004 MUST be a valid RED before T005 may modify any locale file.

- [X] T003 Create only `scripts/qa/commerce-cta-live-copy-qa.mjs` with Node built-ins and zero writes/network/backend access, then require `node --check scripts/qa/commerce-cta-live-copy-qa.mjs` to exit `0`: parse `src/i18n/ca.json`, `src/i18n/es.json` and `src/i18n/en.json`; require exactly one raw `home.businessCtaText` property per locale; compare the three values with the exact FR-002 strings; report one grouped text mismatch per locale when exact copy and obsolete-language checks fail for the same value; protect the exact titles, buttons and `businessCtaSoon`; compare normalized locale fingerprints; assert canonical routes and direct CTA consumption in `src/pages/index.astro`, `src/templates/CategoryPage.astro` and `src/templates/SubcategoryPage.astro`; verify hashes for those three files, `src/templates/CommerceSignupPage.astro`, `src/components/CommerceSignupFlow.astro` and `scripts/qa/commerce-submission-qa.mjs`; before every harness exit, inspect Node active resources with built-ins and permit only normal process stdio, failing on any pending timer, listener, socket, child process, worker or deferred work; create no file, cache, temporary path or QA root; print `PASS: Feature 010 Commerce CTA live copy QA` only when every assertion passes
- [X] T004 Reconfirm `node --check scripts/qa/commerce-cta-live-copy-qa.mjs` exits `0`, execute `node scripts/qa/commerce-cta-live-copy-qa.mjs` against the still-unchanged product, and require a nonzero RED with exactly three grouped failures—one CA, one ES and one EN—whose sole cause is the obsolete `businessCtaText`, while JSON validity, protected titles/buttons/`businessCtaSoon`, routes, normalized fingerprints, consumer/form hashes, existing Commerce QA hash, allowlist and final Node active-resource checks all pass; before any `tasks.md` write, capture a deterministic POST with the identical ordered Git, path/type/permitted-metadata/SHA-256, special-path, process and listener mechanism retained by T001, compute and compare the PRE/POST union, and require the exact sole delta to be creation of `scripts/qa/commerce-cta-live-copy-qa.mjs`; require product and pre-existing SDD byte-identical, no path outside the allowlist changed, and zero cache, temporary path, QA root, residual process/listener/Node resource, deferred work or backend change; treat missing PRE, missing POST, non-comparable inventories, any delta other than that harness, any side effect, any RED cause beyond the three obsolete strings or any failed protection as a hard failure, retain evidence in memory/output without a persistent log, and only after the comparison fully passes record T001–T004 evidence/completion in `specs/010-commerce-cta-live-copy/tasks.md`; `T005 MUST NOT START unless T004 fully passes.`

**Checkpoint**: Harness is complete and RED exclusively because the three approved values are not
implemented. Product remains byte-identical to baseline.

---

## Phase 3: User Story 1 — Communicate Current Availability (Priority: P1) 🎯 MVP

**Goal**: Replace the obsolete future/preparation copy with the exact approved current-availability
copy in CA, ES and EN.

**Independent Test**: The dedicated harness reports all three exact values, zero obsolete phrases
and a final PASS while every protected assertion remains green.

### Implementation and Test for User Story 1

- [X] T005 [US1] Apply one exact targeted line substitution to `home.businessCtaText` in each of `src/i18n/ca.json`, `src/i18n/es.json` and `src/i18n/en.json`: CA `Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.`, ES `Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.`, EN `Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.`; use no formatter, serializer, sort, autofix or whole-file rewrite and change no other byte
- [X] T006 [US1] Run `node --check scripts/qa/commerce-cta-live-copy-qa.mjs` and `node scripts/qa/commerce-cta-live-copy-qa.mjs`; record GREEN in `specs/010-commerce-cta-live-copy/tasks.md` only if both exit `0`, the harness observes exact copy `3/3`, obsolete preparation wording `0/3`, valid JSON `3/3`, all normalized/protected fingerprints intact and exactly one final `PASS: Feature 010 Commerce CTA live copy QA`

**Checkpoint**: User Story 1 is complete and independently proves present availability in all three
locales without collateral changes.

---

## Phase 4: User Story 2 — Equivalent Meaning in CA, ES and EN (Priority: P1)

**Goal**: Demonstrate that the approved triplet expresses the same functional message naturally in
all three languages and introduces no claim.

**Independent Test**: Compare the three observed exact values as one set: each says that adding the
activity is available now, none says it is being prepared and none adds a promise, condition or
benefit absent from the others.

### Validation for User Story 2

- [X] T007 [US2] Review the exact CA/ES/EN values read by `scripts/qa/commerce-cta-live-copy-qa.mjs` against FR-003–FR-007 in `specs/010-commerce-cta-live-copy/spec.md` and record in `specs/010-commerce-cta-live-copy/tasks.md` that all three naturally communicate present availability, are semantically equivalent, contain no preparation/future wording and add no functional or commercial claim

**Checkpoint**: User Story 2 has explicit 3/3 semantic parity evidence.

---

## Phase 5: User Story 3 — Preserve the Existing Commerce Journey (Priority: P2)

**Goal**: Prove that copy-only implementation leaves every title, button, route and Commerce form
behavior intact.

**Independent Test**: Protected values and source fingerprints remain byte-exact while canonical
routes still map CA, ES and EN to their established active form.

### Validation for User Story 3

- [X] T008 [US3] Record in `specs/010-commerce-cta-live-copy/tasks.md` the GREEN harness evidence that CA/ES/EN `businessCtaTitle`, `businessCtaButton` and `businessCtaSoon` remain exact; `/alta-comerc/`, `/es/alta-comercio/` and `/en/businesses/add-a-business/` remain present in the protected CTA consumers; hashes remain exact for `src/pages/index.astro`, `src/templates/CategoryPage.astro`, `src/templates/SubcategoryPage.astro`, `src/templates/CommerceSignupPage.astro`, `src/components/CommerceSignupFlow.astro` and `scripts/qa/commerce-submission-qa.mjs`; therefore form, validation, submission and draft behavior remain untouched

**Checkpoint**: All three user stories are complete with no executable behavior change.

---

## Phase 6: Determinism, Minimal Diff and Final Closure

**Purpose**: Demonstrate repeatability, enforce the exact boundary and close Feature 010 evidence.

- [X] T009 Execute `node scripts/qa/commerce-cta-live-copy-qa.mjs` twice sequentially, without changing `scripts/qa/commerce-cta-live-copy-qa.mjs` or product between runs; compare exit codes and normalized stdout in memory, require both exit `0` with byte-identical normalized output and the same single final PASS, inventory the frontend before/after to prove zero files, caches, processes, listeners or deferred work were created, and record deterministic PASS in `specs/010-commerce-cta-live-copy/tasks.md`
- [X] T010 Audit `git diff -- src/i18n/ca.json src/i18n/es.json src/i18n/en.json` and the complete frontend status, then record in `specs/010-commerce-cta-live-copy/tasks.md` that the product diff is exactly three one-line `businessCtaText` substitutions, all normalized fingerprints prove no reorder/reindent/encoding/newline/key change, `scripts/qa/commerce-cta-live-copy-qa.mjs` is the only new QA file, no path outside the IMPLEMENT allowlist changed and no formatter/serializer/sort/autofix ran
- [X] T011 Run `git diff --check`, re-run `node --check scripts/qa/commerce-cta-live-copy-qa.mjs` and its final GREEN execution, inspect `../guiapineda-strapi` read-only and record all results in `specs/010-commerce-cta-live-copy/tasks.md`; require frontend branch/HEAD relationship unchanged apart from authorized working-tree files, staged `0`, backend still clean at `47ca26a0a54fd1c0193afd659b6ba3657b264793` with `0/0`; record the final prohibition matrix without inspecting SQLite: SQLite access `none`, SQLite reads `none`, SQLite hashes `none`, SQLite metadata `none`, SQLite sidecars `none`, SQLite commands `none`, SQLite schema changes `none`, SQLite migrations `none`; require no build, browser, network, dependency install, infrastructure, deploy, commit or push
- [X] T012 Complete the FR/SC/Acceptance Scenario traceability and final checklist in `specs/010-commerce-cta-live-copy/tasks.md`: confirm T001–T011 complete, all QA/gates PASS, FR-001–FR-018 covered, SC-001–SC-006 covered, all nine Acceptance Scenarios covered, 0 pending tasks, 0 `[P]`, exact allowlist respected, backend constraints satisfied and the explicit matrix remains SQLite access `none`, SQLite reads `none`, SQLite hashes `none`, SQLite metadata `none`, SQLite sidecars `none`, SQLite commands `none`, SQLite schema changes `none`, SQLite migrations `none`; confirm Feature 010 ready for CONVERGE without running ANALYZE, CONVERGE, commit, push or deploy

---

## Dependencies & Execution Order

### Strict Linear Chain

```text
T001 → T002 → T003 → T004 (mandatory RED)
     → T005 (only product change) → T006 (GREEN)
     → T007 → T008 → T009 → T010 → T011 → T012
```

- Phase 1 establishes the immutable baseline and allowlist.
- Phase 2 creates all QA and MUST achieve the exclusive three-cause RED before product work.
- User Story 1 owns the only product edit and first GREEN.
- User Story 2 validates the approved multilingual meaning after GREEN.
- User Story 3 validates preservation after GREEN.
- Phase 6 proves determinism, exact diff, repository boundaries and complete traceability.

### User Story Dependencies

- **US1 (P1)**: starts only after valid RED; delivers the MVP and GREEN.
- **US2 (P1)**: depends on US1 because semantic parity must inspect the implemented triplet.
- **US3 (P2)**: depends on US1 because preservation evidence accompanies the finished change.

### Parallel Opportunities

None. Total `[P]`: **0**. Splitting work would weaken the required RED → product → GREEN sequence.

---

## Traceability

### Functional Requirements

| Requirements | Tasks |
|---|---|
| FR-001–FR-007 | T003–T007 |
| FR-008–FR-013, FR-017 | T002–T003, T008–T010 |
| FR-014–FR-016 | T001–T002, T010–T012 |
| FR-018 | T003–T004, T006–T012 |

### Success Criteria

| Criterion | Tasks |
|---|---|
| SC-001 | T003–T006 |
| SC-002 | T007 |
| SC-003 | T002–T003, T008 |
| SC-004 | T003, T008 |
| SC-005 | T003, T008–T011 |
| SC-006 | T009–T012 |

### Acceptance Scenarios

| Story / scenarios | Tasks |
|---|---|
| US1 scenarios 1–3 | T003–T006 |
| US2 scenarios 1–3 | T003, T007 |
| US3 scenarios 1–3 | T003, T008–T011 |

---

## Implementation Strategy

### MVP First

1. Complete T001–T004 and require the exclusive controlled RED.
2. Complete T005 once, with exactly three targeted value substitutions.
3. Complete T006 and require GREEN before any further validation.
4. Stop and report if RED or GREEN differs from the defined evidence.

### Completion

Continue linearly through T007–T012. No task may be skipped or marked complete from inferred,
shared or partial evidence. No commit, push or deploy is part of TASKS or IMPLEMENT authorization.

## Notes

- Every task begins unchecked and must be checked only after its own evidence exists.
- RED is invalid if any protected assertion fails or if fewer/more than the three localized copy
  mismatches explain the failure.
- GREEN is invalid unless exact strings, protected values, fingerprints and final output all pass.
- The harness is read-only and must leave no cache, temp file, process, listener or deferred work.
- Backend inspection is Git-only; SQLite must not be accessed even for hash or metadata.
- Build, browser and broad Commerce submission QA are deliberately outside this feature.
