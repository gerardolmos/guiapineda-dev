# Quickstart: local validation of multisection reporting

This is the required post-IMPLEMENT evidence plan. It validates the [data model](./data-model.md),
[browser/Function contract](./contracts/public-function-contract.md), [internal contract](./contracts/internal-backend-contract.md)
and [UI contract](./contracts/ui-contract.md). It does not authorize deployment, real email,
production data, database migration or infrastructure changes.

## 1. Preconditions and change boundary

- Confirm both repositories started from the recorded `main` state and inspect unrelated user work.
- Confirm only files allowlisted in `plan.md`, generated Strapi types and feature 006 artifacts
  changed.
- Confirm protected feature 003 files, content schemas, dependencies, environment/infrastructure
  files and SQLite data are untouched.
- Confirm no `tasks.md` assumption is treated as implementation evidence.

## 2. Pre-schema SQLite safety gate

Do not run Strapi, type generation, a backend build or any command that bootstraps the application
after the new schema exists until this gate is complete. Run the following from
`guiapineda-strapi`; none of the inspection/backup commands starts Strapi.

### 2.1 Inspect the stopped service and resolve storage

```bash
pwd
rg -n "client|filename|DATABASE_|HOST|PORT" config .env.example package.json
pgrep -afil 'strapi|node.*guiapineda-strapi'
lsof -nP -iTCP:1337 -sTCP:LISTEN
for sqlite_candidate in .tmp/data.db .tmp/data.db-wal .tmp/data.db-shm .tmp/data.db-journal; do
  if test -e "$sqlite_candidate"; then ls -la "$sqlite_candidate"; fi
done
```

The expected process and listener results are empty. If configuration resolves another port or
SQLite path, repeat `lsof` and every database command below with those effective values; do not
assume `1337` or `.tmp/data.db`. Record the relevant configuration lines, absolute database path,
process/port outputs, and the main-file/sidecar inventory. Stop here if a process or listener is
present, the path is ambiguous, or the database is absent.

### 2.2 Create a non-overwriting physical and logical backup

With the resolved local path confirmed as `.tmp/data.db`, run:

```bash
db_source="$(pwd)/.tmp/data.db"
backup_dir="$(mktemp -d /private/tmp/guiapineda-006-pre-schema.XXXXXX)"
mkdir "$backup_dir/source-files"
cp -p "$db_source" "$backup_dir/source-files/data.db"
for sidecar_suffix in -wal -shm -journal; do
  sidecar_source="${db_source}${sidecar_suffix}"
  if test -f "$sidecar_source"; then cp -p "$sidecar_source" "$backup_dir/source-files/data.db${sidecar_suffix}"; fi
done
sqlite3 "$db_source" ".backup '$backup_dir/restore.db'"
shasum -a 256 "$db_source"
for sidecar_suffix in -wal -shm -journal; do
  sidecar_source="${db_source}${sidecar_suffix}"
  if test -f "$sidecar_source"; then shasum -a 256 "$sidecar_source"; fi
done
find "$backup_dir" -maxdepth 2 -type f -print -exec shasum -a 256 {} \;
```

`mktemp -d` is mandatory: it prevents overwriting an earlier backup. The physical snapshot retains
every sidecar that existed; `restore.db` is the canonical restoration source. Record `backup_dir`
verbatim and retain the directory until post-sync validation is approved. Do not add it to either
repository and do not delete it as part of routine cleanup.

### 2.3 Prove integrity and restoration readiness

```bash
sqlite3 "$db_source" "PRAGMA query_only=ON; PRAGMA integrity_check; PRAGMA foreign_key_check;"
sqlite3 "$backup_dir/restore.db" "PRAGMA query_only=ON; PRAGMA integrity_check; PRAGMA foreign_key_check;"
sqlite3 "$db_source" "SELECT type, name, tbl_name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name;"
sqlite3 "$backup_dir/restore.db" "SELECT type, name, tbl_name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name;"
```

Both integrity checks must print `ok`; both foreign-key checks must print no rows; both object
inventories must agree. Evidence is sufficient for restoration only when it contains: the stopped
process/port proof, resolved source path, sidecar list, unique backup path, SHA-256 manifest, both
PRAGMA outputs, matching object inventories, and this exact recovery command (documented, **not
executed** during the gate):

