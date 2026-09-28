# Implementation Plan: Commerce CTA — Current Availability Copy

**Branch**: `main` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-commerce-cta-live-copy/spec.md`

## Summary

Replace exactly `home.businessCtaText` in the existing CA, ES and EN locale documents with the
three human-approved strings from FR-002. The established translation lookup, CTA markup, titles,
buttons, inactive `businessCtaSoon` values, canonical routes and complete Commerce form remain
unchanged. Validation uses one small Feature 010 static Node harness with built-ins only; it parses
the locale documents, checks exact copy and protected values, verifies normalized raw-file
fingerprints and fingerprints the existing CTA/form consumers. No build or browser run adds useful
evidence for this source-only substitution.

## Technical Context

**Language/Version**: JSON locale documents; JavaScript ES modules on Node.js `>=22.12.0` for QA

**Primary Dependencies**: Existing Astro translation consumption; QA uses only Node.js built-ins

**Storage**: Three static locale files; no browser, server or database persistence

**Testing**: `node --check`, dedicated static harness, exact Git diff audit and `git diff --check`

**Target Platform**: Existing static Astro frontend

**Project Type**: Frontend web application with an independent, read-only backend repository

**Performance Goals**: No runtime path or payload changes; static copy lookup remains identical

**Constraints**: Exactly three approved value substitutions; no formatter, key reorder, reindent,
encoding/newline normalization, new key, removed key, dependency, build, browser or network access

**Scale/Scope**: Three localized values, three canonical destinations, one read-only QA harness;
all Commerce behavior remains protected

## Constitution Check

*GATE: PASS before Phase 0 research; PASS again after Phase 1 design.*

| Principle / gate | Pre-research | Post-design evidence |
|---|---|---|
| I. Local product identity | PASS — accurate availability copy helps local businesses reach the existing moderated contribution flow. | PASS — no product role, publishing model or editorial behavior changes. |
| II. Fixed stack and static-first | PASS — values remain in the existing static locale source and use the current render path. | PASS — no SSR, runtime CMS request, framework, route or build architecture change. |
| III. Privacy and security | PASS — no form field, submission, verification or private data is touched. | PASS — form and security-sensitive files are protected by exact hashes and remain read-only. |
| IV. SQLite and verified infrastructure | PASS — backend, SQLite and infrastructure are outside scope and will not be accessed. | PASS — QA is source-only, local and network-free; no database or external service is required. |
| V. Simplicity and maintainability | PASS — direct value replacement is the smallest solution. | PASS — one focused built-in-only harness replaces neither stack nor existing QA and adds no dependency. |
| VI. CA/ES/EN parity and no regression | PASS — FR-002 fixes all three languages as one approved set. | PASS — exact assertions cover 3/3 values plus titles, buttons, inactive copy and routes. |
| VII. Repository coordination | PASS — frontend-only; no contract requires backend work. | PASS — backend is an explicit read-only final gate and no cross-repository file is allowlisted. |
| SDD workflow and governance | PASS — SPECIFY and CLARIFY are complete, checklist 16/16, no open clarification. | PASS — PLAN produces only proportional design/QA artifacts and defers execution to TASKS/IMPLEMENT. |

No constitutional violation or complexity exception exists.

## Architecture of the Change

```text
src/i18n/{ca,es,en}.json
  └── home.businessCtaText (only writable product value)
          ↓ existing getTranslations lookup (read-only)
src/pages/index.astro
  ├── existing title (read-only)
  ├── updated paragraph value
  ├── existing button (read-only)
  └── existing canonical language route (read-only)

scripts/qa/commerce-cta-live-copy-qa.mjs
  ├── parse and assert exact CA/ES/EN copy
  ├── reject obsolete preparation wording
  ├── assert protected localized values
  ├── compare normalized raw-locale fingerprints
  └── fingerprint CTA consumers and Commerce form
