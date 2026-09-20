# Feature Specification: Denuncia privada de Comunicats

**Feature Branch**: `none (specification only; Git remains on main)`

**Created**: 2026-09-20

**Status**: Draft — clarified

**Input**: User description: "Permitir que un visitante denuncie de forma privada y moderada un
Comunicat publicado desde sus páginas CA/ES/EN, sin comentarios públicos ni efectos automáticos
sobre el contenido denunciado."

## Clarifications

### Session 2026-09-20

- Q: ¿Qué contenido admite una denuncia? → A: Cinco motivos cerrados con paridad CA/ES/EN; explicación privada opcional para todos salvo “otro”, donde es obligatoria, con máximo de 1.000 caracteres.
- Q: ¿Qué identidad o contacto requiere el denunciante y qué se conserva? → A: Email obligatorio y verificado mediante las garantías temporales existentes; la denuncia no persiste email, nombre, IP ni otro identificador personal.
- Q: ¿Cómo se modera una denuncia y cómo se tratan las repetidas? → A: Estados pendiente, revisada y cerrada; denuncias independientes sin deduplicación, umbrales ni efectos automáticos sobre el Comunicat.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Denunciar un Comunicat publicado (Priority: P1)

Como visitante que detecta un problema en un Comunicat publicado, quiero encontrar una acción clara
para denunciarlo y completar el proceso en el idioma de la página, para avisar al equipo editorial
sin iniciar una conversación pública.

**Why this priority**: Es la capacidad pública que da sentido a la feature y resuelve el requisito
constitucional pendiente.

**Independent Test**: Abrir un Comunicat publicado en CA, ES y EN, localizar la acción después del
cuerpo del artículo y antes de los contenidos relacionados, completar los datos mínimos admitidos y
obtener una confirmación privada sin que aparezca ningún comentario o cambio en el Comunicat.

**Acceptance Scenarios**:

1. **Given** un visitante consulta el detalle de un Comunicat publicado, **When** termina de leer el
   cuerpo del artículo, **Then** encuentra una acción secundaria para denunciarlo antes de cualquier
   bloque de Comunicats relacionados.
2. **Given** la página está en CA, ES o EN, **When** el visitante inicia la denuncia, **Then** todas
   las instrucciones, campos, validaciones, errores y confirmaciones aparecen en el mismo idioma.
3. **Given** el visitante aporta una denuncia válida, **When** la envía y el sistema confirma que la
   ha recibido, **Then** ve una confirmación privada y el Comunicat público permanece sin cambios.
4. **Given** faltan datos obligatorios o hay datos inválidos, **When** intenta enviar, **Then** la
   denuncia no se acepta y el problema se comunica en el idioma activo.
5. **Given** el visitante no ha verificado su email, **When** intenta enviar la denuncia, **Then** el
   envío permanece bloqueado sin incorporar ese email a la futura entrada editorial.

---

### User Story 2 - Revisar la denuncia de forma privada (Priority: P1)

Como responsable editorial, quiero recibir una denuncia vinculada inequívocamente al Comunicat
afectado y separada del contenido público, para evaluarla manualmente sin exponer datos del
denunciante ni alterar automáticamente la publicación.

**Why this priority**: Una acción pública sin recepción editorial privada no satisface el propósito
de moderación ni las garantías constitucionales.

**Independent Test**: Crear una denuncia controlada contra un Comunicat conocido y comprobar que la
referencia estable, el motivo y los demás datos autorizados llegan a una entrada privada pendiente de
decisión humana, sin escritura sobre el Comunicat público.

**Acceptance Scenarios**:

1. **Given** existe un Comunicat publicado, **When** se acepta una denuncia válida, **Then** queda
   vinculada mediante su identificador editorial estable y conserva además el contexto público
   mínimo necesario para que el equipo pueda reconocerlo.
2. **Given** una denuncia ha sido aceptada, **When** el equipo editorial la consulta, **Then** solo
   usuarios editoriales autorizados pueden acceder a sus datos privados.
3. **Given** una denuncia entra en moderación, **When** todavía no ha sido revisada o cambia su estado
   editorial, **Then** el Comunicat denunciado continúa publicado e inalterado hasta una decisión
   editorial independiente y explícita.
4. **Given** una persona no autorizada intenta consultar denuncias, **When** solicita esos datos,
   **Then** no obtiene la denuncia ni información privada asociada.

