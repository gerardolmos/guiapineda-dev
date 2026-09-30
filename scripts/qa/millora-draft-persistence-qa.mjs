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
const QA_ROOT_PREFIX = ".veu-011-qa-";
const QA_ROOT_TEMPLATE = path.join(ROOT, QA_ROOT_PREFIX);
const QA_MARKER_NAME = ".feature-011-owner.json";
const QA_COPY_ENTRIES = Object.freeze(["src", "public", "astro.config.mjs", "tsconfig.json", "package.json", "package-lock.json"]);
const QA_CONTRACT = "feature-011-isolated-qa-root-v1";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const KEY = "guiapineda:submission-draft:v1:millora";
const FIELDS = Object.freeze(["categoria", "zona", "millora-author-type", "millora-alias", "titol", "resum", "contingut", "email_contacto"]);
const LIMITS = Object.freeze({ "millora-alias": 100, titol: 120, resum: 280, contingut: 6000, email_contacto: 180 });
const OWNER = Object.freeze({ feature: "011-millora-draft-persistence", contract: QA_CONTRACT, version: 1 });
const PRODUCT = Object.freeze({
    helper: path.join(ROOT, "src/lib/submissionDraft.ts"),
    flow: path.join(ROOT, "src/lib/milloraSubmissionFlow.ts"),
    transport: path.join(ROOT, "src/lib/netlifySubmission.ts"),
});
const DOM_IDS = Object.freeze(["QA01","QA03","QA04","QA10","QA16","QA24","QA25","QA26","QA27","QA28","QA29","QA30","QA42","QA43","QA44","QA45"]);
const BROWSER_IDS = Object.freeze(["QA02","QA05","QA06","QA07","QA08","QA09","QA11","QA12","QA13","QA14","QA15","QA17","QA18","QA19","QA20","QA21","QA22","QA23","QA31","QA32","QA33","QA34","QA35","QA36","QA37","QA38","QA39","QA40","QA41"]);

