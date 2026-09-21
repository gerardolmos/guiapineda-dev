# Feature Specification: Persistencia segura del borrador de Comunicats

**Feature Branch**: `none (specification only; Git remains on main)`

**Created**: 2026-09-20

**Status**: SPECIFY, CLARIFY, PLAN and TASKS complete — pending successful ANALYZE before IMPLEMENT

**Input**: User description: "Conservar temporalmente y restaurar de forma segura el borrador del
formulario multipaso de Comunicats en CA, ES y EN, sin persistir archivos, consentimiento ni datos o
estados de verificación."

## Clarifications

### Session 2026-09-20

- **Q: ¿En qué paso debe reaparecer el formulario después de restaurar el borrador?** → **A:** El
  formulario vuelve siempre al primer paso. No se persiste ni restaura un índice de paso; después de
  recuperar los campos autorizados se reconcilian validaciones, campos condicionales, contadores,
  previews textuales y el resto del estado derivado necesario. No se restaura ningún estado de
  verificación, consentimiento o archivo.
- **Q: ¿Debe esta feature añadir controles visibles para cambiar entre CA, ES y EN?** → **A:** No.
  La feature solo garantiza que el mismo borrador se comparte correctamente entre las rutas
  lingüísticas ya existentes. Cualquier control o rediseño nuevo de navegación lingüística queda
  fuera de alcance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar el contenido del Comunicat (Priority: P1)

Como persona que prepara un Comunicat, quiero recuperar el contenido permitido después de recargar
la página o pasar a otra variante lingüística del mismo formulario, para no repetir un trabajo largo.

**Why this priority**: Evitar la pérdida del borrador es el valor principal de la feature y afecta a
un flujo público existente, multipaso y plenamente operativo en CA, ES y EN.

**Independent Test**: Completar los siete valores permitidos en una variante lingüística, recargar y
recorrer las rutas canónicas CA, ES y EN dentro de la misma pestaña; todos los valores deben reaparecer
sin intervención adicional.

**Acceptance Scenarios**:

1. **Given** una persona ha introducido tipo de remitente, autor, título, resumen y contenido,
   **When** recarga el formulario en la misma pestaña, **Then** recupera esos valores.
2. **Given** una persona ha añadido también nombre y email de contacto, **When** abre otra variante
   lingüística del formulario en la misma pestaña, **Then** recupera los siete valores permitidos.
3. **Given** se restaura un borrador permitido, **When** la persona continúa por el formulario,
   **Then** el formulario aparece en el primer paso y selección, campos condicionales, contadores,
   previews textuales, botones, revisión y validaciones reflejan los valores restaurados como si se
   hubieran introducido manualmente.
4. **Given** la persona edita un valor recuperado, **When** vuelve a recargar o cambia de variante
   lingüística, **Then** aparece la versión más reciente del valor.

---

### User Story 2 - Separar borrador y seguridad (Priority: P1)

Como persona que envía un Comunicat, quiero que solo se conserve el contenido expresamente
autorizado, para que recuperar el borrador no reutilice archivos, consentimiento o autorizaciones.

**Why this priority**: La comodidad no puede debilitar las garantías de privacidad, verificación,
moderación o tratamiento seguro de imágenes del flujo existente.

**Independent Test**: Seleccionar una imagen, aceptar privacidad y completar la verificación de
email antes de recargar o cambiar de idioma; solo deben reaparecer los siete valores permitidos y el
flujo debe exigir de nuevo imagen, consentimiento y verificación cuando correspondan.

**Acceptance Scenarios**:

1. **Given** existe una imagen seleccionada, **When** se restaura el borrador, **Then** el input de
   archivo y todas sus previews aparecen vacíos.
2. **Given** se había aceptado el consentimiento, **When** se restaura el borrador, **Then** el
   consentimiento aparece desmarcado.
3. **Given** se había solicitado o completado una verificación de email, **When** se restaura el
   borrador, **Then** no reaparecen código, token, reto, temporizador ni estado verificado.
4. **Given** un borrador contiene honeypot, metadatos ocultos, secretos o campos desconocidos,
   **When** se procesa, **Then** esos valores no se restauran ni se trasladan a campos permitidos.
