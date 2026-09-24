# Data Model: Alta segura y trilingüe de comercios

## Persisted entity: `SolicitudComercio`

Content type privado existente: `api::solicitud-comercio.solicitud-comercio`, sin Draft & Publish y
sin rutas Content API públicas creadas por esta feature.

### Contenido comercial

| Field | Type | Required | Validation/source |
|---|---|---:|---|
| `idioma_solicitud` | enum | yes | `ca`, `es`, `en`; server-owned from accepted payload |
| `nombre` | string | yes | trimmed, 1–100 |
| `descripcion_corta` | string | yes | trimmed, 1–160 |
| `descripcion_completa` | text | yes | trimmed, 1–900 |
| `direccion` | string | yes | trimmed, 1–180 |
| `telefono` | string | no | trimmed, max 30 |
| `whatsapp` | string | no | trimmed, max 30 |
| `email` | email | no | valid email, max 180 |
| `web` | string | no | absolute `http:`/`https:` URL, max 250 |
| `categoria` | many-to-one relation | yes | published and `activa !== false` |
| `subcategoria` | many-to-one relation | conditional | required iff category has active published subcategories; must belong to category |
| `atencion_presencial` | boolean | yes | one of five modalities; at least one true |
| `atencion_domicilio` | boolean | yes | same |
| `atencion_online` | boolean | yes | same |
| `recogida_local` | boolean | yes | same |
| `reparto` | boolean | yes | same |
| `informacion_adicional` | text | no | trimmed, max 800 |

At least one among `telefono`, `whatsapp`, `email`, and `web` must be nonempty and valid. Public
contact remains distinct from private contact.

### `horario_semanal`

Exactly seven repeatable `guiapineda.horario-dia` values in this fixed order:

```text
lunes, martes, miercoles, jueves, viernes, sabado, domingo
```

Allowed visitor-derived fields per item:

| Field | Required | Rule |
|---|---:|---|
| `dia` | yes | exact unique enum value |
| `cerrado` | yes | boolean |
| `apertura_1`, `cierre_1` | conditional | both absent when closed; both `HH:mm` when open; start < end |
| `apertura_2`, `cierre_2` | no pair | both or neither; valid interval; first close <= second open |

At least one day is open. `observacion` and `observacion_en` are not accepted from the visitor.

### `servicios`

Repeatable `guiapineda.servicio`, 1–6 entries in submitted order:

- `nombre`: required, trimmed, 1–100;
- `descripcion`: optional, trimmed, max 300.

`nombre_en`, `descripcion_en`, `destacado` and `orden` are not accepted. Component defaults and
array order remain internal.

### `redes_sociales`

Repeatable `guiapineda.red-social`, 0–6 entries:

- `plataforma`: one unique value from `instagram`, `facebook`, `tiktok`, `youtube`, `linkedin`, `x`;
- `url`: required absolute `http:`/`https:` URL, max 250.

`otra`, `usuario` and `orden` are not accepted.

### Private contact and consent

| Field | Type | Required | Rule |
|---|---|---:|---|
| `nombre_contacto` | string | yes | trimmed, 1–120 |
| `email_contacto` | email/null | yes on create and active moderation; null when terminal | normalized/validated, max 180; same email used to consume token; erased on terminal transition |
| `telefono_contacto` | string | no | trimmed, max 30 |
| `aceptacion_privacidad` | boolean | yes | exactly true |

These fields remain private and are not copied to a public commerce. The verified email may exist
only while `estado_solicitud` is `pendent` or `en_revisio`; the transition to `aprovat` or
`rebutjat` writes it to `null` as part of the same moderation update. This feature does not erase
the private name or phone and defines no broader retention policy. IP, user agent and other
identifiers are absent.

### Private image references

| Field | Type | Required | Rule |
|---|---|---:|---|
| `imagen_principal_quarantena_id` | private string | yes | 32 lowercase hex; server-created |
| `logo_quarantena_id` | private string | no | same |
| `galeria_quarantena_ids` | private JSON array | yes | 0–4 unique server-created IDs in display order |

Each ID resolves only inside the existing private quarantine. The legacy Media fields remain in the
schema only for compatibility, hidden and unused by this flow.

### Moderation metadata

| Field | Type | Ownership |
|---|---|---|
| `estado_solicitud` | enum `pendent/en_revisio/aprovat/rebutjat` | server/lifecycle; default `pendent` |
| `observaciones_internas` | text | editor only |
| `moderacion_iniciada_en` | private datetime | lifecycle |
| `moderacion_iniciada_por_admin_id` | private integer | lifecycle |
| `moderacion_resuelta_en` | private datetime | lifecycle |
| `moderacion_resuelta_por_admin_id` | private integer | lifecycle |
| `createdAt`, `updatedAt` | automatic | Strapi |

## Input-only entity: `CommerceSubmissionRequest`

The browser-only envelope contains all fields in the Browser→Function table in the contract plus:

- `email_verification_token`;
- empty `bot-field`;
- image files under `imagen_principal`, optional `logo`, repeated `galeria`.

Token, honeypot, code, challenge, timers, verified state and secrets are never mapped into
`SolicitudComercio`.

## Internal entity: `InternalCommercePayload`

The Function sends the validated editorial fields, using
`categoria_document_id`/`subcategoria_document_id` as untrusted references still pending backend
resolution. It excludes token and honeypot. `email_contacto` is intentionally included because this
feature needs it for private editorial clarification; its verified status is not included.

Files travel in the same authenticated multipart with technical names. Quarantine IDs, relations,
state and audit fields are created only by Strapi.

## Image value object

For each incoming file:

- role: `principal`, `logo`, or `galeria` (field-owned, not visitor metadata);
- declared/accepted MIME: `image/jpeg`, `image/png`, `image/webp`;
- input bytes: `1..4.000.000`;
- aggregate input bytes across all roles: `1..4.000.000`;
- decoded pixels: <=40,000,000;
- output: WebP, <=3000×3000, no enlargement, <=4.000.000 bytes, metadata removed;
- original name/content: not persisted after normalized private copy.

## State transitions

```text
pendent -> en_revisio -> aprovat
                     \-> rebutjat
```

- Creation can only produce `pendent`.
- Start review requires `pendent`.
- Approve/reject require `en_revisio`.
- `aprovat` and `rebutjat` are terminal for this feature.
- Every transition is manually initiated by an authenticated editor.
- The terminal transition and `email_contacto = null` are one atomic document update; private name,
  phone and quarantine references remain unchanged.
- No transition writes Media or calls create/update/publish/unpublish/delete on `comercio`.

## Atomicity invariant

A request is accepted only if all validation, all normalizations and the single Strapi document
creation succeed. Before document creation, every created quarantine ID is tracked. Any later error
triggers best-effort deletion of the whole tracked set; unrecoverable cleanup failures remain
unreferenced and are eligible for the existing orphan cleanup. A document is never created with a
missing principal or a partial gallery.

## Multiplicity and duplicates

No uniqueness constraint or lookup is added for name, address, public contact, category or private
email. Every independently valid submission creates one request. The backend does not query public
commerces to merge, reject or update them.