---

### User Story 3 - Mantener un flujo seguro y recuperable (Priority: P1)

Como visitante, quiero que la denuncia rechace abuso básico y trate los fallos de manera clara, para
que pueda saber si mi aviso llegó sin revelar información ni provocar efectos engañosos.

**Why this priority**: La capacidad añade una nueva entrada pública hacia moderación y debe conservar
las garantías existentes de participación privada.

**Independent Test**: Ejecutar localmente casos válidos, inválidos, automatizados, repetidos y de
dependencia no disponible; comprobar que solo los casos válidos reciben confirmación y que ningún
fallo modifica el Comunicat.

**Acceptance Scenarios**:

1. **Given** una petición automatizada evidente, malformada o excesiva, **When** intenta crear una
   denuncia, **Then** se rechaza o limita sin crear contenido público ni una identidad persistente.
2. **Given** falla la recepción de la denuncia, **When** el flujo informa del error, **Then** muestra
   un mensaje comprensible y recuperable y no afirma que la denuncia haya sido recibida.
3. **Given** la referencia recibida no corresponde al Comunicat publicado esperado, **When** se
   valida la denuncia, **Then** se rechaza sin crear una entrada huérfana ni modificar contenido.
4. **Given** un Comunicat sigue siendo accesible, **When** nadie utiliza la acción de denuncia,
   **Then** su lectura, navegación, contenido y enlaces relacionados mantienen el comportamiento
   previo.

### Edge Cases

- El slug público cambia después de generarse la página: la denuncia debe seguir dependiendo del
  identificador editorial estable y conservar el contexto público solo como ayuda de revisión.
- El identificador, el slug y el título enviados no describen el mismo Comunicat: la solicitud debe
  rechazarse o marcarse como inválida antes de entrar en moderación.
- El Comunicat ya no existe o ya no está publicado cuando se intenta denunciar: no debe crearse una
  denuncia huérfana ni mostrarse una confirmación falsa.
- Una traducción falta o queda vacía: CA, ES y EN no deben mostrar controles sin nombre ni recurrir
  silenciosamente a otro idioma.
- Se intenta aportar HTML, enlaces maliciosos o contenido excesivo en un campo libre autorizado: el
  valor debe limitarse y tratarse como texto, nunca como contenido ejecutable.
- Se reciben varias denuncias sobre el mismo Comunicat: cada una se registra de forma independiente,
  sin deduplicación ni umbrales, y ninguna cantidad causa retirada automática.
- El canal privado o cualquier dependencia necesaria no está disponible: el visitante permanece en
  un estado recuperable y el Comunicat no cambia.
- El entorno desplegado integrado todavía no existe: las pruebas locales no deben presentarse como
  entrega real de la denuncia a infraestructura remota.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada página pública de detalle de un Comunicat publicado MUST mostrar una acción
  secundaria de denuncia después del cuerpo principal y antes del bloque de Comunicats relacionados.
- **FR-002**: La acción y el recorrido completo de denuncia MUST ofrecer comportamiento equivalente
  y copy completo en CA, ES y EN, siguiendo el idioma de la página de origen.
- **FR-003**: La denuncia MUST identificar el Comunicat mediante un identificador editorial estable
  que no dependa exclusivamente del título, el slug o la URL visible.
- **FR-004**: La denuncia MUST conservar como contexto mínimo el identificador estable del Comunicat,
  su referencia pública reconocible, el idioma de la interfaz y la fecha de recepción.
- **FR-005**: La denuncia MUST recoger exactamente uno de estos cinco motivos, con estas etiquetas
  visibles equivalentes:

  | Motivo | CA | ES | EN |
  |---|---|---|---|
  | Información falsa | Informació falsa o enganyosa | Información falsa o engañosa | False or misleading information |
  | Spam o fraude | Contingut brossa o frau | Spam o fraude | Spam or fraud |
  | Contenido inapropiado o ilegal | Contingut inadequat o possiblement il·legal | Contenido inapropiado o posiblemente ilegal | Inappropriate or potentially illegal content |
  | Privacidad | Privacitat o dades personals | Privacidad o datos personales | Privacy or personal data |
  | Otro | Un altre motiu | Otro | Other |
