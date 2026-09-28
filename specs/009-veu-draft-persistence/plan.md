# Implementation Plan: Veus — Safe Multilingual Draft Persistence

**Branch**: `main` | **Date**: 2026-09-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-veu-draft-persistence/spec.md`

## Summary

Incorporar a Veus la persistencia temporal de borrador ya consolidada en Agenda y Comunicats,
usando una única clave `sessionStorage` con scope `veu` para CA, ES y EN. La implementación ampliará
el helper compartido solo con el soporte que hoy falta —scope Veus, controles `select` y validación
optativa por campo durante restore— y conectará el controlador Veus con una allowlist exacta de siete
campos. El formulario seguirá arrancando en el primer paso, recalculará contadores y review, y limpiará
el borrador exclusivamente después de que el transporte existente confirme `{ ok: true }`.

No hay cambios de markup, rutas, backend, Functions, Strapi, SQLite, schemas, dependencias,
infraestructura ni despliegue.

## Technical Context

**Language/Version**: TypeScript ejecutado en Astro 7.2.4; Node.js `>=22.12.0` para build y harness

**Primary Dependencies**: Astro `^7.2.4`, DOM y Web Storage nativos; ninguna dependencia nueva

**Storage**: `sessionStorage`, limitado por el navegador a la sesión natural de una pestaña y origen

**Testing**: harness ESM persistente con `node:assert/strict`, DOM/storage controlados, build con doble
CMS local efímero y browser QA mediante Chrome/CDP contra Astro preview; sin servicios reales

**Target Platform**: navegadores ya soportados por el frontend Astro con DOM y `sessionStorage`

**Project Type**: frontend web estático con comportamiento de formulario en cliente

**Performance Goals**: guardado síncrono de siete strings sin red y restauración no perceptible antes
de la interacción; ninguna operación periódica

**Constraints**: allowlist cerrada; datos solo locales; guardado síncrono; sin TTL, polling,
sincronización entre pestañas, backend, email real, Functions reales, Strapi, SQLite ni cambios a
features fuera de alcance

**Scale/Scope**: un envelope, siete campos y tres rutas lingüísticas que montan el mismo componente y
controlador

## Constitution Check

### Gate previo a Phase 0

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Producto local y participación editorial | Solo se protege trabajo previo al envío; publicación y moderación no cambian | PASS |
| II. Stack fijo y static-first | Se usan Astro y APIs nativas del navegador; no hay consultas runtime al CMS | PASS |
| III. Privacidad y seguridad | Scope local, siete campos exactos y exclusión de archivos, consentimiento y verificación | PASS |
| IV. Integridad de datos e infraestructura | No se accede a SQLite, schemas, Strapi ni infraestructura | PASS |
| V. Simplicidad y coste proporcional | Se reutiliza el helper actual, sin dependencia o servicio nuevo | PASS |
| VI. CA/ES/EN y no regresión | Una clave lógica sirve las tres rutas y Agenda/Comunicats tienen regresión obligatoria | PASS |
| VII. Repositorios y contratos | Solo cambia frontend; backend queda read-only y no existe contrato remoto nuevo | PASS |
| Workflow SDD | SPECIFY y CLARIFY están cerrados antes de PLAN; IMPLEMENT permanece prohibido | PASS |

No hay excepción constitucional ni entrada de Complexity Tracking.

### Re-check posterior a Phase 1

El diseño mantiene los ocho gates en PASS. `data-model.md` limita el payload a siete strings;
`research.md` fija escritura síncrona y descarta backend, SQLite, storage persistente y refactor
general; `quickstart.md` exige paridad CA/ES/EN, fallos seguros, regresiones y un entorno browser
loopback propiedad del único harness. El doble CMS vacío y una raíz frontend efímera aislada entre
build/browser son instrumentación controlada, no arquitectura runtime, infraestructura del producto
ni ampliación de la allowlist. El `.astro/` y el `dist/` reales permanecen read-only y no-owned.
QA40–QA43 permanecen en DOM y el browser solo recorre Veus. No se introduce un dato adicional,
dependencia, servicio real o modificación cross-repository.

## Project Structure

### Documentation (this feature)

```text
specs/009-veu-draft-persistence/
├── checklists/
│   └── requirements.md       # existente; read-only en PLAN
├── spec.md                   # existente; read-only en PLAN
├── plan.md                   # este PLAN
├── research.md               # decisiones e inspección Phase 0
├── data-model.md             # contrato lógico local Phase 1
├── quickstart.md             # validación futura Phase 1
└── tasks.md                  # existente; TASKS REMEDIATION #2 completada
```

No se crea `contracts/`: no existe API o contrato backend nuevo y el contrato local queda descrito
sin duplicación en `data-model.md`.

### Source Code (repository root)

```text
src/
└── lib/
    ├── submissionDraft.ts          # helper compartido Agenda/Comunicats/Veus
    └── veuSubmissionFlow.ts        # integración y reconciliación Veus

