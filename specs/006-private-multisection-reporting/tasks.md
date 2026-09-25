---

description: "Dependency-ordered implementation tasks for private multisection reporting"
---

# Tasks: Denuncia privada multisección

**Input**: Design documents from `/specs/006-private-multisection-reporting/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Repositories**:

- `guiapineda-astro/`: public UI, verification scope, Netlify Function, transport and persistent QA.
- `guiapineda-strapi/`: private schema, authoritative validation/creation, internal dispatch and generated types.

**Task rule**: every implementation task is limited to the closed allowlist below. If another file
is necessary, stop without editing it, document the blocker and return to PLAN.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: may run in parallel only after its stated prerequisites and only when files do not overlap.
- **[US1]**: visitor reports an applicable public item with CA/ES/EN parity.
- **[US2]**: editors receive a precise private multisection report for human review.
- **[US3]**: Feature 003 and reporter privacy remain intact.
- **[US4]**: abuse, invalid references and failures are rejected without automatic effects.
- Setup/foundational/final-audit tasks have no story label; implementation and story-specific QA do.

## Closed implementation allowlist

### Frontend repository: additions

```text
guiapineda-astro/src/components/ContentReportFlow.astro
guiapineda-astro/src/lib/contentReportFlow.ts
guiapineda-astro/netlify/functions/content-report.mjs
guiapineda-astro/netlify/functions/content-report-http.mjs
guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs
```

### Frontend repository: existing files allowed to change

```text
guiapineda-astro/src/templates/AgendaArticlePage.astro
guiapineda-astro/src/templates/VeuArticlePage.astro
guiapineda-astro/src/templates/MilloraArticlePage.astro
guiapineda-astro/src/templates/CommercePage.astro
guiapineda-astro/src/components/EmailVerificationBlock.astro
guiapineda-astro/src/lib/emailVerification.ts
guiapineda-astro/src/lib/emailVerificationController.ts
guiapineda-astro/netlify/functions/_shared/verification-core.mjs
guiapineda-astro/netlify/functions/_shared/strapi-submission.mjs
```

### Backend repository: additions and generated output

```text
guiapineda-strapi/src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json
guiapineda-strapi/src/services/internal-content-report.js
guiapineda-strapi/src/api/internal-submission/controllers/internal-submission.js
guiapineda-strapi/types/generated/contentTypes.d.ts
```

### SDD/QA ledger

```text
guiapineda-astro/specs/006-private-multisection-reporting/tasks.md
guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs
guiapineda-astro/scripts/qa/commerce-submission-qa.mjs
```

`tasks.md` may receive checkbox/evidence updates during implementation. The existing commerce QA may
change only its exact shared-scope expectation to retain all seven historical values and add
`content-report` as the eighth; every other assertion remains protected. Other approved feature 006
SDD files are read-only inputs unless work explicitly returns to PLAN.

## Protected files and zones

The following remain read-only unless a real blocker is documented and PLAN is reopened:

```text
guiapineda-astro/src/templates/ComunicatArticlePage.astro
guiapineda-astro/src/components/CommunicatReportFlow.astro
guiapineda-astro/src/lib/communicatReportFlow.ts
guiapineda-astro/netlify/functions/communicat-report.mjs
guiapineda-astro/netlify/functions/communicat-report-http.mjs
guiapineda-strapi/src/api/denuncia-comunicat/
guiapineda-strapi/src/services/internal-communicat-report.js
guiapineda-strapi/src/api/{agenda,veu,millora,comercio,categoria-comercio,subcategoria}/**/schema.json
guiapineda-strapi/src/services/submission-moderation-lifecycle.js
guiapineda-strapi/.tmp/data.db
```

Also protected: all `package.json`/lockfiles, public lifecycles, `.env*`, deploy configuration,
Railway/PostgreSQL/Cloudinary/Resend/Upstash configuration and infrastructure. The shared
verification/transport files in the allowlist are sensitive: their change is limited to the exact
new scope/section entries defined by PLAN.

---

## Phase 1 — Baseline / safety

**Purpose**: establish auditable evidence before the first product-code edit.

- [X] T001 Record `git status --short --branch`, branch, HEAD, `origin/main` and ahead/behind for both repositories in the implementation report tied to `guiapineda-astro/specs/006-private-multisection-reporting/tasks.md`; require frontend `bd85981672bbfc430572ae010db05874b66ea8a2`, backend `3b0dfd5fef5d4c31a408d031e163e92ef40a4210`, 0/0, and stop on unexpected work.
- [X] T002 Reconcile every planned edit against the closed allowlist in `guiapineda-astro/specs/006-private-multisection-reporting/plan.md` and the allowlist above; record PASS before edits and stop/return to PLAN on any missing path.
- [X] T003 Capture hashes/diffs for the protected Feature 003 files listed above and inspect the existing CA/ES/EN Communicat flow, `communicat-report` Function, service and schema; record a pre-change PASS without modifying those files.
- [X] T004 Without starting Strapi, resolve the effective SQLite path and configured port from `guiapineda-strapi/config/`/environment documentation, record size/modification time/checksum plus any `-wal|-shm|-journal` sidecars, confirm no Strapi process/listener and a clean backend worktree, and state that no migration, reset, seed, destructive SQLite command or direct database write is authorized.
- [X] T005 Run the existing non-destructive baseline checks applicable before implementation—`node --check` on current Feature 003 Function modules and `node guiapineda-astro/scripts/qa/commerce-submission-qa.mjs`—and record exact commands/results in the implementation report; stop if a baseline regression invalidates assumptions.
- [X] T006 Create the versioned harness skeleton at `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` with `node:assert`, repository-root resolution, controlled-double boundary documentation and a failing/not-yet-implemented case registry; add no runtime dependency and use no `/private/tmp` script as evidence.
- [X] T007 Verify that `guiapineda-astro/specs/006-private-multisection-reporting/spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/` and `quickstart.md` agree on the four types, five reasons, three states, `content-report`, `content_report` and the privacy exclusions; record any contradiction as a PLAN blocker in `tasks.md` before code changes.

**Checkpoint**: baseline evidence exists, protected files and SQLite are fingerprinted, and the QA harness is versioned before sensitive edits.

---

## Phase 2 — Shared verification / scope (Foundational)

**Purpose**: add only the new purpose value while preserving all existing verification semantics.

**Sensitive zone**: changes are restricted to exact allowlist additions; TTLs, secrets, hashing,
challenge behavior, resend limits and consumption semantics must not change.

- [X] T008 [P] Add `content-report` as the eighth scope only to the component/type declarations in `guiapineda-astro/src/components/EmailVerificationBlock.astro` and `guiapineda-astro/src/lib/emailVerification.ts`; validate the declarations accept the new value and retain the seven historical scopes unchanged and in their existing order.
- [X] T009 [P] Add `content-report` as the eighth allowlist entry only in `guiapineda-astro/src/lib/emailVerificationController.ts` and `guiapineda-astro/netlify/functions/_shared/verification-core.mjs`, and update only the exact shared-scope expectation in `guiapineda-astro/scripts/qa/commerce-submission-qa.mjs`; validate all seven historical scopes remain, unknown scopes still reject, no historical scope changes semantics and no TTL/hash/rate-limit or other commerce-harness assertion changes.
- [X] T010 Add request-code assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` using the real verification request/core modules: `content-report` succeeds with controlled store/sender doubles, unknown scope rejects, and each of the seven historical scopes remains accepted as part of the exact eight-scope allowlist.
- [X] T011 Add verify-code assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` proving challenge scope/email binding: a `content-report` challenge verifies only with the same scope/email and a different purpose produces no token.
- [X] T012 Add token/consume assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` proving a `content-report` token is one-use, wrong-email and cross-scope use reject, and a consumed token cannot authorize a second submission.
- [X] T013 Add a focused `communicat-report` regression assertion to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` proving its request, verify and consume sequence still succeeds independently and cannot interchange tokens with `content-report`.
- [X] T014 Run the Phase 2 scope subset from `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` and the complete `guiapineda-astro/scripts/qa/commerce-submission-qa.mjs`; require both PASS for the exact seven historical scopes plus eighth `content-report`, request-code, verify-code, consume, cross-scope rejection, one-use, independent `communicat-report` and every unchanged Feature 005 assertion before backend model work.

**Checkpoint**: the new verification purpose works without weakening or redefining any existing purpose.

---

## Phase 3 — Backend data model

**Purpose**: create the additive private entity required by US2 without touching legacy data.

- [X] T015 [US2] Add private collection schema `guiapineda-strapi/src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json` with `draftAndPublish: false`, collection `denuncias_contenido`, and exact fields: required `tipo_contenido` enum `agenda|veu|millora|comercio`; required `contenido_document_id` string with `minLength: 1` and `maxLength: 128`; required `contenido_slug` string with `minLength: 1` and `maxLength: 250`; required five-value `motivo` enum; optional text `explicacion` with `maxLength: 1000`; required `idioma_solicitud` enum `ca|es|en`; and required/default `estado_denuncia` enum `pendiente|revisada|cerrada` default `pendiente`. Preparing this file does not authorize a Strapi startup.
- [X] T016 [US3] Add structural schema assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` proving the exact `contenido_document_id` 1/128, `contenido_slug` 1/250 and `explicacion` 1000 schema constraints, and proving `guiapineda-strapi/src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json` contains no email, token, challenge, code, IP, user-agent, session, reporter identity, relation, media or localization field and has no public route/controller/service sibling.

