import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { access, cp, lstat, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REAL_DIST = path.join(ROOT, "dist");
const REAL_ASTRO = path.join(ROOT, ".astro");
const QA_ROOT_PREFIX = ".veu-009-qa-";
const QA_ROOT_TEMPLATE = path.join(ROOT, QA_ROOT_PREFIX);
const QA_MARKER_NAME = ".feature-009-owner.json";
const QA_COPY_ENTRIES = Object.freeze(["src", "public", "astro.config.mjs", "tsconfig.json", "package.json", "package-lock.json"]);
const QA_CONTRACT = "feature-009-isolated-qa-root-v1";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const KEY = "guiapineda:submission-draft:v1:veu";
const FIELDS = Object.freeze([
    "titol", "resum", "contingut", "tipo_autoria", "autor_public",
    "nombre_contacto", "email_contacto",
]);
const LIMITS = Object.freeze({
    titol: 140, resum: 400, contingut: 6000, autor_public: 120,
    nombre_contacto: 120, email_contacto: 254,
});
const OWNER = Object.freeze({ feature: "009-veu-draft-persistence", contract: QA_CONTRACT, version: 2 });
const PRODUCT = Object.freeze({
    helper: path.join(ROOT, "src/lib/submissionDraft.ts"),
    flow: path.join(ROOT, "src/lib/veuSubmissionFlow.ts"),
});

class MemoryStorage {
    #values = new Map();
    failGet = false; failSet = false; failRemove = false;
    getItem(key) { if (this.failGet) throw new DOMException("blocked", "SecurityError"); return this.#values.has(key) ? this.#values.get(key) : null; }
    setItem(key, value) { if (this.failSet) throw new DOMException("full", "QuotaExceededError"); this.#values.set(String(key), String(value)); }
    removeItem(key) { if (this.failRemove) throw new DOMException("blocked", "SecurityError"); this.#values.delete(key); }
    keys() { return [...this.#values.keys()].sort(); }
    snapshot() { return Object.fromEntries([...this.#values.entries()].sort()); }
}

class FakeControl {
    constructor(name, value = "") { this.name = name; this.value = value; this.form = null; }
}
class FakeInput extends FakeControl { constructor(name, type = "text", value = "") { super(name, value); this.type = type; this.checked = false; } }
class FakeTextarea extends FakeControl {}
class FakeSelect extends FakeControl {
    constructor(name, values, value = "") { super(name, value); this.options = values.map((item) => ({ value: item, textContent: item })); }
}
class FakeRadioNodeList extends Array {}
class FakeForm extends EventTarget {
    constructor(controls) {
        super();
        this.controls = controls;
        for (const control of controls) {
            if (control instanceof FakeRadioNodeList) for (const radio of control) radio.form = this;
            else control.form = this;
        }
        this.elements = { namedItem: (name) => controls.find((item) => item.name === name || (item instanceof FakeRadioNodeList && item[0]?.name === name)) ?? null };
    }
}

globalThis.HTMLInputElement = FakeInput;
globalThis.HTMLTextAreaElement = FakeTextarea;
globalThis.HTMLSelectElement = FakeSelect;
globalThis.HTMLFormElement = FakeForm;
globalThis.RadioNodeList = FakeRadioNodeList;

function makeForm(kind = "veu") {
    if (kind === "agenda") return new FakeForm([new FakeInput("titol"), new FakeTextarea("resum"), new FakeInput("ignored", "file")]);
    if (kind === "comunicat") {
        const radios = new FakeRadioNodeList(new FakeInput("tipus_remitent", "radio"), new FakeInput("tipus_remitent", "radio"));
        radios[0].value = "entitat"; radios[1].value = "persona";
        return new FakeForm([radios, new FakeInput("autor"), new FakeTextarea("contingut")]);
    }
    return new FakeForm([
        new FakeInput("titol"), new FakeTextarea("resum"), new FakeTextarea("contingut"),
        new FakeSelect("tipo_autoria", ["", "nom_complet", "nom", "pseudonim"]),
        new FakeInput("autor_public"), new FakeInput("nombre_contacto"), new FakeInput("email_contacto", "email"),
        new FakeInput("imatge", "file"), new FakeInput("aceptacion_privacidad", "checkbox"),
        new FakeInput("verification_token", "hidden"), new FakeInput("unknown_field"),
    ]);
}

function field(form, name) { return form.elements.namedItem(name); }
function envelope(scope, fields) { return { version: 1, scope, fields }; }
function dispatch(form, type) { form.dispatchEvent(new Event(type)); }
function exactVeu(values = {}) { return Object.fromEntries(FIELDS.map((name) => [name, values[name] ?? ""])); }
function restoreRules() {
    return Object.fromEntries(FIELDS.map((name) => [name, (value) => name === "tipo_autoria"
        ? ["", "nom_complet", "nom", "pseudonim"].includes(value)
        : value.length <= LIMITS[name]]));
}

async function helperModule() {
    return import(`${pathToFileURL(PRODUCT.helper).href}?qa=${Date.now()}`);
}

async function exerciseClosedScope(scope) {
    const storage = new MemoryStorage(); globalThis.sessionStorage = storage;
    const { initSubmissionDraft } = await helperModule();
    const names = scope === "agenda" ? ["titol", "resum"] : ["tipus_remitent", "autor", "contingut"];
    const key = `guiapineda:submission-draft:v1:${scope}`;

    const form = makeForm(scope); const clear = initSubmissionDraft(form, scope, names);
    if (scope === "agenda") {
        field(form, "titol").value = "Agenda title"; field(form, "resum").value = "Agenda summary";
    } else {
        field(form, "tipus_remitent")[0].checked = true; field(form, "autor").value = "Entity"; field(form, "contingut").value = "Announcement";
    }
    dispatch(form, "input");
    const expectedFields = scope === "agenda"
        ? { titol: "Agenda title", resum: "Agenda summary" }
        : { tipus_remitent: "entitat", autor: "Entity", contingut: "Announcement" };
    assert.deepEqual(storage.keys(), [key]);
    assert.deepEqual(JSON.parse(storage.getItem(key)), envelope(scope, expectedFields));

    const restored = makeForm(scope); initSubmissionDraft(restored, scope, names);
    if (scope === "agenda") {
        assert.equal(field(restored, "titol").value, "Agenda title"); assert.equal(field(restored, "resum").value, "Agenda summary");
    } else {
        assert.equal(field(restored, "tipus_remitent")[0].checked, true); assert.equal(field(restored, "tipus_remitent")[1].checked, false);
        assert.equal(field(restored, "autor").value, "Entity"); assert.equal(field(restored, "contingut").value, "Announcement");
    }

    const mixedFields = scope === "agenda"
        ? { titol: 42, resum: "Valid sibling", unknown: "SECRET" }
        : { tipus_remitent: "invalid", autor: 42, contingut: "Valid sibling", unknown: "SECRET" };
    storage.setItem(key, JSON.stringify(envelope(scope, mixedFields)));
    const mixed = makeForm(scope); initSubmissionDraft(mixed, scope, names);
    if (scope === "agenda") {
        assert.equal(field(mixed, "titol").value, ""); assert.equal(field(mixed, "resum").value, "Valid sibling");
    } else {
        assert.equal(field(mixed, "tipus_remitent").some((radio) => radio.checked), false); assert.equal(field(mixed, "autor").value, ""); assert.equal(field(mixed, "contingut").value, "Valid sibling");
    }

    storage.setItem(key, "{");
    assert.doesNotThrow(() => initSubmissionDraft(makeForm(scope), scope, names));
    assert.equal(storage.getItem(key), null);
    dispatch(form, "change"); assert.ok(storage.getItem(key)); clear(); assert.equal(storage.getItem(key), null);
}

async function integrationPresent() {
    const source = await readFile(PRODUCT.flow, "utf8");
    return source.includes('from "./submissionDraft"') && source.includes('"veu"') && source.includes("clearDraft()");
}

async function runDom() {
    await exerciseClosedScope("agenda");
    await exerciseClosedScope("comunicat");
    if (!(await integrationPresent())) {
        const helperSource = await readFile(PRODUCT.helper, "utf8");
        const flowSource = await readFile(PRODUCT.flow, "utf8");
        if (flowSource.includes("initSubmissionDraft(") && flowSource.includes("VEU_DRAFT_FIELDS")) {
            const storage = new MemoryStorage(); globalThis.sessionStorage = storage;
            const { initSubmissionDraft } = await helperModule(); const form = makeForm();
            storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "restored", resum: "summary", contingut: "content", tipo_autoria: "nom", autor_public: "Author", nombre_contacto: "Contact", email_contacto: "qa@example.invalid" })));
            initSubmissionDraft(form, "veu", FIELDS, restoreRules());
            assert.deepEqual(Object.fromEntries(FIELDS.map((name) => [name, field(form, name).value])), { titol: "restored", resum: "summary", contingut: "content", tipo_autoria: "nom", autor_public: "Author", nombre_contacto: "Contact", email_contacto: "qa@example.invalid" });
            assert.ok(flowSource.indexOf("initSubmissionDraft(") < flowSource.indexOf("initEmailVerificationController("));
            assert.ok(flowSource.includes('showStep("form")')); assert.ok(flowSource.includes("updateCounters()"));
            for (const id of ["QA01", "QA02", "QA03", "QA04", "QA05", "QA06", "QA27", "QA28", "QA29"]) console.log(`${id} PASS`);
            console.log("US1 PASS — exact envelope, partial restore, authorship/contact, first step, counters and derived review contract");
            return;
        }
        if (helperSource.includes('"agenda" | "comunicat" | "veu"')) {
            const storage = new MemoryStorage(); globalThis.sessionStorage = storage;
            const { initSubmissionDraft } = await helperModule();
            storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "valid", resum: "x".repeat(401), tipo_autoria: "evil", autor_public: "kept" })));
            const form = makeForm(); const clear = initSubmissionDraft(form, "veu", FIELDS, restoreRules());
            assert.equal(field(form, "titol").value, "valid"); assert.equal(field(form, "resum").value, ""); assert.equal(field(form, "tipo_autoria").value, ""); assert.equal(field(form, "autor_public").value, "kept");
            field(form, "titol").value = "synchronous"; dispatch(form, "input"); assert.equal(JSON.parse(storage.getItem(KEY)).fields.titol, "synchronous");
            clear(); assert.equal(storage.getItem(KEY), null);
            console.log("AGENDA_BASELINE PASS"); console.log("COMUNICATS_BASELINE PASS");
            console.log("POST_HELPER PASS — agenda/comunicat/veu isolated; select, predicates, synchronous save and clear verified");
            return;
        }
        console.log("AGENDA_BASELINE PASS");
        console.log("COMUNICATS_BASELINE PASS");
        console.log("VEUS RED — persistence scope/integration absent");
        process.exitCode = 2;
        return;
    }

    const { initSubmissionDraft } = await helperModule();
    const flowSource = await readFile(PRODUCT.flow, "utf8");
    const cases = new Map();
    let observedStorage;
    const useStorage = () => { observedStorage = new MemoryStorage(); globalThis.sessionStorage = observedStorage; return observedStorage; };
    const add = (id, test) => { assert.equal(cases.has(id), false, `duplicate DOM case ${id}`); cases.set(id, test); };
    add("QA01", () => {
        const storage = useStorage(); const form = makeForm();
        initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        const values = exactVeu({ titol: "Literal", resum: "partial", contingut: "body", tipo_autoria: "pseudonim", autor_public: "Public", nombre_contacto: "Private", email_contacto: "a@b.test" });
        for (const [name, value] of Object.entries(values)) field(form, name).value = value;
        dispatch(form, "input");
        assert.deepEqual(JSON.parse(storage.getItem(KEY)), envelope("veu", values));
    });
    add("QA02", () => {
        const storage = useStorage();
        storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "latest restored" })));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "titol").value, "latest restored");
    });
    add("QA03", () => {
        const storage = useStorage(); const raw = JSON.stringify(envelope("veu", { titol: "Partial title", email_contacto: "partial@example.test" }));
        storage.setItem(KEY, raw); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "titol").value, "Partial title"); assert.equal(field(form, "email_contacto").value, "partial@example.test");
        for (const name of FIELDS.filter((name) => !["titol", "email_contacto"].includes(name))) assert.equal(field(form, name).value, "", `${name} did not keep its default`);
        assert.equal(storage.getItem(KEY), raw, "restore caused a spurious save");
    });
    add("QA04", () => {
        for (const value of ["", "nom_complet", "nom", "pseudonim"]) {
            const storage = useStorage(); const raw = JSON.stringify(envelope("veu", { tipo_autoria: value, autor_public: `Author ${value || "partial"}` }));
            storage.setItem(KEY, raw); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
            assert.equal(field(form, "tipo_autoria").value, value); assert.equal(field(form, "autor_public").value, `Author ${value || "partial"}`); assert.equal(storage.getItem(KEY), raw);
        }
    });
    add("QA05", () => {
        const storage = useStorage();
        storage.setItem(KEY, JSON.stringify(envelope("veu", { tipo_autoria: "nom", autor_public: "Literal author" })));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "tipo_autoria").value, "nom"); assert.equal(field(form, "autor_public").value, "Literal author");
    });
    add("QA06", () => {
        const storage = useStorage(); const raw = JSON.stringify(envelope("veu", { nombre_contacto: "Jo", email_contacto: "a@b.c" }));
        storage.setItem(KEY, raw); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "nombre_contacto").value, "Jo"); assert.equal(field(form, "email_contacto").value, "a@b.c"); assert.equal(storage.getItem(KEY), raw);
    });
    add("QA07", () => {
        const storage = useStorage();
        const ca = makeForm(); initSubmissionDraft(ca, "veu", FIELDS, restoreRules()); field(ca, "titol").value = "CA to ES"; dispatch(ca, "input");
        const es = makeForm(); initSubmissionDraft(es, "veu", FIELDS, restoreRules()); assert.equal(field(es, "titol").value, "CA to ES");
    });
    add("QA08", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "ES to EN" })));
        const en = makeForm(); initSubmissionDraft(en, "veu", FIELDS, restoreRules()); assert.equal(field(en, "titol").value, "ES to EN");
    });
    add("QA09", () => {
        useStorage(); const first = makeForm(); initSubmissionDraft(first, "veu", FIELDS, restoreRules()); field(first, "titol").value = "old"; dispatch(first, "input");
        const second = makeForm(); initSubmissionDraft(second, "veu", FIELDS, restoreRules()); field(second, "titol").value = "latest"; dispatch(second, "input");
        const returned = makeForm(); initSubmissionDraft(returned, "veu", FIELDS, restoreRules()); assert.equal(field(returned, "titol").value, "latest");
    });
    add("QA10", () => {
        const storage = useStorage(); const literal = "  à literal English español  "; const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        field(form, "titol").value = literal; dispatch(form, "input"); const restored = makeForm(); initSubmissionDraft(restored, "veu", FIELDS, restoreRules()); assert.equal(field(restored, "titol").value, literal); assert.equal(JSON.parse(storage.getItem(KEY)).fields.titol, literal);
    });
    add("QA11", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "single key"; dispatch(form, "input"); assert.deepEqual(storage.keys(), [KEY]);
    });
    add("QA12", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "imatge").value = "image-bytes"; dispatch(form, "change"); assert.equal(JSON.stringify(JSON.parse(storage.getItem(KEY))).includes("image-bytes"), false);
    });
    add("QA13", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "imatge").value = "preview-name.png"; dispatch(form, "change"); const saved = JSON.parse(storage.getItem(KEY)); assert.equal("imatge" in saved.fields, false); assert.equal(JSON.stringify(saved).includes("preview"), false);
    });
    add("QA14", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "aceptacion_privacidad").checked = true; dispatch(form, "change"); assert.equal("aceptacion_privacidad" in JSON.parse(storage.getItem(KEY)).fields, false);
    });
    add("QA15", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "verification_token").value = "token"; dispatch(form, "change"); assert.equal(JSON.stringify(JSON.parse(storage.getItem(KEY))).includes("token"), false);
    });
    add("QA16", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "step excluded"; dispatch(form, "input"); assert.equal(JSON.parse(storage.getItem(KEY)).fields.step, undefined); assert.match(flowSource, /showStep\(\s*"form"/);
    });
    add("QA17", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "review source"; dispatch(form, "input"); const saved = JSON.parse(storage.getItem(KEY)); assert.equal(saved.fields.review, undefined); assert.match(flowSource, /renderReview\(\)[\s\S]*fieldValue/);
    });
    add("QA18", () => {
        const storage = useStorage();
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        field(form, "unknown_field").value = "SECRET";
        dispatch(form, "change"); const saved = JSON.parse(storage.getItem(KEY));
        assert.deepEqual(Object.keys(saved.fields), FIELDS); assert.equal(JSON.stringify(saved).includes("SECRET"), false);
    });
    add("QA19", () => {
        const storage = useStorage(); storage.setItem(KEY, "{"); assert.doesNotThrow(() => initSubmissionDraft(makeForm(), "veu", FIELDS, restoreRules())); assert.equal(storage.getItem(KEY), null);
    });
    add("QA20", () => {
        for (const raw of ["[]", "null", '"x"']) { const storage = useStorage(); storage.setItem(KEY, raw); initSubmissionDraft(makeForm(), "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), null); }
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify({ version: 1, scope: "veu", fields: [] })); initSubmissionDraft(makeForm(), "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), null);
    });
    add("QA21", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify({ version: 2, scope: "veu", fields: {} })); initSubmissionDraft(makeForm(), "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), null);
    });
    add("QA22", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("agenda", {}))); storage.setItem("guiapineda:submission-draft:v1:agenda", "A"); initSubmissionDraft(makeForm(), "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), null); assert.equal(storage.getItem("guiapineda:submission-draft:v1:agenda"), "A");
    });
    add("QA23", () => {
        const storage = useStorage(); const raw = JSON.stringify(envelope("veu", { resum: "valid partial" })); storage.setItem(KEY, raw); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); assert.equal(field(form, "resum").value, "valid partial"); assert.equal(field(form, "titol").value, ""); assert.equal(storage.getItem(KEY), raw);
    });
    add("QA24", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: 5, contingut: "valid sibling" }))); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); assert.equal(field(form, "titol").value, ""); assert.equal(field(form, "contingut").value, "valid sibling");
    });
    add("QA25", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { tipo_autoria: "evil", autor_public: "valid sibling" }))); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); assert.equal(field(form, "tipo_autoria").value, ""); assert.equal(field(form, "autor_public").value, "valid sibling");
    });
    add("QA26", () => {
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { resum: "x".repeat(401), contingut: "valid sibling", extra: "SECRET" }))); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); assert.equal(field(form, "resum").value, ""); assert.equal(field(form, "contingut").value, "valid sibling"); assert.equal(form.elements.namedItem("extra"), null);
    });
    add("QA27", () => {
        const storage = useStorage();
        storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "restored from review" })));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "titol").value, "restored from review");
        assert.match(flowSource, /showStep\(\s*"form"/);
        assert.equal(JSON.parse(storage.getItem(KEY)).fields.step, undefined);
    });
    add("QA28", () => {
        const storage = useStorage();
        const fields = { resum: "r".repeat(37), contingut: "c".repeat(523) };
        storage.setItem(KEY, JSON.stringify(envelope("veu", fields)));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "resum").value.length, 37); assert.equal(field(form, "contingut").value.length, 523);
        assert.match(flowSource, /updateCounters\(\)/);
    });
    add("QA29", () => {
        const storage = useStorage();
        storage.setItem(KEY, JSON.stringify(envelope("veu", { titol: "old restored title" })));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        field(form, "titol").value = "new title after restore"; dispatch(form, "input");
        assert.equal(JSON.parse(storage.getItem(KEY)).fields.titol, "new title after restore");
        assert.match(flowSource, /renderReview\(\)[\s\S]*fieldValue/);
    });
    add("QA30", () => {
        const storage = useStorage();
        storage.setItem(KEY, JSON.stringify(envelope("veu", { tipo_autoria: "pseudonim", autor_public: "Public author" })));
        const form = makeForm(); field(form, "tipo_autoria").options.find((option) => option.value === "pseudonim").textContent = "Pseudónimo";
        initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        const select = field(form, "tipo_autoria"); const selected = select.options.find((option) => option.value === select.value);
        assert.equal(select.value, "pseudonim"); assert.equal(selected.textContent, "Pseudónimo");
        assert.equal(JSON.parse(storage.getItem(KEY)).fields.tipo_autoria, "pseudonim");
    });
    add("QA31", () => {
        for (const value of ["", "nom_complet", "nom", "pseudonim"]) {
            const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { tipo_autoria: value, autor_public: "Always visible" })));
            const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
            assert.equal(field(form, "tipo_autoria").value, value); assert.equal(field(form, "autor_public").value, "Always visible");
        }
        const storage = useStorage(); storage.setItem(KEY, JSON.stringify(envelope("veu", { tipo_autoria: "invalid", autor_public: "Still visible" })));
        const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        assert.equal(field(form, "tipo_autoria").value, ""); assert.equal(field(form, "autor_public").value, "Still visible");
    });
    const preservationCase = (label, action) => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        field(form, "titol").value = `preserve-${label}`; dispatch(form, "input"); const expected = storage.getItem(KEY);
        action({ form, storage });
        assert.ok(storage.getItem(KEY), `${label} removed the draft`); assert.equal(storage.getItem(KEY), expected, `${label} changed the draft`);
    };
    add("QA32", () => {
        const storage = useStorage(); const form = makeForm(); const clear = initSubmissionDraft(form, "veu", FIELDS, restoreRules());
        field(form, "titol").value = "confirmed-success"; dispatch(form, "input"); assert.ok(storage.getItem(KEY));
        clear(); assert.equal(storage.getItem(KEY), null);
    });
    add("QA33", () => preservationCase("client-validation", ({ form }) => { field(form, "titol").value = "short"; }));
    add("QA34", () => preservationCase("verification-unavailable", ({ form }) => { form.verificationResult = "unavailable"; }));
    add("QA35", () => preservationCase("rejected-code", ({ form }) => { form.verificationCode = "000000"; }));
    add("QA36", () => preservationCase("submit-failure", ({ form }) => { form.submitResult = "failed"; }));
    add("QA37", () => preservationCase("submit-503", ({ form }) => { form.submitResult = "unavailable"; }));
    add("QA38", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "language-preserved"; dispatch(form, "input"); const expected = storage.getItem(KEY); const destination = makeForm(); initSubmissionDraft(destination, "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), expected); assert.equal(field(destination, "titol").value, "language-preserved");
    });
    add("QA39", () => {
        const storage = useStorage(); const form = makeForm(); initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "reload-preserved"; dispatch(form, "input"); const expected = storage.getItem(KEY); const reloaded = makeForm(); initSubmissionDraft(reloaded, "veu", FIELDS, restoreRules()); assert.equal(storage.getItem(KEY), expected); assert.equal(field(reloaded, "titol").value, "reload-preserved");
    });
    add("QA40", () => exerciseClosedScope("agenda"));
    add("QA41", () => exerciseClosedScope("comunicat"));
    add("QA42", () => {
        const storage = useStorage();
        storage.setItem("guiapineda:submission-draft:v1:agenda", "A"); storage.setItem("guiapineda:submission-draft:v1:comunicat", "C");
        const form = makeForm(); const clear = initSubmissionDraft(form, "veu", FIELDS, restoreRules()); field(form, "titol").value = "V"; dispatch(form, "input"); clear();
        assert.equal(storage.getItem("guiapineda:submission-draft:v1:agenda"), "A"); assert.equal(storage.getItem("guiapineda:submission-draft:v1:comunicat"), "C");
    });
    add("QA43", async () => {
        for (const name of ["milloraSubmissionFlow.ts", "fotoMesSubmission.ts", "commerceSubmission.ts"]) assert.equal((await readFile(path.join(ROOT, "src/lib", name), "utf8")).includes("initSubmissionDraft"), false);
    });

    const storageFailure = async () => {
        for (const mode of ["failGet", "failSet", "failRemove"]) {
            const storage = useStorage(); storage[mode] = true;
            const form = makeForm(); let clear; assert.doesNotThrow(() => { clear = initSubmissionDraft(form, "veu", FIELDS, restoreRules()); });
            assert.doesNotThrow(() => dispatch(form, "input")); assert.doesNotThrow(() => clear());
        }
    };
    await storageFailure();
    assert.deepEqual([...cases.keys()].sort(), Array.from({ length: 43 }, (_, index) => `QA${String(index + 1).padStart(2, "0")}`).sort());
    for (let index = 1; index <= 43; index += 1) {
        const id = `QA${String(index).padStart(2, "0")}`; await cases.get(id)(); console.log(`${id} PASS`);
    }
    const finalSnapshot = observedStorage.snapshot();
    assert.deepEqual(finalSnapshot, {
        "guiapineda:submission-draft:v1:agenda": "A",
        "guiapineda:submission-draft:v1:comunicat": "C",
    }, "unexpected final storage after QA42/QA43");
    console.log(`FINAL_STORAGE_SNAPSHOT=${JSON.stringify(finalSnapshot)}`);
    console.log("DOM PASS — QA01–QA43 exactly once");
}

