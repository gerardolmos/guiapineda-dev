# Feature Specification: Alta segura y trilingüe de comercios

**Feature Branch**: `none (specification only; Git remains on main)`

**Created**: 2026-09-21

**Status**: SPECIFY, CLARIFY, PLAN and TASKS complete — ready for ANALYZE

**Input**: User description: "Convertir el alta guiada de comercios existente en un flujo funcional
CA/ES/EN que verifique el email, reciba una solicitud privada y la someta a moderación editorial,
sin crear ni publicar automáticamente ningún comercio."

## Clarifications

### Session 2026-09-21

- **Q: ¿Cuál es el contrato funcional trilingüe que debe conservarse?** → **A:** El formulario visible
  actual es la fuente de verdad; CA conserva `/alta-comerc/`, ES `/es/alta-comercio/` y EN utilizará
  `/en/businesses/add-a-business/`. Categoría es obligatoria y subcategoría solo cuando la categoría
  tenga opciones. No se exponen campos exclusivamente editoriales del modelo. Las redes se limitan a
  Instagram, Facebook, TikTok, YouTube, LinkedIn y X.
- **Q: ¿Qué política de imágenes debe aplicar la solicitud?** → **A:** Una imagen principal
  obligatoria, un logo opcional y hasta cuatro imágenes opcionales de galería; solo JPEG, PNG y WebP,
  máximo canónico de 4.000.000 bytes por archivo —mostrable al usuario como 4 MB—, sin resolución
  mínima ni detección de duplicados, con los límites seguros existentes de decodificación y
  normalización.
- **Q: ¿Cuál es el límite agregado del envío multiimagen?** → **A:** La suma de imagen principal,
  logo y galería no puede superar 4.000.000 bytes, aunque cada archivo también tiene ese máximo
  individual. El límite agregado se comprueba antes de enviar y se valida de nuevo al recibir la
  solicitud, dejando margen para la envoltura y los campos textuales. No se separan uploads ni se
  añade almacenamiento temporal, infraestructura o dependencias.
- **Q: ¿Qué contacto privado y conservación corresponden a esta feature?** → **A:** Nombre y email
  verificado obligatorios, teléfono opcional; se conservan solo para gestión y aclaraciones, nunca se
  publican y no se añaden IP ni otros identificadores. El email puede persistir solo en `pendent` o
  `en_revisio` y se elimina como parte de toda transición a `aprovat` o `rebutjat`. Esta feature no
  añade TTL, jobs ni una política adicional de anonimización para los demás datos privados; la
  política general de retención queda fuera de alcance.
- **Q: ¿Cómo funcionan moderación, duplicados y reintentos?** → **A:** Se conservan `pendent`,
  `en_revisio`, `aprovat` y `rebutjat`; toda solicitud nace `pendent` y `aprovat` solo expresa una
  decisión editorial. Ningún estado muta comercios públicos. Las solicitudes repetidas o similares
  llegan independientemente a moderación. No hay deduplicación, fusión, rechazo automático,
  idempotency keys ni reintentos ciegos. Si el token se consumió antes de un fallo posterior, el
  siguiente intento exige una verificación nueva.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar un alta completa en cualquier idioma (Priority: P1)

Como responsable de un comercio o servicio local, quiero completar el alta guiada en catalán,
castellano o inglés y enviarla realmente a GUIAPINEDA, para que el equipo editorial pueda valorar mi
incorporación al directorio.

**Why this priority**: El flujo CA/ES actualmente termina en una nota de prototipo y EN no dispone de
un recorrido equivalente. Hacer que el alta llegue a revisión es el valor central de la feature.

**Independent Test**: Recorrer por separado las rutas canónicas CA, ES y EN con datos válidos,
verificar el email y enviar; cada recorrido debe confirmar la recepción de una única solicitud
privada con el idioma correcto y sin crear ni modificar un comercio público.

**Acceptance Scenarios**:

1. **Given** una persona abre cualquiera de las tres rutas canónicas, **When** completa los datos
   requeridos, verifica su email y envía, **Then** recibe una confirmación clara y se registra una
   única solicitud privada pendiente de revisión.
