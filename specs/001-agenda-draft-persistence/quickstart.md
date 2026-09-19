# Quickstart Validation: Agenda Draft Persistence

## Purpose

Validate the feature end to end without changing backend, Strapi, Functions or server security.
Use [agenda-draft-contract.md](./contracts/agenda-draft-contract.md) for the storage boundary and
[data-model.md](./data-model.md) for field/state rules.

## Prerequisites

- Node.js `>=22.12.0` and project dependencies already installed.
- A browser with storage/devtools controls.
- GUIAPINEDA has no deployed environment yet. The existing private Netlify test page at
  `https://gp-dev-k7m4x9q2.netlify.app/` does not contain this application or the Agenda form and
  MUST NOT be treated as an Agenda validation environment.
- Real validation of `/api/submissions/agenda` and email verification is a deferred predeployment
  gate. Do not deploy the project or create/alter an endpoint solely to complete this feature.
- Start from a reviewed implementation diff limited to the files named in `plan.md`.

## Static and build checks

1. Review `git diff` and confirm only the planned frontend files and SDD artifacts changed.
2. Verify the allowlist has exactly these 13 names:
   `titol`, `resum`, `descripcio`, `organitzador`, `data_inici`, `hora_inici`, `data_final`,
   `hora_final`, `lloc`, `adreca`, `enllac_oficial`, `nombre_contacto`, `email_contacto`.
3. Verify `bot-field`, `aceptacion_privacidad`, `imatge`, hidden inputs and verification state are not
   in that list.
4. Run:

   ```sh
   npm run build
   ```

5. Record the result. The repository currently has no automated test suite, lint command or installed
   `astro check`; do not present build success as full behavioral validation.

## Local manual environment

For flows that do not require successful server submission:

```sh
npm run dev
```

Open `/agenda/envia-una-activitat/` in one tab. Keep the same tab for language changes.

## Scenario 1: CA -> ES -> EN -> CA

1. In CA, enter distinct recognizable values in all 13 allowed fields.
2. Select a valid image.
3. Accept privacy and, where the environment supports it, complete email verification.
4. Change to ES using the form language link.
5. Confirm all 13 string values restore automatically.
6. Confirm the image/file control is empty, privacy is unchecked and email is not verified.
7. Confirm the honeypot, verification token/code and internal state are empty/default.
8. Edit at least title, summary, dates and email in ES; change to EN and confirm latest values.
9. Change back to CA and confirm the same latest values.

Expected: one shared draft, no user action to restore it, and no security state reuse.

## Scenario 2: Derived visual state

1. After restoration, inspect summary/description counters.
2. Confirm date minimum/order and time-order validation reflect restored values.
3. Confirm Continue is enabled only when current values satisfy existing rules.
4. Continue to review and confirm every restored field appears correctly.
5. Confirm Submit remains disabled until email is freshly verified and privacy is freshly accepted.
6. Restore deliberately invalid, past or conflicting values and confirm they remain visible but
   invalid, without focus jumps or browser validity popups during initial load.

Expected: restored data behaves exactly like manually entered data under current rules.

## Scenario 3: Image exclusion

1. Select an image and confirm its preview.
2. Change language.
3. Confirm neither file, filename, preview nor review-image card is restored.
4. Confirm the 13 allowed string values remain present.

## Scenario 4: Reset

The current UI adds no reset/discard button. Exercise the native form behavior from browser devtools:

```js
document.querySelector("[data-agenda-submission-flow]")?.reset();
```

Confirm fields return to defaults; counters, date constraints, form/review step, image preview and
buttons are coherent; verification/privacy are reset; and a same-tab reload does not restore the
old draft.

## Scenario 5: Submission lifecycle

### Current frontend acceptance

When no deployed GUIAPINEDA environment exists, exercise the actual browser submit handler and
unchanged transport with controlled non-success and `{ ok: true }` responses:

1. Confirm a non-success response leaves the draft available and displays the submission error.
2. Confirm an explicit `{ ok: true }` response navigates to the existing success page and clears the
   draft.
3. Return to Agenda in the same tab and confirm the draft does not restore.

Expected: only confirmed success clears the draft.

This is sufficient for the current frontend feature scope. It does not claim live integration with
Netlify Functions, Resend, Upstash or Strapi.

### Deferred predeployment gate

Once a real GUIAPINEDA environment is deployed with the verified Agenda endpoint, repeat the same
failure/success lifecycle using a disposable proposal and test mailbox. This future E2E check is an
infrastructure acceptance gate, not an implementation defect or functional task pending in this
feature.

## Scenario 6: Corrupt and incompatible data

Use the common key in browser devtools.

Malformed JSON:

```js
sessionStorage.setItem("guiapineda:submission-draft:v1:agenda", "{");
```

Wrong version:

```js
sessionStorage.setItem(
  "guiapineda:submission-draft:v1:agenda",
  JSON.stringify({ version: 999, scope: "agenda", fields: { titol: "Old" } }),
);
```

Unknown/type-invalid fields:

```js
sessionStorage.setItem(
  "guiapineda:submission-draft:v1:agenda",
  JSON.stringify({
    version: 1,
    scope: "agenda",
    fields: { titol: "Valid title", botField: "must-ignore", resum: 42 },
  }),
);
```

Reload after each case. Confirm no technical error blocks Agenda, incompatible envelopes are cleared,
unknown values never map to controls, and only valid allowlisted strings may restore.

## Scenario 7: Storage unavailable

Use a browser/privacy configuration that blocks storage access, then repeat basic fill, validation,
review and submission. Confirm the form remains functional and only cross-navigation draft recovery
is unavailable. Record the exact browser/mode used.

## Scenario 8: Natural tab lifetime

1. Create a draft and reload/navigate among languages in the same tab; confirm it survives without
   time-based expiry.
2. End that tab session according to the browser's normal behavior.
3. Start a fresh independent tab session and confirm this feature does not deliberately recover the
   ended session's draft.
4. Do not add cleanup on unload/pagehide to force this behavior.

## Final checks

- Run `npm run build` again after any implementation correction.
- Inspect frontend and backend `git status`.
- Confirm no file under `netlify/functions/**` or `../guiapineda-strapi/**` changed.
- Document every manual scenario completed and any validation that could not run.