5. **Given** se restauran nombre y email de contacto, **When** la persona llega a revisión, **Then**
   el email sigue necesitando verificación y el consentimiento sigue siendo obligatorio.

---

### User Story 3 - Completar o recuperar sin bloqueo (Priority: P2)

Como persona que prepara un Comunicat, quiero conservar el borrador después de un fallo y eliminarlo
solo cuando ya no sea necesario, para poder reintentar sin recuperar datos obsoletos.

**Why this priority**: Completa el ciclo de vida del borrador y evita convertir su almacenamiento en
una dependencia del envío existente.

**Independent Test**: Probar por separado un envío confirmado, un envío fallido, un reset y varios
borradores corruptos o incompatibles; el formulario debe conservar o eliminar únicamente cuando
corresponda y permanecer siempre utilizable.

**Acceptance Scenarios**:

1. **Given** existe un borrador, **When** el envío termina con confirmación de aceptación, **Then**
   el borrador se elimina y no reaparece al volver al formulario.
2. **Given** existe un borrador, **When** el envío falla o no obtiene confirmación, **Then** los siete
   valores permitidos permanecen disponibles para corregir o reintentar.
3. **Given** existe un borrador, **When** se produce un reset explícito del formulario, **Then** el
   borrador se elimina.
4. **Given** el borrador está corrupto, tiene una versión incompatible o una forma no reconocida,
   **When** se abre el formulario, **Then** el borrador se descarta o ignora y el formulario continúa
   rellenable, validable y enviable.
5. **Given** el almacenamiento temporal no está disponible o falla, **When** la persona usa el
   formulario, **Then** puede completar, revisar y enviar el Comunicat con el comportamiento previo.
6. **Given** la pestaña continúa en la misma sesión, **When** transcurre tiempo sin envío ni reset,
   **Then** el borrador no caduca por un límite artificial; al finalizar naturalmente la sesión de
   la pestaña deja de estar disponible.

### Edge Cases

- Un borrador contiene solo algunos campos permitidos: se restauran únicamente esos valores y los
  demás mantienen su estado inicial.
- El tipo de remitente guardado ya no pertenece al conjunto vigente: se ignora sin seleccionar otra
  opción ni bloquear el formulario.
- Un texto restaurado ya no cumple los límites o mínimos actuales: permanece visible y se somete a
  las reglas y mensajes vigentes, sin considerarse válido por proceder del borrador.
- El borrador contiene tipos no textuales, claves antiguas o campos añadidos en el futuro: se ignoran
  salvo que una especificación posterior los incorpore expresamente a la allowlist.
- La persona cambia varias veces entre CA, ES y EN y modifica valores entre cambios: se recupera el
  valor más reciente de cada campo permitido como un único Comunicat, no tres traducciones.
- Se restaura un email distinto del que se verificó antes de la navegación: no existe autorización
  reutilizable y debe realizarse una verificación nueva.
- Se había seleccionado o eliminado una imagen antes de recargar: ningún dato ni preview de archivo
  se reconstruye desde el borrador.
- La aceptación del backend se produce después de una espera: el borrador no se elimina hasta que la
  aceptación queda confirmada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La feature MUST aplicarse exclusivamente al formulario público de envío de Comunicats
  y MUST ofrecer comportamiento equivalente en CA, ES y EN.
- **FR-002**: El borrador MUST utilizar una allowlist cerrada formada exactamente por
  `tipus_remitent`, `autor`, `titol`, `resum`, `contingut`, `nombre_contacto` y `email_contacto`.
- **FR-003**: El sistema MUST conservar y restaurar el valor válido del tipo de remitente como una
  única selección entre las opciones vigentes, sin inferir ni seleccionar automáticamente otra.
- **FR-004**: El autor, título, resumen, contenido, nombre de contacto y email de contacto MUST
  conservarse como valores textuales y restaurarse sin reinterpretar su contenido.
- **FR-005**: CA, ES y EN MUST compartir un único borrador de Comunicat dentro de la sesión de la
  pestaña; navegar directamente entre sus rutas canónicas existentes MUST conservar los valores
  permitidos. La feature MUST NOT añadir controles visibles ni rediseñar la navegación lingüística.
