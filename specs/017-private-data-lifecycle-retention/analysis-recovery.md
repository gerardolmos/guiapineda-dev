> HISTORICAL / SUPERSEDED BY RATIFIED SPLIT (2026-10-18). Not active implementation requirements. See spec.md, plan.md, tasks.md and deferred-follow-up.md. The earlier email atomicity claim is withdrawn by the installed-code evidence in contracts/terminal-scalars.md.

# ANALYZE recovery —2026-10-18

## Resultado: FAIL, STOP sin IMPLEMENT
Nombres según última instrucción: B01 transversal/email/actividad; H01 media. analysis.md anterior permanece como historial y usa nomenclatura inversa. Este informe y spec/plan revisados son la referencia actual; matrices históricas no autorizan ampliaciones.

B01 email RESOLVED IN DESIGN: mapa de seis secciones y subscriber común de persistencia con email null en transición terminal, predicado activo para email no-null sin transición, rechazo de batches no seguros, conflicto por cero filas y sin actualización recursiva. No hubo QA/implementación; ver contracts/lifecycle-activity.md.
B01 actividad BLOCKER: timestamps actuales insuficientes para actividad semántica. Nuevo last_activity_at privado/servidor propuesto, no autorizado; fallback legacy no inventado. Activación de caducidad y representación de su resultado requieren diseño adicional. No declarar60d listo.
H01 BLOCKER: compartir referencia es POSSIBLE en contrato persistido actual, aunque flujo público no lo ofrezca. Exclusividad/coordinar intervalos de escritura y filesystem no demostrada; Map existente no cubre todos writers/cleaner ni procesos. No se presupone locking existente. Doce escenarios analizados, sin pruebas reales ni promesa de seguridad por gracia.

| ID actual | Tipo | Severidad | Evidencia | Acción |
|---|---|---|---|---|
| B01-activity | missing | BLOCKER | updatedAt técnico, review timestamps insuficientes; falta campo autorizado/legacy y resultado de caducidad | decisión de diseño/schema y partición antes de tareas implementables |
| H01-media | partial | BLOCKER | snapshot referencias + unlink sin exclusión transversal, guard solo Comercio | resolver protocolo coordinado o suspender destrucción; STOP ante nuevo locking necesario |

HIGH0. MEDIUM sin disposición0: Admin accepted with explicit fixture tests(T006); incertidumbre física accepted como límite de diseño sinDB, cualquier actuación DB prohibida. No pruebas PASS inventadas. Low previos no sustituyen estos dos blockers; no justifican implementación.

## Admin
Causa E (fixture insuficiente/no ejecutado) y C (copy incorrecto), no A/crash observado ni D/lectura filesystem con null. Código validaID antes de readPrivateSubmissionImage, devuelve404, panel tiene missing. Activo, rechazado null, aprobado con materiales tienen diseño de presentación compatible; cambio mínimo copy/resultado pending, no refactor. Admin null compatibility DESIGN PASS; render/handlers real o aislado NO probado. Ninguna inferencia de test PASS.

## Schema / migration / datos
Dos optional de Comercio permanecen propuesta aprobada. Campo conceptual last_activity_at adicional en seis schemas necesario para el contrato preciso elegido: schema adicional→STOP. Implementarlo exige soporte persistido de columna; DDL/migration física definitivamente necesaria en DB real: UNCERTAIN (no inspeccionada). No reducir a cambio meramente lógico el campo nuevo. Sin migración generada, comandos, introspección, datos, SQLite, bootstrap o código. No actualizar tipos generados.

## Frontera
Recomendar división, sin nuevas features: invariantes terminales y Comercio separados de actividad/caducidad por nuevo schema, bootstrap legacy y representación de resolución, no por tamaño de tareas. Media sigue bloqueada aun separada. No aprobar parcialmente IMPLEMENT por haber resuelto email. Ninguna decisión jurídica de retención publicada; materiales de Comercio aprobados preservados. Datos requeridos de otras secciones no se limpian con sentinelas/bypass.

## Coherencia y trazabilidad
SPEC recuperado PASS como especificación honesta de requisitos/gates; PLAN recuperado PASS como plan de revisión bloqueado, no diseño completado; TASKS recuperadas PASS como ocho tareas de gates/validación que sustituyen las13, no backlog implementable.11FR/4SC/9 escenarios de aceptación; mapa:FR01→T003, FR02/05/06/09→T002/T005, FR03/04→T004, FR07→T001/T007, FR08→T006, FR10/11→T001/T007/T008. SC01→contrato lifecycle/T003, SC02→media/T005, SC03→actividad/T007, SC04→T008. Constitución I–VII revisada, sin autorización para infringir integridad de datos. No inconsistencias ocultadas, no tasks de código que asuman resolución de blockers.

## Verificación de alcance
Solo SDD017 modificado. Backend limpio, frontend sin diff productivo, HEADs base conservados. No nuevos procesos/fixtures ni QA ejecutable. No commit/push/deploy. Safe to authorize IMPLEMENT:NO. Siguiente paso: decisión humana sobre división conceptual y permiso de diseño adicional de actividad/coordination; no migración implícita.
