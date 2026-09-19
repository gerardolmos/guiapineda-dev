---

description: "Dependency-ordered tasks for Agenda multilingual draft persistence"
---

# Tasks: Persistencia de borradores multidioma de Agenda

**Input**: Design documents from `specs/001-agenda-draft-persistence/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/agenda-draft-contract.md`, `quickstart.md`, Constitution v1.0.0

**Tests**: No automated test framework is added by this feature. Validation tasks use the existing
frontend build, static review and the manual scenarios defined in `quickstart.md`.

**Organization**: Tasks are grouped by user story. Existing code in `src/lib/submissionDraft.ts`
and `src/lib/agendaSubmissionFlow.ts` is inspected and adjusted in place; it is not replaced from
scratch without justification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it is read-only or validates a different concern without
  depending on another incomplete task.
- **[Story]**: Maps the task to US1, US2 or US3 from `spec.md`.
- Every implementation task names one of the two approved application files.

## Phase 1: Setup and Baseline

**Purpose**: Establish the exact preserved implementation and stop before edits if repository state
or required scope differs from the approved PLAN.

- [X] T001 [P] Inspect and record the exact reusable behavior and gaps in `src/lib/submissionDraft.ts` against `specs/001-agenda-draft-persistence/contracts/agenda-draft-contract.md` before changing it
- [X] T002 [P] Inspect and record initialization, restore, validation, counters, button, reset and successful-submit behavior in `src/lib/agendaSubmissionFlow.ts` against `specs/001-agenda-draft-persistence/plan.md` before changing it
- [X] T003 Verify frontend and backend Git state and the approved two-file boundary in `src/lib/submissionDraft.ts`, `src/lib/agendaSubmissionFlow.ts`, `netlify/functions/`, and `../guiapineda-strapi/`; stop for human approval if required work falls outside that boundary

**Checkpoint**: Baseline confirmed; no unexplained pre-existing edit or scope conflict is hidden.

---

## Phase 2: Foundational Draft Adapter

**Purpose**: Make the existing browser-draft helper safe, explicit and reusable by all three Agenda
routes. This phase blocks every user story.

**⚠️ CRITICAL**: No Agenda integration task begins until the adapter satisfies the internal contract.

- [X] T004 Replace the raw open-ended draft types in `src/lib/submissionDraft.ts` with the version-1 `AgendaDraftEnvelope` contract: literal `version: 1`, literal `scope: "agenda"`, a non-array `fields` object, and string-only values
- [X] T005 Implement strict envelope parsing and allowlist projection in `src/lib/submissionDraft.ts`: clear malformed/wrong-version/wrong-scope payloads, ignore unknown or removed fields, leave missing controls unchanged, ignore non-string allowed values without coercion, and restore without synthetic events
- [X] T006 Adjust safe save and lifecycle handling in `src/lib/submissionDraft.ts` to use the common `guiapineda:submission-draft:v1:agenda` key, read only caller-approved fields, catch all storage/serialization/removal failures, clear on native reset, and add no TTL, unload cleanup or network behavior

**Checkpoint**: The helper cannot persist a field unless Agenda explicitly approves its name, and
storage failure cannot break the form.

---

## Phase 3: User Story 1 — Continue Draft Across Languages (Priority: P1) 🎯

**Goal**: Preserve the latest approved Agenda content through CA -> ES -> EN -> CA and restore it
with validation, counters and controls in a coherent state.

**Independent Test**: Fill all approved content fields in CA, navigate CA -> ES -> EN -> CA in the
same tab, edit values between languages, reload once, and verify the latest values plus derived UI
state at every step.

### Implementation for User Story 1