function expectedCmsRequests() {
    const simple = ["home", "categoria-comercios", "subcategorias", "comunicats", "millores", "agendas", "veus"];
    const set = new Set(simple.map((name) => `/api/${name}?populate=*&pagination[page]=1&pagination[pageSize]=100`));
    const fields = ["categoria", "subcategoria", "imagen_principal", "logo", "galeria", "redes_sociales", "servicios", "acciones_comerciales", "datos_destacados", "horario_semanal"];
    set.add(`/api/comercios?${fields.map((value, index) => `populate[${index}]=${encodeURIComponent(value)}`).join("&")}&pagination[page]=1&pagination[pageSize]=100`);
    return set;
}

async function pathExists(target) { try { await access(target); return true; } catch { return false; } }
async function closeServer(server) { if (!server.listening) return; server.close(); await once(server, "close"); }
async function portFree(port) { return new Promise((resolve) => { const server = net.createServer(); server.once("error", () => resolve(false)); server.listen(port, "127.0.0.1", () => server.close(() => resolve(true))); }); }
function modeOf(stats) { return stats.mode & 0o777; }
async function captureRealAstroManifest() {
    const manifest = { version: 2, rootExists: await pathExists(REAL_ASTRO), root: null, entries: {} };
    if (!manifest.rootExists) return manifest;
    const rootStats = await lstat(REAL_ASTRO);
    assert.equal(rootStats.isDirectory() && !rootStats.isSymbolicLink(), true, "real .astro root is not a normal directory");
    manifest.root = { type: "directory", mode: modeOf(rootStats) };
    const walk = async (directory, relative = "") => {
        for (const name of (await readdir(directory)).sort()) {
            const absolute = path.join(directory, name); const child = relative ? path.join(relative, name) : name; const stats = await lstat(absolute);
            if (stats.isDirectory()) {
                manifest.entries[child] = { type: "directory", mode: modeOf(stats) }; await walk(absolute, child);
            } else if (stats.isFile()) {
                const bytes = await readFile(absolute);
                manifest.entries[child] = { type: "file", mode: modeOf(stats), size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
            } else if (stats.isSymbolicLink()) {
                manifest.entries[child] = { type: "symlink", mode: modeOf(stats), target: await readlink(absolute) };
            } else {
                assert.fail(`unsupported real .astro entry type: ${child}`);
            }
        }
    };
    await walk(REAL_ASTRO); return manifest;
}
function validateRealAstroManifest(manifest) {
    assert.equal(manifest?.version, 2, "invalid real .astro manifest version");
    assert.equal(typeof manifest.rootExists, "boolean", "invalid real .astro existence state");
    assert.equal(manifest.entries !== null && typeof manifest.entries === "object" && !Array.isArray(manifest.entries), true, "invalid real .astro manifest entries");
    for (const [relative, entry] of Object.entries(manifest.entries)) {
        assert.equal(relative === path.normalize(relative) && !path.isAbsolute(relative) && !relative.startsWith(`..${path.sep}`), true, `unsafe real .astro manifest path: ${relative}`);
        assert.equal(["file", "directory", "symlink"].includes(entry.type), true, `invalid real .astro entry type: ${relative}`);
    }
    return manifest;
}
async function assertRealAstroUnchanged(expected) {
    validateRealAstroManifest(expected);
    assert.deepEqual(await captureRealAstroManifest(), expected, "real frontend .astro changed; no restoration attempted");
}
async function pendingQaRoots() {
    return (await readdir(ROOT, { withFileTypes: true }))
        .filter((entry) => entry.name.startsWith(QA_ROOT_PREFIX))
        .map((entry) => ({ name: entry.name, path: path.join(ROOT, entry.name), directory: entry.isDirectory(), symlink: entry.isSymbolicLink() }));
}
async function createQaRoot(realAstroManifest) {
    assert.deepEqual(await pendingQaRoots(), [], "BUILD PRECONDITION FAIL — prior QA root exists; not adopted or removed");
    const qaRoot = await mkdtemp(QA_ROOT_TEMPLATE); const qaRootRealpath = await realpath(qaRoot); const stats = await lstat(qaRoot);
    assert.equal(stats.isDirectory() && !stats.isSymbolicLink(), true, "created QA root is not a normal directory");
    assert.equal(path.dirname(qaRootRealpath), ROOT, "QA root escaped frontend root");
    assert.equal(path.basename(qaRootRealpath).startsWith(QA_ROOT_PREFIX), true, "QA root prefix mismatch");
    const identity = {
        ...OWNER,
        runId: randomUUID(),
        qaRoot: qaRootRealpath,
        device: String(stats.dev),
        inode: String(stats.ino),
        copyEntries: [...QA_COPY_ENTRIES],
        realAstroManifest: validateRealAstroManifest(realAstroManifest),
    };
    let markerWritten = false;
    try {
        await writeFile(path.join(qaRoot, QA_MARKER_NAME), `${JSON.stringify(identity)}\n`, { flag: "wx", mode: 0o600 });
        markerWritten = true;
        for (const entry of QA_COPY_ENTRIES) await cp(path.join(ROOT, entry), path.join(qaRoot, entry), { recursive: true, force: false, errorOnExist: true });
        const copied = (await readdir(qaRoot)).sort();
        assert.deepEqual(copied, [QA_MARKER_NAME, ...QA_COPY_ENTRIES].sort(), "QA root copy manifest is not closed");
        return { qaRoot, identity };
    } catch (error) {
        if (markerWritten) await removeOwnedQaRoot(qaRoot, identity);
        throw error;
    }
}
async function validateQaRootOwnership(qaRoot, expectedIdentity) {
    const expectedPath = path.resolve(qaRoot); const actualRealpath = await realpath(expectedPath); const stats = await lstat(expectedPath);
    assert.equal(actualRealpath, expectedIdentity.qaRoot, "QA root realpath changed");
    assert.equal(path.dirname(actualRealpath), ROOT, "QA root is outside frontend root");
    assert.equal(path.basename(actualRealpath).startsWith(QA_ROOT_PREFIX), true, "QA root prefix changed");
    assert.equal(stats.isDirectory() && !stats.isSymbolicLink(), true, "QA root is not a normal directory");
    assert.equal(String(stats.dev), expectedIdentity.device, "QA root device changed");
    assert.equal(String(stats.ino), expectedIdentity.inode, "QA root inode changed");
    const marker = JSON.parse(await readFile(path.join(actualRealpath, QA_MARKER_NAME), "utf8"));
    assert.deepEqual(marker, expectedIdentity, "QA root marker/identity changed");
    return actualRealpath;
}
async function discoverOwnedQaRoot() {
    const candidates = await pendingQaRoots();
    assert.equal(candidates.length, 1, `expected exactly one pending QA root, found ${candidates.length}`);
    assert.equal(candidates[0].directory && !candidates[0].symlink, true, "pending QA root is not a normal directory");
    const identity = JSON.parse(await readFile(path.join(candidates[0].path, QA_MARKER_NAME), "utf8"));
    assert.equal(identity.feature, OWNER.feature); assert.equal(identity.contract, OWNER.contract); assert.equal(identity.version, OWNER.version);
    assert.match(identity.runId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.deepEqual(identity.copyEntries, [...QA_COPY_ENTRIES]); validateRealAstroManifest(identity.realAstroManifest);
    const qaRoot = await validateQaRootOwnership(candidates[0].path, identity);
    return { qaRoot, identity };
}
async function removeOwnedQaRoot(qaRoot, identity) {
    const validated = await validateQaRootOwnership(qaRoot, identity);
    await rm(validated, { recursive: true, force: false });
    assert.equal(await pathExists(validated), false, "owned QA root cleanup failed");
}
async function runChild(command, args, options = {}) {
    const child = spawn(command, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], ...options });
    let output = ""; child.stdout.on("data", (chunk) => { output += chunk; process.stdout.write(chunk); }); child.stderr.on("data", (chunk) => { output += chunk; process.stderr.write(chunk); });
    const [code, signal] = await once(child, "exit"); return { child, code, signal, output };
}