### Phase 3A — Mandatory pre-schema SQLite safety gate

**ID note**: T084–T088 were appended by ANALYZE remediation and are intentionally executed here to
preserve the traceability of T001–T083. Execution order is the order below, not numeric sorting.

- [X] T084 After T015 and before any command that bootstraps Strapi, prove Strapi is stopped: record `pgrep`/configured-port `lsof` output, resolve the effective SQLite path, and inventory the main file plus every existing `-wal|-shm|-journal` sidecar exactly as specified in `guiapineda-astro/specs/006-private-multisection-reporting/quickstart.md`; stop on any active process, listener, absent source or ambiguous path.
- [X] T085 With T084 passing, create the non-overwriting backup outside both repositories using a unique `mktemp -d` destination: copy the main SQLite file and all present sidecars, create the canonical logical `restore.db` with SQLite `.backup`, and record the absolute backup path and SHA-256 manifest; do not delete or overwrite the backup.
- [X] T086 Validate both the source and `restore.db` with `PRAGMA integrity_check = ok`, empty `PRAGMA foreign_key_check`, and matching ordered `sqlite_master` inventories; record the exact unexecuted `.restore` command and fail the gate if evidence cannot restore the pre-schema state.
- [X] T087 Present the T084–T086 process/port, resolved-path, sidecar, backup-path, checksum, PRAGMA, object-inventory and restore-command evidence to a human and obtain explicit approval for the first Strapi bootstrap/sync; this task cannot self-approve, infer approval from silence or pass merely because a backup exists.
- [X] T088 Only after T087 approval, perform the first controlled local Strapi bootstrap/sync with the prepared schema, then stop Strapi immediately; repeat process/port, source integrity, foreign-key and ordered object-inventory checks and prove the database change is additive with pre-existing objects/data intact; retain the T085 backup until a separate human decision accepts this post-sync evidence.
- [X] T017 [US2] After T088 passes, generate `guiapineda-strapi/types/generated/contentTypes.d.ts` through `npm run strapi -- ts:generate-types`; never edit it manually, and verify its diff adds only `api::denuncia-contenido.denuncia-contenido` with the exact schema fields/enums.
- [X] T018 [US3] Compare the pre-change and post-sync fingerprints/inventories of the resolved SQLite database, the retained T085 backup, the unchanged `guiapineda-strapi/src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json`, and the additive schema/type diff; record that no SQLite data transformation or legacy migration ran.

**Checkpoint**: the private model is additive, typed and free of reporter identity.

---

## Phase 4 — Backend validation / reference resolution

**Purpose**: make Strapi authoritative for type, stable identity and current public eligibility.

