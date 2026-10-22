# Bounded update replacement evaluation

Date2026-10-18. SDD ONLY. Result: no bounded replacement demonstrated under the simultaneous requirements of unchanged Admin/component semantics and no database transaction. Recommend a separate unnumbered technical prerequisite; no new feature created.

## Actual six types and stored structure
The requested solicitud-foto is actually solicitud-foto-mes; no seventh type is introduced.

| Type | Relations/media | Components/dynamic zones | Private refs / arrays |
|---|---|---|---|
| solicitud-agenda | single imatge Media relation | none / none | imatge_quarantena_id string |
| solicitud-comunicat | single imatge Media relation | none / none | imatge_quarantena_id string |
| solicitud-veu | single imatge Media relation | none / none | imatge_quarantena_id string |
| solicitud-millora | single imatge Media relation; publication service separately writes public Millora | none / none | imatge_quarantena_id string |
| solicitud-foto-mes | single imatge Media relation | none / none | imatge_quarantena_id string |
| solicitud-comercio | categoria required manyToOne; subcategoria manyToOne; logo/imagen_principal single Media and galeria multiple Media | repeatable horario_semanal→guiapineda.horario-dia; servicios→guiapineda.servicio; redes_sociales→guiapineda.red-social; no dynamic zones | principal/logo quarantine strings; galeria_quarantena_ids JSON array |

No recursive component fields in the three component schemas. Repeatable components are separate rows plus ordered parent links, not a single scalar JSON patch. Media and component relation primitives cannot write the parent's covered applicant scalars. Parent update wrapper remains a separate risk.

## Existing pipeline, snapshots and ordering
1. General Admin EditView UpdateAction reads current form values/initialValues; validates, transforms values, filters invisible attributes and sends update. These values may be stale, including private visible applicant fields. Custom moderation panel instead posts an empty action body.
2. Content Manager document-manager.update strips id/publishedAt, supplies populate/status and invokes documents(uid).update(documentId,data). Five types have no Commerce guard. Commerce document middleware reads current row and validates/strips protected fields; this is not actual-write CAS.
3. Document Service repository.update runs within common.wrapInTransaction; resolves document/locale lookup, reads entry, invokes entries.updateEntry. No supported moderation reopen action, but generic state writes are technically possible; latest contract requires any permitted reopen to retain deletions.
4. entries.updateEntry transforms relation document IDs, validates entity update against entryToUpdate, then updates components BEFORE parent update. components.updateComponents deletes removed components, updates retained IDs, creates new rows, and prepares ordered pivot links. A later parent failure therefore has work to undo. Components' own snapshots are their own rows, not parent's private contact.
5. Parent Query Engine update calls beforeUpdate, SELECT * into entity, converts data including scalar/owning-FK fields, then UPDATE by id. Any extra predicate used in SELECT is absent from final UPDATE.
6. updateRelations handles join/FK/morph/pivot writes within transaction context. Pure relation statements carry identifier/order data only. Their failure invokes the parent catch: rollback relation transaction, UPDATE(id).update(entity), throw. This full parent snapshot can contain old email/state/name/phone. No lifecycle fires on that direct query-builder compensation.
7. Successful path re-reads result, calls afterUpdate, and returns populated document through transaction wrapper. Query-builder uses ambient transaction. No assertion that a real database committed an adverse schedule; isolation and ambient context were not tested. A vendor-independent all-writers guarantee cannot simply assume the compensation is harmless.

Installed evidence: content-manager/dist/admin/pages/EditView/components/DocumentActions.mjs UpdateAction; content-manager/dist/server/services/document-manager.js:79+; core/dist/services/document-service/repository.js:331+,531+; entries.js:90+; components.js:87-150,239-270; common.js; database/dist/entity-manager/index.js:279-354,604+; query/query-builder.js:464+.

## Strategy comparison
| Strategy | Privacy/stale protection | Admin/relations/components | Maintainability / blast radius / regression | Verdict |
|---|---|---|---|---|
| A wrapper around existing update | pre-read sanitation/CAS lost on actual ID update; full snapshot compensation remains | preserves existing APIs | small wrapper, false guarantee | reject |
| B replace private-submission controller/service | can centralize policy and actual scalar CAS only if every entry routes through it | must reproduce validation, components, ordered links, document IDs, response/populate, errors, events, permissions, timestamps and transaction failure semantics | six types plus Content Manager/shared entry pipeline; high integration surface | separate prerequisite, not bounded017 |
| C scalar CAS then separate relation/component phase | scalar nulls can be monotonic without snapshot rollback | scalar success + component failure leaves partial save; reversing order leaves component mutation on CAS conflict; ordinary error would hide committed changes | changes existing save failure semantics; crash-safe undo/journal would add complexity/schema | reject within current constraints |
| D restricted payload to document/entity update | even relation-only input still causes SELECT* and potential full-entity compensation | retains API but unsafe wrapper still reachable; scalar-only restriction loses component editing | small shape change does not remove compensation | reject |
| E custom terminal API; generic normal editing | terminal cleanup safe alone; an edit admitted before cleanup can later perform unsafe update/compensation | best compatibility but race remains; post-terminal entry guard cannot cancel already admitted write | small blast radius but privacy FAIL | reject |
| F controlled orchestration using existing vendor-neutral transaction abstraction, scalar CAS and safe relation/component operations without parent general update | promising route to eliminate snapshot compensation, with all scalar entry paths gated | transaction rollback could preserve multi-row save semantics; exact supported delegation/validation APIs still need design and validation | project-owned code possible without monkey-patch, but deeper integration and transaction required | STOP; not fully designed or authorized here |

