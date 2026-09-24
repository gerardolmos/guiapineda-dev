# Quickstart: local validation of secure commerce submission

This guide defines IMPLEMENT evidence. It does not authorize deployment, real email, production
secrets or production data. The QA harness is versioned; only generated fixtures may be temporary.

## 1. Preconditions and scope gate

From each repository, capture:

```bash
git status --short
git diff --name-only
```

Expected: only SDD plus application/generated paths authorized in `plan.md`; no lockfile,
dependency, infrastructure, Railway, PostgreSQL or Cloudinary changes.

The persistent harness creates deterministic JPEG/PNG/WebP fixtures in a fresh operating-system
temporary directory using the already-installed backend Sharp, then removes them in `finally`.
Fixtures are never committed.

## 2. Strict local probe

Run the versioned Node harness from the frontend repository:

```bash
node scripts/qa/commerce-submission-qa.mjs
```

Gate rules:

- use an `assert(condition, message)` that throws `Error(message)`;
- top-level failure sets nonzero exit status;
- print no case-level `PASS` before that case finishes;
- print final `PASS: complete commerce submission QA (T038/T040/T045-T051, M1/M2, B1/H1,
  images, moderation, scopes)` only after every assertion completes;
- any unexpected call to email, network, Media or public commerce doubles throws.

The probe must cover objectively:

1. CA/ES/EN payloads and localized route values;
2. exact text/file allowlists and rejection of duplicates/unknown fields;
3. all scalar boundaries and at least one public contact;
4. seven-day schedule validity, at least one open day and non-overlap;
5. services 1/6 accepted, 0/7 rejected, and hidden component fields rejected;
6. exact six social platforms, unique platform and valid HTTP(S) URL;
7. principal required, logo 0/1, gallery 0/4 and excess rejected;
8. JPEG/PNG/WebP accepted; extension/content mismatch, corruption, >4.000.000 bytes individual and >40M
   pixels rejected;
9. aggregate exactly 4.000.000 bytes accepted at browser/Function/backend checks and 4.000.001
   bytes rejected at all
   applicable checks before creation;
10. verification request/check/consume binds scope; wrong-scope and reused token create zero
    requests;
11. all six previous scopes still request, verify and consume only under their fixed purpose;
12. token consumption precedes one internal request; invalid token prevents it;
13. internal payload excludes all technical/sensitive/editor-only fields;
14. category with no subcategories accepts absence; category with active subcategories requires one;
15. inactive/unpublished/mismatched relations reject before file storage;
16. normalization produces private WebP <=3000×3000, <=4.000.000 bytes and without original metadata;
17. second-image and database failures remove every newly stored ID and create zero documents;
18. accepted submission creates exactly one `pendent` record with exact allowed values/refs;
19. duplicate/similar valid submissions create independent records without commerce lookup;
20. `pendent`/`en_revisio` may retain `email_contacto`; each terminal transition atomically updates
    state and editorial audit metadata and sets `email_contacto = null`, without erasing other
    private data or calling Media/public commerce;
21. cleanup protects principal/logo/all gallery IDs in all states;
22. 400/413/415/503 never produce success; 201 `{ok:true}` occurs only after backend acceptance.

## 3. Local services and builds

From `guiapineda-strapi`:

```bash
npm run strapi -- ts:generate-types
npm run build
npm run develop
```

Keep local Strapi running only if the Astro build uses it. In another shell, from
`guiapineda-astro`:

```bash
npm run build
npm run dev
```

Expected: both builds pass; type generation changes only `types/generated/contentTypes.d.ts`; all
three canonical routes build. Stopping local processes must not modify tracked data or schema.

## 4. Browser matrix CA/ES/EN

The single authorized technique is an in-page `window.fetch` shim installed from DevTools **after
each local route has loaded**. Do not use another interceptor, a local Function double, real email,
or deployed Netlify. It intercepts exactly:

- `POST /api/verification/request-code` → `200` with a fixed challenge;
- `POST /api/verification/verify-code` → `200` with a fixed token, only for code `123456`;
- `POST /api/submissions/comercio` → controlled `503` or `201 {"ok":true}`.

The Astro development-toolbar performance audit also calls `fetch(src)` to measure local `<img>`
resources while the form changes. The closed fixture permits only these two non-functional reads:

