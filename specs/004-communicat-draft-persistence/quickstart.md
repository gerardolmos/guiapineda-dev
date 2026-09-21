# Quickstart Validation: Communicat Draft Persistence

## Purpose

Validar [communicat-draft-contract.md](./contracts/communicat-draft-contract.md) y
[data-model.md](./data-model.md) sin cambiar backend, Functions o infraestructura.

## Prerequisites

- Node.js `>=22.12.0` y dependencias existentes.
- Navegador con controles de storage/devtools.
- GUIAPINEDA no dispone de entorno integrado desplegado; no desplegar para esta feature.
- Diff limitado a los dos archivos autorizados y artefactos SDD.

## Static and build checks

1. Verificar allowlist exacta y clave `guiapineda:submission-draft:v1:comunicat`.
2. Confirmar que imagen/file, honeypot, consentimiento, idioma, código, token y verificación no se
   persisten, y que no se enumeran controles ni se serializa `FormData`.
3. Ejecutar `npm run build`; registrar el resultado sin tratarlo como prueba funcional completa.

## Local environment

```sh
npm run dev
```

Usar una sola pestaña y `/envia-un-comunicat/`, `/es/enviar-comunicado/` y
`/en/comunicats/send-an-announcement/`.

## Local API fixture (verification and submission)

Este fixture reutiliza el patrón de la feature 001: navegador local real y respuestas interceptadas
antes de alcanzar `/api/`. No solicita códigos, no envía email y no contacta Functions, Resend,
Upstash, Strapi ni infraestructura desplegada.

Después de abrir una ruta de Comunicats, pegar el bloque completo en DevTools Console. Hay que
reinstalarlo después de cada recarga o navegación porque deliberadamente vive solo en la página
actual.

```js
(() => {
  if (window.__communicatQa) {
    window.__communicatQa.restore();
  }

  const originalFetch = window.fetch.bind(window);
  const originalSetTimeout = window.setTimeout.bind(window);
  const state = {
    submission: "failure",
    calls: [],
    timerDelays: [],
  };

  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  window.setTimeout = (handler, delay = 0, ...args) => {
    state.timerDelays.push(Number(delay));
    return originalSetTimeout(handler, delay, ...args);
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;
    const url = new URL(rawUrl, window.location.href);
    let body = null;

    if (typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }

    state.calls.push({ path: url.pathname, body });

    if (url.pathname === "/api/verification/request-code") {
      return json({
        ok: true,
        challengeId: "qa-challenge-not-real",
        expiresIn: 600,
      });
    }

    if (url.pathname === "/api/verification/verify-code") {
      const valid =
        body?.challengeId === "qa-challenge-not-real" &&
        body?.code === "123456";

      return valid
        ? json({ ok: true, token: "qa-token-not-real", expiresIn: 600 })
        : json({ ok: false, reason: "invalid-code" }, 400);
    }

    if (url.pathname === "/api/submissions/comunicat") {
      return state.submission === "success"
        ? json({ ok: true })
        : json({ ok: false, reason: "qa-controlled-failure" }, 503);
    }

    if (url.pathname.startsWith("/api/")) {
      throw new Error(`Unexpected API request blocked by QA fixture: ${url.pathname}`);
    }

    return originalFetch(input, init);
  };

  state.restore = () => {
    window.fetch = originalFetch;
    window.setTimeout = originalSetTimeout;
    delete window.__communicatQa;
  };

  window.__communicatQa = state;
  console.log("Communicat QA fixture installed", state);
})();
```

Resultado objetivo de instalación: la consola muestra `Communicat QA fixture installed`; toda llamada
interceptada queda en `window.__communicatQa.calls`. El delay de expiración del token queda registrado
como `600000` en `window.__communicatQa.timerDelays`. Cualquier `/api/` no previsto falla localmente en
vez de alcanzar la red.

Para rellenar los siete valores permitidos con datos sintéticos válidos, pegar:

```js
(() => {
  const form = document.querySelector("[data-comunicat-submission-flow]");
  const values = {
    autor: "Entitat QA Local",
    titol: "Títol local reproduïble",
    resum: "Resum local prou llarg per superar la validació actual.",
    contingut:
      "Contingut local reproduïble amb prou longitud per superar el mínim actual sense enviar dades reals.",
    nombre_contacto: "Persona QA",
    email_contacto: "qa-local@example.test",
  };

  const radio = form.elements.namedItem("tipus_remitent")[0];
  radio.checked = true;
  radio.dispatchEvent(new Event("change", { bubbles: true }));

  for (const [name, value] of Object.entries(values)) {
    const field = form.elements.namedItem(name);
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }
})();
```

Usar siempre esta aserción para inspeccionar el envelope:

```js
(() => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`QA FAIL: ${message}`);
  };
  const key = "guiapineda:submission-draft:v1:comunicat";
  const envelope = JSON.parse(sessionStorage.getItem(key));
  const expected = [
    "autor",
    "contingut",
    "email_contacto",
    "nombre_contacto",
    "resum",
    "tipus_remitent",
    "titol",
  ];
  const actual = Object.keys(envelope.fields).sort();
  assert(envelope.version === 1, "version must be 1");
  assert(envelope.scope === "comunicat", "scope must be comunicat");
  assert(JSON.stringify(actual) === JSON.stringify(expected), `unexpected fields: ${actual}`);
  assert(
    Object.values(envelope.fields).every((value) => typeof value === "string"),
    "every allowed value must be a string",
  );
  console.log("PASS exact seven-field envelope", envelope);
})();
```

## Scenario 1: Shared CA/ES/EN draft

1. En CA, introducir los siete valores y avanzar hasta revisión.
2. Recargar: confirmar primer paso y valores recuperados.
3. Abrir ES en la misma pestaña, editar varios valores, abrir EN y volver a CA.
4. Confirmar siempre la última versión y ausencia de controles lingüísticos nuevos.

## Scenario 2: Derived and invalid state

1. Tras restaurar, comprobar selección, Continue, contadores, lectura y preview textual.
2. Avanzar y comprobar revisión.
3. Inyectar strings bajo mínimos y sobre máximos actuales; recargar.
4. Confirmar valor visible, validez/mensaje CA/ES/EN y bloqueo de avance/envío.
5. Corregir y confirmar habilitación y llegada a revisión.
6. Inyectar un tipo de remitente desconocido y confirmar que no hay sustituto seleccionado.

## Scenario 3: Security exclusions with synthetic verification

### Scenario 3A: Started verification does not restore

1. Instalar `window.__communicatQa` y ejecutar el rellenado sintético anterior.
2. Seleccionar una imagen local y marcar privacidad. Escribir también un valor sintético en
   `bot-field`; ninguno debe aparecer en el envelope.
3. Pulsar el botón `[data-verification-request]`. El fixture devuelve el challenge sintético sin
   enviar email.
4. Ejecutar:

   ```js
   (() => {
     const assert = (condition, message) => {
       if (!condition) throw new Error(`QA FAIL: ${message}`);
     };
     const qa = window.__communicatQa;
     const codeStep = document.querySelector("[data-verification-code-step]");
     assert(!codeStep.hidden, "code step must be visible");
     assert(
       qa.calls.some((call) => call.path === "/api/verification/request-code"),
       "request-code fixture was not exercised",
     );
     console.log("PASS synthetic challenge started", qa.calls);
   })();
   ```

5. Ejecutar la aserción del envelope exacto. Debe imprimir `PASS exact seven-field envelope` y no
   contener challenge, imagen, consentimiento, honeypot ni metadata.
