# Tasks: Veus — Safe Multilingual Draft Persistence

**Input**: Design documents from `/specs/009-veu-draft-persistence/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Feature 009 requires a persistent RED-first harness and the complete QA01–QA43 matrix.

**Organization**: Tasks are grouped by baseline/foundation and then by the three user stories. Safety
User Story 3 remains P1 and follows the core recovery work because it hardens the same helper and
integration. Save is synchronous for all three scopes: each approved `input` or `change` event writes
directly during that event, preserving the existing Agenda and Comunicats semantics.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel only after its stated dependencies.
- **[Story]**: Maps the task to US1, US2 or US3 from `spec.md`.
- Every task names the exact file used or modified.

## Closed IMPLEMENT allowlist

**Productive — modify**:

- `src/lib/submissionDraft.ts`
- `src/lib/veuSubmissionFlow.ts`

**QA — create**:

- `scripts/qa/veu-draft-persistence-qa.mjs`

**SDD — write while implementing**:

- `specs/009-veu-draft-persistence/tasks.md`

Every other path is read-only. If implementation requires another file, stop, report the exact need,
return to PLAN and obtain an explicit allowlist amendment.

The real frontend `.astro/` and `dist/` are non-owned/read-only and do not extend this allowlist.
Generated `.astro/`, cache and `dist/` are permitted only inside the marked ephemeral QA root created
by the harness for the approved `--build` → `--browser` lifecycle and mandatory cleanup in Phase 6.

---

## Phase 1: Baseline and precheck

**Purpose**: Establish reproducible repository evidence before creating the harness or modifying
product code.

- [X] T001 Record frontend branch, `HEAD`, `origin/main`, ahead/behind, staged/untracked state and the exact pre-IMPLEMENT Feature 009 file inventory in `specs/009-veu-draft-persistence/tasks.md`; require `main` at `e98c5e47637a395fd0ddc6b928c50e33c93249fa` with only Feature 009 SDD changes
- [X] T002 Record SHA-256 fingerprints for `src/lib/submissionDraft.ts` and `src/lib/veuSubmissionFlow.ts`, confirm `scripts/qa/veu-draft-persistence-qa.mjs` is absent, and record that no productive file is staged in `specs/009-veu-draft-persistence/tasks.md`
- [X] T003 Inspect read-only `src/lib/submissionDraft.ts`, `src/lib/agendaSubmissionFlow.ts`, `src/lib/comunicatSubmissionFlow.ts`, `src/lib/veuSubmissionFlow.ts`, `src/components/VeuSubmissionFlow.astro`, `src/templates/VeuSubmissionPage.astro`, `src/pages/veus/envia-la-teva-veu.astro`, `src/pages/es/veus/envia-tu-voz.astro` and `src/pages/en/veus/send-your-voice.astro`; record the existing helper contract, callers, seven-field allowlist, common mount, success boundary and exclusions in `specs/009-veu-draft-persistence/tasks.md`
- [X] T004 Record backend branch, `HEAD`, `origin/main`, ahead/behind and clean status from `../guiapineda-strapi` in `specs/009-veu-draft-persistence/tasks.md`; require baseline `47ca26a0a54fd1c0193afd659b6ba3657b264793`, confirm no backend path is in the IMPLEMENT allowlist, and record that Feature 009 performs no SQLite command or access

### IMPLEMENT evidence — Phase 1

- **T001**: frontend `main`; `HEAD` and local `origin/main` both `e98c5e47637a395fd0ddc6b928c50e33c93249fa`; ahead/behind `0/0`; staged `0`; tracked changes `0`; `dist/` absent. The only untracked paths are the seven Feature 009 SDD artifacts: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md` and `checklists/requirements.md`.
- **T002**: pre-product SHA-256: `submissionDraft.ts` = `fdb9b11e2a0d3311c98db5a5ef40fbe01bababb36651a02f1e4205a9d72f1d46`; `veuSubmissionFlow.ts` = `a2c019cc47ab0d06a4d22de4165faa8586ec3faa9e01ae5f51008c47d779b079`. The Feature 009 QA harness was absent and no productive file was staged.
- **T003**: the existing helper uses versioned `sessionStorage` envelopes, exact scope keys, allowlisted named controls, restore-before-listeners, direct synchronous `input`/`change` writes, structural-envelope discard and per-field string filtering. Agenda and Comunicats call it before verification and clear only after confirmed submit. Veus exposes exactly `titol`, `resum`, `contingut`, `tipo_autoria`, `autor_public`, `nombre_contacto`, `email_contacto`; CA/ES/EN share `VeuSubmissionPage.astro`, `VeuSubmissionFlow.astro` and `initVeuSubmissionFlow()`. The confirmed-success boundary is the resolved `submitVerifiedSubmissionForm()` call. Image/file/preview, privacy, verification, step, review and technical state remain outside the seven-field allowlist.
- **T004**: backend `main`; `HEAD` and local `origin/main` both `47ca26a0a54fd1c0193afd659b6ba3657b264793`; ahead/behind `0/0`; staged/tracked/untracked changes `0`. No backend path is allowlisted. SQLite access/commands for Feature 009: none.

**Checkpoint**: Baselines, fingerprints, allowed paths and read-only surfaces are explicit. No product or
QA file has changed.

---

## Phase 2: Persistent harness and mandatory RED gate

**Purpose**: Create all test evidence before touching either productive file.

**⚠️ CRITICAL**: T010 blocks T011 and every product change.

