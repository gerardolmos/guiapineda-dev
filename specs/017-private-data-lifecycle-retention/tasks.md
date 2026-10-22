# Tasks — Feature017 reduced scope

All tasks pending. SDD recovery generated this dependency-ordered list; it is not IMPLEMENT authorization. T001 is a design gate, T002–T007 are suspended future implementation/QA tasks until B02 is resolved, ANALYZE passes and the user authorizes implementation.

- [ ] T001 [US1] Resolve actual-write atomicity and relation rollback across six writers in contracts/terminal-scalars.md and plan.md (FR-01/02, SC-01). Validate deterministic in-memory stale-write/bulk/failure schedules; no DB. Name exact future enforcement files before unblocking T002.
- [ ] T002 [US2] After T001 and authorization, remove only required from backend src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json nombre_contacto; preserve principal ref and private/limits. Verify unchanged strict public/internal parsing and active-name guard in src/services/commerce-submission-write-guard.js (FR-04/05, SC-02/03).
- [ ] T003 [US1] After T002, implement the T001-approved shared enforcement in its then-explicit backend paths; cover all six UIDs and reject unsafe operations without recursive writes or PII logging (FR-01/07, SC-01).
- [ ] T004 [US2] After T003, update backend src/services/submission-moderation-lifecycle.js and src/services/commerce-submission-write-guard.js: rejection clears three private scalars, approval preserves applicant name/phone and editorial/media materials, keep refs/assets (FR-02/03/04/07, SC-01/02).
- [ ] T005 [US3] After T004, minimal backend src/admin/components/PrivateModerationImagePanel.jsx scalar-cleanup copy and any proven null-render fix only; preserve image-retention statement and action permissions (FR-06, SC-03).
- [ ] T006 After T005, add isolated synthetic QA under this feature: six-section terminal enforcement, stale edits/rollback/bulk, strict Commerce input, null Admin active/rejected/approved fixtures, preserved media/public fields, CA/ES/EN contract parity and PII-free new logs (FR-01–07, SC-01–03). Do not bootstrap Strapi or access files/data behind the real quarantine/DB.
- [ ] T007 After T006, record future QA and CONVERGE evidence under this feature; verify diff allowlist, no schema delta beyond name, no dependencies/env/media/expiry changes, no data access, and no commit/push/deploy without separate authorization (FR-08, SC-04).

No parallel markers: persistence design gates all product work. No task for either deferred follow-up. T001 is deliberately unresolved, so this list is complete as a gated recovery backlog, not a ready implementation task set.

## B02 recovery addendum —2026-10-18
Authoritative writer/strategy audit: contracts/b02-writers-and-strategies.md; required QA: contracts/b02-qa.md. Terminal privacy must be monotonic, with one sanitizer policy for all covered scalars. Existing Document Service transactions are acknowledged; neither their presence nor a pre-read lifecycle proves safety. Technical generic reopen exists and must be denied; no supported reopen flow is added. Strong per-write atomicity REQUIRED; candidate CAS integration is incomplete. T001 remains unresolved; do not implement later tasks. No deferred media/expiry requirements reintroduced.

## T001 conditional-persistence refinement
T001 must resolve RELATION WRITE / INTERNAL COMPENSATION routing before T002. Mapping to concrete contract: gate+CAS+sanitizer+backstop→T003; transition/reopen/failure behavior→T003/T004; Admin stale conflict→T005; strict-create→T002/T006;22 QA cases→T006; scope gate→T007. No orphan design item. Exact relation adapter remains undefined; tasks are NOT implementation-ready. Do not substitute blanket loss of legitimate relation editing for this task.
