# Feature Specification: Endurecimiento de Content API para solicitudes privadas de Agenda y Veus

**Feature Branch**: `008-private-submission-content-api-hardening`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Garantizar que las solicitudes privadas de Agenda y Veus no puedan quedar accesibles indebidamente a través de Content API pública por permisos o exposición accidental, preservando el canal interno autenticado, la moderación humana y los datos existentes."

## Context and Classification

Agenda y Veus conservan una superficie Content API estándar para sus solicitudes privadas. Su
privacidad depende actualmente, en parte, de permisos administrados fuera del código, mientras
otros flujos privados equivalentes utilizan únicamente canales internos autenticados y moderación
administrativa.

No se ha demostrado una filtración activa ni un acceso indebido real. Esta feature se clasifica
como **hardening de seguridad y reducción preventiva de superficie de exposición**, no como
respuesta a un incidente confirmado.

## Clarifications

### Session 2026-09-25

- Q: ¿Deben retirarse completamente las rutas Content API estándar de `solicitud-agenda` y
  `solicitud-veu`, manteniendo intactos el canal interno autenticado y Content Manager? → A: Sí;
  deben retirarse completamente. El contrato HTTP natural observado queda precisado en la sesión
  del 2026-09-26: `GET` recibe `404`; `POST`, `PUT` y `DELETE` reciben `405` sin efectos persistentes.

### Session 2026-09-26

- Q: ¿La prohibición de abrir o modificar SQLite comprende también la base temporal aislada que
  necesita el runtime QA programático aprobado? → A: No; se aplica exclusivamente a la SQLite
  real/baseline del proyecto, que durante IMPLEMENT solo puede inspeccionarse a nivel de filesystem
  mediante SHA-256, tamaño, mtime y presencia de sidecars, sin abrirla con SQLite. QA puede crear
  una SQLite temporal dentro del entorno descartable de la ejecución únicamente para inicializar
  la instancia Strapi aislada, siempre que no reutilice `.tmp/data.db`, no contenga ni se copie de
  datos reales, no persista después del harness y se elimine en `finally`; esto no constituye una
  migración ni una modificación de datos reales.
- Q: ¿Sigue pendiente verificar si Content Manager y los canales privados legítimos dependen de los
  routers Content API estándar antes de cerrar la estrategia? → A: No; está confirmado que Content
  Manager, el canal interno autenticado, la moderación y cron/helpers/services no dependen de esos
  routers, y no existe ningún consumidor legítimo. La decisión humana Option A permanece cerrada:
  retirar completamente la Content API estándar de `solicitud-agenda` y `solicitud-veu`, sin
  introducir ninguna superficie sustitutiva.
- Q: ¿Debe añadirse una normalización para que todos los métodos sobre las rutas retiradas respondan
  `404`? → A: No. Se adopta Option A y la semántica natural de Strapi: `GET` de colección o elemento
  responde `404`; `POST` de colección y `PUT`/`DELETE` de elemento responden `405` con
  `Allow: HEAD, GET` y cero escrituras, modificaciones o eliminaciones. El mismo `405` aparece en
  métodos mutadores sobre una ruta control completamente inexistente, por lo que no indica que la
  antigua Content API siga registrada. No se añadirá middleware, política runtime, alias,
  interceptor de producción ni cambio de configuración para alterar esa respuesta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mantener privadas las solicitudes de Agenda y Veus (Priority: P1)

Como persona que envía una propuesta privada de Agenda o una aportación privada de Veus, quiero que
su contenido permanezca inaccesible desde superficies públicas no autorizadas, para que mis datos y
mi aportación solo participen en el flujo privado de revisión previsto.

**Why this priority**: La protección de contenido ciudadano privado es el objetivo central. Un
cambio accidental de permisos no debe convertir una colección de moderación en contenido público.

**Independent Test**: Se puede evaluar localmente cada operación pública relevante sobre Agenda y
Veus, tanto sobre colecciones como sobre elementos individuales, y comprobar que ninguna devuelve,
crea, modifica o elimina solicitudes privadas sin autorización.

