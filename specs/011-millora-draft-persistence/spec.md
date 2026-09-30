# Feature Specification: Millorem — Safe Multilingual Draft Persistence

**Feature Branch**: `main`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Conservar temporalmente y restaurar de forma segura el trabajo permitido del formulario multietapa de Millorem al recargar, navegar, volver o cambiar entre CA/ES/EN, con un único borrador de sesión, minimización de datos y sin cambios de backend ni SQLite."

## Clarifications

### Session 2026-09-28

- Q: ¿Qué contrato conjunto se aprueba para `email_contacto`, `millora-author-type`, `millora-alias`
  y `autor_public`? → A: Opción A: persistir email, tipo de autoría y alias; conservar el alias oculto
  y aplicarlo solo con autoría `alias`; excluir `autor_public` y reconstruirlo siempre desde las
  fuentes restauradas y el locale actual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar una mejora en curso (Priority: P1)

Como persona que redacta una propuesta para Millorem, quiero recuperar el trabajo permitido después
de una recarga accidental o de volver al formulario durante la misma sesión de la pestaña, para no
tener que repetir un recorrido multietapa ni volver a escribir contenido relevante.

**Why this priority**: El formulario combina decisiones de contexto con título, resumen y contenido
largo. Su pérdida interrumpe una aportación real y puede provocar que la persona abandone el envío.

**Independent Test**: Introducir valores parciales y completos en todos los campos finalmente
permitidos, recargar o salir y volver durante la misma sesión, y comprobar que reaparece siempre el
valor permitido más reciente sin restaurar ningún dato excluido.

**Acceptance Scenarios**:

1. **Given** una persona ha rellenado parcialmente los campos permitidos, **When** recarga la ruta
   actual, **Then** recupera sus valores permitidos más recientes y puede continuar desde el primer
   paso editable.
2. **Given** existe un borrador de Millorem dentro de la sesión actual, **When** la persona navega a
   otra superficie y vuelve al formulario, **Then** recupera el mismo borrador sin reintroducir sus
   valores permitidos.
3. **Given** un campo permitido cambia varias veces, incluso quedando vacío, **When** se restaura el
   formulario, **Then** aparece únicamente su estado permitido más reciente y no un valor anterior.
4. **Given** se restauran categoría, zona y textos, **When** aparece el primer paso, **Then** las
   opciones visibles, controles de avance, contadores, validaciones y preview textual concuerdan con
   los valores actuales restaurados.
5. **Given** la persona vuelve a abrir la revisión después de restaurar, **When** se muestra esa
   revisión, **Then** se reconstruye desde el formulario actual y no desde una copia persistida del
   estado de revisión.

---

### User Story 2 - Continuar un único borrador entre CA, ES y EN (Priority: P2)

Como persona que cambia el idioma de GUIAPINEDA mientras prepara una mejora, quiero conservar un
único trabajo en curso en CA, ES y EN, para no obtener borradores divergentes ni perder el contenido
ya escrito.

**Why this priority**: Las tres lenguas son superficies estructurales del producto y el formulario
ofrece navegación lingüística propia. La continuidad debe acompañar a la misma aportación.

**Independent Test**: Iniciar el borrador en CA, recorrer CA -> ES -> EN -> CA dentro de la misma
sesión, editar valores en distintos puntos y comprobar que todas las rutas recuperan un único estado
lógico, con contenido literal y con la interfaz reconstruida en el idioma activo.

**Acceptance Scenarios**:

1. **Given** existe un borrador iniciado en CA, **When** la persona abre la ruta equivalente en ES o
   EN, **Then** recupera el mismo borrador lógico.
2. **Given** una persona escribió contenido en cualquier idioma, **When** cambia el idioma de la
   interfaz, **Then** sus valores se conservan literalmente y no se traducen, corrigen ni reformatean.
3. **Given** la persona edita un campo desde una de las rutas lingüísticas, **When** vuelve a otra
   ruta de Millorem, **Then** encuentra el valor más reciente y no una variante por idioma.
4. **Given** se restaura un borrador desde otra ruta lingüística, **When** se reconstruyen labels,
   nombres de categoría, zona, autoría, validaciones y revisión, **Then** esos textos de interfaz
   corresponden al locale actual sin haberse guardado como parte del contenido del usuario.

