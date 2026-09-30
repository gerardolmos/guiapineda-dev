---

description: "Implementation tasks for Millorem safe multilingual draft persistence"
---

# Tasks: Millorem — Safe Multilingual Draft Persistence

**Input**: Design documents from `/specs/011-millora-draft-persistence/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`,
`checklists/requirements.md` (16/16 PASS)

**Tests**: Feature 011 requires a persistent RED-first harness and the complete QA01–QA45 matrix.
Every ID needs its own setup, action and assertions; output labels without execution, hardcoded PASS
or a shared callback that hides distinct contracts are forbidden.

**Organization**: Tasks follow the mandatory dependency chain. No task is marked `[P]` because the
harness, RED baseline, three shared product files, isolated browser lifecycle and evidence ledger have
strong ordering and ownership dependencies.

**Remediation status**: IMPLEMENT REMEDIATION: COMPLETE. PLAN REMEDIATION #5 adopta navegación
caller-controlled opcional y PLAN REMEDIATION #6 corrige I1/A1/U1/O1. TASKS REMEDIATION #4 y TASKS
REMEDIATION #5: COMPLETE. El ANALYZE REMEDIATION autorizante fue PASS 0/0/0/0. T001–T042 permanecen
continuas, con 42 tareas, 42 `[X]`, 0 `[ ]` y 0 `[P]`; toda tarea reabierta se cerró con evidencia
RED/GREEN nueva y ningún PASS histórico sustituyó esa ejecución. No se ejecutó ANALYZE, CONVERGE,
commit, push ni deploy durante IMPLEMENT REMEDIATION.

## Closed IMPLEMENT allowlist

Product — modify exactly:

1. `src/lib/submissionDraft.ts`
2. `src/lib/milloraSubmissionFlow.ts`
3. `src/lib/netlifySubmission.ts`

QA — modify exactly:

4. `scripts/qa/millora-draft-persistence-qa.mjs`

SDD writable during IMPLEMENT:

5. `specs/011-millora-draft-persistence/tasks.md`

Everything else is read-only. `spec.md`, checklist, PLAN artifacts, component Astro, routes,
translations, verification, Agenda, Comunicats, Veus, Foto del Mes, backend, `.astro/` real and
`dist/` real are not writable. Any demonstrated need for another file requires STOP and return to
PLAN before changing it. `src/lib/netlifySubmission.ts` is writable and must change minimally; it is
not part of the byte-identical boundary. `src/components/MilloraSubmissionFlow.astro`, routes,
`src/lib/emailVerificationController.ts` and the Agenda/Comunicats/Veus/Foto del Mes flows remain
protected, read-only and byte-identical.

---

## Phase 1: Setup and Baseline

**Purpose**: Establish exact repositories, file fingerprints, environment and success boundary
before creating QA or changing product.

- [X] T001 Re-record frontend branch, HEAD/origin, ahead/behind, staged/tracked/untracked state, `dist/` presence, Feature 011 artifact inventory and exact five-path IMPLEMENT allowlist in `specs/011-millora-draft-persistence/tasks.md`; require `main` at `9ec4bcc099c3b67775665aa1114d393403eda7fb`, ahead/behind `0/0`, staged `0`, and name `src/lib/netlifySubmission.ts` as the sole newly writable product path from PLAN REMEDIATION #5
- [X] T002 Record SHA-256 fingerprints for `src/lib/submissionDraft.ts`, `src/lib/milloraSubmissionFlow.ts`, `src/components/MilloraSubmissionFlow.astro`, `src/lib/emailVerificationController.ts` and `src/lib/netlifySubmission.ts`; confirm `scripts/qa/millora-draft-persistence-qa.mjs` is absent and no product path is staged in `specs/011-millora-draft-persistence/tasks.md`
- [X] T003 Inspect read-only `src/lib/submissionDraft.ts`, `src/lib/milloraSubmissionFlow.ts`, `src/components/MilloraSubmissionFlow.astro`, `src/templates/MilloraSubmissionPage.astro` and the three Millorem route files; record helper scope/envelope/events, eight-field contract, real control types/limits, restore order, first-step defaults, `pageshow`, derived UI and absence of general reset in `specs/011-millora-draft-persistence/tasks.md`; if code contradicts PLAN, STOP before QA or product
- [X] T004 Record backend branch, HEAD/origin, ahead/behind and clean state from `../guiapineda-strapi` without opening data; record in `specs/011-millora-draft-persistence/tasks.md` that backend is untouched and SQLite access/reads/hashes/metadata/sidecars/commands/schema changes/migrations are all `none`
- [X] T005 Re-audit read-only `submitVerifiedSubmissionForm(...)` in `src/lib/netlifySubmission.ts` and all callers in `src/lib/{agendaSubmissionFlow,comunicatSubmissionFlow,veuSubmissionFlow,fotoMesSubmission,milloraSubmissionFlow}.ts`; record current behavior `HTTP/JSON success → minimum wait → location.assign(successUrl) → resolve` and the unimplemented PLAN REMEDIATION #5 contract `SubmissionOptions.navigation: "automatic" | "caller"`, default `navigation ?? "automatic"`, where automatic preserves the current single navigation and caller returns control after confirmed success/wait without navigating; record Commerce as non-caller, keep Agenda/Comunicats/Veus/Foto del Mes read-only, and leave all executable proof unsatisfied until T015/T016

### Evidence — T001–T005

