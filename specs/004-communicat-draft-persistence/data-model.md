# Data Model: Communicat Draft Persistence

## CommunicatDraftEnvelope

| Field | Type | Required | Rules |
|---|---|---:|---|
| `version` | literal `1` | Yes | Otro valor hace incompatible el envelope |
| `scope` | literal `comunicat` | Yes | Impide aceptar el borrador de otro formulario |
| `fields` | `CommunicatDraftFields` object | Yes | Objeto no array; solo se consumen strings allowlisted |

No contiene timestamp, expiración, idioma, índice de paso, archivo, consentimiento, verificación,
validez, estado de envío ni identificador de backend.

## CommunicatDraftFields

| Field | Meaning | Persisted | Restore rule |
|---|---|---:|---|
| `tipus_remitent` | Tipo público de remitente | Yes | Coincidencia exacta con radio vigente; `""` deja el grupo vacío |
| `autor` | Autor público | Yes | String literal; reglas actuales se recalculan |
| `titol` | Título público | Yes | String literal; reglas actuales se recalculan |
| `resum` | Resumen público | Yes | String literal; reglas actuales se recalculan |
| `contingut` | Contenido público | Yes | String literal; reglas actuales se recalculan |
| `nombre_contacto` | Nombre privado de contacto | Yes | String literal; no implica consentimiento |
| `email_contacto` | Email privado de contacto | Yes | String literal; nunca implica verificación |

Los campos pueden estar ausentes o contener string vacío. Un valor no string se ignora sin coerción.

### Explicitly excluded data

| Data/control | Reason |
|---|---|
| `imatge`, file, filename, object URL and image previews | Archivo no restaurable y fuera de allowlist |
| `bot-field` | Honeypot de seguridad |
| `aceptacion_privacidad` | Consentimiento actual, no borrador |
| `idioma_solicitud` and hidden metadata | Derivados de la ruta/formulario |
| Verification code, challenge, token and expiry | Autorización temporal no reutilizable |
| `data-email-verified` and controller state | Estado sensible que empieza falso |
| Secrets, bearer, HMAC and environment values | Nunca pertenecen al borrador |
| Step, errors, counters, reading time, buttons and previews | Estado derivado recalculado |

## Relationships

- Una pestaña mantiene como máximo un borrador de Comunicat bajo scope `comunicat`.
- CA, ES y EN leen y escriben el mismo envelope.
- El borrador no se envía como entidad ni se relaciona con la solicitud editorial.
- El email es texto del borrador; verificación y consentimiento son independientes.
- Agenda usa otra clave y comparte solo el adaptador técnico.

## Validation Rules

1. La raíz debe ser objeto no nulo y no array.
2. `version`, `scope` y `fields` deben coincidir con el contrato.
3. Solo se consultan las siete propiedades propias allowlisted.
4. Solo strings se restauran; no hay coerción.
5. Claves desconocidas, campos ausentes y controles retirados se ignoran.
6. `tipus_remitent` solo restaura por coincidencia vigente exacta.
7. Longitudes, requeridos y formato de email se recalculan con reglas actuales.
8. Un valor inválido permanece visible y bloquea hasta corregirse.

## State Transitions

```text
ABSENT -> ACTIVE                 first allowed input/change
ACTIVE -> ACTIVE                later allowed edit
ACTIVE -> RESTORED              compatible envelope in CA/ES/EN
ACTIVE -> CLEARED               confirmed success or reset
ACTIVE -> ENDED                 natural tab-session end
CORRUPT_OR_INCOMPATIBLE -> CLEARED
STORAGE_UNAVAILABLE -> DEGRADED form remains fully usable
```

No hay transición por idioma, tiempo, cambio de paso, imagen, consentimiento, verificación o fallo.
