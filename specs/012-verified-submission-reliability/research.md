# Research — Feature 012

## R1. Recuperación transversal sin flows

**Decision**: WeakMap privado en emailVerificationController y puente importado por el transporte.
**Rationale**: los cinco flows ya inicializan el controlador, pero tres descartan su retorno.
reset() (líneas 266–281) borra token/challenge/estado/código/timer, no datos. El evento existente
(líneas 161–171) recalcula disponibilidad de envío. WeakMap evita retener formularios desmontados.
**Alternatives considered**: cinco callbacks/ediciones de flows amplían allowlist; evento global
introduce suscripciones y doble reset; limpiar solo hidden deja estado interno incoherente.

## R2. Clasificación basada en evidencia

**Decision**: contrato cerrado de scope + status + JSON ok:false + reason conocido; desconocido
siempre ambiguous. Separar stage de consumo de certeza de persistencia.
**Rationale**: cinco handlers validan multipart, imagen y payload antes de consume; 400 puede ser
validación o verification:invalid. 503 submission:unavailable ocurre tras consumo, pero engloba
red/timeout/contrato inválido y no demuestra ausencia de registro. 503 verification:unavailable
no permite saber si GETDEL se ejecutó. Ver contracts/submission-reliability.md.
**Alternatives considered**: status aislado, regex de prefijos y copiar la clasificación comercial
literalmente son demasiado amplios. Cambiar handlers para añadir fases no es necesario.

## R3. Mensajes existentes

**Decision**: el componente común declara texto y destino del párrafo de error; el controlador
sustituye su texto antes del rethrow. Scope solo determina wiring, nunca política de recuperación.
**Rationale**: catches en agendaSubmissionFlow:1031, comunicatSubmissionFlow:710, veuSubmissionFlow:717, milloraSubmissionFlow:839 y fotoMesSubmission:302
muestran textos genéricos ya presentes. Añadir otro aviso dejaría mensajes contradictorios. Los
párrafos son texto simple y los catches no reasignan textContent.
**Alternatives considered**: nuevo mensaje junto al antiguo es contradictorio; editar cinco
componentes fuera de allowlist es innecesario. No usar MutationObserver para competir con catches.

## R4. Contrato y alcance de F03

**Decision**: validar 201 + objeto JSON ok true en el helper interno compartido, sin cambiar Strapi.
**Rationale**: backend src/api/internal-submission/controllers/internal-submission.js:102–105
produce exactamente ese éxito para seis solicitudes y dos denuncias. El helper frontend actual
solo comprueba response.ok en líneas 371–375. Moderación no lo consume.
**Alternatives considered**: exigir receipt/documentId cambia contrato; aceptar cualquier 2xx
reproduce F03. El helper histórico createStrapiSubmission no forma parte del circuito activo.

## R5. Deadline completo

**Decision**: carrera acotada de fetch + json + validación, AbortController único, finally exterior
con limpieza de timer y comprobación de plazo tras parseo síncrono. Mantener 15 s.
**Rationale**: hoy el timer se limpia al recibir respuesta (strapi-submission.mjs:367–369), antes
de cualquier body. Mover solo el finally cubre fetch real abortable pero no garantiza cierre de
un body/doble que ignore señal. Carrera y abort tienen funciones complementarias.
**Alternatives considered**: timer nuevo para body amplía presupuesto; timeout solo headers no
cumple SPEC; dependencias nuevas no aportan valor.

## R6. QA disponible

**Decision**: harness específico, sin jsdom ni instalaciones; Node24 assert/VM para módulos reales
con fronteras reemplazadas, DOM mínimo y Chrome CDP para comportamiento real. Adaptar únicamente
patrones necesarios de scripts QA 009/011, sin refactorizarlos ni importarlos como librería con side effects.
**Rationale**: Node v24.14.1 y Chrome local observados. package.json no declara jsdom, ruta local
node_modules/jsdom ausente. QA existente usa DOM mínimo y Chrome, build aislado y cleanup por ownership.
commerce-submission-qa.mjs:515/537 tiene dobles 204 incompatibles; multisection-reporting-qa.mjs:923
ya usa 201 ok true. Pruebas existentes escriben fixtures: no ejecutadas en PLAN.
**Alternatives considered**: assertions de texto fuente no prueban recuperación; servicio real
viola restricción; instalar navegador/framework no es necesario.

## R7. Límites de regresión

**Decision**: puente invocado solo por submitVerifiedSubmissionForm, cinco scopes. Comercio y
reportes usan sus transportes existentes y no se suscriben a recuperación F01.
**Rationale**: Comercio decide requiresReverification y llama reset; comunicat report resetea en
catch; multisección además limpia email. Una política nueva global rompería minimización existente.
**Alternatives considered**: unificar los ocho clientes excede alcance.

## Conclusión de investigación

Sin bloqueos ni expansión de allowlist. SPEC y Constitution compatibles. Research asistido por
subagente read-only conforme a speckit-plan; la decisión y los artefactos se consolidan en este plan.


## Correcciones de ANALYZE — 2026-10-16

- A01 (HIGH, resuelto en SDD): el comando multisección sin argumentos ejecuta feature003, que lee `.tmp/data.db` en la línea 1407 del QA existente. Ejecutar únicamente los siete grupos explícitos scope/schema/backend/function/client/integration/language. No ejecutar feature003 ni afirmar que pasó la suite completa histórica. Su regresión funcional de denuncia comunicat queda cubierta por T043 y los ocho handlers del harness nuevo; no se sustituye ni se ejecuta la comprobación histórica del hash SQLite.
- A02 (HIGH, resuelto en SDD): el modo --transport de QA Millorem usa HTTP 200 como éxito y un objeto sin controlador. No ejecutarlo como gate compatible ni modificarlo: trasladar sus seis casos funcionales al harness 012, con 201 y controlador registrado. Mantener --dom de ambos QA de drafts. Esto conserva cobertura y la allowlist; no convierte fallos esperados en PASS ni rebaja el contrato.
- A03 (MEDIUM, resuelto en SDD): los tests positivos/de preservación no tienen que fallar en baseline; T014 valida solo inicialización de T013, y T017 valida el reset conectado. Las razones de tabla que son inalcanzables en parsers se comprueban sintéticamente, distinguiendo esa evidencia de integración real.

Estas correcciones no ejecutan QA, no cambian producción ni requieren archivos nuevos fuera de la allowlist. El diseño de navegación mantiene destinos y caller actuales; solo evita reclasificar aceptación confirmada dentro del helper, sin rediseñar los catches de los flows. El build aislado es validación local, no un nuevo mecanismo de rebuild/publicación.
