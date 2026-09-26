# Data Model: Private Submission Content API Hardening

## Change Declaration

- **Schema changes**: none.
- **Migrations**: none.
- **Persistent data changes**: none.
- **Relationship changes**: none.
- **State changes**: none.
- **Generated type changes**: none.
- **Real/baseline SQLite**: MUST NOT be opened through a SQLite engine, modified or migrated during
  IMPLEMENT. Only filesystem gates are permitted: SHA-256, size, mtime and WAL/SHM/journal sidecar
  presence.
- **Temporary QA SQLite**: permitted only for the isolated programmatic Strapi instance when created
  inside the harness temporary environment, never reusing `.tmp/data.db`, containing no real data,
  never copied from the real SQLite, used only to initialize isolated Strapi, not persisted after
  the harness and removed in `finally`. It is not a migration or a persistent-data modification.

This feature changes route registration only. Existing content-type identity and storage remain
authoritative.

## Existing Entities Preserved

### Private Agenda submission

- **UID**: `api::solicitud-agenda.solicitud-agenda`
- **Collection**: `solicitudes_agenda`
- **Public API plural name being retired**: `solicitudes-agenda`
- **Lifecycle states**: `pendent`, `en_revisio`, `aprovat`, `rebutjat`
- **Legitimate creation path**: authenticated internal submission → Documents Service
- **Legitimate administration path**: Content Manager and internal moderation
- **Schema fingerprint**:
  `4807248506b2864ead5bf6f874b463cecc127a76cc500fa0da3b5d19c9180c58`

### Private Veu submission

- **UID**: `api::solicitud-veu.solicitud-veu`
- **Collection**: `solicitudes_veu`
- **Public API plural name being retired**: `solicitudes-veu`
- **Lifecycle states**: `pendent`, `en_revisio`, `aprovat`, `rebutjat`
- **Legitimate creation path**: authenticated internal submission → Documents Service
- **Legitimate administration path**: Content Manager and internal moderation
- **Schema fingerprint**:
  `64d5b17dcb66629f4f1a532f0735f2dddd2df48bb2d596ad6d499e28148c8197`

## Relationships and Boundaries

- Private submissions remain distinct from public `api::agenda.agenda` and `api::veu.veu` content.
- Image quarantine references, Media relations, contact data and moderation metadata remain exactly
  as currently modeled.
- Removing Content API factories does not remove content-types from Strapi's model registry.
- Documents Service continues resolving both UIDs from their schemas.
- Content Manager continues listing, opening and editing both content-types through Admin APIs.

## State Transitions

No transition changes:

```text
pendent -> en_revisio -> aprovat
                     \-> rebutjat
```

All transitions remain human-triggered through the existing moderation flow. Route removal never
publishes, approves, rejects, deletes or otherwise mutates a submission.

## Validation Invariants

1. Both schemas remain byte-identical to their recorded fingerprints.
2. Both UIDs remain present in the Strapi content-type registry and generated types.
3. Internal creation produces a private document in `pendent` state.
4. No private request produces a public Agenda or Veu document automatically.
5. The real SQLite file, its size/mtime and sidecar set remain unchanged.
