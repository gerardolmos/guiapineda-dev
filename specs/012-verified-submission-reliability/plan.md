# Implementation Plan: Verified Submission Reliability

**Branch**: `main` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: `specs/012-verified-submission-reliability/spec.md`

## Summary

Resolver F01 mediante una política común en el transporte cliente y recuperación propiedad del
controlador de verificación. Resolver F03 exigiendo `201` y objeto JSON con `ok === true` durante
una operación acotada que incluye fetch y body. No cambiar los cinco flows, los ocho handlers ni
Strapi. No introducir reenvío automático, nuevas dependencias o persistencia.

El resultado técnico posterior al consumo no demuestra ausencia de persistencia. Todos esos
fallos reciben feedback prudente de ausencia de confirmación, aunque se conozca el consumo.

## Technical Context

**Language/Version**: TypeScript cliente, ESM JavaScript Functions; Node observado v24.14.1.
El frontend declara Node >=22.12.0. QA propuesta usa el Node 24 observado, no presupone que todas
sus APIs de pruebas estén disponibles en el mínimo de engines.

**Primary Dependencies**: versiones declaradas: Astro ^7.2.4, Tailwind ^4.3.3, Upstash Redis
^1.38.3 y ratelimit ^2.0.8, Resend ^6.25.0. Strapi 5.41.1 como contrato de referencia.
Ninguna instalación ni actualización prevista.

**Storage**: estado de verificación en memoria/DOM; drafts actuales en sessionStorage. GETDEL y
almacenamiento servidor permanecen iguales. Sin acceso a SQLite ni almacenamiento nuevo.

**Testing**: Node assert, dobles de fronteras, DOM mínimo de estilo existente y navegador Chrome
vía CDP como en QA 009/011. Chrome local presente; jsdom no está declarado ni presente en la ruta
node_modules/jsdom inspeccionada. No se instalará jsdom ni Playwright.

**Target Platform**: navegador CA/ES/EN, Functions Netlify y frontera HTTP interna Strapi.
**Project Type**: web static-first con participación dinámica controlada.
**Performance Goals**: timeout interno existente de 15.000 ms cubre fetch + lectura/parseo;
no modificar duración mínima del overlay ni añadir reintentos.
**Constraints**: cuatro archivos productivos; backend read-only; contratos existentes; no código
productivo, harness ni TASKS creados durante PLAN.
**Scale/Scope**: cinco formularios F01 × tres idiomas; ocho consumidores de F03.

## Constitution Check

Gates evaluados antes de research y reevaluados después del diseño: PASS, sin excepciones.

| Principio | Aplicación y evidencia de diseño |
|---|---|
| I | Sin publicación, comentarios ni cambios de moderación |
| II | HTML público estático; solo se modifica el circuito dinámico ya existente |
| III | GETDEL, scopes, límites, autenticación, privacidad y cuarentena intactos; reset no restaura tokens |
| IV | Sin DB, SQLite, schemas, migraciones ni servicios reales en QA |
| V | Código común existente, sin dependencias ni framework de QA general |
| VI | Mensajes comunes CA/ES/EN y regresión de Comercio/denuncias |
| VII | Solo guiapineda-astro cambia; contrato observado de guiapineda-strapi explícito |

No se necesita CLARIFY: se resuelven las decisiones técnicas en research. No hay contradicción
material con SPEC. Seguridad: solo se conservan tokens ante rechazo demostrado anterior al consumo;
lo desconocido invalida de forma conservadora, sin alterar los controles del servidor.

## Project Structure

### Documentation (this feature)

- `spec.md`, `checklists/requirements.md`: SPECIFY existente, sin cambios en PLAN.
- `plan.md`: diseño, allowlist, secuencia y riesgos.
- `research.md`: decisiones y evidencia viva.
- `data-model.md`: estado efímero y transiciones; ningún schema.
- `contracts/submission-reliability.md`: taxonomía, contrato y feedback.
- `quickstart.md`: QA futura reproducible y matriz de 30 casos.
- `tasks.md`: NO creado; corresponde a la fase siguiente.

