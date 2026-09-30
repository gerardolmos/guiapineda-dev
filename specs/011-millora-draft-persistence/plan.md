# Implementation Plan: Millorem — Safe Multilingual Draft Persistence

**Branch**: `main` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-millora-draft-persistence/spec.md`

## Summary

Incorporar persistencia temporal de borrador al formulario multietapa de Millorem reutilizando el
helper compartido consolidado por Feature 009. Un único envelope `sessionStorage` con scope
`millora` conservará exactamente ocho campos entre reload, navegación y CA/ES/EN. La integración
restaurará antes de inicializar la verificación, reconstruirá autoría y UI derivada desde el locale
actual, mantendrá el alias oculto sin aplicarlo fuera del tipo `alias` y limpiará únicamente después
de un submit confirmado. Un alias conservado pero no activo tampoco participará en el payload,
`FormData` ni submission remoto.

El cambio productivo queda limitado a `src/lib/submissionDraft.ts`,
`src/lib/milloraSubmissionFlow.ts` y al modo opcional de navegación de
`src/lib/netlifySubmission.ts`; no modifica markup, rutas, backend, SQLite, dependencias,
infraestructura ni despliegue.

## Technical Context

**Language/Version**: TypeScript ejecutado en Astro 7.2.4; Node.js `>=22.12.0` para harness y build

**Primary Dependencies**: Astro `^7.2.4`, DOM y Web Storage nativos; ninguna dependencia nueva

**Storage**: `sessionStorage`, limitado a origen y sesión natural de una pestaña

**Testing**: harness ESM persistente con Node built-ins y `node:assert/strict`; DOM/storage
controlados, build aislado con doble CMS loopback y browser QA mediante Chrome/CDP contra preview
local; sin servicios reales

**Target Platform**: navegadores soportados por el frontend Astro con DOM y `sessionStorage`

**Project Type**: frontend web estático con comportamiento de formulario en cliente

**Performance Goals**: guardado síncrono de ocho strings antes de terminar el evento; restauración
local no perceptible antes de interacción; cero timers, polling o red para el draft

**Constraints**: allowlist exacta; `autor_public` derivado; verificación siempre fresca; sin TTL,
`localStorage`, IndexedDB, sincronización, backend, SQLite o refactor general

**Scale/Scope**: un envelope, ocho campos, tres rutas lingüísticas, tres archivos productivos y un
harness QA; el transporte compartido conserva navegación automática por defecto

## Constitution Check

### Gate previo a Phase 0

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Producto local y participación editorial | Solo se protege trabajo previo al envío; moderación y publicación permanecen intactas | PASS |
| II. Stack fijo y static-first | Se reutilizan Astro y APIs nativas; no se añade consulta runtime al CMS | PASS |
| III. Privacidad y seguridad | Ocho campos mínimos, email temporal aprobado y exclusión total de archivo, consentimiento y verificación | PASS |
| IV. Integridad e infraestructura | SQLite, Strapi, schemas e infraestructura quedan fuera de acceso | PASS |
| V. Simplicidad y coste | Se amplía un scope del helper existente, sin paquete ni servicio nuevo | PASS |
| VI. CA/ES/EN y no regresión | Scope único entre idiomas, labels reconstruidas y regresión obligatoria del modo automático para Agenda/Comunicats/Veus/Foto del Mes | PASS |
| VII. Repositorios y contratos | Solo cambia frontend; backend permanece untouched y no aparece contrato remoto | PASS |
| Workflow SDD | SPECIFY y CLARIFY completos; PLAN precede TASKS e IMPLEMENT | PASS |

La pérdida de trabajo es el defecto real que permite actuar sobre Millorem Unit A. No existe
excepción constitucional ni entrada de Complexity Tracking.

### Re-check posterior a Phase 1

El diseño mantiene todos los gates en PASS. `research.md` cierra las decisiones con la ampliación
mínima y explícita del transporte compartido;
`data-model.md` limita el envelope a ocho strings y clasifica `autor_public` como derivado;
`quickstart.md` exige aislamiento, red loopback controlada, regresiones y cero acceso SQLite. Browser
QA usa únicamente output, procesos y perfiles owned dentro de una raíz efímera, dejando `.astro/` y
`dist/` reales read-only/non-owned. No se introduce servicio, dependencia, dato persistente,
modificación cross-repository ni relajación de verificación. El modo caller-controlled es una API
interna opcional y conserva el comportamiento automático de todos los callers existentes.

## Project Structure

### Documentation (this feature)

```text
specs/011-millora-draft-persistence/
├── checklists/
│   └── requirements.md       # existente; read-only después de CLARIFY
├── spec.md                   # existente; read-only después de CLARIFY
├── plan.md                   # este PLAN
├── research.md               # Phase 0
├── data-model.md             # Phase 1
├── quickstart.md             # Phase 1
└── tasks.md                  # existente; TASKS y TASKS REMEDIATION #3 COMPLETE
```

No se crea `contracts/`: el cambio no expone API, protocolo ni contrato externo nuevo. El contrato
local queda descrito en `data-model.md`.

### Source Code (repository root)

```text
src/
└── lib/
    ├── submissionDraft.ts             # añadir scope millora, preservar defaults anteriores
    ├── milloraSubmissionFlow.ts        # allowlist, restore/reconcile/clear/navigate
    └── netlifySubmission.ts            # modo opcional caller-controlled; default automático