6. Recargar en la misma ruta. No reinstalar aún el fixture; ejecutar la aserción de estado fresco:

   ```js
   (() => {
     const assert = (condition, message) => {
       if (!condition) throw new Error(`QA FAIL: ${message}`);
     };
     const form = document.querySelector("[data-comunicat-submission-flow]");
     const code = form.querySelector("[data-verification-code]");
     const token = form.querySelector("[data-verification-token]");
     const codeStep = form.querySelector("[data-verification-code-step]");
     const success = form.querySelector("[data-verification-success]");
     const request = form.querySelector("[data-verification-request]");
     assert(form.dataset.emailVerified === "false", "verification must restart false");
     assert(code.value === "" && token.value === "", "code and token must restart empty");
     assert(codeStep.hidden && success.hidden && !request.hidden, "verification UI must restart fresh");
     assert(
       form.elements.namedItem("email_contacto").value === "qa-local@example.test",
       "allowed contact email did not restore",
     );
     assert(
       form.elements.namedItem("autor").value === "Entitat QA Local",
       "allowed author did not restore",
     );
     console.log("PASS fresh verification state with allowed draft restored");
   })();
   ```

Resultado esperado: challenge/code-step no se restaura, código y token están vacíos, verificación es
`false`, imagen/honeypot/consentimiento están vacíos y los siete valores permitidos reaparecen.

### Scenario 3B: Completed verification and timer do not restore

1. Reinstalar `window.__communicatQa` tras la recarga.
2. Pulsar `[data-verification-request]`, escribir `123456` en `[data-verification-code]`, emitir un
   evento `input` y pulsar `[data-verification-confirm]`.
3. Ejecutar:

   ```js
   (() => {
     const assert = (condition, message) => {
       if (!condition) throw new Error(`QA FAIL: ${message}`);
     };
     const form = document.querySelector("[data-comunicat-submission-flow]");
     const qa = window.__communicatQa;
     assert(form.dataset.emailVerified === "true", "synthetic verification did not complete");
     assert(
       form.querySelector("[data-verification-token]").value === "qa-token-not-real",
       "synthetic token was not installed",
     );
     assert(
       qa.calls.some((call) =>
         call.path === "/api/verification/verify-code" &&
         call.body?.challengeId === "qa-challenge-not-real" &&
         call.body?.code === "123456"),
       "verify-code did not receive the synthetic challenge and code",
     );
     assert(qa.timerDelays.includes(600000), "token expiry timer was not created");
     console.log("PASS synthetic verification completed", qa);
   })();
   ```

4. Ejecutar de nuevo la aserción del envelope exacto: token, código, challenge, timer y estado
   verificado no pueden estar serializados.
5. Navegar en la misma pestaña a otra ruta lingüística o recargar y ejecutar la aserción de estado
   fresco de 3A.

Resultado esperado: antes de navegar existen token sintético, `verified=true` y timer `600000`; tras
navegar no se restaura ninguno, Send vuelve a exigir verificación/consentimiento y los siete valores
permitidos sí se restauran. No se solicita ni entrega email real.

## Scenario 4: Corrupt and incompatible storage

Probar en devtools, recargando después de cada caso:

```js
sessionStorage.setItem("guiapineda:submission-draft:v1:comunicat", "{");
sessionStorage.setItem(
  "guiapineda:submission-draft:v1:comunicat",
  JSON.stringify({ version: 999, scope: "agenda", fields: { titol: "Old" } }),
);
sessionStorage.setItem(
  "guiapineda:submission-draft:v1:comunicat",
  JSON.stringify({
    version: 1,
    scope: "comunicat",
    fields: {
      titol: "Valid title",
      resum: 42,
      imatge: "must-ignore",
      "bot-field": "must-ignore",
      aceptacion_privacidad: "true",
      verification_token: "must-ignore"
    }
  }),
);
```

Confirmar que no hay bloqueo, incompatibles se limpian y solo strings allowlisted pueden restaurarse.

## Scenario 5: Reset

1. Crear borrador y ejecutar:

   ```js
   document.querySelector("[data-comunicat-submission-flow]")?.reset();
   ```

2. Confirmar primer paso, valores iniciales, imagen vacía, seguridad fresca, derivados coherentes y
   ausencia del borrador tras recargar.