- [X] T007 [US1] Declare the closed 13-name allowlist (`titol`, `resum`, `descripcio`, `organitzador`, `data_inici`, `hora_inici`, `data_final`, `hora_final`, `lloc`, `adreca`, `enllac_oficial`, `nombre_contacto`, `email_contacto`) and pass scope `agenda` to the existing helper from `src/lib/agendaSubmissionFlow.ts`
- [X] T008 [US1] Reorder the existing initialization in `src/lib/agendaSubmissionFlow.ts` so allowed values restore synchronously before `initEmailVerificationController`, autosave starts without overwriting restored data, and no synthetic `input` or `change` event is dispatched
- [X] T009 [US1] Add one silent post-restore reconciliation in `src/lib/agendaSubmissionFlow.ts` that updates date minima and current validity without clearing invalid restored values, refreshes character counters, keeps the image/review step in its initial visual state, and recomputes Continue and Submit states without focus or validity popups
- [X] T010 [US1] Execute the CA -> ES -> EN -> CA, latest-edit, same-tab reload, counters, date-validation, Continue and review checks from `specs/001-agenda-draft-persistence/quickstart.md` against the implementation in `src/lib/agendaSubmissionFlow.ts`

**Checkpoint**: User Story 1 is independently demonstrable across all three routes, but is not a
safe MVP until the P1 security story below also passes.

---

## Phase 4: User Story 2 — Separate Draft from Security State (Priority: P1)

**Goal**: Preserve contact name/email while proving that image, consent, honeypot, tokens,
verification and every non-approved field remain outside the draft.

**Independent Test**: Populate content, contact, image, consent, honeypot and verification controls;
change language; verify only the 13 approved strings return and email verification starts fresh.

### Implementation for User Story 2

- [X] T011 [US2] Audit and adjust the allowlist integration in `src/lib/agendaSubmissionFlow.ts` so `nombre_contacto` and `email_contacto` restore while `imatge`, `bot-field`, `aceptacion_privacidad`, hidden metadata, tokens, verification state, bearer, HMAC, secrets and future unapproved controls cannot enter the envelope
- [X] T012 [US2] Preserve the existing verification authority in `src/lib/agendaSubmissionFlow.ts`: initialize it after the email string is restored, require token-empty and `data-email-verified="false"` startup, keep privacy unchecked and Submit disabled, and avoid changes to `src/lib/emailVerificationController.ts`
- [X] T013 [P] [US2] Inspect the stored envelope and the 13-field projection using `specs/001-agenda-draft-persistence/contracts/agenda-draft-contract.md`; verify no forbidden key, file data, derived UI state or secret appears in `sessionStorage`
- [X] T014 [P] [US2] Execute the contact name/email, image, privacy, honeypot, fresh-email-verification and Submit-state scenarios in `specs/001-agenda-draft-persistence/quickstart.md` across the CA, ES and EN Agenda routes

**Checkpoint**: User Stories 1 and 2 form the minimum safe P1 delivery: multilingual recovery works
without persisting or reusing security state.

---

## Phase 5: User Story 3 — Safe Completion and Recovery (Priority: P2)

**Goal**: Clear at the approved lifecycle boundaries and keep Agenda usable with failed storage,
corrupt/incompatible data or failed submission.

**Independent Test**: Exercise reset, failed and successful submission, malformed/wrong-version/old
payloads, blocked storage, same-tab reload and natural tab-session end; confirm correct cleanup or
graceful degradation in each case.

### Implementation for User Story 3

- [X] T015 [US3] Add post-native-reset reconciliation in `src/lib/agendaSubmissionFlow.ts` so the existing helper clears storage and Agenda then resets counters, date constraints, image preview/error, form/review step, validation messages and Continue/Submit states without adding a discard button
- [X] T016 [US3] Preserve and verify successful-submit cleanup in `src/lib/agendaSubmissionFlow.ts`: call the helper clear operation only after the existing verified transport resolves success, retain the draft on failure, and make no change to `src/lib/netlifySubmission.ts` or `netlify/functions/`
- [X] T017 [US3] Review `src/lib/submissionDraft.ts` for the complete failure matrix: unavailable/blocked/quota-failing `sessionStorage`, malformed JSON, invalid envelope, wrong version/scope, unknown old fields, missing controls and non-string values must never block fill, review or submit and must not introduce time-based or unload cleanup
- [X] T018 [P] [US3] Execute malformed JSON, wrong-version envelope, unknown-field, type-invalid-field and unavailable-storage scenarios from `specs/001-agenda-draft-persistence/quickstart.md` against `src/lib/submissionDraft.ts`
- [X] T019 [P] [US3] Execute the current frontend-scope reset, controlled failed/successful response, cleanup-after-success, same-tab survival and natural tab-session-end scenarios from `specs/001-agenda-draft-persistence/quickstart.md` against `src/lib/agendaSubmissionFlow.ts`; defer live infrastructure E2E to predeployment

