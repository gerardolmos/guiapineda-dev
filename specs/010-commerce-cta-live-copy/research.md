# Research: Commerce CTA — Current Availability Copy

## Decision 1: replace only the three localized text values

**Decision**: Change exactly `home.businessCtaText` in `src/i18n/ca.json`, `src/i18n/es.json` and
`src/i18n/en.json` to the approved FR-002 strings. Preserve every other byte and all consumers.

**Rationale**: `src/pages/index.astro` already reads the localized value directly and always maps
CA, ES and EN to their active canonical signup routes. `CategoryPage.astro` and
`SubcategoryPage.astro` reuse the button and routes but do not render this paragraph. No other
product change is required to make the approved copy visible.

**Alternatives considered**:

- Change CTA markup: rejected because the current structure already renders the required value.
- Change titles or buttons: rejected because they already describe the active action correctly.
- Remove or normalize `businessCtaSoon`: rejected because it is inactive and explicitly out of
  scope.
- Add a new translation key: rejected because the established key is the intended source of truth.

## Decision 2: use a dedicated static Feature 010 harness

**Decision**: Create `scripts/qa/commerce-cta-live-copy-qa.mjs` using only Node built-ins. Do not
extend or execute the existing full Commerce submission harness for Feature 010 acceptance.

**Rationale**: The new behavior is three static string values. The existing Commerce harness imports
submission Functions and backend services, creates temporary image fixtures and covers security,
moderation and image lifecycles unrelated to this change. A focused harness can prove the exact
copy, protected values, routes and file integrity with a smaller deterministic surface and no
backend access.

**Alternatives considered**:

- Extend `scripts/qa/commerce-submission-qa.mjs`: rejected because it broadens the writable and
  executable scope and couples copy validation to unrelated backend-heavy QA.
- Manual inspection only: rejected because exact multilingual strings and protected values benefit
  from repeatable byte-precise evidence.
- Add a test framework: rejected because Node built-ins are sufficient and dependencies are out of
  scope.

## Decision 3: no build or browser validation

**Decision**: Validate source values, their direct consumers and protected behavior statically; do
not run Astro build or browser QA for this feature.

**Rationale**: There is no new rendering branch, interaction, style, route or executable logic. The
homepage interpolates the same translation property as before. Exact JSON parsing plus consumer
inspection proves the changed source reaches the existing render position, while hashes protect the
route and form implementation. Build/browser would add CMS fixtures, generated files and cleanup
risk without distinguishing a correct string replacement from the static assertions.

**Alternatives considered**:

- Full build: rejected as disproportionate and dependent on unrelated CMS build inputs.
- Browser screenshot or DOM assertion: rejected because no layout or runtime behavior changes and
  the rendered paragraph is a direct interpolation of the asserted value.

## Decision 4: combine semantic assertions with normalized raw-file fingerprints

**Decision**: The harness parses JSON for semantic checks, then replaces exactly one raw
`businessCtaText` string per locale with a sentinel in memory and compares the complete resulting
bytes to a baseline SHA-256. Protected consumer/form files use direct SHA-256 fingerprints.

**Rationale**: Parsed JSON alone would not detect reorder, reindent, encoding or newline churn. A
normalization limited to the one approved value makes its content intentionally variable while
turning every other byte into a regression boundary. Direct hashes give the strongest simple proof
that read-only consumers and the form did not change.

**Alternatives considered**:

- Hash whole locale files: rejected because the three authorized values must change.
- Compare parsed objects with the text removed: rejected because serialization can hide formatting
  and ordering changes.
- Trust Git diff alone: rejected as useful final evidence but less reusable and less automated than
  a feature harness.

## Decision 5: no external contract artifact

**Decision**: Do not create `contracts/` for Feature 010.

**Rationale**: The feature changes no API, endpoint, schema, protocol, persistence or integration.
The exact visible strings are already contractual in FR-002 and `data-model.md` records their
invariants.

**Alternatives considered**:

- Add a UI contract file: rejected as duplication for three immutable values already specified
  exactly.

## Decision 6: gate product writes with an external PRE/POST RED inventory

**Decision**: Before the Feature 010 harness exists, record a deterministic PRE inventory of the
Git-visible workspace, relevant ignored/temporary roots, frontend processes and listeners. After
creating and syntax-checking the allowlisted harness and observing its expected three-failure RED,
record the same POST inventory. Permit only the harness creation as the phase delta, and require the
harness to finish without unexpected active Node resources or deferred work. T005 cannot begin unless the
RED result and the complete inventory comparison both pass.

**Rationale**: A harness cannot prove what preceded its own creation. A small external gate using
Git status/diff, path metadata, hashes and local process/listener inspection establishes that
baseline, distinguishes the one authorized QA artifact from product or workspace contamination,
and turns the claimed absence of side effects into executable evidence.

**Alternatives considered**:

- Let the harness inventory only its own execution: rejected because it cannot observe the
  workspace state before the harness file was created.
- Defer the inventory until final GREEN: rejected because product would already have changed before
  the RED isolation claim was proven.
- Add a dependency or general-purpose workspace monitor: rejected as disproportionate; Git and
  Node built-ins plus local process/listener inspection provide the required evidence.

## Resolved Questions

- Product write scope: exactly three locale files and one value in each.
- QA artifact: one dedicated static Node harness.
- Build/browser: not applicable and deliberately omitted.
- Backend/SQLite: no access and no change.
- Formatting: exact targeted patch only; normalized byte fingerprints prohibit collateral rewrite.
- RED isolation: mandatory external PRE/POST inventory permits only harness creation and blocks
  product writes on any side effect or incomplete evidence.
- Remaining `NEEDS CLARIFICATION`: none.
