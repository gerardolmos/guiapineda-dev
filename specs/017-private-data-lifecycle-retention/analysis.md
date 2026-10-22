> HISTORICAL / SUPERSEDED BY RATIFIED SPLIT (2026-10-18). Not active implementation requirements. See spec.md, plan.md, tasks.md and deferred-follow-up.md. The earlier email atomicity claim is withdrawn by the installed-code evidence in contracts/terminal-scalars.md.

# ANALYZE — 017 · 2026-10-18

## Resultado: FAIL / STOP antes de IMPLEMENT
Análisis read-only del código y spec/plan/tasks; este documento registra posteriormente sus conclusiones por autorización SDD. No cambia spec/plan. TASKS:13 tareas con rutas y trazabilidad, pero T002/T006 bloquean ejecución y T011/T012 requieren diseño ratificado. TASKS PASS como inventario, NO como permiso ni afirmación de ejecutabilidad inmediata.

## Findings
| ID | Severidad | Fuente | Hallazgo | Resolución requerida |
|---|---|---|---|---|
| B01 | BLOCKER | FR05/10; Constitution III/IV; contrato cleanup | Colector demuestra referencias en un instante, no exclusividad durante delete. Lock de moderation coordina solo el proceso y acciones del servicio. PLAN exige exclusión compartida pero no define interceptación de todas las escrituras de refs de otras cinco secciones ni prueba writer único. Guard actual solo Comercio; cleaner fuera del lock. El código de generación de IDs no prueba ownership de referencias históricas. | Diseñar protocolo verificable para todos los escritores y cleaner, fail-closed ante incertidumbre; concurrencia con barreras y condiciones de activación explícitas. Sin borrar ni introspección para resolver diseño. |
| H01 | HIGH | SPEC Input/FR11 y PLAN Entrada; autorización actual E/H/J | SPEC/PLAN limitados a Comercio excluyen60d/L07 transversal. Solicitud actual exige ambos; no hay contrato de actividad, resultado de caducidad, limpieza por sección ni puntos de enforcement transversales. | Ratificar actualización SDD antes de implementar. No basta añadir tareas de código. T002/T011/T012 quedan bloqueadas. |

La prohibición histórica de TASKS se supera por autorización actual; NO es por sí sola un hallazgo. El HIGH es falta de diseño técnico sustantivo para obligaciones nuevas, no falta de permiso para analizarlas.

## Respuestas específicas
1. Migración: STILL UNCERTAIN sobre DB existente. Generador instalado default notNullable:false, schema sin column override: cambio lógico no exige DDL según fuentes. Nunca demostrar estructura física real desde eso. No inspección real requerida para tareas/análisis/código aislado; cualquier actuación DB permanece prohibida. Clasificación física UNCERTAIN no es blocker local por instrucción del usuario.
2. Cadena cerrada: POST /api/submissions/comercio → readCommerceMultipart allowlists/duplicados → buildCommercePayload (nombre requerido, principal File) → consumo verificación → transporte autenticado → controller interno bearer → parseCommercePayload/commerceFiles (nombre/principal requeridos) → catálogo/normalización → documents.create autorizado. No Content API estándar de solicitud-comercio. Quitar required no altera parsers. Guard create debe reforzar nombre y formatoID, update efectivo impide vaciado activo, null solo mantenimiento interno. Public validation remains strict YES como diseño con esos gates.
3. Admin: evidencia estática positiva para previewnull→404→missing; labels/roles fijos sin acceder a referencia null. Mensaje rechazo actual promete conservar imágenes y requiere cambio. No se ejecutó render/handlers aislados antes de STOP por B01/H01; no se ha probado edición genérica Content Manager con null. Resultado requerido PASS/FAIL: FAIL significa compatibilidad integral no demostrada, no crash observado. No confundir static review con fixture PASS.
4. Aprobación: preserve nombre/teléfono/materiales/cuarentena; email null conforme política vigente. resolveCommerceUnlocked no publica ficha; nueva limpieza solo rebutjat. YES en diseño, no resultado de implementación.
5. Idempotencia: refs durables, missing como ausencia, delete falla conserva ref, update falla tras delete reintenta missing, null/[] no-op. Diseño secuencial viable YES. Ownership operativo NO demostrado por B01; no considerar diseño completo de seguridad aprobado para IMPLEMENT.
6.60d: existe updatedAt y cron. Candidato sin campo nuevo: última actualización legítima del expediente; cron no hace writes a activos no elegibles; candidato >=60*24h, relectura/CAS antes de transición, timestamps inválidos/futuros no elegibles. Pero actual PLAN no inventaría estado nuevo ni admin ficticio: debe definir resultado de caducidad y evitar que mantenimiento no editorial reinicie reloj. Schema enum solo pendent/en_revisio/aprovat/rebutjat; nombre_contacto requerido también en Agenda/Veus, no autorizado flexibilizarlo. No se puede certificar cobertura completa sin schema adicional todavía. Resultado NO significa viabilidad NO demostrada, no imposibilidad técnica probada. No se propone nuevo campo sin autorización. Sin infra nueva prevista, cron existente suficiente para scheduling.