- **FR-006**: Tras restaurar, el formulario MUST volver al primer paso y MUST NOT persistir ni
  restaurar un índice de paso. La restauración MUST recalcular inmediatamente los estados derivados
  existentes, incluidos selección visible del remitente, campos condicionales, contadores, previews
  textuales, lectura estimada, botones de avance, revisión y validaciones.
- **FR-007**: Un valor restaurado MUST someterse a las reglas vigentes y MUST permanecer visible si
  es inválido, para que la persona pueda corregirlo; la restauración no puede convertirlo en válido.
- **FR-008**: La imagen, el input de archivo, su nombre, contenido, referencia temporal y previews
  MUST quedar excluidos del borrador y MUST NOT restaurarse.
- **FR-009**: El honeypot MUST quedar excluido del borrador y MUST aparecer vacío tras restaurar.
- **FR-010**: El consentimiento de privacidad MUST quedar excluido del borrador y MUST aparecer
  desmarcado tras restaurar.
- **FR-011**: El código de verificación, token de un solo uso, reto, temporizador, estado verificado y
  cualquier autorización temporal MUST quedar excluidos y MUST NOT reutilizarse.
- **FR-012**: El borrador MUST NOT contener secretos, credenciales, bearer, HMAC, variables de
  entorno, datos internos del servidor ni cualquier campo no incluido expresamente en FR-002.
- **FR-013**: El idioma oculto de la solicitud y cualquier otro metadato derivado de la ruta MUST NOT
  persistirse; cada variante MUST obtener esos valores de su propio contexto actual.
- **FR-014**: El nombre y el email de contacto restaurados MUST seguir siendo privados y temporales;
  esta feature MUST NOT enviarlos ni almacenarlos en backend por el mero hecho de crear el borrador.
- **FR-015**: Restaurar el email MUST NOT restaurar su verificación; el envío MUST permanecer
  bloqueado hasta completar de nuevo las garantías vigentes.
- **FR-016**: El borrador MUST eliminarse únicamente después de un envío confirmado como aceptado,
  tras un reset explícito del formulario o al finalizar naturalmente la sesión de la pestaña.
- **FR-017**: Un intento fallido, una respuesta no confirmada o un error de red MUST NOT eliminar el
  borrador.
- **FR-018**: El borrador MUST durar durante la sesión natural de la pestaña y MUST NOT incorporar
  una caducidad artificial por minutos u horas.
- **FR-019**: La feature MUST NOT añadir un control nuevo para descartar el borrador; un reset ya
  existente o programático conserva su semántica normal y elimina el borrador.
- **FR-020**: Un borrador corrupto, incompatible o no reconocido MUST ser ignorado o descartado sin
  restauración parcial insegura y sin impedir el uso del formulario.
- **FR-021**: Los campos permitidos ausentes MUST mantener su valor inicial y las claves o valores no
  autorizados MUST ignorarse sin coerción hacia campos permitidos.
- **FR-022**: La indisponibilidad, bloqueo o fallo del almacenamiento temporal MUST degradar solo la
  comodidad de recuperación y MUST NOT impedir rellenar, validar, revisar o enviar el formulario.
- **FR-023**: La feature MUST preservar el comportamiento vigente de validación, navegación por
  pasos, previews, envío, verificación de email, moderación privada y tratamiento de imágenes.
- **FR-024**: La feature MUST NOT modificar backend, Functions, Strapi, infraestructura, servicios
  externos ni dependencias; cualquier necesidad real en esas capas requiere detenerse y revisar el
  alcance antes de continuar.
- **FR-025**: La feature MUST permitir validación local objetiva de la allowlist, exclusiones, ciclo
  de vida, tolerancia a fallos, estado derivado y paridad CA/ES/EN.
- **FR-026**: La aceptación que dependa de entrega real de email o infraestructura desplegada MUST
  permanecer `DEFERRED — predeployment` mientras no exista un entorno GUIAPINEDA integrado, y MUST
  NOT tratarse como defecto de esta persistencia local.

### Scope and Repository Boundaries