- [X] T019 [US2] Create the strict parser and immutable type→UID allowlist in `guiapineda-strapi/src/services/internal-content-report.js` for exactly `agenda`, `veu`, `millora`, `comercio`; bound raw JSON, require a plain object, reject files, forbid arbitrary UID selection, and enforce trimmed `contenido_document_id` length 1–128 before lookup.
- [X] T020 [US2] Add Agenda resolution in `guiapineda-strapi/src/services/internal-content-report.js`: query `api::agenda.agenda` by exact `contenido_document_id` with `status: "published"`, require a nonblank current slug, and return no eligible result for missing/unpublished IDs.
- [X] T021 [US2] Add Veu resolution in `guiapineda-strapi/src/services/internal-content-report.js`: query `api::veu.veu` by exact `contenido_document_id` with `status: "published"`, require a nonblank current slug, and return no eligible result for missing/unpublished IDs.
- [X] T022 [US2] Add Millorem resolution in `guiapineda-strapi/src/services/internal-content-report.js`: query `api::millora.millora` by exact `contenido_document_id` with `status: "published"`, require a nonblank current slug, and return no eligible result for missing/unpublished IDs.
- [X] T023 [US2] Add commerce resolution in `guiapineda-strapi/src/services/internal-content-report.js`: resolve published `api::comercio.comercio`, require `activo === true`, independently resolve its category and optional subcategory by their `documentId` with published status and `activa === true`, and require the subcategory to belong to the resolved category.
- [X] T024 [US4] Reject unknown type, absent/blank/non-string reference, `contenido_document_id` length 0 or 129+, control characters, nonexistent ID, unpublished/inactive content and cross-type IDs in `guiapineda-strapi/src/services/internal-content-report.js`; accept exact trimmed lengths 1 and 128 and verify a valid ID under one UID cannot be accepted under another.
- [X] T025 [US2] Derive `contenido_slug` exclusively from the resolved server document in `guiapineda-strapi/src/services/internal-content-report.js`; reject client keys `contenido_slug`, title, path or URL and prove a changed slug is accepted under the stable `documentId` with the new server slug.
- [X] T026 [US4] Validate `motivo` and `idioma_solicitud` in `guiapineda-strapi/src/services/internal-content-report.js` against the exact five reasons and `ca|es|en`; reject missing, non-string, unknown and control-character values.
- [X] T027 [US4] Validate `explicacion` in `guiapineda-strapi/src/services/internal-content-report.js`: when present require a string without coercion, trim as untrusted plain text, omit blank values for reasons 1–4, require trimmed nonblank text for `otro`, accept 1,000 characters and reject 1,001/control characters.
- [X] T028 [US3] Enforce an exact payload-key allowlist in `guiapineda-strapi/src/services/internal-content-report.js`; reject additional/nested/wrong-type structures and every identity field including email, token, challenge, code, IP, user-agent, session, profile and reporter history before any Documents Service create.
- [X] T029 [US2] Add backend resolution/parser cases to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` using real `internal-content-report.js` plus controlled Documents Service doubles for all four valid types, document-ID lengths 0/1/128/129, each invalid class, commerce relation rules, slug derivation and explanation lengths 1,000/1,001.

**Checkpoint**: every accepted payload identifies one currently public item by server-resolved type and `documentId`; client slug/context cannot select or relabel content.

---

## Phase 5 — Backend creation / moderation

**Purpose**: persist exactly one private human-review record with no public-content side effects.

- [X] T030 [US2] Implement the sole durable write in `guiapineda-strapi/src/services/internal-content-report.js`: after all validation/resolution, create one `api::denuncia-contenido.denuncia-contenido` containing only type, stable ID, server-derived slug, reason, optional explanation, language and `estado_denuncia: "pendiente"`; return success only after create resolves.
- [X] T031 [US4] Make failure atomic in `guiapineda-strapi/src/services/internal-content-report.js`: parser/lookup/create errors produce no accepted result, no partial report and no update/delete/publish/unpublish call on the referenced content.
- [X] T032 [US2] Preserve independent multiplicity in `guiapineda-strapi/src/services/internal-content-report.js`: two valid equal submissions create two records, with no uniqueness constraint, deduplication, reporter correlation, score, counter or threshold behavior.
- [X] T033 [US2] Confirm moderation is schema-only human workflow in `guiapineda-strapi/src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json`: `pendiente`, `revisada`, `cerrada` are editable through existing authenticated Content Manager/RBAC and no lifecycle automatically changes state or public content.
- [X] T034 [US2] Add persistence-lifecycle assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` proving accepted reports retain type/stable ID/slug snapshot after simulated content change/deletion, are not reassigned, and remain independent of later public-document availability.
- [X] T035 [US4] Add atomicity/no-effect assertions to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`: every pre-create failure yields create count 0, a create failure yields no success, valid submission yields create count 1, and public update/delete/publish/unpublish counts remain 0.

**Checkpoint**: backend creation is private, atomic, independently repeatable and exclusively human-moderated.

---

## Phase 6 — Internal transport / Function

**Purpose**: implement the bounded public boundary and authenticated internal delivery.

- [X] T036 [US1] Implement the pure request validator in `guiapineda-astro/netlify/functions/content-report.mjs` with the exact browser field allowlist; require string/nonblank `contenido_document_id` with trimmed length 1–128; when `explicacion` is present require a string without coercion, length at most 1,000 and trimmed nonblank text for `otro`; enforce normalized email length at most 180, validate type/reason/language/token and construct a fresh editorial payload excluding email/token/honeypot/slug/state.
- [X] T037 [US4] Implement `guiapineda-astro/netlify/functions/content-report-http.mjs` using the existing multipart reader with a 16 KiB ceiling; accept POST multipart only and reject duplicate/unexpected fields, every nonempty file, malformed form data, nonempty honeypot and over-limit bodies before verification.
- [X] T038 [US4] Enforce order in `guiapineda-astro/netlify/functions/content-report-http.mjs`: complete every deterministic structural/value check before calling consume, then consume once, then call backend once; add harness spies proving deterministic failures produce `consume = 0` and `backend = 0`.
- [X] T039 [US1] Consume verification in `guiapineda-astro/netlify/functions/content-report-http.mjs` only after the Function validator has accepted a normalized email of at most 180 characters, and use exact scope `content-report`; on wrong/expired/reused/wrong-email/wrong-scope token return safe failure and never invoke internal transport.
- [X] T040 [US1] Add `content_report` only to the internal section allowlist in sensitive file `guiapineda-astro/netlify/functions/_shared/strapi-submission.mjs`; reuse existing authenticated bearer/FormData/timeout behavior and change no semantics for existing sections.
- [X] T041 [US2] Add explicit `content_report` import/dispatch in `guiapineda-strapi/src/api/internal-submission/controllers/internal-submission.js` while preserving `communicat_report -> createInternalCommunicatReport` and all generic sections; route only the new section to `createInternalContentReport`.
- [X] T042 [US4] Implement public error mapping in `guiapineda-astro/netlify/functions/content-report-http.mjs`: local invalid input 400, method 405, media 415, size 413, platform limit 429 by configuration, verification unavailable/internal 401/403/non-success/create failure collapsed to non-enumerating 503, and 201 `{ok:true}` only after backend acceptance.
- [X] T043 [US1] Export the Netlify handler/config in `guiapineda-astro/netlify/functions/content-report-http.mjs` at `/api/submissions/content-report` with the existing five-per-60-seconds `ip`/`domain` platform rate-limit pattern; do not read or persist IP in application data.
- [X] T044 [US4] Add Function/transport contract coverage to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for 201, 400, 405, 413, 415, controlled 429 configuration, collapsed internal 401/403/404/503, downstream failure after token consumption, payload privacy and section/authentication selection.

**Checkpoint**: the public boundary is bounded, one-use authorized, non-enumerating and reaches only the new private backend section.

---

## Phase 7 — Frontend shared reporting flow

**Purpose**: build one reusable static-first report experience for all four surfaces.

- [X] T045 [US1] Implement validation/state/FormData controller `guiapineda-astro/src/lib/contentReportFlow.ts` for type, trimmed stable ID length 1–128, exact reasons, optional explanation, `otro` trimmed-nonblank rule, 1,000-character limit, normalized email length at most 180, verified-email gating and POST to `/api/submissions/content-report`.
- [X] T046 [US1] Create `guiapineda-astro/src/components/ContentReportFlow.astro` with exact props `lang`, `contentType`, `documentId`, a build-time trimmed 1–128 ID assertion, one shared form and complete CA/ES/EN CTA/reason/context/privacy/send copy; expose stable QA hooks `form[data-content-report-form]`, `[data-content-report-success]` and `[data-content-report-error]`, set native `maxlength="1000"` for explanation and `maxlength="180"` for email, and do not duplicate per-surface forms.
- [X] T047 [US1] Integrate `guiapineda-astro/src/components/EmailVerificationBlock.astro` into `ContentReportFlow.astro` with scope `content-report`; prevent request-code and submit for malformed or normalized 181+ character email, accept at most 180, require verified state before send and preserve the existing email-change invalidation/reset semantics without persisting email.
- [X] T048 [US4] Implement localized invalid, limited, unavailable/503 and retry states across `guiapineda-astro/src/components/ContentReportFlow.astro` and `guiapineda-astro/src/lib/contentReportFlow.ts`; after possible token consumption retain only reason/explanation, clear verification and require a new code.
- [X] T049 [US1] Implement receipt success and recovery behavior in `guiapineda-astro/src/components/ContentReportFlow.astro` and `guiapineda-astro/src/lib/contentReportFlow.ts`: only `{ok:true}` replaces the form, success promises human review only, and close/reopen preserves safe draft input without local/session storage.
- [X] T050 [US3] Complete accessibility/privacy behavior in `guiapineda-astro/src/components/ContentReportFlow.astro`: associated labels/fieldset/legend/errors, keyboard/focus/result announcement, no hidden title/body/personal snapshot, no public report count and no claim of automatic removal or author notification.
- [X] T051 [US4] Add client-controller cases to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for document-ID lengths 0/1/128/129, normalized email lengths 180/181, all reasons, whitespace-only `otro`, explanation 1,000/1,001, verified gating, safe retry after 503, success-only-on-201 and absence of persisted reporter identity.

**Checkpoint**: one accessible trilingual component implements the complete private reporting interaction without runtime Strapi reads.

---

## Phase 8 — Surface integration

**Purpose**: attach the shared flow independently to each existing detail surface.

- [X] T052 [P] [US1] Integrate `ContentReportFlow` in `guiapineda-astro/src/templates/AgendaArticlePage.astro` after event content with `contentType="agenda"`, `event.documentId` and active `lang`; verify CA/ES/EN CTA/copy, correct stable reference and zero new runtime Strapi fetch.
- [X] T053 [P] [US1] Integrate `ContentReportFlow` in `guiapineda-astro/src/templates/VeuArticlePage.astro` after `StrapiBlocks` with `contentType="veu"`, `veu.documentId` and active `lang`; verify CA/ES/EN CTA/copy, correct stable reference and zero new runtime Strapi fetch.
- [X] T054 [P] [US1] Integrate `ContentReportFlow` in `guiapineda-astro/src/templates/MilloraArticlePage.astro` after contribution content and before the final callout with `contentType="millora"`, `millora.documentId` and active `lang`; verify CA/ES/EN CTA/copy and static-first behavior.
- [X] T055 [P] [US1] Integrate `ContentReportFlow` in `guiapineda-astro/src/templates/CommercePage.astro` after the complete business detail with `contentType="comercio"`, required `comercio.documentId` and active `lang`; verify both category route shapes in CA/ES/EN and zero new runtime Strapi fetch.
- [X] T056 [US1] Add built-template/static markup assertions for all four integrations to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`: one CTA/form per detail, exact type/reference props, no action on list/submission/Foto del Mes surfaces, and no modification/import in `ComunicatArticlePage.astro`.

