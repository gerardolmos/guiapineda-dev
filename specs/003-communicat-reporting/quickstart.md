# Quickstart: local validation of Communicat reporting

This guide defines the evidence required after IMPLEMENT. It does not authorize deployment, real
email delivery or production data. Use disposable local inputs and controlled doubles where noted.

## 1. Preconditions and scope

- Confirm only the application files authorized in `plan.md`, the generated Strapi type and this
  feature's SDD artifacts are changed.
- Confirm no dependency, infrastructure or environment configuration changed.
- Confirm the temporary validation scripts, if any, live outside both repositories.

## 2. Static builds

From `guiapineda-astro`:

```bash
npm run build
```

From `guiapineda-strapi`:

```bash
npm run strapi -- ts:generate-types
npm run build
```

Expected: both builds pass. The generated type diff represents only the new private report content
type and its schema fields.

## 3. Static-first and placement matrix

Inspect one built Comunicat detail for each language:

- CA `/comunicats/{slug}/`
- ES `/es/comunicats/{slug}/`
- EN `/en/comunicats/{slug}/`

For each route verify:

1. the report action is after the article body and before related Comunicats;
2. button, five reasons, labels, help, validation, errors and confirmation use the route language;
3. the generated component contains the expected `documentId` and slug;
4. loading and opening the form makes no request to Strapi;
5. reading, content, image, back navigation and related links remain unchanged.

## 4. Local browser form matrix

Run the local frontend and use a controlled local Function response; do not send a real email.
Repeat the language-dependent assertions in CA, ES and EN, while each data-rule case needs only one
language unless its message changes:

1. send remains disabled until a valid reason and verified email authorization exist;
2. every closed reason is selectable;
3. explanation is optional for the first four reasons;
4. choosing `otro` makes a whitespace-only explanation invalid;
5. 1,000 characters is accepted and 1,001 is rejected while the value remains visible;
6. invalid email cannot begin/complete verification;
7. a simulated verified token enables submission only when all report fields are valid;
8. a controlled invalid/stale reference shows an error and never shows success;
9. a controlled dependency failure retains reason/explanation, resets verification and permits a
   fresh verification/retry;
10. only `{ ok: true }` replaces the form with the private receipt confirmation.

## 5. Function contract checks

Use direct local module probes and injected doubles; do not contact external services.

- Accept each language and each reason with valid data.
- Require nonblank explanation for `otro`; reject >1,000 chars for all reasons.
- Reject missing/invalid stable ID, slug, language, email or token.
- Reject duplicate/unexpected fields, nonempty honeypot and every file.
- Assert verification consumption occurs before the internal request and is bound to the email.
- Assert failed/reused verification prevents the internal request.
- Assert the internal payload contains only document ID, slug, reason, optional explanation and
  language: no email, token, name, IP, state or timestamps.
- Assert the Function rate-limit declaration follows the existing temporary `ip`/`domain` pattern
  and no application persistence of IP was added.
- Assert success is returned only after the internal backend double accepts the report.

## 6. Backend contract checks

Exercise `internal-communicat-report.js` with a controlled Strapi adapter:

1. a matching published `documentId` and slug creates one report in `pendiente`;
2. missing, unpublished and slug-mismatched Comunicats each reject without create;
3. invalid language/reason/explanation and unexpected personal fields reject;
4. two valid calls for the same Comunicat create two independent reports;
5. created data contains exactly the authorized fields plus Strapi timestamps;
6. the service never calls update/delete/publish/unpublish on the Comunicat;
7. existing internal submission sections still dispatch to their original service.

Inspect the backend structure and schema:

- no public routes/controller/service exist for `denuncia-comunicat`;
- no email, name, IP, token, relation, media or reporter identity field exists;
- enums are exact and default state is `pendiente`;
- no existing moderation lifecycle includes or reacts to the report type.

## 7. Regression and repository checks

- Re-run the selected local contract/regression checks for the existing internal submission
  dispatcher and Function section allowlist.
- Confirm no report action appears on Agenda, Veus, commerce, Millorem Pineda or other surfaces.
- Run `git diff --check`, inspect full diffs and inspect `git status` in both repositories.

## 8. Deferred predeployment gate

The following evidence MUST remain **DEFERRED — predeployment** until an integrated GUIAPINEDA
environment exists:

- delivery of a real verification email and entry of its real code;
- real one-time-token enforcement through deployed Functions/Upstash;
- Netlify rate-limit enforcement;
- authenticated Function -> deployed Strapi delivery;
- private report visibility and state editing in the deployed Strapi Content Manager;
- confirmation that the deployed public Comunicat remains unchanged after a real report.

Local doubles demonstrate contracts and implementation behavior only. They must not be described as
successful delivery through real infrastructure.