---

### User Story 3 - Mantener privacidad y seguridad al recuperar el borrador (Priority: P1)

Como persona que utiliza un formulario privado y verificado, quiero que solo se conserve el mínimo
aprobado para continuar redactando y que las autorizaciones sensibles deban completarse de nuevo,
para que la recuperación no debilite la privacidad ni el control del envío.

**Why this priority**: Evitar pérdida de trabajo solo aporta valor si no conserva imágenes,
consentimiento, verificación o estados técnicos que no deben sobrevivir a una nueva apertura.

**Independent Test**: Combinar datos permitidos y excluidos, fallos de almacenamiento, datos
corruptos, validaciones y envíos correctos o fallidos; el formulario debe seguir usable y solo el
contenido expresamente permitido puede reaparecer.

**Acceptance Scenarios**:

1. **Given** se había seleccionado una imagen, **When** se recarga, vuelve o cambia de idioma,
   **Then** no reaparecen el archivo, su nombre, su preview ni ninguna referencia temporal.
2. **Given** se había aceptado el consentimiento o completado parte o toda la verificación,
   **When** se restaura el formulario, **Then** el consentimiento está sin marcar y la verificación
   debe realizarse de nuevo.
3. **Given** existe un borrador y falla validación, solicitud de código, verificación o envío,
   **When** la persona continúa o vuelve al formulario, **Then** el borrador permitido se conserva y
   no se inicia automáticamente ningún nuevo intento.
4. **Given** el envío termina confirmado como correcto, **When** finaliza el flujo, **Then** el
   borrador de Millorem deja de estar disponible.
5. **Given** el almacenamiento temporal está bloqueado, ausente o falla, **When** se abre y utiliza
   Millorem, **Then** el formulario continúa siendo rellenable, revisable, verificable y enviable sin
   una excepción visible causada por la recuperación.
6. **Given** los datos almacenados son corruptos, incompatibles, desconocidos o parcialmente
   inválidos, **When** se intenta restaurar, **Then** no habilitan estados no válidos, no rompen el
   formulario y se ignoran o descartan con seguridad.
7. **Given** finaliza naturalmente la sesión de la pestaña, **When** se inicia otra sesión, **Then**
   la feature no promete recuperar el borrador anterior.

### Edge Cases

- El borrador solo contiene una parte de los campos permitidos: se restauran los valores válidos
  presentes y los demás conservan el estado inicial normal.
- Un campo permitido contiene un tipo incorrecto, un enum inexistente o un valor incompatible con
  el formulario vigente: ese valor no se aplica ni desbloquea el avance.
- Categoría o zona ya no existe en las opciones actuales: se conserva la selección inicial segura y
  los controles derivados reflejan que falta una elección válida.
- El alias puede conservarse aunque `resident` o `visitor` lo mantengan oculto, pero no participa en
  preview, revisión ni envío hasta que `millora-author-type` vuelva a ser `alias`.
- El borrador contiene campos no incluidos en la allowlist final: se ignoran aunque sus nombres
  coincidan con elementos presentes en el formulario.
- La imagen era necesaria para completar el recorrido: después de restaurar debe seleccionarse de
  nuevo y la revisión debe reflejar su ausencia.
- La persona estaba en contenido o revisión: tras la restauración vuelve al primer paso editable y
  puede avanzar de nuevo cuando el estado actual sea válido.
- Dos pestañas usan Millorem: la feature no promete sincronización, propagación, bloqueo ni fusión
  entre ellas.
- El formulario actual no ofrece reset general, descarte ni cancelación del borrador: la feature no
  añade ni simula uno; retirar solo una imagen no equivale a borrar el borrador completo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mantener como máximo un borrador lógico de Millorem por sesión de
  pestaña, compartido por las rutas existentes CA, ES y EN.
- **FR-002**: La allowlist MUST incluir los campos reales `categoria`, `zona`, `titol`, `resum` y
  `contingut`; ningún campo fuera de la allowlist final MUST persistirse o restaurarse.
