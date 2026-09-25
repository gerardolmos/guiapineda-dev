# Feature Specification: Denuncia privada multisección

**Feature Branch**: `none (specification only; Git remains on main)`

**Created**: 2026-09-24

**Status**: Draft — clarified

**Input**: User description: "Extender la denuncia privada y moderada de contenido, actualmente
disponible para Comunicats, a las demás superficies públicas de GUIAPINEDA donde resulte
funcionalmente aplicable, con paridad CA/ES/EN, minimización de datos y sin efectos automáticos."

## Problem and Actors

GUIAPINEDA ya permite denunciar de forma privada un Comunicat publicado, pero otras superficies con
contenido público individual carecen de una acción equivalente. Esto deja a visitantes sin un canal
coherente para advertir al equipo editorial sobre información falsa, fraude, contenido inapropiado o
problemas de privacidad, pese a que esas piezas también son identificables y revisables.

- **Visitante**: consulta contenido público y puede enviar una denuncia privada sin crear una cuenta.
- **Equipo editorial**: recibe, revisa y cierra denuncias privadas sin que el sistema actúe por él.
- **Contenido denunciado**: pieza pública identificable que permanece separada de la denuncia y no
  cambia automáticamente.

## Clarifications

### Session 2026-09-24

- Q: ¿Los cinco motivos actuales de Comunicats serán universales o habrá taxonomías por tipo? → A: Agenda, Veus, Millorem y comercios reutilizan exactamente los cinco motivos de feature 003; el tipo de contenido se identifica por separado.
- Q: ¿Qué regla seguirá el contexto adicional privado en las nuevas superficies? → A: Se ofrece uniformemente con el contrato de feature 003: máximo 1.000 caracteres, opcional para los cuatro primeros motivos y obligatorio/no blanco para «otro»; siempre privado y nunca público.
- Q: ¿La verificación de email de un solo uso será obligatoria en todas las nuevas superficies? → A: Sí; será obligatoria en Agenda, Veus, Millorem y comercios, y el email servirá solo para verificar sin convertirse en dato editorial persistente.

## Surface Classification

| Clasificación | Superficie | Evidencia funcional |
|---|---|---|
| Aplicable confirmada | Agenda | Tiene listados y detalles públicos individuales, referencia editorial estable y rutas equivalentes CA/ES/EN. |
| Aplicable confirmada | Veus | Tiene listados y detalles públicos individuales, referencia editorial estable y rutas equivalentes CA/ES/EN. |
| Aplicable confirmada | Millorem Pineda | Tiene aportaciones públicas individuales, referencia editorial estable y rutas equivalentes CA/ES/EN. |
| Aplicable confirmada | Directorio de comercios | Tiene fichas públicas individuales activas, referencia editorial estable y rutas equivalentes CA/ES/EN. |
| Compatibilidad obligatoria | Comunicats | Ya dispone de denuncia privada completa; la feature la preserva y no la redefine. |
| Posiblemente aplicable pendiente de CLARIFY | Ninguna tras la inspección actual | Toda superficie pública individual encontrada queda clasificada; una superficie futura requerirá nueva inspección. |
| Fuera de alcance por ausencia de detalle individual | Foto del Mes | La home muestra una pieza destacada y la ruta CA/ES/EN existente es un formulario de participación; no existe una página pública individual identificable que denunciar. |

La clasificación se basa en las superficies existentes. La feature MUST NOT inventar rutas, piezas o
tipos de contenido para ampliar artificialmente el alcance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Denunciar contenido público aplicable (Priority: P1)

Como visitante que detecta un problema en un evento, una Veu, una mejora o una ficha de comercio,
quiero iniciar una denuncia privada desde su detalle en el idioma activo, para alertar al equipo
editorial sin publicar un comentario ni provocar una retirada automática.

**Why this priority**: Es el valor público principal y completa la cobertura constitucional en las
superficies que realmente ofrecen contenido individual denunciable.

**Independent Test**: Abrir un detalle publicado de cada tipo confirmado en CA, ES y EN, completar
una denuncia válida y comprobar que solo se muestra confirmación después de que el canal privado la
acepta, mientras el contenido público permanece inalterado.

