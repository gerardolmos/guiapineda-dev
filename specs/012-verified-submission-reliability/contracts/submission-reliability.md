# Contracts — Verified Submission Reliability

## 1. Fronteras que permanecen iguales

Navegador → `/api/submissions/{agenda,comunicat,veu,millora,foto-mes}`: FormData actual.
Comercio y reportes conservan `/api/submissions/comercio`, `/api/submissions/communicat-report`,
`/api/submissions/content-report` y sus payloads.
Functions → `/api/internal/submissions/:section`: multipart con payload JSON y archivos actuales;
autenticación Bearer interna. Section foto_mes, communicat_report
y content_report mantienen su nombre actual. No exponer secreto, email ni token en mensajes.

Éxito interno: HTTP 201 y objeto JSON no null/no array, ok estrictamente true. Propiedades extra
no invalidan; cuerpo debe terminar dentro de deadline de 15 s. No exigir documentId, receipt o
Content-Type nuevo. Errores: rechazar cualquier otro status/body; handlers siguen devolviendo
503 `{ok:false,reason:"submission:unavailable"}` ante excepción del transporte. No cambiar Strapi.

## 2. Taxonomía cliente mínima

El helper conoce el scope por el formulario soportado. El valor no se acepta desde una respuesta
arbitraria. Para clasificar respuesta pública exigir JSON no null/no array, ok===false y reason
string exacto, junto al status esperado. No usar startsWith, regex de prefijos o status aislado.

| Evidencia | kind | Reset | Persistencia y mensaje |
|---|---|---|---|
| Preparación local falla antes de invocar fetch | pre-consumption-safe | No | No inició intento; corregir/reintentar explícitamente |
| Tupla scope/status/reason en tabla segura | pre-consumption-safe | No | Rechazo probado anterior al consumo |
| 400 + verification:required o verification:invalid | verification-invalid | Sí | Autorización no aceptada; verificar de nuevo |
| 503 + submission:unavailable | post-consumption-failure | Sí | Consumo confirmado, persistencia desconocida |
| 503 + verification:unavailable | ambiguous | Sí | Consumo desconocido; no asumir que GETDEL falló antes de actuar |
| Red/timeout/body ilegible/tupla desconocida tras invocar fetch | ambiguous | Sí | Ni aceptación ni ausencia de persistencia demostradas |

Un 429 sin contrato de razón demostrado no es seguro por su status: ambiguous. Un nuevo reason
servidor no reconocido tampoco. La clasificación desconocida no habilita reenvío automático.
Una respuesta pública de éxito requiere 201 y objeto ok===true: coincide con los cinco handlers;
esta comprobación cliente se limita al helper de cinco formularios y no rediseña otros clientes.

### Tabla cerrada de rechazos seguros HTTP/imagen (cinco scopes)

| Status | Razones exactas |
|---|---|
| 405 | request:method-not-allowed |
| 415 | request:unsupported-media-type, image:unsupported-type |
| 413 | request:too-large, image:too-large |
| 400 | request:invalid-form-data, request:duplicate-field, request:unexpected-file, image:invalid, image:empty |
| 400, solo foto-mes | image:required |

### Tabla cerrada de payload (siempre status 400)

Notación finita para definir sets, NO una regla abierta de prefijos en runtime:
R = missing, type, empty, control-characters, too-short, too-long.
O = type, control-characters, too-long.
Se materializa cada combinación campo:sufijo listado; ninguna clave no enumerada es segura.
Los sufijos corresponden a readString y a ramas previas al consumo; algunos casos son inalcanzables
por límites concretos, pero nunca autorizan un campo o una familia nuevos.

| Scope | Campos con R | Campos con O |
|---|---|---|
| agenda | idioma_solicitud, titol, resum, descripcio, organitzador, lloc, nombre_contacto | data_final, hora_inici, hora_final, adreca, enllac_oficial |
| comunicat | idioma_solicitud, tipus_remitent, autor, titol, resum, contingut, email_contacto | ninguno |
| veu | idioma_solicitud, titol, resum, contingut, tipo_autoria, autor_public, nombre_contacto | ninguno |
| millora | idioma_solicitud, categoria, zona, autor_public, titol, resum, contingut, email_contacto | ninguno |
| foto-mes | autor | titol, lloc |

Razones adicionales exactas:

- agenda: submission:invalid, submission:honeypot, idioma_solicitud:invalid, data_inici:invalid,
  data_final:invalid, dates:invalid-order, dates:event-finished, hora_inici:invalid,
  hora_final:invalid, hora_final:without-start, times:invalid-order, url:protocol, url:invalid,
  email_contacto:invalid, aceptacion_privacidad:required.
