# Feature Specification: Paridad EN para el envío de Comunicats

**Feature Branch**: `none (specification only; Git remains on main)`

**Created**: 2026-09-19

**Status**: Draft — clarified

**Input**: User description: "Añadir paridad inglesa al flujo existente de envío moderado de
Comunicats, reutilizando el comportamiento vigente en CA/ES y preservando todas sus garantías de
seguridad, privacidad y moderación."

## Clarifications

### Session 2026-09-19

- Q: ¿Cuál es la ruta pública canónica del formulario inglés de Comunicats? → A:
  `/en/comunicats/send-an-announcement/`, para mantener la jerarquía bajo `/en/comunicats/`,
  conservar la coherencia con su sección y evitar una ruta inglesa aislada de primer nivel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar un Comunicat desde la experiencia EN (Priority: P1)

Como persona que navega GUIAPINEDA en inglés, quiero encontrar la invitación a enviar un Comunicat
y completar el mismo recorrido disponible en catalán y castellano, para aportar información local
sin cambiar de idioma de interfaz.

**Why this priority**: La superficie pública inglesa ya existe, pero actualmente elimina la entrada
al flujo participativo. Cerrar ese recorrido es el valor principal de la feature.

**Independent Test**: Abrir la página inglesa de Comunicats, acceder mediante su CTA al formulario
inglés, completar todos sus pasos con datos de prueba válidos y llegar a la revisión final sin
utilizar contenido, etiquetas ni rutas CA/ES.

**Acceptance Scenarios**:

1. **Given** una persona visita `/en/comunicats/`, **When** llega a la zona de participación,
   **Then** ve un título y botón en inglés, ambos no vacíos, que describen correctamente el envío
   moderado de un Comunicat.
2. **Given** la CTA inglesa está visible, **When** la persona la activa, **Then** llega a una ruta
   inglesa válida con el formulario de Comunicats íntegramente en inglés.
3. **Given** la persona completa el formulario EN, **When** avanza por autoría, contenido y
   revisión, **Then** encuentra los mismos campos, límites, estados, previsualización y opciones de
   edición que en CA/ES, expresados en inglés.
4. **Given** hay valores inválidos o falta información obligatoria, **When** la persona intenta
   avanzar, **Then** el flujo permanece en el paso correspondiente y comunica el problema en inglés.

---

### User Story 2 - Mantener el envío inglés privado y moderado (Priority: P1)

Como persona que envía un Comunicat en inglés, quiero que mi aportación siga el mismo control de
verificación, privacidad y moderación que las aportaciones CA/ES, para que la paridad lingüística no
reduzca las garantías existentes.

**Why this priority**: El formulario EN no es aceptable si introduce un camino menos protegido o
publica contenido directamente.

**Independent Test**: Recorrer el formulario inglés con verificación y consentimiento controlados,
comprobar que la solicitud queda identificada como inglesa y que solo puede convertirse en una
solicitud privada pendiente de revisión, sin publicación automática.

**Acceptance Scenarios**:

1. **Given** una persona llega a la revisión EN, **When** no ha verificado su email o no ha aceptado
   el tratamiento de sus datos, **Then** no puede enviar el Comunicat.
2. **Given** la persona verifica el email, **When** completa el envío, **Then** la solicitud declara
   el inglés como idioma de origen y todas las capas que validan el flujo aceptan ese idioma.
3. **Given** una verificación válida, **When** se utiliza para un intento de envío, **Then** conserva
   su carácter de un solo uso y no puede reutilizarse para otro envío.
4. **Given** el Comunicat incluye una imagen válida, **When** se acepta la solicitud, **Then** la
   imagen sigue el circuito privado de cuarentena y tratamiento vigente antes de cualquier uso
   editorial.
5. **Given** la solicitud EN es aceptada por el flujo, **When** llega al área editorial, **Then**
   permanece privada y pendiente de revisión humana; nunca se publica automáticamente.
6. **Given** falla la verificación o la recepción de la solicitud, **When** el flujo informa del
   fallo, **Then** muestra un mensaje comprensible en inglés y no presenta el contenido como enviado.

---

### User Story 3 - Preservar CA y ES sin regresiones (Priority: P1)

Como persona que utiliza el envío de Comunicats en catalán o castellano, quiero que la incorporación
del inglés no cambie mi recorrido actual, para conservar una funcionalidad ya operativa.

**Why this priority**: La feature extiende un flujo existente y no autoriza su reconstrucción ni la
alteración de contratos ya válidos.

**Independent Test**: Repetir en CA y ES los recorridos representativos de acceso, validación,
revisión, verificación, imagen y aceptación/rechazo controlado, comparándolos con el comportamiento
preservado antes de esta feature.

**Acceptance Scenarios**:

1. **Given** las páginas CA y ES de Comunicats, **When** una persona utiliza sus CTA y formularios,
   **Then** las rutas, textos, campos y pasos existentes siguen disponibles sin cambios funcionales.
2. **Given** una solicitud CA o ES válida, **When** atraviesa sus validaciones actuales, **Then**
   continúa siendo aceptada con su idioma original.
