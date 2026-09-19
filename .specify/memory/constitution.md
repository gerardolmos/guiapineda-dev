<!--
Sync Impact Report
- Version change: unratified scaffold -> 1.0.0
- Modified principles:
  - Placeholder Principle 1 -> I. Local Product with Editorial Participation
  - Placeholder Principle 2 -> II. Fixed Stack and Static-First Public Architecture
  - Placeholder Principle 3 -> III. Moderated Participation, Privacy, and Security
  - Placeholder Principle 4 -> IV. Data Integrity and Verified Infrastructure
  - Placeholder Principle 5 -> V. Simplicity, Sustainability, and Proportional Cost
- Added principles:
  - VI. Multilingual Parity and No Regression
  - VII. Coordinated Repositories and Explicit Contracts
- Added sections:
  - Product and Operational Constraints
  - Spec-Driven Workflow and Quality Gates
- Removed sections: none; template placeholders were resolved.
- Follow-up TODOs: none.
-->
# GUIAPINEDA Constitution

## Core Principles

### I. Local Product with Editorial Participation
GUIAPINEDA MUST remain a local platform for Pineda in which the community contributes content and
GUIAPINEDA receives, reviews, organizes, and publishes it in a structured, useful form.
Participation MUST be moderated and editorial. The product MUST NOT become a social network, forum,
open-comment system, follower-based platform, user messaging service, infinite feed, or automatic
citizen-publishing platform. Product changes MUST preserve this identity unless a human-approved
constitutional amendment changes it.

### II. Fixed Stack and Static-First Public Architecture
Astro, Tailwind CSS, and Strapi are the fixed base technologies and MUST NOT be replaced, or joined
by an alternative framework serving the same role, without an explicit human decision. Normal
public navigation MUST remain primarily static through the flow Strapi -> build -> static Astro ->
hosting/CDN -> visitor. A normal visitor MUST NOT cause runtime queries to Strapi or PostgreSQL
merely for implementation convenience. SSR, direct runtime CMS access, or an equivalent dynamic
architecture requires a demonstrated functional need and explicit approval.

### III. Moderated Participation, Privacy, and Security
Dynamic citizen participation MUST follow a controlled flow: browser -> email verification ->
one-time token -> Function -> internal authentication -> Strapi -> private request -> human
moderation -> editorial publication when applicable. Strapi MUST NOT be exposed publicly to
simplify forms, and citizen submissions MUST NOT publish automatically.

Personal data MUST be minimized. Permanent citizen accounts MUST NOT be created without a new
explicit decision. Participation email is private, exists only for verification and possible
clarification, MUST NOT be published, and MUST be deleted when moderation closes where applicable.
Secrets, credentials, HMAC material, internal bearer tokens, and environment variables MUST NOT be
persisted in or exposed to the frontend. Browser-temporary data MUST be limited to the functional
minimum.

Existing email verification, one-time tokens, rate limiting, internal authentication, image
quarantine and normalization, metadata removal, and private moderation are security-sensitive
zones. They MUST NOT be bypassed, removed, or weakened without an explicit SPEC, risk analysis, and
human approval. Millorem Pineda Unit A is closed and MUST NOT be reopened except for a real defect
or explicit decision. A future capability to report content or announcements MUST exist on every
surface where it is functionally applicable, MUST feed the moderation model, and MUST NOT create
public comments or conversation.

### IV. Data Integrity and Verified Infrastructure
The current Strapi SQLite data is valuable and MUST be preserved in full for any future PostgreSQL
migration, including relationships with public uploads, private requests, quarantined images, and
Media. No migration, destructive schema change, or potentially dangerous data operation may run
without all four gates: prior inspection, verifiable backup, validation, and human approval.

Any infrastructure, external service, deployment, software version, or environment MUST be verified
in the current project state and explicitly adopted before it is treated as active. Cloudinary MAY
be evaluated, but MUST NOT be installed or activated without an explicit decision. Repositories and
current Git state are the primary source of truth, followed by demonstrated behavior, current
documentation, and then historical reports. Production state, external services, versions,
branches, and infrastructure MUST be inspected rather than assumed.

### V. Simplicity, Sustainability, and Proportional Cost
The product MUST remain maintainable for years by one person. Before adding infrastructure,
external services, abstractions, or dependencies, work MUST first determine whether the existing
stack can solve the problem, justify the need, evaluate cost and complexity, and obtain approval.
Solutions MUST favor explicitness, simplicity, and maintainability; speculative additions are
prohibited. Free tiers or low hobby-level costs SHOULD be preferred when they meet the product's
needs. A new SaaS MUST NOT be introduced solely for technical convenience.