**Acceptance Scenarios**:

1. **Given** un visitante consulta el detalle público de Agenda, Veus, Millorem o un comercio,
   **When** busca la acción de denuncia, **Then** la encuentra asociada inequívocamente a esa pieza.
2. **Given** el detalle se consulta en CA, ES o EN, **When** se abre y completa la denuncia, **Then**
   la acción, formulario, motivos, ayuda, errores, verificación, confirmación y vuelta usan el idioma
   activo con comportamiento equivalente.
3. **Given** los datos son válidos y la verificación requerida es aceptada, **When** el canal privado
   confirma la recepción, **Then** el visitante ve éxito y el contenido denunciado no cambia.
4. **Given** la denuncia es inválida o no puede recibirse, **When** se intenta enviar, **Then** no se
   muestra éxito y los datos no sensibles permanecen recuperables cuando sea seguro hacerlo.

---

### User Story 2 - Revisar una denuncia multisección (Priority: P1)

Como responsable editorial, quiero que cada denuncia privada identifique con precisión el tipo y la
pieza pública afectada, para revisarla humanamente sin confundir superficies ni exponer al
denunciante.

**Why this priority**: Una denuncia no es útil ni segura si la referencia puede apuntar a otro tipo
de contenido, quedar huérfana o aparecer públicamente.

**Independent Test**: Enviar casos controlados contra cada tipo confirmado y comprobar que la
entrada privada conserva tipo, referencia estable, contexto mínimo, motivo, idioma y estado, y que
una combinación cross-type o manipulada se rechaza.

**Acceptance Scenarios**:

1. **Given** una pieza pública válida, **When** se acepta su denuncia, **Then** el equipo editorial
   puede reconocer su tipo y referencia estable sin depender exclusivamente del slug o título.
2. **Given** una referencia pertenece a un tipo distinto del declarado, **When** se valida, **Then**
   la denuncia se rechaza sin crear una entrada válida.
3. **Given** una denuncia aceptada, **When** se consulta o cambia su estado, **Then** solo personal
   editorial autorizado puede verla y cualquier decisión sobre el contenido sigue siendo separada.
4. **Given** el contenido cambia de slug o datos visibles después de la denuncia, **When** se revisa,
   **Then** la referencia estable y el contexto conservado permiten identificar qué se denunció.
5. **Given** el contenido se elimina después de recibir la denuncia, **When** el equipo la revisa,
   **Then** la denuncia privada no desaparece ni se reasigna a otra pieza.

---

### User Story 3 - Preservar Comunicats y la privacidad existente (Priority: P1)

Como responsable de GUIAPINEDA, quiero ampliar la cobertura sin degradar las denuncias de
Comunicats ni la privacidad del denunciante, para que los datos y workflows existentes continúen
siendo válidos.

**Why this priority**: Feature 003 está publicada y sus garantías son una compatibilidad obligatoria,
no material reemplazable durante esta ampliación.

**Independent Test**: Ejecutar el recorrido existente de un Comunicat y revisar datos previos y
nuevos, comprobando que referencias, estados, acceso privado y ausencia de identidad persistida se
mantienen sin migración destructiva.

**Acceptance Scenarios**:

1. **Given** una denuncia existente de Comunicat, **When** la ampliación entra en vigor, **Then** su
   referencia, motivo, estado y acceso editorial siguen siendo válidos.
2. **Given** un visitante denuncia un Comunicat, **When** completa el flujo existente, **Then** la
   experiencia y garantías de feature 003 no empeoran.
3. **Given** se coordinan cambios públicos y editoriales, **When** se adopte una solución posterior,
   **Then** no se exige una migración destructiva de denuncias existentes sin necesidad demostrada,
   salvaguardas y aprobación explícita.
4. **Given** se verifica un email para denunciar, **When** la denuncia se persiste, **Then** email,
   token, IP, user-agent e identidad del denunciante no se convierten en datos editoriales.

---

### User Story 4 - Rechazar abuso y fallos sin efectos automáticos (Priority: P1)