- `GET` to the exact current origin, exact path `/src/assets/images/guiapinedaInv.svg`, with no query
  or fragment. This is the dark GUIAPINEDA mark rendered by `SiteBrand.astro` and inspected by the
  Astro audit.
- `GET` to a `blob:` URL whose embedded origin is exactly the current local page origin, with no
  query or fragment. These URLs are produced by `URL.createObjectURL(file)` for the selected main,
  logo and gallery previews and are local browser objects, not network destinations.

Both reads delegate to the captured original `fetch` only after exact method, scheme, origin, path,
query and fragment checks. No other same-origin resource, API path, `blob:` origin or external URL is
allowed. The three functional endpoints above remain fully simulated and never pass through.

For each route, perform one failure journey and, after reload, one success journey. Paste this exact
installer into DevTools. A syntax error, an unexpected API request or any failed gate throws and
cannot print PASS:

```js
// BEGIN COMMERCE_BROWSER_FIXTURE
(() => {
  "use strict";
  const evidenceKey = "guiapineda:commerce-browser-qa";
  sessionStorage.removeItem(evidenceKey);
  const errors = [];
  const recordError = (value) => {
    errors.push(value);
    const raw = sessionStorage.getItem(evidenceKey);
    if (raw) {
      try {
        const evidence = JSON.parse(raw);
        evidence.errorCount = errors.length;
        sessionStorage.setItem(evidenceKey, JSON.stringify(evidence));
      } catch {
        sessionStorage.removeItem(evidenceKey);
      }
    }
  };
  const assert = (condition, message) => {
    if (condition) return;
    const error = new Error(`QA FAIL: ${message}`);
    recordError(error);
    throw error;
  };
  const routes = {
    "/alta-comerc/": { language: "ca", success: "/enviat/" },
    "/es/alta-comercio/": { language: "es", success: "/es/enviado/" },
    "/en/businesses/add-a-business/": { language: "en", success: "/en/sent/" },
  };
  assert(["localhost", "127.0.0.1"].includes(location.hostname), "local host required");
  assert(!window.__commerceQa, "fixture already installed");
  const expected = routes[location.pathname];
  assert(expected, `unexpected route ${location.pathname}`);
  const form = document.querySelector("form[data-commerce-submission-flow]");
  assert(form instanceof HTMLFormElement, "commerce form not found");
  const originalFetch = window.fetch;
  const onError = (event) => recordError(event.error ?? event.message);
  const onRejection = (event) => recordError(event.reason);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  const state = { mode: null, requestCode: 0, verifyCode: 0, submit: 0, responseStatus: null, submittedName: "", ui: false };
  const challengeId = "commerce_fixture_challenge_000001";
  const token = "commerce_fixture_token_000000000000000001";
  const email = "qa-commerce@example.invalid";
  const allowedText = new Set([
    "idioma_solicitud", "nombre", "categoria_document_id", "subcategoria_document_id",
    "descripcion_corta", "descripcion_completa", "direccion", "telefono", "whatsapp",
    "email", "web", "atencion_presencial", "atencion_domicilio", "atencion_online",
    "recogida_local", "reparto", "horario_semanal", "servicios", "redes_sociales",
    "informacion_adicional", "nombre_contacto", "email_contacto", "telefono_contacto",
    "aceptacion_privacidad", "email_verification_token", "bot-field",
  ]);
  const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  const requestJson = async (input, init) => {
    if (typeof init.body === "string") return JSON.parse(init.body);
    assert(input instanceof Request, "JSON request has no readable body");
    return input.clone().json();
  };
  const requestBody = async (input, init) => {
    if (init.body instanceof FormData) return init.body;
    assert(input instanceof Request, "multipart request has no readable body");
    return input.clone().formData();
  };
  const fixtureFetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
    const method = String(init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const exactLocalEndpoint = url.origin === location.origin && url.search === "" && url.hash === "";
    if (exactLocalEndpoint && url.pathname === "/api/verification/request-code") {
      assert(method === "POST", "request-code method");
      const body = await requestJson(input, init);
      assert(JSON.stringify(Object.keys(body).sort()) === JSON.stringify(["email", "language", "scope"]), "request-code keys");
      assert(body.email === email, "request-code fixture email");
      assert(body.language === expected.language, "request-code language");
      assert(body.scope === "comercio", "request-code scope");
      assert(++state.requestCode === 1, "request-code called more than once");
      return jsonResponse(200, { ok: true, challengeId, expiresIn: 600 });
    }
    if (exactLocalEndpoint && url.pathname === "/api/verification/verify-code") {
      assert(method === "POST", "verify-code method");
      const body = await requestJson(input, init);
      assert(JSON.stringify(Object.keys(body).sort()) === JSON.stringify(["challengeId", "code", "email", "scope"]), "verify-code keys");
      assert(body.challengeId === challengeId, "verify-code challenge");
      assert(body.email === email, "verify-code fixture email");
      assert(body.code === "123456", "verify-code fixture code");
      assert(body.scope === "comercio", "verify-code scope");
      assert(++state.verifyCode === 1, "verify-code called more than once");
      return jsonResponse(200, { ok: true, token, expiresIn: 900 });
    }
    if (exactLocalEndpoint && url.pathname === "/api/submissions/comercio") {
      assert(method === "POST", "commerce submission method");
      assert(state.mode === "failure" || state.mode === "success", "set submission mode first");
      const body = await requestBody(input, init);
      const seenText = new Set();
      const files = { imagen_principal: [], logo: [], galeria: [] };
      for (const [name, value] of body.entries()) {
        if (value instanceof File) {
          assert(Object.hasOwn(files, name), `unknown file field ${name}`);
          files[name].push(value);
        } else {
          assert(allowedText.has(name), `unknown text field ${name}`);
          assert(!seenText.has(name), `duplicate text field ${name}`);
          seenText.add(name);
        }
      }
      assert(files.imagen_principal.length === 1, "one principal required");
      assert(files.logo.length <= 1, "at most one logo");
      assert(files.galeria.length <= 4, "at most four gallery images");
      const allFiles = [...files.imagen_principal, ...files.logo, ...files.galeria];
      assert(allFiles.every((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "file MIME allowlist");
      assert(allFiles.every((file) => file.size > 0 && file.size <= 4000000), "individual 4.000.000-byte limit");
      assert(allFiles.reduce((sum, file) => sum + file.size, 0) <= 4000000, "aggregate 4.000.000-byte limit");
      assert(body.get("idioma_solicitud") === expected.language, "multipart language");
      assert(body.get("email_contacto") === email, "multipart verified email");
      assert(body.get("email_verification_token") === token, "multipart fixture token");
      assert(!body.has("challenge") && !body.has("code") && !body.has("temporizador") && !body.has("estado_verificacion") && !body.has("ip"), "forbidden verification/technical fields");
      state.submittedName = String(body.get("nombre") ?? "");
      assert(state.submittedName.length > 0, "business name absent");
      assert(++state.submit === 1, "submission retried automatically");
      if (state.mode === "failure") {
        state.responseStatus = 503;
        return jsonResponse(503, { ok: false, reason: "submission:unavailable" });
      }
      state.responseStatus = 201;
      sessionStorage.setItem(evidenceKey, JSON.stringify({ path: location.pathname, success: expected.success, errorCount: errors.length, ...state }));
      return jsonResponse(201, { ok: true });
    }
    const exactAstroAuditSvg = method === "GET" &&
      url.origin === location.origin &&
      url.pathname === "/src/assets/images/guiapinedaInv.svg" &&
      url.search === "" &&
      url.hash === "";
    if (exactAstroAuditSvg) return originalFetch(input, init);
    const exactLocalPreviewBlob = method === "GET" &&
      url.protocol === "blob:" &&
      url.origin === location.origin &&
      url.search === "" &&
      url.hash === "";
    if (exactLocalPreviewBlob) return originalFetch(input, init);
    const unexpected = new Error(`QA FAIL: unexpected fetch ${method} ${url.href}`);
    recordError(unexpected);
    throw unexpected;
  };
  let cleaned = false;
  const onPageHide = () => {
    try {
      // Keep the success evidence only for the destination-page gate.
    } finally {
      cleanup({ preserveEvidence: true });
    }
  };
  const cleanup = ({ preserveEvidence = false } = {}) => {
    if (cleaned) return;
    cleaned = true;
    window.fetch = originalFetch;
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("pagehide", onPageHide);
    delete window.__commerceQa;
    if (!preserveEvidence) sessionStorage.removeItem(evidenceKey);
  };
  window.fetch = fixtureFetch;
  window.addEventListener("pagehide", onPageHide, { once: true });
  window.__commerceQa = {
    email,
    code: "123456",
    setMode(mode) {
      assert(mode === "failure" || mode === "success", "mode must be failure or success");
      assert(state.submit === 0, "cannot change mode after submission");
      state.mode = mode;
    },
    confirmUiGates(gates) {
      const names = ["localized", "catalogue", "conditionalSubcategory", "derivedUi", "validation", "imageGuards", "noRuntimeStrapi"];
      assert(gates && names.every((name) => gates[name] === true), "all named UI gates must be true");
      assert(Object.keys(gates).length === names.length, "unexpected or missing UI gate");
      state.ui = true;
    },
    finishFailure() {
      let passed = false;
      try {
        assert(state.mode === "failure", "failure mode not selected");
        assert(state.ui, "UI gates not confirmed");
        assert(state.requestCode === 1 && state.verifyCode === 1 && state.submit === 1, "failure call counts");
        assert(errors.length === 0, "uncaught browser error/rejection");
        assert(state.responseStatus === 503, "controlled 503 response was not produced");
        assert(form.dataset.emailVerified === "false", "verification not reset after 503");
        assert(form.querySelector("[data-verification-token]")?.value === "", "token not cleared after 503");
        assert(form.querySelector('[name="nombre"]')?.value === state.submittedName, "editable content not preserved");
        const error = form.querySelector("[data-commerce-submission-error]");
        assert(error && !error.hidden && error.textContent.trim(), "localized failure not visible");
        passed = true;
      } finally {
        cleanup();
      }
      if (passed) console.log(`PASS: ${expected.language} controlled 503, preservation and reset`);
    },
  };
  console.log(`FIXTURE READY: ${expected.language}; use ${email} / 123456`);
})();
// END COMMERCE_BROWSER_FIXTURE
```

