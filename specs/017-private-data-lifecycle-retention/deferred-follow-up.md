# DEFERRED / FOLLOW-UP FEATURES — conceptual backlog only

Human split ratified 2026-10-18. No numbered specs/features created. These are removed from Feature017 requirements, tasks and failure counts; they are NOT solved globally.

## FOLLOW-UP A: private-media-ownership-cleanup
Resolve exclusive ownership or legitimate shared refs, all writers vs cleaner across processes, create/publish reservations, delete/recheck races, idempotency and safe physical cleanup. Historical evidence: contracts/media-concurrency.md and contracts/terminal-cleanup.md. Existing Map moderation lock is not a global guarantee. Commerce references/blobs are retained by017 so later cleanup can identify them. Principal ref stays required; no clearing and no orphan creation. No locks or cleaner redesign in017. Historical H01 removed from017, still unresolved here.

## FOLLOW-UP B: inactive-submission-expiration
Retain product decision:60 days of inactivity. Design semantic activity clock (last_activity_at or justified alternative), historical initialization, automation/cron, expiry representation and future legal hold exception. Existing updatedAt is technical and insufficient. No new activity schema or historical cleanup in017. Historical B01 activity removed from017, still unresolved here.

## Traceability
Pre-split spec/plan/tasks/model/checklist/quickstart preserved in history/pre-split/. Original analyses and contracts remain marked historical. Human ratification accepted the prior email-design conclusion; subsequent installed-code inspection found the conditional predicate is lost in actual single-row UPDATE, now B02 in contracts/terminal-scalars.md. This does not reintroduce either deferred scope and cannot be hidden by the split.