Como visitante y como equipo editorial, quiero que referencias manipuladas, verificaciones inválidas
y fallos operativos se traten de forma segura, para evitar falsos positivos, filtraciones o cambios
automáticos sobre contenido público.

**Why this priority**: La ampliación multiplica las referencias posibles y debe mantener el límite
entre aviso privado y decisión editorial humana.

**Independent Test**: Probar referencias inexistentes, cross-type, contenido no público, motivo y
campos inválidos, token incorrecto/reutilizado/para otro propósito, rate limit y canal no disponible;
ningún caso rechazado crea una denuncia válida ni modifica contenido.

**Acceptance Scenarios**:

1. **Given** una referencia inexistente, manipulada, cross-type o no pública, **When** se envía,
   **Then** se rechaza sin crear denuncia ni confirmar recepción.
2. **Given** un token incorrecto, consumido o emitido para otro propósito, **When** se intenta usar,
   **Then** no autoriza la denuncia ni otro efecto.
3. **Given** se supera un límite de solicitudes, **When** se intenta enviar otra denuncia, **Then**
   se limita de forma comprensible sin crear perfiles ni persistir identificadores personales.
4. **Given** el canal privado no está disponible, **When** falla el envío, **Then** se muestra un
   estado recuperable en el idioma activo y el contenido público permanece intacto.
5. **Given** existen varias denuncias sobre la misma pieza, **When** se reciben o revisan, **Then**
   ninguna cantidad produce retirada, penalización, bloqueo, scoring o pérdida de visibilidad.

### Edge Cases

- El identificador existe, pero pertenece a otro tipo de contenido o el tipo declarado fue alterado.
- El identificador era válido al construir la página, pero la pieza ya no es pública al enviar.
- El slug cambia entre la construcción de la página y el envío sin que cambie la identidad editorial.
- La pieza cambia después de recibir la denuncia o se elimina antes de que sea revisada.
- El motivo no pertenece al conjunto controlado o el contexto adicional está vacío, malformado,
  excede el límite acordado o contiene contenido que debe tratarse como texto no confiable.
- Faltan campos, llegan duplicados o se aportan campos, archivos o datos personales no autorizados.
- El código o token de verificación es incorrecto, ha caducado, ya fue consumido, corresponde a otro
  email o fue emitido para otro propósito participativo.
- El backend editorial falla después de una verificación potencialmente consumida.
- Se reciben múltiples denuncias iguales o distintas sobre una misma pieza en poco tiempo.
- Una misma persona denuncia más de una vez o distintas personas denuncian la misma pieza: cada
  envío válido puede conservarse de forma independiente, sin deduplicación automática ni perfilado.
- Falta copy en uno de los tres idiomas o una ruta existe pero no ofrece el recorrido completo.
- Una denuncia antigua de Comunicat se consulta después de cualquier generalización futura.
- Una persona no autorizada intenta leer denuncias o inferir la identidad de quien denunció.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada detalle público de Agenda, Veus, Millorem Pineda y comercio MUST ofrecer una
  acción de denuncia privada inequívocamente asociada a la pieza mostrada.
- **FR-002**: Comunicats MUST conservar la acción y el recorrido de denuncia existentes sin regresión
  funcional, lingüística, de privacidad, referencia o moderación.
- **FR-003**: Foto del Mes MUST permanecer fuera de alcance mientras no exista una superficie pública
  individual identificable; la pieza de home y el formulario de participación no se tratarán como
  detalles denunciables.
- **FR-004**: La capacidad MUST limitarse a detalles públicos individuales existentes y MUST NOT
  añadir acciones a listados, formularios de participación ni superficies inventadas.
- **FR-005**: La acción, formulario, motivos, ayudas, errores, verificación, confirmación, estados de
  envío y navegación de vuelta MUST tener paridad funcional y copy completo en CA, ES y EN.
- **FR-006**: Cada denuncia MUST declarar el tipo de contenido y una referencia editorial estable;
  slug, título y URL pueden servir como contexto, pero MUST NOT ser la única identidad.
