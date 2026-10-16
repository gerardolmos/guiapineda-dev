# Quickstart — 013

Desde guiapineda-strapi, con dependencias ya presentes:

```sh
node scripts/qa/millora-publication-confirmation-qa.mjs --baseline
node scripts/qa/millora-publication-confirmation-qa.mjs
```

El primer modo se ejecuta antes de editar producto: debe demostrar la negación falsa y comparar baseline conocido. El segundo debe pasar tras el cambio: 6 secciones × approve/reject × aceptar/cancelar, start-review, busy y fallo simulado; invariantes de copy ajeno/endpoint/action/body y cambio mínimo. Transforma JSX completo en memoria; no escribe outputs, no lee .env ni DB, no arranca Strapi ni usa red.

QA01: Millorem contenido de confirmación (FR01–03/SC01).
QA02: cinco secciones restantes approve y seis reject/start-review (FR04/SC03).
QA03: cancelar/aceptar/busy/error con mismas llamadas que baseline (FR05/SC02).
QA04: invariancia fuera de expresión, Git services/lifecycle/frontend/dependencias sin cambios (FR05–07/SC04).
QA05: check JSX completo, allowlist, CONVERGE (FR01–07).

No ejecutar build/start/develop de Strapi. Limitación deliberada: no E2E admin real ni build integrado; check JSX y handler aislado son proporcionales al cambio textual. Git status/diff de ambos repositorios al final; no commit/push.