- [X] T005 Create `scripts/qa/veu-draft-persistence-qa.mjs` using only Node built-ins, `node:assert/strict`, normalized case output and isolated per-run state; prohibit any functional dependency on `ps`, `lsof` or an equivalent external executable for process ownership/cleanup, external network, external services and writes outside harness-owned temporary or in-memory fixtures, except for the marked ephemeral QA root required by T042; keep the real frontend `.astro/` and `dist/` read-only/non-owned, and remove only the identified dead/redundant harness code: the redundant `stat` import, an unused/redundant `MemoryStorage.snapshot()` unless it becomes the actual observed snapshot source, the redundant `processGroup` parameter and the redundant QA22 reassignment
- [X] T006 Add a minimal controlled DOM, `sessionStorage`, event and form-control fixture to `scripts/qa/veu-draft-persistence-qa.mjs` that can import `src/lib/submissionDraft.ts`, detect listener duplication, inspect exact keys/envelopes, inject storage failures and prove restore completes before listener installation, `input` and `change` persist before their event returns, the last value is stored before later navigation, and clear cannot be followed by another write
- [X] T007 Add RED-first cases QA01–QA18 to `scripts/qa/veu-draft-persistence-qa.mjs` for the seven allowlisted fields, reload/partial drafts/authorship/contact, one logical CA/ES/EN draft, literal values, image/preview/consent/verification/step/review/unknown-field exclusions
- [X] T008 Add RED-first cases QA19–QA31 to `scripts/qa/veu-draft-persistence-qa.mjs` for malformed JSON, invalid root/version/scope/fields, partial payloads, wrong types, invalid enum, extra/over-limit values, first-step restoration, counters, derived review, localized labels and coherent authorship; QA27 must observe the editable first step, QA28 must assert counters/classes from restored values, QA29 must edit after restore and assert review uses the new value, QA30 must assert the destination-language label while preserving the contractual value, and QA31 must separately exercise every required valid, invalid and partial authorship state—no shared generic action may award PASS to semantically distinct IDs
- [X] T009 Add RED-first cases QA32–QA43 to `scripts/qa/veu-draft-persistence-qa.mjs` for confirmed-success cleanup, every required preservation failure, reload/language continuity, three-scope isolation and static non-adoption by Millorem/Foto del Mes/Commerce; QA32–QA37 must each execute its own setup/action/assertion, with only QA32 removing the Veus key after confirmed success and QA33–QA37 explicitly proving the key still exists with its expected value after their distinct failure; within QA40 and QA41 explicitly prove for both Agenda and Comunicats that valid drafts still restore, structurally corrupt drafts fail safely, invalid or unknown fields retain current behavior, and save/restore/clear semantics do not change
- [X] T010 Run `node --check scripts/qa/veu-draft-persistence-qa.mjs` and then `node scripts/qa/veu-draft-persistence-qa.mjs --dom` in RED state; record in `specs/009-veu-draft-persistence/tasks.md` that Agenda and Comunicats baselines—including valid restore, structurally corrupt payloads, invalid or unknown fields and current save/restore/clear behavior—PASS, the harness validly reports only Veus persistence absent, product fingerprints still equal T002, the allowlist remains intact, no test contacts network, and no product file was modified; T011 and every productive change remain prohibited until this gate passes

### IMPLEMENT evidence — Phase 2 / T010 RED gate and remediation

- T005/T008/T009 remediation PASS: the harness uses Node built-ins and `node:assert/strict`, has isolated per-run state, no functional `ps`/`lsof` dependency, and distinct setup/action/assertion paths for QA27–QA37 plus independent Agenda/Comunicats QA40–QA41 coverage.
- F8 cleanup PASS: the redundant `stat` import, `processGroup` parameter and QA22 reassignment are absent; `MemoryStorage.snapshot()` is retained only as the actual observed final snapshot source.
- T010's historical RED transition remains valid and was not rerun.
- Agenda baseline: PASS. Comunicats baseline: PASS. Valid save/restore/clear, corrupt-envelope discard and allowlist behavior remain green.
- Expected RED: `VEUS RED — persistence scope/integration absent` with exit status `2`; no unrelated failure or skipped closed-scope regression.
- Product fingerprints after RED remain byte-identical to T002. No product file was staged or modified, the only new implementation path is the allowlisted QA harness, and the DOM gate performs no network request.

**RED Gate**: PASS only when the failure is specifically the missing Veus scope/integration and the
closed features remain green. Do not weaken expectations to obtain RED.

---

## Phase 3: User Story 1 — Recover work after a local interruption (Priority: P1) 🎯

**Goal**: Save and restore the latest safe Veus values after reload or return, with coherent first-step
UI and no loss of partial work.

**Independent Test**: Populate all seven permitted fields, change them more than once, reload in the
same tab session and verify exact latest values, editable first step, counters and no excluded state.

### Implementation and tests for User Story 1

- [X] T011 [US1] Extend `src/lib/submissionDraft.ts` so `DraftScope` accepts `"veu"`, strict allowlisted `HTMLSelectElement` fields read/restore only `""` or a current option, and optional per-field restore predicates can reject over-limit Veus strings; preserve direct synchronous writes from `input` and `change` for Agenda, Comunicats and Veus, register listeners only after restore, and ensure `clearDraft` cannot be followed by another event-originated write unless a new user event occurs
- [X] T012 [US1] Execute the post-helper `--dom` subset in `scripts/qa/veu-draft-persistence-qa.mjs` and record in `specs/009-veu-draft-persistence/tasks.md` that `agenda`, `comunicat` and `veu` are accepted with isolated keys; restore precedes listeners; `input` and `change` each persist synchronously before returning; select enums, Veus restore predicates and clear behavior work; valid and structurally corrupt Agenda and Comunicats drafts plus invalid or unknown fields preserve their current semantics; and product changes remain limited to `src/lib/submissionDraft.ts`; if either closed scope regresses, mark T012 FAIL and stop IMPLEMENT

### IMPLEMENT evidence — T012 post-helper gate

- `node --check` PASS and `--dom` post-helper subset PASS.
- `agenda`, `comunicat` and `veu` keys are isolated; Agenda/Comunicats valid, corrupt and allowlist behavior remains unchanged.
- Restore occurs before listeners; `input` and `change` write directly before dispatch returns. Select values must match a current option; Veus predicates reject over-limit strings while valid siblings restore. Clear removes only its scope and no deferred save exists.
- Product diff at this gate is limited exactly to `src/lib/submissionDraft.ts`; Agenda and Comunicats callers are byte-unchanged.
- [X] T013 [US1] In `src/lib/veuSubmissionFlow.ts`, define exactly `titol`, `resum`, `contingut`, `tipo_autoria`, `autor_public`, `nombre_contacto`, `email_contacto`; initialize `initSubmissionDraft` with scope `veu` and Veus-only max-length restore predicates (140/400/6000/enum/120/120/254) before email verification initialization, using the helper's direct synchronous save behavior without discovering fields or persisting locale/derived state
- [X] T014 [US1] Reconcile restored state in `src/lib/veuSubmissionFlow.ts` by forcing the first editable step without persisting the step, recalculating existing `resum`/`contingut` counters and submit/visual state, leaving image empty, privacy unchecked and email verification fresh, and continuing to build review only from current DOM values when Continue is used
- [X] T015 [US1] Run QA01–QA06 and the distinct QA27–QA29 scenarios from `scripts/qa/veu-draft-persistence-qa.mjs`; record exact envelope equality, latest-value behavior, partial draft support and valid authorship/contact restoration, plus observable proof that QA27 opens the editable first step, QA28 recalculates counters/classes and QA29 edits after restore before deriving review from the edited DOM value, in `specs/009-veu-draft-persistence/tasks.md`; do not infer multiple PASS IDs from one generic action
- [X] T016 [US1] Re-run `node --check scripts/qa/veu-draft-persistence-qa.mjs`, compare current diff to the allowlist, and record the US1 checkpoint in `specs/009-veu-draft-persistence/tasks.md` with no markup, page, transport, verification, Agenda, Comunicats or backend changes

