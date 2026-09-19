# Implementation Plan: Persistencia de borradores multidioma de Agenda

**Branch**: `001-agenda-draft-persistence` (Spec Kit context; Git remains on `main`) |
**Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-agenda-draft-persistence/spec.md`

## Summary

Conservar en una única sesión de pestaña los 13 campos autorizados del formulario de Agenda al
navegar entre CA, ES y EN. La solución reutilizará el helper de borrador existente después de
restringirlo mediante una allowlist explícita y un envelope versionado. Agenda seguirá siendo la
única integración: restaurará valores antes de inicializar la verificación de email, recalculará
después todos sus estados derivados y limpiará el borrador tras éxito o reset. No habrá red,
backend, servicio nuevo, TTL ni cambios en otros formularios.

## Technical Context

**Language/Version**: TypeScript bajo configuración estricta; Node.js `>=22.12.0` para tooling

**Primary Dependencies**: Astro `^7.2.4`, APIs estándar del navegador; ninguna dependencia nueva

**Storage**: `sessionStorage` del navegador, limitado a la sesión natural de la pestaña

**Testing**: `npm run build`, revisión estática y matriz manual; no existe suite automatizada

**Target Platform**: Navegadores web que ya ejecutan el formulario estático de Astro y soportan
`sessionStorage`

**Project Type**: Aplicación web frontend estática con flujo de formulario en cliente

**Performance Goals**: Restauración síncrona de un único borrador pequeño antes de que el formulario
quede interactivo; sin peticiones de red ni trabajo perceptible adicional

**Constraints**: Allowlist cerrada, degradación segura si el storage falla, cero persistencia de
archivos/consentimiento/honeypot/tokens/verificación/secretos, sin TTL y sin botón nuevo

**Scale/Scope**: Un borrador de Agenda por sesión de pestaña, 13 campos string, tres rutas de idioma,
un solo repositorio frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-design gates

| Constitutional principle | Gate | Result |
|---|---|---|
| I. Editorial participation | No alterar publicación, moderación ni el carácter privado de la solicitud | PASS |
| II. Static-first architecture | Resolver en cliente sin SSR ni consultas runtime al CMS | PASS |
| III. Privacy and security | Minimizar PII y excluir verificación, tokens, secretos y consentimiento | PASS, with controlled tension noted below |
| IV. Verified infrastructure | No asumir ni añadir infraestructura o almacenamiento servidor | PASS |
| V. Simplicity and cost | Reutilizar APIs del navegador sin servicios ni dependencias nuevas | PASS |
| VI. Multilingual parity/no regression | Una integración común y validación CA/ES/EN | PASS |
| VII. Repository boundaries | Modificar solo `guiapineda-astro`; contrato con backend sin cambios | PASS |
| Workflow and quality | Diff, build, pruebas funcionales y Git status antes de completar IMPLEMENT | PASS |

**Controlled privacy tension**: nombre y email son datos personales almacenados temporalmente en el
navegador. La SPEC los aprueba expresamente. La allowlist de 13 campos, `sessionStorage`, la ausencia
de logs/red/TTL y la exclusión del estado de verificación mantienen la exposición en el mínimo
funcional aprobado. No requiere excepción constitucional.

### Post-design re-check

El diseño conserva todos los gates: no crea servicios, dependencias, endpoints ni persistencia de
servidor; no toca el flujo de moderación; mantiene una clave común para paridad CA/ES/EN; y restringe
los cambios previstos a dos archivos frontend. No hay violaciones que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/001-agenda-draft-persistence/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── agenda-draft-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── submissionDraft.ts          # safe browser-draft adapter; modify
│   ├── agendaSubmissionFlow.ts     # Agenda orchestration; modify
│   ├── emailVerificationController.ts  # unchanged
│   └── netlifySubmission.ts        # unchanged
├── components/
│   └── AgendaSubmissionFlow.astro  # existing shared markup; unchanged
├── templates/
│   └── AgendaSubmissionPage.astro  # unchanged
└── pages/
    ├── agenda/envia-una-activitat.astro
    ├── es/agenda/enviar-una-actividad.astro
    └── en/agenda/send-an-activity.astro
```

**Structure Decision**: Mantener la arquitectura frontend existente. La lógica transversal y
configurable de storage permanece en `src/lib/submissionDraft.ts`; la allowlist concreta y la
sincronización de UI pertenecen a `src/lib/agendaSubmissionFlow.ts`. No se requieren componentes,
páginas, endpoints o repositorios nuevos.

