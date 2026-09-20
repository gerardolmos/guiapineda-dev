# Research: Denuncia privada de Comunicats

## Scope of inspection

Se inspeccionaron los puntos reales de detalle de Comunicats, verificación de email, Functions de
participación, transporte autenticado a Strapi, servicio interno de solicitudes, content types
privados y workflows de moderación. Las decisiones siguientes describen el estado actual; no
presuponen infraestructura desplegada.

## Decision 1: place the action in the shared article template

**Decision**: insertar un componente compartido inmediatamente después del cuerpo renderizado por
`StrapiBlocks` y antes del bloque de relacionados en `ComunicatArticlePage.astro`.

**Rationale**: la plantilla ya sirve las rutas CA/ES/EN y dispone del objeto editorial completo. Una
sola inserción garantiza ubicación y comportamiento equivalentes sin duplicar páginas.

**Alternatives considered**:

- Modificar cada ruta dinámica: rechazado por duplicación y riesgo de divergencia lingüística.
- Crear una página independiente: rechazado porque añade rutas y pierde el contexto inmediato sin
  aportar valor funcional.

## Decision 2: use Strapi `documentId` as stable identity

**Decision**: enviar `comunicat.documentId` como identidad estable y el slug actual como contexto
público reconocible y comprobación de integridad.

**Rationale**: Strapi 5 ya expone `documentId` en los documentos con los que se construyen las
páginas. El slug puede cambiar y no es suficiente por sí solo; el título tampoco es estable.

**Alternatives considered**:

- Solo slug o URL: rechazado porque incumple la identidad editorial estable.
- Relación Strapi obligatoria: rechazada porque puede perder contexto si el contenido se elimina y
  añade semántica de ciclo de vida innecesaria. La referencia se valida antes de crear y se conserva
  como snapshot mínimo.
- Persistir también el título: rechazado porque el identificador y el slug bastan y minimizan datos.

## Decision 3: dedicated browser controller, existing verification block

**Decision**: reutilizar `EmailVerificationBlock.astro` y
`emailVerificationController.ts`, ampliando solo su scope DOM, pero crear un controlador de denuncia
dedicado.

**Rationale**: el mecanismo existente ya vincula token y email y expone `reset()`. El transporte
compartido actual de solicitudes navega a una URL de éxito, mientras esta feature requiere una
confirmación privada contextual y reglas condicionales de motivo/explicación.

**Alternatives considered**:

- Duplicar la verificación: rechazado por riesgo de debilitar una zona sensible.
- Generalizar el transporte compartido: rechazado como refactor no necesario que aumentaría la
  superficie de regresión de Agenda, Veus, Comunicats y otros formularios.

## Decision 4: split verification data from editorial payload in the Function

**Decision**: el validador de Function producirá dos salidas separadas: email solo para verificar y
payload editorial sin email/token. El adaptador HTTP consumirá primero el token y transmitirá solo
el payload permitido.

**Rationale**: el mecanismo actual requiere `email_contacto` para validar y consumir el token, pero
la decisión de producto prohíbe convertirlo en dato editorial persistente. La separación estructural
evita depender de que Strapi ignore un campo sensible.

**Alternatives considered**:

- Enviar email a Strapi y eliminarlo antes de crear: rechazado porque amplía innecesariamente la
  circulación del dato y aumenta el riesgo de logs o persistencia accidental.
- Persistir un hash del email: rechazado; seguiría siendo un identificador no autorizado y
  permitiría correlación.

## Decision 5: reuse generic internal authentication, not generic submission semantics

**Decision**: usar el endpoint interno y middleware bearer existentes, extender la allowlist de la
Function y añadir un despacho explícito hacia un servicio de denuncias nuevo.

**Rationale**: la autenticación interna ya protege `/api/internal/submissions/:section`. En cambio,
`internal-submission-request.js` exige consentimiento, persiste email, asigna estados de solicitud y
gestiona imágenes; esas semánticas contradicen esta feature.

**Alternatives considered**:

- Forzar la denuncia dentro del servicio genérico: rechazado por privacidad y estados
  incompatibles.
- Crear otro middleware o secreto: rechazado porque duplica infraestructura de seguridad sin una
  necesidad distinta.

## Decision 6: isolated private Strapi content type

**Decision**: crear `api::denuncia-comunicat.denuncia-comunicat` con schema solamente, sin rutas,
controller ni service de Content API pública. La creación se realiza desde el servicio interno y la
revisión desde Content Manager/RBAC.

**Rationale**: el repositorio ya usa content types privados administrables sin exponer una API
pública. Aislar la entidad impide mezclarla con comentarios o solicitudes publicables.

**Alternatives considered**:

- Componente embebido en Comunicat: rechazado porque escribiría sobre el contenido público y
  dificultaría denuncias independientes.
- Reutilizar `solicitud-comunicat`: rechazado porque contiene datos de contacto, estados y finalidad
  de publicación incompatibles.

## Decision 7: validate published content server-side

**Decision**: el servicio interno consultará `api::comunicat.comunicat` por `documentId` con estado
publicado y exigirá que su slug actual coincida con el recibido antes de crear la denuncia.

**Rationale**: los campos ocultos del navegador son manipulables y la página puede quedar obsoleta.
La consulta privada al enviar evita entradas huérfanas y no rompe static-first porque no ocurre al
leer ni expone Strapi al visitante.

**Alternatives considered**:

- Confiar en el HTML generado: rechazado por manipulación y obsolescencia.
- Consultar Strapi desde el navegador antes del envío: rechazado por arquitectura y exposición.

## Decision 8: platform-level request limiting without editorial IP storage

**Decision**: declarar para la Function el patrón de rate limiting existente agregado por `ip` y
`domain`, junto a honeypot, límites de tamaño y la limitación temporal de verificación ya existente.
La aplicación no leerá ni persistirá la IP.

**Rationale**: la plataforma puede limitar peticiones temporalmente sin introducir el identificador
en el modelo editorial ni crear almacenamiento nuevo. La verificación existente almacena hashes
HMAC temporales, no el email crudo.

**Alternatives considered**:

- Tabla propia de IPs: rechazada por prohibición de persistencia personal e infraestructura nueva.
- Sin rate limiting: rechazado porque debilitaría la prevención básica de abuso.

## Decision 9: no report lifecycle automation

**Decision**: usar un enum simple `pendiente | revisada | cerrada`, estado inicial `pendiente` y
cambios manuales desde administración. No registrar hooks que actúen sobre Comunicats.

**Rationale**: los lifecycles existentes están ligados a solicitudes publicables, eliminación de
contacto o promoción de imágenes. Ningún efecto coincide con una denuncia sin retirada automática.

**Alternatives considered**:

- Adaptar el lifecycle existente: rechazado por riesgo de efectos editoriales no autorizados.
- Añadir asignaciones, resoluciones o notas: rechazado como workflow adicional fuera de alcance.

## Decision 10: generated Strapi types remain versioned

**Decision**: regenerar `types/generated/contentTypes.d.ts` mediante el flujo normal de Strapi y
versionar el cambio derivado.

**Rationale**: el repositorio versiona los tipos generados y el nuevo content type debe quedar
representado. No se editará manualmente.

**Alternatives considered**:

- Ignorar el artefacto: rechazado porque dejaría los tipos versionados desincronizados.

## Deferred evidence

La comprobación de entrega real del email, enforcement de rate limit en Netlify, recorrido Function
-> Strapi desplegado y consulta de la entrada en el Content Manager real requiere un entorno
integrado que no existe. Se marca `DEFERRED — predeployment`; dobles locales no se presentarán como
evidencia de infraestructura real.