**Checkpoint**: All three user stories are independently testable and the complete lifecycle meets
the SPEC without expanding to another form or repository.

---

## Phase 6: Validation and Constitutional Review

**Purpose**: Apply project quality gates and prove final scope before considering implementation
complete.

- [X] T020 [P] Run `git diff --check` and statically review the final diff against `specs/001-agenda-draft-persistence/contracts/agenda-draft-contract.md`, confirming the exact 13-field allowlist and absence of generic field discovery, TTL, unload cleanup, logging or network persistence
- [X] T021 [P] Run the existing frontend build defined in `package.json` with `npm run build`, record the result, and do not add test, lint or check dependencies as part of this feature
- [X] T022 Execute the complete regression matrix in `specs/001-agenda-draft-persistence/quickstart.md`, documenting every completed CA/ES/EN, contact, image, verification, reset, corrupt-data, successful/failed-submit and visual-state check plus any validation that could not run
- [X] T023 Review final frontend/backend Git status and Constitution v1.0.0 in `.specify/memory/constitution.md`; confirm application changes are limited to `src/lib/submissionDraft.ts` and `src/lib/agendaSubmissionFlow.ts`, no `netlify/functions/` or `../guiapineda-strapi/` file changed, and stop for human approval rather than accepting any scope or constitutional conflict

**Checkpoint**: Diff, build, functional evidence, Git state and Constitution review are complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately; T001 and T002 may run in parallel, then T003 gates scope.
- **Phase 2 — Foundational**: Depends on T001-T003 and blocks all user stories; execute T004 -> T005
  -> T006 in order because they modify the same helper contract.
- **Phase 3 — US1**: Depends on Phase 2; execute T007 -> T008 -> T009 -> T010.
- **Phase 4 — US2**: Depends on Phase 2 and shares the Agenda flow with US1. Its acceptance is
  independently testable, but sequential execution after T009 avoids same-file conflicts.
- **Phase 5 — US3**: Depends on Phase 2; T015 also depends on the reconciliation created by T009 and
  T016 depends on the helper lifecycle from T006.
- **Phase 6 — Validation**: Depends on all selected user stories. T020 and T021 may run in parallel;
  T022 follows the complete implementation and T023 is the final gate.

### User Story Dependencies

```text
Setup -> Foundational -> US1 (P1) -----> US2 (P1) --+
                         |                           |
                         +-----------> US3 (P2) ----+-> Final validation
```

- **US1**: Delivers shared multilingual restoration and visual reconciliation.
- **US2**: Uses the same foundation but validates an independent security outcome; it is mandatory
  before treating the P1 increment as safe.
- **US3**: Reuses US1 reconciliation for reset and the foundational helper for recovery/cleanup.

### Parallel Opportunities

- T001 and T002: independent baseline inspection of different approved files.
- T013 and T014: storage-contract inspection and user-facing security validation after T012.
- T018 and T019: corrupt/storage failure validation and lifecycle validation after US3 integration.
- T020 and T021: static/diff validation and frontend build.
- Implementation tasks that modify `src/lib/agendaSubmissionFlow.ts` are intentionally sequential;
  parallel editing would create avoidable conflicts and weaken reviewability.

## Parallel Examples

### Setup

