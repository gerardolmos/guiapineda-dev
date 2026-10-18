# Feature Specification: Idiomas en el envío de Comunicats

**Feature Branch**: main (sin commit/push)
**Created**: 2026-10-17
**Status**: Ready for planning
**Input**: Resolver exclusivamente F05 permitiendo cambiar idioma conservando solo el borrador compatible actual.

## User Scenarios & Testing
### US1 — Cambiar idioma conservando el trabajo permitido (P1)
Como remitente quiero cambiar entre CA/ES/EN desde cualquier paso del envío sin perder los campos ya admitidos por el borrador.
**Why this priority**: Actualmente el selector está oculto y no hay alternativa dentro del recorrido.
**Independent Test**: Completar datos y navegar por las seis parejas de idiomas; comprobar ruta y campos restaurados.
**Acceptance Scenarios**:
1. Given cualquiera de los tres pasos, when busco el selector, then puedo identificar idioma actual y acceder a los otros dos.
2. Given datos compatibles escritos, when cambio idioma, then llego a la ruta equivalente con los mismos datos permitidos y el primer paso del formulario.
3. Given móvil o escritorio, when uso el selector, then está visible y sus enlaces son utilizables con teclado.

### US2 — Reiniciar autorizaciones y completar el envío (P1)
Como remitente quiero reverificar y consentir en el idioma nuevo sin transportar autorizaciones ni archivos del formulario anterior.
**Why this priority**: La continuidad del borrador no equivale a continuidad de verificación.
**Independent Test**: Cambiar con imagen, consentimiento y email verificado; comprobar exclusiones, reverificar, consentir y enviar con éxito simulado.
**Acceptance Scenarios**:
1. Given archivo, consentimiento y verificación previos, when cambio idioma, then no se restauran archivo, consentimiento, código, token ni estado verificado.
2. Given borrador restaurado, when reverifico y consiento explícitamente, then puedo enviar normalmente; el éxito limpia el borrador.
3. Given datos restaurados, when reseteo el formulario, then se mantienen las reglas actuales de limpieza y no reaparece el borrador al recargar.

### Edge Cases
Borrador vacío, campos parciales, storage no disponible: conservar degradación existente sin ampliar persistencia. Email de contacto se conserva como texto permitido, nunca como prueba de verificación. El paso visual no se persiste. No se transporta estado vía URL. Ninguna consulta a servicios reales en QA.

## Requirements
- **FR-01**: Comunicats permite cambiar CA/ES/EN desde su propio recorrido, en todos sus pasos.
- **FR-02**: Opciones apuntan exactamente a /envia-un-comunicat, /es/enviar-comunicado y /en/comunicats/send-an-announcement.
- **FR-03**: Sobrevive únicamente el borrador compatible existente: tipo de remitente, autor, título, resumen, contenido, nombre y email de contacto.
- **FR-04**: No persisten archivos al cambiar idioma.
- **FR-05**: No persiste consentimiento al cambiar idioma.
- **FR-06**: No persisten token ni código de verificación al cambiar idioma.
- **FR-07**: No persiste estado verified al cambiar idioma.
- **FR-08**: Se puede reverificar normalmente tras cambiar idioma y completar el envío; reset y limpieza por éxito conservan comportamiento actual.
- **FR-09**: Comportamiento equivalente en CA/ES/EN, móvil y escritorio.
- **FR-10**: Backend intacto, sin modificación de contratos ni protocolo de verificación.
- **FR-11**: Ninguna operación accede a SQLite.

## Key Entities
Borrador de Comunicats existente, restringido a siete campos. Verificación efímera y consentimiento independientes del borrador. Sin nuevas entidades.

## Success Criteria
- **SC-01**: Las seis transiciones dirigidas de idioma restauran los siete campos permitidos y llegan a la ruta correcta.
- **SC-02**: Cero archivos, consentimiento, tokens, códigos o estado verificado transportados en esas transiciones.
- **SC-03**: Reverificación y envío posterior funcionan en los tres idiomas; reset y éxito limpian borrador como antes.
- **SC-04**: Selector visible en los tres pasos en móvil y escritorio; cero modificaciones backend, dependencias o accesos SQLite.

## Assumptions
Solo frontend. Aprovechar drafts y selector existentes, sin rediseñar navegación global, rutas, protocolos o validaciones. No resolver F06/F08, Reports, otros formularios, SEO, legal, cookies o retención. No servicios reales, Strapi, SQLite, commit, push ni deploy. CLARIFY innecesario: rutas y política de persistencia explícitas y comprobables.