- **T001**: Fresh PRE PASS on `main`; `HEAD == origin/main == 9ec4bcc099c3b67775665aa1114d393403eda7fb`, ahead/behind `0/0`, staged `0`, real `dist/` absent, no prior qa-root/profile/listener/process. The exact five writable paths are the three product modules, the Feature 011 harness and this `tasks.md`; `src/lib/netlifySubmission.ts` is writable.
- **T002**: baseline SHA-256: helper `deb0e4c700d0c566eb5ced86abb678ea390717dd1e560d88657bb5aa152e6d36`; flow `584f521e621a9b50d9cde04c4d8afa3ded1bd19f10db55961ce63be0dca47d37`; component `5ad01c00f3a2756c3eaa032fec74a83171b6936da1c623b3f9517d8fc5783ff6`; verification controller `68a2cfe86423a99757f6e70de82f34f9b5060993e921acbd73286f21975ec439`; transport `6298214c071db8a3a05d467ac5a1a50c6cc398b08fc4f74c36bf895acc09c0b6`. Harness absent; no product path staged.
- **T003**: helper uses envelope v1, keys `guiapineda:submission-draft:v1:<scope>`, restores before `input`/`change` listeners and supports strict radios/select/text/email with predicates and fail-open storage. Millorem exposes the exact eight approved controls and current maxima 100/120/280/6000/180; its three locale routes share one component/controller. Current markup starts on context; controller derives alias visibility, `autor_public`, validation, counters, reading time, preview and review, and has a `pageshow` path but no general reset/discard action. PLAN is compatible; draft integration is the intended missing behavior.
- **T004**: backend `main`; `HEAD == origin/main == 47ca26a0a54fd1c0193afd659b6ba3657b264793`; ahead/behind `0/0`; clean. Backend untouched. SQLite access: none; reads: none; hashes: none; metadata: none; sidecars: none; commands: none; schema changes: none; migrations: none.
- **T005**: Fresh read-only audit confirmed current `submitVerifiedSubmissionForm(...)` performs endpoint/FormData/HTTP/JSON/minimum-wait then one internal `location.assign` and returns `Promise<void>`; Agenda/Comunicats/Veus/Foto del Mes omit an option and consume no return value, Commerce is not a caller, and Millorem obtains the contractual `root.dataset.successUrl`. The caller-controlled mode was absent and remained executable RED until T016.

**Checkpoint**: T002–T004 retain unaffected historical evidence. T001/T005 require fresh evidence
for PLAN REMEDIATION #5 before the new T016 gate can authorize product work.

---

## Phase 2: Foundational RED-First Harness

**Purpose**: Build and execute the complete QA contract before any productive edit.

**⚠️ CRITICAL**: T006–T016 block every new or reopened product change; unaffected historical T017
and T019 evidence remains closed. During the RED PRE→POST window opened by T016, `tasks.md` must
remain byte-identical; evidence stays in memory/stdout and is persisted only after T016 completes
the full comparison and approves the gate.

