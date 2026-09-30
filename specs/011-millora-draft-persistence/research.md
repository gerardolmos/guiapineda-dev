# Research: Millorem — Safe Multilingual Draft Persistence

**Feature**: `011-millora-draft-persistence`
**Date**: 2026-09-28
**Result**: decisiones técnicas cerradas; `NEEDS CLARIFICATION` = 0

## Decision 1: Reutilizar `submissionDraft.ts` sin refactor general

**Decision**: añadir únicamente el scope `millora` al helper compartido y consumir sus capacidades
actuales de radios, selects, inputs, textareas, predicados, corrupción y lifecycle.

**Rationale**: Feature 009 ya incorporó los mecanismos que Millorem necesita. El flujo nuevo solo
requiere identidad propia, allowlist/predicados y reconciliación específica dentro de su controlador.

**Alternatives considered**:

- Helper exclusivo de Millorem: rechazado por duplicar reglas de privacidad y corrupción.
- Refactor de los cuatro drafts: rechazado por riesgo sobre features cerradas.
- Persistencia en el componente Astro: rechazado porque mezcla markup y estado de cliente.

## Decision 2: Scope `millora`, key única y envelope v1

**Decision**: usar `guiapineda:submission-draft:v1:millora` y el envelope existente
`{ version: 1, scope: "millora", fields }`, sin locale, TTL ni sincronización.

**Rationale**: `sessionStorage` sobrevive reload y navegación same-origin dentro de la pestaña. La
key sin locale mantiene un borrador CA/ES/EN y queda aislada de `agenda`, `comunicat` y `veu`.

**Alternatives considered**:

- Keys por idioma: rechazadas porque fragmentan el borrador.
- `localStorage`/IndexedDB: rechazados por mayor retención y complejidad.
- Nueva versión de envelope: rechazada; la forma actual cubre ocho strings.

## Decision 3: Allowlist exacta y restore parcial

**Decision**: guardar exactamente `categoria`, `zona`, `millora-author-type`, `millora-alias`,
`titol`, `resum`, `contingut`, `email_contacto`. Radios/select solo aceptan opciones actuales; textos
aceptan parciales hasta sus máximos.

**Rationale**: son las ocho decisiones o entradas humanas aprobadas. Restaurar un parcial conserva
trabajo sin saltarse la validación de avance. Cada campo inválido se ignora individualmente.

**Alternatives considered**:

- Todos los campos por serialización del form: rechazado por incluir seguridad y consentimiento.
- Exigir `checkValidity()` completo al restore: rechazado porque perdería borradores parciales.
- Normalizar o hacer trim al persistir: rechazado; debe conservarse contenido literal.

## Decision 4: Email restaurado, verificación siempre fresca

**Decision**: restaurar el string de `email_contacto` antes de inicializar verificación; luego el
controller comienza en `false` con challenge, código y token vacíos. En `pageshow` se llama a su
`reset()` para cubrir retorno por bfcache.

**Rationale**: email es dato aprobado del borrador, pero no constituye evidencia de verificación.
El controller ya vincula token al email actual y expone reset.

**Alternatives considered**:

- Excluir email: rechazada por decisión CLARIFY.
- Persistir verificación/token: rechazada por privacidad y seguridad.
- Restaurar email después del controller: rechazada porque podría mezclar orden y estado derivado.

## Decision 5: Autoría fuente, alias literal y `autor_public` derivado

**Decision**: persistir author-type y alias; conservar alias aunque esté oculto; reconstruir siempre
`autor_public`. `resident`/`visitor` toman labels del locale actual; `alias` usa `trim(alias)`; tipo
ausente o inválido produce vacío. Cuando el tipo activo no es `alias`, el valor conservado queda
fuera también de validación, preview, review, `FormData`, payload y submission remoto, sin borrarlo
ni mutarlo en el input o en el draft.

**Rationale**: author-type y alias son datos de usuario. `autor_public` es hidden, no editable y
recalculable; persistirlo duplicaría estado y podría trasladar una label CA a ES/EN.

**Alternatives considered**:

- Persistir `autor_public`: rechazada por duplicación y stale locale.
- Borrar alias al cambiar tipo: rechazada porque contradice CLARIFY y el comportamiento actual.
- Aplicar o enviar alias oculto en preview/review/payload: rechazado; solo es funcional con type
  `alias`.

## Decision 6: Restore antes de listeners de flow y reconciliación sin eventos

**Decision**: invocar el helper inmediatamente después de encontrar el form. El helper restaura y
después instala sus listeners; luego se inicializan verificación y listeners del flow, se fuerza el
primer paso y se llaman las funciones derivadas existentes.

**Rationale**: la API compartida ya garantiza restore-before-draft-listeners. Las asignaciones y
funciones de reconciliación no emiten eventos sintéticos, por lo que los listeners instalados no
generan escrituras durante restore. Dividir la API sería un refactor innecesario.