```text
Task T001: Audit src/lib/submissionDraft.ts against the storage contract.
Task T002: Audit src/lib/agendaSubmissionFlow.ts against initialization and lifecycle design.
```

### User Story 1

No implementation task is parallelized: T007-T009 modify the same orchestration file. Run T010 only
after those changes so its independent CA/ES/EN test evaluates a coherent increment.

### User Story 2

```text
Task T013: Inspect the stored envelope and forbidden-key absence.
Task T014: Run image/contact/privacy/honeypot/verification behavior manually.
```

### User Story 3

```text
Task T018: Validate corrupt, incompatible and unavailable storage handling.
Task T019: Validate reset, submission cleanup and tab-session lifecycle.
```

## Implementation Strategy

### Safe MVP First (US1 + US2)

1. Complete Phase 1 baseline and scope gate.
2. Complete Phase 2 safe adapter foundation.
3. Complete Phase 3 multilingual restoration.
4. Complete Phase 4 security separation.
5. **STOP AND VALIDATE** US1 + US2 together; US1 alone is not a releasable MVP because US2 is a P1
   constitutional privacy/security gate.

### Incremental Delivery

1. Foundation -> validate storage contract in isolation.
2. US1 -> demonstrate CA/ES/EN restoration and visual coherence.
3. US2 -> prove minimization and fresh verification; safe MVP reached.
4. US3 -> add full cleanup and recovery lifecycle.
5. Final validation -> build, complete manual matrix, scope and Constitution gate.

### Stop Conditions

Stop and request human approval before proceeding if any task appears to require changes to:

- `src/components/AgendaSubmissionFlow.astro` or other markup;
- `src/lib/emailVerificationController.ts` or `src/lib/netlifySubmission.ts`;
- `netlify/functions/**`, `../guiapineda-strapi/**` or server security;
- another form, dependency, service or infrastructure;
- the approved 13-field list, lifecycle or verification behavior.

## Notes

- No task authorizes opportunistic refactoring, dependency installation, commit or push.
- No automated test task is introduced because the repository has no approved test framework.
- Mark a task complete only after its stated file change or validation evidence is verified.
- Do not create or modify application files outside the two approved TypeScript files.

## IMPLEMENT execution record — 2026-09-19

### Baseline (T001-T003)

- Frontend HEAD: `6a10a559d74182a471a68a2298b748a001591c3f`, branch `main`.
  Initial Git status: only pre-existing untracked `specs/`; application files clean.
  Backend Git status: clean.
- Initial SHA-256 of `src/lib/submissionDraft.ts`:
  `d47fbfb64324747b9a41b31b967b8df53e4b9f999882c00d8a755f2f70fdf1e4`.
- Initial SHA-256 of `src/lib/agendaSubmissionFlow.ts`:
  `6a1ce65de7ebcab9dd8e25ceadca7e860fb39f45aaf65039a6f8628d14a1b727`.
- Reused: common storage key, input/change listeners, safe storage access, reset clear,
  restoration before verification, and clear after awaited successful transport.
- Corrected: broad control selection (including honeypot), unversioned payload, missing schema
  guards, restored date minimum and post-reset UI reconciliation. Removed obsolete generic
  checkbox/radio/multiselect serialization because the contract authorizes strings only.

### Implementation and automatic evidence

- T004-T009, T011-T012, T015-T017 completed within the two approved source files.
  Closed 13-name allowlist, version-1 envelope, own-property string projection and safe storage
  failures; no synthetic restore events, new service, dependency, TTL or discard button.
- Agenda now reconciles date constraints, counters, image/review UI and buttons at startup and
  after native reset. Length constraints are read from existing controls and explicitly applied
  to programmatically restored text; messages are available in CA/ES/EN.
- Existing verification controller and verified transport are unchanged. Their inspected contracts
  reset verification/token at initialization and reject failed submissions respectively.
- 21 isolated adapter checks passed using Node and DOM/storage doubles: exact projection/contact
  inclusion, shared key/latest values, malformed/incompatible/legacy envelopes, partial and
  non-string fields, missing controls, forbidden input types, reset/clear and storage failures.
