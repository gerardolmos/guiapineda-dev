# Implementation plan — reduced scope, blocked at persistence design

Stack unchanged: Astro public UI/Functions, Strapi backend, existing database abstraction. SDD only in this execution. Product plan is NOT ready for implementation (B02).

## Constitution check
I/II: editorial flow/static architecture unchanged. III: strict verification/private terminal invariants. IV: preserve valuable data; no DB, bootstrap or migration. V: no new infra, locks or dependencies. VI: CA/ES/EN public contracts unchanged. VII: frontend hosts SDD, backend owns future product edits. Pretending a pre-read predicate is atomic would violate III/IV; the gate remains closed.

## Design and phases
1. Resolve B02 in contracts/terminal-scalars.md using installed-code evidence and deterministic synthetic schedules, covering Query Engine/Document Service/Admin plus rollback and bulk behavior. updateMany is only a candidate primitive, not a complete solution. No new media coordination.
2. Once ANALYZE passes and user authorizes IMPLEMENT: minimal Commerce schema delta (nombre_contacto only), strict public/internal validation unchanged, active-name and terminal-scalar enforcement integrated with the existing Commerce guard.
3. Apply rejection scalar nulls and approval preservation in submission-moderation-lifecycle.js. Keep all Commerce refs/assets and existing behavior of the other five flows. Shared email enforcement must cover their normal creation/moderation/Admin paths without duplicating six hooks.
4. Minimal Admin scalar copy/render compatibility; isolated fixtures and no real data access. New log codes only.
5. Cross-artifact analysis and isolated QA gates before CONVERGE. No commit/deploy implied.

## Prospective files (not an authorized implementation allowlist yet)
Backend: src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json; src/services/commerce-submission-write-guard.js; src/services/submission-moderation-lifecycle.js; src/admin/components/PrivateModerationImagePanel.jsx. A shared persistence enforcement module and its registration location remain contingent on B02. Do not infer a working subscriber contract. Generated types only if needed by the eventual approved schema change and without bootstrap.
Frontend product: none; current Function/form validators are regression inputs, not planned edits. New isolated QA artifacts belong under specs/017-private-data-lifecycle-retention/ only after implementation authorization.

## Data and migration
See data-model.md. Only nombre_contacto needs newly nullable storage. Principal ref nullability is unnecessary and removed from schema proposal. Logical broadening needs no conceptual rewrite of valid existing records; physical migration UNCERTAIN. No inspection or DDL.

## Admin compatibility and verification
Design PASS; not executable QA PASS. Active values present, rejected contact scalars null with media retained, approved materials unchanged. Test existing404/action errors/retry and role restrictions. No UI redesign. quickstart.md defines required future isolated checks.

## Deferred
See deferred-follow-up.md. No expiration, activity field, cron, historical cleanup, new physical media deletion, ownership or cleaner tasks. Old blockers moved there and not counted against017. B02 is an independent current scalar-persistence blocker.

## B02 recovery addendum —2026-10-18
Authoritative writer/strategy audit: contracts/b02-writers-and-strategies.md; required QA: contracts/b02-qa.md. Terminal privacy must be monotonic, with one sanitizer policy for all covered scalars. Existing Document Service transactions are acknowledged; neither their presence nor a pre-read lifecycle proves safety. Technical generic reopen exists and must be denied; no supported reopen flow is added. Strong per-write atomicity REQUIRED; candidate CAS integration is incomplete. T001 remains unresolved; do not implement later tasks. No deferred media/expiry requirements reintroduced.

## Conditional persistence revision
See contracts/conditional-persistence.md for the gate, exact CAS key/primitive, pure sanitizer, lifecycle rejection guard, Admin conflict behavior, reopen-preservation policy, transition/failure/QA matrices and complete writer classification. This supersedes the tentative state-only CAS candidate. B02 is now specifically the relation/internal-compensation path; no broad implementation permission or false PASS. Scalar CAS does not require a new transaction, but its integration is unresolved.