For the failure journey: call `window.__commerceQa.setMode("failure")`; complete the valid form with
`qa-commerce@example.invalid`; request the synthetic code; enter `123456`; submit once; verify the
localized error and preserved fields; then record the seven manual UI gates with exactly:

```js
window.__commerceQa.confirmUiGates({
  localized: true,
  catalogue: true,
  conditionalSubcategory: true,
  derivedUi: true,
  validation: true,
  imageGuards: true,
  noRuntimeStrapi: true,
});
window.__commerceQa.finishFailure();
```

`finishFailure()` restores `window.fetch`, all three listeners and the fixture `sessionStorage` key
in `finally` before printing PASS. Reload the
route, reinstall the same fixture, call `window.__commerceQa.setMode("success")`, repeat the valid
verification/form journey, and confirm the same seven UI gates before submitting. The app must make
one submission request and navigate to the language-specific success route. On that destination,
paste this completion gate:

```js
(() => {
  "use strict";
  const assert = (condition, message) => {
    if (!condition) throw new Error(`FAIL: ${message}`);
  };
  const key = "guiapineda:commerce-browser-qa";
  let evidence;
  let passed = false;
  try {
    evidence = JSON.parse(sessionStorage.getItem(key) ?? "null");
    assert(evidence, "success evidence absent");
    assert(location.pathname === evidence.success, "wrong success route");
    assert(evidence.mode === "success" && evidence.ui === true, "success/UI gates incomplete");
    assert(evidence.requestCode === 1 && evidence.verifyCode === 1 && evidence.submit === 1, "success call counts");
    assert(evidence.responseStatus === 201, "controlled 201 response was not produced");
    assert(evidence.errorCount === 0, "uncaught browser error/rejection before navigation");
    assert(!window.__commerceQa, "fixture leaked across navigation");
    passed = true;
  } finally {
    sessionStorage.removeItem(key);
  }
  assert(sessionStorage.getItem(key) === null, "fixture evidence not removed");
  if (passed) console.log(`PASS: ${evidence.path} controlled 201 and navigation to ${evidence.success}`);
})();
```

