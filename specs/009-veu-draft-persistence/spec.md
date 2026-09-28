# Feature Specification: Veus — Safe Multilingual Draft Persistence

**Feature Branch**: `main`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Conservar y restaurar de forma segura el borrador permitido del formulario privado de Veus al recargar, cambiar entre CA/ES/EN o volver al formulario dentro de la misma sesión soportada, sin persistir archivos, consentimiento, verificación ni otros datos excluidos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar el trabajo tras una interrupción local (Priority: P1)

Como persona que prepara una aportación para Veus, quiero recuperar los campos permitidos que ya he
rellenado después de recargar o volver al formulario en la misma sesión de la pestaña, para no perder
un texto que todavía no he enviado.

**Why this priority**: Veus contiene varios campos editoriales y un recorrido en dos pasos. Perderlos
por una recarga accidental obliga a repetir el trabajo y puede impedir que la aportación se complete.

**Independent Test**: Rellenar parcialmente los siete campos permitidos, recargar la ruta actual y
comprobar que reaparecen sus valores más recientes, que el formulario sigue siendo editable y que
ningún estado excluido reaparece.

**Acceptance Scenarios**:

1. **Given** una persona ha introducido valores parciales en los campos permitidos de Veus, **When**
   recarga la página dentro de la misma sesión de la pestaña, **Then** recupera todos esos valores sin
   tener que volver a escribirlos.
2. **Given** un borrador permitido contiene título, resumen, contenido y datos de autoría/contacto,
   **When** la persona vuelve al formulario de Veus dentro de la misma sesión, **Then** ve la versión
   más reciente de cada valor permitido.
3. **Given** se restaura un borrador, **When** aparece el formulario, **Then** se abre el primer paso
   editable y el tipo de autoría, el autor público, los contadores, las validaciones y los controles
   visibles concuerdan con los valores restaurados.
4. **Given** los valores restaurados permiten avanzar, **When** la persona abre la revisión, **Then**
   el resumen se calcula a partir del estado actual y no de una copia obsoleta de la revisión.
5. **Given** un valor permitido cambia varias veces antes de la recarga, **When** se restaura el
   borrador, **Then** aparece únicamente su valor más reciente.

---

### User Story 2 - Continuar el mismo borrador entre CA, ES y EN (Priority: P2)

Como persona que cambia el idioma de navegación mientras prepara una Veu, quiero continuar el mismo
trabajo en las rutas catalana, española e inglesa, sin obtener tres borradores incompatibles ni ver
alterado el contenido que escribí.

**Why this priority**: CA, ES y EN son superficies estructurales del producto. La recuperación solo
es coherente si acompaña a la misma aportación al cambiar de idioma.

**Independent Test**: Introducir valores en CA, recorrer CA -> ES -> EN -> CA en la misma pestaña y
comprobar que las cuatro aperturas muestran un único borrador con los valores más recientes y sin
traducción automática.

**Acceptance Scenarios**:

1. **Given** existe un borrador iniciado en CA, **When** la persona abre la ruta equivalente en ES y
   después en EN dentro de la misma sesión, **Then** recupera el mismo borrador lógico en ambos
   idiomas.
2. **Given** la persona escribió contenido en un idioma, **When** cambia el idioma de la interfaz,
   **Then** los valores escritos se conservan exactamente y no se traducen, reformatean ni sustituyen.
3. **Given** la persona modifica un campo después de cambiar de idioma, **When** vuelve a cualquiera
   de las otras rutas lingüísticas, **Then** encuentra el valor modificado más reciente.
4. **Given** hay una aportación Veus en curso, **When** alterna varias veces entre CA, ES y EN,
   **Then** no se crean variantes independientes ni colisiones con borradores de otras secciones.

---

### User Story 3 - Conservar solo un borrador seguro y controlado (Priority: P1)

Como persona que utiliza el formulario privado, quiero que la recuperación se limite al contenido
necesario para continuar redactando y que se elimine en los momentos correctos, para no reutilizar
archivos, consentimiento, verificación ni autorizaciones sensibles.

**Why this priority**: La reducción de pérdida de trabajo no puede debilitar la privacidad ni las
garantías del envío verificado. La seguridad y la limpieza correcta son condiciones del valor de la
feature, no mejoras opcionales.

**Independent Test**: Probar envíos correctos y fallidos, la ausencia de una acción de reset, datos
corruptos, versiones incompatibles, campos desconocidos y valores excluidos; solo los siete campos
permitidos deben poder sobrevivir mientras el borrador siga vigente.

**Acceptance Scenarios**:

1. **Given** existe un borrador y el envío se confirma como correcto, **When** finaliza el flujo de
   envío, **Then** el borrador de Veus deja de estar disponible.