scripts/
└── qa/
    └── millora-draft-persistence-qa.mjs  # harness nuevo
```

`MilloraSubmissionFlow.astro`, `MilloraSubmissionPage.astro`, las rutas CA/ES/EN,
`emailVerificationController.ts` y los flows Agenda/Comunicats/Veus/Foto del Mes son superficies de
inspección o regresión, no archivos de implementación.

**Structure Decision**: tres módulos productivos existentes y un harness. El componente y las
tres rutas ya montan un único controlador con nombres contractuales suficientes; no requieren
escritura.

## Arquitectura actual confirmada

### Helper compartido

`src/lib/submissionDraft.ts` genera `guiapineda:submission-draft:v1:${scope}` y serializa
`{ version: 1, scope, fields }`. Restaura antes de registrar listeners, escribe directamente en
`input` y `change`, admite inputs text/email/url/date/time, textareas, selects y grupos radio
estrictos, aplica predicados opcionales y degrada con `try/catch`. Los scopes actuales son `agenda`,
`comunicat` y `veu`; solo falta incorporar `millora`.

### Millorem

Las rutas CA `/millorem-pineda/envia-una-millora`, ES
`/es/millorem-pineda/enviar-una-mejora` y EN
`/en/millorem-pineda/send-an-improvement` comparten `MilloraSubmissionFlow.astro` y
`initMilloraSubmissionFlow()`.

El flujo tiene tres pasos. `categoria` es radio; `zona` es select; `millora-author-type` es radio con
`resident`, `visitor` y `alias`; `millora-alias` es texto condicional. `autor_public` es hidden y
`updateContextState()` lo deriva de la label localizada actual o de `trim(alias)`. Título, resumen y
contenido alimentan contadores, validez, tiempo de lectura, live preview y review. Imagen,
consentimiento y verificación son estados separados.

El controlador de verificación consume el email actual, empieza con `emailVerified=false` y expone
`reset()`. El submit solo resuelve tras respuesta HTTP correcta con JSON `{ ok:true }`, espera el
tiempo mínimo y solicita la navegación de éxito. Como `location.assign()` sucede antes de resolver,
el retorno no demuestra por sí solo que el caller pueda limpiar antes de la destrucción efectiva del
documento; esa compatibilidad es un gate browser explícito.

## Diseño propuesto

### 1. Extensión mínima del helper

- Ampliar `DraftScope` a `"agenda" | "comunicat" | "veu" | "millora"`.
- Conservar envelope versión 1, resolver de controles, eventos, corrupción, predicados y clear sin
  otro cambio semántico.
- No introducir descubrimiento automático, normalización, debounce, scheduler, eventos sintéticos,
  TTL, sincronización ni nueva abstracción.

Key exacta:

```text
guiapineda:submission-draft:v1:millora
```

### 2. Integración en Millorem

- Declarar la allowlist exacta de ocho nombres y predicados máximos para alias, título, resumen,
  contenido y email. Mínimos y formato email siguen siendo validaciones de avance, no motivos para
  descartar un borrador parcial.
- Inicializar el draft tras localizar el form y antes de `initEmailVerificationController()`.
- Conservar el objeto devuelto por verificación para resetearlo en `pageshow`, incluido retorno por
  bfcache; nunca restaurar challenge, código, token o `emailVerified`.
- Reconciliar tras restore mediante las funciones actuales: visibilidad del alias, `autor_public`,
  botones, contadores, tiempo de lectura, preview y estado de review. Ninguna reconciliación emite
  `input` o `change`.
- Conservar literalmente `millora-alias` en el input y el draft cuando el tipo no sea `alias`, pero
  excluirlo de toda participación funcional: validación, `autor_public`, preview, review,
  `FormData`, payload y submission remoto. La exclusión del payload no puede borrar ni alterar el
  valor conservado y debe resolverse dentro de `milloraSubmissionFlow.ts`.
- Garantizar el primer paso tanto en carga normal como en `pageshow` sin persistir el índice del
  wizard. La reconciliación de primer paso será local al controlador y no añadirá UI.
- Obtener `clearDraft()` del helper, solicitar al transporte el modo caller-controlled y, tras su
  resolución exitosa, ejecutar síncronamente `clearDraft()` seguido de `window.location.assign()`.

### 3. Orden exacto de inicialización y restore

1. Localizar el form Millorem; si falta, terminar sin efectos.
2. Llamar al helper con scope `millora`, allowlist y predicados.
3. Dentro del helper: leer key, parsear y validar envelope, resolver solo controles allowlisted,
   restaurar radios/select/textos/email válidos y, solo después, registrar listeners `input` y
   `change`.
4. Inicializar el controlador de email sobre el email ya restaurado; este comienza siempre con
   challenge/token/código vacíos y `emailVerified=false`.
5. Resolver controles y registrar listeners propios del flujo una sola vez.
6. Forzar el primer paso mediante estado DOM directo, sin simular navegación ni guardar step.
7. Ejecutar `updateContextState()`: visibilidad de alias, validez contextual, live preview y
   `autor_public` localizado.
8. Ejecutar `updateContentState()`: contadores, mínimos, tiempo de lectura y preview textual.
9. Ejecutar `updateReviewState()` sin renderizar una review persistida; `renderReview()` seguirá
   ejecutándose solo al abrir la revisión.
10. En `pageshow`, resetear verificación y submission state, volver al primer paso y repetir la
    reconciliación derivada. Esto cubre bfcache sin reinstalar listeners ni reimportar storage.

El helper registra sus listeners antes de la reconciliación porque esa es su API actual; no se
divide ni refactoriza. Es seguro porque restore y reconciliación son asignaciones programáticas sin
eventos sintéticos, por lo que no producen guardados espurios.

### 4. Save semantics

- `input` y `change` del form disparan una escritura directa y síncrona del envelope completo.
- Radios, select y textos quedan almacenados antes de terminar el procesamiento del evento.
- Un string vacío es un estado parcial válido y sustituye cualquier valor anterior.
- Solo se proyectan los ocho nombres; un evento de imagen, consentimiento u otro control puede
  provocar relectura, pero jamás añade ese control al envelope.
- El alias se lee aunque su wrapper esté oculto; cambiar a `resident` o `visitor` no lo borra.
- No hay debounce, timer, microtask de save, flush pendiente, `beforeunload` ni `pagehide`.
- Excepciones de get/set/remove en `sessionStorage` se absorben y el formulario continúa operativo.

### 5. Restore, payload parcial y corrupción

- Envelope inválido por JSON, raíz, versión, scope o `fields`: descartar/ignorar la key Millora y
  continuar con defaults seguros.
- Payload parcial: restaurar individualmente cada campo válido presente.
- Valor no string o sobre su máximo: ignorar solo ese campo.
- `categoria`, `zona` o author-type desconocidos: el resolver radio/select conserva vacío/default.
- Author-type admite `""`, `resident`, `visitor`, `alias`.
- Alias no string o >100, título >120, resumen >280, contenido >6000 y email >180 se ignoran.
- Email vacío, parcial o estructuralmente inválido dentro del máximo se restaura como trabajo en
  curso, pero native validity impide solicitar código o enviar hasta corregirlo.
- Storage ausente o bloqueado: fail-open sin degradar rellenado, revisión, verificación o envío.

### 6. Autoría y multilingual

- `millora-author-type` y `millora-alias` se persisten literalmente.
- Alias oculto se conserva y reaparece al volver a `alias`; no participa funcionalmente con
  `resident`/`visitor`: queda fuera de validación, `autor_public`, preview, review, `FormData`,
  payload y submission remoto, sin borrar ni mutar el input ni el draft.
- `autor_public` nunca entra en storage. Sin tipo válido queda vacío; para `resident`/`visitor` usa
  `data-label` del DOM actual; para `alias` usa `trim(alias)`.
- Scope/key no incluye idioma. CA/ES/EN comparten un borrador y el contenido del usuario no se
  traduce, corrige ni normaliza.
- Labels de categoría, zona, autoría, preview y review se leen siempre del DOM del locale actual.

### 7. Clear y submit-success ordering

No se borra en validación fallida, request-code fallido, verify-code fallido, submit iniciado,
excepción, 4xx/5xx, JSON no exitoso, navegación, cambio de idioma, reload o bfcache.

Se borra exclusivamente:

1. después de que `submitVerifiedSubmissionForm()` valide HTTP + `{ok:true}`, complete su espera y
   resuelva sin navegar porque Millorem solicitó explícitamente el modo caller-controlled;
2. por el fin natural de `sessionStorage` al terminar la sesión de pestaña.

`SubmissionOptions` añadirá un modo explícito `navigation: "automatic" | "caller"`, con
`"automatic"` como default compatible. El transporte seguirá validando respuesta HTTP, JSON
`{ok:true}` y espera mínima. En modo `caller` resolverá entonces sin solicitar navegación. Millorem
ejecutará, en la misma continuación síncrona, `clearDraft()` y después
`window.location.assign(successUrl)`. El orden será verdadero por estructura:

```text
HTTP/JSON confirmado → espera completa → retorno al caller → clearDraft → location.assign
→ navegación efectiva
```

No se acepta callback genérica porque introduce coupling y semántica de excepción después de que el
servidor ya aceptó la submission. Tampoco se cambia el default del transporte: Agenda, Comunicats,
Veus y Foto del Mes siguen usando navegación automática sin adaptación productiva. Sus regresiones
deben demostrar que se conserva el submit, la espera, una única navegación y los errores actuales.

QA39 utilizará la success URL HTTP real del formulario sin pausar la navegación. Instrumentación
pre-document del harness observará, sin borrar ni navegar, la respuesta controlada 200 + `{ok:true}`
y la llamada real de producto a `sessionStorage.removeItem()` para la key Millorem. CDP observará a
continuación `Page.frameRequestedNavigation`, `Network.requestWillBeSent` de tipo `Document`, el
commit/load de esa misma URL y, ya en el documento de éxito same-origin, la key ausente. El ledger
debe ser exactamente:

```text
confirmed HTTP/json → productive clear observed → product navigation requested
→ Document request observed → success route effective → key absent after load
```

La observación del clear puede envolver `Storage.prototype.removeItem` o usar un binding CDP, pero
debe delegar al método nativo y limitarse a registrar la key; no puede ejecutar clear, alterar su
resultado ni crear una rama productiva de test. `javascript:`, `Page.navigate`, navegación
alternativa, segunda request artificial, polling de storage y cualquier clear paralelo siguen
prohibidos. Al no retener la navegación, QA39 no depende de Runtime durante un estado CDP bloqueado.

La prohibición de Fetch pause/continue se limita al antiguo hold de la navegación `Document` de
éxito: QA39 no puede pausarla en response-stage, retenerla, liberarla para fabricar el ordering ni
consultar Runtime mientras esté held. Sigue autorizado `Fetch.requestPaused` en request-stage como
parte del guard fail-closed: puede continuar tráfico allowlisted, abortar tráfico inesperado e
interceptar los endpoints sintéticos aprobados, siempre que no retenga la success navigation para
demostrar el orden A–F.

No existe reset general y no se crea uno; retirar imagen no borra el draft.

## Allowlist cerrada de IMPLEMENT

### Productivo — modificar exactamente

1. `src/lib/submissionDraft.ts`
2. `src/lib/milloraSubmissionFlow.ts`
3. `src/lib/netlifySubmission.ts`

### QA — crear exactamente

4. `scripts/qa/millora-draft-persistence-qa.mjs`

### SDD — modificar durante IMPLEMENT

5. `specs/011-millora-draft-persistence/tasks.md`

Todo lo demás es read-only. Si IMPLEMENT demuestra necesidad de editar markup, rutas, traducciones,
Agenda, Comunicats, Veus, Foto del Mes, verificación u otro path, debe detenerse y volver a PLAN; no
se amplía la allowlist silenciosamente.

Antes y después de cada ventana PRE→POST de IMPLEMENT se registrarán fingerprints individuales de
`spec.md`, `checklists/requirements.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` y
`tasks.md`. Los seis primeros deben permanecer byte-idénticos; solo `tasks.md` es SDD writable. La
enumeración es obligatoria porque estos artefactos todavía son untracked y Git por sí solo no
demuestra que su contenido permanezca intacto.

## Estrategia QA

El harness nuevo tendrá tres modos y un inventario de casos ejecutados; un ID solo pasa cuando su
setup, acción y aserciones propias han corrido. La salida global comparará exactamente los IDs
esperados por modo para impedir IDs impresos, callbacks compartidos incompletos o falsos PASS.

- `--dom`: helper real importado con DOM/storage controlados; envelope, eventos, corrupción,
  predicados, storage failures y regresión Agenda/Comunicats/Veus.
- `--build`: build aislado con doble CMS local; no concede PASS funcional por sí mismo.
- `--browser`: rutas Millorem reales, `sessionStorage` real, reload/navegación/bfcache, UI derivada,
  fixture de verificación/submit y exclusiones.

Los casos afectados por CONVERGE deben ejecutar su contrato completo: QA05 conserva el alias al
cambiar de tipo y demuestra su ausencia en `FormData`/payload para `resident` y `visitor`; QA08
incluye primer paso, botones, los tres contadores, tiempo/indicador y preview. QA15 recorre CA, ES y
EN con `resident` y `visitor` después de introducir un alias literal: cambiar desde `alias` oculta ese
valor sin borrarlo de memoria ni del draft, pero mientras el tipo activo sea `resident` o `visitor`
el alias no se aplica en `autor_public`, preview ni review; esas tres superficies usan exclusivamente
el tipo activo y la label del locale actual, sin labels stale, y volver a `alias` recupera exactamente
el valor conservado. QA05 mantiene en exclusiva la evidencia adicional de exclusión en `FormData`,
payload y submission remoto. QA21 observa challenge, token, código, timer, verified, autorización
temporal y submission state aplicable tras
`pageshow`/bfcache; QA34 restaura el email parcial y demuestra con el controlador/flow real cero
request-code y cero submit. Por ello QA34 pasa de DOM a browser, sin duplicar ID ni añadir caso
(16 DOM + 29 browser = 45). QA42–QA44 ejercitan, por separado, key, allowlist, save, restore, clear,
corrupción y campo/valor inválido o desconocido.

QA21 no exige exponer estado interno ni añadir APIs de depuración al producto. Challenge, timer y
autorización temporal se acreditan mediante sus efectos observables: DOM/token/verified limpios,
contadores de fixture sin request/verify/submit espontáneo y necesidad de solicitar un challenge
nuevo antes de poder verificar o enviar.

### Browser y build aislados

El browser subset es necesario: un DOM doble no demuestra navegación same-origin, bfcache, montaje
Astro real, labels CA/ES/EN, file inputs ni la interacción del controlador de verificación.

Se reutiliza el contrato ambiental probado por Feature 009, implementado dentro del nuevo harness:

1. `--build` exige `dist/` real ausente y cero raíz QA pendiente; crea por `mkdtemp` una raíz marcada
   bajo el frontend, copia solo `src/`, `public/`, configuración y manifests, excluyendo `.astro/`,
   `dist/`, `.git`, `.specify`, specs, scripts, `.env*`, backend y datos.
2. Un doble CMS escucha `127.0.0.1:0`, acepta exclusivamente los ocho endpoints/query actuales y
   responde envelopes vacíos deterministas. `STRAPI_URL` existe solo para el hijo build.
3. `npm run build -- --root <qa-root>` genera `.astro/`, cache y `dist/` solo dentro de la raíz owned.
   El doble se cierra en `finally` y su puerto debe quedar libre. FAIL elimina solo una raíz con
   marker/run-id/realpath/tipo/identidad válidos; PASS la conserva para `--browser` inmediato.
4. `--browser` exige exactamente esa raíz y `dist/` interno, puerto 4173 libre, y lanza como hijo
   `npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173`.
5. Chrome headless usa perfil temporal, CDP loopback y puerto efímero. Un shim instalado antes de
   aplicación intercepta solo request-code, verify-code y `/api/submissions/millora`, validando
   método, body, scope e idioma. Un guard fail-closed permite únicamente preview, assets y rutas
   Millorem/éxito exactas; no hay passthrough externo. QA39 añade observación pre-document del clear
   y eventos CDP de navegación/red, sin pausar, sustituir ni crear requests.
6. Cleanup se ejecuta desde un coordinador idempotente y no reentrante. Cada recurso tiene un intento
   independiente; un error se acumula sin impedir intentar los recursos posteriores. El orden es:
   fixture/guard e interceptores; target/CDP/Chrome/helpers; preview/build owned; verificación de cero
   recursos; perfil/temporales; revalidación de ownership y retirada de qa-root; invariantes reales.
   Al final se reportan conjuntamente todos los errores y el modo falla si cualquiera persiste.
7. El mismo coordinador cubre PASS, assertion FAIL, excepción, build/preview/browser failure,
   `SIGINT`, `SIGTERM` y abort controlado. La primera señal bloquea nuevas operaciones y solicita un
   único cleanup; señales posteriores durante cleanup no lo reentran ni relajan ownership. Solo se
   señalizan hijos/grupos autenticados, nunca por nombre, y qa-root no se borra si marker, run-id,
   realpath, tipo o device/inode no reconfirman. Tras cleanup se conserva un exit no exitoso y la
   causa original/señal junto con cualquier error acumulado.

`--build` y `--browser` forman un ciclo indivisible: tras build PASS se ejecuta browser
inmediatamente. Si browser falla, su `finally` limpia todo recurso owned. Si ownership no puede
demostrarse, STOP y revisión humana; nunca se adopta o elimina contenido desconocido.

La matriz ejecutable completa y el browser subset exacto quedan en `quickstart.md`.

## Regresión Agenda / Comunicats / Veus

`--dom` ejecutará casos independientes para cada scope cerrado:

- key exacta y aislada;
- allowlist actual sin cambios;
- restore válido;
- envelope estructuralmente corrupto;
- campo no allowlisted/desconocido que no se restaura;
- valor inválido que no contamina el estado autorizado;
- save síncrono y clear actual.

Cada scope ejecuta realmente todas esas acciones con su key y allowlist propias; una callback común
solo es válida si recibe fixtures distintas y contiene aserciones específicas que demuestren
corrupción fail-open e invalid/unknown, no si se limita al recorrido feliz.

## Auditoría cross-flow del transporte

| Caller | Uso actual | Impacto de PLAN REMEDIATION #5 | Regresión obligatoria |
|---|---|---|---|
| `milloraSubmissionFlow.ts` | await y clear posterior a navegación solicitada | requiere `navigation: "caller"`, clear y `location.assign` productivos | QA35–QA41, especialmente QA39 |
| `agendaSubmissionFlow.ts` | modo automático implícito; clear posterior | no se adapta; comportamiento byte-idéntico | submit éxito/error, espera y una navegación automática |
| `comunicatSubmissionFlow.ts` | modo automático implícito; clear posterior | no se adapta; comportamiento byte-idéntico | submit éxito/error, espera y una navegación automática |
| `veuSubmissionFlow.ts` | modo automático implícito; clear posterior | no se adapta en Feature 011; comportamiento byte-idéntico | submit éxito/error, espera y una navegación automática |
| `fotoMesSubmission.ts` | modo automático implícito; sin draft clear | no se adapta; comportamiento byte-idéntico | submit éxito/error, espera y una navegación automática |

Commerce no llama `submitVerifiedSubmissionForm()` y queda fuera. La debilidad histórica del clear
posterior en Agenda/Comunicats/Veus no se corrige silenciosamente aquí: el modo nuevo no empeora esos
flows y su posible remediación funcional requiere coordinación SDD separada con las features previas.
La regresión de Feature 011 sí debe demostrar que el default automático compartido permanece igual.

## Sincronización aplicada en TASKS REMEDIATION #5

TASKS REMEDIATION #4 está completa y sincronizó la navegación caller-controlled, la allowlist y las
regresiones del transporte. TASKS REMEDIATION #5 está completa y se limitó, sin implementar, a sincronizar:

- la frontera byte-identical: `netlifySubmission.ts` es writable; componente, rutas, verificación y
  Agenda/Comunicats/Veus/Foto del Mes permanecen protegidos y read-only;
- la distinción entre el hold response-stage prohibido para la success navigation de QA39 y el
  `Fetch.requestPaused` request-stage permitido para el guard fail-closed;
- el PRE/POST con fingerprints individuales de `spec.md`, `checklists/requirements.md`, `plan.md`,
  `research.md`, `data-model.md`, `quickstart.md` y `tasks.md`;
- las referencias de workflow necesarias para reflejar PLAN REMEDIATION #6 y TASKS REMEDIATION #5.

Debe conservar T001–T042, la matriz 16/29 y todos los contratos C011-F1–F6; no autoriza producto ni
reutiliza evidencia invalidada.

No se añade una feature cross-flow ni se da por resuelta la deuda histórica de otros drafts.

## Riesgos restantes y clarificaciones

- Un error de `location.assign` después del éxito confirmado ocurre después del boundary remoto; no
  autoriza reponer el draft ni repetir automáticamente la submission. Debe tratarse como fallo de
  navegación post-éxito, distinto de navegación/reload/idioma ordinarios, que nunca limpian.
- El default discriminado debe quedar cubierto para evitar que una omisión cambie callers existentes.
- La instrumentación de QA podría observar dos clears; QA39 debe exigir exactamente uno para la key
  Millorem y confirmar que el observer delega al método nativo.
- El cambio es una API interna compartida, no contrato remoto ni cambio de backend.

**NEEDS CLARIFICATION**: 0. La opción C, el nombre/semántica del modo, la allowlist, las regresiones y
el boundary de error quedan cerrados por PLAN REMEDIATION #5.

También coexistirán las cuatro keys para demostrar que clear y escritura de `millora` no leen,
sobrescriben ni eliminan `agenda`, `comunicat` o `veu`. Sus controladores no se modifican.

## Riesgos y mitigaciones

| Riesgo | Mitigación verificable |
|---|---|
| Campo no autorizado entra en storage | igualdad profunda de ocho keys y casos negativos |
| Alias oculto se borra o se aplica fuera de `alias` | browser alterna tipos, recarga y exige ausencia en preview/review/FormData/payload/envío sin perder su valor |
| `autor_public` queda obsoleto entre idiomas | exclusión del envelope y reconstrucción CA/ES/EN |
| Email restaurado conserva verificación | inicialización y `pageshow` resetean controller; browser inspecciona token/dataset |
| bfcache conserva step o seguridad | caso real back/forward exige primer paso y verificación fresca |
| Restore produce escritura espuria | helper restaura antes de listeners; snapshot pre/post sin evento |
| Corrupción bloquea el formulario | descarte estructural y restore individual fail-open |
| Clear ocurre demasiado pronto | todos los fallos conservan key; solo éxito confirmado la elimina |
| Navegación supera el clear | modo caller-controlled hace `clearDraft` antes de `location.assign`; QA39 observa clear, request productiva, load y key ausente sin pausa |
| Scope nuevo rompe drafts cerrados | regresiones independientes y aislamiento de cuatro keys |
| Browser/build escriben output real | qa-root owned; `.astro/`/`dist/` reales read-only y comparación final |
| Cleanup falla temprano o borra contenido ajeno | intentos independientes y errores acumulados; marker/run-id/realpath/device/inode/tipo; STOP ante duda |
| QA contacta servicios reales | doble CMS y guard CDP fail-closed, solo loopback |
| Duplicación excesiva de arquitectura QA | un único harness; sin paquete ni refactor compartido fuera de scope |

## Boundaries

- **Backend**: untouched; no lectura de código necesaria durante IMPLEMENT, ningún proceso o cambio.
- **SQLite**: access none; reads none; hashes none; metadata none; sidecars none; commands none;
  schema changes none; migrations none.
- **Infraestructura/deploy**: ninguno.
- **Output generado**: solo dentro de la raíz QA owned durante el ciclo build/browser; `.astro/` y
  `dist/` reales son non-owned/read-only.
- **Verificación/uploads**: código y contratos sin cambios; solo fixtures locales QA.
- **Transporte**: cambio interno opcional y backward-compatible; no cambia endpoint, payload,
  verificación, espera ni semántica de error.
- **Otros formularios**: Agenda, Comunicats, Veus y Foto del Mes solo regresión del modo automático;
  Commerce no usa este transporte y queda fuera de alcance.

## Phase Outputs

- Phase 0: `research.md`, sin `NEEDS CLARIFICATION`.
- Phase 1: `data-model.md` y `quickstart.md`.
- Contracts: no creado porque no existe frontera externa nueva.
- PLAN REMEDIATION #1: COMPLETE.
- TASKS REMEDIATION #1: COMPLETE.
- PLAN REMEDIATION #2: COMPLETE; contratos C011-F1–F6 precisados.
- TASKS REMEDIATION #2: COMPLETE.
- PLAN REMEDIATION #3: COMPLETE; U1 precisa QA15 sin cambiar ningún otro contrato.
- TASKS REMEDIATION #3: COMPLETE; `tasks.md` está sincronizado con PLAN REMEDIATION #3 y conserva
  T001–T042: 42 tareas, 10 `[X]`, 32 `[ ]` y 0 `[P]`. TASKS no está pendiente y no debe repetirse.
- PLAN REMEDIATION #4: COMPLETE; O1 actualiza exclusivamente este estado de workflow.
- PLAN REMEDIATION #5: COMPLETE; la incompatibilidad empírica de QA39 se resuelve mediante navegación
  caller-controlled opcional, nueva allowlist explícita y QA39 sin pausa.
- TASKS REMEDIATION #4: COMPLETE; `tasks.md` está sincronizado con PLAN REMEDIATION #5 y conserva
  T001–T042: 42 tareas, 8 `[X]`, 34 `[ ]` y 0 `[P]`.
- PLAN REMEDIATION #6: COMPLETE; I1, A1, U1 y O1 quedan corregidos únicamente en PLAN/research/
  quickstart, sin modificar TASKS, producto ni harness.
- TASKS REMEDIATION #5: COMPLETE; `tasks.md` está sincronizado con PLAN REMEDIATION #6 y conserva
  T001–T042: 42 tareas, 8 `[X]`, 34 `[ ]` y 0 `[P]`. TASKS no está pendiente y no debe repetirse.
- PLAN REMEDIATION #7: COMPLETE; O1 actualiza exclusivamente este estado de workflow.
- La siguiente fase requerida es ANALYZE REMEDIATION; IMPLEMENT REMEDIATION solo queda autorizado si
  obtiene PASS con BLOCKER 0, HIGH 0, MEDIUM 0 y LOW 0.
- El GREEN anterior no acredita QA05, QA08, QA15, QA21, QA34, QA39, QA42–QA44 ni cleanup
  failure/signal. Evidencia no afectada solo puede reutilizarse si TASKS/ANALYZE demuestra su
  vigencia.
