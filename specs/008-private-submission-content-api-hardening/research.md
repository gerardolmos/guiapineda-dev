# Research: Private Submission Content API Hardening

## Decision 1: the two core routers are the complete exposure source

**Decision**: treat the two `routes/*.js` files as the only registration points for the inherited
Content API.

**Rationale**: each exports `createCoreRouter(uid)` without `only` or `except`. Strapi 5.41.1 creates
`find`, `findOne`, `create`, `update` and `delete` for a collection type from that declaration. The
schema `pluralName` values produce `/api/solicitudes-agenda` and `/api/solicitudes-veu`.

**Alternatives considered**:

- Change public-role permissions: rejected because the routes would remain and privacy would still
  depend on mutable external state.
- Add `only`/`except`: rejected because no Content API operation has a legitimate consumer.
- Add a rejecting middleware/controller: rejected because it creates runtime code to preserve a
  surface whose required contract is nonexistence.

## Decision 2: remove controllers and services together with routers

**Decision**: delete the six standard factory files: router, controller and service for each private
content-type.

**Rationale**: deleting only the routers is sufficient to close HTTP exposure, but both controllers
and both services are empty core-factory wrappers with no import or caller. They exist solely to
support the removed routers and would become dead code. Removing all six also matches the established
schema-only pattern of Comunicats, Millorem, Foto del Mes and Comercio.

**Alternatives considered**:

- Delete only routers: technically safe but retains four inert, unreferenced artifacts.
- Keep services for Documents Service: rejected because `strapi.documents(uid)` is independent of
  core API services.
- Keep controllers for Content Manager: rejected because Content Manager uses its administrative
  plugin and document manager, not Content API controllers.

## Decision 3: preserve schemas and persistent identity exactly

**Decision**: retain both `schema.json` files byte-for-byte.

**Rationale**: schemas register the content-types used by Documents Service and Content Manager and
define the existing tables, fields and moderation states. HTTP factory removal requires no model
change. Current SHA-256 fingerprints are:

- Agenda private schema: `4807248506b2864ead5bf6f874b463cecc127a76cc500fa0da3b5d19c9180c58`.
- Veu private schema: `64d5b17dcb66629f4f1a532f0735f2dddd2df48bb2d596ad6d499e28148c8197`.

**Alternatives considered**:

- Mark fields private or change draft/publish: rejected because it does not remove routes and would
  alter data behavior.
- Rename collections: rejected because it would be a migration and break persistent identity.

## Decision 4: generated types do not change

**Decision**: do not regenerate or edit `types/generated/contentTypes.d.ts`.

**Rationale**: generated content types derive from schemas, which remain unchanged. The current file
fingerprint is `96af0b100c7cd2442591c01c493d0ae3a7aee3bd1848c1dbe93204bd8aac7fe6`.

**Alternatives considered**:

- Regenerate types as routine: rejected because it can create unrelated noise without a schema
  input change.

## Decision 5: internal submission is independent of Content API

**Decision**: preserve the existing route/controller/service chain unchanged.

**Rationale**: Netlify Functions call `/api/internal/submissions/agenda|veu` with server-to-server
authentication. `internal-submission-request.js` maps each section to its private UID and calls
`strapi.documents(uid).create`. It never invokes the core routers, controllers or services.

**Alternatives considered**:

- Redirect Functions to another endpoint: rejected because the legitimate path already has the
  required authentication and privacy properties.
- Add a new internal abstraction: rejected because there is no missing seam.

## Decision 6: Content Manager and moderation remain independent

**Decision**: rely on retained schemas, the Content Manager plugin and existing internal moderation
routes; do not modify them.

**Rationale**: Content Manager discovers content-types from schemas. The custom Admin panel is
registered through `content-manager.apis.addEditViewSidePanel` and calls only
`/api/internal/moderation/...`. Moderation, preview and cleanup use Documents Service. No source
references the core controller/service factories for either UID.

**Alternatives considered**:

- Add replacement admin routes: rejected because the administrative surfaces already exist.
- Retain public factories for Admin compatibility: rejected because no such dependency exists.

## Decision 7: document a negative HTTP contract

**Decision**: create `contracts/removed-content-api.md` describing the ten removed operations and
their natural results: `404` for `GET` and `405` with `Allow: HEAD, GET` plus zero effects for
`POST`, `PUT` and `DELETE`.

