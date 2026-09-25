# Feature Specification: Integridad de imágenes privadas en cuarentena de Millorem Pineda

**Feature Branch**: `007-millora-quarantine-image-integrity`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Garantizar que cualquier imagen privada correctamente asociada a una solicitud válida de Millorem Pineda sea reconocida como referenciada por la limpieza de cuarentena y no pueda eliminarse como huérfana mientras la referencia exista."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conservar una imagen de Millora todavía referenciada (Priority: P1)

Como persona que ha enviado una propuesta a Millorem Pineda con una imagen, quiero que esa imagen
permanezca disponible durante la revisión editorial mientras la solicitud siga manteniendo una
referencia válida, para que el equipo moderador no pierda parte de mi aportación por el paso del
tiempo.

**Why this priority**: Evitar la pérdida de una imagen válida es el objetivo principal de la feature
y protege tanto la integridad de la aportación como la capacidad de moderarla correctamente.

**Independent Test**: Se puede registrar una imagen privada como referencia válida de una solicitud
Millora, ejecutar una limpieza controlada con la imagen dentro y fuera del periodo de gracia, y
comprobar en ambos casos que la imagen permanece disponible y no figura entre las eliminadas.

**Acceptance Scenarios**:

1. **Given** una solicitud Millora existente referencia correctamente una imagen privada reciente,
   **When** se evalúan las imágenes de cuarentena, **Then** la imagen se reconoce como referenciada y
   se conserva.
2. **Given** una solicitud Millora existente referencia correctamente una imagen privada cuya
   antigüedad supera el periodo de gracia, **When** se ejecuta la limpieza, **Then** la imagen se
   conserva porque la referencia válida prevalece sobre su antigüedad.
3. **Given** solicitudes Millora equivalentes originadas en CA, ES y EN, **When** se evalúan sus
   referencias privadas, **Then** todas reciben exactamente la misma protección.

---

### User Story 2 - Continuar eliminando únicamente imágenes realmente huérfanas (Priority: P1)

Como responsable del producto, quiero que incorporar Millora a la protección de referencias no
impida retirar archivos que realmente estén huérfanos, para conservar la minimización y el
comportamiento de limpieza vigente.

**Why this priority**: Proteger referencias válidas no puede convertirse en una retención
indefinida de archivos sin solicitud asociada ni debilitar la limpieza existente.

**Independent Test**: Se pueden evaluar dos imágenes Millora sin referencia válida, una dentro y
otra fuera del periodo de gracia, y comprobar que la primera se conserva temporalmente y solo la
segunda resulta elegible para eliminación conforme al contrato actual.

**Acceptance Scenarios**:

1. **Given** una imagen privada de Millora sin referencia válida y todavía dentro del periodo de
   gracia, **When** se ejecuta la limpieza, **Then** la imagen se conserva temporalmente.
2. **Given** una imagen privada de Millora sin referencia válida y con antigüedad superior al
   periodo de gracia, **When** se ejecuta la limpieza, **Then** la imagen resulta elegible y se
   elimina según las reglas vigentes.
3. **Given** una referencia vacía, malformada o apuntando a un archivo inexistente, **When** se
   recopilan las imágenes protegidas, **Then** esa referencia no protege otro archivo ni genera una
   protección falsa.

---

### User Story 3 - Mantener estable la limpieza de las demás secciones (Priority: P2)

Como equipo editorial, quiero que la corrección de Millora no cambie cómo se protegen y limpian las
imágenes privadas de Agenda, Veus, Comunicats, Foto del Mes y Comercio, para evitar regresiones en
flujos de participación ya consolidados.

**Why this priority**: El servicio es compartido y una corrección localizada no debe alterar los
contratos de las demás secciones ni ampliar el conjunto de archivos protegidos o eliminados.

**Independent Test**: Se puede repetir una matriz de imágenes referenciadas, recientes huérfanas y
antiguas huérfanas para cada sección ya soportada y comprobar que los resultados coinciden con el
comportamiento anterior.

**Acceptance Scenarios**:

1. **Given** referencias válidas de cada sección ya soportada, **When** se ejecuta la misma limpieza
   después de incorporar Millora, **Then** todas continúan protegidas sin cambios observables.
