# GUIAPINEDA — PROJECT CONTINUITY

Fecha: 10 de septiembre de 2026.

## Regla maestra

**CODEX DEBE CONTINUAR EL CAMINO YA TRAZADO, NO DISEÑAR UNO NUEVO.**

Codex se incorpora como herramienta de ejecución directa.

No supone:

- nueva fase;
- replanteamiento;
- reauditoría general;
- nueva arquitectura;
- rediseño;
- refactor general;
- cambio de prioridades;
- reapertura de decisiones cerradas.

## Checkpoint Git pre-Codex

Tag en frontend y backend:

`pre-codex-2026-09-10`

Frontend:

`ebd9106 feat: migrar millorem al flujo seguro`

Backend:

`ebd1b25 fix: aclarar publicacion de millorem en moderacion`

Al crear el checkpoint:

- ambos worktrees estaban limpios;
- `main` coincidía con `origin/main`;
- GitHub contenía todos los commits anteriores.

## Política Git vigente

Las antiguas restricciones de no push / commit solo local /
no rebase-reset-squash sin permiso quedan SUPERADAS.

Vigente:

**gestión autónoma de Git bajo criterio técnico profesional.**

## Bloque actual

Cerrar **Millorem Pineda — Unit A**.

Millorem es un registro ciudadano estructurado de problemas concretos,
localizables y comprensibles de Pineda que podrían mejorar.

No es:

- muro de quejas;
- foro;
- comentarios libres;
- opinión política genérica;
- ataques personales;
- red social.

## Circuito Unit A

ciudadano
→ formulario
→ verificación email
→ Netlify Function segura
→ solicitud privada Strapi
→ moderación
→ aprobación
→ creación/publicación Millora
→ eliminación email
→ gestión imagen
→ rebuild frontend estático
→ Millora visible públicamente

Casi todo está implementado.

Hueco pendiente:

**Strapi publica → Astro/Netlify reconstruye → contenido visible.**

## Ya implementado backend

- solicitud privada;
- límites imagen;
- cuarentena;
- eliminación email;
- publicación automática;
- slug determinista;
- idempotencia;
- rollback;
- promoción imagen;
- panel moderación;
- build Strapi correcto.

## Ya implementado frontend

- transporte seguro;
- Functions Millorem;
- verificación email;
- payload seguro;
- formulario de 3 pasos;
- campos canónicos;
- autor_public;
- privacidad;
- retirada Netlify Forms;
- retirada reCAPTCHA antiguo;
- CA / ES / EN.

## SIGUIENTE ACCIÓN EXACTA

**INSPECCIONAR READ-ONLY EL MECANISMO REAL DE REBUILD/DEPLOY NETLIFY.**

Inspeccionar:

- Git;
- Netlify;
- `netlify.toml`;
- `_redirects`;
- `_headers`;
- YAML;
- `package.json`;
- Astro;
- referencias deploy/rebuild/build hook/trigger;
- variables relevantes;
- carga de Millores desde Strapi;
- configuración disponible.

No asumir mecanismo.

Identificar cuál es real:

1. mecanismo ya existente;
2. rebuild únicamente por Git;
3. Build Hook existente pero sin conectar;
4. ningún mecanismo;
5. otro mecanismo demostrado.

## Después

INSPECCIÓN
→ PROPUESTA
→ ESPECIFICACIÓN
→ CAMBIO MÍNIMO
→ VALIDACIÓN
→ E2E UNIT A
→ CIERRE UNIT A

## Unit B

NO empezar todavía.

## Otros pendientes

Bloqueo de correos temporales:
decidido pero todavía no implementado.
No mezclarlo con la tarea actual.

## Invariantes

- frontend público estático;
- Strapi build-time;
- submissions dinámicas separadas;
- secretos fuera del browser;
- token email no llega a Strapi;
- email eliminado tras moderación;
- imágenes privadas antes de aprobación;
- CA / ES / EN;
- no nuevas features;
- no Unit B;
- no rediseño;
- no refactors oportunistas.