- 8 isolated flow checks passed using DOM/controller/transport doubles: restored email before
  controller initialization, fresh verification/disabled Submit, invalid dates retained,
  counters/review state, short/long restored text, post-reset UI, pending/success cleanup and
  failed-submit preservation. The logged submission error in the failure case was intentional.
- These isolated checks add no files or dependencies and do NOT establish browser/E2E acceptance
  or prove real verification/submission. TypeScript was stripped with Node for the flow harness;
  this is not a TypeScript typecheck. Direct `node --check` was unsuitable for the helper's TS.
- T020: `git diff --check` passed; final source diff reviewed for the exact allowlist, absence of
  storage logging/network/TTL/unload cleanup, and preservation of shared/server code.
- T021: `npm run build` executed twice, including an approved run outside the sandbox.
  Both FAILED (exit 1) with `fetch failed` while generating static routes, after Vite entrypoint
  compilation. The application reads CMS data during static generation; a read-only connectivity
  probe also found no listener at localhost:1337. No backend was started or configuration changed.
  The checkbox records execution/result, NOT a successful build. A successful full build remains
  a delivery gate.
- T023: final source changes limited to the two authorized files; only this task artifact edited
  in `specs/`. Backend remains clean. Constitution v1.0.0 reviewed: approved temporary contact PII,
  multilingual behavior and security separation preserved; no backend/Functions/shared controller/
  transport/markup/dependency/configuration changes. No commit, push or CONVERGE.

### Pending human/browser validation — implementation not fully accepted

T010, T013, T014, T018, T019 and T022 remain unchecked. Their browser scenarios were not executed;
isolated doubles are supplementary evidence only. They are deferred under the user's explicit
instruction to identify manual validations that cannot be verified, not reported as passing.

Follow `quickstart.md` scenarios 1-8:

1. In one tab, fill all 13 fields in CA, then ES -> EN -> CA; edit in ES and reload once.
   Inspect values, storage envelope, counters, dates, Continue and review.
2. Select an image, accept privacy and verify email in an available approved environment;
   change language and confirm image/consent/token/verification/honeypot do not restore.
3. Call the existing form's `reset()`; check cleared storage, initial UI and absence on reload.
4. Inject malformed JSON, wrong version, unknown and non-string fields; reload. Repeat filling/
   review with storage blocked and record browser/mode.
5. In an existing environment with the verified endpoint, confirm failure preserves the draft
   and real success clears it. Do not change backend or Functions to enable this test.
6. Verify same-tab survival and a fresh independent session after ending the original tab session.
   Browser-native session recovery behavior is not replaced by custom expiry.

Repeat the frontend build when the existing CMS dependency is reachable. No change outside the
approved scope is authorized by this pending validation.

## IMPLEMENT continuation — 2026-09-19

This record supersedes the earlier pending-build and T010 status above. The application
implementation was preserved without edits; only this task record changed during continuation.

### Baseline and technical validation

- Frontend remains on `main`, HEAD `6a10a559d74182a471a68a2298b748a001591c3f`.
  The two existing modified application files and untracked `specs/` match the previous record.
  Backend was clean at entry and final inspection.
- Requirements checklist: 16 checked, 0 unchecked. No extension hooks file exists.
- `npm run build`: PASS, exit 0, 488 static pages generated in 13.50 seconds with Strapi available.
  No dependency, backend or configuration changes were needed.
- `git diff --check`: PASS. Full source diff reviewed again against the contract.
- `git diff --name-only HEAD`: exactly `src/lib/agendaSubmissionFlow.ts` and
  `src/lib/submissionDraft.ts`. No staged changes. Markup, other forms, shared verification,
  transport, Functions, dependencies and infrastructure remain unchanged in Git.
- No new unit suite or typecheck was run. The previous isolated checks remain historical evidence,
  not newly executed tests and not substitutes for the browser cases below.

