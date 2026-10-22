> HISTORICAL / SUPERSEDED BY RATIFIED SPLIT (2026-10-18). Not active implementation requirements. See spec.md, plan.md, tasks.md and deferred-follow-up.md. The earlier email atomicity claim is withdrawn by the installed-code evidence in contracts/terminal-scalars.md.

# Contrato transversal y evaluación de actividad — diseño, no ejecutado

## Mapa de seis solicitudes
Todas: POST interno autenticado → createInternalSubmission en internal-submission-request.js → documents(uid).create; Commerce delega createCommerceSubmission y añade authorizeCommerceSubmissionWrite. Público pasa Function/verificación; cliente no suministra estado ni IDs privados. Todas usan draftAndPublish:false y enum pendent/en_revisio/aprovat/rebutjat.

| Sección/UID suffix | Create | Moderation / lifecycle | Admin update | Email actual | Riesgo bypass |
|---|---|---|---|---|---|
| Agenda solicitud-agenda | parseSubmissionPayload + cuarentena opcional | startReview→approve/reject comunes | Content Manager→document-manager→documents.update | null en approve/reject | sin guard transversal, update autorizado de estado/email fuera del servicio |
| Comunicats solicitud-comunicat | mismo servicio, parser propio por section | comunes | igual | null en approve/reject | igual |
| Veus solicitud-veu | mismo servicio, parser propio | comunes | igual | null en approve/reject | igual |
| Millorem solicitud-millora | mismo servicio | approveMilloraUnlocked publica contenido; reject común | igual | null en resolución normal | igual; no ejecutar publicación desde cleanup |
| Foto solicitud-foto-mes | mismo servicio, imagen requerida | comunes | igual | null en approve/reject | igual |
| Comercio solicitud-comercio | parser/archivos/catálogo→refs servidor→create autorizado | resolveCommerceUnlocked sin publicación | guard Document Service restringe acciones/fields | terminal exige null en guard interno | guard exclusivo Comercio, no protege las otras cinco; mantenimiento futuro debe mantener autorización |

No hooks específicos adicionales encontrados. src/index.js registra solo guard Comercio. Estado hidden/visible:false no constituye autorización ni invariante. Schema email optional permite null pero no lo exige terminal. Capa mínima común propuesta: subscriber query engine con mutación de data previa a persistir + predicado de estado activo en write email no-null; no writes recursivos. Uso autorizado de servicios normales/admin cubierto; bypass SQL directo fuera de contrato. No instalarlo ahora.

## Evaluación de fuentes
| Opción | Qué refleja | Falsos reinicios/omisiones | Conclusión |
|---|---|---|---|
| A updatedAt | subscriber timestamps.beforeUpdate asigna now en toda actualización, beforeUpdateMany en arrays | noop/ajuste técnico reinicia, no discrimina finalidad; no se puede reconstruir intención después | no equivale a actividad editorial; rechazada como fuente exacta |
| B createdAt | recepción inicial | no reconoce revisiones/ediciones posteriores | insuficiente |
| B moderacion_iniciada_en | paso pendent→en_revisio | no registra ediciones posteriores | insuficiente |
| B moderacion_resuelta_en | resolución terminal | no indica actividad de pendientes | no aplicable a60d activos |
| C estado | activo/terminal | no lleva instante de edición, solo transición conocida | gate de elegibilidad, no reloj |
| E max(createdAt,review-start,updatedAt) | mezcla de los anteriores | hereda falsos reinicios de updatedAt | insuficiente |
| E redefinir toda escritura como actividad | mantenimiento/noop también | cambia semántica de producto en vez de resolverla | descartado |
| E omitir writes noop o restaurar updatedAt | requeriría interceptar todos writers y alterar timestamp framework | no recupera historial anterior; contradice significado de updatedAt y frágil | descartado como alternativa mínima |
| D last_activity_at | timestamp explícito de cambio relevante | controlado por writer servidor y diff semántico | propuesta mínima para semántica exacta; schema adicional→STOP |

Nombre conceptual last_activity_at, datetime privado servidor. En create válido se fija; en cambio efectivo de campos de solicitud/editorial/contacto o revisión se actualiza en la misma escritura. Actor humano/admin autorizado puede originar edición pero no suministrar timestamp. Procesos técnicos/cleanup/retries no lo actualizan. Cambios de categoría/fecha/autor/texto/contacto relevantes sí; no-op no. Observaciones editoriales pueden contar si cambian realmente y su finalidad es moderación, sin guardar el texto en logs. No existe infraestructura de aclaraciones trazada que permita contar mensajes externos.

Previos: null/ausente=actividad desconocida; no elegibles hasta actividad legítima acreditada o política de inicialización aprobada. No inventar timestamp ni reiniciar silenciosamente60d en todos al desplegar. Con reloj futuro/inválido no caducar. Con dato válido: elapsed>=60*24*60*60*1000 y estado activo, revalidado al escribir contra versión/fecha esperada;59no,60sí,61sí, cambio concurrente cancela. El resultado de caducidad aún requiere decidir representación sin usar admin ficticio; no añadir enum/campo adicional por inferencia. Limpieza de nombre privado requerido Agenda/Veus necesita análisis aparte de los dos campos Comercio ya aprobados. No proyecto de caducidad listo para implementar.
