# Implementation Plan: Denuncia privada multisección

**Branch**: `006-private-multisection-reporting` (logical feature name; Git remains on `main`) | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-private-multisection-reporting/spec.md`

## Summary

Extend the existing private reporting capability to the individual public details of Agenda, Veus,
Millorem Pineda and commerce, with complete CA/ES/EN parity, one-time email verification and human
moderation. The selected architecture leaves feature 003 unchanged and adds one shared mechanism
for the four new content types: a shared Astro report flow, one Function endpoint, one verification
scope, one authenticated internal section and one private Strapi collection. The browser supplies a
content type and Strapi `documentId`; Strapi resolves the currently published document, derives a
minimal slug snapshot and creates one independent pending report. No public content is changed.

## Technical Context

**Language/Version**: TypeScript/Astro and JavaScript ESM on Node.js `>=22.12.0` (frontend);
JavaScript CommonJS on Node.js `>=20.0.0 <=24.x.x` (backend)

**Primary Dependencies**: Astro 7.2.4, Tailwind CSS 4.3.3, Strapi 5.41.1, existing Upstash
verification/rate-limit utilities; no new dependency

**Storage**: existing Strapi SQLite database; one additive private collection type; existing
temporary verification store only; no migration of `denuncias_comunicat`

**Testing**: versioned Node `assert` QA harness, frontend and backend builds, Strapi generated types,
static-output inspection and manual browser matrix; deployed integration remains predeployment

**Target Platform**: static Astro output plus Netlify Functions; private Strapi administration

**Project Type**: two-repository static web application with serverless submission boundary and CMS

**Performance Goals**: no new request during ordinary detail reading; one Function request, bounded
type-specific eligibility lookups and one create per accepted report; no public page-size dependency
on the number of reports

**Constraints**: CA/ES/EN parity; static-first; no citizen account; no reporter identity, IP or
user-agent persistence; no attachment; no automatic content action; no new infrastructure, service
or dependency; no destructive SQLite operation; feature 003 compatibility

**Scale/Scope**: four existing detail surfaces, twelve language/surface route families, five fixed
reasons, one new private entity and one minimal three-state human workflow

## Constitution Check

### Gate before research

| Principle | Result | Evidence and plan consequence |
|---|---|---|
| I. Editorial participation | PASS | Reports are private notices reviewed by humans; no comments, profiles or automatic publication. |
| II. Static-first | PASS | The detail receives `documentId` at build time. Only explicit submission calls the Function and Strapi. |
| III. Privacy and security | PASS | Existing verification, one-time token, platform limiting and internal bearer boundary are reused; email is removed before Strapi. |
| IV. Data integrity | PASS | The change is additive. Existing report data and schema are untouched; no migration or destructive command is planned. |
| V. Simplicity | PASS | One shared mechanism covers four equivalent surfaces with no dependency or service addition. |
| VI. Multilingual/no regression | PASS | One shared component contains complete CA/ES/EN copy; Comunicats retain their existing path and receive explicit regression coverage. |
| VII. Coordinated repositories | PASS | Frontend owns UI, verification and Function contracts; backend owns authoritative eligibility and private persistence. |

Security-sensitive files may change only where the new explicit values must be allowlisted. No
existing verification semantics, secret handling, TTL, token binding or consumption behavior may be
altered.

### Gate after design

PASS. Research selected the smallest design that satisfies stable cross-type references without a
legacy migration. The data model excludes personal fields and relations; contracts validate every
trust boundary; quickstart requires builds, versioned persistent QA, multilingual inspection and
feature 003 regression. No constitutional exception or complexity waiver is required.

## Architectural Decision

The selected option is **B: keep feature 003 intact and add one general mechanism only for Agenda,
Veus, Millorem and commerce**.

- Existing `denuncia-comunicat`, `CommunicatReportFlow`, Function modules, verification scope and
  backend service remain the compatibility baseline and are not generalized.
- The four new surfaces use `ContentReportFlow.astro`, `contentReportFlow.ts`,
  `content-report.mjs`, `content-report-http.mjs`, verification scope `content-report`, internal
  section `content_report` and private content type `denuncia-contenido`.
- Shared low-level verification and internal transport are extended by explicit allowlist entries
  only. Existing behaviors are reused, not refactored.

Option A, generalizing feature 003 into one polymorphic model and flow, was rejected because it
would require a migration or a mixed legacy schema, touch a closed security-sensitive path and add
regression risk without user value. Option C, four separate models/endpoints/scopes, was rejected
because identical privacy and workflow rules would be duplicated. Extending the legacy table with
optional generic fields was also rejected because it weakens invariants and complicates SQLite
compatibility.

## End-to-End Design

1. The shared detail template renders a report component with the language, fixed content type and
   Strapi `documentId`. It does not send a slug, title or public-state claim as authoritative input.
2. The visitor chooses one of the five exact reasons, supplies conditional private context and
   verifies an email under scope `content-report`.
3. The Function strictly parses bounded multipart data, rejects files, duplicates, unexpected
   fields and honeypot values, validates all deterministic fields, then consumes the token.
4. Email, token and honeypot are discarded. Only type, document ID, reason, optional explanation
   and request language cross the authenticated internal boundary as section `content_report`.
5. The backend repeats strict validation, selects the content UID from a fixed server allowlist,
   resolves exactly that `documentId`, requires current publication and type-specific public
   eligibility, and derives the current slug.
6. One private `denuncia-contenido` record is created with `pendiente`; no update, publish,
   unpublish, delete, scoring or notification is applied to the public document.
7. The Function reports success only after backend acceptance. If the backend fails after token
   consumption, the UI keeps reason/context, clears verification and requires a new code.

### Public eligibility rules

| Type | Strapi UID | Required at submission |
|---|---|---|
| `agenda` | `api::agenda.agenda` | exact `documentId`, published document, nonblank current slug |
| `veu` | `api::veu.veu` | exact `documentId`, published document, nonblank current slug |
| `millora` | `api::millora.millora` | exact `documentId`, published document, nonblank current slug |
| `comercio` | `api::comercio.comercio` | exact `documentId`, published, `activo === true`, published active category; when a subcategory exists it must also be published and active |

The backend must use Strapi Documents Service with `status: "published"`. For commerce it first
populates only the relation identifiers, then resolves the category and optional subcategory by
their own `documentId` and published status before checking `activa`; it must not infer publication
from a populated object. A valid identifier under another UID is cross-type and must fail. A slug
change does not invalidate the identity: the backend stores the current slug at acceptance. A
report remains independent if content changes or is later deleted.

### Atomicity and failure boundaries

- All parsing, verification, authoritative lookup and eligibility checks precede creation.
- The only durable write in the reporting path is one Documents Service `create` for the private
  report. A failed create yields no accepted report and no partial public-content change.
- The token store's existing atomic consume remains authoritative. No distributed transaction is
  added. Consequently, a downstream failure can consume authorization without creating a report;
  the documented recovery is a fresh verification, never a false success.
- Multiple valid reports are independent by design; there is no uniqueness key, deduplication,
  counter-triggered action or idempotency record.

## Change Boundaries

### Frontend repository: files expected to be added

```text
src/components/ContentReportFlow.astro
src/lib/contentReportFlow.ts
netlify/functions/content-report.mjs
netlify/functions/content-report-http.mjs
scripts/qa/multisection-reporting-qa.mjs
```

### Frontend repository: existing files allowed to change

```text
src/templates/AgendaArticlePage.astro
src/templates/VeuArticlePage.astro
src/templates/MilloraArticlePage.astro
src/templates/CommercePage.astro
src/components/EmailVerificationBlock.astro
src/lib/emailVerification.ts
src/lib/emailVerificationController.ts
netlify/functions/_shared/verification-core.mjs
netlify/functions/_shared/strapi-submission.mjs
```

The verification files may receive only the `content-report` scope/type entry. The internal
transport may receive only the `content_report` section entry. Shared templates may receive the
new import, a required `documentId` assertion and one component placement.

### Backend repository: files expected to be added

```text
src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json
src/services/internal-content-report.js
```

### Backend repository: existing files allowed to change

```text
src/api/internal-submission/controllers/internal-submission.js
types/generated/contentTypes.d.ts
```

The controller change is one explicit `content_report` dispatch while preserving the current
`communicat_report` branch and generic submission branch. Generated types are regenerated by
Strapi, never hand-edited.

### SDD and QA files allowed to change or be added

```text
specs/006-private-multisection-reporting/plan.md
specs/006-private-multisection-reporting/research.md
specs/006-private-multisection-reporting/data-model.md
specs/006-private-multisection-reporting/quickstart.md
specs/006-private-multisection-reporting/tasks.md
specs/006-private-multisection-reporting/contracts/public-function-contract.md
specs/006-private-multisection-reporting/contracts/internal-backend-contract.md
specs/006-private-multisection-reporting/contracts/ui-contract.md
scripts/qa/multisection-reporting-qa.mjs
scripts/qa/commerce-submission-qa.mjs
```

During IMPLEMENT, `tasks.md` may change only to mark checkboxes, attach command/result evidence, or
append explicit remediation phases produced by a later ANALYZE/CONVERGE pass. Its presence in the
allowlist does not authorize changing requirements, contracts or design decisions from IMPLEMENT.
The already approved `spec.md`, requirements checklist and other feature 006 SDD artifacts are
read-only inputs unless work formally returns to their corresponding SDD phase. If IMPLEMENT
discovers a necessary product, backend, shared, QA or SDD file outside this closed allowlist, work
must stop, document the blocker and return to PLAN before editing it.

The existing `scripts/qa/commerce-submission-qa.mjs` is authorized only to extend its exact shared
verification-scope expectation from the seven historical scopes to those same seven scopes plus
`content-report` as the eighth value. This exception is necessary because the Feature 005 harness
asserts the shared allowlist itself. It does not authorize refactoring or changing its commerce,
image, moderation, B1/H1, M1/M2, atomicity, privacy or other historical assertions.

### Protected compatibility files

The following are read-only for this feature unless a later verified implementation blocker is
raised and approved: `CommunicatArticlePage.astro`, `CommunicatReportFlow.astro`,
`communicatReportFlow.ts`, both `communicat-report*.mjs` modules,
`internal-communicat-report.js`, the complete `denuncia-comunicat` API/schema, feature 003 SDD
artifacts, all public content schemas, all participation schemas, moderation/image lifecycle code,
database files, dependencies and environment/infrastructure configuration. Existing commerce QA is
protected except for the single eight-scope expectation update authorized immediately above.

## Known Risks and Controls

- **Stale static page**: the document may cease to be public after build. Control: authoritative
  published/active lookup at submission and generic public failure.
- **Commerce visibility spans relations**: publication and `activa` are not inferred from the
  commerce row. Control: separate published lookups for category and optional subcategory.
- **Token consumed before downstream failure**: no cross-service transaction exists. Control: no
  false success, preserve non-sensitive inputs and require fresh verification.
- **Shared security allowlists**: a typo could affect other flows. Control: one-value-only diffs and
  persistent scope/feature 003 regression probes.
- **Astro dev-toolbar audit reads during commerce browser QA**: the toolbar requests four local
  commerce icon assets after the strict post-load fixture is installed. Control: the fixture may
  pass through only same-origin `GET` requests under `/@fs/` whose repository-relative suffix is
  exactly one of `/src/assets/icons/arribar.svg`, `/src/assets/icons/trucar.svg`,
  `/src/assets/icons/mail.svg` or `/src/assets/icons/web.svg`, with no hash and the exact observed
  query `?origWidth=20&origHeight=25&origFormat=svg`. These reads are local development
  infrastructure, do not increment feature endpoint counters and do not weaken the default
  unexpected-fetch failure. No domain, arbitrary path, path prefix, resource class or general
  passthrough is authorized.
- **Generated SQLite schema change**: adding a Strapi collection creates new storage on startup.
  Control: additive schema only, no data transformation or migration command; inspect generated
  types and schema diff, then satisfy the pre-schema SQLite safety gate below before the first
  local startup or synchronization with the new schema.

### PLAN blocker I-002 resolution — T074 strict fixture

T074 exposed no Feature 006 product defect: the strict fixture correctly rejected four local reads
created by Astro's development toolbar rather than by the report flow or CMS. PLAN authorizes only
the exact fixture amendment defined in `quickstart.md`; build/preview, a persistent toolbar change,
`.astro/settings.json`, product code and general passthrough remain unauthorized. The PLAN-only
files for this remediation are `plan.md`, `quickstart.md` and `tasks.md`; no other file is needed.

Before T074 can pass, IMPLEMENT must rerun the commerce category-only and category/subcategory
CA/ES/EN matrix with the amended fixture and retain normal fixture receipts. The regression must
also prove that the four exact local reads are ignored by feature counters while a different
method, origin, query, hash, `/@fs/` resource or any unrecognized CMS, Function or external request
still records `unexpected fetch` and prevents `finish()` from passing. T072 and T073 retain their
unchecked state until their own pending local boundary probes are executed; this PLAN decision
does not infer or award any browser-QA pass.

## Pre-schema SQLite safety gate

Preparing the additive `api::denuncia-contenido.denuncia-contenido` schema does **not** authorize a Strapi startup. The
first `strapi develop`, `strapi start`, `strapi console` or equivalent bootstrap with that schema can
mutate `guiapineda-strapi/.tmp/data.db`, so these four gates are mandatory and ordered:

1. **Non-mutating inspection**: prove that no Strapi process is active and no listener remains on
   the configured port; resolve and record the effective SQLite path from repository configuration;
   inventory the main database and every present `-wal`, `-shm` or `-journal` sidecar.
2. **Complete, verifiable backup**: with Strapi stopped, copy the main file and every present
   sidecar to a new destination outside both repositories and also create a logical SQLite
   `.backup` suitable for restoration. Nothing in this step may overwrite a prior backup.
3. **Integrity and restoration evidence**: run `PRAGMA integrity_check` and
   `PRAGMA foreign_key_check` against both the original and the logical backup, record checksums
   and object inventories, and retain the exact restore source and command.
4. **Explicit human approval**: present the evidence and obtain an unambiguous approval before the
   first startup/sync. Silence, implicit approval or the mere presence of a backup do not pass the
   gate.

Only after all four gates may a controlled first sync occur. Strapi must then be stopped and the
database rechecked to demonstrate that the change was additive and pre-existing data remains
intact. The exact local procedure and minimum evidence are defined in `quickstart.md`; the ordered
gate tasks in `tasks.md` block every later task that would bootstrap Strapi.

There is no open functional ambiguity. Live-service evidence is an explicit predeployment deferral,
not an assumed capability or PLAN blocker.

## UI Placement and Language Design

- Agenda: after the event content/body and before leaving the article container.
- Veus: after `StrapiBlocks` inside the white article body.
- Millorem: after the contribution body and before the existing final related-content callout.
- Commerce: after the complete public business detail, before the page's final closing boundary.

One component owns equivalent CA/ES/EN action text, five reason labels, private-context help,
verification copy, validation errors, loading, unavailable/rate-limit states, success and retry.
The visible type name may vary by the fixed component prop, but internal reason values and behavior
do not. Closing/reopening the form must not discard reason/context; a successful receipt replaces
the form. No report action is added to lists, submission forms or Foto del Mes.

## Validation Strategy

Add a persistent `scripts/qa/multisection-reporting-qa.mjs` harness using `node:assert`. It imports
the real client validator, Function validator/HTTP adapter, verification core, internal transport
and backend service. Controlled doubles are permitted only for Redis/email delivery, outbound
Function-to-Strapi HTTP and Strapi Documents Service. The harness must cover:

- exact CA/ES/EN values, five reasons and explanation boundary 1,000/1,001;
- unexpected/duplicate fields, all files, nonempty honeypot and oversized body;
- token wrong, expired/reused/wrong-scope and downstream failure after consumption;
- no email/token/IP/user-agent/state in internal payload;
- valid and invalid/cross-type/unpublished cases for every type;
- commerce inactive category/subcategory cases and slug derived by server;
- independent duplicate reports, default state and absence of public document writes;
- dispatch isolation and allowlists for both `content_report` and existing `communicat_report`;
- direct regression probes of feature 003 validators/service without changing its implementation.

After implementation, run this harness, the existing commerce QA, both builds, Strapi type
generation, tracked/staged `git diff --check`, per-file no-index inspection/checks for every
untracked path, a complete status/allowlist review, built-output CA/ES/EN inspection and the strict
local browser matrix from `quickstart.md`. Real email delivery, deployed Upstash/Netlify enforcement
and deployed Function-to-Strapi/Content Manager evidence remain `DEFERRED — predeployment`.

## Project Structure

### Documentation (this feature)

```text
specs/006-private-multisection-reporting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-function-contract.md
│   ├── internal-backend-contract.md
│   └── ui-contract.md
└── tasks.md              # implementation checkbox/evidence and formal remediation ledger
```

### Source code (two independent repositories)

```text
guiapineda-astro/
├── src/components/       # shared report and existing verification block
├── src/lib/              # browser controller and verification scope types
├── src/templates/        # four shared multilingual detail templates
├── netlify/functions/    # public report endpoint and shared guarded transport
└── scripts/qa/           # persistent local contract/regression harness

guiapineda-strapi/
├── src/api/denuncia-contenido/content-types/denuncia-contenido/
├── src/api/internal-submission/controllers/
├── src/services/         # authoritative report validation and creation
└── types/generated/      # generated Strapi schema types
```

**Structure Decision**: keep the existing repository and layer boundaries. Astro owns static
presentation and the public serverless trust boundary; Strapi alone decides whether a document is
currently eligible and persists the private report. No package, application or repository is added.

## Complexity Tracking

No constitutional violations require justification.