### IMPLEMENT REMEDIATION evidence — US1 checkpoint

- QA01–QA06 PASS independently: exact seven-field envelope, latest synchronous values, partial draft and valid authorship/contact restore were observed.
- QA27, QA28 and QA29 PASS through separate actions: restore opened the editable first step; restored values recalculated counters/classes; an edit after restore changed the DOM and the subsequent review used that edited value.
- Draft initialization precedes verification. Restored UI is forced to the editable form step, counters are recalculated, verification remains fresh, privacy/image remain at safe defaults and review continues to derive from current DOM values.
- Harness syntax PASS. Current product diff contains only `submissionDraft.ts` and `veuSubmissionFlow.ts`; no markup, page, transport, verification, Agenda, Comunicats or backend file changed.

**Post-helper Gate**: T012 must PASS immediately after T011 and before T013.

**US1 Checkpoint**: The seven fields independently survive reload/return; safety cleanup and
multilingual journeys remain to be completed in the next story phases.

---

## Phase 4: User Story 3 — Keep only a safe controlled draft (Priority: P1)

**Goal**: Exclude every unauthorized value, fail safely on corruption, preserve drafts through all
failures and clear only after confirmed success or natural session end.

**Independent Test**: Inject corrupt/partial payloads and excluded state, exercise validation,
verification and submission failures plus a controlled success, and observe only the approved seven
fields with the required cleanup lifecycle.

### Implementation and tests for User Story 3

- [X] T017 [US3] In `src/lib/veuSubmissionFlow.ts`, retain the `clearDraft` operation returned by the helper and invoke it only immediately after `await submitVerifiedSubmissionForm(...)` resolves its confirmed `{ok:true}` path; keep every validation, verification, rejected-code, submit-start, catch, 503, reload, navigation and language path non-clearing, and add no reset/cancel control
- [X] T018 [US3] Run QA12–QA18 from `scripts/qa/veu-draft-persistence-qa.mjs` and record in `specs/009-veu-draft-persistence/tasks.md` that image/file/preview, consent/legal acceptance, verification/token/code/challenge/session/authorization/email-verified, step, review, technical state and unknown fields never enter the envelope or restore
- [X] T019 [US3] Run QA19–QA26 from `scripts/qa/veu-draft-persistence-qa.mjs` and record whole-envelope discard for malformed JSON/root/version/scope/fields plus individual ignore for extra, wrong-type, invalid-enum and over-limit values while valid siblings and safe defaults remain usable in `specs/009-veu-draft-persistence/tasks.md`
- [X] T020 [US3] Run distinct QA30–QA37 and QA39 scenarios from `scripts/qa/veu-draft-persistence-qa.mjs`; record QA30 destination-language label plus stable contractual value, QA31 every required authorship state, QA32 confirmed-success removal only, QA33–QA37 explicit key/value preservation after their respective client-validation, verification, rejected-code, submit-failure and 503 actions, QA39 reload survival, no automatic retry and proof that no write occurs after clear unless a new user event occurs in `specs/009-veu-draft-persistence/tasks.md`; no shared generic clear/preserve action may award PASS to different IDs
- [X] T021 [US3] Assert deep equality of the stored key and envelope in `scripts/qa/veu-draft-persistence-qa.mjs`, proving metadata is only `version`, `scope`, `fields` and fields are exactly the seven authorized strings; record the privacy gate and deliberate local-only contact-name/email inclusion in `specs/009-veu-draft-persistence/tasks.md`
- [X] T022 [US3] Exercise unavailable `sessionStorage` plus throwing get/set/remove and quota/security failures in `scripts/qa/veu-draft-persistence-qa.mjs`; record that filling, validation, review and controlled submit remain usable, no exception escapes and no security state is synthesized in `specs/009-veu-draft-persistence/tasks.md`
- [X] T023 [US3] Execute the post-integration gate from `scripts/qa/veu-draft-persistence-qa.mjs` and audit `src/lib/veuSubmissionFlow.ts`; record exactly the seven fields `titol`, `resum`, `contingut`, `tipo_autoria`, `autor_public`, `nombre_contacto`, `email_contacto` by deep envelope equality, all exclusions and zero excluded states, direct synchronous save, restore-before-listeners, observed first editable step, review derived after an edit, every contractual authorship state, success-only clear and explicit key/value preservation for every failure path, plus CA/ES/EN-compatible scope PASS in `specs/009-veu-draft-persistence/tasks.md`; fail the gate if semantically distinct IDs share evidence without distinct setup/action/assertion

### IMPLEMENT REMEDIATION evidence — T023 post-integration gate

- QA12–QA18 PASS: image/file/preview, consent/legal, verification/token/code/challenge/session/authorization/email-verified, step, review, technical and unknown state are absent from save and restore.
- QA19–QA26 PASS: malformed JSON and incompatible root/version/scope/fields discard the envelope; wrong type, invalid enum, extra and over-limit fields are ignored individually while valid siblings/defaults survive.
- QA30–QA37 PASS as distinct cases: QA30 observed the destination-language label while retaining the contractual value; QA31 exercised every required authorship state; QA32 alone cleared after confirmed success; QA33–QA37 each preserved the exact expected key/value after its own client-validation, verification, rejected-code, submit-failure or 503 action. QA39 observed reload survival, no automatic retry and no post-clear write without a new user event.
- Exact deep envelope equality PASS: metadata only `version`, `scope`, `fields`; fields exactly the seven authorized strings, including deliberate session-local contact name/email. Restore precedes listeners, opens the first editable step and derives review/authorship/UI from current values.

**Post-integration Gate**: T023 must PASS before multilingual browser work or full QA. No excluded
state may be accepted as a temporary compromise.

---

