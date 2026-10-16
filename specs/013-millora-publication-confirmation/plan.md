# Implementation Plan: Millora Publication Confirmation

**Branch**: main/main | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

## Summary
Añadir solo una variante contextual del texto de confirmación approve en el panel administrativo existente. Sin cambios de servicios, lifecycle, publicación, endpoints, estados ni UI pública.

## Technical Context
JSX/React 18 en Strapi 5.41.1; Node local 24.14.1. Dependencias existentes esbuild y React disponibles. No instalación. Una historia XS/S, una edición productiva.

## Constitution Check
I: decisión editorial informada. II: web static-first, sin rebuild automático. III: caso de defecto real de Millorem expresamente autorizado, sin tocar seguridad/publicación. IV: sin DB, servicios reales ni configuración. V: variante localizada, sin abstracción nueva. VI: catalán administrativo actual; cero impacto en CA/ES/EN públicos. VII: SDD frontend y UI backend explícitos. Gates antes/después del diseño PASS.

## Project Structure / Closed allowlist
Rutas relativas a cada repositorio:
- guiapineda-strapi: `src/admin/components/PrivateModerationImagePanel.jsx`: únicamente variante del mensaje de approve para millora.
- guiapineda-strapi: `scripts/qa/millora-publication-confirmation-qa.mjs`: QA pequeño dedicado con módulos/dobles existentes.
- guiapineda-astro: `specs/013-millora-publication-confirmation/**`: artefactos SDD/evidencias.
- guiapineda-astro: `.specify/feature.json`: selector local ignorado requerido por Spec Kit.
Todo lo demás read-only; ni servicios/lifecycle/schemas ni package/lock ni frontend público. Fuera de allowlist: STOP. No commit/push.

## Design decisions
1. El diálogo se construye en `ModerationLifecycleContent.runAction` dentro de `window.confirm` antes de setBusy/post.
2. `SECTION_BY_MODEL` convierte solicitud-millora en `millora`; no cambiar el mapa.
3. Mantener la rama comercio existente y añadir una rama millora antes del fallback genérico. Solo se modifica la expresión de mensaje, no la condición approve/cancelación ni el resto del handler.
4. Copy catalán: «Aprovar aquesta sol·licitud i publicar la millora a Strapi?\n\nAprovar publica la millora a Strapi. Si té una imatge pendent, es traslladarà a Media.\n\nLa web estàtica no s’actualitza immediatament: reflectirà el contingut després del build/deploy corresponent.»
5. Comercio mantiene aprobación sin publicación; agenda/veu/comunicat/foto_mes mantienen exactamente sus mensajes. Rechazo/inicio de revisión, errores y estado ocupado sin cambios.
6. QA transforma en memoria el JSX completo con esbuild local y expone solo en la copia de test el componente interno/mapa. VM carga únicamente React y dobles de design-system/hooks; post y window.confirm simulados. Usa el onClick del botón construido por el componente real. No backend runtime, imports de servicios, red, DB, temporales ni sockets.
7. QA --baseline demuestra la contradicción antes de modificar; modo normal valida copy, cancelación, endpoint/action/body/conteos, secciones restantes y acciones reject/start-review. Comparación diferencial contra git show del baseline fija invariantes: fuera de la expresión de confirmación de approve, el archivo debe ser idéntico.
8. Check aplicable: transformación JSX completa en memoria con esbuild y ejecución de handler. No `strapi build/develop/start`: no hace falta arrancar aplicación ni cargar config/DB para una variante textual. No afirmar build integrado/admin navegador completo; registrar limitación. Diff Git prueba lifecycle/publication sin cambios.

## Sequence
Reproducción segura → variante mínima → QA/regresión/check JSX → revisión allowlist y Git → CONVERGE → cierre sin commit/push.

## Complexity Tracking
Sin desviaciones constitucionales. No módulo productivo nuevo, no refactor. Sin research externo: toda la decisión se resuelve en código local existente. Sin desconocidos tecnológicos que requieran agentes de investigación.