**Acceptance Scenarios**:

1. **Given** existen solicitudes privadas de Agenda, **When** un actor intenta consultarlas mediante
   las antiguas rutas Content API de colección o elemento individual, **Then** recibe el `404`
   natural de una ruta inexistente y ningún contenido privado ni dato que permita inferirlo.
2. **Given** existen solicitudes privadas de Veus, **When** un actor intenta consultarlas mediante
   las antiguas rutas Content API de colección o elemento individual, **Then** recibe el `404`
   natural de una ruta inexistente y ningún contenido privado ni dato que permita inferirlo.
3. **Given** un actor intenta crear, modificar o eliminar una solicitud privada de Agenda mediante
   las antiguas rutas Content API, **When** realiza `POST`, `PUT` o `DELETE`, **Then** recibe el
   `405` natural de Strapi y ningún dato se crea, modifica ni elimina.
4. **Given** un actor intenta crear, modificar o eliminar una solicitud privada de Veus mediante
   las antiguas rutas Content API, **When** realiza `POST`, `PUT` o `DELETE`, **Then** recibe el
   `405` natural de Strapi y ningún dato se crea, modifica ni elimina.

---

### User Story 2 - Preservar recepción interna y moderación humana (Priority: P1)

Como equipo editorial, quiero seguir recibiendo y moderando solicitudes de Agenda y Veus mediante
los canales internos y administrativos previstos, para reforzar la privacidad sin interrumpir la
participación ciudadana ni el trabajo editorial.

**Why this priority**: El hardening solo es válido si cierra la exposición pública sin bloquear el
flujo privado legítimo ni sustituir la decisión humana.

**Independent Test**: Se pueden enviar solicitudes controladas de Agenda y Veus por el canal interno
autenticado y comprobar que quedan disponibles para moderación administrativa, sin publicación
automática ni dependencia de acceso público a las colecciones privadas.

**Acceptance Scenarios**:

1. **Given** una solicitud válida de Agenda llega por el canal interno autenticado, **When** se
   procesa, **Then** se registra para revisión privada según el comportamiento vigente.
2. **Given** una solicitud válida de Veus llega por el canal interno autenticado, **When** se
   procesa, **Then** se registra para revisión privada según el comportamiento vigente.
3. **Given** existen solicitudes privadas de Agenda o Veus, **When** una persona administradora usa
   el mecanismo de moderación previsto, **Then** puede revisarlas y resolverlas sin recurrir a una
   superficie pública.
4. **Given** una solicitud privada acaba de recibirse, **When** finaliza su creación, **Then** no se
   publica contenido automáticamente ni se altera su decisión editorial.

---

### User Story 3 - Verificar el hardening sin regresiones (Priority: P2)

Como responsable del producto, quiero una comprobación local, reproducible y cerrada del límite
entre solicitudes privadas y contenido público, para detectar futuras reapariciones de exposición
sin depender de infraestructura desplegada o configuración manual no versionada.

**Why this priority**: Una política de privacidad debe poder auditarse de forma estable y debe
preservar las superficies públicas y privadas que no forman parte del defecto.

**Independent Test**: Se puede ejecutar dos veces la misma matriz local controlada y obtener el
mismo resultado para accesos públicos denegados, flujos internos permitidos y regresiones fuera de
alcance.

**Acceptance Scenarios**:

1. **Given** contenido público de Agenda y Veus ya existente, **When** se aplica el hardening a sus
   solicitudes privadas, **Then** el contenido público conserva su comportamiento anterior.
2. **Given** otros tipos de solicitud privada existentes, **When** se valida Agenda y Veus, **Then**
   sus canales y contratos no cambian.
3. **Given** solicitudes equivalentes originadas en CA, ES y EN, **When** se evalúa su privacidad,
   **Then** reciben exactamente la misma protección.
