# B02 recovery — source-only writer audit, 2026-10-18

## Boundary and result
DESIGN ONLY. B02 remains BLOCKER. STOP: a complete enforcement path for all permitted writes and framework compensation has not been demonstrated. No product/schema edits, DB connection, SQLite, bootstrap, transactions executed or migrations. This is not a claim that a vendor-specific transaction is the only possible solution.

## Writer inventory (all six UIDs unless stated)
Source inventory: backend src/services, src/api, src/admin and src/index.js, plus installed Strapi Document Service, Query Engine and Content Manager. No application lifecycles or bootstrap jobs writing requests found. Each solicitud API directory contains only its schema; no standard public CRUD controller/routes. Privileged arbitrary raw SQL/future plugins are not authorized application writers and cannot be certified from this source audit.

| Entry → writer | Fields/shape | Read, identifier, predicate | Concurrent / after terminal / stale risk |
|---|---|---|---|
| Public verified Function → authenticated internal-submission controller → internal-submission-request create | validated broad initial payload; server forces pendent; private refs server-generated | new create, no supplied existing row ID | concurrent creates yes; no existing-terminal update route; no resurrection of same row |
| Internal moderation startReview → updateSubmission → documents.update | partial state and review audit | reads by documentId; checks pendent; eventual numeric-ID update | process-local Map only; stale review can race other writers/processes; can restore active state if check races |
| approve generic / approveMillora → updateSubmission | partial aprovat,email null,ref null,audit; related media/public-content operations separately | reads en_revisio, documentId→ID; state check not predicate on actual update | can race; no stale email payload directly; existing compensations touch Media/public Millora, not explicit private scalar snapshot |
| reject generic → updateSubmission | partial rebutjat,email null,ref null,audit | reads en_revisio then ID update | can race; terminal email null directly; no name/phone cleanup outside Commerce intended |
| Commerce resolveCommerceUnlocked → authorized guard → documents.update | partial terminal/email null/audit today; future rejection also name/phone null | read en_revisio; guard reads again; eventual ID update | process-local lock insufficient across writers; guard has TOCTOU |
| Admin moderation panel → internal moderation action | empty body; no private snapshot | section/documentId action URL | stale action can conflict; service owns state checks |
| General Content Manager edit/relation modal → document-manager.update → documents.update | transformed form values, not guaranteed changed-fields-only; may include applicant scalars and relations | initial UI values; server finds document then ID update | concurrent yes, saves after terminal possible; stale values possible |
| Commerce document middleware | authorized state/audit/email checks; strips unchanged protected fields for ordinary editor; name/phone currently not protected | current row read; no actual-write conditional predicate | stale name/phone editable today; pre-read suppression alone insufficient |
| Document Service create/clone/import-like privileged calls | broad input or cloned entry | new ID; existing document lookup/copy possible | five sections lack Commerce direct-action guard; cloned stale payload must not be treated as legitimate restoration |
| Query Engine update/updateMany/create/createMany (framework/shared service layer) | supplied partial or broad data; updateMany supports scalar bulk | update SELECT(where) then UPDATE(id); updateMany retains where on UPDATE | direct privileged calls could bypass document middleware; future backstop must fail closed for unsupported operations |
| Query Engine update failure compensation | full previously selected entity | UPDATE(id).update(entity), bypasses beforeUpdate callback | internal broad stale snapshot; runtime reachability/effect depends on enclosing transaction; not proven safe universally |
| Document Service internals | entry validation, component/relation handling, query update; possible entry copy/create branch | repository.js:331+ and entries.js updateEntry use lookup then ID | wrapped in existing transaction; transaction presence alone is not proof of isolation against stale input |
| Content Manager delete/bulk delete; query delete | removes record/relations, no scalar restoration by itself | document/ID lookup | not a restoration path; delete/recreate/clone cannot be used as sanctioned reopening |

Read-only exclusions: private-moderation-image reads requests; private-submission-image-cleanup only reads their refs (deletes blobs, outside017); internal content/report services write report/public-content types, not these six request types. Public Millora publication compensation is separate from private-request scalar persistence. No other current application writers found by UID and generic documents/db-query search.

## State and data policy
All six schemas enumerate pendent,en_revisio,aprovat,rebutjat; only aprovat/rebutjat are terminal. No supported moderation reopen or terminal→terminal action: services require en_revisio to resolve. However privileged generic Query Engine updates can set any enum, and five sections lack a shared state guard. Thus technical reopen is possible today; no assertion of public reopen or UI-exposed button.