### Browser evidence actually obtained

Environment: Codex in-app browser, built site served at `http://127.0.0.1:4173` using the existing
Astro preview command. Initial sandboxed preview exited before readiness; the approved external
retry started successfully. No application change was made to resolve it.

- T010 PASS: filled all 13 approved controls with synthetic data; navigated via language links
  CA -> ES -> EN -> CA in the same tab. Changed title, summary, both dates and email in ES.
  Latest content survived navigation and same-tab reload. The restored contact email was directly
  visible in review text (`agenda-edit@example.com`), although input snapshots omit email values.
- Review was opened in EN, CA and ES and showed all 13 latest values. Initial/restored form step,
  Continue enabled for valid values, and summary/description counters were observed. Counters
  changed from 70/118 to 78/118 with the summary edit and survived navigation/reload.
- Restored past start date `2020-01-01` remained visible and disabled Continue. Restored end date
  `2026-10-21` before start `2026-10-22` remained visible and disabled Continue. Restored same-day
  end time `17:00` before start `18:00` displayed the Catalan order error and disabled Continue.
  Initial focus remained on the page after reload. Correcting dates/time re-enabled Continue.
  Observed min attributes: start `2026-09-19`, end `2026-10-22` for that restored start date.
- T014 PARTIAL: contact values restored; review in CA/ES/EN showed unchecked consent, the request
  for email verification and disabled Submit. No email code was requested and no submission sent.
  This does not prove exclusion of a previously verified token or previously selected image.
- T019 PARTIAL: same-tab survival demonstrated. Closed the populated tab and opened an independent
  tab: empty form, zero counters, Continue disabled. This demonstrates only that browser session
  case, not every browser's session recovery behavior.

### Remaining human browser checks — do not infer PASS

- T013: DevTools > Application > Session Storage, inspect
  `guiapineda:submission-draft:v1:agenda` after editing. Require exactly version 1, scope agenda,
  and the 13 approved string fields. Populate excluded controls in a disposable test session and
  verify no image/file/preview, consent, honeypot, metadata, token/code/verified state or secret
  is written. Static allowlist review is complete; stored-envelope inspection is not.
- T014: on CA/ES/EN select an image and confirm preview, accept consent and complete real email
  verification in an existing approved environment. Change language: contact must remain, but
  file/filename/preview and consent must reset; honeypot/code/token must be empty and verification
  false. Submit must require a new verification and new consent.
- T018: execute quickstart scenarios 6 and 7 in DevTools: malformed JSON, wrong version/scope,
  legacy/invalid envelope, unknown fields and non-string values; reload after each. Confirm
  incompatible data is removed, valid strings alone restore, and fill/review remain usable.
  Repeat fill, validation, review and real submission with storage blocked; record browser/mode.
- T019: run `document.querySelector('[data-agenda-submission-flow]').reset()` after populating
  and entering review. Confirm storage deletion, default fields, counters, dates, image/error,
  verification/consent and buttons, then reload to prove no recovery. With the existing verified
  endpoint, observe an actual failed submission preserving the draft, then confirmed success and
  success navigation clearing it; return in the same tab and confirm absence.
- T022: finish the outstanding matrix above and repeat invalid restored text lengths, email/URL
  validity and date/time visual messages across CA/ES/EN. Do not equate successful build or the
  observed subset with complete regression acceptance.

The browser API used supports UI actions and read-only DOM inspection, not the DevTools storage
mutations/reset required above. The static preview does not establish a working email-verification
and submission environment. No endpoints, security state or shared code were changed to simulate
acceptance. T013, T014, T018, T019 and T022 remain unchecked; 18/23 tasks are complete.
No commit, push or CONVERGE was performed. No scope conflict or new application defect was found
in the executed checks; full acceptance remains pending the listed evidence.

### Additional validation attempt — 2026-09-19

