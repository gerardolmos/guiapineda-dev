# Contract: Secure commerce submission

## Public routes and UI

| Language | Canonical route | Success route |
|---|---|---|
| CA | `/alta-comerc/` | `/enviat/` |
| ES | `/es/alta-comercio/` | `/es/enviado/` |
| EN | `/en/businesses/add-a-business/` | `/en/sent/` |

All routes render the same six-block flow with localized UI and statically built active catalogue.
Rendering, navigating steps and selecting catalogue values performs no runtime Strapi request.

## Verification contract

### Browser → verification Functions

Both JSON calls include a required `scope: "comercio"`:

```ts
type RequestCode = {
  email: string;
  language: "ca" | "es" | "en";
  scope: "comercio";
};

type VerifyCode = {
  challengeId: string;
  email: string;
  code: string;
  scope: "comercio";
};
```

The server accepts only the closed scope set documented in `plan.md`. Code and token hashes bind
email+scope. The persisted challenge format is unchanged; `verification-store.mjs` is not modified.
Submission consumption uses the handler-owned literal, never a scope copied from the commerce
multipart.

## Browser → commerce Function

### Endpoint

`POST /api/submissions/comercio`

Content type: one `multipart/form-data` request. Response: JSON with `Cache-Control: no-store`.

### Text allowlist

| Field | Required | Function validation |
|---|---:|---|
| `idioma_solicitud` | yes | `ca/es/en`; the UI derives it from the route |
| `nombre` | yes | trimmed 1–100 |
| `categoria_document_id` | yes | safe document ID, 1–128 |
| `subcategoria_document_id` | conditional | absent/empty or safe document ID; final requirement decided by Strapi catalogue |
| `descripcion_corta` | yes | 1–160 |
| `descripcion_completa` | yes | 1–900 |
| `direccion` | yes | 1–180 |
| `telefono` | no | <=30 |
| `whatsapp` | no | <=30 |
| `email` | no | valid email <=180 |
| `web` | no | absolute HTTP(S) URL <=250 |
| five modality fields | yes | each literal `true`/`false`; at least one true |
| `horario_semanal` | yes | JSON array matching data-model rules |
| `servicios` | yes | JSON array matching data-model rules |
| `redes_sociales` | yes | JSON array matching data-model rules |
| `informacion_adicional` | no | <=800 |
| `nombre_contacto` | yes | 1–120 |
| `email_contacto` | yes | valid email <=180; token binding target |
| `telefono_contacto` | no | <=30 |
| `aceptacion_privacidad` | yes | literal `true` |
| `email_verification_token` | yes | opaque 32–200, consumed once |
| `bot-field` | no | absent or empty only |

The five modality field names are exactly `atencion_presencial`, `atencion_domicilio`,
`atencion_online`, `recogida_local`, and `reparto`. Unknown or duplicate text fields reject the
whole request.

### File allowlist

| Multipart field | Cardinality | Rules |
|---|---:|---|
| `imagen_principal` | exactly 1 | JPEG/PNG/WebP, >0 and <=4.000.000 bytes |
| `logo` | 0..1 | same |
| `galeria` | 0..4 repeated values | same |

The sum of all file sizes MUST be <=4.000.000 bytes. This is decimal MB, not a larger binary-unit
interpretation. Unknown file fields, empty supplied files, excess count, invalid MIME or oversize reject
before token consumption. Request measured size is <=5.000.000 bytes.

### Processing order

1. method/content-type/request size;
2. parse multipart and reject duplicates/unknowns;
3. validate all text/groups/files and aggregate size;
4. reject honeypot;
5. consume token with email and literal scope `comercio`;
6. build internal payload without honeypot/token/verification state;
7. perform exactly one authenticated Strapi request;
8. return success only after Strapi returns acceptance.

### Responses

- `201 { "ok": true }`: one private request confirmed.
- `400/413/415/422 { "ok": false, "reason": "..." }`: invalid, malformed, excessive,
  unverified or stale input; no success UI.
- `429`: platform rate limit response.
- `503 { "ok": false, "reason": "submission:unavailable" }`: dependency failure.

After any failed submission that reached token consumption, the UI preserves editable form data but
resets verification and requires a fresh code. It performs no automatic retry.

## Function → private Strapi

### Endpoint and authentication

`POST /api/internal/submissions/comercio`

Existing bearer secret; one multipart; request <=5.000.000 bytes; no original user filenames.

### Editorial payload allowlist

```ts
type InternalCommercePayload = {
  idioma_solicitud: "ca" | "es" | "en";
  nombre: string;
  categoria_document_id: string;
  subcategoria_document_id?: string;
  descripcion_corta: string;
  descripcion_completa: string;
  direccion: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  web?: string;
  atencion_presencial: boolean;
  atencion_domicilio: boolean;
  atencion_online: boolean;
  recogida_local: boolean;
  reparto: boolean;
  horario_semanal: HorarioDia[7];
  servicios: Servicio[]; // 1..6
  redes_sociales: RedSocial[]; // 0..6
  informacion_adicional?: string;
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto?: string;
  aceptacion_privacidad: true;
};
```

Files keep the same field roles/cardinalities as the public contract. The Function builds fresh
Blobs and technical filenames by role (`principal.*`, `logo.*`, `galeria-1.*`); the extension
follows the validated MIME and carries no visitor filename.

The internal payload MUST NOT contain IP, user agent, honeypot, challenge, code, token, expiry,
timer, verified flag, secret, quarantine ID, state, audit fields, Media IDs, `orden`, `destacado`,
social `usuario`, schedule observations or internal observations.

### Backend acceptance

The backend repeats the allowlist and all value/group/file limits, then:

1. verifies active/published category;
2. determines active/published subcategories for it;
3. enforces absence/presence and belonging of subcategory;
4. preflights all files including aggregate bytes;
5. normalizes every file into private quarantine;
6. creates exactly one `solicitud-comercio` with server-owned refs and `pendent`;
7. rolls back every new private image if normalization or document creation fails.

It never queries for similar commerces and never calls create/update/delete/publish/unpublish on
`api::comercio.comercio`.

## Moderation contract

- Access is limited to the existing authenticated Strapi Admin route and RBAC gate.
- Preview selectors are only `principal`, `logo`, or `galeria` plus gallery index `0..3`.
- Quarantine IDs never leave the backend response.
- Allowed transitions are `pendent -> en_revisio -> aprovat|rebutjat`.
- While state is `pendent` or `en_revisio`, the verified private `email_contacto` is present.
- Approve/reject atomically update state/audit and set `email_contacto` to `null`; they preserve the
  private name, optional phone, request content and quarantine images.
- No transition associates files with Media or a public commerce.
- `observaciones_internas` remains editor-only.

## Abuse, privacy and compatibility

- Honeypot, request limits, purpose-bound one-time token and Netlify rate limit are cumulative.
- Netlify may aggregate temporarily by `ip/domain`; application code does not read/store IP.
- Existing six verification/submission scopes use their own fixed purpose and retain their payload
  and single-image behavior.
- `verification-store.mjs`, `submission-http.mjs` and browser `netlifySubmission.ts` remain
  byte-for-byte unchanged; they are inspection/regression surfaces only.
- No dependency, external service, public Strapi route or infrastructure setting is added.