class MemoryStorage {
    #values = new Map();
    failGet = false; failSet = false; failRemove = false;
    getItem(key) { if (this.failGet) throw new DOMException("blocked", "SecurityError"); return this.#values.has(key) ? this.#values.get(key) : null; }
    setItem(key, value) { if (this.failSet) throw new DOMException("full", "QuotaExceededError"); this.#values.set(String(key), String(value)); }
    removeItem(key) { if (this.failRemove) throw new DOMException("blocked", "SecurityError"); this.#values.delete(key); }
    keys() { return [...this.#values.keys()].sort(); }
    snapshot() { return Object.fromEntries([...this.#values.entries()].sort()); }
}
class FakeControl { constructor(name, value = "") { this.name = name; this.value = value; this.form = null; } }
class FakeInput extends FakeControl { constructor(name, type = "text", value = "") { super(name, value); this.type = type; this.checked = false; } }
class FakeTextarea extends FakeControl {}
class FakeSelect extends FakeControl { constructor(name, values, value = "") { super(name, value); this.options = values.map((item) => ({ value: item, textContent: item })); } }
class FakeRadioNodeList extends Array {}
class FakeForm extends EventTarget {
    constructor(controls) {
        super(); this.controls = controls; this.listenerCounts = new Map();
        for (const control of controls) {
            if (control instanceof FakeRadioNodeList) for (const radio of control) radio.form = this;
            else control.form = this;
        }
        this.elements = { namedItem: (name) => controls.find((item) => item.name === name || (item instanceof FakeRadioNodeList && item[0]?.name === name)) ?? null };
    }
    addEventListener(type, listener, options) {
        this.listenerCounts.set(type, (this.listenerCounts.get(type) ?? 0) + 1);
        return super.addEventListener(type, listener, options);
    }
}
globalThis.HTMLInputElement = FakeInput;
globalThis.HTMLTextAreaElement = FakeTextarea;
globalThis.HTMLSelectElement = FakeSelect;
globalThis.HTMLFormElement = FakeForm;
globalThis.RadioNodeList = FakeRadioNodeList;

function radios(name, values) {
    const group = new FakeRadioNodeList(...values.map((value) => { const item = new FakeInput(name, "radio"); item.value = value; return item; }));
    return group;
}
function makeMilloraForm() {
    return new FakeForm([
        radios("categoria", ["incidencies", "civisme", "propostes"]),
        new FakeSelect("zona", ["", "centre", "poblenou", "altres"]),
        radios("millora-author-type", ["resident", "visitor", "alias"]),
        new FakeInput("millora-alias"),
        new FakeInput("titol"),
        new FakeTextarea("resum"),
        new FakeTextarea("contingut"),
        new FakeInput("email_contacto", "email"),
        new FakeInput("autor_public", "hidden"),
        new FakeInput("imatge", "file"),
        new FakeInput("aceptacion_privacidad", "checkbox"),
        new FakeInput("email_verification_token", "hidden"),
        new FakeInput("idioma_solicitud", "hidden"),
        new FakeInput("unknown_field"),
    ]);
}
function makeClosedForm(scope) {
    if (scope === "agenda") return new FakeForm([new FakeInput("titol"), new FakeTextarea("resum")]);
    if (scope === "comunicat") return new FakeForm([radios("tipus_remitent", ["entitat","persona"]), new FakeInput("autor"), new FakeTextarea("contingut")]);
    return new FakeForm([new FakeInput("titol"), new FakeTextarea("resum"), new FakeTextarea("contingut"), new FakeSelect("tipo_autoria", ["","nom_complet","nom","pseudonim"]), new FakeInput("autor_public"), new FakeInput("nombre_contacto"), new FakeInput("email_contacto","email")]);
}
function field(form, name) { return form.elements.namedItem(name); }
function selectRadio(group, value) { for (const item of group) item.checked = item.value === value; }
function readValue(control) { return control instanceof FakeRadioNodeList ? (control.find((item) => item.checked)?.value ?? "") : control.value; }
function setValue(form, name, value) { const control=field(form,name); if (control instanceof FakeRadioNodeList) selectRadio(control,value); else control.value=value; }
function envelope(scope, fields) { return { version: 1, scope, fields }; }
function dispatch(form, type) { form.dispatchEvent(new Event(type)); }
function exactMillora(values = {}) { return Object.fromEntries(FIELDS.map((name) => [name, values[name] ?? ""])); }
function restoreRules() {
    return {
        "millora-alias": (value) => value.length <= 100,
        titol: (value) => value.length <= 120,
        resum: (value) => value.length <= 280,
        contingut: (value) => value.length <= 6000,
        email_contacto: (value) => value.length <= 180,
    };
}
async function helperModule() { return import(pathToFileURL(PRODUCT.helper).href + "?qa=" + randomUUID()); }
async function integrationPresent() {
    const [helper, flow] = await Promise.all([readFile(PRODUCT.helper,"utf8"), readFile(PRODUCT.flow,"utf8")]);
    return helper.includes('"millora"') && flow.includes('from "./submissionDraft"') && flow.includes('initSubmissionDraft(') && flow.includes('"millora"') && flow.includes("clearDraft()");
}
async function exerciseClosedScope(scope) {
    const storage = new MemoryStorage(); globalThis.sessionStorage = storage;
    const { initSubmissionDraft } = await helperModule();
    const names = scope === "agenda" ? ["titol","resum"] : scope === "comunicat" ? ["tipus_remitent","autor","contingut"] : ["titol","resum","contingut","tipo_autoria","autor_public","nombre_contacto","email_contacto"];
    const key=`guiapineda:submission-draft:v1:${scope}`;
    const invalidField=scope === "agenda" ? "titol" : scope === "comunicat" ? "autor" : "email_contacto";
    const predicates={ [invalidField]: (value)=>value.length <= 12 };
    const form=makeClosedForm(scope); const clear=initSubmissionDraft(form,scope,names,predicates);
    if (scope === "agenda") { setValue(form,"titol","Agenda"); setValue(form,"resum","Summary"); }
    else if (scope === "comunicat") { setValue(form,"tipus_remitent","entitat"); setValue(form,"autor","Entity"); setValue(form,"contingut","Body"); }
    else { setValue(form,"titol","Veu"); setValue(form,"resum","Summary"); setValue(form,"contingut","Body"); setValue(form,"tipo_autoria","nom"); setValue(form,"autor_public","Author"); setValue(form,"nombre_contacto","Private"); setValue(form,"email_contacto","a@b.test"); }
    form.controls.push(new FakeInput("not-allowed")); field(form,"not-allowed").value="SECRET";
    dispatch(form,"input"); assert.deepEqual(storage.keys(), [key]);
    const saved=JSON.parse(storage.getItem(key));
    assert.equal(saved.scope,scope); assert.deepEqual(Object.keys(saved.fields),names); assert.equal(JSON.stringify(saved).includes("SECRET"),false);
    const restored=makeClosedForm(scope); initSubmissionDraft(restored,scope,names,predicates); for(const name of names) assert.equal(readValue(field(restored,name)),readValue(field(form,name)));
    clear(); assert.equal(storage.getItem(key),null);
    storage.setItem(key,"{"); assert.doesNotThrow(()=>initSubmissionDraft(makeClosedForm(scope),scope,names,predicates)); assert.equal(storage.getItem(key),null);
    const validValue=scope === "agenda" ? "Summary" : scope === "comunicat" ? "Body" : "Veu";
    const validField=scope === "agenda" ? "resum" : scope === "comunicat" ? "contingut" : "titol";
    storage.setItem(key,JSON.stringify(envelope(scope,{[invalidField]:"x".repeat(13),[validField]:validValue,"not-allowed":"SECRET"})));
    const invalidRestored=makeClosedForm(scope); initSubmissionDraft(invalidRestored,scope,names,predicates);
    assert.equal(readValue(field(invalidRestored,invalidField)),""); assert.equal(readValue(field(invalidRestored,validField)),validValue);
    assert.equal(JSON.stringify(storage.snapshot()).includes("guiapineda:submission-draft:v1:millora"),false);
}
async function runDom() {
    const { initSubmissionDraft } = await helperModule();
    const cases=new Map(); const completed=[]; const failures=[]; let finalSnapshot={};
    const add=(id,test)=>{ assert.equal(DOM_IDS.includes(id),true,"unexpected DOM ID "+id); assert.equal(cases.has(id),false,"duplicate DOM case "+id); cases.set(id,test); };
    const useStorage=()=>{ const storage=new MemoryStorage(); globalThis.sessionStorage=storage; return storage; };
    add("QA01", async()=>{ assert.equal(await integrationPresent(),true,"Millora integration absent"); const storage=useStorage(), form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); const values=exactMillora({categoria:"incidencies",zona:"centre","millora-author-type":"alias","millora-alias":"Àlies",titol:"Títol literal",resum:"Resum literal",contingut:"Contingut literal",email_contacto:"qa@example.invalid"}); for(const [n,v] of Object.entries(values)) setValue(form,n,v); dispatch(form,"input"); assert.deepEqual(JSON.parse(storage.getItem(KEY)),envelope("millora",values)); assert.equal(form.listenerCounts.get("input"),1); assert.equal(form.listenerCounts.get("change"),1); });
    add("QA03",()=>{ const storage=useStorage(), form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); setValue(form,"titol","first"); dispatch(form,"input"); setValue(form,"titol",""); dispatch(form,"input"); const restored=makeMilloraForm(); initSubmissionDraft(restored,"millora",FIELDS,restoreRules()); assert.equal(field(restored,"titol").value,""); assert.equal(JSON.parse(storage.getItem(KEY)).fields.titol,""); });
    add("QA04",()=>{ for(const value of ["","resident","visitor","alias"]){ const storage=useStorage(); storage.setItem(KEY,JSON.stringify(envelope("millora",{"millora-author-type":value}))); const form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); assert.equal(readValue(field(form,"millora-author-type")),value); } });
    add("QA10",()=>{ for(const mode of ["failGet","failSet","failRemove"]){ const storage=useStorage(); storage[mode]=true; const form=makeMilloraForm(); let clear; assert.doesNotThrow(()=>{clear=initSubmissionDraft(form,"millora",FIELDS,restoreRules());}); assert.doesNotThrow(()=>dispatch(form,"input")); assert.doesNotThrow(()=>clear()); } });
    add("QA16",()=>{ const storage=useStorage(), form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); setValue(form,"titol","one-key"); dispatch(form,"input"); assert.deepEqual(storage.keys(),[KEY]); });
    add("QA24",()=>{ const storage=useStorage(), form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); field(form,"unknown_field").value="SECRET"; dispatch(form,"input"); const saved=JSON.parse(storage.getItem(KEY)); assert.deepEqual(Object.keys(saved.fields),FIELDS); assert.equal(JSON.stringify(saved).includes("SECRET"),false); });
    add("QA25",()=>{ const storage=useStorage(); storage.setItem(KEY,"{"); assert.doesNotThrow(()=>initSubmissionDraft(makeMilloraForm(),"millora",FIELDS,restoreRules())); assert.equal(storage.getItem(KEY),null); });
    add("QA26",()=>{ for(const raw of ["null","[]",JSON.stringify({version:1,scope:"millora",fields:[]})]){ const storage=useStorage(); storage.setItem(KEY,raw); initSubmissionDraft(makeMilloraForm(),"millora",FIELDS,restoreRules()); assert.equal(storage.getItem(KEY),null); } });
    add("QA27",()=>{ const storage=useStorage(); storage.setItem(KEY,JSON.stringify({version:2,scope:"millora",fields:{titol:"bad"}})); const form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); assert.equal(storage.getItem(KEY),null); assert.equal(field(form,"titol").value,""); });
    add("QA28",()=>{ const storage=useStorage(); storage.setItem(KEY,JSON.stringify(envelope("veu",{titol:"foreign"}))); storage.setItem("guiapineda:submission-draft:v1:veu","V"); const form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); assert.equal(field(form,"titol").value,""); assert.equal(storage.getItem("guiapineda:submission-draft:v1:veu"),"V"); });
    add("QA29",()=>{ const storage=useStorage(); const raw=JSON.stringify(envelope("millora",{titol:"Partial",email_contacto:"partial@"})); storage.setItem(KEY,raw); const form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); assert.equal(field(form,"titol").value,"Partial"); assert.equal(field(form,"email_contacto").value,"partial@"); assert.equal(storage.getItem(KEY),raw,"restore wrote storage"); });
    add("QA30",()=>{ const storage=useStorage(); storage.setItem(KEY,JSON.stringify(envelope("millora",{categoria:"evil",zona:"evil","millora-author-type":"evil","millora-alias":"x".repeat(101),titol:42,resum:"valid",contingut:"x".repeat(6001),email_contacto:"ok@",extra:"SECRET"}))); const form=makeMilloraForm(); initSubmissionDraft(form,"millora",FIELDS,restoreRules()); assert.equal(readValue(field(form,"categoria")),""); assert.equal(field(form,"zona").value,""); assert.equal(readValue(field(form,"millora-author-type")),""); assert.equal(field(form,"millora-alias").value,""); assert.equal(field(form,"titol").value,""); assert.equal(field(form,"resum").value,"valid"); assert.equal(field(form,"contingut").value,""); assert.equal(field(form,"email_contacto").value,"ok@"); });
    add("QA42",()=>exerciseClosedScope("agenda"));
    add("QA43",()=>exerciseClosedScope("comunicat"));
    add("QA44",()=>exerciseClosedScope("veu"));
    add("QA45",()=>{ const storage=useStorage(); for(const scope of ["agenda","comunicat","veu"]) storage.setItem("guiapineda:submission-draft:v1:"+scope,scope); const form=makeMilloraForm(); const clear=initSubmissionDraft(form,"millora",FIELDS,restoreRules()); setValue(form,"titol","M"); dispatch(form,"input"); assert.deepEqual(storage.keys(),["guiapineda:submission-draft:v1:agenda","guiapineda:submission-draft:v1:comunicat",KEY,"guiapineda:submission-draft:v1:veu"]); clear(); assert.deepEqual(storage.snapshot(),{"guiapineda:submission-draft:v1:agenda":"agenda","guiapineda:submission-draft:v1:comunicat":"comunicat","guiapineda:submission-draft:v1:veu":"veu"}); finalSnapshot=storage.snapshot(); });
    assert.deepEqual([...cases.keys()],DOM_IDS);
    for(const id of DOM_IDS){ try{ await cases.get(id)(); completed.push(id); console.log(id+" DOM PASS"); }catch(error){ completed.push(id); failures.push(id+": "+error.message); console.log(id+" DOM EXPECTED-FAIL "+error.message); } }
    assert.deepEqual(completed,DOM_IDS,"DOM execution inventory mismatch");
    console.log("DOM_EXECUTED="+completed.join(","));
    console.log("FINAL_STORAGE_SNAPSHOT="+JSON.stringify(finalSnapshot));
    if(failures.length) throw new AggregateError(failures.map((message)=>new Error(message)),"DOM failures: "+failures.join(" | "));
    console.log("DOM PASS — 16/16 individually executed; deterministic snapshot; zero deferred work");
}