2. **Given** la persona utiliza CA, ES o EN, **When** recorre todos los pasos, **Then** encuentra los
   mismos campos, reglas, estados, ayudas, mensajes y capacidad de envío en su idioma.
3. **Given** la solicitud ha sido aceptada para revisión, **When** la persona consulta el directorio
   público, **Then** no aparece ningún comercio nuevo ni se ha modificado uno existente.
4. **Given** la persona selecciona categoría y, cuando corresponda, subcategoría, **When** envía,
   **Then** la solicitud conserva referencias editoriales válidas a las opciones vigentes mostradas
   en el formulario, no simples etiquetas manipulables.

---

### User Story 2 - Entregar datos e imágenes de forma segura (Priority: P1)

Como persona solicitante, quiero que mi email sea verificado y que las imágenes permanezcan privadas
hasta la revisión humana, para que nadie pueda suplantarme ni publicar contenido directamente.

**Why this priority**: La verificación, el uso único de la autorización, la minimización de datos y la
cuarentena de imágenes son garantías constitucionales inseparables del envío funcional.

**Independent Test**: Probar solicitudes válidas, sin verificar, con autorización reutilizada,
automatizadas, con campos manipulados y con imágenes válidas o inválidas; solo el caso autorizado
debe crear una solicitud privada y ninguna imagen debe quedar públicamente accesible.

**Acceptance Scenarios**:

1. **Given** el email de contacto no está verificado, **When** se intenta enviar, **Then** el envío se
   bloquea y no se registra ninguna solicitud.
2. **Given** existe una autorización válida vinculada al mismo email y propósito, **When** se envía
   una solicitud válida, **Then** la autorización se acepta una sola vez y no sirve para un segundo
   envío.
3. **Given** se adjuntan imágenes admitidas, **When** se acepta la solicitud, **Then** todas quedan en
   almacenamiento privado de cuarentena para revisión y ninguna se publica ni se asocia a un
   comercio público.
4. **Given** se manipulan idioma, categoría, subcategoría, grupos repetibles, contacto, imágenes o
   consentimiento, **When** el sistema recibe la petición, **Then** vuelve a validar todos los datos y
   rechaza el conjunto sin crear una solicitud parcial.

---

### User Story 3 - Revisar editorialmente sin publicación automática (Priority: P1)

Como miembro autorizado del equipo editorial, quiero encontrar cada alta como solicitud privada con
su contenido, referencias e imágenes de cuarentena, para poder revisarla y decidir manualmente sin
que la ciudadanía publique o altere comercios.

**Why this priority**: La moderación humana define el producto y separa una propuesta ciudadana de
una ficha pública editorial.

**Independent Test**: Crear una solicitud controlada y comprobar que comienza en el estado inicial
`pendent`, solo es visible en la superficie privada de moderación y ninguna transición crea,
actualiza, publica o despublica automáticamente un comercio; al cerrarla, comprobar además que el
email privado se elimina en la misma transición.

**Acceptance Scenarios**:

1. **Given** se acepta un envío válido, **When** el equipo editorial abre la moderación privada,
   **Then** puede revisar todos los datos autorizados y las imágenes en cuarentena.
2. **Given** una solicitud sigue pendiente o pasa por una decisión editorial, **When** cambia su
   estado, **Then** el comercio público permanece inalterado.
3. **Given** el equipo decide utilizar la propuesta, **When** crea o modifica posteriormente una
   ficha pública, **Then** esa acción es editorial, independiente y queda fuera de este flujo
   ciudadano.
4. **Given** una solicitud está `pendent` o `en_revisio` y conserva el email privado para posibles
   aclaraciones, **When** transiciona a `aprovat` o `rebutjat`, **Then** el cierre elimina
   `email_contacto` sin borrar automáticamente los demás datos privados ni tocar un comercio.

---

### User Story 4 - Corregir y reintentar errores recuperables (Priority: P2)

Como persona que completa un alta larga, quiero recibir errores comprensibles sin perder
innecesariamente lo introducido, para corregir datos o reintentar sin empezar de nuevo.

