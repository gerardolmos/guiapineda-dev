# Quickstart: Validate Veus Draft Persistence

**Purpose**: validación local reproducible para ejecutar después de IMPLEMENT. Este documento no
autoriza ejecutar QA durante PLAN.

## Preconditions

1. Estar en `main` con solo los cambios autorizados para Feature 009.
2. Confirmar que backend permanece limpio y que no hay procesos Strapi.
3. No abrir, leer, hashear, medir, inspeccionar sidecars ni modificar SQLite.
4. No usar email, Functions, backend, Strapi o infraestructura reales.
5. Usar Node `>=22.12.0` y dependencias ya instaladas; no añadir paquetes.
6. Confirmar que `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` existe y es ejecutable.
7. Confirmar que el `dist/` real está ausente y que no existe una raíz QA pendiente antes de
   `--build`; si existe cualquiera, detenerse sin borrarlo ni asumir ownership.
8. Confirmar que `127.0.0.1:4173` está libre; el harness debe fallar, no matar un proceso ajeno.
9. Browser QA usa exclusivamente el perfil temporal y la fixture cerrada que posee el harness:
   respuestas sintéticas de verificación y `/api/submissions/veu`; cualquier request externo o no
   reconocido debe fallar.
10. Inventariar el `.astro/` real en modo lectura por existencia, árbol, tipo, bytes/hash y modo. Todo
    su contenido es non-owned; los timestamps no son criterio contractual y nada de ese árbol se
    restaura, sobrescribe o borra.

## Static and automated gates

Ejecutar, en este orden, cuando TASKS lo autorice:

```bash
node --check scripts/qa/veu-draft-persistence-qa.mjs
node scripts/qa/veu-draft-persistence-qa.mjs --dom
node scripts/qa/veu-draft-persistence-qa.mjs --build
node scripts/qa/veu-draft-persistence-qa.mjs --browser
git diff --check
```

El harness debe emitir resultado por ID y finalizar con código distinto de cero ante cualquier caso
fallido. No debe escribir logs, capturas, perfiles u otros artefactos persistentes, invocar red
no-loopback ni modificar otros archivos. La única excepción temporal es una raíz QA aleatoria y
marcada bajo el frontend: todo `.astro/`, cache y `dist/` del ciclo existe exclusivamente dentro de
ella entre `--build` y el `finally` de `--browser`, sin ampliar la allowlist productiva.

`--dom` es responsable de la matriz DOM/storage, helper, corrupción, aislamiento de scopes,
regresiones Agenda/Comunicats y QA40–QA43. `--build` solo construye con el doble CMS. `--browser`
solo recorre Veus y aporta la evidencia browser QA02, QA05–QA18 y QA27–QA39. El PASS global combina
los resultados de los modos correspondientes; ningún ID necesita ejecutarse en todos ellos.

### Build exacto y sin backend

`--build` debe:

1. exigir que el `dist/` real y cualquier raíz QA anterior estén ausentes; si existe alguno,
   detenerse sin borrarlo ni asumir ownership;
2. crear mediante `mkdtemp` una raíz aleatoria bajo `guiapineda-astro`, guardar un marcador opaco con
   run id, realpath e identidad del harness, y copiar únicamente `src/`, `public/`,
   `astro.config.mjs`, `tsconfig.json`, `package.json` y `package-lock.json`;
3. excluir expresamente `.astro/`, `dist/`, `.git/`, `.specify/`, `specs/`, `scripts/`, `.env*`,
   backend y cualquier dato; resolver dependencias desde el `node_modules` padre sin escribirlo;
4. crear dentro del proceso un servidor HTTP en `127.0.0.1:0`;
5. aceptar exclusivamente `GET` para `/api/home`, `/api/categoria-comercios`, `/api/subcategorias`,
   `/api/comercios`, `/api/comunicats`, `/api/millores`, `/api/agendas` y `/api/veus`, con las queries
   exactas de populate y primera página emitidas por `src/lib/api.ts`;
6. responder `{ "data": [], "meta": { "pagination": { "page": 1, "pageSize": 100,
   "pageCount": 1, "total": 0 } } }`;
7. hacer FAIL ante cualquier otro método, pathname o query;
8. ejecutar desde la raíz frontend `npm run build -- --root <qa-root>` como hijo y con `STRAPI_URL`
   apuntando solo al origen efímero; `.astro/`, `node_modules/.astro/` y `dist/` deben quedar dentro
   de esa raíz;