2. **Given** existe un borrador, **When** el envío falla o se produce un error temporal, **Then** los
   valores permitidos permanecen recuperables y no se inicia un reintento automático.
3. **Given** el formulario Veus actual no ofrece reset, limpieza, cancelación ni una acción
   equivalente, **When** se incorpora esta feature, **Then** no se añade ni se simula una acción nueva
   de descarte y la limpieza depende únicamente del éxito confirmado o del fin natural de la sesión.
4. **Given** el almacenamiento local contiene datos ilegibles, incompatibles o con una estructura
   inesperada, **When** se abre Veus, **Then** el formulario continúa usable desde un estado seguro y
   esos datos se ignoran o descartan.
5. **Given** un borrador incluye campos desconocidos o valores con tipos o formatos que ya no admite
   el formulario, **When** se restaura, **Then** esos valores no se aplican ni desbloquean estados y
   los campos permitidos válidos pueden recuperarse con seguridad.
6. **Given** la persona había seleccionado una imagen, marcado el consentimiento o completado la
   verificación, **When** recarga o cambia de idioma, **Then** la imagen queda sin seleccionar, el
   consentimiento queda sin marcar y la verificación debe realizarse de nuevo cuando corresponda.
7. **Given** existe información temporal de verificación o seguridad, **When** se guarda el borrador,
   **Then** ningún token, código, challenge, autorización, sesión o estado de email verificado forma
   parte de él.
8. **Given** existen borradores de Agenda o Comunicats, **When** se crea, actualiza, restaura o elimina
   el borrador de Veus, **Then** aquellos borradores y sus comportamientos permanecen intactos.

### Edge Cases

- Un campo permitido está vacío: su estado vacío más reciente puede recuperarse sin hacer reaparecer
  un valor anterior.
- El tipo de autoría cambia entre `nom_complet`, `nom` y `pseudonim`: `autor_public` conserva su
  valor más reciente, permanece visible y obligatorio, y la revisión actualiza únicamente la etiqueta
  traducida del tipo porque el flujo real no define ningún caso en que el autor público deje de aplicar.
- El borrador contiene solo una parte de los campos permitidos: se restauran únicamente los valores
  válidos presentes y el resto conserva el estado inicial normal del formulario.
- El borrador contiene campos con nombres válidos pero valores de tipo incorrecto o que exceden el
  contrato vigente: se ignoran sin romper la página ni el resto del borrador.
- La recuperación local no está disponible o falla: Veus sigue siendo rellenable, revisable y
  enviable, aunque no pueda recuperar el trabajo anterior.
- La persona cambia de idioma mientras está en el paso de revisión: la ruta de destino abre el primer
  paso editable, recupera los campos permitidos y exige reconstruir la revisión.
- La pestaña permanece abierta durante un periodo prolongado: el borrador no caduca por un plazo
  artificial mientras continúe la misma sesión natural.
- Dos pestañas distintas preparan Veus: la feature no promete sincronización, propagación ni fusión
  entre pestañas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mantener como máximo un borrador lógico de Veus por sesión de pestaña.
- **FR-002**: El borrador MUST admitir exclusivamente los campos reales `titol`, `resum`,
  `contingut`, `tipo_autoria`, `autor_public`, `nombre_contacto` y `email_contacto`.
- **FR-003**: El sistema MUST actualizar el borrador cuando cambie de forma válida cualquiera de los
  campos permitidos, de modo que una recuperación posterior use el valor más reciente observable.
- **FR-004**: Los valores permitidos MUST sobrevivir a una recarga y al regreso a Veus dentro de la
  misma sesión natural de la pestaña.
- **FR-005**: Las rutas existentes CA, ES y EN de Veus MUST compartir una única identidad lógica de
  borrador dentro de esa sesión.
- **FR-006**: Cambiar entre CA, ES y EN MUST conservar los valores introducidos sin traducirlos,
  corregirlos ni transformarlos automáticamente; las etiquetas de interfaz y de revisión MUST
  reconstruirse en el idioma de destino a partir de los valores contractuales, no guardarse como
  texto traducido dentro del borrador.
- **FR-007**: La restauración MUST reponer los campos textuales permitidos y MUST aceptar para
  `tipo_autoria` únicamente el valor parcial vacío o los valores contractuales `nom_complet`, `nom`
  y `pseudonim`; cualquier otro valor MUST conservar la selección inicial segura.
- **FR-008**: `autor_public` MUST restaurarse como campo textual siempre visible y obligatorio,
  independientemente del valor contractual de `tipo_autoria`; cambiar o restaurar el tipo MUST NOT
  ocultar, borrar ni convertir en no aplicable el autor público, porque el flujo actual no define ese
  comportamiento condicional.