3. Repetir el rellenado sintético y confirmar que el formulario puede volver a avanzar normalmente.

## Scenario 6: Exact storage-failure probe

Con `npm run dev` activo y una ruta de Comunicats abierta, pegar el siguiente probe completo en
DevTools Console. Importa el helper real servido por Vite, usa formularios DOM desechables y restaura
en `finally` tanto `Storage.prototype` como el valor previo de la clave. No modifica archivos.

```js
(async () => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`QA FAIL: ${message}`);
  };
  const key = "guiapineda:submission-draft:v1:comunicat";
  const proto = Storage.prototype;
  const descriptors = Object.fromEntries(
    ["getItem", "setItem", "removeItem"].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(proto, name),
    ]),
  );
  const native = Object.fromEntries(
    Object.entries(descriptors).map(([name, descriptor]) => [name, descriptor.value]),
  );
  const previous = native.getItem.call(sessionStorage, key);
  const { initSubmissionDraft } = await import("/src/lib/submissionDraft.ts");
  const results = {};
  const calls = { getItem: 0, setItem: 0, removeItem: 0 };

  const restoreMethods = () => {
    for (const [name, descriptor] of Object.entries(descriptors)) {
      Object.defineProperty(proto, name, descriptor);
    }
  };

  const fail = (name) => {
    Object.defineProperty(proto, name, {
      ...descriptors[name],
      value() {
        calls[name] += 1;
        throw new DOMException(`QA ${name} failure`, "SecurityError");
      },
    });
  };

  const captureGlobalErrors = async (action) => {
    const errors = [];
    const onError = (event) => {
      errors.push(event.error ?? event.message);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    try {
      action();
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    } finally {
      window.removeEventListener("error", onError);
    }
    return errors;
  };

  const makeForm = () => {
    const form = document.createElement("form");
    form.innerHTML = '<input name="autor" type="text" value="">';
    return form;
  };

  try {
    native.removeItem.call(sessionStorage, key);

    fail("getItem");
    {
      const form = makeForm();
      let escaped = null;
      try {
        initSubmissionDraft(form, "comunicat", ["autor"]);
      } catch (error) {
        escaped = error;
      }
      const field = form.elements.namedItem("autor");
      field.value = "editable after getItem failure";
      restoreMethods();
      assert(calls.getItem > 0, "getItem failure was not exercised");
      assert(escaped === null, `getItem failure escaped helper: ${escaped}`);
      assert(field.value === "editable after getItem failure", "form stopped being editable after getItem failure");
      results.getItem = true;
    }

    native.removeItem.call(sessionStorage, key);
    {
      const form = makeForm();
      initSubmissionDraft(form, "comunicat", ["autor"]);
      fail("setItem");
      const field = form.elements.namedItem("autor");
      field.value = "editable after setItem failure";
      const errors = await captureGlobalErrors(() => {
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
      restoreMethods();
      assert(calls.setItem > 0, "setItem failure was not exercised by the real input listener");
      assert(errors.length === 0, `setItem failure escaped listener: ${errors}`);
      assert(field.value === "editable after setItem failure", "form stopped being editable after setItem failure");
      assert(native.getItem.call(sessionStorage, key) === null, "failed setItem unexpectedly wrote a draft");
      results.setItem = true;
    }

    native.setItem.call(
      sessionStorage,
      key,
      JSON.stringify({ version: 1, scope: "comunicat", fields: { autor: "QA" } }),
    );
    {
      const form = makeForm();
      const clear = initSubmissionDraft(form, "comunicat", ["autor"]);
      fail("removeItem");
      let directError = null;
      try {
        clear();
      } catch (error) {
        directError = error;
      }
      const resetErrors = await captureGlobalErrors(() => form.reset());
      const field = form.elements.namedItem("autor");
      field.value = "editable after removeItem failure";
      restoreMethods();
      assert(calls.removeItem >= 2, "removeItem failure was not exercised by clear and reset");
      assert(directError === null, `removeItem failure escaped clear(): ${directError}`);
      assert(resetErrors.length === 0, `removeItem failure escaped reset listener: ${resetErrors}`);
      assert(field.value === "editable after removeItem failure", "form stopped being editable after removeItem failure");
      results.removeItem = true;
    }
  } finally {
    restoreMethods();
    if (previous === null) native.removeItem.call(sessionStorage, key);
    else native.setItem.call(sessionStorage, key, previous);
  }

  console.table(results);
  assert(
    ["getItem", "setItem", "removeItem"].every((name) => results[name] === true),
    `storage failure probe incomplete: ${JSON.stringify(results)}`,
  );
  console.log("PASS getItem/setItem/removeItem failures remain non-fatal", results);
})();
```