- **In scope**: conservación temporal del borrador permitido, restauración segura y sincronización
  del estado derivado en las variantes CA, ES y EN del envío de Comunicats.
- **Primary repository**: `guiapineda-astro`.
- **Unaffected repository**: `guiapineda-strapi`.
- **Out of scope**: cambios de backend o Functions, nuevos endpoints, persistencia remota, imágenes o
  archivos en el borrador, cambios del contrato de envío, nuevas dependencias, rediseño del formulario,
  nuevos controles o rediseño de navegación lingüística, persistencia para Agenda, Veus, Millorem
  Pineda, Foto del Mes, comercios u otras superficies.

### Key Entities *(include if feature involves data)*

- **Borrador de Comunicat**: conjunto temporal formado exclusivamente por los siete valores de
  FR-002. Representa una única propuesta compartida por CA, ES y EN durante la sesión de la pestaña.
- **Tipo de remitente**: selección pública cerrada que identifica la clase de autor del Comunicat;
  se conserva solo si sigue siendo una opción válida.
- **Datos de contacto privados**: nombre y email usados por el flujo editorial existente. Pueden
  recuperarse temporalmente, pero no incluyen consentimiento ni autorización de email.
- **Estado derivado**: presentación y capacidad de avance calculadas desde los valores actuales del
  formulario; incluye campos condicionales, contadores, previews textuales y validaciones, pero no el
  índice de paso ni ningún estado de archivo, consentimiento o verificación y no constituye por sí
  mismo contenido autorizado del borrador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una matriz CA -> ES -> EN -> CA y de recarga por idioma, el 100 % de los siete
  campos permitidos conserva su valor más reciente dentro de la misma sesión de pestaña.
- **SC-002**: En esa matriz, el 0 % de imágenes, archivos, honeypots, consentimientos, metadatos
  ocultos, códigos, tokens o estados de verificación se restaura o se considera reutilizable.
- **SC-003**: El 100 % de los borradores restaurados abre el primer paso y reproduce los campos
  condicionales, contadores, previews textuales, selección, controles de avance, revisión y
  validaciones que producirían los mismos valores introducidos manualmente, sin restaurar el índice
  de paso.
- **SC-004**: El 100 % de los valores restaurados que incumplen reglas actuales permanece visible y
  bloquea el avance o envío correspondiente hasta corregirse.
- **SC-005**: En el 100 % de los envíos confirmados y resets probados, el borrador desaparece; en el
  100 % de los fallos de envío probados, permanece disponible.
- **SC-006**: El 100 % de los casos previstos de almacenamiento corrupto, incompatible o no
  disponible deja el formulario rellenable, revisable y enviable sin mostrar un bloqueo técnico.
- **SC-007**: Los recorridos CA, ES y EN mantienen las validaciones, verificación, envío, moderación
  e imagen existentes sin regresiones funcionales.
- **SC-008**: La feature añade cero campos fuera de la allowlist, cero persistencia remota, cero
  dependencias y cero cambios en backend, Functions o infraestructura.
- **SC-009**: Toda comprobación dependiente de infraestructura real permanece identificada como
  `DEFERRED — predeployment` y no se presenta como validación local superada.

## Assumptions

- Nombre y email de contacto se incluyen porque cumplen la misma finalidad privada y temporal ya
  aprobada para Agenda; recuperar el email nunca recupera su autorización.
- Las tres variantes lingüísticas representan una sola propuesta de Comunicat, no tres traducciones
  independientes.
- El intercambio del borrador se aplica a las rutas lingüísticas existentes; esta feature no crea
  un mecanismo nuevo para navegar entre ellas.
- Una pestaña prepara como máximo un borrador de Comunicat a la vez.
- El fin natural de la sesión de la pestaña proporciona la retención suficiente; no se necesita TTL.
- No se añade un botón nuevo de reset o descarte: la feature responde a la semántica de reset del
  formulario si esta se invoca.
- La entrega real del Comunicat continúa perteneciendo al flujo existente y no es necesaria para
  demostrar localmente la persistencia; solo la limpieza tras éxito requiere una aceptación
  controlada durante la validación local.