The six required PASS markers are therefore failure+success for CA, ES and EN. The fixed `.invalid`
address cannot receive mail. Apart from the exact local Astro-audit SVG and same-origin local
preview `blob:` reads identified above, every `fetch` other than the three exact functional
endpoints throws `QA FAIL` without passthrough to any real network. No case can print PASS after a
failed assertion.
The old document restores `window.fetch` and its listeners from `pagehide` through `finally`; the
completion gate removes its evidence key in `finally`. Close/reload the page after the final case and
verify `sessionStorage.getItem("guiapineda:commerce-browser-qa") === null`; this completes fixture
restoration without changing source or local services.

## 5. Strapi moderation matrix

Against disposable local requests or controlled Documents Service doubles, verify:

- new record is private, `pendent`, EN-capable, and contains private contact plus quarantine refs;
- panel shows principal, optional logo and 0–4 gallery images only through authenticated no-store
  responses;
- invalid role/index, unauthenticated request and missing file return no image/ID;
- `start-review`, `approve`, `reject` enforce their transitions;
- approval text states no publication; both terminal states retain private request/images/name/phone
  but have `email_contacto = null` in the same transition update;
- each transition produces zero Media upload and zero `api::comercio.comercio` call;
- legacy Media fields remain empty/hidden and no public URL resolves a quarantined image;
- `observaciones_internas` remains editor-controlled.

