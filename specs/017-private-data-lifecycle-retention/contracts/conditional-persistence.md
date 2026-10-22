# Conditional persistence contract —2026-10-18

Design only. Concrete scalar CAS defined; whole-feature proof remains blocked by relation/compensation integration (B02). This document supersedes tentative strategy choices, not historical evidence. No new product code, schema or infrastructure.

## Gate and sanitizer
Conceptual prepareSubmissionWrite(current,incoming,context) receives a server-loaded persisted row, validated caller/action/UID, and an allowlisted partial patch. Never trust incoming current state, row ID, audit authority, or client-supplied private-field baseline. Resolve target state from authorized action; editorial edits retain current state. Reject unsupported keys, clone/recreate restoration, state changes from ordinary editors, and unauthorized transitions. Public create is a separate strict validated command and forces pendent; terminal creation is denied.

One pure deterministic/idempotent sanitizer for all six UIDs: effective aprovat/rebutjat forces email_contacto=null; Comercio rebutjat also forces nombre_contacto/telefono_contacto=null. Preserve unrelated editorial data and all Commerce media references. No snapshot spreading into a patch. Return {where,data} or typed error; no persistence/recursion inside sanitizer.

Monotonic-null rule for a hypothetical authorized reopen: an already-null participation email remains null; an already-null Commerce applicant name remains null, and that null name also requires private phone null. For rejected Commerce these nulls are durable evidence in existing fields, so terminal→terminal or reopen cannot recreate them. Optional phone null alone must not prevent supplying a phone during legitimate active review; name is required at valid initial entry. Do not backfill missing values. This is a preservation rule, not authorization to introduce a reopen endpoint. No supported moderation reopen exists; generic technical reopen is blocked by the proposed gate. Future contact reacquisition requires a separate feature. Legacy invalid rows are not silently repaired.

Active initial-entry validation remains strict. A future reopened request with deleted name must not be mistaken for a fresh active create; the distinction would require an explicitly authorized operation. No new reopen operation in017.

## CAS alternatives and selected scalar key
A state alone: sufficient for active→terminal conflict with no reopening, but cannot distinguish same-state private-field changes or a broadened reopen policy.
B updatedAt alone: existing technical timestamp, not guaranteed unique logical version; precision/equal timestamps cannot prove ordering. Not a privacy proof.
C state+updatedAt: useful optimistic UX hint, still not necessary or sufficient for every private-field change on equal timestamps.
D existing logical version: none identified; do not add schema.
E SELECTED scalar key: numeric row id + expected estado_solicitud + expected email_contacto; Commerce additionally expected nombre_contacto and telefono_contacto. Compare each exact existing scalar, explicit $null predicate for null. Keys originate exclusively from server read. No PII in error/log/CAS telemetry. Do not send this baseline to browser.

Actual persistence primitive: Query Engine updateMany with a unique-id predicate and sanitized scalar data, because installed entity-manager/index.js:334-354 retains where in the actual UPDATE and returns count. Never delegate prepared CAS to single-row update (its UPDATE retains only id). Exactly1 match means scalar write applied;0 means409 submission:stale-write. More than1 violates unique-id contract, fatal error, no success. The final statement includes transition state, nulls and resolution audit together. No separate cleanup write.

Any intervening state/private change makes the old key fail. An ABA sequence back to active with restored non-null email/name would itself be forbidden by the monotonic gate; state ABA with already-null values cannot resurrect PII. Same-state unrelated editorial races are not claimed solved by this privacy key. In-place/no-op requests return an explicitly verified no-change result without blind replay; manual retry must reload current state and submit a reviewed patch. No auto-retry or CAS predicate weakening.

## Writer classification and coverage
| Class | Current writer | Common gate proposal | Bypass / after-terminal / stale / state / reopen |
|---|---|---|---|
| PUBLIC CREATE | verified Function→internal parser→documents.create | strict create authorization; fail-closed create backstop | current path cannot update terminal; initial PII yes; state forcedpendent; no reopen |
| ADMIN UPDATE | Content Manager full form/document update | validate partial patch, reject stale private values; scalar CAS adapter | bypass today; after-terminal/stale yes; generic backend state technically writable in five types; proposed editor state deny |
| MODERATION ACTION | review/approve/reject including Commerce/Millora | gate transitions and audit, scalar CAS | bypass today; concurrent stale checks yes; state write yes; supported reopen no |
| LIFECYCLE WRITE | future/direct hook-triggered query calls; none custom currently | no corrective writes; reject unmarked unsafe calls | direct query must be guarded; no recursive sanctioned writer |
| RELATION WRITE | document entries.updateEntry, category/subcategory/Media relations | complete safe adapter NOT DEFINED | enters ID-only update and compensation; after-terminal yes; broad snapshots possible; bypass remains B02 |
| INTERNAL COMPENSATION | entity-manager catch restoring entity via query builder | no safe interception currently established | bypasses lifecycle; broad snapshot includes state/PII; could reopen technically; live commit behavior depends on outer transaction |
| RETRY | manual/automatic replay of any path | fresh reviewed command, no old snapshot restoration | after-terminal/stale yes; follows action policy; no blind replay |
| OTHER | privileged createMany/updateMany/clone/copy/delete-recreate | reject unsupported commands; only marked scalar CAS accepted | direct calls otherwise bypass; cloning not restoration policy; deletes not PII writes |

