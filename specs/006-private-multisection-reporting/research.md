# Research: Denuncia privada multisección

## Scope of inspection

The current implementation was inspected across the four requested public detail surfaces, all
CA/ES/EN dynamic routes, feature 003's UI/Function/backend path, shared email verification,
authenticated internal submission transport, Strapi schemas, commerce active-state filtering and
the existing persistent QA harness. Repository state and code are the authority; no deployed
infrastructure is assumed.

## Decision 1: keep feature 003 intact

**Decision**: select option B: leave the existing Communicat report model and flow unchanged and
introduce one separate generic path for Agenda, Veus, Millorem and commerce.

**Rationale**: feature 003 has a narrow, working, security-sensitive contract and existing SQLite
records. A separate additive collection avoids data migration and keeps its invariants explicit.

**Alternatives considered**:

- Generalize feature 003 (option A): rejected because a polymorphic conversion requires migration
  or nullable legacy fields and touches every layer of an already closed flow.
- Four independent paths (option C): rejected because the four new surfaces have identical reasons,
  privacy and moderation semantics, producing avoidable duplication.
- Add generic optional fields to `denuncia-comunicat`: rejected because it creates ambiguous rows
  and weakens schema invariants while retaining migration risk.

## Decision 2: one new polymorphic report model with a server allowlist

**Decision**: use one `denuncia-contenido` collection whose `tipo_contenido` enum selects one of
four hard-coded backend UIDs.

**Rationale**: type plus Strapi `documentId` is an unambiguous stable identity. The backend—not the
browser—owns the mapping, preventing arbitrary UID access or cross-type reuse.

**Alternatives considered**:

- Four relations/nullable ID fields: rejected as a larger schema with invalid combinations.
- A free-form type or UID: rejected because it broadens backend access and permits unknown types.
- A required Strapi relation: rejected because deletion lifecycle coupling could erase or orphan
  review context and is unnecessary after authoritative pre-create validation.

## Decision 3: derive, do not trust, the context snapshot

**Decision**: the browser sends only type and `documentId`; the backend derives and stores the
current slug as `contenido_slug` after resolving an eligible document.

**Rationale**: a static page can become stale and hidden fields are manipulable. A server-derived
slug is recognizable minimal context while stable identity remains the `documentId`.

**Alternatives considered**:

- Require the browser slug to match, as feature 003 does: safe but unnecessarily rejects a stale
  built page after a legitimate slug change.
- Persist title/name/full body/URL: rejected as extra retention and language ambiguity. Type,
  document ID and acceptance-time slug are sufficient.
- Store no recognizable snapshot: rejected because a later deletion would leave editors only an
  opaque ID.

## Decision 4: authoritative, type-specific public eligibility

**Decision**: backend lookup uses `status: "published"` for all types. Commerce additionally
requires `activo === true`; its category and optional subcategory identifiers are each resolved in
their own Documents Service with `status: "published"` and must have `activa === true`.

**Rationale**: this mirrors the actual public route filters instead of assuming all published
records are visible. It also rejects content that ceased to be public after static build.

**Alternatives considered**:

- Trust build-time visibility: rejected as stale and client-controlled.
- Trust populated relation objects as publication proof: rejected because eligibility must be
  explicit; relation `documentId` is used for a separate published lookup.
- Only check the commerce flag: rejected because current routes also require active relations.
- Perform browser runtime lookup: rejected by static-first and Strapi exposure constraints.

## Decision 5: one new verification scope

**Decision**: add `content-report` to the existing typed/browser and server allowlists and reuse it
for all four new content types. Preserve `communicat-report` unchanged.

**Rationale**: the purpose and privacy boundary are identical across the four surfaces. Token/email
binding, TTL and atomic consumption already exist. Content eligibility is independently enforced by
the backend.

**Alternatives considered**:

- One scope per type: rejected as four allowlist values with no additional security property.
- Reuse `communicat-report`: rejected because it blurs the protected legacy boundary.
- Bind the token to a content ID: rejected because it would require redesigning the existing
  verification protocol; type/reference manipulation is already rejected authoritatively.