```bash
sqlite3 /absolute/path/to/replacement.db ".restore '$backup_dir/restore.db'"
```

### 2.4 Human release and controlled first sync

Present the complete evidence and ask a human explicitly to approve the first schema sync. Do not
infer approval and do not continue on silence. Only after an explicit approval may the first
Strapi-starting command run. After that controlled run, stop Strapi and repeat the process/port,
integrity, foreign-key and object-inventory checks. The new report storage may be additive; missing
or changed pre-existing objects/data fails the gate. Keep the backup until a separate human
decision confirms the post-sync evidence.

## 3. Persistent automated QA

From `guiapineda-astro` run:

```bash
node scripts/qa/multisection-reporting-qa.mjs
node scripts/qa/commerce-submission-qa.mjs
```

The new versioned harness must import real feature code. Its report must identify controlled doubles
and prove:

1. exact field/reason/language contracts and 1,000/1,001 explanation boundary;
2. rejection of missing, duplicate, unexpected, malformed, excessive fields and every file;
3. wrong/expired/reused/different-email/wrong-scope verification rejection;
4. internal payload exclusion of email, token, IP, user-agent, state and slug;
5. valid type-specific lookup and create for all four types;
6. rejection of unknown, missing, unpublished and cross-type references;
7. commerce rejection for inactive commerce/category/subcategory;
8. server-derived slug, pending default and independent duplicate reports;
9. zero public-content update/delete/publish/unpublish calls;
10. dispatcher/allowlist isolation plus selected feature 003 regression probes.

## 4. Builds and generated types

From `guiapineda-strapi`, and only after section 2 has explicit human approval:

```bash
npm run strapi -- ts:generate-types
npm run build
```

From `guiapineda-astro`:

```bash
npm run build
```

Expected: both builds pass. Generated-type diff contains only the additive private collection and
fields. No migration is run and no existing report type changes.

## 5. Built static-output matrix

Inspect one built detail per surface and language (12 combinations):

| Surface | CA | ES | EN |
|---|---|---|---|
| Agenda | `/agenda/{slug}/` | `/es/agenda/{slug}/` | `/en/agenda/{slug}/` |
| Veus | `/veus/{slug}/` | `/es/veus/{slug}/` | `/en/veus/{slug}/` |
| Millorem | `/millorem-pineda/{slug}/` | `/es/millorem-pineda/{slug}/` | `/en/millorem-pineda/{slug}/` |
| Commerce | existing category/subcategory detail route | ES equivalent | EN equivalent |

For each, verify action placement, fixed content type, nonblank `documentId`, complete language
copy, five reasons and no initial network dependency. Confirm zero report action in lists, submission
forms and Foto del Mes.

## 6. Browser behavior matrix

The sole authorized local-browser technique is a strict in-page `window.fetch` shim installed from
DevTools **after the local detail route has fully loaded**. It uses fixed verification values,
simulates only the three exact feature endpoints, passes through only the explicitly named local
Astro audit resources below and throws on every other unexpected request. It does not start Strapi,
call Netlify, deliver email, access SQLite, or require a new package.

Run one journey per reload. Before pasting, edit only `expected.type`, `expected.language` and
`expected.mode` (`success`, `limited` or `unavailable`) to match the route and intended response.
The rendered form contract must expose `form[data-content-report-form]`,
`[data-content-report-success]` and `[data-content-report-error]`; the fixture reads the real hidden
document ID rather than inventing it.

