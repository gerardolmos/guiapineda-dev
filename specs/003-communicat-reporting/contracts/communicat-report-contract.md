# Contract: Communicat report submission

## Public UI contract

Every built CA/ES/EN Comunicat detail supplies the report component with:

```ts
type CommunicatReportContext = {
  lang: "ca" | "es" | "en";
  documentId: string;
  slug: string;
};
```

The action appears after the article body and before related Comunicats. Merely rendering or opening
the form makes no runtime request to Strapi. The control, fields, validation, errors and confirmation
must have complete copy in the active language.

## Browser -> Function

### Endpoint

`POST /api/submissions/communicat-report`

Content type: `multipart/form-data`. Files are not accepted. Response is JSON with `Cache-Control:
no-store`.

### Allowed fields

| Field | Required | Validation |
|---|---:|---|
| `comunicat_document_id` | yes | 1–128 chars; stable-id character allowlist. |
| `comunicat_slug` | yes | nonempty bounded slug syntax. |
| `motivo` | yes | one of the five internal reason values. |
| `explicacion` | conditional | <=1,000 chars; required and nonblank for `otro`; optional otherwise. |
| `idioma_solicitud` | yes | `ca`, `es`, `en`. |
| `email_contacto` | yes | valid email syntax; must match verification authorization. |
| `email_verification_token` | yes | valid one-time token consumed by the Function. |
| `bot-field` | no | must be absent or empty. |

Reason values and visible labels:

| Value | CA | ES | EN |
|---|---|---|---|
| `informacion_falsa` | Informació falsa o enganyosa | Información falsa o engañosa | False or misleading information |
| `spam_fraude` | Contingut brossa o frau | Spam o fraude | Spam or fraud |
| `contenido_inapropiado_ilegal` | Contingut inadequat o possiblement il·legal | Contenido inapropiado o posiblemente ilegal | Inappropriate or potentially illegal content |
| `privacidad_datos` | Privacitat o dades personals | Privacidad o datos personales | Privacy or personal data |
| `otro` | Un altre motiu | Otro | Other |

### Responses

- `201 { "ok": true }`: token consumed and backend has accepted/persisted the report.
- `4xx { "ok": false, "reason": "..." }`: malformed, invalid, unverified, automated, excessive or
  stale-content request. The browser maps internal reasons to safe localized messages.
- `429 { "ok": false, "reason": "request:rate-limited" }` or platform-equivalent rate response.
- `5xx { "ok": false, "reason": "..." }`: dependency/internal failure. The UI must not claim receipt.

After any failed network submission that may have consumed the token, the browser retains reason and
explanation but resets verification and requires a fresh code before retrying.

## Verification invariant

The Function must call the existing one-time consumption mechanism with:

```js
consumeSubmissionVerification({
  data: { email_verification_token },
  email: email_contacto,
});
```

The exact internal helper signature may follow the existing source, but these invariants are fixed:

1. token is bound to the normalized email;
2. token is consumed atomically and cannot authorize a second report;
3. no internal Strapi call occurs if consumption fails;
4. `email_contacto` and `email_verification_token` are removed before the internal payload is built.

## Function -> private Strapi

### Endpoint

`POST /api/internal/submissions/communicat_report`

Authentication: existing internal bearer secret. Content type and size handling reuse the internal
submission boundary. The accepted editorial payload is exactly:

```ts
type InternalCommunicatReportPayload = {
  comunicat_document_id: string;
  comunicat_slug: string;
  motivo:
    | "informacion_falsa"
    | "spam_fraude"
    | "contenido_inapropiado_ilegal"
    | "privacidad_datos"
    | "otro";
  explicacion?: string;
  idioma_solicitud: "ca" | "es" | "en";
};
```

The internal request MUST NOT contain email, verification token/code, name, IP, user agent,
attachment, reporter ID, state or timestamps. State and automatic timestamps are server-owned.

### Backend acceptance

The backend:

1. requires internal authentication before processing the body;
2. rejects files, extra fields and invalid values;
3. resolves `api::comunicat.comunicat` by `comunicat_document_id` as published content;
4. requires the resolved current slug to equal `comunicat_slug`;
5. creates one `api::denuncia-comunicat.denuncia-comunicat` with the exact editorial fields and
   `estado_denuncia: "pendiente"`;
6. returns success only after creation completes.

Missing, unpublished or mismatched Comunicats are rejected without a report. Multiple valid calls
for the same Comunicat each create an independent report.

## Moderation and access contract

- Reports have no public route and no public read API.
- Only authenticated editorial users with applicable Content Manager/RBAC permissions can inspect
  or edit them.
- Allowed states are exactly `pendiente`, `revisada`, `cerrada`.
- State changes are manual and have no hook or side effect on public content.
- Creation, repetition or closure of a report never edits, hides, unpublishes or deletes a Comunicat.

## Abuse and privacy contract

- Function-level rate limiting may use Netlify's temporary `ip`/`domain` aggregation, but
  application code must not read, copy or persist the IP.
- Existing verification rate limits and TTL-bound HMAC-derived records remain unchanged.
- Honeypot, strict field allowlists and body-size limits are enforced.
- Explanation is treated and rendered as untrusted plain text in the administrative interface.
- No new storage, external service, cookie, analytics event or identifier is introduced.

## Coordinated compatibility

The Function allowlist and backend dispatcher must both recognize `communicat_report` in the final
implementation. Existing sections and CA/ES/EN public Communicat reading behavior remain unchanged.
No half-deployed state is declared complete.