- [X] T006 Capture a remediation PRE inventory and individual SHA-256 fingerprints in memory/stdout for `scripts/qa/millora-draft-persistence-qa.mjs`, all three writable product files `src/lib/{submissionDraft,milloraSubmissionFlow,netlifySubmission}.ts`, read-only Agenda/Comunicats/Veus/Foto del Mes flows, component/routes/verification, and each Feature 011 SDD file `specs/011-millora-draft-persistence/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md}` plus `specs/011-millora-draft-persistence/checklists/requirements.md`, real `.astro/`, real `dist/`, qa-roots, profiles and ports/processes; require `spec.md`, `requirements.md`, `plan.md`, `research.md`, `data-model.md` and `quickstart.md` byte-identical in POST while only `tasks.md` may change after the PRE→POST window closes, because Git alone does not protect these untracked artifacts; confirm C011-F1–F6 plus prior QA39 evidence are invalidated, keep product and `tasks.md` byte-identical through T016 PRE→POST, and prohibit persistent logs or writes outside owned temporaries
- [X] T007 Add controlled DOM, form-control, event and `sessionStorage` fixtures to `scripts/qa/millora-draft-persistence-qa.mjs` that import the real helper, detect listener duplication, observe exact envelopes and snapshots, inject get/set/remove failures, prove restore-before-listeners, synchronous `input`/`change`, latest-value-before-return and zero pending/deferred work
- [X] T008 Remediate the exact 16 DOM cases QA01, QA03, QA04, QA10, QA16, QA24–QA30 and QA42–QA45 in `scripts/qa/millora-draft-persistence-qa.mjs`; move QA34 exclusively to browser, and make QA42/QA43/QA44 independently execute exact key, allowlist, save, restore, clear, corrupt-envelope fail-open, invalid-value and unknown/non-allowlisted behavior with zero authorized-state contamination; a shared helper is allowed only with per-scope fixtures/actions/assertions that actually execute every contract
- [X] T009 Implement `--build` ownership in `scripts/qa/millora-draft-persistence-qa.mjs`: require real `dist/` and prior `.veu-011-qa-*` roots absent; create one marked mkdtemp qa-root under the frontend; record feature identity, run-id, realpath, directory type, device/inode and exact copy manifest `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json`, `package-lock.json`; exclude `.astro/`, `dist/`, full `node_modules`, `.git`, `.specify`, specs, scripts, `.env*`, secrets, backups, backend, SQLite and persistent data; resolve existing dependencies from the parent only
- [X] T010 Refactor BUILD and shared resource cleanup in `scripts/qa/millora-draft-persistence-qa.mjs` behind one idempotent, non-reentrant coordinator: attempt every owned-resource cleanup independently, accumulate/report all errors without skipping later resources, fail finally if any required cleanup fails, close the CMS double and listener, and remove a failed qa-root only after marker/feature/run-id/realpath/type/device/inode/identity revalidation; never clean globally or signal by process name
- [X] T011 Remediate browser ownership and interruption handling in `scripts/qa/millora-draft-persistence-qa.mjs`: retain the owned preview/profile/Chrome/CDP/network guard, add bounded PASS/assertion/exception/build/preview/browser-failure/controlled-abort/`SIGINT`/`SIGTERM` cleanup through the T010 coordinator, prevent later signals from re-entering cleanup, act only on authenticated owned children/groups, and preserve the original failure/signal plus accumulated cleanup errors; never use a real profile, backend, Strapi, Functions, SQLite or internet
- [X] T012 Remediate browser QA02, QA05–QA09 and QA34 in `scripts/qa/millora-draft-persistence-qa.mjs` with distinct real-page setup/action/assertions: QA05 preserves and later restores the literal alias while proving it is absent from validation, `autor_public`, preview, review, actual `FormData` and captured remote payload for both `resident` and `visitor`; QA08 asserts first editable step, relevant buttons, title/summary/content counters, reading-time indicator, preview and every PLAN-derived UI state; QA34 restores an invalid partial email within 180 through the real flow/controller and proves request-code count `0` and submit count `0`
- [X] T013 Remediate browser QA11–QA15 in `scripts/qa/millora-draft-persistence-qa.mjs`; preserve real CA→ES→EN→CA, one key and latest literal content, and make QA15 independently exercise in each real CA/ES/EN route an alias literal followed by `resident` and `visitor`: changing from `alias` must hide but preserve the exact alias in memory/draft, exclude it from `autor_public`, preview and review while either non-alias type is active, derive those three surfaces only from the active type and current-locale label with no stale prior-locale label, and recover the exact conserved value after returning to `alias`; keep `FormData`, payload and remote-submission exclusion assertions owned by QA05
- [X] T014 Remediate browser QA17–QA23 and QA31–QA33 in `scripts/qa/millora-draft-persistence-qa.mjs`; QA21 must use real pageshow/bfcache and observable behavior to prove challenge, token, code, timer, verified, temporary authorization, transient submission state and first-step state reset without debug-only product APIs, automatic request/verify/submit, duplicate listeners, draft clear or sensitive-state restore
- [X] T015 Replace only the active QA39/transport contract in `scripts/qa/millora-draft-persistence-qa.mjs`: add deterministic no-service regression for omitted/default automatic, explicit automatic if used, caller mode returning after HTTP 200 + `{ok:true}` and minimum wait without internal navigation, failures never navigating, and automatic invoking `window.location.assign` exactly once; make browser QA39 keep the real success URL and prove the caller-mode transport returned before transparently observing exactly one native-delegated `sessionStorage.removeItem("guiapineda:submission-draft:v1:millora")`, then `Page.frameRequestedNavigation`, matching `Network.requestWillBeSent` `Document`, success commit/load and key absent after load, with strict ledger `confirmed HTTP/json + caller return → productive clear → product navigation requested → Document request → success load → key absent`; forbid only pausing/holding the success `Document` navigation in response-stage, continuing that held navigation as an ordering mechanism and Runtime observation while it is held, plus test clear, `javascript:`, `Page.navigate`, second/fake navigation, polling and product-only QA branches; retain `Fetch.requestPaused` request-stage for the fail-closed guard to continue allowlisted traffic, abort unexpected requests and intercept approved synthetic endpoints without holding the success navigation
- [X] T016 Run `node --check scripts/qa/millora-draft-persistence-qa.mjs` and a fresh remediation RED gate before any product repair: execute the exact 16-DOM registry, transport automatic/caller regression, an indivisible isolated `--build`→29-browser cycle, targeted QA05/QA08/QA15/QA21/QA34/QA39/QA42–QA44 and cleanup failure/signal probes against byte-identical current product; require harness instrumentation, network guard, ownership and cleanup infrastructure PASS, and require genuine RED for C011-F1 plus missing caller mode/Millorem caller navigation without accepting infrastructure failure as RED; capture POST proving all product, protected paths and `tasks.md` unchanged with zero residue, then and only then persist T001/T005/T006–T016 evidence/checkmarks

### Evidence status — T006–T016 remediation RED gate

Fresh remediation RED PASS: syntax and 16/16 DOM PASS; omitted/explicit automatic and all failure
semantics PASS while caller mode fails only because current transport performs one internal
navigation. Isolated build PASS used run `b04bfced-9a88-4522-984c-786bebf5be66`; targeted browser
executed QA05/QA08/QA15/QA21/QA34/QA39, with QA08/QA15/QA21/QA34 PASS and genuine product REDs:
QA05 leaked inactive alias for `resident`/`visitor`, and QA39 observed real order `C → D → A → B →
E → F`. Request-stage guard, ownership and universal cleanup/failure/signal probes PASS. Product,
protected paths and this file stayed byte-identical through RED POST; real `.astro/` manifest hash
`e4e5614d5eb5194a9881fa494c0d3061f1845c187507f8816ca592266be038c8` remained equal, real `dist/`
absent and all owned qa-roots/profiles/listeners/processes were removed. The one empty profile left by
the sandbox-denied first probe was proven PRE-absent, exact-prefix, empty and handle-free, then removed
with `rmdir`; the unrestricted rerun completed every cleanup probe with zero residue.

**Checkpoint**: PASS. T016 authorizes T025 transport-first product remediation, followed by Millorem.

---

