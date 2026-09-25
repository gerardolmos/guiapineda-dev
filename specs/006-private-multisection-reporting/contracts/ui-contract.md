# Contract: Shared multilingual report UI

## Component interface

`ContentReportFlow.astro` receives exactly:

```ts
{
  lang: "ca" | "es" | "en";
  contentType: "agenda" | "veu" | "millora" | "comercio";
  documentId: string;
}
```

Rendering with a missing/blank document ID is a build-time error, not a silently disabled form.
The content type is fixed by the template and serialized as untrusted form data for server checks.

## Required placements

| Surface | Shared template | Placement |
|---|---|---|
| Agenda | `AgendaArticlePage.astro` | after the event body/content, within the detail |
| Veus | `VeuArticlePage.astro` | after `StrapiBlocks`, within the article body |
| Millorem | `MilloraArticlePage.astro` | after contribution body, before final related-content callout |
| Commerce | `CommercePage.astro` | after complete business detail, before final page boundary |

The component is absent from indexes, submission forms, Foto del Mes and all Communicat files.

## Language parity

CA, ES and EN each provide complete visible copy for:

- action/title and private/moderated explanation;
- content-type label;
- five exact reason labels;
- optional context label, `otro` requirement and 1,000-character limit;
- email verification request/code/resend/success/error states;
- send/loading/limited/unavailable/invalid-reference messages;
- private receipt confirmation and return/close/retry actions.

Internal values, validation and state transitions are identical in every language. Missing copy may
not fall back to another language.

## Interaction states

```text
closed -> open/unverified -> verification pending -> verified/sendable
  ^             |                    |                    |
  |             +----validation------+----failure---------+
  |                                                        |
  +---------------- close (preserve form)                  |
                           accepted -> receipt success      |
                           failed   -> unverified/retry     |
```

- Reason is required. Explanation is optional for the first four reasons and required/nonblank for
  `otro`; it is limited to 1,000 characters in the browser and revalidated server-side.
- Submission remains disabled until form validity and verified authorization are both true.
- Closing/reopening and recoverable errors retain reason/explanation. Email/code/token are not
  persisted to local/session storage.
- Changing email invalidates verification through the existing controller behavior.
- Only `{ ok: true }` from the report endpoint produces receipt success.
- A post-consumption failure resets verification and retains only non-sensitive report input.

## Accessibility and static-first requirements

- Native labels/fieldset/legend, associated error text, focus management, keyboard controls and an
  announced result region follow the existing report pattern.
- The action identifies reporting the currently displayed item, not the author or section generally.
- Initial render/open/close performs no Strapi or Function lookup. Network begins only on explicit
  verification or submit action.
- No title, body or personal information is copied into hidden inputs.

## No-effect guarantee

The UI never promises removal, sanction or notification. Success says only that the private report
was received for human review. Repeated reports do not alter visible content or show a public count.
