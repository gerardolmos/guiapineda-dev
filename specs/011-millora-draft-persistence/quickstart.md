# Quickstart: Validate Millorem Draft Persistence

**Purpose**: guía reproducible para ejecutar después de IMPLEMENT. PLAN no autoriza ejecutar estos
comandos ahora.

## Preconditions

1. Estar en `main` con únicamente los archivos autorizados por Feature 011.
2. Backend limpio, no arrancado y sin ningún acceso SQLite.
3. Node `>=22.12.0`, dependencias existentes y Chrome instalado; no instalar paquetes.
4. `dist/` real ausente y ninguna raíz `.veu-011-qa-*` pendiente. Ante un path desconocido, STOP sin
   borrarlo ni asumir ownership.
5. Puerto `127.0.0.1:4173` libre; no matar procesos ajenos.
6. Inventariar `.astro/` real read-only por existencia, árbol, tipo, bytes/hash y modo. Es
   preexisting/non-owned; no se restaura, elimina o sobrescribe. Timestamps no son criterio.
7. No usar backend, Strapi, Functions, email, SQLite, internet ni servicios reales.
8. Capturar PRE/POST y fingerprints individuales de `spec.md`, `checklists/requirements.md`,
   `plan.md`, `research.md`, `data-model.md`, `quickstart.md` y `tasks.md`. Los seis primeros deben
   permanecer byte-idénticos; solo `tasks.md` puede cambiar durante IMPLEMENT. Al ser artefactos
   untracked, el estado Git por sí solo no sustituye esta comparación.

## Commands after TASKS authorization

```bash
node --check scripts/qa/millora-draft-persistence-qa.mjs
node scripts/qa/millora-draft-persistence-qa.mjs --dom
node scripts/qa/millora-draft-persistence-qa.mjs --build
node scripts/qa/millora-draft-persistence-qa.mjs --browser
git diff --check
```

`--build` y `--browser` son un ciclo indivisible. Tras build PASS debe ejecutarse browser
inmediatamente; el segundo modo es responsable del cleanup incluso si su preflight o recorrido
falla. Ningún modo escribe logs, capturas o resultados persistentes.

## Expected storage contract

Key única:

```text
guiapineda:submission-draft:v1:millora
```

Envelope exacto:

```json
{
  "version": 1,
  "scope": "millora",
  "fields": {
    "categoria": "incidencies",
    "zona": "centre",
    "millora-author-type": "alias",
    "millora-alias": "Nom literal",
    "titol": "…",
    "resum": "…",
    "contingut": "…",
    "email_contacto": "…"
  }
}
```

Comparar `fields` por igualdad profunda: exactamente ocho keys al guardar el form actual. No se
admiten `autor_public`, labels, archivo, consentimiento, verificación o estado técnico.

## QA matrix

### A. Persistencia e integración

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA01 | Editar los ocho campos | envelope exacto, ocho strings | DOM |
| QA02 | Dos ediciones y reload | gana el último valor y reaparece | Browser |
| QA03 | Parcial y valores vacíos | presentes válidos restaurados; vacío sustituye valor anterior | DOM |
| QA04 | Author-type `""`, `resident`, `visitor`, `alias` | solo enums contractuales | DOM |
| QA05 | Alias → resident/visitor → reload → alias | alias se conserva/reaparece, pero queda ausente de `FormData` y payload mientras no está activo | Browser |
| QA06 | Reconstruir `autor_public` para cuatro estados | vacío/labels actuales/trim(alias), nunca stored | Browser |
| QA07 | Restaurar email | valor vuelve; verified false, código/challenge/token vacíos | Browser |
| QA08 | Restore de contexto/contenido | primer paso; botones; contadores de título, resumen y contenido; tiempo/indicador y preview coherentes | Browser |
| QA09 | Editar después de restore y abrir review | review usa DOM nuevo, no snapshot | Browser |
| QA10 | Storage get/set/remove lanza | flow usable y sin excepción visible | DOM |

