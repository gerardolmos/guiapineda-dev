# Data Model: Millorem Draft Persistence

## Identity

- Medium: `sessionStorage`
- Key: `guiapineda:submission-draft:v1:millora`
- Scope: `millora`
- Version: `1`
- Cardinality: máximo un borrador lógico por origen y sesión de pestaña
- Locale: no forma parte de la identidad; CA, ES y EN comparten key
- Retention: fin natural de la sesión o clear posterior a submit confirmado

## Envelope

```ts
interface MilloraDraftEnvelope {
    version: 1;
    scope: "millora";
    fields: Partial<Record<MilloraDraftFieldName, string>>;
}

type MilloraDraftFieldName =
    | "categoria"
    | "zona"
    | "millora-author-type"
    | "millora-alias"
    | "titol"
    | "resum"
    | "contingut"
    | "email_contacto";
```

El guardado desde el form actual proyecta exactamente las ocho keys. Un payload parcial puede
contener menos; nunca se admite una novena key como parte del contrato.

## Closed field model

| Campo | Control real | Valor del draft | Restricción vigente | Restore seguro |
|---|---|---|---|---|
| `categoria` | grupo radio required | string contractual | `""`, `incidencies`, `civisme`, `propostes` | solo vacío o radio actual |
| `zona` | select required | string contractual | `""` o una de las 11 opciones actuales | solo vacío u option actual |
| `millora-author-type` | grupo radio required | string contractual | `""`, `resident`, `visitor`, `alias` | solo vacío o radio actual |
| `millora-alias` | input text condicional | string literal | max 100 | vacío/parcial permitido; ignorar >100 |
| `titol` | input text required | string literal | min 8, max 120 | vacío/parcial permitido; ignorar >120 |
| `resum` | textarea required | string literal | min 30, max 280 | vacío/parcial permitido; ignorar >280 |
| `contingut` | textarea required | string literal | min 80, max 6000 | vacío/parcial permitido; ignorar >6000 |
| `email_contacto` | input email required | string literal | max 180, formato email para verificar/enviar | vacío/parcial permitido; ignorar >180 |

Mínimos y formato email gobiernan avance, solicitud de código y envío. No invalidan un borrador
parcial dentro del máximo. No se aplica trim, traducción, corrección ni normalización al persistir o
restaurar.

## Authorship state

### Persisted sources

- `millora-author-type` determina el modo activo.
- `millora-alias` conserva el texto literal aunque su wrapper esté oculto.
- Un alias oculto no participa en validez, preview, review o envío con `resident`/`visitor`.
- Volver a `alias` muestra el valor conservado y vuelve a hacerlo aplicable.

### Derived `autor_public`

`autor_public` no pertenece al envelope:

| Author type restaurado | `autor_public` reconstruido |
|---|---|
| ausente, vacío o inválido | `""` |
| `resident` | label residente del locale actual |
| `visitor` | label visitante del locale actual |
| `alias` | `trim(millora-alias)` |

Las labels CA/ES/EN no se almacenan. `autor_public` se recalcula antes de que la persona avance.

## Corruption and partial restore

### Discard/ignore whole envelope

- JSON malformado.
- Root que no sea objeto.
- `version !== 1`.
- `scope !== "millora"`.
- `fields` ausente o no objeto.

El resultado es key Millora ausente/ignorada y formulario usable con defaults. Otras keys no se
tocan.

### Ignore individual field

- Nombre fuera de allowlist.
- Valor que no sea string.
- Radio/select cuyo valor no exista actualmente.
- String que supere el máximo vigente.
- Control allowlisted ausente o de tipo DOM no soportado.

Los demás valores válidos del mismo envelope se restauran. Un campo ignorado conserva el default del
markup.

### Storage unavailable

Una excepción de read/write/remove no cambia el modelo funcional del form. No existe retry, fallback
persistente ni error visible obligatorio; el draft simplemente deja de estar disponible.

## Lifecycle

```text
ABSENT
  └─ input/change del form ─> SAVED

SAVED
  ├─ input/change ──────────> SAVED (snapshot síncrono más reciente)
  ├─ reload/navigation ─────> RESTORED
  ├─ CA/ES/EN ──────────────> RESTORED (misma key)
  ├─ fallo pre-submit ──────> SAVED
  ├─ submit iniciado ───────> SAVED
  ├─ submit fallido ────────> SAVED
  ├─ submit confirmado ─────> CLEARED
  └─ fin de sesión ─────────> EXPIRED_BY_BROWSER

RESTORED
  ├─ primer paso + derivados reconstruidos
  ├─ verificación fresca
  └─ siguiente input/change ─> SAVED
```

No existe acción general de reset. Retirar imagen no altera este lifecycle.

## Derived UI state — not persisted

- `autor_public`.
- label de categoría, zona o autoría.
- visibilidad del wrapper de alias.
- paso actual y estado de review.
- controles de avance y validaciones.
- contadores y clases de mínimo.
- tiempo de lectura.
- live preview y review renderizada.
- imagen, nombre, bytes, preview y object URL.
- consentimiento.
- email verificado, challenge, código, token y timer.
- error, focus, scroll, loading e `isSubmitting`.

Todo se reconstruye desde markup, locale, campos restaurados y estado seguro inicial.

## Save and restore ordering

1. Leer/validar envelope.
2. Restaurar fuentes allowlisted válidas sin eventos.
3. Registrar listeners de draft.
4. Inicializar verificación sobre email restaurado, pero estado no verificado.
5. Forzar primer paso.
6. Recalcular contexto y `autor_public`.
7. Recalcular contenido, contadores, preview y validez.
8. Mantener review como derivado que se renderiza al abrirla.

En `pageshow`, la verificación se resetea y los pasos/derivados se reconcilian de nuevo sin
reinstalar listeners.

## Isolation

```text
guiapineda:submission-draft:v1:agenda
guiapineda:submission-draft:v1:comunicat
guiapineda:submission-draft:v1:veu
guiapineda:submission-draft:v1:millora
```

Una operación sobre `millora` no puede leer, actualizar o eliminar los otros tres envelopes.

## Server and persistence impact

| Surface | Contract |
|---|---|
| Backend | untouched |
| Functions/Strapi | none |
| Network for draft | none |
| SQLite access | none |
| SQLite reads | none |
| SQLite hashes | none |
| SQLite metadata | none |
| SQLite sidecars | none |
| SQLite commands | none |
| Schema changes | none |
| Migrations | none |
| Remote synchronization | none |
