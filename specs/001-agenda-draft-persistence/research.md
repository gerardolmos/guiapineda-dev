# Research: Persistencia de borradores multidioma de Agenda

## Decision 1: Positive allowlist owned by Agenda

**Decision**: Agenda declares exactly 13 persistable field names. The draft helper receives that
allowlist and never discovers eligible fields generically.

**Rationale**: The current broad selector includes the text honeypot `bot-field` and would include
future simple or checkbox fields by default. A positive list makes data minimization testable and
keeps approval of new persisted fields deliberate.

**Alternatives considered**:

- Keep the current selector plus exclusions by type/name: rejected because names are heuristic and
  sensitive future fields would be opt-out.
- Mark allowed fields in Astro markup: valid, but requires a component change when the TypeScript
  flow already owns this behavior; rejected as a larger surface for this pilot.
- Serialize `FormData`: rejected because it includes hidden operational fields, consent, honeypot and
  file data.

## Decision 2: Versioned envelope in the existing common key

**Decision**: Keep `guiapineda:submission-draft:v1:agenda` for all three languages and store an
envelope with literal version, scope and a `fields` object containing only string values.

**Rationale**: The common key is already correct for same-origin CA/ES/EN navigation. Payload-level
version validation distinguishes compatible state from arbitrary JSON. The prior raw object lacks
the envelope and will be cleared safely instead of migrated.

**Alternatives considered**:

- Locale-specific keys: rejected because they would create separate drafts and break the core flow.
- Reuse the raw record: rejected because it has no schema/version validation and may already contain
  the honeypot.
- New key without cleaning the old one: rejected because it leaves avoidable sensitive legacy data
  alive until the tab closes.

## Decision 3: Partial projection after envelope validation

**Decision**: Reject and clear malformed/wrong-version envelopes. For a valid envelope, restore only
allowlisted keys whose values are strings and whose controls still exist; ignore unknown, absent or
type-invalid individual fields.

**Rationale**: This preserves reliable portions of a partial draft while preventing unknown data
from reaching controls. Current form validation remains the authority for dates, email, URL and
length constraints.

**Alternatives considered**:

- Reject the whole envelope for one bad field: safe but unnecessarily loses other valid user input.
- Coerce numbers/booleans/arrays to strings: rejected because incompatible data should not be
  interpreted inventively.
- Validate business rules inside the storage helper: rejected because it duplicates Agenda rules
  and risks drift.

## Decision 4: Restore first, derive state second, verification fresh

**Decision**: Restore allowed values synchronously, then initialize the email-verification controller
so it starts false with an empty token, then silently reconcile date constraints, counters and button
states. Do not dispatch synthetic input/change events during restore.

**Rationale**: Direct value assignment prevents autosave or verification side effects. Reusing the
existing UI functions after restoration produces the same validation outcome as manual input without
focusing fields or displaying intrusive browser errors on page load.

**Alternatives considered**:

- Restore after all controllers and simulate events: rejected because events may reset verification,
  clear date values or save intermediate state.
- Trust server-rendered initial counters/buttons: rejected because they do not reflect restored data.
- Persist derived UI state: rejected because it can become stale and includes security-sensitive
  state.

## Decision 5: Native tab-session lifecycle only

**Decision**: Use `sessionStorage` without TTL. Clear explicitly after confirmed submission and on
form reset; rely on the browser to end storage with the tab session. Do not clear on unload/pagehide.

**Rationale**: This matches the clarified SPEC. Clearing during navigation would destroy the draft
between language routes. No timestamps, timers or extra control are needed.

**Alternatives considered**:

- `localStorage`: rejected because it survives the tab session and increases PII retention.
- TTL in `sessionStorage`: rejected because artificial expiry is explicitly prohibited.
- `beforeunload`/`pagehide` cleanup: rejected because language navigation uses normal page loads.
- New discard button: rejected by the SPEC.

## Decision 6: Keep server and shared transport unchanged

**Decision**: Preserve the existing verified submission transport and clear the draft only when its
promise resolves after an explicit successful response. Keep backend, Functions and Strapi intact.

**Rationale**: Draft persistence is a frontend convenience and has no server contract. The current
transport already rejects non-success responses, so failed submissions retain the draft.

**Alternatives considered**:

- Clear on submit event before awaiting response: rejected because network/server failure would lose
  the draft.
- Add draft endpoints or server storage: rejected by scope, privacy and static-first constraints.
- Change the shared transport to add an Agenda-only callback: rejected as unnecessary shared-surface
  change.

## Decision 7: No new automated-test dependency in this feature

**Decision**: Use the existing build plus static review and a complete manual matrix. Do not add a
test framework as incidental scope.

**Rationale**: The repository has no test runner, lint command or installed Astro check tooling.
Adding infrastructure would exceed this small pilot. Runtime behavior still requires explicit manual
validation because build success alone is insufficient.

**Alternatives considered**:

- Add Vitest or Playwright now: potentially valuable later, but requires an explicit proportional QA
  decision beyond this feature.
- Claim `astro check` validation: rejected because its required packages are not installed.

## Existing implementation conclusion

The prior work is a useful skeleton, not an approved solution. Reuse the storage medium, common
scope, event triggers, try/catch and cleanup hooks. Replace broad field discovery and raw state;
add schema validation and deliberate UI reconciliation. The duplicate email-input listener observed
in `emailVerificationController.ts` is preexisting debt and remains outside this feature.
