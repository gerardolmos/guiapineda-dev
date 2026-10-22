# Controlled private-submission persistence — unnumbered prerequisite

Status: SPECIFY complete; PLAN blocked. Date2026-10-18. Separate architectural prerequisite ratified by user; no number, branch, implementation or feature activation assigned. Feature017 remains blocked, unchanged.

## Objective and scope
Project-owned persistence boundary for exactly solicitud-agenda, solicitud-comunicat, solicitud-veu, solicitud-millora, solicitud-foto-mes, solicitud-comercio. Preserve Admin edits, moderation, components, relations, timestamps, errors and legitimate status/reopen behavior while allowing future private-field invariants. SDD in frontend repository; future product only backend. No public-type persistence abstraction.

## Requirements
FR01 All updates of the six private types use the controlled path or fail closed; no privileged generic bypass.
FR02 Preserve scalar/status/reopen/repeated-edit Admin semantics, validation, permissions, reload/conflict and populated response shape.
FR03 Preserve component create/update/remove/order and parent ownership validation.
FR04 Preserve relation/media associations and their connect/disconnect/set semantics; no blob operations.
FR05 Scalar/component/relation changes share one supported framework transaction context.
FR06 No unsafe stale scalar snapshot compensation can commit or escape the boundary; the requested design must identify whether internal snapshot compensation is eliminated or only transactionally contained, without equating the two.
FR07 Detect stale editors before accepting writes, including same-state edits; conflict without silent retry. No unproved timestamp-version assumption.
FR08 Any scalar/component/relation/invariant failure rolls back the entire logical update, without project-managed old-entity compensation.
FR09 No raw SQL, vendor branches, framework patches or monkey-patching.
FR10 No schema or migration changes; stop if new version field needed.
FR11 Public verified create, authentication and required fields unchanged.
FR12 Deterministic policy extension receives current state plus incoming write, runs before persistence, verifies before commit; no017 cleanup rules implemented here.
FR13 No real DB/SQLite/data access during this SDD or development QA; synthetic contract fixtures only, no production bootstrapping.

## Acceptance stories
Admin changes Commerce scalar+components+category together: all persist or none, correct validation/errors and timestamps; a concurrent obsolete editor receives conflict. Moderator uses existing service/action contract and future policy hook without bypass. Failure after any phase cannot leave partial edits or restore a snapshot after a later committed terminal cleanup. Public create remains unchanged in CA/ES/EN.

## Success criteria
SC01 Six-type writer/data-shape mapping complete and all routes verified in design.
SC02 Transaction, rollback, CAS and Admin-extension contracts demonstrated from local installed API/source, not memory.
SC03 Future isolated QA covers all phases, repeated/retry/conflict behavior, and policy extensibility; mocks are not claimed proof of real database isolation.
SC04 Zero BLOCKER/HIGH/MEDIUM before TASKS/IMPLEMENT authorization.

## Non-goals
017 cleanup/nullability, media ownership/deletion, expiration/activity clocks, legal hold/retention, SEO, staging, public publication redesign. No implementation authorized. Feature boundary is justified by six-type reusable persistence/QA infrastructure rather than visible product scope.

## Constitution
I/II existing editorial/static product intact; III secure invariant extension; IV transaction/data guarantees cannot be guessed and no data access; V minimal six-type adapter, no new infra; VI existing language behavior retained; VII separate repos and explicit contracts. No exception requested.

## Authorized revision design exception
Latest user authorizes DESIGN ONLY of one revision integer for each of six private types. This supersedes FR10 no-schema proposal restriction for this field only; product schema/migration/data remain forbidden. See revision-cas-design.md for range, explicit backfill, rollout, CAS, Admin metadata and no-op semantics. Public create validation remains unchanged; server initializes revision1. No017 nullability authorization is merged.

## Durable publication design extension
Latest authorization permits design of extra persistence, human-gated before implementation. See durable-publication-design.md for identity/ledger options, image failure matrix and remaining storage capability gap. See rollout-backfill-design.md for complete maintenance/backfill/legacy procedure. A schema proposal is not an architectural blocker; current M01 is missing proven image put/reconcile capability. No017 work authorized by this pass.