- Opened the built Agenda page and Chrome DevTools in a separate local window. Repeated
  Computer Use interruptions reported that the user changed Chrome; subsequent observations
  showed another window active. The console inspection did not produce a verified result.
  No additional task is marked complete: T013, T014, T018, T019 and T022 remain pending.
- Actual sessionStorage contents, image/consent exclusion, corrupt payloads, blocked storage and
  native reset were NOT verified in this attempt. The previous successful navigation/reload and
  independent-tab evidence remains valid but was not repeated here.
- Read-only inspection confirms verified Agenda transport posts to `/api/submissions/agenda`.
  Verification Functions use Upstash Redis and Resend; the submission Function forwards to
  Strapi. Static Astro preview does not run those Functions. No verification request or submission
  was made, no real email sent, and no server data created by these tests.
- Real failure/success acceptance requires a human-controlled environment with the existing
  Functions, an authorized test mailbox and an explicitly disposable proposal: verify the email,
  observe a failed attempt retaining the draft, then approve a real successful attempt and confirm
  draft removal after returning. Do not run this against real services without that intervention.
- No source changes. Source SHA-256 values at entry:
  `submissionDraft.ts`: `aac53d6f5c9a25abca0b9a750766dc89d8c8fbf138996cd2b332697fd7dd532a`;
  `agendaSubmissionFlow.ts`: `bf67bf88d583bedcc7e689a7622937c51ba9cde521f9abfcc94472f5a23506e3`.
  Build was not repeated because sources were unchanged. Full validation remains incomplete;
  CONVERGE was not run.


### Controlled real-browser validation — 2026-09-19 (latest status)

Supersedes the earlier Computer Use blockage. Used installed Chrome headless in an isolated
`/private/tmp/agenda-qa-isolated-20260919` profile, driven by a temporary Node/CDP script.
No dependency installed, no application/backend/markup/configuration changes. All page requests
outside the local preview were blocked; every `/api/` request was intercepted before reaching any
server. Verification responses used a synthetic challenge/code/token; submission responses were
503 or 200 `{ok:true}` fixtures. This is real-browser frontend evidence, not live-service E2E.

- **T013 completed**: directly read real sessionStorage and asserted exact deep equality with
  `{version:1,scope:"agenda",fields:{...}}`, containing exactly the 13 authorized strings:
  `titol`, `resum`, `descripcio`, `organitzador`, `data_inici`, `hora_inici`, `data_final`,
  `hora_final`, `lloc`, `adreca`, `enllac_oficial`, `nombre_contacto`, `email_contacto`.
  Synthetic contact: `Persona QA`, `qa@example.com`. No file/image, honeypot, consent, token,
  code, verified state, secret, HMAC, bearer, environment or arbitrary extra key was serialized.
- **T014 completed for the frontend boundary** in CA, ES and EN: selected a real temporary PNG
  with the browser file-input API; observed files.length=1 and a blob preview. Used the actual
  verification controller with intercepted responses, obtaining token `qa-token-not-real`, code
  `123456`, verified=true; clicked consent and observed Submit enabled. Populated honeypot and
  dispatched input. Storage still matched exactly the 13-field envelope. After language navigation,
  all authorized fields restored; file count=0, preview=null, filename/honeypot/token/code empty,
  consent=false, verified=false, Submit disabled. No real email was requested or delivered.
- **T018 completed**: malformed JSON, version 999, wrong scope, array fields and legacy raw payload
  were removed on reload; fields remained empty and subsequent valid filling enabled Continue.
  A compatible mixed payload restored the allowed title, ignored numeric summary and unauthorized
  honeypot/consent/token/verified/secret/HMAC/bearer/env/legacy/image values. Unknown keys remained
  inert in the injected stored payload until the next save, which rewrote exactly the allowlist;
  this matches the contract's ignore-on-read policy.
- Unavailable storage tested before application initialization by a temporary DevTools-injected
  sessionStorage getter throwing SecurityError. Filling, validation, review, fixture verification,
  reset and simulated successful submission worked. Separately injected getItem/setItem/removeItem
  failures with QuotaExceededError: filling/review/reset remained functional. Instrumentation was
  removed after each case; no source file was altered.
