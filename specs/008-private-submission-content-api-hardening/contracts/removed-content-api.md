# Negative Contract: Removed Private Submission Content API

## Contract Status

The standard Content API for private Agenda and Veu submissions does not exist after Feature 008.
This is a removal contract, not a replacement API.

## Removed Operations

| Method | Former path | Required result |
|---|---|---|
| `GET` | `/api/solicitudes-agenda` | Natural `404` from no matching route |
| `POST` | `/api/solicitudes-agenda` | Natural `405`; `Allow: HEAD, GET`; zero writes |
| `GET` | `/api/solicitudes-agenda/:id` | Natural `404` from no matching route |
| `PUT` | `/api/solicitudes-agenda/:id` | Natural `405`; `Allow: HEAD, GET`; zero updates |
| `DELETE` | `/api/solicitudes-agenda/:id` | Natural `405`; `Allow: HEAD, GET`; zero deletes |
| `GET` | `/api/solicitudes-veu` | Natural `404` from no matching route |
| `POST` | `/api/solicitudes-veu` | Natural `405`; `Allow: HEAD, GET`; zero writes |
| `GET` | `/api/solicitudes-veu/:id` | Natural `404` from no matching route |
| `PUT` | `/api/solicitudes-veu/:id` | Natural `405`; `Allow: HEAD, GET`; zero updates |
| `DELETE` | `/api/solicitudes-veu/:id` | Natural `405`; `Allow: HEAD, GET`; zero deletes |

`:id` represents any syntactically valid, invalid, existing or nonexistent identifier. Request
authorization, payload shape and permissions do not create a content action because none of the ten
standard signatures remains registered.

## Response Constraints

- `GET` status is natural `404`; `POST`, `PUT` and `DELETE` status is natural `405`, never an
  artificial `401` or `403`.
- Every `405` exposes exactly `Allow: HEAD, GET`. The advertised `HEAD` is global framework
  metadata, not a retained private Content API operation.
- The response exposes no private content, field, count, identifier or sensitive metadata.
- No request creates, updates or deletes persistent data.
- No replacement endpoint, redirect or compatibility alias is introduced.
- No middleware, runtime policy, configuration or response normalization converts `405` to `404`.

## Evidence of Actual Route Absence

No status code is sufficient by itself. Acceptance requires all of the following:

1. the six standard router/controller/service factories are deleted;
2. the real Strapi route map contains none of the ten inherited signatures;
3. the four former `GET` operations return natural `404`;
4. the six mutating operations return natural `405` with exact `Allow: HEAD, GET`;
5. the synthetic, deliberately unregistered path `/api/feature008-definitely-nonexistent` returns
   `404` for `GET` and the same `405`/`Allow` pair for `POST`, `PUT` and `DELETE`;
6. private document counts and states are identical before and after every rejected mutation;
7. the authenticated internal interfaces remain operational.

The synthetic path is QA-only evidence. It MUST NOT be registered or become a production feature.

## Unchanged Legitimate Interfaces

- `POST /api/internal/submissions/agenda`
- `POST /api/internal/submissions/veu`
- Existing `/api/internal/moderation/...` routes
- Strapi Content Manager administrative interfaces
- Public `agenda` and `veu` content APIs

The first two remain server-to-server authenticated. This document does not broaden or redefine
their payload, authentication or response contracts.