### VI. Multilingual Parity and No Regression
Catalan, Spanish, and English are structural product languages. Every feature or modification MUST
explicitly evaluate its impact across CA, ES, and EN and MUST maintain equivalent behavior wherever
those languages are functionally applicable. This evaluation MUST cover the routes, interface,
forms, states, and messages affected by the change; it MUST NOT require an unrelated backend-only
change to create public-language surfaces that do not exist. The existence of three public routes
MUST NOT be treated as proof that CMS content is localized; localization behavior MUST be inspected.

SDD adoption MUST evolve the existing product rather than reconstruct it. Before modifying existing
functionality, work MUST inspect its actual behavior, distinguish deliberate behavior from debt,
and preserve it unless the relevant SPEC authorizes a change. Changes MUST be small, verifiable,
limited to their SPEC, and reversible where reasonable. Opportunistic refactoring MUST NOT be mixed
with feature work unless strictly necessary and documented.

### VII. Coordinated Repositories and Explicit Contracts
`guiapineda-astro` and `guiapineda-strapi` are independent Git repositories that together form one
GUIAPINEDA product. They MUST NOT be merged without an explicit human decision. Every SPEC and PLAN
MUST name the repository or repositories affected, the participating layers, and the contracts
between frontend and backend. Cross-repository changes MUST occur only when the feature requires
them, and unrelated cross-repository work is prohibited.

## Product and Operational Constraints

- Human moderation is a structural product capability, not a temporary operational workaround.
- Citizen-facing participation MUST remain private until editorial publication is approved.
- Reporting content or announcements is a mandatory future product requirement; its exact surfaces
  and behavior require a dedicated SPEC before implementation.
- Infrastructure described as future or exploratory MUST NOT be represented as currently active.
- Ephemeral implementation details MUST remain outside this constitution unless they become durable
  product constraints through an approved amendment.
- Humans define objectives, product decisions, and constraints; approve consequential decisions;
  and validate results. Codex inspects, proposes technical options, produces SDD artifacts, executes
  approved implementation tasks, and performs technical validation. Consequential technical choices
  MUST be presented to humans in understandable language with options and consequences.

## Spec-Driven Workflow and Quality Gates

Work MUST normally proceed through CONSTITUTION -> SPECIFY -> CLARIFY when valuable -> PLAN -> TASKS
-> ANALYZE when valuable -> IMPLEMENT -> CONVERGE. IMPLEMENT MUST NOT begin while scope is
insufficiently specified. Optional phases need not run mechanically, but omitting one MUST leave the
requirements and plan sufficiently clear.

Before an implementation is considered complete, its diff MUST be reviewed; relevant available
validations MUST run; the build MUST run when applicable; affected behavior MUST be validated
functionally; reasonable regressions MUST be checked; Git state MUST be inspected; and any validation
that could not run MUST be documented. The absence of a complete automated test suite MUST NOT be
used as evidence that code works. New tests or QA tools require a conscious, proportional decision
and MUST NOT expand scope automatically.

Each implementation MUST remain within its SPEC. Any necessary departure from the approved PLAN or
constitutional constraint MUST be documented and raised for approval before the conflicting work
continues.

## Governance

This constitution governs the complete GUIAPINEDA product across both repositories and supersedes
local practices and conflicting SPEC decisions. A SPEC MUST NOT amend a principle implicitly. If a
future need conflicts with this constitution, the conflict and rationale MUST be stated, a human
MUST approve the change, this constitution MUST be amended first, and affected SDD artifacts MUST
then be updated before implementation proceeds.

Amendments require a documented proposal, impact assessment across both repositories and active SDD
artifacts, explicit human approval, and a migration or remediation plan when existing work is
affected. Constitution versions follow semantic versioning: MAJOR for incompatible principle
removal or redefinition, MINOR for a new principle or materially expanded governance, and PATCH for
clarifications without semantic change. The Last Amended date MUST change whenever the content
changes; Ratified records the original adoption date.

Every SPEC, PLAN, TASKS set, and implementation review MUST verify constitutional compliance.
Reviewers MUST cite the applicable principle when approving an exception or identifying a conflict.
Complexity, new services, security-sensitive changes, destructive data operations, and
cross-repository work MUST satisfy their explicit gates before implementation. Runtime evidence and
current repository state MUST take precedence over stale documentation during compliance review.

**Version**: 1.0.0 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-19
