# Data Model: Denuncia privada multisección

## Persisted entity: `DenunciaContenido`

Private Strapi collection type: `api::denuncia-contenido.denuncia-contenido`.

- `collectionName`: `denuncias_contenido`
- `singularName`: `denuncia-contenido`
- `pluralName`: `denuncias-contenido`
- `displayName`: `Denuncia de contenido`
- `draftAndPublish`: `false`

| Field | Strapi type | Required | Rules | Purpose |
|---|---|---:|---|---|
| `tipo_contenido` | enumeration | yes | `agenda`, `veu`, `millora`, `comercio` | Closed discriminator, independent of reason and language. |
| `contenido_document_id` | string | yes | trim; 1–128 chars; server-resolved under the declared type | Stable editorial identity. |
| `contenido_slug` | string | yes | trim; max 250; server-derived from the eligible document | Minimal recognizable acceptance-time context. |
| `motivo` | enumeration | yes | exact five values below | Closed universal reason. |
| `explicacion` | text | conditional | trim; max 1,000; required/nonblank for `otro` | Private untrusted plain-text context. |
| `idioma_solicitud` | enumeration | yes | `ca`, `es`, `en` | Language used for the report flow. |
| `estado_denuncia` | enumeration | yes | `pendiente`, `revisada`, `cerrada`; default `pendiente` | Minimal human workflow. |
| `createdAt` | automatic datetime | automatic | Strapi-managed | Reception timestamp. |
| `updatedAt` | automatic datetime | automatic | Strapi-managed | Editorial update timestamp. |

Reason enum values:

```text
informacion_falsa
spam_fraude
contenido_inapropiado_ilegal
privacidad_datos
otro
```

No relation, component, media field, localization, reporter field or lifecycle hook is added. A
report survives subsequent edits/deletion because it owns its validated stable ID and slug snapshot
instead of depending on a relation.

## Input-only entity: `ContentReportRequest`

| Field | Browser -> Function | Function -> backend | Notes |
|---|---:|---:|---|
| `tipo_contenido` | yes | yes | Fixed by the rendered component; always treated as untrusted. |
| `contenido_document_id` | yes | yes | Strapi 5 document identity; backend resolves it under the exact UID. |
| `motivo` | yes | yes | Exact enum value. |
| `explicacion` | optional/conditional | optional/conditional | Omitted when blank for first four reasons; required for `otro`. |
| `idioma_solicitud` | yes | yes | `ca`, `es`, `en`. |
| `email_contacto` | yes | **no** | Normalized only for one-time verification. |
| `email_verification_token` | yes | **no** | Atomically consumed under `content-report`. |
| `bot-field` | empty only | **no** | Honeypot. |

`contenido_slug`, `estado_denuncia`, timestamps and all content-publication fields are forbidden
client inputs. The backend derives slug/state and Strapi owns timestamps.

## Explicitly non-persisted data

- email, verification code or token;
- name, phone, account, profile, address or identity document;
- IP, user-agent, device/fingerprint, analytics or correlation identifier;
- title, body, full URL, category name or complete public-content snapshot;
- honeypot, rate-limit key, consent or preference;
- attachment, image or original filename.

The existing verification store may retain HMAC-derived temporary material under its current TTLs.
That is authorization state, not an editorial report, and its semantics are unchanged.

## Authoritative type map

| Discriminator | Documents Service UID | Eligibility fields read |
|---|---|---|
| `agenda` | `api::agenda.agenda` | `documentId`, `slug`, publication status |
| `veu` | `api::veu.veu` | `documentId`, `slug`, publication status |
| `millora` | `api::millora.millora` | `documentId`, `slug`, publication status |
| `comercio` | `api::comercio.comercio` | `documentId`, `slug`, `activo`, category/subcategory `documentId` |

Commerce relation IDs are then checked against `api::categoria-comercio.categoria-comercio` and,
when present, `api::subcategoria.subcategoria`, each with `status: "published"` and `activa === true`.
The subcategory must still belong to the resolved category; a mismatched relation is ineligible.

The map is executable server code, not request data. Unknown values reject. Finding the same
`documentId` under a different type does not authorize the declared type.

## Validation and write sequence

1. Browser validates for usability and sends bounded multipart form data.
2. Function rejects files, duplicate/unexpected fields, invalid values and nonempty honeypot.
3. Function consumes the token with submitted email and scope `content-report`.
4. Function constructs a fresh editorial payload containing only the five authorized keys (four
   when explanation is absent).
5. Backend repeats exact-key, enum, length and conditional validation and rejects request files.
6. Backend resolves the type-specific published document and verifies current public eligibility.
7. Backend derives current slug and creates exactly one `DenunciaContenido` with `pendiente`.

No step updates the referenced document. Any failure before the create produces no report. A create
failure is reported as unavailable and cannot produce a success response.

## State model

```text
pendiente ──human──> revisada ──human──> cerrada
     └────────────────human────────────> cerrada
```

Only authenticated editorial users change state through Strapi Content Manager/RBAC. No state
transition triggers a public content operation. Reopening, assignment, appeal, author notification,
public tracking and automated prioritization are outside scope.

## Multiplicity and retention behavior

Every authorized submission creates a separate row. There is no uniqueness constraint or
deduplication key over type, ID, reason, email hash or time. Content slug/title changes do not alter
an existing report. Content deletion does not delete or reassign a report. Retention policy changes
are outside this feature and require a separate decision.

## Access boundary

- No public routes/controller/service are created for `denuncia-contenido`.
- Creation is reachable only through the existing internally authenticated submission controller.
- Read and state edit are available only to authorized Strapi Content Manager roles.
- Normal public detail rendering never reads reports.
- Existing `denuncia-comunicat` records and schema remain independent and unchanged.
