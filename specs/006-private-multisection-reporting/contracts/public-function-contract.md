# Contract: Browser to content-report Function

## Endpoint

`POST /api/submissions/content-report`

Content type is bounded `multipart/form-data`. JSON and every uploaded file are rejected. Normal
detail loading never calls this endpoint.

## Exact request fields

| Field | Cardinality | Contract |
|---|---:|---|
| `tipo_contenido` | 1 | `agenda \| veu \| millora \| comercio` |
| `contenido_document_id` | 1 | trimmed string, 1–128 characters |
| `motivo` | 1 | exact five-value reason enum |
| `explicacion` | 0..1 | trimmed string, max 1,000; required and nonblank for `otro` |
| `idioma_solicitud` | 1 | `ca \| es \| en` |
| `email_contacto` | 1 | valid normalized email, max 180; verification use only |
| `email_verification_token` | 1 | opaque bounded token accepted only by existing consumer |
| `bot-field` | 0..1 | must be empty |

Duplicate fields, unknown fields, `contenido_slug`, state/timestamp inputs and files are invalid.
The request body ceiling is 16 KiB, matching the bounded feature 003 report pattern, and must be
asserted by QA.

## Processing order

1. Enforce method, media type and bounded parse.
2. Reject files, duplicate/unknown fields and honeypot.
3. Validate every deterministic field and construct a fresh payload.
4. Consume the one-time token with normalized email and scope `content-report`.
5. Discard verification data and call the internal transport with section `content_report`.
6. Return success only after an accepted internal response.

The platform rate-limit declaration uses the existing temporary `ip`/`domain` pattern. Application
code does not read, log into the report or persist the IP.

## Internal payload projection

```json
{
  "tipo_contenido": "agenda",
  "contenido_document_id": "stable-strapi-document-id",
  "motivo": "informacion_falsa",
  "explicacion": "Optional private context",
  "idioma_solicitud": "ca"
}
```

`explicacion` is omitted when blank and optional. No email, token, IP, user-agent, honeypot, slug,
state or browser-supplied metadata crosses the internal boundary.

## Responses

| Status | Body | Meaning/UI rule |
|---:|---|---|
| 201 | `{ "ok": true }` | backend created the private report; only case that shows receipt success |
| 400 | safe field-specific reason or verification invalid | malformed/untrusted input; no success |
| 405 | safe failure | unsupported method |
| 413 | safe failure | bounded body exceeded |
| 415 | safe failure | unsupported media type |
| 429 | safe limited response | platform request limit reached |
| 503 | `{ "ok": false, "reason": "submission:unavailable" }` or verification unavailable | internal rejection/dependency/create failure; no success |

The existing internal transport deliberately collapses every non-successful Strapi response to the
same 503 public failure, so missing/inactive/cross-type content cannot be enumerated. Local parsing
reasons must remain stable, non-sensitive and mapped to localized UI messages. Errors never echo
submitted content.

## Verification and retry invariant

Wrong, expired, consumed, different-email or wrong-scope tokens prevent internal transport. If an
internal failure occurs after valid token consumption, the browser preserves reason/explanation,
clears verified state and requires a fresh verification before retrying.

## Success invariant

The HTTP adapter cannot return `{ "ok": true }` on parse, verification, transport, eligibility or
create failure. It never modifies public content directly or indirectly.