**Checkpoint**: all four existing detail types expose the same correctly bound flow; no excluded surface changes.

---

## Phase 9 — CA/ES/EN parity

**Purpose**: prove language parity independently of per-template integration.

- [X] T057 [US1] Add a CA/ES/EN copy completeness table assertion to `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` covering CTA, all five reasons, context/`otro`, email verification, validation, 503/rate-limit, confirmation, retry/close and navigation labels from `guiapineda-astro/src/components/ContentReportFlow.astro`.
- [X] T058 [US1] Validate in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` that CA/ES/EN serialize identical internal type/reason/language contracts and follow identical controller transitions in `guiapineda-astro/src/lib/contentReportFlow.ts`; reject fallback to another language for missing copy.
- [X] T059 [US1] Inspect the twelve existing route families under `guiapineda-astro/src/pages/` through their four shared templates and record a parity matrix in the implementation report: CTA, context, errors, verification, confirmation, navigation and failure recovery all use the active route language.

**Checkpoint**: CA, ES and EN differ only in copy, never in reporting capability or validation.

---

## Phase 10 — Feature 003 regression (Mandatory)

**Purpose**: prove the protected Communicat capability and existing data/workflow were not changed.

- [X] T060 [US3] Compare protected-file fingerprints from T003 for `guiapineda-astro/src/templates/ComunicatArticlePage.astro`, `src/components/CommunicatReportFlow.astro`, `src/lib/communicatReportFlow.ts` and both `netlify/functions/communicat-report*.mjs`; require no diff and inspect CA/ES/EN UI/form/confirmation behavior.
- [X] T061 [US3] Add/run real-module regression cases in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for the existing `communicat-report` scope, Function validator/HTTP adapter, stable ID+slug contract, invalid slug/reference, wrong scope and one-use token.
- [X] T062 [US3] Compare protected backend fingerprints for `guiapineda-strapi/src/api/denuncia-comunicat/` and `guiapineda-strapi/src/services/internal-communicat-report.js`; require unchanged schema/service, existing `pendiente|revisada|cerrada` behavior and no migration/rewrite of current rows.
- [X] T063 [US3] Exercise the existing Communicat backend service with controlled Documents Service doubles in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`; prove privacy, references, multiple reports and Content Manager-only schema remain valid while the dispatcher still selects its original branch.
- [X] T064 [US3] Recheck `guiapineda-strapi/.tmp/data.db` fingerprint/metadata and inspect the generated-type diff; require no legacy report data transformation and document that existing Content Manager records need no migration.

**Checkpoint**: Feature 003 is unchanged in UI, scope, Function, backend, schema, data, moderation, privacy and trilingual behavior.

---

## Phase 11 — Persistent QA

**Purpose**: complete the versioned evidence suite using real feature modules and controlled external-boundary doubles only.

- [X] T065 [US1] Complete validator/contract matrices in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for four types, three languages, five reasons, document-ID lengths 0/1/128/129, normalized email lengths 180/181, optional context, whitespace-only `otro`, explanation 1,000/1,001, malformed/duplicate/unexpected fields, files and the 16 KiB limit; assert the same exact bounds at UI, Function, backend and schema boundaries.
- [X] T066 [US2] Complete authoritative-reference matrices in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for valid/missing/unpublished/cross-type IDs, server slug changes, later deletion, commerce/category/subcategory published+active combinations and non-reassignment.
- [X] T067 [US4] Complete scope/Function/order matrices in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` for all legacy/new scopes, one-use, wrong purpose/email, `consume=0/backend=0` deterministic failures, status mapping and post-consumption 503 recovery.
- [X] T068 [US3] Complete privacy/moderation/atomicity matrices in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`: exact persisted keys, no identity/platform data, one create per valid call, independent duplicates, three manual states, no lifecycle and zero public-content writes/effects.
- [X] T069 [US3] Complete the Feature 003 regression group in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`, label every controlled double (Redis/email/outbound HTTP/Documents Service), import real parsers/services, and ensure no test depends on a temporary script or new package.
- [X] T070 Run `node guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` from the product parent/root context documented by the harness; require all groups PASS with deterministic cleanup and no network, deployed service or production-data dependency.

**Checkpoint**: the persistent harness demonstrates the local contracts, security invariants and compatibility claims reproducibly.

---

## Phase 12 — Browser / manual QA

**Purpose**: validate rendered behavior by surface and language with controlled local responses.

- [X] T071 [P] [US1] Execute the Agenda CA/ES/EN browser matrix using only the exact post-load strict `window.fetch` fixture in `guiapineda-astro/specs/006-private-multisection-reporting/quickstart.md`; across the three language routes record fixed-code verification plus at least one controlled `201`, `429` and `503`, normal/`otro`/boundary validation, confirmation/navigation, no unexpected fetch and fixture cleanup.
- [X] T072 [P] [US1] Execute the Veus CA/ES/EN browser matrix using only the same exact strict fixture; across the three language routes record fixed-code verification plus at least one controlled `201`, `429` and `503`, normal/`otro`/boundary validation, confirmation/navigation, no unexpected fetch and fixture cleanup.
- [X] T073 [P] [US1] Execute the Millorem CA/ES/EN browser matrix using only the same exact strict fixture; across the three language routes record fixed-code verification plus at least one controlled `201`, `429` and `503`, normal/`otro`/boundary validation, placement before the final callout, no unexpected fetch and fixture cleanup.
- [X] T074 [P] [US1] Execute the commerce CA/ES/EN browser matrix for category-only and category/subcategory detail routes using only the amended exact strict fixture in `quickstart.md`; record fixed-code verification plus at least one controlled `201`, `429` and `503`, normal/`otro`/boundary validation, navigation, no unexpected feature fetch and fixture cleanup. Prove the four exact documented Astro commerce audit reads do not affect feature counters, while negative probes for a different `/@fs/` resource, changed query, non-`GET` method, unrecognized API path and external origin each remain `unexpected fetch` failures.
- [X] T075 [US4] Inspect browser network/storage/accessibility evidence across T071–T074: the strict fixture intercepted only the three exact endpoints and allowed only its documented exact local Astro audit SVG reads; no request occurred on ordinary read/open/close apart from those classified development-infrastructure reads; no email/token entered local/session storage; `503` retained reason/context but required fresh verification; `429` never showed success; focus/error/result announcements worked; every run restored `window.fetch`; repeated reports showed no public effect/count and excluded surfaces had no CTA.
- [X] T076 [US3] Record real email delivery, deployed Upstash one-use behavior, Netlify enforcement, deployed Function→Strapi and deployed Content Manager verification as `DEFERRED — predeployment` in the implementation report per `quickstart.md`; explicitly distinguish this from the passing no-dependency local fixture and do not claim that controlled `201|429|503` responses are live-service evidence.

**Checkpoint**: all locally testable browser journeys pass; only explicitly external evidence remains deferred.

---

## Phase 13 — Builds / regression

**Purpose**: execute the complete local technical gate after implementation and browser QA.

- [X] T077 Run `node --check` on `guiapineda-astro/netlify/functions/content-report.mjs`, `content-report-http.mjs`, shared modified `.mjs` files, `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` and `guiapineda-strapi/src/services/internal-content-report.js`; require zero syntax errors.
- [X] T078 Only with T084–T088 complete and the retained backup still available, run `npm run strapi -- ts:generate-types` and `npm run build` in `guiapineda-strapi/`; require generated types remain limited to the new private schema, Strapi/Admin build passes, and post-command integrity/inventory evidence shows no destructive migration or unexpected `.tmp/data.db` mutation.
- [X] T079 Run `npm run build` in `guiapineda-astro/`; require Astro build passes and built output contains the report flow on all twelve surface/language combinations without new runtime CMS reads.
- [X] T080 Run `node guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` and `node guiapineda-astro/scripts/qa/commerce-submission-qa.mjs`; require both persistent harnesses PASS and record exact output.
- [X] T081 Re-run the scope-focused group in `guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs`; require seven legacy scopes plus `content-report`, cross-scope rejection, one-use and `communicat-report` regression all PASS after the final build.
- [X] T082 In both repositories run the exact final-review sequence from `quickstart.md`: `git status --porcelain=v1 --untracked-files=all`, unstaged/staged name inventories, `git ls-files --others --exclude-standard`, tracked/staged `git diff --check`, full diff/stat/status, and for **each** untracked file an unstaged `git diff --no-index -- /dev/null <file>` plus `git diff --no-index --check -- /dev/null <file>` and applicable syntax/QA parser; reconcile every individual path against `plan.md`, record whitespace/syntax/content review, verify protected fingerprints and stop on any out-of-allowlist or uninspected path.

**Checkpoint**: syntax, generated types, backend/admin build, Astro build, persistent QA, existing commerce QA, scopes and repository diffs all pass.

---

## Phase 14 — Final audit gate

**Purpose**: last mandatory gate; it cannot pass before every applicable prior task and validation.

- [X] T083 Audit the complete frontend/backend state—not only tracked diffs—against `origin/main` and the `plan.md` allowlist: prove every staged, unstaged and untracked path received the T082 full-content, whitespace-equivalent and syntax/QA review; require no dependency/lockfile, infrastructure, deploy config, migration, secret, `.env`, database, temporary, debugging, accidental `TODO|FIXME|HACK`, opportunistic refactor or protected-file change; directly verify server-derived slug/no client slug, email ≤180, document ID 1–128, `otro` trimmed-nonblank, explanation ≤1000, all four reference/eligibility matrices, strict browser-fixture cleanup, pre-start SQLite gate plus explicit approval, Feature 003 fingerprints/regressions, privacy, zero automatic effects, local evidence and exact `DEFERRED — predeployment` wording; mark PASS only after T001–T082 and T084–T088 are complete.

---

## User Story traceability and independent tests

| Story | Goal | Principal tasks | Independent test |
|---|---|---|---|
| US1 | Report Agenda, Veu, Millora or commerce in CA/ES/EN | T036, T039, T043, T045–T059, T065, T071–T074 | Open one detail of every type in each language, complete a verified valid report and see success only after controlled backend acceptance. |
| US2 | Store a precise private report for human review | T015, T017, T019–T023, T025, T029–T034, T041, T066, T084–T088 | Controlled backend resolves each declared type/ID, derives slug, creates exactly one pending private record and retains it after later content deletion; the additive schema sync is backed up, approved and verified. |
| US3 | Preserve Feature 003 and reporter privacy | T016, T018, T028, T050, T060–T064, T068–T069, T076, T084–T088 | Protected files/data remain unchanged; Communicat flow passes; new persisted records contain no reporter identity and remain Content Manager-only; pre-existing SQLite state is restorable. |
| US4 | Reject abuse/failures without content effects | T024, T026–T028, T031, T035, T037–T038, T042, T044, T048, T051, T067, T075 | Invalid/cross-type/nonpublic/wrong-scope/over-limit/503 cases create no false success, deterministic failures consume nothing, and public write counts remain zero. |

## Dependencies and execution order

```text
Phase 1 baseline
  -> Phase 2 shared verification scope
  -> Phase 3 backend model
  -> Phase 3A pre-schema SQLite gate and approved first sync
  -> Phase 4 backend validation/reference resolution
  -> Phase 5 backend creation/moderation
  -> Phase 6 Function/internal transport
  -> Phase 7 shared frontend flow
  -> Phase 8 surface integrations
  -> Phase 9 language parity
  -> Phase 10 Feature 003 regression
  -> Phase 11 persistent QA completion
  -> Phase 12 browser/manual QA
  -> Phase 13 builds/regression
  -> Phase 14 final audit gate
