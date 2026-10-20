# Feature018 — implementation and QA record

Date: 2026-10-20. User authorized IMPLEMENT → QA → CONVERGE only. Prior SPEC/PLAN/TASKS/ANALYZE PASS; checklist16/16, no extensions.yml/hooks. Constitution1.0.0 unchanged. No skill setup script that persists .specify/feature.json used; explicit feature paths resolve scope without changing global state.

## Baseline / T001–T003
Frontend main HEAD9585533df4bab4979a58c0aab83da21036f3e5df; backend main HEADc2f405312bb7dcd8dc6bd1abce42d317e0e3e879. Initially no tracked changes; pre-existing untracked017/prerequisite and018 documents preserved. .gitignore covers generated Astro/build/dependencies/environment files; no ignore edit necessary. No application/DB bootstrap.

Harness qa.mjs copies only SiteHeader, SiteBrand, LanguageSwitcher, pure languageSwitcher helper, two logo SVGs, static dictionaries and global CSS to an owned temporary project. Installed dependencies symlinked; minimal fixture-only Astro config. No application pages/CMS/Functions/backend imports. Build fetch throws; browser requests outside owned loopback are rejected. Chrome uses disposable profile. No new dependency. Fixtures are synthetic path/content only.

`node specs/018-header-active-section-accuracy/qa.mjs baseline`: isolated Astro build PASS87 pages. Initial sandbox run could not listen on loopback (EPERM), cleaned temp; same command authorized outside sandbox PASS174 route/viewport checks. Baseline uses HEAD header and explicitly expects incorrect guide/page on Agenda/Veus. Mobile open focuses first link; Escape restores toggle focus; link activation closes menu. Zero external page requests; owned process/listener/temp cleanup PASS.

Product change: only four new route predicates in src/components/SiteHeader.astro, exact /agenda and /veus or slash descendants. Existing normalization, other conditions, menu items/renderers/classes/scripts unchanged. This maps affected families to null and existing inactive render; no new UI/JS/API.

Final QA and convergence results follow; earlier entries describe their chronological stage.

## Final QA — PASS / T004–T005

`node specs/018-header-active-section-accuracy/qa.mjs` (authorized loopback execution):
- Baseline and current isolated Astro builds PASS:87 synthetic pages each.
- Real Chrome baseline174 + current174 =348 route/viewport checks PASS.
- Core affected matrix:36/36 (2sections ×3languages ×3page-types ×2viewports); additional trailing-slash coverage36. Each representation has four links and no aria-current for affected paths in current build. Baseline explicitly has guide/page.
- Control matrix:51 cases ×2viewports =102 per build: home/category/business, Tauler, Comunicats, Millorem, Foto/404, similar prefixes, localized about/sent/business intake/Comunicats aliases. Exact rendered snapshots identical baseline/current for controls.
- All fixture navigations include query/hash; header receives explicit synthetic pathname, reflecting inspected real Layout's Astro.url.pathname. This tests header classification and query/hash noninterference in the fixture, not full-page routing.
- Visual regression: computed text color/background/font-weight, class names and bounding boxes compared. Affected Guide styling matches inactive peers; all link geometry/destinations/text preserved; other links unchanged. Controls match entire snapshot. No screenshot-based human visual certification claimed.
- Language-switch destinations/text unchanged. Mobile open focuses first link, Escape closes and restores button focus, link click closes. Link default navigation is prevented in interaction check; destinations are verified as hrefs, not real CMS page arrivals. No form submission or real service tested.
- No horizontal overflow at1280×900 or390×900. Zero external page requests.
- CLEANUP PASS: only owned Chrome/server/temp resources removed. Postcheck no guiapineda-018-* temp directory remains.
- `node --check specs/018-header-active-section-accuracy/qa.mjs` PASS. `git diff --check` PASS. Exact product text equals HEAD plus only four approved predicates; no other tracked diff. Layout still supplies pathname. Backend Git status empty.

Limits: component-level isolated production build/render using real header/dependencies/styles/translations, synthetic paths/content; no full application/CMS build, external navigation destinations, real data or backend integration. No exhaustive product-wide accessibility or visual audit; existing unrelated semantics and footer focus debt remain outside scope. No dependency installation.

## CONVERGE — PASS

Reviewed8FR,4SC,7acceptance scenarios across2stories, four plan phases plus bounded route/visual decisions, six tasks and Constitution I–VII. FR001/002/003/006 and SC001: actual rendered matrix/attributes/styles and boundary controls. FR004/005 and SC002/003: exact baseline/control snapshots and mobile interaction. FR007/008 and SC004: one-component exact diff, separate authorized harness/report, unchanged backend and protected scope. Current user authorization supersedes the earlier SDD-only execution phase; functional contracts unchanged.

missing/partial/contradicts/unrequested:0/0/0/0; CRITICAL/HIGH/MEDIUM/LOW:0/0/0/0. No new convergence tasks or empty phase; tasks were not edited during assessment. T006 completion recorded afterward as implementation bookkeeping. No hooks/extensions.yml. No017/prerequisite/Constitution edits; all previous untracked files retained.

Final: IMPLEMENT PASS / QA PASS / CONVERGE PASS; blockers0; safe to commit YES, but no commit/push authorized or performed. Product: src/components/SiteHeader.astro only. Feature018 updates: tasks.md; new qa.mjs and qa-report.md. Other018 design artifacts preserved. Frontend retains pre-existing untracked SDD directories and one product modification; backend clean. SQLite/real DB/migration/backfill/real upload/dependency/deployment:NO.