**Why this priority**: El formulario contiene seis bloques, horarios, grupos repetibles e imágenes;
un fallo recuperable no debe convertir el alta en un recorrido inútil.

**Independent Test**: Simular validación rechazada, autorización inválida o consumida, dependencia
temporalmente no disponible y fallo de recepción; el formulario debe permanecer operativo, explicar
el siguiente paso y no crear solicitudes duplicadas o parciales.

**Acceptance Scenarios**:

1. **Given** un campo incumple una regla, **When** se intenta avanzar o enviar, **Then** el campo se
   identifica en el idioma actual y la persona puede corregirlo.
2. **Given** falla temporalmente la recepción después de completar el formulario, **When** se muestra
   el error, **Then** el contenido que el navegador todavía puede conservar permanece editable y se
   ofrece un reintento seguro.
3. **Given** la autorización ya no es válida o ya se consumió antes de un fallo posterior, **When**
   se intenta enviar, **Then** no se crea ninguna solicitud y se indica que debe verificarse de nuevo
   el email.
4. **Given** una respuesta es ambigua o se repite una interacción de envío, **When** el sistema no
   puede confirmar la aceptación, **Then** no presenta éxito falso ni crea más de una solicitud por
   una única aceptación confirmada.

### Edge Cases

- Una categoría o subcategoría deja de estar vigente entre la construcción de la página y el envío:
  la recepción la rechaza y permite escoger una opción actual, sin aceptar identificadores obsoletos.
- Una subcategoría no pertenece a la categoría enviada: se rechaza el conjunto completo.
- Una categoría no tiene subcategorías: el flujo no inventa ni exige una; si dispone de ellas, se
  exige una selección válida.
- Un horario marca el día como cerrado pero incluye horas, contiene una sola mitad de una franja,
  solapa turnos o usa un orden imposible: no se normaliza silenciosamente como horario válido.
- Un servicio carece de nombre, supera los límites o excede el máximo; una red activada carece de
  dirección válida o usa una plataforma no permitida: se rechazan los elementos afectados antes de
  crear la solicitud.
- Un archivo tiene extensión permitida pero tipo o contenido incompatible, está corrupto, supera 4
  MB, excede los límites seguros de decodificación o intenta exceder el número máximo: no se
  incorpora a cuarentena.
- Una subida múltiple falla a mitad del proceso: no queda una solicitud utilizable con un conjunto
  incompleto ni imágenes privadas huérfanas sin la política de limpieza vigente.
- El email comercial público y el email privado de la persona solicitante pueden ser distintos: solo
  el email privado que autoriza el envío se considera verificado.
- Cambiar el email privado después de verificarlo invalida la autorización anterior.
- Se envía dos veces el mismo negocio o existe una ficha pública parecida: cada solicitud válida
  llega de forma independiente a moderación y el editor decide sin fusión, rechazo ni mutación
  automática.
- El servicio de verificación, recepción privada o tratamiento de imágenes no está disponible: se
  muestra un error recuperable, no se crea contenido público y no se declara éxito.
- Un campo no reconocido o administrativo aparece en la petición: se ignora o rechaza y nunca se
  almacena por propagación masiva.
- Una autorización se consume y después falla la creación definitiva: se muestra un error
  recuperable, se conservan los datos que el navegador todavía pueda mantener y se exige una nueva
  verificación para reintentar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer un alta funcional y equivalente en las rutas existentes CA
  `/alta-comerc/`, ES `/es/alta-comercio/` y EN `/en/businesses/add-a-business/`.
- **FR-002**: Cada variante MUST presentar el recorrido completo en su idioma, incluidos títulos,
  ayudas, categorías, subcategorías, validaciones, verificación, errores, revisión y confirmación.
- **FR-003**: Una solicitud MUST representar contenido escrito en el idioma de la ruta desde la que
  se envía; la feature MUST NOT exigir tres traducciones ni traducir automáticamente el contenido.
- **FR-004**: El alta MUST conservar el recorrido existente formado por identidad y clasificación,
  descripción, contacto público, horario y atención, oferta, imágenes, revisión y contacto privado.