4. **Given** una matriz local con operaciones autorizadas y no autorizadas, **When** se repite con
   las mismas entradas, **Then** produce los mismos resultados y cero cambios inesperados; como
   evidencia QA auxiliar, una ruta control completamente inexistente recibe los mismos métodos
   mutadores usados contra las rutas retiradas y presenta la misma respuesta `405` natural,
   demostrando que esa respuesta procede del comportamiento global de Strapi y no de la antigua
   Content API.

### Edge Cases

- Los permisos públicos almacenados cambian accidentalmente después del hardening: no pueden
  habilitar las rutas Content API retiradas ni exponer por ellas las colecciones privadas.
- Una consulta pública solicita una colección completa, un elemento inexistente o un identificador
  válido: ninguna variante revela solicitudes privadas, campos, conteos o metadatos sensibles.
- Se intenta una operación pública de escritura con un payload válido o inválido: ninguna crea,
  modifica ni elimina una solicitud privada; el `405` natural no implica que exista un endpoint
  estándar de mutación registrado.
- El canal interno recibe una sección Agenda o Veus válida mientras la superficie pública está
  cerrada: la recepción privada continúa funcionando.
- Una persona administradora usa Content Manager: el acceso administrativo previsto continúa
  disponible aunque la Content API pública esté cerrada o restringida.
- Una solicitud contiene datos en CA, ES o EN: el idioma no cambia la decisión de acceso.
- La política de permisos del entorno no coincide con la esperada: la validación debe detectar la
  discrepancia o la implementación debe impedir que produzca exposición.
- Una colección pública de Agenda o Veus comparte nombre o relaciones con su solicitud privada: el
  hardening no bloquea ni altera el contenido editorial público.

## Clarified Access Strategy

- La Content API estándar de `solicitud-agenda` y `solicitud-veu` debe retirarse completamente.
- `GET` de colección o elemento sobre las antiguas rutas públicas debe recibir el `404` natural de
  una ruta inexistente.
- `POST` de colección y `PUT`/`DELETE` de elemento deben recibir el `405` natural de Strapi, con
  `Allow: HEAD, GET` y cero efectos persistentes.
- El `405` es semántica global natural del routing de Strapi; una ruta control completamente
  inexistente debe presentar el mismo resultado para distinguir este comportamiento de una ruta
  Content API todavía registrada.
- No se debe introducir middleware, política runtime, alias, interceptor de producción ni cambio de
  configuración para normalizar `405` a `404` o crear una respuesta sustitutiva.
- La inspección estática no encontró consumidores legítimos de esas rutas en frontend, Netlify
  Functions, cron, servicios, helpers, pruebas ni documentación.
- El canal interno autenticado crea las solicitudes mediante Documents Service y no depende de la
  Content API estándar.
- Content Manager y la moderación administrativa usan sus superficies administrativas e internas y
  no dependen de los routers Content API estándar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las rutas Content API estándar de las solicitudes privadas de Agenda MUST NOT existir;
  las consultas de colección o elemento individual a sus antiguas rutas MUST devolver el `404`
  natural de una ruta inexistente.
- **FR-002**: Las rutas Content API estándar de las solicitudes privadas de Veus MUST NOT existir;
  las consultas de colección o elemento individual a sus antiguas rutas MUST devolver el `404`
  natural de una ruta inexistente.
- **FR-003**: Las antiguas rutas Content API de Agenda MUST devolver el `404` natural de una ruta
  inexistente ante consultas `GET`; los intentos `POST`, `PUT` y `DELETE` MUST devolver el `405`
  natural de Strapi y MUST NOT crear, modificar ni eliminar ningún dato.
- **FR-004**: Las antiguas rutas Content API de Veus MUST devolver el `404` natural de una ruta
  inexistente ante consultas `GET`; los intentos `POST`, `PUT` y `DELETE` MUST devolver el `405`
  natural de Strapi y MUST NOT crear, modificar ni eliminar ningún dato.
- **FR-005**: La protección MUST impedir la exposición de contenido, datos personales, campos
  privados, metadatos sensibles y señales que revelen solicitudes privadas.