## Phase 3: User Story 1 — Recover Work in Progress (Priority: P1) 🎯 MVP

**Goal**: Restore the eight permitted values after reload/return and rebuild the first editable step.

**Independent Test**: QA01–QA10 and QA25–QA34 demonstrate exact save/restore, latest edit, partial and
invalid behavior, first step and derived UI without any security state.

- [X] T017 [US1] Extend only `DraftScope` in `src/lib/submissionDraft.ts` to accept `"millora"`; preserve envelope version 1, key format, radio/select/text resolution, restore predicates, direct synchronous save, corruption and clear semantics for `agenda`, `comunicat` and `veu`
- [X] T018 [US1] Run the remediated 16-case `--dom` suite from `scripts/qa/millora-draft-persistence-qa.mjs` and record in `specs/011-millora-draft-persistence/tasks.md` that scope/key `millora` is accepted, four keys remain isolated, restore precedes listeners, input/change are synchronous, empty values win, and QA42–QA44 each prove key/allowlist/save/restore/clear/corrupt/invalid/unknown with no contamination while QA45 proves four-scope isolation; STOP if any regression occurs
- [X] T019 [US1] Add to `src/lib/milloraSubmissionFlow.ts` the exact eight-name allowlist and restore predicates: alias ≤100, title ≤120, summary ≤280, content ≤6000, email ≤180; accept partial/invalid-format email within maximum, rely on current radio/select options for category/zone/author-type, and initialize scope `millora` immediately after locating the form
- [X] T020 [US1] Verify and, only if remediated QA08 exposes a real gap, complete the restore/reconciliation sequence in `src/lib/milloraSubmissionFlow.ts`: first editable step, relevant buttons, title/summary/content counters, reading-time indicator, preview and remaining PLAN-derived UI must reflect restored values without synthetic events, duplicate listeners, persisted derived state or changes outside the product allowlist
- [X] T021 [US1] After T025 changes `src/lib/netlifySubmission.ts`, remediate authorship in `src/lib/milloraSubmissionFlow.ts`: preserve literal `millora-alias` in memory/draft and hidden through `resident`/`visitor`, restore it exactly on returning to `alias`, and while type is not `alias` exclude it from validation, `autor_public`, preview, review, actual `FormData`, payload and remote submission without clearing or mutating the input; retain current-locale derivation and do not modify component/routes or any read-only caller
- [X] T022 [US1] Execute `node --check` and the complete remediated 16-case `--dom` suite from `scripts/qa/millora-draft-persistence-qa.mjs`; require QA01, QA03, QA04, QA10, QA16, QA24–QA30 and QA42–QA45 PASS, exact observed snapshot, complete closed-scope corrupt/invalid coverage, only the five allowed paths changed overall and all read-only caller fingerprints intact; record fresh evidence in `specs/011-millora-draft-persistence/tasks.md`

**Checkpoint**: US1 behavior is implemented and DOM-verifiable; browser proof remains blocked on the
later isolated cycle.

---

## Phase 4: User Story 3 — Preserve Privacy and Security (Priority: P1)

**Goal**: Keep only approved user data, reset verification and clear the draft only at the proven
success boundary.

**Independent Test**: QA17–QA24 and QA35–QA41 prove exclusions, fail-open behavior, preservation on
every failure, confirmed-success cleanup and fresh pageshow state.

- [X] T023 [US3] Verify against remediated QA21/QA34 and, only within `src/lib/milloraSubmissionFlow.ts` if needed, keep restored `email_contacto` literal while challenge/token/code/timer/verified/temporary authorization and transient submission state always start fresh; invalid partial email must remain restored but the real controller must produce request-code count `0` and submit count `0`; do not modify `src/lib/emailVerificationController.ts`
- [X] T024 [US3] Verify and, only if QA21 exposes a gap, complete `pageshow`/bfcache handling in `src/lib/milloraSubmissionFlow.ts`: reset every observable sensitive/transient state, return to the current contractual first editable step, reconcile UI once, preserve the draft and avoid automatic request/verify/submit, duplicate listeners, storage reread/resave or debug-only product APIs
- [X] T025 [US3] After T016 RED PASS and before any Millorem product repair, change only `src/lib/netlifySubmission.ts` so `SubmissionOptions.navigation` accepts `"automatic" | "caller"` with `navigation ?? "automatic"`: preserve existing HTTP/JSON success, minimum wait, overlay and failure semantics; automatic calls `window.location.assign(successUrl)` exactly once as before, caller returns success/control after the wait with zero internal navigation and no extra API/refactor. Then adapt only `src/lib/milloraSubmissionFlow.ts` to pass `navigation: "caller"`, await confirmed success, call `clearDraft()` exactly once and immediately call `window.location.assign(successUrl)` using the same contractual URL rather than duplicating or hardcoding route semantics; preserve the key after validation failure, request-code failure, verify-code failure, submit start, submit exception, HTTP error or `{ok:false}`, and on ordinary navigation/reload/language/bfcache; do not modify component/routes/verification or other callers
- [X] T026 [US3] Audit the product diff and remediated QA39 in `scripts/qa/millora-draft-persistence-qa.mjs`; require executable temporal evidence A–F with `A < B < C <= D < E` and F after E: A = controlled HTTP 200/`{ok:true}` confirmed and caller-mode transport returned after minimum wait, B = exactly one productive native-delegated remove of the Millorem key, C = product `window.location.assign`, D = matching `Document` request, E = success commit/load, F = key absent after load; require no response-stage hold or pause/continue of the success `Document` navigation and no Runtime observation while that navigation is held, test clear, `javascript:`, `Page.navigate`, alternate/fake navigation or polling; preserve the request-stage `Fetch.requestPaused` fail-closed guard for allowlisted continuation, unexpected-request abort and approved synthetic interception, verify Millorem alone opts into caller mode, and verify omission of the option still selects automatic and navigates exactly once
- [X] T027 [US3] Run syntax plus targeted privacy/security GREEN and transport regression in `scripts/qa/millora-draft-persistence-qa.mjs`; require exact eight-field envelope, alias absent from actual `FormData`/payload for `resident` and `visitor`, fresh QA21/QA34, fail-open storage, caller mode returning without navigation, omitted/default automatic and explicit automatic navigating once after success/wait, failures never navigating, byte-identical component/routes/verification/Agenda/Comunicats/Veus/Foto del Mes, and no behavior claim beyond default compatibility for their historical clear ordering

