# Feature 017 — Terminal privacy invariants + Commerce scalar private-data cleanup

Date: 2026-10-18. Human-ratified split. SDD ONLY; no implementation authorization.

## Scope and repositories
SDD lives in guiapineda-astro; future product changes belong to guiapineda-strapi. Astro public forms and Functions retain their current contracts. No new infrastructure, dependencies, public routes or languages. CA/ES/EN public behavior remains equivalent.

Only this document, plan.md, tasks.md, data-model.md, quickstart.md, contracts/terminal-scalars.md and checklists/requirements.md are active design documents. Historical reports and contracts retain evidence, not requirements. Deferred work is exclusively tracked in deferred-follow-up.md; no new numbered features.

## Stories and acceptance
US1 (P1): As moderator, resolving any of the six request types leaves participation email null and prevents subsequent restoration through permitted writers. Test both terminal states, direct/query/document/admin writes, retries and concurrent stale writes. An unauthorized reopen must fail.
US2 (P1): Rejecting Commerce removes private applicant contact scalars while preserving editorial data and all media references. Approving Commerce removes participation email only, preserving applicant name/phone and the materials needed to finish the public listing; no automatic publication.
US3 (P2): Admin displays active, rejected-cleaned and approved requests without null exceptions and accurately explains scalar cleanup and retained private images. Existing roles, errors and actions remain intact.

## Functional requirements
- FR-01: For Agenda, Veus, Comunicats, Foto del mes, Millorem and Commerce, aprovat/rebutjat implies email_contacto=null on covered application writes. Terminal transitions, subsequent updates, creation/import-like permitted writes and bulk operations must not bypass this. Unsafe operations fail explicitly; no recursive corrective writes or false success.
- FR-02: Commerce rejection sets email_contacto, nombre_contacto and telefono_contacto to null in the terminal scalar write. Retries preserve null; stale editors cannot restore rejected private contact values.
- FR-03: Commerce approval preserves nombre_contacto, telefono_contacto, business fields, private media references and existing materials. Only participation email is cleared; public business email is separate.
- FR-04: The only proposed schema delta removes required from Commerce nombre_contacto, retaining private/maxLength120. imagen_principal_quarantena_id stays required; every media reference and blob is retained by the new Commerce rejection logic.
- FR-05: Public Function and authenticated internal parser keep required applicant name/email, consent and principal image, existing limits, verification and authorization. Nullable storage does not allow an incomplete public submission or an active applicant name to be cleared through Admin.
- FR-06: Admin changes are minimal: rejected null scalars display as empty, active values remain, approved values remain; copy distinguishes contact cleanup from retained images. No redesign or fabricated crash claim.
- FR-07: New logs contain fixed reason codes only; no email, applicant name/phone, payload, private media IDs, paths or raw errors. Existing unrelated logging is not refactored.
- FR-08: SDD-only execution: no product/schema/types edits, DB/SQLite/data access, application bootstrap, migration, commit, push or deployment. Future tests use synthetic in-memory doubles and isolated UI fixtures; nothing reads real backend data.

## Success criteria and edges
SC-01: FR-01/02 hold across all six sections and both terminal states, including adverse interleavings, stale writes, bulk writes, failure and retry. No pre-read is accepted as atomic enforcement.
SC-02: FR-03/04 preserve every Commerce editorial/media field, including null optional refs and empty gallery; zero new physical media deletion calls.
SC-03: FR-05/06/07 pass isolated validation and active/rejected/approved Admin fixtures; CA/ES/EN submission contracts unchanged.
SC-04: Scope audit confirms FR-08; ANALYZE has zero BLOCKER/HIGH before authorizing IMPLEMENT.

Existing historical records are not batch-cleaned; a supported write to a terminal record must enforce the invariant. Unknown physical schema remains UNCERTAIN without data inspection. Missing/legacy media is retained and handled by existing preview errors; no repair or orphan creation.

## Deferred / follow-up features
All inactivity expiration, activity timestamps, historical initialization, cron, ownership, locks and cleaner concurrency are outside this feature. See deferred-follow-up.md. Their removal is a scope decision, not evidence that those problems are solved.

## B02 recovery addendum —2026-10-18
Authoritative writer/strategy audit: contracts/b02-writers-and-strategies.md; required QA: contracts/b02-qa.md. Terminal privacy must be monotonic, with one sanitizer policy for all covered scalars. Existing Document Service transactions are acknowledged; neither their presence nor a pre-read lifecycle proves safety. Technical generic reopen exists and must be denied; no supported reopen flow is added. Strong per-write atomicity REQUIRED; candidate CAS integration is incomplete. T001 remains unresolved; do not implement later tasks. No deferred media/expiry requirements reintroduced.

## Monotonic privacy clarification
Covered deleted values cannot be restored by any permitted later write, including a hypothetical reopen. Feature017 adds no supported reopen transition; generic bypasses must be denied. Any future authorized reopen preserves deleted email and Commerce applicant contact values and does not reacquire them. Concrete conditional-write design and remaining integration gap: contracts/conditional-persistence.md.
