# Implementation Plan: Integridad de imágenes privadas en cuarentena de Millorem Pineda

**Branch**: `007-millora-quarantine-image-integrity` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-millora-quarantine-image-integrity/spec.md`

## Summary

El cleanup de cuarentena recopila referencias de cinco tipos de solicitud, pero omite el UID de
Millorem Pineda aunque esta sección conserva exactamente el mismo campo escalar privado que Agenda,
Veus, Comunicats y Foto del Mes. El cambio de producto se limita a incorporar el UID real de
Millora al registro existente. Un harness persistente, aislado del almacenamiento real, demostrará
protección, limpieza de huérfanos, frontera temporal, paginación, fallo conservador, determinismo y
regresión de las cinco secciones previamente soportadas.

## Technical Context

**Language/Version**: JavaScript CommonJS sobre Node.js 20–24

**Primary Dependencies**: Strapi 5.41.1 Documents Service; módulos estándar de filesystem; servicio privado de imágenes existente

**Storage**: filesystem privado de cuarentena; SQLite existente permanece fuera del flujo y sin cambios

**Testing**: harness Node persistente con `node:assert`, fixtures temporales controladas y doble en memoria del Documents Service

**Target Platform**: proceso backend Strapi con cron diario habilitado

**Project Type**: aplicación web en dos repositorios; cambio funcional exclusivamente backend

**Performance Goals**: conservar paginación de 100 solicitudes y añadir una única consulta paginada de sección por ejecución

**Constraints**: cambio mínimo; sin schema, migración, datos existentes, nueva seam productiva, dependencia, infraestructura, servicio externo, cambio de grace period ni arranque de Strapi durante QA

**Scale/Scope**: seis UIDs protegidos tras el cambio; Millora aporta un único campo opcional de referencia; regresión de cinco secciones existentes

## Constitution Check

*GATE inicial y posterior al diseño: PASS.*

| Principio | Evaluación antes de research | Evaluación después del diseño |
|---|---|---|
| I. Producto local y participación editorial | PASS: se preserva una aportación privada durante moderación humana; no se altera publicación. | PASS: diseño limitado a integridad de cuarentena. |
| II. Arquitectura static-first | PASS: no cambia navegación pública, build ni acceso público al CMS. | PASS: no se añade runtime público. |
| III. Participación moderada, privacidad y seguridad | PASS: corrige un defecto real dentro de una zona de cuarentena sensible. | PASS: no se debilitan validación, normalización, preview ni moderación. |
| IV. Integridad e infraestructura verificada | PASS: no se abre, migra ni modifica SQLite; no hay operación destructiva sobre datos reales. | PASS: QA usa únicamente fixtures temporales y dobles controlados. |
| V. Simplicidad y coste proporcional | PASS: se investiga primero y se conserva el diseño existente. | PASS: un UID, un harness y cero dependencias o servicios nuevos. |
| VI. Paridad CA/ES/EN y no regresión | PASS: el cleanup es neutral al idioma; se exige matriz explícita de regresión. | PASS: CA/ES/EN se prueban como datos equivalentes sin ramas nuevas. |
| VII. Repositorios coordinados y contratos | PASS: producto en backend; frontend aloja únicamente SDD. | PASS: no existe contrato runtime nuevo entre repositorios. |
| Workflow y quality gates | PASS: SPEC completa y PLAN precede TASKS/IMPLEMENT. | PASS: quickstart, allowlist y riesgos quedan cerrados. |

No existen violaciones constitucionales ni excepciones que justificar.

## Current Cleanup Architecture

1. `config/server.js` habilita el cron y `config/cron-tasks.js` ejecuta diariamente el servicio a
   las 03:17 sin parámetros especiales.
2. `collectReferencedPrivateImageIds` recorre secuencialmente `SECTION_UIDS`, consulta páginas de
   100 documentos y termina una sección cuando recibe menos de 100 filas.
3. Agenda, Veus, Comunicats y Foto del Mes usan `imatge_quarantena_id`; Comercio usa principal,
   logo y galería. Cualquier string no vacío entra en un `Set`, que deduplica referencias.
4. Solo después de completar todas las consultas se lista el filesystem privado. Un fallo o una
   respuesta no-array durante inventario aborta antes de cualquier borrado.
5. El inventario de archivos admite únicamente ficheros regulares con ID hexadecimal de 32
   caracteres y extensión `.webp`, `.jpg` o `.png`; formatos o nombres desconocidos no son
   candidatos automáticos.
6. Una imagen cuyo ID está en el `Set` se conserva antes de considerar su edad. Para las demás,
   `ageMs = now - mtimeMs`: `ageMs < graceMs` se conserva como reciente; igualdad exacta ya es
   elegible. El valor por defecto continúa siendo 24 horas.
7. El borrado no utiliza Strapi Upload: el helper privado localiza el ID exacto y elimina el archivo
   del filesystem. Un archivo desaparecido se contabiliza como `missing`; un error individual se
   registra y la ejecución continúa con los restantes.
8. La repetición converge: referenciados y recientes permanecen; los elegibles borrados dejan de
   aparecer. Dos ejecuciones con fixtures reconstruidas idénticamente deben producir la misma
   clasificación, mientras que dos ejecuciones consecutivas sobre el mismo estado pueden tener
   resúmenes distintos porque la primera ya retiró archivos.

## Root Cause and Technical Design

El UID real es `api::solicitud-millora.solicitud-millora`. Su schema define una única referencia
opcional `imatge_quarantena_id`, privada y de longitud 32, igual que las cuatro secciones escalares
ya soportadas. El flujo de creación guarda en ese campo un ID hexadecimal de 32 caracteres y el
flujo de moderación ya sabe leerlo y retirarlo.

La causa queda aislada a la ausencia de ese UID en `SECTION_UIDS`. Al incorporarlo antes del caso
especial de Comercio, la rama genérica existente proyectará y recopilará el campo correcto. No se
añadirá validación nueva al recolector: referencias nulas, ausentes, no-string o vacías ya se omiten;
una string malformada no puede coincidir con un archivo candidato válido; un ID válido sin archivo
no protege ningún otro ID.

No se modifican helpers, schema, creación, moderación, cron, almacenamiento, grace period ni plugin
Upload. No se necesita una seam nueva: el servicio ya recibe `strapi`, `now` y `graceMs`, y el root
de cuarentena ya puede dirigirse a un directorio temporal controlado.

## QA Design

Se creará un harness persistente en el repositorio backend:
`scripts/qa/millora-quarantine-image-integrity-qa.mjs`.

Usará únicamente módulos Node existentes, un directorio nuevo bajo el temporal del sistema,
identificadores fijos válidos, mtimes controlados, un reloj fijo y un doble en memoria limitado a
`strapi.documents(uid).findMany`. El listado y borrado reales del servicio se ejecutarán solo contra
esas fixtures; el directorio se retirará en `finally` y el valor previo de la variable de entorno se
restaurará. No se cargará Strapi ni SQLite.

Matriz obligatoria:

1. UID Millora presente una vez; cinco UIDs anteriores, batch 100, grace y cron sin cambios.
2. Millora referenciada reciente y antigua: ambas preservadas.
3. Millora huérfana dentro del grace period y con timestamp futuro: preservadas temporalmente.
4. Millora huérfana antigua y exactamente en la frontera: elegibles y eliminadas.
5. Null, ausencia, string vacía, tipo no-string, string malformada e ID válido sin archivo: ninguna
   protege un archivo distinto.
6. Duplicados: un mismo ID se deduplica sin cambiar su protección.
7. Paginación de 101 solicitudes Millora: lecturas con `start=0` y `start=100`, sin perder IDs.
8. Agenda, Veus, Comunicats y Foto del Mes con referencia escalar antigua: preservadas.
9. Comercio con principal, logo y galería antiguas: todas preservadas.
10. Conjunto mixto: cero eliminaciones fuera de los huérfanos elegibles esperados.
11. Fallo de una consulta tardía y resultado no-array: rechazo conservador y cero borrados.
12. Ejecución reconstruida dos veces con entradas idénticas: mismos conjuntos y resumen.
13. Solo ocurren lecturas `findMany`; no existe operación de creación, actualización, borrado de
    documentos, estado editorial ni contenido público.

## Implementation Allowlist

### Product file — backend

- **MODIFY** `guiapineda-strapi/src/services/private-submission-image-cleanup.js`: añadir el UID
  exacto de `solicitud-millora` al registro existente. Ningún otro cambio funcional queda
  autorizado por este PLAN.

### QA file — backend

- **CREATE** `guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`: harness local
  cerrado descrito arriba. No se autoriza modificar `package.json` para ejecutarlo.

### SDD artifacts — frontend

- `specs/007-millora-quarantine-image-integrity/plan.md`
- `specs/007-millora-quarantine-image-integrity/research.md`
- `specs/007-millora-quarantine-image-integrity/data-model.md`
- `specs/007-millora-quarantine-image-integrity/quickstart.md`
- El futuro `tasks.md` será creado exclusivamente por `$speckit-tasks` y podrá registrar evidencia
  durante IMPLEMENT. `spec.md` y su checklist quedan read-only salvo retorno formal a SPECIFY.

### Read-only implementation inputs and regressions

- `guiapineda-strapi/src/services/private-submission-image.js`
- `guiapineda-strapi/src/services/private-submission-image-reference.js`
- `guiapineda-strapi/src/services/internal-submission-request.js`
- `guiapineda-strapi/src/services/private-moderation-image.js`
- `guiapineda-strapi/src/services/submission-moderation-lifecycle.js`
- `guiapineda-strapi/src/api/solicitud-*/content-types/*/schema.json`
- `guiapineda-strapi/config/server.js`
- `guiapineda-strapi/config/cron-tasks.js`
- `guiapineda-strapi/config/plugins.js`
- `guiapineda-strapi/package.json` y lockfile
- `guiapineda-astro/scripts/qa/commerce-submission-qa.mjs`

Todo archivo no incluido en las tres listas anteriores queda fuera del allowlist. Si IMPLEMENT
demuestra que necesita modificar otro archivo, debe detenerse y volver a PLAN antes de hacerlo.

## Project Structure

### Documentation (this feature)

```text
specs/007-millora-quarantine-image-integrity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md                         # futuro output de $speckit-tasks
```

No se crea `contracts/`: la feature no introduce HTTP, evento, interfaz pública ni contrato entre
repositorios. El contrato interno de limpieza queda descrito en `research.md`, `data-model.md` y
`quickstart.md`.

### Source Code

```text
../guiapineda-strapi/
├── src/services/
│   └── private-submission-image-cleanup.js       # modificar
└── scripts/qa/
    └── millora-quarantine-image-integrity-qa.mjs # crear

guiapineda-astro/
└── specs/007-millora-quarantine-image-integrity/ # SDD únicamente
```

**Structure Decision**: el producto y el harness permanecen juntos en el backend porque la feature
no cambia ninguna superficie frontend. El repositorio frontend conserva exclusivamente el flujo
SDD central del proyecto.

## Risks and Mitigations

| Riesgo | Mitigación de diseño |
|---|---|
| UID incorrecto o duplicado | Aserción de conjunto exacto y aparición única en el harness. |
| Regresión de una sección existente | Matriz explícita de los cinco UIDs y de los tres campos de Comercio. |
| Proteger huérfanos por referencias defectuosas | Casos nulo, ausente, tipo incorrecto, malformado e inexistente sin cambiar el contrato compartido. |
| Error de inventario seguido de borrado parcial | Pruebas de throw y respuesta no-array antes de listar o borrar. |
| Frontera temporal interpretada de forma distinta | Reloj fijo y casos `<`, `=` y `>` respecto al grace period actual. |
| Harness apunta al almacenamiento real | `mkdtemp`, root temporal obligatorio, guardas de ruta y cleanup/restauración en `finally`. |
| Carrera entre listado y borrado | Preservar `missing/errors` y comportamiento best-effort existentes; no introducir transacciones. |
| Falsa idempotencia por comparar dos estados distintos | Distinguir convergencia sobre el mismo estado de determinismo con fixtures reconstruidas. |
| Expansión oportunista del servicio | Allowlist de un único archivo productivo y prohibición de nueva abstracción o seam. |

## Complexity Tracking

No aplica. El diseño no introduce violaciones constitucionales, proyectos nuevos, abstracciones
adicionales ni infraestructura.