## Phase 5: User Story 2 — Continue one draft across CA, ES and EN (Priority: P2)

**Goal**: Use the same logical draft through CA → ES → EN → CA without translating user content or
persisting localized labels.

**Independent Test**: Write in CA, navigate CA → ES → EN → CA in one tab, edit along the way and
verify one key, exact latest text, destination-language UI and no cross-scope collision.

### Tests for User Story 2

- [X] T024 [US2] Audit `src/lib/veuSubmissionFlow.ts`, `src/components/VeuSubmissionFlow.astro`, `src/templates/VeuSubmissionPage.astro`, `src/pages/veus/envia-la-teva-veu.astro`, `src/pages/es/veus/envia-tu-voz.astro` and `src/pages/en/veus/send-your-voice.astro`; record in `specs/009-veu-draft-persistence/tasks.md` that all routes share the controller/names and the only Veus key is `guiapineda:submission-draft:v1:veu` with no locale or new language selector
- [X] T025 [US2] Run QA07–QA11 and QA38 from `scripts/qa/veu-draft-persistence-qa.mjs` for CA → ES, ES → EN, EN → CA, literal untransformed values, latest edits, one key and proof that the last `input` value written immediately before language navigation is already present in storage; record PASS in `specs/009-veu-draft-persistence/tasks.md`
- [X] T026 [US2] Run separate QA30 and QA31 scenarios from `scripts/qa/veu-draft-persistence-qa.mjs` against CA/ES/EN fixtures; for QA30 record the destination-DOM localized option/review label while `tipo_autoria` retains its contractual value, and for QA31 independently exercise every required valid, invalid and partial authorship state while `autor_public` remains visible, applicable, required and unchanged in `specs/009-veu-draft-persistence/tasks.md`
- [X] T027 [US2] Run QA42 exclusively through `node scripts/qa/veu-draft-persistence-qa.mjs --dom` with simultaneous Agenda, Comunicats and Veus envelopes; record that Veus language navigation reads/writes only its key and never reads, overwrites or clears the other scopes in `specs/009-veu-draft-persistence/tasks.md`

### IMPLEMENT REMEDIATION evidence — US2 checkpoint

- QA07–QA11, QA38 and DOM-only QA42 remain independently PASS. Separate QA30/QA31 DOM and browser actions across CA/ES/EN observed localized destination labels without translating `tipo_autoria`, and valid, invalid and partial authorship states while `autor_public` retained its contractual behavior.

**US2 Checkpoint**: One literal draft works identically across the three canonical routes without a
locale-specific identity or persisted translated label.

---

## Phase 6: Full QA, build and controlled browser validation

**Purpose**: Validate all stories together without backend, real Functions, email or infrastructure.

- [X] T028 Run the complete QA01–QA43 matrix once with `node scripts/qa/veu-draft-persistence-qa.mjs --dom`; require every ID exactly once, normalized PASS output, zero skipped cases and a final storage snapshot read from the actual final `sessionStorage` rather than a constant; require that observed snapshot to match the explicitly declared state produced by the executed cases (including any keys QA42 leaves before QA43), or an explicitly executed and observed final fixture reset, and fail if any unexpected key/value remains, then record the result in `specs/009-veu-draft-persistence/tasks.md`
- [X] T029 Run the complete QA01–QA43 matrix a second time with `node scripts/qa/veu-draft-persistence-qa.mjs --dom` from a fresh controlled state, compare normalized output and the actual observed final storage snapshot byte-for-byte with T028, and record determinism/no cross-run contamination in `specs/009-veu-draft-persistence/tasks.md`; a hardcoded snapshot or comparison detached from storage is a FAIL

### IMPLEMENT REMEDIATION evidence — T028/T029 deterministic DOM matrix