async function runTransportRegression() {
    const previous = {
        window: globalThis.window,
        document: globalThis.document,
        fetch: globalThis.fetch,
        FormData: globalThis.FormData,
    };
    const overlay = {
        hidden: true,
        setAttribute() {},
        removeAttribute() {},
    };
    const navigations = [];
    const form = {
        matches(selector) {
            return selector === "[data-millora-submission-flow]";
        },
    };
    class ControlledFormData {
        constructor(received) {
            assert.equal(received, form, "transport created FormData from the wrong form");
        }
    }
    let response = { status: 200, body: { ok: true }, raw: null };
    const failures = [];
    const completed = [];
    try {
        globalThis.window = {
            location: {
                hostname: "127.0.0.1",
                assign(url) {
                    navigations.push(url);
                },
            },
            setTimeout,
        };
        globalThis.document = {
            getElementById(id) {
                return id === "submission-sending-overlay" ? overlay : null;
            },
        };
        globalThis.FormData = ControlledFormData;
        globalThis.fetch = async (_url, init) => {
            assert.equal(init.method, "POST");
            assert.equal(init.headers.Accept, "application/json");
            assert.equal(init.body instanceof ControlledFormData, true);
            return new Response(
                response.raw ?? JSON.stringify(response.body),
                {
                    status: response.status,
                    headers: { "content-type": "application/json" },
                },
            );
        };
        const { submitVerifiedSubmissionForm } = await import(
            pathToFileURL(PRODUCT.transport).href + "?qa=" + randomUUID()
        );
        const runCase = async (name, test) => {
            navigations.length = 0;
            response = { status: 200, body: { ok: true }, raw: null };
            overlay.hidden = true;
            try {
                await test(submitVerifiedSubmissionForm);
                completed.push(name);
                console.log(`TRANSPORT ${name} PASS`);
            } catch (error) {
                completed.push(name);
                failures.push(`${name}: ${error.message}`);
                console.log(`TRANSPORT ${name} EXPECTED-FAIL ${error.message}`);
            }
        };
        const invoke = (submit, navigation, minimumDuration = 25) => {
            const options = {
                successUrl: "/enviat/",
                minimumDuration,
            };
            if (navigation !== undefined) options.navigation = navigation;
            return submit(form, options);
        };
        await runCase("omitted-automatic", async (submit) => {
            const started = performance.now();
            const result = await invoke(submit, undefined);
            assert.equal(result, undefined);
            assert.equal(performance.now() - started >= 15, true, "minimum wait was not preserved");
            assert.deepEqual(navigations, ["/enviat/"]);
        });
        await runCase("explicit-automatic", async (submit) => {
            await invoke(submit, "automatic", 0);
            assert.deepEqual(navigations, ["/enviat/"]);
        });
        await runCase("caller", async (submit) => {
            const started = performance.now();
            const result = await invoke(submit, "caller");
            assert.equal(result, undefined);
            assert.equal(performance.now() - started >= 15, true, "caller resolved before minimum wait");
            assert.deepEqual(navigations, [], "caller mode performed internal navigation");
        });
        await runCase("http-failure", async (submit) => {
            response = { status: 503, body: { ok: false, reason: "submission:unavailable" }, raw: null };
            await assert.rejects(() => invoke(submit, "caller", 0), /Verified submission failed: 503/);
            assert.deepEqual(navigations, []);
            assert.equal(overlay.hidden, true);
        });
        await runCase("json-failure", async (submit) => {
            response = { status: 200, body: { ok: false, reason: "submission:failed" }, raw: null };
            await assert.rejects(() => invoke(submit, "caller", 0), /Verified submission failed: 200/);
            assert.deepEqual(navigations, []);
        });
        await runCase("invalid-json", async (submit) => {
            response = { status: 200, body: null, raw: "not-json" };
            await assert.rejects(() => invoke(submit, "caller", 0), /Verified submission failed: 200/);
            assert.deepEqual(navigations, []);
        });
        assert.deepEqual(completed, ["omitted-automatic", "explicit-automatic", "caller", "http-failure", "json-failure", "invalid-json"]);
        if (failures.length) {
            throw new AggregateError(
                failures.map((message) => new Error(message)),
                `Transport failures: ${failures.join(" | ")}`,
            );
        }
        console.log("TRANSPORT PASS — omitted/automatic exactly one navigation; caller zero navigation; failures zero navigation; HTTP/JSON and minimum wait preserved");
    } finally {
        for (const [name, value] of Object.entries(previous)) {
            if (value === undefined) delete globalThis[name];
            else globalThis[name] = value;
        }
    }
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
function createCleanupCoordinator(label) {
    const steps=[]; let runPromise=null; let invocations=0;
    return {
        add(name,cleanup){ steps.push({name,cleanup}); },
        run(cause="normal"){
            invocations+=1;
            if(runPromise) return runPromise;
            runPromise=(async()=>{
                const failures=[];
                for(const {name,cleanup} of steps){
                    try{await cleanup();}
                    catch(error){failures.push(new Error(`${label}/${name}: ${error.message}`,{cause:error}));}
                }
                if(failures.length) throw new AggregateError(failures,`${label} cleanup failed after ${cause}`);
            })();
            return runPromise;
        },
        get invocations(){return invocations;},
    };
}
function mergePrimaryAndCleanup(primary,cleanup,label){
    if(primary&&cleanup) return new AggregateError([primary,cleanup],`${label}: primary failure plus cleanup failure`);
    return primary??cleanup??null;
}
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

async function runBuild({injectFailure=false}={}) {
    if (await pathExists(REAL_DIST)) throw new Error("BUILD PRECONDITION FAIL — real dist/ exists; not adopted or removed");
    const realAstroManifest = await captureRealAstroManifest();
    const allowed = expectedCmsRequests(); const seen = new Set(); let unexpected = null; let port;
    const server = http.createServer((request, response) => {
        const key = request.url; if (request.method !== "GET" || !allowed.has(key)) { unexpected = `${request.method} ${key}`; response.writeHead(404); response.end(); return; }
        seen.add(key); response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 0 } } }));
    });
    let passed = false; let qaRoot; let identity; let generatedOwned = []; let primaryError; let cleanupError;
    const cleanup=createCleanupCoordinator("build");
    cleanup.add("cms-double",async()=>{await closeServer(server);if(port!==undefined)assert.equal(await portFree(port),true,"CMS double listener was not released");});
    cleanup.add("failed-qa-root",async()=>{if(!passed&&qaRoot&&identity)await removeOwnedQaRoot(qaRoot,identity);});
    try {
        ({ qaRoot, identity } = await createQaRoot(realAstroManifest));
        server.listen(0, "127.0.0.1"); await once(server, "listening"); port = server.address().port;
        if(injectFailure)throw new Error("injected build failure after owned resources were created");
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
    } catch(error){primaryError=error;}
    try{await cleanup.run(primaryError?"failure":"pass");}catch(error){cleanupError=error;}
    const failure=mergePrimaryAndCleanup(primaryError,cleanupError,"build"); if(failure)throw failure;
    console.log(`BUILD PASS — run ${identity.runId}; qa-root ${qaRoot}; copied [${identity.copyEntries.join(", ")}]; generated [${generatedOwned.join(", ")}]; real .astro unchanged; real dist absent; CMS 127.0.0.1:${port} closed`);
}

