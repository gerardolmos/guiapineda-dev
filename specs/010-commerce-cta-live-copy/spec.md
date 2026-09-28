# Feature Specification: Commerce CTA — Current Availability Copy

**Feature Branch**: `main`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Actualizar exclusivamente el texto visible de la CTA de alta de comercios en CA, ES y EN para comunicar que el formulario ya está disponible, manteniendo la equivalencia semántica y preservando títulos, botones, rutas, formulario y todos los límites funcionales existentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender que el alta ya está disponible (Priority: P1)

Como persona que gestiona un comercio u ofrece un servicio en Pineda, quiero que el texto de la CTA
describa el alta como una opción disponible ahora, para no interpretar erróneamente que todavía está
en preparación.

**Why this priority**: El texto visible actual contradice la acción disponible junto a él. Corregir
esa contradicción es el único valor funcional de la feature y evita incertidumbre justo antes de
entrar en el formulario.

**Independent Test**: Abrir la portada en cada idioma y comprobar que el párrafo visible de la CTA
comunica disponibilidad presente, sin expresiones de preparación futura, mientras la acción conduce
al formulario ya existente.

**Acceptance Scenarios**:

1. **Given** una persona visita la portada catalana, **When** lee la CTA de comercios, **Then** el
   párrafo comunica de forma natural que ya puede añadir su actividad y no afirma que la
   funcionalidad se esté preparando.
2. **Given** una persona visita la portada española, **When** lee la CTA de comercios, **Then** el
   párrafo comunica de forma natural que ya puede añadir su actividad y no afirma que la
   funcionalidad se esté preparando.
3. **Given** una persona visita la portada inglesa, **When** lee la CTA de comercios, **Then** el
   párrafo comunica de forma natural que ya puede añadir su actividad y no afirma que la
   funcionalidad se esté preparando.

---

### User Story 2 - Recibir el mismo mensaje en CA, ES y EN (Priority: P1)

Como persona que navega GUIAPINEDA en cualquiera de sus tres idiomas, quiero recibir el mismo
mensaje funcional sobre la disponibilidad del alta, con una redacción natural en mi idioma, para que
la expectativa no dependa de la versión lingüística elegida.

**Why this priority**: La paridad CA/ES/EN es estructural. Una traducción que cambie el grado de
disponibilidad, añada una promesa o altere el propósito del CTA volvería a introducir una
contradicción aunque uno de los idiomas fuera correcto.

**Independent Test**: Comparar las tres versiones visibles y confirmar que todas expresan la misma
propuesta: GUIAPINEDA invita a dar de alta una actividad mediante una función que ya está
disponible, sin claims adicionales.

**Acceptance Scenarios**:

1. **Given** las versiones CA, ES y EN de la portada, **When** se comparan sus párrafos de CTA,
   **Then** los tres expresan disponibilidad presente, la misma invitación y el mismo alcance.
2. **Given** una redacción aprobada en uno de los idiomas, **When** se revisan las otras dos,
   **Then** ninguna intensifica, reduce ni transforma su significado mediante nuevas promesas,
   condiciones o beneficios.
3. **Given** que cada idioma debe sonar natural, **When** se valida la equivalencia, **Then** no se
   exige una traducción literal si una formulación idiomática conserva exactamente el significado.

---

### User Story 3 - Mantener intacto el recorrido existente (Priority: P2)

Como persona que activa la CTA, quiero conservar el mismo título, botón, destino y formulario, para
que la corrección del mensaje no altere una funcionalidad de alta que ya está disponible.

**Why this priority**: La feature corrige exclusivamente copy. Cualquier cambio en navegación,
interacción o envío ampliaría el alcance y aumentaría el riesgo sin ser necesario para resolver el
problema observable.

**Independent Test**: Verificar localmente las tres CTAs antes y después del cambio: solo varía el
párrafo autorizado; los títulos, botones y destinos permanecen iguales y cada destino sigue
abriendo el formulario correspondiente.

**Acceptance Scenarios**:

1. **Given** las CTAs existentes en CA, ES y EN, **When** se aplica la corrección, **Then** sus
   títulos y textos de botón permanecen sin cambios.
2. **Given** las rutas existentes de alta, **When** se activa cada CTA, **Then** CA continúa en
   `/alta-comerc/`, ES en `/es/alta-comercio/` y EN en
   `/en/businesses/add-a-business/`.
3. **Given** cualquiera de esos destinos, **When** se abre el formulario, **Then** su contenido,
   validaciones, pasos, envío y comportamiento son los mismos que antes de la feature.

### Edge Cases

- Si una formulación elimina el futuro pero sigue siendo ambigua sobre si el alta está disponible,
  no satisface la feature.
- Si una versión lingüística añade gratuidad, alcance, resultados, plazos, revisión, publicación u
  otra promesa no presente en las demás, falla la equivalencia semántica.
- Si una traducción literal resulta poco natural, puede adaptarse idiomáticamente, pero debe
  conservar el mismo mensaje funcional y tono equivalente.
- El texto inactivo destinado históricamente a estados de “próximamente” no debe limpiarse ni
  reutilizarse por conveniencia: no forma parte del comportamiento visible que se corrige.
- La corrección del párrafo no puede justificar cambios colaterales en títulos, botones, rutas,
  estados vacíos, formulario o flujo de envío.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La CTA visible de alta de comercios MUST dejar de describir la funcionalidad como algo
  que GUIAPINEDA está preparando.