### Source Code (repository root)

Allowlist definitiva propuesta de implementación, cerrada:

| Archivo | Responsabilidad permitida |
|---|---|
| `src/lib/netlifySubmission.ts` | Clasificar fallos del envío verificado; invocar recuperación común; mantener éxito y navegación |
| `src/lib/emailVerificationController.ts` | Registro por formulario, puente de recuperación y reset completo; actualizar feedback existente |
| `src/components/EmailVerificationBlock.astro` | Textos CA/ES/EN y referencia explícita al mensaje de error de cada scope F01 |
| `netlify/functions/_shared/strapi-submission.mjs` | Validar contrato 201/JSON/ok y timeout completo en createInternalStrapiSubmission |
| `scripts/qa/submission-recovery-qa.mjs` | Nuevo harness específico: unit, Functions, DOM, build/browser aislados y cleanup |
| `scripts/qa/commerce-submission-qa.mjs` | Solo actualizar los dos dobles de éxito 204 incompatibles por 201 con ok:true |

`scripts/qa/multisection-reporting-qa.mjs` se ejecutará como regresión, sin modificación prevista:
su doble ya devuelve 201 con ok:true. Si falla por una expectativa incompatible no observada,
se documentará y se solicitará ampliación antes de editar. Igual regla para cualquier archivo fuera
de la tabla. No se incluyen flows, handlers, backend, package.json ni lockfile.

**Structure Decision**: mantener módulos existentes; sin nuevo módulo productivo ni abstracción
compartida de QA. El único archivo nuevo ejecutable futuro es el harness específico justificado
por las matrices cruzadas y el timeout de lectura no cubiertos por las pruebas actuales.

## F01: Diseño común

1. `emailVerificationController.ts` mantiene un WeakMap privado por HTMLFormElement con la API
   inicializada y su operación de recuperación. Una segunda inicialización devuelve la misma API
   sin listeners duplicados. Registrar solo tras validar todos los controles requeridos.
2. Exportar desde ese módulo el tipo mínimo de fallo y una función de recuperación por formulario.
   El transporte importa esa función; el controlador NO importa el transporte. Sin ciclo y sin
   eventos globales ni strings de error usados como protocolo.
3. El transporte construye un error tipado con kind, status/reason opcionales, requestStarted y
   persistencia desconocida cuando aplica. Los catches existentes pueden seguir tratándolo como
   Error. La política se decide solo en el transporte; el controlador ejecuta la decisión.
4. Para rechazo seguro conservar estado; para verification-invalid, post-consumption-failure o
   ambiguous invocar exactamente una vez la primitiva reset() del controlador registrado.
   Nunca invocar form.reset(), simular input/change ni reinicializar el formulario.
5. El evento existente email-verification-change actualiza botones en los cinco flows. Durante
   esa emisión su flag submitting sigue activo; después su catch desbloquea sin rehabilitar una
   autorización inválida. El controlador es la única fuente de verdad del token/estado.
6. Antes de relanzar el error, sustituir el texto del párrafo de error de submission existente.
   El componente común proporciona data-submission-feedback-target según el mapa explícito del
   contrato. Buscar dentro del formulario, no globalmente. Los catches solo lo muestran/desplazan;
   no pueden dejar mensajes antiguos que afirmen un fallo definitivo o aconsejen reenvío sin verificar.
7. Los mensajes se reemplazan en cada fallo; no hace falta mutar pasos ni draft. Si falta el
   destino previsto, mostrar feedback en el bloque común y considerar la discrepancia fallo de QA,
   no ocultarla con un PASS. No editar automáticamente un flow para resolverla.
8. Si no existe controlador registrado, el transporte no inicia un envío: error de inicialización
   local, sin consumo. En páginas válidas el registro ya existe antes de pulsar enviar.
9. Construcción local de FormData/endpoint y fetch son etapas distintas: fallo antes de invocar
   fetch es seguro; desde la invocación, fallo de red/lectura desconocido es ambiguo. Validaciones
   locales de los flows siguen ocurriendo antes del helper y no cambian.