- **FR-005**: La identidad comercial MUST incluir nombre y categoría; la subcategoría MUST ser
  obligatoria únicamente cuando la categoría seleccionada tenga subcategorías disponibles. Categoría
  y subcategoría MUST proceder del catálogo vigente y su relación MUST validarse de nuevo al recibir
  la solicitud. Una categoría sin subcategorías MUST NOT recibir un valor artificial.
- **FR-006**: El nombre comercial MUST ser obligatorio y admitir como máximo 100 caracteres.
- **FR-007**: La descripción corta MUST ser obligatoria y admitir como máximo 160 caracteres; la
  descripción completa MUST ser obligatoria y admitir como máximo 900 caracteres.
- **FR-008**: La dirección comercial MUST ser obligatoria y admitir como máximo 180 caracteres.
- **FR-009**: Teléfono, WhatsApp, email comercial y web MUST ser individualmente opcionales, pero la
  solicitud MUST aportar al menos una vía pública de contacto válida; teléfono y WhatsApp MUST
  admitir como máximo 30 caracteres, email 180 y web 250.
- **FR-010**: El email comercial MUST considerarse información destinada a la ficha propuesta y MUST
  permanecer separado del email privado usado para autorizar y gestionar la solicitud.
- **FR-011**: El horario MUST representar los siete días actuales; cada día MUST declararse cerrado o
  contener una primera franja completa y, opcionalmente, una segunda franja completa. Cada tramo MUST
  tener inicio y fin, avanzar en el tiempo y no solaparse con otro tramo del mismo día. Debe existir
  al menos un día abierto. Las observaciones de horario existentes en el modelo permanecen internas
  y opcionales porque el formulario actual no las expone.
- **FR-012**: La solicitud MUST seleccionar al menos una modalidad entre atención presencial, a
  domicilio, online, recogida en local y reparto.
- **FR-013**: La oferta MUST contener entre uno y seis servicios o especialidades. Cada elemento MUST
  tener nombre de hasta 100 caracteres y MAY incluir una descripción de hasta 300 caracteres.
- **FR-014**: Las redes sociales MUST ser opcionales y limitarse exactamente a Instagram, Facebook,
  TikTok, YouTube, LinkedIn y X; `otra` MUST NOT exponerse en esta feature. Cada plataforma activada
  MUST aportar una dirección pública válida y no MUST duplicarse dentro de una solicitud.
- **FR-015**: La información adicional MUST ser opcional y admitir como máximo 800 caracteres.
- **FR-016**: La solicitud MUST admitir una imagen principal, un logo opcional y una galería opcional
  de hasta cuatro imágenes; la imagen principal MUST ser obligatoria.
- **FR-017**: Los archivos MUST limitarse a imágenes JPEG, PNG o WebP verificadas por su contenido,
  no solo por nombre o extensión, y cada archivo MUST tener un tamaño máximo exacto de 4.000.000
  bytes, mostrable al usuario como 4 MB. La feature MUST NOT exigir resolución mínima ni detectar
  imágenes duplicadas.
- **FR-018**: Todas las imágenes aceptadas MUST permanecer en cuarentena privada, normalizarse y
  eliminar metadatos conforme a las garantías vigentes antes de que un moderador pueda revisarlas.
  La decodificación MUST rechazar entradas superiores a 40 millones de píxeles y la normalización
  MUST limitar la salida a 3000 × 3000 píxeles y 4.000.000 bytes, sin ampliar imágenes menores. Los
  originales y sus metadatos MUST NOT conservarse después de producir la copia normalizada de
  cuarentena.
- **FR-019**: Ninguna imagen de una solicitud MUST aparecer en rutas públicas, en el directorio o en
  la biblioteca pública por el mero envío o cambio de estado de la solicitud.
- **FR-020**: La persona solicitante MUST aportar nombre de contacto y email verificado; MAY aportar
  un teléfono privado opcional. Estos datos MUST persistirse únicamente para gestionar y aclarar la
  solicitud, MUST permanecer privados y MUST NOT incorporarse automáticamente al comercio público.
  El email privado MUST persistir únicamente mientras el estado sea `pendent` o `en_revisio` y MUST
  eliminarse de la solicitud al transicionar a `aprovat` o `rebutjat`; nombre y teléfono no reciben
  en esta feature otra regla automática de anonimización.
