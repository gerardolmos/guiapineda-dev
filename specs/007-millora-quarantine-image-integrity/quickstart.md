# Quickstart Validation: Millora Quarantine Image Integrity

## Purpose

Validar que Millora participa en el inventario de referencias privadas sin cambiar el cleanup de
Agenda, Veus, Comunicats, Foto del Mes o Comercio. Esta guía es para la futura IMPLEMENT; PLAN no
ejecuta estos comandos ni crea el harness.

## Safety Preconditions

1. Confirmar que el diff funcional coincide exactamente con el allowlist de `plan.md`.
2. No arrancar Strapi, cron, Astro, Functions ni servicios externos.
3. No abrir ni modificar `.tmp/data.db` y no utilizar datos o imágenes reales.
4. El harness debe crear un directorio nuevo con `mkdtemp` bajo el temporal del sistema, fijarlo como
   root de cuarentena, verificar que no apunta al repositorio ni al almacenamiento real y retirarlo
   en `finally`.
5. Usar reloj, grace period, IDs, mtimes y respuestas del Documents Service completamente
   controlados.

## Static Validation

Desde `guiapineda-strapi`:

```sh
node --check src/services/private-submission-image-cleanup.js
node --check scripts/qa/millora-quarantine-image-integrity-qa.mjs
```

Esperado: ambos comandos terminan con código 0 y sin generar archivos de producto.

## Targeted Persistent Harness

Desde `guiapineda-strapi`:

```sh
node scripts/qa/millora-quarantine-image-integrity-qa.mjs
```

El harness debe fallar con código distinto de cero ante la primera aserción incumplida y emitir un
único PASS final solo después de completar toda la matriz.

### Registry and invariant checks

- Seis UIDs exactos, sin duplicados, con Millora una vez y los cinco anteriores intactos.
- `api::solicitud-millora.solicitud-millora` se consulta como sección escalar y proyecta únicamente
  `imatge_quarantena_id`.
- Batch size 100, grace default 86,400,000 ms y cron `17 3 * * *` permanecen sin cambios.
- No aparece ninguna llamada de escritura al Documents Service.

### Millora reference cases

| Case | Expected |
|---|---|
| Referenced and younger than grace | `referenced`; file preserved |
| Referenced and older than grace | `referenced`; file preserved |
| Orphan and younger than grace | `recent`; file preserved temporarily |
| Orphan with future mtime | `recent`; file preserved temporarily |
| Orphan exactly at grace | `eligible` and deleted |
| Orphan older than grace | `eligible` and deleted |
| Null, absent, empty or non-string reference | No file protected by that value |
| Malformed non-empty string | No valid file protected by that value |
| Valid ID with no file | No other ID protected or deleted |
| Same ID repeated | One protected ID, no behavioral duplication |

### Pagination and conservative failure

- Generar 101 filas Millora; exigir consultas `start=0, limit=100` y `start=100, limit=100`, y que
  todos los IDs válidos aparezcan en el conjunto.
- Hacer fallar una consulta después de otra sección correcta; la promesa debe rechazar y un archivo
  huérfano antiguo preparado como centinela debe permanecer.
- Repetir con una respuesta no-array; debe producirse el mismo resultado conservador.

### Existing-section regression

Crear imágenes antiguas referenciadas por:

- Agenda: `imatge_quarantena_id`.
- Veus: `imatge_quarantena_id`.
- Comunicats: `imatge_quarantena_id`.
- Foto del Mes: `imatge_quarantena_id`.
- Comercio: principal, logo y varias entradas de galería.

Esperado: todas permanecen referenciadas; únicamente los huérfanos antiguos exactos preparados por
la fixture resultan eliminados.

### CA/ES/EN and determinism

- Proporcionar filas Millora equivalentes para CA, ES y EN con IDs distintos y comprobar idéntica
  protección.
- Reconstruir desde cero la misma fixture dos veces usando el mismo reloj y mtimes; comparar resumen,
  IDs conservados e IDs eliminados y exigir igualdad exacta.
- Probar además dos ejecuciones consecutivas sobre un estado: la segunda no debe borrar nada nuevo;
  su resumen puede contener menos archivos porque la primera ya eliminó los huérfanos elegibles.

## Existing Commerce Regression

Como evidencia suplementaria, ejecutar desde `guiapineda-astro`:

```sh
node scripts/qa/commerce-submission-qa.mjs
```

Esperado: PASS completo, incluida la protección de principal, logo y galería y la eliminación del
huérfano controlado. Este harness permanece read-only.

## Repository and Scope Audit

Desde cada repositorio:

```sh
git diff --check
git status --short
```

Comprobar expresamente:

- único archivo de producto modificado:
  `guiapineda-strapi/src/services/private-submission-image-cleanup.js`;
- único archivo QA nuevo:
  `guiapineda-strapi/scripts/qa/millora-quarantine-image-integrity-qa.mjs`;
- ninguna modificación de schemas, datos, cron, helpers, paquetes, lockfiles, configuración,
  frontend funcional, infraestructura o dependencias;
- ningún archivo temporal o fixture permanece dentro de los repositorios;
- SQLite conserva el baseline conocido
  `ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843` sin haber sido abierta por
  el harness.

## Acceptance Result

La feature puede pasar IMPLEMENT únicamente si:

1. todas las comprobaciones estáticas terminan con código 0;
2. el harness específico produce PASS para la matriz completa;
3. la regresión comercial existente produce PASS;
4. ningún archivo inesperado aparece en el diff;
5. el audit confirma cero cambios en schema, SQLite, datos, infraestructura y dependencias.

No existe E2E remoto ni evidencia `DEFERRED — predeployment` necesaria para este defecto: el
contrato completo puede demostrarse localmente con fixtures controladas.
