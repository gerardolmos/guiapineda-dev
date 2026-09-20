# Research: Paridad EN para el envío de Comunicats

## Decision 1: Extender el formulario compartido, no duplicarlo

**Decision**: La ruta EN montará `CommunicatSubmissionPage.astro`; la plantilla y
`CommunicatSubmissionFlow.astro` ampliarán su unión de idioma y su copy a CA/ES/EN. La lógica
cliente `comunicatSubmissionFlow.ts` y el markup funcional seguirán siendo únicos.

**Rationale**: CA y ES ya comparten exactamente el flujo que EN debe reproducir. Mantener una sola
estructura evita divergencias en campos, validación, revisión, imagen y seguridad.

**Alternatives considered**:

- Copiar una página y componente exclusivos para EN: rechazado por duplicación y riesgo de deriva.
- Rediseñar o extraer un nuevo sistema general de traducciones: rechazado; excede la paridad mínima.

## Decision 2: Ruta anidada y CTA dentro de la sección inglesa

**Decision**: La CTA de `/en/comunicats/` usará `/en/comunicats/send-an-announcement/`; se completarán
solo los valores vacíos `ctaTitle` y `ctaButton` del diccionario EN.

**Rationale**: Es la decisión humana de CLARIFY, mantiene la jerarquía de la sección y reutiliza el
componente de CTA existente.

**Alternatives considered**:

- `/en/send-an-announcement/`: rechazado en CLARIFY por quedar aislado en primer nivel.
- CTA específica fuera del componente actual: rechazada porque no aporta comportamiento nuevo.

## Decision 3: Copy EN explícito para cada rama visible

**Decision**: Sustituir selecciones binarias por un mapa CA/ES/EN dentro de los dos archivos que hoy
poseen el copy del formulario. Incluir metadatos, opciones, ayudas, errores, estados, notas laterales
y destino de éxito.

**Rationale**: Ampliar solo el tipo de `lang` provocaría que varios ternarios cayeran en castellano.
Un mapa exhaustivo hace visible la cobertura y conserva CA/ES sin tocar sus cadenas.

**Alternatives considered**:

- Mantener ternarios anidados: posible, pero menos verificable y propenso a fallback accidental.
- Mover todo el formulario a los JSON globales: refactor amplio sin necesidad funcional.

## Decision 4: Ampliar solo las dos allowlists específicas de Comunicats

**Decision**: Añadir `en` al conjunto de idiomas de `comunicat-submission.mjs` y a
`SECTION_CONFIG.comunicat.allowedLanguages` en Strapi.

**Rationale**: Son las dos barreras actuales que rechazan EN. La verificación de email, el mailer y
el controlador compartido ya admiten CA/ES/EN; el transporte y la moderación son agnósticos.

**Alternatives considered**:

- Eliminar allowlists o usar cualquier string de dos caracteres: rechazado por debilitar contrato.
- Cambiar el conjunto global de Strapi: rechazado; Comunicats tiene una restricción específica y el
  alcance no autoriza alterar otras secciones.

## Decision 5: Enum Strapi aditivo, sin migración

**Decision**: Añadir `en` al enum `idioma_solicitud` de `solicitud-comunicat` sin cambiar atributos,
estados ni datos existentes.

**Rationale**: El modelo debe poder persistir el valor ya aceptado por el servicio. CA y ES siguen
siendo válidos y no hay transformación de registros.

**Alternatives considered**:

- Guardar EN como CA/ES o campo libre: rechazado por pérdida de integridad.
- Crear otro content type: rechazado porque rompería la moderación compartida.

## Decision 6: Seguridad y moderación permanecen estructuralmente iguales

**Decision**: No modificar verificación, token, transporte interno, autenticación, cuarentena,
lifecycle ni publicación editorial. Validar que EN atraviesa esas mismas piezas.

**Rationale**: Todas ya son comunes y compatibles con EN. Tocarlas aumentaría el riesgo sin resolver
ninguna carencia detectada.

**Alternatives considered**:

- Crear un endpoint o circuito EN: rechazado porque duplicaría controles sensibles.
- Permitir envío local sin verificación para facilitar QA: rechazado por la Constitution.

## Decision 7: Evidencia local proporcional y E2E real diferido

**Decision**: Usar builds, sondas Node sobre validadores exportados, inspección y matriz local
CA/ES/EN. No añadir framework de pruebas. Mantener el E2E integrado real como gate de predespliegue.

**Rationale**: Ambos repositorios carecen de suite propia y GUIAPINEDA no tiene entorno desplegado.
Las capas puras pueden demostrarse localmente; email, Function desplegada, Strapi remoto y
cuarentena integrada no pueden declararse E2E real sin ese entorno.

**Alternatives considered**:

- Añadir Vitest/Playwright: rechazado como dependencia y alcance de QA no aprobados.
- Desplegar para cerrar la feature: rechazado explícitamente por alcance.
- Presentar mocks como E2E real: rechazado por la SPEC.