**Checkpoint**: Privacy, verification freshness and clear boundary are implemented without changing
security-sensitive shared modules.

---

## Phase 5: User Story 2 — One Draft Across CA, ES and EN (Priority: P2)

**Goal**: Continue one literal draft across all three routes while rebuilding labels in the current
locale.

**Independent Test**: QA11–QA16 prove one key, literal content, latest edit and localized
resident/visitor labels across CA→ES→EN→CA.

- [X] T028 [US2] Verify against the exact remediated QA15 contract from T013 and, only within `src/lib/milloraSubmissionFlow.ts` if needed, complete locale-neutral derivation so `resident` and `visitor` each use the active CA/ES/EN label in `autor_public`, preview and review while the conserved hidden alias remains non-applied, no stale label, translation or normalization crosses locale navigation, and returning to `alias` restores the exact literal value
- [X] T029 [US2] Audit read-only `src/components/MilloraSubmissionFlow.astro`, `src/templates/MilloraSubmissionPage.astro` and CA/ES/EN route files against fresh QA11–QA15; record in `specs/011-millora-draft-persistence/tasks.md` real CA/ES/EN evidence that `resident` and `visitor` use current-locale `autor_public`, preview and review without stale labels, the literal alias stays hidden/conserved/non-applied for both types, and returning to `alias` recovers it exactly, or STOP and return to PLAN without editing markup/routes
- [X] T030 [US2] Run the locale/static portion of `scripts/qa/millora-draft-persistence-qa.mjs` available before browser and record one key `guiapineda:submission-draft:v1:millora`, no locale key/label in the envelope, literal values and readiness for the exact browser route sequence in `specs/011-millora-draft-persistence/tasks.md`

### Evidence status — T017–T030 product and story gates

Fresh GREEN PASS. The 16-case DOM registry passed with the exact expected IDs and snapshot; scope
`millora`, the four isolated keys, restore-before-listeners, synchronous latest-value saves, empty
values, corrupt/invalid fail-open behavior and QA42–QA45 isolation all passed. QA08 proved the full
restored first-step/derived-UI contract without requiring another product edit. QA05 proved the
literal hidden alias is preserved but excluded from validation, `autor_public`, preview, review,
actual `FormData` and payload for both `resident` and `visitor`. QA15 passed the real CA→ES→EN→CA
sequence with current-locale resident/visitor labels and exact alias recovery. QA21 proved fresh
sensitive/transient state and real pageshow/bfcache reconciliation; QA34 restored the invalid partial
email with request-code count `0` and submit count `0`. Transport regression passed omitted/default
automatic, explicit automatic, caller, HTTP failure, JSON failure and invalid JSON, preserving the
minimum wait and `Promise<void>`.

**Checkpoint**: PASS. US1, US3 and US2 are GREEN with no changes outside the five-path allowlist.

---

## Phase 6: Isolated Build and Browser Validation

**Purpose**: Execute the approved real-page evidence without touching real generated output or
external services.

- [X] T031 Capture a fresh browser-cycle PRE state in memory/stdout from `scripts/qa/millora-draft-persistence-qa.mjs`: real root, `.astro/` existence/tree/type/size/hash/mode, `dist/` absence, `.veu-011-qa-*` absence, working tree, port 4173, listeners/processes, harness, all three product fingerprints, read-only caller fingerprints, and individual fingerprints for `specs/011-millora-draft-persistence/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md}` plus `specs/011-millora-draft-persistence/checklists/requirements.md`; require `spec.md`, `requirements.md`, `plan.md`, `research.md`, `data-model.md` and `quickstart.md` unchanged in POST, keep `tasks.md` byte-identical until POST closes and only then allow its checkpoint evidence update, and STOP without cleaning any unexpected/non-owned resource
- [X] T032 Execute `node scripts/qa/millora-draft-persistence-qa.mjs --build`; require exact copy manifest, complete qa-root identity, closed eight-endpoint CMS double, three routes in owned `dist/`, real `.astro/`/`dist/` unchanged and listener released; exercise the remediated build-failure cleanup path separately, then on valid PASS proceed immediately to T033 without voluntary interruption
- [X] T033 Execute `node scripts/qa/millora-draft-persistence-qa.mjs --browser` immediately after T032 plus the real-module transport regression; require exactly QA02, QA05–QA09, QA11–QA15, QA17–QA23 and QA31–QA41 (29/29), complete QA05/QA08/QA15/QA21/QA34/QA39, actual reload/navigation/bfcache, all failure-preserves paths, caller-mode ordering without holding the success `Document` navigation, request-stage `Fetch.requestPaused` fail-closed network guard intact, and automatic-default compatibility for Agenda/Comunicats/Veus/Foto del Mes without modifying those callers
- [X] T034 Execute and verify universal cleanup evidence from `scripts/qa/millora-draft-persistence-qa.mjs`: PASS, injected assertion FAIL, exception, build failure, preview failure, browser failure, controlled abort, and owned child runs receiving `SIGINT` and `SIGTERM`; prove one failure does not skip later cleanup attempts, errors are accumulated/reported, cleanup is bounded/non-reentrant, later signals do not re-enter, only owned resources are touched, ambiguous ownership stops deletion, final status is nonzero on cleanup failure, and every run releases qa-root/profile/ports/processes while preserving real `.astro/` and absent real `dist/`
- [X] T035 After T031–T034 POST comparison passes, persist only fresh evidence/checkmarks in `specs/011-millora-draft-persistence/tasks.md`: all 29 browser IDs, build manifest, QA39 A–F timestamps/ledger and exactly-one-clear evidence, caller/automatic transport regression, protected-caller hashes, QA05 payload, QA34 zero request/submit, cleanup failure/signal outcomes, network guard, root invariants and zero backend/SQLite contact; exclude paused-request diagnostics and all invalidated GREEN claims

