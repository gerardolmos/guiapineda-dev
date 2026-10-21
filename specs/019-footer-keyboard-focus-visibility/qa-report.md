# Feature019 — Implementation, QA and convergence

Current outcome: recovery PASS, IMPLEMENT PASS, QA PASS, CONVERGE PASS. Original failed attempt retained below; latest recovery evidence at end. No commit/push authorized.

Date: 2026-10-20. User authorization: IMPLEMENT → QA → CONVERGE only; no commit/push.

## Preflight and implementation
Constitution 1.0.0 and approved spec/plan/tasks/contracts consulted. Checklist 16/16 complete. Frontend main at 1808ede5e2b5c2e38baa13c12a3495a63169523d; backend main at c2f405312bb7dcd8dc6bd1abce42d317e0e3e879. Both initially tracked-clean. Preserve 30 Markdown files under017 and25 under suspended prerequisite. Feature019 documentation preexists untracked.

Only product change: scoped `footer :global(a:focus-visible)` declaring `outline-style: solid`. Existing colors, width, offsets, classes, markup and shared components unchanged. Compiled CSS assertion confirms scoped footer ancestor and unscoped child anchor selector.

## Reproducible isolated QA
Commands: `node specs/019-footer-keyboard-focus-visibility/qa.mjs baseline` and `node specs/019-footer-keyboard-focus-visibility/qa.mjs`. Installed Node/Astro/Tailwind/Chrome/sharp only; no installation. Harness copies only explicitly listed frontend components, styles, translations and SVG assets to owned temporary directories. Baseline footer pinned to1808ede. No application routes, backend, env files or historical suites executed. Build fetch denied; browser page requests restricted to loopback. Owned browser/server/build temp cleaned in finally.

Baseline: PASS reproduction in12configurations (CA/ES/EN ×1280×900/390×900 ×selector shown/hidden). 120forward and108reverse visits reach actual focus-visible anchors with outline-style none. Baseline-only summary counts are reserved for corrected assertions and show zero, while case loops execute full traversal. No external page requests.

## Final QA: FAIL — stop at visible obstruction
Chrome155.0.8059.85, headless, deviceScaleFactor1. Two final executions reproduced the same pixel assertion failure; the second saved diagnostic geometry and screenshot. Both synthetic builds pass and compiled scope passes. All12 baseline cases pass reproduction. Corrected CA1280×900 with selector shown and hidden passes the complete forward/reverse and pixel checks. Corrected ES1280×900 with selector shown fails at footer anchor index9 (CA language link). Remaining corrected cases were not completed after the required STOP.

The focused CA link has `:focus-visible=true`, `outline-style:solid`, width2px, offset2px, amber `oklch(0.828 0.189 84.429)` (sRGB255,185,0), rect[873.328125,457,40,36]. Left/top/bottom midpoint pixels are amber, but the right midpoint is not. Visual inspection of the saved actual browser screenshot confirms that the adjacent selected ES span's white background paints over the right outline. Ancestors have no clipping overflow: this is sibling paint overlap, not container clipping or an absent focus state. The shared selector places adjacent items without enough clearance for the preserved external outline. The approved one-property change cannot guarantee an unobscured complete indicator in this case.

No assertion was weakened. No additional product fix attempted. Original HIGH accessibility defect remains OPEN for acceptance: style suppression is corrected, but complete visibility is not. New scope authorization/design revision is needed to address the overlap while preserving other instances and required geometry; no shared component changes were made.

Actual screenshot inspected through image viewer; transient evidence path ended in `guiapineda019-evidence-9YJVJu/failure.png`. Evidence pixels are reproducible with the checked-in-intended harness (currently untracked); temporary screenshots removed after inspection. Harness saves a failure screenshot and prints exact geometry/context before failing. No screenshots or generated build files added to repositories.

## Regression coverage and limitations
Baseline/current no-focus screenshot bytes and link geometry/styles/labels/destinations/selected-language semantics compare equal for corrected CA shown/hidden and ES shown before failure. Header focus snapshot also compares equal in these configurations. Source diff confirms no header/shared-component modifications. Completed corrected cases preserve focus order. Do not extrapolate these results to uncompleted final mobile/EN cases. Baseline covers all languages and viewports; final full matrix FAIL, not certified.

No full application pages, real CMS, other browser engines, physical mobile devices, forced-colors modes or real services tested. Synthetic pages use actual components/translations/styles. No historical suites executed. No implementation QA or changes to017/prerequisite/backend.

## Convergence assessment: FAIL
FR001/003: restoration of solid style and preserved longhands demonstrated in executed cases, full acceptance incomplete. FR004/SC002: FAIL (obscured language outline). FR002/006/SC003: partial runtime coverage plus exact source-diff evidence; remaining matrix blocked. FR005/SC001: incomplete final coverage. FR007/SC004: PASS scope/isolation.

IMPLEMENT: PASS for exact authorized rule; QA: FAIL; CONVERGE: FAIL. BLOCKER0, HIGH1 (unresolved complete focus visibility), MEDIUM0. No successful convergence or safe-to-commit claim. T004/T005 remain unfinished. T006 assessment performed, successful closure withheld. No automatic follow-up feature or additional implementation.

