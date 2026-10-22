> HISTORICAL / SUPERSEDED BY RATIFIED SPLIT (2026-10-18). Not active implementation requirements. See spec.md, plan.md, tasks.md and deferred-follow-up.md. The earlier email atomicity claim is withdrawn by the installed-code evidence in contracts/terminal-scalars.md.

# Ownership y carreras — contrato existente vs garantía necesaria

## Mapa de referencias
storePrivateSubmissionImage: normaliza Sharp → crypto.randomBytes(16) → archivo privado wx → devuelve ID. No ledger de owner ni transacción con documento.
createInternalSubmission/createCommerceSubmission: asignan IDs recién generados a imatge_quarantena_id (cinco secciones) o principal/logo/galería (Comercio); luego documents.create. En fallo eliminan blobs creados como rollback.
Moderation.loadSubmission lee refs; private-moderation-image lee ref y sirve preview autenticado, null/ID inválido→404 antes de filesystem. approve genérico promueve a Media, actualiza estado/ref=null/email=null y borra privado. Millora además publica; Comercio aprobado conserva refs privadas. reject genérico actualiza ref=null y luego delete; Comercio actual conserva refs.
Admin: guard protege refs Comercio; para otras cinco no se encontró guard equivalente. Campo private/hidden no es garantía de exclusividad; no hay constraint único cross-type. Cleaner: colecta refs de las seis secciones, lista archivos y considera huérfano ID ausente del snapshot con edad>=24h; no revalida bajo exclusión antes de delete.

Owner lógico esperado: solicitud que recibió upload; estado active o aprobado-Comercio puede necesitar blob. Cinco secciones aprobadas usan Media promovido, cuyo borrado queda fuera de cleanup privado. Rechazo/expiración solo elimina privado si finalidad terminada y ownership acreditado. Activos compartidos: POSSIBLE bajo el contrato persistido actual (sin exclusividad transversal). No hay caso de uso de compartir en formulario público, pero ausencia de ese caso NO equivale a IMPOSSIBLE por contrato. Admin/servicios autorizados sin guard transversal pueden persistir mismo string; el schema no lo prohíbe. No se afirma que haya datos compartidos reales.

## Regla necesaria (NO garantizada actualmente)
Borrar ID solo si formato seguro, archivo en cuarentena privada, ningún Media/activo publicado afectado, estado/fin de finalidad autorizados, ownership exclusivo acreditado y ningún writer puede introducir/cambiar su referencia o promoverlo desde la comprobación hasta finalizar delete. Para huérfanos además no debe existir creación/upload en curso que vaya a asignarlo. Check ausente, lectura fallida o exclusividad incierta→NO DELETE. Un ID impredecible evita colisiones prácticas, no ofrece exclusión frente a copiar ref ni transacciones.

| Caso | Garantía existente / problema | Requisito para resolver |
|---|---|---|
|1 cleaner vs create|archivo antecede documento; gracia24h reduce ventana, no acota creación colgada|reserva/serialización que incluya create antes del snapshot/delete|
|2 reject vs otro writer|lock por solicitud no cubre writer ajeno|impedir reasignación cross-request y coordinar delete con writes|
|3 ref cambia después de scan|TOCTOU; recheck solo desplaza ventana|decisión y delete bajo exclusión efectiva|
|4 retry upload|nuevo ID por intento; huérfano viejo posible|rollback y distinguir intento vivo, no reusar ref sin ownership|
|5 doble reject|Map serializa ese servicio en proceso, segundo ve terminal|no-op cleanup verificable, coordinación resto writers|
|6 doble cleaner|sin lock conjunto, find/unlink puede ENOENT concurrente|ausencia segura y exclusión; no duplicar completed|
|7 asset missing|delete retornafalse si ya ausente en find|aceptar ausencia; ENOENT entre find/unlink debe tratarse como ausencia|
|8 ref presente/blob ausente|snapshot protege ID inexistente|cleanup terminal retira ref tras comprobación; no borrar otros blobs|
|9 blob presente/ref retirada|huérfano candidato tras24h|coordinar con reasignación/promoción, no asumir seguridad temporal|
|10 approve/promote vs cleanup|lock per-request no cubre cleaner/global refs|proteger desde lectura hasta promoción/commit; nunca borrar Media|
|11 dos solicitudes mismoID|collector Set pierde multiplicidad; schema no unique global|índice de owners durante análisis y fail closed; guard transversal|
|12 cleanup parcial|filesystem y documento no atómicos|refs durables + retry, no completed si falla; H01 igualmente obligatorio|

## Soluciones evaluadas
RandomID: útil para generación, no prueba owner. Grace24h: protección heurística, no garantía. State gating: necesario, insuficiente para writers concurrentes. Recheck/compare: insuficiente sin exclusión del intervalo. Lifecycle ordering: reduce ventanas pero no serializa otros writers. Servicio único: solo funciona si TODOS los writers/cleaner son obligados a pasar por él y existe exclusión real. Map actual no cubre esos caminos ni procesos distintos. Una reserva durable/transacción coordinada/lock extendido sería diseño nuevo, no mecanismo existente comprobado. No se asume single-instance ni se inventa infra desplegada.

Conclusión: concurrency contract defined NO como contrato ejecutable demostrado; requisitos sí enumerados. H01 BLOCKER. STOP según prohibición de nueva coordinación/locking no aprobada. No declarar IMPOSSIBLE sharing hasta asegurar enforcement. Idempotencia secuencial viable; seguridad concurrente no resuelta.
