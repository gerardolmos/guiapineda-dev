# Internal Contract: Agenda Browser Draft

## Purpose

Define the boundary between Agenda form orchestration and the browser-draft adapter. This is an
internal frontend contract, not an API, backend payload or server persistence contract.

## Storage identity

- Medium: `sessionStorage`
- Key: `guiapineda:submission-draft:v1:agenda`
- Scope: one browser tab session and one origin
- Locale behavior: CA, ES and EN MUST use the same key
- Expiry: browser-managed end of tab session only; no TTL

## Serialized envelope

```json
{
  "version": 1,
  "scope": "agenda",
  "fields": {
    "titol": "...",
    "resum": "...",
    "descripcio": "...",
    "organitzador": "...",
    "data_inici": "...",
    "hora_inici": "...",
    "data_final": "...",
    "hora_final": "...",
    "lloc": "...",
    "adreca": "...",
    "enllac_oficial": "...",
    "nombre_contacto": "...",
    "email_contacto": "..."
  }
}
```

The example enumerates the complete allowed surface. Fields may be absent or contain an empty
string. No other value type is accepted for restoration.

## Agenda policy supplied to the adapter

Agenda MUST supply the exact field-name allowlist from the envelope example. The adapter MUST NOT:

- infer permission from input type;
- enumerate every named form control;
- use denylist substrings as its primary safety control;
- serialize `FormData` or arbitrary DOM state;
- persist a newly added control until the allowlist is deliberately amended.

## Read contract

1. `getItem` and JSON parse errors are contained.
2. Invalid root, version, scope or fields container makes the whole payload incompatible and causes
   best-effort removal.
3. A valid envelope is projected through the allowlist.
4. Unknown keys and controls that no longer exist are ignored.
5. Missing fields retain their current form defaults.
6. A type-invalid allowed property is ignored without coercion; other valid properties may restore.
7. Restoration assigns values without emitting synthetic `input` or `change` events.
8. The caller receives enough outcome information to run one derived-state reconciliation, but no
   persisted validity or security state.

## Write contract

1. Saving reads only the 13 allowlisted controls.
2. Only string `.value` data enters `fields`.
3. The latest allowed values replace the prior envelope on `input` or `change`.
4. A write, serialization, quota or security error is swallowed locally and MUST NOT affect form use.
5. Values MUST NOT be logged, sent over network or copied to another storage system by this feature.

## Cleanup contract

- `clear()` performs best-effort `removeItem` and never throws to Agenda.
- Agenda calls `clear()` only after the existing transport confirms submission success.
- A failed submission MUST NOT call `clear()`.
- The adapter clears on the form's `reset` event.
- Agenda reconciles derived UI after the native reset completes.
- No unload/pagehide cleanup is registered; language navigation must retain the draft.
- No discard button or time-based expiry is added.

## Security invariants

The following MUST never be present in `fields`: file/image, honeypot, privacy consent, hidden form
metadata, verification code/token/challenge/expiry, verified flag, bearer, HMAC, secrets,
environment values, image/object URLs, errors, button state or review state.

Restoring `email_contacto` MUST NOT imply verified email. The existing controller initializes after
restoration and remains the only authority for verification state.

## Failure-mode contract

Every storage failure degrades only draft convenience. Agenda MUST remain fillable, validatable,
reviewable and submittable with its current security flow.