3. **Given** una solicitud CA o ES inválida, **When** incumple una regla existente, **Then** sigue
   siendo rechazada por la misma categoría de motivo y sin debilitar controles.
4. **Given** cualquiera de los tres idiomas, **When** se completa el recorrido equivalente, **Then**
   la diferencia observable se limita al idioma del interfaz y de la solicitud aportada.

### Edge Cases

- La ruta EN se abre directamente, sin pasar por la CTA: debe mostrar el formulario inglés completo
  y no depender del historial de navegación.
- Falta una traducción inglesa o queda vacía: la interfaz no debe mostrar controles sin nombre ni
  recurrir silenciosamente a texto CA/ES en una superficie visible.
- Una solicitud declara `en` pero llega incompleta o con valores no permitidos: el idioma aceptado no
  debe evitar ninguna otra validación.
- Una solicitud intenta declarar un idioma distinto de CA, ES o EN: debe seguir siendo rechazada.
- El email cambia después de verificarse, el código caduca o el token ya fue consumido: el envío debe
  permanecer bloqueado conforme al comportamiento vigente.
- La imagen está ausente, supera los límites o tiene un formato no permitido: EN debe comportarse
  igual que CA/ES y nunca evitar la cuarentena mediante un camino alternativo.
- El servicio necesario para verificar o recibir la solicitud no está disponible: el formulario
  debe conservar un estado recuperable y mostrar el error inglés previsto.
- El entorno desplegado de GUIAPINEDA aún no existe: la ausencia de E2E real no debe confundirse con
  una validación superada ni justificar un despliegue anticipado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página pública inglesa de Comunicats MUST mostrar una CTA de participación completa,
  visible y no vacía.
- **FR-002**: La CTA inglesa MUST conducir a un formulario público de envío de Comunicats en inglés.
- **FR-003**: La ruta pública canónica del formulario EN MUST ser
  `/en/comunicats/send-an-announcement/`.
- **FR-004**: El formulario EN MUST presentar en inglés todos los títulos, ayudas, etiquetas,
  opciones, mensajes, acciones, estados de carga, errores y confirmaciones visibles del flujo.
- **FR-005**: El formulario EN MUST conservar el mismo inventario de datos públicos, contacto
  privado, imagen opcional, consentimiento y pasos de revisión vigente en CA/ES; esta feature MUST
  NOT añadir ni retirar campos funcionales.
- **FR-006**: Las reglas de obligatoriedad, longitud, formato, imagen, avance entre pasos,
  previsualización, edición y revisión MUST producir resultados funcionalmente equivalentes en CA,
  ES y EN.
- **FR-007**: Las solicitudes creadas desde el formulario EN MUST identificar su idioma de solicitud
  como `en` sin convertir ni traducir automáticamente el contenido aportado por la persona.
- **FR-008**: Todo límite que actualmente acepta únicamente CA/ES en el recorrido completo de una
  solicitud de Comunicat MUST aceptar también EN, manteniendo rechazado cualquier idioma no
  autorizado.
- **FR-009**: La verificación de email existente MUST seguir siendo obligatoria antes del envío EN y
  MUST conservar código temporal, vinculación al email y token de un solo uso.
- **FR-010**: El consentimiento vigente para tratar los datos de contacto MUST seguir siendo
  obligatorio y no preaceptado en EN.
- **FR-011**: El nombre y email de contacto MUST conservar su carácter privado y MUST NOT formar parte
  del Comunicat público si posteriormente se aprueba editorialmente.
- **FR-012**: Una solicitud EN aceptada MUST crear únicamente una solicitud privada sometida a
  moderación humana y MUST NOT crear ni publicar automáticamente un Comunicat público.
- **FR-013**: Las imágenes EN MUST conservar las mismas restricciones, cuarentena, normalización,
  retirada de metadatos y ciclo de moderación aplicables a CA/ES.
- **FR-014**: La feature MUST preservar los controles existentes de honeypot, límites de petición,
  autenticación interna, campos protegidos y tratamiento de errores.
- **FR-015**: Un fallo de verificación o envío MUST dejar a la persona en un estado comprensible y
  recuperable, con mensaje en el idioma del formulario y sin afirmar éxito.
- **FR-016**: Tras una aceptación confirmada, EN MUST utilizar la confirmación inglesa existente y
  MUST NOT presentar éxito antes de recibir esa confirmación.
- **FR-017**: Los recorridos CA y ES MUST conservar sus rutas, textos, validaciones, códigos de idioma,
  seguridad, revisión y resultados vigentes.
- **FR-018**: La paridad MUST cubrir CA, ES y EN como tres variantes del mismo flujo funcional; EN
  MUST NOT implementarse como un formulario alternativo con reglas reducidas.
- **FR-019**: La feature MUST coordinar únicamente los cambios necesarios en `guiapineda-astro` y
  `guiapineda-strapi`, manteniendo ambos repositorios independientes y su contrato explícito.
- **FR-020**: La feature MUST NOT introducir infraestructura, servicios, cuentas, despliegues,
  persistencia adicional ni un canal directo desde el navegador al sistema editorial.