### Evidence status — T031–T035 isolated build/browser

Fresh PRE→POST cycle PASS. The final indivisible build/browser run used run-id
`8709cb63-d530-456f-a2d9-6332f0f53849`: build ownership, marker/identity and exact copy manifest
passed; the eight-endpoint CMS double closed; three locale routes were generated only in the owned
qa-root; and browser returned the exact 29/29 registry. QA39 observed the strict real ledger
`A → B → C → D → E → F`, one productive native-delegated clear, one product navigation request,
one matching `Document` request/load and the key absent after load, without response-stage hold,
test clear, alternate navigation or polling. The request-stage fail-closed network guard remained
active. PASS, assertion, exception, build, preview, browser, controlled-abort, SIGINT and SIGTERM
cleanup probes all passed with independent attempts, accumulated errors and non-reentrant bounded
cleanup. PRE and POST fingerprints matched for product, harness, protected callers/routes/component/
verification, SDD protected artifacts and `tasks.md`; real `.astro/` aggregate hash remained
`e4e5614d5eb5194a9881fa494c0d3061f1845c187507f8816ca592266be038c8`, real `dist/` remained absent,
and no qa-root/profile/listener/process survived. Backend and SQLite contact: none.

**Checkpoint**: PASS. Build/browser is 29/29 GREEN with universal cleanup evidence.

---

## Phase 7: Determinism, Coverage and Closure

**Purpose**: Re-run deterministic local evidence and close every requirement without expanding
scope.

- [X] T036 Execute two fresh consecutive `node scripts/qa/millora-draft-persistence-qa.mjs --dom` runs; require both exit 0, identical normalized stdout and observed snapshots, identical exact 16-ID set, zero contamination/deferred work and no product/SDD write; record only new evidence in `specs/011-millora-draft-persistence/tasks.md`
- [X] T037 Audit QA01–QA45 in `scripts/qa/millora-draft-persistence-qa.mjs` and `specs/011-millora-draft-persistence/quickstart.md`; require exactly 16 DOM plus 29 browser, every ID once, zero overlap/missing/duplicate/printed-only/hardcoded PASS, QA34 browser-only, and no shared helper that hides the distinct QA42–QA44 corrupt/invalid actions/assertions; record the final mapping in `specs/011-millora-draft-persistence/tasks.md`
- [X] T038 Audit all 16 Acceptance Scenarios, FR-001–FR-030 and C011-F1–F6 against completed tasks and fresh observed QA in `specs/011-millora-draft-persistence/tasks.md`; require every item mapped, no implementation task without intent and no unresolved deviation from SPEC/PLAN REMEDIATION #6
- [X] T039 Audit SC-001–SC-009 against fresh DOM/browser/build/cleanup evidence and record PASS/FAIL per criterion in `specs/011-millora-draft-persistence/tasks.md`; do not reuse affected pre-remediation GREEN or infer runtime PASS from source inspection
- [X] T040 Re-run Constitution Check and final allowlist audit in `specs/011-millora-draft-persistence/tasks.md`; verify only `src/lib/submissionDraft.ts`, `src/lib/milloraSubmissionFlow.ts`, `src/lib/netlifySubmission.ts`, `scripts/qa/millora-draft-persistence-qa.mjs` and this `tasks.md` changed; require caller-mode PASS, automatic-default PASS, read-only callers/component/routes/verification fingerprints equal, historical cross-flow clear weakness explicitly not claimed fixed, backend untouched/clean and SQLite access/reads/hashes/metadata/sidecars/commands/schema changes/migrations all `none`
- [X] T041 Run final `node --check scripts/qa/millora-draft-persistence-qa.mjs` and `git diff --check`; verify exact 45-case GREEN as 16/29, caller/automatic transport PASS, QA39 exactly one productive clear before navigation and key absent after load, universal cleanup/failure/signal evidence, no `.veu-011-qa-*`, profile, fixture, log, cache, owned process/listener or real `dist/`, real `.astro/` unchanged by tree/type/bytes/hash/mode, staged `0`, and record exact frontend/backend Git state in `specs/011-millora-draft-persistence/tasks.md`

### Evidence status — T036–T041 determinism and closure audits

