# Research / evidence — Feature019

2026-10-20. Source review and earlier diagnostic reused; no new runtime test in this SDD phase.

## Original evidence
Feature014 qa-report.md records absent outline despite keyboard focus. Subsequent authorized isolated diagnostic (conversation2026-10-20) built six synthetic pages using actual footer/shared components/styles/dictionaries.12 configurations,120 Tab advances and108 Shift+Tab reversals: all keyboard-focused links matched focus-visible yet computed outline-style none, width2px, --tw-outline-style none, no box shadow. No clipping ancestors detected. Reversible DOM-only solid-style probe restored outline. Chrome screenshot confirmed absence. Temporary evidence files were removed at diagnostic close; results retained here as historical evidence, not a newly run QA result.
11 anchors with selector: brand+7navigation+email+2other languages.9 without. Selected language is a span. Diagnostic sampled amber/footer≈11.7:1 and orange/footer≈8.5:1; this is not a complete actual-background contrast certification for language wrapper or other environments.

## Inspected sources
SiteFooter.astro:52 root;75 navigation;92 email;98–106 language child. SiteBrand.astro:29 and LanguageSwitcher.astro:64 both use outline-none and focus-visible width/offset/color. src/styles/global.css imports Tailwind only. node_modules/tailwindcss/index.css places utilities in @layer utilities. No application source edited.

## Supported CSS mechanism
Official Astro supports combining a scoped ancestor and :global descendants, including child-component content: https://docs.astro.build/en/guides/styling/ . Tailwind documents outline-none as removal of outline styling and solid as a supported style: https://tailwindcss.com/docs/outline-style . Consulted2026-10-20. Cascade analysis: scoped unlayered component declaration overrides normal layered utilities; descendant matching must not require parent scope on child anchors. Actual compiled/rendered confirmation remains future implementation QA, not required to pretend code already exists.

Decision: scoped footer ancestor + global focus-visible anchor descendant, only outline-style solid. Alternatives: global child-component fixes affect header; removing outline-none in children expands scope; adding only width/color repeats defect; whole-document global selector leaks. No new research on017/B03.

Git preflight: frontend main1808ede5e2b5c2e38baa13c12a3495a63169523d, backend mainc2f405312bb7dcd8dc6bd1abce42d317e0e3e879. Both without tracked changes;55 untracked017/prerequisite Markdown files preserved. No runtime, DB, SQLite, storage, dependencies or deployments in this phase.

## Recovery evidence
Initial design/history above retained. Authorized QA recovery reproduces adjacent static sibling paint obstruction; z-index restores edge but gives1.72:1 amber/white contrast. Minimal footer-only inset offset-2px selected; see plan amendment and qa-report recovery section for executed validation.
