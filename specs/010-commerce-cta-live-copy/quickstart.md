# Quickstart: Commerce CTA — Current Availability Copy

This guide defines the local, deterministic acceptance path for Feature 010. It performs no build,
browser, network, backend or SQLite operation.

## Preconditions

From the frontend repository root, confirm:

- branch `main`;
- HEAD and `origin/main` are `aa8823052b32b9df514941b30847184825e29959` before implementation;
- ahead/behind is `0/0` and staged is `0`;
- only approved Feature 010 SDD artifacts are present beyond the clean product baseline;
- backend is clean on `main` at `47ca26a0a54fd1c0193afd659b6ba3657b264793`, `0/0`;
- `.specify/feature.json` resolves `specs/010-commerce-cta-live-copy`;
- the fingerprints recorded in `plan.md` match before editing.

If any baseline or fingerprint differs, stop before changing product and determine whether the PLAN
requires revision.

## Mandatory RED Inventory Gate

Before creating the QA harness, record a PRE snapshot using local read-only commands. After the
harness is created, passes `node --check` and produces the expected RED against the unchanged
locale files, record the same POST snapshot. The two snapshots MUST cover:

- `git status --porcelain=v1 --untracked-files=all`, staged/unstaged name-status, and hashes for all
  Git-visible paths reported by either snapshot;
- deterministic existence/path/type/size/hash metadata for relevant ignored and temporary roots,
  including `.astro`, `dist`, `.veu-010-*`, QA roots and temporary browser/profile/cache paths;
- frontend processes and listeners before and after execution;
- the harness completion state, including Node active resources (normal process stdio excepted) and
  deferred work.

Use an identical ordered, locale-independent command set for both snapshots: Git porcelain,
staged/unstaged name-status, SHA-256 over the union of Git-visible paths, sorted metadata/hashes for
the named generated/temporary roots, and read-only process/listener inspection scoped to the
frontend and Feature 010. Keep the evidence in command/task output rather than creating a log or
inventory file. The harness uses Node built-ins for its own active-resource check.

The sole permitted delta is the new
`scripts/qa/commerce-cta-live-copy-qa.mjs`. Existing Feature 010 SDD artifacts and all product files
must remain byte-identical. RED is valid only when exactly the three locale-copy assertions fail and
all preservation checks pass. Any other file delta, cache, residual process/listener, unexpected
active Node resource, deferred operation, persistent effect, or incomplete inventory is a hard failure:
stop and do not authorize the three product substitutions.

## Authorized Implementation

1. Complete the mandatory PRE → harness creation/syntax/RED → POST inventory gate above.
2. Only after that gate passes, apply one targeted line replacement in each of:
   - `src/i18n/ca.json`
   - `src/i18n/es.json`
   - `src/i18n/en.json`
3. Do not run a formatter or rewrite a complete JSON file.
4. Modify only `specs/010-commerce-cta-live-copy/tasks.md` among established SDD artifacts while
   recording implementation evidence.

## Static QA Contract

The harness MUST validate:

- valid JSON in all three locale files;
- exact FR-002 copy in CA, ES and EN;
- obsolete preparation wording absent from each resulting value;
- exact preserved title, button and `businessCtaSoon` values;
- exactly one raw `businessCtaText` property per locale;
- normalized raw-file fingerprints from `plan.md`;
- canonical routes in the existing CTA consumers;
- exact protected hashes for homepage, category/subcategory consumers, Commerce form template and
  component, and the existing Commerce QA harness;
- zero writes and one final line: `PASS: Feature 010 Commerce CTA live copy QA`.

## Commands

Run only after the authorized files exist:

```bash
node --check scripts/qa/commerce-cta-live-copy-qa.mjs
node scripts/qa/commerce-cta-live-copy-qa.mjs
git diff --check
git status --short
```

Do not run `npm run build`, preview, browser automation or the broad Commerce submission harness;
they do not add evidence for this static copy-only change.

## Exact Copy Assertions

| Locale | Expected `home.businessCtaText` |
|---|---|
| CA | `Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.` |
| ES | `Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.` |
| EN | `Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.` |

## Diff Audit

Review the product diff directly. It MUST show exactly one old/new `businessCtaText` line in each
locale file. Reject any:

- changed title, button or `businessCtaSoon`;
- added, removed or reordered key;
- mass indentation, newline or encoding change;
- product path outside the three locale files;
- modification to any CTA consumer or Commerce form file.

The new harness and future `tasks.md` evidence are permitted non-product changes. Every other path
is read-only.

## Final Gate

PASS requires all of the following together:

1. static harness syntax and execution exit `0`;
2. exactly 3/3 approved strings and 0/3 obsolete strings;
3. normalized locale and protected file fingerprints match;
4. titles, buttons, `businessCtaSoon`, routes and form remain exact;
5. Git diff is minimal and `git diff --check` passes;
6. frontend changes remain inside the allowlist;
7. backend remains clean at baseline and SQLite was not accessed;
8. no build, browser, network, dependency, infrastructure or deployment operation occurred.
