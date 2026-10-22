# Reduced data model — design only

| Commerce field | Active | Rejected | Approved | Schema delta |
|---|---|---|---|---|
| email_contacto | verified participation email | null | null | none, already optional/private |
| nombre_contacto | required at entry; retain active | null | preserve | remove required only; retain private/maxLength120 |
| telefono_contacto | optional applicant phone | null | preserve | none, optional/private/maxLength30 |
| telefono / whatsapp / email | business/editorial contact | preserve | preserve | none |
| imagen_principal_quarantena_id | preserve | preserve | preserve | NONE; still required |
| logo_quarantena_id / galeria_quarantena_ids | preserve | preserve | preserve | none |
| private/public Media relations, business fields, consent, audit | existing behavior | preserve except normal resolution audit | preserve except normal resolution audit | none |

All six request types: participation email null in aprovat/rebutjat; no other section's applicant-name schema or cleanup changes. No new state, field, table or activity schema.

Evidence: CommerceSignupFlow.astro:5600 and :5617 send distinct telefono and telefono_contacto; applicant section describes contact during review. Backend solicitud-comercio/schema.json:142-158 marks applicant fields private. internal-submission-request.js:294-306 independently validates business and applicant contacts. resolveCommerceUnlocked:899-941 terminates review without creating a public listing. Thus rejected telefono_contacto has no remaining review purpose in the covered flow; public telefono is preserved. Approved private contacts are preserved for editorial completion. No claim about unknown external workflows.

Physical migration: UNCERTAIN. Removing required broadens logical accepted values and does not conceptually require transforming existing valid non-null records. Installed schema generator does not derive string-column not-null directly from this validator flag. Actual records/DDL were not inspected, so compliance of every existing record or need for physical DDL cannot be certified. No migration or startup is authorized; if future startup proposes DDL, stop under constitution IV.
