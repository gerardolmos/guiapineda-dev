# Terminal scalar contract — current technical evidence

## Covered paths
Six UIDs: api::solicitud-agenda.solicitud-agenda; api::solicitud-veu.solicitud-veu; api::solicitud-comunicat.solicitud-comunicat; api::solicitud-foto-mes.solicitud-foto-mes; api::solicitud-millora.solicitud-millora; api::solicitud-comercio.solicitud-comercio.
Internal creation uses internal-submission-request.js and documents.create. Moderation uses submission-moderation-lifecycle.js; Admin Content Manager uses Document Service. Query Engine is a shared lower layer. Commerce has an additional write guard; other five do not share that guard. Raw SQL is not an authorized application writer.

## New finding B02 — BLOCKER, not a deferred-media problem
Previous report called B01 email resolved by adding an active-state predicate to beforeUpdate params.where. Installed @strapi/database/dist/entity-manager/index.js:279-308 disproves atomicity: beforeUpdate runs, a SELECT uses where, then the UPDATE uses only the selected id. A stale writer can SELECT an active row, a terminal transition clears email, and the stale UPDATE restores email. The same risk applies to rejected Commerce name/phone. Lines310-325 also restore the selected entity if relation updating fails; enforcing data only in a lifecycle does not prove rollback safety.

This is a correction of an earlier technical claim, not reopening expiration or media ownership. A required atomic invariant cannot be marked resolved by human ratification of that incorrect implementation assumption. Constitution III/IV requires reporting the evidence.

updateMany at :334-354 retains where on the actual UPDATE and returns count, so it is a candidate primitive for scalar conditional updates. It does not by itself cover documents.update, Admin, relations or rollback. No drop-in replacement or complete interception design has been demonstrated. Do not add locks or dependencies, patch node_modules, weaken the invariant or bypass legitimate editorial writes to conceal this gap.

Resolution gate: design a single covered-writer contract whose actual persistence preserves terminal scalars, with explicit stale-write conflict/no-op semantics, bulk behavior, relation failure/rollback and no unauthorized reopening. Show each existing path reaches it. Deterministic synthetic interleavings must validate that design before marking B02 resolved; no DB needed or authorized in this recovery.

## Commerce scalar writes
Reject: state=rebutjat plus email/name/private phone null, normal resolution audit, all other fields preserved. Approve: state=aprovat and participation email null only plus normal resolution audit. Extend the existing Commerce authorization contract for this precise rejection payload; avoid globally denying legitimate editorial field changes. Public creation stays strict. No changes to generic media promotion/deletion workflows of other sections; no new deletion or reference clearing anywhere in017.

## Admin and logs
Existing image panel handles404; optional scalar rendering has no demonstrated crash. Images remain referenced, so the old rejection promise that images remain in private quarantine is correct under the split. Add only the missing scalar cleanup explanation and fixture coverage; do not claim media cleanup or cleanupPending. Design compatibility PASS, runtime validation NOT RUN. New logs use fixed codes and no raw errors or PII.
