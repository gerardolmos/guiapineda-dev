# Data Model: Denuncia privada de Comunicats

## Persisted entity: `DenunciaComunicat`

Private Strapi collection type: `api::denuncia-comunicat.denuncia-comunicat`.

- `collectionName`: `denuncias_comunicat`
- `singularName`: `denuncia-comunicat`
- `pluralName`: `denuncias-comunicat`
- `displayName`: `Denuncia de Comunicat`
- `draftAndPublish`: `false`

| Field | Strapi type | Required | Rules | Purpose |
|---|---|---:|---|---|
| `comunicat_document_id` | string | yes | trim; 1–128 chars; server-validated against a published Comunicat | Stable editorial identity. |
| `comunicat_slug` | string | yes | bounded valid slug; must equal the current published document slug | Minimal recognizable public context and tamper check. |
| `motivo` | enumeration | yes | `informacion_falsa`, `spam_fraude`, `contenido_inapropiado_ilegal`, `privacidad_datos`, `otro` | Closed report reason independent of UI language. |
| `explicacion` | text | no* | max 1,000 chars; plain text; nonblank and required when `motivo = otro` | Private editorial context. |
| `idioma_solicitud` | enumeration | yes | `ca`, `es`, `en` | Language in which the visitor reported. |
| `estado_denuncia` | enumeration | yes | `pendiente`, `revisada`, `cerrada`; default `pendiente` | Minimal editorial workflow. |
| `createdAt` | Strapi automatic datetime | automatic | immutable creation metadata | Reception time required by the spec. |
| `updatedAt` | Strapi automatic datetime | automatic | managed by Strapi | Minimal state-change metadata. |

No relation, media, components or localization plugin field is added.
The public Comunicat is looked up before creation, but the report stores the validated stable
identifier and slug snapshot rather than owning or modifying it.

## Explicitly non-persisted data

The following values may be present only at the browser/Function verification boundary and MUST NOT
appear in the Strapi payload, report schema or report record:

- `email_contacto`;
- `email_verification_token` or verification code;
- reporter name, account, phone, address or identity document;
- IP address, user agent, device identifier or tracking identifier;
- honeypot value;
- consent or commercial preference;
- attachment or image;
- title/body snapshot beyond the authorized slug context.

The existing verification store may retain HMAC-derived temporary material under its existing TTLs.
That technical authorization data is not part of `DenunciaComunicat` and cannot become editorial
metadata.

## Input-only model: `CommunicatReportRequest`

| Field | Browser -> Function | Function -> Strapi | Notes |
|---|---:|---:|---|
| `comunicat_document_id` | yes | yes | Hidden static context, always revalidated server-side. |
| `comunicat_slug` | yes | yes | Hidden static context, always revalidated server-side. |
| `motivo` | yes | yes | One closed internal value. |
| `explicacion` | optional/conditional | optional/conditional | Trimmed validation; preserved as private plain text. |
| `idioma_solicitud` | yes | yes | `ca`, `es`, `en`. |
| `email_contacto` | yes | **no** | Used only to bind and consume verification. |
| `email_verification_token` | yes | **no** | Consumed once in Function. |
| `bot-field` | empty only | **no** | Honeypot; a value rejects the request. |

Unexpected fields and all files are rejected at both relevant trust boundaries.

## Validation sequence

1. Browser applies required fields, reason-dependent explanation and length rules for usability.
2. Function parses bounded multipart, rejects files/duplicates/unexpected fields and validates all
   request values independently of the browser.
3. Function consumes the one-time token using the submitted email.
4. Function discards email, token and honeypot and sends only the editorial payload.
5. Backend repeats allowlist/value validation.
6. Backend resolves the Comunicat by stable `documentId`, requires a published result and matching
   slug.
7. Backend creates exactly one private report with state `pendiente`.

No failure before step 7 creates a report; no step writes to the Comunicat.

## State model

```text
pendiente -> revisada -> cerrada
     |                      ^
     +----------------------+
```

- `pendiente`: default after an accepted report.
- `revisada`: an authorized editor has evaluated it.
- `cerrada`: editorial handling is complete.

The model exposes only these three values and introduces no automatic transition. Direct closure
from `pendiente` is permitted for simple editorial handling. Reopening, assignment, escalation,
appeal and public status tracking are outside scope.

## Multiplicity and identity

Every accepted submission creates an independent report. There is no uniqueness constraint over
`comunicat_document_id`, `motivo`, language or time; no deduplication key is stored. Any number of
reports can reference the same Comunicat and none triggers an automatic content action.

## Access and privacy

- No public Content API route is created for the report type.
- Creation occurs only through the internally authenticated submission route.
- Reading and state changes occur only through authenticated Strapi Content Manager/RBAC.
- No report operation publishes, unpublishes, edits or deletes the referenced Comunicat.
