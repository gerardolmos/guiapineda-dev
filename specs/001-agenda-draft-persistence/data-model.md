# Data Model: Agenda Draft Persistence

## AgendaDraftEnvelope

Represents the complete value stored for the Agenda draft in one browser-tab session.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `version` | literal `1` | Yes | Any other value makes the envelope incompatible |
| `scope` | literal `agenda` | Yes | Prevents accepting a payload for another form |
| `fields` | `AgendaDraftFields` object | Yes | Must be a non-array object; only allowlisted string values are consumed |

No timestamp, expiry, verification flag, language, backend identifier or submission status is stored.

## AgendaDraftFields

All accepted values are strings preserved as entered. Semantic validity is evaluated by the current
Agenda form after restoration.

| Field | Form meaning | Persisted |
|---|---|---:|
| `titol` | Title | Yes |
| `resum` | Summary | Yes |
| `descripcio` | Description | Yes |
| `organitzador` | Organizer | Yes |
| `data_inici` | Start date | Yes |
| `hora_inici` | Start time | Yes |
| `data_final` | End date | Yes |
| `hora_final` | End time | Yes |
| `lloc` | Place | Yes |
| `adreca` | Address | Yes |
| `enllac_oficial` | Official link | Yes |
| `nombre_contacto` | Private contact name | Yes |
| `email_contacto` | Private contact email string | Yes; verification state is separate and excluded |

### Explicitly excluded data

| Data/control | Reason |
|---|---|
| `imatge` / any file | Files cannot be restored safely and are outside the approved draft |
| `bot-field` | Honeypot is a security control, never user content |
| `aceptacion_privacidad` | Consent must be given explicitly in the current form state |
| `form-name`, `idioma_solicitud` | Operational hidden values come from the current route/form |
| Verification code/token/challenge/expiry | Security state must never be reusable |
| `data-email-verified` and controller state | Derived sensitive state; always starts false |
| HMAC, bearer, secrets, environment values | Must never be present in browser draft data |
| Image preview, validation errors, current step, button states | Derived UI state is recalculated, not stored |

## Relationships

- One tab session has at most one Agenda draft under the common Agenda key.
- The same draft serves CA, ES and EN because route language is not part of its identity.
- An Agenda draft may become an Agenda submission, but no draft identifier or storage value is sent
  separately to backend.
- Email text belongs to the draft; email verification belongs to the existing verification
  controller and has no persistent relationship with the draft.

## Validation Rules

1. The parsed root must be a non-null, non-array object.
2. `version`, `scope` and `fields` must match the envelope contract.
3. Only own keys in the 13-name allowlist are considered.
4. Each restored value must be a string.
5. Unknown keys are ignored; missing keys leave current controls unchanged.
6. Allowed keys whose controls no longer exist are ignored.
7. Date, time, length, required and email/URL validity are recalculated by Agenda, not trusted from
   storage.

## State Transitions

```text
ABSENT
  -> ACTIVE        first allowed input/change successfully saves an envelope

ACTIVE
  -> ACTIVE        later allowed edits replace fields with the latest values
  -> RESTORED      a compatible envelope is projected into a CA/ES/EN form
  -> CLEARED       confirmed successful submission
  -> CLEARED       form reset
  -> ENDED         browser ends the tab session naturally

CORRUPT_OR_INCOMPATIBLE
  -> CLEARED       parse/envelope/version/scope failure; form continues empty

STORAGE_UNAVAILABLE
  -> DEGRADED      form continues normally without draft persistence
```

No state transition is driven by elapsed minutes/hours, language navigation, failed submission,
image selection or email verification.