- comunicat: submission:invalid, submission:honeypot, submission:protected-field,
  idioma_solicitud:invalid, tipus_remitent:invalid, email_contacto:invalid,
  aceptacion_privacidad:required, nombre_contacto:invalid, nombre_contacto:too-long.
- veu: submission:invalid, submission:honeypot, submission:protected-field,
  idioma_solicitud:invalid, tipo_autoria:invalid, email_contacto:invalid,
  aceptacion_privacidad:required.
- millora: idioma_solicitud:invalid, categoria:invalid, zona:invalid, email_contacto:invalid,
  aceptacion_privacidad:required.
- foto-mes: submission:invalid, submission:honeypot, submission:protected-field,
  idioma_solicitud:invalid, email_contacto:invalid, aceptacion_privacidad:required,
  aceptacion_autoria_publicacion:required.

Evidencia: `netlify/functions/_shared/submission-http.mjs`, `submission-common.mjs` y los cinco
`*-submission.mjs`. Agenda transforma time:invalid a hora_*:invalid; Foto normaliza fallos de
idioma a idioma_solicitud:invalid; Agenda/Veu/Foto normalizan errores email a email_contacto:invalid.
Comunicats usa readOptionalString propio para nombre_contacto. Tests deben ejercer parsers reales,
verificar cero consumo en rechazos y rechazar combinaciones status/razón no contractuales.

## 3. Puente de recuperación y feedback

WeakMap vive en controlador. Puente directo recibe form + fallo tipado del transporte, no un mensaje
DOM ni token. Una llamada por intento fallido; controlador es único propietario del reset. No
listener nuevo global ni suscripción de Comercio/denuncias. Inicialización repetida no duplica API.

EmailVerificationBlock declara data-submission-feedback-target para los cinco scopes y copy
localizado. Fuera de esos scopes no exige estos atributos ni cambia mensajes de reportes/Comercio.

| Scope | ID existente en su formulario |
|---|---|
| agenda | agenda-submit-error |
| comunicat | comunicat-submit-error |
| veu | veu-submit-error |
| millora | millora-submit-error |
| foto-mes | foto-mes-submit-error |

La recuperación reemplaza textContent de ese párrafo antes de relanzar; no hace innerHTML ni
reestructura el formulario. Asegurar role=alert en destino común cuando falte. El catch existente
controla visibilidad/scroll; probar texto final después del catch. El evento de reset existente
recalcula el botón. No resetear dos veces ni limpiar datos para que ese evento ocurra.

Copy propuesto, reutilizable por los cinco formularios:

| Estado | CA | ES | EN |
|---|---|---|---|
| Seguro previo | Revisa les dades indicades i torna a enviar quan estiguis a punt. Conservem el que has escrit; no cal tornar a verificar l’email si l’autorització continua vigent. | Revisa los datos indicados y vuelve a enviar cuando estés listo. Conservamos lo introducido; no necesitas verificar otra vez si la autorización sigue vigente. | Review the indicated details and submit again when you are ready. Your entries are preserved; you do not need to verify again while the authorization remains valid. |
| Autorización inválida | Cal tornar a verificar l’email abans d’enviar. Conservem les dades del formulari. | Debes verificar de nuevo el email antes de enviar. Conservamos los datos del formulario. | Verify your email again before submitting. Your form entries are preserved. |
| Post-consumo o ambiguo | No hem pogut confirmar l’enviament; la sol·licitud podria haver arribat. Conservem les dades. Verifica de nou l’email i decideix si vols tornar a enviar-la. No la reenviarem automàticament. | No hemos podido confirmar el envío; la solicitud podría haber llegado. Conservamos los datos. Verifica de nuevo el email y decide si quieres enviarla otra vez. No la reenviaremos automáticamente. | We could not confirm the submission; it may have arrived. Your entries are preserved. Verify your email again and decide whether to submit again. We will not resend it automatically. |

Post-consumption-failure y ambiguous comparten copy deliberadamente: conocer el consumo no
permite afirmar que no se guardó. No mostrar simultáneamente el antiguo mensaje definitivo.
No limpiar email/consentimiento/Files/draft ni invocar submit/requestSubmit desde recuperación.

## 4. Regresión y no cambios

Comercio conserva requiresReverification y sus mensajes. Denuncia comunicat conserva reset en
catch; multisección conserva limpieza específica de email. Solo reciben el endurecimiento interno;
no invocan puente F01. Payloads, endpoints, código/token, GETDEL y moderación no cambian.