scripts/
└── qa/
    └── veu-draft-persistence-qa.mjs  # harness persistente nuevo
```

Las páginas CA/ES/EN, `VeuSubmissionFlow.astro`, Agenda, Comunicats, transporte y verificación son
superficies de inspección/regresión, no archivos de implementación.

**Structure Decision**: cambio frontend mínimo en dos módulos existentes y un harness QA nuevo. Las
tres rutas Veus ya usan `VeuSubmissionPage.astro`, `VeuSubmissionFlow.astro` y el mismo
`initVeuSubmissionFlow`, por lo que no necesitan edición.

## Arquitectura actual confirmada

### Helper compartido

`src/lib/submissionDraft.ts` usa `sessionStorage`, cuya partición natural por pestaña/origen satisface
el aislamiento requerido. Construye `guiapineda:submission-draft:v1:${scope}` y serializa
`{ version: 1, scope, fields }`. Valida raíz, versión, scope y forma de `fields`; descarta envelopes
incompatibles; ignora campos no allowlisted y valores que no sean string; restaura antes de registrar
listeners; guarda en `input` y `change`; limpia mediante la operación devuelta y en `reset`; y degrada
en `try/catch` si storage falla.

Actualmente `DraftScope` solo admite `agenda | comunicat` y el resolver de campos admite inputs
text/email/url/date/time, textareas y grupos radio estrictos, pero no `HTMLSelectElement` ni una regla
de restauración específica por campo.

### Agenda y Comunicats

Ambos controladores declaran su propia allowlist, invocan el helper antes de inicializar los estados
dependientes y ejecutan `clearDraft` únicamente tras un submit confirmado. Sus claves y scopes son
independientes. El contrato por defecto del helper debe permanecer idéntico para ambos.

### Veus

CA `/veus/envia-la-teva-veu`, ES `/es/veus/envia-tu-voz` y EN
`/en/veus/send-your-voice` montan el mismo componente/controlador. Veus todavía no inicializa el
helper. Dispone de dos pasos, review derivada, contadores para `resum`/`contingut`, imagen local,
consentimiento y verificación. `tipo_autoria` es un `<select>` con `""`, `nom_complet`, `nom` y
`pseudonim`; `autor_public` siempre está visible y requerido.

El submit confirmado es el retorno resuelto de `submitVerifiedSubmissionForm`: esa función solo
resuelve después de una respuesta HTTP correcta cuyo JSON contiene `{ ok: true }` y después inicia la
navegación de éxito. Un error lanza excepción. Por tanto, `clearDraft()` se ubicará inmediatamente
después del `await`, nunca al empezar submit, verificar, obtener token o entrar en review.

## Diseño propuesto

### 1. Extensión acotada del helper

- Ampliar `DraftScope` a `"agenda" | "comunicat" | "veu"`.
- Reconocer un `HTMLSelectElement` solo cuando su `name` coincide con la allowlist.
- Al restaurar el select, aceptar `""` o un valor que exista en sus opciones; un enum desconocido no
  pisa el valor inicial.
- Añadir un mecanismo optativo de reglas de restore por nombre. Sin reglas, Agenda y Comunicats
  conservan exactamente su semántica. Veus lo usará para rechazar strings que excedan el `maxlength`
  vigente. Los mínimos y el formato email no se usarán para desechar borradores parciales: la
  validación HTML seguirá impidiendo avanzar hasta que se completen correctamente.
- Mantener envelope, eventos, guardado síncrono, orden restore-before-listeners, manejo de corrupción
  y clear actuales.

No se añadirá descubrimiento automático de campos, normalización de texto, evento sintético,
polling, scheduler, escritura diferida, TTL ni sincronización.

### 2. Integración en Veus

- Declarar una constante con exactamente los siete nombres normativos.
- Inicializar el draft después de encontrar el formulario y antes del controlador de verificación,
  para que el email restaurado sea solo texto y la verificación empiece siempre fresca.
- Usar scope `veu` sin locale, compartiendo una clave lógica en CA/ES/EN.
- Tras la restauración, mantener imagen vacía, consentimiento sin marcar, email no verificado y
  review no persistida; asegurar el primer paso y ejecutar la reconciliación existente de contadores
  y estados.
- La review seguirá generándose únicamente al pulsar Continuar mediante `renderReview()` y obtendrá
  la etiqueta de la opción del idioma actual.
- Ejecutar `clearDraft()` inmediatamente después del `await submitVerifiedSubmissionForm(...)`
  resuelto. El `catch` y todas las salidas tempranas conservarán storage.

### 3. Save, restore y clear

**Save**: los listeners compartidos `input` y `change` llaman directamente a la escritura del
envelope. `change` cubre el select y `input` los textos. El valor queda en `sessionStorage` antes de
que termine el procesamiento normal del evento, sin cola o trabajo pendiente. Como los listeners se
registran después del restore, restaurar no dispara guardado ni sobrescribe con vacíos. Una navegación
posterior CA/ES/EN ya encuentra el último valor persistido; no existe flush, scheduler, unload o
`pagehide`. Al no existir escritura pendiente, un clear confirmado no puede ser seguido por una
escritura tardía que haga reaparecer el borrador. Agenda y Comunicats conservan exactamente esta
semántica síncrona actual.

**Restore**: validar envelope completo, resolver solo controles allowlisted, aplicar por campo strings
admisibles, aceptar el enum contractual, y luego reconciliar primer paso/contadores. No se generan
eventos, no se marca consentimiento, no se reconstruye archivo/verificación/review.

**Clear**: exclusivamente `sessionStorage.removeItem("guiapineda:submission-draft:v1:veu")` tras éxito
confirmado. El fin natural de la sesión lo gestiona el navegador. No hay acción reset en Veus y no se
creará una.

## Allowlist cerrada de IMPLEMENT

### Productivo — modificar exactamente

1. `src/lib/submissionDraft.ts`
2. `src/lib/veuSubmissionFlow.ts`

### QA — crear exactamente

3. `scripts/qa/veu-draft-persistence-qa.mjs`

### SDD — modificar durante IMPLEMENT

4. `specs/009-veu-draft-persistence/tasks.md`

`tasks.md` ya existe, TASKS REMEDIATION #2 está completada y podrá actualizarse durante IMPLEMENT
para registrar evidencia. SPEC, checklist y los cuatro
artefactos PLAN no forman parte del allowlist funcional de IMPLEMENT.

Si IMPLEMENT demuestra que hace falta editar markup, páginas, Agenda, Comunicats, transporte,
verificación o cualquier otro archivo, debe detenerse y volver a PLAN; no se amplía el allowlist por
iniciativa propia.

## Estrategia QA

El harness persistente usará únicamente Node y APIs ya disponibles. Su modo `--dom` importará el
helper TypeScript con el soporte nativo del runtime actual y construirá un DOM/sessionStorage
controlado para probar envelope, eventos, select, guardado síncrono, corrupción, fallos de storage,
aislamiento y QA40–QA43, incluidas las regresiones Agenda/Comunicats. `--build` será responsable solo
del build con doble CMS loopback y `--browser` solo del recorrido Veus real, CA/ES/EN, fixture Veus,
guard de red y cleanup. No todos los IDs se ejecutan en todos los modos: el PASS global combina la
evidencia de cada modo.

### Procedimiento browser QA cerrado

El mismo archivo `scripts/qa/veu-draft-persistence-qa.mjs` poseerá todos los procesos y fixtures; no
se autoriza un segundo archivo:

1. **Raíz QA aislada**: el modo `--build` exige que el `dist/` real esté ausente y que no exista una
   raíz QA pendiente; ante cualquiera de esas condiciones se detiene sin borrar ni adoptar nada.
   Crea mediante `mkdtemp` una raíz aleatoria bajo `guiapineda-astro`, registra en ella un marcador
   opaco con el run id, ruta real, identidad del harness y lista cerrada de entradas copiadas, y copia
   únicamente `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json` y
   `package-lock.json`. No copia `.astro/`, `dist/`, `.git/`, `.specify/`, `specs/`, `scripts/`,
   `.env*`, backend ni datos. Al estar la raíz efímera bajo el frontend, Node resuelve las
   dependencias ya instaladas desde el `node_modules` padre; Astro crea dentro de la raíz efímera su
   propio `.astro/`, `node_modules/.astro/` y `dist/`, sin escribir en los equivalentes reales.
2. **Build controlado**: abre un servidor HTTP efímero en `127.0.0.1:0`, asigna su origen a
   `STRAPI_URL` solo para el proceso hijo y ejecuta desde la raíz frontend
   `npm run build -- --root <qa-root>`; el `root` efectivo de Astro es la copia QA. El doble
   acepta solo `GET` para los ocho pathnames actuales
   `/api/home`, `/api/categoria-comercios`, `/api/subcategorias`, `/api/comercios`,
   `/api/comunicats`, `/api/millores`, `/api/agendas` y `/api/veus`, con las queries exactas de
   populate/paginación emitidas por `src/lib/api.ts`, y responde un envelope Strapi vacío y
   determinista con `pageCount: 1`. Cualquier otro método/path/query falla. El servidor se cierra en
   `finally`. Si el build falla, limpia únicamente la raíz QA cuyo marcador e identidad siguen
   coincidiendo. Si pasa, conserva esa raíz con su `dist/` interno y marcador para `--browser`. Esto
   compila el frontend sin arrancar ni contactar Strapi y sin crear un `dist/` real.
3. **Servidor de páginas**: el modo `--browser` no ejecuta build. Exige exactamente una raíz QA con
   marcador válido procedente del `--build` inmediatamente anterior y un `dist/` interno; si falta,
   sobra, cambia de identidad o no puede demostrarse ownership, falla y no borra nada. Después
   comprueba que `127.0.0.1:4173` está libre y crea como proceso hijo desde la raíz frontend,
   exactamente `npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173`. El harness es su
   único propietario. Readiness es
   un `GET http://127.0.0.1:4173/veus/envia-la-teva-veu/` con estado 200 y marcador
   `data-veu-submission-flow`, reintentado cada 100 ms durante un máximo de 15 s; timeout o salida del
   hijo es FAIL.
