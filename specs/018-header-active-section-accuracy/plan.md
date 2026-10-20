# Implementation Plan: Header Active Section Accuracy

**Branch**: main | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)
**Status**: Diseño únicamente; IMPLEMENT/QA/CONVERGE NOT_STARTED.

## Summary
Cambiar únicamente la selección activeSection de src/components/SiteHeader.astro: después de la normalización existente, reconocer /agenda y /veus exactos o seguidos de / y producir null antes del fallback guide. Conservar intactas las otras condiciones, navigationItems, renderizadores, clases y scripts. No nuevo helper/archivo productivo ni cambio global de semántica.

## Technical Context
Astro y Tailwind instalados; versiones declaradas package.json ^7.2.4/^4.3.3, no actualización. HTML estático, props pathname desde Astro.url.pathname. Ningún modelo persistente, API o almacenamiento nuevo. Escala: dos familias de rutas, tres idiomas, dos variantes del mismo encabezado. Sin JS de cliente adicional ni llamadas de red. Validación futura proporcional mediante render del componente real y comparación baseline/final, sin arrancar la aplicación/CMS.

## Constitution Check
I: orientación de producto local, sin cambios editoriales. II: generación estática conservada. III: ningún flujo privado/verificación/moderación tocado. IV: ninguna DB/SQLite o dato real. V: condición mínima en un archivo, sin dependencia/refactor. VI: matriz CA/ES/EN y navegación preservada. VII: frontend exclusivamente, backend limpio. Gates pre y post diseño PASS; ninguna excepción constitucional.

## Project Structure / exact scope
SDD: spec.md, plan.md, tasks.md, research.md, data-model.md, quickstart.md, contracts/header-navigation.md, checklists/requirements.md en specs/018-header-active-section-accuracy/.
Único archivo de producto propuesto: src/components/SiteHeader.astro.
Tras autorización, único harness propuesto: specs/018-header-active-section-accuracy/qa.mjs; informe futuro qa-report.md en el mismo directorio. No crearlos ahora. No cambios a scripts históricos, package/lock, .env, config, estilos, rutas o backend. Cualquier ampliación requiere decisión previa.

## Design and validation phases
1. Baseline: inventario de rutas y render del header real con pathname/idioma sintéticos, reproduciendo guide/aria-current incorrectos en Agenda/Veus.
2. Corrección local: condición con frontera de segmento, usando pathWithoutLanguage ya normalizado. null usa los renderizadores actuales: active=false, atributo omitido y clases inactivas existentes.
3. Validación: 36 combinaciones de rutas afectadas × viewport; variantes de barra final; controles fuera de scope y prefijos parecidos; comparar DOM y estilos visibles con baseline. No pruebas que reimplementen la condición como único oráculo.
4. Cierre futuro: revisión exacta de diff, resultados y límites; CONVERGE solo después de implementación autorizada/QA. No commit/push/deploy automático.

## Risks / bounded decisions
No enlace Agenda/Veus en header: ninguno activo; no trasladar estado a Tauler ni añadir enlaces. Evitar startsWith('/agenda') sin frontera, que afectaría categorías de nombre parecido. No generalizar los startsWith históricos de otras secciones. La deuda de foco del footer queda fuera. El harness aislado demuestra el header real, no integración CMS ni todos los layouts; revisar estáticamente que Layout sigue pasando Astro.url.pathname y que las rutas existentes no cambian.

## Workflow scope
Sin extensions.yml: no hooks. Se usan plantillas locales resueltas por common.sh. No se cambia .specify/feature.json: la autorización permite solo artefactos018; los setup scripts que lo persisten se sustituyen por composición de plantilla y resolución explícita sin persistencia. No investigación arquitectónica ni reapertura017/B03.