## Disposición de MEDIUM previos
- M01 Admin: ACCEPTED WITH EXPLICIT TEST T010 (activo con datos/rechazado null/aprobado con materiales; render,labels,preview,acciones,error,guardado). No resuelto funcionalmente; test obligatorio antes de aceptar implementación. No queda ambiguo.
- M02 DB física: RESOLVED IN DESIGN para fase local: incertidumbre aceptada explícitamente por usuario, prohibición de cualquier ejecución contra DB; validación del esquema clonado T003/T004, autorización separada si se necesitara DDL. No afirma DB real compatible.
MEDIUM sin disposición:0. LOW residuales anteriores:7, documentados en plan, no equivalen a pruebas. Se elevan por separado B01/H01 al revisar exigencias actuales; el anterior resumen0HIGH/0BLOCKER ya no describe esta puerta.

## Cobertura / métricas
11 FR del SPEC→T001/T003–T010/T013;4 SC→T002/T003/T006/T013. A→T001, B/C→T003–T005, D→T010, E→T011, F/G→T006–T008, H→T012, I→T009, J/K→T013.13 tareas; cobertura textual100%; cobertura de diseño para E/H incompleta. Sin duplicaciones de tareas. Constitution I–VII revisada; privacidad/integridad exigen parar con B01. Ninguna tarea ejecutada.

## Allowlist propuesta exacta (candidata BLOQUEADA, no autorizada)
Rutas backend relativas a ../guiapineda-strapi:
- Schema: src/api/solicitud-comercio/content-types/solicitud-comercio/schema.json
- Servicio: src/services/commerce-rejection-cleanup.js (nuevo)
- Lifecycle: src/services/submission-moderation-lifecycle.js
- Guard Comercio: src/services/commerce-submission-write-guard.js
- Guard email transversal: src/services/submission-terminal-email-guard.js (nuevo), src/index.js
- Media: src/services/private-submission-image-cleanup.js
- Caducidad/scheduling: src/services/submission-inactivity.js (nuevo), config/cron-tasks.js
- Admin: src/admin/components/PrivateModerationImagePanel.jsx
- Tipos: types/generated/contentTypes.d.ts (solo generación aislada autorizada)
Frontend:
- QA: specs/017-private-data-lifecycle-retention/qa.mjs (nuevo, no creado)
- SDD: specs/017-private-data-lifecycle-retention/spec.md; plan.md; tasks.md; research.md; data-model.md; analysis.md; analysis-data-matrix.md; quickstart.md; checklists/requirements.md; contracts/terminal-cleanup.md; contracts/inactivity.md (nuevo, no creado); qa-report.md (nuevo, no creado), todos dentro del mismo prefijo specs/017-private-data-lifecycle-retention/.
- Estado local SDD: .specify/feature.json.
No carpetas autorizadas. Resolver B01 podría exigir revisar esta lista: STOP antes de ampliar. Sin archivos de migrations, parsers públicos o schemas adicionales. Ningún esquema adicional queda autorizado implícitamente.

## Estado de entrega
Solo tareas/informe/matriz SDD escritos en este paso. Spec/plan aprobados preservados sin reescritura. Backend sin cambios. No código, schemas, QA ejecutable ni datos tocados. No fixtures ejecutados, no Strapi/SQLite/migración/commit/push/deploy. Próxima acción: revisión y ratificación SDD que resuelva B01/H01, no IMPLEMENT.