Resultado obligatorio: tabla con `getItem`, `setItem` y `removeItem` en `true`, seguida de
`PASS getItem/setItem/removeItem failures remain non-fatal`. Cada método debe tener al menos una
invocación contada. Una aserción fallida lanza `QA FAIL`, interrumpe el bloque y hace imposible imprimir
el PASS. El caso `setItem` se ejecuta a través del listener real del helper y captura `window.error`
durante un turno del event loop; no depende de que `dispatchEvent()` propague la excepción al caller.

Para demostrar el formulario real operativo mientras storage falla, recargar la ruta CA, instalar el
fixture `window.__communicatQa` y pegar este segundo probe. Ejecuta autor -> contenido -> revisión,
verificación sintética y envío 503 mientras `setItem` lanza; después ejecuta reset y edición mientras
`removeItem` lanza. Siempre restaura los métodos nativos en `finally`.

```js
(async () => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`QA FAIL: ${message}`);
  };
  const form = document.querySelector("[data-comunicat-submission-flow]");
  const proto = Storage.prototype;
  const descriptors = Object.fromEntries(
    ["setItem", "removeItem"].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(proto, name),
    ]),
  );
  const results = {};
  const uncaughtErrors = [];
  const onError = (event) => {
    uncaughtErrors.push(event.error ?? event.message);
    event.preventDefault();
  };
  const restore = (name) => Object.defineProperty(proto, name, descriptors[name]);
  const fail = (name) => {
    Object.defineProperty(proto, name, {
      ...descriptors[name],
      value() {
        throw new DOMException(`QA ${name} failure`, "SecurityError");
      },
    });
  };
  const tick = (milliseconds = 0) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const fill = () => {
    const values = {
      autor: "Entitat QA Local",
      titol: "Títol local reproduïble",
      resum: "Resum local prou llarg per superar la validació actual.",
      contingut:
        "Contingut local reproduïble amb prou longitud per superar el mínim actual sense enviar dades reals.",
      nombre_contacto: "Persona QA",
      email_contacto: "qa-local@example.test",
    };
    const radio = form.elements.namedItem("tipus_remitent")[0];
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  try {
    window.addEventListener("error", onError);
    form.reset();
    await tick();
    window.__communicatQa.submission = "failure";

    fail("setItem");
    fill();
    document.getElementById("comunicat-author-continue").click();
    document.getElementById("comunicat-content-continue").click();

    form.querySelector("[data-verification-request]").click();
    await tick();
    const code = form.querySelector("[data-verification-code]");
    code.value = "123456";
    code.dispatchEvent(new Event("input", { bubbles: true }));
    form.querySelector("[data-verification-confirm]").click();
    await tick();

    const privacy = form.elements.namedItem("aceptacion_privacidad");
    privacy.checked = true;
    privacy.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("comunicat-review-send").click();
    await tick(50);

    results.setItemActualFlow =
      !document.getElementById("comunicat-step-review").hidden &&
      !document.getElementById("comunicat-submit-error").hidden &&
      form.elements.namedItem("autor").value === "Entitat QA Local";
    restore("setItem");

    fail("removeItem");
    let resetEscaped = false;
    try {
      form.reset();
      await tick();
    } catch {
      resetEscaped = true;
    }
    const author = form.elements.namedItem("autor");
    author.value = "Editable after removeItem failure";
    author.dispatchEvent(new Event("input", { bubbles: true }));
    results.removeItemActualFlow =
      !resetEscaped &&
      !document.getElementById("comunicat-step-author").hidden &&
      author.value === "Editable after removeItem failure";
  } finally {
    window.removeEventListener("error", onError);
    restore("setItem");
    restore("removeItem");
  }

  console.table(results);
  assert(uncaughtErrors.length === 0, `uncaught storage errors: ${uncaughtErrors}`);
  assert(
    results.setItemActualFlow === true && results.removeItemActualFlow === true,
    `actual form storage smoke failed: ${JSON.stringify(results)}`,
  );
  console.log("PASS actual form remains operational during storage failures", results);
})();
```