9. cerrar el doble en `finally` y comprobar que no queda listener;
10. ante FAIL, retirar la raíz QA solo si realpath, tipo, marker, run id e identidad siguen
    coincidiendo; si ownership es ambiguo, no borrar nada y solicitar revisión humana;
11. ante PASS, conservar la raíz QA y su `dist/` interno para que el `--browser` inmediatamente
    posterior pueda validarlos y retirarlos con seguridad.

No se arranca Strapi ni se lee la SQLite. La salida esperada es build PASS y las tres rutas Veus
materializadas en el `dist/` interno; el `.astro/` y `dist/` reales no cambian.

### Server exacto

`--browser` no ejecuta build implícitamente. Debe exigir exactamente una raíz QA con marker/run id,
realpath e identidad válidos y el `dist/` interno del `--build` inmediatamente anterior. Si falta,
sobra o discrepa cualquiera, falla sin adoptar ni borrar contenido. Después comprueba que el puerto
está libre y crea como hijo propio desde la raíz frontend:

```bash
npm run preview -- --root <qa-root> --host 127.0.0.1 --port 4173
```

Readiness requiere `GET http://127.0.0.1:4173/veus/envia-la-teva-veu/`, estado 200 y HTML con
`data-veu-submission-flow`. Reintentar cada 100 ms durante un máximo de 15 segundos. Salida temprana
del hijo, timeout o un marcador ausente son FAIL. El harness conserva el handle del proceso; ningún
otro actor comparte su ownership.

### Browser y fixture exactos

El harness crea un directorio mediante `mkdtemp` bajo el temporal del sistema y lanza el Chrome
instalado con headless, `--user-data-dir` apuntando allí,
`--remote-debugging-address=127.0.0.1`, `--remote-debugging-port=0`, sin first-run, sync ni background
networking/component updates y con
`--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`. Lee `DevToolsActivePort` y controla una
única target/tab mediante CDP disponible en Node. Nunca usa el perfil real.

Antes de navegar, `Page.addScriptToEvaluateOnNewDocument` instala el shim mantenido dentro de
`scripts/qa/veu-draft-persistence-qa.mjs`. El shim intercepta sin llamar al fetch original:

- `POST /api/verification/request-code`: `200` con challenge fijo para scope `veu` e idioma actual, o
  `503 {"ok":false,"reason":"verification:unavailable"}`;
- `POST /api/verification/verify-code`: `200` con token fijo para `123456`, o
  `400 {"ok":false,"reason":"invalid-code","attemptsRemaining":4}`;
- `POST /api/submissions/veu`: `200 {"ok":true}` para éxito,
  `500 {"ok":false,"reason":"submission:failed"}` para fallo y
  `503 {"ok":false,"reason":"submission:unavailable"}` para indisponibilidad.

Cada request valida origen, método, pathname, body, scope, idioma y contador esperado. Un guard CDP
de red permite únicamente `GET`/`HEAD` al origen exacto `http://127.0.0.1:4173` para las tres rutas
Veus, las tres rutas de éxito, `/favicon.ico`, `/favicon.svg` y `/_astro/`; bloquea toda `/api/` que
escape del shim, cualquier otro método/origen/path o tráfico de internet. `blob:` y `data:` quedan
limitados a recursos generados por el caso local y nunca originan passthrough de red.

Rutas de formulario:

- CA: `/veus/envia-la-teva-veu/`
- ES: `/es/veus/envia-tu-voz/`
- EN: `/en/veus/send-your-voice/`

Rutas de éxito controladas: `/enviat/`, `/es/enviado/`, `/en/sent/`.

El harness crea cualquier PNG sintético dentro del mismo temporal, instala estados corruptos o
storage indisponible antes del código de aplicación cuando el caso lo exige, y lee directamente DOM,
validity y `sessionStorage` reales mediante CDP.

El browser no navega rutas Agenda o Comunicats. Su guard permanece limitado a las rutas Veus, rutas
de éxito y assets enumerados; QA40–QA43 se ejecutan exclusivamente mediante `--dom`.

### Cleanup obligatorio

Un único `finally` debe, incluso tras FAIL:

1. restaurar/eliminar shim y listeners y desactivar el guard CDP;
2. cerrar target, conexión CDP y Chrome;
3. enviar `SIGTERM` al preview y esperar hasta 5 s; usar `SIGKILL` solo si ese hijo propio no termina;
4. cerrar el doble de build si permaneciera activo;
5. eliminar perfil, PNG y temporales creados por el harness;
6. después de cerrar todos los hijos, eliminar únicamente la raíz QA completa cuando realpath, tipo,
   marker, run id e identidad acrediten ownership; nunca eliminar una raíz no validada;
7. volver a inventariar el `.astro/` real sin restaurarlo: cualquier diferencia de existencia, árbol,
   tipo, bytes/hash o modo es FAIL concurrent/unknown y se deja intacta; no comparar timestamps;
8. comprobar que la raíz QA, su `.astro/`, cache y `dist/` están ausentes, que el `dist/` real sigue
   ausente, que 4173 y los puertos efímeros están libres y que no queda ningún hijo;
9. emitir resultados únicamente por stdout, sin log, captura o JSON persistente.

Si `--build` termina PASS pero `--browser` no llega a ejecutarse, QA queda INCOMPLETA y la raíz QA
marcada es residuo pendiente. Antes de continuar IMPLEMENT o auditoría final se debe invocar el mismo
`--browser`; su `finally` elimina exclusivamente ese namespace si puede demostrar ownership, incluso
si el preflight, preview o recorrido falla. Si no puede demostrarlo, STOP y revisión humana. No existe
script, dependencia ni modo de cleanup adicional.

## Expected storage contract

Key única:

```text
guiapineda:submission-draft:v1:veu
```

Forma esperada:

```json
{
  "version": 1,
  "scope": "veu",
  "fields": {
    "titol": "…",
    "resum": "…",
    "contingut": "…",
    "tipo_autoria": "nom_complet",
    "autor_public": "…",
    "nombre_contacto": "…",
    "email_contacto": "…"
  }
}
```

La comparación del envelope debe ser por igualdad profunda: ninguna clave extra es aceptable.

## QA matrix

### A. Persistencia positiva

| ID | Caso | Resultado esperado |
|---|---|---|
| QA01 | Editar los siete campos | envelope contiene exactamente siete strings allowlisted |
| QA02 | Reload después de editar | se restauran los valores más recientes |
| QA03 | Draft parcial/vacíos | presentes válidos se restauran; ausentes mantienen default |
| QA04 | `tipo_autoria` con cada enum válido | vacío y tres valores se guardan/restauran exactamente |
| QA05 | Cambiar tipo con `autor_public` escrito | autor público permanece visible, obligatorio y sin borrar |
| QA06 | Nombre/email parciales dentro de máximo | se restauran como texto, sin estado verificado |

### B. CA/ES/EN

| ID | Caso | Resultado esperado |
|---|---|---|
| QA07 | CA → ES | mismo envelope y valores |
| QA08 | ES → EN | mismo envelope y valores |
| QA09 | EN → CA | mismo envelope y valores más recientes |
| QA10 | Texto escrito durante recorrido | contenido literal, sin traducción/trim/transformación |
| QA11 | Inspección de keys | existe una key `veu`, no una key por locale |

Rutas:

- CA: `/veus/envia-la-teva-veu`
- ES: `/es/veus/envia-tu-voz`
- EN: `/en/veus/send-your-voice`

### C. Exclusiones

| ID | Caso | Resultado esperado |
|---|---|---|
| QA12 | Seleccionar imagen | ni archivo ni bytes entran en storage |
| QA13 | Generar preview/nombre/object URL | ningún derivado entra en storage o reaparece |
| QA14 | Marcar consentimiento | no se persiste; tras navegación aparece desmarcado |
| QA15 | Completar verificación sintética | token/challenge/código/verified state ausentes y estado fresco al volver |
| QA16 | Abrir review | step/index no se persiste; al volver abre formulario |
| QA17 | Review renderizada | snapshot/labels no entran en payload |
| QA18 | Inyectar controles/campos desconocidos | no se guardan ni restauran |

### D. Corrupción

| ID | Caso | Resultado esperado |
|---|---|---|
| QA19 | JSON inválido | key descartada/ignorada; formulario usable |
| QA20 | root array/string/null | envelope descartado; defaults seguros |
| QA21 | versión distinta de 1 | envelope descartado |
| QA22 | scope distinto de `veu` | envelope descartado sin tocar otras keys |
| QA23 | fields parcial válido | campos válidos presentes restaurados individualmente |
| QA24 | valor no string | ese campo ignorado, otros válidos restaurados |
| QA25 | enum desconocido | select conserva vacío/default seguro |
| QA26 | campo extra o string sobre máximo | campo inválido ignorado; resto usable |

