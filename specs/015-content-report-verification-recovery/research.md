# Research — 015

Preflight: frontend main b8a617c45de66db35bd1b8fbc4e3e9eb740b7e55 y backend main c2f405312bb7dcd8dc6bd1abce42d317e0e3e879, refs locales origin/main iguales, limpios, 0/0. Constitution 1.0.0 vigente; sin extensions.yml ni hooks. No SQLite.

## Contrato y consumidor
contentReportFlow.ts exporta success/limited/invalidReference/unavailable; clasifica todos los 400 como invalidReference. Único consumidor productivo: initForm en ese mismo módulo, inicializado desde ContentReportFlow.astro en detalles Agenda/Veus/Millorem/Comercio.
Backend público content-report-http devuelve 400 con ok:false y reason verification:required/invalid desde submission-verification; report:invalid-reference lo produce validación de payload. Un destino inexistente en Strapi no equivale a este 400: transporte actual puede devolver 503. No cambiarlo aquí.
El consumidor ya invoca resetSensitiveInput después de cualquier no-éxito: controller.reset limpia challenge, código, token, verified state; luego limpia email y honeypot. No limpia motivo/contexto. El botón depende de validación/verificación. Retry solo limpia error/enfoca email. No reenvío automático.

## Decisión mínima
Reutilizar classifySubmissionFailure de netlifySubmission.ts, introducido en 012: ya exige status 400, objeto no array, ok===false y reason exacta para verification-invalid. Scope content-report no tiene whitelist de pre-consumption-safe: no ampliar whitelist ni recuperación. En la rama 400 del clasificador Reports mapear únicamente verification-invalid a verificationRequired; resto conserva invalidReference. Añadir verificationRequired al union de respuesta.
Reutilizar data-verification-required y copy existente CA/ES/EN en ContentReportFlow.astro. No crear estado/copy duplicados ni helper nuevo. Dependencias acíclicas: ambos módulos usan controller; netlifySubmission no importa Reports y no ejecuta envíos al importar.
Alternativas descartadas: duplicar predicate exacto; migrar todo Reports a submitVerifiedSubmissionForm (cambiaría política específica de limpieza); modificar el controller o backend (innecesario).

## QA
Corrección tras incidente: QA 006 contiene grupos scope/schema/backend/function/client/integration/language/feature003. La evaluación inicial de doubles exclusivamente en memoria era incorrecta: feature003 lee SQLite para una salvaguarda SHA-256. No ejecutar este script en recovery. Reutilizar evidencia funcional anterior y completar navegador con el harness independiente 015. 014 aporta patrón existente de build aislado y Chrome/CDP sin dependencias. Nuevo harness de feature copia ese patrón y restringe red a fixtures. Pruebas unitarias usan import TS nativo Node 24, sin instalación. Baseline debe fallar para expectativas nuevas antes de editar producto. QA DOM usa controller real y HTTP sintético con tokens distintos/consumo, no proveedor real.