Required policy: reject reopen and different terminal→terminal transitions; same-state retries may be idempotent only after verifying current sanitized state, never restoring an old snapshot. A future explicitly authorized reopen must preserve deletions; no such policy exists here. Without a tombstone, allowing rejected Commerce→approved would otherwise lose knowledge that applicant name/phone had been cleared. Prohibiting this transition avoids inventing a new schema.

Unified conceptual sanitizer: email null for either terminal in every section; Commerce rebutjat also name/telefono_contacto null. Commerce aprovat retains applicant name/phone and all editorial/media data. State must be effective at the write, not solely a request field or an earlier read. Sanitizer errors abort before persistence. It cannot alone make a stale state read atomic.

## Strategy comparison
| Strategy | Benefit | Counterexample / limitation | Verdict |
|---|---|---|---|
| A terminal write guard reads current and sanitizes | rejects obvious stale terminal payload | another writer resolves after read and before update; guard sees active | insufficient alone |
| B beforeUpdate | shared query-level coverage, no recursion needed | update loses where; framework compensation bypasses callback | insufficient alone |
| B afterUpdate | can detect a violation later | observable resurrection interval, callback failure, recursive repair/compensation; cannot ensure monotonicity | rejected |
| C shared service sanitizer | consistent email/name/phone policy and clear failure codes | Admin/direct query paths need routing; state read still races | necessary policy component, not synchronization |
| D actual-write compare-and-set | updateMany retains where and yields count; vendor-neutral scalar primitive | must cover every writer and compensation, not only moderation; relation writes and document semantics are not a drop-in replacement | candidate, not complete |
| E sanitizer + lifecycle backstop only | common rules and blocked obvious bypasses | same read/write interval and rollback bypass remain | insufficient |
| E sanitizer + actual-write CAS + fail-closed entry backstop | minimum promising design; no vendor SQL or added distributed lock | whole Admin/relation/document integration and prevention of snapshot compensation not demonstrated without redesign/transaction assumptions | NOT selected as completed solution; STOP |

Strong atomicity: REQUIRED for coupling effective state with scalar minimization/restoration protection on each relevant write. A scalar conditional UPDATE is sufficient in a closed writer model; a multi-statement DB transaction is NOT proved necessary. Existing Document Service transactions confirmed in repository.js:531-541 and common.js, but isolation/rollback behavior is not inspected through DB and not assumed. No new transaction or DB-specific behavior is adopted. CAS is required by the evaluated candidate, not proof the feature is resolved. A lifecycle fail-closed backstop would be required if any direct Query Engine path remains; callback normalization alone is not enough.

## Admin mitigation and public validation
Panel sends post(url,{}) at PrivateModerationImagePanel.jsx:368+, so no PII snapshot from that action. General editor reads form values in installed DocumentActions.mjs UpdateAction and submits transformed data; document-manager.js:79+ does not turn it into a safe atomic patch. Hidden fields/private flags are not concurrency controls. Minimal proposed UX: on server stale-state conflict, retain unrelated unsaved edit for review, invalidate/refetch server values, never automatically resubmit PII, render terminal null as empty. Server remains authoritative and must prevent restoration before success; UI refresh alone is not adequate. This UX mitigation is designed, persistence integration remains blocked. No broad Admin redesign authorized.

Public Function/internal parser unchanged: required name/email/consent/principal image, existing verification and auth; server forces active state. No public endpoint found that updates an existing terminal request. Do not relax active public creation to solve persistence constraints.

## Failure semantics (required contract, not implemented)
Single terminal scalar statement must include state and all covered nulls, avoiding a separate cleanup write. Sanitization/validation failure: no terminal write, fixed code, no PII logs, no blind retry. Conditional zero-match: conflict, not success; reload current state only for an explicit idempotency decision. Storage error/unknown outcome: return failure/indeterminate, do not restore saved entity, do not retry automatically; a subsequent explicit attempt uses effective state. Partial relation failure must never compensate private scalars from a snapshot; proving this across framework paths is the remaining B02 gap. A second terminal write cannot restore fields; unsupported transition fails. New logging fixed codes only.

## Synthetic evidence executed without project imports
S1: active pre-read → reject clears → id-only stale update restores PII: counterexample PASS.
S2: prior snapshot → reject clears → broad compensation restores PII: abstract counterexample PASS, NOT a claim that a live Document Service transaction commits this schedule.
S3: reject clears → actual-write state CAS for active row: zero-match, PII remains null: candidate primitive model PASS, NOT full integration QA.
No runtime Strapi behavior, transaction isolation, database or actual records tested.