- **FR-021**: La implementación MUST poder validarse localmente en rutas, textos, navegación,
  formulario, reglas, estados, contratos de idioma, seguridad y no regresión CA/ES.
- **FR-022**: La entrega real de email y el recorrido completo a través de infraestructura desplegada
  MUST quedar documentados como gate de predespliegue mientras no exista un entorno GUIAPINEDA apto;
  MUST NOT declararse que ese E2E ha pasado mediante dobles o respuestas simuladas.

### Scope and Repository Boundaries

- **In scope — `guiapineda-astro`**: CTA inglesa de Comunicats, ruta y formulario EN, textos visibles,
  aceptación del código de idioma EN en el límite de entrada existente y regresión CA/ES.
- **In scope — `guiapineda-strapi`**: aceptación de EN en el contrato privado existente de
  solicitudes de Comunicat y en su modelo de idioma, sin alterar el resto del ciclo de moderación.
- **Contract between repositories**: una solicitud de Comunicat válida puede declarar exactamente
  CA, ES o EN; conserva el mismo conjunto de campos permitidos y llega como solicitud privada.
- **Out of scope**: despliegue, Railway, PostgreSQL, Cloudinary, migraciones de datos existentes,
  servicios nuevos, cambios en Comunicats ya publicados, traducción automática de aportaciones,
  publicación automática, rediseño general del formulario, persistencia de borradores, otros
  formularios participativos y la futura capacidad de denunciar contenido o comunicados.

### Validation Boundary

- **Required locally**: generación de las tres rutas; CTA y textos EN no vacíos; recorrido completo
  del formulario hasta revisión; validaciones y mensajes; código de idioma EN a través de los
  contratos existentes; aceptación/rechazo controlado; seguridad e imagen mediante pruebas locales;
  build frontend; comprobaciones backend pertinentes; y regresión equivalente CA/ES.
- **Deferred to predeployment**: entrega real del código por email, consumo real del token en el
  servicio remoto, recepción real por la Function desplegada, transferencia real al sistema
  editorial y cuarentena real de imagen en un entorno desplegado integrado.
- La validación diferida MUST permanecer visible en la documentación de entrega y MUST NOT
  considerarse un defecto funcional de esta feature si toda la evidencia local exigida ha pasado.

### Key Entities

- **Solicitud moderada de Comunicat**: aportación privada con idioma de solicitud CA, ES o EN,
  autoría pública propuesta, contenido, contacto privado, consentimiento y posible imagen; permanece
  pendiente de decisión editorial.
- **Comunicat público**: contenido editorial que solo puede existir después de revisión y aprobación;
  no es creado directamente por el formulario.
- **Verificación de email**: autorización temporal vinculada al email privado y consumible una sola
  vez durante el envío.
- **Imagen en cuarentena**: archivo opcional separado del contenido público hasta que el proceso
  privado vigente lo valide y resuelva.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las visitas de prueba a `/en/comunicats/` muestran una CTA inglesa con
  título, explicación y botón no vacíos que llega al formulario EN acordado.
- **SC-002**: El 100 % de los pasos, campos, acciones y estados visibles del flujo CA/ES tienen un
  equivalente funcional en inglés sin texto visible vacío ni sustituciones CA/ES.
- **SC-003**: En la matriz local CA/ES/EN, el 100 % de los mismos datos válidos alcanza revisión y el
  100 % de los mismos casos inválidos queda bloqueado por una regla equivalente.
- **SC-004**: El 100 % de las solicitudes EN válidas probadas localmente conserva `en` como idioma a
  través de todos los límites del flujo, mientras el 100 % de idiomas fuera de CA/ES/EN sigue siendo
  rechazado.
- **SC-005**: El 0 % de las pruebas EN permite enviar sin verificación vigente, reutilizar un token,
  omitir el consentimiento requerido, saltar la cuarentena de imagen o publicar automáticamente.
- **SC-006**: El 100 % de los escenarios de regresión seleccionados en CA y ES mantiene sus rutas,
  validaciones, revisión, seguridad y resultados anteriores.
- **SC-007**: Todas las validaciones locales requeridas quedan registradas con resultado y toda
  comprobación dependiente de despliegue queda identificada explícitamente como no ejecutada.
- **SC-008**: La feature no añade servicios, despliegues ni superficies participativas distintas del
  envío inglés de Comunicats.

## Assumptions

- "Comunicat" se presenta en la interfaz inglesa como "announcement", coherente con la sección
  pública actual y con la ruta canónica acordada.
- La persona aporta el contenido en el idioma que elige; la feature no traduce texto ciudadano.
- Los valores internos de categorías de remitente permanecen estables y solo sus etiquetas visibles
  necesitan equivalente inglés.
- La página de confirmación inglesa existente es reutilizable para este flujo.
- Las reglas CA/ES actuales son la referencia funcional a preservar, no una invitación a refactorizar
  deuda ajena al objetivo.
- No existe actualmente un entorno desplegado de GUIAPINEDA capaz de ejecutar el E2E completo.