- **FR-007**: La referencia estable MUST conservar su significado aunque cambien el slug, título o
  datos visibles, cuando el modelo editorial de la superficie lo permita.
- **FR-008**: Agenda, Veus, Millorem Pineda y comercios MUST reutilizar exactamente los cinco motivos
  controlados de Comunicats, sin añadir motivos específicos por tipo; el tipo de contenido MUST
  identificarse y conservarse por separado del motivo.

  | Valor | CA | ES | EN |
  |---|---|---|---|
  | `informacion_falsa` | Informació falsa o enganyosa | Información falsa o engañosa | False or misleading information |
  | `spam_fraude` | Contingut brossa o frau | Spam o fraude | Spam or fraud |
  | `contenido_inapropiado_ilegal` | Contingut inadequat o possiblement il·legal | Contenido inapropiado o posiblemente ilegal | Inappropriate or potentially illegal content |
  | `privacidad_datos` | Privacitat o dades personals | Privacidad o datos personales | Privacy or personal data |
  | `otro` | Un altre motiu | Otro | Other |
- **FR-009**: Agenda, Veus, Millorem Pineda y comercios MUST ofrecer uniformemente un contexto
  adicional privado de hasta 1.000 caracteres, opcional para los cuatro primeros motivos y
  obligatorio y no compuesto solo por espacios cuando el motivo sea `otro`; MUST tratarse como
  texto no confiable y MUST NOT mostrarse públicamente.
- **FR-010**: Toda denuncia de Agenda, Veus, Millorem Pineda y comercios MUST exigir verificación de
  email vinculada al email y al propósito de denuncia, con autorización temporal de un solo uso.
- **FR-011**: El email y cualquier código, token o dato temporal MUST utilizarse exclusivamente para
  verificar y autorizar el envío y MUST NOT persistirse ni transferirse como parte editorial de la
  denuncia.
- **FR-012**: La denuncia MUST NOT guardar IP, user-agent, huella de dispositivo, cuenta, perfil,
  historial ciudadano, identidad derivada ni identificador correlacionable del denunciante.
- **FR-013**: La denuncia MUST permanecer privada y MUST NOT revelar la identidad del denunciante al
  contenido denunciado, a su autor, comercio u otras personas públicas.
- **FR-014**: Antes de aceptar, el sistema MUST comprobar conjuntamente tipo, referencia estable y
  condición pública de la pieza denunciada.
- **FR-015**: Una referencia válida de un tipo MUST NOT poder utilizarse para crear una denuncia
  declarada como otro tipo; todo caso cross-type MUST rechazarse.
- **FR-016**: Referencias inexistentes, manipuladas, incoherentes o correspondientes a contenido no
  público MUST rechazarse sin crear denuncia ni modificar contenido.
- **FR-017**: La autorización temporal MUST estar vinculada al email y al propósito de denuncia,
  MUST rechazarse si pertenece a otro scope y MUST NOT autorizar un segundo envío ni otro flujo
  participativo después de consumirse.
- **FR-018**: El motivo MUST pertenecer al conjunto controlado acordado; valores desconocidos o
  manipulados MUST rechazarse.
- **FR-019**: Campos ausentes, duplicados, inesperados, malformados, excesivos o archivos no
  autorizados MUST rechazarse en los límites de confianza pertinentes.
- **FR-020**: La prevención básica de abuso MUST limitar automatización evidente y solicitudes
  excesivas sin crear cuentas, perfiles ni almacenamiento nuevo de identificadores personales.
- **FR-021**: Si el canal privado o sistema editorial no está disponible, el flujo MUST NOT mostrar
  éxito, afirmar que la denuncia fue recibida, crear una denuncia aceptada parcialmente ni modificar
  el contenido; si la autorización pudo consumirse, el reintento MUST requerir una nueva verificación.
- **FR-022**: Los fallos MUST mostrar mensajes seguros y comprensibles en el idioma activo y conservar
  los datos no sensibles que permitan una recuperación segura.
- **FR-023**: Una denuncia aceptada MUST crear únicamente una entrada privada para revisión humana,
  identificada por tipo y pieza, con estado inicial pendiente.
