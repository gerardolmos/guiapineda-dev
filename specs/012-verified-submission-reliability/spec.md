# Feature Specification: Verified Submission Reliability

**Feature Branch**: `main`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Resolver F01 y F03 conjuntamente: recuperar envíos con autorización de email consumida o incierta sin perder datos ni reenviar automáticamente, y aceptar como éxito interno únicamente HTTP 201 con un objeto JSON válido cuyo campo ok sea true. Fase SPECIFY exclusivamente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar un envío sin repetir el formulario (Priority: P1)

Como participante de Agenda, Comunicats, Veus, Millorem o Foto del Mes, quiero poder verificar
de nuevo mi email cuando la autorización anterior ya no sirve, conservando mi aportación y
decidiendo personalmente si vuelvo a enviarla.

**Why this priority**: F01 bloquea el recorrido principal con reintentos que reutilizan una
autorización consumida. La recuperación no debe imponer una recarga ni pérdida de trabajo.

**Independent Test**: En cada uno de los cinco formularios, simular un fallo posterior al consumo,
comprobar conservación íntegra de los datos, obtener una nueva autorización y completar un envío
expresamente solicitado por la persona.

**Acceptance Scenarios**:

1. **Given** una autorización válida y datos introducidos, **When** el envío falla después de
   consumirla, **Then** desaparece el estado de email verificado, la autorización anterior no
   puede reutilizarse y se ofrece solicitar/verificar un nuevo código sin recargar.
2. **Given** un token ausente, inválido o no aceptado, **When** se rechaza la autorización,
   **Then** se reinicia el estado de verificación, se conservan los datos y se exige verificar
   de nuevo antes de otro envío.
3. **Given** un envío fallido y una nueva verificación correcta, **When** no hay una nueva acción
   explícita de envío, **Then** no se reenvía la aportación; verificar no equivale a enviar.
4. **Given** email, textos, selecciones, imágenes, consentimiento y draft previos al fallo,
   **When** se recupera la autorización con la página viva, **Then** todos esos valores permanecen
   intactos y solo se limpia el estado de autorización/verificación que corresponda.
5. **Given** una nueva autorización válida, **When** la persona reenvía y se confirma aceptación,
   **Then** llega al éxito existente de su idioma y el draft se limpia conforme al flujo actual.

---

### User Story 2 - Corregir datos sin verificar innecesariamente (Priority: P1)

Como participante, quiero corregir un archivo o campo rechazado antes de consumir mi autorización
sin tener que solicitar otro código mientras la autorización siga siendo válida.

**Why this priority**: Una recuperación indiscriminada resolvería el bloqueo a costa de invalidar
autorizaciones utilizables y aumentar la fricción y las solicitudes de códigos.

**Independent Test**: Provocar rechazos locales y rechazos demostrablemente anteriores al consumo;
corregir el dato y enviar con la misma autorización todavía válida.

**Acceptance Scenarios**:

1. **Given** un email verificado, **When** falla una validación local sin iniciar el envío,
   **Then** ese fallo no invalida automáticamente la autorización ni borra datos.
2. **Given** un rechazo de request, archivo o datos demostrado anterior al consumo, **When** la
   autorización sigue siendo válida, **Then** se conserva y permite corregir y volver a enviar.
3. **Given** un error cuyo origen no demuestra que el consumo quedó descartado, **When** se
   procesa el resultado, **Then** no se presume que la autorización siga siendo reutilizable.
4. **Given** un rechazo previo al consumo seguido de expiración o cambio de email, **When** se
   intenta continuar, **Then** se exige verificación válida conforme a las reglas existentes.

---

### User Story 3 - Entender un resultado incierto y decidir (Priority: P1)

Como participante, quiero saber cuándo no se puede confirmar si llegó mi solicitud, para decidir
si vuelvo a enviarla sin que el sistema duplique mi aportación por iniciativa propia.

**Why this priority**: Un error de comunicación puede ocurrir después de guardar la solicitud.
Confundir ausencia de confirmación con ausencia de persistencia induce decisiones incorrectas.

**Independent Test**: Simular pérdida de respuesta tanto antes como después de una aceptación
simulada; en ambos casos comprobar incertidumbre explícita y ausencia de reenvío automático.

**Acceptance Scenarios**:

1. **Given** un intento iniciado, **When** hay timeout, error de red, interrupción de conexión o
   respuesta que no permite confirmar el resultado, **Then** no se muestra éxito ni se afirma
   que la solicitud no fue guardada.
