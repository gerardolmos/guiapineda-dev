# Internal Contract: Communicat Browser Draft

## Purpose

Frontera interna entre la orquestación de Comunicats y el adaptador de borrador. No es una API,
payload backend ni persistencia editorial.

## Storage identity

- Medium: `sessionStorage`
- Key: `guiapineda:submission-draft:v1:comunicat`
- Scope: una sesión de pestaña y un origen
- Locale behavior: CA, ES y EN usan la misma clave
- Expiry: fin natural de sesión; sin TTL

## Serialized envelope

```json
{
  "version": 1,
  "scope": "comunicat",
  "fields": {
    "tipus_remitent": "entitat_associacio",
    "autor": "...",
    "titol": "...",
    "resum": "...",
    "contingut": "...",
    "nombre_contacto": "...",
    "email_contacto": "..."
  }
}
```

Esta es toda la superficie autorizada. Campos ausentes o strings vacíos son válidos; otros tipos no.

## Caller policy

El caller suministra la allowlist exacta. El adaptador admite inputs textuales, `textarea` y grupos
de radios, pero MUST NOT inferir permiso, enumerar el formulario, usar denylist como frontera,
serializar `FormData` o persistir un control futuro no aprobado.

## Read contract

1. Errores de `getItem` y JSON quedan contenidos.
2. Raíz, versión, scope o `fields` incompatibles causan eliminación best-effort.
3. Un envelope válido se proyecta solo por allowlist.
4. Claves desconocidas, controles ausentes y valores no string se ignoran.
5. Campos ausentes mantienen el valor inicial.
6. Un radio se marca solo por coincidencia exacta vigente; no hay fallback.
7. No se emiten eventos sintéticos.
8. Paso, validez, preview, botones y verificación se recalculan fuera del adaptador.

## Write contract

1. Solo se leen los siete nombres aprobados.
2. Solo strings entran en `fields`; radio aporta valor exacto o `""`.
3. El último envelope sustituye al anterior en `input` o `change`.
4. Fallos de storage, cuota o serialización no salen del adaptador.
5. Los valores no se registran, envían ni copian a otro almacenamiento.

## Reconciliation contract

Después de restaurar, Comunicats inicia verificación fresca, muestra el primer paso, vacía imagen y
previews de archivo, desmarca consentimiento y recalcula selección, condicionales vigentes,
longitudes, contadores, lectura, previews textuales, revisión y botones sin foco ni popups. Los
valores inválidos siguen visibles y bloqueados hasta corregirse.

## Cleanup contract

- `clear()` elimina best-effort y nunca lanza.
- Solo se llama tras aceptación explícita; un fallo no limpia.
- El adaptador limpia en `reset` y el flujo reconcilia tras el reset nativo.
- No existe cleanup en unload/pagehide ni por tiempo.
- No se añade control de descarte.

## Security invariants

`fields` nunca contiene imagen/file, honeypot, consentimiento, idioma oculto, código, challenge,
token, expiración, estado verificado, secretos, credenciales, URL de objeto, error, paso o estado de
botón/revisión. Restaurar `email_contacto` nunca autoriza el envío.

## Shared-helper compatibility

El soporte de radios y scope `comunicat` no cambia la clave, envelope, allowlist ni controles de
Agenda. Su regresión es aceptación obligatoria.

## Failure-mode contract

Toda indisponibilidad o corrupción de storage degrada únicamente la recuperación; el formulario
continúa rellenable, validable, revisable y enviable con su flujo seguro existente.