Read-only preview/cleaner/report services excluded as in b02-writers-and-strategies.md. Every identified writer is classified; NOT every writer is safely routed. Blocking all generic single-row updates would protect the primitive but break existing document/relation editing. It is not an acceptable silent fix. Continuing to allow those writes leaves the compensation bypass. No new raw-query wrapper or patch to node_modules is authorized/assumed.

## Lifecycle backstop
Prospective beforeCreate/createMany/update/updateMany checks are assertions/rejection guards, not read-then-write sanitizers. A private in-process capability attached by the persistence adapter authorizes only the specific validated operation; ordinary callers cannot serialize a bypass flag. Reject generic single-row writes unless a complete safe adapter has been designed. beforeUpdateMany verifies unique-id/CAS/null-policy shape. No afterUpdate correction, callback recursion, double write or retry. This protects normal Query Engine entry points but DOES NOT intercept internal query-builder compensation; therefore it cannot close B02 alone.

## Admin behavior
Prefer REJECTED for stale non-null covered fields against current terminal/null data (409 submission:stale-write), preserving editorial intent instead of reporting a successful save whose private edits were silently lost. Normalize terminal action payloads with the shared sanitizer. Thus COMBINATION overall. Missing PII in a partial editorial update is acceptable through a proven safe path, with terminal nulls enforced; full form stale PII is rejected. On conflict show recoverable message, reload persisted values, never auto-resubmit old values; preserve unrelated unsaved edits for explicit review. Panel action body remains empty. UI refresh alone is not persistence protection. Full Admin protection is NOT proven until relation path resolved.

## Transition matrix
| FROM→TO | Allowed by moderation/current policy | PII policy / stale behavior |
|---|---|---|
| pendent→en_revisio | review action | retain current active data; CAS mismatch409 |
| pendent→aprovat | no | reject409 invalid-transition |
| pendent→rebutjat | no | reject409 invalid-transition |
| en_revisio→aprovat | approve | email null; Commerce name/phone/editorial preserved; CAS409 on mismatch |
| en_revisio→rebutjat | reject | email null; Commerce name/phone null; CAS409 on mismatch |
| aprovat→aprovat | editorial same-state update; not another approve transition | email null; already-deleted fields stay deleted; stale private edit409 |
| rebutjat→rebutjat | editorial same-state update; not another reject transition | covered nulls remain; stale private edit409 |
| aprovat→rebutjat | no supported action | reject; generic bypass prohibited |
| rebutjat→aprovat | no supported action | reject; cannot revive name/phone |
| terminal→non-terminal | technically possible via generic API today; no supported action | deny under017; hypothetical future authorized reopen must preserve nulls, never reacquire PII implicitly |
| active→same active | legitimate editorial edit | allow validated partial patch; compare actual private baseline; no false success |

## Failures
State mismatch/invalid transition:409 fixed code, no write. CAS mismatch:409 stale-write, no auto-retry. Validation:400 validation code, no write. Sanitization/internal invariant error:500 safe fixed code, fail closed. Unauthorized lifecycle call:403 write-forbidden. Admin stale save:409, explicit reload/review. Storage result unknown:failure/indeterminate, no success and no compensating snapshot restoration. Relation failure:must not restore private scalars, but integrating this into Strapi remains unsolved. Do not claim transaction isolation evidence from an in-memory model. No new transaction, distributed lock or DB-specific behavior is required for the scalar primitive; whole-path feasibility remains unproved.

## QA matrix (no real DB)
1 stale Admin after reject→409 and nulls;2 after approve→409 for stale email;3 stale service→CAS0;4 terminal→terminal unauthorized reject;5 reopen deny/no recreation;6 partial without PII→safe update only through adapter;7 stale partial PII→409;8 interleaved CAS mismatch→0;9 repeated identical write→verified no-change/conflict, never replay;10 manual retry→fresh reviewed patch;11 backstop rejects unmarked calls;12 valid public create→active complete;13 incomplete create→validation failure;14 approved Commerce editorial/name/phone retained;15 rejected Commerce covered nulls;16 email across6UIDs×2terminal;17 name remains null;18 private phone remains null;19 relation failure/compensation cannot restore;20 bulk/clone cannot bypass;21 equal updatedAt and null CAS keys;22 ABA reopening cannot restore deleted fields. Future doubles must model actual ID-only update and compensations, not assume safe routing. All integration cases NOT RUN; design matrix complete, whole-design proof FAIL.

## Gate
B02 remains1BLOCKER,0HIGH,0MEDIUM. Strong per-write atomicity REQUIRED. No schema beyond proposed Commerce name nullability. Media, expiry, activity timestamps, legal pages, SEO and staging excluded. STOP under explicit user conditions: relation/compensation writer remains outside proven gate. Need a bounded decision on replacing that persistence path; not IMPLEMENT authorization.