- Two fresh consecutive `--dom` runs exited `0`; each executed QA01–QA43 exactly once with zero skips, and their normalized stdout was byte-for-byte identical.
- Both runs read the final state through `MemoryStorage.snapshot()` and emitted the same observed value: `FINAL_STORAGE_SNAPSHOT={"guiapineda:submission-draft:v1:agenda":"A","guiapineda:submission-draft:v1:comunicat":"C"}`. This is the legitimate state left by QA42 before QA43's static non-adoption audit, not a hardcoded empty object.
- Cross-run contamination: none. Deferred work: none; both Node processes exited cleanly after emitting the observed snapshot and `DOM PASS`.
- [X] T030 Before running `node scripts/qa/veu-draft-persistence-qa.mjs --build`, require the real frontend `dist/` and any prior QA root to be absent; if either exists, FAIL/STOP without deleting or adopting it. Require the harness to use the T042-owned QA root, own an ephemeral CMS double on `127.0.0.1:0`, set `STRAPI_URL` only for its exact child `npm run build -- --root <qa-root>`, accept only `GET` requests for `/api/home`, `/api/categoria-comercios`, `/api/subcategorias`, `/api/comercios`, `/api/comunicats`, `/api/millores`, `/api/agendas` and `/api/veus` with the exact populate/first-page queries from `src/lib/api.ts`, return the deterministic empty Strapi envelope with `pageCount: 1`, and fail every other request without passthrough. Require a build-mode `finally` on PASS, FAIL or exception to close the CMS double and every owned process/resource and verify its listener/port released. On PASS retain only `<qa-root>/dist` for browser, bound to the same run id; on FAIL clean only resources and the QA root whose ownership remains demonstrable. Never create, delete or adopt `<frontend>/dist`; record precondition, command, output location, ownership and cleanup evidence in `specs/009-veu-draft-persistence/tasks.md`
- [X] T031 Run `node scripts/qa/veu-draft-persistence-qa.mjs --browser` without any implicit build; require exactly the T030 `<qa-root>/dist` with the same valid marker, realpath, directory type, run id and contractual identity, failing without adopting or deleting anything if ownership is ambiguous. Prove `127.0.0.1:4173` free, own the exact child `npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173`, and poll every 100 ms for at most 15 seconds until `GET http://127.0.0.1:4173/veus/envia-la-teva-veu/` returns 200 with `data-veu-submission-flow`; launch exact installed `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` headless with a `mkdtemp` profile, CDP on `127.0.0.1:0` discovered through `DevToolsActivePort`, background networking/sync/component update disabled and `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`, never a real profile; use one tab only for the exact CA `/veus/envia-la-teva-veu/`, ES `/es/veus/envia-tu-voz/` and EN `/en/veus/send-your-voice/` routes and execute each browser-subset ID QA02, QA05–QA18 and QA27–QA39 with its own required setup, action, observable assertion and PASS—at minimum real image selection/preview for QA12–QA13, consent followed by navigation for QA14, review/step actions for QA16–QA17, edit-after-restore for QA29, a destination-language label for QA30 and failed client validation for QA33; printing/listing an ID is never evidence. Before signaling any process, revalidate with Node built-ins that its live identity and parent/child relationship still prove harness ownership; a remembered PID alone is insufficient, and unverifiable ownership requires STOP/FAIL without signaling
- [X] T032 In the `--browser` execution, require the same `scripts/qa/veu-draft-persistence-qa.mjs` to use `Page.addScriptToEvaluateOnNewDocument` before application code and exclusively intercept `POST /api/verification/request-code`, returning 200 with a fixed challenge or 503 `{"ok":false,"reason":"verification:unavailable"}`; `POST /api/verification/verify-code`, returning a fixed token for `123456` or 400 `{"ok":false,"reason":"invalid-code","attemptsRemaining":4}`; and `POST /api/submissions/veu`, returning 200 `{"ok":true}`, 500 `{"ok":false,"reason":"submission:failed"}` or 503 `{"ok":false,"reason":"submission:unavailable"}`; parse and assert the actual submitted `FormData` entries—not only `instanceof FormData`—against the existing contract for method, body, scope, current language and expected counters/values, without inventing fields or calling original fetch, and enforce a CDP guard allowing only exact preview-origin `GET`/`HEAD` for the three Veus routes, `/enviat/`, `/es/enviado/`, `/en/sent/`, `/favicon.ico`, `/favicon.svg` and `/_astro/`, with escaped `/api/`, any external origin/method/path or unrecognized request failing closed; execute QA32–QA37 as distinct actions, record success-only removal, exact failure preservation and zero real service requests in `specs/009-veu-draft-persistence/tasks.md`
- [X] T033 Complete the final evidence aggregation for the controlled Veus-only browser run: require T030 PASS and T031 to consume the same demonstrably owned `<qa-root>` and run id; record browser evidence exclusively for QA02, QA05–QA18 and QA27–QA39 only when each ID has its required setup/action/observable assertion, and incorporate/reference the prior `--dom` evidence from T028–T029 for QA40–QA43 without navigating Agenda/Comunicats or widening the fail-closed guard. Require one harness-owned `finally`, after ownership validation even if a later preflight fails, to restore the shim/listeners and disable guards, close target/CDP/Chrome, signal only a live preview root/descendant whose identity and relationship remain demonstrably owned using Node built-ins (otherwise STOP/FAIL without signaling), wait up to 5 seconds before `SIGKILL` contingency, close owned fixtures, remove its temporary profile/PNG/artifacts, and only then delete the QA root when its realpath, directory type, marker, run id and contractual identity still match. Verify Chrome and owned helpers ended, target/CDP closed, ports free, the QA root and its `.astro/`, cache and `dist/` absent, the real frontend `.astro/` unchanged by the T042 manifest and real `dist/` absent; record cleanup evidence in `specs/009-veu-draft-persistence/tasks.md`

### Historical IMPLEMENT REMEDIATION evidence — superseded for the build/browser environment

- `--build` PASS from proven-absent `dist/`: all eight exact first-page/populate requests reached only the loopback CMS double, build produced 43 pages, the double closed in `finally`, and its ephemeral listener was verified free. The resulting `dist/` received the exact Feature 009 ownership marker.
- The immediately following `--browser` run validated the ownership marker, started only the owned preview and temporary headless Chrome profile, and executed each of QA02, QA05–QA18 and QA27–QA39 individually: `BROWSER PASS — 28 individually executed Veus-only cases; CA/ES/EN, exact fixture and fail-closed guard`.
- The injected pre-application shim accepted only the three contractual POST endpoints and exact response variants, parsed and deep-asserted actual `FormData` entries plus scope/language/counters, never called original fetch for those requests, and the CDP network guard rejected anything outside the exact Veus allowlist. QA32 alone cleared; QA33–QA37 independently preserved their exact draft values; real external service requests: zero.
- Safe cleanup PASS: live preview/Chrome ownership was revalidated through Node-owned authenticated control channels before signaling; `finally` closed target, CDP, Chrome/helpers, preview and fixtures, then removed the temporary profile and owned `dist/`. Ports 4173 and the observed CDP port 49509 were explicitly rebound and released; no owned child/resource remained.

### IMPLEMENT REMEDIATION #3 evidence — isolated qa-root build/browser

- **T005/T042 isolation**: the harness uses only Node built-ins and creates `.veu-009-qa-*` with `mkdtemp` directly under the frontend. Its immutable marker records contract version 2, UUID run id, realpath, device/inode, the exact six-entry copy allowlist and the read-only real `.astro/` manifest. Only `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json` and `package-lock.json` are copied; dependencies resolve from the parent install and only generated `.astro/`, `dist/`, `node_modules/.astro` and `node_modules/.vite` are accepted. Cleanup recursively removes only the directory whose full marker and filesystem identity still match, including a marked partial copy; ambiguous ownership fails without deletion.
- **T030 build**: preflight proved real `dist/` and prior qa-roots absent. `npm run build -- --root /Users/gerardolmos/CURRO/WEB/Guia-Pineda/guiapineda-astro/.veu-009-qa-2KDQWe` built 43 pages using run `6aee91d7-ae7b-421a-a5fd-77030d1b9390`; the loopback CMS double received exactly the eight contractual GET queries, rejected passthrough, and its `127.0.0.1:49936` listener was closed and rebound in `finally`. Real `.astro/` remained equal and real `dist/` remained absent.
- **T031/T033 browser**: the immediately following `--browser` consumed the same marker, qa-root and run id without rebuilding. It ran exactly QA02, QA05–QA18 and QA27–QA39 as 28 distinct setup/action/observable checks on CA/ES/EN, including real file preview, consent/navigation, review/step, edit-after-restore, localized labels, exact submitted `FormData`, success-only removal and distinct preservation failures; the fail-closed guard observed zero real service requests. QA40–QA43 remain DOM-only evidence.
- **Universal cleanup**: browser `finally` disabled the guard/shim, closed target/CDP, all 10 observed Chrome PIDs and its owned process group, preview and fixtures, removed the temporary profile, then revalidated and removed the qa-root. Node-only rebind checks passed for preview 4173, CMS 49936 and CDP 49960. No qa-root, profile, generated QA `.astro/`/cache/`dist/`, real `dist/` or owned child remained; real `.astro/` matched before/after by existence, tree, type, size/hash and mode, with timestamps excluded and no restoration.