No strategy is recommended as implementation-ready. All parent-scalar update routes capable of replaying old state must be covered/replaced or rejected, including normal edits admitted before terminalization. This does NOT mean replacing pure relation SQL, public create or every update in Strapi. Terminal-transition-only replacement is insufficient.

## Why separation cannot silently preserve failure semantics
For a Commerce form changing a scalar and adding/removing/reordering components:
- CAS first, relation/components fail: parent edit persisted despite failed save; deleting already-created components alone does not restore deleted/updated old component rows.
- Components first, CAS fails: component rows already changed although request was rejected as stale.
- Network loss/crash between phases: no durable operation record exists to complete/undo the edit.
- Snapshot undo of parent revives the original privacy risk; guarded undo can fail due to another writer, leaving partial edits.
- Compensating only editorial fields avoids PII restoration but still cannot guarantee the prior atomic Admin save outcome or avoid overwriting a concurrent editorial edit.
These are concrete multi-row consistency problems, not a request to solve media ownership. An explicitly redesigned partial-save UX/reconciliation contract would be a behavior change, not preservation of current semantics.

Atomicity classification: DB transaction required for the evaluated replacement preserving the existing multi-row document-save failure contract. A single scalar CAS itself does not need a multi-statement transaction. This is not a universal impossibility theorem about all nontransactional designs: a durable saga/versioned representation could change the problem but would exceed the schema/scope constraints. Existing Document Service already uses transactions; the issue is designing a replacement that retains those guarantees without the unsafe scalar-compensation wrapper. Under the user's explicit rule, needing that transaction causes STOP; no transaction was executed or DB opened. No vendor-specific isolation promise, locks, internals patch or monkey-patch adopted.

## CAS / post-terminal / reopen
Keep candidate server-side id+state+covered-private-value expectations, explicit null predicates, via actual conditional scalar updateMany. updatedAt is not proven a unique version and cannot alone establish privacy monotonicity; comparing PII is limited to existing covered fields and never logged. Same-state editorial conflict detection beyond the privacy key still needs the prerequisite's version/conflict contract; do not claim complete stale-editor detection from this key alone.

Post-terminal patches must force covered nulls and reject stale private values; reopen preserves null email and Commerce rejected-name/private phone. Public phone and editorial materials retained; approved Commerce does not get indiscriminate rejection cleanup. An old pending writer or compensation must never restore a pre-terminal snapshot. These requirements remain unfulfilled end-to-end, not implemented. No fictitious placeholders, contact recovery or new state field.

Validation/sanitization error: no write. CAS0/state mismatch:409 conflict/reload; no silent retry. Unknown network result: explicit indeterminate result and reload, not success/replay. Safe multi-row failure semantics are NOT complete without the replacement transaction design; do not certify them from scalar-only models.

## Boundary and recommendation
Technical prerequisite, unnumbered conceptual name: private-submission-update-orchestration. Scope would be the project-owned adapter for six UIDs, routing Admin/moderation/internal writes, maintaining validation/components/relations/timestamps/events/errors, vendor-neutral atomic saves and irreversible private-field policy. No framework patch, no media physical cleanup, no expiration. The concrete blast radius is document-save orchestration and Content Manager compatibility, not the count of fields being nulled. Separate design must decide allowed transaction/isolated validation policy before implementation. No new feature directory, schema, dependencies or code created.

017 reduced product requirements remain appropriate; folding this orchestration rewrite into017 would not. Existing SPEC is retained; no viable replacement means no implementation PLAN/closed allowlist issued. TASKS retain T001 blocked. This new report refines the reason for B02 and adds an evidence-backed prerequisite recommendation, not another blocker.

## QA required for prerequisite, not executed
Cover six UIDs; components add/update/delete/reorder; relation connect/disconnect; scalar+component failure on each phase; CAS conflicts; crash/unknown-response cases; stale Admin in-flight before rejection; generic update compensation exclusion; validation/permissions/populate/timestamps parity; reopen preserving nulls; approved/rejected Commerce contact distinction. Synthetic mocks can check routing and policy but cannot certify actual transactional isolation. No current runtime/DB QA claim.
