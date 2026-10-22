# Controlled persistence — final architectural plan

## Formal implementation suspension — 2026-10-20

**Human decision ratified: IMPLEMENTATION SUSPENDED, not cancelled.** This section is the current governance status; older proposals below and historical reports are retained as evidence, not implementation authorization. Constitution III/IV/V/VI and its SDD gates remain binding; no requirement or security guarantee is changed.

| Gate | Current status |
|---|---|
| SPEC | PASS |
| PLAN | FAIL |
| TASKS | PASS (document coverage, not execution readiness) |
| ANALYZE | FAIL |
| B03-LAYOUT | BLOCKED |
| B03-FORM | BLOCKED |
| Findings | BLOCKER 2 / HIGH 0 / MEDIUM 0 |
| IMPLEMENT | NOT AUTHORIZED — SUSPENDED |
| Implementation QA | NOT_STARTED |
| Implementation CONVERGE | NOT_STARTED |
| Feature 017 | BLOCKED |

Reason: no supported design has demonstrated both complete backend closure of unsafe writers and equivalent Admin permissions while preserving authentic original revisions, pending form edits and indispensable functionality. B03-LAYOUT retains supported control exclusion/writer coverage/permission-equivalence gaps; B03-FORM retains authentic baseline/draft/concurrent-operation integration gaps. Suspension neither repairs existing risks nor certifies runtime privacy.

Discarded under current constraints/evidence: unsupported native-modal revision transport; internal layout-response projection; reliance on native form reinitialization; backend-only Document Service middleware as a universal boundary; six custom editors without demonstrated writer and permission parity. No fresh investigation of these routes is authorized. Detailed evidence, matrices, limits and architectural decisions remain in [analysis-final.md](analysis-final.md); chronological execution history remains in [qa-report.md](qa-report.md). Those reports are not duplicated here.

Mandatory guarantees retained: all six types and permitted writers remain in scope; original-revision CAS in the actual update, exactly-one successful increment, strict errors/no bypass or blind retry; atomic parent/components/relations and no unsafe stale-snapshot restoration; effective action/field/entity permissions without privilege expansion; draft preservation and session isolation; ratified terminal PII non-restoration, including retries and any future authorized reopen; existing verified intake and editorial/media preservation; Millorem identity/durability and coordinated rollout gates. The prerequisite's neutral policy seam is not implementation of Feature017 privacy.

Feature017 remains blocked until its terminal monotonicity and complete safe-writer dependencies are proven and its own analysis/authorization gates pass. No017 requirements, files or deferred scope are changed. Suspension applies only to this prerequisite's implementation and dependent work: unrelated GUIAPINEDA functionality may proceed under its own scope, authorization and SDD gates once independence is established. No other feature is initiated by this decision.

### Objective reactivation conditions

1. Explicit human authorization to reopen a bounded SDD assessment, identifying materially new evidence or an expressly approved scope decision. No automatic retry of rejected investigations; scope changes must preserve ratified privacy/security guarantees.
2. Before implementation readiness, evidence must close both B03 findings: complete relevant writer inventory and supported backend closure (including secondary/compensatory paths), effective action/field/entity permission equivalence, and supported preservation of original snapshot/revision, pending edits, creation and concurrent operations. Separate atomic privacy non-restoration proof from editing-conflict protection; neither substitutes for the other.
3. Reconcile approved design changes across SPEC/PLAN/TASKS/contracts/allowlist without deleting historical failures. Run the authorized SDD gates: PLAN and ANALYZE PASS, zero BLOCKER/HIGH/MEDIUM, and complete traceable acceptance criteria. Merely renaming scope or passing a primitive's synthetic test does not close findings.
4. Obtain fresh explicit implementation authorization after those gates; schema, real data/backup/backfill/storage/rollout remain separately human-gated. Reopening analysis alone never starts implementation, QA or CONVERGE. Feature017 requires its own subsequent reanalysis and authorization.

All 26 tasks remain unchecked. No optional isolated verification package is commissioned. No code, schema, data or infrastructure action is authorized by this suspension record.


Date2026-10-19. B03 direction ratified for SDD; current readiness is governed by analysis-final.md. IMPLEMENT not authorized. No code/schema/data changed. Current documents enumerated in spec; earlier reports retained as historical. No numbered feature created.

## Stack and approved boundary
Installed Strapi5.41.1/Node, existing local upload provider, native node:fs/promises + node:crypto; no new dependency/infrastructure. Six private types and Millorem-only publication adapter. Frontend product untouched. Public generated Millora/owned Media receive only narrow identity/completeness guards. Feature017 implementation excluded.

