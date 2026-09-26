# Quickstart Validation: Private Submission Content API Hardening

## Purpose

Validate that the inherited private Content API is absent while internal submission, Documents
Service, Content Manager, moderation, public content and other private flows remain intact. The
harness already exists from partial IMPLEMENT; this guide governs its pending update and execution
from T020 and does not itself execute any command.

## Current Workflow State

- The pre-IMPLEMENT baseline contained the standard Agenda/Veus routers, controllers and services
  and exposed the inherited Content API surface documented in `plan.md`.
- T001–T019 are completed. The current working tree has exactly those six standard factories
  deleted and the QA harness created.
- T020–T034 remain pending. The harness must be updated and executed from T020 according to Option A.
- IMPLEMENT is paused for SDD reconciliation and analysis. If the subsequent ANALYZE is clean,
  IMPLEMENT resumes at T020; T001–T019 are not reopened.
- No commit, push or deploy has occurred.

## Safety Gates

Before any runtime validation:

1. Confirm both repository diffs match the closed allowlist in `plan.md`.
2. Confirm no Strapi process exists and relevant local ports are free.
3. Record the real backend `.tmp/data.db` SHA-256, size, mtime and absence/presence of
   `-wal`, `-shm` and `-journal` without opening it through SQLite.
4. Require the harness to create an OS `mkdtemp` directory outside both repositories.
5. Require the resolved Strapi database filename to equal the new temporary path and differ from
   the real `.tmp/data.db` before calling `app.load()`.
6. Require private uploads, secrets, host and port to use controlled temporary/synthetic values.
7. Disable cron in the in-memory app configuration before load.
8. Do not execute `npm run develop`, `npm run start`, a real cron or any external service.

Failure of any gate stops runtime QA before Strapi loads.

## Static Validation

From `guiapineda-strapi`:

```sh
node --check scripts/qa/private-submission-content-api-hardening-qa.mjs
```

Then verify the intended deletion set and no schema/config/package change:

```sh
git diff --check
git status --short
git diff -- src/api/solicitud-agenda src/api/solicitud-veu
```

Expected: exactly six deleted factory files, both schemas unchanged, and one new QA harness.

## Persistent Harness

The harness exists at `scripts/qa/private-submission-content-api-hardening-qa.mjs`; its Option A
expectations and auxiliary control-route assertions remain pending update and execution from T020.

From `guiapineda-strapi`:

```sh
node scripts/qa/private-submission-content-api-hardening-qa.mjs
```

The harness must fail on the first unmet assertion and print one normalized result for every label
QA01–QA22 before a final PASS. It must create/load/listen/destroy Strapi programmatically against
temporary state; it must not invoke an npm lifecycle command.

### Required matrix

| ID | Validation | Expected |
|---|---|---|
| QA01 | `GET /api/solicitudes-agenda` | Natural `404`; no private metadata |
| QA02 | `POST /api/solicitudes-agenda` | Natural `405`; `Allow: HEAD, GET`; zero writes |
| QA03 | `GET /api/solicitudes-agenda/:id` | Natural `404`; no private metadata |
| QA04 | `PUT /api/solicitudes-agenda/:id` | Natural `405`; `Allow: HEAD, GET`; zero updates |
| QA05 | `DELETE /api/solicitudes-agenda/:id` | Natural `405`; `Allow: HEAD, GET`; zero deletes |
| QA06 | `GET /api/solicitudes-veu` | Natural `404`; no private metadata |
| QA07 | `POST /api/solicitudes-veu` | Natural `405`; `Allow: HEAD, GET`; zero writes |
| QA08 | `GET /api/solicitudes-veu/:id` | Natural `404`; no private metadata |
| QA09 | `PUT /api/solicitudes-veu/:id` | Natural `405`; `Allow: HEAD, GET`; zero updates |
| QA10 | `DELETE /api/solicitudes-veu/:id` | Natural `405`; `Allow: HEAD, GET`; zero deletes |
| QA11 | Internal Agenda route available/authenticated | Present and server-to-server authenticated |
| QA12 | Internal Veu route available/authenticated | Present and server-to-server authenticated |
| QA13 | Internal Agenda creation uses Documents Service | Created in temp DB as `pendent` |
| QA14 | Internal Veu creation uses Documents Service | Created in temp DB as `pendent` |
| QA15 | Agenda moderation compatible | Existing internal route/service remains compatible with temp document |
| QA16 | Veu moderation compatible | Existing internal route/service remains compatible with temp document |
| QA17 | Content Manager retains both content-types | Plugin resolves both retained content-types |
| QA18 | Public Agenda unchanged | Route signature/content count unchanged; no automatic publication |
| QA19 | Public Veu unchanged | Route signature/content count unchanged; no automatic publication |
| QA20 | Comunicats, Millorem, Foto del Mes and Comercio unchanged | Schema, registry and behavior fingerprints unchanged |
| QA21 | CA/ES/EN neutral | Equivalent Agenda/Veu fixtures receive identical privacy/state behavior |
| QA22 | Schemas/types and real SQLite unchanged | Protected fingerprints and SQLite filesystem gates unchanged; real SQLite never connected by app |

