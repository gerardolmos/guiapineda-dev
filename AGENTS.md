# GUIAPINEDA — Reglas de trabajo para Codex

## Autoridad

Este repositorio forma parte de GUIAPINEDA.

Antes de realizar cualquier tarea:

1. Leer este `AGENTS.md`.
2. Leer `PROJECT-CONTINUITY.md`.
3. Inspeccionar el repositorio real.
4. Comprobar rama, HEAD y `git status`.
5. No asumir que la documentación sustituye al estado real del código.
6. Si código y documentación parecen contradecirse, detener la mutación,
   demostrar la diferencia y resolverla antes de continuar.

Regla maestra:

**CODEX DEBE CONTINUAR EL CAMINO YA TRAZADO, NO DISEÑAR UNO NUEVO.**

La incorporación de Codex cambia la herramienta de ejecución.
No cambia estrategia, arquitectura, producto, criterios, prioridades
ni orden de trabajo.

## Metodología obligatoria

INSPECCIÓN
→ PROPUESTA
→ ESPECIFICACIÓN
→ CAMBIO PEQUEÑO
→ VALIDACIÓN TÉCNICA
→ VALIDACIÓN VISUAL/FUNCIONAL cuando corresponda
→ COMMIT

### Inspección

Antes de modificar:

- repositorio correcto;
- rama;
- HEAD;
- `git status`;
- archivos reales;
- arquitectura afectada;
- dependencias;
- flujo existente;
- riesgos;
- comportamiento actual.

### Propuesta

Una única propuesta alineada con las decisiones existentes.

No reabrir decisiones cerradas solo porque exista otra solución posible.

### Especificación

Antes de un cambio relevante establecer:

- qué cambia;
- dónde;
- por qué;
- qué no cambia;
- riesgos;
- criterio de éxito.

### Implementación

Los cambios deben ser:

- acotados;
- verificables;
- revertibles;
- sin refactors colaterales;
- sin formateos masivos;
- sin renombrados innecesarios;
- sin actualizaciones incidentales de dependencias.

### Validación

Según el cambio:

- sintaxis;
- tests;
- `git diff --check`;
- build;
- payloads;
- endpoints;
- seguridad;
- invariantes;
- QA funcional;
- responsive;
- CA / ES / EN cuando corresponda.

## Git — política vigente

Codex puede gestionar Git autónomamente bajo criterio técnico.

No necesita autorización previa de Gerard para commits, pushes,
ramas, merges, sincronización, squash, rebase, reset,
restauraciones u otras operaciones necesarias.

Autonomía no significa hacer commit o push después de cada cambio mínimo.

Criterio:

- commit cuando exista una unidad coherente y validada;
- push cuando aporte respaldo, sincronización, despliegue,
  checkpoint o integración útil;
- inspeccionar estado y diff antes de operaciones relevantes;
- mantener commits comprensibles y acotados;
- no reescribir historial por estética;
- extremar precauciones con historial publicado;
- no usar force-push salvo necesidad técnica real;
- no perder trabajo válido;
- frontend y backend son repositorios independientes.

## Restricciones generales

No:

- reinterpretar GUIAPINEDA;
- convertirla en red social;
- añadir funcionalidades fuera del bloque vigente;
- iniciar una nueva fase por iniciativa propia;
- refactorizar arquitectura por preferencia;
- tocar unidades funcionales cerradas salvo bug demostrado;
- cambiar UX/UI no relacionada;
- arreglar warnings ajenos;
- actualizar dependencias incidentalmente.

## Operación

Codex puede editar directamente los archivos y ejecutar comandos.

Se mantienen:

- inspección previa;
- mutaciones controladas;
- abortar ante contexto inesperado;
- revisar diff;
- validar;
- preservar capacidad de recuperación.

No asumir que `rg` está instalado.


## Este repositorio

Este es el FRONTEND de GUIAPINEDA.

Arquitectura:

- Astro estático;
- Netlify;
- contenido público procedente de Strapi durante build-time;
- navegación pública normal sin acceso runtime a Strapi/Postgres.

Principio:

Strapi/Postgres
→ build-time
→ Astro estático
→ Netlify CDN

No convertir páginas públicas a runtime Strapi salvo decisión nueva explícita.

## Prioridad inmediata

Antes de cualquier otra implementación relacionada con Millorem:

**INSPECCIONAR EN MODO READ-ONLY EL MECANISMO REAL DE REBUILD/DEPLOY.**

Determinar cómo una nueva Millora publicada en Strapi llega actualmente,
o no llega, al frontend Astro desplegado en Netlify.

No implementar de entrada:

- webhook;
- Build Hook;
- Function de deploy;
- plugin;
- trigger;
- cambio arquitectónico.

Primero demostrar qué mecanismo existe realmente.
