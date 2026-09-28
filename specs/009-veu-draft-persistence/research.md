# Research: Veus — Safe Multilingual Draft Persistence

**Date**: 2026-09-26
**Scope**: inspección read-only previa al diseño de Feature 009

## Decision 1: Reutilizar `submissionDraft.ts`

**Decision**: integrar Veus en el helper compartido y ampliar únicamente su unión de scopes, soporte
de `select` y reglas optativas de restauración.

**Rationale**: Agenda y Comunicats ya demuestran el envelope versionado, aislamiento por scope,
guardado por eventos, tolerancia a storage y cleanup explícito requeridos. Veus comparte la misma
clase de formulario y sus tres idiomas montan un único controlador.

**Alternatives considered**:

- Helper Veus duplicado: rechazado por duplicar privacidad, corrupción y lifecycle.
- Refactor general de todos los drafts: rechazado porque cambia features cerradas sin necesidad.
- Persistencia dentro del componente Astro: rechazada porque mezcla markup, estado y storage.

## Decision 2: `sessionStorage` y scope único `veu`

**Decision**: usar `guiapineda:submission-draft:v1:veu`, sin locale, TTL ni sincronización.

**Rationale**: `sessionStorage` está aislado por origen y sesión de pestaña, sobrevive reload y
navegación same-origin y finaliza naturalmente con la sesión. Una clave sin idioma permite continuar
el mismo borrador en CA, ES y EN y queda separada de `agenda` y `comunicat`.

**Alternatives considered**:

- `localStorage`: rechazado por retención superior a la aprobada.
- Claves `veu:ca`, `veu:es`, `veu:en`: rechazadas porque fragmentan el borrador.
- TTL: rechazado porque crea una expiración artificial.
- BroadcastChannel o evento `storage`: rechazados porque no se promete sincronización entre tabs.

## Decision 3: Envelope y corrupción actuales

**Decision**: conservar `{ version: 1, scope: "veu", fields: Record<string,string> }` y las reglas
estructurales del helper.

**Rationale**: el helper ya verifica objeto raíz, versión, scope y objeto `fields`; limpia el envelope
completo ante JSON/raíz/version/scope/fields incompatibles; y aplica individualmente solo strings de
campos allowlisted. Las operaciones están protegidas con `try/catch`.

**Alternatives considered**:

- Migración de versiones: rechazada; Veus no tiene payload previo legítimo.
- Esquema externo o librería de validación: rechazado por dependencia y complejidad innecesarias.

## Decision 4: Select seguro y validación optativa

**Decision**: añadir soporte estricto de `HTMLSelectElement`, aceptando solo el vacío o valores de
opciones existentes, y permitir predicados optativos de restore para Veus. Los callers actuales sin
reglas conservan su comportamiento.

**Rationale**: `tipo_autoria` es la única divergencia de tipo respecto del helper. La comprobación de
opciones hace que `nom_complet`, `nom` y `pseudonim` sean contractuales y un enum inyectado no altere
el default. Reglas optativas permiten rechazar strings mayores que el `maxlength` de Veus sin cambiar
la semántica de Agenda/Comunicats.

Los `minlength` y el formato email son restricciones de avance/envío, no de borrador parcial. Un
valor incompleto dentro del máximo puede restaurarse, pero `checkValidity()` seguirá bloqueando el
avance. Así se preserva el objetivo de recuperar trabajo parcial sin desbloquear el flujo.

**Alternatives considered**:

- Validar toda entrada con `checkValidity()` al restaurar: rechazado porque perdería borradores
  parciales legítimos.
- Cambiar globalmente reglas de campos textuales: rechazado por riesgo de regresión.
- Convertir el select a radio o tocar markup: rechazado; el formulario real ya es correcto.

## Decision 5: Orden de inicialización y UI derivada

**Decision**: restaurar inmediatamente después de localizar el formulario y antes de inicializar la
verificación; después, reconciliar el primer paso y contadores con las funciones existentes.

**Rationale**: la verificación debe observar el email como texto actual pero comenzar sin challenge,
token ni estado verificado. `renderReview()` ya lee el DOM actual y obtiene la etiqueta desde la
opción localizada, por lo que se ejecutará solo al abrir review. Imagen, consentimiento y review no
se tocan y conservan sus defaults seguros.

**Alternatives considered**:

- Emitir eventos sintéticos después de restore: rechazado por riesgo de guardar derivados o disparar
  lógica no necesaria.
- Persistir contadores/review/paso: rechazado por duplicar estado derivado y contradecir la SPEC.
- Modificar las páginas lingüísticas: rechazado; comparten componente, nombres y controlador.