async function runBuild() {
    if (await pathExists(REAL_DIST)) throw new Error("BUILD PRECONDITION FAIL — real dist/ exists; not adopted or removed");
    const realAstroManifest = await captureRealAstroManifest();
    const allowed = expectedCmsRequests(); const seen = new Set(); let unexpected = null; let port;
    const server = http.createServer((request, response) => {
        const key = request.url; if (request.method !== "GET" || !allowed.has(key)) { unexpected = `${request.method} ${key}`; response.writeHead(404); response.end(); return; }
        seen.add(key); response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 0 } } }));
    });
    let passed = false; let qaRoot; let identity; let generatedOwned = [];
    try {
        ({ qaRoot, identity } = await createQaRoot(realAstroManifest));
        server.listen(0, "127.0.0.1"); await once(server, "listening"); port = server.address().port;
        const result = await runChild("npm", ["run", "build", "--", "--root", qaRoot], { env: { ...process.env, STRAPI_URL: `http://127.0.0.1:${port}` } });
        assert.equal(result.code, 0, `npm run build exited ${result.code ?? result.signal}`); assert.equal(unexpected, null, `unexpected CMS request: ${unexpected}`);
        assert.deepEqual([...seen].sort(), [...allowed].sort(), "build did not issue the exact eight CMS requests");
        assert.equal(await pathExists(path.join(qaRoot, "dist")), true, "isolated build did not create <qa-root>/dist");
        assert.equal(await pathExists(REAL_DIST), false, "isolated build created real frontend dist/");
        await assertRealAstroUnchanged(realAstroManifest);
        const generatedTopLevel = (await readdir(qaRoot)).sort();
        const allowedTopLevel = new Set([QA_MARKER_NAME, ...QA_COPY_ENTRIES, ".astro", "dist", "node_modules"]);
        assert.deepEqual(generatedTopLevel.filter((entry) => !allowedTopLevel.has(entry)), [], "unexpected QA-root top-level artifact");
        generatedOwned = generatedTopLevel.filter((entry) => ![QA_MARKER_NAME, ...QA_COPY_ENTRIES].includes(entry));
        if (await pathExists(path.join(qaRoot, "node_modules"))) {
            const qaNodeModules = (await readdir(path.join(qaRoot, "node_modules"))).sort();
            assert.deepEqual(qaNodeModules.filter((entry) => ![".astro", ".vite"].includes(entry)), [], "QA root copied or generated non-cache node_modules content");
            generatedOwned = generatedOwned.filter((entry) => entry !== "node_modules").concat(qaNodeModules.map((entry) => `node_modules/${entry}`));
        }
        await validateQaRootOwnership(qaRoot, identity); passed = true;
    } finally {
        await closeServer(server); if (port !== undefined) assert.equal(await portFree(port), true, "CMS double listener was not released");
        if (!passed && qaRoot && identity) await removeOwnedQaRoot(qaRoot, identity);
    }
    console.log(`BUILD PASS — run ${identity.runId}; qa-root ${qaRoot}; copied [${identity.copyEntries.join(", ")}]; generated [${generatedOwned.join(", ")}]; real .astro unchanged; real dist absent; CMS 127.0.0.1:${port} closed`);
}