10. Una vez confirmada aceptación, separar la navegación de la clasificación de errores de envío:
    un problema de navegación no inicia recuperación/reenvío de una solicitud ya aceptada.
    Preservar navigation=caller de Millorem y el orden de limpieza de drafts existente.

No enviar automáticamente tras reset ni después de verificar. Mantener límites y expiraciones;
conservar un token por rechazo seguro no prolonga su vida. No registrar tokens ni cuerpos en errores.

## F03: Contrato y timeout

Modificar exclusivamente createInternalStrapiSubmission; dejar el helper histórico distinto
createStrapiSubmission intacto. Mantener multipart, nombres de archivos, secretos, destinos y scopes.

Aceptar solo response.status===201 y JSON completamente leído que sea objeto no null/no array y
ok estrictamente boolean true. No exigir Content-Type como requisito nuevo, documentId ni receipt;
no rechazar por propiedades adicionales. Toda desviación lanza un error sanitizado.

Conservar 15.000 ms. Una única carrera acotada incluye fetch, lectura y parseo de JSON, validación
final y comprobación de plazo monotónico. La rama de timeout aborta la misma señal y rechaza; una
rama principal tardía no puede producir éxito. Limpiar timer en finally exterior, después de leer
body, tanto en éxito como en rechazo; cancelar body pendiente cuando sea posible, sin esperar a una
cancelación bloqueada. No renovar el presupuesto al recibir headers. La carrera asegura cierre
incluso ante un doble de fetch/body que ignore abort. El parseo síncrono no se puede interrumpir con
un timer: comprobar plazo al terminar evita aceptar éxito tardío. No imponer tamaños nuevos aquí.

Los handlers existentes convierten cualquier error interno en 503 submission:unavailable. No se
agregan campos de respuesta ni se propagan detalles internos. La operación ya consumió token: F01
la clasifica post-consumption-failure, pero la persistencia sigue siendo desconocida. Comercio y
las denuncias continúan por sus propios catches, sin invocar el puente F01.

## Implementation Sequence (para fases posteriores)

1. TASKS derivará este plan y sus contratos sin ampliar allowlist. ANALYZE antes de IMPLEMENT si
   aparecen discrepancias; mantener SPECIFY/PLAN como referencia.
2. En el harness específico, fijar matrices de clasificación y contrato como pruebas que fallen
   ante el comportamiento actual; no duplicar algoritmos productivos en los oráculos.
3. Endurecer transporte interno y deadline; ajustar únicamente los dos dobles 204 comerciales.
   Validar F03 para ocho consumidores antes de mezclar resultados cliente.
4. Añadir taxonomía al helper cliente y registro/recuperación al controlador; verificar un solo
   reset y conservación de datos con DOM controlado.
5. Añadir feedback común CA/ES/EN y su destino por scope. Verificar textos finales después de
   ejecutar los catches reales, no solo después de llamar al helper.
6. Completar tests de Functions, recorrido nueva verificación y éxito, drafts e imágenes.
7. Build aislado con fixtures; browser simulado de cinco formularios × tres idiomas; regresiones
   de Comercio y ambas denuncias. Ningún build consulta CMS real.
8. Revisar diff, allowlist, seguridad, cleanup y Git. Registrar limitaciones reales; CONVERGE
   contra SPEC/PLAN/TASKS solo en la fase autorizada. Ningún commit/push implícito.

## Risks and Mitigations