- **FR-002**: La feature MUST utilizar exactamente la siguiente redacción final aprobada:
  - **CA**: “Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.”
  - **ES**: “Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.”
  - **EN**: “Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.”
- **FR-003**: El texto catalán MUST comunicar de manera natural que el alta está disponible ahora.
- **FR-004**: El texto español MUST comunicar de manera natural que el alta está disponible ahora.
- **FR-005**: El texto inglés MUST comunicar de manera natural que el alta está disponible ahora.
- **FR-006**: Las tres redacciones MUST ser semánticamente equivalentes aunque no sean traducciones
  literales palabra por palabra.
- **FR-007**: Ninguna redacción MUST prometer funciones, resultados, gratuidad, plazos, publicación
  o beneficios que el copy actual y el producto existente no garanticen.
- **FR-008**: Los títulos visibles de las CTAs de Commerce MUST permanecer sin cambios.
- **FR-009**: Los textos visibles de sus botones MUST permanecer sin cambios.
- **FR-010**: Los destinos MUST permanecer exactamente `/alta-comerc/` para CA,
  `/es/alta-comercio/` para ES y `/en/businesses/add-a-business/` para EN.
- **FR-011**: Las rutas existentes MUST continuar abriendo el formulario de alta activo en su idioma
  correspondiente.
- **FR-012**: El formulario Commerce, incluidos campos, pasos, validaciones, archivos, previews,
  verificación, envío, errores y confirmación, MUST permanecer funcionalmente idéntico.
- **FR-013**: La feature MUST limitar el cambio visible a los tres párrafos localizados de la CTA y
  MUST NOT rediseñar ni reestructurar ninguna superficie.
- **FR-014**: La feature MUST NOT introducir persistencia de borradores ni cambios en otros
  formularios o flujos de participación.
- **FR-015**: La feature MUST producir cero cambios de backend y cero acceso o cambios en SQLite.
- **FR-016**: La feature MUST producir cero cambios de infraestructura, dependencias, despliegue o
  configuración operativa.
- **FR-017**: Las claves o textos inactivos, incluido el estado histórico equivalente a
  `businessCtaSoon`, MUST permanecer fuera de alcance porque no son necesarios para corregir el
  comportamiento visible.
- **FR-018**: La aceptación local MUST comprobar las tres redacciones visibles, su equivalencia
  semántica, la ausencia de lenguaje de preparación futura, la conservación exacta de títulos,
  botones y destinos, y la disponibilidad de los tres formularios existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las tres portadas lingüísticas —CA, ES y EN— muestra una CTA cuyo párrafo
  comunica disponibilidad actual y contiene cero afirmaciones de que el alta todavía se está
  preparando.
- **SC-002**: Una revisión lingüística de las tres redacciones confirma equivalencia semántica en
  3 de 3 idiomas, sin nuevos claims ni diferencias funcionales entre versiones.
- **SC-003**: El 100 % de los títulos y botones auditados —tres títulos y tres botones— conserva su
  contenido anterior.
- **SC-004**: El 100 % de las tres CTAs conserva su destino canónico y permite llegar al formulario
  activo correspondiente.
- **SC-005**: La comparación funcional local detecta cero cambios en el formulario Commerce, sus
  validaciones o su flujo de envío.
- **SC-006**: La revisión final identifica exactamente tres cambios de copy de producto autorizados
  y cero cambios funcionales, de backend, datos, infraestructura o despliegue.

## Risks and Regressions

- Una redacción natural pero más promocional puede introducir claims no aprobados.
- Una traducción demasiado literal puede resultar artificial; una adaptación demasiado libre puede
  romper la equivalencia semántica.
- Un cambio accidental en títulos, botones o destinos ampliaría una feature que debe ser solo copy.
- Limpiar textos inactivos o refactorizar las superficies de CTA aumentaría la superficie de
  regresión sin aportar valor al problema observable.
- Una validación limitada a un solo idioma podría dejar dos versiones todavía contradictorias.

## Out of Scope

- Títulos y botones de las CTAs.
- Rutas, navegación y estructura de las CTAs.
- El formulario Commerce, sus validaciones, pasos, archivos, previews, verificación y envío.
- Persistencia de borradores de Commerce o de cualquier otro formulario.
- Backend, SQLite, esquemas, migraciones, datos, servicios y moderación.
- Infraestructura, dependencias, configuración operativa, build, deploy y servicios externos.
- Refactors, rediseño y cambios de estilo o layout.
- Limpieza, eliminación o reutilización de claves inactivas como `businessCtaSoon`.
- Cambios en Feature 005, Feature 009 u otros artefactos históricos.

## Clarifications

### Session 2026-09-28

- Q: ¿Qué juego completo de redacción debe quedar aprobado definitivamente para CA, ES y EN? → A:
  Opción A — CA: “Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la
  teva activitat de manera clara i senzilla.”; ES: “Forma parte de GUIAPINEDA y haz que más personas
  te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.”; EN: “Join GUIAPINEDA
  and help more people find you. You can now add your activity in a clear and simple way.”

## Assumptions

- El alta de comercios permanece activa en CA, ES y EN bajo los tres destinos canónicos existentes.
- Los títulos y botones vigentes ya expresan correctamente la acción y no necesitan ajustes.
- El problema observable está limitado al párrafo que todavía presenta la capacidad como futura.
- No se necesita ninguna modificación técnica o de flujo para que una corrección de copy sea visible.
- La validación puede realizarse completamente en local y sin datos reales, servicios externos ni
  acceso al backend.