## Decision 6: Guardado síncrono por `input` y `change`

**Decision**: mantener los dos listeners del helper, registrados después del restore, y escribir el
envelope directamente durante el procesamiento normal de cada evento aprobado.

**Rationale**: `input` captura edición textual y `change` cubre el select; ambos son síncronos respecto
de la interacción y evitan polling. El restore no genera eventos porque ocurre antes de instalar los
listeners, por lo que no sobrescribe el envelope con defaults. Al terminar el evento, el último valor
ya está en `sessionStorage`: CA/ES/EN no depende de flush o trabajo pendiente y un clear de éxito no
puede ser revertido por una escritura tardía. Agenda, Comunicats y Veus comparten esta semántica; solo
las allowlists/reglas de restore difieren.

**Alternatives considered**:

- Escritura diferida o coalescida: rechazada por complejidad, riesgo de carreras y ausencia de una
  necesidad de rendimiento para un envelope local de siete strings.
- `beforeunload`/`pagehide`: rechazado porque puede fallar o borrar durante CA/ES/EN.
- Persistir estados internos del controller: rechazado por privacidad y estado duplicado.

## Decision 7: Cleanup después de éxito confirmado

**Decision**: invocar `clearDraft()` justo después de que resuelva
`submitVerifiedSubmissionForm(...)`.

**Rationale**: el transporte solo resuelve tras respuesta HTTP exitosa y JSON `{ ok: true }`; los
errores HTTP, JSON inválido o `{ ok: false }` lanzan. Por tanto, el retorno resuelto es la evidencia
local más estricta disponible. El clear no se coloca al iniciar submit, verificar o navegar a review.

**Alternatives considered**:

- Limpiar antes del `await`: rechazado por pérdida ante 503 o fallo de red.
- Limpiar al obtener token/verificar email: rechazado; no confirma creación de la solicitud.
- Limpiar en `pagehide`: rechazado; destruiría el borrador al cambiar idioma.
- Añadir reset/cancel: rechazado; esa acción no existe y está fuera de alcance.

## Decision 8: Sin cambios de markup, rutas o backend

**Decision**: limitar producto a `submissionDraft.ts` y `veuSubmissionFlow.ts`.

**Rationale**: los siete controles y sus constraints ya existen, las tres rutas usan el mismo montaje,
la review ya se deriva del formulario y el transporte ya distingue éxito/fallo. Ningún requisito
necesita HTML, copy, API o persistencia servidor.

**Alternatives considered**:

- Añadir selector lingüístico: rechazado explícitamente por scope.
- Añadir API de borradores: rechazado por privacidad, static-first y falta de necesidad.
- Cambiar verificación/transporte: rechazado porque sus contratos ya satisfacen el gate de éxito.

## Decision 9: Harness persistente propietario de build y browser QA

**Decision**: crear `scripts/qa/veu-draft-persistence-qa.mjs` con `--dom` para pruebas deterministas de
helper/DOM/storage y QA40–QA43, un doble CMS HTTP efímero para `--build` y un modo `--browser` limitado
a Veus que posea Astro preview, Chrome headless/CDP, perfil temporal, fixture y cleanup.

**Rationale**: el helper puede verificarse exhaustivamente sin infraestructura, pero el build actual
consulta ocho colecciones Strapi y no puede depender del backend real. Un HTTP double local que
responde envelopes vacíos permite ejecutar el comando existente `npm run build`. Después, el mismo
harness lanza `npm run preview -- --host 127.0.0.1 --port 4173`, espera la ruta CA y conduce el Chrome
ya instalado mediante CDP, patrón ya demostrado por Feature 001. La inyección previa a aplicación
simula solo verificación y `/api/submissions/veu`; un guard de red permite únicamente páginas/assets
del preview y bloquea todo endpoint que escape del shim o cualquier origen externo.

El harness usa `127.0.0.1:0` para su doble de build y el debugging de Chrome, descubriendo ambos
puertos efímeros; el preview usa el puerto fijo 4173 después de comprobarlo libre. `--build` exige
`dist/` real ausente y crea mediante `mkdtemp` una raíz QA aleatoria bajo el frontend. Copia allí
solo las entradas necesarias del proyecto y ejecuta desde el frontend `npm run build -- --root
<qa-root>`; Node resuelve
las dependencias instaladas desde el `node_modules` padre, mientras `.astro/`, cache y `dist/` se
crean dentro del namespace owned. `--browser` valida su marker/run id/realpath, sirve el `dist/`
interno y elimina la raíz completa en su `finally`, además de hijos, interceptores, perfiles,
imágenes y temporales. QA40–QA43 permanecen en `--dom`; el browser no navega Agenda/Comunicats. No se
añade un archivo de fixture, dependencia, servicio del producto o passthrough.

