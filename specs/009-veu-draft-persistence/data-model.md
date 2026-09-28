# Data Model: Veus Draft Persistence

**Date**: 2026-09-26

**Nature**: modelo local temporal del navegador; no es un modelo backend

## Identity

- Medium: `sessionStorage`
- Key: `guiapineda:submission-draft:v1:veu`
- Version: `1`
- Scope: `veu`
- Cardinality: como máximo un borrador lógico Veus por sesión natural de pestaña y origen
- Locale: CA, ES y EN comparten exactamente la misma identidad; el locale no forma parte de la clave
- Lifetime: reload y navegación same-tab; fin natural cuando termina la sesión; sin TTL adicional

## Envelope

```ts
interface VeuDraftEnvelope {
    version: 1;
    scope: "veu";
    fields: Partial<Record<VeuDraftFieldName, string>>;
}

type VeuDraftFieldName =
    | "titol"
    | "resum"
    | "contingut"
    | "tipo_autoria"
    | "autor_public"
    | "nombre_contacto"
    | "email_contacto";
```

`fields` puede ser parcial. Al guardar desde el formulario actual se proyectan los siete nombres; al
leer un payload histórico o manipulado solo se aplican las claves allowlisted válidas presentes.

## Closed field model

| Campo | Control real | Valor del draft | Constraint vigente | Restore seguro |
|---|---|---|---|---|
| `titol` | input text | string literal | required, min 8, max 140 | vacío/parcial permitido; rechazar longitud > 140 |
| `resum` | textarea | string literal | required, min 30, max 400 | vacío/parcial permitido; rechazar longitud > 400 |
| `contingut` | textarea | string literal | required, min 500, max 6000 | vacío/parcial permitido; rechazar longitud > 6000 |
| `tipo_autoria` | select | string contractual | required; `""`, `nom_complet`, `nom`, `pseudonim` | aceptar exclusivamente esos cuatro valores |
| `autor_public` | input text | string literal | required, min 2, max 120 | vacío/parcial permitido; rechazar longitud > 120; siempre visible/aplicable |
| `nombre_contacto` | input text | string literal | required, min 2, max 120 | vacío/parcial permitido; rechazar longitud > 120 |
| `email_contacto` | input email | string literal | required, max 254, formato email para avanzar | vacío/parcial permitido; rechazar longitud > 254 |

Los mínimos y el formato email son validaciones para avanzar/enviar, no motivos para perder un
borrador que todavía está siendo escrito. Restaurarlos no desbloquea el flujo: la validación nativa
vigente sigue activa. No se hace trim, traducción, corrección o normalización al persistir/restaurar.

## Authorship

- `tipo_autoria` vacío representa selección parcial, no una cuarta autoría publicada.
- Los tres valores no vacíos son estables entre idiomas.
- Las labels traducidas nunca entran en el envelope; se derivan de la opción actual en CA/ES/EN.
- `autor_public` no depende condicionalmente del tipo: permanece visible, aplicable y obligatorio.

## Corruption rules

### Discard whole envelope

- JSON ilegible.
- raíz no objeto.
- `version !== 1`.
- `scope !== "veu"`.
- `fields` ausente o no objeto.

El descarte puede eliminar la clave inválida. En todos los casos el formulario permanece usable con
defaults seguros.

### Ignore individual field

- nombre fuera de la allowlist.
- valor no string.
- enum `tipo_autoria` desconocido.
- string que excede el máximo vigente del campo.
- control allowlisted ausente o de un tipo DOM no autorizado.

Los otros campos válidos del mismo envelope pueden restaurarse. Un campo ignorado conserva el
default que aporta el markup actual.

## Lifecycle

```text
ABSENT
  └─ input/change permitido ─> SAVED

SAVED
  ├─ input/change permitido ─> SAVED (último valor)
  ├─ reload/navegación/locale ─> RESTORED ─> SAVED
  ├─ fallo validación/verificación/submit/503 ─> SAVED
  ├─ éxito confirmado ─> CLEARED
  └─ fin natural de sesión ─> ABSENT (gestión del navegador)

CORRUPT
  └─ apertura ─> DISCARDED/ABSENT, formulario usable
```

No existe transición reset/cancel porque Veus no ofrece esa acción. No existe transición por
`pagehide`, review, token o verificación correcta.

## Derived UI state — not persisted

- paso visible e índice de paso;
- contenido/snapshot de review;
- labels traducidas;
- contadores y clases de validación;
- submit/sending/error state;
- selección, nombre, preview u object URL de imagen;
- consentimiento/aceptación legal;
- estado, token, código, challenge o sesión de verificación.

Después del restore, el controlador muestra el primer paso, recalcula contadores y deja que la
validación actual gobierne el avance. Review se reconstruye cuando se solicita.

## Explicit exclusions

No forman parte del modelo: cualquier archivo/binario, metadato de archivo, honeypot, hidden field,
locale, token, código, challenge, bearer, autorización, secreto, IP, user-agent, historial, timestamp,
TTL, identidad de pestaña, perfil o dato no enumerado.

## Isolation

| Scope | Key | Relación con Veus |
|---|---|---|
| Agenda | `guiapineda:submission-draft:v1:agenda` | no leer, escribir ni borrar |
| Comunicats | `guiapineda:submission-draft:v1:comunicat` | no leer, escribir ni borrar |
| Veus | `guiapineda:submission-draft:v1:veu` | única clave autorizada |

Millorem, Foto del Mes y Commerce no adquieren draft por esta feature.

## Server impact

- Backend changes: none.
- Functions changes: none.
- Strapi changes: none.
- Schema changes: none.
- SQLite changes/access: none.
- Migrations: none.
- Persistent server data changes: none.
- Infrastructure/deployment changes: none.
