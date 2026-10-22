# Autonomous chain — Phase A material STOP

2026-10-18. Latest authorization requires true replacement of parent snapshot compensation, reliable original-editor CAS, and no new schema. No B/C work begins before all gates pass. Prior analyses reused; only new primitive/CAS evidence added.

## Progress: supported safe primitives identified
Parent: strapi.db.query(uid).updateMany({where,data}) retains actual predicate; returns count; triggers before/afterUpdateMany. Scalar payload must exclude component/relation keys; owning foreign keys require validated normalization. No parent snapshot rollback in this primitive.
Components: strapi.documents(uid).updateComponents(current,data) and omitComponentData(data), explicitly exposed for document middlewares in types/modules/documents/component-extension.d.ts:60/70. UpdateComponents preserves repeatable create/update/delete/order and returns link data. It must remain inside outer transaction and be called after appropriate entity validation; no reimplementation engine.
Relations: strapi.db.query(uid).updateRelations(id,data) DECLARED in database/entity-manager/types.d.ts:43. entity-repository.js:93-103 creates/joins transaction, delegates entityManager.updateRelations, commits or rolls back/rethrows. No update(entity) compensation. Nested commit/rollback are no-ops under the outer transaction, so error propagation rolls everything back through the outer owner. This API was not included in earlier failed designs; correct that gap rather than repeat the old impossibility claim.
Validation: strapi.entityValidator is typed on Strapi; existing validateEntityUpdate available. Document-service transforms/permissions/populate/event behavior still must be integrated explicitly. No framework patch or raw SQL needed for these candidate primitives.

Candidate transaction pipeline now structurally possible: supported documents.use→outer db.transaction→current lookup/original editor token→validate→policy→actual parent conditional UPDATE→component helper→safe relation helper→verify→return/commit. Failure throws out of callback; no parent general update and no parent snapshot compensation. Component own updates concern component rows, not parent applicant scalars; all rollback under outer transaction. Full compatibility not certified yet.

## P02 now BLOCKER: reliable original version not available as-is
Installed timestamps.beforeUpdate assigns new Date(), not an incrementing version. Same-state writes within same millisecond can produce identical updatedAt; DatetimeField serializes Date to ISO but does not add uniqueness. Status+timestamp therefore cannot satisfy A-save→new-token-Y for every relevant update. A pure synthetic counterexample executed in memory: changed scalar, same state/time, stale baseline still matches. No transaction/module bootstrap/DB executed.

Alternatives evaluated:
- status only: same-state edits invisible.
- existing framework version: no logical revision identified; documentId stable; draft/published version terminology not a concurrency counter and these six disable draftAndPublish.
- hash of original/current content: may detect changed content but ABA produces same token; component/relation-only changes require canonical complete snapshot and still no monotonic revision. Not the required per-save new-version contract.
- PII comparisons:017 scalar invariant candidate, not full editor stale detection, unnecessary sensitive baseline transport.
- in-memory counter: loses correctness across restarts/processes, not a persisted version.
- force updatedAt=max(now,prior+tick): would repurpose wall-clock modification time into logical clock, potentially future-dating bursts, and needs explicit portable precision/roundtrip contract. Not demonstrated compatible with current timestamp semantics; not silently selected.
- revision field: explicit persisted increment via conditional update can provide desired contract, but user expressly requires STOP for this schema decision. Not added, no migration proposed/executed.

Admin original token must be captured at fetch/open, retained separately from mutable form values and sent through supported save extension; server reread at save is not the baseline. Current form transform removes metadata outside schema. No automatic original-token transport assumed. Selection of version contract precedes this UI wiring.

## P01 HIGH: remaining integration, not primitive impossibility
Parent/component/relation safe APIs now identified; previous unsupported-primitives objection withdrawn. Full lifecycle/event/transform/Admin response parity and original-token transport remain unfinished design, no closed allowlist. This is not a second claim that transaction API is missing.
Millorem inspected: approval promotes via uploadService.upload (external filesystem/provider side effect), then ensurePublishedMillora before private state update; catch can delete public Millora/Media. Existing order cannot simply be called inside candidate transaction and certified safe. Latest contract requires external effects after commit. Public Millora uses document DB publication; upload effect is not DB-rollbackable. Successful retry needs idempotent publication/attachment and surfaced after-commit failures, not stale parent undo. No new after-commit implementation/outbox or public redesign performed. Full six-type PASS cannot yet be asserted. Phase A STOP at version decision prevents issuing TASKS/green integration claims.

## Matrix outcome
All six types share the CAS blocker: Agenda FAIL, Comunicats FAIL, Veus FAIL, Millorem FAIL, Foto del Mes FAIL, Comercio FAIL. Exact shapes remain in data-model.md. Commerce components and all relation primitives are now supported candidates, not lost or implemented. Millorem has the additional explicit side-effect integration to close under P01.

## Governance
SPEC remains valid; PLAN FAIL. TASKS/ANALYZE/IMPLEMENT/QA/CONVERGE not started for this chain beyond preliminary design findings. BLOCKER1(P02),HIGH1(P01),MEDIUM0. Feature017 Phase C NOT_REACHED and scope unchanged. No artificial approval at a green gate: gate is red on explicit schema/version decision and remaining integration.

Decision required: authorize design of a persisted revision for the six types, or explicitly choose a different version policy with its timestamp/ABA tradeoffs. Recommendation: authorize revision design only; no migration/data permission implied. After decision, close original-baseline transport and lifecycle/Millorem integration before tasks or implementation.

Only SDD changed. No product/schema/node_modules, SQL, DB/SQLite/data, transaction, migration, dependency, commit/push/deploy. No numbered prerequisite or other feature created.
