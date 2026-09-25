# Data Model: Integridad de imágenes privadas en cuarentena de Millorem Pineda

## Persistent Change Declaration

- **Schema changes**: none.
- **Migrations**: none.
- **Persistent data changes**: none.
- **SQLite reads or writes required by implementation/QA**: none.
- **Generated type changes**: none.

Este documento describe entidades y relaciones ya existentes. No autoriza cambios de modelo.

## Existing Entity: Solicitud Millora

| Attribute | Existing shape | Relevance to Feature 007 |
|---|---|---|
| Identity | Documento privado existente | Permite que el inventario recorra cada solicitud. |
| `idioma_solicitud` | exactly `ca`, `es` or `en` | No participa en la limpieza; prueba neutralidad lingüística. |
| `imatge_quarantena_id` | Optional private string, length 32 | Única referencia que debe incorporarse al conjunto protegido. |
| `imatge` | Optional single image Media field | No se consulta durante cleanup de cuarentena. |
| `estado_solicitud` | `pendent`, `en_revisio`, `aprovat` or `rebutjat` | No filtra protección; cualquier referencia existente continúa protegida. |

### Existing validation and cardinality

- Cero o una referencia de cuarentena por solicitud Millora.
- Cuando la creación almacena imagen, el ID es hexadecimal en minúsculas de 32 caracteres.
- El campo puede estar ausente o ser nulo porque la imagen de Millora es opcional.
- Esta feature no revalida, reescribe ni rellena registros existentes.

## Existing Entity: Private Quarantine Image

| Attribute | Existing shape | Cleanup use |
|---|---|---|
| `id` | 32 lowercase hexadecimal characters | Se compara exactamente con el conjunto de referencias. |
| File extension | `.webp`, with defensive `.jpg`/`.png` compatibility | Limita los archivos conocidos candidatos. |
| `mtimeMs` | Filesystem modification time | Base del cálculo de antigüedad. |
| Path | Under the configured private quarantine root | Lookup and deletion remain private filesystem operations. |
| Size/MIME | Existing stored-file metadata | No cambia la clasificación de huérfanos en esta feature. |

Los archivos de nombre, extensión o tipo desconocidos no forman parte del inventario automático y
no se eliminan por esta limpieza.

## Existing Entity: Protected Reference Set

Conjunto efímero en memoria construido antes de listar o borrar archivos.

### Sources after Feature 007

| Submission type | UID | Reference fields |
|---|---|---|
| Agenda | `api::solicitud-agenda.solicitud-agenda` | `imatge_quarantena_id` |
| Veu | `api::solicitud-veu.solicitud-veu` | `imatge_quarantena_id` |
| Comunicat | `api::solicitud-comunicat.solicitud-comunicat` | `imatge_quarantena_id` |
| Foto del Mes | `api::solicitud-foto-mes.solicitud-foto-mes` | `imatge_quarantena_id` |
| Millora | `api::solicitud-millora.solicitud-millora` | `imatge_quarantena_id` |
| Comercio | `api::solicitud-comercio.solicitud-comercio` | `imagen_principal_quarantena_id`, `logo_quarantena_id`, every entry in `galeria_quarantena_ids` |

### Collection rules

- Each source is read in pages of 100 until a short page is returned.
- Only non-empty strings are added.
- Duplicate IDs collapse into one entry.
- The set is complete before filesystem enumeration begins.
- Failure to complete any source prevents deletion based on a partial set.

## Existing Entity: Cleanup Candidate

Una imagen conocida que aparece en el listado privado actual.

### Classification

```text
known file
├── id in protected reference set -> referenced -> preserve
└── id absent from protected set
    ├── now - mtimeMs < graceMs -> recent -> preserve temporarily
    └── now - mtimeMs >= graceMs -> eligible -> attempt deletion
```

La igualdad exacta al periodo de gracia pertenece a `eligible`. Un timestamp futuro produce edad
negativa y pertenece a `recent`.

## State Transitions

Feature 007 no añade estados persistentes ni modifica transiciones editoriales. La clasificación de
una ejecución es efímera:

```text
referenced -> preserved
recent orphan -> preserved until a later run
eligible orphan -> deleted | missing | error
```

- `deleted`: el helper localizó y retiró el archivo.
- `missing`: el archivo ya no estaba disponible al intentar borrarlo.
- `error`: el borrado individual falló; se conserva evidencia y se continúa.

## Language and Privacy

- CA, ES y EN comparten exactamente la misma relación UID/campo/ID.
- Idioma, contenido, email y estado editorial no se proyectan ni se usan para clasificar archivos.
- No se publica, copia, serializa ni transmite ningún archivo por efecto de esta feature.
- El harness futuro utilizará exclusivamente archivos sintéticos bajo un directorio temporal.
