# Data Model: Commerce CTA — Current Availability Copy

Feature 010 introduces no persistent entity, schema, relationship, storage lifecycle or stateful
behavior. Its complete model is one immutable localized copy set consumed by the existing static
CTA.

## Localized Commerce CTA Copy

| Attribute | CA | ES | EN | Mutability in Feature 010 |
|---|---|---|---|---|
| `businessCtaTitle` | `Tens un comerç o ofereixes un servei a Pineda?` | `¿Tienes un comercio u ofreces un servicio en Pineda?` | `Do you run a business or offer a service in Pineda?` | Read-only |
| `businessCtaText` | `Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.` | `Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.` | `Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.` | Replace with this exact approved value |
| `businessCtaButton` | `Vull aparèixer a GUIAPINEDA` | `Quiero aparecer en GUIAPINEDA` | `I want to join GUIAPINEDA` | Read-only |
| `businessCtaSoon` | `Properament` | `Próximamente` | `Add your business` | Read-only/inactive |
| Canonical destination | `/alta-comerc/` | `/es/alta-comercio/` | `/en/businesses/add-a-business/` | Read-only |

## Validation Rules

1. Exactly the CA, ES and EN `businessCtaText` values above are valid.
2. Each locale retains exactly one `businessCtaText` property under the existing home copy group.
3. CA contains no `Estem preparant`, ES no `Estamos preparando`, and EN no `We are preparing` in
   the resulting `businessCtaText`.
4. Titles, buttons, inactive `businessCtaSoon` values and canonical destinations remain exact.
5. No key is added, removed, renamed or reordered, and no unrelated byte in the locale documents
   changes.
6. The three approved values are one semantic set: current availability, same invitation, no new
   promise or claim.

## Transition

```text
obsolete future/preparation copy
    -> one exact approved substitution per locale
current-availability copy
```

There is no runtime state transition, migration, rollback data, expiration, identity rule or
cross-entity relationship. Reverting the three value lines restores the previous static copy.

## Protected Boundaries

- CTA titles and buttons
- `businessCtaSoon`
- canonical routes and links
- homepage/category/subcategory CTA structure
- Commerce form, validation and submission behavior
- draft behavior
- backend, SQLite and infrastructure