- **FR-021**: El consentimiento de privacidad MUST ser explícito, obligatorio y específico para la
  gestión de la solicitud; la solicitud MUST registrar únicamente el hecho de su aceptación. El
  consentimiento MUST NOT autorizar publicación automática ni usos ajenos a esa gestión.
- **FR-022**: El email privado MUST verificarse antes del envío y la autorización MUST quedar
  vinculada al mismo email, al propósito exclusivo de alta de comercio y a una vigencia limitada.
- **FR-023**: Cada autorización de envío MUST poder consumirse una sola vez; una autorización
  inválida, caducada, reutilizada, vinculada a otro email o emitida para otro propósito MUST crear
  cero solicitudes.
- **FR-024**: Código, reto, token, temporizador, secretos, credenciales, material de firma y estado de
  verificación MUST quedar excluidos de la solicitud editorial y de cualquier contenido público.
- **FR-025**: La recepción MUST aplicar una allowlist cerrada y validar en servidor idioma, tipos,
  longitudes, formatos, relaciones, grupos repetibles, archivos, consentimiento y autorización sin
  confiar en el navegador.
- **FR-026**: El flujo MUST incluir protección básica contra automatización y abuso compatible con
  las garantías existentes: campo trampa, límites de frecuencia, verificación de email y rechazo de
  peticiones sobredimensionadas o malformadas. MUST NOT persistir dirección IP ni añadir otros
  identificadores personales.
- **FR-027**: Un envío aceptado MUST crear exactamente una solicitud privada con el idioma de origen
  y estado inicial `pendent`; MUST NOT exponer una operación pública de lectura,
  actualización o borrado de solicitudes.
- **FR-028**: El equipo editorial autorizado MUST poder revisar el contenido permitido y las imágenes
  privadas, registrar observaciones internas y cambiar manualmente el estado entre `pendent`,
  `en_revisio`, `aprovat` y `rebutjat`, sin añadir un workflow más complejo. Toda transición a
  `aprovat` o `rebutjat` MUST eliminar el email privado como parte atómica del cierre editorial.
- **FR-029**: Crear, actualizar, publicar, despublicar, fusionar o eliminar una ficha pública de
  comercio MUST quedar totalmente fuera de las consecuencias automáticas de este flujo. `aprovat`
  MUST significar únicamente que la solicitud fue aprobada editorialmente; `rebutjat` tampoco MUST
  alterar un comercio público.
- **FR-030**: El sistema MUST responder con éxito solo después de confirmar la recepción privada; los
  errores de validación, autorización, red, tratamiento de imágenes o dependencia MUST ser claros,
  recuperables cuando sea seguro y MUST NOT producir solicitudes parciales ni confirmaciones falsas.
- **FR-031**: Un reintento MUST mantener la protección de uso único. Si el token se consumió antes de
  un fallo posterior, la interfaz MUST mostrar un error recuperable y exigir una verificación nueva;
  MUST NOT permitir reutilizar el token ni ejecutar reintentos automáticos ciegos. La feature MUST
  NOT añadir claves de idempotencia ni infraestructura para ellas.
- **FR-032**: El directorio, categorías, subcategorías, fichas y datos públicos existentes MUST
  conservar rutas, contenido y comportamiento; la feature MUST producir cero mutaciones sobre ellos
  durante el envío y la moderación de solicitudes.
- **FR-033**: La feature MUST preservar la arquitectura pública static-first: cargar el formulario y
  navegar por el directorio no MUST consultar dinámicamente el repositorio editorial privado por
  comodidad.
- **FR-034**: Cada imagen MUST respetar el máximo individual exacto de 4.000.000 bytes y la suma de
  imagen principal, logo e imágenes de galería MUST ser como máximo 4.000.000 bytes por solicitud.
  El navegador MUST comprobar el total antes del envío y la recepción MUST validarlo de nuevo antes
  de aceptar archivos o crear la solicitud. Un total superior MUST rechazarse íntegramente. La
  interfaz MAY mostrar este límite como 4 MB, pero ninguna implementación o fixture puede tratarlo
  como una unidad binaria superior. La feature MUST mantener un único envío y MUST NOT introducir
  uploads separados, almacenamiento temporal, infraestructura adicional ni dependencias nuevas.