**Alternatives considered**:

- Emitir `input`/`change`: rechazado por guardados espurios y efectos laterales.
- Persistir contadores/preview/review/step: rechazado por estado duplicado.
- Instalar draft después de toda la UI: rechazado porque requeriría separar restore y save.

## Decision 7: Save directo y síncrono

**Decision**: conservar listeners `input` y `change` del helper, escritura directa del envelope y
ausencia de debounce, timers, microtasks, unload handlers o flush.

**Rationale**: ocho strings son pequeños. El último valor queda guardado antes de navegar y no hay
trabajo diferido que pueda revivir la key después de clear.

**Alternatives considered**:

- Debounce: rechazado por carreras al cambiar idioma.
- `beforeunload`/`pagehide`: rechazado por falta de fiabilidad.
- Guardado específico por control: rechazado porque la proyección allowlisted ya es segura.

## Decision 8: `pageshow` cubre bfcache y primer paso

**Decision**: extender el listener existente de `pageshow` dentro de Millorem para resetear
verificación/submission state, mostrar el primer paso y reconciliar UI. No reinstala listeners ni lee
de nuevo el draft.

**Rationale**: volver mediante history puede conservar DOM y memoria. Sin esta acción podrían
permanecer review o token, contradiciendo la SPEC aun cuando el draft sea correcto.

**Alternatives considered**:

- Confiar solo en markup inicial: insuficiente para bfcache.
- Deshabilitar bfcache: desproporcionado y no portable.
- Recargar forzosamente: degrada UX y añade navegación innecesaria.

## Decision 9: Navegación caller-controlled opcional después del éxito confirmado

**Decision**: ampliar `SubmissionOptions` con `navigation: "automatic" | "caller"`, default
`"automatic"`. En modo `caller`, `submitVerifiedSubmissionForm(...)` valida HTTP + JSON `{ok:true}`,
completa la espera y resuelve sin navegar. Millorem ejecuta entonces `clearDraft()` y
`window.location.assign(successUrl)` en ese orden. Nunca limpia en inicio, validación, verificación,
submit start, catch o respuesta no exitosa.

**Rationale**: el transporte actual ejecuta `location.assign()` antes de devolver control. El browser
demostró que, retenida esa navegación real incluso en response-stage y con sesiones CDP separadas,
Runtime no responde; por tanto el caller actual no puede garantizar ni observar el clear antes de la
destrucción. El modo explícito separa éxito y navegación sin cambiar el default de los otros callers,
no depende de timing y mantiene el cambio en dos módulos productivos además del helper ya aprobado.

**Alternatives considered**:

- **A — retorno antes de navegar para todos**: orden limpio, pero rompe el contrato actual y obliga a
  adaptar Agenda, Comunicats, Veus, Foto del Mes y Millorem; impacto desproporcionado.
- **B — callback `beforeNavigate`**: backward-compatible y pequeño, pero acopla lógica del caller al
  transporte y abre semántica problemática si el callback lanza tras un submit remoto ya aceptado.
- **C — modo caller-controlled**: elegido; explícito, determinista, opt-in y compatible por defecto.
- **D — nueva función/core de transporte sin navegación más wrapper legado**: correcto pero duplica
  API/refactoriza más que el modo discriminado y no aporta una garantía adicional.
- Clear antes del request, `finally`, unload/pagehide, timers o microtasks: rechazados por pérdida en
  fallo o por depender de carreras.

## Decision 9A: QA39 observa el orden sin pausar la navegación

**Decision**: usar la URL HTTP real del formulario. El harness observa la respuesta controlada
200/`{ok:true}` y envuelve de forma transparente `sessionStorage.removeItem` —o usa un binding CDP—
para registrar el clear productivo sin ejecutarlo. Después observa `Page.frameRequestedNavigation`,
la request `Document`, commit/load de la success route y la key ausente en el documento same-origin.
La success navigation no se pausa ni se retiene en response-stage. Esto no prohíbe
`Fetch.requestPaused` en request-stage para el guard fail-closed: ese guard puede continuar tráfico
allowlisted o abortar tráfico inesperado, pero no puede mantener held la navegación de éxito para
demostrar ordering.

**Rationale**: con el orden estructural, el clear ocurre antes incluso de solicitar navegación. No
es necesario retener el documento saliente ni consultar Runtime durante una pausa que el navegador
ha demostrado bloqueante. La instrumentación registra efectos reales y delega siempre al método
nativo; no altera producto ni fabrica la navegación.

**Alternatives considered**:

- Retener mediante Fetch la navegación `Document` de éxito en response-stage: rechazado por el
  deadlock Runtime observado empíricamente; el guard request-stage permanece permitido.
- `javascript:`, `Page.navigate`, segunda navegación o clear del test: rechazados porque sustituyen
  comportamiento productivo.
