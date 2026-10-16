# Quickstart y QA — Feature 012

## Estado y prerrequisitos

Guía para IMPLEMENT posterior, NO ejecutada en PLAN. El harness propuesto no existe aún.
No lanzar comandos de esta guía hasta que exista y se revise su aislamiento. Ningún resultado
se considera PASS por estar descrito aquí.

Usar Node 24.14.1 observado o compatible verificado, dependencias ya instaladas y Chrome local
como QA 009/011. No npm install. No iniciar Strapi, Redis o Resend; no leer .env ni SQLite.
Comprobar git y allowlist antes/después. No tocar backend. Si falta navegador/runtime, reportar
bloqueo de esa validación; no sustituirla silenciosamente por assertions de texto.

## Diseño del harness específico

`scripts/qa/submission-recovery-qa.mjs`, con modos propuestos:

- `--unit`: clasificación pura y transporte interno, Response/streams reales y fetch simulado;
  reloj/timers controlados dentro de contexto aislado para deadline sin esperas reales largas.
- `--functions`: módulos reales de ocho handlers/builders, transporte y token service; cargar en
  VM de Node con linker controlado (SourceTextModule/SyntheticModule y stripTypeScriptTypes para
  TS cuando corresponda). Sustituir solo fronteras Redis/email/fetch/Strapi. No alterar fuentes
  copiadas con regex ni modificar handlers para inyección. Memoria GETDEL cuenta consumos reales
  del token service; stub externo de redis no abre red. Resolver imports .ts/extensionless en linker.
- `--dom`: controlador y helper reales en DOM mínimo compatible con EventTarget, con snapshots
  de campos/FileList/consentimiento/sessionStorage y contadores de reset/listeners. No atribuir
  a estos dobles garantías de navegación, accesibilidad o comportamiento nativo de archivos.
- `--build`: build Astro real en copia aislada propiedad del harness, con fixtures de las ocho
  colecciones públicas, sin CMS real. Producción no cambia. Fixtures deben generar un detalle
  de cada tipo denunciable y las quince rutas F01 más Comercio en tres idiomas.
- `--browser`: Chrome CDP y preview loopback del build aislado; interceptar solicitudes de
  verificación/submission y medios externos, bloquear toda red no autorizada. Scripts de los
  flows reales, controles reales y FormData real. Respuestas simuladas mantienen estado por
  intento/scope, y rechazan segundo uso del token antiguo. No engañar el estado verificado
  manipulando solo hidden: obtenerlo mediante interacción de código y respuesta simulada.
- `--cleanup-probes`: fallo de assertion, build/preview, excepción y señales; eliminar solo
  recursos propios, verificar puertos/PIDs/roots, y no ocultar fallo principal con fallo cleanup.

El harness no importa los QA antiguos como módulos porque tienen side effects. Reutiliza patrones
acotados ya existentes; no extrae una nueva librería/framework. Red externa en pruebas = fallo.
La suite Functions prueba acuse real simulado, no simplemente stub de helper que siempre resuelve.
El deadline debe cubrir un body pendiente y un doble que ignore abort; éxito tardío no aceptable.

## Comandos futuros (desde raíz frontend)

```sh
node --experimental-vm-modules scripts/qa/submission-recovery-qa.mjs --unit
node --experimental-vm-modules scripts/qa/submission-recovery-qa.mjs --functions
node --experimental-vm-modules scripts/qa/submission-recovery-qa.mjs --dom
node scripts/qa/submission-recovery-qa.mjs --build
node scripts/qa/submission-recovery-qa.mjs --browser
node scripts/qa/submission-recovery-qa.mjs --cleanup-probes
node scripts/qa/commerce-submission-qa.mjs
node scripts/qa/multisection-reporting-qa.mjs --group scope
node scripts/qa/multisection-reporting-qa.mjs --group schema
node scripts/qa/multisection-reporting-qa.mjs --group backend
node scripts/qa/multisection-reporting-qa.mjs --group function
node scripts/qa/multisection-reporting-qa.mjs --group client
node scripts/qa/multisection-reporting-qa.mjs --group integration
node scripts/qa/multisection-reporting-qa.mjs --group language
node scripts/qa/veu-draft-persistence-qa.mjs --dom
node scripts/qa/millora-draft-persistence-qa.mjs --dom
```

QA comerciales existentes usan imágenes/cuarentena temporales y servicios Strapi simulados;
revisar sus guards antes de ejecutar. Build/browser nuevos deben tener manifest de ownership,
copy allowlist sin .env/.tmp/.git/backend, red bloqueada y fixtures locales. Adoptar patrón de
009/011 de copia junto al repo para resolver node_modules existente, con root propio 012 y marker
único; no copiar dependencias ni instalar. --build conserva solo root marcado para --browser;
--browser y --cleanup-probes limpian recursos propios al finalizar, incluso en error. No adoptar
roots ajenos, matar procesos existentes ni borrar dist real. Verificar .astro real sin cambios.
El inventario de tests ejecutados debe coincidir con el esperado, sin skips silenciosos.

## QA matrix

U=unitario; F=Function/contrato con módulos reales; D=DOM mínimo; B=navegador simulado.

