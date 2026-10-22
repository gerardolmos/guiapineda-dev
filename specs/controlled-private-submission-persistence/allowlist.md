# Exact future local implementation allowlist

Human authorization required. No implicit wildcard/directory grant. Backend paths relative to guiapineda-strapi; SDD/QA relative to guiapineda-astro. Schema types only additive revision/operation; no017 nombre_contacto. No package, lockfile, env, node_modules, cleaner or global upload plugin edits.

## Backend
<!-- B03 design ratification 2026-10-19: only the following three paths added; no code creation authorized. -->
- src/admin/components/PrivateSubmissionRelationsPanel.jsx
- src/admin/privateSubmissionSession.js
- src/middlewares/private-submission-relations-layout.js
- src/api/solicitud-agenda/content-types/solicitud-agenda/schema.json
- src/api/solicitud-comunicat/content-types/solicitud-comunicat/schema.json
- src/api/solicitud-veu/content-types/solicitud-veu/schema.json
- src/api/solicitud-millora/content-types/solicitud-millora/schema.json
- src/api/solicitud-foto-mes/content-types/solicitud-foto-mes/schema.json
- src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json
- src/api/millorem-publication-operation/content-types/millorem-publication-operation/schema.json
- types/generated/contentTypes.d.ts
- src/index.js
- config/middlewares.js
- config/millorem-publication.js
- src/middlewares/private-submission-concurrency.js
- src/middlewares/millorem-owned-media.js
- src/services/private-submission-persistence.js
- src/services/private-submission-write-policy.js
- src/services/private-submission-document-guard.js
- src/services/commerce-submission-write-guard.js
- src/services/internal-submission-request.js
- src/services/submission-moderation-lifecycle.js
- src/services/millora-publication.js
- src/services/millorem-publication-operation.js
- src/services/millorem-publication-storage.js
- src/services/millorem-publication-document-guard.js
- src/admin/app.js
- src/admin/components/PrivateSubmissionSaveAction.jsx
- src/admin/components/PrivateModerationImagePanel.jsx
- src/api/internal-moderation/controllers/internal-moderation-lifecycle.js
- src/api/internal-moderation/routes/internal-moderation.js

## Frontend SDD/isolated QA
- specs/controlled-private-submission-persistence/spec.md
- specs/controlled-private-submission-persistence/plan.md
- specs/controlled-private-submission-persistence/data-model.md
- specs/controlled-private-submission-persistence/research.md
- specs/controlled-private-submission-persistence/contracts/storage-publication.md
- specs/controlled-private-submission-persistence/contracts/admin-writers.md
- specs/controlled-private-submission-persistence/rollout-backfill-design.md
- specs/controlled-private-submission-persistence/quickstart.md
- specs/controlled-private-submission-persistence/allowlist.md
- specs/controlled-private-submission-persistence/tasks.md
- specs/controlled-private-submission-persistence/analysis-final.md
- specs/controlled-private-submission-persistence/authorization-package.md
- specs/controlled-private-submission-persistence/qa-report.md
- specs/controlled-private-submission-persistence/converge.md
- specs/controlled-private-submission-persistence/qa/private-persistence.test.mjs
- specs/controlled-private-submission-persistence/qa/millorem-storage.test.mjs
- specs/controlled-private-submission-persistence/qa/millorem-publication.test.mjs
- specs/controlled-private-submission-persistence/qa/admin-fixtures.test.mjs
- specs/controlled-private-submission-persistence/qa/rollout.test.mjs
- specs/controlled-private-submission-persistence/qa/fixture-support.mjs

No migration/backfill script in local allowlist; operational procedure is documentation only. Historical recovery files preserved, not rewritten by implementation. Storage temps in future QA only newly created isolated temporary directory, never project uploads/quarantine/DB.