- **FR-006**: El canal interno autenticado vigente MUST continuar aceptando solicitudes válidas de
  Agenda sin ampliar quién puede utilizarlo.
- **FR-007**: El canal interno autenticado vigente MUST continuar aceptando solicitudes válidas de
  Veus sin ampliar quién puede utilizarlo.
- **FR-008**: La moderación humana mediante los mecanismos administrativos previstos MUST continuar
  disponible para Agenda y Veus.
- **FR-009**: El hardening MUST NOT publicar automáticamente solicitudes ni cambiar decisiones,
  estados o responsabilidades editoriales.
- **FR-010**: La feature MUST NOT cambiar estructuras persistentes, migrar datos ni modificar o
  eliminar solicitudes existentes. La SQLite real/baseline MUST permanecer cerrada al motor SQLite
  durante IMPLEMENT y solo puede someterse a gates de filesystem; una SQLite temporal, aislada y
  descartable usada exclusivamente para inicializar Strapi durante QA no constituye persistencia,
  migración ni modificación de datos reales.
- **FR-011**: El contenido público de Agenda y Veus MUST conservar su comportamiento y separación
  respecto de sus solicitudes privadas.
- **FR-012**: Comunicats, Millorem Pineda, Foto del Mes, Comercio y cualquier otro flujo privado no
  incluido MUST conservar sus contratos y comportamiento actuales.
- **FR-013**: La retirada de la Content API estándar MUST quedar expresada en artefactos versionados
  y verificables y MUST impedir que una configuración manual de permisos vuelva a habilitarla.
- **FR-014**: La validación MUST demostrar localmente que las operaciones públicas de lectura,
  creación, modificación y eliminación no autorizadas quedan cerradas para Agenda y Veus, que no
  existe ninguna de las diez firmas de ruta estándar y que una ruta control inexistente comparte la
  misma semántica `405` de los métodos mutadores.
- **FR-015**: La validación MUST demostrar localmente que los canales internos de Agenda y Veus y la
  moderación administrativa prevista permanecen operativos.
- **FR-016**: La validación MUST ser determinista, repetible y ejecutable sin infraestructura
  desplegada, servicios externos ni datos ciudadanos reales.
- **FR-017**: La protección MUST aplicarse de forma idéntica a solicitudes originadas en CA, ES y EN
  y MUST NOT introducir ramas de seguridad por idioma.
- **FR-018**: La feature MUST NOT introducir servicios, infraestructura o dependencias nuevas.

### Key Entities

- **Solicitud privada de Agenda**: Aportación ciudadana no pública destinada a revisión humana antes
  de cualquier posible publicación editorial.
- **Solicitud privada de Veus**: Aportación ciudadana no pública destinada a revisión humana antes
  de cualquier posible publicación editorial.
- **Superficie Content API**: Conjunto de operaciones potencialmente accesibles fuera de los canales
  internos o administrativos y cuyo acceso debe quedar cerrado para actores no autorizados.
- **Canal interno autenticado**: Vía servidor-servidor autorizada que recibe solicitudes privadas sin
  convertir las colecciones de moderación en contenido público.
- **Moderación administrativa**: Capacidad del equipo editorial para consultar y resolver
  solicitudes privadas mediante herramientas administrativas previstas.
- **Contenido público de Agenda y Veus**: Entidades editoriales publicadas separadas de las
  solicitudes privadas y fuera del endurecimiento de acceso.

### Scope and Boundaries

**In scope**:

- Solicitudes privadas de Agenda y Veus.
- Operaciones públicas de lectura de colección y elemento individual.
- Operaciones públicas no autorizadas de creación, modificación y eliminación.
- Continuidad del canal interno autenticado para ambas secciones.
- Continuidad de Content Manager y de la moderación humana prevista.
- Verificación local reproducible de privacidad, regresión y neutralidad CA/ES/EN.
- SQLite temporal de QA creada dentro del entorno descartable de cada ejecución exclusivamente para
  inicializar la instancia Strapi aislada, sin reutilizar `.tmp/data.db`, datos reales ni copias de
  la SQLite real, sin persistencia posterior y con eliminación garantizada en `finally`.