- **FR-024**: Las denuncias de las nuevas superficies MUST comenzar en `pendiente` y admitir
  únicamente revisión humana mediante los estados `pendiente`, `revisada` y `cerrada`; Comunicats
  MUST conservar esos estados y las transiciones válidas de sus datos ya creados.
- **FR-025**: Crear, repetir, revisar o cerrar una denuncia MUST NOT editar, ocultar, despublicar,
  borrar, penalizar, bloquear ni cambiar automáticamente visibilidad o ranking del contenido.
- **FR-026**: Una misma persona MUST poder denunciar más de una vez y distintas personas MUST poder
  denunciar la misma pieza; cada envío válido MUST conservarse de forma independiente, sin
  deduplicación automática, perfilado, umbrales ni acciones editoriales provocadas por la cantidad.
- **FR-027**: Si el contenido cambia tras la recepción, la denuncia MUST mantener la referencia
  estable y el contexto mínimo necesario para que el equipo comprenda qué pieza fue denunciada.
- **FR-028**: Si el contenido se elimina después de la recepción, la denuncia privada existente MUST
  seguir disponible para revisión y MUST NOT reasignarse a otra pieza.
- **FR-029**: Solo personal editorial autorizado MUST poder consultar, revisar o cerrar denuncias.
- **FR-030**: La lectura normal de cualquier detalle MUST permanecer static-first y MUST NOT iniciar
  acceso dinámico al sistema editorial; solo una acción explícita de denuncia puede iniciar el flujo
  privado.
- **FR-031**: La feature MUST NOT exigir cuentas ciudadanas, perfiles, login permanente ni historial
  público o privado de denuncias por persona.
- **FR-032**: La feature MUST utilizar las capacidades aprobadas del producto sin infraestructura,
  servicios externos, dependencias o almacenamiento nuevo.
- **FR-033**: Comunicats MUST seguir utilizando su denuncia actual, y sus denuncias existentes MUST
  conservar referencias válidas, privacidad, acceso, estados y workflow después de cualquier
  ampliación, sin exigir una migración en esta fase.
- **FR-034**: Cualquier evolución de la estructura editorial MUST mantener compatibilidad con datos
  existentes y MUST NOT exigir una migración destructiva sin necesidad demostrada, copia verificable,
  validación y aprobación humana.
- **FR-035**: Ninguna denuncia MUST exponerse mediante páginas, búsquedas, listados o interfaces
  públicas.
- **FR-036**: La feature MUST NOT introducir scoring, reputación, priorización automática, IA de
  decisión, auto-takedown, shadow banning ni notificación automática al autor.
- **FR-037**: El contrato entre experiencia pública y moderación privada MUST definir y validar tipo,
  referencia estable, contexto mínimo, motivo, idioma y estado, excluyendo datos de verificación e
  identidad del denunciante.
- **FR-038**: La validación MUST demostrar localmente alcance, paridad CA/ES/EN, privacidad,
  referencias, errores, compatibilidad y ausencia de efectos automáticos; las comprobaciones que
  dependan de un entorno desplegado MUST quedar `DEFERRED — predeployment`.
- **FR-039**: La feature MUST NOT añadir comentarios, respuestas públicas, conversación denunciante-
  autor, cuentas, perfiles, reputación, panel ciudadano, apelaciones, notificaciones al autor,
  adjuntos, infraestructura, despliegue, E2E remoto o una nueva arquitectura pública dinámica.

### Scope and Boundaries

- **In scope**: denuncia privada de detalles publicados de Agenda, Veus, Millorem Pineda y comercios;
  paridad CA/ES/EN; identificación tipo + referencia estable; moderación humana; compatibilidad de
  Comunicats; errores, abuso básico y regresión pública.
- **Compatibility scope**: las denuncias existentes y futuras de Comunicats continúan funcionando y
  no pierden datos, privacidad, estados ni workflow.
- **Out of scope by current product shape**: Foto del Mes, porque no existe detalle público individual.
- **Out of scope by product decision**: comentarios, conversaciones, cuentas, perfiles, reputación,
  scoring, auto-takedown, shadow banning, bloqueos, denuncias públicas, panel ciudadano, apelaciones,
  notificaciones al autor e IA decisoria.