2. **Given** imágenes huérfanas recientes y antiguas de las secciones ya soportadas, **When** se
   ejecuta la limpieza, **Then** siguen aplicándose exactamente las reglas vigentes de gracia y
   eliminación.
3. **Given** un conjunto controlado que mezcla imágenes protegidas y huérfanas de varias secciones,
   **When** se repite la evaluación en las mismas condiciones, **Then** el conjunto conservado y el
   conjunto eliminado son idénticos en cada repetición.

### Edge Cases

- Una misma imagen aparece referenciada más de una vez: se considera protegida sin que la
  duplicación altere el resultado.
- Una solicitud Millora existe pero su campo de referencia está vacío o contiene un valor no
  reconocido: no se protege ningún archivo por inferencia.
- La solicitud referencia un identificador válido cuyo archivo ya no existe: la limpieza no elimina
  otros archivos ni intenta sustituir la referencia.
- La recopilación de referencias no puede completarse: la ejecución debe fallar de forma
  conservadora y no borrar archivos basándose en un inventario parcial.
- El número de solicitudes supera el tamaño de una lectura: todas las referencias válidas deben
  seguir siendo consideradas antes de decidir eliminaciones.
- Una imagen tiene una antigüedad exactamente igual al límite vigente: conserva la misma
  clasificación de frontera que antes de esta feature.
- Una imagen antigua no pertenece a ninguna solicitud conocida: continúa siendo elegible sin que la
  presencia de Millora la proteja accidentalmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST incluir las solicitudes de Millorem Pineda al recopilar las referencias
  que protegen imágenes privadas durante una limpieza.
- **FR-002**: Una imagen privada con una referencia válida desde una solicitud Millora existente MUST
  considerarse referenciada antes de evaluar su antigüedad.
- **FR-003**: Una imagen Millora referenciada MUST conservarse con independencia de que sea reciente
  o haya superado el periodo de gracia vigente.
- **FR-004**: La protección de una referencia Millora válida MUST aplicarse por igual a solicitudes
  originadas en CA, ES y EN.
- **FR-005**: Una imagen Millora sin referencia válida MUST continuar sometida al mismo periodo de
  gracia y a las mismas condiciones de eliminación que las demás imágenes privadas huérfanas.
- **FR-006**: Una referencia vacía, malformada, inexistente o no correspondiente a un archivo MUST
  NOT proteger por inferencia ningún otro archivo.
- **FR-007**: Incorporar Millora MUST NOT modificar la protección, antigüedad, elegibilidad o
  eliminación aplicables a Agenda, Veus, Comunicats, Foto del Mes o Comercio.
- **FR-008**: La limpieza MUST decidir las eliminaciones únicamente después de recopilar todas las
  referencias válidas de todas las secciones soportadas.
- **FR-009**: Si la recopilación de referencias no puede completarse, la limpieza MUST NOT continuar
  con eliminaciones basadas en un conjunto parcial.
- **FR-010**: Una ejecución MUST NOT eliminar ningún archivo fuera del conjunto que cumpla
  simultáneamente las condiciones vigentes de ausencia de referencia y antigüedad.
- **FR-011**: La feature MUST preservar el periodo de gracia, la programación y la semántica general
  de la limpieza existentes.
- **FR-012**: La feature MUST NOT crear, actualizar o eliminar solicitudes, cambiar estados
  editoriales ni publicar contenido.
- **FR-013**: La feature MUST NOT modificar estructuras de datos persistentes ni datos existentes.
- **FR-014**: La feature MUST NOT introducir una política general de retención, anonimización o
  eliminación de solicitudes cerradas.
- **FR-015**: La feature MUST NOT incorporar almacenamiento externo, servicios nuevos, dependencias
  nuevas ni cambios de infraestructura.
- **FR-016**: La validación MUST cubrir de forma determinista los casos de imagen Millora referenciada
  reciente y antigua, huérfana reciente y antigua, referencia inválida, regresión de todas las
  secciones soportadas y ausencia de borrados inesperados.
- **FR-017**: La validación MUST poder ejecutarse localmente sin servicios externos y producir el
  mismo resultado para las mismas entradas.