async function createCleanupProbeResources(label){
    const profile=await mkdtemp(path.join(os.tmpdir(),`guiapineda-millora-011-${label}-`));
    const server=net.createServer();server.listen(0,"127.0.0.1");await once(server,"listening");
    return {profile,server,port:server.address().port};
}
async function runCleanupCase(name){
    const {profile,server,port}=await createCleanupProbeResources(name);const attempts=[];
    const cleanup=createCleanupCoordinator(`probe-${name}`);
    cleanup.add("fixture-listener",async()=>{attempts.push("fixture-listener");await closeServer(server);});
    if(name==="cleanup-failure")cleanup.add("injected-cleanup-failure",async()=>{attempts.push("injected-cleanup-failure");throw new Error("injected cleanup failure");});
    cleanup.add("owned-profile",async()=>{attempts.push("owned-profile");await rm(profile,{recursive:true,force:false});});
    cleanup.add("zero-owned",async()=>{attempts.push("zero-owned");assert.equal(await portFree(port),true);assert.equal(await pathExists(profile),false);});
    const primary=name==="pass"||name==="cleanup-failure"?null:new Error(name==="assertion-fail"?"injected assertion failure":`injected ${name}`);if(name==="assertion-fail")primary.name="AssertionError";
    let cleanupFailure;try{await cleanup.run(name);}catch(error){cleanupFailure=error;}
    console.log(`CLEANUP_CASE=${name};ATTEMPTS=${attempts.join(",")};PROFILE_ABSENT=${!await pathExists(profile)};PORT_FREE=${await portFree(port)};RUN_CALLS=${cleanup.invocations}`);
    const failure=mergePrimaryAndCleanup(primary,cleanupFailure,`probe-${name}`);if(failure)throw failure;
}
async function runSignalChild(){
    const {profile,server,port}=await createCleanupProbeResources("signal");const cleanup=createCleanupCoordinator("signal-child");let signalReceived=null;
    cleanup.add("fixture-listener",async()=>{await new Promise((resolve)=>setTimeout(resolve,50));await closeServer(server);});
    cleanup.add("owned-profile",async()=>{await rm(profile,{recursive:true,force:false});});
    cleanup.add("zero-owned",async()=>{assert.equal(await portFree(port),true);assert.equal(await pathExists(profile),false);});
    const handler=(signal)=>{if(signalReceived)return;signalReceived=signal;void cleanup.run(signal).then(async()=>{console.log(`SIGNAL_CLEANUP=${signal};PROFILE_ABSENT=${!await pathExists(profile)};PORT_FREE=${await portFree(port)};RUN_CALLS=${cleanup.invocations}`);process.exitCode=signal==="SIGINT"?130:143;},(error)=>{console.error(error);process.exitCode=1;});};
    // The emitted profile path lets the owning parent verify absence without discovering/deleting anything.
    process.on("SIGINT",handler);process.on("SIGTERM",handler);
    console.log(`SIGNAL_READY=${JSON.stringify({profile,port})}`);
}
async function runSignalProbe(signal){
    const child=spawn(process.execPath,[fileURLToPath(import.meta.url),"--cleanup-signal-child"],{cwd:ROOT,stdio:["ignore","pipe","pipe"]});let output="",ready;
    child.stdout.setEncoding("utf8");child.stderr.setEncoding("utf8");
    child.stdout.on("data",(chunk)=>{output+=chunk;process.stdout.write(chunk);const match=output.match(/SIGNAL_READY=(\{[^\n]+\})/);if(match&&!ready)ready=JSON.parse(match[1]);});
    child.stderr.on("data",(chunk)=>{output+=chunk;process.stderr.write(chunk);});
    await waitFor(()=>ready,5000,25);assert.equal(childIsLive(child),true);child.kill(signal);setTimeout(()=>{if(childIsLive(child))child.kill(signal);},10);
    const [code,exitSignal]=await once(child,"exit");assert.equal(exitSignal,null);assert.equal(code,signal==="SIGINT"?130:143);assert.match(output,new RegExp(`SIGNAL_CLEANUP=${signal}[^\\n]*RUN_CALLS=1`));assert.equal(await pathExists(ready.profile),false);assert.equal(await portFree(ready.port),true);
}
async function runCleanupProbes(){
    assert.deepEqual(await pendingQaRoots(),[]);assert.equal(await pathExists(REAL_DIST),false);
    for(const name of ["pass","assertion-fail","exception","preview-failure","browser-failure","controlled-abort","cleanup-failure"]){
        const result=await runChild(process.execPath,[fileURLToPath(import.meta.url),"--cleanup-case",name]);
        assert.equal(result.code,name==="pass"?0:1,`${name} cleanup probe exit`);assert.match(result.output,new RegExp(`CLEANUP_CASE=${name}[^\\n]*PROFILE_ABSENT=true;PORT_FREE=true;RUN_CALLS=1`));
        if(name==="cleanup-failure")assert.match(result.output,/injected-cleanup-failure,owned-profile,zero-owned/);
    }
    const buildFailure=await runChild(process.execPath,[fileURLToPath(import.meta.url),"--build-failure-probe"]);assert.equal(buildFailure.code,1);assert.deepEqual(await pendingQaRoots(),[]);assert.match(buildFailure.output,/injected build failure/);
    await runSignalProbe("SIGINT");await runSignalProbe("SIGTERM");
    assert.deepEqual(await pendingQaRoots(),[]);assert.equal(await pathExists(REAL_DIST),false);assert.equal(await portFree(4173),true);
    console.log("CLEANUP PROBES PASS — pass/assertion/exception/build/preview/browser/abort/SIGINT/SIGTERM; independent attempts; accumulated failure; non-reentrant; zero owned residue");
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
        const groupGone = await waitFor(() => processGroupAbsent(groupId), 5000, 50).then(() => true, () => false);
        assert.equal(groupGone, true, `${label} root ended but its owned process group still exists; STOP without signaling`);
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
    const groupGone = await waitFor(() => processGroupAbsent(groupId), 5000, 50).then(() => true, () => false);
    assert.equal(groupGone, true, `${label} helpers remain in the owned process group`);
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
async function evaluate(cdp, expression, awaitPromise = true) { const result = await Promise.race([cdp.send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true }),new Promise((_,reject)=>setTimeout(()=>reject(new Error("Runtime.evaluate timeout")),5000))]); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }

function installMilloraShim() {
    const originalFetch=window.fetch.bind(window);
    const state={mode:"success",counts:{requestCode:0,verifyCode:0,submission:0},events:[],requests:[],submissions:[]};
    window.__milloraQa=state;
    const report=(type,detail={})=>{try{window.__milloraQaReport(JSON.stringify({type,...detail}));}catch{}}
    const originalRemoveItem=Storage.prototype.removeItem;
    Storage.prototype.removeItem=function(...args){
        const key=String(args[0]);
        if(key==="guiapineda:submission-draft:v1:millora"&&state.mode==="success")report("caller-return-after-success",{key});
        const result=Reflect.apply(originalRemoveItem,this,args);
        if(key==="guiapineda:submission-draft:v1:millora"&&state.mode==="success")report("productive-clear",{key});
        return result;
    };
    window.addEventListener("pageshow",(event)=>state.events.push("pageshow:"+String(event.persisted)));
    const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});
    window.fetch=async(input,init={})=>{
        const url=new URL(typeof input==="string"?input:input.url,location.href);
        if(!url.pathname.startsWith("/api/")) return originalFetch(input,init);
        const method=String(init.method||"GET").toUpperCase();
        if(method!=="POST") throw new Error("MILLORA_QA_FIXTURE method "+method);
        state.requests.push(url.pathname);
        if(url.pathname==="/api/verification/request-code"){
            const body=JSON.parse(init.body);
            if(body.scope!=="millora"||body.language!==document.querySelector('[name="idioma_solicitud"]').value) throw new Error("MILLORA_QA_FIXTURE request body");
            state.counts.requestCode+=1;
            if(state.mode==="request-unavailable") return reply({ok:false,reason:"verification:unavailable"},503);
            return reply({ok:true,challengeId:"challenge-011",expiresIn:600});
        }
        if(url.pathname==="/api/verification/verify-code"){
            const body=JSON.parse(init.body); state.counts.verifyCode+=1;
            if(body.scope!=="millora"||body.challengeId!=="challenge-011") throw new Error("MILLORA_QA_FIXTURE verify body");
            return body.code==="123456"?reply({ok:true,token:"token-011",expiresIn:600}):reply({ok:false,reason:"invalid-code",attemptsRemaining:4},400);
        }
        if(url.pathname==="/api/submissions/millora"){
            if(!(init.body instanceof FormData)) throw new Error("MILLORA_QA_FIXTURE submission body");
            state.submissions.push([...init.body.entries()].map(([name,value])=>[name,typeof value==="string"?value:{name:value.name,type:value.type,size:value.size}]));
            state.counts.submission+=1;
            if(state.mode==="submit-500") return reply({ok:false,reason:"submission:failed"},500);
            if(state.mode==="submit-503") return reply({ok:false,reason:"submission:unavailable"},503);
            if(state.mode==="submit-ok-false") return reply({ok:false,reason:"submission:failed"},200);
            state.events.push("confirmed-http-json");report("http-json-confirmed");
            return reply({ok:true});
        }
        throw new Error("MILLORA_QA_FIXTURE blocked "+url.pathname);
    };
}
const SHIM="("+installMilloraShim.toString()+")();";