### B. CA / ES / EN

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA11 | CA → ES | misma key y valores | Browser |
| QA12 | ES → EN | misma key y valores | Browser |
| QA13 | EN → CA con edición intermedia | último valor compartido | Browser |
| QA14 | Texto con espacios/acentos | literal, sin trim/traducción | Browser |
| QA15 | Alias literal → resident/visitor → alias en CA/ES/EN | el alias oculto se conserva sin aplicarse en `autor_public`, preview o review mientras el tipo activo es `resident`/`visitor`; esas superficies usan la label del locale actual sin labels stale, y volver a `alias` recupera exactamente el valor conservado | Browser |
| QA16 | Inventario de keys | una key `millora`, no una por locale | DOM |

Rutas exactas:

- CA: `/millorem-pineda/envia-una-millora/`
- ES: `/es/millorem-pineda/enviar-una-mejora/`
- EN: `/en/millorem-pineda/send-an-improvement/`

### C. Exclusiones

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA17 | Inspeccionar `autor_public` | ausente del envelope; reconstruido | Browser |
| QA18 | Seleccionar imagen | archivo, bytes y filename ausentes | Browser |
| QA19 | Preview/object URL | no stored; no reaparece tras navegación | Browser |
| QA20 | Marcar consentimiento | ausente; vuelve desmarcado | Browser |
| QA21 | Verificación completa y pageshow/bfcache | challenge, token, código, timer, verified, autorización temporal y submission state aplicable quedan frescos | Browser |
| QA22 | Idioma hidden | no stored; corresponde a ruta actual | Browser |
| QA23 | Content/review, errores y loading | step/review/errors/submission state no stored; primer paso al volver | Browser |
| QA24 | Control desconocido | no se guarda aunque emita input/change | DOM |

### D. Corrupción y límites

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA25 | JSON malformado | key descartada/ignorada; defaults seguros | DOM |
| QA26 | root null/array/string o fields no objeto | envelope descartado | DOM |
| QA27 | version distinta | envelope descartado | DOM |
| QA28 | scope distinto | no restaurar ni tocar otras keys | DOM |
| QA29 | fields parcial válido | restore individual | DOM |
| QA30 | no-string, extra y over-limit | ignorar campo individual | DOM |
| QA31 | categoría inválida | ninguna radio seleccionada; form usable | Browser |
| QA32 | zona inválida | select queda vacío/default | Browser |
| QA33 | author-type inválido | tipo y `autor_public` vacíos; alias no aplicable | Browser |
| QA34 | email parcial inválido dentro de 180 | se restaura literalmente con controlador/flow real; request-code 0 y submit 0 | Browser |

Límites superiores: alias 100, título 120, resumen 280, contenido 6000, email 180. Los mínimos y el
formato de email se prueban como validaciones, no como filtros de borrador parcial.

### E. Lifecycle y cleanup funcional

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA35 | Validación cliente falla | key intacta; 0 submit | Browser |
| QA36 | Request-code 503 | key intacta; sin retry | Browser |
| QA37 | Verify-code rechazado | key intacta; verified false | Browser |
| QA38 | Submit 500/503 o `{ok:false}` | key intacta; un intento | Browser |
| QA39 | Submit 200 `{ok:true}` y navegación productiva real | clear productivo observado antes de navigation requested; request `Document`, success route y key ausente tras load | Browser |
| QA40 | Reload/cambio CA-ES-EN | key intacta | Browser |
| QA41 | History back/forward con bfcache | primer paso; verificación fresca; draft intacto | Browser |

### F. Regresión e aislamiento

| ID | Caso | Evidencia esperada | Modo |
|---|---|---|---|
| QA42 | Agenda | key/allowlist/save/restore/clear, corrupción fail-open e invalid/unknown sin contaminación | DOM |
| QA43 | Comunicats | key/allowlist/save/restore/clear, corrupción fail-open e invalid/unknown sin contaminación | DOM |
| QA44 | Veus | key/allowlist/save/restore/clear, corrupción fail-open e invalid/unknown sin contaminación | DOM |
| QA45 | Cuatro scopes coexistentes | cada key se actualiza/elimina aisladamente | DOM |