```js
// BEGIN CONTENT_REPORT_BROWSER_FIXTURE
(() => {
  "use strict";
  const expected = Object.freeze({
    type: "agenda",       // agenda | veu | millora | comercio
    language: "ca",       // ca | es | en
    mode: "success",      // success | limited | unavailable
  });
  const assert = (condition, message) => {
    if (!condition) throw new Error(`CONTENT REPORT QA FAIL: ${message}`);
  };
  assert(["localhost", "127.0.0.1"].includes(location.hostname), "local host required");
  assert(!window.__contentReportQa, "fixture already installed");
  assert(["agenda", "veu", "millora", "comercio"].includes(expected.type), "invalid expected type");
  assert(["ca", "es", "en"].includes(expected.language), "invalid expected language");
  assert(["success", "limited", "unavailable"].includes(expected.mode), "invalid expected mode");

  const form = document.querySelector("form[data-content-report-form]");
  assert(form instanceof HTMLFormElement, "report form not found");
  const field = (name) => {
    const control = form.elements.namedItem(name);
    assert(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement, `missing ${name}`);
    return control;
  };
  const documentId = field("contenido_document_id").value.trim();
  assert(documentId.length >= 1 && documentId.length <= 128, "rendered document ID boundary");
  assert(field("tipo_contenido").value === expected.type, "rendered content type");
  assert(field("idioma_solicitud").value === expected.language, "rendered language");

  const originalFetch = window.fetch;
  const errors = [];
  const state = { requestCode: 0, verifyCode: 0, submit: 0, responseStatus: null };
  const email = "qa-content-report@example.invalid";
  const code = "123456";
  const challengeId = "content_report_fixture_challenge_000001";
  const token = "content_report_fixture_token_000000000000000001";
  const allowedFields = new Set([
    "tipo_contenido", "contenido_document_id", "motivo", "explicacion",
    "idioma_solicitud", "email_contacto", "email_verification_token", "bot-field",
  ]);
  const exactAstroCommerceAuditSuffixes = new Set([
    "/src/assets/icons/arribar.svg",
    "/src/assets/icons/trucar.svg",
    "/src/assets/icons/mail.svg",
    "/src/assets/icons/web.svg",
  ]);
  const exactKeys = (value, keys) =>
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
  const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  const readJson = async (input, init) => {
    if (typeof init.body === "string") return JSON.parse(init.body);
    assert(input instanceof Request, "JSON request has no readable body");
    return input.clone().json();
  };
  const readForm = async (input, init) => {
    if (init.body instanceof FormData) return init.body;
    assert(input instanceof Request, "multipart request has no readable body");
    return input.clone().formData();
  };
  const recordError = (value) => errors.push(value);
  const onError = (event) => recordError(event.error ?? event.message);
  const onRejection = (event) => recordError(event.reason);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const fixtureFetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
    const method = String(init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const exactLocal = url.origin === location.origin && url.search === "" && url.hash === "";
    if (exactLocal && url.pathname === "/api/verification/request-code") {
      assert(method === "POST", "request-code method");
      const body = await readJson(input, init);
      assert(exactKeys(body, ["email", "language", "scope"]), "request-code keys");
      assert(body.email === email, "request-code fixture email");
      assert(body.language === expected.language, "request-code language");
      assert(body.scope === "content-report", "request-code scope");
      assert(++state.requestCode === 1, "request-code called more than once");
      return jsonResponse(200, { ok: true, challengeId, expiresIn: 600 });
    }
    if (exactLocal && url.pathname === "/api/verification/verify-code") {
      assert(method === "POST", "verify-code method");
      const body = await readJson(input, init);
      assert(exactKeys(body, ["challengeId", "code", "email", "scope"]), "verify-code keys");
      assert(body.challengeId === challengeId, "verify-code challenge");
      assert(body.code === code, "verify-code fixture code");
      assert(body.email === email, "verify-code fixture email");
      assert(body.scope === "content-report", "verify-code scope");
      assert(++state.verifyCode === 1, "verify-code called more than once");
      return jsonResponse(200, { ok: true, token, expiresIn: 900 });
    }
    if (exactLocal && url.pathname === "/api/submissions/content-report") {
      assert(method === "POST", "submission method");
      const body = await readForm(input, init);
      const seen = new Set();
      for (const [name, value] of body.entries()) {
        assert(!(value instanceof File), `file rejected: ${name}`);
        assert(allowedFields.has(name), `unexpected field ${name}`);
        assert(!seen.has(name), `duplicate field ${name}`);
        seen.add(name);
      }
      assert(body.get("tipo_contenido") === expected.type, "submitted content type");
      assert(body.get("contenido_document_id") === documentId, "submitted document ID");
      assert(body.get("idioma_solicitud") === expected.language, "submitted language");
      assert(body.get("email_contacto") === email, "submitted verified email");
      assert(body.get("email_verification_token") === token, "submitted verification token");
      assert(String(body.get("motivo") ?? "").length > 0, "reason absent");
      assert(String(body.get("explicacion") ?? "").trim().length <= 1000, "explanation boundary");
      assert(String(body.get("bot-field") ?? "") === "", "honeypot nonempty");
      assert(++state.submit === 1, "submission retried automatically");
      if (expected.mode === "limited") {
        state.responseStatus = 429;
        return jsonResponse(429, { ok: false, reason: "rate_limited" });
      }
      if (expected.mode === "unavailable") {
        state.responseStatus = 503;
        return jsonResponse(503, { ok: false, reason: "submission:unavailable" });
      }
      state.responseStatus = 201;
      return jsonResponse(201, { ok: true });
    }
    const exactExistingAstroAuditSvg = method === "GET" && exactLocal &&
      url.pathname === "/src/assets/images/guiapinedaInv.svg";
    const exactAstroCommerceAuditSvg = method === "GET" &&
      url.origin === location.origin &&
      url.hash === "" &&
      url.search === "?origWidth=20&origHeight=25&origFormat=svg" &&
      url.pathname.startsWith("/@fs/") &&
      [...exactAstroCommerceAuditSuffixes].some((suffix) => url.pathname.endsWith(suffix));
    if (exactExistingAstroAuditSvg || exactAstroCommerceAuditSvg) {
      return originalFetch.call(window, input, init);
    }
    const error = new Error(`CONTENT REPORT QA FAIL: unexpected fetch ${method} ${url.href}`);
    recordError(error);
    throw error;
  };

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    window.fetch = originalFetch;
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("pagehide", cleanup);
    delete window.__contentReportQa;
  };
  window.fetch = fixtureFetch;
  window.addEventListener("pagehide", cleanup, { once: true });
  window.__contentReportQa = {
    email,
    code,
    finish() {
      try {
        assert(state.requestCode === 1, "request-code count");
        assert(state.verifyCode === 1, "verify-code count");
        assert(state.submit === 1, "submission count");
        const expectedStatus = { success: 201, limited: 429, unavailable: 503 }[expected.mode];
        assert(state.responseStatus === expectedStatus, "response status");
        const success = document.querySelector("[data-content-report-success]");
        const failure = document.querySelector("[data-content-report-error]");
        if (expected.mode === "success") {
          assert(success instanceof HTMLElement && !success.hidden, "success receipt not visible");
        } else {
          assert(!(success instanceof HTMLElement) || success.hidden, "failure displayed success");
          assert(failure instanceof HTMLElement && !failure.hidden, "localized failure not visible");
        }
        assert(errors.length === 0, `captured browser errors: ${errors.length}`);
        return { path: location.pathname, ...expected, documentId, ...state, pass: true };
      } finally {
        cleanup();
      }
    },
    cleanup,
  };
  console.info("CONTENT REPORT FIXTURE READY", { ...expected, email, code, documentId });
})();
// END CONTENT_REPORT_BROWSER_FIXTURE
```

