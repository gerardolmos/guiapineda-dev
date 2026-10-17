# Implementation Plan: 014 Agenda y Veus

**Branch**: `main` (sin commit/push) | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)
El identificador de feature de los scripts es independiente de la rama Git real.

## Summary
Resolver F02 con dos enlaces permanentes en el footer existente. F06 NOT_INCLUDED; véase research.md.

## Technical Context
Astro 7 del proyecto, TypeScript y diccionarios JSON existentes, Tailwind existente. Web estática en CA/ES/EN, móvil/escritorio. Sin almacenamiento, servicios, dependencias ni consultas nuevas. Dos enlaces HTML, sin JS adicional. Frontend público exclusivamente; backend y contratos API sin cambios.
Testing: build Astro con fixture en memoria y Chrome/CDP local, sin servicios reales; comprobar baseline vacío antes de editar y después vacío/con contenido.

## Constitution Check
Gates antes/después de diseño: PASS.
I: sin cambios editoriales. II: HTML estático. III: formularios/seguridad intactos. IV: Git backend solamente, sin DB/servicios. V: lista existente y dos entradas, sin abstracciones. VI: tres diccionarios, seis rutas y pruebas responsive. VII: un repositorio productivo, contrato backend sin cambios.

## Project Structure / Closed allowlist
Únicos archivos productivos editables:
- `src/components/SiteFooter.astro`: dos URLs y dos entradas al final de navigationItems, conservar las cinco previas.
- `src/i18n/ca.json`: footer.agenda y footer.veus.
- `src/i18n/es.json`: mismas claves.
- `src/i18n/en.json`: mismas claves.

Archivos de proceso permitidos (lista cerrada):
- `.specify/feature.json`
- `specs/014-agenda-veus-stable-access/spec.md`
- `specs/014-agenda-veus-stable-access/checklists/requirements.md`
- `specs/014-agenda-veus-stable-access/plan.md`
- `specs/014-agenda-veus-stable-access/research.md`
- `specs/014-agenda-veus-stable-access/data-model.md`
- `specs/014-agenda-veus-stable-access/contracts/navigation.md`
- `specs/014-agenda-veus-stable-access/quickstart.md`
- `specs/014-agenda-veus-stable-access/tasks.md`
- `specs/014-agenda-veus-stable-access/qa.mjs`
- `specs/014-agenda-veus-stable-access/qa-report.md`

QA crea únicamente temporales propios en /tmp, sin .env, con enlace a node_modules existente. No modificar configuración, lockfile, scripts previos, rutas ni índices. Detener ante necesidad de archivo productivo fuera de lista.

## Execution
1. Completar SDD y ANALYZE; cobertura de 10 FR, sin HIGH/BLOCKER.
2. QA baseline: render estático vacío, verificar ausencia de accesos en Home/Tauler y CTA intactos.
3. Implementar entradas y copy CA/ES/EN según contrato.
4. Builds aislados vacío y publicado; probar enlaces desde Home/Tauler/Sobre, índices, CTA y detalles, menú móvil, filtros de Tauler, foco y destinos previos.
5. Revisión de diff/status, informe QA y CONVERGE. No commit/push.

## Complexity Tracking
Sin excepciones constitucionales. Cuatro archivos productivos; los tres diccionarios evitan incrustar un segundo sistema de traducción en el footer.
