# Research: Alta segura y trilingüe de comercios

## Inspección realizada

Se inspeccionaron las tres superficies de CTA, las rutas y la plantilla del alta, el componente
guiado completo, el transporte de formularios, el bloque/controlador de verificación, las Functions
de participación, el canal interno autenticado, el modelo `solicitud-comercio`, sus componentes,
la normalización/cuarentena, la limpieza de huérfanos y la moderación privada. Las decisiones se
basan en el código actual de ambos repositorios, no en infraestructura desplegada asumida.

## Decision 1: preserve the current six-step form

**Decision**: mantener `CommerceSignupFlow.astro` como fuente de verdad visual y de estado. Añadir
EN, semántica de formulario, serialización, verificación y envío sin rediseñar las pantallas.

**Rationale**: el formulario ya implementa selección condicional, horarios, servicios, redes,
previews, imágenes y revisión. Reescribirlo ampliaría riesgo y scope sin valor funcional.

**Alternatives considered**:

- Crear un segundo formulario “seguro”: rechazado por duplicación y divergencia CA/ES/EN.
- Migrar todo el estado a un nuevo framework/controlador: rechazado como refactor oportunista.

## Decision 2: add one shared English route and activate existing CTAs

**Decision**: crear `/en/businesses/add-a-business/` sobre la misma plantilla; ampliar el tipo
`lang` y seleccionar `nombre_en` para catálogo. Los CTA ingleses existentes apuntan a esa ruta.

**Rationale**: las rutas CA/ES ya comparten plantilla y los datos editoriales ya contienen nombres
EN. La vía más pequeña preserva static-first y hace descubrible la paridad.

**Alternatives considered**:

- Duplicar el componente para EN: rechazado por riesgo de regresión lingüística.
- Consultar categorías en runtime: rechazado por la Constitución static-first.

## Decision 3: canonical JSON for repeatable groups

**Decision**: transportar horarios, servicios y redes como tres strings JSON acotados y
normalizarlos en Function a arrays tipados; modalidades viajan como cinco booleanos textuales.

**Rationale**: la UI gestiona grupos dinámicos sin inputs estables. JSON evita nombres indexados
frágiles y permite allowlists/número de elementos exactos en ambos servidores.

**Alternatives considered**:

- Campos multipart indexados (`servicios[0]...`): rechazados por parser complejo y duplicados.
- Enviar el estado completo del componente: rechazado porque incluiría metadata/UI no autorizada.

## Decision 4: documentId references, revalidated in Strapi

**Decision**: navegador y Function transportan `categoria_document_id` y, cuando corresponda,
`subcategoria_document_id`. Strapi exige documentos publicados y activos, comprueba pertenencia y
si la categoría dispone de subcategorías activas. Solo después construye las relaciones internas.

**Rationale**: el build ya expone `documentId`; una etiqueta o ID numérico sería manipulable o
inestable. El catálogo puede cambiar entre build y envío.

**Alternatives considered**:

- Confiar en hidden fields: rechazado por límite de confianza.
- Rechazar por similitud con un comercio: rechazado expresamente; no hay deduplicación.

## Decision 5: purpose-bind all verification flows

**Decision**: hacer obligatorio un scope cerrado en request, code hash, token hash y consumo. Cada
handler pasa un literal propio; comercio usa `comercio`. El scope se incorpora al material
criptográfico que se hashea, sin añadirlo al registro persistido del challenge ni modificar
`netlify/functions/_shared/verification-store.mjs`.

**Rationale**: añadir el scope solo en la UI no impide reutilizar un token en otro endpoint. Incluirlo
en los hashes garantiza propósito exclusivo sin datos adicionales persistentes.

**Alternatives considered**:

- Campo hidden comprobado solo por Function: rechazado porque el visitante lo controla.
- Un segundo sistema de verificación: rechazado por dependencia y duplicación de seguridad.

## Decision 6: one bounded multipart with repeated gallery field

**Decision**: el navegador envía principal, logo y galería en un único multipart. `galeria` puede
repetirse hasta cuatro veces; campos textuales no pueden repetirse. El nuevo
`commerce-submission-http.mjs` implementa el parser específico multiimagen y
`commerceSubmission.ts` construye y envía directamente el `FormData`. Los helpers compartidos
`submission-http.mjs` y `netlifySubmission.ts` permanecen intactos.

**Rationale**: cumple atomicidad funcional y la decisión de no hacer uploads separados. La suma de
archivos <=4.000.000 bytes deja margen dentro de requests de 5.000.000 bytes para boundary y texto.

**Alternatives considered**:

- Subidas previas y IDs temporales: rechazadas por scope, infraestructura y limpieza adicional.
- Base64 dentro de JSON: rechazado por expansión de tamaño y memoria.

## Decision 7: validate at three boundaries

**Decision**: validar para UX en navegador, validar allowlist/estructura/tamaño en Function y
revalidar todo —incluido contenido binario y relaciones— en Strapi.

