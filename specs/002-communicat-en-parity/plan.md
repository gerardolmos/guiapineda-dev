# Implementation Plan: Paridad EN para el envío de Comunicats

**Branch**: `002-communicat-en-parity` (Spec Kit context; Git remains on `main`) |
**Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-communicat-en-parity/spec.md`

## Summary

Añadir la tercera variante lingüística al flujo existente de Comunicats sin duplicar su lógica:
activar la CTA inglesa, crear `/en/comunicats/send-an-announcement/`, ampliar la plantilla y el
componente compartidos con copy EN, y admitir `idioma_solicitud: "en"` en los dos límites que hoy
son específicos de Comunicats: la Function y Strapi. El contrato de datos, la verificación de email,
el token de un solo uso, el transporte autenticado, la cuarentena de imagen y la moderación privada
permanecen intactos.

## Technical Context

**Language/Version**: Astro/TypeScript con Node.js `>=22.12.0` en `guiapineda-astro`; JavaScript
CommonJS sobre Strapi `5.41.1` con Node.js `>=20.0.0 <=24.x.x` en `guiapineda-strapi`

**Primary Dependencies**: Astro `^7.2.4`, Netlify Functions y APIs web existentes; Strapi `5.41.1`
y `sharp` `0.33.5`; ninguna dependencia nueva

**Storage**: SQLite actual de Strapi para desarrollo y almacén privado de imágenes existente; sin
nueva persistencia ni migración de datos

**Testing**: builds existentes de Astro y Strapi, sondas locales con Node sobre validadores
exportados, inspección estática y matriz manual local CA/ES/EN; no existe suite propia automatizada

**Target Platform**: sitio público estático Astro, Function segura de recepción y Strapi privado

**Project Type**: aplicación web static-first con Function de participación y CMS privado en dos
repositorios independientes

**Performance Goals**: mismo coste y recorrido que CA/ES; la nueva página se genera estáticamente y
no añade peticiones, servicios ni procesamiento adicional

**Constraints**: extensión aditiva, CA/ES sin regresiones, `en` como único idioma nuevo, sin
rediseño, dependencias, infraestructura, despliegue ni acceso directo del navegador a Strapi

**Scale/Scope**: una ruta, una CTA y una variante de copy EN; una allowlist ampliada en la Function
y otra en Strapi; un enum de Strapi ampliado; tres idiomas funcionalmente equivalentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-design gates

| Constitutional principle | Gate | Result |
|---|---|---|
| I. Editorial participation | EN debe producir solo una solicitud privada pendiente de revisión | PASS |
| II. Static-first architecture | La nueva ruta debe ser Astro estática y usar la Function existente | PASS |
| III. Privacy and security | Preservar verificación, token de un uso, PII privada, autenticación y cuarentena | PASS |
| IV. Verified infrastructure | No desplegar ni tratar el E2E remoto como disponible | PASS |
| V. Simplicity and cost | Extender componentes y contratos existentes sin servicios ni dependencias | PASS |
| VI. Multilingual parity/no regression | Matriz CA/ES/EN y copy visible completo, manteniendo CA/ES | PASS |
| VII. Repository boundaries | Declarar archivos y contrato coordinado en ambos repositorios | PASS |
| Workflow and quality | Diff, builds, pruebas locales, estado Git y gate diferido documentado | PASS |

### Post-design re-check

El diseño mantiene todos los gates. La superficie pública nueva es estática; el navegador sigue
hablando solo con `/api/submissions/comunicat`; la Function continúa consumiendo la verificación
antes de usar el canal interno autenticado; Strapi crea el mismo tipo privado con estado `pendent` y
la misma cuarentena. No hay excepciones constitucionales ni cambios de infraestructura.

## Project Structure

### Documentation (this feature)

```text
specs/002-communicat-en-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── communicat-en-submission-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (`guiapineda-astro`)

```text
src/
├── i18n/
│   └── en.json                                  # modify: CTA EN
├── pages/
│   ├── comunicats/index.astro                  # modify: URL EN de la CTA
│   └── en/comunicats/
│       └── send-an-announcement.astro         # create: ruta canónica EN
├── templates/
│   └── CommunicatSubmissionPage.astro         # modify: lang EN y metadatos
└── components/
    └── CommunicatSubmissionFlow.astro              # modify: copy y destinos EN

netlify/functions/
└── comunicat-submission.mjs                         # modify: allowlist CA/ES/EN
```

### Source Code (`../guiapineda-strapi`)

```text
src/
├── services/
│   └── internal-submission-request.js         # modify: allowlist EN de comunicat
└── api/solicitud-comunicat/content-types/solicitud-comunicat/
    └── schema.json                                  # modify: enum CA/ES/EN
types/generated/
└── contentTypes.d.ts                           # regenerate: reflejo tipado del schema
```