- Polling de `sessionStorage`: rechazado por timing y porque ya no es necesario.

## Decision 10: Cambio interno mínimo del transporte; cero cambios externos

**Decision**: `MilloraSubmissionFlow.astro`, rutas, traducciones y verificación son read-only.
`netlifySubmission.ts` admite únicamente el modo interno opcional; endpoint, payload, espera,
overlay, errores y default automático permanecen iguales. No se crea `contracts/` externo.

**Rationale**: los nombres, valores, labels y funciones necesarias ya existen. La feature cambia una
API TypeScript interna para hacer explícito quién navega, sin cambiar payload remoto ni UI visible.

**Alternatives considered**:

- Añadir data attributes: rechazado; el controller ya localiza los controles.
- Adaptar todos los callers: rechazado; el default automático conserva compatibilidad.

## Decision 11: DOM más browser real con build aislado

**Decision**: un harness nuevo ofrece `--dom`, `--build` y `--browser`. DOM prueba helper y
regresiones; browser prueba rutas, reload, navegación, bfcache, labels, imagen, consentimiento,
verificación y success boundary reales. Build/browser usan qa-root owned y guard de red fail-closed.

**Rationale**: un DOM simulado no prueba responsablemente navegación, montaje Astro, file inputs,
bfcache o locale real. Ejecutar dev/build en root real podría tocar `.astro`/`dist` non-owned.

**Alternatives considered**:

- Solo static/DOM: rechazado por huecos funcionales.
- Dev server sobre root real: rechazado por efectos ambientales.
- Backend real: rechazado por scope y seguridad.

## Decision 12: Regresión de tres scopes cerrados

**Decision**: probar Agenda, Comunicats y Veus independientemente y coexistencia de cuatro keys.

**Rationale**: el único cambio compartido es `DraftScope`; regresiones específicas demuestran que
allowlists, restore/corrupción/save/clear e aislamiento anteriores siguen intactos.

**Alternatives considered**:

- Solo typecheck: insuficiente para semántica runtime.
- Navegar los tres flows en browser: innecesario; sus contratos se prueban con helper/fixtures DOM.

## Decision 13: Backend y SQLite fuera de acceso

**Decision**: backend untouched. SQLite access/reads/hashes/metadata/sidecars/commands/schema changes/
migrations: none.

**Rationale**: el draft es exclusivamente browser-temporary; ningún dato persistente del servidor
participa en diseño o QA.

**Alternatives considered**:

- Inspección read-only de DB: rechazada por irrelevante y expresamente prohibida.

## Decision 14: Cleanup acumulativo, idempotente y sensible a señales

**Decision**: ejecutar cleanup mediante un único coordinador no reentrante que intenta cada recurso
owned de forma independiente, acumula errores y falla al final si cualquier cleanup requerido no
termina. El mismo camino atiende PASS, assertion FAIL, excepción, fallos build/preview/browser,
`SIGINT`, `SIGTERM` y abort controlado.

**Rationale**: una excepción temprana no debe impedir retirar recursos owned posteriores. La primera
señal inicia una sola secuencia; otra señal durante cleanup no crea una segunda eliminación. Toda
señalización conserva identidad de hijo/grupo y toda retirada de qa-root revalida ownership completo.

**Alternatives considered**:

- `finally` secuencial que corta al primer error: rechazado porque deja recursos posteriores.
- Cleanup global o kill por nombre: rechazado por riesgo sobre recursos no-owned.
- Forzar retirada ante mismatch: rechazado; ownership dudoso exige STOP y revisión humana.

## Inventario observado

- Helper: version 1; scopes `agenda`, `comunicat`, `veu`; radio/select/text; predicates optativos.
- Millora author types: `resident`, `visitor`, `alias`; default sin selección.
- Límites: alias 100, título 120, resumen 280, contenido 6000, email 180.
- Categorías contractuales: `incidencies`, `civisme`, `propostes`.
- Zonas: once valores compartidos por CA/ES/EN y opción vacía.
- Rutas Millorem: CA, ES y EN comparten componente y controlador.
- Submit confirmado en Millorem: promesa resuelta de `submitVerifiedSubmissionForm()` en modo
  caller-controlled, antes de cualquier navegación.
- Reset general: inexistente; retirar imagen no es reset de borrador.
- `dist/` real: ausente al planificar. `.astro/` real: presente y non-owned.

## Resultado de investigación

No queda ninguna decisión técnica abierta. La retención CDP quedó descartada por evidencia runtime.
El modo caller-controlled opcional garantiza el orden sin cambiar el default de Agenda, Comunicats,
Veus o Foto del Mes. El diseño mínimo queda limitado a tres módulos productivos y un harness; exige
regresión explícita de los cinco callers, sin modificar markup, rutas, backend o DB.