- **FR-009**: La restauración MUST recalcular los contadores de caracteres y los estados de
  validación o avance derivados de los campos permitidos.
- **FR-010**: El formulario restaurado MUST comenzar en el primer paso editable; el índice del paso y
  el hecho de estar en revisión MUST NOT persistirse ni restaurarse.
- **FR-011**: La vista de revisión MUST reconstruirse únicamente desde los valores actuales del
  formulario cuando la persona vuelva a abrirla.
- **FR-012**: Archivos, imágenes, nombres de archivo, previews y referencias de archivo MUST NOT
  guardarse ni restaurarse como parte del borrador.
- **FR-013**: El consentimiento y cualquier aceptación legal MUST NOT guardarse ni restaurarse; sus
  controles MUST aparecer sin marcar después de recarga o cambio de idioma.
- **FR-014**: Tokens, códigos, challenges, sesiones de verificación, autorizaciones temporales,
  estado de email verificado y cualquier dato técnico de seguridad MUST NOT guardarse ni restaurarse.
- **FR-015**: El borrador MUST aplicar una allowlist cerrada; todo campo no enumerado en FR-002 MUST
  ignorarse aunque aparezca en datos previamente almacenados.
- **FR-016**: En un borrador parcialmente válido, cada campo extra, no permitido, de tipo incorrecto,
  con enum inválido o que incumpla el contrato vigente MUST ignorarse individualmente sin imponerse
  sobre el valor inicial seguro; los demás campos permitidos válidos MAY recuperarse.
- **FR-017**: JSON inválido, una raíz que no sea objeto, una versión incompatible, un scope distinto
  de Veus o una colección de campos con forma no reconocida MUST provocar que el borrador completo se
  ignore o descarte, sin excepción visible ni impedimento para usar el formulario desde su estado
  inicial seguro.
- **FR-018**: El borrador MUST eliminarse únicamente después de un envío confirmado como correcto o
  al finalizar naturalmente la sesión de la pestaña.
- **FR-019**: Un fallo de validación cliente, el inicio o fallo de la verificación, la introducción o
  rechazo de un código, el inicio o fallo del envío y cualquier error temporal MUST NOT eliminar el
  borrador ni iniciar automáticamente un segundo intento de envío.
- **FR-020**: Recargar, volver al formulario o cambiar entre CA, ES y EN MUST NOT eliminar el
  borrador.
- **FR-021**: Dado que Veus no ofrece actualmente reset, limpieza, cancelación ni una acción
  equivalente, la feature MUST NOT añadir, simular ni usar una acción inexistente como nuevo momento
  de limpieza del borrador.
- **FR-022**: La identidad del borrador de Veus MUST estar aislada de Agenda, Comunicats, Millorem,
  Foto del Mes y Commerce, sin colisión, lectura, sobrescritura ni eliminación cruzada.
- **FR-023**: Los comportamientos existentes de borrador de Agenda y Comunicats MUST permanecer sin
  cambios y formar parte de la regresión obligatoria.
- **FR-024**: El borrador MUST permanecer exclusivamente en el contexto temporal local del navegador
  y MUST NOT enviarse, sincronizarse o persistirse en backend o servicios remotos.
- **FR-025**: Todos los comportamientos de guardado, restauración, exclusión, limpieza y tolerancia a
  corrupción MUST ser equivalentes en CA, ES y EN.
- **FR-026**: La ausencia o indisponibilidad de la recuperación local MUST NOT impedir rellenar,
  revisar, verificar ni enviar Veus mediante el flujo normal.
- **FR-027**: La feature MUST producir cero cambios en backend, Functions, Strapi, SQLite, schemas,
  Content Manager, moderación, verificación de email, rate limiting, uploads, infraestructura o
  despliegue.

### Key Entities

- **Borrador de Veus**: Conjunto temporal, versionado y local de los siete valores permitidos que
  representa una única aportación en curso compartida por CA, ES y EN durante una sesión de pestaña.
- **Campo permitido**: Campo editorial o de contacto enumerado expresamente en FR-002 que puede
  formar parte del borrador. La pertenencia se determina por nombre y por validez actual.
- **Datos de contacto permitidos**: `nombre_contacto` y `email_contacto` forman parte deliberada de la
  allowlist para evitar pérdida de trabajo, permanecen solo en el borrador local temporal, no crean
  historial y no implican conservar ni reconstruir que el email estuviera verificado.
- **Sesión de cumplimentación**: Recorrido dentro de una misma sesión natural de pestaña, incluyendo
  recargas, regreso al formulario y navegación entre las rutas Veus CA/ES/EN; no incluye una promesa
  de continuidad entre pestañas, navegadores o sesiones finalizadas.
