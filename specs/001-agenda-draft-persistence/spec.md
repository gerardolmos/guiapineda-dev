# Feature Specification: Persistencia de borradores multidioma de Agenda

**Feature Branch**: `none (specification only)`

**Created**: 2026-09-19

**Status**: Draft — clarified

**Input**: User description: "Conservar y restaurar de forma segura los campos permitidos del
formulario de Agenda al cambiar entre CA, ES y EN, sin reutilizar datos o estados sensibles."

## Clarifications

### Session 2026-09-19

- Q: ¿Deben conservarse el nombre y el email de contacto? → A: Sí, ambos se conservan temporalmente
  en el borrador del navegador, sin conservar ni reutilizar la verificación del email.
- Q: ¿Cuál es la vida del borrador y cómo se elimina? → A: Dura durante la sesión natural de la
  pestaña; se elimina tras un envío correcto, al resetear el formulario o al finalizar esa sesión,
  sin caducidad artificial ni un botón nuevo para descartarlo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Continuar el borrador al cambiar de idioma (Priority: P1)

Como persona que propone una actividad, quiero cambiar el formulario de Agenda entre catalán,
castellano e inglés sin perder el contenido que ya he introducido, para poder elegir el idioma de
la interfaz sin repetir el trabajo.

**Why this priority**: Es el valor principal de la feature y el propósito del piloto.

**Independent Test**: Se puede probar rellenando todos los campos permitidos en CA, recorriendo
CA -> ES -> EN -> CA y comprobando que en cada formulario aparecen los mismos valores permitidos.

**Acceptance Scenarios**:

1. **Given** una persona ha rellenado en CA título, resumen, descripción, organizador, fechas,
   horas, lugar, dirección y enlace oficial, **When** cambia a ES, **Then** todos esos valores están
   disponibles en el formulario de Agenda en ES sin una acción adicional.
2. **Given** los valores permitidos se han recuperado en ES, **When** la persona cambia a EN y
   después vuelve a CA, **Then** los mismos valores siguen disponibles en cada idioma.
3. **Given** se restaura un borrador válido, **When** la persona revisa y edita el formulario,
   **Then** los contadores, estados visuales y reglas de validación reflejan los valores restaurados
   igual que si se hubieran introducido manualmente.

---

### User Story 2 - Mantener separados el borrador y la seguridad (Priority: P1)

Como persona que propone una actividad, quiero que el borrador conserve únicamente contenido
permitido y no estados sensibles, para que cambiar de idioma no debilite la privacidad ni la
verificación de la solicitud.

**Why this priority**: La persistencia no es aceptable si permite reutilizar verificación, secretos
o información excluida.

**Independent Test**: Se puede probar seleccionando una imagen, completando los controles de
contacto y seguridad disponibles, cambiando de idioma y verificando que solo reaparecen los campos
expresamente permitidos y que el email debe verificarse de nuevo cuando corresponda.

**Acceptance Scenarios**:

1. **Given** una persona ha seleccionado una imagen, **When** cambia de idioma, **Then** el campo de
   imagen está vacío y la imagen no se restaura ni se representa como seleccionada.
2. **Given** una persona ha completado una verificación de email, **When** cambia de idioma,
   **Then** el nuevo formulario no considera el email verificado y exige una nueva verificación
   cuando corresponda.
3. **Given** existen valores o estados de honeypot, consentimiento de privacidad, tokens, secretos
   o autenticación interna, **When** se conserva o restaura el borrador, **Then** ninguno de ellos
   forma parte del borrador ni reaparece por efecto de esta feature.
4. **Given** se restaura contenido permitido, **When** la persona continúa al envío, **Then** siguen
   aplicándose sin degradación las validaciones, la verificación, la revisión y las protecciones de
   seguridad existentes.
5. **Given** una persona ha introducido su nombre y email de contacto, **When** cambia de idioma,
   **Then** ambos valores se restauran, pero el email no aparece como verificado.

---

### User Story 3 - Finalizar o recuperar con seguridad (Priority: P2)

Como persona que propone una actividad, quiero que el borrador desaparezca tras un envío correcto y
que un borrador dañado no bloquee el formulario, para no recuperar información obsoleta ni perder la
posibilidad de enviar una actividad.

**Why this priority**: Completa el ciclo de vida mínimo del borrador y evita que la mejora se
convierta en una dependencia del formulario.

**Independent Test**: Se puede probar con un borrador válido seguido de un envío correcto y, por
separado, con borradores corruptos o incompatibles, comprobando la limpieza y la continuidad del
formulario.

**Acceptance Scenarios**:

1. **Given** existe un borrador de Agenda, **When** la solicitud se envía correctamente, **Then** el
   borrador se elimina y no se restaura al abrir de nuevo el formulario.
