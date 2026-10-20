# Feature Specification: Header Active Section Accuracy

**Feature**: `018-header-active-section-accuracy` | **Branch**: `main` (sin crear rama)
**Created**: 2026-10-20 | **Status**: SDD; pendiente de autorización IMPLEMENT
**Input**: Corregir F06 exclusivamente: identificación activa incorrecta en Agenda/Veus, sin rediseñar menú ni añadir enlaces.

## User Scenarios & Testing

### User Story 1 — Orientación correcta en Agenda y Veus (Priority: P1)
Como visitante, quiero que el encabezado no identifique Guía como mi sección cuando estoy en Agenda o Veus.
**Why this priority**: defecto confirmado que afecta orientación visual y accesible.
**Independent Test**: visitar índice, detalle sintético y formulario de cada sección en CA/ES/EN; comprobar ambas variantes del menú.
**Acceptance Scenarios**:
1. Given cualquier ruta existente de Agenda, When se muestra el menú en escritorio o se abre en móvil, Then ningún enlace del menú principal aparece activo ni contiene aria-current.
2. Given cualquier ruta existente de Veus, When se muestra ese menú, Then se cumple la misma ausencia de estado activo.
3. Given esos destinos con barra final o parámetros de consulta, When se determina la sección, Then el resultado no cambia.

### User Story 2 — Preservar la navegación existente (Priority: P2)
Como visitante, quiero conservar destinos, traducciones, interacción y orientación de las demás secciones.
**Independent Test**: comparar encabezado baseline/final en las rutas de control del contrato.
**Acceptance Scenarios**:
1. Given Tauler, Comunicats o Millorem, When se renderiza el encabezado, Then conserva su enlace activo y su semántica existente.
2. Given Inicio/Guía, categoría o comercio, When se renderiza, Then conserva Guía como activo; Foto del mes y 404 mantienen ausencia de activo.
3. Given otra ruta fuera de Agenda/Veus, When se compara baseline/final, Then no cambia su clasificación ni los cuatro destinos del menú.
4. Given menú móvil, When se abre, se navega o se cierra con Escape, Then conserva el comportamiento y orden de foco existentes.

### Edge Cases
Normalización CA sin prefijo y ES/EN con prefijo; barras finales; segmentos hijos de Agenda/Veus; prefijos parecidos que no son la sección (p. ej. /agenda-extra y /veus-extra, entradas sintéticas, no nuevas rutas). Query/hash no definen la sección. Un menú oculto y uno visible son dos representaciones: no sumar sus atributos como si fueran una única lista.

## Requirements

### Functional Requirements
- **FR-001**: Índices, detalles y formularios existentes de Agenda y Veus no deben activar ningún enlace del menú principal.
- **FR-002**: En esas rutas, ningún enlace de ambas variantes del menú debe tener aria-current; no se asignará a otro enlace como sustituto.
- **FR-003**: CA/ES/EN y escritorio/móvil deben producir la misma clasificación de sección.
- **FR-004**: Deben conservarse enlaces, orden, etiquetas, estilos base, selector de idioma y comportamiento del menú; no añadir nuevas secciones.
- **FR-005**: Las rutas ajenas a Agenda/Veus deben conservar su estado visual y semántica actuales; esta feature no es una revisión global de aria-current.
- **FR-006**: La identificación de Agenda/Veus debe respetar segmentos completos y descendientes, no prefijos similares; barras finales y query/hash no alterarán el resultado.
- **FR-007**: El cambio no debe modificar rutas, contenidos, formularios, traducciones, backend ni persistencia; no depende de017 ni del prerrequisito suspendido.
- **FR-008**: Esta fase crea solo documentación018; cualquier implementación/QA posterior requiere autorización, sin DB/SQLite, datos reales, dependencias, commit/push o despliegue implícitos.

## Success Criteria

### Measurable Outcomes
- **SC-001**: Las 18 combinaciones sección × idioma × tipo de página (índice/detalle/formulario), en dos tamaños, no muestran ni anuncian un enlace incorrectamente actual: 36 comprobaciones.
- **SC-002**: El 100% de las rutas de control definidas conserva destinos y clasificación respecto al baseline.
- **SC-003**: Cero enlaces nuevos y cero diferencias de etiquetas, orden o interacción del menú; solo desaparece el énfasis incorrecto en Agenda/Veus.
- **SC-004**: Cero cambios productivos fuera del encabezado y cero cambios a017, al prerrequisito suspendido o al backend.

## Assumptions
Agenda/Veus no tienen enlace propio en el menú principal; el footer ya permite acceder. Es coherente no marcar ninguno. Se conserva el contrato previo de otras secciones, aunque use aria-current=page para indicar sección en páginas hijas: revisarlo globalmente sería otra decisión. El proyecto es frontend Astro estático con dos repositorios separados; no se accede al CMS para este cambio. CLARIFY no necesario: comportamiento y exclusiones explícitos.