- **FR-005a**: La denuncia MUST permitir una explicación libre privada para todos los motivos, con un
  máximo de 1.000 caracteres; será opcional salvo para “otro”, donde será obligatoria y no podrá
  consistir solo en espacios.
- **FR-006**: El flujo MUST NOT solicitar ni almacenar nombre público, teléfono, dirección postal,
  documento de identidad, cuenta permanente, adjuntos, consentimiento comercial ni datos destinados
  a aparecer públicamente.
- **FR-007**: El denunciante MUST verificar un email antes de poder enviar, conservando
  conceptualmente las garantías existentes de código temporal, vinculación al email y autorización
  de un solo uso.
- **FR-008**: El email y cualquier dato temporal usado por la verificación MUST limitarse a la
  duración y garantías del mecanismo existente y MUST NOT transferirse ni persistirse como parte de
  la denuncia editorial.
- **FR-008a**: La denuncia persistida MUST NOT contener nombre, email, dirección IP ni ningún otro
  dato o identificador personal del denunciante, sea directo o derivado.
- **FR-009**: Una denuncia aceptada MUST crear únicamente una entrada privada para revisión humana y
  MUST NOT crear comentarios, respuestas, conversaciones ni contenido público.
- **FR-010**: La denuncia MUST tener únicamente los estados editoriales `pendiente`, `revisada` y
  `cerrada`, comenzar en `pendiente` y avanzar mediante revisión humana sin añadir subestados ni otro
  workflow en esta feature.
- **FR-010a**: Se MUST permitir crear denuncias independientes sobre un mismo Comunicat; el sistema
  MUST NOT deduplicarlas, agruparlas automáticamente ni establecer umbrales de cantidad.
- **FR-010b**: Ninguna cantidad, combinación o estado de denuncias MUST ocultar, retirar, editar o
  modificar automáticamente el Comunicat.
- **FR-011**: Crear, revisar o resolver una denuncia MUST NOT retirar, ocultar, despublicar, editar ni
  cambiar el estado del Comunicat denunciado automáticamente.
- **FR-012**: Cualquier acción posterior sobre el Comunicat MUST ser una decisión editorial explícita
  y separada del registro y resolución de la denuncia.
- **FR-013**: El sistema MUST validar que la referencia corresponde a un Comunicat existente y
  publicado antes de aceptar la denuncia, y MUST rechazar referencias manipuladas o incoherentes.
- **FR-014**: La entrada pública MUST incorporar prevención básica de abuso compatible con los
  controles existentes, incluyendo validación estricta, rechazo de automatización evidente y
  limitación de solicitudes excesivas, sin introducir cuentas ni infraestructura nueva.
- **FR-015**: La prevención de abuso MUST NOT crear perfiles públicos o permanentes del visitante ni
  añadir almacenamiento de direcciones IP, huellas de dispositivo u otros identificadores personales
  como parte de la denuncia editorial o de un nuevo registro auxiliar.
- **FR-016**: Ante un error de validación o recepción, el flujo MUST conservar un estado comprensible
  y recuperable, mostrar el mensaje en el idioma activo y MUST NOT presentar éxito.
- **FR-017**: Solo una aceptación confirmada por el canal privado MUST mostrar la confirmación de
  denuncia recibida.
- **FR-018**: La lectura pública del Comunicat, sus rutas CA/ES/EN, contenido, imágenes, navegación y
  relacionados MUST conservar su comportamiento anterior cuando no se utiliza la denuncia.
- **FR-019**: La capacidad MUST mantener la arquitectura pública static-first: visitar o leer un
  Comunicat no debe iniciar acceso dinámico al sistema editorial; solo el envío explícito de una
  denuncia puede iniciar el recorrido privado.
- **FR-020**: La feature MUST limitarse a Comunicats publicados y MUST NOT añadir denuncias a Agenda,
  Veus, comercios, Millorem Pineda u otras superficies.
- **FR-021**: La feature MUST NOT introducir comentarios públicos, mensajería, cuentas ciudadanas,
  publicación automática, retirada automática, servicios externos, infraestructura ni dependencias
  nuevas sin una decisión posterior explícita.
- **FR-022**: Debe ser posible validar localmente la presencia y paridad CA/ES/EN, identificación
  estable, reglas de entrada, privacidad, creación moderada, errores, abuso básico, ausencia de
  efectos automáticos y no regresión del detalle público.
