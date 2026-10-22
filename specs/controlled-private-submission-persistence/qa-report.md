> Current governance — 2026-10-20: **Implementation formally suspended.** [Decision and reactivation conditions](plan.md#formal-implementation-suspension--2026-10-20). IMPLEMENT not authorized; implementation QA/CONVERGE NOT_STARTED. The earlier one-shot authorization below is historical and does not authorize resumption.

# Local implementation preflight — STOPPED

Date: 2026-10-19. Authorization: one-shot local IMPLEMENT → isolated QA → CONVERGE, with immediate STOP for a new architectural blocker. No product implementation or runtime QA started.

## Baseline and frozen scope

- Frontend HEAD: `9585533df4bab4979a58c0aab83da21036f3e5df`, origin `https://github.com/gerardolmos/guiapineda-dev.git`.
- Backend HEAD: `c2f405312bb7dcd8dc6bd1abce42d317e0e3e879`, origin `https://github.com/gerardolmos/guiapineda-strapi.git`.
- Both have no tracked modifications. Backend has no untracked files. Frontend baseline consists solely of the pre-existing untracked SDD documents under `specs/017-private-data-lifecycle-retention/` and `specs/controlled-private-submission-persistence/`, including their histories. These pre-existing documents are not changes made by this implementation attempt.
- `allowlist.md` was read and frozen unchanged before any write. The sole new file in this attempt is this allowlisted report. No schema or product file was changed; no task is marked completed.
- Prerequisite check with `SPECIFY_FEATURE_DIRECTORY=specs/controlled-private-submission-persistence` resolved the intended unnumbered prerequisite.

## B03 — Admin relation-modal secondary parent writer not covered

Severity: BLOCKER. Requirements: FR02/FR03/FR05; tasks T007/T008; `contracts/admin-writers.md` original owner baseline, relation-modal compatibility and unchanged default actions for other models.

Source evidence from installed Strapi 5.41.1, read as text only (paths below relative to backend):

1. `node_modules/@strapi/content-manager/dist/admin/pages/EditView/components/DocumentActions.mjs:738` defines the standard UpdateAction. At lines 833–841 it creates the related entity using the current modal model.
2. At lines 854–866, when `fieldToConnect`, `documentHistory` and an existing parent are present, that same action performs a separate `updateDocumentMutation` against the parent model/document. It derives the parent payload from `parentDocumentData.getInitialFormValues()` and calls `connectRelationToParent`.
3. `node_modules/@strapi/content-manager/dist/admin/services/documents.mjs:312` defines that mutation. Its query accepts collectionType/model/documentId/data/params; request config contains params only. It has no per-call expected-revision header input.
4. `node_modules/@strapi/content-manager/dist/admin/hooks/useDocumentActions.mjs:272` likewise forwards only those arguments for update.
5. The public Admin entry point exports document hooks, but does not export the relation-modal context or this internal mutation as a supported custom-action API.

Concrete affected path: while editing a private Commerce submission, an authorized editor creates a related category/subcategory from a relation modal. The current modal model is outside the six private types, so the approved scoped action substitution leaves its default action intact. The default action can then issue the secondary PUT to the private parent without `X-Private-Submission-Expected-Revision`.

The proposed server guard correctly returns 428, but that breaks the existing parent-connection flow after the related entity has been created. Accepting the request without the header or deriving a fresh server revision would instead violate original-baseline CAS. The approved six-model action replacement does not specify a supported mechanism to carry the original parent revision on this secondary write. This is a source-derived design finding, not an observed live failure or a claim that all alternative integrations are impossible.

Required design decision: close the parent-revision transport for relation-modal secondary writes using a supported integration within an explicitly ratified scope, preserving non-private actions, original owner baseline and normal relation creation/connection. Alternatively, explicitly ratify a changed modal UX; that would change current preservation requirements. Do not patch framework internals or silently disable the workflow under the current authorization.

## Result and safety

IMPLEMENT STOPPED at preflight/API compatibility review. QA NOT_STARTED. CONVERGE NOT_STARTED. Findings: BLOCKER 1, HIGH 0, MEDIUM 0. Prior design PASS reports remain historical evidence and do not constitute implementation readiness after B03.

Only Git metadata, SDD/skill text and installed JavaScript/package source were read. No Strapi bootstrap, real transaction, SQLite access (including hash/stat/copy), real data access, real uploads, migration, backfill, dependencies, commit, push or deployment. No servers, ports or QA temporary artifacts were created.

Next action: resolve B03 in the Admin transport design before resuming local implementation. Safe to commit prerequisite: NO. Feature 017 remains unimplemented and not technically unblocked by this attempt.

## B03 recovery investigation — 2026-10-19

Result: FAIL / STOP. This is a source-only investigation, not runtime QA. No product edits. The allowlist remains unchanged. No new materially different writer was found: PublishAction has the same secondary-parent mutation as UpdateAction.

### Reconstructed flow and baseline location

Installed source paths below are relative to backend `node_modules/`.

1. `@strapi/content-manager/dist/admin/hooks/useDocument.mjs` reads RTK Query `currentData`; it exposes `document`, `meta`, `refetch` and a form transformer. This is a live cache-backed value, not a frozen original editor revision. Current product schemas do not yet have revision. The planned same-document response metadata could supply N when a scoped editor first mounts, but no existing dedicated revision session exists.
2. `.../pages/EditView/components/FormInputs/Relations/RelationModal.mjs:137–177` owns a reducer/context with documentHistory, fieldToConnect and rootDocumentMeta. Root metadata has model, documentId, collectionType and params; it has no original revision. The current document comes from another useDocument query. Closing the modal can refetch the root (lines 373–385), so cache contents must not be promoted to an original baseline.
3. Ordinary selection/disconnection/reordering in `.../FormInputs/Relations/Relations.mjs` changes the form's connect/disconnect arrays. It does not itself save the private parent.
4. Creation in the modal is different: UpdateAction creates the related document, then at `.../DocumentActions.mjs:854–866` builds parent data from cached getInitialFormValues and connectRelationToParent, then independently PUTs the parent. PublishAction does the analogous update at lines 610–624. This can happen without a preceding main parent save.
5. The parent is the previous documentHistory entry or rootDocumentMeta. `connectRelationToParent` combines transformed parent data with a connect entry carrying related documentId/locale (and component metadata when applicable). This is not necessarily a relation-only minimal patch; original-payload fidelity matters as well as the revision token.
6. Endpoint: `PUT /content-manager/collection-types/<parent UID>/<parent documentId>`. The body is parent data plus the connection. `.../services/documents.mjs:312` only supplies params in request config. `@strapi/admin/dist/admin/admin/src/utils/baseQuery.mjs` creates a fresh getFetchClient for each execution. The client supplies authentication/JSON headers plus per-call options.headers, but the internal mutation supplies no expected-revision header.
7. On parent failure the standard action displays the formatted API error and returns; it does not automatically retry a 409 with a newer revision. The related child may already exist, because its creation precedes the failed parent write. No claim of cross-request atomic rollback is made.

### Supported options evaluated

| Option | Supported surface | Baseline fidelity / relation compatibility | Six types / blast radius / maintenance | Decision |
|---|---|---|---|---|
| A Official request interception | No HTTP interception registration found in installed Admin API | Cannot inject frozen N into internal parent mutation | A global fetch replacement would affect all models and is prohibited | Not demonstrated |
| B Custom/wrapped document action | addDocumentAction is supported, including relation-modal position | Can own its own requests; delegating the original onClick cannot change its internal PUT. Replacing the workflow requires parent history, fieldToConnect, payload transformation and completion semantics not exposed by the public action props | Six-only replacement misses related category actions; replacing non-private actions extends the behavioral contract | Insufficient within current preservation contract |
| C Session context/reducer | React state and custom reducers are supported | Can retain N, isolate tabs and ignore background refetch; storage alone cannot alter the internal request | Feasible bounded state for six UIDs, but no transport bridge demonstrated | Partial solution only |
| D Request client middleware | getFetchClient/useFetchClient support per-call headers. No public interceptor registry found | Works for requests owned by custom code, not existing internal mutation | No shared client instance to configure; overriding fetch or internal endpoint definitions is not approved | Not sufficient |
| E Modal extension point | addDocumentAction('relation-modal' position) is supported | Action props carry current document/meta, not the private parent session/history/connection command. Internal useRelationModal is not exported by the package Admin entry point | Importing internal files or copying the modal engine would be fragile and outside the selected supported integration | Not sufficient |
| F Redux middleware / fields / hooks | app.addMiddlewares registers Redux middleware; reducers/injection zones are available | configureStore places these after default thunk middleware; this is not a request-config interceptor. Mutating RTK pending-action originalArgs is not a supported header hook, and the endpoint ignores arbitrary header args anyway | Replacing built-in relation fields or a custom editor would be a distinct UX/integration design, not a transparent fix | No compatible bridge demonstrated |

Evidence for D/F: `@strapi/admin/dist/admin/admin/src/utils/getFetchClient.mjs`, `utils/baseQuery.mjs`, `core/store/configure.mjs`, `StrapiApp.mjs:336`; Content Manager public exports in `@strapi/content-manager/dist/admin/index.mjs` and package exports in its package.json. Injection zones and plugin APIs were also inspected. A function internally named responseInterceptor is not an extensibility registration API.

Official documentation cross-check (installed 5.41.1 source remains version-specific evidence): [Admin API](https://docs.strapi.io/cms/plugins-development/admin-panel-api), [Content Manager actions](https://docs.strapi.io/cms/plugins-development/content-manager-apis), [fetch client](https://docs.strapi.io/cms/plugins-development/admin-fetch-client). These document UI actions and client-owned requests; they do not establish an interceptor for this internal parent mutation. This investigation does not assert that every possible custom editor is impossible.

### Required session semantics, not implemented

A mounted editor session would own `{UID, documentId, sessionGeneration, expectedRevision}`. Initialize once from the same loaded snapshot's metadata. Never initialize/advance from an unrelated cache refresh. Known successful controlled save advances only from an authoritative response associated with that session and request; a failed or ambiguous response does not advance. Serialize local writes or prevent an older response from regressing the session. Navigation/reload disposes the session; another browser tab has an independent session. No localStorage/BroadcastChannel/shared mutable global baseline.

Main save N→N+1 permits the next relation request to send N+1; relation success then advances to N+2. Relation-first success advances to N+1 before a subsequent main save. Baseline advancement also requires the corresponding accepted document snapshot/form state to be reconciled without silently discarding pending edits; merely advancing a number on top of stale full-parent form data is insufficient. A stale request returns 409, keeps its old baseline/edits and requires explicit reload/review. Missing baseline returns 428 (integration defect for a normal supported path), malformed baseline 400. No retry/merge or fresh-revision substitution. Success metadata should be in the existing response body from the same controlled result, not a second query. The strict backend contract requires no relaxation.

### Six-type and nested-action classification

| Type | Secondary Content Manager relation-parent writer |
|---|---|
| Agenda | DOES NOT USE IT in declared domain fields; Media selection changes form state |
| Comunicats | DOES NOT USE IT in declared domain fields; Media selection changes form state |
| Veus | DOES NOT USE IT in declared domain fields; Media selection changes form state |
| Millorem | DOES NOT USE IT in declared domain fields; Media selection changes form state |
| Foto | DOES NOT USE IT in declared domain fields; Media selection changes form state |
| Comercio | USES SECONDARY RELATION WRITE for category/subcategory create/publish-and-connect when permissions/layout enable the modal |

This classification is schema/source based, not a live permissions/layout inspection. Commerce's three component schemas contain scalars, no nested content relations. Repeatable.mjs uses addFieldRow/moveFieldRow/removeFieldRow. Upload's MediaLibraryInput.mjs uses useField/onChange to select/remove/reorder Media references; Media upload/edit operations target Media, not this private-parent save. No materially different secondary private-parent writer was established by these checks; no speculative scope was added.

### Gate and next decision

Original baseline in existing modal path: NO (capturing an initial future response in custom state is feasible, but no existing frozen baseline or supported end-to-end bridge was found). Supported transport for the existing secondary request: NO. Backend relaxation required: NO; it remains prohibited. B03 FAIL, BLOCKER 1, HIGH 0, MEDIUM 0. IMPLEMENT not resumed; QA and CONVERGE NOT_STARTED. Plan/tasks/analysis PASS are not regenerated because the recovery gate did not pass.

Next action: ratify a bounded custom relation workflow that owns the parent request and editor-session baseline, with explicit UX and exact file scope, instead of requiring transparent interception of the installed internal modal write. It must preserve strict CAS; implementation feasibility still needs design validation before resuming. Only this allowlisted report was modified during recovery; all safety exclusions remain respected.

## B03 custom relations design proposal — 2026-10-19 — NOT RATIFIED

This section preserves all earlier findings. Design only: no SPEC/PLAN/TASKS/allowlist edits, product implementation, runtime QA or operational work. Proposed design PASS for human review; B03 remains an implementation gate until the UX/scope proposal is ratified and implemented/tested. No assertion of native UX equivalence or production certification.

### 1. Verified inventory and request flow

The preceding recovery section records source paths and the six-type inventory. Rechecked installed 5.41.1 source and schemas, without loading Strapi. All six private types have draftAndPublish:false. Agenda, Comunicats, Veus, Millorem and Foto have a single image Media field and no domain content-type relations/components. Commerce has required manyToOne categoria→api::categoria-comercio.categoria-comercio and optional manyToOne subcategoria→api::subcategoria.subcategoria, three repeatable components (horario_semanal, servicios, redes_sociales), single logo/imagen_principal and multiple galeria Media. Its three component schemas contain no relations or nested components. Both category target types enable Draft & Publish. Existing schema validation and Commerce write-policy restrictions remain authoritative; this design adds no cross-field category/subcategory rule that does not already exist.

Native selection/disconnection mutates form state; component add/remove/reorder and Media selection also mutate form state. Native create-and-connect and publish-and-connect in a relation modal first write the target, then independently PUT the parent. It is these two secondary-parent paths that must disappear for Commerce. Editing a target itself remains a target write, not a private-parent write. No materially different private-parent bypass was found in the inspected component/Media selectors. Media operations against Upload are outside this replacement and retain existing safeguards.

Additional verified evidence:
- `@strapi/content-manager/dist/admin/pages/EditView/components/FormInputs/Relations/RelationModal.mjs:448–465`: relationOpenMode newTab/page controls existing relation links.
- `.../Relations/Relations.mjs:497–511`: create option directly dispatches GO_TO_RELATION with fieldToConnect, without consulting relationOpenMode. Setting newTab alone is NOT a solution.
- `.../server/controllers/content-types.js:42–70`: configuration GET returns `{data:{contentType: configuration, components}}`; edit layouts live under contentType.layouts.edit. `.../admin/services/contentTypes.mjs` consumes this response. `.../admin/hooks/useDocumentLayout.mjs` transforms that layout into fields.
- `.../admin/content-manager.mjs`: supported addEditViewSidePanel and addDocumentAction. `@strapi/admin` supports addReducers; its getFetchClient.put accepts per-request headers. No internal HTTP interception is needed for custom-owned requests.
- `.../server/routes/admin.js:90–109`: available/existing relation GET routes authenticate Admin. `.../server/controllers/relations.js:130+` validates model/field, read permissions, document conditions, locale/status, and sanitizes target labels.
- `.../server/controllers/collection-types.js:183–237`: existing parent PUT checks update permissions/conditions, sanitizes input and delegates to documentManager.update. Controlled document middleware remains the approved persistence integration point.

Observed source behavior is distinguished from unknown live configuration: no role assignment, saved layout, database record or actual request was inspected. Modal availability depends on permissions/layout. No runtime claims are made.

### 2. Alternatives and decision

| Alternative | Supported mechanism and 5.41.1 compatibility | Scope, complexity and maintenance | UX / CAS / limitations |
|---|---|---|---|
| A Dedicated relations panel with explicit relation save (recommended) | Official side panel + Redux reducer + client-owned GET/PUT; project Koa middleware projects only Commerce edit layout | Two domain fields; modest custom selector/session logic; response shape version-pinned and fixture-tested | Target editing in separate native tab; explicit return/select/save; strict CAS; does not preserve automatic modal connection |
| B Same selectors, integrate relation delta into controlled main save | Same supported surfaces and controlled PUT | Less separate save handling, but custom main serializer must merge pending relation delta with scalar/components/Media and validate one atomic command | One revision increment per combined save; valid alternative if human prefers all-or-nothing main save; cannot independently save relation while scalar edits remain invalid |
| C relationOpenMode=newTab only | Setting supported, values validated server-side | Minimal configuration | Rejected: create option still opens native modal and secondary PUT; no CAS guarantee |

A is recommended because it owns the entire relation request, keeps the shared six-type persistence contract, and requires no target editor replacement. B is viable but is a different explicit save UX. There is no proposed framework patch, custom component engine or undocumented request interception.

### 3. Concrete Admin architecture

Register a tab-local Redux reducer through app.addReducers in register, and side panel/action through Content Manager APIs in bootstrap. A shared module exports session selectors/actions and an owned request function used by the main save action, relations panel and moderation panel. No mutable module-global baseline, localStorage, BroadcastChannel or shared tab state. State is keyed by UID/documentId and an editor mount generation; route exit disposes the generation and stale responses cannot update a later session.

Panel title: Relaciones (localized CA/ES/EN). Render interactive category/subcategory controls ONLY for saved Commerce records with field permissions. Other five types retain their existing Media controls and receive only the already-designed shared CAS save/session integration. Show existing relation, searchable paginated available choices, Replace, Remove for optional subcategory, and Save relations/Discard. Required category cannot be cleared to an invalid final state; replacement is a single final relation delta. Show Create/Edit target links only when corresponding target permissions permit; links open native target editors in a separate tab with noopener. The target editor's behavior is unchanged. Returning requires explicit Refresh choices and selection; no auto-connect, no postMessage baseline transfer, no automatic parent save.

Remove categoria/subcategoria from the effective native Commerce edit layout, including duplicate occurrences, using an ordinary project Koa middleware after await next on the exact successful configuration GET. Clone the response and filter ONLY those two fields from `data.contentType.layouts.edit`; remove resulting empty rows. Preserve metadata, schemas, component layouts, options, other fields and all other model responses. Do not persist layout changes to the store/DB or change model attribute visibility. This uses supported response middleware, not replacement of a plugin function. Conditional HTTP/cached responses must not bypass projection: qualify 200/304 behavior and disable conditional reuse for this scoped configuration if needed. On an unknown response shape, fail closed for the scoped editor configuration; do not render the unsafe original fields. Native layout customizations cannot reintroduce these controls because projection applies to each returned scoped layout.

Projection also ensures a Commerce document reached inside a native modal cannot expose the two nested relation-create controls. Custom controls/main action in unsupported nested editor contexts must explicitly require opening the full Commerce editor; they must not bind to a different root document's session. This is an additional disclosed UX change. Do not replace category/subcategory native editors or remove controls from unrelated types.

The projected layout is not a security boundary: server rejects every private-parent update lacking a valid revision regardless of UI or old Admin bundle. Old clients may receive 428 during coordinated rollout; never accept a bypass. The side panel fails closed if session/config initialization is incomplete.

Unsaved private records have no update baseline. Do not invent N=1 as permission for an UPDATE. Existing public verified creation remains unchanged and assigns revision1 server-side. Existing Commerce direct Admin creation remains forbidden by its guard. If another already-permitted private Admin CREATE surface exists, preserve its creation authorization and field validation; enable the shared UPDATE session only from its successful returned identity/revision. No new Commerce Admin create privilege is added. Target creation is independent; cancelling the parent association does not delete the new category.

### 4. Session, concurrency and payload contract

One session owns `{uid,documentId,generation,expectedRevision,acceptedSnapshot,busy,conflicted,relationDraft}`. Initial N and snapshot must come from the SAME authenticated document read response, with metadata produced from the same raw result before sanitization. Initialize once for the mounted record; background cache updates and relation-choice refreshes never change N. Refuse submission if form snapshot/session identity cannot be matched. The metadata is not a writable data.revision field.

OPEN N → main controlled PUT header N → successful authoritative result N+1 → synchronize accepted snapshot/form and baseline N+1. Then relation-only PUT header N+1 → result N+2 → baseline N+2. Relation-first follows the same ordering. A local synchronous reducer claim admits only one in-flight writer across main, relation and moderation actions; disable the others. Do not queue a stale prepared payload: the next command is explicitly initiated against the acknowledged snapshot. An unrelated tab keeps its own N and conflicts after another tab commits.

To avoid overwriting unsaved work, relation save is disabled while the main form is dirty or submitting; tell the editor to Save or Discard main changes first. Main save is disabled while the panel has an unsaved relation delta, requiring Save relations or Discard first. Relation draft and form dirty tracking are independent. After a successful relation save, reconcile only the authoritative accepted snapshot while no main edits exist; never clear unrelated dirty data. Main serializer omits category/subcategory from its payload in alternative A, so empty relation count placeholders or stale cached fields cannot disconnect or restore them. Relation panel sends ONLY the selected relation delta, not cached full-parent fields.

409 retains draft and baseline and locks writes pending explicit reload/review. 428 indicates missing session/integration failure, not a normal fall-through. 400 covers malformed token/input; 403 permission denial. No automatic retries. Unknown network outcome or success without valid revision metadata freezes the session for explicit reload (the server may have committed). Responses are associated with generation/request identity; late responses cannot regress or initialize another session. A successful explicit reload discards edits only after confirmation, creates a new generation and uses one coherent server snapshot. Arbitrary cache refetch is not reload consent.

### 5. Backend and request sequence

No new writable endpoint is required for B03. Search uses authenticated existing GET `/content-manager/relations/<uid>/<field>`; existing relation display uses GET `/content-manager/relations/<uid>/<documentId>/<field>`. Reuse their documented-in-source query/body contracts (_q, pagination, existing IDs, locale/status), sanitize labels through the existing controller, and never guess numeric IDs from labels. Search may read current target availability but must not advance the parent revision.

Save uses existing PUT `/content-manager/collection-types/api::solicitud-comercio.solicitud-comercio/<documentId>`, with `X-Private-Submission-Expected-Revision: N` and a minimal category/subcategory set/connect/disconnect payload in the installed document-service relation format. Public document IDs are transformed by the supported document helper; do not implement SQL relations or accept a target UID supplied by the client. Same request-context middleware and controlled document service as main saves apply. Existing Content Manager auth, conditional/field permission checks and sanitization remain before persistence. UI uses exported useDocumentRBAC/read-update field capabilities and target permission checks only for UX; server checks remain authoritative.

The controlled transaction compares original N in the actual UPDATE and increments once, applies validated relations with supported helpers, verifies invariants and commits; any failure rolls back parent/revision/relations. If category/subcategory permissions were revoked, fail rather than claim an association was saved after the field was silently stripped: compare requested scoped relation fields with authorized/sanitized command fields before dispatch, or surface a typed forbidden result. Do not weaken sanitization. Relation targets removed or invalid at commit fail validation/FK handling and roll back. Existing target D&P resolution remains Strapi's transform/validation semantics; do not add a publish permission requirement to merely select a draft unless current rules require it. Native target publishing stays in its native editor. No transaction spans target creation and parent association; a newly-created unlinked target is possible and is not auto-deleted.

Success returns authoritative revision in existing response meta, captured from the controlled result (no second latest query). A relation-only result need not expose private fields that normal sanitization hides. Direct parent query/update bypass rejection, revision overflow handling and future neutral privacy policy are unchanged from the approved prerequisite. No Feature017 behavior is added.

### 6. Compatibility matrix

| Capability | Proposed result / evidence / limitation |
|---|---|
| Read/select/change existing category | Retained through existing relation GET and controlled PUT; source-proven endpoints, isolated tests pending |
| Remove category | Required validation retained; invalid empty final relation rejected |
| Remove optional subcategory | Retained through supported relation delta, atomic revision increment |
| Create/edit/publish target | Native target editor retained, separate tab; automatic inline create-and-connect intentionally replaced by explicit selection/save |
| Native inline modal convenience | NOT equivalent; removed only from Commerce relation controls; requires human ratification |
| Nested private editor | Open full editor required where session ownership cannot be established; disclosed UX restriction |
| Components | Existing repeatable editing/validation/order unchanged; dirty main form blocks separate relation save |
| Media | Existing selector/upload behavior unchanged; parent attachment persists through main CAS; no new storage behavior |
| Permissions | Existing read/update/field/conditional checks and target permissions retained; permission revocation must not become silent success |
| D&P | Six parents non-D&P; two targets D&P retained, no automatic target publishing or slug identity |
| Public verified create | Unchanged; no expected revision required for CREATE; server initializes revision |
| Other content types | Configuration response unchanged byte-for-byte semantically; no action replacement in their normal editors |
| CA/ES/EN | New panel/error strings must cover all three locales within proposed component modules; no unrelated translations |

### 7. Exact proposed file impact — approval required, no allowlist edit now

Backend root: `../../../guiapineda-strapi`.
Existing files affected by B03 implementation:
- `src/admin/app.js` — reducer, scoped panel and controlled action registration.
- `src/admin/components/PrivateModerationImagePanel.jsx` — use the same session claim/baseline, no latest-revision refresh.
- `config/middlewares.js` — register scoped layout projection alongside concurrency middleware.
New files proposed for B03:
- `src/admin/components/PrivateSubmissionRelationsPanel.jsx` — permission-aware selectors/links/explicit relation save.
- `src/admin/privateSubmissionSession.js` — tab-local Redux reducer, session protocol and owned request utilities.
- `src/middlewares/private-submission-relations-layout.js` — exact-route Commerce layout projection.
Already allowed but not yet created files also involved:
- `src/admin/components/PrivateSubmissionSaveAction.jsx` — main save/session coordination and relation-field omission.
- `src/middlewares/private-submission-concurrency.js` — original header plus same-result response metadata/error transport.
- `src/services/private-submission-document-guard.js`, `private-submission-persistence.js`, `private-submission-write-policy.js` — existing approved CAS/authorization/relations design; no new B03 bypass.
No additional schema, target controller, migration or dependency is proposed. Remaining prerequisite files keep their prior scope.

Frontend root: `../..`.
Proposed isolated tests reuse already allowed `specs/controlled-private-submission-persistence/qa/admin-fixtures.test.mjs`, `qa/private-persistence.test.mjs` and `qa/fixture-support.mjs`; no new QA path needed. Only this report is changed now.

### 8. Required SDD amendments after ratification

SPEC FR02/FR03: retain relation operations, explicitly replace inline auto-connect with separate target editor and explicit parent association; document dirty-form and nested-editor constraints. PLAN/Admin contract: projection+panel+tab-local session, owned minimal PUT, no interception. TASKS: split T007/T008 into implementation/fixture coverage of layout exclusion, session, selector, permissions, main/moderation coordination and failure handling; preserve traceability rather than silently mark completed. ANALYZE: recheck FR01–FR07, B03 and scope after amended artifacts; previous PASS is not sufficient. Allowlist: add exactly the three proposed new B03 paths above, ratified by the user. Keep storage/publication tasks unchanged. No amendments applied in this execution.

### 9. Isolated acceptance tests and residual risks

Required before implementation readiness can become runtime PASS:
1. Projection fixtures for only Commerce, duplicate fields/empty rows, customized layouts, unknown shape, cache/304, nested editor, and every other UID unchanged. Both native create-and-connect triggers absent for the private editor.
2. Session fixtures: initial coherent N, background refetch ignored, N→N+1 main→N+2 relation, reverse ordering, stale moderation conflicts, local double-click/cross-control contention, navigation generations/late replies, two independent tabs.
3. Conflict and outcome fixtures: 409/428/400/403, no retries, network response loss, invalid success metadata, preserved draft, explicit reload confirmation.
4. Selector/controller doubles: pagination/search/existing IDs, required/optional cardinality, replacement/removal, revoked/conditional field permission, hidden labels, removed targets, D&P draft/published relation resolution, unknown field/target rejected.
5. Transaction fixtures: relation-only minimal body, one revision increment, no scalar overwrite, rollback on relation failure; every six-type main writer still strict. No real DB required.
6. UX/React fixtures: dirty-form gating in both directions, main serializer omission, matching snapshot initialization, successful form reconciliation, keyboard submission failing closed, other model actions untouched, unsaved-record handling and CA/ES/EN messages.
7. Component/Media regression fixtures, and source-static check that no generic upload/cleanup/schema changes occur.

Residual engineering risks: reliance on installed configuration response shape (pin/fixture/fail closed), correct initial form-to-response matching, permission sanitization of a minimal patch, D&P relation transformations, and UI reconciliation. These are mandatory verification criteria, not claimed test results. Runtime role/layout behavior is intentionally unknown because real data is prohibited. Native inline UX is knowingly different, not an unresolved equivalence claim.

Design findings: BLOCKER 0 / HIGH 0 / MEDIUM 0 for the proposed architecture conditional on explicit UX/scope ratification; implementation/QA evidence remains absent and B03 is not declared operationally closed. If ratification requires exact inline native-modal equivalence, this proposal does not meet it and B03 remains BLOCKER 1. Safe to implement now: NO.

Human decisions: ratify alternative A's explicit relation save, separate-tab target creation/editing, dirty-form gating and full-editor requirement; approve the three exact new paths and corresponding SDD amendments. Then perform the amended ANALYZE gate before any implementation. No permission to implement is inferred from receipt of this report.


## B03 ratification and ANALYZE outcome — 2026-10-19
Direction ratified for SDD only. SPEC/PLAN/TASKS/Admin contract and exact allowlist updated; three backend paths added for design, no code created. Current authoritative analysis-final.md reports SPEC PASS, PLAN FAIL, TASKS PASS, ANALYZE FAIL, B03 BLOCKED: B03-LAYOUT (stable supported configuration exclusion not proven) and B03-FORM (native Form reinitializes values independently of revision state). This supersedes the preceding conditional design PASS; it does not erase historical findings. BLOCKER2,HIGH0,MEDIUM0. No implementation QA or CONVERGE. Modified only spec.md, plan.md, tasks.md, contracts/admin-writers.md, allowlist.md, analysis-final.md and this qa-report.md. No product/data/storage changes.


## Two-blocker recovery, 2026-10-20
Focused read-only evaluation of A/B/C; new checks covered global addFields dispatch, alpha/unstable public hook status, native Form ownership and separate Admin page registration. A/B do not demonstrate both guarantees. Commerce-only owned editor C is study-only and would leave native Form exposure in the other five types. PLAN and analysis-final.md now distinguish rejected proposal from supported facts and human scope decisions. SPEC/contract/TASKS/allowlist unchanged; T020 remains blocking and no task completed. B03-LAYOUT BLOCKED, B03-FORM BLOCKED, BLOCKER2/HIGH0/MEDIUM0. Only plan.md, analysis-final.md and qa-report.md changed. No implementation, runtime QA, CONVERGE, DB/SQLite/hash/copy/stat, real storage/uploads, migrations/backfill, dependency, commit/push/deploy or Feature017 work.


## Controlled editor feasibility — 2026-10-20
Study only. Read all six schema JSONs and moderation/auth/native integration sources, never imported services or opened DB/storage. Important correction: schema Media fields are hidden for all six; no general Media editor replacement inferred. Moderation is Super Admin-only, whereas CM editing uses model/field/conditional permissions. Candidate A with six owned forms and safe native navigation reuse avoids native Form on its page, but supported permission/action parity and exhaustive native writer closure are not demonstrated. Feasibility FAIL against full proof criterion; two B03 blockers retained, HIGH0/MEDIUM0; no implementation readiness. Detailed inventory/candidates/files/tests/decisions recorded in analysis-final.md. Only these two reports changed; all ratified governing artifacts unchanged. No QA executed or new product file created.


## Final backend write boundary check — 2026-10-20
Source-only result FAIL; backend-only avenue expressly discarded under joint native Admin/original CAS/terminal privacy requirements. Confirmed internal compensation uses direct query builder and bypasses document middleware/lifecycle re-entry. Qualified prior reasoning: normal Document Service outer transaction can roll back that compensation; no committed live resurrection claimed or tested. No mandatory supported all-statement boundary found; rejecting unsafe writes breaks uncovered native flows and backend cannot reconstruct original editor N or preserve native browser drafts. B03-LAYOUT/B03-FORM still blocked,2BLOCKER/0HIGH/0MEDIUM. Only this report and analysis-final.md modified; all prohibited operations remain unperformed. No alternative investigation begun.


## Controlled Admin architecture decision — 2026-10-20
Documented one finite six-private-type module candidate, I/P/H operation matrix, proposed routes, field/action authorization requirements, owned draft protocol, backend native-writer closure obligations, exact proposed files and acceptance tests. Read installed permission-checker source: entity conditions, field sanitization and unstable_aliases prevent equating authentication/Super Admin with editing parity. No mechanism newly declared universally intercepting. Both B03 blockers retained (2/0/0); no readiness claim. Only analysis-final.md and qa-report.md updated; Constitution/SPEC/PLAN/TASKS/contracts/allowlist unchanged. No product code, DB/SQLite/storage/upload/migration/backfill/dependency/commit/push/deploy or017 activity.


## Controlled Admin final acceptance gate — 2026-10-20

Source-only design acceptance: **GATE FAIL / REJECT ARCHITECTURE under current design and restrictions**. Writer matrix separates existing internal create, CM main/secondary/clone/bulk, moderation, DS/QE/components/relations/Media, compensation, unverified maintenance paths and proposed commands. Exhaustive closure is not demonstrated; internal snapshot restoration bypasses DS/lifecycle re-entry, with normal DS outer-transaction rollback qualification retained. No live resurrection claim or runtime QA. Permission mechanisms reconstructed from CM routes/controllers/permission-checker and custom auth: current role assignments not accessed; supported action/field/entity-condition/relations equivalence not proven. No privilege changes. Both existing B03 blockers retained; SPEC PASS/PLAN FAIL/TASKS PASS/ANALYZE FAIL, BLOCKER2/HIGH0/MEDIUM0, safe to implement NO. No new alternative opened. Only analysis-final.md and qa-report.md edited; governance and application sources unchanged. SQLite, real DB/storage/upload, migrations, backfill, dependencies, commit, push, deployment and Feature017: NO.


## Controlled persistence scope reassessment — 2026-10-20

Analysis only: reviewed all21FR,4SC,26tasks, current persistence/storage/rollout contracts and017 ratified privacy dependencies. Classified per-requirement B03/CAS dependence, bounded independent verification and partial-release risks in analysis-final.md. Distinguish original-editor conflict protection, universal terminal PII monotonicity, and017 cleanup: cleanup requires monotonicity; revision CAS alone is insufficient. Physical storage/pure-state verification is potentially separable after a human scope/authorization decision; integrated Millorem approval/ledger/publication remains coupled. No independent safe product increment demonstrated under current contracts. Recommend formal suspension of prerequisite implementation, retaining both blockers and017 block, without suspending unrelated GUIAPINEDA development. Suspension is proposed, not enacted. Prior gates unchanged: SPEC PASS/PLAN FAIL/TASKS PASS/ANALYZE FAIL;2BLOCKER/0HIGH/0MEDIUM; safe to implement NO. Only two reports edited; no tests/code/schema/contract/allowlist changes, data/storage access, migration/backfill, dependency, commit/push/deploy or017 implementation.


## Formal suspension registration — 2026-10-20

Human ratification recorded in PLAN using the existing SDD status convention; SPEC/TASKS and current analysis point to it. The former authorization proposal is explicitly historical. Both blockers and all requirements retained; no completed tasks, new technical investigation, implementation QA or CONVERGE. Feature017 remains blocked without edits to its artifacts; unrelated project work is not globally blocked. Reactivation distinguishes permission to reassess from later implementation authorization and requires new evidence, supported writer/permission/form guarantees, consistent SDD and passing gates. Six documentation files changed; no new file. Constitution, functional requirements, contracts, allowlist, application code and backend remain unchanged. No SQLite/DB/storage/upload, migration/backfill, dependency, commit/push/deployment or017 work.
