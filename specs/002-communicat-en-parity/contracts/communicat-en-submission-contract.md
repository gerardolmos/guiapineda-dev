# Contract: Envío moderado EN de Comunicats

## Public routes

| Language | Listing/CTA source | Submission form | Success |
|---|---|---|---|
| CA | `/comunicats/` | `/envia-un-comunicat/` | `/enviat/` |
| ES | `/es/comunicats/` | `/es/enviar-comunicado/` | `/es/enviado/` |
| EN | `/en/comunicats/` | `/en/comunicats/send-an-announcement/` | `/en/sent/` |

La CTA EN debe contener título, texto, nota y botón no vacíos. La ruta EN directa debe funcionar
sin haber pasado por la CTA.

## Browser-to-Function contract

**Endpoint**: `POST /api/submissions/comunicat`

**Encoding**: `multipart/form-data`

**Allowed submission fields**:

- `idioma_solicitud`: exactamente `ca`, `es` o `en`; EN envía literalmente `en`.
- `tipus_remitent`, `autor`, `titol`, `resum`, `contingut`.
- `nombre_contacto` opcional, `email_contacto` requerido.
- `aceptacion_privacidad`: requerido como valor de formulario `"true"`.
- `email_verification_token`: requerido por la puerta de verificación; no forma parte del payload a
  Strapi.
- `bot-field`: honeypot; debe estar vacío.
- `imatge`: archivo opcional y único, conforme a restricciones existentes.

**Forbidden protected fields**: estado, observaciones, referencia de cuarentena y metadatos de
moderación. Su presencia debe seguir provocando rechazo.

**Responses**:

- `201 { "ok": true }`: solicitud entregada al canal privado; el navegador puede ir a la página de
  éxito correspondiente.
- `400 { "ok": false, "reason": "..." }`: datos, imagen o verificación inválidos.
- `503 { "ok": false, "reason": "verification:unavailable" | "submission:unavailable" }`:
  dependencia no disponible; no se muestra éxito.

Los códigos y razones existentes no cambian por idioma.

## Function-to-Strapi contract

**Endpoint privado**: `POST /api/internal/submissions/comunicat`

**Authentication**: bearer interno existente; nunca expuesto al navegador.

**Encoding**: `multipart/form-data`, con:

- `payload`: JSON con los campos de la solicitud ya normalizados; `idioma_solicitud` acepta
  exactamente `ca`, `es` o `en`.
- `files`: imagen opcional renombrada técnicamente, sin conservar el nombre aportado por la persona.

Strapi debe rechazar idiomas fuera de CA/ES/EN, campos no permitidos, email inválido o consentimiento
distinto de `true`. Una aceptación crea `api::solicitud-comunicat.solicitud-comunicat` con
`estado_solicitud: "pendent"`; si hay imagen, solo conserva su referencia privada de cuarentena.

## Security invariants

1. EN usa la misma verificación de email y el mismo token temporal consumible una vez.
2. La Function valida antes de consumir y consume antes de contactar Strapi.
3. No hay acceso público directo a Strapi ni publicación automática.
4. Contacto, token, imagen de cuarentena y metadatos de moderación no se convierten en contenido
   público.
5. CA y ES mantienen exactamente sus valores, rutas y reglas actuales.

## Validation boundary

Localmente se demuestra el contrato de rutas, UI, serialización, validadores y schema, junto con los
builds y la regresión CA/ES. La entrega real de email, consumo remoto del token, Function desplegada,
transporte real a Strapi y cuarentena integrada quedan como gate explícito de predespliegue.
