# Quickstart Validation: Communicat EN Parity

## Purpose

Validar localmente la paridad CA/ES/EN sin desplegar, enviar emails reales ni conectar servicios
externos. Consultar [data-model.md](./data-model.md) y
[communicat-en-submission-contract.md](./contracts/communicat-en-submission-contract.md) para las
reglas exactas.

## Prerequisites

- Dependencias ya instaladas en `guiapineda-astro` y `guiapineda-strapi`.
- Node.js compatible con ambos repositorios.
- Un navegador local para la matriz de interfaz.
- No existe un entorno GUIAPINEDA desplegado apto. No usar la página privada histórica de pruebas
  como evidencia de esta feature y no desplegar para completarla.

## 1. Scope and static review

1. Revisar `git diff` y confirmar que los cambios de aplicación están limitados a los ocho archivos
   autorizados en `plan.md`.
2. Confirmar que la nueva página monta la plantilla compartida con `lang="en"`.
3. Confirmar que no queda ninguna rama binaria que haga caer EN en copy ES dentro del formulario.
4. Confirmar que no cambian nombres de campos, valores internos, longitudes, endpoint, token,
   autenticación, estado privado ni cuarentena.

## 2. Builds

Desde `guiapineda-astro`:

```sh
npm run build
```

Desde `guiapineda-strapi`:

```sh
npm run build
```

Esperado: ambos builds terminan correctamente. El build Astro genera CA, ES y
`/en/comunicats/send-an-announcement/`.

## 3. Function language contract

Desde `guiapineda-astro`, ejecutar una sonda Node sobre el constructor puro de payload con los mismos
datos base para CA, ES, EN y un idioma no permitido.

Casos obligatorios:

| Input | Expected |
|---|---|
| `idioma_solicitud: "ca"` | `ok: true`, conserva `ca` |
| `idioma_solicitud: "es"` | `ok: true`, conserva `es` |
| `idioma_solicitud: "en"` | `ok: true`, conserva `en` |
| `idioma_solicitud: "fr"` | `ok: false`, `idioma_solicitud:invalid` |

El payload base debe incluir un tipo de remitente permitido, autor, título de 8–120, resumen de
30–280, contenido de 80–8000, email válido y `aceptacion_privacidad: "true"`. Esta sonda no consume
tokens ni llama servicios.

## 4. Strapi language contract

Desde `guiapineda-strapi`, usar el export existente `parseSubmissionPayload` con el mismo payload ya
normalizado y `aceptacion_privacidad: true`.

Casos obligatorios:

| Section/language | Expected |
|---|---|
| `comunicat` / CA | aceptado |
| `comunicat` / ES | aceptado |
| `comunicat` / EN | aceptado y conserva `en` |
| `comunicat` / idioma ajeno | `submission:invalid-language` |

Comprobar además que el schema de `solicitud-comunicat` enumera exactamente CA, ES y EN. No crear
registros persistentes para esta comprobación.

## 5. Local UI matrix

Desde `guiapineda-astro`:

```sh
npm run dev
```

Validar en orden:

1. `/en/comunicats/`: CTA inglesa completa y enlace exacto a
   `/en/comunicats/send-an-announcement/`.
2. Abrir directamente la ruta EN: metadatos y formulario en inglés, sin texto visible CA/ES.
3. Comparar CA `/envia-un-comunicat/`, ES `/es/enviar-comunicado/` y EN: mismos tres pasos, campos,
   valores internos, límites, contadores, imagen opcional, preview, edición y revisión.
4. En cada idioma, verificar que datos incompletos o bajo mínimo bloquean Continuar; corregirlos y
   llegar a revisión.
5. En EN, comprobar que el hidden `idioma_solicitud` vale `en`, el endpoint resuelto sigue siendo
   `/api/submissions/comunicat` y el destino de éxito es `/en/sent/`.
6. Confirmar que Send permanece bloqueado sin email válido, verificación vigente y consentimiento;
   no solicitar un email real.
7. Mediante respuestas locales controladas del transporte existente, comprobar que un fallo muestra
   el error del idioma y no navega, y que solo `{ok:true}` permite la navegación de éxito. Esto prueba
   frontend, no el E2E remoto.

## 6. Security and moderation review

Confirmar por diff y contrato existente:

- token vinculado al email y consumido una sola vez antes del reenvío;
- rate limit, honeypot y campos protegidos intactos;
- secreto y endpoint Strapi solo servidor-servidor;
- solicitud creada como privada y `pendent`;
- imagen opcional por el mismo circuito de validación, normalización y cuarentena;
- ningún camino de publicación automática.

## 7. Deferred predeployment gate

Cuando exista un entorno GUIAPINEDA integrado, realizar con datos desechables:

1. entrega real del código de verificación EN;
2. consumo real y no reutilización del token;
3. envío real por la Function y canal interno;
4. aparición de la solicitud EN como privada y pendiente en Strapi;
5. cuarentena real de una imagen de prueba;
6. regresión real representativa CA/ES.

Hasta entonces debe constar como `DEFERRED — predeployment`, no como PASS ni como defecto funcional.

## Final checks

```sh
git diff --check
git status --short
git -C ../guiapineda-strapi diff --check
git -C ../guiapineda-strapi status --short
```

Revisar el diff completo de ambos repositorios y registrar toda validación no ejecutada.