**Rationale**: el navegador es manipulable y Function no dispone del catálogo ni debe almacenar
imágenes. Strapi es el último límite de confianza y posee Sharp/cuarentena.

**Alternatives considered**:

- Validar solo en Function: rechazado por el contrato interno y relaciones editoriales.
- Normalizar en Function: rechazado porque duplicaría Sharp y transporte/almacenamiento.

## Decision 8: transactional compensation for multiimage reception

**Decision**: prevalidar datos/relaciones/todos los files antes de escribir; almacenar imágenes una
a una registrando IDs; crear la solicitud una vez; borrar todos los IDs si falla cualquier paso.
La limpieza de huérfanos existente protege fallos excepcionales del rollback.

**Rationale**: el filesystem y la base de datos no comparten transacción. La compensación explícita
es la mínima garantía de conjunto sin servicio nuevo.

**Alternatives considered**:

- Crear solicitud parcial y completarla: rechazado por FR-030.
- Directorio staging propio: rechazado como almacenamiento temporal adicional.

## Decision 9: retain but disable legacy Media fields

**Decision**: no eliminar `logo`, `imagen_principal` y `galeria`. Quitar la obligatoriedad de la
principal y marcar las tres como privadas/no visibles/no configurables; el nuevo flujo usa refs de
cuarentena separadas y nunca escribe Media.

**Rationale**: eliminar columnas es potencialmente destructivo y requeriría gates de datos. El
schema actual necesita dejar de exigir Media para crear una solicitud privada.

**Alternatives considered**:

- Eliminar campos: rechazado por integridad y ausencia de una migración aprobada.
- Seguir usándolos: rechazado porque Media no es la cuarentena privada.

## Decision 10: fixed private references by role

**Decision**: almacenar `imagen_principal_quarantena_id`, `logo_quarantena_id` y
`galeria_quarantena_ids` (array JSON de 0–4 IDs) como campos privados server-owned.

**Rationale**: refleja exactamente los roles, evita un componente adicional y permite a moderación y
limpieza resolver/proteger IDs sin aceptar metadata del visitante.

**Alternatives considered**:

- Componente repetible nuevo con rol/orden: rechazado por schema/tipos extra sin ventaja necesaria.
- Un único array sin roles: rechazado porque pierde la semántica de principal/logo.

## Decision 11: private-only moderation branch

**Decision**: registrar `comercio` en lifecycle/panel. Sus transiciones actualizan estado y
auditoría; al llegar a `aprovat` o `rebutjat`, la misma actualización de cierre fija
`email_contacto = null`. No promocionan, borran ni publican imágenes, no eliminan el nombre o el
teléfono privados y no llaman a `api::comercio.comercio`.

**Rationale**: se reutiliza la minimización del email al cerrar sin heredar la promoción genérica de
imágenes. La decisión humana permite el email verificado solo durante `pendent` y `en_revisio` y
separa por completo la resolución editorial de cualquier publicación.

**Alternatives considered**:

- Reutilizar aprobación genérica sin rama específica: rechazada porque escribiría Media y podría
  aplicar efectos no autorizados además del borrado requerido del email.
- Crear otro sistema de moderación: rechazado; estados y RBAC existentes son reutilizables.

## Decision 12: preview roles through the authenticated Admin endpoint

**Decision**: ampliar la ruta privada existente con query `role=principal|logo|galeria` e `index`
solo para galería. El panel muestra slots etiquetados y nunca recibe el ID privado.

**Rationale**: mantiene autenticación, headers no-cache y no exposición de filesystem ya probados.

**Alternatives considered**:

- URLs públicas firmadas: rechazadas por infraestructura y exposición.
- Incrustar Base64 en el registro: rechazado por tamaño y modelo.

## Decision 13: only terminal email deletion; no broader automatic retention policy

**Decision**: proteger todas las refs de solicitudes en cualquier estado y no introducir TTL, job
nuevo ni anonimización o borrado automático adicional. `email_contacto` se conserva solo en
`pendent`/`en_revisio` y se elimina al pasar a `aprovat`/`rebutjat`; los demás datos privados no
reciben una política nueva en esta feature.

**Rationale**: la eliminación terminal del email es una decisión humana cerrada. Inventar un plazo
o extenderla a los demás datos sería una decisión de producto y tratamiento no autorizada.

**Alternatives considered**:

- Conservar el email tras aprobar/rechazar: rechazado por la decisión humana vigente.
- Borrar también nombre, teléfono o imágenes: rechazado por ampliar la política de retención.
- Retención indefinida presentada como política final: rechazada; sigue siendo un riesgo posterior.

## Deferred evidence

Entrega real de email, TTL/atomicidad de Upstash real, límite/rate limit de Netlify, canal desplegado
Function→Strapi, filesystem de cuarentena desplegado y Content Manager real permanecen
`DEFERRED — predeployment`. Los dobles locales prueban contratos, no infraestructura.