## 6. Regression gates

Run the existing local probes or equivalent strict cases for:

- Agenda, Veu, Comunicat, communicat-report, Foto del mes and Millorem Pineda verification scopes;
- single-image multipart behavior in the shared HTTP and Strapi transports;
- Agenda/Veu/Comunicat/Foto moderation image preview and lifecycle;
- Millorem Pineda publication behavior already closed;
- home/category/subcategory/detail routes and catalogue content in CA/ES/EN.

Expected: no contract, state, image handling or public directory behavior changes outside the new
commerce branch and purpose binding.

## 7. Repository quality gates

From both repositories:

```bash
git diff --check
git status --short
git diff --stat
git diff
```

Expected: no whitespace errors; full diff matches the allowlist; no `/private/tmp` artifact is
tracked. Confirm no dependency/lock/config/infrastructure diff.

## 8. Deferred predeployment gate

Keep all of the following **DEFERRED — predeployment** until an integrated environment exists:

- real delivery and entry of verification email code;
- real Upstash expiry, atomic one-time enforcement and cross-purpose rejection;
- Netlify buffered-size and `ip/domain` rate-limit enforcement;
- authenticated deployed Function→Strapi multipart;
- deployed private filesystem persistence/cleanup and Content Manager previews;
- a real accepted CA/ES/EN request with confirmation that public commerce data remains unchanged.

Local doubles and local Strapi prove code contracts only and MUST NOT be reported as deployed E2E.

## Final convergence remediation evidence (T047–T051)

The historical temporary probe was replaced by the persistent, reviewable harness
`scripts/qa/commerce-submission-qa.mjs`. The exact command is:

```bash
node scripts/qa/commerce-submission-qa.mjs
```

The expected single final result after every assertion is:

```text
PASS: complete commerce submission QA (T038/T040/T045-T051, M1/M2, B1/H1, images, moderation, scopes)
```

The harness imports the real browser validators/form-data builder, Function parser/handler,
verification services, internal transport, backend parser/receiver, Document Service guard,
moderation lifecycle, cleanup and private-image implementation. It exercises CA/ES/EN payload
construction; required/optional fields; exact network and URL rules; schedules and field issues;
T045/T046; the T047 validation-before-review event structure; T050 schedule-error recalculation and
ARIA association; multipart parsing;
validation before token consumption; `comercio`, cross-scope and one-use verification; recoverable
and ambiguous failures; M1/M2; strict backend parsing; real Sharp normalization, pixel and format
rejection; quarantine tracking and rollback; the B1/H1 Document Service write guard; moderation,
terminal email deletion, private image roles, cleanup references and the absence of automatic Media
promotion or public commerce creation. Doubles are restricted to email delivery, Redis semantics,
HTTP fetch, catalogue/Documents Service and controlled failure injection. Each double observes a
real module boundary and never replaces the validator, guard, Sharp normalizer, lifecycle or
rollback orchestration asserted by its case.

In addition, the local static page was walked in a real browser through the normal business,
description, contact, schedule and offer navigation. This confirmed that the normal non-review
handlers still advance after valid data and that no capture-phase Continue interceptor remains.
The deployed-services E2E remains `DEFERRED — predeployment`.