If T030 PASS leaves a marked, owned QA root with internal `dist/` but execution is interrupted before
T031, QA is INCOMPLETE and that namespace is not a valid final state. Resume with the same `--browser`
mode, which must validate the QA root realpath, directory type, marker, run id and contractual identity
and remove only that owned namespace in its `finally`, including after PASS, FAIL, timeout, exception
or a preflight failure after ownership validation. If ownership cannot be proven, STOP/FAIL without
deleting or restoring anything; never touch the real frontend `.astro/` or `dist/`.

**Checkpoint target**: QA01–QA43 must PASS through the combined evidence: QA40–QA43 exclusively from
`--dom` and the exact browser subset QA02, QA05–QA18 and QA27–QA39 from the Veus-only run.
Determinism, build, ownership and cleanup evidence must also PASS. Any missing local fixture is a blocker to resolve
within the single authorized QA script, never by contacting real infrastructure.

---

## Phase 7: Final audit and handoff

**Purpose**: Prove traceability, scope containment and a residue-free non-deployed implementation.

- [X] T034 Audit all 27 FR, 17 acceptance scenarios, 9 SC and QA01–QA43 against completed task evidence only after every TASKS REMEDIATION #5 task has valid evidence; reject printed/listed QA IDs, hardcoded snapshots, shared generic actions for semantically distinct IDs and cleanup/ownership claims without observable proof, then record a zero-gap traceability table in `specs/009-veu-draft-persistence/tasks.md` without changing `spec.md`, `plan.md`, `research.md`, `data-model.md` or `quickstart.md`
- [X] T035 Audit frontend `git diff`, staged files and untracked files against the closed allowlist; require productive changes only in `src/lib/submissionDraft.ts` and `src/lib/veuSubmissionFlow.ts`, QA creation only at `scripts/qa/veu-draft-persistence-qa.mjs`, SDD writes only at `specs/009-veu-draft-persistence/tasks.md`, and temporary generated writes only inside the T042 marked QA root; require the real `.astro/` and `dist/` to remain non-owned/read-only and record FAIL/return-to-PLAN for any additional path
- [X] T036 Re-audit `src/lib/submissionDraft.ts`, `src/lib/veuSubmissionFlow.ts` and exact sessionStorage output for privacy: seven fields only, no image/consent/verification/token/code/challenge/step/review/unknown data, no locale key, no TTL, no unload, no backend and no dependency addition; record PASS in `specs/009-veu-draft-persistence/tasks.md`
- [X] T037 Verify `../guiapineda-strapi` remains clean at the T004 commit, no backend path entered the allowlist, neither the QA-root copy set nor any Feature 009 script/command accesses or copies SQLite/backend/secrets, and schemas, migrations, server data, Functions, Content Manager, moderation, infrastructure and deploy remain outside scope; confirm generated `.astro/`, cache and `dist/` existed only inside the owned QA root and never became authorized source/Git changes, then record PASS in `specs/009-veu-draft-persistence/tasks.md`
- [X] T038 Run `git diff --check`, final harness syntax check, frontend/backend `git status --short --branch` and a Node-built-in-only process/port/residue audit with zero functional use of `ps`, `lsof` or equivalent external executables; compare the real frontend `.astro/` before/after manifests by existence, tree, type, content/hash and mode only, never timestamps, and require exact equivalence without restoring it; require real `dist/` absent, QA root absent, no generated `.astro/`/cache/`dist/`, staged files, unexpected untracked files, logs, screenshots, browser profiles, temporary artifacts, child processes, occupied owned ports or running owned Astro/Chrome helpers, verify the F8 dead/redundant code named in T005 is absent, and record results in `specs/009-veu-draft-persistence/tasks.md`
- [X] T039 Replace the historical IMPLEMENT completion summary in `specs/009-veu-draft-persistence/tasks.md` only after every reopened task has valid evidence, including observed final storage, per-ID DOM/browser actions, safe QA-root/process ownership, exact submit fixture validation and observable universal cleanup; report completed/incomplete tasks, validation results, CA/ES/EN, privacy, corruption, synchronous save, determinism, Agenda/Comunicats regressions, zero SQLite access and Git state; explicitly confirm the real `.astro/` remained equivalent by existence/tree/type/content-or-hash/mode without timestamp evidence or restoration, real `dist/` and QA root are absent, every generated browser/build resource is absent, no commit/push/deploy occurred, and stop for CONVERGE/human review

### IMPLEMENT REMEDIATION #3 final traceability and completion summary

| Contract surface | Evidence | Result |
|---|---|---|
| FR-001–FR-027 | T011–T027 plus exact helper/controller and privacy audits | PASS — 27/27 traced, zero gap |
| US1/US2/US3 acceptance scenarios | US1, T023 and US2 checkpoints plus distinct DOM/browser actions | PASS — 17/17 traced, zero gap |
| SC-001–SC-009 | deterministic DOM, isolated build/browser, Git/backend and residue audits | PASS — 9/9 traced, zero gap |
| QA01–QA43 | QA01–QA43 DOM exactly once per run; approved 28-case Veus browser subset; QA40–QA43 DOM-only | PASS — 43/43, zero skipped, shared or inferred IDs |