## Architecture
US1: revision-CAS transaction adapter and supported Admin/document middleware; see contracts/admin-writers.md. Six revision fields private integer1..2147483647 default1; read-only metadata; create strictly validated; accepted save increments once. Same source revision cannot commit twice. Supported helpers preserve components/relations; parent generic update blocked, so stale parent compensation unreachable.
US2: approval transaction includes ledger+draft creation; after awaited commit call ensureMilloremPublished. Unique non-draft source ledger, actual ledger CAS, manifest and atomic fs.link canonical publication; Media create+receipt same transaction; target publish+completion same transaction. See contracts/storage-publication.md for exact schema/stages/crash matrix. No general Upload invocation for this image, no Media schema customization; Media required metadata supplied directly through supported query create. File mutation is not DB-transactional and is never 'rolled back' by deleting shared canonical data.
US3: revision backfill and initially-empty ledger, maintenance deployment, prospective source eligibility/manual legacy mapping. rollout-backfill-design.md is operative; backfill/actual capability qualification/deployment HUMAN-GATED separately.

## Concurrency proof
Private and ledger scalar writes use UPDATE WHERE id AND revision=N, revision=N+1 in same statement/transaction. Each unsafe DB stage performs ledger CAS before creation and couples resulting pointer in same commit. Atomic link publishes one complete closed inode at deterministic key; EEXIST verifies rather than overwrites. Process-crash recovery derives same key/manifest and observes coupled DB receipts. No distributed lock, raw SQL or DB vendor isolation tweak.
Filesystem support precondition: local, same-volume hardlink support, owned directories, no adversarial external mutation. Future isolated link/sync QA required; capability failure is fail-closed, not unsafe fallback. OS power-loss durability not promised beyond sync; integrity mismatches/missing committed assets require safe recovery/investigation. Not global distributed exactly-once semantics.

## Schema/authorization
Only proposed schema: revision on six private types and new internal millorem-publication-operation with seven fields in data-model. No public Millora/Media schema, no017 name change. Database unique source constraint, not only validation, must be explicit in schema proposal. Real physical schema sync/backfill forbidden in local implementation. Type generation must be static only, no Strapi bootstrap.

## UX, failure and legacy
Original Admin header baseline,409 reload, no silent retries. Approved-but-effect-failed state plus ledger error exposes retry; no false all-complete success or rollback source. Existing published public edits preserved, image changes require explicit editorial action rather than source-sync. Generated target cannot be published incomplete or deleted/recreated by ensure. Older unlinked publications not guessed by slug; historical source retries disabled absent verified mapping. No partial generated document published.

## Validation and rollout
quickstart.md defines27 required cases plus architecture/edge tests; future QA isolated tmp roots and doubles, no real DB/storage. Source-static verification and synthetic transaction tests do not claim production isolation certification. Human operational gates include backup/inspection/schema validation/capability qualification. Complete closed allowlist in allowlist.md; unexpected file change STOP. No commit/push/deploy.

## Constitution recheck
I editorial authority retained; II static public architecture unchanged; III neutral privacy hook, no PII logs; IV schema/data operations separately gated, no real data; V native APIs/minimal scope; VI CA/ES/EN regression; VII repo boundary explicit. No unresolved architectural exception. Required schema is authorization gate, not finding. Storage decisions remain as previously documented; B03 Admin guarantees require the current analysis gate; implementation/QA remain unperformed.


## B03 architecture amendment — no implementation authorization
Backend owns all application changes; frontend contains SDD/isolated future QA. Commerce alone receives PrivateSubmissionRelationsPanel via official addEditViewSidePanel. Register a tab-local reducer from src/admin/privateSubmissionSession.js using addReducers; main action, relation panel and existing moderation panel share its UID/document/generation command claim. Request-owned getFetchClient PUT sends X-Private-Submission-Expected-Revision. Existing controlled middleware/transaction remains strict. No interceptor for the native secondary PUT is assumed.

Proposed native-control exclusion: src/middlewares/private-submission-relations-layout.js, registered in config/middlewares.js, would project only the Commerce configuration response after await next, filtering categoria/subcategoria from data.contentType.layouts.edit without changing schema/permissions or persisted configuration. Unknown layout shape must fail closed. HOWEVER: Koa is supported but stability of this internal Content Manager response shape is not demonstrated; this mechanism is an unresolved design gate, not an approved implementation technique. Cache/304, duplicate/custom layouts and nested editors must all be covered. relationOpenMode=newTab alone is insufficient because the create option directly opens the modal. The documented layout mutation hook is a possible research route, not a silently substituted design: exact scoped model identification and supported payload still require proof.

Session state: {uid,documentId,generation,expectedRevision,acceptedSnapshot,busy,conflicted,relationDraft}. Initialize snapshot/N from the same raw read-derived metadata and form snapshot. Ignore background cache revision changes. A synchronous claim admits one writer; all buttons/keyboard/moderation paths must use it. Failure releases busy without advancing N;409 locks until explicit reload. Successful authoritative result updates N and snapshot together before releasing the claim. Ambiguous response freezes session. Relation/main dirty states are mutually exclusive for submission; moderation requires both clean. Native form refetch/reinitialization and typing during requests must be controlled through a demonstrated supported integration; freezing the number alone is inadequate (open analysis gate).

Read existing/available relations via the authenticated Content Manager relation GETs. Own relation-only parent PUT uses standard document IDs/transform semantics and server permission checks; omit both relationship fields from main scalar/component/Media save. Detect requested fields stripped by permission sanitization instead of reporting a false relation success. Preserve required/optional manyToOne and target D&P; no new schema rule or automatic publish. Target creation/editing remains native in another tab; return/refresh choices does not refresh parent N; association is explicit. Native automatic connect and nested private editing convenience change as ratified direction, without changing targets' normal editors.

