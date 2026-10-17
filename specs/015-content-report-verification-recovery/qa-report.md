# Feature 015 — ejecución detenida, NO safe to commit

Fecha: 2026-10-17.

## Resultado
SPECIFY/PLAN/TASKS creados; ANALYZE previo sin hallazgos de requisitos. Baseline reproduce ambos reasons incorrectos. Implementación mínima aplicada en src/lib/contentReportFlow.ts: reutiliza classifySubmissionFailure de 012 y retorna verificationRequired para ambas razones. 42 casos unitarios PASS.

## Infracción de alcance: acceso SQLite
Se ejecutó `node scripts/qa/multisection-reporting-qa.mjs` completo sin revisar suficientemente el grupo feature003. Ese grupo contiene en línea 1407 `fs.readFile` de `.tmp/data.db` del backend para calcular SHA-256 y compararlo con un hash esperado. El grupo terminó PASS: hubo lectura del archivo SQLite. No se ejecutaron consultas SQL ni escrituras por ese fragmento. Esto infringe explícitamente FR-10 y la prohibición del usuario. No se reproduce contenido de la base ni se vuelve a acceder al archivo.
La afirmación previa de research.md sobre QA exclusivamente en memoria fue una evaluación incorrecta para ese grupo; esta evidencia la corrige. Los ocho grupos imprimieron PASS, pero su ejecución NO cumple el límite de no acceso a SQLite y no acredita QA aceptable para esta sesión.

## Browser/build
Build aislado PASS, 58 páginas sintéticas, sin CMS real. Browser completó ambos errores para CA/Agenda, CA/Veus y CA/Millorem (6 recorridos) con limpieza sensible, contexto conservado, nuevo token y ausencia de retry automático. Falló al llegar a Comercio porque el fixture carece de activo:true y no genera esa ruta; no es evidencia de regresión del producto. No se corrigió ni repitió tras detectar la infracción SQLite. ES/EN y resto de matriz quedan pendientes.
Chrome propio, listener y temporales se limpiaron por finally, confirmado por salida CLEANUP.

## Estado de cierre
QA FAIL/incompleta; CONVERGE no ejecutado y no puede declararse PASS. Scope respected NO, SQLite accessed YES, safe to commit NO. Dos bloqueos: infracción explícita FR-10 y QA navegador incompleta. No se inicia 016 ni pre-spec F06/F08. No commit/push/deploy. Backend sin modificaciones Git; lectura de SQLite no debe confundirse con modificación backend.

## Próxima acción
Revisión humana de esta incidencia antes de autorizar cualquier continuación. Una continuación deberá excluir el grupo que lee SQLite o usar una QA que no acceda a datos reales; completar fixtures y matriz dentro de la allowlist. No modificar scripts históricos fuera de allowlist ni repetir la lectura.

## Recovery autorizado — revisión forense
El usuario autorizó completar exclusivamente QA pendiente. La sección histórica anterior se conserva íntegra. La operación en scripts/qa/multisection-reporting-qa.mjs:1407 fue fs.readFile seguida de SHA-256 y comparación con una constante: salvaguarda de integridad dentro del grupo de regresión feature003. No consultas ni escrituras en esa operación. La ejecución original se detuvo al detectar el incumplimiento.
No se vuelve a abrir, consultar, copiar, hashear ni inspeccionar el archivo DB. La fuente y el resultado previo documentan el carácter read-only; no permiten una certificación independiente del estado actual de sus bytes sin releerlo, cosa expresamente prohibida.
Prevención: quickstart/plan/tasks/research excluyen el script histórico de la ruta de ejecución; qa.mjs es independiente, sin imports del QA histórico ni rutas backend/SQLite. Solo copia frontend/public/config a temporal, enlaza dependencias existentes y sustituye CMS/HTTP por fixtures.
Comercio: HARNESS. La ruta exige comercio.activo === true y categoria.activa === true; el fixture omitía activo. Se añade activo:true al fixture, sin modificar producto.
Se reutilizan baseline y 42 unit tests PASS. Se repite únicamente browser/build aislado para completar la matriz y sus cuatro regresiones.

## Resultados recovery
- Unit: 42 PASS reutilizados, sin repetición. Baseline anterior reutilizado.
- Syntax check qa.mjs: PASS. Build aislado: PASS, 61 páginas sintéticas.
- Browser: CA/ES/EN PASS; 24 recorridos (3 idiomas × 4 tipos × 2 reasons). Incluye Comercio.
- Ambos errores presentan feedback localizado, limpian email/código/token/estado verificado, preservan motivo/contexto y requieren nueva verificación y envío manual. Token nuevo distinto; ningún reenvío automático ni endpoint inesperado.
- Cuatro regresiones browser PASS: report:invalid-reference, report:invalid-reason, 429, 503. Contexto opcional vacío, motivo y limpieza preservados. Éxito 201 probado tras cada recuperación; envelopes/status cubiertos por 42 unit previos.
- Comunicats: se reutilizan las aserciones funcionales previas del grupo feature003 (doubles y contrato/UI) y su código permanece intacto. No se reejecuta ni se acepta como validación de alcance la salvaguarda SQLite histórica.
- CLEANUP confirmado por salida del harness: Chrome, listener y temporales propios eliminados.
- Sin acceso SQLite durante recovery; sin arranque Strapi, cambios backend, dependencias, commit, push o despliegue.
- Diff productivo conservado exactamente: +8 líneas en src/lib/contentReportFlow.ts. Solo artefactos 015 adicionales; git diff --check PASS.

## CONVERGE posterior a QA — PASS
Prerequisites: feature015 resuelta correctamente; no extensions.yml ni hooks. Revisados 10 FR, 4 SC, 6 acceptance scenarios, las 5 decisiones de implementación/validación y 7 principios constitucionales. FR01/02: clasificador estricto y ambas razones; FR03: regresión invalidReference; FR04–07: controller real, contexto, limpieza y nuevo token/manual; FR08: contrato y backend intactos; FR09: 24 recorridos en tres idiomas; FR10: prohibición respetada durante recovery autorizado, sin borrar infracción inicial. SC01–04 cubiertos por evidencia unitaria previa y browser recovery.
Hallazgos missing/partial/contradicts/unrequested: 0/0/0/0; CRITICAL/HIGH/MEDIUM/LOW: 0/0/0/0. No tareas nuevas; tasks.md no se alteró durante el análisis CONVERGE. T006 se marca terminado al registrar el cierre después del análisis.
Estado final recovery: QA PASS, CONVERGE PASS, scope respected after recovery YES, blockers 0, safe to commit YES. La infracción original permanece y no se reclasifica como ejecución válida. Sin commit/push/deploy, sin Feature016. Frontend HEAD b8a617c45de66db35bd1b8fbc4e3e9eb740b7e55; backend HEAD c2f405312bb7dcd8dc6bd1abce42d317e0e3e879, limpio. Inspección de procesos por marcador propio: ninguno activo.
