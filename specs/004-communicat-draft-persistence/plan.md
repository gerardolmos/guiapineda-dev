# Implementation Plan: Persistencia segura del borrador de Comunicats

**Branch**: `004-communicat-draft-persistence` (Spec Kit context; Git remains on `main`) |
**Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-communicat-draft-persistence/spec.md`

## Summary

Extender el adaptador de borrador de Agenda para admitir el scope `comunicat` y un grupo de radios
allowlisted, y conectarlo al flujo cliente existente de Comunicats. Un envelope versionado en
`sessionStorage` conservará exclusivamente siete valores dentro de la sesión de la pestaña,
compartidos por CA, ES y EN. El flujo restaurará antes de iniciar la verificación, volverá siempre al
primer paso, recalculará su estado derivado y limpiará únicamente en reset o tras aceptación
confirmada. Backend, Functions, markup, infraestructura y dependencias permanecen intactos.

## Technical Context

**Language/Version**: TypeScript y Astro sobre Node.js `>=22.12.0`

**Primary Dependencies**: Astro `^7.2.4`, APIs web del navegador y componentes existentes; ninguna
dependencia nueva

**Storage**: `sessionStorage` del navegador, aislado por pestaña y origen; sin persistencia remota

**Testing**: build Astro existente, inspección estática, sondas locales de DOM/storage y matriz
manual local CA/ES/EN; el repositorio no dispone de test runner, lint ni `astro check` instalados

**Target Platform**: navegador moderno sobre las páginas Astro estáticas existentes

**Project Type**: frontend web static-first

**Performance Goals**: restauración y guardado síncronos sobre siete strings, sin peticiones de red
ni cambios perceptibles en la navegación normal

**Constraints**: allowlist cerrada; ningún archivo, consentimiento o estado de verificación; primer
paso tras restaurar; sin TTL, controles nuevos, backend, Functions, infraestructura o dependencias

**Scale/Scope**: un borrador por sesión de pestaña, siete campos, tres rutas lingüísticas existentes
y dos archivos de aplicación modificables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-design gates

| Constitutional principle | Gate | Result |
|---|---|---|
| I. Editorial participation | La persistencia no altera publicación ni moderación | PASS |
| II. Static-first architecture | Solo estado efímero en navegador; sin acceso runtime al CMS | PASS |
| III. Privacy and security | Allowlist mínima y exclusión de archivo, consentimiento, token y verificación | PASS |
| IV. Verified infrastructure | Sin cambios de datos o infraestructura; E2E remoto diferido | PASS |
| V. Simplicity and cost | Reutilizar helper existente sin dependencia o servicio nuevo | PASS |
| VI. Multilingual parity/no regression | Una clave común CA/ES/EN y regresión de Comunicats y Agenda | PASS |
| VII. Repository boundaries | Solo `guiapineda-astro`; Strapi y Functions quedan intactos | PASS |
| Workflow and quality | Build, matriz local, diff y estado Git exigidos antes del cierre | PASS |

### Post-design re-check

El diseño conserva todos los gates. La persistencia es temporal, local a la pestaña y estrictamente
proyectada mediante allowlist. El controlador de verificación continúa siendo la única autoridad de
email, no cambia el transporte ni existe acceso nuevo a Strapi. La ampliación del helper compartido
se valida también contra Agenda. No hay excepción constitucional ni complejidad que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/004-communicat-draft-persistence/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── communicat-draft-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (`guiapineda-astro`)

```text
src/lib/
├── submissionDraft.ts             # modify: scopes agenda/comunicat and safe radio projection
└── comunicatSubmissionFlow.ts     # modify: policy, lifecycle and derived-state reconciliation
```

**Structure Decision**: mantener la arquitectura frontend actual. `submissionDraft.ts` seguirá
siendo un adaptador técnico genérico controlado por scope y allowlist; `comunicatSubmissionFlow.ts`
será propietario de los siete nombres permitidos y de toda reconciliación específica del formulario.
El componente Astro y las tres rutas ya comparten markup y lógica, por lo que no requieren cambios.

## Proposed Architecture

### 1. Adaptador de borrador compartido

Ampliar `initSubmissionDraft` para aceptar los scopes literales `agenda | comunicat`, conservando la
misma API de inicialización y la operación `clear` devuelta. Sustituir el tipo de envelope específico
de Agenda por uno compartido con `{ version: 1, scope, fields }` y mantener una clave independiente
por scope: `guiapineda:submission-draft:v1:${scope}`.

El adaptador continuará resolviendo exclusivamente nombres recibidos en la allowlist. Admitirá:

- inputs textuales ya soportados (`text`, `email`, `url`, `date`, `time`);
- `textarea`;
- grupos formados únicamente por radios del mismo nombre, para `tipus_remitent`.

No admitirá `file`, `hidden`, `checkbox`, password ni controles de otro tipo. Un radio se serializa
como el valor seleccionado o string vacío si no hay selección. Al restaurar, solo se marca una opción
si el string coincide exactamente con el valor de un radio vigente del grupo; un valor retirado o
desconocido se ignora y no selecciona sustituto. La ampliación no cambia la semántica de Agenda.

### 2. Identidad y envelope de Comunicats

- Medio: `sessionStorage`.
- Clave: `guiapineda:submission-draft:v1:comunicat`.
- Envelope: versión literal `1`, scope literal `comunicat` y `fields` objeto.
- Allowlist exacta del caller: `tipus_remitent`, `autor`, `titol`, `resum`, `contingut`,
  `nombre_contacto`, `email_contacto`.
- CA, ES y EN comparten clave porque son rutas del mismo origen y representan un solo Comunicat.
- No se guarda idioma, timestamp, TTL, índice de paso, preview, validez ni estado operacional.

Los envelopes con JSON inválido, raíz no objeto, versión/scope incompatible o `fields` no objeto se
eliminan best-effort. En un envelope válido, claves desconocidas y valores no string se ignoran;
campos permitidos ausentes conservan su valor inicial. No hay migración ni coerción.

### 3. Secuencia de inicialización y restauración

En `initCommunicatSubmissionFlow`, inmediatamente después de localizar el formulario:

1. Inicializar el adaptador con scope `comunicat` y la allowlist exacta; este restaura valores sin
   emitir eventos sintéticos.
2. Inicializar después `initEmailVerificationController`; así el email puede estar visible, pero
   token, reto, código y `data-email-verified` nacen vacíos/falsos.
3. Registrar los listeners existentes del flujo.
4. Ejecutar una reconciliación silenciosa única: mostrar autor y ocultar contenido/revisión, limpiar
   imagen y previews de archivo, desmarcar consentimiento, ocultar errores, actualizar selección,
   campos condicionales vigentes, contadores, lectura, previews textuales y botones.

El flujo actual no contiene campos adicionales condicionales por tipo de remitente: la selección
visual del radio y el estado de Continue son su estado derivado vigente. No se inventan campos nuevos.
La reconciliación no llama `reportValidity`, no enfoca controles y no simula `input`/`change`.

### 4. Validez de valores restaurados

Los valores se conservan literalmente aunque ya no cumplan las reglas actuales. La orquestación
recalculará silenciosamente mínimos y máximos a partir del markup vigente. Para valores asignados por
script que excedan `maxlength`, se reutilizará el patrón de validación explícita ya aplicado en Agenda:
establecer validez personalizada localizada CA/ES/EN sin recortar el contenido. Autor, título,
resumen, contenido, nombre y email de contacto deberán impedir el avance o envío correspondiente
mientras sean inválidos. Al corregirlos, la validez, contadores, preview y botones se actualizarán.

### 5. Persistencia durante edición

El adaptador escuchará `input` y `change` después de restaurar. Cada evento sustituirá el envelope con
la proyección actual de los siete nombres, nunca con `FormData` ni con una enumeración general del
formulario. Eventos de imagen, consentimiento o verificación pueden provocar una lectura, pero esos
controles nunca entran en `fields` porque no están en la allowlist.

La actualización de `tipus_remitent` se guarda mediante `change`; los seis textos se guardan durante
`input` y también quedan cubiertos por `change`. Errores de lectura, escritura, cuota, seguridad o
serialización se contienen y no alteran el formulario.

### 6. Limpieza y fallos

- **Éxito**: llamar a `clearDraft()` únicamente después de que
  `submitVerifiedSubmissionForm` resuelva una respuesta explícita `{ ok: true }`.
- **Fallo**: cualquier excepción, error HTTP, respuesta no confirmada o falta de red conserva el
  envelope; el manejo de error actual permanece visible y recuperable.
- **Reset**: el adaptador elimina la clave en el evento nativo `reset`; el flujo reconcilia en una
  microtarea posterior al reset nativo, vuelve al primer paso y limpia derivados no persistidos.
- **Fin de sesión**: se delega al ciclo natural de `sessionStorage`; no se limpia en `beforeunload` o
  `pagehide`, ya que eso rompería la navegación CA/ES/EN.

El listener actual de `beforeunload` seguirá revocando únicamente la URL efímera de imagen, nunca el
borrador.

## Existing Work Assessment

### Reusable

- `src/lib/submissionDraft.ts`: envelope v1, clave por scope, allowlist, strings, restore sin eventos,
  autosave, reset, `clear` y tolerancia total a fallos de storage.
- `src/lib/agendaSubmissionFlow.ts`: precedente de restaurar antes de verificación, reconciliar
  derivados, limpiar tras éxito y conservar tras fallo.
- `src/lib/comunicatSubmissionFlow.ts`: pasos, validaciones, previews, imagen, revisión, submit y
  mensajes CA/ES/EN ya compartidos.
- `src/components/CommunicatSubmissionFlow.astro`: contiene los siete controles, los radios estables,
  límites actuales y montaje común; no necesita cambios.
- Las rutas CA, ES y EN existentes montan la misma plantilla y comparten origen.

### Extensión necesaria

- El helper limita hoy el scope a Agenda y no reconoce `RadioNodeList`; debe ampliarse sin abrir la
  selección de controles.
- Comunicats aún no declara allowlist, no inicializa borrador, no limpia tras éxito ni reconcilia un
  reset completo.
- La restauración por script puede superar `maxlength`; el flujo debe mantener el valor visible y
  bloquear con las reglas actuales en vez de recortarlo o considerarlo válido.
- Los fallbacks iniciales del preview textual deben conservarse tras un reset para evitar texto
  derivado obsoleto.

## File Impact and Authorization for IMPLEMENT

| Action | File | Exact responsibility |
|---|---|---|
| Modify | `src/lib/submissionDraft.ts` | Scope `comunicat`, envelope compartido y proyección segura de radios sin regresión de Agenda |
| Modify | `src/lib/comunicatSubmissionFlow.ts` | Allowlist, inicialización, validez restaurada, derivados, reset y limpieza tras éxito |
| Keep intact | `src/components/CommunicatSubmissionFlow.astro` | Markup, copy, campos y límites ya suficientes |
| Keep intact | `src/lib/emailVerificationController.ts` | Autoridad exclusiva de verificación; siempre arranca fresca |
| Keep intact | `src/lib/netlifySubmission.ts` | Contrato existente de aceptación/fallo |
| Keep intact | `src/lib/agendaSubmissionFlow.ts` | Consumidor existente; solo se valida su regresión |
| Keep intact | `netlify/functions/**` | Sin cambios de Function o contrato remoto |
| Keep intact | `../guiapineda-strapi/**` | Sin cambios de backend, schema o datos |

Cualquier necesidad de modificar otro archivo de aplicación es una desviación del PLAN y requiere
detener IMPLEMENT antes de actuar.

## Validation Strategy

### Obligatoria localmente

1. Inspección estática del envelope, scope, clave y allowlist exacta; demostrar que no se enumeran
   controles ni se serializa `FormData`.
2. Sondas locales sobre el helper y/o DOM existente para JSON corrupto, versión/scope erróneo,
   campos desconocidos, tipos no string, radio válido/inválido y storage que lanza en get/set/remove.
3. Matriz de recarga y navegación en la misma pestaña CA -> ES -> EN -> CA con los siete valores.
4. Confirmar primer paso, selección, campos condicionales existentes, contadores, lectura, previews
   textuales, botones y revisión; incluir valores restaurados inválidos y su corrección.
5. Confirmar exclusión de imagen/file y preview, honeypot, consentimiento, idioma oculto, código,
   token, reto y estado verificado.
6. Simular localmente resultado no aceptado y `{ ok: true }`: fallo conserva; éxito limpia. Ejecutar
   reset programático y comprobar limpieza y derivados.
7. Verificar storage inaccesible y vida natural de pestaña sin TTL ni cleanup de navegación.
8. Regresión CA/ES/EN del flujo de Comunicats y regresión del borrador de Agenda por compartir
   `submissionDraft.ts`.
9. Ejecutar `npm run build`, `git diff --check`, revisar diff completo y `git status` de frontend y
   backend; confirmar que backend y Functions siguen limpios.

No se añade un framework de tests. Las sondas auxiliares, si se necesitan, vivirán fuera del
repositorio y no formarán parte del commit.

### Diferida a predespliegue

Cuando exista un entorno GUIAPINEDA integrado, repetir con un Comunicat desechable el ciclo de fallo
y aceptación reales, incluida verificación por email, para confirmar retención y limpieza frente a
infraestructura desplegada. Queda `DEFERRED — predeployment`; no es un defecto ni trabajo funcional
pendiente de esta feature frontend.

## Regression Risks

1. Que admitir radios abra accidentalmente `checkbox`, hidden, file u otros controles.
2. Que el cambio compartido altere el envelope o la restauración ya validada de Agenda.
3. Que una clave por idioma fragmente el borrador o un cleanup de navegación lo elimine.
4. Que restaurar el email reactive token, código o estado verificado.
5. Que un radio retirado seleccione otro valor por coerción o fallback.
6. Que valores programáticos sobre límite habiliten Continue o Send.
7. Que reset deje previews, contadores, botones o pasos obsoletos.
8. Que el borrador se elimine antes de confirmarse `{ ok: true }`.
9. Que una excepción de storage interrumpa el flujo normal.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad.