- **FR-023**: Toda validación que dependa de entrega real mediante infraestructura desplegada MUST
  quedar identificada como `DEFERRED — predeployment` mientras no exista un entorno GUIAPINEDA apto,
  y MUST NOT declararse superada mediante dobles o respuestas simuladas.
- **FR-024**: La denuncia persistida MUST limitarse al identificador estable y contexto público mínimo
  necesarios para reconocer el Comunicat, motivo, explicación cuando exista, idioma, estado, marcas
  temporales y metadatos editoriales estrictamente necesarios para su moderación.

### Scope and Boundaries

- **In scope**: acción de denuncia en detalles públicos de Comunicats CA/ES/EN; captura privada de
  los datos mínimos autorizados; referencia estable al Comunicat; entrada en moderación editorial;
  prevención básica de abuso; estados de error y confirmación; validación local y regresión pública.
- **Out of scope**: Agenda, Veus, comercios, Millorem Pineda, Foto del Mes u otras superficies;
  comentarios, conversación con el denunciante, cuentas, panel público de seguimiento, apelaciones,
  retirada o edición automática, clasificación automática, adjuntos, despliegue e infraestructura.
- **Validation boundary**: localmente se demuestra el contrato funcional y privado. La recepción
  real a través de un entorno desplegado, y la entrega o verificación real de email si CLARIFY la
  exige, quedan como gate de predespliegue.

### Key Entities

- **Comunicat denunciado**: publicación editorial existente e identificada de forma estable; sigue
  siendo la fuente pública y no cambia como efecto automático de la denuncia.
- **Denuncia de Comunicat**: aviso privado e independiente vinculado a un Comunicat, con motivo,
  explicación conforme a sus reglas, contexto mínimo, idioma, estado y metadatos editoriales
  imprescindibles; no contiene identidad ni contacto del denunciante.
- **Decisión editorial sobre la denuncia**: revisión humana y privada que avanza de pendiente a
  revisada y cerrada; no equivale a modificar el Comunicat ni activa efectos automáticos.
- **Verificación temporal del denunciante**: comprobación obligatoria de un email mediante las
  garantías temporales existentes; habilita un envío y no se convierte en dato editorial persistido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las páginas de detalle de Comunicats de prueba en CA, ES y EN muestra la
  acción de denuncia en la ubicación acordada y con copy completo en el idioma activo.
- **SC-002**: El 100 % de las denuncias válidas probadas localmente conserva una referencia estable
  al Comunicat correcto y llega únicamente a una entrada privada con estado inicial pendiente.
- **SC-003**: El 100 % de referencias manipuladas, datos obligatorios ausentes y casos automatizados
  representativos se rechaza sin crear una denuncia válida ni modificar el Comunicat.
- **SC-004**: El 0 % de los escenarios probados publica datos del denunciante, crea comentarios o
  altera, oculta o retira automáticamente el Comunicat.
- **SC-005**: El 100 % de los fallos controlados muestra un estado comprensible en CA, ES o EN y no
  presenta una confirmación de recepción falsa.
- **SC-006**: El 100 % de los escenarios de regresión seleccionados mantiene las rutas, lectura,
  contenido, imágenes, navegación y relacionados existentes de Comunicats.
- **SC-007**: Todas las comprobaciones locales requeridas quedan registradas y el 100 % de las que
  dependan de infraestructura desplegada permanece marcado `DEFERRED — predeployment`.
- **SC-008**: La feature añade cero superficies de denuncia fuera de Comunicats, cero servicios o
  dependencias nuevas y cero efectos editoriales automáticos.

## Assumptions

- La acción se ofrece a cualquier visitante que pueda leer un Comunicat; no se crea una cuenta.
- El identificador editorial estable del Comunicat ya forma parte de los datos con los que se generan
  las páginas públicas, aunque PLAN deberá confirmar su representación exacta.
- El slug, título y URL pueden conservarse como contexto reconocible, pero nunca sustituyen al
  identificador estable.
- La prevención básica de abuso reutilizará principios y capacidades ya presentes cuando PLAN
  confirme que son aplicables sin añadir almacenamiento de identificadores personales; SPEC no
  presupone componentes concretos ni autoriza infraestructura.
- El equipo editorial resuelve la denuncia por separado de cualquier decisión sobre el Comunicat.
- No existe actualmente un entorno desplegado integrado capaz de ejecutar el E2E completo.