- **FR-035**: La feature MUST almacenar únicamente los campos visibles utilizados por el formulario
  y la metadata interna imprescindible. Campos exclusivamente editoriales del modelo como `orden`,
  `destacado`, usuario social, observaciones de horario u observaciones internas MUST NOT exponerse
  ni exigirse al visitante y conservarán su ausencia o valor interno/default.
- **FR-036**: Las solicitudes repetidas y las que coincidan con un comercio existente MUST aceptarse
  independientemente si son válidas y llegar a moderación. La feature MUST NOT deduplicar, fusionar,
  rechazar por coincidencias de nombre, dirección, email u otros datos, ni modificar el comercio
  existente; la decisión corresponde al editor.
- **FR-037**: La feature MUST poder validarse localmente con casos controlados para CA/ES/EN,
  relaciones, grupos repetibles, límites, imágenes, verificación, uso único, abuso, errores,
  privacidad, moderación y ausencia de mutaciones públicas.
- **FR-038**: Las comprobaciones que dependan de entrega real de email, servicios desplegados,
  secretos reales o un entorno integrado MUST permanecer `DEFERRED — predeployment` hasta disponer
  de ese entorno y MUST NOT presentarse como validación local superada.
- **FR-039**: La feature MUST NOT introducir cuentas ciudadanas, publicación automática, edición
  pública de comercios, conversación, comentarios, nuevas dependencias, nuevos servicios externos,
  Railway, PostgreSQL, Cloudinary ni cambios de despliegue.
- **FR-040**: Fuera de la eliminación obligatoria del email privado al cerrar moderación mediante
  `aprovat` o `rebutjat`, la feature MUST NOT añadir TTL, jobs de anonimización, borrado automático
  de otros datos privados ni una nueva política general de conservación. Definir plazos y eliminación
  adicional de solicitudes cerradas queda fuera de alcance; mientras tanto se aplica minimización
  estricta.

### Scope and Repository Boundaries

- **In scope — `guiapineda-astro`**: ruta EN, paridad del alta guiada, verificación obligatoria,
  envío real mediante la mediación segura existente, estados de error y confirmación, y recepción de
  imágenes dentro de los límites individual y agregado exactos de 4.000.000 bytes.
- **In scope — `guiapineda-strapi`**: contrato privado de solicitud de comercio, validación interna,
  referencias válidas de categoría y subcategoría, cuarentena y revisión privada, ciclo editorial y
  minimización de datos conforme a las decisiones de CLARIFY.
- **Cross-repository contract**: solo datos allowlisted y archivos admitidos pueden atravesar el
  flujo; el receptor privado decide finalmente su validez y devuelve una aceptación inequívoca.
- **Out of scope**: creación o actualización automática de `comercio`, publicación o despublicación,
  traducción automática del contenido, cuentas ciudadanas, edición posterior por el solicitante,
  persistencia de borradores, ampliación de denuncias, rediseño general del directorio, migraciones,
  infraestructura, despliegue, dependencias nuevas y política general de retención o anonimización.

### Key Entities *(include if feature involves data)*

- **Solicitud de comercio**: propuesta privada y moderable con idioma, contenido comercial,
  clasificación, horarios, oferta, referencias de imágenes en cuarentena y contacto privado mínimo.
  No es una ficha pública ni concede derecho de publicación.
- **Clasificación comercial**: categoría vigente y subcategoría compatible, cuando corresponda,
  seleccionadas del catálogo editorial existente.
- **Horario semanal**: siete estados diarios, cada uno cerrado o compuesto por una o dos franjas
  completas, acompañado por las modalidades de atención aplicables.
- **Servicio o especialidad**: elemento repetible y ordenado con nombre obligatorio y descripción
  opcional; representa la oferta principal propuesta por el comercio.
- **Red social**: plataforma permitida y dirección pública asociada; es opcional y repetible sin
  duplicar plataforma.