**Structure Decision**: conservar los dos repositorios y la arquitectura existentes. El frontend
reutiliza una sola plantilla, un solo componente y una sola lógica cliente; la Function sigue siendo
la frontera pública y Strapi la frontera privada. No se crean servicios, adaptadores ni abstracciones
nuevas.

## Proposed Architecture

### 1. Entrada pública EN

- Completar `comunicats.ctaTitle` y `comunicats.ctaButton` en `src/i18n/en.json`; el texto y la nota
  ya existen.
- Ampliar `submitUrl` en `src/pages/comunicats/index.astro` para que EN apunte exactamente a
  `/en/comunicats/send-an-announcement/`. CA y ES conservan sus URLs.
- Crear esa página como wrapper mínimo de `CommunicatSubmissionPage` con `lang="en"`, siguiendo los
  wrappers CA/ES existentes.

### 2. Formulario compartido y copy EN

- Ampliar el tipo de idioma de `CommunicatSubmissionPage.astro` y
  `CommunicatSubmissionFlow.astro` a `"ca" | "es" | "en"`.
- En la plantilla, añadir título y descripción EN sin alterar los metadatos CA/ES.
- En el componente, convertir la selección binaria CA/ES en un mapa explícito CA/ES/EN. El mapa EN
  debe cubrir cada etiqueta, ayuda, placeholder, opción de remitente, estado, error y acción ya
  presentes, incluidas las dos notas laterales que hoy usan ternarios binarios.
- Mantener exactamente el mismo markup, nombres de campos, límites, pasos e inicializador
  `initCommunicatSubmissionFlow`. EN usará `/en/sent/`, ya existente, como destino de éxito.
- `EmailVerificationBlock` y `SubmissionSendingOverlay` ya aceptan EN; no se modificarán.

### 3. Frontera pública de la Function

En `netlify/functions/comunicat-submission.mjs`, añadir `en` al `LANGUAGES` específico de
Comunicats. No cambiar campos, longitudes, consentimiento, honeypot, campos protegidos ni respuestas.
La Function continuará validando el payload, consumiendo el token vinculado al email y solo después
reenviará la solicitud por el transporte interno autenticado.

### 4. Frontera privada de Strapi

- En `src/services/internal-submission-request.js`, ampliar exclusivamente
  `SECTION_CONFIG.comunicat.allowedLanguages` de CA/ES a CA/ES/EN.
- En el schema de `solicitud-comunicat`, añadir `en` al enum `idioma_solicitud`.
- Regenerar `types/generated/contentTypes.d.ts` mediante el flujo normal de Strapi para reflejar
  automáticamente el enum CA/ES/EN; no editarlo como lógica manual.
- No modificar `allowedFields`, campos requeridos, autenticación, creación con estado `pendent`,
  lifecycle de moderación ni servicios de imagen. El cambio de enum es aditivo y no exige migrar
  registros existentes.

### 5. Contrato coordinado

Los dos repositorios convergen en un contrato cerrado: `idioma_solicitud` admite exactamente `ca`,
`es` o `en`; todos los demás campos y reglas permanecen iguales. La Function no debe aceptar EN si
Strapi aún no lo acepta en el mismo conjunto de cambios entregable. El detalle está en
[communicat-en-submission-contract.md](./contracts/communicat-en-submission-contract.md).

## Existing Work Assessment

### Reusable unchanged

- `src/pages/en/comunicats/index.astro`, `src/pages/envia-un-comunicat.astro` y
  `src/pages/es/enviar-comunicado.astro`: wrappers existentes usados como entrada y referencia de
  regresión; no necesitan cambios.
- `src/i18n/ca.json` y `src/i18n/es.json`: copy vigente de CTA que se preservará como referencia.
- `src/lib/comunicatSubmissionFlow.ts`: pasos, validaciones, preview, imagen y bloqueo de envío son
  agnósticos al idioma.
- `src/lib/netlifySubmission.ts`: ya enruta Comunicats a `/api/submissions/comunicat`.
- `src/components/EmailVerificationBlock.astro`, `src/lib/emailVerificationController.ts`,
  `netlify/functions/_shared/verification-*` y el mailer: ya soportan EN y conservan token de un uso.
- `src/pages/en/sent.astro` y los componentes de estado de envío: ya tienen copy EN.
- `netlify/functions/comunicat-submission-http.mjs` y los helpers de submission: ya conservan la
  secuencia validación → consumo del token → transporte interno.
- Transporte interno, autenticación, servicios de cuarentena, panel y lifecycle de moderación de
  Strapi: son comunes y no discriminan el idioma de Comunicats después de la admisión.

### Incomplete for EN

- La CTA inglesa se oculta porque el destino es `null` y dos textos están vacíos.
- No existe el wrapper de la ruta canónica inglesa.
- Plantilla y componente tipan solo CA/ES y sus ramas binarias caerían incorrectamente en ES para EN.
- La Function de Comunicats y la configuración/schema de Strapi aceptan solo CA/ES.

## File Impact and Authorization for IMPLEMENT