- **FR-003**: La allowlist MUST incluir `email_contacto` como dato introducido por la persona y MUST
  conservar su valor literal más reciente en el borrador temporal de `sessionStorage`; restaurarlo
  MUST NOT restaurar ni implicar código, challenge, token, sesión o estado de verificación.
- **FR-004**: La allowlist MUST incluir `millora-author-type` y `millora-alias`. El tipo restaurado
  MUST aceptar únicamente el estado parcial vacío o los valores contractuales `resident`, `visitor`
  y `alias`. El valor literal de `millora-alias` MUST conservarse aunque `resident` o `visitor` lo
  mantengan oculto, MUST NOT borrarse al cambiar a esos tipos y MUST reaparecer si se vuelve a
  `alias`; mientras el tipo activo no sea `alias`, ese valor oculto MUST NOT participar en preview,
  revisión, validación funcional ni envío.
- **FR-005**: `autor_public` MUST quedar fuera de la allowlist y MUST clasificarse como estado
  derivado. Tras restaurar, MUST reconstruirse siempre desde el locale actual: sin un author-type
  válido será `""`; con `resident` usará la label localizada actual de residente; con `visitor`, la
  label localizada actual de visitante; y con `alias`, `trim(millora-alias)`. Ninguna label localizada
  persistida en otro idioma MUST restaurarse.
- **FR-006**: El sistema MUST actualizar el borrador tras cada edición válida de un campo permitido,
  de modo que una recuperación posterior use el valor más reciente observable, incluido el vacío.
- **FR-007**: Los valores permitidos MUST sobrevivir a la recarga, a la navegación y regreso al
  formulario y al cambio entre las rutas Millorem CA, ES y EN dentro de la misma sesión de pestaña.
- **FR-008**: El contenido escrito por la persona MUST conservarse literalmente entre idiomas y MUST
  NOT traducirse, corregirse, reformatearse ni sustituirse automáticamente.
- **FR-009**: Los labels, nombres de opciones, mensajes, ayudas y textos de revisión MUST
  reconstruirse en el locale activo y MUST NOT formar parte del borrador como traducciones guardadas.
- **FR-010**: La restauración MUST comenzar en el primer paso editable; el paso actual, la posición
  del wizard y el hecho de estar en revisión MUST NOT persistirse ni restaurarse.
- **FR-011**: La restauración MUST recalcular desde los valores actuales los controles de avance,
  validaciones, contadores de caracteres, tiempo de lectura, preview textual y revisión.
- **FR-012**: El estado de revisión MUST reconstruirse solo cuando corresponda mostrarlo y MUST NOT
  persistirse como copia independiente del formulario.
- **FR-013**: Imágenes, contenido binario, nombres de archivo, metadatos de archivo, previews,
  referencias de archivo y object URLs MUST NOT guardarse ni restaurarse.
- **FR-014**: El consentimiento y cualquier aceptación legal MUST NOT guardarse ni restaurarse, y su
  control MUST aparecer sin marcar tras recarga, regreso o cambio de idioma.
- **FR-015**: Códigos, challenges, tokens, autorizaciones temporales, sesión o estado de verificación,
  estado de email verificado y cualquier dato técnico de seguridad MUST NOT guardarse ni restaurarse.
- **FR-016**: El idioma oculto MUST corresponder siempre a la ruta activa y MUST NOT recuperarse del
  borrador.
- **FR-017**: Errores, estado de envío, indicadores de carga, foco, scroll, mensajes temporales,
  estado técnico y cualquier otro valor no allowlisted MUST NOT persistirse ni restaurarse.
- **FR-018**: Cada valor desconocido, extra, de tipo incorrecto, con enum inválido o incompatible con
  el contrato vigente MUST ignorarse individualmente; los demás campos válidos MAY recuperarse.
- **FR-019**: Una estructura global ilegible o incompatible, una versión no admitida o una identidad
  de borrador distinta de Millorem MUST ignorarse o descartarse sin impedir el uso normal del
  formulario.
- **FR-020**: La recuperación MUST ser fail-open: la ausencia, bloqueo, denegación o fallo del
  almacenamiento temporal MUST NOT impedir rellenar, revisar, verificar o enviar Millorem.
- **FR-021**: Un fallo de validación, solicitud de código, verificación o envío, así como cualquier
  error temporal, MUST NOT eliminar el borrador ni iniciar automáticamente otro intento.