- **Estado derivado de interfaz**: Paso visible, etiqueta lingüística de autoría, contador, validación, revisión,
  consentimiento, imagen o verificación que debe recalcularse o reiniciarse, pero no forma parte del
  borrador permitido.

### Scope and Boundaries

**In scope**:

- Persistencia temporal local de los siete campos permitidos del formulario Veus.
- Recuperación segura tras recarga, regreso y cambio entre las rutas existentes CA/ES/EN.
- Reconciliación del primer paso, tipo de autoría, autor público, contadores, validaciones y revisión.
- Limpieza tras éxito confirmado y conservación tras fallos hasta el fin natural de la sesión.
- Tolerancia a datos corruptos, incompatibles, desconocidos o inválidos.
- Regresión de los borradores existentes de Agenda y Comunicats.

**Out of scope**:

- Backend, Functions, Strapi, SQLite, schemas, Content Manager y moderación.
- Cambios en verificación de email, tokens, códigos, rate limiting o contratos de envío.
- Imágenes, uploads, previews persistentes y cualquier almacenamiento de archivos.
- Railway, PostgreSQL, Cloudinary, Resend, Upstash, infraestructura y despliegue.
- Drafts de Millorem, Foto del Mes o Commerce.
- Cambios funcionales en Agenda o Comunicats.
- Privacy retention/lifecycle, copy del CTA de Commerce, Feature 008 y otras mejoras de formularios.
- Sincronización entre pestañas, dispositivos, navegadores o sesiones finalizadas.
- Traducción automática del contenido escrito por la persona.
- Crear un nuevo control visible de reset, descarte o gestión de borradores.
- Crear un nuevo control visible para cambiar el idioma desde el formulario; la continuidad se aplica
  al navegar entre las tres rutas canónicas existentes por cualquier navegación ya disponible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una matriz de recarga y regreso al formulario, el 100 % de los siete campos
  permitidos recupera su valor válido más reciente dentro de la misma sesión de pestaña.
- **SC-002**: En un recorrido CA -> ES -> EN -> CA, el 100 % de los campos permitidos conserva un
  único valor compartido y el 0 % del contenido escrito se traduce o modifica automáticamente.
- **SC-003**: En el 100 % de las restauraciones probadas, el formulario abre el primer paso y presenta
  el tipo de autoría, el autor público siempre aplicable, los contadores, las validaciones y la revisión
  coherentes con los valores recuperados.
- **SC-004**: En el 100 % de los casos de imagen, consentimiento, verificación, token, código,
  challenge, autorización o campo desconocido probados, se restauran cero valores excluidos.
- **SC-005**: El 100 % de los envíos confirmados probados elimina el borrador; el 100 % de los fallos
  de validación, envío, verificación y errores temporales probados lo conserva.
- **SC-006**: El 100 % de los casos previstos de datos corruptos, incompatibles o inválidos deja el
  formulario usable y no habilita estados que el flujo normal rechazaría.
- **SC-007**: Las regresiones de Agenda y Comunicats conservan el 100 % de sus comportamientos
  actuales de guardado, recuperación, exclusión y limpieza.
- **SC-008**: CA, ES y EN permiten completar, revisar y enviar Veus con comportamiento funcional
  equivalente tanto con recuperación disponible como cuando esta falla.
- **SC-009**: La auditoría final identifica cero cambios o escrituras en backend, Functions, Strapi,
  SQLite, schemas, infraestructura o servicios externos atribuibles a esta feature.

## Assumptions

- La duración natural de la sesión de la pestaña ya usada por los drafts existentes proporciona la
  retención suficiente; no se necesita un plazo adicional ni continuidad tras cerrar esa sesión.
- Una pestaña prepara como máximo un borrador de Veus a la vez y no se exige coordinación con otras
  pestañas.
- La restauración segura vuelve al primer paso, siguiendo los patrones ya consolidados de Agenda y
  Comunicats; no se persiste el índice de paso ni el estado de revisión.
- El formulario Veus actual no ofrece reset, limpieza, cancelación ni una acción equivalente. La
  feature no crea una y, por tanto, no define un cleanup ligado a esa acción inexistente.
- El formulario actual tampoco muestra su selector general de idioma; la feature garantiza
  continuidad al navegar entre las rutas canónicas CA/ES/EN existentes, sin añadir controles de
  navegación lingüística.
- El éxito significa que el flujo existente ha confirmado el envío; navegación, cambio de idioma o
  inicio de un intento no constituyen éxito.
- Los siete nombres enumerados en FR-002 corresponden al formulario actual y son la allowlist
  normativa completa de esta feature.
- La feature afecta únicamente al repositorio frontend `guiapineda-astro`; `guiapineda-strapi`
  permanece read-only.