### Key Entities

- **Solicitud Millora**: Aportación privada sometida a moderación humana que puede conservar una
  referencia a una imagen privada durante su ciclo editorial.
- **Imagen privada en cuarentena**: Archivo no público asociado potencialmente a una solicitud y
  sujeto a protección o limpieza según la existencia de referencias válidas y su antigüedad.
- **Referencia válida**: Asociación reconocida entre una solicitud existente y el identificador
  exacto de su imagen privada; protege únicamente ese archivo.
- **Imagen huérfana**: Imagen privada que no aparece en ninguna referencia válida de las secciones
  soportadas.
- **Periodo de gracia**: Margen temporal vigente durante el cual una imagen huérfana todavía se
  conserva antes de poder resultar elegible para eliminación.
- **Ejecución de limpieza**: Evaluación completa que separa imágenes protegidas, huérfanas recientes
  y huérfanas elegibles sin modificar solicitudes ni decisiones editoriales.

### Scope and Boundaries

**In scope**:

- Reconocer referencias de imágenes privadas de solicitudes Millora.
- Integrar Millorem Pineda en la protección vigente de la limpieza compartida.
- Mantener la eliminación normal de imágenes realmente huérfanas.
- Probar localmente la matriz positiva, negativa, de frontera y de regresión completa.
- Preservar privacidad, moderación humana, CA/ES/EN e integridad de los datos existentes.

**Out of scope**:

- Cambiar estructuras o datos persistentes, estados editoriales o publicación de contenido.
- Definir o aplicar una política general de retención para solicitudes abiertas o cerradas.
- Cambiar el periodo de gracia o la programación de la limpieza.
- Rediseñar de forma general el mecanismo de limpieza o moderación.
- Modificar frontend, formularios, copy, persistencia de borradores o rutas de otras APIs.
- Añadir dependencias, almacenamiento externo, servicios, infraestructura o despliegue.
- Ejecutar migraciones o cualquier operación destructiva sobre los datos actuales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las imágenes Millora con referencia válida de la matriz local, tanto
  recientes como antiguas, permanece disponible después de la limpieza.
- **SC-002**: El 100 % de las imágenes Millora huérfanas dentro del periodo de gracia se conserva
  temporalmente y el 100 % de las huérfanas que superan ese periodo se clasifica conforme al
  contrato vigente.
- **SC-003**: Cero referencias vacías, inválidas o inexistentes protegen un archivo distinto del
  identificado exactamente.
- **SC-004**: Cero archivos fuera del conjunto esperado se eliminan en la matriz combinada de
  referencias válidas y huérfanas.
- **SC-005**: El 100 % de los casos de regresión de Agenda, Veus, Comunicats, Foto del Mes y Comercio
  conserva su resultado previo.
- **SC-006**: Las solicitudes equivalentes CA, ES y EN obtienen resultados idénticos de protección.
- **SC-007**: La matriz local completa puede repetirse al menos dos veces con entradas iguales y
  produce en ambas ocasiones los mismos conjuntos protegidos, temporales y eliminados.
- **SC-008**: La feature finaliza con cero cambios en estructuras persistentes, datos existentes,
  estados editoriales, infraestructura, dependencias y superficies públicas.

## Assumptions

- La existencia de una referencia válida en cualquier estado editorial continúa protegiendo la
  imagen; redefinir esa duración pertenece a una futura política general de retención.
- Las reglas actuales de identificación, antigüedad, frontera temporal y eliminación de huérfanos
  son la fuente de verdad y no necesitan cambiar para corregir la omisión de Millora.
- El flujo actual de solicitudes Millora ya crea referencias privadas con el formato esperado; esta
  feature corrige únicamente su visibilidad para la limpieza.
- Agenda, Veus, Comunicats, Foto del Mes y Comercio representan la regresión obligatoria de las
  secciones ya soportadas.
- El repositorio principal es `guiapineda-strapi`; `guiapineda-astro` solo contiene los artefactos
  SDD y no requiere cambios funcionales.
- La base de datos y sus archivos asociados se mantienen intactos durante todas las fases de esta
  feature salvo una autorización humana posterior que modifique expresamente el alcance.
