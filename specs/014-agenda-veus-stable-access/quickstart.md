# Validación local 014

Prerequisitos: Node local, node_modules ya instalado, Chrome en /Applications/Google Chrome.app. No instalar nada ni arrancar backend.

Ejecutar desde frontend:

```sh
node specs/014-agenda-veus-stable-access/qa.mjs baseline
node specs/014-agenda-veus-stable-access/qa.mjs
```

Baseline usa SiteFooter de HEAD y confirma ausencia de acceso con cero publicaciones. El segundo comando compila copias aisladas para vacío y contenido sintético; verifica navegación en CA/ES/EN con Chrome/CDP. Cada copia excluye .env y usa fetch cerrado en memoria. Se limpian procesos y temporales propios al terminar. No envíos de formularios, acceso SQLite, backend ni servicios reales.

Esperado: build PASS por escenario, seis recorridos Home → índice → formulario por viewport y escenario, detalles/filtros publicados, destinos previos y menú móvil intactos. Registrar resultados en qa-report.md. Limitación deliberada: datos sintéticos, no integración CMS real.
