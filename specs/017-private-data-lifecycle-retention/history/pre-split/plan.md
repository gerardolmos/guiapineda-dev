# Plan revisado —017 B01/H01 recovery

Fecha2026-10-18. Solo SDD. Ver contratos lifecycle-activity.md y media-concurrency.md; reemplazan las suposiciones no demostradas del contrato terminal-cleanup original.

## Constitution / estado
I editorial intacto; II arquitectura sin cambios; III invariantes privadas explícitas; IV STOP por integridad/carreras/schema adicional, sin datos ni migrations; V no inventar locks/infra desplegados; VI entradas CA/ES/EN sin cambios; VII gobernanza frontend y producto backend separados. Diseño de email viable; caducidad y media bloqueadas. Ninguna implementación permitida.

## Lifecycle ownership
Creación autenticada interna y moderación existentes permanecen dueños del flujo. Admin usa Content Manager→document service→query engine; enforcement email debe residir en subscriber común del query engine para seis UIDs, registrado desde src/index.js. No seis hooks duplicados. Antes de create/update/updateMany: transición terminal incluye email:null en misma escritura; escritura de email no-null sin transición terminal añade condición atómica estado activo, para no sobrescribir terminal concurrente. Batch mixto sin condición segura se rechaza. No read-then-write sin predicado. Filtro cero coincidencias se devuelve como conflicto, nunca éxito ficticio. Operaciones terminales con email incluido se normalizan a null. Prohibir reapertura no autorizada. Sin update adicional dentro del callback ni recursión. Middleware de Document Service preserva permisos del guard Comercio y reporta conflictos; no sustituye subscriber para rutas query engine legítimas. Escrituras SQL crudas/migraciones no son rutas autorizadas de aplicación y permanecen prohibidas. QA aislado deberá verificar sintaxis/semántica where y compatibilidad de subscribers instalados antes de implementar.

## Schema
Aprobados en diseño previo: retirar required de solo nombre_contacto e imagen_principal_quarantena_id de Comercio, mantener private y longitudes. No modificar entrada Function/internal parser. Otras refs/contactos ya nullable, galería[].
Nuevo requisito conceptual NO autorizado: last_activity_at datetime privado en las seis solicitudes para medir ediciones relevantes independientemente de updatedAt. Es schema adicional: STOP. Sin generación de migration. No añadido a schema ni tipos. Al implementar requeriría capacidad de columna persistida; DDL concreto/estado físico real UNCERTAIN sin introspección. La flexibilidad de dos required existentes seguía siendo cambio lógico según generador; no confundirlo con añadir un campo.

## Activity contract
Fuente propuesta last_activity_at, servidor, creado con timestamp al aceptar solicitud; actualizar solo tras cambio efectivo en datos editoriales/contacto de solicitud o transición de revisión autorizada. No en noop, cleanup, retry, lectura, indexación o mantenimiento técnico. Sin aclaraciones trazadas actualmente: no inventarlas. Reglas y alternativas en contrato. Previos sin valor quedan fuera de caducidad automática, sin backfill silencioso desde updatedAt. Resolver bootstrap legacy requiere decisión posterior; no consulta a datos necesaria para diseñar. No enum de caducidad inventado ni admin ficticio; resultado/actor de caducidad y limpieza por sección pendientes de plan separado.

## Concurrency/media
No se ha encontrado mecanismo existente que serialice todos los writers de refs, upload y cleaner. Map por section/documentId solo protege startReview/approve/reject del mismo proceso. Recheck/gracia no excluyen writer entre check y unlink. H01 sigue BLOCKER; no afirmar que IDs aleatorios demuestran ownership. Requeriría prohibir reasignación de refs transversalmente y coordinar reserva de creación/publicación con delete de forma efectiva; hoy sería nueva coordinación/locking, no autorizada. No se elige ni introduce tecnología distribuida. Mientras esto no esté resuelto, no activar ninguna nueva destrucción automática. Casos y mapa en media-concurrency.md.

## Failure semantics / Admin
Se conserva diseño secuencial delete/missing→retirar ref→persistir, refs durables ante fallo y retry; su seguridad completa depende de H01. No tocar Media público. Logs códigos fijos sin Error crudo; no promesa exactly-once frente a crash.
Admin previo FAIL era E: fixture insuficiente/no ejecutado, NO crash observado; además C: texto de rechazo promete conservar imágenes. ID null es rechazado antes de leer blob, endpoint404 y panel missing. Cambio mínimo de diseño: copy de rechazo, resultado cleanupPending y refresco de preview; mantener copy aprobación. Campo texto genérico opcional admite vacío visual pero guard bloquea null activo. Tests activo/rechazado/aprobado, action failure y reintento obligatorios; no rediseño. Compatibilidad de DISEÑO PASS, ejecución no comprobada.

## Boundary / recomendación
División recomendada por razón técnica: enforcement terminal/email y nullability no necesitan reconstruir actividad histórica; caducidad requiere schema adicional, inicialización legacy y resultado/actor no definidos. Media cleanup, incluso dentro del primer bloque, NO puede implementarse hasta resolver H01. Orden: resolver protocolo ownership y contrato de invariantes terminales; diseñar por separado actividad/caducidad con permiso de campo y legacy; solo después analizar TASKS implementables. No se crea feature nueva ni se atribuye cierre a L06/L07.

## Límites de escritura
Actual: solo specs/017-private-data-lifecycle-retention/spec.md, plan.md, tasks.md, research.md, analysis-recovery.md, contracts/lifecycle-activity.md, contracts/media-concurrency.md, contracts/terminal-cleanup.md. Preservar analysis.md y analysis-data-matrix.md como evidencia histórica; no tocar producto. Allowlist futura de implementation del analysis anterior queda SUSPENDIDA: no incluye nuevo schema ni demuestra coordinación requerida. Ningún permiso implícito a carpetas o migrations.

## QA / decisión
Requisitos futuros: subscriber con actualizaciones simultáneas/masivas, create/admin/terminal en seis secciones; parsers estrictos de Comercio; Admin fixtures; doce escenarios media; reloj semántico y59/60/61, legacy-null y concurrencia. No ejecutar aplicación/DB. SPEC/PLAN recuperados como diseño fiel BLOQUEADO, no como diseño listo. Reanalizar después de decisiones humanas.