2. **Given** ese resultado ambiguo y consumo no descartable, **When** se ofrece recuperación,
   **Then** se invalida la autorización anterior, se conservan datos y se permite verificar de nuevo.
3. **Given** una solicitud que pudo haberse guardado, **When** la persona obtiene otra autorización,
   **Then** solo una nueva decisión explícita puede iniciar otro envío; no se promete deduplicación.

---

### User Story 4 - Recibir éxito únicamente ante aceptación confirmada (Priority: P1)

Como persona que envía una solicitud o denuncia, quiero que la confirmación corresponda al
contrato real del receptor, no simplemente a una respuesta aparentemente exitosa.

**Why this priority**: F03 puede convertir respuestas inesperadas en una confirmación falsa;
afecta a las seis solicitudes y las dos denuncias que comparten esta frontera.

**Independent Test**: Sustituir la respuesta interna por cada caso de la matriz de aceptación
indicada en Requirements, sin servicios reales, y comprobar el resultado público.

**Acceptance Scenarios**:

1. **Given** una respuesta HTTP 201 con objeto JSON válido y `ok === true`, **When** se recibe
   completamente, **Then** se acepta la confirmación y continúa el éxito existente.
2. **Given** cualquier otro status o cuerpo de la matriz negativa, **When** llega la respuesta,
   **Then** no se transforma en éxito público ni se navega a una página de éxito.
3. **Given** una respuesta interna inválida tras consumir autorización de un formulario F01,
   **When** se presenta el error, **Then** se aplica la recuperación de las historias 1 y 3.
4. **Given** Comercio o cualquiera de las dos denuncias, **When** se rechaza la respuesta interna,
   **Then** permanece operativo su tratamiento actual de errores y privacidad, sin adoptar
   indiscriminadamente la política de conservación específica de los cinco formularios F01.

### Edge Cases

- Un rechazo de autorización puede tener el mismo status que una validación de datos: el status
  aislado no prueba que el token no se haya consumido.
- El servicio de verificación puede fallar sin permitir saber si llegó a consumir la autorización.
- El receptor puede guardar una solicitud y perderse después su respuesta.
- La respuesta puede empezar correctamente y fallar durante la lectura del cuerpo.
- `null`, arrays, strings, números y booleanos son JSON válidos pero no objetos de confirmación.
- `ok: "true"`, `ok: 1`, `ok: false` y ausencia de `ok` no son confirmación positiva.
- Una segunda pulsación o una verificación posterior al fallo no deben reutilizar la autorización
  anterior ni desencadenar un reenvío automático.
- Se preservan imágenes mientras la página viva; no se promete conservar archivos tras recarga,
  cierre o navegación. Foto del Mes sigue sin draft persistente.
- Fallos sucesivos deben permitir repetir el ciclo de nueva verificación sin perder contenido,
  respetando límites y expiraciones existentes.
- Recuperar autorización no implica aceptación editorial ni publicación de contenido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los cinco formularios F01 MUST aplicar el mismo comportamiento de recuperación en
  CA, ES y EN; el resultado MUST depender de la fase/certeza del fallo, no de la sección.
- **FR-002**: Un rechazo demostrado previo al consumo MUST conservar una autorización todavía
  válida y permitir corregir datos. La validación local fallida MUST NOT provocar un envío.
- **FR-003**: Una autorización ausente, inválida o no aceptada MUST invalidar el estado cliente
  correspondiente y exigir una nueva verificación antes de enviar.
- **FR-004**: Un fallo conocido posterior al consumo MUST tratar la autorización anterior como
  inutilizable e invalidar token disponible, estado verificado, challenge/código residual y
  expiración asociados. MUST ofrecer nueva verificación sin exigir recarga o edición del email.
- **FR-005**: Un resultado ambiguo cuyo consumo no puede descartarse MUST invalidar la autorización
  anterior. MUST NOT mostrar éxito ni asegurar que la solicitud no se guardó.
- **FR-006**: La recuperación F01 MUST conservar email, textos, selecciones, imágenes seleccionadas
  mientras viva la página, consentimiento, draft y demás contenido funcional. MUST NOT resetear
  el formulario completo ni limpiar el draft a causa de un fallo.
- **FR-007**: Solicitar/verificar un nuevo código MUST NOT reenviar una submission. Todo nuevo
  intento MUST requerir una acción explícita y autorización válida; MUST NOT reutilizar la anterior.
- **FR-008**: El feedback MUST diferenciar corrección de datos, necesidad de reverificación y
  ausencia de confirmación cuando proceda, con significado equivalente en CA/ES/EN. MUST NOT
  ofrecer instrucciones que impliquen reintentar con autorización inutilizable.
