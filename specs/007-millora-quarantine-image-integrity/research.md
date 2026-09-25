# Research: Integridad de imágenes privadas en cuarentena de Millorem Pineda

## Decision 1: extend the existing section registry

**Decision**: incorporar `api::solicitud-millora.solicitud-millora` al registro actual de secciones
protegidas y dejar que use la rama escalar existente.

**Rationale**: Millora usa el mismo campo `imatge_quarantena_id` que Agenda, Veus, Comunicats y Foto
del Mes. El recolector ya pagina, proyecta y deduplica ese campo; la omisión del UID es la causa
completa del defecto.

**Alternatives considered**:

- Crear una rama especial para Millora: rechazada porque no existe diferencia de cardinalidad ni
  nombre de campo.
- Reemplazar el registro por una abstracción nueva: rechazada porque amplía riesgo y alcance sin
  resolver una necesidad adicional.
- Corregir creación o moderación: rechazado porque ambas ya guardan y consumen la referencia real.

## Decision 2: preserve current reference semantics

**Decision**: mantener la regla actual que omite valores no-string o vacíos y añade strings no
vacías a un `Set`, sin incorporar validación nueva en el recolector.

**Rationale**: los archivos candidatos ya están restringidos a IDs hexadecimales de 32 caracteres.
Una referencia malformada no puede coincidir con otro archivo candidato; un ID válido sin archivo
no protege ningún ID distinto. Añadir otra validación cambiaría innecesariamente el contrato
compartido de las cinco secciones existentes.

**Alternatives considered**:

- Validar cada fila con el helper de referencia: rechazada por no aportar protección adicional al
  borrado y por alterar semántica compartida.
- Resolver cada referencia contra filesystem durante inventario: rechazada por duplicar I/O y
  mezclar descubrimiento con decisión de borrado.

## Decision 3: Millora remains a single optional private image

**Decision**: tratar Millora como sección escalar con cero o una referencia privada.

**Rationale**: su schema contiene una media no múltiple y un string privado opcional de longitud 32.
El receptor admite como máximo un archivo y solo añade el campo cuando la cuarentena devuelve ID.
Comercio sigue siendo el único caso con principal, logo y galería.

**Alternatives considered**:

- Modelar varias imágenes Millora: rechazada porque el schema y el flujo real no lo permiten.
- Consultar el campo Media público: rechazada porque la limpieza opera exclusivamente sobre la
  referencia privada de cuarentena.

## Decision 4: preserve the exact grace boundary

**Decision**: conservar 24 horas por defecto y la comparación `age < grace` como reciente; una edad
igual al límite continúa siendo elegible.

**Rationale**: la feature corrige visibilidad de referencias, no política temporal. Los timestamps
futuros producen edad negativa y continúan conservándose de forma defensiva.

**Alternatives considered**:

- Cambiar la comparación a inclusiva: rechazada por alterar el contrato actual.
- Esperar tiempo real en QA: rechazada porque sería lento y no determinista.
- Modificar el reloj del sistema: rechazada por impacto innecesario; el servicio ya acepta un reloj
  lógico explícito.

## Decision 5: keep fail-closed inventory and best-effort deletion

**Decision**: preservar la separación actual: cualquier fallo durante recopilación/listado aborta
antes de borrar; un fallo individual de borrado se registra y no impide intentar los siguientes.

**Rationale**: todas las referencias deben conocerse antes de tomar decisiones destructivas. Una vez
formado el inventario completo, tratar fallos por archivo individualmente evita bloquear la limpieza
de otros huérfanos sin ocultar errores.

**Alternatives considered**:

- Continuar con referencias parciales: rechazada por riesgo directo de pérdida de datos.
- Hacer transaccional el filesystem: rechazado porque no existe esa capacidad y excede el defecto.
- Detenerse en el primer unlink fallido: rechazado porque cambiaría comportamiento operativo.

## Decision 6: use the private filesystem service, not Strapi Upload

**Decision**: no modificar integración de Upload. La cuarentena continúa en el filesystem privado
configurable y el helper existente realiza el listado, lookup y unlink.

**Rationale**: los archivos todavía no son Media de Strapi. `config/plugins.js` no configura un
provider relacionado y el cleanup no llama al plugin Upload.

