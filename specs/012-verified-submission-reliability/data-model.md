# Data Model — Estado efímero de Feature 012

No modelos persistentes, schemas, migraciones ni cambios de DB.

## VerificationController

Propietario existente: controlador común. Conserva challengeId, verifiedEmail, token oculto,
flag verificado y timer. Registro WeakMap por formulario, creado solo tras inicialización válida;
reinicializar devuelve misma instancia. No serializar registro ni estados en sessionStorage.

Transiciones:
- pending → challenge-issued → verified mediante código actual.
- verified + pre-consumption-safe → verified si sigue válido.
- verified + verification-invalid/post-consumption-failure/ambiguous → pending mediante reset.
- expiración/cambio de email → pending, comportamiento actual.
- nueva verificación → verified, nunca submit automático.

reset limpia solo autorización y emite evento de estado existente. No limpia email, consentimiento,
selecciones, textos, FileList ni drafts. Ningún token servidor se restaura.

## SubmissionFailure (valor cliente, no contrato HTTP nuevo)

Campos: kind (cuatro valores del contrato), status opcional, reason opcional, requestStarted,
persistence (not-started para fallo local/prerechazo probado, unknown para post/ambiguous).
No payload, email ni token en el error o logs. verification-invalid no autoriza nuevas acciones
hasta obtener token nuevo; no necesita afirmar nada sobre intentos anteriores.

El transporte clasifica y llama al puente una sola vez por fallo. El controlador posee el reset,
y el componente aporta copy/destino. Los flows mantienen loading/error/navegación.

## Attempt lifecycle

local-preparation → request-started → rejected-before-consumption | verification-rejected |
post-consumption-failure | ambiguous | accepted.
accepted → navegación automática, o retorno al caller para Millorem. Error posterior de navegación
no cambia accepted en fallo de envío ni provoca reenvío.

Un fallo seguro preserva autorización, sin renovar TTL. Un fallo desconocido no se transforma en
seguro por coincidir su status con un error conocido. Cada nuevo intento requiere gesto explícito.

## InternalAcknowledgement

Status 201 y body objeto no null/no array con ok boolean true, completamente leído dentro del
plazo. Campos adicionales tolerados. No ID nuevo. Un acuse inválido no revela si persistió.

## PreservedFormState

Email, textos, selects/radios, Files en página viva, consentimiento y sessionStorage previo.
La recuperación no emite input/change/reset sobre el formulario. Draft solo se limpia por el
éxito o reset de usuario ya previsto; Foto continúa sin persistencia. Política de denuncias intacta.