## Decision 6: one shared UI and one Function endpoint

**Decision**: create a shared multilingual component/controller and `/api/submissions/content-report`
Function for the four templates.

**Rationale**: the form rules and states are identical. Each shared template already serves CA,
ES and EN and receives the complete Strapi document at build time, so no route duplication or
runtime read is needed.

**Alternatives considered**:

- Copy the Communicat component: rejected because direct reuse would require altering its props,
  endpoint and protected behavior; the new component may follow its proven interaction pattern.
- Four UI components/functions: rejected due multilingual and validation drift.
- New report page: rejected because it adds routes and weakens association with the content.

## Decision 7: separate verification data from editorial data

**Decision**: the Function consumes `email_contacto` and `email_verification_token`, then removes
both before authenticated transport. The backend rejects them if they nevertheless appear.

**Rationale**: data minimization must be structural, not dependent on Strapi silently ignoring
fields. The backend payload contains no reporter identity or platform-derived identifier.

**Alternatives considered**:

- Forward then discard in Strapi: rejected because sensitive data would cross an unnecessary trust
  boundary and might be logged.
- Persist email/hash for deduplication: rejected because correlation and deduplication are outside
  scope and prohibited.

## Decision 8: explicit internal dispatch and isolated service

**Decision**: add `content_report` to the Function transport allowlist and one explicit backend
controller branch to `internal-content-report.js`, alongside the untouched `communicat_report`
branch and generic submission service.

**Rationale**: internal bearer authentication is already correct, but the generic submission
service has contact/publication semantics that do not fit private reports. An isolated service makes
its allowlist, lookup and no-side-effect behavior auditable.

**Alternatives considered**:

- Put reports through the generic request service: rejected because it persists contact data and
  uses a different workflow.
- Create another internal endpoint/secret: rejected as redundant security infrastructure.

## Decision 9: additive private schema and manual state only

**Decision**: add a private schema without public routes/controllers/services, with states
`pendiente`, `revisada`, `cerrada` and no lifecycle hook.

**Rationale**: Content Manager/RBAC already supplies authorized editorial access. No automatic
transition or content effect is authorized. Additive schema generation preserves existing SQLite
data; feature implementation must not execute migration or destructive DB operations.

**Alternatives considered**:

- Extend a participation request type: rejected because report records are neither publication
  requests nor contact conversations.
- Add automation, assignment, notes or notifications: rejected as product scope expansion.

## Decision 10: persistent proportional QA

**Decision**: add `scripts/qa/multisection-reporting-qa.mjs` and keep it versioned. It exercises
real validators/services with controlled external-boundary doubles and includes feature 003
regression probes.

**Rationale**: four types and several trust boundaries create a repeatable regression surface. The
existing commerce harness establishes the repository's Node `assert` pattern; no test dependency is
needed. Temporary scripts cannot be primary evidence.

**Alternatives considered**:

- Manual-only validation: rejected because cross-type and sensitive-field invariants are durable.
- A new test framework: rejected as unnecessary dependency/complexity.
- Modify feature 003 code to make it more testable: rejected as out-of-scope compatibility risk.

## Decision 11: failure semantics after token consumption

**Decision**: validate deterministic request errors before token consumption. If authoritative
backend validation or creation then fails, show no success, retain reason/context, reset verification
and require a fresh token.

**Rationale**: the one-time token cannot be safely restored across services without new distributed
state. The documented retry is truthful and matches current protected semantics.

**Alternatives considered**:

- Return the token to the browser: rejected because it breaks one-time authorization.
- Consume after Strapi creation: impossible without accepting an unauthorized durable write.
- Add idempotency/distributed transaction infrastructure: disproportionate and outside scope.

## Deferred evidence

Real email delivery, deployed one-time-token behavior through Upstash, Netlify request limiting,
authenticated deployed Function-to-Strapi transport and Content Manager review require an integrated
environment. They remain **DEFERRED — predeployment**; local doubles demonstrate code contracts,
not live infrastructure.