| Riesgo | Mitigación | QA |
|---|---|---|
| Falso reset previo al consumo | Tabla cerrada scope/status/reason y fallo local separado | 01, 06 |
| Token consumido conservado | Todo desconocido ambiguo; reset de controlador | 02–06, 09 |
| Doble reset/listeners | WeakMap idempotente; solo helper F01 invoca puente una vez | 06, 25–27 |
| Pérdida de input/draft/archivos | No form.reset ni eventos de edición; snapshots antes/después | 07, 12 |
| Falso éxito | Status exacto, objeto y boolean; no respuesta.ok aislado | 13–21 |
| Ambigüedad presentada como no guardado | Persistencia separada de consumo y texto sustituido antes del catch | 03–05, 28–30 |
| Regresión Comercio | Puente solo cinco scopes; transporte interno compatible con contrato | 25 |
| Regresión denuncias | No tocar su reset, limpieza, payload o feedback | 26–27 |
| Timer termina en headers | Carrera sobre operación completa y finally exterior | 22, 24 |
| Aceptar otro 2xx | Contrato estricto para ocho consumidores | 17–19 |
| Divergencia lingüística | Copy común y comprobaciones en quince combinaciones | 28–30 |
| Excepción de navegación reclasificada | Separar aceptación del transporte de navegación | 11–12 |
| Tabla de razones obsoleta | Tests con respuestas reales de parsers/handlers y fallback ambiguo | 01–05 |

## Complexity Tracking

Sin violaciones constitucionales. El registro débil es necesario para acceder al controlador ya
inicializado sin editar cinco flows. Un puente directo y tabla cerrada evitan eventos globales,
regex de prefijos, reset indiscriminado y cambios en ocho handlers. No se convierte esta feature en
un sistema de idempotencia: un nuevo envío explícito después de incertidumbre podría duplicar
contenido; el feedback debe advertir de que el anterior pudo recibirse.

## Planning Verification

Preflight: main/main; frontend HEAD/origin/main 4355ee1c7c8207304bc5af3025ea994141e78990;
backend 47ca26a0a54fd1c0193afd659b6ba3657b264793; ambos 0/0; sin staged/modified; solo spec y
checklist 012 untracked en frontend. No cambios ajenos.
setup-plan --json devolvió BRANCH=012-verified-submission-reliability como fallback del selector
feature.json; git branch --show-current confirma main. No se creó/cambió rama.
No extensions.yml: sin hooks before/after_plan. No PLAN ejecuta pruebas productivas.


## Correcciones de ANALYZE — 2026-10-16

- A01 (HIGH, resuelto en SDD): el comando multisección sin argumentos ejecuta feature003, que lee `.tmp/data.db` en la línea 1407 del QA existente. Ejecutar únicamente los siete grupos explícitos scope/schema/backend/function/client/integration/language. No ejecutar feature003 ni afirmar que pasó la suite completa histórica. Su regresión funcional de denuncia comunicat queda cubierta por T043 y los ocho handlers del harness nuevo; no se sustituye ni se ejecuta la comprobación histórica del hash SQLite.
- A02 (HIGH, resuelto en SDD): el modo --transport de QA Millorem usa HTTP 200 como éxito y un objeto sin controlador. No ejecutarlo como gate compatible ni modificarlo: trasladar sus seis casos funcionales al harness 012, con 201 y controlador registrado. Mantener --dom de ambos QA de drafts. Esto conserva cobertura y la allowlist; no convierte fallos esperados en PASS ni rebaja el contrato.
- A03 (MEDIUM, resuelto en SDD): los tests positivos/de preservación no tienen que fallar en baseline; T014 valida solo inicialización de T013, y T017 valida el reset conectado. Las razones de tabla que son inalcanzables en parsers se comprueban sintéticamente, distinguiendo esa evidencia de integración real.

Estas correcciones no ejecutan QA, no cambian producción ni requieren archivos nuevos fuera de la allowlist. El diseño de navegación mantiene destinos y caller actuales; solo evita reclasificar aceptación confirmada dentro del helper, sin rediseñar los catches de los flows. El build aislado es validación local, no un nuevo mecanismo de rebuild/publicación.

### Ampliación autorizada — 2026-10-16

El usuario autoriza «Sí, corregir solo QA43 y continuar». Se permite editar exclusivamente QA43 de `scripts/qa/veu-draft-persistence-qa.mjs`: exigir el draft existente de Millorem y mantener ausencia en Foto/Comercio. Esta excepción reemplaza la prohibición de editar ese único caso; los demás QA históricos continúan read-only. B001 resuelto: drafts-resolved-evidence.log registra QA01–QA43 PASS.
