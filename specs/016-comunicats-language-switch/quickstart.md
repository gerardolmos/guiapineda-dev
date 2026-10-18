# QA 016

Node/dependencias existentes y Chrome local. No iniciar Strapi ni usar servicios reales.

```sh
node specs/016-comunicats-language-switch/qa.mjs baseline
node specs/016-comunicats-language-switch/qa.mjs browser
```

Baseline lee template del commit base y demuestra ausencia. Browser build aislado y 6 cambios × 2 viewports, nuevos tokens, exclusiones, envío y reset. Todo temporal se elimina al terminar. No ejecutar suites históricas ni acceder SQLite. Resultados en qa-report.md.