- **FR-009**: La aceptación interna MUST exigir simultáneamente HTTP 201, cuerpo completamente
  leído como JSON válido, objeto no nulo y no array, y propiedad `ok` con valor booleano `true`.
- **FR-010**: Toda respuesta que incumpla FR-009 MUST ser error para la frontera interna y MUST NOT
  convertirse en confirmación pública. Incluye 200, 202, 204, otros status, cuerpos vacíos/HTML,
  JSON malformado, valores no objeto, ausencia de `ok:true`, lectura interrumpida, timeout y red.
- **FR-011**: El contrato MUST NOT añadir ni exigir documentId, receipt u otros campos nuevos.
  La presencia de propiedades adicionales MUST NOT sustituir ni relajar las condiciones de FR-009;
  no se exige igualdad textual del JSON ni un orden de propiedades.
- **FR-012**: La comprobación de confirmación MUST abarcar recepción y lectura completa del cuerpo
  y finalizar con error al agotarse el límite temporal aplicable, sin espera indefinida.
- **FR-013**: FR-009 a FR-012 MUST cubrir Agenda, Comunicats, Veus, Millorem, Foto del Mes, Comercio,
  denuncia de comunicat y denuncia multisección. Moderación no forma parte de esta frontera.
- **FR-014**: La recuperación y el endurecimiento MUST preservar consumo de un uso, asociación
  email/scope, caducidad, límites, autenticación interna, privacidad y tratamiento de imágenes.
  MUST NOT restaurar un token consumido ni debilitar controles para facilitar un reintento.
- **FR-015**: Comercio y denuncias MUST conservar sus políticas de recuperación y minimización
  actuales; cualquier cambio compartido MUST comprobar su ausencia de regresión. En particular,
  la denuncia multisección puede seguir limpiando email según su política existente.
- **FR-016**: Un éxito confirmado MUST mantener la navegación/confirmación y limpieza de drafts
  actuales de cada flujo e idioma. La recuperación MUST NOT crear éxito por sí misma.
- **FR-017**: La feature MUST NOT ampliar drafts ni cambiar rutas, schemas, moderación,
  infraestructura, publicación o contratos de entrada. No incluye idempotencia, deduplicación,
  reenvíos automáticos ni refactorización general de formularios.

### Matriz de aceptación del resultado

| Resultado | Autorización de los cinco F01 | Datos | Confirmación / siguiente acción |
|---|---|---|---|
| Rechazo demostrado previo al consumo | Conservar si sigue válida | Conservar | Corregir y enviar explícitamente |
| Token ausente, inválido o no aceptado | Invalidar estado cliente | Conservar | Nueva verificación |
| Fallo posterior al consumo | Invalidar | Conservar | Nueva verificación; reenvío solo por decisión explícita |
| Resultado ambiguo, consumo no descartable | Invalidar | Conservar | Informar incertidumbre; nueva verificación y decisión |
| Aceptación interna válida | No reutilizar autorización consumida | Comportamiento de éxito existente | Confirmación y navegación actuales |

| Respuesta interna | Aceptación |
|---|---|
| 201 + objeto JSON + `ok === true` | Sí, tras leer el cuerpo completo |
| 200, 202, 204 o cualquier status distinto de 201, incluso con `ok:true` | No |
| 201 + vacío, HTML o JSON malformado | No |
| 201 + null, array, string, número o booleano | No |
| 201 + objeto sin `ok` o con `ok` distinto de booleano true | No |
| 4xx / 5xx | No |
| Red, timeout o lectura interrumpida | No; persistencia no necesariamente descartada |

### Key Entities

- **Autorización de envío**: permiso temporal de un uso, asociado a email y finalidad; puede ser
  válido, inutilizable o de consumo incierto. No se incorpora a almacenamiento de drafts.
- **Intento de submission**: acción explícita con datos y autorización; su resultado puede ser
  rechazo previo, rechazo de autorización, fallo posterior, incertidumbre o aceptación confirmada.
- **Datos de la aportación**: contenido, email, selecciones, archivos y consentimiento que la
  persona ya introdujo; su conservación se distingue de la validez de la autorización.
- **Confirmación interna**: respuesta existente del receptor que satisface FR-009; no es un recibo
  nuevo, una garantía de unicidad ni una aprobación editorial.

### Repositories, Layers and Scope

