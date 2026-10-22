# Revision integration closure review

Date2026-10-18. CAS design closes earlier P02: integer revision, actual conditional UPDATE and original Admin baseline contract. Historical/rollout choices specified; schema/backfill only proposed. Transaction and parent/component/relation supported primitives mapped. No database or transaction executed.

## Millorem: concrete remaining BLOCKER M01
Existing approveMilloraUnlocked promotes upload first, then ensurePublishedMillora, then private approval update; failures attempt to delete public/Media. That ordering cannot be retained under the new explicit after-commit external-effect requirement. Upload service includes refId/ref/field and can attach private Media association; that mutation must increment revision through controlled persistence, not bypass it.

Proposed ordering: approval CAS commit→explicitly awaited effect executor→upload/publication→controlled attachment if needed. No effect runs on failed transaction. Public creation alone does not increment private revision. On effect failure, approved private row/revision remains committed and failure is surfaced; retries cannot invoke the old rollback-to-snapshot path. This is safe for private scalar monotonicity, but NOT yet a complete duplicate/publication recovery guarantee.

Source evidence: millora-publication.buildSlug includes mutable title plus last8 chars of documentId. findExistingMillora retries by that slug; title changed between approval and retry yields another key. Existing source does not persist approved publication payload or an effect receipt, and does not demonstrate an idempotent upload key. Process crash after upload/publication but before acknowledgement cannot be proven duplicate-free by an in-memory callback. Two effect retries can race; generic revision for a private update alone is not a durable effect-delivery receipt/lease. Do not label deterministic slug as global exactly-once proof or invent a unique database guarantee from uid type.

Options (not implemented): stable full-source identity for public publication with reconciled retry contract and idempotent upload adapter; or durable effect state/outbox. The latter could require schema beyond authorized revision and triggers STOP. The former changes publication identity/recovery policy and needs an explicit bounded design decision before preserving old behavior can be claimed. No public content redesign, Media cleanup, new field or outbox silently added. Existing logs/raw errors not refactored.

## Outcome / gates
SPECIFY PASS with latest revision design exception. PLAN FAIL until M01 is closed. TASKS NOT_STARTED (user requires viable PLAN); full ANALYZE NOT_STARTED, this is preliminary finding review. BLOCKER1(M01),HIGH0,MEDIUM0. Earlier P01/P02 historical reports are superseded, not erased. CAS/Admin/lifecycle patterns are design contracts, not executed tests. Controlled parent compensation route is removable with discovered primitives; no claim of implemented removal.

All six types covered in field/CAS/writer contract; Millorem compatibility cannot be declared PASS. Future implementation allowlist NOT closed while effect routing/identity decision remains. Prerequisite not safe to implement;017 remains blocked. No product/schema/DB/SQLite/transactions/migrations/dependencies/Git/deployment operations.

Next decision: define a stable source-bound, retry-safe Millorem publication/upload contract without additional schema, or explicitly authorize design of durable effect state separately. Do not begin implementation at a red gate.
