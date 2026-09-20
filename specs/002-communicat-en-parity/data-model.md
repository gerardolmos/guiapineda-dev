# Data Model: Paridad EN para el envío de Comunicats

## Solicitud moderada de Comunicat

La feature no crea una entidad nueva. Amplía el dominio de idioma de la solicitud privada existente.

| Campo | Tipo/regla | Privacidad | Cambio |
|---|---|---|---|
| `idioma_solicitud` | enum exacto `ca`, `es`, `en` | Editorial | Añadir `en` |
| `tipus_remitent` | enum interno existente de seis valores | Publicable | Sin cambio |
| `autor` | string requerido, 1–140 | Publicable | Sin cambio |
| `titol` | string requerido, 8–120 | Publicable | Sin cambio |
| `resum` | string requerido, 30–280 | Publicable | Sin cambio |
| `contingut` | string requerido, 80–8000 | Publicable | Sin cambio |
| `nombre_contacto` | string opcional, máximo 120 | Privado | Sin cambio |
| `email_contacto` | email requerido, máximo 180 | Privado | Sin cambio |
| `aceptacion_privacidad` | boolean requerido y `true` | Privado | Sin cambio |
| `imatge_quarantena_id` | referencia técnica privada | Privado | Sin cambio |
| `estado_solicitud` | `pendent`, `en_revisio`, `aprovat`, `rebutjat` | Editorial | Sin cambio; nace `pendent` |
| campos de moderación | fechas/identificadores/observaciones internos | Privado | Sin cambio; nunca aceptados del cliente |

## Datos operacionales no persistidos en la solicitud

- `email_verification_token`: requerido por la Function, vinculado al email y consumido una sola
  vez; no se reenvía a Strapi.
- `bot-field`: honeypot; un valor no vacío rechaza la petición y no se persiste.
- `imatge`: fichero opcional JPEG, PNG o WebP de hasta 2 MB en la frontera pública; Strapi lo recibe
  por el canal interno y guarda una versión privada normalizada en cuarentena.

## Valores de `tipus_remitent`

Los valores internos no se traducen:

- `entitat_associacio`
- `club_grup`
- `escola_centre`
- `comerc_empresa`
- `particular`
- `altres`

Solo sus etiquetas visibles obtienen equivalente EN.

## Relaciones y fronteras

```text
Formulario público EN
  └─ idioma_solicitud=en + token + datos + imagen opcional
      └─ Function /api/submissions/comunicat
          ├─ valida contrato y consume token
          └─ canal interno autenticado /api/internal/submissions/comunicat
              └─ solicitud-comunicat privada (estado inicial: pendent)
                  └─ imagen privada en cuarentena, si existe
```

No existe relación automática con un Comunicat público. La creación/publicación editorial queda
fuera del envío ciudadano y requiere moderación humana.

## State Transitions

### Interfaz

```text
autor → contenido → revisión → verificación + consentimiento → enviando
  ↑         ↑           │
  └─ editar └─ editar   └─ error: permanece recuperable
                                      └─ {ok:true}: /en/sent/
```

Las transiciones y condiciones son idénticas en CA, ES y EN.

### Solicitud privada

```text
pendent → en_revisio → aprovat
                    └─→ rebutjat
```

La feature no altera este lifecycle. Aceptar `en` nunca salta `pendent`, la revisión humana ni el
tratamiento privado de la imagen.

## Validation Invariants

1. Solo CA, ES y EN son idiomas válidos en frontend, Function, servicio interno y schema.
2. Admitir EN no relaja ninguna regla de campos, email, consentimiento, honeypot o imagen.
3. Los datos de contacto no forman parte del contenido publicable.
4. Los campos protegidos de moderación nunca se aceptan desde la Function.
5. El token se consume antes de llamar al canal interno y nunca se persiste.
6. Una solicitud aceptada sigue siendo privada y nace `pendent`.