```

- Phase 1 evidence blocks every product-code change.
- T008 and T009 may run in parallel, then T010–T014 validate the combined sensitive change.
- T015 prepares the schema but cannot start Strapi; T084→T085→T086→T087→T088 is a hard,
  non-parallel gate before T017 or any other Strapi bootstrap/sync. T087 requires explicit human
  approval, and T088 retains the backup while proving the first sync additive.
- T017 follows T088; backend parsing/resolution T019–T029 precedes creation T030–T035.
- The Function validator/HTTP adapter depend on the agreed backend contract; dispatch T041 requires
  the backend service to exist.
- Shared component/controller must complete before T052–T055; those four template integrations may
  run in parallel because they modify separate files.
- T057–T059 require all surface integrations. Feature 003 regression then validates the complete
  shared diff, followed by consolidated QA.
- T071–T074 may run in parallel after a runnable controlled local preview/dev session is available;
  their recorded evidence must be complete before T075–T076 and the formal Phase 13 build gate.
- T078 cannot run until T084–T088 pass. T083 remains strictly last in execution despite the
  ANALYZE-appended T084–T088 identifiers and cannot pass on partial implementation.

## Parallel execution examples

### Sensitive scope additions after baseline

```text
T008: component/type declarations
T009: controller/server allowlists
```

### Surface integrations after the shared flow

```text
T052: AgendaArticlePage.astro
T053: VeuArticlePage.astro
T054: MilloraArticlePage.astro
T055: CommercePage.astro
```

### Manual browser matrices after a runnable build

```text
T071: Agenda CA/ES/EN
T072: Veus CA/ES/EN
T073: Millorem CA/ES/EN
T074: Commerce CA/ES/EN
```

No tasks that touch the same shared service, component, controller or QA harness are marked parallel.

## MVP definition

The technically demonstrable MVP is US1 backed by the minimum safe portions of US2 and US4: Phases
1–9 plus the corresponding persistent QA cases T065–T068 and local syntax/build tasks T077–T081.
It demonstrates one shared verified flow on all four surfaces in CA/ES/EN, authoritative private
creation and safe failures. This checkpoint does **not** authorize partial closure, partial commit or
deployment: Feature 006 is complete only after mandatory Feature 003 regression, all QA/browser
tasks and T083 pass.

## Implementation strategy

1. Establish immutable baseline evidence and the persistent harness before edits.
2. Make the smallest sensitive scope changes and prove legacy/new isolation immediately.
3. Prepare the additive private model, pass the stopped-process/backup/integrity/human-approval gate,
   perform the first controlled sync, and prove the original SQLite state remains restorable.
4. Build the authoritative backend from parser through single create.
5. Add the bounded Function/internal route, then the shared UI and four separate integrations.
6. Prove trilingual parity and Feature 003 compatibility before consolidating the QA suite.
7. Execute the strict local browser fixture, syntax, generated-type, build, untracked-aware diff and final-audit gates.
8. After IMPLEMENT, run ANALYZE, remediate findings through new explicit tasks if needed, then run
   CONVERGE final before any future commit/push decision. This TASKS phase authorizes none of those
   later operations.

## Notes

- Every checkbox must be completed with command/diff evidence, not inference.
- `DEFERRED — predeployment` is the correct state for unavailable live-service evidence, not FAIL.
- No task authorizes commit, push, deploy, infrastructure, migration or production-data access.
- If implementation evidence contradicts SPEC/PLAN, stop and return to the appropriate SDD phase.

## Implementation evidence — 2026-09-24 pause before T014

- **T001**: frontend `main` at `bd85981672bbfc430572ae010db05874b66ea8a2`, backend `main` at `3b0dfd5fef5d4c31a408d031e163e92ef40a4210`; both `0/0`. Frontend initially contained only untracked Feature 006 SDD; backend was clean.
- **T002**: planned T006/T008/T009 paths reconciled with the closed allowlist before editing. Ignore files were inspected and required no out-of-scope change.
- **T003**: protected frontend SHA-256 values: `ComunicatArticlePage.astro af21e6dd…f4b97`, `CommunicatReportFlow.astro 9e13714b…f4b97`, `communicatReportFlow.ts 5be64f4e…6525`, `communicat-report.mjs 6e0c764c…1588`, `communicat-report-http.mjs 71dbae47…e39d`; backend `denuncia-comunicat/schema.json 4b27ddd2…aac`, `internal-communicat-report.js 1683a1f7…05f0`.
- **T004**: effective SQLite configuration resolves to `guiapineda-strapi/.tmp/data.db`; configured default port is `1337`; no Strapi process and no listener on 1337. Initial DB: 1,830,912 bytes, mtime `2026-09-22T20:45:49+0200`, SHA-256 `2832dd0080052b09c40014ab6f7c850d5eff0926549bbc86cbb3705f3cfc774d`; no `-wal`, `-shm` or `-journal` sidecars found.
- **T005**: `node --check` passed for both protected Communicat Function modules and the backend Communicat service; pre-change `node scripts/qa/commerce-submission-qa.mjs` returned PASS.
- **T006**: created versioned `scripts/qa/multisection-reporting-qa.mjs` with `node:assert`, repository roots, documented Redis/email/HTTP/Documents Service double boundaries and explicit implemented/not-implemented group registry; `node --check` passed.
- **T007**: the SDD set agrees on four types, five reasons, three states, `content-report`, `content_report` and privacy exclusions; prior ANALYZE recorded 0 findings.
- **PLAN blocker I-001**: after the allowlisted one-value scope additions for T008/T009, the protected `scripts/qa/commerce-submission-qa.mjs` fails at its exact seven-scope assertion because `VERIFICATION_SCOPES` now correctly contains `content-report`. T080 requires this existing harness to PASS, but PLAN both excludes it from the implementation allowlist and names existing commerce QA as protected. No out-of-allowlist edit was made. Return to PLAN to authorize the minimal expected-scope assertion update before resuming T008–T014.
- **Factual SQLite-gate state at pause**: T084, T085, T086, T087 and T088 were all `NOT EXECUTED`; human approval was not reached. `IMPLEMENT: PAUSED BEFORE SQLITE GATE — PLAN ALLOWLIST BLOCKER`.
- **PLAN blocker I-001 resolution**: PLAN now authorizes only the exact shared-scope expectation in `scripts/qa/commerce-submission-qa.mjs`; its sole code diff appends `content-report` after the seven unchanged historical scopes. Full Feature 005 commerce QA and the Feature 006 scope group both PASS. The latter proves request-code, verify-code, email/scope binding, cross-scope rejection, one-use consumption, wrong-email rejection and independent `communicat-report`. No SQLite-gate task was executed during this remediation.
- **T015–T016**: added schema-only `api::denuncia-contenido.denuncia-contenido`; JSON parsing and the persistent `schema` QA group PASS for exact enums/defaults, ID 1–128, slug 1–250, explanation ≤1000, no identity/relation/media/localization and no public API siblings. No Strapi command ran.
- **T084**: effective configuration is SQLite at `/Users/gerardolmos/CURRO/WEB/Guia-Pineda/guiapineda-strapi/.tmp/data.db`, port `1337`; `pgrep` and `lsof` returned no process/listener. Source size 1,830,912 bytes, mtime `2026-09-22T20:45:49+0200`, SHA-256 `2832dd0080052b09c40014ab6f7c850d5eff0926549bbc86cbb3705f3cfc774d`; no WAL/SHM/journal sidecar.
- **T085**: retained backup `/private/tmp/guiapineda-006-pre-schema.0nFXHs`; physical `source-files/data.db` SHA-256 equals the source (`2832dd00…774d`); logical `restore.db` SHA-256 is `2b4c17bf5d513b54e324317ac1c3c79b2cd823bbb8682f2294a4f319bdcf415e`. Nothing was overwritten.
- **T086**: source and logical backup each returned `PRAGMA integrity_check = ok` and zero `PRAGMA foreign_key_check` rows; their ordered `sqlite_master` inventories match exactly at 256 objects. Restoration source is `restore.db`; documented command (not executed): `sqlite3 /absolute/path/to/replacement.db ".restore '/private/tmp/guiapineda-006-pre-schema.0nFXHs/restore.db'"`.
- **T087**: Gerard supplied explicit human approval: “Sí, autorizo que Strapi arranque y cree la nueva estructura en la SQLite local.” The approval is limited to the first controlled local schema bootstrap/sync in T088 and grants no destructive, infrastructure, editorial, commit, push or deployment permission. Persistent pre-schema backup retained at `/Users/gerardolmos/CURRO/WEB/Guia-Pineda/backups/006-private-multisection-reporting/pre-schema-20260924-2832dd00`.
- **T088 FAIL**: immediate pre-check found no Strapi process, no listener on port `1337`, no SQLite sidecars and the exact pre-sync SHA-256 `2832dd0080052b09c40014ab6f7c850d5eff0926549bbc86cbb3705f3cfc774d`. The repository-normal `npm run develop` reached schema loading/sync but failed before a running state with `Error: bind EPERM null:5173` while creating the development admin; no Admin/data/editorial action occurred. The process exited and no automatic restore was attempted. SQLite post-failure SHA-256 is `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`; `PRAGMA integrity_check` is `ok` and `foreign_key_check` has zero rows. The ordered non-internal `sqlite_master` inventory changed additively from 256 to 260 objects: table `denuncias_contenido` plus indexes `denuncias_contenido_created_by_id_fk`, `denuncias_contenido_documents_idx` and `denuncias_contenido_updated_by_id_fk`; no prior object was removed or modified. All 67 pre-existing table contents were compared to persistent `restore.db`: 63 are byte-value/set-and-count equivalent; the only differences are expected Strapi metadata/RBAC additions (`admin_permissions` 145→150, `admin_permissions_role_lnk` 145→150, `strapi_core_store_settings` 48→49 and refreshed `strapi_database_schema` 1→1). `strapi_content_types_schema` adds only `api::denuncia-contenido.denuncia-contenido`; five Super Admin Content Manager permissions and links were added. `denuncias_comunicat` remains structurally unchanged with 0→0 rows. `denuncias_contenido` exists with the expected Strapi-managed columns and 0 rows. T088 remains unchecked because Strapi did not complete a successful startup; no further start was performed.
- **T088 controlled-retry authorization**: Gerard explicitly authorized exactly one retry with: “Sí, autorizo el reintento controlado de T088 ejecutando una sola vez `npm run start`, con las comprobaciones pre/post indicadas y sin continuar después.” T088 remains unchecked until that single attempt reaches an operational start, is stopped normally, and every required post-check passes.
- **T088 controlled retry PASS**: immediately before the retry, no Strapi process or listener on `1337`/`5173` existed; no `data.db-wal`, `data.db-shm` or `data.db-journal` sidecar existed; SQLite SHA-256 was `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`; `PRAGMA integrity_check` returned `ok`; `PRAGMA foreign_key_check` returned zero rows; the inventory contained 260 non-internal objects; all 68 table row counts and per-table dump hashes were captured; `denuncias_comunicat` and `denuncias_contenido` each contained 0 rows. Exactly one `npm run start` was executed from `guiapineda-strapi`; Strapi 5.41.1 reported `Strapi started successfully` on `http://localhost:1337` after 883 ms. It was immediately terminated with `Ctrl-C`; Strapi reported `Shutting down Strapi` and `Strapi has been shut down`, exit code 0. Post-stop checks found no Strapi process or listener on `1337`/`5173`, no SQLite sidecars, the identical SQLite SHA-256, `integrity_check = ok`, zero foreign-key incidences, an identical 260-object `sqlite_master` inventory, and identical row counts and per-table dump hashes for all 68 tables. No object or data was added, removed or modified by the retry. `denuncias_comunicat` remains structurally identical and empty; `denuncias_contenido` remains valid and empty. The persistent pre-schema backup remains intact: physical SHA-256 `2832dd0080052b09c40014ab6f7c850d5eff0926549bbc86cbb3705f3cfc774d`, logical `restore.db` SHA-256 `2b4c17bf5d513b54e324317ac1c3c79b2cd823bbb8682f2294a4f319bdcf415e`, backup integrity `ok`. No Admin interaction, restore, second start, T017+, commit, push or deploy occurred. `IMPLEMENT: PAUSED AFTER SUCCESSFUL CONTROLLED START`.
- **T017–T018 PASS**: `npm run strapi -- ts:generate-types` completed with 0 warnings/errors from Typegen. `types/generated/contentTypes.d.ts` changed by exactly 67 additive lines: one `ApiDenunciaContenidoDenunciaContenido` interface with the approved collection, bounds, enums/default and one UID registry entry; `components.d.ts` did not change. SQLite remained at SHA-256 `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`, `integrity_check = ok`, zero foreign-key rows. The retained pre-schema inventory has 256 objects and the post-schema baseline 260; the only additions are `denuncias_contenido` plus its three expected indexes, with no removals. `denuncias_comunicat` and `denuncias_contenido` remain at 0 rows. Protected Feature 003 hashes remain `4b27ddd2…aac` for its schema and `1683a1f7…05f0` for its service. No data transformation, legacy migration or renewed schema sync occurred.
- **T019–T035 PASS**: added allowlisted `src/services/internal-content-report.js` with an exact five-key parser, fixed four-type UID map, published `documentId` lookups, server-only slug derivation, explicit commerce/category/subcategory publication and active-state resolution, cross-category rejection and a single private pending create. The persistent backend QA group imports the real service with controlled Documents Service doubles and passes type/reference 0/1/128/129, five reasons, three languages, explanation 1000/1001, forbidden identity/client-context fields, missing/cross-type/inactive references, both commerce relation shapes, changed slug, later deletion, duplicate reports, create failure and zero public update/delete/publish/unpublish cases. Commands `node --check src/services/internal-content-report.js` and QA groups `scope`, `schema`, `backend` PASS; full Feature 005 commerce QA PASS; both repository `git diff --check` commands PASS. SQLite and protected Feature 003 hashes remain unchanged.
- **T036–T044 PASS**: added allowlisted pure validator and HTTP adapter for `/api/submissions/content-report`, with exact browser fields, normalized email ≤180, document ID ≤128, explanation ≤1000, 16 KiB multipart ceiling, no files, deterministic validation before token consumption, exact `content-report` scope and privacy-preserving `content_report` transport. The shared internal section set gained only `content_report`; the backend controller gained one explicit dispatch while retaining `communicat_report` and generic branches. The persistent Function QA group passes valid 201, deterministic 400/405/413/415 with `consume=0/backend=0`, verification rejection/unavailability, collapsed downstream 401/403/404/503, rate-limit declaration, private payload projection and authenticated FormData transport. Syntax, `scope`, `backend`, `function`, Feature 005 commerce QA and both `git diff --check` validations PASS; SQLite remains unchanged.
- **T045–T051 PASS**: added the single allowlisted CA/ES/EN `ContentReportFlow` component and controller with exact props, build-time stable-ID assertion, native/UI/controller bounds, `content-report` verification, 201+`{ok:true}` receipt gating, localized 400/429/503 recovery, human-review-only success, accessible hooks/labels/focus regions and no title/body/personal snapshot or browser storage. Possible-consumption failures and close reset email/token while retaining only reason/context. The existing email controller now explicitly blocks normalized email over 180 before request-code. Persistent `client`, `scope`, `schema`, `backend` and `function` groups PASS; Feature 005 commerce QA and both repository `git diff --check` validations PASS. SQLite remains at SHA-256 `ff39926c…4843`, integrity `ok`, zero foreign-key incidences.
- **T052–T059 PASS**: the shared component is rendered exactly once after Agenda/Veus content, after Millorem content and before its final callout, and after complete commerce detail for both commerce route shapes. Each binding uses the active language, fixed type and server-fetched `documentId`; no template adds a runtime CMS read. Persistent `integration` QA proves these are the only four consumers and Communicat/excluded surfaces have no import. Persistent `language` QA proves complete CA/ES/EN report and verification copy, one language-independent value/transition contract and the 12-row route-family matrix: Agenda, Veus, Millorem and Commerce (both route shapes grouped) × CA/ES/EN all pass CTA/context/errors/verification/confirmation/navigation/recovery through their shared templates.
- **T060–T064 PASS**: all seven protected Feature 003 SHA-256 fingerprints exactly match T003. The persistent `feature003` group imports the real validator/HTTP adapter/backend service and passes stable ID+slug, invalid reference/slug, exact `communicat-report` scope, wrong-scope rejection, one-use token, private payload, independent duplicate reports and the unchanged dispatcher/schema states. `denuncias_comunicat` remains at 0 rows and needs no migration; generated types add only Feature 006 after the intact `ApiDenunciaComunicatDenunciaComunicat`. SQLite SHA-256 remains `ff39926c…4843`, integrity `ok`, zero foreign-key incidences; both repository diff checks PASS.
- **T065–T070 PASS**: the versioned harness now covers exact UI/Function/backend/schema bounds, all content/reason/language values, malformed multipart cases, deterministic consume ordering, every legacy/new scope, authoritative missing/unpublished/cross-type references, server slug changes, deletion retention, both commerce relation shapes plus category/subcategory eligibility, atomic private creates, duplicates, manual-only states and no public effects/lifecycle. Controlled boundaries are explicitly limited to Redis/email delivery, outbound HTTP and Strapi Documents Service; real parsers/services are imported. From the product parent, `node guiapineda-astro/scripts/qa/multisection-reporting-qa.mjs` returned PASS for `scope`, `schema`, `backend`, `function`, `client`, `integration`, `language`, `feature003`; Feature 005 commerce QA also PASS. No network, deployment, production data, temporary script or new package was used.
- **T071 BLOCKED — local detail route unavailable**: the frontend-only Astro dev server was started on `127.0.0.1:4321` after the sandbox bind restriction was approved, but `/agenda/` returned the existing server-side `TypeError: fetch failed` before any detail route or browser fixture could load. No `.env` file exists, so the effective CMS source is the stopped local Strapi. The pre-existing `dist/` had no Feature 006 markup; an unmarked enabling `npm run build` was attempted and failed during static-route generation with the same `fetch failed`, leaving `dist/` empty. Starting Strapi would contradict the strict post-load browser-fixture procedure and the rule against routine boot/schema sync, while inventing a general CMS passthrough or fixture page is outside the allowlist. T071 remains unchecked; T072+ were not attempted. No browser form submission, external request, Strapi start or SQLite write occurred. `IMPLEMENT: PAUSED AT T071 — controlled detail route required`.
- **T071 PASS / prior blocker resolved**: with the already-approved post-schema SQLite baseline, local Strapi was started read-only via `npm run start` and Astro on `127.0.0.1:4321`; the exact post-load fixture ran on CA/ES/EN Agenda routes. Returned fixture receipts were respectively `201`, `429`, `503`, each with `requestCode=1`, `verifyCode=1`, `submit=1`, the same server-rendered document ID and `pass=true`. CA additionally proved whitespace-only `otro` disabled submission, 1,001 characters were preserved with `aria-invalid=true`, malformed and 181-character email attempts exposed no code step, 1,000 characters plus fixed code `123456` enabled one submission, and the localized success receipt appeared. ES never showed success on `429`; EN used `otro` and the unavailable recovery. Every successful `finish()` restored `window.fetch`; no real report endpoint or SQLite write was used.
- **T072–T073 partial browser evidence, not marked complete**: Veus and Millorem each completed CA/ES/EN exact-fixture journeys with controlled `201`, `429`, `503`; every recorded receipt had exactly one request-code, verify-code and submission call and `pass=true`. Normal and `otro` paths, localized receipts/errors and Millorem placement before the final callout were observed. Their task-local boundary probes were not completed before the T074 stop, so neither task is marked PASS by inference.
- **T074 BLOCKED — exact fixture conflicts with Astro commerce audit**: on the category-only commerce route, the unchanged strict fixture intercepted Astro dev-toolbar audit reads for `arribar.svg`, `trucar.svg`, `mail.svg` and `web.svg` under `/@fs/...`, recorded them as `CONTENT REPORT QA FAIL: unexpected fetch`, and therefore correctly refused to return a passing `finish()` result. Reloading, waiting 2.5 seconds after load and retrying did not remove the conflict because the audit reruns after form DOM mutations. The documented fixture allows only its exact three endpoints plus `/src/assets/images/guiapinedaInv.svg`; no allowlist expansion, toolbar preference/configuration change, alternate fixture, file edit or PASS claim was made. Resolving T074 requires an explicit PLAN decision either to authorize disabling Astro's dev toolbar for this controlled browser session or to amend the exact fixture's narrowly allowed local audit assets. `IMPLEMENT: PAUSED AT T074`.
- **PLAN blocker I-002 resolution — T074 fixture authorization**: PLAN classifies the four observed commerce icon reads as local Astro development-toolbar infrastructure and authorizes only the strict `quickstart.md` fixture amendment for their exact repository-relative suffixes, same-origin `GET /@fs/...`, no hash and the exact observed image-service query. There is no general asset, path, domain or network passthrough; every other fetch remains a recorded failure. T074 additionally requires negative-probe regression evidence before PASS. No product/configuration file, `.astro/settings.json`, build/preview workaround, SQLite action or task checkbox is authorized by this PLAN change; T072, T073 and T074 remain pending.
- **Controlled browser-session shutdown**: the QA tab, Astro dev server and Strapi were closed after the T074 stop. Ports `1337`, `4321` and `5173` have no listener and no Strapi/Astro process remains. SQLite SHA-256 is still `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`; `integrity_check = ok`, `foreign_key_check` has zero rows, no WAL/SHM/journal sidecar exists, and both `denuncias_comunicat` and `denuncias_contenido` remain at zero rows. No real report write, Admin interaction, commit, push or deploy occurred.
- **T072–T073 PASS — recovered browser evidence**: the earlier CA/ES/EN `201|429|503` receipts remain valid and each task's missing local boundary probe now passes independently. Veus and Millorem each proved required reason, whitespace-only `otro` rejection, explanation 1,000 accepted/1,001 rejected, malformed and normalized 181-character email blocked before code entry, successful fixed-code verification, email-change invalidation, safe-draft preservation across close/reopen, email/token cleanup, empty local/session storage and restored `window.fetch`; both returned `pass:true`. Millorem remained before its final related-content callout.
- **T074 PASS — strict commerce matrix and PLAN I-002 regression**: category-only `/punts-de-interes/ajuntament` and category/subcategory `/alimentacio/fleques/panaderia-jose` ran in CA/ES/EN. Category receipts were CA `201`, ES `429`, EN `503`; subcategory receipts were CA `503`, ES `201`, EN `429`. Every receipt had the rendered stable `documentId`, exactly one request-code, verify-code and submit call, the expected response status, clean fixture restoration and `pass:true`; `429|503` showed no success and cleared email/token/verification while retaining reason/context. Each run explicitly fetched only the four authorized toolbar assets and received `[200,200,200,200]` without changing functional counters. Ten fresh-reload negative probes—other `/@fs/` icon, changed query, additional query, hash, `POST`, other origin, other local resource, CMS path, unknown Function path and external URL—each produced `unexpected fetch`, made a completed otherwise-valid journey fail `finish()` with `captured browser errors: 1`, restored `window.fetch` and returned probe `pass:true`. Commerce boundary probes matched T072/T073 and local/session storage remained empty.
- **T075 PASS — consolidated browser inspection**: T071–T074 receipts prove the closed fixture saw exactly one request-code, one verify-code and one submission per journey, passed through only the documented local audit SVGs, restored `window.fetch`, left local/session storage empty and never showed success for `429|503`; the `503` recovery retained only reason/context and required new verification. Live DOM inspection confirmed the disclosure closes with focus on its `SUMMARY` and reopens with keyboard `Space`, success uses `role=status` plus `tabindex=-1`, error uses `role=alert` plus `tabindex=-1`, and no public report-count hook exists. Repeated controlled successes produced no public effect/count. `/punts-de-interes`, `/alta-comerc/` and `/foto-del-mes` each returned `formCount=0` and `ctaCount=0` for the generic report flow.
- **T076 — DEFERRED — predeployment**: real verification-email delivery and code entry; deployed Upstash one-use behavior; deployed Netlify rate-limit enforcement; authenticated deployed Function→Strapi delivery; private-entry visibility and human state editing in deployed Content Manager; and confirmation against deployed public content that reporting causes no automatic effect remain `DEFERRED — predeployment`. Passing local doubles, builds and controlled `201|429|503` fixture responses are explicitly not live-service evidence.
- **T077–T081 PASS — final technical regression**: `node --check` returned exit 0 for both new Functions, both modified shared `.mjs` modules, the Feature 006 harness and the backend service. The retained persistent backup exists. Backend Typegen completed with 0 warnings/errors; generated types differ only by the 67-line private collection interface plus its UID registration. Strapi/Admin build passed. SQLite stayed at SHA-256 `ff39926c…4843`, integrity `ok`, zero FK rows, no sidecars and identical structural hashes (`sqlite_master 4a9db172…560e`, table-column inventory `59320f09…9b1`). Astro built 490 static pages; twelve representative Agenda/Veus/Millorem/commerce CA/ES/EN outputs contain the shared form and built JS contains no local CMS API read. The complete Feature 006 harness returned PASS for `scope`, `schema`, `backend`, `function`, `client`, `integration`, `language`, `feature003`; Feature 005 commerce QA returned PASS; a final isolated `--group scope` run returned PASS after the builds.
- **T082 PASS — exhaustive repository review**: exact status/name/staged/untracked/diff-check/full-diff sequences ran in both repositories; neither has staged paths. Frontend inventory is 10 modified tracked paths and 15 individual untracked paths; backend is 2 modified tracked and 2 untracked. Every path was reviewed in full and reconciled: all product/backend/shared/QA changes are explicitly allowlisted; Feature 006 SDD files are allowlisted, while the pre-existing `spec.md` and `checklists/requirements.md` are the PLAN-declared approved read-only inputs and were not changed during IMPLEMENT. Every one of the 17 untracked files ran individual full `git diff --no-index -- /dev/null` plus `--check`; exit 1 denoted an added file and no whitespace diagnostic was emitted. New `.mjs`/`.js` syntax, schema JSON, imported TS/Astro via harness/build and all Markdown content checks passed. No staged, secret, personal fixture data, SQLite, sidecar, screenshot, generated browser artifact or log appears. All seven Feature 003 protected files have no diff and exact SHA-256 values `af21e6dd…36e8`, `9e13714b…4b97`, `5be64f4e…6525`, `6e0c764c…1588`, `71dbae47…e39d`, `4b27ddd2…5aac`, `1683a1f7…05f0`.
- **T083 PASS — final IMPLEMENT audit**: T001–T082 and T084–T088 are complete. Both repos remain `main...origin/main`, dirty only for the audited Feature 006 implementation/SDD set, with zero staged files. There are no dependency/lockfile, infrastructure/deploy configuration, migration, secret, `.env`, database, sidecar, temporary/debug artifact, accidental product `TODO|FIXME|HACK`, opportunistic refactor or protected-file changes. Direct source plus passing matrices prove the client never sends `contenido_slug`; the backend resolves a fixed UID and derives the current slug; email is bounded at 180; document ID at 1–128; `otro` is trimmed-nonblank; explanation is at most 1,000; all four missing/unpublished/cross-type and commerce eligibility cases reject; duplicates remain independent; persistence excludes reporter/platform identity; and no public content update/publish/unpublish/delete or automatic effect exists. Browser fixture cleanup, SQLite approval/gate evidence, Feature 003 fingerprints/regression, Feature 005 regression, CA/ES/EN, privacy, human-only moderation and the exact `DEFERRED — predeployment` boundary all pass. Final SQLite SHA-256 is `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843`, integrity `ok`, zero FK rows, no sidecars, and both report tables remain empty. No commit, push or deploy occurred. `IMPLEMENT: COMPLETE — AWAITING FINAL REVIEW / CONVERGE`.