Use `window.__contentReportQa.email` and `.code` in the visible verification UI. Complete the form,
submit once, inspect the UI, then run `window.__contentReportQa.finish()`; retain its returned object
as evidence. A thrown assertion is a failure, never a pass. If abandoning a run, execute
`window.__contentReportQa.cleanup()` before continuing.

The four commerce suffixes are exact repository-relative identities so the fixture remains
reproducible when the absolute checkout path changes. They are accepted only for same-origin
`GET /@fs/...` reads with the exact observed image-service query and no hash, and they never alter
the three feature counters. This is not a wildcard asset rule: any different suffix, method,
origin, query, hash, CMS path, Function path or external URL still reaches `unexpected fetch`.

Across Agenda, Veus, Millorem and commerce, cover CA/ES/EN routes and record at least one controlled
`201`, `429` and `503` per content type. The matrix must additionally verify manually:

- open/close/focus/keyboard behavior and all labels/messages in the active language;
- reason required; first four allow blank context; `otro` rejects blank/whitespace context;
- 1,000 characters accepted and 1,001 blocked without losing the value;
- malformed or 181-character email cannot verify; changing email invalidates verification;
- valid verification plus valid fields enables exactly one submission;
- `503` preserves reason/context, clears authorization and requires a fresh code;
- `429` shows only the localized limited state, never the receipt;
- only controlled `201 {"ok":true}` shows the private human-review receipt;
- public content, routes and navigation remain unchanged and no real external request occurs.