```

`CategoryPage.astro` and `SubcategoryPage.astro` consume the existing button and canonical routes,
not `businessCtaText`; they remain read-only and fingerprinted. The Commerce form and its template
also remain read-only. There is no data flow to backend and no new interface.

## Exact Implementation Allowlist

### Product — modify exactly

- `src/i18n/ca.json`
- `src/i18n/es.json`
- `src/i18n/en.json`

Within each file, only the value of `home.businessCtaText` is writable. No other byte is authorized.

### QA — create exactly

- `scripts/qa/commerce-cta-live-copy-qa.mjs`

### SDD during IMPLEMENT — modify exactly

- `specs/010-commerce-cta-live-copy/tasks.md`

### Read-only

- `src/pages/index.astro`
- `src/templates/CategoryPage.astro`
- `src/templates/SubcategoryPage.astro`
- `src/templates/CommerceSignupPage.astro`
- `src/components/CommerceSignupFlow.astro`
- `scripts/qa/commerce-submission-qa.mjs`
- `specs/010-commerce-cta-live-copy/spec.md`
- `specs/010-commerce-cta-live-copy/plan.md`
- `specs/010-commerce-cta-live-copy/research.md`
- `specs/010-commerce-cta-live-copy/data-model.md`
- `specs/010-commerce-cta-live-copy/quickstart.md`
- `specs/010-commerce-cta-live-copy/checklists/requirements.md`
- `.specify/feature.json`
- all remaining frontend paths, the complete backend repository, SQLite and infrastructure

If IMPLEMENT discovers a required write outside this allowlist, it MUST stop and request an SDD
revision rather than widening scope silently.

## QA Strategy

Create the focused static harness `scripts/qa/commerce-cta-live-copy-qa.mjs`. It MUST be deterministic,
read-only, network-free and use only Node built-ins. It MUST:

1. parse the three locale files as valid JSON;
2. assert the three exact FR-002 strings;
3. assert that their respective `businessCtaText` values do not contain `Estem preparant`,
   `Estamos preparando` or `We are preparing`;
4. assert exact existing `businessCtaTitle`, `businessCtaButton` and `businessCtaSoon` values;
5. require exactly one raw `businessCtaText` property per locale file;
6. replace only that raw property value with a stable sentinel in memory and compare the resulting
   SHA-256 to the three approved baseline fingerprints; this proves every other byte, key, order,
   indentation, encoding and newline remains unchanged;
7. assert the canonical CA/ES/EN routes in the existing CTA consumers;
8. compare SHA-256 fingerprints for the read-only homepage, category/subcategory consumers,
   Commerce form template/component and existing Commerce harness;
9. print one final PASS only after every assertion succeeds and write no file.

### Mandatory RED side-effect gate

Before creating the harness, IMPLEMENT MUST record a deterministic PRE inventory from the clean
product baseline. After creating the allowlisted harness, checking its syntax and executing the
expected RED against the still-obsolete locale values, it MUST capture the same POST inventory and
compare both snapshots before T005 may begin. The inventory is an external gate so that the newly
created harness can be distinguished from every other workspace effect. It MUST include:

- `git status --porcelain=v1 --untracked-files=all`, staged/unstaged name-status and content hashes
  for every Git-visible path present in either snapshot;
- existence plus deterministic path/type/size/content-hash metadata for relevant ignored or
  temporary roots (`.astro`, `dist`, `.veu-010-*`, QA roots and temporary browser/profile/cache
  paths), without reading or writing backend or SQLite;
- the frontend process and listener inventory before and after the run, including any process owned
  by Feature 010 and every listening socket it opens;
- the harness result and Node active-resource inventory at completion (allowing only normal
  process stdio), proving that it scheduled no timer, child process, worker, open file/socket or
  other deferred work.

Capture the evidence in the command/task output, not in a workspace file. Use the same ordered,
locale-independent command set for PRE and POST: Git porcelain plus staged/unstaged name-status,
SHA-256 over the union of reported paths, sorted metadata/hashes for the named generated/temporary
roots, and read-only process/listener inspection scoped to the frontend and Feature 010. The harness
uses Node built-ins for its own final active-resource check. The comparison itself must not create a
cache, log or inventory artifact in the repository.

The only permitted PRE/POST delta for this phase is creation of
`scripts/qa/commerce-cta-live-copy-qa.mjs`; pre-existing Feature 010 SDD artifacts must remain
byte-identical and the three product locale files must remain unchanged. A valid RED is exactly the
three expected locale-copy failures, with all other harness assertions passing. Any other new,
removed or modified path, cache, process, listener, active handle/request, deferred operation or
persistent side effect fails the gate. Missing or incomplete PRE/POST evidence also fails it.
IMPLEMENT MUST stop before T005 on any such failure; the product edit is authorized only after the
complete RED result and inventory comparison pass together.

Exact values asserted without reinterpretation:

| Locale | Approved `home.businessCtaText` |
|---|---|
| CA | `Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.` |
| ES | `Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.` |
| EN | `Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.` |

### Approved baseline fingerprints

Normalized locale fingerprints (only the raw `businessCtaText` JSON string is replaced in memory by
`__FEATURE_010_BUSINESS_CTA_TEXT__` before hashing):

| Locale | SHA-256 |
|---|---|
| CA | `7796e9f1477397126cdc68782516d85861c2aeb07713292861d74f79d2d017e1` |
| ES | `93d8161147b327caacacc8237ff542c7cabebf8c94205779d6226486dfcb39e0` |
| EN | `8e4349a3561e7a8b2897c0a880f17c8a959cc059f33e6372e261b5dcc21628fe` |

Protected read-only file fingerprints:

| Path | SHA-256 |
|---|---|
| `src/pages/index.astro` | `e7e86621abeda891da4880d65d795339ba9f89538ede718e6730c333e0926bc1` |
| `src/templates/CategoryPage.astro` | `623a6d53bd24776645b85417df1cf23a4fed0efdfa80c9c8e72c3b2e4456cd80` |
| `src/templates/SubcategoryPage.astro` | `2b4d842249a1e364c22219e7e27eac107514fd290c34e8e3f9d3124563e78de9` |
| `src/templates/CommerceSignupPage.astro` | `c73dffcb25c4462e687d7e0ffcdbccf648509353660d36773416a9fb9461317f` |
| `src/components/CommerceSignupFlow.astro` | `01f2b6e880810e3afeb18139cf0df4d8a8ec9fd8e2c5f132bdec64d5e7179033` |
| `scripts/qa/commerce-submission-qa.mjs` | `1336d29544cc76835e5092dd3991ed8f836d1587189c32b2e9c5ee778a0712cf` |

This harness is sufficient because the rendering path already reads these values directly, the
feature changes no executable code, and route/form behavior is protected by both semantic assertions
and byte fingerprints. A build would only re-demonstrate established Astro rendering while requiring
CMS fixtures; a browser would observe the same static strings without exercising any new interaction.
The existing Commerce harness is intentionally not extended because it imports frontend Functions
and backend services, creates image fixtures and tests a much broader security/moderation surface.

## Gates

### PRE-IMPLEMENT

- Frontend is `main` at `aa8823052b32b9df514941b30847184825e29959`, equal to `origin/main`,
  ahead/behind `0/0`, staged `0`, with only the expected Feature 010 SDD artifacts untracked.
- Backend is `main` at `47ca26a0a54fd1c0193afd659b6ba3657b264793`, equal to `origin/main`,
  ahead/behind `0/0` and clean.
- `.specify/feature.json` resolves `specs/010-commerce-cta-live-copy` and remains read-only.
- Current obsolete CA/ES/EN values are recorded before editing.
- The normalized locale fingerprints and all protected file fingerprints above match.
- The exact writable path allowlist is established before any edit.
- The mandatory RED PRE inventory is recorded before the QA harness is created.

### RED — REQUIRED BEFORE PRODUCT

- Create only the allowlisted Feature 010 harness, run its syntax check and execute it while all
  three locale files still contain their obsolete baseline values.
- Observe exactly three expected locale-copy failures; every preservation assertion must pass.
- Capture the matching POST inventory and prove that the harness is the sole authorized delta,
  product and SDD are otherwise byte-identical, and no cache, process, listener, unexpected active
  Node resource, deferred work or other persistent side effect exists.
- Treat absent, partial or mismatched PRE/POST evidence as gate failure and stop before T005.

### POST-CHANGE

- All three locale files parse as JSON.
- `businessCtaText` equals the exact approved CA/ES/EN strings and contains zero obsolete phrases.
- Titles, buttons and `businessCtaSoon` equal their baseline values.
- Normalized locale fingerprints equal the approved baseline, proving no other locale byte changed.
- Protected CTA consumer, route, form and existing QA hashes remain exact.
- `node --check scripts/qa/commerce-cta-live-copy-qa.mjs` exits `0`.
- `node scripts/qa/commerce-cta-live-copy-qa.mjs` exits `0` with its single final PASS.
- The product diff contains exactly three one-line value substitutions and no other product change.
- `git diff --check` passes.

### FINAL

- CA, ES and EN are all PASS and semantically express present availability.
- Modified/untracked paths are confined to the exact IMPLEMENT allowlist plus the pre-existing
  approved Feature 010 SDD artifacts.
- No title, button, route, link, inactive key, form, validation, submission or draft behavior changed.
- Backend remains clean at its baseline; SQLite was not accessed.
- No build, browser, network, dependency install, infrastructure or deployment action occurred.

## Minimal-Diff Policy

IMPLEMENT MUST use an exact targeted patch for the three JSON value lines. It MUST NOT run a JSON
formatter, serializer, sorter, linter autofix or any command that rewrites a complete locale file.
UTF-8 encoding, indentation, key order and newline style must remain byte-identical outside the
three approved string values. The normalized fingerprints fail any collateral byte change, while
the final Git diff must visually show exactly one replaced line in each locale file.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Copy differs by punctuation, accents or wording | Exact UTF-8 string assertions for all three approved values. |
| One locale retains future/preparation wording | Per-locale obsolete-phrase assertions plus exact values. |
| Formatter rewrites a JSON document | No formatting tools; normalized raw-file fingerprint and explicit diff gate. |
| Title, button or inactive `businessCtaSoon` changes | Exact baseline values and whole-file normalized fingerprints. |
| Route or CTA consumer changes accidentally | Semantic route assertions and hashes for homepage/category/subcategory files. |
| Commerce form or submission flow changes | Template/component hashes; neither path is writable. |
| Existing broad QA is modified or invoked unnecessarily | Its source hash is protected; Feature 010 uses a separate static harness. |
| Scope expands to backend, SQLite or infrastructure | No such path is allowlisted; final repository and no-access gates. |

## Project Structure

### Documentation (this feature)

```text
specs/010-commerce-cta-live-copy/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md                  # future output of $speckit-tasks; not created by PLAN
```

No `contracts/` artifact is created: the feature adds or changes no external API, protocol, storage
schema or interface contract. FR-002 and the data model already define the complete visible copy
contract.

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── ca.json              # MODIFY one value
│   ├── es.json              # MODIFY one value
│   └── en.json              # MODIFY one value
├── pages/
│   └── index.astro          # READ-ONLY consumer/routes
├── templates/
│   ├── CategoryPage.astro   # READ-ONLY button/routes
│   ├── SubcategoryPage.astro# READ-ONLY button/routes
│   └── CommerceSignupPage.astro # READ-ONLY form template
└── components/
    └── CommerceSignupFlow.astro # READ-ONLY form behavior

scripts/qa/
├── commerce-cta-live-copy-qa.mjs # CREATE static Feature 010 harness
└── commerce-submission-qa.mjs    # READ-ONLY existing broad harness
```

**Structure Decision**: Keep the established locale/consumer architecture unchanged. Modify only
the three localized values and add one isolated QA artifact whose scope matches this feature.

## Complexity Tracking

No constitutional violation or additional complexity requires justification.
