# Feature Specification: Agenda y Veus — acceso estable

**Feature Branch**: `main` (sin commit/push; directorio independiente de rama)
**Created**: 2026-10-17
**Status**: Ready for planning
**Input**: Resolver exclusivamente F02 del triage post-012 mediante descubribilidad mínima.

## User Scenarios & Testing

### User Story 1 - Encontrar Agenda y participar (Priority: P1)
Como visitante puedo encontrar Agenda aunque aún no haya actividades publicadas.
**Why this priority**: Es una capacidad permanente cuya participación no debe depender de publicaciones previas.
**Independent Test**: Desde Home, encontrar un enlace permanente, abrir el índice vacío y llegar al formulario existente, en CA/ES/EN.
**Acceptance Scenarios**:
1. Given cero actividades, when abro el acceso permanente desde Home o producto, then llego al índice de Agenda de mi idioma.
2. Given índice vacío, when selecciono su CTA de participación, then abre el formulario existente de mi idioma.
3. Given actividades publicadas, when sigo el mismo acceso, then funciona y puedo abrir el detalle existente.

### User Story 2 - Encontrar Veus y participar (Priority: P1)
Como visitante puedo encontrar Veus aunque nadie haya publicado todavía.
**Why this priority**: La misma capacidad permanente y bloqueo de descubrimiento que Agenda.
**Independent Test**: Desde Home, encontrar Veus, abrir índice vacío y formulario en CA/ES/EN.
**Acceptance Scenarios**:
1. Given cero voces, when abro el acceso permanente desde Home o producto, then llego al índice de Veus de mi idioma.
2. Given índice vacío, when selecciono su CTA, then abre el formulario existente de mi idioma.
3. Given voces publicadas, when sigo el acceso, then funciona y puedo abrir el detalle existente.

### Edge Cases
- Ambas secciones vacías o solo una vacía: los accesos siguen disponibles.
- Móvil y escritorio: enlaces visibles y utilizables con teclado, sin depender de tarjetas o filtros.
- Cambio de idioma: conservar los destinos de las secciones existentes.

## Requirements
### Functional Requirements
- **FR-01**: Agenda debe tener al menos un acceso interno permanente con cero publicaciones.
- **FR-02**: Veus debe tener al menos un acceso interno permanente con cero publicaciones.
- **FR-03**: Los accesos deben existir con nombres y destinos correctos en CA/ES/EN.
- **FR-04**: Los accesos no deben depender de tarjetas dinámicas ni del contenido publicado.
- **FR-05**: Cada acceso debe abrir el índice existente de su sección e idioma.
- **FR-06**: Cada índice vacío debe mantener el acceso al formulario existente de su idioma.
- **FR-07**: No se deben crear rutas nuevas ni alterar los destinos de navegación existentes.
- **FR-08**: Se debe preservar la arquitectura static-first, sin consultas nuevas durante la navegación.
- **FR-09**: No modificar backend, datos, dependencias, infraestructura ni comportamiento editorial.
- **FR-10**: Si se incluye F06, solo puede corregir orientación de Agenda/Veus; si no es necesario para F02, queda pendiente documentado.

## Success Criteria
### Measurable Outcomes
- **SC-01**: En las 6 combinaciones sección/idioma, Home permite llegar al índice en un clic tanto con cero contenido como con publicaciones.
- **SC-02**: En las 6 combinaciones, el índice vacío permite llegar al formulario en un clic adicional.
- **SC-03**: Los destinos previos de Home, Tauler, header y footer se conservan en los tres idiomas; Tauler mantiene sus filtros y detalles con contenido.
- **SC-04**: Los 6 accesos son utilizables en móvil y escritorio, incluidos foco de teclado y activación.

## Assumptions
- Alcance: frontend `guiapineda-astro`, capa pública de navegación; `guiapineda-strapi` solo se verifica por Git. Contratos frontend/backend sin cambios.
- El objetivo es acceso mínimo estable, no promoción editorial. Footer es candidato válido; no se prescribe header.
- No se envían formularios: solo se valida navegación hasta el formulario existente.
- Se excluyen F04/F05/F07/F08, SEO, estilos globales, refactors y todo el alcance operativo excluido por el usuario.
- CLARIFY innecesario: objetivo, límites y criterio de elección están determinados.