2. **Given** un intento de envío falla, **When** la persona vuelve al formulario, **Then** los campos
   permitidos continúan disponibles y puede corregirlos o volver a intentar el envío.
3. **Given** el borrador está corrupto, tiene una forma no reconocida o es incompatible con el
   formulario actual, **When** se abre Agenda, **Then** el formulario sigue siendo utilizable, no
   restaura valores no fiables y no muestra un error técnico que impida continuar.
4. **Given** existe un borrador en la pestaña actual, **When** la persona recarga o cambia de idioma
   sin finalizar la sesión de esa pestaña, **Then** los valores permitidos siguen disponibles.
5. **Given** existe un borrador, **When** la persona resetea el formulario o finaliza la sesión de la
   pestaña, **Then** el borrador deja de estar disponible.
6. **Given** una persona mantiene abierta la sesión de la pestaña, **When** transcurre tiempo sin
   enviar ni resetear, **Then** el borrador no caduca por un límite artificial y no aparece un botón
   nuevo para descartarlo.

### Edge Cases

- El borrador contiene solo una parte de los campos permitidos: se restauran únicamente los valores
  válidos presentes y el resto conserva el estado inicial normal del formulario.
- El borrador contiene campos que Agenda ya no reconoce: se ignoran sin trasladarlos a otros campos.
- Un valor restaurado ya no cumple las reglas actuales: se muestra y valida conforme a las reglas
  actuales, sin marcarlo como válido por haber sido restaurado.
- Fechas u horas restauradas entran en conflicto entre sí o han quedado en el pasado: se aplican las
  mismas reglas y mensajes que a valores introducidos manualmente.
- La conservación o lectura del borrador no está disponible: Agenda sigue siendo rellenable,
  validable y enviable, aunque no pueda conservar los valores al cambiar de idioma.
- La persona cambia varias veces de idioma y edita valores entre cambios: se recupera la versión más
  reciente de cada campo permitido.
- Hay una imagen seleccionada antes del cambio: el resto del borrador se recupera, pero la imagen
  debe seleccionarse de nuevo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La feature MUST aplicarse únicamente al formulario de Agenda como piloto.
- **FR-002**: El sistema MUST conservar y restaurar entre las variantes CA, ES y EN de Agenda los
  valores más recientes de título, resumen, descripción, organizador, fecha de inicio, hora de
  inicio, fecha final, hora final, lugar, dirección y enlace oficial.
- **FR-003**: El sistema MUST conservar el mismo borrador permitido durante la secuencia
  CA -> ES -> EN -> CA y durante cualquier otro orden de cambio entre esos tres idiomas.
- **FR-004**: Los valores restaurados MUST participar inmediatamente en los estados visuales,
  contadores, revisión y validaciones actuales igual que los valores introducidos manualmente.
- **FR-005**: La imagen y cualquier campo de archivo MUST NOT formar parte del borrador ni
  restaurarse; la persona MUST volver a seleccionar el archivo cuando lo necesite.
- **FR-006**: El borrador MUST NOT conservar secretos, tokens, estado interno de verificación de
  email, credenciales internas, variables de entorno, HMAC, bearer internos ni información
  equivalente de autenticación o autorización.
- **FR-007**: El honeypot MUST NOT formar parte del borrador ni restaurarse.
- **FR-008**: El consentimiento de privacidad MUST NOT formar parte del borrador ni aparecer
  aceptado tras restaurarlo.
- **FR-009**: La restauración MUST NOT convertir una verificación de email previa en reutilizable;
  la persona MUST volver a verificar el email cuando el flujo vigente lo requiera.
- **FR-010**: El nombre de contacto y el email de contacto MUST conservarse temporalmente en el
  borrador del navegador y restaurarse entre CA, ES y EN. Estos datos MUST NOT persistirse por esta
  feature en backend, Strapi, SQLite, Redis ni ningún servicio, y su restauración MUST NOT conservar
  ni reutilizar el estado de verificación del email.
- **FR-011**: El sistema MUST eliminar el borrador después de que el envío se confirme como
  correcto; un intento fallido MUST NOT provocar su pérdida.
- **FR-012**: Un borrador corrupto, no reconocido o incompatible MUST ser ignorado o descartado sin
  impedir que la persona rellene, valide o envíe Agenda.
- **FR-013**: La ausencia o indisponibilidad del mecanismo de conservación MUST NOT impedir el uso,
  validación o envío normal del formulario.
- **FR-014**: La feature MUST preservar el comportamiento vigente de validación, revisión, envío,
  verificación de email y seguridad de Agenda.
- **FR-015**: La feature MUST ofrecer comportamiento funcional equivalente en CA, ES y EN para todas
  las superficies de Agenda afectadas.
- **FR-016**: La feature MUST NOT modificar ni requerir cambios funcionales en backend, Strapi,
  Functions o seguridad del servidor. Si se descubre una necesidad real en alguna de esas capas,
  MUST registrarse como conflicto de alcance para decisión humana antes de continuar.