## Proposed Architecture

### Browser-draft adapter

`submissionDraft.ts` gestionará exclusivamente el ciclo técnico de un envelope versionado:

1. construir una clave estable y no localizada para scope `agenda`;
2. leer, parsear y validar con `try/catch`;
3. proyectar solo nombres declarados en la allowlist y valores string;
4. restaurar únicamente campos existentes del formulario;
5. guardar en `input` y `change` los valores más recientes;
6. limpiar explícitamente en `reset` y mediante la operación `clear` devuelta;
7. degradar silenciosamente si `sessionStorage` o JSON fallan.

El helper no descubrirá campos mediante un selector general ni mediante heurísticas de exclusión.
Recibirá la allowlist desde Agenda. El envelope será `{ version: 1, scope: "agenda", fields: {...} }`
y reutilizará la clave actual `guiapineda:submission-draft:v1:agenda`. Un payload raw del trabajo
previo carece de envelope y se tratará como incompatible: se eliminará, no se migrará.

### Agenda orchestration

`agendaSubmissionFlow.ts` será propietario de la allowlist exacta:

`titol`, `resum`, `descripcio`, `organitzador`, `data_inici`, `hora_inici`, `data_final`,
`hora_final`, `lloc`, `adreca`, `enllac_oficial`, `nombre_contacto`, `email_contacto`.

Esta lista positiva excluye por construcción `imatge`, `bot-field`, `aceptacion_privacidad`, hidden
inputs, tokens, estado `data-email-verified`, challenge/código de verificación y cualquier campo
futuro no aprobado. No se serializarán DOM state, previews, errores, botones ni review state.

### Initialization sequence

1. Obtener referencias DOM y configurar restricciones base de fecha y listeners que no dependen del
   borrador.
2. Inicializar el adapter y restaurar sin despachar eventos sintéticos ni validar con foco/mensajes.
3. Inicializar el controlador de verificación **después** del email restaurado. El controlador debe
   arrancar con token vacío y `data-email-verified="false"`.
4. Registrar autosave y lifecycle del borrador; mantener `input` y `change` como disparadores.
5. Reconciliar una vez el estado derivado: mínimos de fecha, validación silenciosa, contadores,
   preview de imagen vacío, paso de formulario, botón Continue y botón Submit deshabilitado.
6. En interacción posterior, conservar los handlers actuales de validación, review, imagen,
   verificación y submit.

La reconciliación inicial no simulará `change`: hacerlo podría borrar una fecha final restaurada,
activar guardados o disparar efectos de verificación. Los valores incompatibles se mantienen
visibles y las reglas actuales los marcan inválidos.

### Cleanup lifecycle

- **Successful submission**: conservar la llamada a `clear` solo tras la confirmación `{ok:true}`
  del transporte existente. Un error mantiene el borrador.
- **Form reset**: el adapter elimina storage en `reset`; Agenda sincroniza UI después de que el reset
  nativo aplique valores por defecto, sin crear un botón nuevo.
- **Tab-session end**: delegar exclusivamente en el comportamiento de `sessionStorage`. No usar
  `unload`, `pagehide`, temporizadores o TTL, porque limpiar al navegar rompería CA -> ES -> EN.

## Existing Work Assessment

### Reusable

- Uso de `sessionStorage`, clave común `agenda`, captura `input`/`change`, `try/catch`, limpieza en
  `reset` y operación `clear` retornada.
- Restauración antes del controlador de email y limpieza tras resolver el envío exitoso.
- Funciones actuales de validación, contadores, estados de botones, review e imagen de Agenda.

### Incorrect or incomplete; correct only during IMPLEMENT

- El selector genérico actual persiste `bot-field`; las exclusiones por substrings son frágiles.
- El raw `Record<string, string | boolean | string[]>` carece de envelope y validación real de
  versión/esquema; `v1` existe solo en la clave.
- Un objeto incompatible puede permanecer y reintentarse en cada carga.
- La restauración no declara explícitamente la allowlist ni informa una sincronización de estado.
- Tras restaurar, el mínimo de fecha final no se alinea expresamente con la fecha inicial restaurada.
- Tras `reset`, el storage y verificación se limpian, pero contadores, botones, imagen, paso y
  restricciones derivadas no tienen una reconciliación completa garantizada.