For the T074 regression, retain evidence that all four named toolbar reads pass through without
changing `requestCode`, `verifyCode` or `submit`. Before accepting the matrix, run controlled
negative probes for a different `/@fs/` SVG, a changed query and a non-`GET` method, and confirm
each is recorded as `unexpected fetch`; separately confirm that an unrecognized same-origin API
path and an external origin are rejected before any real request is made. Clean up after each
negative probe and use a fresh reload for the journey receipt.

## 7. Backend structural inspection

- `denuncia-contenido` has schema only and no public Content API files.
- Schema has exact enums/defaults and no email, token, IP, user-agent, identity, relation or media.
- Type map contains exactly four UIDs; request data cannot select an arbitrary UID.
- The controller retains existing `communicat_report` and generic branches unchanged apart from the
  new explicit branch.
- No lifecycle, report count or state change acts on public content.
- Content Manager access is governed by existing authenticated RBAC, not a public route.

## 8. Feature 003 compatibility

Exercise a CA/ES/EN Communicat detail and selected real validators/service probes:

- existing component, endpoint, scope `communicat-report` and schema still operate;
- a valid report retains ID/slug/reason/language/pending semantics;
- invalid slug/reference and wrong-scope token still reject;
- old and new `denuncia-comunicat` rows require no rewrite;
- no new generic UI or endpoint replaces the existing path.

## 9. Diff and repository review

In both repositories run these non-destructive inventories. The first command expands untracked
directories to individual paths; a clean `git diff` is therefore **not** sufficient evidence.

```bash
git status --porcelain=v1 --untracked-files=all
git diff --name-only
git diff --cached --name-only
git ls-files --others --exclude-standard
git diff --check
git diff --cached --check
git status --short --branch
git diff --stat
git diff
```

Build one combined path inventory from the unstaged, staged and untracked outputs and reconcile
**every path** against the allowlist in `plan.md`. For each untracked file, inspect its full content
without staging it and run the whitespace-equivalent check below (exit `1` merely denotes an added
file for a no-index diff; any printed `file:line: trailing whitespace` or space-before-tab diagnostic
is a failure):

```bash
git diff --no-index -- /dev/null path/to/untracked-file
git diff --no-index --check -- /dev/null path/to/untracked-file
```

Repeat those two commands for every path returned by `git ls-files --others --exclude-standard`;
do not substitute a directory-level summary. Then run applicable parsers/checkers for untracked
source (`node --check` for JavaScript modules, JSON parsing for JSON, and the documented feature QA
for imported TypeScript/Astro). Record the path, allowlist match, full-content review, whitespace
result and syntax/QA result in the audit evidence. Verify that no secret, real personal test data,
SQLite file, generated browser artifact, screenshot or log is present.

The final audit must also assert directly that:

- the UI never sends `contenido_slug` and the backend derives the slug after authoritative lookup;
- email is bounded to 180 and `contenido_document_id` to 128 at schema/UI/Function/backend boundaries;
- `otro` requires a trimmed nonblank explanation and every explanation is bounded to 1,000;
- all four content types reject missing, unpublished and cross-type references, while commerce also
  rejects inactive commerce/category/subcategory;
- every browser-matrix row used only the strict fixture from section 6 and the fixture was restored;
- SQLite gate evidence and explicit approval precede any recorded first Strapi startup/sync;
- feature 003 compatibility probes pass and its protected implementation remains unchanged.

## 10. Deferred predeployment gate

The following remain **DEFERRED — predeployment** until an integrated environment exists:

- real verification email delivery and code entry;
- deployed one-time consumption through Upstash and Netlify rate-limit enforcement;
- authenticated deployed Function -> Strapi delivery;
- private entry visibility and human state editing in deployed Content Manager;
- confirmation against deployed public content that reporting causes no automatic effect.

Local doubles and successful builds must not be represented as live-service evidence.
