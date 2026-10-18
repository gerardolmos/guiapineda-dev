# QA report — Feature 016

Fecha: 2026-10-17. Base frontend 5eab8e1ca7e396f521b766a8693f2d683a9fef81; backend c2f405312bb7dcd8dc6bd1abce42d317e0e3e879.

## SDD y análisis previo
SPECIFY PASS: 16/16 checklist; sin aclaraciones pendientes. PLAN PASS: un template, reutilización de LanguageSwitcher y mecanismos existentes. TASKS PASS: siete tareas, US1 selector/draft y US2 seguridad/regresión. ANALYZE read-only antes de producto: 11 requisitos cubiertos, 4 SC cubiertos, cero ambigüedades/duplicaciones/inconsistencias, cero CRITICAL/HIGH/MEDIUM/LOW, cero tareas sin requisito. FR01/02/09→T002–T004; FR03→T003/T004; FR04–08→T005/T006; FR10/11→T001/T006/T007. Constitution I–VII sin conflictos. Sin extensions.yml/hooks. CLARIFY omitido por contrato explícito.

## Baseline y cambio
`node specs/016-comunicats-language-switch/qa.mjs baseline`: PASS reproduciendo defecto en commit base: selector global oculto, ningún nav local y tres rutas existentes. Ejecutado antes de editar producto.
IMPLEMENT: solo src/templates/CommunicatSubmissionPage.astro, +18 líneas: import del componente existente, mapa de rutas actuales y barra local fuera de pasos. Sin lógica cliente nueva. Controller/draft/contratos de 012 intactos.

## Método de QA
Harness independiente auditado; no importa ni ejecuta scripts históricos. Build en copia temporal de src/public/config/package, enlace a node_modules existente; sin copiar .env. Preload sustituye fetch CMS por fixtures vacíos sintéticos y rechaza otros destinos. No servicios reales ni backend runtime. Navegador Chrome real vía CDP, ancho 1280 y 390, endpoints de verificación/submission simulados y tokens únicos registrados fuera del documento. Se conserva storage real y navegación real entre páginas; no se simula restauración de drafts.
Archivo PNG sintético en memoria antes del cambio. Cada transición comprueba los siete valores, envelope exacto, exclusión de imagen/consentimiento/token/código/verified, idioma_solicitud destino, bloqueo de envío hasta reverificar y consentir. Submit usa controller/transporte reales con respuesta sintética 201 ok:true, comprueba payload y limpieza del draft. Reset nativo + recarga comprueba que no reaparece texto guardado. Nav comprobado en tres pasos con etiqueta, aria-current, href/hreflang, focus/tabIndex y sin overflow horizontal. Sin ejecución real de proveedor de emails ni persistencia backend.

## Resultados
- Build aislado PASS: 43 páginas con CMS sintético vacío (las tres rutas de formulario están generadas).
- Browser PASS: 12 transiciones (seis dirigidas × desktop/mobile), 24 verificaciones y 12 submissions aceptadas.
- CA→ES, CA→EN, ES→CA, ES→EN, EN→CA, EN→ES: PASS en ambos viewports.
- Draft permitido conservado en 12/12; archivos/consentimiento/token/código/verified transportados: 0/12.
- Reverificación, consentimiento nuevo, payload en idioma destino, navegación a éxito, limpieza por éxito y reset/recarga: PASS 12/12.
- Selector accesible en autor/contenido/revisión y rutas correctas; sin overflow horizontal en ambos viewports.
- Peticiones externas: cero. CLEANUP confirma Chrome, listener y temporales eliminados.
- No QA histórico incompatible ejecutado; ningún acceso SQLite en Feature016.

## CONVERGE — PASS
Tras QA completo, prerequisites identifica correctamente Feature016. Revisados 11 FR, 4 SC, 6 escenarios de aceptación, cinco decisiones del plan y siete principios constitucionales. FR01/02/09: componente existente con nav fuera de pasos, tres rutas y dos viewports. FR03: siete campos/envelope exactos restaurados. FR04–07: exclusiones verificadas por DOM y storage. FR08: reverificación/envío/reset/éxito reales con límites HTTP simulados. FR10/11: backend limpio y QA independiente sin SQLite. Sin ampliación de persistencia ni cambio al protocolo 012.
Hallazgos missing/partial/contradicts/unrequested: 0/0/0/0. Severidades CRITICAL/HIGH/MEDIUM/LOW: 0/0/0/0. No tareas añadidas; tasks.md intacto durante el análisis. Registro de finalización T007 posterior a CONVERGE.

## Estado final
ALLOWLIST PASS: un archivo productivo y diez artefactos de Feature016; .specify/feature.json es estado local ignorado. Diff productivo +18 líneas, git diff --check PASS. No .env, dependencias, rutas, controller, drafts, otros formularios o backend modificados. Frontend HEAD sigue en base; backend limpio y HEAD esperado. Sin procesos de QA activos ni directorios temporales guiapineda-016-* residuales. No commit, push, staging ni deploy.
SPECIFY/PLAN/TASKS/ANALYZE/IMPLEMENT/QA/CONVERGE PASS. F05 resuelto. Scope respected YES; SQLite accessed NO; blockers 0; safe to commit YES.