Two fresh consecutive post-browser DOM runs exited `0` with byte-identical normalized stdout, the
same exact 16 IDs and the same observed snapshot
`{"guiapineda:submission-draft:v1:agenda":"agenda","guiapineda:submission-draft:v1:comunicat":"comunicat","guiapineda:submission-draft:v1:veu":"veu"}`; no contamination or deferred work was observed. Final registry audit maps QA01–QA45 exactly
once as 16 DOM + 29 browser, with QA34 browser-only and independent executable QA42–QA44 cases.
All 16 Acceptance Scenarios, FR-001–FR-030, C011-F1–F6 and SC-001–SC-009 map to fresh passing
evidence. Constitution and allowlist PASS: only the three product files, harness and this `tasks.md`
changed; default automatic compatibility is proven without claiming the historical cross-flow clear
ordering was repaired. Final syntax, diff, residue, Git and fingerprint checks are recorded in T042.

- [X] T042 Review every checkbox and evidence block in `specs/011-millora-draft-persistence/tasks.md`; mark a task complete only with its own fresh or demonstrably unaffected evidence, require T001–T042 continuous, 42 total, 0 `[P]`, 0 pending, QA01–QA45 PASS exactly once as 16 DOM + 29 browser, caller-mode and automatic-default regressions PASS, Millorem confirmed-success → exactly-one-clear → product-navigation ordering PASS, read-only callers unchanged, C011-F1–F6 resolved, cleanup/signals PASS, 16/16 Acceptance Scenarios, FR-001–FR-030 and SC-001–SC-009 PASS, and report remediation IMPLEMENT complete without commit, push, deploy, ANALYZE or CONVERGE

**T042 final evidence**: PASS. T001–T042 are continuous and 42/42 `[X]`, with 0 pending and 0 `[P]`.
QA01–QA45 passed exactly once in the final registry as 16 DOM + 29 browser. Transport final regression
passed omitted/default automatic, explicit automatic, caller and all three failure paths; browser
QA39 passed `A → B → C → D → E → F` with exactly one productive clear before the one product
navigation and the key absent after load. C011-F1–F6, 16/16 Acceptance Scenarios, FR-001–FR-030 and
SC-001–SC-009 are resolved. Universal cleanup/signals passed and final residue checks found no owned
qa-root, profile, fixture, listener, process or real `dist/`; port 4173 is free. Protected SDD hashes,
caller/component/template/route/verification hashes and real `.astro/` hash equal their captured
baselines. `node --check` and `git diff --check` passed; `.specify/feature.json` has no diff; staged is
0. Frontend remains `main`, `HEAD == origin/main == 9ec4bcc099c3b67775665aa1114d393403eda7fb`,
ahead/behind `0/0`. Backend remains clean on `main`,
`HEAD == origin/main == 47ca26a0a54fd1c0193afd659b6ba3657b264793`, ahead/behind `0/0`.
SQLite access/reads/hashes/metadata/sidecars/commands/schema changes/migrations: all none. IMPLEMENT
REMEDIATION is complete without ANALYZE, CONVERGE, commit, push or deploy.

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 baseline re-audit for the five-path allowlist
  → Phase 2 remediation PRE → harness remediation → syntax → targeted RED
  → T025 shared transport first → Millorem caller-mode adaptation
  → remaining Phase 3 US1/product remediation → targeted DOM GREEN
  → remaining Phase 4 privacy/lifecycle/QA39 GREEN
  → Phase 5 multilingual QA15 GREEN
  → Phase 6 fresh indivisible build/browser + cleanup/failure/signal evidence
  → Phase 7 determinism, coverage and closure