**Alternatives considered**:

- Solo revisión estática: rechazada porque no demuestra lifecycle ni UI.
- Solo browser manual: rechazado por baja reproducibilidad en corrupción y fallos de storage.
- Playwright/jsdom nuevos: rechazados porque el proyecto no los depende y no son necesarios.
- Functions/email/backend reales: rechazados por no determinismo, infraestructura y scope.
- Astro dev: rechazado porque añade toolbar/HMR y tráfico de desarrollo innecesario; el build ya
  generado se sirve con el script preview existente.
- Snapshot/restauración del `.astro/` real: rechazado porque adopta globalmente paths non-owned,
  puede pisar cambios concurrentes y Node/APFS no garantiza restaurar timestamps submilisegundo.
- `cacheDir` alternativo: rechazado como solución completa; la configuración instalada documenta que
  solo mueve cache de build, mientras `settings.dotAstroDir` y los locks/logs de preview se derivan
  directamente del `root` efectivo.
- Git worktree: rechazado porque añade estado Git persistente no necesario; una raíz QA efímera y
  copiada proporciona aislamiento sin rama, commit ni checkout adicional.
- Raíz temporal fuera del frontend: rechazada porque obligaría a duplicar/instalar dependencias o a
  introducir enlaces de resolución adicionales. Una raíz hija permite la resolución Node normal
  desde el `node_modules` padre sin modificarlo.
- Segundo archivo de fixture: rechazado porque el harness puede poseer toda la instrumentación y el
  allowlist debe permanecer cerrado.

**Evidencia local instalada**: Astro 7.2.4 expone `--root`; `createBaseSettings()` fija
`dotAstroDir = new URL(".astro/", config.root)`; los lock/log de preview usan igualmente
`.astro/{preview.json,preview.log}` bajo el root; `cacheDir` tiene default `./node_modules/.astro` y
es independiente. Por tanto, cambiar el root efectivo a una copia efímera aísla las tres clases de
escritura sin cambiar `astro.config.mjs` ni `package.json`.

**Contrato de observación**: el `.astro/` real es siempre preexistente/non-owned y solo se compara
antes/después mediante existencia, árbol, tipo, bytes/hash y modo. No se restaura. Los timestamps no
son criterio de igualdad: la estrategia anterior truncaba milisegundos y podía ocultar diferencias
reales en APFS; el aislamiento elimina la necesidad de escribirlos o restaurarlos. Toda discrepancia
real del árbol original es concurrent/unknown, produce FAIL y permanece intacta para revisión.

## Decision 10: Cero acceso SQLite

**Decision**: Feature 009 no lee, hashea, mide, abre, inspecciona sidecars, copia, respalda ni restaura
la SQLite real. Tampoco crea una SQLite temporal.

**Rationale**: es una feature frontend local y ningún archivo o proceso backend forma parte del
allowlist. La garantía es estructural: backend Git read-only, cero comandos DB y ningún acceso desde
el harness.

**Alternatives considered**:

- Fingerprints filesystem-only: rechazados porque amplían el alcance sin proteger ningún cambio
  autorizado por esta feature.
- Arranque Strapi para build: rechazado; el doble HTTP efímero del harness no usa datos reales ni
  carga el backend.

## Inventario observado

- `DraftScope`: actualmente `agenda | comunicat`.
- Agenda: 13 campos allowlisted, restore antes de verificación, reconciliación de UI y clear tras
  éxito.
- Comunicats: 7 campos allowlisted, mismo lifecycle y key independiente.
- Veus: 7 campos normativos; `tipo_autoria` es select; dos pasos; review y counters derivados; imagen,
  consentimiento y verificación fuera del draft; no existe reset.
- Rutas: CA, ES y EN comparten `VeuSubmissionPage.astro`, `VeuSubmissionFlow.astro` y
  `initVeuSubmissionFlow()`.
- QA: existen patrones ESM persistentes con `node:assert/strict`; no hay harness vigente específico
  de drafts que cubra Feature 009, por lo que el nuevo archivo está justificado.

## Resultado de investigación

Todos los puntos técnicos están resueltos. No queda `NEEDS CLARIFICATION`, no se justifica directorio
`contracts/` y no hace falta ampliar el allowlist previsto.