Resultado obligatorio: `setItemActualFlow` y `removeItemActualFlow` son `true`, el intento 503 muestra
el error existente y no aparece ninguna excepción no controlada. El caso `getItem` queda cubierto antes
de inicializar el helper por el probe aislado; `setItem` y `removeItem` quedan además cubiertos sobre el
flujo real. Al terminar, recargar para partir de un documento limpio.

## Scenario 7: Controlled local submission lifecycle

Usar el handler real y el fixture `window.__communicatQa`; no se realiza ninguna petición `/api/`.

1. Instalar el fixture, rellenar los siete campos, avanzar a revisión, completar la verificación
   sintética `123456` y marcar privacidad.
2. Mantener `window.__communicatQa.submission = "failure"` y pulsar Send. Tras finalizar el intento,
   ejecutar:

   ```js
   (() => {
     const assert = (condition, message) => {
       if (!condition) throw new Error(`QA FAIL: ${message}`);
     };
     const key = "guiapineda:submission-draft:v1:comunicat";
     const error = document.getElementById("comunicat-submit-error");
     assert(!error.hidden, "submission error must be visible");
     assert(sessionStorage.getItem(key) !== null, "draft must survive failure");
     assert(
       window.__communicatQa.calls.some(
         (call) => call.path === "/api/submissions/comunicat",
       ),
       "controlled submission endpoint was not exercised",
     );
     console.log("PASS controlled 503 preserves draft");
   })();
   ```

3. Cambiar únicamente `window.__communicatQa.submission = "success"` y pulsar Send otra vez. El
   transporte real espera su duración mínima y navega a la URL de éxito existente.
4. En la página de éxito ejecutar:

   ```js
   (() => {
     const assert = (condition, message) => {
       if (!condition) throw new Error(`QA FAIL: ${message}`);
     };
     const key = "guiapineda:submission-draft:v1:comunicat";
     assert(sessionStorage.getItem(key) === null, "draft must clear after explicit ok:true");
     console.log("PASS controlled ok:true clears draft");
   })();
   ```

5. Volver al formulario en la misma pestaña y confirmar que los siete campos no reaparecen.

Esto demuestra el alcance frontend, no Function/email/Strapi desplegados.

## Scenario 8: Agenda regression

1. Guardar/restaurar una muestra de campos Agenda entre dos variantes lingüísticas.
2. Confirmar clave/scope `agenda`, sin datos de Comunicats.
3. Confirmar exclusiones, reset y envelope corrupto sin regresión.

## Deferred predeployment gate

Cuando exista GUIAPINEDA desplegada, repetir fallo y aceptación reales con Comunicat y mailbox
desechables. Estado: `DEFERRED — predeployment`; no bloquea el cierre local ni indica defecto.

## Final checks

- Ejecutar nuevamente `npm run build`, `git diff --check`, diff completo y `git status`.
- Confirmar aplicación limitada a `src/lib/submissionDraft.ts` y
  `src/lib/comunicatSubmissionFlow.ts`.
- Confirmar `netlify/functions/**` y `../guiapineda-strapi/**` limpios.
- No incluir scripts temporales en el repositorio.