### Auxiliary control-route evidence

Without registering any route, the harness must use
`/api/feature008-definitely-nonexistent` as a synthetic control and verify:

- `GET` returns `404`;
- `POST`, `PUT` and `DELETE` return the same natural `405` as Agenda/Veus;
- each `405` has exactly `Allow: HEAD, GET`;
- no request changes persistent counts or states.

The control is auxiliary evidence for QA01–QA10, not QA23 or a production feature. A `405` alone is
never sufficient: PASS also requires the six factories deleted, the ten inherited signatures absent
from the real route map, no alias/shadow route and zero persistent effects. The harness must inspect
real responses and must not normalize them.

## Runtime Isolation Contract

The harness must:

- create the app using the installed `createStrapi` factory;
- set cron disabled, host `127.0.0.1` and port `0` before `load()`;
- set `DATABASE_FILENAME` so `config/database.js` resolves to the temporary DB;
- set `GUIAPINEDA_PRIVATE_UPLOAD_DIR` inside the same temporary root;
- use synthetic app/internal secrets and suppress telemetry/update checks;
- call `app.server.listen(0, '127.0.0.1', ...)`, discover the assigned port and use only loopback
  `fetch` calls;
- query created temp documents directly through Documents Service;
- compare public Agenda/Veu counts before and after internal submissions;
- always call `app.destroy()` and delete the temporary root in `finally`;
- verify the port closed, no process remains and Git gained no runtime artifacts.

## Determinism

Run the same harness a second time:

```sh
node scripts/qa/private-submission-content-api-hardening-qa.mjs
```

Expected: the same normalized QA01–QA22 result. Temporary identifiers, paths, ports and timestamps
must not appear in the normalized comparison.

## Supplementary Existing Regressions

From `guiapineda-astro`:

```sh
node scripts/qa/commerce-submission-qa.mjs
node scripts/qa/multisection-reporting-qa.mjs
```

Expected: both existing harnesses PASS without modification.

## Final Scope Audit

From both repositories:

```sh
git diff --check
git status --short --branch
```

Confirm:

- backend changes are exactly six deletions plus the new harness;
- frontend changes remain only Feature 008 SDD;
- no schema, generated type, config, permission, package, lockfile or frontend functional file changed;
- real SQLite checksum/metadata/sidecars equal the preflight snapshot;
- no temporary database, upload, log, process or open port remains;
- no commit, push, deployment or infrastructure activation occurred during IMPLEMENT unless a later
  explicit authorization changes that rule.

## Acceptance Result

Feature 008 can pass IMPLEMENT only when all QA01–QA22 cases, the deterministic repeat, both
supplementary regressions and the final scope audit pass. No predeployment deferral is required:
the complete contract can be demonstrated locally with isolated temporary state.