- Repositorio afectado: **guiapineda-astro**, capas de recuperación cliente y transporte interno
  de Netlify hacia Strapi. Esta SPEC define resultados; no elige mecanismos, archivos o APIs nuevos.
- **guiapineda-strapi** es fuente de contrato y superficie de regresión, sin modificaciones.
  Contrato vigente: éxito `201 {ok:true}`; error no exitoso con `{ok:false, reason:...}` cuando aplica.
- F01 cubre cinco solicitudes; F03 cubre seis solicitudes y dos denuncias. Un fallo revelado por
  F03 después de consumo entra en la recuperación F01 cuando afecta a uno de sus cinco formularios.
- Fuera de alcance: código productivo en esta fase, PLAN/TASKS, tests ejecutables, dependencias,
  SQLite, migraciones, configuración operativa, cambios backend o publicación automática.

### Constitutional Compliance

- **I–II**: se preservan identidad editorial y navegación pública estática.
- **III**: se mantienen verificación, autorización de un uso, límites, cuarentena y moderación;
  recuperar la capacidad de verificar no restaura permisos consumidos ni publica aportaciones.
- **IV**: sin acceso a SQLite ni cambios de datos, schemas o infraestructura. No se presume estado
  de servicios desplegados a partir de esta especificación.
- **V**: alcance limitado a F01/F03, sin dependencias, servicios o refactorizaciones oportunistas.
- **VI**: comportamiento y feedback equivalentes CA/ES/EN; conservación de políticas existentes.
- **VII**: repositorios y contrato identificados; Strapi permanece sin cambios.
- No se solicita excepción ni modificación de la Constitution 1.0.0. Las fases posteriores deberán
  comprobar explícitamente seguridad y regresiones del código compartido antes de cerrar implementación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los cinco formularios y tres idiomas, el 100% de los escenarios de autorización
  inutilizable permiten verificar de nuevo sin recargar ni editar el email para desbloquearse.
- **SC-002**: En el 100% de los escenarios de recuperación con página viva se conservan los valores
  previos de contenido, email, selecciones, archivos, consentimiento y draft aplicable.
- **SC-003**: Cero escenarios de rechazo demostrado previo al consumo invalidan por ese motivo una
  autorización todavía válida; la persona puede corregir y continuar.
- **SC-004**: Cero escenarios negativos de la matriz interna producen confirmación pública en los
  ocho flujos. Todos los escenarios positivos mantienen su confirmación y navegación existentes.
- **SC-005**: Cero escenarios ambiguos afirman que la solicitud no se guardó; cero recuperaciones
  o verificaciones posteriores generan envíos sin una nueva decisión explícita.
- **SC-006**: El recorrido fallo → nueva verificación → envío explícito → aceptación se completa
  en las 15 combinaciones de formulario F01 e idioma, sin pérdida de contenido por la recuperación.
- **SC-007**: Las comprobaciones de regresión de Comercio y las dos denuncias mantienen sus
  políticas existentes de datos y recuperación en los tres idiomas.

## Assumptions

- Baseline observado antes de SPECIFY: frontend `4355ee1c7c8207304bc5af3025ea994141e78990` y backend
  `47ca26a0a54fd1c0193afd659b6ba3657b264793`; ambos en main, limpios y 0/0 frente a origin/main local.
- La inspección PRE-FEATURE confirma que existen recuperación de verificación y transporte comunes;
  su reutilización es viable, pero esta SPEC no prescribe cómo conectarlos.
- La conservación de archivos corresponde a la página viva. No se extiende la persistencia entre
  navegaciones ni se añade draft a Foto del Mes.
- Una autorización previamente válida puede caducar o invalidarse por las reglas existentes.
  Conservarla ante un rechazo previo no prolonga su validez.
- Una respuesta desconocida no constituye prueba de rechazo previo al consumo. Ante incertidumbre
  se aplica FR-005; tampoco se presume ausencia de persistencia por falta de confirmación.
- El contrato de éxito exige status, forma y valor, no ausencia de propiedades adicionales ni
  igualdad de bytes. No se añade ningún campo al backend.
- El límite temporal existente del intento interno es la referencia para impedir espera indefinida;
  no se introduce un SLA de infraestructura en esta feature.
- Las pruebas futuras usarán fronteras simuladas para errores y contratos; esta fase no ejecuta
  servicios reales ni crea pruebas. Los resultados medibles son criterios futuros, no resultados obtenidos.
- El adjunto termina en «No modificar Strapi para esta». Se conserva la restricción ya explícita
  en el alcance aprobado y no se infieren instrucciones adicionales ausentes.
