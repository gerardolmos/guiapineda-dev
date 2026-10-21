# Implementation Plan — Feature019

2026-10-20 | Spec: [spec.md](spec.md) | main | Initial design preserved below; recovery amendment takes precedence.

## Summary and technical context
Existing Astro/Tailwind static frontend. Proposed only src/components/SiteFooter.astro: a normal scoped Astro style with selector `footer :global(a:focus-visible)` and only `outline-style: solid`. This is a design description, no application code created. Keep all existing classes, outline width/color/offset, markup and scripts. No !important, JS, global style block or shared component change.

## Scope / cascade reasoning
Astro keeps the footer ancestor scoped to this component; :global only on the descendant permits matching links produced inside SiteBrand/LanguageSwitcher, whose own scope attributes need not match the parent. A fully scoped descendant selector may miss nested elements; a wholly global a:focus-visible selector would leak. The chosen selector requires the scoped footer ancestor, so the header cannot match.
Tailwind utilities are in the utilities cascade layer (installed index.css); the normal unlayered component rule takes precedence over normal layered outline declarations. Utility outline-none sets style none; focus-visible utilities supply2px, offset and color. Direct outline-style overrides the suppressed style without relying on modifying --tw-outline-style, and does not reset the other outline longhands. No competing unlayered outline rule found in inspected footer/global stylesheet. Verify generated selector and winning declaration in future QA; no hypothetical class-presence PASS.

## Constitution Check — before/after design PASS
I editorial behavior unchanged; II static build retained; III private flows untouched; IV no real data/storage; V one property/one file/no dependency; VI three languages and regression parity; VII frontend only. Constitution1.0.0 unmodified. No exception. No design unknown requiring scope expansion.

## Exact future scope
Product allowlist: src/components/SiteFooter.astro ONLY.
Future authorized QA: specs/019-footer-keyboard-focus-visibility/qa.mjs and qa-report.md; no harness created now. Current docs: spec,plan,tasks,research,data-model,quickstart,contracts/footer-focus,checklists/requirements. All under019. If actual clipping/contrast requires another product file or changes beyond restoring style, STOP and document before any expansion. SiteBrand,LanguageSwitcher,SiteHeader,shared CSS/routes/config/package stay unchanged.

## Validation / risks
Build isolated real footer plus real header/shared dependencies and static translations, using installed tools and synthetic paths. Pin baseline to1808ede5e2b5c2e38baa13c12a3495a63169523d so comparison remains reproducible after future commits. No current HEAD-as-baseline assumption. Verify scope on compiled CSS and real computed focus. Measure actual adjacent background for language wrapper, not footer background alone. Screenshot inspection must prove complete outline; geometry/overflow inspection supplements pixels. Preserve empty/unfocused state and header including its original limitations. Full application/CMS build forbidden; no historical QA suites.

## Workflow
No extensions.yml hooks. Explicit feature directory only; do not change .specify/feature.json or branch. Templates/conventions follow018. Task generation and design review do not authorize implementation. Original HIGH remains pending; design gates can pass independently.

## Authorized QA recovery amendment
User explicitly authorizes the minimal indispensable offset change within SiteFooter.astro. Preserve initial solid rule. Add scoped `footer :global(a[hreflang]:focus-visible)` with only `outline-offset: -2px`. No positioned elements/z-index/gaps, markup or shared edits.

Probe in real compiled synthetic fixture: CA rect873.328125..913.328125, selected ES starts913.328125, both static/auto stacking. External2px offset plus2px width enters sibling; later white span obscures right edge. Runtime position-relative/z-index1 restores pixels, confirming paint order, but amber on white contrasts1.7225:1 and overlaps sibling. Reject that approach. Runtime offset-2px restores four edges within own40×36box. Existing8px horizontal padding keeps outline away from label. This minimal offset exception preserves thickness/color, avoids changing no-focus layout and satisfies the authorized recovery scope. All non-language offsets remain4px. No guarantees relaxed.

Re-run all12 baseline/current cases,120Tab/108Shift+Tab; pixel-check reverse as well as forward; inspect both language links for all languages/viewports. Requirements/contract amended solely for justified inset. No dependency or backend effect; Constitution I–VII retained. Prior one-property-only stop has been superseded by this explicit recovery authorization.