Cada ID tiene setup, acción y aserción propios. El harness mantiene por modo un array de IDs
realmente completados y exige igualdad exacta con la lista esperada; imprimir un ID sin ejecutar el
caso es FAIL.

## Mode ownership

### `--dom`

Ejecuta exclusivamente:

```text
QA01, QA03, QA04, QA10, QA16, QA24–QA30, QA42–QA45
```

Usa Node built-ins, helper real y fixtures DOM/storage aisladas por caso. Debe comprobar restore
antes de listeners, save síncrono, cero trabajo diferido y snapshot determinista. Dos runs
consecutivos deben producir output normalizado y snapshot observado idénticos, sin contaminación.

### `--browser`

Ejecuta exclusivamente:

```text
QA02, QA05–QA09, QA11–QA15, QA17–QA23, QA31–QA41
```

Esto cubre 29 casos reales; DOM cubre los 16 restantes. `--build` no marca IDs funcionales; acredita
únicamente compilación y materialización de las tres rutas dentro del qa-root.

## Build and browser environment

### Isolated build

1. Crear qa-root mediante `mkdtemp` bajo el frontend con marker opaco, run-id, realpath e identidad.
2. Copiar solo `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json` y lockfile.
3. Excluir `.astro/`, `dist/`, `.git/`, `.specify/`, specs, scripts, `.env*`, backend y datos.
4. Levantar doble CMS en `127.0.0.1:0` para los ocho endpoints exactos actuales; cualquier otro
   método/path/query es FAIL.
5. Ejecutar `npm run build -- --root <qa-root>` con `STRAPI_URL` solo para ese hijo.
6. Exigir tres rutas Millorem y output exclusivamente dentro de qa-root.
7. Cerrar doble en `finally` y verificar listener liberado.
8. En FAIL, retirar solo qa-root de ownership validado; en PASS, conservarlo únicamente para el
   `--browser` inmediato.

### Preview, fixture and guard

- Exigir 4173 libre y lanzar preview owned en loopback desde qa-root.
- Readiness: CA responde 200 y contiene `data-millora-submission-flow` en máximo 15 s.
- Chrome headless usa perfil temporal y CDP con puerto efímero; nunca perfil real.
- Shim pre-document intercepta solamente:
  - `POST /api/verification/request-code`, scope `millora`, idioma actual;
  - `POST /api/verification/verify-code`, challenge/código/token sintéticos;
  - `POST /api/submissions/millora`, modos success/fail/unavailable.
- Guard de red permite solo GET/HEAD del origen preview para las tres rutas de formulario, tres rutas
  de éxito (`/enviat/`, `/es/enviado/`, `/en/sent/`), favicon y `/_astro/`. Todo `/api/` que escape
  del shim, otro origen/método/path o internet es FAIL.
- El guard fail-closed puede usar `Fetch.requestPaused` en request-stage para continuar requests
  allowlisted, abortar tráfico inesperado e interceptar endpoints sintéticos aprobados. Esta
  interceptación no puede retener la navegación `Document` de éxito para acreditar el ordering.
- QA39 usa la success URL HTTP real del formulario y no pausa su request. Instrumentación
  pre-document observa la respuesta controlada 200/`{ok:true}` y registra la llamada real de producto
  a `sessionStorage.removeItem` delegando al método nativo; CDP observa después
  `Page.frameRequestedNavigation`, la request `Document` y el load de la success route.
- El ledger exacto es: success HTTP/JSON controlado → clear productivo → navigation requested →
  request `Document` → success document efectivo → key ausente tras load same-origin.
- QA39 prohíbe `javascript:`, `Page.navigate`, segunda navegación, clear del test, polling de storage,
  falsos eventos y branches productivos de QA. La instrumentación solo observa; no altera el
  resultado de storage ni la navegación.
