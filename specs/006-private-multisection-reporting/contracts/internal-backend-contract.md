# Contract: Function to private Strapi reporting service

## Transport

The existing authenticated internal route receives section `content_report`:

`POST /api/internal/submissions/content_report`

The existing bearer middleware and controller defense-in-depth check remain unchanged. The Function
transport sends multipart with one `payload` JSON value and no files. Unknown sections remain
rejected by the existing allowlist/service behavior.

## Exact editorial payload

Allowed keys are:

```text
tipo_contenido
contenido_document_id
motivo
explicacion (optional/conditional)
idioma_solicitud
```

Any additional key—including email, token, slug, state, timestamps or personal/platform data—and
any request file rejects the request before lookup/create.

## Dispatch isolation

The internal controller dispatches explicitly:

```text
communicat_report -> existing createInternalCommunicatReport (unchanged)
content_report    -> new createInternalContentReport
all other allowed sections -> existing createInternalSubmission (unchanged)
```

No fallback may interpret an unknown report type as a generic participation request.

## Authoritative lookup

The service maps the validated discriminator to exactly one UID:

```text
agenda   -> api::agenda.agenda
veu      -> api::veu.veu
millora  -> api::millora.millora
comercio -> api::comercio.comercio
```

It queries by exact `documentId` and published status. A valid ID under another UID is rejected.
Agenda, Veu and Millora require a nonblank slug. Commerce additionally requires `activo === true`.
It reads relation identifiers only, resolves the category and optional subcategory independently by
`documentId` with published status, requires `activa === true` for each, and requires any resolved
subcategory to belong to the resolved category. The service derives the commerce slug only after
all checks pass.

## Create projection

The only write is:

```json
{
  "tipo_contenido": "comercio",
  "contenido_document_id": "stable-strapi-document-id",
  "contenido_slug": "current-server-derived-slug",
  "motivo": "privacidad_datos",
  "explicacion": "Optional private context",
  "idioma_solicitud": "es",
  "estado_denuncia": "pendiente"
}
```

The target is `api::denuncia-contenido.denuncia-contenido`. `explicacion` is omitted when absent.
No public content Documents Service `create`, `update`, `delete`, `publish` or `unpublish` operation
is allowed.

## Service result

| Result | Service shape | Controller status |
|---|---|---:|
| accepted | `{ ok: true }` | 201 |
| invalid fields/type/files | `{ ok: false, status: 400, reason: "report:invalid" }` | 400 |
| missing/nonpublic/inactive/cross-type | `{ ok: false, status: 404, reason: "report:not-found" }` | 404 |
| Documents Service unavailable/create failure | throw or unavailable result without sensitive data | 503 |

The controller logs only a fixed section-labelled failure, never payload, email, explanation,
identifier or filename.

## Persistence/access contract

`denuncia-contenido` has schema only: no Content API route, controller or service. Content Manager
and its RBAC provide editorial read/state-edit access. Existing `denuncia-comunicat` rows, schema and
service are not migrated, read or rewritten.

## Atomicity invariant

All validation and lookup precede the single create. A rejection creates zero rows. A create error
does not return success. Each accepted call creates one independent row, even if another report has
the same type, ID, reason and language.
