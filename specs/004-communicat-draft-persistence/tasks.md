---

description: "Implementation tasks for secure Communicat draft persistence"
---

# Tasks: Persistencia segura del borrador de Comunicats

**Input**: Design documents from `/specs/004-communicat-draft-persistence/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/communicat-draft-contract.md`, `quickstart.md`

**Tests**: No se añade un test runner. La aceptación exige build, inspección estática, sondas temporales locales de DOM/storage y la matriz manual CA/ES/EN definida en `quickstart.md`.

**Organization**: Las tareas se agrupan por historia de usuario. US1 y US2 forman juntas el MVP mínimo seguro porque comparten prioridad P1 y la recuperación no puede entregarse sin sus exclusiones de seguridad.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque valida superficies independientes y no modifica los mismos archivos
- **[Story]**: Historia de usuario cubierta (`US1`, `US2`, `US3`)
- Todas las tareas identifican rutas exactas

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el límite autorizado antes de modificar la aplicación.

- [X] T001 Registrar el baseline de Git y confirmar que la implementación queda limitada a `src/lib/submissionDraft.ts` y `src/lib/comunicatSubmissionFlow.ts`, manteniendo intactos `src/components/CommunicatSubmissionFlow.astro`, `src/lib/emailVerificationController.ts`, `src/lib/netlifySubmission.ts`, `netlify/functions/**` y `../guiapineda-strapi/**`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ampliar el adaptador compartido sin abrir la frontera de persistencia ni romper Agenda.

**⚠️ CRITICAL**: Ninguna historia puede integrarse hasta completar esta fase.

- [X] T002 Generalizar el envelope de borrador para los scopes literales `"agenda" | "comunicat"`, conservando `{ version: 1, scope, fields }`, la clave `guiapineda:submission-draft:v1:${scope}` y estas restricciones de `specs/004-communicat-draft-persistence/data-model.md`: “Otro valor hace incompatible el envelope”, “Impide aceptar el borrador de otro formulario” y “Objeto no array; solo se consumen strings allowlisted”, en `src/lib/submissionDraft.ts`
- [X] T003 Añadir resolución estricta de grupos `RadioNodeList` allowlisted: aceptar solo radios con el mismo `name`, serializar el valor exacto seleccionado o `""`, restaurar únicamente por coincidencia exacta vigente y no admitir fallback, coerción, checkbox, hidden, file, password ni otros controles en `src/lib/submissionDraft.ts`
- [X] T004 Mantener la proyección exclusiva por allowlist, ignorar campos ausentes, claves desconocidas y valores no string, descartar best-effort raíz no objeto, arrays, versión/scope incompatibles o `fields` no objeto, y contener fallos de get/set/remove/JSON sin emitir eventos sintéticos en `src/lib/submissionDraft.ts`

**Checkpoint**: El helper admite Comunicats y sigue conservando el contrato existente de Agenda.

---

## Phase 3: User Story 1 - Recuperar el contenido del Comunicat (Priority: P1) 🎯 MVP

**Goal**: Recuperar en el primer paso el último valor de los siete campos autorizados, compartido por CA, ES y EN, con todo el estado derivado coherente.

**Independent Test**: Introducir los siete valores en `/envia-un-comunicat/`, recargar y recorrer en la misma pestaña `/es/enviar-comunicado/`, `/en/comunicats/send-an-announcement/` y de nuevo CA; los valores más recientes reaparecen, el formulario abre en el primer paso y los derivados coinciden con una entrada manual.

### Implementation for User Story 1

- [X] T005 [US1] Importar `initSubmissionDraft`, declarar exactamente la allowlist `tipus_remitent`, `autor`, `titol`, `resum`, `contingut`, `nombre_contacto`, `email_contacto` e inicializar scope `comunicat` antes de `initEmailVerificationController`; aplicar literalmente “Coincidencia exacta con radio vigente; `""` deja el grupo vacío” al remitente y “String literal; reglas actuales se recalculan” a los seis textos en `src/lib/comunicatSubmissionFlow.ts`
- [X] T006 [US1] Recalcular las reglas actuales de required, formato, `minlength` y `maxlength` para los seis textos sin truncar valores restaurados; conservar visibles los inválidos, aplicar mensajes localizados CA/ES/EN y hacer que Continue/Send usen la validez vigente en `src/lib/comunicatSubmissionFlow.ts`
- [X] T007 [US1] Implementar una reconciliación silenciosa que muestre siempre `author`, oculte `content` y `review`, y actualice selección de remitente, contadores, metas de longitud, lectura, previews textuales, revisión y botones sin foco, popup ni eventos sintéticos en `src/lib/comunicatSubmissionFlow.ts`
- [X] T008 [US1] Ejecutar los escenarios 1 y 2 de recarga, CA -> ES -> EN -> CA, edición posterior, radio retirado y valores bajo mínimos/sobre máximos contra `specs/004-communicat-draft-persistence/quickstart.md`, verificando `src/lib/submissionDraft.ts` y `src/lib/comunicatSubmissionFlow.ts`