```

- T006 captures remediation PRE before any harness edit; T016 is the hard targeted RED gate and all
  product remediation in reopened T020–T029 is prohibited until it passes.
- T005 records the static submit timeline and contractual ordering without claiming executable proof;
  T015 supplies deterministic automatic/caller transport coverage and T016 is its
  infrastructure/product RED gate. A RED is valid only when it detects both C011-F1 and the missing
  caller-mode/Millorem ordering while infrastructure remains PASS.
- Immediately after T016 PASS, T025 changes `src/lib/netlifySubmission.ts` first and only then adapts
  `src/lib/milloraSubmissionFlow.ts`; T020/T021 and the remaining product remediation follow T025.
  T021 remains the authorized C011-F1 authorship repair; protected callers remain read-only.
- T018/T022 protect complete closed-scope regression before browser validation.
- T026 protects the observable A–F success-order contract and default-automatic regression before
  T032/T033; it does not hold the success `Document` navigation or execute Runtime while that
  navigation is held, while the request-stage fail-closed guard remains active.
- T032 and T033 are indivisible; T033 owns cleanup after a successful build.
- T034 separately proves failure/signal cleanup paths; T035 persists evidence only after POST PASS.
- T036 repeats the new 16-case DOM set; affected browser evidence must come from fresh T033.

### User story dependencies

- **US1 (P1)**: begins only after the global RED gate and establishes the shared scope/integration.
- **US3 (P1)**: depends on US1’s draft handle and restore but remains independently testable through
  exclusions and lifecycle cases.
- **US2 (P2)**: depends on the restored authorship sources and validates locale-neutral identity.
- Strong shared-file dependencies prohibit story parallelism.

### Parallel opportunities

None. Total `[P]`: 0. Running tasks concurrently could corrupt PRE/POST evidence, edit the same
files, share browser resources or invalidate ownership.

---

## Coverage Maps

### QA01–QA45

| IDs | Definition task | Execution/gate |
|---|---|---|
| QA01, QA03, QA04, QA10, QA16, QA24–QA30 | T008 | T016 RED; T022/T036 GREEN |
| QA42–QA45 | T008 | T016 RED; T018/T022/T036 GREEN |
| QA02, QA05–QA09, QA34 | T012 | T016 RED; T033 GREEN |
| QA11–QA15 | T013 | T016 RED; T033 GREEN |
| QA17–QA23, QA31–QA33 | T014 | T016 RED; T033 GREEN |
| QA35–QA41 | T015 | T016 RED; T033 GREEN |

DOM exact IDs (16): QA01, QA03, QA04, QA10, QA16, QA24, QA25, QA26, QA27, QA28, QA29, QA30,
QA42, QA43, QA44, QA45.

Browser exact IDs (29): QA02, QA05, QA06, QA07, QA08, QA09, QA11, QA12, QA13, QA14, QA15, QA17,
QA18, QA19, QA20, QA21, QA22, QA23, QA31, QA32, QA33, QA34, QA35, QA36, QA37, QA38, QA39, QA40,
QA41.

### CONVERGE remediation mapping

| Finding | Required tasks |
|---|---|
| C011-F1 alias payload | T012, T016, T021, T027, T033, T038–T042 |
| C011-F2 caller-controlled QA39 ordering | T005, T015–T016, T025–T027, T033, T035, T038–T042 |
| C011-F3 universal cleanup/signals | T006, T010–T011, T016, T031–T035, T039–T042 |
| C011-F4 QA42–QA44 corrupt/invalid | T008, T016, T018, T022, T036–T042 |
| C011-F5 QA34 real controller blocking | T012, T016, T023, T027, T033, T037–T042 |
| C011-F6 QA08/QA15/QA21 | T012–T014, T016, T020, T023–T024, T028–T029, T033, T038–T042 |

### Functional Requirements

| Requirements | Tasks |
|---|---|
| FR-001–FR-002 | T017–T019, T028, T037 |
| FR-003–FR-005 | T012, T019, T021, T023, T027, T033 |
| FR-006–FR-012 | T007–T009, T019–T022, T028–T030 |
| FR-013–FR-017 | T014, T021, T023–T027, T033 |
| FR-018–FR-020 | T007–T010, T022, T033, T036 |
| FR-021–FR-024 | T005, T015–T016, T024–T026, T033–T035 |
| FR-025–FR-027 | T008, T013, T018, T028–T030, T033, T036 |
| FR-028–FR-030 | T001–T005, T009–T011, T027, T040–T041 |

### Success Criteria

| Criterion | Evidence tasks |
|---|---|
| SC-001 | T008, T012, T018, T022, T033 |
| SC-002 | T013, T028–T030, T033 |
| SC-003 | T012, T014, T020–T022, T024, T033 |
| SC-004 | T014, T021, T023–T027, T033 |
| SC-005 | T005, T015, T025–T026, T033 |
| SC-006 | T007–T010, T014, T022, T033 |
| SC-007 | T008, T018, T022, T036 |
| SC-008 | T011–T015, T028–T033 |
| SC-009 | T001–T006, T009–T011, T016, T031–T035, T040–T041 |

### Acceptance Scenarios — 16/16

| Story scenarios | Tasks / QA |
|---|---|
| US1.1 reload | T012, T019–T022, QA02 |
| US1.2 navigation/return | T012, T020, T033, QA02/QA41 |
| US1.3 latest value/empty | T008, T019, T022, QA02/QA03 |
| US1.4 derived UI | T012, T016, T020–T022, T033, QA08 |
| US1.5 current review | T012, T020, T033, QA09 |
| US2.1 CA→ES→EN | T013, T028–T033, QA11/QA12 |
| US2.2 literal content | T013, T028, T033, QA14 |
| US2.3 latest cross-locale | T013, T028–T033, QA13 |
| US2.4 current-locale labels | T013, T016, T021, T028–T033, QA15 |
| US3.1 image exclusion | T014, T027, T033, QA18/QA19 |
| US3.2 consent/verification fresh | T012, T014, T016, T023–T024, T027, T033, QA20/QA21/QA34 |
| US3.3 failures preserve | T015, T025–T026, T033, QA35–QA38 |
| US3.4 success clears | T005, T015–T016, T025–T026, T033/T035, QA39 |
| US3.5 storage unavailable | T007–T008, T022, QA10 |
| US3.6 corrupt/invalid | T008, T012, T014, T016, T018, T022/T033, QA25–QA34/QA42–QA44 |
| US3.7 session end boundary | T003, T017, T038, storage contract audit |

### Constitution gates

| Gate | Tasks |
|---|---|
| Local editorial identity/static-first | T003, T038, T040 |
| Privacy/security | T005, T014–T015, T023–T027, T040 |
| SQLite/infrastructure integrity | T004, T009–T011, T031–T035, T040–T041 |
| Simplicity/maintainability | T006, T017, T038, T040 |
| CA/ES/EN parity | T013, T028–T033, T038 |
| Repository coordination/workflow | T001–T005, T016, T040–T042 |

---

## Implementation Strategy

### MVP

US1 is the functional MVP, but it cannot be committed or considered complete independently of US3:
privacy and correct cleanup are release gates. Implement Phase 3, validate DOM, then immediately
complete Phase 4 before browser validation.

### Evidence discipline

1. Never mark a task by dependency or inference.
2. Keep `tasks.md` byte-identical inside each declared PRE→POST observation window.
3. Preserve evidence in stdout/in-memory until the window closes and comparison passes.
4. On any ownership ambiguity, infrastructure failure or protected-file delta: STOP; do not clean
   unknown resources or continue product work.
5. No commit, push, deploy, ANALYZE or CONVERGE is authorized by this file.