| Repository | Action | File | Exact responsibility |
|---|---|---|---|
| Astro | Modify | `src/i18n/en.json` | Completar título y botón de la CTA EN |
| Astro | Modify | `src/pages/comunicats/index.astro` | Resolver el destino EN de la CTA |
| Astro | Create | `src/pages/en/comunicats/send-an-announcement.astro` | Montar la plantilla compartida con `lang="en"` |
| Astro | Modify | `src/templates/CommunicatSubmissionPage.astro` | Admitir EN y definir metadatos ingleses |
| Astro | Modify | `src/components/CommunicatSubmissionFlow.astro` | Añadir todo el copy y destinos EN sin cambiar el flujo |
| Astro | Modify | `netlify/functions/comunicat-submission.mjs` | Admitir `en` en la allowlist pública |
| Strapi | Modify | `src/services/internal-submission-request.js` | Admitir `en` para la sección `comunicat` |
| Strapi | Modify | `src/api/solicitud-comunicat/content-types/solicitud-comunicat/schema.json` | Añadir `en` al enum persistido |
| Strapi | Regenerate | `types/generated/contentTypes.d.ts` | Reflejar automáticamente el enum del schema; artefacto generado derivado |

Cualquier necesidad de modificar otro archivo de aplicación es una desviación del PLAN y requiere
detener IMPLEMENT para revisarla antes de continuar.

## Security and Moderation Preservation

1. El formulario seguirá enviando el token oculto mediante el controlador común, nunca estado de
   verificación inventado por la variante EN.
2. La Function mantendrá honeypot, campos protegidos, validación de imagen y rate limit del endpoint.
3. `consumeSubmissionVerification` continuará consumiendo atómicamente el token ligado al email
   antes del transporte a Strapi.
4. El navegador nunca conocerá la URL ni el secreto internos de Strapi.
5. Strapi continuará rechazando campos extra, exigiendo consentimiento y creando solo una solicitud
   con `estado_solicitud: "pendent"`.
6. Una imagen opcional seguirá entrando por el mismo `FormData`, será renombrada técnicamente y se
   almacenará en cuarentena privada; ninguna rama EN evita ese circuito.

## Validation Strategy

### Obligatoria localmente

1. Revisar ambos diffs y confirmar que solo cambian los ocho archivos de aplicación autorizados, el
   artefacto generado derivado `types/generated/contentTypes.d.ts` y los artefactos SDD.
2. Ejecutar `npm run build` en `guiapineda-astro` y `guiapineda-strapi`.
3. Probar los validadores exportados con Node: payload EN válido aceptado en Function y Strapi;
   CA/ES siguen aceptados; un idioma ajeno sigue rechazado.
4. Confirmar en el build las rutas CA, ES y `/en/comunicats/send-an-announcement/`, además de la CTA
   EN no vacía y con destino exacto.
5. Ejecutar localmente la matriz CA/ES/EN del formulario: mismos campos, límites, bloqueos, pasos,
   preview, edición, contacto, consentimiento, verificación y revisión; no enviar emails reales.
6. Verificar que EN serializa `idioma_solicitud=en`, usa `/api/submissions/comunicat`, dirige a
   `/en/sent/` solo tras `{ok:true}` y muestra fallo EN ante respuesta no exitosa.
7. Verificar representativamente en CA/ES acceso, datos válidos/inválidos y llegada a revisión.
8. Inspeccionar que autenticación, token, campos privados, estado `pendent`, cuarentena y moderación
   no cambian; finalizar con `git diff --check` y `git status` en ambos repositorios.

### Diferida a predespliegue

Cuando exista un entorno GUIAPINEDA integrado: entrega real del código EN, verificación y consumo
real del token, recepción real de la Function, transferencia autenticada a Strapi, persistencia
privada y cuarentena real de imagen. Esta prueba no se simulará como E2E superado ni bloquea el
cierre funcional local de la feature.

## Regression Risks

1. Que una rama binaria CA/ES muestre copy español en EN.
2. Que la CTA EN apunte a una ruta distinta de la canónica acordada.
3. Que Function y Strapi se entreguen desalineados y uno acepte EN mientras el otro lo rechaza.
4. Que al traducir se cambien nombres, límites o valores internos de tipos de remitente.
5. Que un cambio innecesario en componentes de seguridad debilite verificación, privacidad o imagen.
6. Que la ampliación accidental del conjunto global admita idiomas no autorizados.
7. Que se confunda una sonda local con el E2E de infraestructura aún inexistente.

## Human Approval

No quedan decisiones ni bloqueos técnicos antes de TASKS. IMPLEMENT debe detenerse si descubre que
la paridad exige alterar el contrato de campos, la verificación, el transporte, la moderación, la
infraestructura, una ruta CA/ES o cualquier archivo fuera de la tabla autorizada.

## Complexity Tracking

No hay violaciones constitucionales ni excepciones de complejidad que justificar.