- El controlador de email contiene listeners `input` duplicados; se registra como deuda preexistente
  fuera de alcance y no se tocará para esta feature.

## File Impact

| Action during IMPLEMENT | File | Exact responsibility |
|---|---|---|
| Modify | `src/lib/submissionDraft.ts` | Envelope, allowlist, schema guard, safe read/write/restore/clear |
| Modify | `src/lib/agendaSubmissionFlow.ts` | 13-field policy, initialization order, derived-state sync, success/reset integration |
| Create | None | No new application file or dependency is required |
| Keep intact | `src/components/AgendaSubmissionFlow.astro` | Existing fields, language links and markup already suffice |
| Keep intact | `src/templates/AgendaSubmissionPage.astro` and three Agenda pages | Existing common mounting across CA/ES/EN |
| Keep intact | `src/lib/emailVerificationController.ts` | Existing security controller remains authoritative |
| Keep intact | `src/lib/netlifySubmission.ts` | Existing verified transport and success contract remain unchanged |
| Keep intact | `netlify/functions/**` | No Function or server-security changes |
| Keep intact | `../guiapineda-strapi/**` | No backend, Strapi, SQLite or schema changes |
| Keep intact | Other submission flows/components | No rollout to Comunicats, Veus, Millorem or Foto del mes |

Any discovered need to modify a listed intact area is a scope conflict and requires human approval
before implementation continues.

## Failure and Compatibility Handling

- Malformed JSON, invalid root/envelope, wrong version/scope or non-object `fields`: remove the stored
  item and continue with an empty draft.
- Unknown keys or fields removed from the current form: ignore them; never map them elsewhere.
- Missing allowed keys: leave the field at its normal initial value.
- Non-string value for one allowed field: ignore that field; restore the remaining valid subset.
- Current-validation failure: restore the string and let current validation/counters/buttons show the
  invalid state without focusing or reporting on load.
- `getItem`, `setItem`, `removeItem`, parse or serialization failure: catch locally; the form remains
  fillable, reviewable and submittable.
- No automatic migration of the pre-plan raw draft. Rejecting it prevents accidental reuse of a
  honeypot or other value collected by the broad selector.

## Regression Risks

1. Persisting the honeypot, consent, hidden token or future sensitive field through an overbroad
   selector.
2. Using a locale-specific key and losing values on CA/ES/EN navigation.
3. Reusing email-verification state or enabling Submit after restoring the email string.
4. Dispatching synthetic change events and clearing/restoring dates incorrectly.
5. Derived UI becoming stale after restore or reset: counters, date rules, Continue, Submit, image
   preview or current step.
6. Clearing before confirmed success and losing a draft after network/server failure.
7. Treating storage availability as mandatory and breaking the form in restricted browser modes.
8. Accidentally generalizing the pilot to other forms through the helper.
9. Personal name/email remaining accessible to same-origin JavaScript during the tab session; this
   is approved but requires strict minimization and no logging/network duplication.

## Validation Strategy

1. Review the diff and verify only the two planned source files changed.
2. Statically verify the allowlist contains exactly 13 names and no denylist-based discovery remains.
3. Run `npm run build`; record that no automated test suite or installed `astro check` exists.
4. Run the manual guide in [quickstart.md](./quickstart.md) across CA -> ES -> EN -> CA, including
   edits between changes and a same-tab reload.
5. Verify image, privacy consent, honeypot, token and verification state never restore; contact name
   and email do restore but email requires a new verification.
6. Verify current visual validation, counters, date constraints, Continue/Submit and review.
7. Verify successful submit clears, failed submit preserves, and programmatic/native reset clears and
   reconciles UI.
8. Inject malformed, wrong-version, unknown-field and type-invalid payloads; verify graceful recovery.
9. Test with storage unavailable and confirm normal filling/validation/submission still works.
10. Inspect final `git status` in frontend and backend; document any validation not performed.

## Human Approval

No unresolved technical decision requires approval for this PLAN. The allowlist, `sessionStorage`
lifetime and inclusion of contact name/email are already approved by the clarified SPEC. Approval is
required only if IMPLEMENT discovers a need to touch markup, shared transport, email verification,
backend, Functions, another form, a new dependency, or any server-side contract.

## Complexity Tracking

No constitutional violations or justified complexity exceptions.
