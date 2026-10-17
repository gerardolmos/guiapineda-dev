# QA 015

Requisitos: Node y dependencias existentes, Chrome local. No arrancar Strapi ni usar servicios reales.

```sh
node specs/015-content-report-verification-recovery/qa.mjs baseline
node specs/015-content-report-verification-recovery/qa.mjs unit
node specs/015-content-report-verification-recovery/qa.mjs browser
```

Baseline carga versión de clasificador del commit base b8a617c45de66db35bd1b8fbc4e3e9eb740b7e55 y confirma las dos clasificaciones incorrectas. Unit prueba fuente actual. Browser compila fuentes en copia temporal con respuestas CMS sintéticas en memoria; prueba controller/UI real con endpoints de verificación/report simulados y consumo de token. No emails reales ni datos/DB. Limpiar Chrome/listener/temporales en finally. Resultados en qa-report.md.

## Recovery autorizado
Reutilizar baseline y 42 unit tests PASS anteriores; ejecutar únicamente `node specs/015-content-report-verification-recovery/qa.mjs browser` y checks finales. No ejecutar el script histórico multisection-reporting-qa.mjs: su grupo feature003 lee SQLite como salvaguarda de hash. El harness 015 no importa ni ejecuta ese script, no referencia el backend ni una DB; usa fuentes frontend, build temporal y respuestas sintéticas. La regresión funcional de Comunicats ya observada se conserva como evidencia previa, sin repetir la salvaguarda incompatible. Incidencia original y límites de evidencia en qa-report.md.