**Rationale**: the feature changes an externally observable interface by removing it. Runtime
evidence showed that Strapi's global routing gives the same mutating-method `405` to a wholly
nonexistent control path. A concise negative contract therefore combines status, route-map absence,
deleted factories, control-route equivalence and zero effects; it prevents later code from
reintroducing routes or substituting `401`/`403` without misclassifying the natural `405`.

**Alternatives considered**:

- No contract artifact: rejected because absence is the primary acceptance boundary.
- OpenAPI for a replacement endpoint: rejected because no endpoint should exist.

## Decision 8: combine isolated assertions with a programmatic Strapi smoke

**Decision**: create one persistent Node harness with static/double checks followed by a controlled
programmatic Strapi boot.

**Rationale**: static inspection proves topology and dependencies but cannot prove the actual HTTP
status. `createStrapi` can load the real router against a disposable database, listen on loopback
port `0`, and be destroyed in `finally`. This proves the natural `404`/`405` contract, exact `Allow`
header, control-route equivalence and zero effects without invoking npm scripts, deployments,
external services or the real SQLite.

**Alternatives considered**:

- Route-map inspection only: rejected because a real request could still be intercepted elsewhere.
- `npm run develop` or `npm run start` against the project environment: rejected because it is more
  invasive and risks the real database, cron and fixed ports.
- Mock HTTP server: rejected because it would prove the mock rather than Strapi routing.

## Decision 9: isolate every writable runtime dependency

**Decision**: use a unique OS temporary directory for SQLite and private uploads, synthetic secrets,
in-memory cron disablement, loopback and an ephemeral port.

**Rationale**: Strapi `load()` synchronizes its configured database. Pointing it to a newly created
temporary SQLite makes this safe and representative. The harness verifies the resolved path before
load, fingerprints the real `.tmp/data.db` before and after without connecting it, and removes all
temporary state after `app.destroy()`.

**Alternatives considered**:

- Copy the production SQLite: rejected because no existing data is required and minimization favors
  a fresh disposable store.
- Leave cron enabled: rejected because it adds an unnecessary asynchronous actor.
- Use a fixed port or repository-local DB: rejected because both increase collision/residue risk.

## Decision 10: preserve public and private regressions by fingerprints and runtime checks

**Decision**: verify public Agenda/Veu route signatures and document counts, and fingerprint all six
unmodified private schemas plus generated types. Run the existing Commerce and multisection-report
harnesses as supplementary regressions.

**Rationale**: the feature deletes only private Content API factories. Public entities and the four
other private flows must remain byte-for-byte and behaviorally unchanged.

**Alternatives considered**:

- Full browser QA: rejected because there is no frontend change and it does not exercise private
  Strapi route registration.
- Rely only on Git diff: rejected because runtime route behavior and internal creation require
  functional evidence.

## Decision 11: exact closed allowlist

**Decision**: authorize six deletions, one new backend harness and the named SDD artifacts only.

**Rationale**: no configuration, schema, permission, package, generated type or frontend functional
change is necessary. Any newly discovered need therefore represents a PLAN change, not implicit
implementation freedom.

**Alternatives considered**:

- Authorize whole API directories: rejected because it could hide schema or internal changes.
- Authorize config/package files defensively: rejected because research found no requirement.

## Resolved Questions

- **Files generating Content API**: exactly the two standard router files.
- **Router removal sufficient**: yes, for HTTP closure.
- **Controllers/services after router removal**: fully orphaned, harmless but dead.
- **Final deletion set**: all six standard factory files.
- **Content Manager impact**: none; schemas and Admin plugin remain.
- **Documents Service impact**: none; it is model-based, not router-based.
- **Schemas**: unchanged.
- **Generated types**: unchanged and not regenerated.
- **Explicit registrations/imports to adjust**: none.
- **Public result**: natural `404` for the four former `GET` operations; natural `405` with
  `Allow: HEAD, GET` and zero effects for the six former mutating operations.
- **Runtime proof**: real Strapi router on temp SQLite, loopback and ephemeral port.
- **Internal proof**: synthetic authenticated creation plus direct temp Documents Service checks.
- **Moderation proof**: retained routes/services and created temp documents.
- **Public regression**: unchanged route map/fingerprints and zero automatic publication.
- **Other private regressions**: individual schema/registry checks plus existing harnesses.
- **CA/ES/EN**: identical backend behavior; no language branch.
- **Aclaraciones pendientes**: ninguna.