- **Tasks**: IMPLEMENT REMEDIATION #3 completed exactly the 10 reopened tasks T005, T030, T031, T033, T034, T035, T037, T038, T039 and T042. Final state: 42/42 closed, 0 pending and 0 task marked `[P]`; the QA matrix remains exactly QA01–QA43.
- **Behavior**: one literal CA/ES/EN draft; exactly seven strings; synchronous `input`/`change`; safe partial/corrupt restore; first editable step and derived counters/review; success-only clear; all failure paths preserve. The final observed storage was `{"guiapineda:submission-draft:v1:agenda":"A","guiapineda:submission-draft:v1:comunicat":"C"}` and matched the prior deterministic runs byte-for-byte with no cross-run contamination or deferred work.
- **Privacy/isolation**: no image, consent, verification/token/code/challenge, step, review, locale, TTL, unload save, unknown field or backend datum enters the envelope. Agenda/Comunicats regressions and three-scope isolation PASS; Millorem/Foto/Commerce do not adopt the helper.
- **QA-root/cleanup**: build and browser shared run `6aee91d7-ae7b-421a-a5fd-77030d1b9390`. Build generated 43 pages only inside the marked qa-root; browser executed its exact 28-case subset. Universal `finally` cleanup closed CMS, target/CDP/Chrome/helpers, preview and fixtures before deleting the validated qa-root/profile. Real `.astro/` stayed exactly equivalent by existence/tree/type/content-hash/mode without timestamp evidence or restoration; real `dist/`, qa-root and all generated browser/build resources are absent. Ports 4173, 49936 and 49960 are free.
- **Allowlist/Git**: productive changes remain only in `src/lib/submissionDraft.ts` and `src/lib/veuSubmissionFlow.ts`; QA only in `scripts/qa/veu-draft-persistence-qa.mjs`; SDD evidence only in this `tasks.md`. Staged 0; frontend remains `main` at `e98c5e47637a395fd0ddc6b928c50e33c93249fa`, ahead/behind 0/0. `.specify/feature.json` is diff-clean with SHA-256 `7a09b8b03652383df33707712a3d67e538866179868410ce81bf7f1443e2d9c3`.
- **Backend/SQLite**: backend is clean on `main` at `47ca26a0a54fd1c0193afd659b6ba3657b264793`, ahead/behind 0/0. The qa-root copy allowlist excludes backend, SQLite, secrets and persistent data; SQLite access, read, hash, metadata/sidecar inspection, command, schema/migration and data change: none.
- **Validation/residue**: final `node --check`, pre/post-browser `--dom`, isolated `--build`, immediate `--browser`, F7/F8 static audit, Node-built-in-only ownership/port/residue checks and frontend/backend `git diff --check` PASS. No temporary profile, screenshot, QA artifact, owned process or unexpected path remains.
- **Handoff**: FEATURE 009 IMPLEMENT REMEDIATION #3 complete. No dependency install, commit, push, deploy or CONVERGE occurred; stop for human review.

---

## Dependencies & Execution Order

### Gate chain

```text
T001 → T002 → T003 → T004
  → T005 → T006 → T007 → T008 → T009 → T010 (RED)
  → T011 → T012 (post-helper)
  → T013 → T014 → T015 → T016 (US1)
  → T017 → T018 → T019 → T020 → T021 → T022 → T023 (post-integration/US3)
  → T024 → T025 → T026 → T027 (US2)
  → T028 → T029 → T005 (reopened) → T042 (environment remediation)
  → T030 → T031 → T032 → T033
  → T034 → T035 → T036 → T037 → T038 → T039
```

### User story dependencies

- **US1 (P1)**: starts only after the RED gate; establishes the shared Veus draft and positive
  recovery behavior.
- **US3 (P1)**: depends on US1 because it verifies and completes safety/cleanup around the same
  integration. It is required for any acceptable MVP.
- **US2 (P2)**: depends on the safe core from US1+US3, although its test remains independently
  observable as a three-route journey.
- **Full QA/browser**: depends on all three story checkpoints.
- **Final audit**: depends on all validation evidence.

### Mandatory stop conditions

- T010 does not demonstrate the intended RED while Agenda and Comunicats PASS.
- T012 finds any default semantic change in Agenda or Comunicats.
- T023 finds an extra field, restored excluded state, wrong step/review behavior or premature clear.
- T030 finds real frontend `dist/` or a prior QA root; do not delete, continue or claim ownership.
- T031 cannot prove that `<qa-root>/dist` belongs to the immediately preceding Feature 009 build with
  the same realpath, directory type, marker, run id and contractual identity; do not adopt or delete it.
- T042 observes any real frontend `.astro/` change or loses QA-root ownership evidence; STOP/FAIL
  without restoration or cleanup of the ambiguous content.
- Any task requires a path outside the allowlist.
- Browser QA would need real email, Functions, Strapi or external infrastructure.
- Backend changes or any SQLite access occurs.

---

## Parallel Opportunities

None. All tasks are sequential because the gates, harness state and evidence writes to
`specs/009-veu-draft-persistence/tasks.md` have an explicit dependency order. In particular, T029
must finish and record its second deterministic run before T030 starts and records build evidence.

---

## Traceability

### Functional requirements

| Requirements | Primary tasks |
|---|---|
| FR-001–FR-006 | T011, T013–T016, T024–T027 |
| FR-007–FR-011 | T011, T013–T015, T019, T023, T026 |
| FR-012–FR-017 | T006–T009, T018–T023 |
| FR-018–FR-021 | T006, T009, T017, T020, T032 |
| FR-022–FR-023 | T012, T027, T033 |
| FR-024–FR-027 | T021–T023, T030–T038 |

### Acceptance scenarios

| Story scenarios | Primary tasks |
|---|---|
| US1 scenarios 1–5 | T013–T016, T028, T031 |
| US2 scenarios 1–4 | T024–T027, T031 |
| US3 scenarios 1–8 | T017–T023, T028, T032–T033 |

### Success criteria

| Success criteria | Primary tasks |
|---|---|
| SC-001 | T015, T028, T031 |
| SC-002 | T025–T026, T031 |
| SC-003 | T015, T023, T031 |
| SC-004 | T018, T021, T031 |
| SC-005 | T017, T020, T032 |
| SC-006 | T019, T022, T028 |
| SC-007 | T012, T027, T033 |
| SC-008 | T022, T025–T026, T031–T032 |
| SC-009 | T035–T038 |

### QA matrix

| Matrix | Primary tasks |
|---|---|
| QA01–QA06 | T007, T015 |
| QA07–QA11 | T007, T025 |
| QA12–QA18 | T007, T018, T031 |
| QA19–QA26 | T008, T019 |
| QA27–QA31 | T008, T015, T020, T026, T031 |
| QA32–QA39 | T009, T020, T025, T032 |
| QA40–QA43 | T009, T012, T027, T033 |

---

## Implementation Strategy

### Safe MVP

1. Complete Phase 1 and the mandatory RED gate.
2. Complete US1 positive persistence.
3. Complete US3 privacy, corruption and cleanup before treating the MVP as acceptable.
4. Stop and validate US1+US3 independently.
5. Add US2 multilingual continuity.

US1 alone is not releasable because safety/exclusion/cleanup are P1 invariants, not optional polish.

### Incremental checkpoints