Probar también getter/setter/removeItem de storage lanzando `SecurityError` o
`QuotaExceededError`: el formulario debe seguir rellenable, revisable y enviable. Este subcaso forma
parte de QA19–QA26 y no requiere infraestructura.

### E. UI reconciliada

| ID | Caso | Resultado esperado |
|---|---|---|
| QA27 | Restore desde estado que estaba en review | primer paso editable visible |
| QA28 | Restore de resumen/contenido | contadores y clases reflejan longitudes actuales |
| QA29 | Editar después de restore y abrir review | review usa valor nuevo, no snapshot |
| QA30 | Cambiar locale con autoría | label corresponde al idioma destino y valor contractual permanece |
| QA31 | Autoría válida/inválida/parcial | select y autor público mantienen reglas contractuales |

### F. Cleanup

| ID | Caso | Resultado esperado |
|---|---|---|
| QA32 | Fixture devuelve HTTP success + `{ok:true}` | key Veus eliminada después de confirmación |
| QA33 | Validación cliente falla | draft permanece; no request automático |
| QA34 | Verificación sintética falla | draft permanece |
| QA35 | Código sintético rechazado | draft permanece |
| QA36 | Submit lanza/falla | draft permanece; no segundo intento automático |
| QA37 | Fixture devuelve 503 | draft permanece |
| QA38 | Cambio CA/ES/EN | draft permanece |
| QA39 | Reload/regreso | draft permanece hasta éxito o fin natural de sesión |

Para QA32, inspeccionar storage inmediatamente tras la resolución simulada y antes de permitir que
la navegación de éxito cierre la observación. La fixture no debe aceptar otros endpoints.

### G. Regresión y aislamiento

| ID | Caso | Resultado esperado |
|---|---|---|
| QA40 | Agenda: save/restore/exclusión/clear actuales | PASS sin cambio semántico |
| QA41 | Comunicats: save/restore/exclusión/clear actuales | PASS sin cambio semántico |
| QA42 | Tres scopes coexistentes | cada key se lee/actualiza/elimina aisladamente |
| QA43 | Millorem/Foto/Commerce | no importan/inicializan draft nuevo y sus archivos no cambian |

## Browser QA procedure

1. Ejecutar `--build`; exigir cierre del doble CMS y las tres rutas en el `dist/` de la raíz QA.
2. Ejecutar `--browser`; el harness posee la raíz QA, preview, Chrome, CDP, fixture y temporales.
3. Ejecutar exclusivamente QA02, QA05–QA18 y QA27–QA39 en las rutas Veus reales y modos controlados
   descritos arriba; no navegar Agenda ni Comunicats.
4. Leer directamente `sessionStorage` y comparar key/payload exactos.
5. Exigir cleanup completo aunque una aserción falle.

No hay passthrough funcional o externo. Cualquier request a CMS real, Functions reales, Strapi,
email, internet o un path no reconocido es FAIL, no una dependencia del test.

## Final audit

- Los únicos archivos productivos modificados son `src/lib/submissionDraft.ts` y
  `src/lib/veuSubmissionFlow.ts`.
- El único archivo QA nuevo es `scripts/qa/veu-draft-persistence-qa.mjs`.
- Agenda y Comunicats pasan QA40/QA41.
- CA/ES/EN pasan la misma matriz funcional.
- Backend working tree permanece limpio.
- No existe lectura, hash, inspección o cambio SQLite, schema, migración, infraestructura o deploy.
- El `.astro/` real conserva existencia, árbol, tipo, bytes/hash y modo; nunca se restaura ni se
  evalúa por timestamps.
- La raíz QA y su `.astro/`, cache y `dist/` quedan ausentes; el `dist/` real permanece ausente.
- No quedan logs, capturas, perfiles, temporales o puertos/procesos activos.

## Pass criteria

- QA01–QA43: PASS.
- Build: PASS.
- `.astro/` real sin diferencias de árbol, tipo, bytes/hash o modo y sin ninguna escritura/restauración.
- Raíz QA y artefactos owned ausentes; `dist/` real ausente después del cleanup browser.
- `git diff --check`: PASS.
- 0 requests externas inesperadas.
- 0 campos fuera de allowlist en el envelope.
- 0 cambios funcionales fuera del allowlist aprobado.
