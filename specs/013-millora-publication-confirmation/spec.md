# Feature Specification: Millora Publication Confirmation

**Feature Branch**: `main` (ambos repositorios; sin rama nueva)
**Created**: 2026-10-17
**Status**: Specified
**Input**: Corregir exclusivamente N01: la confirmación de aprobación de Millorem contradice su publicación existente.

## User Scenarios & Testing

### User Story 1 — Aprobar con conocimiento del efecto (Priority: P1)
Como editor quiero conocer antes de aprobar una solicitud Millorem que esa acción publica la mejora en Strapi y que su aparición en la web requiere el build/deploy posterior.

**Why this priority**: Evita una aprobación bajo una premisa falsa de no publicación.
**Independent Test**: Abrir la confirmación de una solicitud Millorem en revisión sin publicar datos reales.

**Acceptance Scenarios**:
1. Dada una solicitud Millorem en revisión, cuando el editor pulsa aprobar, la confirmación informa que aprobar publica la Millora en Strapi y no afirma lo contrario.
2. En esa misma confirmación, se distingue la publicación editorial de la actualización de la web estática tras el build/deploy correspondiente; no se promete inmediatez ni automatismo.
3. Al cancelar, no se ejecuta la aprobación ni cambia el estado de la solicitud.
4. Al aceptar, continúa exactamente la acción existente, sin añadir publicaciones, rebuilds ni pasos nuevos.
5. Al aprobar Agenda, Veus, Comunicats, Foto del Mes o Comercio, se conserva su mensaje y semántica actuales. Rechazar e iniciar revisión no cambian en ninguna sección.

### Edge Cases
- Solicitud sin imagen: la explicación de publicación sigue siendo cierta; no implica imagen obligatoria.
- Acción ocupada: conserva la protección actual frente a otra ejecución.
- Aprobación fallida: se conserva el tratamiento actual; la confirmación previa no es un mensaje de éxito.
- Cancelar es distinto de aprobar; no debe enviar una acción.

## Requirements

### Functional Requirements
- **FR-01**: La confirmación previa de aprobar Millorem MUST NOT afirmar que no publica contenido.
- **FR-02**: MUST informar que aprobar publica la Millora en Strapi.
- **FR-03**: MUST explicar que la web estática no cambia inmediatamente y reflejará el contenido después del build/deploy correspondiente.
- **FR-04**: Las demás solicitudes y las acciones de rechazo/inicio de revisión MUST conservar su semántica y mensajes actuales.
- **FR-05**: MUST conservar el comportamiento real de approve y su cancelación; no añadir acciones ni modificar la publicación.
- **FR-06**: MUST NOT modificar ningún flujo público ni infraestructura.
- **FR-07**: MUST NOT acceder a SQLite/DB ni cambiar schemas, datos, dependencias, permisos, autenticación o imágenes.

### Key Entities
- Solicitud: sección y estado editorial existentes; sin cambios de datos.
- Confirmación: información previa y decisión aceptar/cancelar, sin persistencia nueva.

## Success Criteria

### Measurable Outcomes
- **SC-01**: La confirmación Millorem contiene los tres hechos: aprobación publica, web no inmediata y actualización tras build/deploy; cero negaciones falsas de publicación.
- **SC-02**: Cancelar genera cero acciones; aceptar genera una sola acción equivalente a la anterior.
- **SC-03**: Las cinco secciones restantes y las otras dos acciones conservan sus mensajes y efectos observables.
- **SC-04**: Cero cambios funcionales en publicación, flujos públicos o datos; ninguna dependencia nueva ni acceso a DB durante validación.

## Assumptions
- El idioma administrativo actual es catalán; se conserva. No se crean superficies CA/ES/EN públicas.
- La publicación al aprobar Millorem es intencionada y está fuera del cambio autorizado.
- Aprobación en Strapi y build/deploy posterior son hechos distintos; no se afirma que haya automatización activa.
- SDD se mantiene en guiapineda-astro, como en features anteriores; el único cambio productivo corresponde al panel administrativo de guiapineda-strapi.
- Baseline frontend 34bd6509ba3481605ed2dc536e26e807fecea7ae; backend 47ca26a0a54fd1c0193afd659b6ba3657b264793, main/main limpios y 0/0 local.
- Constitution I–VII respetada: corrección de defecto real permitida en Millorem, sin reabrir su publicación; privacidad, static-first y separación de repositorios intactas.
- Fuera de alcance: F02/F04/F05/F06/F07/F08 y cualquier cambio de publicación, servicio, lifecycle, schema, Media, permisos, frontend público, infraestructura, commit o push.