- **FR-017**: La feature MUST NOT introducir un servicio externo nuevo ni depender de él.
- **FR-018**: La feature MUST NOT extender la persistencia a Comunicats, Veus, Millorem, Foto del mes
  ni ningún otro formulario.
- **FR-019**: El borrador MUST usar la duración natural de la sesión de la pestaña proporcionada por
  `sessionStorage`: MUST sobrevivir a cambios de idioma y recargas dentro de esa sesión y MUST dejar
  de estar disponible cuando la sesión finalice.
- **FR-020**: El sistema MUST eliminar el borrador al resetear el formulario, además de hacerlo tras
  un envío correcto conforme a FR-011.
- **FR-021**: El borrador MUST NOT tener una caducidad artificial por minutos u horas y la feature
  MUST NOT añadir un botón nuevo para descartarlo.

### Scope and Repository Boundaries

- **In scope**: La experiencia de la persona usuaria en las páginas CA, ES y EN del formulario de
  Agenda y el ciclo funcional del borrador permitido.
- **Primary repository**: `guiapineda-astro`.
- **Unaffected repository**: `guiapineda-strapi`, salvo conflicto funcional explícito que requiera
  decisión humana y revisión del alcance.
- **Out of scope**: Cambios de backend, Strapi, Functions, seguridad del servidor, otros formularios,
  servicios nuevos y cualquier rediseño general del flujo de participación.

### Key Entities *(include if feature involves data)*

- **Borrador de Agenda**: Conjunto temporal de valores permitidos y asociados al formulario de
  Agenda. Incluye los campos de contenido enumerados en FR-002, el nombre de contacto y el email de
  contacto; excluye todos los datos y estados enumerados en FR-005 a FR-009. Existe durante la
  sesión natural de la pestaña y se elimina tras un envío correcto, un reset del formulario o el fin
  de esa sesión.
- **Sesión de cumplimentación**: Recorrido de una persona por las variantes CA, ES y EN mientras
  prepara una única propuesta de Agenda. La verificación de email y el consentimiento no forman
  parte reutilizable de este recorrido.
- **Solicitud de Agenda**: Propuesta que se valida y envía mediante el flujo existente. Solo un
  envío confirmado como correcto finaliza y elimina el borrador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba CA -> ES -> EN -> CA, el 100 % de los campos permitidos conserva en cada
  paso el valor más reciente introducido por la persona.
- **SC-002**: En la misma prueba, el 0 % de imágenes, archivos, honeypots, consentimientos, tokens o
  estados de verificación se restaura o se considera reutilizable.
- **SC-003**: El 100 % de los valores restaurados se somete a las reglas y estados visuales actuales,
  sin omitir errores que sí aparecerían al introducir esos mismos valores manualmente.
- **SC-004**: En el 100 % de los envíos confirmados como correctos y resets probados, el borrador
  desaparece y no reaparece al volver a Agenda dentro de esa sesión.
- **SC-005**: En el 100 % de las pruebas con borradores corruptos o incompatibles previstas, el
  formulario permanece disponible para completar y enviar una nueva propuesta.
- **SC-006**: Los recorridos funcionales equivalentes en CA, ES y EN permiten completar, revisar y
  enviar Agenda sin regresiones respecto al comportamiento previo a la feature.
- **SC-007**: Una persona puede completar el recorrido principal sin recibir mensajes técnicos ni
  realizar una acción adicional para recuperar los campos permitidos al cambiar de idioma.
- **SC-008**: En el 100 % de las pruebas dentro de una misma sesión de pestaña, los campos permitidos
  sobreviven a cambios de idioma y recargas sin caducar por tiempo; al finalizar esa sesión, el
  borrador deja de estar disponible.

## Assumptions

- Los valores de contenido se comparten como un único borrador entre CA, ES y EN; la feature no crea
  tres traducciones independientes de una misma propuesta.
- Una persona prepara una única propuesta de Agenda a la vez dentro del alcance del piloto.
- El inventario actual de campos simples de contenido es: título, resumen, descripción, organizador,
  fechas, horas, lugar, dirección y enlace oficial. Si el formulario incorpora otro campo simple
  antes de implementar la feature, su inclusión debe evaluarse con los mismos criterios de utilidad,
  privacidad y seguridad, no asumirse automáticamente.
- La indisponibilidad del borrador degrada únicamente la comodidad al cambiar de idioma, nunca el
  funcionamiento esencial del formulario.
- El trabajo incompleto preservado en `src/lib/agendaSubmissionFlow.ts` y
  `src/lib/submissionDraft.ts` es evidencia de implementación existente para evaluar durante PLAN o
  IMPLEMENT; no constituye una decisión aprobada ni una fuente normativa de esta SPEC.