**Checkpoint**: US1 recupera el contenido y reconstruye un formulario utilizable e independientemente verificable.

---

## Phase 4: User Story 2 - Separar borrador y seguridad (Priority: P1) 🎯 MVP seguro

**Goal**: Garantizar que restaurar texto nunca restaure archivos, consentimiento, metadata ni autorización de email.

**Independent Test**: Seleccionar imagen, aceptar privacidad e iniciar/completar verificación antes de recargar o cambiar de idioma; solo reaparecen los siete strings allowlisted y el envío vuelve a exigir imagen cuando corresponda, consentimiento y verificación fresca.

### Implementation for User Story 2

- [X] T009 [US2] Completar la reconciliación inicial para vaciar input y previews de imagen, revocar la URL efímera, desmarcar privacidad, ocultar errores y conservar honeypot/hidden fuera del borrador, dejando que `initEmailVerificationController` cree código, reto, token, temporizador y `data-email-verified` desde cero en `src/lib/comunicatSubmissionFlow.ts`
- [X] T010 [US2] Ejecutar los escenarios 3A, 3B y 4 de `specs/004-communicat-draft-persistence/quickstart.md` con el fixture local `window.__communicatQa` y gates que lanzan ante cualquier incumplimiento: demostrar por separado un challenge iniciado y una verificación completada con código/token/temporizador sintéticos, inspeccionar que el envelope de `src/lib/submissionDraft.ts` contiene exactamente los siete strings, navegar o recargar y comprobar objetivamente que challenge, código, token, temporizador, `data-email-verified`, imagen/file, `bot-field`, `aceptacion_privacidad`, `idioma_solicitud`, secretos y claves desconocidas no se restauran; registrar PASS solo si ninguna aserción lanzó

**Checkpoint**: US1 + US2 constituyen el MVP mínimo seguro y mantienen la autoridad exclusiva del flujo de verificación.

---

## Phase 5: User Story 3 - Completar o recuperar sin bloqueo (Priority: P2)

**Goal**: Limpiar únicamente tras aceptación confirmada o reset y degradar cualquier fallo de envío/storage sin bloquear el formulario.

**Independent Test**: Probar por separado `{ ok: true }`, respuesta no aceptada/excepción, reset programático, storage corrupto/incompatible/no disponible y continuidad durante la sesión de pestaña; solo éxito y reset eliminan el borrador.

### Implementation for User Story 3

- [X] T011 [US3] Conservar la función `clearDraft` y llamarla únicamente después de que `submitVerifiedSubmissionForm` resuelva la aceptación explícita, manteniendo el borrador en excepciones, errores HTTP, respuestas no confirmadas o falta de red en `src/lib/comunicatSubmissionFlow.ts`
- [X] T012 [US3] Reconciliar en una microtarea posterior al evento nativo `reset` no cancelado: volver al primer paso, limpiar imagen, privacidad, errores y derivados obsoletos, restaurar fallbacks textuales iniciales y mantener el listener `beforeunload` limitado a revocar la URL de imagen en `src/lib/comunicatSubmissionFlow.ts`
- [X] T013 [US3] Ejecutar los escenarios 5, 6 y 7 de `specs/004-communicat-draft-persistence/quickstart.md`: usar el probe aislado con `Storage.prototype`, contadores de invocación y captura global de errores para obtener PASS estricto en fallos de `getItem`, `setItem` y `removeItem`; demostrar que el listener real intenta `setItem`, contiene el `SecurityError` y mantiene el campo editable sin evento `error`; usar `window.__communicatQa.submission = "failure"` para comprobar error visible y borrador conservado, cambiarlo a `"success"` para comprobar navegación y borrador eliminado; confirmar además reset, formulario operativo, ausencia de TTL y ausencia de cleanup del borrador en navegación en `src/lib/submissionDraft.ts` y `src/lib/comunicatSubmissionFlow.ts`

