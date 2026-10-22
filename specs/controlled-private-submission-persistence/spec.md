# Controlled private-submission persistence

> Current status — 2026-10-20: **IMPLEMENTATION FORMALLY SUSPENDED by human decision, not cancelled.** Requirements remain unchanged; no execution authorized. See [suspension decision and reactivation conditions](plan.md#formal-implementation-suspension--2026-10-20). SPEC PASS / PLAN FAIL / TASKS PASS / ANALYZE FAIL; B03-LAYOUT/B03-FORM BLOCKED (2 blockers); implementation QA/CONVERGE NOT_STARTED; Feature017 BLOCKED.

Date2026-10-19. Unnumbered technical prerequisite; B03 architectural direction ratified for SDD/ANALYZE only; implementation not authorized. Current authoritative set: spec.md, plan.md, data-model.md, contracts/storage-publication.md, contracts/admin-writers.md, rollout-backfill-design.md, quickstart.md, allowlist.md, tasks.md, analysis-final.md. All other recovery reports and history/pre-storage-closure preserve historical findings, not current gates. Feature017 remains separate and untouched.

## Stories
US1 P1: As an editor/moderator, save any of six private types with the original revision; stale saves conflict and any failure rolls back scalars/components/relations. Independently tested with synthetic transactions and six schemas.
US2 P1: As Millorem moderator, approve once and retry publication safely after a crash: one canonical file, one Media and one target; a draft stays unpublished until complete. Independently tested with isolated temp storage and DB doubles in FUTURE QA.
US3 P2: As operator, deploy/backfill without mixed writers, preserve legacy publications and recover failed stages without deleting canonical data. Independently tested via rollout rehearsal fixtures; actual data operations human-gated.

## Requirements
FR01 Exactly six private types: solicitud-agenda,solicitud-comunicat,solicitud-veu,solicitud-millora,solicitud-foto-mes,solicitud-comercio. Shared controlled parent updates; unsupported bypass fails closed.
FR02 Preserve Admin scalar/state/reopen, validation, permissions, components/relations and conflict UX; original revision separate from mutable data. B03 intentionally changes Commerce relation UX as specified below; native inline create-and-connect equivalence is not required.
FR03 Preserve existing repeatable component create/update/delete/order and relation ownership/connect/disconnect/set in transaction.
FR04 One supported framework transaction covers parent CAS, components, relations, invariant checks; no parent snapshot compensation.
FR05 Server-only revision integer1..2147483647 default1 for six types; expected revision comparison in actual UPDATE; accepted saves including identical payload increment once; rollback does not increment.
FR06 Typed errors, no silent retries/merge or false success. Side-effect failure aftercommit never rolls back approved source through a stale snapshot.
FR07 Public create validation/verification/auth unchanged; server assigns revision1; no client-supplied revision accepted. Source scopes/CA/ES/EN behavior unchanged.
FR08 Neutral pure policy extension for later017; no private cleanup/name nullability implemented by prerequisite.
FR09 Unique internal source operation and immutable canonical target; no title/slug identity, no duplicate Media or target on retry/concurrency.
FR10 Millorem-only storage adapter: deterministic key from source/role/quarantine ID, verified bytes, exclusive atomic hardlink publication; never overwrite/delete canonical; recover file-written-before-Media.
FR11 Monotonic operation stages, transactionally coupled Media receipt/target completion; unpublished until ready; protect editorial changes and explicit image-change conflicts.
FR12 Temp cleanup only adapter-owned, grace24h and all adapter attempts quiesced; no global cleaner/media changes. Retain source quarantine reference during incomplete operation so existing cleaner protects it.
FR13 Human-gated revision/schema/backfill/legacy mapping and coordinated freeze; no unsafe mixed-version acceptance.
FR14 No DB-specific SQL, distributed locks, framework patch, new dependencies or queues. Local storage capability contract is explicit, other providers fail closed.
FR15 Current execution SDD only. Future local QA uses isolated temp dirs/in-memory doubles, never project DB/SQLite/quarantine/uploads; real data/backfill/deployment separately authorized.

## Success criteria
SC01 Six-type concurrency/failure fixtures prove one commit per expected revision and rollback at every phase.
SC0227 storage/Media/publication cases plus integrity, missing-source and legacy cases pass isolated QA before CONVERGE; no runtime PASS claimed at design stage.
SC03 All affected files match closed allowlist; no017/media-cleaner/expiry scope mixed in.
SC04 Architectural analysis0BLOCKER/HIGH/MEDIUM; schema and execution authorizations tracked separately.

## Boundary
Backend receives future code; frontend holds SDD/QA only. No generic upload replacement, Commerce/FotodelMes image changes, public content redesign, legal retention, expiration, cron or017 schema. Generated Millora and its adapter-owned Media receive narrow write guards; ordinary public records/media remain unaffected. Local atomic hardlink capability mandatory, verified in future isolated target-filesystem qualification; no unsafe fallback. Process crashes/concurrency covered; arbitrary disk corruption, power failure beyond OS durability or privileged external filesystem tampering produce detected fail-closed recovery, not an exactly-once claim.

## Constitution
I editorial intent maintained; II static-first public unchanged; III private boundary and later invariant hook; IV no real data access, operational inspection/backup/validation/approval required; V one local adapter/no new infra; VI existing three language contracts maintained; VII exact two-repo ownership. No exception or amendment.


## B03 ratified direction — SDD authorization only (2026-10-19)
US1/AC-B03: Commerce editors manage categoria/subcategoria in an exclusive panel, explicitly save the association, and create/edit targets in their native editors in a separate tab. Existing target operations and permissions remain unchanged; automatic modal connection is replaced by returning, selecting and saving. No custom relation panel for the other five types, whose domain links are Media fields. This direction and the three named paths are authorized for design, not code creation.

FR16 Effectively remove/disable the incompatible Commerce native relation controls, including create-and-connect and publish-and-connect and nested occurrences. No monkey patch, internal unstable contract or node_modules edit. Other content types remain unchanged. Registration of a panel alone does not satisfy this requirement.
FR17 Shared session owns a coherent original accepted snapshot and revision, keyed by UID/documentId/editor generation in tab-local state. Main, relation and moderation writes take one synchronous session claim before dispatch; no queued stale payload. Initialize from the same original authenticated read, never from a last-moment latest revision. Successful known writes advance exactly once from their authoritative result; failures retain baseline. Navigation/reload invalidates prior generations; late responses are ignored. Network-ambiguous outcome freezes writes pending explicit reload, without claiming rollback.
FR18 OPEN N → main success N+1 → relation success N+2. Two tabs starting N remain independent; after one commits the other receives409 with zero writes for that conflicting command. Missing revision428, malformed400. No automatic retry, cache-driven baseline advance or Admin exception.
FR19 Relation save requires a clean main form; main/moderation save requires resolved relation drafts, and moderation also requires clean main edits. Explain Save/Discard choices. Main save omits the two separately-managed relation fields. Preserve unsaved edits through background refetch; reload/discard requires explicit confirmation. Pending requests and successful reconciliation must not overwrite typing made during the request. Unsupported nested private editor sessions require opening the full editor, without changing unrelated editors.
FR20 Relation-only PUT preserves existing Content Manager authentication, conditional/field permissions, validation, manyToOne cardinality, required category and optional subcategory. Preserve targets' Draft & Publish semantics. Revoked permission must not silently strip a requested change and report success. No atomicity claim across independent target creation and parent association; no automatic deletion of an unlinked new target.
FR21 Existing verified CREATE remains separate, strict and assigns revision1 server-side without an update token. Commerce direct Admin creation remains forbidden. An unsaved record never performs a relation UPDATE or invents a baseline. Any already-permitted Admin CREATE for another private type retains current authorization/validation; UPDATE session starts only from a confirmed identity+revision. Components/Media retain current form editing and enter parent CAS on save.

Acceptance: source evidence must establish a supported scoped native-control exclusion, not only a working response rewrite; original snapshot and revision stay paired across refetch/save/error; all three controls share one write gate; two tabs conflict correctly; unauthenticated/unauthorized requests cannot update; relationship rollback preserves revision; CREATE and unsaved paths are classified; all changes are traceable to tasks and exact allowlist. No runtime PASS claimed before authorized implementation QA. Feature017 remains blocked. See analysis-final.md for the current gate, including unresolved evidence.
