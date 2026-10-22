# Prerequisite PLAN — blocked, no implementation allowlist

## Confirmed boundary/API
Exactly six UIDs; extension strapi.documents.use at backend register, separate project service; supported strapi.db.transaction(async callback) encloses work. No public content or creation interception beyond scoped routing. Current schemas unchanged. Full data-shape/Admin preservation matrix in data-model.md.

## Candidate pipeline, not approved
BEGIN callback → load row with identity/current state → validate caller/editor expected token and transition → actual conditional write reserves version → pure injected policy → delegate component/relations/validated parent persistence → invariant verification → return → outer commit. All errors propagate through outer rollback; no manual commit/rollback or catching failure into success; UI errors translated after rollback. No automatic retry. Current next() preserves framework semantics but still internally performs snapshot compensation. A split adapter could avoid that statement but needs fully supported validation/component/relation/event delegation, not established. No closed product allowlist can honestly be issued yet.

## Outstanding design gates
P01 BLOCKER: choose and demonstrate either zero-snapshot supported adapter or explicitly accepted transaction-contained framework compensation with all direct writers gated; preserve lifecycle, component ownership/order, relations, result/populate and error behavior. Current supported helper discovery narrows the issue; it does not close it. Never swallow nested errors.
P02 HIGH: full stale-editor CAS requires original client baseline plus collision-safe existing version signal. updatedAt alone not proven unique; no existing version field, no automatic baseline transport. No new schema allowed. PII comparison not substitute for all-field stale detection.

## Error / idempotency target
Validation/CAS failure→no committed writes; CAS409 reload. Component/relation/scalar/policy failure→throw and rollback. Duplicate request is not automatically idempotent: component create/order and moderation side effects can differ; same payload alone insufficient. Explicit no-change after verifying current baseline may return no-op. Conflicts require fresh user review; uncertain network result reload, never replay blindly. Public publication side effects are not moved inside transaction and are not claimed rollbackable by it.

## Cost
One expected-state/version lookup and one conditional write beyond normal update, plus final verification read; component/relationship work scales with supplied collections. Keep transaction short; no files/network/publication operations inside it. No premature optimization, transaction contention/deadlock errors require recoverable failure rather than silent retry. No isolation promises beyond supported framework contract inferred without tests.

## QA design only
Synthetic transaction context tracks staged writes and rollback/commit; assert error propagation at each phase, same context for scalar/components/relations, hooks/order/permission compatibility, unknown network outcomes and retry rules. Adverse stale-editor/timestamp-collision/component-only edit tests required. Real provider semantics not certified by doubles. No production-data or SQLite use, including hash/stat/copy. QA and implementation NOT started.

## Scope / next gate
No tasks created because PLAN not viable yet, as user requires. No numbered feature. All proposed future files contingent on resolved P01/P02; no directory-wide permissions. Feature017 blocked unchanged. No schema/SQL/vendor branch/framework patch proposed. Require zero findings before final PLAN/allowlist/TASKS.

## Autonomous-chain evidence update
See autonomous-chain-phase-a.md. Supported query.updateRelations and documents.updateComponents now establish candidate primitives without parent snapshot compensation; withdraw the earlier assertion that this primitive set was not identified. P02 becomes BLOCKER (original-editor reliable version without schema unresolved); P01 becomes HIGH for remaining lifecycle/Admin/Millorem integration. PLAN still FAIL. No tasks/allowlist/implementation before the explicit version decision.

## Persisted revision design recovery
revision-cas-design.md now defines initialization/backfill/rollout, exact transaction/CAS, supported primitives, Admin header baseline, writer/lifecycle contracts and failures. P02 resolved in design; generic persistence orchestration has a candidate primitive route. revision-integration-review.md identifies the remaining M01 Millorem external-effect retry/identity gate. PLAN FAIL; no closed allowlist/TASKS until resolved. No claim of no-schema prerequisite remains: revision schema/backfill is proposed only.