**Alternatives considered**:

- Borrar mediante Upload: rechazada porque esos IDs no son IDs Media.
- Introducir almacenamiento externo: rechazado por alcance, infraestructura y Constitución.

## Decision 7: persistent backend QA with controlled temporary files

**Decision**: crear `guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs` y
ejecutarlo directamente con Node, sin añadir script de paquete ni dependencia.

**Rationale**: la prueba necesita el servicio backend real, pero no Strapi real. El servicio ya
expone todas las seams necesarias: `strapi`, `now`, `graceMs` y root configurable. Un directorio
temporal con nombres/mtimes controlados prueba el listado y unlink reales sin datos de usuarios.
Mantener el harness en backend evita introducir un artefacto QA cruzado para una feature de producto
exclusivamente backend.

**Alternatives considered**:

- Añadir un framework de tests: rechazado por dependencia y coste desproporcionados.
- Añadir inyección de list/delete al servicio: rechazada porque ya puede aislarse con el root
  temporal y reduciría cuánto código real se prueba.
- Usar cron real, esperar 24 horas o cambiar el reloj del sistema: rechazado por falta de
  determinismo.
- Ampliar únicamente el harness comercial: rechazado porque no cubre la matriz específica de
  Millora, paginación ni fallos conservadores y reside en el repositorio frontend.

## Decision 8: language neutrality is structural

**Decision**: no añadir ramas de idioma. El harness incluirá filas Millora CA, ES y EN equivalentes
para demostrar que el resultado depende solo del ID.

**Rationale**: el cleanup no proyecta ni lee `idioma_solicitud`, contenido o estado editorial. La
consulta por UID abarca todos los documentos.

**Alternatives considered**:

- Filtrar o agrupar por idioma: rechazada porque crearía diferencias sin requisito funcional.

## Decision 9: no persistent model or interface contract changes

**Decision**: documentar las entidades existentes en `data-model.md` y no crear `contracts/`.

**Rationale**: no cambia ningún schema, fila, relación, estado, endpoint, payload, evento ni interfaz
entre repositorios. El único contrato afectado es el comportamiento interno del cleanup y queda
cubierto por PLAN y quickstart.

**Alternatives considered**:

- Inventar un contrato HTTP: rechazado porque la limpieza no expone uno.
- Modificar schema o tipos generados: rechazado porque el campo requerido ya existe.

## Decision 10: exact closed allowlist

**Decision**: autorizar un único archivo productivo backend y un único harness backend; mantener
schemas, helpers, cron, paquetes, lockfiles, frontend funcional y SQLite read-only.

**Rationale**: la investigación no identifica ninguna segunda modificación funcional necesaria.
El allowlist estrecho hace visible cualquier expansión y obliga a volver a PLAN si aparece un
bloqueo real.

**Alternatives considered**:

- Autorizar helpers y configuración por prevención: rechazada porque contradice cambios pequeños y
  verificables.

## Resolved Questions

- **UID**: `api::solicitud-millora.solicitud-millora`.
- **Campo**: `imatge_quarantena_id`, string privado opcional, longitud 32, una sola imagen.
- **Formato almacenado**: 32 caracteres hexadecimales; el archivo normalizado nuevo usa WebP y el
  lector conserva compatibilidad con JPEG/PNG anteriores.
- **Referencia nula/ausente/vacía/no-string**: ignorada.
- **Referencia malformada**: puede entrar al `Set` si es string no vacía, pero no coincide con un
  candidato válido ni protege otro archivo.
- **Referencia válida sin archivo**: no provoca borrado ni protección de otro ID.
- **Múltiples imágenes Millora**: no permitidas por schema ni recepción.
- **Borrado**: filesystem privado mediante lookup exacto y unlink; no Strapi Upload.
- **Frontera**: edad menor que grace se conserva; igualdad o mayor es elegible.
- **Errores**: inventario incompleto aborta antes de borrar; unlink individual fallido se contabiliza
  y continúa.
- **Idempotencia**: convergencia sobre el mismo estado; determinismo exacto al reconstruir iguales
  fixtures iniciales.
- **CA/ES/EN**: neutral, sin rama funcional.
- **Aclaraciones pendientes**: ninguna.