Creation: existing verified public CREATE unchanged, revision1 server-side; Commerce Admin create still forbidden. No relation update before a saved parent identity exists. Other permitted creates keep existing validation and only establish a session after confirmed creation. No new privilege or dependency. No global media/component changes.

Exact additional design paths, all backend: src/admin/components/PrivateSubmissionRelationsPanel.jsx; src/admin/privateSubmissionSession.js; src/middlewares/private-submission-relations-layout.js. Existing src/admin/app.js, src/admin/components/PrivateModerationImagePanel.jsx and config/middlewares.js integrate them with already-planned PrivateSubmissionSaveAction and private-submission-concurrency/persistence/guard/policy files. Three new paths are allowlisted for this design only, not authorized for creation. No new writable endpoint.

Validation design: T020–T026 precede completion of US1; T020 is an SDD evidence gate before any code authorization. They cover native exclusion, session/dirty/cache/generation semantics, two tabs, field permissions, D&P, missing/stale headers, main/relation/moderation ordering, creation, six-type component/Media parity and other models unchanged. Runtime fixtures remain unexecuted. Storage and rollout decisions unchanged.


## Two-blocker recovery decision — 2026-10-20 (authoritative)
No alternative within the currently approved scope has demonstrated both guarantees. PLAN remains FAIL. The B03 section above records the previously selected direction, NOT ratification of its failed response-projection technique. Do not create private-submission-relations-layout.js merely because its path is listed. Its technique is rejected as an implementation-ready solution under the stable-public-contract requirement. No new code paths/allowlist grants in this recovery.

A (prefer one controlled main save): select categoria/subcategoria into a local draft and send their delta with scalar/component/Media data in one accepted CAS command; one success increments once, relation validation failure rolls everything back. This avoids separate-save dirty gates and is simpler UX, but is only a candidate change to the prior explicit relation-save direction. Keeping native selectors still exposes modal create/publish-and-connect; keeping native Form still lets cache-derived initialValues replace pending data. Thus A does not close either blocker and is not adopted.

B (public Content Manager extensions): panel/action/reducer/request APIs supply widgets, state and owned requests, not ownership of native Form props. The documented layout hook is public but installed payload supplies layout/query, not an explicit source UID; fields include target attributes and labels, which are not reliable source identity. Scoping by global URL breaks nested-editor reasoning. No demonstrated stable contract for exact Commerce exclusion plus unchanged other types. addFields('relation') is a global type override; builtin native relation component is internally imported, not exposed as a public fallback. A wrapper that globally overrides then delegates via internal imports is not accepted. Experimental unstable_useDocument/useContentManagerContext/useDocumentLayout and alpha useForm cannot be described as stable replacement-editor APIs. No new investigation of native HTTP interception is warranted.

C (study only): an owned Admin page reachable through supported addMenuLink, ordinary controlled React inputs and owned authenticated requests could hold immutable acceptedSnapshot/N plus an independent editable draft, bypassing native Form entirely. It would not render native relation modals, and could integrate relations into the main atomic save. It must implement exact existing validation, components, Media attachment semantics, permissions, target D&P resolution, moderation and creation boundaries without importing internal form machinery. Public Admin navigation does not prove those compatibility obligations. Native alternative entry points must be restricted through explicit authenticated server command authorization plus normal field/conditional permission checks, never an Admin bypass or an untrusted header treated as authorization. This is a proposal for a separate design decision, not an implemented mechanism or approved route expansion.

Candidate C session protocol: initial authenticated read captures same-response snapshot/N; initialize draft once. Background reads may report remote changes but never assign draft or N. Synchronously claim one command across main/relations/moderation; either disable every editable input while pending or retain an explicit post-submit edit generation without resetting it (choose and verify before approval). Known success atomically acknowledges accepted snapshot/N; failed command retains draft/N;409 freezes writes for explicit review/reload; uncertain response also freezes without assuming rollback. Tab-local component/reducer state, no shared storage/broadcast. No UPDATE for unsaved documents, no fake revision; verified public CREATE retains current behavior, Commerce direct Admin CREATE remains forbidden. Legacy missing revision is rejected pending separately gated backfill, not silently treated as1.

Critical limit: C only for Commerce cannot close the six-type B03-FORM guarantee. All six existing editors use the same cache→initialValues→Form path. A complete owned-editor approach would need an explicitly approved scope decision for the other five editors or separate supported snapshot-ownership evidence for them. This is NOT authorized here. The minimal decision is whether to commission that broader bounded editor DESIGN/compatibility analysis; it is not permission to implement or weaken original-baseline/unsaved-data requirements.

T020 remains the pre-implementation gate. T021–T026 and the earlier US1 implementation tasks remain blocked, not executable instructions to implement the rejected projection. No changes to storage/publication, Constitution, Feature017, existing SPEC requirements or allowlist. Source-only result and evidence: current analysis-final.md.