- **T019 frontend cases passed**: native reset from review cleared fields/storage, token/code,
  consent and counters, restored the form step and disabled Continue/Submit; reload did not recover
  the draft. Additional reset with selected PNG cleared file/preview/filename. Reload preserved
  allowed values before reset. Independent new tab had no draft; closing the populated session and
  opening a fresh tab likewise produced no draft. Static review confirms no TTL/discard button;
  existing pagehide only revokes the image object URL, not draft storage.
- Actual browser submit handler + unchanged transport under intercepted **503** retained the draft
  and displayed error; retry with intercepted **200 `{ok:true}`** navigated to `/enviat/`, removed
  storage and returned to an empty form. These are explicitly simulated server outcomes, not real
  accepted requests. No Function, Resend, Redis or Strapi was invoked by the test submissions.
- 22 controlled browser check groups passed (20 main + 2 targeted extra), scripts exited 0.
  Temporary reproducible scripts/evidence: `/private/tmp/agenda-browser-qa.mjs`,
  `/private/tmp/agenda-browser-qa-results.json`, `/private/tmp/agenda-browser-qa-extra.mjs`,
  `/private/tmp/agenda-browser-qa-extra-results.json`. These are outside the repository.

**Current total: 22/23. T019 is complete for the current frontend scope; only T022 remains
unchecked.** The actual browser submit handler and unchanged transport already demonstrated draft
retention for a controlled non-success response and cleanup/navigation for an explicit `{ok:true}`
response, alongside reset and tab-session lifecycle behavior.

GUIAPINEDA has no deployed environment. The only existing Netlify environment,
`https://gp-dev-k7m4x9q2.netlify.app/`, is an older private Resend/Upstash/Functions test page and
does not contain GUIAPINEDA or its Agenda form. Therefore live verification/submission E2E is
formally deferred until predeployment; it is an infrastructure acceptance gate, not an application
defect or functional work pending in this feature, and no deployment is justified solely to run it.
T022 retains the outstanding full CA/ES/EN invalid text/email/URL visual matrix; the previous and
current browser evidence covers the specific cases recorded, not every variation.

No defect found in executed checks. Application SHA-256 values match the previous record;
`git diff --check` passed and backend Git is clean. Build not rerun: no source changes since the
488-page successful build. This scope correction updated only `tasks.md` and `quickstart.md`; no
application or infrastructure file changed. No commit, push or CONVERGE.

### T022 final visual-state matrix — 2026-09-19

Executed only the outstanding CA/ES/EN matrix in local headless Chrome against the existing Astro
preview. Chrome used an isolated temporary profile; external traffic was blocked and no API,
email, submission or deployed infrastructure was contacted.

- In each route, restored from `sessionStorage` and retained visibly: a 3-character title, a
  401-character summary, invalid email and URL strings, a past start date and same-day `18:00` ->
  `17:00` times. The stored version-1 Agenda envelope and every restored value matched exactly.
- CA/ES/EN produced the expected localized minimum-8, maximum-400, past-date and time-order
  `validationMessage` values. Email and URL both had non-empty native messages and
  `validity.typeMismatch === true`.
- Continue remained disabled for the initial combined invalid state and after correcting all fields
  except time. The localized inline time-order message was present in each language.
- After correcting title, summary, email, URL, date and final time to `19:00`, every validity message
  cleared, Continue enabled, and the real flow reached review with the corrected title in CA, ES
  and EN.
- Focused runner: `/private/tmp/agenda-t022-matrix.mjs`. Result: PASS for all three routes. This
  completes the only matrix missing from the previously recorded regression evidence; no earlier
  scenario was repeated and no human visual check remains necessary.

**Final task total: 23/23. T022 is complete.** Live infrastructure E2E remains the separately
documented predeployment gate and is not pending functional work in this feature. No application or
infrastructure file changed for T022.