1. Baseline → reproducible pre-state.
2. Harness RED → missing Veus behavior proven without touching product.
3. Helper gate → new scope/select/restore rules with synchronous save and Agenda/Comunicats unchanged.
4. Integration gate → exact allowlist, UI reconciliation and success-only clear.
5. Multilingual gate → one literal CA/ES/EN draft.
6. Full QA/build/browser → deterministic functional proof.
7. Final audit → zero scope/infra/data regressions.

## Notes

- Do not mark a task complete by inference; preserve compact command/output evidence.
- Do not mark a QA ID complete from a printed/listed identifier or a shared generic action; each semantic contract requires its specified setup, action and observable assertion.
- Save from `input` and `change` is synchronous for Agenda, Comunicats and Veus; restore occurs before
  listeners, and clear cannot be followed by a write without a later user event.
- `tasks.md` may record evidence during IMPLEMENT; other Feature 009 documents remain read-only.
- Do not commit, push or deploy during IMPLEMENT unless a later human instruction explicitly changes
  that boundary.

---

## Phase 8: Convergence

- [X] T040 Replace every shared multi-ID DOM callback in `scripts/qa/veu-draft-persistence-qa.mjs` with independently attributable setup, action and observable assertion for each semantic QA contract, including a real partial-draft restore for QA03 and all four contractual `tipo_autoria` restore values for QA04, so QA01–QA39 cannot PASS from a generic action or printed identifier, per T007, T015, T028 and T034 (partial)
- [X] T041 Extend the DOM-only QA40 and QA41 regressions in `scripts/qa/veu-draft-persistence-qa.mjs` so Agenda and Comunicats each independently prove valid restore, structurally corrupt discard, invalid/unknown-field behavior and unchanged save/restore/exclusion/clear semantics, per FR-023, SC-007 and T009 (partial)
- [X] T042 Replace the unsafe real-root build/browser transaction in `scripts/qa/veu-draft-persistence-qa.mjs` with the exact plan/quickstart QA-root contract: create an unpredictable ephemeral directory via `mkdtemp` under the frontend; before use record and validate its realpath, normal-directory type, Feature 009 marker, unique run id and contractual identity; copy only `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json` and `package-lock.json`, never backend, SQLite, secrets, persistent data, real `.astro/`, real `dist/`, `.git/`, `.specify/`, `specs/`, `scripts/`, `.env*` or complete `node_modules`; resolve installed dependencies from the parent frontend `node_modules`; run build only as `npm run build -- --root <qa-root>` and preview only as `npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173`; prove all QA `.astro/`, cache and `dist/` stay inside `<qa-root>`, the real `<frontend>/.astro` is never written/restored and real `<frontend>/dist` is never created/deleted/adopted; inventory the real `.astro/` before/after only by existence, tree, type, content/hash and mode, excluding timestamps entirely; in every PASS/FAIL/exception path close browser, Chrome/helpers, preview, CDP, fixtures and listeners first, then remove only the QA root whose full identity remains demonstrably owned; on any ownership discrepancy STOP/FAIL without deleting or restoring anything, per plan/quickstart cleanup and T005, T030, T031, T033, T038 and T039 (partial)

### Historical IMPLEMENT REMEDIATION #2 evidence — T042 superseded by PLAN REMEDIATION #4

- **T040**: every QA01–QA43 DOM ID now has its own registered callback; no `add([...])` multi-ID registration remains. QA03 installs and restores a two-field partial envelope, proves every absent field retains its empty default and verifies the stored bytes are unchanged by restore. QA04 independently creates/restores `""`, `nom_complet`, `nom` and `pseudonim`, asserting the exact value, matching `autor_public` and unchanged storage for each state.
- **T041**: QA40 and QA41 separately execute the shared regression helper with their exact key/scope and scope-specific controls. Each proves exact save envelope, valid restore, invalid/non-string and unknown-field ignore with a valid sibling retained, structural-corruption discard and explicit clear, without changing Agenda or Comunicats product code. QA42/QA43 remain separate DOM-only cases.
- **T042**: `--build` snapshots the complete pre-cycle `.astro` tree as bytes, path/type, mode and timestamps inside the marked owned `dist/`; build failure restores it immediately, while browser validates and consumes that snapshot, removes cycle-created paths, restores preexisting paths and deep-compares the result before deleting owned `dist/`. The final comparison matched all seven baseline paths byte-for-byte and by recorded mtime. Chrome cleanup records the root plus every PID reported by browser-level CDP, signals only the live owned process group, and requires both that group and all 10 observed PIDs to be absent; PID probes use signal `0` only and never signal an unverified identity. The first browser attempt correctly failed on APFS sub-millisecond `utimes` rounding and left the marked `dist/` for safe resumption; the resumed browser PASS restored `.astro` exactly and completed cleanup.
- **Final gates**: `node --check` PASS; full pre/post-browser `--dom` PASS with QA01–QA43 exactly once and observed storage snapshot `{"guiapineda:submission-draft:v1:agenda":"A","guiapineda:submission-draft:v1:comunicat":"C"}`; `--build` PASS with 43 pages and CMS port 49658 released; `--browser` PASS with 28 individually executed cases and CDP port 49708 released; `dist/` absent, 4173 free, temporary profiles absent and `git diff --check` PASS.

### IMPLEMENT REMEDIATION #3 evidence — T042 complete

- The unsafe real-root transaction is gone. The successful cycle used the unpredictable marked root `.veu-009-qa-2KDQWe`, contract `feature-009-isolated-qa-root-v1`, UUID run `6aee91d7-ae7b-421a-a5fd-77030d1b9390`, and the exact six-entry source/config copy list; it did not copy `.git/`, `.specify/`, `specs/`, `scripts/`, `.env*`, full `node_modules`, backend, SQLite, secrets, persistent data, real `.astro/` or real `dist/`.
- `npm run build -- --root <qa-root>` and `npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173` completed in one uninterrupted cycle. Generated `.astro/`, cache and `dist/` were confined to the qa-root. The real `.astro/` manifest was equal before/after by existence, tree, type, size/SHA-256 and mode; timestamp fields are absent from the contract and no restoration occurred. Real `dist/` was absent throughout.
- PASS/FAIL/exception cleanup validates marker, run id, realpath, normal-directory type and device/inode before deletion. The successful `finally` closed fixtures/listeners, target/CDP, 10 observed Chrome PIDs and owned group, and preview before removing the profile and qa-root. Node-only rebind and residue checks confirm ports 4173/49936/49960 free and no owned generated resource remains.