async function runBrowser(selectedIds=BROWSER_IDS) {
    assert.equal(selectedIds.length>0,true,"browser selection is empty");for(const id of selectedIds)assert.equal(BROWSER_IDS.includes(id),true,`unknown browser QA ID ${id}`);
    let ownership=false,qaRoot,identity,profile,imagePath,preview,previewControl,chrome,debugPort,browserCdp,browserSocket,cdp,socket,fetchCdp,fetchSocket;
    const chromePids=new Set(),violations=[],completed=[],failures=[],successOrder=[];
    const navigationProbe={active:false,successPath:"",frameUrl:null,networkRequestId:null,httpConfirmed:false,clearCount:0,navigationCount:0,documentCount:0,loadCount:0,loadResolve:null};
    const validFields={categoria:"incidencies",zona:"centre","millora-author-type":"alias","millora-alias":"  Àlies 011  ",titol:"Títol vàlid 011",resum:"R".repeat(40),contingut:"C".repeat(100),email_contacto:"qa011@example.invalid"};
    let primaryError,cleanupError,signalReceived=null;
    const cleanup=createCleanupCoordinator("browser");
    cleanup.add("network-fixture",async()=>{if(fetchCdp)await fetchCdp.send("Fetch.disable");});
    cleanup.add("chrome-process-inventory",async()=>{if(browserCdp)for(const info of (await browserCdp.send("SystemInfo.getProcessInfo")).processInfo??[])chromePids.add(Number(info.id));});
    cleanup.add("browser-close",async()=>{if(browserCdp)await browserCdp.send("Browser.close");});
    cleanup.add("chrome-owned-group",async()=>{if(chrome)await stopOwnedGroup(chrome,"Chrome",debugPort);});
    cleanup.add("cdp-sockets",async()=>{try{fetchSocket?.close();}finally{try{socket?.close();}finally{browserSocket?.close();}}});
    cleanup.add("cdp-port-and-pids",async()=>{if(debugPort!==undefined)assert.equal(await portFree(debugPort),true,"CDP port not released");await assertOwnedPidsAbsent(chromePids,"Chrome/root/helpers");});
    cleanup.add("preview-owned",async()=>{await stopOwnedPreview(previewControl);if(preview)assert.equal(childIsLive(preview),false,"preview remains live");});
    cleanup.add("profile-owned",async()=>{if(profile){await rm(profile,{recursive:true,force:false});assert.equal(await pathExists(profile),false,"profile not removed");}});
    cleanup.add("real-root-invariants",async()=>{if(identity)await assertRealAstroUnchanged(identity.realAstroManifest);assert.equal(await pathExists(REAL_DIST),false,"real dist appeared");});
    cleanup.add("qa-root-owned",async()=>{if(ownership)await removeOwnedQaRoot(qaRoot,identity);});
    cleanup.add("zero-owned-resources",async()=>{assert.deepEqual(await pendingQaRoots(),[],"qa-root cleanup failed");assert.equal(await portFree(4173),true,"preview port not released");assert.equal(childIsLive(chrome),false);assert.equal(childIsLive(preview),false);});
    const onSignal=(signal)=>{if(signalReceived)return;signalReceived=signal;void cleanup.run(signal).then(()=>{process.exitCode=signal==="SIGINT"?130:143;},(error)=>{console.error(`FAIL: ${error.stack??error}`);process.exitCode=1;});};
    process.on("SIGINT",onSignal);process.on("SIGTERM",onSignal);
    try {
        assert.equal(await pathExists(REAL_DIST),false,"real dist exists");
        ({qaRoot,identity}=await discoverOwnedQaRoot()); ownership=true;
        assert.equal(await pathExists(path.join(qaRoot,"dist")),true,"isolated dist missing");
        await assertRealAstroUnchanged(identity.realAstroManifest);
        assert.equal(await portFree(4173),true,"port 4173 occupied");
        profile=await mkdtemp(path.join(os.tmpdir(),"guiapineda-millora-011-"));
        previewControl=await createOwnedNodeControl(profile);
        preview=spawn("npm",["run","preview","--","--root",qaRoot,"--host","127.0.0.1","--port","4173"],{cwd:ROOT,stdio:"ignore",env:{...process.env,NODE_OPTIONS:"--require="+previewControl.preload}});
        await waitFor(async()=>{try{const response=await fetch("http://127.0.0.1:4173/millorem-pineda/envia-una-millora/");return hasOwnedPreviewClient(previewControl)&&response.ok&&(await response.text()).includes("data-millora-submission-flow");}catch{return false;}});
        await access(CHROME);
        imagePath=path.join(profile,"qa-image.png");
        await writeFile(imagePath,Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64"));
        chrome=spawn(CHROME,["--headless=new","--user-data-dir="+profile,"--remote-debugging-address=127.0.0.1","--remote-debugging-port=0","--no-first-run","--no-default-browser-check","--disable-background-networking","--disable-sync","--disable-component-update","--disable-features=Translate,OptimizationHints,MediaRouter","--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1","about:blank"],{detached:true,stdio:"ignore"});
        const active=await waitFor(async()=>{try{return await readFile(path.join(profile,"DevToolsActivePort"),"utf8");}catch{return null;}});
        debugPort=Number(active.trim().split(/\s+/)[0]); assert.equal(Number.isInteger(debugPort),true,"invalid CDP port");
        const version=await(await fetch("http://127.0.0.1:"+debugPort+"/json/version")).json();
        browserSocket=new WebSocket(version.webSocketDebuggerUrl); await once(browserSocket,"open"); browserCdp=new Cdp(browserSocket);
        const targets=await(await fetch("http://127.0.0.1:"+debugPort+"/json/list")).json(); const target=targets.find((item)=>item.type==="page"); assert.ok(target);
        socket=new WebSocket(target.webSocketDebuggerUrl); await once(socket,"open"); cdp=new Cdp(socket);
        fetchSocket=new WebSocket(target.webSocketDebuggerUrl); await once(fetchSocket,"open"); fetchCdp=new Cdp(fetchSocket);
        chromePids.add(chrome.pid); for(const info of (await browserCdp.send("SystemInfo.getProcessInfo")).processInfo) chromePids.add(Number(info.id));
        await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("DOM.enable"); await cdp.send("Network.enable");
        await fetchCdp.send("Fetch.enable",{patterns:[{urlPattern:"*",requestStage:"Request"}]});
        await cdp.send("Runtime.addBinding",{name:"__milloraQaReport"});
        await cdp.send("Page.addScriptToEvaluateOnNewDocument",{source:SHIM});
        const formRoutes=["/millorem-pineda/envia-una-millora/","/es/millorem-pineda/enviar-una-mejora/","/en/millorem-pineda/send-an-improvement/"];
        const successRoutes=["/enviat/","/es/enviado/","/en/sent/"];
        const allowed=(request)=>{
            const url=new URL(request.url);
            if(["data:","blob:","devtools:"].includes(url.protocol)) return true;
            const okPath=formRoutes.includes(url.pathname)||successRoutes.includes(url.pathname)||["/favicon.ico","/favicon.svg"].includes(url.pathname)||url.pathname.startsWith("/_astro/");
            return url.origin==="http://127.0.0.1:4173"&&["GET","HEAD"].includes(request.method)&&okPath;
        };
        cdp.on("Runtime.bindingCalled",({name,payload})=>{
            if(name!=="__milloraQaReport"||!navigationProbe.active)return;
            let message;try{message=JSON.parse(payload);}catch{violations.push("invalid QA binding payload");return;}
            if(message.type==="http-json-confirmed"){navigationProbe.httpConfirmed=true;return;}
            if(message.type==="caller-return-after-success"){
                if(!navigationProbe.httpConfirmed)violations.push("caller return observed before HTTP/JSON confirmation");
                successOrder.push("A:http-json-confirmed+caller-return");
                return;
            }
            if(message.type==="productive-clear"){
                navigationProbe.clearCount+=1;
                if(message.key!==KEY)violations.push("productive clear used unexpected key "+message.key);
                successOrder.push("B:productive-clear");
            }
        });
        cdp.on("Page.frameRequestedNavigation",({url,reason})=>{
            if(!navigationProbe.active||new URL(url).pathname!==navigationProbe.successPath)return;
            navigationProbe.navigationCount+=1;navigationProbe.frameUrl=url;
            if(reason!=="scriptInitiated")violations.push("success navigation was not script initiated: "+reason);
            successOrder.push("C:product-navigation-requested");
        });
        cdp.on("Network.requestWillBeSent",({requestId,request,type})=>{
            if(navigationProbe.active&&type==="Document"&&new URL(request.url).pathname===navigationProbe.successPath){navigationProbe.documentCount+=1;navigationProbe.networkRequestId=requestId;successOrder.push("D:document-request");}
            if(!allowed(request)&&!request.url.startsWith("data:")&&!request.url.startsWith("blob:")) violations.push(request.method+" "+request.url);
        });
        cdp.on("Page.loadEventFired",()=>{if(navigationProbe.active&&navigationProbe.documentCount>0){navigationProbe.loadCount+=1;successOrder.push("E:success-route-loaded");navigationProbe.loadResolve?.();}});
        fetchCdp.on("Fetch.requestPaused",({requestId,networkId,request,resourceType})=>{
            if(allowed(request)) fetchCdp.send("Fetch.continueRequest",{requestId}).catch(()=>{});
            else {violations.push(request.method+" "+request.url); fetchCdp.send("Fetch.failRequest",{requestId,errorReason:"BlockedByClient"}).catch(()=>{});}
        });
        const evaluatePage=(expression,awaitPromise=true)=>evaluate(cdp,expression,awaitPromise);
        const navigate=async(route)=>{
            await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173"+route});
            await waitFor(async()=>{try{return await evaluatePage("document.readyState==='complete'&&location.pathname==="+JSON.stringify(route)+"&&Boolean(document.querySelector('[data-millora-submission-flow]'))");}catch{return false;}});
        };
        const resetPage=async(route=formRoutes[0],fields)=>{
            await navigate(route);
            const raw=fields===undefined?null:JSON.stringify(envelope("millora",fields));
            await evaluatePage("(()=>{sessionStorage.clear();"+(raw===null?"":"sessionStorage.setItem("+JSON.stringify(KEY)+","+JSON.stringify(raw)+");")+"return true;})()");
            await navigate(route);
        };
        const fill=async(values)=>evaluatePage("(()=>{const values="+JSON.stringify(values)+";for(const [name,value] of Object.entries(values)){const nodes=[...document.querySelectorAll('[name=\"'+name+'\"]')];if(!nodes.length)throw new Error('missing '+name);if(nodes[0].type==='radio'){for(const node of nodes)node.checked=node.value===value;nodes[0].dispatchEvent(new Event('change',{bubbles:true}));}else{nodes[0].value=value;nodes[0].dispatchEvent(new Event(nodes[0].tagName==='SELECT'?'change':'input',{bubbles:true}));}}return sessionStorage.getItem("+JSON.stringify(KEY)+");})()");
        const openReview=async(values=validFields)=>{
            await fill({categoria:values.categoria,zona:values.zona,"millora-author-type":values["millora-author-type"],"millora-alias":values["millora-alias"]});
            await evaluatePage("document.querySelector('#millora-context-continue').click()");
            await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-content').hidden"));
            await fill({titol:values.titol,resum:values.resum,contingut:values.contingut,email_contacto:values.email_contacto});
            await evaluatePage("document.querySelector('#millora-content-continue').click()");
            await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-review').hidden"));
        };
        const verifyEmail=async(code="123456")=>{
            await evaluatePage("document.querySelector('[data-verification-request]').click()");
            await waitFor(()=>evaluatePage("window.__milloraQa.counts.requestCode===1&&!document.querySelector('[data-verification-code-step]').hidden"));
            await evaluatePage("(()=>{const el=document.querySelector('[data-verification-code]');el.value="+JSON.stringify(code)+";el.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-verification-confirm]').click();return true;})()");
            await waitFor(()=>evaluatePage(code==="123456"?"document.querySelector('[data-millora-submission-flow]').dataset.emailVerified==='true'":"window.__milloraQa.counts.verifyCode===1&&!document.querySelector('[data-verification-error]').hidden"));
        };
        const prepareSubmit=async(mode,values=validFields)=>{
            await resetPage(); await openReview(values); await verifyEmail();
            await evaluatePage("(()=>{const p=document.querySelector('#millora-privacy');p.checked=true;p.dispatchEvent(new Event('change',{bubbles:true}));window.__milloraQa.mode="+JSON.stringify(mode)+";return sessionStorage.getItem("+JSON.stringify(KEY)+");})()");
            return evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");
        };
        const selectImage=async()=>{
            const doc=await cdp.send("DOM.getDocument",{depth:-1}); const selected=await cdp.send("DOM.querySelector",{nodeId:doc.root.nodeId,selector:"#millora-image-input"}); assert.ok(selected.nodeId);
            await cdp.send("DOM.setFileInputFiles",{files:[imagePath],nodeId:selected.nodeId}); await evaluatePage("document.querySelector('#millora-image-input').dispatchEvent(new Event('change',{bubbles:true}))");
        };
        const runCase=async(id,test)=>{assert.equal(BROWSER_IDS.includes(id),true);if(!selectedIds.includes(id))return;try{await test();completed.push(id);console.log(id+" BROWSER PASS");}catch(error){completed.push(id);failures.push(id+": "+error.message);console.log(id+" BROWSER EXPECTED-FAIL "+error.message);}};
        await runCase("QA02",async()=>{await resetPage();await fill({titol:"first value"});await fill({titol:"latest value"});await navigate(formRoutes[0]);assert.equal(await evaluatePage("document.querySelector('[name=\"titol\"]').value"),"latest value");});
        await runCase("QA05",async()=>{const violations=[];for(const type of ["resident","visitor"]){const alias=`  Hidden alias ${type}  `;const values={...validFields,"millora-author-type":type,"millora-alias":alias};const expected=await prepareSubmit("submit-500",values);const before=await evaluatePage("(()=>{const form=document.querySelector('[data-millora-submission-flow]');return {alias:document.querySelector('[name=\"millora-alias\"]').value,hidden:document.querySelector('#millora-alias-wrap').hidden,author:document.querySelector('[name=\"autor_public\"]').value,live:document.querySelector('#millora-live-author').textContent,review:document.querySelector('#millora-review-author').textContent,form:[...new FormData(form).entries()].map(([name,value])=>[name,typeof value==='string'?value:value.name]),draft:JSON.parse(sessionStorage.getItem("+JSON.stringify(KEY)+"))};})()");await evaluatePage("document.querySelector('#millora-review-send').click()");await waitFor(()=>evaluatePage("window.__milloraQa.counts.submission===1&&!document.querySelector('#millora-submit-error').hidden"),7000);const payload=await evaluatePage("window.__milloraQa.submissions[0]");if(before.alias!==alias||before.hidden!==true||before.author.includes(alias.trim())||before.live.includes(alias.trim())||before.review.includes(alias.trim())||before.form.some(([name])=>name==='millora-alias')||payload.some(([name])=>name==='millora-alias')||before.draft.fields['millora-alias']!==alias||await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")")!==expected)violations.push(type);}assert.deepEqual(violations,[],"non-alias leaked into validation/UI/FormData/payload for "+violations.join(","));});
        await runCase("QA06",async()=>{await resetPage();for(const [type,expected] of [["",""],["resident","Resident de Pineda de Mar"],["visitor","Visitant de Pineda de Mar"],["alias","Alias trimmed"]]){await fill({"millora-author-type":type,"millora-alias":"  Alias trimmed  "});assert.equal(await evaluatePage("document.querySelector('[name=\"autor_public\"]').value"),expected);}});
        await runCase("QA07",async()=>{await resetPage();await fill({email_contacto:"restored@example.invalid"});await navigate(formRoutes[0]);assert.deepEqual(await evaluatePage("({email:document.querySelector('[name=\"email_contacto\"]').value,verified:document.querySelector('[data-millora-submission-flow]').dataset.emailVerified,token:document.querySelector('[data-verification-token]').value,code:document.querySelector('[data-verification-code]').value})"),{email:"restored@example.invalid",verified:"false",token:"",code:""});});
        await runCase("QA08",async()=>{await resetPage(formRoutes[0],validFields);const state=await evaluatePage("(()=>{const category=document.querySelector('[name=\"categoria\"]:checked');const author=document.querySelector('[name=\"millora-author-type\"]:checked');const zone=document.querySelector('[name=\"zona\"]');return {context:document.querySelector('#millora-step-context').hidden,content:document.querySelector('#millora-step-content').hidden,review:document.querySelector('#millora-step-review').hidden,contextContinue:document.querySelector('#millora-context-continue').disabled,contentBack:document.querySelector('#millora-content-back').disabled,contentContinue:document.querySelector('#millora-content-continue').disabled,reviewBack:document.querySelector('#millora-review-back').disabled,reviewSend:document.querySelector('#millora-review-send').disabled,title:document.querySelector('#millora-title-count').textContent,summary:document.querySelector('#millora-summary-count').textContent,body:document.querySelector('#millora-content-count').textContent,reading:document.querySelector('#millora-live-reading').textContent,category:document.querySelector('#millora-live-category').textContent,expectedCategory:category.dataset.label,zone:document.querySelector('#millora-live-zone').textContent,expectedZone:zone.selectedOptions[0].textContent.trim(),author:document.querySelector('#millora-live-author').textContent,expectedAuthor:document.querySelector('[name=\"millora-alias\"]').value.trim(),titlePreview:document.querySelector('#millora-live-title').textContent,summaryPreview:document.querySelector('#millora-live-summary').textContent,publicAuthor:document.querySelector('[name=\"autor_public\"]').value,authorType:author.value};})()");assert.deepEqual(state,{context:false,content:true,review:true,contextContinue:false,contentBack:false,contentContinue:false,reviewBack:false,reviewSend:true,title:String(validFields.titol.length),summary:String(validFields.resum.length),body:String(validFields.contingut.length),reading:"1",category:state.expectedCategory,expectedCategory:state.expectedCategory,zone:state.expectedZone,expectedZone:state.expectedZone,author:validFields["millora-alias"].trim(),expectedAuthor:validFields["millora-alias"].trim(),titlePreview:validFields.titol,summaryPreview:validFields.resum,publicAuthor:validFields["millora-alias"].trim(),authorType:"alias"});});
        await runCase("QA09",async()=>{await resetPage(formRoutes[0],validFields);await fill({titol:"Edited after restore"});await openReview({...validFields,titol:"Edited after restore"});assert.equal(await evaluatePage("document.querySelector('#millora-review-title').textContent"),"Edited after restore");});
        await runCase("QA11",async()=>{await resetPage();await fill({titol:"CA to ES"});await navigate(formRoutes[1]);assert.equal(await evaluatePage("document.querySelector('[name=\"titol\"]').value"),"CA to ES");});
        await runCase("QA12",async()=>{await resetPage(formRoutes[1]);await fill({resum:"ES to EN literal"});await navigate(formRoutes[2]);assert.equal(await evaluatePage("document.querySelector('[name=\"resum\"]').value"),"ES to EN literal");});
        await runCase("QA13",async()=>{await resetPage(formRoutes[2]);await fill({titol:"EN old"});await navigate(formRoutes[0]);await fill({titol:"CA latest"});await navigate(formRoutes[2]);assert.equal(await evaluatePage("document.querySelector('[name=\"titol\"]').value"),"CA latest");});
        await runCase("QA14",async()=>{const literal="  À text español English  ";await resetPage();await fill({contingut:literal});await navigate(formRoutes[1]);assert.equal(await evaluatePage("document.querySelector('[name=\"contingut\"]').value"),literal);});
        await runCase("QA15",async()=>{for(const [index,route] of formRoutes.entries()){const alias=`  Literal alias ${index}  `;await resetPage(route);await fill({...validFields,"millora-author-type":"alias","millora-alias":alias});for(const type of ["resident","visitor"]){await fill({"millora-author-type":type});await evaluatePage("document.querySelector('#millora-context-continue').click()");await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-content').hidden"));await evaluatePage("document.querySelector('#millora-content-continue').click()");await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-review').hidden"));const state=await evaluatePage("(()=>{const selected=document.querySelector('[name=\"millora-author-type\"]:checked');const raw=sessionStorage.getItem("+JSON.stringify(KEY)+");return {alias:document.querySelector('[name=\"millora-alias\"]').value,hidden:document.querySelector('#millora-alias-wrap').hidden,author:document.querySelector('[name=\"autor_public\"]').value,live:document.querySelector('#millora-live-author').textContent,review:document.querySelector('#millora-review-author').textContent,label:selected.dataset.label,draft:JSON.parse(raw).fields['millora-alias']};})()");assert.deepEqual(state,{alias,hidden:true,author:state.label,live:state.label,review:state.label,label:state.label,draft:alias});assert.equal(state.label.includes(alias.trim()),false);await evaluatePage("document.querySelector('[data-millora-edit=\"context\"]').click()");await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-context').hidden"));}await fill({"millora-author-type":"alias"});assert.deepEqual(await evaluatePage("({alias:document.querySelector('[name=\"millora-alias\"]').value,hidden:document.querySelector('#millora-alias-wrap').hidden,author:document.querySelector('[name=\"autor_public\"]').value})"),{alias,hidden:false,author:alias.trim()});}});
        await runCase("QA17",async()=>{await resetPage();await fill({"millora-author-type":"alias","millora-alias":"Author"});const saved=await evaluatePage("JSON.parse(sessionStorage.getItem("+JSON.stringify(KEY)+"))");assert.equal("autor_public" in saved.fields,false);assert.equal(await evaluatePage("document.querySelector('[name=\"autor_public\"]').value"),"Author");});
        await runCase("QA18",async()=>{await resetPage();await selectImage();const raw=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.equal(raw.includes("qa-image"),false);assert.equal("imatge" in JSON.parse(raw).fields,false);});
        await runCase("QA19",async()=>{await resetPage();await selectImage();assert.match(await evaluatePage("document.querySelector('#millora-image-preview').src"),/^blob:/);await navigate(formRoutes[0]);assert.deepEqual(await evaluatePage("({files:document.querySelector('#millora-image-input').files.length,src:document.querySelector('#millora-image-preview').getAttribute('src')})"),{files:0,src:null});});
        await runCase("QA20",async()=>{await resetPage();await fill({titol:"privacy draft"});await evaluatePage("document.querySelector('#millora-privacy').checked=true;document.querySelector('#millora-privacy').dispatchEvent(new Event('change',{bubbles:true}))");assert.equal((await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")")).includes("aceptacion_privacidad"),false);await navigate(formRoutes[0]);assert.equal(await evaluatePage("document.querySelector('#millora-privacy').checked"),false);});
        await runCase("QA21",async()=>{await resetPage();await openReview();await verifyEmail();const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");let state=await evaluatePage("({verified:document.querySelector('[data-millora-submission-flow]').dataset.emailVerified,token:document.querySelector('[data-verification-token]').value,code:document.querySelector('[data-verification-code]').value,request:window.__milloraQa.counts.requestCode,verify:window.__milloraQa.counts.verifyCode,submit:window.__milloraQa.counts.submission})");assert.deepEqual(state,{verified:"true",token:"token-011",code:"123456",request:1,verify:1,submit:0});await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/enviat/"});await waitFor(()=>evaluatePage("location.pathname==='/enviat/'"));await evaluatePage("history.back()");await waitFor(()=>evaluatePage("location.pathname==="+JSON.stringify(formRoutes[0])+"&&Boolean(document.querySelector('[data-millora-submission-flow]'))"));state=await evaluatePage("({verified:document.querySelector('[data-millora-submission-flow]').dataset.emailVerified,token:document.querySelector('[data-verification-token]').value,code:document.querySelector('[data-verification-code]').value,requestVisible:!document.querySelector('[data-verification-request]').hidden,codeHidden:document.querySelector('[data-verification-code-step]').hidden,successHidden:document.querySelector('[data-verification-success]').hidden,context:document.querySelector('#millora-step-context').hidden,content:document.querySelector('#millora-step-content').hidden,review:document.querySelector('#millora-step-review').hidden,busy:document.querySelector('#millora-review-send').getAttribute('aria-busy'),errorHidden:document.querySelector('#millora-submit-error').hidden,draft:sessionStorage.getItem("+JSON.stringify(KEY)+"),events:window.__milloraQa.events,request:window.__milloraQa.counts.requestCode,verify:window.__milloraQa.counts.verifyCode,submit:window.__milloraQa.counts.submission})");assert.equal(state.events.includes("pageshow:true"),true,"real bfcache pageshow was not observed");assert.deepEqual({...state,events:undefined},{verified:"false",token:"",code:"",requestVisible:true,codeHidden:true,successHidden:true,context:false,content:true,review:true,busy:"false",errorHidden:true,draft:expected,events:undefined,request:1,verify:1,submit:0});await evaluatePage("document.querySelector('[data-verification-request]').click()");await waitFor(()=>evaluatePage("window.__milloraQa.counts.requestCode===2"));assert.equal(await evaluatePage("window.__milloraQa.counts.requestCode"),2,"duplicate request listeners after pageshow");});
        await runCase("QA22",async()=>{await resetPage(formRoutes[1]);await fill({titol:"locale excluded"});const saved=await evaluatePage("JSON.parse(sessionStorage.getItem("+JSON.stringify(KEY)+"))");assert.equal("idioma_solicitud" in saved.fields,false);assert.equal(await evaluatePage("document.querySelector('[name=\"idioma_solicitud\"]').value"),"es");});
        await runCase("QA23",async()=>{await resetPage();await openReview();await evaluatePage("document.querySelector('#millora-submit-error').hidden=false");const raw=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");for(const token of ["step","review","error","loading"])assert.equal(raw.includes(token),false);await navigate(formRoutes[0]);assert.equal(await evaluatePage("document.querySelector('#millora-step-context').hidden"),false);});
        await runCase("QA31",async()=>{await resetPage(formRoutes[0],{categoria:"evil"});assert.equal(await evaluatePage("document.querySelector('[name=\"categoria\"]:checked')===null"),true);});
        await runCase("QA32",async()=>{await resetPage(formRoutes[0],{zona:"evil"});assert.equal(await evaluatePage("document.querySelector('[name=\"zona\"]').value"),"");});
        await runCase("QA33",async()=>{await resetPage(formRoutes[0],{"millora-author-type":"evil","millora-alias":"Hidden"});assert.deepEqual(await evaluatePage("({type:document.querySelector('[name=\"millora-author-type\"]:checked'),author:document.querySelector('[name=\"autor_public\"]').value})"),{type:null,author:""});});
        await runCase("QA34",async()=>{const partial="incomplete@";await resetPage(formRoutes[0],{...validFields,email_contacto:partial});assert.equal(await evaluatePage("document.querySelector('[name=\"email_contacto\"]').value"),partial);await evaluatePage("document.querySelector('#millora-context-continue').click()");await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-content').hidden"));await evaluatePage("document.querySelector('#millora-content-continue').click()");await waitFor(()=>evaluatePage("!document.querySelector('#millora-step-review').hidden"));await evaluatePage("document.querySelector('[data-verification-request]').click();document.querySelector('[data-millora-submission-flow]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");await new Promise((resolve)=>setTimeout(resolve,100));assert.deepEqual(await evaluatePage("({email:document.querySelector('[name=\"email_contacto\"]').value,valid:document.querySelector('[name=\"email_contacto\"]').checkValidity(),request:window.__milloraQa.counts.requestCode,submit:window.__milloraQa.counts.submission,draft:JSON.parse(sessionStorage.getItem("+JSON.stringify(KEY)+")).fields.email_contacto})"),{email:partial,valid:false,request:0,submit:0,draft:partial});});
        await runCase("QA35",async()=>{await resetPage();await fill({titol:"short"});const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.notEqual(expected,null);await evaluatePage("document.querySelector('[data-millora-submission-flow]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");assert.equal(await evaluatePage("window.__milloraQa.counts.submission"),0);assert.equal(await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")"),expected);});
        await runCase("QA36",async()=>{await resetPage();await openReview();const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.notEqual(expected,null);await evaluatePage("window.__milloraQa.mode='request-unavailable';document.querySelector('[data-verification-request]').click()");await waitFor(()=>evaluatePage("window.__milloraQa.counts.requestCode===1&&!document.querySelector('[data-verification-error]').hidden"));assert.equal(await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")"),expected);assert.equal(await evaluatePage("window.__milloraQa.counts.requestCode"),1);});
        await runCase("QA37",async()=>{await resetPage();await openReview();const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.notEqual(expected,null);await verifyEmail("000000");assert.equal(await evaluatePage("document.querySelector('[data-millora-submission-flow]').dataset.emailVerified"),"false");assert.equal(await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")"),expected);});
        await runCase("QA38",async()=>{for(const mode of ["submit-500","submit-503","submit-ok-false"]){const expected=await prepareSubmit(mode);assert.notEqual(expected,null);await evaluatePage("document.querySelector('#millora-review-send').click()");await waitFor(()=>evaluatePage("window.__milloraQa.counts.submission===1&&!document.querySelector('#millora-submit-error').hidden"),7000);assert.equal(await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")"),expected);}});
        await runCase("QA39",async()=>{const expected=await prepareSubmit("success");assert.notEqual(expected,null);successOrder.length=0;Object.assign(navigationProbe,{active:true,successPath:"/enviat/",frameUrl:null,networkRequestId:null,httpConfirmed:false,clearCount:0,navigationCount:0,documentCount:0,loadCount:0,loadResolve:null});try{const loaded=new Promise((resolve)=>{navigationProbe.loadResolve=resolve;});await evaluatePage("document.querySelector('#millora-review-send').click()",false);await Promise.race([loaded,new Promise((_,reject)=>setTimeout(()=>reject(new Error("QA39 success navigation timeout")),10000))]);assert.equal(new URL(navigationProbe.frameUrl).pathname,navigationProbe.successPath);assert.equal(navigationProbe.httpConfirmed,true,"controlled HTTP/JSON success was not observed");assert.equal(navigationProbe.clearCount,1,"expected exactly one productive Millorem clear");assert.equal(navigationProbe.navigationCount,1,"expected exactly one product success navigation");assert.equal(navigationProbe.documentCount,1,"expected exactly one success Document request");assert.equal(navigationProbe.loadCount,1,"expected exactly one success load");const afterLoad=await evaluatePage("({path:location.pathname,draft:sessionStorage.getItem("+JSON.stringify(KEY)+")})");assert.deepEqual(afterLoad,{path:navigationProbe.successPath,draft:null},"success route/key state mismatch after load");successOrder.push("F:key-absent-after-load");assert.deepEqual(successOrder,["A:http-json-confirmed+caller-return","B:productive-clear","C:product-navigation-requested","D:document-request","E:success-route-loaded","F:key-absent-after-load"]);console.log(`QA39_LEDGER=${successOrder.join(" -> ")};CLEAR_COUNT=${navigationProbe.clearCount};DOCUMENT_REQUEST=${navigationProbe.networkRequestId}`);}finally{navigationProbe.active=false;navigationProbe.loadResolve=null;}});
        await runCase("QA40",async()=>{await resetPage();await fill({titol:"preserve reload languages"});const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.notEqual(expected,null);await navigate(formRoutes[1]);await navigate(formRoutes[2]);await navigate(formRoutes[0]);assert.equal(await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")"),expected);});
        await runCase("QA41",async()=>{await resetPage();await openReview();await verifyEmail();const expected=await evaluatePage("sessionStorage.getItem("+JSON.stringify(KEY)+")");assert.notEqual(expected,null);await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/enviat/"});await waitFor(()=>evaluatePage("location.pathname==='/enviat/'"));await evaluatePage("history.back()");await waitFor(()=>evaluatePage("location.pathname==="+JSON.stringify(formRoutes[0])+"&&Boolean(document.querySelector('[data-millora-submission-flow]'))"));assert.deepEqual(await evaluatePage("({context:document.querySelector('#millora-step-context').hidden,verified:document.querySelector('[data-millora-submission-flow]').dataset.emailVerified,draft:sessionStorage.getItem("+JSON.stringify(KEY)+")})"),{context:false,verified:"false",draft:expected});});
        assert.deepEqual(completed,selectedIds,"browser execution inventory mismatch");
        assert.deepEqual(violations,[],"network guard violations");
        console.log("BROWSER_EXECUTED="+completed.join(","));
        console.log("QA39_ORDER="+successOrder.join(" -> "));
        if(failures.length) throw new AggregateError(failures.map((message)=>new Error(message)),"Browser failures: "+failures.join(" | "));
        console.log(`BROWSER PASS — ${completed.length}/${selectedIds.length} individually executed Millora cases; CA/ES/EN; network guard closed`);
    } catch(error){primaryError=error;}
    try{await cleanup.run(primaryError?"failure":"pass");}catch(error){cleanupError=error;}
    process.off("SIGINT",onSignal);process.off("SIGTERM",onSignal);
    const failure=mergePrimaryAndCleanup(primaryError,cleanupError,"browser");if(failure)throw failure;
    console.log("BROWSER CLEANUP PASS — qa-root/profile removed; preview/Chrome/CDP closed; ports released; real .astro unchanged; real dist absent; zero owned resources");
}

const mode = process.argv[2];
try {
    if (mode === "--dom") await runDom();
    else if (mode === "--transport") await runTransportRegression();
    else if (mode === "--build") await runBuild();
    else if (mode === "--browser") await runBrowser();
    else if (mode === "--browser-target") await runBrowser(process.argv.slice(3));
    else if (mode === "--cleanup-probes") await runCleanupProbes();
    else if (mode === "--cleanup-case") await runCleanupCase(process.argv[3]);
    else if (mode === "--cleanup-signal-child") await runSignalChild();
    else if (mode === "--build-failure-probe") await runBuild({injectFailure:true});
    else throw new Error("usage: node scripts/qa/millora-draft-persistence-qa.mjs --dom|--transport|--build|--browser|--cleanup-probes");
} catch (error) {
    console.error(`FAIL: ${error.stack ?? error}`); process.exitCode = 1;
}