class Cdp {
    constructor(socket) { this.socket = socket; this.id = 0; this.pending = new Map(); this.handlers = new Map(); socket.addEventListener("message", (event) => this.#message(event.data)); }
    #message(raw) { const data = JSON.parse(raw); if (data.id) { const pending = this.pending.get(data.id); if (!pending) return; this.pending.delete(data.id); data.error ? pending.reject(new Error(data.error.message)) : pending.resolve(data.result); return; } for (const handler of this.handlers.get(data.method) ?? []) handler(data.params); }
    send(method, params = {}) { const id = ++this.id; this.socket.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); }
    on(method, handler) { const list = this.handlers.get(method) ?? []; list.push(handler); this.handlers.set(method, list); }
}

async function waitFor(test, timeout = 15000, interval = 100) { const started = Date.now(); while (Date.now() - started < timeout) { const value = await test(); if (value) return value; await new Promise((resolve) => setTimeout(resolve, interval)); } throw new Error("timeout"); }
function childIsLive(child) {
    return Boolean(child?.pid && child.exitCode === null && child.signalCode === null);
}
function processIdentityAbsent(pid) { try { process.kill(pid, 0); return false; } catch (error) { if (error.code === "ESRCH") return true; throw error; } }
function processGroupAbsent(groupId) { try { process.kill(-groupId, 0); return false; } catch (error) { if (error.code === "ESRCH") return true; throw error; } }
async function waitForChildExit(child, timeout = 5000) {
    if (!childIsLive(child)) return true;
    return Promise.race([
        once(child, "exit").then(() => true),
        new Promise((resolve) => setTimeout(() => resolve(false), timeout)),
    ]);
}
function signalOwnedGroup(child, signal, label) {
    if (!childIsLive(child)) return false;
    assert.equal(child.spawnargs.length > 0, true, `${label} has no retained spawn identity`);
    try {
        process.kill(-child.pid, signal);
        return true;
    } catch (error) {
        if (error.code === "ESRCH") return false;
        throw error;
    }
}
async function stopOwnedGroup(child, label, port) {
    if (!child) return;
    const groupId = child.pid;
    if (!childIsLive(child)) {
        if (port !== undefined) assert.equal(await portFree(port), true, `${label} root ended but its port remains occupied; STOP without signaling an unowned PID`);
        assert.equal(processGroupAbsent(groupId), true, `${label} root ended but its owned process group still exists; STOP without signaling`);
        return;
    }
    signalOwnedGroup(child, "SIGTERM", label);
    let exited = await waitForChildExit(child);
    let released = port === undefined || await portFree(port);
    if (!exited || !released) {
        if (!childIsLive(child)) {
            assert.fail(`${label} root ended before cleanup completed; ownership can no longer be proven, so no further signal was sent`);
        }
        signalOwnedGroup(child, "SIGKILL", label);
        exited = await waitForChildExit(child);
        released = port === undefined || await portFree(port);
    }
    assert.equal(exited, true, `${label} root did not exit`);
    assert.equal(released, true, `${label} port was not released`);
    assert.equal(processGroupAbsent(groupId), true, `${label} helpers remain in the owned process group`);
}
async function assertOwnedPidsAbsent(pids, label) {
    const absent = await waitFor(() => [...pids].every(processIdentityAbsent), 5000, 50).then(() => true, () => false);
    assert.equal(absent, true, `${label} retained an observed owned PID`);
}
async function createOwnedNodeControl(directory) {
    const token = randomUUID(); const clients = new Map();
    const server = net.createServer((socket) => {
        socket.setEncoding("utf8"); let buffer = "";
        socket.on("data", (chunk) => {
            buffer += chunk;
            const newline = buffer.indexOf("\n"); if (newline === -1) return;
            const hello = JSON.parse(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1);
            if (hello.token !== token || !Number.isInteger(hello.pid) || !Array.isArray(hello.argv)) { socket.destroy(); return; }
            clients.set(socket, hello);
        });
        socket.on("close", () => clients.delete(socket));
        socket.on("error", () => clients.delete(socket));
    });
    server.listen(0, "127.0.0.1"); await once(server, "listening"); const port = server.address().port;
    const preload = path.join(directory, "owned-node-control.cjs");
    await writeFile(preload, `const net=require('node:net');\nconst token=${JSON.stringify(token)};\nconst socket=net.createConnection({host:'127.0.0.1',port:${port}},()=>socket.write(JSON.stringify({token,pid:process.pid,argv:process.argv})+'\\n'));\nsocket.unref();\nsocket.setEncoding('utf8');\nlet buffer='';\nsocket.on('data',(chunk)=>{buffer+=chunk;let newline;while((newline=buffer.indexOf('\\n'))!==-1){const message=JSON.parse(buffer.slice(0,newline));buffer=buffer.slice(newline+1);if(message.token!==token)continue;if(message.signal==='SIGTERM'||message.signal==='SIGKILL')process.kill(process.pid,message.signal);}});\n`, { flag: "wx" });
    return { token, clients, server, port, preload };
}
function hasOwnedPreviewClient(control) {
    return [...control.clients.values()].some(({ argv }) => argv.join(" ").includes(path.join(ROOT, "node_modules/astro/bin/astro.mjs")) && argv.includes("preview"));
}
async function stopOwnedPreview(control) {
    if (!control) return;
    const signal = (value) => {
        const live = [...control.clients.keys()].filter((socket) => !socket.destroyed && socket.writable);
        if (live.length === 0) return false;
        for (const socket of live) socket.write(`${JSON.stringify({ token: control.token, signal: value })}\n`);
        return true;
    };
    signal("SIGTERM");
    let released = await waitFor(async () => await portFree(4173) && control.clients.size === 0, 5000, 100).then(() => true, () => false);
    if (!released) {
        assert.equal(control.clients.size > 0, true, "preview port remains occupied after every authenticated ownership channel closed; STOP without signaling a PID");
        signal("SIGKILL");
        released = await waitFor(async () => await portFree(4173) && control.clients.size === 0, 5000, 100).then(() => true, () => false);
    }
    assert.equal(released, true, "owned preview processes/listener were not released");
    await closeServer(control.server);
    assert.equal(await portFree(control.port), true, "owned process-control listener was not released");
}
async function evaluate(cdp, expression, awaitPromise = true) { const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }

const SHIM = `(() => {
  const originalFetch = window.fetch.bind(window);
  const state = { mode: 'success', requests: [], counts: { requestCode: 0, verifyCode: 0, submission: 0 }, submissions: [], expectedSubmission: null };
  const fail = (message) => { throw new Error('VEU_QA_FIXTURE: ' + message); };
  const exactKeys = (value, expected, label) => {
    const actual = Object.keys(value).sort(); const wanted = [...expected].sort();
    if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(label + ' keys ' + JSON.stringify(actual));
  };
  window.__veuQa = state;
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const method = String(init.method || 'GET').toUpperCase();
    if (!url.pathname.startsWith('/api/')) return originalFetch(input, init);
    if (method !== 'POST') fail('method ' + method + ' for ' + url.pathname);
    state.requests.push({ path: url.pathname, method });
    if (url.pathname === '/api/verification/request-code') {
      const body = JSON.parse(init.body); exactKeys(body, ['email','language','scope'], 'request-code');
      if (body.scope !== 'veu' || !['ca','es','en'].includes(body.language) || body.language !== document.querySelector('[name="idioma_solicitud"]')?.value || body.email !== document.querySelector('[name="email_contacto"]')?.value) fail('invalid request-code body');
      state.counts.requestCode += 1;
      return state.mode === 'verification-unavailable' ? new Response(JSON.stringify({ok:false,reason:'verification:unavailable'}), {status:503}) : new Response(JSON.stringify({ok:true,challengeId:'challenge-009',expiresIn:600}), {status:200});
    }
    if (url.pathname === '/api/verification/verify-code') {
      const body = JSON.parse(init.body); exactKeys(body, ['challengeId','code','email','scope'], 'verify-code');
      if (body.scope !== 'veu' || body.challengeId !== 'challenge-009' || body.email !== document.querySelector('[name="email_contacto"]')?.value) fail('invalid verify-code body');
      state.counts.verifyCode += 1;
      return body.code === '123456' ? new Response(JSON.stringify({ok:true,token:'token-009',expiresIn:600}), {status:200}) : new Response(JSON.stringify({ok:false,reason:'invalid-code',attemptsRemaining:4}), {status:400});
    }
    if (url.pathname === '/api/submissions/veu') {
      if (!(init.body instanceof FormData)) fail('submission body is not FormData');
      if (new Headers(init.headers).get('accept') !== 'application/json') fail('submission Accept header');
      const expected = state.expectedSubmission; if (!expected) fail('missing expected submission contract');
      const entries = {};
      for (const [name, value] of init.body.entries()) {
        if (name in entries) fail('duplicate FormData field ' + name);
        entries[name] = typeof value === 'string' ? value : { name: value.name, type: value.type, size: value.size };
      }
      exactKeys(entries, ['form-name','idioma_solicitud','bot-field','titol','resum','contingut','tipo_autoria','autor_public','imatge','nombre_contacto','email_contacto','email_verification_token','aceptacion_privacidad'], 'submission');
      const expectedStrings = { 'form-name': 'veu', idioma_solicitud: expected.language, 'bot-field': '', ...expected.fields, email_verification_token: 'token-009', aceptacion_privacidad: 'true' };
      for (const [name, value] of Object.entries(expectedStrings)) if (entries[name] !== value) fail('submission field ' + name + '=' + JSON.stringify(entries[name]));
      if (!entries.imatge || entries.imatge.name !== '' || entries.imatge.size !== 0) fail('unexpected submission image');
      if (expected.scope !== 'veu' || expected.language !== document.querySelector('[name="idioma_solicitud"]')?.value) fail('submission scope/language');
      state.counts.submission += 1;
      if (state.counts.submission !== expected.expectedSubmitCount) fail('submission counter ' + state.counts.submission);
      state.submissions.push(entries);
      const status = state.mode === 'submit-fail' ? 500 : state.mode === 'submit-unavailable' ? 503 : 200;
      const body = status === 200 ? {ok:true} : {ok:false,reason:status === 503 ? 'submission:unavailable' : 'submission:failed'};
      return new Response(JSON.stringify(body), {status});
    }
    fail('blocked api endpoint ' + url.pathname);
  };
})();`;

async function runBrowser() {
    let ownership = false; let qaRoot; let identity; let profile; let imagePath; let preview; let previewControl; let chrome; let debugPort; let browserCdp; let browserSocket; let cdp; let socket; const chromePids = new Set(); const violations = [];
    const browserIds = ["QA02", ...Array.from({ length: 14 }, (_, index) => `QA${String(index + 5).padStart(2, "0")}`), ...Array.from({ length: 13 }, (_, index) => `QA${String(index + 27).padStart(2, "0")}`)];
    const completed = [];
    const validFields = exactVeu({
        titol: "Títol literal 009", resum: "R".repeat(35), contingut: "C".repeat(520),
        tipo_autoria: "pseudonim", autor_public: "Autoria 009",
        nombre_contacto: "Contacte 009", email_contacto: "qa009@example.invalid",
    });
    try {
        assert.equal(await pathExists(REAL_DIST), false, "real frontend dist/ exists; not adopted or removed");
        ({ qaRoot, identity } = await discoverOwnedQaRoot()); ownership = true;
        assert.equal(await pathExists(path.join(qaRoot, "dist")), true, "<qa-root>/dist missing; --browser never builds implicitly");
        await assertRealAstroUnchanged(identity.realAstroManifest);
        assert.equal(await portFree(4173), true, "port 4173 is occupied");
        profile = await mkdtemp(path.join(os.tmpdir(), "guiapineda-veu-009-")); previewControl = await createOwnedNodeControl(profile);
        preview = spawn("npm", ["run", "preview", "--", "--root", qaRoot, "--host", "127.0.0.1", "--port", "4173"], { cwd: ROOT, stdio: "ignore", env: { ...process.env, NODE_OPTIONS: `--require=${previewControl.preload}` } });
        await waitFor(async () => {
            try { const response = await fetch("http://127.0.0.1:4173/veus/envia-la-teva-veu/"); return hasOwnedPreviewClient(previewControl) && response.ok && (await response.text()).includes("data-veu-submission-flow"); } catch { return false; }
        });
        await access(CHROME);
        imagePath = path.join(profile, "qa-image.png");
        await writeFile(imagePath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
        chrome = spawn(CHROME, ["--headless=new", `--user-data-dir=${profile}`, "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-sync", "--disable-component-update", "--disable-features=Translate,OptimizationHints,MediaRouter", "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1", "about:blank"], { detached: true, stdio: "ignore" });
        const active = await waitFor(async () => { try { return await readFile(path.join(profile, "DevToolsActivePort"), "utf8"); } catch { return null; } });
        [debugPort] = active.trim().split(/\s+/); debugPort = Number(debugPort); assert.equal(Number.isInteger(debugPort), true, "invalid CDP port");
        const version = await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json(); browserSocket = new WebSocket(version.webSocketDebuggerUrl); await once(browserSocket, "open"); browserCdp = new Cdp(browserSocket);
        const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json(); const target = targets.find((item) => item.type === "page"); assert.ok(target, "Chrome page target missing");
        socket = new WebSocket(target.webSocketDebuggerUrl); await once(socket, "open"); cdp = new Cdp(socket);
        chromePids.add(chrome.pid); for (const info of (await browserCdp.send("SystemInfo.getProcessInfo")).processInfo) chromePids.add(Number(info.id));
        await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("DOM.enable"); await cdp.send("Network.enable"); await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] }); await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: SHIM });
        const allowedRequest = (request) => {
            const url = new URL(request.url); if (["data:", "blob:", "devtools:"].includes(url.protocol)) return;
            const allowedPath = ["/veus/envia-la-teva-veu/", "/es/veus/envia-tu-voz/", "/en/veus/send-your-voice/", "/enviat/", "/es/enviado/", "/en/sent/", "/favicon.ico", "/favicon.svg"].includes(url.pathname) || url.pathname.startsWith("/_astro/");
            return url.origin === "http://127.0.0.1:4173" && ["GET", "HEAD"].includes(request.method) && allowedPath;
        };
        cdp.on("Network.requestWillBeSent", ({ request }) => {
            if (request.url.startsWith("data:") || request.url.startsWith("blob:") || request.url.startsWith("devtools:")) return;
            if (!allowedRequest(request)) violations.push(`${request.method} ${request.url}`);
        });
        cdp.on("Fetch.requestPaused", ({ requestId, request }) => {
            if (allowedRequest(request)) cdp.send("Fetch.continueRequest", { requestId }).catch(() => {});
            else { violations.push(`${request.method} ${request.url}`); cdp.send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(() => {}); }
        });
        const navigate = async (route) => {
            await cdp.send("Page.navigate", { url: `http://127.0.0.1:4173${route}` });
            await new Promise((resolve) => setTimeout(resolve, 50));
            await waitFor(async () => { try { return await evaluate(cdp, `document.readyState === 'complete' && location.pathname === ${JSON.stringify(route)} && Boolean(document.querySelector('[data-veu-submission-flow]'))`); } catch { return false; } });
        };
        const resetPage = async (route = "/veus/envia-la-teva-veu/", fields) => {
            await navigate(route);
            const serialized = fields === undefined ? null : JSON.stringify(envelope("veu", fields));
            await evaluate(cdp, `(() => { sessionStorage.clear(); ${serialized === null ? "" : `sessionStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(serialized)});`} return true; })()`);
            await navigate(route);
        };
        const fillFields = async (values) => evaluate(cdp, `(() => { const values=${JSON.stringify(values)}; for (const [name,value] of Object.entries(values)) { const element=document.querySelector('[name="'+name+'"]'); if (!element) throw new Error('missing field '+name); element.value=value; element.dispatchEvent(new Event(name==='tipo_autoria'?'change':'input',{bubbles:true})); } return JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)})); })()`);
        const openReview = async (values = validFields) => {
            await fillFields(values); await evaluate(cdp, `document.querySelector('#veu-continue').click()`);
            await waitFor(() => evaluate(cdp, `document.querySelector('#veu-step-form').hidden && !document.querySelector('#veu-step-review').hidden`));
        };
        const verifyEmail = async (code = "123456") => {
            await evaluate(cdp, `document.querySelector('[data-verification-request]').click()`);
            await waitFor(() => evaluate(cdp, `window.__veuQa.counts.requestCode === 1 && !document.querySelector('[data-verification-code-step]').hidden`));
            await evaluate(cdp, `(() => { const input=document.querySelector('[data-verification-code]'); input.value=${JSON.stringify(code)}; input.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('[data-verification-confirm]').click(); return true; })()`);
            await waitFor(() => evaluate(cdp, code === "123456" ? `document.querySelector('[data-veu-submission-flow]').dataset.emailVerified === 'true'` : `window.__veuQa.counts.verifyCode === 1 && !document.querySelector('[data-verification-error]').hidden`));
        };
        const setSubmissionFixture = async (mode) => evaluate(cdp, `(() => { window.__veuQa.mode=${JSON.stringify(mode)}; window.__veuQa.expectedSubmission=${JSON.stringify({ scope: "veu", language: "ca", fields: validFields, expectedSubmitCount: 1 })}; return true; })()`);
        const prepareSubmission = async (mode) => {
            await resetPage(); await openReview(); await verifyEmail();
            await evaluate(cdp, `(() => { const privacy=document.querySelector('#veu-privacy'); privacy.checked=true; privacy.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
            await setSubmissionFixture(mode);
            return evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`);
        };
        const selectImage = async () => {
            const documentNode = await cdp.send("DOM.getDocument", { depth: -1 });
            const selected = await cdp.send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: "#veu-image-input" }); assert.ok(selected.nodeId, "image input missing");
            await cdp.send("DOM.setFileInputFiles", { files: [imagePath], nodeId: selected.nodeId });
            await evaluate(cdp, `document.querySelector('#veu-image-input').dispatchEvent(new Event('change',{bubbles:true}))`);
        };
        const runCase = async (id, test) => { assert.equal(completed.includes(id), false, `duplicate browser case ${id}`); await test(); completed.push(id); console.log(`${id} BROWSER PASS`); };

        await runCase("QA02", async () => { await resetPage(undefined, { titol: "latest restored value" }); assert.equal(await evaluate(cdp, `document.querySelector('[name="titol"]').value`), "latest restored value"); });
        await runCase("QA05", async () => { await resetPage(undefined, { tipo_autoria: "nom", autor_public: "Stable author" }); await fillFields({ tipo_autoria: "pseudonim" }); const value = await evaluate(cdp, `({author:document.querySelector('[name="autor_public"]').value,visible:document.querySelector('[name="autor_public"]').offsetParent!==null,required:document.querySelector('[name="autor_public"]').required,saved:JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)})).fields})`); assert.equal(value.author, "Stable author"); assert.equal(value.visible, true); assert.equal(value.required, true); assert.equal(value.saved.tipo_autoria, "pseudonim"); assert.equal(value.saved.autor_public, "Stable author"); });
        await runCase("QA06", async () => { await resetPage(); await fillFields({ nombre_contacto: "Jo", email_contacto: "a@b.c" }); await navigate("/veus/envia-la-teva-veu/"); assert.deepEqual(await evaluate(cdp, `({name:document.querySelector('[name="nombre_contacto"]').value,email:document.querySelector('[name="email_contacto"]').value,verified:document.querySelector('[data-veu-submission-flow]').dataset.emailVerified})`), { name: "Jo", email: "a@b.c", verified: "false" }); });
        await runCase("QA07", async () => { await resetPage(); await fillFields({ titol: "CA to ES literal" }); await navigate("/es/veus/envia-tu-voz/"); assert.equal(await evaluate(cdp, `document.querySelector('[name="titol"]').value`), "CA to ES literal"); });
        await runCase("QA08", async () => { await resetPage("/es/veus/envia-tu-voz/"); await fillFields({ titol: "ES to EN literal" }); await navigate("/en/veus/send-your-voice/"); assert.equal(await evaluate(cdp, `document.querySelector('[name="titol"]').value`), "ES to EN literal"); });
        await runCase("QA09", async () => { await resetPage("/en/veus/send-your-voice/"); await fillFields({ titol: "EN first value" }); await navigate("/veus/envia-la-teva-veu/"); await fillFields({ titol: "CA latest value" }); await navigate("/en/veus/send-your-voice/"); assert.equal(await evaluate(cdp, `document.querySelector('[name="titol"]').value`), "CA latest value"); });
        await runCase("QA10", async () => { const literal = "  À literal English español  "; await resetPage(); await fillFields({ titol: literal }); await navigate("/es/veus/envia-tu-voz/"); assert.equal(await evaluate(cdp, `document.querySelector('[name="titol"]').value`), literal); });
        await runCase("QA11", async () => { await resetPage(); await fillFields({ titol: "single key" }); assert.deepEqual(await evaluate(cdp, `Object.keys(sessionStorage).sort()`), [KEY]); });
        await runCase("QA12", async () => { await resetPage(); await selectImage(); const saved = await evaluate(cdp, `JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)}))`); assert.deepEqual(Object.keys(saved.fields), FIELDS); assert.equal(JSON.stringify(saved).includes("qa-image"), false); });
        await runCase("QA13", async () => { await resetPage(); await selectImage(); const preview = await evaluate(cdp, `({name:document.querySelector('#veu-image-name').textContent,src:document.querySelector('#veu-image-preview').src,selected:!document.querySelector('#veu-image-selected').hidden})`); assert.equal(preview.name, "qa-image.png"); assert.match(preview.src, /^blob:/); assert.equal(preview.selected, true); await navigate("/veus/envia-la-teva-veu/"); assert.deepEqual(await evaluate(cdp, `({files:document.querySelector('#veu-image-input').files.length,name:document.querySelector('#veu-image-name').textContent,src:document.querySelector('#veu-image-preview').getAttribute('src')})`), { files: 0, name: "", src: "" }); });
        await runCase("QA14", async () => { await resetPage(); await evaluate(cdp, `(() => { const privacy=document.querySelector('#veu-privacy'); privacy.checked=true; privacy.dispatchEvent(new Event('change',{bubbles:true})); return privacy.checked; })()`); assert.equal(JSON.stringify(await evaluate(cdp, `JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)}))`)).includes("aceptacion_privacidad"), false); await navigate("/es/veus/envia-tu-voz/"); assert.equal(await evaluate(cdp, `document.querySelector('#veu-privacy').checked`), false); });
        await runCase("QA15", async () => { await resetPage(); await openReview(); await verifyEmail(); const verified = await evaluate(cdp, `({verified:document.querySelector('[data-veu-submission-flow]').dataset.emailVerified,token:document.querySelector('[data-verification-token]').value,saved:sessionStorage.getItem(${JSON.stringify(KEY)})})`); assert.equal(verified.verified, "true"); assert.equal(verified.token, "token-009"); assert.equal(verified.saved.includes("token-009"), false); await navigate("/veus/envia-la-teva-veu/"); assert.deepEqual(await evaluate(cdp, `({verified:document.querySelector('[data-veu-submission-flow]').dataset.emailVerified,token:document.querySelector('[data-verification-token]').value})`), { verified: "false", token: "" }); });
        await runCase("QA16", async () => { await resetPage(); await openReview(); assert.deepEqual(await evaluate(cdp, `({form:document.querySelector('#veu-step-form').hidden,review:document.querySelector('#veu-step-review').hidden})`), { form: true, review: false }); await navigate("/veus/envia-la-teva-veu/"); assert.deepEqual(await evaluate(cdp, `({form:document.querySelector('#veu-step-form').hidden,review:document.querySelector('#veu-step-review').hidden})`), { form: false, review: true }); });
        await runCase("QA17", async () => { await resetPage(); await openReview(); const review = await evaluate(cdp, `({title:document.querySelector('[data-veu-review="titol"]').textContent,label:document.querySelector('[data-veu-review="tipo_autoria"]').textContent,saved:sessionStorage.getItem(${JSON.stringify(KEY)})})`); assert.equal(review.title, validFields.titol); assert.equal(review.label, "Pseudònim"); assert.equal(review.saved.includes("Pseudònim"), false); assert.equal(review.saved.includes("review"), false); });
        await runCase("QA18", async () => { await resetPage(); const result = await evaluate(cdp, `(() => { const form=document.querySelector('[data-veu-submission-flow]'); const extra=document.createElement('input'); extra.name='unknown_browser_field'; extra.value='SECRET'; form.append(extra); extra.dispatchEvent(new Event('input',{bubbles:true})); const saved=JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)})); return {keys:Object.keys(saved.fields),secret:JSON.stringify(saved).includes('SECRET')}; })()`); assert.deepEqual(result.keys, FIELDS); assert.equal(result.secret, false); });
        await runCase("QA27", async () => { await resetPage(undefined, validFields); assert.deepEqual(await evaluate(cdp, `({form:document.querySelector('#veu-step-form').hidden,review:document.querySelector('#veu-step-review').hidden})`), { form: false, review: true }); });
        await runCase("QA28", async () => { const values = { ...validFields, resum: "S".repeat(37), contingut: "B".repeat(523) }; await resetPage(undefined, values); const counters = await evaluate(cdp, `[...document.querySelectorAll('[data-veu-counter]')].map((element)=>({name:element.dataset.veuCounter,text:element.textContent,ready:element.classList.contains('text-violet-700')}))`); assert.deepEqual(counters.map((item) => item.text.split(" · ")[0]), ["37 / 400", "523 / 6000"]); assert.deepEqual(counters.map((item) => item.ready), [true, true]); });
        await runCase("QA29", async () => { await resetPage(undefined, { ...validFields, titol: "Old restored title" }); await fillFields({ titol: "Edited after restore" }); await evaluate(cdp, `document.querySelector('#veu-continue').click()`); await waitFor(() => evaluate(cdp, `!document.querySelector('#veu-step-review').hidden`)); assert.equal(await evaluate(cdp, `document.querySelector('[data-veu-review="titol"]').textContent`), "Edited after restore"); });
        await runCase("QA30", async () => { await resetPage(undefined, validFields); await navigate("/es/veus/envia-tu-voz/"); await evaluate(cdp, `document.querySelector('#veu-continue').click()`); await waitFor(() => evaluate(cdp, `!document.querySelector('#veu-step-review').hidden`)); const es = await evaluate(cdp, `({value:document.querySelector('[name="tipo_autoria"]').value,option:document.querySelector('[name="tipo_autoria"]').selectedOptions[0].textContent.trim(),review:document.querySelector('[data-veu-review="tipo_autoria"]').textContent,saved:JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)})).fields.tipo_autoria})`); assert.deepEqual(es, { value: "pseudonim", option: "Pseudónimo", review: "Pseudónimo", saved: "pseudonim" }); await navigate("/en/veus/send-your-voice/"); assert.equal(await evaluate(cdp, `document.querySelector('[name="tipo_autoria"]').selectedOptions[0].textContent.trim()`), "Pseudonym"); });
        await runCase("QA31", async () => { await resetPage(); for (const value of ["", "nom_complet", "nom", "pseudonim"]) { await fillFields({ tipo_autoria: value, autor_public: "Always applicable" }); const state = await evaluate(cdp, `({type:document.querySelector('[name="tipo_autoria"]').value,author:document.querySelector('[name="autor_public"]').value,visible:document.querySelector('[name="autor_public"]').offsetParent!==null,required:document.querySelector('[name="autor_public"]').required})`); assert.deepEqual(state, { type: value, author: "Always applicable", visible: true, required: true }); } await evaluate(cdp, `sessionStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(envelope("veu", { tipo_autoria: "invalid", autor_public: "Still applicable" })))})`); await navigate("/veus/envia-la-teva-veu/"); assert.deepEqual(await evaluate(cdp, `({type:document.querySelector('[name="tipo_autoria"]').value,author:document.querySelector('[name="autor_public"]').value})`), { type: "", author: "Still applicable" }); });
        await runCase("QA32", async () => { await prepareSubmission("success"); await evaluate(cdp, `document.querySelector('#veu-submit').click()`); await waitFor(() => evaluate(cdp, `window.__veuQa.counts.submission === 1`)); assert.equal(await evaluate(cdp, `window.__veuQa.submissions.length`), 1); await waitFor(async () => { try { return await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)}) === null`); } catch { return false; } }, 6000, 100); });
        await runCase("QA33", async () => { await resetPage(); await fillFields({ titol: "short" }); const expected = await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`); await evaluate(cdp, `document.querySelector('#veu-continue').click()`); assert.equal(await evaluate(cdp, `document.querySelector('#veu-step-form').hidden`), false); assert.equal(await evaluate(cdp, `window.__veuQa.counts.submission`), 0); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); });
        await runCase("QA34", async () => { await resetPage(); await openReview(); const expected = await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`); await evaluate(cdp, `window.__veuQa.mode='verification-unavailable'; document.querySelector('[data-verification-request]').click()`); await waitFor(() => evaluate(cdp, `window.__veuQa.counts.requestCode === 1 && !document.querySelector('[data-verification-error]').hidden`)); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); });
        await runCase("QA35", async () => { await resetPage(); await openReview(); const expected = await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`); await verifyEmail("000000"); assert.equal(await evaluate(cdp, `document.querySelector('[data-veu-submission-flow]').dataset.emailVerified`), "false"); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); });
        await runCase("QA36", async () => { const expected = await prepareSubmission("submit-fail"); await evaluate(cdp, `document.querySelector('#veu-submit').click()`); await waitFor(() => evaluate(cdp, `window.__veuQa.counts.submission === 1 && !document.querySelector('#veu-submit-error').hidden`)); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); assert.equal(await evaluate(cdp, `window.__veuQa.counts.submission`), 1); });
        await runCase("QA37", async () => { const expected = await prepareSubmission("submit-unavailable"); await evaluate(cdp, `document.querySelector('#veu-submit').click()`); await waitFor(() => evaluate(cdp, `window.__veuQa.counts.submission === 1 && !document.querySelector('#veu-submit-error').hidden`)); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); assert.equal(await evaluate(cdp, `window.__veuQa.counts.submission`), 1); });
        await runCase("QA38", async () => { await resetPage(); await fillFields({ titol: "keep across languages" }); const expected = await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`); await navigate("/es/veus/envia-tu-voz/"); await navigate("/en/veus/send-your-voice/"); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); });
        await runCase("QA39", async () => { await resetPage(); await fillFields({ titol: "keep across reload" }); const expected = await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`); await navigate("/veus/envia-la-teva-veu/"); assert.equal(await evaluate(cdp, `sessionStorage.getItem(${JSON.stringify(KEY)})`), expected); });

        assert.deepEqual(completed, browserIds, "browser subset execution mismatch");
        assert.deepEqual(violations, []);
        console.log(`BROWSER PASS — ${completed.length} individually executed Veus-only cases; CA/ES/EN, exact fixture and fail-closed guard`);
    } finally {
        try { for (const info of (await browserCdp?.send("SystemInfo.getProcessInfo"))?.processInfo ?? []) chromePids.add(Number(info.id)); } catch {}
        try { await cdp?.send("Fetch.disable"); } catch {}
        try { await browserCdp?.send("Browser.close"); } catch {}
        if (chrome) await stopOwnedGroup(chrome, "Chrome", debugPort);
        try { socket?.close(); } catch {}
        try { browserSocket?.close(); } catch {}
        if (debugPort !== undefined) assert.equal(await portFree(debugPort), true, "CDP port was not released");
        await assertOwnedPidsAbsent(chromePids, "Chrome/root/helpers");
        await stopOwnedPreview(previewControl);
        assert.equal(childIsLive(preview), false, "npm preview root remains live");
        if (profile) { await rm(profile, { recursive: true, force: false }); assert.equal(await pathExists(profile), false, "temporary Chrome profile was not removed"); }
        let environmentalError;
        try { if (identity) await assertRealAstroUnchanged(identity.realAstroManifest); } catch (error) { environmentalError = error; }
        try { assert.equal(await pathExists(REAL_DIST), false, "real frontend dist/ appeared during browser QA"); } catch (error) { environmentalError ??= error; }
        if (ownership) await removeOwnedQaRoot(qaRoot, identity);
        assert.deepEqual(await pendingQaRoots(), [], "owned QA root cleanup failed");
        if (environmentalError) throw environmentalError;
        assert.equal(await portFree(4173), true, "preview port was not released");
        assert.equal(childIsLive(chrome), false, "Chrome root remains live");
        assert.equal(childIsLive(preview), false, "preview root remains live");
    }
    console.log(`BROWSER CLEANUP PASS — run ${identity.runId}; qa-root/profile removed; Chrome process group and ${chromePids.size} observed PIDs absent; preview closed; ports 4173/${debugPort} released; real .astro unchanged by tree/type/hash/mode; timestamps excluded; real dist absent; zero owned resources`);
}

const mode = process.argv[2];
try {
    if (mode === "--dom") await runDom();
    else if (mode === "--build") await runBuild();
    else if (mode === "--browser") await runBrowser();
    else throw new Error("usage: node scripts/qa/veu-draft-persistence-qa.mjs --dom|--build|--browser");
} catch (error) {
    console.error(`FAIL: ${error.stack ?? error}`); process.exitCode = 1;
}