- **Imagen en cuarentena**: archivo privado asociado a un rol concreto —principal, logo o galería—,
  pendiente de revisión y sin relación automática con Media o comercio público.
- **Contacto privado de solicitud**: nombre y email verificado obligatorios y teléfono opcional,
  usados exclusivamente para verificar el envío y resolver aclaraciones editoriales; nunca forman
  parte automática de la ficha pública.
- **Autorización de envío**: prueba temporal, de propósito específico y un solo uso de que el email
  privado fue verificado; no forma parte de la solicitud conservada.
- **Comercio público**: entidad editorial ya existente y deliberadamente separada de la solicitud;
  esta feature no la crea ni la modifica.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los campos, pasos, mensajes y resultados definidos aparece con comportamiento
  equivalente en CA, ES y EN, y las tres rutas completan el mismo recorrido funcional.
- **SC-002**: En una matriz local con al menos una solicitud válida por idioma, el 100 % crea
  exactamente una solicitud privada en estado `pendent` y el 0 % crea o modifica comercios
  públicos.
- **SC-003**: El 100 % de los casos sin verificación, con autorización inválida/caducada/reutilizada o
  email discordante crea cero solicitudes.
- **SC-004**: El 100 % de los campos y grupos probados en sus límites válidos se acepta, y el 100 % de
  los casos por debajo, por encima, malformados o con relaciones incompatibles se rechaza antes de
  crear una solicitud.
- **SC-005**: El 100 % de las imágenes aceptadas en la matriz queda accesible solo para revisión
  privada, con sus metadatos eliminados; el 0 % aparece en una ruta o entidad pública.
- **SC-006**: El 100 % de los fallos controlados de verificación, recepción, validación y tratamiento
  de imágenes produce un estado comprensible y recuperable, cero éxitos falsos y cero solicitudes o
  imágenes parciales no gestionadas.
- **SC-007**: El 100 % de los cambios manuales entre `pendent`, `en_revisio`, `aprovat` y `rebutjat`
  mantiene inalterados los comercios públicos; ninguna transición ejecuta publicación automática y
  toda llegada a `aprovat` o `rebutjat` deja `email_contacto = null`.
- **SC-008**: Las pruebas locales cubren CA/ES/EN, campos simples, relaciones, los tres grupos
  repetibles, imágenes, privacidad, abuso, uso único, solicitudes repetidas independientes y no
  regresión del directorio.
- **SC-009**: La feature añade cero cuentas ciudadanas, cero servicios externos, cero dependencias y
  cero cambios de infraestructura o despliegue.
- **SC-010**: Toda prueba que dependa de infraestructura real permanece identificada como
  `DEFERRED — predeployment` y no se contabiliza como PASS local.
- **SC-011**: El 100 % de los conjuntos de imágenes probados con suma superior a 4.000.000 bytes se
  rechaza antes del envío y también en recepción; el 100 % de los conjuntos de hasta 4.000.000 bytes
  que cumple las demás reglas supera ambas comprobaciones de tamaño.

## Assumptions

- El formulario actual es la base del producto y se preservan sus seis bloques, revisión visual y
  navegación salvo cambios expresamente necesarios para seguridad, accesibilidad, paridad o envío.
- Una persona presenta el contenido en un solo idioma; la equivalencia CA/ES/EN se refiere al acceso
  y comportamiento del flujo, no a aportar tres traducciones del comercio.
- Categorías y subcategorías activas siguen siendo datos editoriales construidos estáticamente; la
  recepción privada solo comprueba que las referencias enviadas continúan siendo aceptables.
- Los campos de componentes que solo existen en el modelo editorial no amplían el inventario del
  visitante y conservan su ausencia o valores internos/default.
- La verificación, autorización de un solo uso, protección contra abuso, autenticación interna,
  normalización, eliminación de metadatos y cuarentena existentes se reutilizan conceptualmente sin
  rebajar sus garantías.
- La solicitud aceptada queda disponible para revisión humana, pero convertirla en ficha pública es
  trabajo editorial separado y no una fase oculta de esta feature.
- La entrega real de email y el recorrido integrado desplegado no son necesarios para demostrar el
  contrato local; constituyen una puerta de predespliegue explícita.