**Checkpoint**: Las tres historias completan el ciclo de vida sin convertir storage o infraestructura en dependencias funcionales.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validar regresiones, límites de repositorio y gates constitucionales antes del cierre.

- [X] T014 [P] Ejecutar el escenario 8 de regresión de Agenda, cubriendo restauración, exclusiones, reset y envelope corrupto bajo scope/key `agenda`, según `specs/004-communicat-draft-persistence/quickstart.md` y sin modificar `src/lib/agendaSubmissionFlow.ts`
- [X] T015 [P] Recorrer el flujo completo de Comunicats en CA, ES y EN para confirmar navegación multipaso, validaciones, previews, revisión, verificación, imagen y mensajes sin regresiones, usando `specs/004-communicat-draft-persistence/quickstart.md` y `src/lib/comunicatSubmissionFlow.ts`
- [X] T016 Ejecutar `npm run build`, `git diff --check`, revisar el diff completo y `git status` en `guiapineda-astro` y `../guiapineda-strapi`, confirmar cero cambios en `netlify/functions/**` y backend, y conservar la entrega real de email/infraestructura como `DEFERRED — predeployment` en `specs/004-communicat-draft-persistence/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias.
- **Foundational (Phase 2)**: Depende de T001 y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de T002-T004.
- **US2 (Phase 4)**: Depende de la inicialización y reconciliación de US1; debe completarse antes de considerar entregable el MVP.
- **US3 (Phase 5)**: Depende de que el borrador esté integrado y su frontera de seguridad esté cerrada.
- **Polish (Phase 6)**: Depende de T001-T013; T014 y T015 pueden ejecutarse en paralelo y T016 cierra la validación.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 (P1) -> US2 (P1, security gate) -> US3 (P2) -> Polish
                                      \______________________/             |
                                          MVP seguro                  final gate
```

### Within Each User Story

- Implementar antes de ejecutar sus escenarios de aceptación.
- Restaurar antes de iniciar verificación y reconciliar después.
- Validar con las reglas actuales, nunca con validez persistida.
- No avanzar de checkpoint si aparece la necesidad de tocar un archivo de aplicación no autorizado por `plan.md`.

### Parallel Opportunities

- El código de US1-US3 comparte `src/lib/comunicatSubmissionFlow.ts` y debe ejecutarse secuencialmente.
- Tras completar las historias, T014 (regresión Agenda) y T015 (regresión Comunicats CA/ES/EN) pueden ejecutarse en paralelo porque son validaciones de superficies independientes y no escriben archivos.

---

## Parallel Example: Final Regression

```text
Task T014: Validar Agenda con specs/004-communicat-draft-persistence/quickstart.md
Task T015: Validar Comunicats CA/ES/EN con specs/004-communicat-draft-persistence/quickstart.md
```

---

## Implementation Strategy

### MVP seguro (US1 + US2)

1. Completar Phase 1: Setup.
2. Completar Phase 2: Foundational.
3. Completar Phase 3: US1.
4. Completar Phase 4: US2, gate de seguridad inseparable.
5. **STOP AND VALIDATE**: ejecutar T008 y T010 antes de considerar demostrable el MVP.

### Incremental Delivery

1. Setup + Foundation -> adaptador compartido listo.
2. US1 + US2 -> recuperación útil y segura en CA/ES/EN.
3. US3 -> ciclo de vida completo ante éxito, fallo y reset.
4. Polish -> regresión Agenda/Comunicats, build, diff y límites de repositorio.

### Scope Guardrails

- No añadir dependencias, test runner, endpoints, persistencia remota, TTL, controles visibles ni navegación lingüística nueva.
- No modificar markup, backend, Functions, Strapi, infraestructura ni contrato de envío.
- Si una tarea exige salir de `src/lib/submissionDraft.ts` o `src/lib/comunicatSubmissionFlow.ts`, detener IMPLEMENT y revisar el PLAN.
- No incluir sondas temporales en el commit; usarlas fuera del repositorio cuando sean necesarias para la validación local.

## Notes

- `[P]` identifica únicamente validaciones realmente paralelizables.
- Cada tarea de historia lleva su etiqueta para trazabilidad.
- Los escenarios de infraestructura real siguen `DEFERRED — predeployment` y no bloquean el cierre local.
- Commit tras cada grupo lógico y nunca mezclar refactors oportunistas.
