# Feature 017 — Recuperación SDD: privacidad terminal y caducidad

**Created**: 2026-10-18
**Branch**: main
**Status**: Diseño revisado; STOP, no IMPLEMENT
**Input**: Recuperación B01/H01 autorizada exclusivamente para SDD. Los nombres de findings se normalizan a la última petición: B01=lifecycle/email/caducidad; H01=ownership/concurrencia. En analysis.md anterior estaban intercambiados; conservar historia.

## User Scenarios & Testing
### US1 — Email terminal homogéneo (P1)
Como responsable de moderación necesito que ninguna transición terminal autorizada conserve email por usar una vía distinta del botón habitual.
**Independent test futuro**: seis solicitudes y vías normales/admin, escrituras concurrentes y posteriores, sin DB real.
1. Given estado activo, when se actualiza legítimamente, then conserva email necesario.
2. Given transición autorizada a aprovat/rebutjat, when persiste, then email es null en la misma escritura.
3. Given terminal, when otra actualización intenta reintroducir email, then no se conserva ni reabre estado.

### US2 — Rechazo y materiales editoriales (P1)
Como editor necesito limpiar contacto e imágenes privadas descartadas sin destruir material aprobado pendiente de publicación ni activos ajenos.
**Independent test futuro**: rechazo de Comercio, casos shared/race/fallos; aprobación conserva materiales.
1. Given rechazo definitivo, when limpieza termina, then contacto operativo y cuarentena propia se eliminan manteniendo expediente.
2. Given aprobación de Comercio, when se resuelve, then email se elimina pero nombre/teléfono/materiales siguen disponibles para creación editorial.
3. Given ownership incierto o fallo parcial, when cleanup se intenta, then no borra activos no demostrados propios ni declara éxito falso.

### US3 — Caducidad real por inactividad (P1, BLOQUEADA por schema adicional)
Como responsable quiero caducar solicitudes activas a los60 días de actividad relevante, sin que procesos técnicos alteren ese plazo.
**Independent test futuro**:59/60/61d, edición real/no-op/mantenimiento, timestamps desconocidos y concurrencia con aprobación.
1. Given actividad legítima reciente, when cron revisa, then no caduca.
2. Given >=60d desde actividad acreditada y estado activo, when se verifica elegibilidad, then aplica resolución de caducidad explícita y limpieza aplicable sin simular decisión humana.
3. Given registro previo sin actividad acreditada, when cron revisa, then no inventa fecha ni borra automáticamente.

## Requirements
- FR01 EMAIL: seis secciones comparten enforcement técnico de email terminal, atómico y no recursivo, sin borrar durante estados activos ni reintroducir después.
- FR02 TERMINAL CLEANUP: estado editorial y resultado de limpieza se separan; fallos preservan capacidad de recuperación.
- FR03 COMMERCE: entrada pública/interna sigue estricta; persistencia de nombre_contacto e imagen_principal_quarantena_id admite null solo mediante flujo autorizado de rechazo; conservar restantes constraints. Email/teléfono/logo ya opcionales; galería limpia a[].
- FR04 APPROVAL: aprobar Comercio no publica ficha ni autoriza destruir materiales; conservarlos. No ampliar limpieza de aprobados a datos de finalidad incierta.
- FR05 OWNERSHIP: ningún blob puede borrarse sin exclusividad acreditada y protegida durante todo el intervalo de decisión/borrado. Un ID aleatorio o un snapshot no acredita esto.
- FR06 FAILURE: delete/update fallidos, missing, null y segunda ejecución seguros; cero falso completed y logs sin PII.
- FR07 EXPIRATION:60×24h desde actividad relevante acreditada; activo y elegible al persistir, terminales excluidos. No usar updatedAt bruto como actividad semántica.
- FR08 ADMIN: soporta activo con valores, rechazado null y aprobado con materiales; preview sin referencia, copy y pending/error coherentes.
- FR09 PUBLICATION: nunca borrar Media/contenido publicado ni activos compartidos. Proteger promoción concurrente.
- FR10 LEGAL: no fijar duración de evidencia publicada ni hold; consentimiento/notas/autoría no se borran por analogía.
- FR11 PHASE: solo SDD; no schema/code/DB/SQLite/migrations/arranque/deploy/commit/push. No crear nuevas features automáticamente.

## Key Entities
Seis solicitudes privadas; email operativo; propuesta editorial; cuarentena; referencias; actividad editorial acreditada (nuevo atributo conceptual, no autorizado); evidencia técnica no PII. No nueva entidad implementada.

## Success Criteria
- SC01: mapa verificable de create/moderation/admin y cleanup para las seis secciones.
- SC02: doce carreras/escenarios de media analizados con garantías existentes separadas de las necesarias.
- SC03: comparación de fuentes de actividad, schema adicional explícito y política legacy no destructiva.
- SC04: gate inequívoco de implementación; incertidumbres no se presentan como PASS funcional.

## Edge Cases / límites
Guardados sin cambios, timestamps inválidos/futuros, escrituras técnicas, upload prolongado, retry, referencias compartidas, crash entre delete/update, aprobación simultánea, actualizaciones masivas. Caducidad no inventa admin ni enum nuevo. Limpieza de nombres requeridos en Agenda/Veus queda sin autorización de schema. La división se recomienda por dependencias técnicas y permisos de schema distintos; no reduce las condiciones de seguridad de media.