- **Operationally out of scope**: Railway, PostgreSQL, Cloudinary, servicios desplegados de email o
  rate limit, despliegue, E2E remoto, SSR nuevo y cualquier infraestructura nueva.

### Privacy and Moderation Invariants

- La denuncia es un aviso privado, no una publicación ni una conversación.
- La identidad del denunciante no forma parte del registro editorial.
- El equipo editorial decide de forma humana y separada cualquier actuación sobre el contenido.
- No existe una relación cuantitativa automática entre número de denuncias y acción editorial.
- Los datos se minimizan al tipo, referencia, contexto público mínimo, motivo, contexto autorizado,
  idioma, estado y marcas editoriales imprescindibles.

### Key Entities

- **Contenido público denunciable**: pieza publicada de Agenda, Veus, Millorem Pineda, comercio o
  Comunicat, con tipo, referencia editorial estable y contexto público reconocible.
- **Denuncia privada**: aviso vinculado a un único tipo y pieza, con motivo controlado, contexto
  autorizado, idioma, estado y metadatos editoriales mínimos; no contiene identidad del denunciante.
- **Autorización temporal de envío**: prueba limitada al propósito que habilita como máximo el envío
  permitido y no se convierte en dato editorial.
- **Decisión editorial**: revisión humana y privada de la denuncia, separada de cualquier actuación
  sobre el contenido público.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los detalles de prueba de Agenda, Veus, Millorem y comercios en CA, ES y EN
  muestra una acción de denuncia inequívoca con recorrido completo en el idioma activo.
- **SC-002**: El 100 % de las denuncias válidas probadas conserva el tipo y la referencia estable de
  la pieza correcta y crea únicamente una entrada privada pendiente de revisión humana.
- **SC-003**: El 100 % de referencias inexistentes, manipuladas, cross-type o no públicas probadas se
  rechaza sin crear una denuncia válida ni modificar contenido.
- **SC-004**: El 100 % de tokens incorrectos, reutilizados o emitidos para otro propósito probados se
  rechaza antes de aceptar una denuncia.
- **SC-005**: El 0 % de las denuncias probadas persiste o expone email, IP, user-agent, perfil,
  historial o identidad directa o derivada del denunciante.
- **SC-006**: El 0 % de los escenarios válidos, repetidos o fallidos modifica, oculta, retira,
  penaliza, bloquea o altera automáticamente el ranking del contenido denunciado.
- **SC-007**: El 100 % de los fallos controlados muestra un estado comprensible en CA, ES o EN y el
  0 % presenta una confirmación de recepción falsa.
- **SC-008**: El 100 % de las regresiones seleccionadas de Comunicats conserva referencias, flujo,
  privacidad, estados y acceso editorial existentes, sin pérdida de datos.
- **SC-009**: Foto del Mes y cualquier superficie sin detalle público individual reciben cero nuevas
  acciones o rutas de denuncia.
- **SC-010**: La feature añade cero cuentas, comentarios, efectos automáticos, dependencias,
  servicios externos, infraestructura o acceso editorial dinámico durante la lectura pública.

## Assumptions

- Los detalles confirmados reciben documentos editoriales que incluyen una referencia estable,
  aunque la representación técnica se decidirá en PLAN.
- Las rutas CA/ES/EN actuales comparten la misma pieza editorial en varias superficies; la paridad
  exigida se refiere al recorrido y copy, no presupone contenido editorial traducido.
- La inspección actual no encontró una superficie pública individual de Foto del Mes.
- El equipo editorial seguirá resolviendo manualmente las denuncias y cualquier actuación sobre la
  publicación será una decisión separada.
- La estructura técnica futura —reutilizar, generalizar o separar mecanismos— no se decide en esta
  SPEC; PLAN deberá evaluarla sin presuponer una generalización o un mecanismo separado y deberá
  preservar feature 003 y los datos existentes.
- No existe todavía un entorno desplegado integrado apto para afirmar E2E remoto.