- PNG sintético y temporales viven en el directorio owned del harness.

### Cleanup universal

Un coordinador idempotente y no reentrante ejecuta el mismo cleanup para PASS, assertion FAIL,
excepción, build/preview/browser failure, `SIGINT`, `SIGTERM` y abort controlado. Cada paso se intenta
de forma independiente; sus errores se acumulan y se reportan juntos al final, sin ocultar la causa
original. Ningún error temprano omite recursos posteriores:

1. retirar shim/listeners y guard;
2. cerrar target, CDP y Chrome;
3. terminar preview con `SIGTERM`, esperar hasta 5 s y usar `SIGKILL` solo para el hijo owned;
4. cerrar doble si siguiera abierto;
5. eliminar perfil, PNG y temporales owned;
6. eliminar qa-root solo tras revalidar marker, run-id, realpath, device/inode, tipo e identidad;
7. comprobar `.astro/` real por árbol/tipo/bytes/hash/modo, sin restaurar ni comparar timestamps;
8. confirmar qa-root, profile y `dist/` real ausentes, puertos libres y cero hijos owned.

La primera señal impide iniciar trabajo nuevo y activa una sola secuencia; señales posteriores
durante cleanup no reentran ni duplican borrados. Solo se actúa sobre recursos owned, nunca por
nombre global. Ante ownership dudoso, STOP y revisión humana; no borrar nada desconocido. El proceso
termina no exitoso si cualquier cleanup requerido falla.

## Remediation RED/GREEN gate

El GREEN anterior no acredita los contratos ampliados. Tras TASKS REMEDIATION #5 debe ejecutarse un RED
de remediación con producto congelado y luego GREEN para QA05, QA08, QA15, QA21, QA34, QA39, QA42,
QA43, QA44 y las rutas de cleanup failure/signal. QA05 debe observar que un alias conservado con tipo
`resident`/`visitor` no entra en `FormData` ni payload. Evidencia anterior no afectada solo puede
reutilizarse si TASKS/ANALYZE demuestra que sigue siendo válida después del cambio.

## Final audit

- Producto modificado exactamente: `submissionDraft.ts`, `milloraSubmissionFlow.ts`,
  `netlifySubmission.ts`.
- `netlifySubmission.ts` conserva modo automático por defecto; Agenda, Comunicats, Veus y Foto del
  Mes pasan regresión sin adaptación productiva.
- QA nuevo exactamente: `millora-draft-persistence-qa.mjs`.
- `MilloraSubmissionFlow.astro`, rutas, `emailVerificationController.ts` y los flows read-only
  `agendaSubmissionFlow.ts`, `comunicatSubmissionFlow.ts`, `veuSubmissionFlow.ts` y
  `fotoMesSubmission.ts` permanecen byte-identical. `netlifySubmission.ts` se modifica mínimamente
  dentro de la allowlist para añadir el modo opcional; no se considera protegido/byte-identical.
- Envelope exacto de ocho campos; `autor_public` y exclusiones ausentes.
- Alias oculto conservado en draft pero ausente de `FormData`/payload cuando type no es `alias`.
- QA01–QA45 ejecutados exactamente en sus modos y PASS.
- Dos runs `--dom` deterministas.
- Build/browser PASS y cleanup universal PASS.
- `.astro/` real sin diferencias contractuales; `dist/` real ausente.
- Backend limpio; SQLite access/reads/hashes/metadata/sidecars/commands/schema/migrations none.
- `git diff --check` PASS; cero temp, logs, perfiles, listeners o procesos owned.

## Pass criteria

- 45/45 casos PASS, sin ID duplicado, omitido o no ejecutado.
- Node syntax PASS; DOM determinismo PASS; build PASS; browser PASS.
- 0 requests externas inesperadas.
- 0 campos fuera de allowlist.
- 0 cambios fuera de IMPLEMENT allowlist.
- 0 residuos owned.