| ID | Caso | Nivel | Oráculo |
|---|---|---|---|
| QA01 | Validación previa falla | U/F/D/B | Cero consumos internos; token válido conservado; corrección posible; probar cada razón de tabla y desconocidas |
| QA02 | Token inválido/ausente | U/F/D/B | Un reset cliente, envío bloqueado hasta nueva verificación |
| QA03 | Fallo posterior al consumo | F/D/B | Token no reutilizable; datos intactos; copy incierto |
| QA04 | Strapi rechaza/falla | F/B | 503 externo; sin falso éxito; reset F01 |
| QA05 | Resultado ambiguo | U/F/D/B | No afirma no guardado; nueva verificación; sin retry |
| QA06 | Reset controlador | D/B | Challenge/token/código/flag/timer limpios; un evento; init repetida no duplica |
| QA07 | Datos preservados | D/B | Igualdad email/texto/selecciones/Files/consentimiento/draft antes-después |
| QA08 | Nueva verificación | D/B | Solicitud/código nuevos con email actual sin recarga |
| QA09 | Token antiguo no reutilizado | F/B | GETDEL segundo consumo falla; segundo intento usa nuevo token |
| QA10 | No auto-retry | U/F/B | Conteo submissions no crece por reset, espera o verificación |
| QA11 | Éxito posterior | F/B | Confirmación contractual, destino por idioma y navegación caller de Millorem |
| QA12 | Draft solo éxito | D/B | Error no borra; éxito sí; Foto no crea draft; probar cuatro scopes |
| QA13 | 201 ok true | U/F/B | Éxito en ocho consumidores; propiedades extra toleradas |
| QA14 | 201 ok false | U/F | Rechazo, 503 público, sin navegación |
| QA15 | JSON inválido/HTML/no objeto | U/F | Rechazo; incluir null/array/string/number/bool y ok string/number/ausente |
| QA16 | Body vacío | U/F | Rechazo |
| QA17 | 204 | U/F | Rechazo; los dos doubles comerciales actualizados |
| QA18 | 200 | U/F | Rechazo incluso con ok true |
| QA19 | 202 | U/F | Rechazo incluso con ok true |
| QA20 | 4xx | U/F | Rechazo de contrato, sin volver a consumir ni retry |
| QA21 | 5xx | U/F | Rechazo de contrato |
| QA22 | Timeout | U/F/B | Antes de headers, durante body y tras parseo fuera de plazo: fallo y timer limpio |
| QA23 | Network error | U/F/B | Sin éxito; recuperación ambigua, sin auto-retry |
| QA24 | Body interrumpido | U/F | Stream rechaza tras headers; no éxito; timer/cancelación limpios |
| QA25 | Comercio | F/B + QA existente | Sus datos, mensajes, reset y endpoint intactos; sin doble reset F01 |
| QA26 | Denuncia comunicat | F/B + QA existente | Mantiene email/motivo/contexto y reset propio; sin nuevo puente |
| QA27 | Denuncia multisección | F/B + QA existente | Conserva motivo/contexto y limpia email conforme a política propia |
| QA28 | CA | B | Cinco recorridos completos y tres regresiones; copy final sin contradicción |
| QA29 | ES | B | Misma cobertura que CA |
| QA30 | EN | B | Misma cobertura que CA |

Repetir matriz interna negativa/positiva sobre ocho handlers (no basta un representative).
Para cinco F01 × tres idiomas, probar todas las clases de error con datos y archivo seleccionados,
seguido de nueva verificación y envío explícito exitoso. Verificar contenido final del párrafo tras
el catch. Añadir doble click, token caducado durante error seguro, edición de email, resultado
con status/razón incompatibles y controlador/destino ausentes. Ningún caso restaura token vencido.

## Trazabilidad y gates

US1/FR003-007 → QA02/03/06-12; US2/FR002 → QA01; US3/FR005/008 → QA05/10/22-24;
US4/FR009-013 → QA13-24; FR014/015 → QA09/25-27; FR001 → QA28-30; FR016 → QA11-12.
FR017 se comprueba mediante allowlist y diff. SC001/006 → quince recorridos; SC002 → snapshots;
SC003 → QA01; SC004 → ocho consumidores; SC005 → QA05/10; SC007 → QA25-30.

Completar revisión de diff, build aislado, matrices y cleanup antes de afirmar implementación
completa. Si falla infraestructura de QA, reportarlo separado de fallos de producto y no abrir
servicios reales como sustituto. No usar tests estáticos como evidencia única de funcionamiento.


## Correcciones de ANALYZE — 2026-10-16

- A01 (HIGH, resuelto en SDD): el comando multisección sin argumentos ejecuta feature003, que lee `.tmp/data.db` en la línea 1407 del QA existente. Ejecutar únicamente los siete grupos explícitos scope/schema/backend/function/client/integration/language. No ejecutar feature003 ni afirmar que pasó la suite completa histórica. Su regresión funcional de denuncia comunicat queda cubierta por T043 y los ocho handlers del harness nuevo; no se sustituye ni se ejecuta la comprobación histórica del hash SQLite.
- A02 (HIGH, resuelto en SDD): el modo --transport de QA Millorem usa HTTP 200 como éxito y un objeto sin controlador. No ejecutarlo como gate compatible ni modificarlo: trasladar sus seis casos funcionales al harness 012, con 201 y controlador registrado. Mantener --dom de ambos QA de drafts. Esto conserva cobertura y la allowlist; no convierte fallos esperados en PASS ni rebaja el contrato.
- A03 (MEDIUM, resuelto en SDD): los tests positivos/de preservación no tienen que fallar en baseline; T014 valida solo inicialización de T013, y T017 valida el reset conectado. Las razones de tabla que son inalcanzables en parsers se comprueban sintéticamente, distinguiendo esa evidencia de integración real.

Estas correcciones no ejecutan QA, no cambian producción ni requieren archivos nuevos fuera de la allowlist. El diseño de navegación mantiene destinos y caller actuales; solo evita reclasificar aceptación confirmada dentro del helper, sin rediseñar los catches de los flows. El build aislado es validación local, no un nuevo mecanismo de rebuild/publicación.
