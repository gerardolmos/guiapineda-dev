# Contrato de clasificación y recuperación

| Entrada | Resultado |
|---|---|
| 400, objeto no array, ok false, reason verification:required | verificationRequired |
| 400, objeto no array, ok false, reason verification:invalid | verificationRequired |
| Otros 400, incluidos report:invalid-reference y envelopes no conformes | invalidReference (comportamiento previo) |
| 201, objeto no array, ok true | success |
| 429 | limited |
| Resto, incluido 503 | unavailable |

Mapear mediante classifySubmissionFailure('content-report', status, data). No añadir reasons ni ampliar whitelist segura de 012. No derivar éxito de status por sí solo.

Para todo no-éxito, conservar reset específico existente: email/código/token/challenge/verified limpios; motivo/contexto intactos; botón bloqueado hasta nueva verificación; retry enfoca email y no hace POST. CA/ES/EN reutilizan data-verification-required. Es texto de instrucción local, nunca el reason crudo del servidor. Denuncia Comunicats no cambia.
