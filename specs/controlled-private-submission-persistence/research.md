# Final source research and decisions

Historical evidence remains in history/pre-storage-closure and prior recovery reports. Current source references:
- @strapi/database/dist/index.js:56-96 + transaction-context.js: supported callback transaction, nested reuse, throw→outer rollback. query/query-builder.js:464 ambient context.
- database/entity-manager/index.js:279-325 parent snapshot compensation;334-354 conditional updateMany avoids it;604+ relations identifier-only. entity-repository.js:93-103 safe transactional updateRelations.
- types/modules/documents/component-extension.d.ts: exposed middleware component helpers. core/entries.js entity validation/component sequencing. Public/document ID transform through documents.utils.transformData.
- content-manager.mjs addDocumentAction and core document-service middleware-manager support scoped Admin/server routing; requestContext typed on Strapi.
- native Node link→POSIX mapping in installed @types/node; SDK link(2) atomic creation,EEXIST,EXDEV. SDK fsync(2) power-loss limits. Research-agent independent read-only review confirmed protocol conditions. No filesystem calls executed.
- upload provider-local direct writeFile/createWriteStream; Upload randomSuffix and provider-first/add-second. New authorized adapter avoids that path exclusively for Millorem. upload file schema documents required metadata; direct DB create/receipt in one transaction avoids Media ambiguity.
- private-submission-image-cleanup scans quarantine only; retained source ref protects Q. Canonical mp_hash.webp under uploads outside its namespace. No cleaner edit necessary.
- public Millora draftAndPublish true; draft→publish copies entries, so do not place physically unique source field on both rows. Separate non-draft ledger unique source key selects canonical document.
Decisions: temp+atomic hardlink over rename-overwrite or direct canonical wx; SHA256 integrity over size-only; unique ledger CAS over in-memory locks; canonical Media receipt same commit over filename heuristic; retained source/private refs and immutable canonical over destructive compensation; conservative conflict for source-image changes over automatic overwrite of public edits. No new dependencies.
