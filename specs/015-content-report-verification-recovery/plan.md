# Implementation Plan: 015 Recuperación de verificación en Reports

**Branch**: main | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)
El identificador de los scripts SDD no cambia la rama real.

## Summary
Una edición productiva: adaptar la clasificación 400 de contentReportFlow.ts mediante classifySubmissionFailure existente. UI, traducciones, reset y contrato backend intactos.

## Technical Context
Astro/TypeScript existentes, Node 24.14.1, Chrome/CDP local, WebSocket nativo. Sin nuevas dependencias, almacenamiento o servicios. Frontend estático + controlador Reports existente. Backend solo lectura para inspección/QA con doubles; nunca Strapi runtime ni SQLite.

## Constitution Check
Pre/post diseño PASS: I no cambios editoriales; II static-first; III reset/token y privacidad específica Reports intactos; IV sin datos reales; V helper existente, un archivo productivo; VI matriz CA/ES/EN; VII frontend solo, contrato entre repos intacto. No excepciones.

## Project Structure / Closed allowlist
Único archivo productivo permitido:
- `src/lib/contentReportFlow.ts`

Archivos de proceso permitidos:
- `.specify/feature.json`
- `specs/015-content-report-verification-recovery/spec.md`
- `specs/015-content-report-verification-recovery/plan.md`
- `specs/015-content-report-verification-recovery/research.md`
- `specs/015-content-report-verification-recovery/data-model.md`
- `specs/015-content-report-verification-recovery/contracts/report-response.md`
- `specs/015-content-report-verification-recovery/quickstart.md`
- `specs/015-content-report-verification-recovery/tasks.md`
- `specs/015-content-report-verification-recovery/checklists/requirements.md`
- `specs/015-content-report-verification-recovery/qa.mjs`
- `specs/015-content-report-verification-recovery/qa-report.md`

Temporales propios en /tmp/TMPDIR para build/Chrome, eliminados al terminar; sin .env ni secretos reales. Enlace al node_modules existente. No modificar scripts 006/012/014, controller, UI, backend o dependencias.

## Implementation and validation
1. Baseline clasificador con ambos reasons y guardas estrictas.
2. Importar helper existente; ampliar union; mapear en rama 400. No nuevos retries ni cambios al consumidor.
3. Matriz unitaria de razones/status/envelopes. Regresión browser aislada de Reports; reutilizar evidencia funcional anterior de 006/Comunicats. Excluir el script histórico completo y su salvaguarda SQLite de la ruta 015.
4. Build completo con contenido sintético y fetch cerrado; navegador real con formulario, verificación, error, reset y nuevo token. CA/ES/EN y cuatro tipos; ambos reasons. Referencia inválida, 429/503 y cierre/reapertura como regresión. Bloquear peticiones no previstas.
5. Diff/allowlist/status, CONVERGE. Detener con safe to commit; no iniciar 016.

## Complexity Tracking
Sin excepciones; se reaprovecha el contrato estricto 012 sin duplicación.