- **FR-022**: El borrador MUST eliminarse únicamente tras un envío confirmado como correcto o al
  finalizar naturalmente la sesión de la pestaña.
- **FR-023**: Dado que Millorem no ofrece actualmente reset general, limpieza, cancelación ni una
  acción equivalente, la feature MUST NOT añadir, simular ni atribuir limpieza a una acción
  inexistente; retirar la imagen MUST NOT eliminar el borrador textual.
- **FR-024**: Recargar, navegar, volver o cambiar CA/ES/EN MUST NOT eliminar el borrador mientras
  continúe la misma sesión soportada.
- **FR-025**: La identidad del borrador MUST permanecer aislada de Agenda, Comunicats, Veus, Foto del
  Mes y Commerce, sin lectura, colisión, sobrescritura ni eliminación cruzada.
- **FR-026**: Los comportamientos existentes de borrador de Agenda, Comunicats y Veus MUST permanecer
  sin cambios y formar parte de la regresión obligatoria.
- **FR-027**: Los comportamientos de guardado, restauración, exclusión, reconstrucción, limpieza y
  tolerancia a fallos MUST ser funcionalmente equivalentes en CA, ES y EN.
- **FR-028**: El borrador MUST permanecer exclusivamente en el contexto temporal local de la sesión
  de pestaña y MUST NOT enviarse, sincronizarse ni persistirse en backend o servicios remotos.
- **FR-029**: La feature MUST producir cero cambios en backend, Functions, Strapi, SQLite, schemas,
  moderación, verificación de email, rate limiting, uploads, infraestructura o despliegue.
- **FR-030**: La feature MUST mantener intactos los contratos actuales de envío, los requisitos de
  imagen, el consentimiento, las rutas y el resto del comportamiento funcional de Millorem salvo la
  recuperación temporal definida en esta especificación.

### Key Entities

- **Borrador de Millorem**: Conjunto temporal, versionado, local y minimizado de valores aprobados
  que representa una única mejora en curso compartida entre CA, ES y EN durante una sesión de
  pestaña.
- **Campo permitido**: Campo incluido expresamente en la allowlist final, identificado por su nombre
  contractual y sujeto a los valores y límites que admite el formulario vigente.
- **Dato excluido**: Imagen, consentimiento, verificación, idioma técnico, estado transitorio,
  traducción de interfaz o cualquier campo que no figure en la allowlist final.
- **Estado derivado de interfaz**: Paso, `autor_public`, label localizado, contador, tiempo de
  lectura, validación, preview o revisión que se calcula desde el formulario y no constituye por sí
  mismo contenido persistible. `autor_public` se reconstruye mediante las reglas cerradas de FR-005.
- **Sesión de cumplimentación**: Continuidad dentro de una misma sesión natural de pestaña, incluidas
  recargas, navegación y las tres rutas lingüísticas; no promete continuidad entre pestañas,
  navegadores, dispositivos ni sesiones finalizadas.

### Draft Lifecycle

1. **Creación y edición**: el borrador nace con la primera edición de un campo permitido y conserva
   su valor permitido más reciente.
2. **Continuidad**: recarga, navegación, regreso y cambio CA/ES/EN mantienen el mismo borrador lógico
   durante la sesión soportada.
3. **Restauración**: el formulario abre en el primer paso, aplica solo valores allowlisted válidos y
   reconstruye el estado derivado desde el locale y el formulario actuales.
4. **Fallos previos al éxito**: validación, solicitud de código, verificación o envío fallidos
   conservan el borrador y no generan reintentos automáticos.
5. **Éxito confirmado**: el borrador se elimina solo después de confirmarse el envío correcto.
6. **Fin de sesión**: la continuidad termina de forma natural con la sesión de pestaña; no existe
   una retención adicional ni una promesa de recuperación posterior.
7. **Sin reset nuevo**: al no existir una acción general de reset, esta feature no introduce otra
   vía de limpieza visible ni equipara la retirada de imagen a borrar el borrador.

### Scope and Boundaries

**In scope**:

- Un único borrador temporal de Millorem compartido por CA, ES y EN.
- Allowlist cerrada de ocho campos: `categoria`, `zona`, `millora-author-type`, `millora-alias`,
  `titol`, `resum`, `contingut` y `email_contacto`.
- Recuperación tras recarga, navegación, regreso y cambio de idioma dentro de la sesión.
- Restauración segura en el primer paso y reconstrucción de validaciones y estados derivados.
- Conservación tras fallos y limpieza tras éxito confirmado o fin natural de la sesión.
- Tolerancia a almacenamiento ausente, bloqueado, corrupto, incompatible o parcialmente inválido.
- Regresión de los borradores existentes de Agenda, Comunicats y Veus.

**Out of scope**:

- Draft persistence de Foto del Mes o Commerce.
- Cambios funcionales en Agenda, Comunicats o Veus fuera de regresión.
- Backend, Strapi, Functions, SQLite, PostgreSQL, schemas, Content Manager y moderación.
- Resend, Upstash, Cloudinary, infraestructura, despliegue y servicios nuevos.
- Cambios de verificación, tokens, códigos, rate limiting, envío, uploads o cuarentena.
- Persistencia de imágenes, previews, binarios, consentimiento o estados de seguridad.
- Almacenamiento duradero, IndexedDB, `localStorage`, TTL o sincronización remota.
- Sincronización entre pestañas, dispositivos, navegadores o sesiones terminadas.
- Cuentas, perfiles, traducción automática, rediseño, copy no relacionado y rutas nuevas.
- Refactors no imprescindibles para el comportamiento aprobado.
- Añadir una acción visible de reset, descarte o gestión de borradores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una matriz de recarga y navegación de regreso, el 100 % de los campos finalmente
  aprobados recupera su valor válido más reciente dentro de la misma sesión de pestaña.
- **SC-002**: En un recorrido CA -> ES -> EN -> CA, el 100 % de los campos permitidos comparte un
  único valor lógico y el 0 % del contenido escrito se traduce o transforma automáticamente.
- **SC-003**: En el 100 % de las restauraciones probadas, el formulario abre el primer paso y sus
  controles de avance, contadores, tiempo de lectura, validaciones, preview y revisión posterior
  concuerdan con los valores recuperados y el locale activo.
- **SC-004**: En el 100 % de los casos probados se restauran cero imágenes, nombres de archivo,
  previews, consentimiento, códigos, tokens, challenges, verificación, errores, pasos o estados de
  envío.
- **SC-005**: El 100 % de los envíos confirmados probados elimina el borrador; el 100 % de los fallos
  de validación, solicitud de código, verificación, envío y errores temporales probados lo conserva.
- **SC-006**: El 100 % de los casos previstos de almacenamiento ausente, bloqueado, corrupto,
  incompatible o parcialmente inválido deja el formulario usable y no habilita estados rechazados
  por el flujo normal.
- **SC-007**: Agenda, Comunicats y Veus conservan el 100 % de sus comportamientos actuales de
  guardado, restauración, exclusión y limpieza en la regresión definida para esta feature.
- **SC-008**: CA, ES y EN permiten completar, revisar y enviar Millorem con comportamiento funcional
  equivalente tanto con recuperación disponible como cuando esta falla.
- **SC-009**: La validación de alcance detecta cero cambios en backend, SQLite, infraestructura,
  rutas, contratos de envío, verificación o tratamiento de imágenes.

## Assumptions

- La pérdida actual de contenido en recarga, navegación o cambio de idioma es un defecto observable
  que permite tratar esta feature como la excepción de defecto real prevista para Millorem Unit A.
- Las rutas CA, ES y EN existentes representan la misma aportación lógica y no requieren traducir el
  contenido escrito por la persona.
- La continuidad se limita a la sesión natural de una pestaña; no se requiere historial, TTL,
  recuperación entre sesiones ni coordinación entre pestañas.
- Millorem no tiene actualmente una acción general de reset, descarte o cancelación del formulario.
- La decisión humana de CLARIFY cerró FR-003, FR-004 y FR-005 con ocho campos permitidos y
  `autor_public` excluido como estado derivado reconstruible.
- El repositorio afectado es exclusivamente el frontend `guiapineda-astro`; `guiapineda-strapi` y su
  capa persistente permanecen fuera de alcance.