4. **Navegador aislado**: usar el Chrome ya instalado en
   `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, headless, con perfil creado por
   `mkdtemp` bajo el directorio temporal del sistema, `--remote-debugging-address=127.0.0.1` y
   `--remote-debugging-port=0`. El harness descubre el puerto efímero mediante `DevToolsActivePort` y
   controla el navegador mediante CDP con APIs disponibles en Node; nunca abre el perfil real. Chrome
   arranca además con background networking/sync/component update desactivados y
   `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`.
5. **Fixture antes de aplicación**: antes de la primera navegación, CDP instala mediante
   `Page.addScriptToEvaluateOnNewDocument` el shim cerrado del harness. Intercepta exclusivamente
   `POST /api/verification/request-code`, `POST /api/verification/verify-code` y
   `POST /api/submissions/veu`, valida método/body/scope/idioma y devuelve challenge/código/token
   sintéticos; el modo de solicitud no disponible devuelve 503
   `{ok:false,reason:"verification:unavailable"}`, el código rechazado devuelve 400
   `{ok:false,reason:"invalid-code",attemptsRemaining:4}`, el submit correcto devuelve 200
   `{ok:true}`, el fallo HTTP devuelve 500 `{ok:false,reason:"submission:failed"}` y el modo no
   disponible devuelve 503 `{ok:false,reason:"submission:unavailable"}`. No llama al fetch original
   para endpoints funcionales. El guard CDP de red permite solo `GET`/`HEAD` del origen exacto preview para
   las tres rutas Veus, sus rutas de éxito, `/favicon.ico`, `/favicon.svg` y assets `/_astro/`; bloquea
   toda `/api/` que escape del shim, cualquier otro origen, método o request no reconocido y hace
   fallar el caso. Los archivos/imágenes de prueba viven dentro del mismo directorio temporal.
6. **Recorridos Veus**: ejecutar en una misma target/tab las rutas CA
   `/veus/envia-la-teva-veu/`, ES `/es/veus/envia-tu-voz/` y EN
   `/en/veus/send-your-voice/`, además de los reloads y respuestas controladas del subconjunto
   browser QA02, QA05–QA18 y QA27–QA39. La fixture inspecciona el `sessionStorage` real del target y
   la UI real. No navega Agenda ni Comunicats y el guard no incorpora sus rutas. QA40–QA43 pertenecen
   exclusivamente a `--dom`.
7. **Cleanup obligatorio**: en un único `finally`, restaurar/eliminar el shim y listeners, desactivar
   el guard de red, cerrar target/CDP/Chrome, enviar `SIGTERM` al preview y esperar hasta 5 s antes de
   un `SIGKILL` de contingencia, cerrar el doble de build si siguiera activo y eliminar perfil,
   imágenes y temporales conocidos. Después de terminar todos los hijos, elimina recursivamente solo
   la raíz QA cuyo realpath, tipo, marcador, run id e identidad coinciden con los registrados; nunca
   elimina una raíz no validada. Verifica que la raíz QA y todo su `.astro/`, cache y `dist/` owned han
   desaparecido, que el `dist/` real continúa ausente, que los puertos quedan libres y que no permanece
   ningún proceso hijo.

### Contrato ambiental y ownership de `.astro`

- Todo path del `.astro/` real presente antes del ciclo es **preexistente/non-owned**. El harness lo
  inventariaría únicamente en modo lectura para registrar existencia, tipo, contenido/hash y modo; no
  lo borra, sobrescribe, restaura ni adopta.
- Solo son **owned** la raíz QA creada mediante `mkdtemp`, su marcador/copia cerrada y los artefactos
  creados dentro de ese namespace por los procesos hijos owned. El `.astro/`, cache y `dist/` usados
  por Astro pertenecen exclusivamente a esa raíz aislada.
- Cualquier discrepancia de marcador, realpath, tipo, run id o identidad, o cualquier cambio
  observado en el `.astro/` real, es **concurrent/unknown**: el harness falla, no toca ese contenido y
  conserva la evidencia que no pueda limpiar con ownership demostrable.
- Antes y después del ciclo se compara el `.astro/` real por árbol, tipo, bytes/hash y modo. Los
  timestamps quedan expresamente fuera del criterio: Node/APFS no garantizan restauración exacta
  submilisegundo y el diseño ya no restaura nada en ese árbol. Una diferencia real de contenido,
  existencia, tipo o modo nunca se normaliza ni se convierte en PASS.

Si `--build` pasa pero `--browser` no llega a invocarse, QA queda incompleta y la raíz QA marcada es
residuo pendiente. Antes de continuar IMPLEMENT o la auditoría final debe invocarse el mismo
`--browser`; si valida inequívocamente su marker/identidad, su `finally` elimina exclusivamente ese
namespace owned incluso si el preflight, preview o recorrido falla. Si no puede demostrar ownership,
se detiene y solicita revisión humana; no restaura ni borra nada. No se crea un script o modo adicional.

Los comandos superiores reproducibles, ejecutados en ese orden, serán
`node scripts/qa/veu-draft-persistence-qa.mjs --build` y
`node scripts/qa/veu-draft-persistence-qa.mjs --browser`. No existe passthrough funcional o externo,
email, Functions, backend, Strapi, SQLite o infraestructura real. La matriz QA01–QA43 se conserva en
`quickstart.md`.

## Riesgos y mitigaciones

| Riesgo | Mitigación verificable |
|---|---|
| Persistir campo, archivo o dato personal no autorizado | allowlist literal de siete nombres y aserción de igualdad profunda del envelope |
| Persistir consentimiento o verificación | controles fuera de allowlist y casos QA negativos explícitos |
| Colisionar con Agenda/Comunicats | scope/key `veu` y pruebas de aislamiento de las tres claves |
| Crear claves por locale y perder continuidad | scope único sin `lang`; recorrido CA → ES → EN → CA |
| Restore pisa defaults con datos inválidos | reglas por campo, enum de opciones y aplicación individual |
| Eventos de restore reescriben storage | restauración antes de registrar `input`/`change`; prueba de no evento sintético |
| Cleanup prematuro o borrador reaparece | clear solo tras promesa resuelta; 503/fallos conservan; éxito elimina |
| Review obsoleta o paso incorrecto | no persistir derivados; primer paso inicial; `renderReview()` desde DOM actual |
| Cambio compartido rompe Features 001/002 | reglas optativas con defaults actuales y regresión Agenda/Comunicats |
| Scope nuevo no queda aislado | validación exacta de scope y matriz de envelope incorrecto |
| Dependencia/abstracción innecesaria | un helper existente, dos módulos productivos, cero paquetes |
| Ampliación a otros formularios | allowlist de archivos y QA que confirma Millorem/Foto/Commerce intactos |
| Build intenta contactar Strapi real | doble HTTP efímero cerrado, `STRAPI_URL` solo en el hijo y ocho endpoints exactos |
| Browser contacta red o perfil reales | guard CDP fail-closed, origen preview exacto y perfil temporal propiedad del harness |
| Astro modifica `.astro/` preexistente | build y preview usan una raíz QA aislada; el `.astro/` real es read-only y cualquier diferencia solo produce FAIL |
| Cambio concurrente se confunde con output propio | namespace aleatorio, marker/run id/realpath validados y STOP sin borrado cuando ownership no sea inequívoco |
| Timestamps APFS producen falso PASS | timestamps fuera del contrato; se comparan árbol, tipo, bytes/hash y modo sin restauración ni tolerancia |
| `dist/` previo o abandonado se confunde con output propio | `dist/` real debe estar ausente y todo output vive dentro de la raíz QA owned |

## Boundaries

- **Backend / Functions / Strapi**: ningún cambio, lectura o ejecución. El doble HTTP efímero del
  harness no es un backend del producto y no contiene datos reales.
- **SQLite / schema / migrations / persistent server data**: cero acceso. Feature 009 no abre, lee,
  hashea, mide, inspecciona sidecars, copia, respalda ni restaura SQLite.
- **Infraestructura / deploy**: ninguno.
- **Output generado**: `.astro/`, cache y `dist/` generados se permiten únicamente dentro de la raíz
  QA owned entre `--build` y `--browser`; el `.astro/` real es siempre non-owned/read-only y el
  `dist/` real permanece ausente. La raíz QA debe desaparecer tras el cleanup final.
- **Email verification / tokens / rate limiting / uploads**: contratos y código sin cambios.
- **Millorem / Foto del Mes / Commerce**: fuera de alcance; solo auditoría de no afectación.

## Phase Outputs

- Phase 0: `research.md` — investigación cerrada, sin `NEEDS CLARIFICATION`.
- Phase 1: `data-model.md` y `quickstart.md`.
- Contracts: no creado, porque no existe frontera API nueva.
- Phase 2: `tasks.md` existe y TASKS REMEDIATION #2 está completada.