Final scope: only SiteFooter.astro product diff (six inserted lines); own019 tasks/qa.mjs/qa-report.md updated/created. All55 protected Markdown documents byte-identical (hashes below), backend tracked/untracked-clean at unchanged HEAD. No commit/push/deploy, dependency, migration, backfill, upload, SQLite or real DB access. Owned QA browser/server/temp stopped/removed.

Protected Markdown content fingerprints (not database files):
-017,30files:781f79a6542ab5e60e80bc4ff83aa97a69d5652a863d2c404e60651064ca68ff.
-prerequisite,25files:1133bd7fb6cfed39c03f31f93d25c466768ca5182b3def6ca65c34484088c8d2.

Prior spec/plan/checklist statements about design-only authorization and unresolved defect describe their original design gate. Current user authorization and this runtime failure supersede that historical phase status without changing requirements. No requirements relaxed.


## Authorized recovery — final outcome (2026-10-20)
The user authorized preserving the solid rule and the smallest indispensable local CSS correction, including justified offset adjustment. No new functional scope. Initial failure above remains historical evidence, superseded by this successful recovery.

### Reproduction and choice
`node specs/019-footer-keyboard-focus-visibility/qa.mjs probe` passed: reconstructs original external2px offset, real Tab to CA with selected ES, expects the four-side assertion failure and logs geometry. CA x873.328125,width40 and ES x913.328125,width40 are adjacent; both static,z-index auto. Ancestors do not clip. Runtime relative/z-index1 restores pixels, confirming sibling paint-order obstruction, but amber versus white gives1.7224996:1 and paints over adjacent selected item. Rejected. Runtime inset offset-2px restores all sides inside own bounds with no sibling overlap. No source change during the probe.

Recovery product change adds only `footer :global(a[hreflang]:focus-visible) { outline-offset: -2px; }`, preserving the existing solid rule. No positioning/z-index/layout change;2px thickness and colors retained.4px offsets elsewhere retained. Language inset is the justified minimal exception authorized by the recovery request, reflected in SPEC/PLAN/contract/quickstart.8px label padding remains; screenshots show no text overlap. No changes outside footer or to shared sources.

### Complete executed matrix: PASS
`node specs/019-footer-keyboard-focus-visibility/qa.mjs` exited0. Baseline and current isolated builds each generate6synthetic pages. Compiled scoped ancestor check PASS. Both versions cover12configurations: CA/ES/EN ×1280×900/390×900 ×selector visible/hidden. All24case outputs PASS. Corrected counts:120forward,108reverse,228four-side pixel checks. Effective focus-visible, solid style,2px width, approved offsets, color preservation, focus order, counts11/9, labels, destinations and current-language span checked. All12unfocused full-page screenshots compare byte-identical; computed geometry/styles/semantics and focused header control compare identical.

Minimum measured outline-to-background contrast8.477483214197667:1; includes selector slate background, not just footer. All checked overflow ancestors non-clipping; indicators within viewport after focus scroll. Real screenshot pixels on each side supplement computed styles. Visual review of30detail captures (6language/viewport rows ×brand,nav,email,both language links) confirms complete rounded perimeters, including inverse and third-language cases, no text overlap or new sibling obstruction. Captures are temporary and removed after review; harness regenerates them. Screenshot paths are logged by harness for reproducibility. No visual assertion was weakened; reverse pixel checks were added.

0external page requests. Owned browser/server/temp cleanup PASS. Probe and final screenshot directories removed after review. No application pages or database/backend services used. Tested Chrome155.0.8059.85 headless; viewport emulation only, not physical devices. Other engines, forced colors, OS accessibility modes and real pages not covered. No claim of complete product WCAG conformance. Header focus debt outside this feature remains out of scope; baseline behavior preserved.

### Final convergence: PASS
Reviewed7FR,4SC,6acceptance scenarios across2stories, original6tasks plus3recovery tasks, scoped CSS/cascade and minimality decisions, Constitution I–VII. FR001/003: computed style, pixels, colors/width/authorized inset PASS. FR002/005: full multilingual/viewport/selector keyboard and navigation matrix PASS. FR004: no clipping/obstruction, geometry/pixels and visual review PASS. FR006/SC003: baseline screenshots and outside-footer control unchanged, shared/header files unchanged. FR007/SC004: exact source diff and protected/backend checks PASS. SC001/002:120/108visits,228pixel checks and contrast PASS. No missing, partial, contradictory or unrequested implementation findings. No new convergence tasks required. No extensions.yml hooks present.

Original HIGH: RESOLVED within specified acceptance coverage. BLOCKER0,HIGH0,MEDIUM0. IMPLEMENT/QA/CONVERGE PASS; safe to commit YES, but no commit/push performed or authorized by this run.

Final Git: frontend main at1808ede5e2b5c2e38baa13c12a3495a63169523d, only tracked change SiteFooter.astro (ten inserted lines vsHEAD);019directory untracked.017/prerequisite55Markdown documents remain untracked and byte-identical to the fingerprints above. Backend main unchanged atc2f405312bb7dcd8dc6bd1abce42d317e0e3e879, clean. `git diff --check`, harness syntax check and exact product diff assertion PASS. No unexpected files. No SQLite/real DB/migration/backfill/upload/storage/dependency/commit/push/deployment.
