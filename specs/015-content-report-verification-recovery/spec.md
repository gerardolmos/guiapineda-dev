# Feature Specification: Recuperación de verificación en denuncias multisección

**Feature Branch**: main (sin commit/push)
**Created**: 2026-10-17
**Status**: Ready for planning
**Input**: Resolver F07 exclusivamente; detener después de 015 si hay cambios productivos.

## User Scenarios & Testing
### US1 — Recuperar una verificación rechazada (Priority: P1)
Como visitante que denuncia un contenido, necesito saber que debo verificar otra vez mi email cuando la autorización falta o ya no es válida, conservando el motivo y contexto.
**Why this priority**: El mensaje actual atribuye el error a la referencia e indica recargar incorrectamente.
**Independent Test**: Verificar email, enviar denuncia con respuesta de verificación rechazada, comprobar limpieza sensible y contexto conservado, verificar de nuevo y enviar manualmente con éxito.
**Acceptance Scenarios**:
1. Given una denuncia preparada, when la respuesta exige verificación, then se pide verificar email y no recargar por referencia inválida.
2. Given autorización inválida o consumida, when el servidor la rechaza, then código/token/email se limpian, motivo/contexto permanecen y envío queda deshabilitado hasta nueva verificación.
3. Given error anterior, when el usuario verifica de nuevo y envía explícitamente, then usa un token nuevo y puede completar el recorrido sin reenvío automático.

### US2 — Mantener errores y recorridos existentes (Priority: P1)
Como visitante debo seguir recibiendo el tratamiento anterior para referencias inválidas, límites y fallos de disponibilidad.
**Why this priority**: La corrección no debe alterar otras denuncias ni seguridad.
**Independent Test**: Matriz de clasificación y regresión de Reports, incluida denuncia de Comunicats.
**Acceptance Scenarios**:
1. Given referencia inválida real, when el servidor devuelve su error, then se conserva invalidReference.
2. Given otro error existente o respuesta malformada, when se clasifica, then no se interpreta como éxito ni verificación rechazada sin evidencia suficiente.
3. Given interfaz CA/ES/EN, when se rechaza la verificación, then existe instrucción localizada no vacía y recuperación equivalente.

### Edge Cases
Respuesta sin JSON, null, array, ok incorrecto, reason desconocida, status incompatible; cierre/reapertura tras error; doble envío; token ya rechazado; contexto opcional vacío. No persistir ni publicar datos del report.

## Requirements
### Functional Requirements
- **FR-01**: Verificación requerida no se debe clasificar como referencia inválida.
- **FR-02**: Verificación inválida no se debe clasificar como referencia inválida.
- **FR-03**: Referencia inválida real mantiene su recuperación actual.
- **FR-04**: El usuario puede volver a verificar y completar el recorrido.
- **FR-05**: Motivo/contexto se conservan tras fallo según la política específica de Reports.
- **FR-06**: Token rechazado/consumido y estado verificado no se reutilizan; se limpian email/código/token.
- **FR-07**: Nunca hay retry automático del envío; reenvío exige acción humana.
- **FR-08**: Seguridad, contrato backend y otros submissions permanecen intactos.
- **FR-09**: Feedback y recuperación equivalentes en CA/ES/EN.
- **FR-10**: Ninguna operación accede a SQLite.

## Success Criteria
- **SC-01**: 100% de respuestas válidas 400 con verification:required/invalid conducen a instrucción de verificación.
- **SC-02**: En CA/ES/EN, ambos errores permiten recuperación manual conservando motivo/contexto y sin reutilizar token.
- **SC-03**: Referencia inválida, demás 400, 429, 503, éxito estricto y respuestas malformadas mantienen comportamiento previo.
- **SC-04**: Cero reenvíos automáticos, cambios backend o regresiones verificadas en Reports.

## Assumptions
Frontend guiapineda-astro exclusivamente; backend guiapineda-strapi read-only. Capas: clasificador y consumidor DOM existente. No rutas, dependencia, proveedor ni infraestructura nuevos. CLARIFY innecesario: el contrato es deducible del código y 006/012.
F05/F06/F08, SEO, legal, retención y cookies fuera de alcance. Tras 015 dirty tree: NO iniciar 016 ni hacer commit/push.
Contexto futuro del usuario, sin implementación: automatizar privacidad; 60 días de inactividad propuestos para abandonadas; limpiar privados/imágenes rechazados; separar publicación/privados; trazabilidad mínima justificada; excepción legal para reclamaciones y destrucción al vencer; intervención manual excepcional; sin banner mientras no sea necesario.

## Recovery autorizado — 2026-10-17
FR-10 fue incumplido en el primer intento de QA; el hecho permanece en qa-report.md. El usuario autoriza recuperar únicamente QA pendiente sin ningún nuevo acceso SQLite, preservando implementación y evidencia válida anterior. La evaluación de cierre distingue la infracción histórica de `scope respected after recovery`. No se reejecuta el script histórico incompatible.
