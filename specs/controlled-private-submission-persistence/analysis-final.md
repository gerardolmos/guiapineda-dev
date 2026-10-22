> Current governance — 2026-10-20: **Formal implementation suspension ratified by the user.** See [PLAN: suspension and reactivation](plan.md#formal-implementation-suspension--2026-10-20). SPEC PASS / PLAN FAIL / TASKS PASS / ANALYZE FAIL; B03-LAYOUT/B03-FORM BLOCKED; BLOCKER 2 / HIGH 0 / MEDIUM 0; IMPLEMENT not authorized; implementation QA and CONVERGE NOT_STARTED; Feature017 BLOCKED. Prior recommendations below are historical and now ratified only as suspension, not cancellation or requirement relaxation. No new technical analysis or gate PASS.

# Controlled persistence scope reassessment — 2026-10-20

## Decision proposed, not enacted

**Recommend formal suspension of this prerequisite's implementation scope.** Current architecture gate remains FAIL: B03-LAYOUT/B03-FORM BLOCKED; BLOCKER 2 / HIGH 0 / MEDIUM 0; SPEC PASS / PLAN FAIL / TASKS PASS / ANALYZE FAIL. The six-owned-editor candidate remains rejected under current evidence/restrictions. No architectural investigation is reopened. Suspension requires a human governance decision; this report does not change the authoritative SPEC, PLAN, TASKS, contracts or allowlist or mark any task completed.

There is reusable independently assessable design, but no independently deployable product increment demonstrated safe inside the present prerequisite. Isolated verification of a primitive is not verification of complete writer coverage, permissions or production integration. Current authorization permits analysis only, so even potentially separable synthetic tests are not executable now. Project-wide suspension is neither necessary nor recommended.

## Basis / traceability

Reviewed current prerequisite spec.md (US1–US3, FR01–FR21, SC01–SC04), plan.md (including rejected B03 integration and T020 gate), tasks.md (T001–T026 and dependency ordering), contracts/admin-writers.md, contracts/storage-publication.md, data-model.md, rollout-backfill-design.md and quickstart.md. Reviewed Feature017 spec.md and contracts/conditional-persistence.md strictly as dependency evidence; no017 artifact changed. Constitution III/IV/VI/VII require privacy, explicit operational authorization, no silent regression and repository boundaries. Previous acceptance matrix/evidence E1–E9 below is retained; no repeated framework research.

Important existing dependency: tasks.md explicitly orders US1 before integrated US2, bars an isolated US1 deployment with the old unsafe Millorem path, and requires T020 before implementation authorization. Calling a suite “independent” in a story does not override that dependency or authorize implementation. Historical017 scalar-CAS notes are not a fallback permission to revive a rejected path.

## A, B and C are different guarantees

A — Editing concurrency: original accepted revision, all permitted editor/moderator mutations taking a real conditional update, one increment, no lost updates, coherent tab-local draft and recoverable conflicts. It depends on authentic browser/session transport as well as backend enforcement. B03 presently blocks that integration.

B — Terminal privacy monotonicity: once covered private values are deleted, no permitted later write, stale snapshot, retry, compensation or hypothetical reopen may restore them. It requires atomic current-state policy plus complete coverage of relevant writers. A revision alone is insufficient: a freshly loaded revision can accompany an otherwise authorized request to set a deleted field again. Conversely, a universally enforced terminal-null rule could protect PII without detecting every non-PII editorial lost update. This is a logical distinction, not a new proposed implementation or proof that such a boundary exists here.

C — Feature017 cleanup: terminal email null across six types; Commerce rejection additionally clears applicant name/phone, approval preserves those two; editorial data/media remain as ratified; strict public intake remains required despite nullable stored name. C is acceptable only together with B. A one-time cleanup, background corrective write, UI hiding, or nullability change with unguarded later writers does not satisfy017. Existing cleanup behavior is not newly certified safe by postponing017.

Dependency conclusion: C logically requires B and atomic terminal transition, not necessarily every UX aspect of A. Under the current chosen SDD, the proposed means to obtain B is the controlled persistence prerequisite; its writer closure and compensation safety are unproved. Therefore neither logical independence from parts of A nor a smaller schema edit unlocks C. The prerequisite's neutral policy seam FR08 does not itself implement B; completing A would still require separately proving017's policy and all relevant writes. No privacy ratification is weakened.

## Per-requirement scope matrix

Legend: B03 “integration” means the primitive is not inherently a UI operation but its required application-wide guarantee depends on the blocked integration. CAS “all” means all permitted private-parent updates, including internal/moderation; “ledger” is a distinct operation-state CAS, not a substitute for parent CAS. Independent verification means a bounded contract/fixture can be assessed separately after separate authorization, never current permission to code or a full acceptance PASS.

| Requirement / original objective | Technical dependencies and risk avoided | B03 dependency | CAS dependency | Independent verification / isolated risk | Recommended state |
|---|---|---|---|---|---|
| FR01 six-type shared boundary, reject bypass | All writers, guards, permissions; avoids uncovered mutation | Integration | All | Inventory can be reviewed; partial routing leaves bypasses | BLOCK |
| FR02 preserve Admin features and original baseline | Existing permissions, form, actions, reopen policy; prevents lost drafts/privilege drift | Direct | All for writes | Functional inventory only; partial editor breaks parity | BLOCK; reconsider feasibility only by human scope decision, not weaker guarantees |
| FR03 atomic components/relations | Owner validation, helpers, parent transaction; avoids partial aggregates | Integration; Commerce direct | All parent | Synthetic helper rollback separable; isolated child writes bypass parent revision | BLOCK integration; CONSERVE contract |
| FR04 one transaction, no snapshot compensation | Safe replacement of parent path and every caller; prevents partial state/restoration | Integration | All | Transaction model independently assessable; does not prove framework routing | BLOCK |
| FR05 server revision/actual conditional update/exactly one increment | Six schemas, original N, conditional primitive, rollback | Integration | All | Primitive fixture separable; schema/default alone creates false safety/mixed writers | BLOCK product/schema; CONSERVE rule |
| FR06 typed failure/no blind retry/no stale source rollback | Error propagation, truthful postcommit status, source and effect boundaries | UX integration | All; ledger where relevant | Error taxonomy separable; partial UI can falsely report success or retry unsafe writes | CONSERVE; BLOCK integration |
| FR07 verified create unchanged, revision1 | Existing parser/auth, server-only assignment and coordinated schema | Creation session integration | Initialization, not expected-N update; participates in all-writer rollout | Intake contract review separable; isolated revision change creates incompatible runtime/schema | CONSERVE; BLOCK revision implementation |
| FR08 neutral later017 policy seam, no cleanup | Pure policy interface; prevents scope mixing | No intrinsic; adapter integration | All at enforcement boundary | Interface reasoning separable; unused seam provides no privacy protection | CONSERVE as design; BLOCK activation |
| FR09 unique source/target/Media identity | Unique ledger, immutable mapping, receipt transactions, guarded targets | Source approval integration | Ledger + parent approval | Identity model separable; standalone ledger does not make approval/retry safe | BLOCK integrated US2; retain identity contract |
| FR10 deterministic verified atomic file publication | Immutable manifest, same-volume link, byte integrity, owned directories | No intrinsic | No CAS for physical ensure; ledger supplies trusted manifest | Physical algorithm can be tested in synthetic temp roots after authorization; publishing real files alone risks orphan/exposure and lacks Media/target guarantees | SEPARATE candidate for bounded validation only; no product release |
| FR11 monotonic stages/receipts/unpublished until ready/editorial protection | Ledger CAS, Media/target tx, source approval and target guards | Source integration | Ledger + parent approval | Stage model separable; partial wiring risks duplicates or premature publication | BLOCK integration; CONSERVE |
| FR12 only owned-temp cleanup, quiescence, source retention | Ownership/grace/drain and source-ref lifetime | No intrinsic; source writers affect retention | Source-ref protection via controlled writes; not filesystem CAS | Cleanup predicate model separable; actual cleanup can destroy needed bytes if ownership/quiescence unproved | CONSERVE; BLOCK runtime/cleanup |
| FR13 human-gated schemas/backfill/legacy/freeze | Complete release group, backup/validation, no old writers | Yes for activation | All + ledger | Checklist review separable; schema/backfill alone changes data without safe consumer | CONSERVE operational gates; BLOCK execution |
| FR14 supported mechanisms, no patches/dependencies/unsafe providers | Compatibility and fail-closed capability contract | No intrinsic | Constraint on implementation, not CAS guarantee | Static contract audit independent; cannot relax it to clear B03 | CONSERVE |
| FR15 SDD-only/isolated future QA/no real data | Authorization and fixture isolation | No | None | Analysis independent now; QA requires later permission | CONSERVE |
| FR16 scoped native Commerce control exclusion | Supported API and backend coverage, unchanged other types | Direct LAYOUT | Parent relation writes | Evidence failed; visual exclusion alone gives no write protection | BLOCK; no repeat investigation |
| FR17 authentic accepted snapshot, session claim, error/generation rules | Supported form ownership, result ack, navigation | Direct FORM | All + original N | State-machine reasoning separable; disconnected session cannot protect native writes | BLOCK integrated implementation |
| FR18 sequential increments/two tabs/409428/no bypass | Original N transport + actual parent CAS | Direct | All | Synthetic protocol model separable; no runtime parity proof | BLOCK; CONSERVE strictness |
| FR19 pending draft coordination/refetch/typing safety | Main/relation/moderation integration and explicit discard | Direct FORM | All operation coordination | UX acceptance definitions separable; one isolated panel can lose changes or race | BLOCK |
| FR20 equivalent relation permissions/validation/D&P | CM field/entity authorization, target semantics, required/optional cardinality | Direct LAYOUT/permission boundary | All parent association | Permission inventory separable; custom endpoint without equivalence can escalate privileges | BLOCK |
| FR21 create/update identity separation, components/media parity | Parser/schema, confirmed create, existing permissions, full editor lifecycle | Direct integration | Init1 then all updates | Creation rules can be specified independently; isolated editor/schema risks missing or fabricated baseline | BLOCK product; CONSERVE intake restrictions |
| SC01 six-type concurrency/failure proof | FR01–07,17–21 and real routing fidelity | Yes | All | Doubles alone prove model, not runtime closure | BLOCK acceptance |
| SC02 (printed SC0227) 27 storage/publication + integrity/legacy cases | FR09–13; storage primitive plus coupled source/ledger/target | Integrated suite yes; physical subset no | Ledger + source | Subset independently verifiable after authorization, never full suite completion | SEPARATE only possible subset; BLOCK full acceptance |
| SC03 exact allowlist/no017/cleaner scope | Scope audit | No | None | Independently reviewable; passing scope says nothing about behavior | CONSERVE |
| SC04 zero findings/separate authorizations | Resolution of both blockers and human gates | Yes | Whole guarantee | Cannot mark passed by moving findings out of report | BLOCK |

No requirement is deleted. “Separate” is a proposed organizational possibility, not a newly ratified feature or a task authorization. Reopen in FR02 cannot mean restoring deleted values or enabling an unsupported017 transition; the existing privacy ratification remains authoritative.

## Task-level disposition (all 26 remain unchecked)

| Tasks | Relation to scope / recommended disposition |
|---|---|
| T001 | Authorization/scope baseline can be reviewed as governance; does not authorize code. CONSERVE |
| T002 | Six revision schemas/types: BLOCK with US1; no preparatory migration or schema-only rollout |
| T003 | Ledger schema: BLOCK with integrated US2; not a standalone safe product increment |
| T004 | Model-only CAS doubles could be separated later, but current dependencies/T020 prohibit execution; do not present them as all-writer proof |
| T005–T007 | Persistence/guards/read-header/Admin/moderation integration: BLOCK, no partial safe release established |
| T008 | Integrated Admin QA: BLOCK, no implemented supported design to validate |
| T009 | Physical storage cases: candidate SEPARATE future isolated validation scope; not authorized now |
| T010 | Ledger/Media/publication model cases: bounded synthetic reasoning separable, full approval integration remains blocked; no current QA authorization |
| T011 | Storage adapter code: BLOCK under present tasks. A stand-alone primitive would require a new explicit bounded contract, no production wiring and independent gates; not recommended as immediate product work |
| T012–T014 | Ledger service, atomic approval wiring, target/Media guards: BLOCK; local ledger CAS does not close source/private writers |
| T015 | Full US2 acceptance: BLOCK; physical subset passing cannot mark this complete |
| T016 | Rollout rehearsal model could be reviewed independently after scope/authorization; actual schema/backfill remains BLOCKED |
| T017 | Existing operational design retained; further document changes outside this turn; real execution BLOCKED under separate human gates |
| T018–T019 | Final validation/CONVERGE: BLOCK; cannot converge a suspended/failed design |
| T020 | Failed design gate retained; do not reset findings or reopen discarded research |
| T021–T023 | Session/panel/main/moderation integration: BLOCK |
| T024–T026 | Corresponding layout/form/permissions/regression QA: BLOCK |

Contract disposition: admin-writers.md stays intact as unsatisfied guarantee; storage-publication.md remains design evidence with bounded physical independence and coupled approval dependencies; rollout-backfill-design.md remains conditional, not ready operations. No schema, contract, policy or allowlist edit performed.

## Scope options, actual guarantees and human decisions

1. **Recommended: formally suspend prerequisite implementation, archive current readiness as FAIL, retain all contracts/evidence and keep017 blocked.** No new runtime guarantee; no new unsafe partial rollout or privilege change. Existing risks are not repaired by suspension. Human decision: ratify suspension and classify unrelated project work separately. This is the minimum governance change and does not require a new Admin design.
2. **Optional later: separate a bounded verification-only package for the physical storage protocol and pure identity/state models.** It could establish properties of deterministic keys, complete-file publication, EEXIST integrity checks and synthetic state transitions with isolated fixtures after explicit authorization. It cannot establish actual DB uniqueness/atomicity, source approval safety, permission parity, all-writer closure or017. Human decision: justify standalone value/cost, approve exact verification scope/files and correct task dependencies. No real storage, activation, schema or product integration. This option does not unblock the original prerequisite and is not executed or created here.
3. **Do not select: release a smaller CAS-only or cleanup-only slice now.** A scalar/moderation-only adapter leaves other writers and compensation outside the proof; deleting PII first and fixing restoration later violates ratified privacy. Storage-only production wiring leaves approval/ledger/permission coupling unresolved. Removing Admin actions, weakening permissions or accepting missing revision would be a contract regression, not scope cleanup. No such relaxation is recommended.

There is no requirement to wait for B03 to document privacy invariants or physical algorithm properties; that useful analysis is already retained. There is presently no demonstrated independently releasable implementation inside this scope. Therefore the recommendation is suspension, not ongoing speculative implementation of primitives merely to show progress.

## Feature017 and project impact

Feature017 remains blocked as a complete feature, including cleanup/name-nullability activation. Its ratified split is unchanged: six-type terminal participation-email protection; rejected Commerce applicant contact cleanup; approved Commerce contact/editorial preservation; no physical media cleanup, expiry jobs or historical batch cleanup. UI empty-state copy, logging constraints and parser requirements can be specified independently but are not separate accepted017 releases and are not implemented here. Deferred expiry/media/retention work is not pulled back in.

GUIAPINEDA is not globally blocked. Separately scoped work demonstrably independent of private persistence, terminal cleanup, moderation, identity/publication coupling and these writer guarantees may proceed under its own authorization and normal SDD gates. This report starts no feature and approves no specific backlog item. Existing application behavior stays unchanged; neither safety certification nor a claim that existing risks vanished follows from pausing development.

## Proposed SDD governance changes, requiring a later decision

After human ratification only: mark prerequisite implementation suspended in its status/plan and preserve both unresolved findings; keep blocked tasks/dependencies visible rather than deleting them; record017 dependency on proof of terminal monotonicity and safe complete writer coverage, with the current chosen means still unresolved. If optional verification work is commissioned, define its own bounded acceptance and exclusions before changing tasks/allowlist; it must not inherit full US1/US2 PASS. No new numbered feature, contract rewrite or privacy amendment is proposed now. No claim that the complete Feature017 guarantee can be reduced to editing-conflict reduction.

This execution changes only analysis-final.md and qa-report.md and preserves previous reports below. No implementation/QA execution/CONVERGE, real SQLite/DB/storage/uploads, migrations/backfill, dependencies, framework edits, monkey patches, CAS bypass, commit/push/deployment or Feature017 implementation. Recommendation requires human acceptance; safe to implement remains NO.

---
## Previous results preserved — scope reassessment does not reverse their FAIL

# Controlled Admin FINAL ACCEPTANCE GATE — 2026-10-20

**GATE: FAIL. Recommended decision: REJECT ARCHITECTURE under the current design and restrictions.** Neither mandatory writer closure nor supported administrative permission equivalence is demonstrated. This is not a claim that a controlled editor is universally impossible. No alternative architecture is opened. B03-LAYOUT and B03-FORM remain BLOCKED; BLOCKER 2 / HIGH 0 / MEDIUM 0. SPEC PASS / PLAN FAIL / TASKS PASS / ANALYZE FAIL remain unchanged; no implementation or Feature 017 authorization.

## Evidence scope and completeness

Read-only inspection of application source, installed Strapi 5.41.1 source, Constitution 1.0.0 and current admin-writers contract. No server boot, code import/execution, implementation QA, DB, SQLite, storage or upload access. Source establishes mechanisms, not deployed roles or observed runtime interleavings. Writer inventory completeness: **NOT DEMONSTRATED** beyond the enumerated source paths. Permission mechanism inventory is reconstructed below; effective role assignments and complete equivalent enforcement are **NOT DEMONSTRATED**. Neither uncertainty is converted into PASS.

Evidence paths below are relative to backend `../../../guiapineda-strapi`, except SDD paths relative to frontend. Installed code is evidence of behavior, not automatically an officially supported extension contract.

- E1: `src/api/internal-submission/routes/internal-submission.js:5`, `src/api/internal-submission/controllers/internal-submission.js`, `src/services/internal-submission-auth.js`, `src/services/internal-submission-request.js:608,970`: internal authenticated creation, including Commerce capability and quarantine failure cleanup.
- E2: `src/api/internal-moderation/routes/internal-moderation.js:5–94`, `src/services/admin-moderation-auth.js:43–150`, `src/services/submission-moderation-lifecycle.js:218–239,551–620,718–879,923`: Admin session plus Super Admin authorization; document updates and section-specific publication/Media compensation.
- E3: `src/index.js:15–17`, `src/services/commerce-submission-write-guard.js:124–175`: current Document Service guard is Commerce-specific; trusted capability, protected fields, blocked direct actions. It is not all-six CAS.
- E4: `node_modules/@strapi/content-manager/dist/server/routes/admin.js:261–577`: collection create, clone, auto-clone, update, delete, publish/unpublish/discard and bulk routes; route authentication and action policies. `controllers/collection-types.js:183–237`: current-entity check, permission-sanitized update, creator fields, then document-manager update.
- E5: `node_modules/@strapi/content-manager/dist/server/services/permission-checker.js:5–130`: action names, aliases, entity subjects, fields, input/output/query sanitization and condition-aware permission queries. `controllers/relations.js:144–240,341–423`: owner/field checks, target main-field protection, permission-filtered relation queries.
- E6: `node_modules/@strapi/core/dist/services/document-service/entries.js:92–109`, `components.js:87,239–270`, `repository.js:531–541`: component repository writes, generic parent update and outer document transactions; private publish operations unavailable when D&P is false.
- E7: `node_modules/@strapi/database/dist/entity-manager/index.js:278–350`: generic update selects by caller predicate, scalar update uses id, relation-failure compensation restores selected entity directly with query builder; updateMany retains its where predicate. `@strapi/database/dist/index.js:56–90` and `query/query-builder.js:464–470`: ambient transaction qualification, retained from prior inspection.
- E8: `node_modules/@strapi/upload/dist/server/routes/admin.js:44–124,218–266`: separate upload/file/bulk routes and permissions. `src/services/private-moderation-image.js`, `private-submission-image-cleanup.js:27–100`, `millora-publication.js`: private reads, storage cleanup and public Millora publication are distinct from private-parent mutation.
- E9: `specs/controlled-private-submission-persistence/contracts/admin-writers.md`: expected revision, six-type controlled command, missing428/invalid400/stale409, actual conditional UPDATE, original baseline, native permission checker and B03 unresolved native integration. This is planned, not installed enforcement.

## Writer matrix

All six private UIDs are `api::solicitud-{agenda,comunicat,veu,millora,foto-mes,comercio}.solicitud-{same-name}`. Matrix abbreviations: DS = Document Service; QE = Query Engine; PII risk refers to potential capability, not an observed incident. “No CAS” means no approved original-revision protocol demonstrated on the existing path.

| Existing/proposed path; entry and actor | Operation / authorization | Persistence and CAS | Terminal PII capability | Supported control and residual risk |
|---|---|---|---|---|
| Existing internal POST `/internal/submissions/:section`; trusted server (E1) | Create after internal authentication, parser and verification-origin contract; Commerce scoped capability | DS create, components/relations as applicable; no update baseline for new entity | Establishes fresh PII; must not become a reopen/clone shortcut | Keep strict creation context and server revision initialization; planned assignment is not installed. Do not demand an update token for first creation |
| Existing CM collection POST; Admin (E4) | Manual create, action and field sanitization; Commerce direct create denied E3 | DS create; no approved revision assignment shown | Creates PII; identity/recreation semantics require policy | Route policy/DS entry guard can reject; preserving formerly granted manual create for other five is unresolved |
| Existing CM PUT collection document; Admin (E4/E5) | Main edit, action/entity/field authorization | document-manager→DS→components→QE update; no CAS | Can carry stale PII; Commerce protects selected fields but is not six-type CAS | Own commands could replace it; existing native route must fail closed; complete equivalent replacement unproved |
| Existing native relation-modal secondary parent PUT; Admin | Target create/edit then parent association; same parent controller permissions | Separate target write and same private parent update path; authentic parent revision absent per retained evidence | Parent path permits generic update; target success not rolled back with parent failure | Deny parent native PUT; hiding modal insufficient; replacement must preserve target permissions and required relation UX |
| Existing CM clone/auto-clone; Admin (E4) | Action policies/controller checks; Commerce blocked | DS clone and copied components/relations; no original-revision command | Copies source PII into new identity | Guard can reject entry; disabling an otherwise granted action is not demonstrated functional parity |
| Existing CM single/bulk delete; Admin (E4) | Delete permission and per-controller checks; Commerce blocked | DS delete with relation/component cleanup; no approved CAS | Removes rather than restores scalar PII, but affects ownership and revision-controlled actions | Endpoint guard only covers HTTP; direct deletion and cascades need explicit policy and replacement semantics |
| Existing generic publish/unpublish/discard and bulk routes (E4/E6) | Publish/update permissions; private parents D&P false, Commerce guard also blocks | Private DS publication methods unavailable; targets remain D&P-enabled | No claim of valid private publish; target operations can affect relations | Do not infer a private write solely from generic route presence. Target publication/deletion side effects still need coverage |
| Existing moderation start-review/approve/reject; Super Admin (E2) | Active Admin/session plus explicit Super Admin and transition checks | updateSubmission→DS update; process lock is not original N CAS | Resolves state/email, Media linkage; stale state and restoration require control | Existing service can be rerouted; planned atomic original-N command not implemented/proven; retain moderation permissions |
| Existing Millorem/non-Commerce approval effects and compensation (E2/E8) | Internal service after moderation authorization | Upload/public target calls, private update, cleanup on failure; separate effects | Private update carries privacy fields; effect rollback is not proof of parent protection | Planned Millorem ledger/durable publication remains proposal. Do not conflate public/Media cleanup with QE snapshot compensation |
| Existing DS API used by services/framework (E3/E6) | No automatic Admin RBAC; caller responsible | Middleware→repository transaction; generic update/clone/delete | Direct ability to modify private data | Official DS middleware covers entry only. Direct QE and compensation do not re-enter; no universal closure |
| Existing QE API and internal component helpers (E6/E7); server code | No automatic route/session authorization | create/update/updateMany/delete and child component repositories | Parent scalars can change; child ownership/relations can change without parent revision increment | Lifecycle can reject dispatched operations, but lower query-builder statements bypass it. No complete permitted-caller proof |
| Existing internal relation/join/FK operations and inverse target effects (E6/E7) | Inherit calling context, not independent parent RBAC | Relation helpers/query builder; parent revision not inherently incremented | Not intrinsically a scalar PII restore, but can change protected aggregate ownership | Supported helper use inside owned transaction is bounded; target-side and cascade coverage not established |
| Existing generic-update failure compensation (E7); framework | No second policy/DS/lifecycle authorization | direct queryBuilder update(snapshot) by id; no revision predicate | Snapshot may contain removed PII | No supported callback shown to intercept this statement. Avoiding entry requires complete writer closure, still unproved |
| Existing Media management and private preview/cleanup (E8); Admin/internal job | Upload-specific grants; preview moderation auth; cleanup internal | Media/relations/storage changes; cleanup source only reads private rows | Not evidence of direct scalar restoration; shared Media references can change | Hidden fields are not backend denial. Media deletion/link effects and equivalent access not comprehensively proven; no storage executed |
| Potential import/transfer/maintenance/direct connection writers; privileged runtime | Installation/configuration/caller-specific, not established by source inventory | May bypass DS/QE hooks | Potential arbitrary private data mutation | No claim they are active; no exhaustive supported exclusion established. Application grep is not runtime/package writer closure |
| Proposed controlled module PATCH + moderation commands; authenticated authorized Admin | Existing-equivalent action/field/entity rights required; permission adapter unresolved | Scoped capability + transaction + actual UPDATE(id,N), components/relations, N+1 once | Could enforce atomic current-state terminal invariant | Not registered or implemented; 428/409 and policy are contracts. Cannot use this row as evidence of existing protection |

Public content/report controllers found during source scan are distinct UIDs and not evidence of six-type parent writes. No private core Content API router was found in the inspected application routes; CM's generic private-type routes are still relevant. Single-type routes are not private collection entrypoints. Neither absence in application grep nor a planned deny-list proves exhaustive writer closure.

## Closure decision A: FAIL

HTTP policies can reject native private writes, and DS middleware can route explicit service calls. Neither intercepts every lower-level write. Generic QE compensation does not re-enter them. A guard forbidding generic parent update before entry avoids that particular compensation, but only if all allowed operations use the replacement; the candidate has not demonstrated this across six types, components, relations, bulk operations and required moderation/effects.

Keep the transaction qualification: normal DS errors can roll back the outer transaction, including compensation. No committed PII resurrection has been observed or tested. Direct QE without that ambient transaction lacks the same guarantee. Further, a successful stale payload can restore PII without any error compensation, and a privacy-only null rule does not establish lost-update CAS. Both properties need separate proof.

The actual-update predicate in updateMany is a useful primitive, not a universal boundary. Missing revision428, stale409, exactly-one increment, transaction rollback and per-tab authentic baseline remain requirements, not demonstrated guarantees. The existing prerequisite policy is neutral and Feature017 remains excluded. Native denial without equivalent indispensable operations fails the acceptance contract. **Writer closure, compensation coverage, strict CAS across all writers and terminal monotonicity: NOT DEMONSTRATED.**

## Permission reconstruction and equivalence decision B: FAIL

| Dimension | Existing source-enforced mechanism | Candidate requirement / demonstrated equivalence |
|---|---|---|
| Authentication | CM Admin authentication; moderation independently validates active session/user; internal creation uses server authentication | Official authenticated plugin routes are a building block only. Authentication is not action authorization |
| Action | CM explorer read/create/update/delete/publish; clone/bulk controller semantics and action aliases (E4/E5); Commerce narrower prohibition | New module must retain those restrictions. New plugin grants or Super Admin-only editing are not equivalent. **Not demonstrated** |
| Field | permissionsManager sanitizes input/output/query against action and subject; creator fields set server-side (E4/E5) | Must reject/filter unauthorized fields consistently, including nested components, query/search and response data. **Not demonstrated** |
| Entity conditions | Current document checked before edit; permission queries constrain reads; rules/aliases affect condition evaluation | Must check same permission semantics against current entity inside command, not UID-only can(action). **Not demonstrated** |
| Relations | Owner field/read checks, entity condition, target main-field sanitization and permission-filtered target queries (E5) | Choosing a permitted ID is not enough; no label leaks, unauthorized links, target D&P or component ownership bypass. **Not demonstrated** |
| Media | Upload-specific actions separate from CM; hidden private fields; private preview/moderation boundary (E2/E8) | Preserve preview restrictions and allowed attachment semantics; server services do not gain blanket Admin permission. **Not demonstrated** |
| Moderation | Active session plus Super Admin and section transition restrictions (E2) | Restriction is known and must remain conjunctive with command safety. Existing mechanism demonstrated; integration equivalence not demonstrated |
| Special actions / role assignments | Create/delete/clone/bulk and aliases differ by type/action; actual grants and conditions persisted outside source | No DB queried; effective assignment inventory unavailable. Cannot assume grants absent or expand/revoke them silently |

`permission-checker` invokes `admin::permission.createPermissionsManager`, entity subjects, query/input/output sanitizers and `actionProvider.unstable_aliases`. An available internal service is not evidence of a stable supported full-equivalence extension. A generic RBAC API or copying/importing private controller code does not discharge this proof. An adapter that checks only role, action+UID, or raw field names risks privilege escalation and data leakage; a deny-all adapter avoids escalation but breaks required functionality. No privilege change was made in this study.

Equivalences actually established: identities of current authentication/action/field/entity/relations enforcement mechanisms, Commerce's stricter guard and moderation's Super Admin restriction. **No complete supported mapping to the proposed module is established.** Permission inventory complete:NO for effective permissions; action/field/entity-condition parity:NOT DEMONSTRATED. Escalation risk remains unresolved in the candidate, not an observed introduced vulnerability.

## Binary result and SDD governance

Reject this architecture for implementation under current design/restrictions. B03-LAYOUT remains blocked by incomplete backend writer closure and permission equivalence; B03-FORM remains blocked by unratified/unproven owned-editor baseline/draft/action integration. The new findings are evidence under these two existing blockers, not artificial additional severity counts. No new architecture or exploration chain is proposed.

SPEC PASS and TASKS PASS retain their prior document status, not candidate approval; PLAN/ANALYZE FAIL. Current contracts still require native permission/form behavior and separate Commerce relation coordination. The candidate cannot silently replace these with its own permission model or main-save UX. No SPEC/PLAN/TASKS/contracts/allowlist change is made. Ratification and implementation remain disallowed by this gate; recommended decision is REJECT ARCHITECTURE.

Only analysis-final.md and qa-report.md changed. No unexpected new file; pre-existing untracked SDD directories retained. Backend unchanged. No code, implementation QA, CONVERGE, SQLite/DB/storage, migration/backfill, upload, dependency, node_modules modification, monkey patch, CAS relaxation, commit/push/deployment or Feature017 work.

---
## Historical reports retained; later gate above is authoritative

# Controlled Admin architecture decision proposal — 2026-10-20

Current result: concrete candidate, NOT RATIFIED, NOT IMPLEMENTATION-READY. B03-LAYOUT BLOCKED / B03-FORM BLOCKED; BLOCKER2/HIGH0/MEDIUM0. SPEC PASS/PLAN FAIL/TASKS PASS/ANALYZE FAIL unchanged. Only this report and qa-report.md may change. Earlier failed proposals remain historical, not authorization.

## Minimal candidate architecture

One local Admin module serving exactly the six private submission UIDs, with a fixed field manifest per type and ordinary controlled React inputs. Reuse native public/target editors unchanged; do not recreate the Content Manager. Register module navigation with official addMenuLink; own page, draft state, request transport and errors. A local plugin server module would own explicit authenticated read/write commands, policies and validation, invoking the already-designed controlled persistence and existing section moderation services. No native Form, layout projection, internal component renderer or request patch.

This packaging is concrete but its permission adapter remains unproven. Plugin route/policy registration is an extension facility, not an automatic grant of equivalent Content Manager authorization. No application files, plugin config, actions or roles are created here.

## Functional minimum / parity matrix
I = indispensable for existing business flow; P = dispensable only as an explicit proposed product decision with rationale; H = requires human decision/evidence, cannot silently remove. Public verified submission creation is I for all six and remains outside this Admin module.

| Type | Admin create | Read/edit/validation | Relations/components | Images | Moderation/special | Delete | Duplicate | Permissions |
|---|---|---|---|---|---|---|---|---|
| Agenda | H: preserve if granted, or explicitly remove manual creation | I: organizer/date/time/place/text/contact, existing schema/parser distinctions | None | I: existing private preview and moderation; hidden Media not a new editable field | I: existing review/approve/reject | H | H if granted | I: model/field/conditional editing grants; existing moderation restriction |
| Comunicats | H | I: sender enum/author/text/contact | None | I: same private image boundary | I: section-specific review/resolve | H | H if granted | I |
| Veus | H | I: authorship/public author/contact/text | None | I | I: existing transitions | H | H if granted | I |
| Millorem | H | I: category/zone enums/public author/text | None; category is not Commerce relation | I: private source and prior planned durable publication adapter | I: approve→one public Millora; failed publication status/retry, no duplicate target | H, with operation/target protection | H, new source identity semantics cannot be assumed | I |
| Foto | H | I: author, optional title/place, consent fields and length limits | None | I: private image workflow | I: existing transitions | H | H if granted | I |
| Comercio | P: maintain existing prohibition of direct Admin create | I: business/contact fields; protected write policy retained | I: category required/subcategory optional manyToOne; three repeatable scalar components | I: existing private preview; logo/main/gallery hidden | I: editorial resolution only, no automatic public Commerce or promotion | P: maintain existing prohibition | P: maintain existing prohibition | I: current field protections and editing grants; moderation Super Admin |

For all: P proposed removal of inline create-and-connect modal convenience, replaced by native target editor then explicit selection; P no private-parent publish/unpublish/discard UI because all six parent schemas disable D&P. Target D&P remains I. H for bulk private deletion or other existing granted native actions, and H for reopening beyond existing endpoints; no new reopen privilege assumed. List/search/read navigation I. Native layout customization is P for this finite module, subject to explicit acceptance; accessibility and CA/ES/EN messages I.

Existing grant availability is unknown because roles/layouts/data were not queried. H does not assert each role currently has the action. Commerce guard explicitly prohibits direct create/delete/clone/publish/unpublish/discard; other five have no analogous project guard in register. The default-denied proposed endpoint set must not be represented as parity until H decisions are made.

## Concrete command/API contract (proposed own namespace)

Admin plugin namespace `private-submission-admin`, no public Content API routes. Proposed relative routes: GET /submissions/:section (paginated permission-filtered list), GET /submissions/:section/:documentId (same-read snapshot+revision), GET /relations/:section/:field (Commerce category/subcategory only, permission/status filtered), PATCH /submissions/:section/:documentId (editable delta including relations/components, expected-revision header), POST /submissions/:section/:documentId/moderation/:action (start-review/approve/reject and separately authorized publication retry only). Reuse existing authenticated private preview handler without broadening visibility. No create/delete/duplicate endpoints in the proposed minimum until H is resolved; existing public CREATE route stays untouched. Endpoint names here are proposal, not registered contracts.

Whitelist section→UID server-side. Never accept arbitrary UID or caller-chosen revision/document identity. PATCH validates requested field permissions before dropping fields, exact schema types/required/cardinality, component membership/order and allowed relation target; reject forbidden fields, don't silently report saved. Native target editors own create/edit/publish separately; no transaction claimed across target creation and parent association. Retain target D&P/document-ID resolution and approved component helpers rather than hand-written relation SQL. Hidden PII/quarantine/audit/state fields remain under existing service policy; private does not automatically mean editable or readable.

CAS command: validate authenticated permission context and original N; BEGIN; read current; revalidate entity-condition authorization/current policy; UPDATE where id AND revision=N with revision=N+1 exactly once; supported components/relations; invariant check; commit; return permission-filtered accepted snapshot and authoritative revision. Any error rolls back; zero match409; missing token428; malformed400; forbidden403. No latest-revision substitution. Supported conditional primitive is command implementation, not a universal database interceptor.

Privacy monotonicity is a separate invariant: future terminal-state PII policy must reject restoration atomically on every approved command, including reopen/clone decisions. The prerequisite supplies a neutral policy seam and removes the generic parent update compensation from controlled commands; it does not implement Feature017's terminal cleanup policy. No present terminal-privacy PASS claimed. Millorem retains previously planned approval+ledger/draft transaction followed by recoverable publication; effect failure cannot undo source through snapshot restoration. No new publication design introduced here.

## Effective authorization: exact requirement and unresolved proof

Required decision function: authenticated active Admin session AND existing model/action permission for current entity AND per-field permission AND existing private section policy. Moderation additionally retains existing Super Admin-only requirement. Reads must filter both rows and fields; search/labels cannot leak unauthorized target fields. UI capability flags are advisory, never server authorization. Unknown action/field/condition defaults deny; no blanket role trust.

Source evidence newly inspected: `node_modules/@strapi/content-manager/dist/server/services/permission-checker.js:12–100` uses admin::permission.createPermissionsManager, entity subjects, userAbility.can/cannot, query/input/output sanitizers, and actionProvider.unstable_aliases. Simple role equality or can(action,UID) omits field/condition/alias semantics. Internal service availability is not a stable public extension contract. Reusing private controller functions by import or copying this engine is not accepted. New plugin action grants would be an explicit permission-model change requiring human role mapping/review, not assumed equivalent. Existing moderation auth intentionally checks Super Admin and therefore cannot stand in for this editor permission adapter.

No existing role assignments were accessed. Exact compatibility remains unproven for non-super editing, field/conditional restrictions, action aliases, read filtering and formerly permitted create/delete/clone. This is a release-blocking acceptance obligation within B03-LAYOUT, not an extra invented permission bypass. No grant migration is authorized.

## Native writer closure independent of layout

Own-page navigation improves UX only. Backend must reject incoming native private mutating routes and route every authorized server writer to controlled commands. An ordinary exact-UID request policy/middleware may deny native private POST/PUT/PATCH/DELETE/clone/bulk routes before controller mutation while leaving public target routes untouched; enumerate actual route contracts and handle mixed bulk requests fail-closed. Module commands do not obtain privilege from a client `controlled` header: authenticated policy plus server-scoped capability selects allowed service execution. Public verified CREATE retains its existing trusted path. Query lifecycle backstops may reject forbidden generic parent updates; they do not intercept the internal compensation once entered, so the unsafe parent query.update must never be used by allowed writers.

Required audit: document update/create/delete/clone, updateMany/createMany/deleteMany, component mutations affecting a private owner, inverse relation actions, import/transfer/background jobs and lower-level direct query usage. Disable unsupported native operations only after H decisions; authorized operations need explicit replacement semantics. Existing source scan is not proof that every framework/plugin maintenance path is covered. No supported universal SQL interceptor has been discovered or assumed. This finite writer-closure proof and permission-equivalent command boundary remain necessary before B03-LAYOUT can pass.

## Owned state and B03-FORM

Page owns {identity,generation,acceptedSnapshot,N,draft,dirty,inFlight,conflict}. Initial explicit read sets snapshot/N/draft once. Search/status/poll responses never replace draft or N. All six forms use ordinary controlled input values, no native cache-derived initialValues. Main save includes Commerce relation changes with scalar/components, so invalid scalar fields block that single save instead of requiring competing relation saves. This changes the previous explicit separate-relation-save UX and needs ratification.

Before mutation, synchronously claim the session, capture draft/N and disable every owned input/action until completion. Moderation requires clean draft or explicit save/discard. Known success atomically acknowledges snapshot/N and releases the claim; errors preserve draft/N;409 and ambiguous network outcomes freeze writes until explicit review/reload. Late responses cannot cross generations. Independent tabs retain independent revisions. Internal navigation is guarded while dirty/pending; browser unload confirmation is best-effort and does not guarantee recovery from process crash. Do not persist PII drafts in shared/local storage. Unsaved CREATE drafts have no update token; only confirmed create can initialize identity/N; no blind duplicate create retry after response loss.

Owning the form removes the specific native reinitialization path conceptually. B03-FORM remains BLOCKED for implementation approval because the six-field/component editor, navigation coverage, pending-input lock, snapshot acknowledgment and creation/action compatibility are unimplemented and not yet part of ratified SDD. This is an architectural argument, not test evidence or closure by naming a custom page.

## File inventory for later ratification only
Backend root `../../../guiapineda-strapi`.
Existing affected: config/plugins.js (local plugin registration); src/index.js (writer guards); src/services/internal-submission-request.js; src/services/commerce-submission-write-guard.js; src/services/submission-moderation-lifecycle.js; src/admin/components/PrivateModerationImagePanel.jsx; src/api/internal-moderation/controllers/internal-moderation-lifecycle.js; src/api/internal-moderation/routes/internal-moderation.js. Existing Millorem files retain prior prerequisite scope. Exact policy depends on the unresolved permission decision; no edits allowed now.
Proposed new files, all unapproved:
- src/plugins/private-submission-admin/strapi-admin.js
- src/plugins/private-submission-admin/strapi-server.js
- src/plugins/private-submission-admin/admin/src/index.js
- src/plugins/private-submission-admin/admin/src/pages/SubmissionList.jsx
- src/plugins/private-submission-admin/admin/src/pages/SubmissionEditor.jsx
- src/plugins/private-submission-admin/admin/src/components/SubmissionFields.jsx
- src/plugins/private-submission-admin/admin/src/components/CommerceComponents.jsx
- src/plugins/private-submission-admin/admin/src/components/CommerceRelations.jsx
- src/plugins/private-submission-admin/admin/src/session.js
- src/plugins/private-submission-admin/admin/src/definitions.js
- src/plugins/private-submission-admin/server/index.js
- src/plugins/private-submission-admin/server/routes/admin.js
- src/plugins/private-submission-admin/server/controllers/submissions.js
- src/plugins/private-submission-admin/server/policies/submission-access.js
- src/plugins/private-submission-admin/server/services/commands.js
- src/plugins/private-submission-admin/server/services/authorization.js
- src/middlewares/private-submission-native-write-guard.js
Prior planned controlled persistence/policy/document-guard services remain the persistence layer; no duplicate engine. Packaging/registration must be validated against installed plugin loader before ratification; listing paths is not evidence that scaffolding is already runnable. No package/dependency installation proposed. Current allowlist is NOT expanded and failed layout middleware is NOT revived.

## Cost, acceptance and decisions

Maintenance HIGH: finite six-type forms, Commerce repeatables, permission parity, writer inventory and schema drift. Smaller than a general CMS: no public content forms, layout builder, generic Media manager or target publishing engine. Main risks are RBAC equivalence, hidden native writers, formerly available actions, draft/navigation loss, correct server transforms and Millorem aftercommit feedback.

Acceptance before future readiness: per-role/action/field/condition authorization matrix with denial/leak checks; same-original-snapshot CAS two tabs; exact-one increments and rollback; zero native-route side effects; direct query and secondary writer backstops; six-type required/enum/length/consent handling; component IDs/order/delete ownership; category/subcategory/D&P; moderation permissions/state transitions; legacy revision rejection; Millorem partial effects/retry; dirty navigation, pending typing, conflict/response loss; no extra PII persistence; CA/ES/EN; other content types unchanged. Isolated fixtures only after implementation authorization; none run now.

Discarded: partial native panels/hooks retain uncovered form/layout behavior; backend-only cannot infer original N or own browser draft; Commerce-only editor leaves five native forms; full generic Content Manager clone is unnecessary. No new research line opened.

Human decisions: approve or reject a module owning all six private editing flows; ratify relation changes in main save and native target editor navigation; decide H create/delete/duplicate/bulk/reopen operations explicitly; require supported equivalent permission boundary or explicitly ratify a changed permission model without expanding privileges; ratify exact files and replacement SDD only after those decisions. Required SDD changes would replace native preservation assumptions, define action/field policy and writer closure, regenerate bounded tasks and rerun ANALYZE. None made here. No IMPLEMENT/QA/CONVERGE/017 authorization.

---
## Previous evidence retained below

# Backend write boundary feasibility — 2026-10-20 — CURRENT FINAL CHECK

Feasibility FAIL. This backend-only avenue is expressly discarded under the current joint requirements: terminal privacy monotonicity, original-editor CAS, supported mandatory interception and functional native Admin. No alternative investigation initiated. B03-LAYOUT/B03-FORM remain BLOCKED; BLOCKER2/HIGH0/MEDIUM0; SPEC PASS/PLAN FAIL/TASKS PASS/ANALYZE FAIL unchanged. Safe to implement:NO.

## Reconstructed write paths (installed Strapi 5.41.1, source only)

Backend paths below relative to ../../../guiapineda-strapi.

1. Native main edit: Content Manager route authentication/permission checks → collection-types controller updateDocument → permission-sanitized input → document-manager.update → documents(uid).update middleware → document repository transaction → entries.updateEntry → component updates → db.query(uid).update → scalar UPDATE and relation operations. Source: node_modules/@strapi/content-manager/dist/server/controllers/collection-types.js:183–237; @strapi/core/dist/services/document-service/entries.js:92–109; repository.js:530–541.
2. Native secondary parent write: relation-modal target create/publish → independent parent updateDocumentMutation PUT → same controller/document pipeline. Header omission and original parent baseline limitations remain as documented. Native target write is a different command; parent failure does not undo target creation.
3. Moderation: src/services/submission-moderation-lifecycle.js:218–239 updateSubmission → documents(uid).update; Commerce adds its existing private capability. Public verified create enters documents.create in internal-submission-request.js, not a revision UPDATE. Super Admin moderation authorization remains distinct from editing permissions.
4. Components: entries.updateEntry calls updateComponents before parent query.update. Component helper writes use their own query repositories; they are not a second invocation of parent Document Service middleware. Relation helpers can issue join/FK query-builder writes without parent update lifecycles. These are not evidence of PII scalar restoration by themselves, but invalidate treating a parent route hook as a universal write interceptor.
5. Parent compensation: @strapi/database/dist/entity-manager/index.js:278–329 invokes beforeUpdate once, selects full entity using the supplied where (290), updates parent scalars using id only (299–301), invokes relation operations (303–308). Catch rolls back its relation transaction, then directly queryBuilder.where({id}).update(entity).execute() (309–314). That restoration does NOT invoke Document Service or another beforeUpdate/afterUpdate lifecycle. afterUpdate is only on successful completion (325).
6. Direct query callers can invoke db.query(uid).update/updateMany without Document Service middleware or route policies. Query-builder/connection operations sit below model lifecycle dispatch. No supported global pre-write callback for every resulting statement was found. This is a scope limit, not a claim of observed out-of-band production writes.

## Extension coverage
| Mechanism | Actually intercepts | Does not intercept / limitation |
|---|---|---|
| Document Service middleware | Entry to document methods, including native main and secondary parent documents.update | Direct Query Engine and internal compensation do not re-enter it; wrapping next does not change internal write algorithm |
| Route policies / Koa middleware | Configured incoming HTTP requests, auth/header validation, controller responses | Background/direct service calls and internal statements; cannot reconstruct original browser baseline absent from request |
| Custom controller/service | Calls explicitly routed through that command | Not a global persistence boundary; replacing CM behavior must retain permissions and all entrypoints |
| Database lifecycle subscriber | beforeUpdate/updateMany and other lifecycle-dispatched repository operations | Query-builder compensation bypasses it; changing incoming data cannot sanitize the separately selected full snapshot |
| Transaction callback | Atomic commit/rollback for participating statements, including nested ambient operations | Not an original-revision protocol or a mandatory interception hook; does not itself stop ordinary stale full-payload success |
| Conditional updateMany + supported relation/component helpers | Can implement an owned controlled persistence command retaining actual revision predicate | Replaces unsafe parent path rather than intercepting its compensation; requires every writer to be routed and caller's authentic N |

No combination of merely adding before/after hooks establishes the requested mandatory boundary. Rejecting parent query.update in a before hook prevents reaching that path, but also rejects the native path unless replaced. Post-write PII repair/compensation is disallowed and does not prove prevention.

## Transaction qualification — do not overclaim a live resurrection

Repository methods are wrapped in transaction callbacks (@strapi/core/.../repository.js:531–541). @strapi/database/dist/index.js:56–90 reuses an existing ambient transaction; nested commit/rollback are no-ops. query/query-builder.js:464–470 attaches the ambient transaction when executing. Therefore, in the normal propagated Document Service failure path, the compensation may run inside the same outer transaction, after which the rethrown exception rolls the whole operation back. Source inspection alone is NOT proof of committed PII restoration in that path or of a specific database interleaving. No DB access or experiment was performed.

For a direct query.update without ambient outer transaction, its parent scalar write precedes the explicitly created relation transaction, and the catch executes a parent snapshot restoration afterward. That path lacks the same outer-rollback guarantee. A universal safeguard would need to prevent or replace it, not assume all callers inherit a transaction. No vendor isolation guarantees, locks, triggers, raw SQL or connection patches are introduced.

Even perfect transaction atomicity would not ensure terminal monotonicity: a stale successful payload can carry previously removed PII unless an atomic current-state policy rejects or removes it. Conversely, a terminal-null policy could protect selected PII while permitting stale non-PII overwrites. Neither property implies original-editor CAS. Generic update also drops the caller predicate from its scalar UPDATE after selecting by where; adding revision to its SELECT is not the approved actual-UPDATE CAS.

## Why the joint requirements fail

An owned command could atomically enforce a future terminal PII invariant and avoid the snapshot compensation entirely, using the previously planned actual revision updateMany and helpers. That is command replacement, not a newly discovered mandatory native-write interception point; terminal policy belongs to separately scoped Feature017 and is not implemented here.

The native browser still must supply its original revision for CAS. A missing header cannot be replaced by a server read of current revision, current state, role trust or a process lock. Doing so loses stale-edit detection. Strict428/409 retains backend safety but leaves native modal/main flows failing under the documented integration gaps. Allowing missing revision preserves some UI behavior by violating CAS. Native Form reinitialization is browser state behavior that no persistence boundary can prevent or restore safely. Thus no backend-only solution closes either B03 blocker under all contracts.

Permissions: leaving native controllers in place retains their current permission checks, but not the missing revision. Replacing controllers/services requires proof of equivalent field/conditional authorization. Relation/component/Media preservation depends on helper semantics and existing section moderation, not a route policy alone. Blocking unsupported create/delete/clone/bulk/query paths without a replacement can change necessary Admin behavior. No complete writer inventory can be converted into a universal supported hook merely by naming an outer service.

## Decision / governance / evidence limits

No mandatory supported boundary satisfying all six decision criteria identified. Compensation intercepted:NO. Terminal privacy monotonicity:NOT PROVEN by this route. CAS/native Admin joint compatibility:FAIL. Secondary HTTP parent writers reach Document Service, but lower-level compensation bypasses it and original N remains unavailable. Existing permission behavior can remain only while retaining its controllers; that does not solve CAS or frontend state.

Discard this backend-boundary-only avenue expressly. Any future decision must change the architectural contracts (ownership of editing/writes or explicit feature scope), followed by ratified SDD and new analysis; do not relabel a privacy-only mitigation as B03 resolution. This execution proposes no new alternative or implementation. Constitution unchanged; SPEC/PLAN/TASKS/contracts/allowlist untouched. Current two blockers preserved, no duplicate new severity entries.

Only source text and Git status were inspected. No imports/bootstrap/real transactions/SQLite read-stat-hash-copy/data access/storage/uploads/dependencies/migration/backfill/commit/push/deploy/017 work. Only analysis-final.md and qa-report.md updated. Historical analyses follow for traceability.

---
## Earlier studies (historical)

# Controlled editor feasibility — 2026-10-20 — CURRENT STUDY

Feasibility: FAIL against the full demonstrated-supported-compatibility criterion, not a claim that a custom editor is technically impossible. A controlled page for all six private types is the least-impact candidate for further design; it is NOT approved or implementation-ready. B03-LAYOUT and B03-FORM remain BLOCKED (2 BLOCKER,0 HIGH,0 MEDIUM). Prior authoritative SPEC PASS/PLAN FAIL/TASKS PASS/ANALYZE FAIL unchanged. This study only modifies analysis-final.md and qa-report.md. No other artifact or allowlist is amended.

## Functional inventory and correction of earlier assumptions

All six schemas were read directly as JSON text. No models loaded or database opened. Every explicit image Media field is configurable:false/visible:false; Commerce also marks Media private. Therefore do NOT budget or expose a general Media picker as existing schema-visible functionality. Existing private image preview and moderation/promotion must be retained. Prior generic discussion of native Media selectors was framework behavior, not proof that these six screens expose them. Actual saved layouts and role assignments are unknown and were not queried.

Below, visible scalar candidates mean schema-visible fields, NOT an assertion that a particular role may edit them. Field/conditional authorization remains server-owned. `required` boolean means presence, not necessarily true; stricter public submission parser/consent requirements remain separate. Hidden state, image references and audit fields are not ordinary inputs. Generated system IDs/timestamps and future revision are server-owned.

### agenda

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | permission-filtered candidate |
| titol | string; {"required": true} | permission-filtered candidate |
| resum | text; {"required": true} | permission-filtered candidate |
| descripcio | text; {"required": true} | permission-filtered candidate |
| imatge | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow |
| imatge_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| organitzador | string; {"required": true} | permission-filtered candidate |
| data_inici | date; {"required": true} | permission-filtered candidate |
| hora_inici | time; {} | permission-filtered candidate |
| data_final | date; {} | permission-filtered candidate |
| hora_final | time; {} | permission-filtered candidate |
| lloc | string; {"required": true} | permission-filtered candidate |
| adreca | string; {} | permission-filtered candidate |
| enllac_oficial | string; {} | permission-filtered candidate |
| nombre_contacto | string; {"required": true} | permission-filtered candidate |
| email_contacto | email; {"required": false} | permission-filtered candidate |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | permission-filtered candidate |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |

### comunicat

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | permission-filtered candidate |
| tipus_remitent | enumeration; {"enum": ["entitat_associacio", "club_grup", "escola_centre", "comerc_empresa", "particular", "altres"], "required": true} | permission-filtered candidate |
| autor | string; {"required": true} | permission-filtered candidate |
| titol | string; {"required": true} | permission-filtered candidate |
| resum | text; {"required": true} | permission-filtered candidate |
| contingut | text; {"required": true} | permission-filtered candidate |
| imatge | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow |
| imatge_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| nombre_contacto | string; {} | permission-filtered candidate |
| email_contacto | email; {"required": false} | permission-filtered candidate |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | permission-filtered candidate |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |

### veu

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | permission-filtered candidate |
| titol | string; {"required": true} | permission-filtered candidate |
| resum | text; {"required": true} | permission-filtered candidate |
| contingut | text; {"required": true} | permission-filtered candidate |
| imatge | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow |
| imatge_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| tipo_autoria | enumeration; {"enum": ["nom_complet", "nom", "pseudonim"], "required": true} | permission-filtered candidate |
| autor_public | string; {"required": true} | permission-filtered candidate |
| nombre_contacto | string; {"required": true} | permission-filtered candidate |
| email_contacto | email; {"required": false} | permission-filtered candidate |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | permission-filtered candidate |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |

### millora

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | permission-filtered candidate |
| categoria | enumeration; {"enum": ["incidencies", "civisme", "propostes"], "required": true} | permission-filtered candidate |
| zona | enumeration; {"enum": ["centre", "poblenou", "les_creus", "pinemar", "can_cornet", "can_pelai", "can_more", "feliu_de_manola", "verge_del_carme", "montessol_can_carreras", "altres"], "required": true} | permission-filtered candidate |
| autor_public | string; {"required": true} | permission-filtered candidate |
| titol | string; {"required": true} | permission-filtered candidate |
| resum | text; {"required": true} | permission-filtered candidate |
| contingut | text; {"required": true} | permission-filtered candidate |
| imatge | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow |
| imatge_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| email_contacto | email; {"required": false} | permission-filtered candidate |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | permission-filtered candidate |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |

### foto-mes

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | permission-filtered candidate |
| autor | string; {"required": true, "maxLength": 120} | permission-filtered candidate |
| email_contacto | email; {"required": false, "maxLength": 180} | permission-filtered candidate |
| titol | string; {"required": false, "maxLength": 140} | permission-filtered candidate |
| lloc | string; {"required": false, "maxLength": 140} | permission-filtered candidate |
| imatge | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow |
| imatge_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | permission-filtered candidate |
| aceptacion_autoria_publicacion | boolean; {"required": true, "default": false} | permission-filtered candidate |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |

### comercio

| Field | Type / constraints | UI boundary |
|---|---|---|
| idioma_solicitud | enumeration; {"enum": ["ca", "es", "en"], "required": true} | hidden/system workflow |
| nombre | string; {"required": true, "maxLength": 100} | permission-filtered candidate |
| descripcion_corta | string; {"required": true, "maxLength": 160} | permission-filtered candidate |
| descripcion_completa | text; {"required": true, "maxLength": 900} | permission-filtered candidate |
| direccion | string; {"required": true, "maxLength": 180} | permission-filtered candidate |
| telefono | string; {"maxLength": 30} | permission-filtered candidate |
| whatsapp | string; {"maxLength": 30} | permission-filtered candidate |
| email | email; {"maxLength": 180} | permission-filtered candidate |
| web | string; {"maxLength": 250} | permission-filtered candidate |
| categoria | relation; {"relation": "manyToOne", "target": "api::categoria-comercio.categoria-comercio", "required": true} | permission-filtered candidate |
| subcategoria | relation; {"relation": "manyToOne", "target": "api::subcategoria.subcategoria"} | permission-filtered candidate |
| atencion_presencial | boolean; {"default": false} | permission-filtered candidate |
| atencion_domicilio | boolean; {"default": false} | permission-filtered candidate |
| atencion_online | boolean; {"default": false} | permission-filtered candidate |
| recogida_local | boolean; {"default": false} | permission-filtered candidate |
| reparto | boolean; {"default": false} | permission-filtered candidate |
| horario_semanal | component; {"repeatable": true, "component": "guiapineda.horario-dia"} | permission-filtered candidate |
| servicios | component; {"repeatable": true, "component": "guiapineda.servicio"} | permission-filtered candidate |
| redes_sociales | component; {"repeatable": true, "component": "guiapineda.red-social"} | permission-filtered candidate |
| informacion_adicional | text; {"maxLength": 800} | permission-filtered candidate |
| logo | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow / private |
| imagen_principal | media; {"multiple": false, "allowedTypes": ["images"]} | hidden/system workflow / private |
| galeria | media; {"multiple": true, "allowedTypes": ["images"]} | hidden/system workflow / private |
| nombre_contacto | string; {"required": true, "maxLength": 120} | permission-filtered candidate / private |
| email_contacto | email; {"maxLength": 180} | permission-filtered candidate / private |
| telefono_contacto | string; {"maxLength": 30} | permission-filtered candidate / private |
| aceptacion_privacidad | boolean; {"required": true, "default": false} | hidden/system workflow / private |
| estado_solicitud | enumeration; {"enum": ["pendent", "en_revisio", "aprovat", "rebutjat"], "required": true, "default": "pendent"} | hidden/system workflow |
| observaciones_internas | text; {} | permission-filtered candidate / private |
| imagen_principal_quarantena_id | string; {"required": true, "minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| logo_quarantena_id | string; {"minLength": 32, "maxLength": 32} | hidden/system workflow / private |
| galeria_quarantena_ids | json; {"required": true} | hidden/system workflow / private |
| moderacion_iniciada_en | datetime; {} | hidden/system workflow / private |
| moderacion_iniciada_por_admin_id | integer; {} | hidden/system workflow / private |
| moderacion_resuelta_en | datetime; {} | hidden/system workflow / private |
| moderacion_resuelta_por_admin_id | integer; {} | hidden/system workflow / private |


### Per-type behavior beyond schema
| Type | Editing / creation / moderation / special behavior |
|---|---|
| Agenda | Dates/times/location/organizer plus text/contact; no components or content relations. Verified public create retained. Review/approve/reject via existing lifecycle; no automatic public agenda creation inferred. |
| Comunicats | Sender enum, author/text/contact; no components/content relations; same review state machine with section-specific payload validation. |
| Veus | Authorship enum/public author plus required contact name and text; no components/content relations. Preserve author rules and submission validation. |
| Millorem | Category and zone are enumerations, NOT Commerce relations. Approval has public Millora effects; new durable operation/idempotent storage protocol remains separate prerequisite work. |
| Foto | Author max120; optional title/location max140; email max180; two consent fields. No components/content relations. Preserve private image workflow. |
| Comercio | Required category, optional subcategory manyToOne; three repeatable components and public business/contact fields. Protected fields governed by commerce-submission-write-guard. Admin direct create/delete/clone/publish/unpublish/discard prohibited by that guard. Approval/rejection resolves request, clears email, does not create a public Commerce or promote images. |

Commerce component schemas: horario-dia has required day enum, optional time windows/notes, closed boolean; servicio has required name, optional translated name/description, featured flag and order integer min0; red-social has required platform enum and URL string, optional user and order min0. All repeatable; no nested component/dynamic-zone/content relation in these three schemas. Preserve IDs, membership validation, order and absent/null distinctions. Do not invent URL/calendar/business validations absent from existing schema/service; public parser rules are preserved independently.

Five non-Commerce models have no equivalent project document guard in src/index.js. Native Admin create/delete/clone availability is subject to Content Manager RBAC, not safely assumed absent. A replacement must inventory these actions as compatibility requirements; removing them requires an explicit decision. Reopen is not an existing dedicated moderation endpoint: current routes expose status/start-review/approve/reject/image. Do not create a reopen privilege by implication. Existing Commerce guard rejects unauthorized state changes; other state fields are hidden. The earlier proposed internal reopen command requires its own authorized policy.

Errors currently use section-specific structured moderation reasons/status and Content Manager validation/permission responses; new CAS adds428/409/400 without discarding those semantics. UI messages must cover CA/ES/EN. No role/data-derived claim was made.

## Candidates
| Topic | A Own page within Admin (minimal candidate) | B Local plugin + controlled backend endpoints | C Hybrid native safe parts |
|---|---|---|---|
| Entry/API | addMenuLink + own React page + authenticated getFetchClient | Same public Admin facilities plus plugin server routes/policies | Same own forms; native list navigation and target editors only |
| Auth/permissions | Reuse existing authenticated CM HTTP read/write paths preserves their checks in installed version, but those internal Admin HTTP contracts are not demonstrated stable public plugin APIs | Own actions/policies supported as extension facilities; exact CM field/conditional permission equivalence is NOT automatic | Retain native permission behavior where still used; private command authorization still needed |
| Form | Own ordinary controlled React inputs, no native Form/useDocument cache ownership | Same | Must NOT retain native private editing Form; doing so preserves B03-FORM |
| Reads | Explicit one-shot permission-sanitized snapshot+revision; ignore background replacements | Own typed read DTO with field filtering and genuine same-read revision | Native list can select identity; own explicit read initializes editor |
| Validation/save | Server entity validator and controlled persistence, with exact permitted input mapping | Own DTO/validation/permission orchestration; greater maintenance | Same owned private save; do not delegate a scalar subform to native Form |
| Relations | Commerce selector changes same draft; one atomic main CAS write; native target editors separate | Own search endpoints must retain target/field/read/status restrictions | Safe native target editor/list only; no parent-connected modal |
| Components | Own three small repeatable field groups; use supported backend component helpers | Same | Cannot reuse internal native component renderer without unsupported imports |
| Media | No general picker; existing private previews and section workflows retained | Own preview endpoint reuse subject to existing authorization | Existing standalone preview logic can be reused after removing native document-hook coupling |
| Moderation | Existing endpoints keep Super Admin requirement; expected revision/session gate added | Same or explicit new policy preserving it | Native target/public editing unchanged; moderation command must use owned snapshot |
| Conflict/navigation | Own dirty draft, explicit discard/reload, freeze on ambiguous success, tab-local state | Same | Navigation guards must also cover links outside the page; browser unload cannot promise crash recovery |
| Maintenance/UX | High effort; replaces six private edit forms but no public CMS editor | Highest; duplicate permission/DTO layer and local plugin packaging | Lowest viable reuse boundary, but not a partial private-native-form solution |

Recommendation for study: A with C's safe reuse (native lists/read-only navigation and unrelated target editors), all six private editing states owned. B is not selected: creating plugin routes is possible but reproducing Content Manager permissions is extra security-sensitive code. No candidate is certified as fully supported until the read/write permission contract and native action coverage are resolved. No new plugin/dependency installed.

## Supported evidence versus internal/experimental interfaces

Verified installed source: @strapi/admin StrapiApp.addMenuLink/addReducers and getFetchClient support owned pages/state/headers; core/apis/router.mjs explicitly labels createRouter internal (do not call it). Content Manager addEditViewSidePanel/addDocumentAction are extension points but do not own native Form. Content Manager index exports unstable_useDocument/unstable_useDocumentActions/unstable_useDocumentLayout; hook source is @alpha/public. Native Form is alpha and its props-change effect replaces values. Internal layout transform/component renderers/relation context must not be reused as a supported editor engine.

Existing CM controllers implement server-side permissionChecker with userAbility, field and conditional checks, sanitize input/output and native relation dimensions. Calling those exact HTTP endpoints would reuse actual checks, but endpoints/services/types exposed under _internal/shared are not evidence of a stable public plugin contract. A global getFetchClient can issue a request; it does not grant that request authorization or stability. Directly calling plugin('content-manager').service('permission-checker') from a new endpoint is not certified here as a stable public permission API. Registering independent plugin RBAC actions would change existing grants unless explicit equivalence/migration is designed and ratified. No roles were inspected.

Existing src/services/admin-moderation-auth.js validates Admin token/session and active user, then requires strapi-super-admin. Its code was read, never invoked. src/api/internal-moderation/routes/internal-moderation.js has auth:false because controllers manually authenticate via that service. That is existing section moderation policy, NOT a reusable permission-equivalent generic editor API. Using it as the only editor authorization would exclude permitted non-super editors and bypass field conditions for super-only custom handling. Preserve separate editing and moderation policies.

## Conceptual guarantees an owned editor can provide

LOAD explicitly → atomically initialize acceptedSnapshot/N and local draft from same sanitized read. Background status/search results cannot assign draft/N. Main save contains all changed editable scalars/components plus Commerce relation delta, avoiding separate relation-save/main-save races and pending invalid-field deadlocks. This intentionally changes the prior separate relation-save design and requires ratification. Capture one request snapshot and original N under a synchronous tab-local claim. Disable every owned input and moderation/main-save action until outcome; no typing to be lost during acknowledgment. Known success supplies accepted snapshot and N+1; errors keep original draft/N,409 locks until explicit review/reload,428 signals missing session. Lost-response ambiguity freezes, never auto-retries. Navigating away requires explicit dirty confirmation; internal links use owned navigation guard, browser unload uses browser-supported best-effort confirmation. Browser crash/forced tab termination is not guaranteed draft persistence, and PII is not stored in localStorage.

Server controlled service retains actual UPDATE id/revision CAS +1, supported component/relation delegation and outer rollback. No snapshot compensation, no caller-set revision, no implicit legacy revision1. CAS prevents concurrent server writers; session claim prevents local incompatible commands. Second tab keeps its own N and conflicts after the first commits. Snapshot/N owner is now the page, eliminating native initialValues/cache effects in that page; this is a conceptual proof of architecture, not implemented QA evidence.

Creation: no UPDATE until server identity exists. Verified public CREATE remains unchanged, strict and server initializes1. Commerce direct Admin CREATE stays prohibited. Other five permitted native CREATE/actions cannot silently disappear; new interface must reproduce authorized behavior and required validation or obtain an explicit scope decision. Creation drafts have no revision until confirmed create; uncertain response needs explicit recovery rather than duplicate resubmission. No new idempotency guarantee for existing CREATE is invented.

## Mandatory writer closure, independent of client

Visual navigation removal is not authorization. Every six-type update, including native Content Manager requests, moderation, entity/document service and direct query paths, must hit the shared strict write capability/CAS backstop. A native request with no revision fails428 before logical writes; a deliberately crafted request with valid permission and N may succeed through the same controlled service, which is controlled rather than a bypass. Do not trust a client header identifying the new editor as authorization. Hidden old editors may remain read-only, but user-facing access must explain the new route and not offer a broken save workflow.

Inventory must also cover create, delete/deleteMany, clone/copy, bulk operations, component deletion and relation writes on inverse paths. Reject unsupported writers via backend policy before mutation; approved operations need explicit authenticated command semantics. Existing Commerce prohibitions stay intact. For other five types, disabling previously permitted delete/clone is a behavioral change requiring ratification; adding revision-safe deletion/clone commands is additional design, not automatically authorized by generic UPDATE CAS. No claim of exhaustive writer closure from installing a sidebar link. This unresolved command inventory is part of B03-LAYOUT's closure obligation, not hidden by the alternative UI.

## Reuse / own work / proposed file package (NOT allowlisted or created)

Reuse unchanged backend schemas as field/validation inventory, existing public verification/parsers, protected Commerce policy, moderation/image services, supported entity validator/component/relation transaction helpers, and prior planned CAS/ledger/storage protocol. Keep public target editors unchanged. Reuse basic React/design-system primitives already installed; no native internal form engines. Own six finite field manifests, controlled inputs, three repeatable editors, Commerce search/selection, draft/session coordinator, dirty navigation, errors/localization and permission-filtered DTO adaptation. Hidden media/audit state remains workflows/read-only.

Backend root: ../../../guiapineda-strapi.
Existing affected if later ratified: src/admin/app.js; src/admin/components/PrivateModerationImagePanel.jsx; config/middlewares.js; src/index.js; src/services/commerce-submission-write-guard.js; src/services/submission-moderation-lifecycle.js; src/services/internal-submission-request.js; src/api/internal-moderation/controllers/internal-moderation-lifecycle.js; src/api/internal-moderation/routes/internal-moderation.js. Prior prerequisite CAS and Millorem files remain separate planned work.
New candidate A paths: src/admin/pages/PrivateSubmissionEditor.jsx; src/admin/components/PrivateSubmissionFields.jsx; src/admin/components/PrivateSubmissionComponents.jsx; src/admin/components/PrivateSubmissionRelationsPanel.jsx; src/admin/privateSubmissionSession.js; src/admin/privateSubmissionDefinitions.js; src/middlewares/private-submission-native-write-guard.js. Already planned persistence/policy/document-guard/concurrency files would supply commands; layout-response middleware would be retired from the design, not implemented. Proposed file names are not permission to write.
If B later chosen instead, additionally propose src/plugins/private-submission-editor/strapi-admin.js and strapi-server.js with separately enumerated routes/controllers/policies/services and registration config; do not add a wildcard allowlist now. The unclosed permission contract prevents pretending that a complete backend endpoint file list is ready. No new app endpoints are specified as authorized.

## Tests required after design ratification (not run)

Isolated schema/field matrix for every six-type required/enum/min/max/email/date/time field; hidden/private restrictions; three repeatable component create/update/delete/order/ownership rollback; category required and subcategory optional; D&P draft/published target resolution; permission revocation/field stripping/conditional grants and private output filtering; all authorized CREATE/edit/admin actions and prohibited Commerce actions; moderation Super Admin and state conflicts; Millorem ledger/retry outcomes; direct/native/bulk/clone/delete bypass attempts; legacy invalid revision; stale two tabs; same-tab lock; preserved dirty data on background refresh/errors/navigation; no input changes while pending; ambiguous response/no retry; CA/ES/EN parity; no native Form/internal renderer dependency. Full prerequisite transaction/storage QA remains necessary later, never against real data.

## Impact, decision and gates

Effort HIGH. Six forms are finite, but permission/action parity and Commerce repeatable components make this larger than B03 panel repair. Full private editor ownership is necessary for the proposed method because native Form reinitialization affects all six, not merely Commerce; this does not justify building a public CMS replacement. Public editors, normal public routes and target content remain untouched.

Residual risks: Admin HTTP/permission contract stability; preserving field/conditional RBAC without internal helpers; authorized delete/clone/create semantics; schema drift in own field manifests; exact error and D&P mapping; accessibility/navigation and PII draft lifecycle. The original two blockers remain counted, with these acceptance obligations incorporated rather than claiming success. Identifying a page API does not close B03-LAYOUT/B03-FORM.

Human decisions needed: whether to ratify a six-type owned editing surface with relations in main save and preserved native public editors; decide which existing private Admin actions must be supported versus explicitly removed; require a demonstrated permission-compatible supported server boundary before implementation. Then amend SPEC/PLAN/TASKS/contracts/allowlist and rerun ANALYZE. No artifact changes beyond these two reports are authorized now. Safe to implement:NO. No IMPLEMENT/QA/CONVERGE/Feature017.

---
## Historical analysis preserved below (not superseded evidence)

# B03 two-blocker recovery — 2026-10-20 — CURRENT RESULT

SPEC PASS (unchanged required guarantees); PLAN FAIL; TASKS PASS (traceable blocked work, not completion); ANALYZE FAIL. B03-LAYOUT BLOCKED; B03-FORM BLOCKED. BLOCKER2/HIGH0/MEDIUM0. Ready for implementation authorization:NO. This supersedes earlier results below without deleting their evidence. No solution is selected for implementation. A is the smallest save model but insufficient; C is a study-only architectural direction requiring a human scope decision.

## Alternatives / support classification
| Alternative | Evidence and API class | Layout / secondary writer | Form ownership | Decision |
|---|---|---|---|---|
| A Relations in main controlled save | Existing own-request client plus backend CAS contract; native selector edits form connect/disconnect | Modal create/publish still issues separate PUT; combining intended payloads does not remove it | Same native Form and cache-derived props | Both blocked |
| B Panel/actions/reducer and public hooks | Official addEditViewSidePanel/addDocumentAction/addReducers; public layout hook. unstable_useDocument/layout/context are experimental/alpha, not stable | Hook lacks explicit source UID in installed invocation; global relation override lacks public native fallback; no proven unchanged-other-models mechanism | No supported extension shown to own/freeze native Form initialValues or suspend reinitialization | Both blocked |
| C Owned Commerce editor | Supported addMenuLink and own React/request state; no native Form or modal required in that page. Router.createRouter explicitly internal and must not be used | Can omit modal on owned page, but alternate native routes and permission-preserving command authorization need design | Can own draft/snapshot on its page; cannot protect other five native editors | Study only, not complete six-type solution |

Technical feasibility is not stable API evidence. Koa response mutation, native cache action mutation, internal component imports and request monkey patches are not accepted substitutes. No undocumented fallback proposed.

## Focused source evidence, read-only
Backend root `../../../guiapineda-strapi`:
- `node_modules/@strapi/content-manager/dist/admin/pages/EditView/components/InputRenderer.mjs:111–120`: added field types are looked up globally by props.type before the native switch; native relation renderer is imported internally at line18 and used at case relation. `StrapiApp.mjs:323` registers a global field library. This is new evidence for why addFields is not a demonstrated scoped replacement preserving all other native selectors.
- `.../hooks/useDocumentLayout.mjs:100–104`: layout hook receives layout/query. Field layouts built at lines197–225 carry field names, attributes and metadata, not a source document session. Neither label matching nor target UID proves source Commerce identity in all contexts.
- `.../FormInputs/Relations/Relations.mjs:497–511`: native create dispatch remains; earlier documented update/publish secondary writes unchanged. No need to repeat rejected native-request interception investigation.
- `node_modules/@strapi/admin/dist/admin/admin/src/components/Form.mjs:81–92,365–367`: changed initialValues replaces values without dirty check. `EditViewPage.mjs:68,99–101` supplies cache-derived values. `Form.mjs:173–175` no-op when onSubmit absent also means an action replacement is not blanket form ownership. Public resetForm resets state but does not prevent the owning parent's next props effect.
- `.../content-manager/dist/admin/src/hooks/useDocument.d.ts` explicitly tags the hook @alpha/@public; Admin exports use unstable_ names. Publicly exported and stable are different claims. Form itself is alpha. Internal formatEditLayout, relation context and router.createRouter are not extension contracts.
- `node_modules/@strapi/admin/dist/admin/admin/src/core/apis/router.mjs:145+` implements addMenuLink; createRouter is explicitly @internal. This supplies a supported separate-page entry point, not automatic equivalence with Content Manager editing.
- Existing moderation panel has its own busy state and post request. Proposed shared session could serialize owned commands; it cannot by itself freeze native input/cache behavior. The source inspection did not run moderation.

## Lifecycle counterexample and required proof
Open snapshot/N → type local scalar/component edits → a query invalidation/refetch changes the document → EditView recomputes initialValues → Form SET_INITIAL_VALUES replaces values. Freezing N does not retain lost edits; setting N to the latest would additionally defeat CAS. A proposed dirty save guard observes state after replacement and cannot recover original user intent by assertion. The same shared Form is used for all six types. No actual live data loss was induced; this is a source-derived reachable failure pattern requiring design prevention.

Likewise, two same-tab buttons can share a synchronous claim, but that does not stop typing during a pending command. Acknowledgment/reset must not erase those later edits. A supported design must either own/disable all inputs for the command duration or preserve an explicit subsequent draft generation. The prior side panel owns neither native Form props nor all six editor inputs. Neither failure should be papered over with another latest-revision read.

An owned editor can define OPEN(snapshot,N)→local draft→claim→PUT expectedN→ack(snapshot2,N+1) with no cache-to-draft assignment. Failures keep draft/N; uncertain outcomes freeze for explicit reload; late results cannot cross session generations; navigation/reload requires a dirty confirmation. Separate tabs never share baseline. This is a candidate protocol only; full editor permission, field validation, component/Media and native-entrypoint compatibility are unproven, and C is not authorized.

## Compatibility assessment
| Area | Finding |
|---|---|
| Six private types | Shared native Form exposure affects all six; Commerce-only C insufficient for global guarantee |
| Commerce | Only categoria/subcategoria domain relations, required/optional manyToOne; main-save combined delta viable in backend, not proof of UI exclusion |
| Moderation | Must use same original session N/claim, no refreshed baseline; current native-form integration remains open |
| Components / Media | Existing form-local changes and controlled parent persistence design retained; standalone editor must reproduce behavior, not import internal engine blindly |
| Admin permissions | Preserve conditional/field authorization and sanitization; C alternate route/command policy must not bypass them; no current role inspection |
| D&P targets | Parents non-D&P, both relation targets D&P; preserve native target editor and transform rules; C parity needs proof |
| Creation / unsaved data | Public verified CREATE unchanged; Commerce Admin CREATE prohibited; no UPDATE before identity. Other currently permitted creates must retain all validators. Native initialValues replacement also applies to dirty creation forms |
| Legacy revision | Missing/invalid fails closed until human-gated backfill; never accept implicit1 as recurring update compatibility |
| Exactly-once increment | Actual CAS UPDATE and same transaction remain required; combined relation/main accepted save increments once; stale loser zero writes |
| Bypasses / other types | Backend strict CAS rejects missing header but a broken native flow is not acceptable elimination. Global field override cannot be assumed behavior-neutral |

## Findings and SDD consistency
B03-LAYOUT: BLOCKER, stable scoped native exclusion remains unproven for A/B. B03-FORM: BLOCKER, supported original snapshot/local-draft ownership remains unproven for A/B and all six under C-Commerce-only. No extra HIGH/MEDIUM duplicates of these findings. SPEC and tasks retain coherent requirements/gates; PLAN now explicitly labels the projection as rejected and C as unapproved study. T020 stays open; no task checked off and no alternate architecture silently adopted. Existing26tasks/21FR+4SC coverage remains unchanged; no runtime QA, no CONVERGE, no new allowlist entry. No Constitution modification. I–VII remain governing, especially IV evidence-first and VI preservation of unsaved work/explicit UX changes.

Human decision required: whether to authorize a separate bounded owned-editor design covering Commerce plus the other five private editors' snapshot ownership and controlled native entrypoints. If that scope is not accepted, retain both blockers until a supported native integration is demonstrated. Do not treat this as an implementation request. STOP.

---
## Prior analysis preserved (superseded)

# B03 SDD ANALYZE — current gate, 2026-10-19

SPEC PASS (requirements captured); PLAN FAIL (two unresolved integration proofs); TASKS PASS (coverage/dependencies, not completion); ANALYZE FAIL; B03 BLOCKED. READY FOR IMPLEMENT AUTHORIZATION: NO. This result supersedes historical PASS below, including the conditional proposal PASS in qa-report.md. Direction ratification and file allowlisting do not prove feasibility or authorize implementation.

## Findings
| ID | Category | Severity | Location | Evidence / gap | Required resolution |
|---|---|---|---|---|---|
| B03-LAYOUT | Unsupported contract assumption | BLOCKER / CRITICAL | plan.md:33; spec.md:43; T020/T022 | Project middleware is supported, but the proposal rewrites internal Content Manager configuration structure data.contentType.layouts.edit. Installed source demonstrates consumption, not a stable public extension contract. Version pinning, fixture tests and fail-closed shape checks do not meet the user's stronger no-unstable-internal-contract condition. | Demonstrate supported exact scoped control exclusion, including create/publish-and-connect and nested/config/cache paths. The documented edit-layout hook is a candidate only; verify its installed payload and reliable Commerce identity without broad route/global-state assumptions. |
| B03-FORM | Incomplete snapshot integration | BLOCKER / CRITICAL | plan.md:35; spec.md:44–46; T020/T021/T023/T025 | Native EditView passes cache-derived initialValues into Form. Form effect resets values when those props change, independently of Redux revision state. The proposal defines a session lock but no demonstrated supported bridge to prevent/reconcile native form reset or edits typed during a request. | Prove original snapshot/N pairing, dirty-edit retention on background refresh, and safe acknowledgment across main/relation/moderation using supported APIs. Prevent or account for in-flight typing; don't treat a numeric busy flag/resetForm call as proof. |

No runtime failure asserted: both are source-based design gaps. No application code was written. HIGH0,MEDIUM0,LOW0; two critical baseline guarantees remain unresolved. The previous proposal overclaimed readiness by treating response middleware support and a desired session protocol as sufficient. This analysis corrects that conclusion explicitly.

## Version-specific evidence
Paths relative to backend root ../../../guiapineda-strapi:
- node_modules/@strapi/content-manager/dist/admin/content-manager.mjs: addEditViewSidePanel/addDocumentAction registration exists. This proves insertion only.
- node_modules/@strapi/content-manager/dist/server/controllers/content-types.js:42–70 emits configuration body; admin/services/contentTypes.mjs consumes it. No promise of stable response rewriting as an extension contract was established.
- node_modules/@strapi/content-manager/dist/admin/hooks/useDocumentLayout.mjs:100 invokes MUTATE_EDIT_VIEW_LAYOUT with layout/query. formatEditLayout is explicitly @internal and reads configuration layouts. The public hook is distinct from the proposed server response rewrite; its mere existence does not close exact scoping.
- node_modules/@strapi/content-manager/dist/admin/pages/EditView/components/FormInputs/Relations/Relations.mjs:497–511 opens creation modal directly; RelationModal.mjs:448–465 newTab/page handles existing links only. newTab alone leaves the bypass path.
- node_modules/@strapi/content-manager/dist/admin/pages/EditView/EditViewPage.mjs:68,99–101 derives and passes initialValues. node_modules/@strapi/admin/dist/admin/admin/src/components/Form.mjs:81–92 dispatches SET_INITIAL_VALUES on changed props; reducer:365–367 replaces draft.values. This effect has no dirty check.
- node_modules/@strapi/content-manager/dist/admin/hooks/useDocument.mjs derives initial values from currentData/document; exported useForm.resetForm permits reset, but is not a documented switch disabling the parent's reinitialization effect.
- node_modules/@strapi/admin/dist/admin/admin/src/core/store/configure.mjs and StrapiApp.mjs support tab-local reducers; getFetchClient.mjs permits owned-request headers. They provide the session/request building blocks, not automatic form ownership.
- node_modules/@strapi/content-manager/dist/server/controllers/collection-types.js:183–237 authenticates/authorizes/sanitizes before document update; relations.js:130+ checks model/field/conditional read permissions and D&P dimensions.
- Current six schemas and Commerce component schemas establish parent non-D&P, category/subcategory manyToOne, category required, targets D&P; no nested domain relation in those components. Native component/Media selectors edit form state. Commerce write guard forbids direct Admin create.

Official references checked: [Admin hooks](https://docs.strapi.io/cms/plugins-development/admin-hooks), [Content Manager APIs](https://docs.strapi.io/cms/plugins-development/content-manager-apis), [middleware API](https://docs.strapi.io/cms/backend-customization/middlewares). Documentation supports hook/UI/middleware facilities; it does not prove that every internal response shape is a stable extension contract. Installed source is authoritative for 5.41.1 behavior.

## Twelve-point gate
| Check | Result | Evidence / limit |
|---|---|---|
| 1 panel registration | PASS design | Official addEditViewSidePanel |
| 2 eliminate native secondary writer | NOT PROVEN | B03-LAYOUT; create/publish paths must both disappear |
| 3 stable supported layout mechanism | FAIL | Supported Koa transport is insufficient evidence for internal payload contract |
| 4 authentic original baseline | PARTIAL | Same-read metadata and frozen session specified; snapshot pairing unresolved B03-FORM |
| 5 success/error baseline evolution | PASS protocol, not integrated proof | Known result ack only; failure retains N; ambiguous response freezes |
| 6 form/panel/moderation races | FAIL end-to-end | Synchronous claim specified; native reset and in-flight input reconciliation unresolved |
| 7 tabs | PASS design | Independent per-tab Redux generation; no cross-tab persistence/broadcast |
| 8 permission/validation/cardinality/D&P | PASS contract | Reuse CM checks/helpers; reject silently stripped requested fields; T026 requires proof |
| 9 components/Media | PASS source inventory, runtime pending | Parent editing remains main-form controlled save; no additional secondary parent command found |
| 10 existing/create/unsaved | PASS specified boundary, form integration blocked | No UPDATE before identity; public CREATE unchanged; Commerce Admin CREATE forbidden; preserve permitted other creates |
| 11 other types unaffected | REQUIRED, not fully proven | UID scope specified; layout isolation depends on B03-LAYOUT |
| 12 traceability | PASS | Every requirement mapped; T020 is pre-implementation design gate |

## Coverage summary
| Requirement | Tasks |
|---|---|
| FR01 | T005,T006,T018 |
| FR02 | T007,T008,T020,T023,T025 |
| FR03 | T004,T005,T026 |
| FR04 | T004,T005,T012 |
| FR05 | T002,T005,T021,T025,T026 |
| FR06 | T005,T007,T010,T015,T025 |
| FR07 | T006,T008,T026 |
| FR08 | T005,T019 |
| FR09 | T003,T012,T013 |
| FR10 | T009,T011 |
| FR11 | T010,T012,T013,T014,T015 |
| FR12 | T009,T011,T013,T015 |
| FR13 | T016,T017 |
| FR14 | T001,T018,T020 |
| FR15 | T001,T017,T018 |
| FR16 | T020,T022,T024 |
| FR17 | T020,T021,T023,T025 |
| FR18 | T021,T025,T026 |
| FR19 | T020,T023,T025 |
| FR20 | T022,T024,T026 |
| FR21 | T021,T024,T026 |
| SC01 | T004,T008,T025,T026 |
| SC02 | T009,T010,T015,T018 |
| SC03 | T001,T018,T019,T024 |
| SC04 | T020,T017,T019 |

Metrics:21FR+4SC=25 requirements/criteria,26 unique unchecked tasks,100% task mapping,0unmapped tasks,0duplicate task IDs,0completed implementation tasks. Two underspecified integration guarantees above; task coverage is not proof of architecture. Storage/publication decisions not rewritten or re-certified by this focused B03 analysis.

## Constitution and authorization
I/II editorial/static architecture unchanged; III strict verification/CAS/privacy preserved; IV no DB/storage operations and evidence-first gate enforced; V no dependency/framework patch; VI CA/ES/EN tasks retained and intentional UX change explicit; VII backend code vs frontend SDD paths explicit. Implementing the unproven plan would conflict with evidence-first governance; no exception requested. The human explicitly requested persisting this report, so the analysis findings are saved after the read-only assessment; no implementation remediation applied.

SDD prerequisite check resolved the unnumbered directory with SPECIFY_FEATURE_DIRECTORY; static counts/paths checked without importing application code. No .specify/extensions.yml; no pre/post hooks. QA NOT_STARTED, CONVERGE NOT_STARTED. No SQLite read/hash/stat/copy, real DB, uploads/storage, migration, backfill, dependency, commit, push, deploy or017 work.

Next action: resolve T020 with supported native-control exclusion and native-form snapshot ownership evidence, then rerun ANALYZE. Stop here; no IMPLEMENT authorization requested or inferred.

---
## Historical pre-B03 analysis (preserved; no longer current)

# Specification Analysis Report — final design

Date2026-10-19. Result PASS (architecture/design only). This supersedes previous BLOCKER reports; historical evidence retained. User authorization to implement/schema-source remains pending. Runtime code/QA/FS/DB operations NOT performed.

## Findings
No unresolved BLOCKER/HIGH/MEDIUM. Independent source-only storage review identified a draft-image edit window between LINKED and PUBLISHED; repaired before final analysis: system-owned image slot protected in EVERY state before PUBLISHED. Related scalar public editing remains permitted. Storage same-filesystem/link capability is an explicit supported-runtime precondition, with future isolated fail-closed tests, not a claim of actual production filesystem qualification. Seven operation fields consistently specified; old prose count corrected.

## Coverage
| Requirement | Tasks | Evidence |
|---|---|---|
| FR01 | T005,T006,T018 | scoped controlled service/backstop |
| FR02 | T007,T008 | original Admin baseline, permission/UX contract |
| FR03 | T004,T005 | supported component/relation helpers |
| FR04 | T004,T005,T012 | actual transactions, no parent compensation |
| FR05 | T002,T005,T008 | schema proposal/CAS/once increment |
| FR06 | T005,T007,T010,T015 | errors, rollback vs aftercommit |
| FR07 | T006,T008 | public strict create/server revision |
| FR08 | T005,T019 | neutral policy,017 excluded |
| FR09 | T003,T012,T013 | unique source ledger and coupled receipts |
| FR10 | T009,T011 | native link/manifest/hash |
| FR11 | T010,T012,T013,T014,T015 | staged publication/editorial guards |
| FR12 | T009,T011,T013,T015 | quiesced temps, quarantine reference retained |
| FR13 | T016,T017 | count-based null backfill/freeze/cutoff |
| FR14 | T001,T018 | no new deps/vendor SQL/patch |
| FR15 | T001,T017,T018 | current design only/future isolated QA |
| SC01 | T004,T008,T018 | six types+CAS/failure |
| SC02 | T009,T010,T015,T018 |27 scenarios+edge cases |
| SC03 | T001,T018,T019 | exact allowlist |
| SC04 | T017,T019 | gated rollout+converge |

15FR+4SC,19tasks;100% mapped requirement coverage;0unmapped tasks;0duplicate/ambiguous active requirements. No count claims runtime validation. Tasks grouped US1–US3 with dependencies, explicit file paths and human operational gates. Schema changes fully designed are authorization gates, not architectural findings. Full task generation/setup script and analysis prerequisite script resolved unnumbered directory explicitly;017 feature state not repointed. No extension hooks file present.

## Invariants / counterexamples addressed
Atomic conditional parent revision closes stale updates; original UI baseline not refreshed behind dirty editor. Supported updateMany/components/updateRelations remove scoped parent general-update compensation. No PII-based version token needed. Temp complete+closed+link cannot replace canonical winner; EEXIST verifies full SHA256, not size/exists. Media+ledger pointer one commit prevents committed Media without receipt; target+ledger creation and publish+completion similarly coupled. Unique source ledger separate from D&P avoids duplicate-variant unique-field conflict. Concurrent file attempts may leave private temp names, never second canonical artifact; quiesced cleanup protects active attempts. Failures/corruption are explicit, not rewritten as success.

Source image protected by retained quarantine reference; canonical/temp roots outside cleaner namespace. Guard active until PUBLISHED prevents staged image race. Published editor changes preserved; reapprove image mismatch is explicit conflict/review, not silent source overwrite. Eligibility cutoff excludes historical ambiguous sources, manual mapping required. Cross-resource DB/FS atomicity is not claimed; durable manifest/recovery bridge the boundary.

## Constitution / scope
I–VII checked: editorial authority retained; public static flow unchanged; private source/logs guarded; operational schema/backfill requires inspection/backup/validation/human approval; native dependency-free adapter limited to Millorem; three-language public regression required; exact repo/file ownership. No new public/Media schema, no017 nullable name or cleanup, no expiry/global media cleaner. No constitution exception.

## Status and next step
SPECIFY PASS, PLAN PASS, TASKS PASS, ANALYZE PASS. BLOCKER0,HIGH0,MEDIUM0. Local implementation is feasible before real backfill using isolated fixtures, after human approves schema SOURCE and code allowlist. It is not deployable against old real data until separate operational gates. No source/schema/storage/data/SQLite/transaction/upload/migration/backfill/dependency/commit/push/deploy action occurred. Only authorized SDD files written.

Authorize the bounded local implementation package in authorization-package.md; preserve separate backfill/deployment/017 authorization.