- Política versionada que reduzca la dependencia de permisos manuales no versionados.

**Out of scope**:

- Cambiar schemas, relaciones, estados editoriales o datos existentes.
- Migrar, abrir mediante un motor o modificar la SQLite real/baseline del proyecto; durante
  IMPLEMENT solo se permiten sobre ella lecturas de filesystem para SHA-256, tamaño, mtime y
  presencia de sidecars.
- Modificar formularios, rutas públicas o comportamiento funcional del frontend.
- Cambiar verificación de email, tokens, rate limiting o autenticación interna.
- Cambiar moderación, publicación o políticas generales de retención.
- Modificar Comunicats, Millorem Pineda, Foto del Mes o Comercio por simetría.
- Añadir infraestructura, servicios externos, dependencias o despliegue.
- Railway, PostgreSQL, Cloudinary, Resend, Upstash o cambios live de permisos.
- Tratar el hardening como evidencia de una filtración o incidente no demostrado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las pruebas locales sobre las antiguas rutas de lectura de colección y
  elemento individual para solicitudes Agenda y Veus obtiene `404`, cero contenido privado y cero
  datos sensibles.
- **SC-002**: El 100 % de los intentos locales de crear, modificar o eliminar solicitudes Agenda y
  Veus mediante las antiguas rutas Content API obtiene `405` y produce cero escrituras,
  modificaciones, eliminaciones o cualquier otro cambio persistente.
- **SC-003**: El 100 % de los casos controlados de recepción interna de Agenda y Veus conserva el
  resultado vigente y mantiene las solicitudes disponibles para moderación privada.
- **SC-004**: El 100 % de los casos administrativos controlados de Agenda y Veus continúa siendo
  accesible para la moderación prevista sin habilitar acceso público.
- **SC-005**: El 100 % de la regresión local de contenido público Agenda y Veus conserva su resultado
  anterior.
- **SC-006**: El 100 % de la regresión seleccionada de otras solicitudes privadas permanece sin
  cambios.
- **SC-007**: Los casos equivalentes CA, ES y EN producen resultados idénticos de autorización y
  privacidad.
- **SC-008**: Dos ejecuciones locales con entradas iguales producen los mismos resultados para todas
  las operaciones autorizadas, denegadas y de regresión.
- **SC-009**: La feature finaliza con cero cambios de schema, cero migraciones, cero pérdida de
  solicitudes, cero publicación automática, cero dependencias nuevas y cero infraestructura nueva.

## Assumptions

- No existe evidencia confirmada de que una solicitud privada haya sido expuesta; el riesgo procede
  de mantener una superficie cuya privacidad depende parcialmente de permisos externos al código.
- El canal interno autenticado actual es la vía legítima de recepción para Agenda y Veus y debe
  reutilizarse sin alterar su contrato.
- Content Manager y la moderación administrativa son capacidades legítimas distintas de una Content
  API pública; está confirmado que no dependen de los routers Content API estándar, igual que el
  canal interno autenticado y cron/helpers/services, y no existe ningún consumidor legítimo de
  esas rutas.
- Los contenidos públicos de Agenda y Veus son entidades distintas de las solicitudes privadas.
- Los datos existentes, sus relaciones y estados editoriales son válidos y deben preservarse
  íntegramente.
- La validación futura utilizará únicamente datos sintéticos o dobles controlados y no requerirá un
  entorno desplegado.
- La SQLite temporal de QA es un recurso efímero del harness: se crea dentro de su entorno
  descartable, no reutiliza `.tmp/data.db`, no contiene ni copia datos reales, solo inicializa la
  instancia Strapi aislada, no sobrevive a la ejecución y se elimina en `finally`.
- La respuesta `405` de los métodos mutadores es el comportamiento global natural de Strapi tras la
  retirada de las rutas, reproducible también con una ruta control inexistente; no se normalizará
  mediante código o configuración de producción.
