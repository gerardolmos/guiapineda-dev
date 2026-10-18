# Implementation Plan: 016 Comunicats language switch

**Branch**: main | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)
El identificador emitido por scripts SDD es independiente de la rama Git real main.

## Summary
Importar LanguageSwitcher existente en CommunicatSubmissionPage.astro y renderizarlo en una barra local anterior al formulario, fuera de pasos ocultables. Tres rutas literales existentes y etiqueta accesible localizada. Layout mantiene showLanguageSwitcher=false. No código cliente nuevo.

## Technical Context
Astro/TypeScript/Tailwind existentes; Node 24 y Chrome/CDP local sin dependencias nuevas. Sitio estático. sessionStorage de submissionDraft existente, sin alterar clave, allowlist o eventos input/change. Navegación normal carga nuevo controlador que borra verificación. El template es el único archivo productivo a editar. Backend no participa. QA real de DOM y navegación con endpoints simulados; build en temporal aislado sin .env y con CMS sintético.

## Constitution Check
Antes/después de diseño PASS: I identidad editorial intacta; II estático y sin runtime CMS; III no transportar autorización ni ampliar persistencia; IV no tocar datos/SQLite; V reutilizar componente y contratos existentes, sin dependencia; VI seis transiciones CA/ES/EN, móvil/escritorio; VII frontend solo, backend y contratos intactos. Sin excepciones.

## Project Structure / Closed allowlist
- Único productivo: `src/templates/CommunicatSubmissionPage.astro`.
- Estado SDD local: `.specify/feature.json`.
- Artefactos: `specs/016-comunicats-language-switch/` exclusivamente `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/language-switch.md`, `quickstart.md`, `tasks.md`, `checklists/requirements.md`, `qa.mjs`, `qa-report.md`.
- Temporales propios guiapineda-016-* fuera del repo para build/Chrome, eliminados en finally. Sin fixtures residuales.
No editar LanguageSwitcher, Layout, rutas, controllers, drafts, traducciones globales, backend, scripts históricos ni dependencias.

## Implementation and validation
1. Reproducir ausencia de selector local/global en template base y rutas existentes.
2. Reutilizar LanguageSwitcher, enlaces explícitos y label CA/ES/EN en template.
3. Build aislado con fetch cerrado a contenido sintético. Browser: seis transiciones en desktop y móvil, datos permitidos completos, archivo real sintético y verificación simulada anterior; validar no traslado sensible y volver a verificar.
4. Completar envío estricto 201 y limpieza de draft; reset nativo y recarga sin restauración. No reejecutar suites históricas que puedan leer SQLite.
5. Revisar diff/allowlist, limpieza y CONVERGE; parar sin commit/push.

## Complexity Tracking
Sin excepciones. No nueva abstracción. El componente ya disponible evita duplicación y mantiene accesibilidad existente.
