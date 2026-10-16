import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { access, cp, lstat, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MODES = new Set(['--unit','--functions','--dom','--build','--browser','--cleanup-probes','--bootstrap','--cleanup-case','--cleanup-signal-child','--build-failure-probe','--cleanup-owned']);
const mode = process.argv[2];
assert.ok(MODES.has(mode), 'Explicit supported QA mode required');
const blocked = () => { throw new Error('External network forbidden in Feature 012 QA'); };
// No host environment is copied into the VM. Only synthetic credentials are provided.
const ENV = { GUIAPINEDA_VERIFICATION_SECRET:'qa-secret', UPSTASH_REDIS_REST_URL:'https://redis.invalid', UPSTASH_REDIS_REST_TOKEN:'qa', GUIAPINEDA_STRAPI_URL:'https://strapi.invalid', GUIAPINEDA_INTERNAL_SUBMISSION_SECRET:'s'.repeat(32) };
const handlers = ['agenda','comunicat','veu','millora','foto-mes','comercio','communicat-report','content-report'];
function clock() {
    let time=0, sequence=0; const pending=new Map();
    return { performance:{now:()=>time}, setTimeout(fn,ms){const id=++sequence;pending.set(id,{fn,at:time+ms});return id;},clearTimeout(id){pending.delete(id);}, advance(ms){time+=ms;for(const [id,t] of [...pending])if(t.at<=time){pending.delete(id);t.fn();}}, elapse(ms){time+=ms;}, pending };
}
async function modules(overrides={}) {
    assert.equal(typeof vm.SourceTextModule,'function','Use --experimental-vm-modules');
    const redisData=new Map(); const calls={getdel:0};
    class Redis { async getdel(key){calls.getdel++;const value=redisData.get(key);redisData.delete(key);return value;} async set(key,value){redisData.set(key,value);return 'OK';} }
    const context=vm.createContext({console,URL,Request,Response,Headers,FormData,File,Blob,AbortController,ReadableStream,TextEncoder,TextDecoder,Event,EventTarget,Buffer,Uint8Array,Date,Intl,performance,setTimeout,clearTimeout,fetch:blocked,process:{env:{...ENV}},...overrides});
    const cache=new Map();
    async function get(id) {
        if(cache.has(id))return cache.get(id);
        if(id==='@upstash/redis') { const m=new vm.SyntheticModule(['Redis'],function(){this.setExport('Redis',Redis);},{context});cache.set(id,m);return m; }
        if(id.startsWith('node:')) { assert.ok(['node:crypto','node:buffer'].includes(id),`Forbidden builtin ${id}`);const exports=await import(id);const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v);},{context});cache.set(id,m);return m; }
        assert.ok(id.startsWith(ROOT+path.sep),'Module escaped frontend');
        assert.ok(!/(^|\/)\.env|\.db$/.test(id),'Forbidden file');
        let source=await fs.readFile(id,'utf8');if(id.endsWith('.ts'))source=stripTypeScriptTypes(source);
        const m=new vm.SourceTextModule(source,{context,identifier:id});cache.set(id,m);return m;
    }
    async function linker(spec,ref) { let id=spec;if(spec.startsWith('.')){id=path.resolve(path.dirname(ref.identifier),spec);if(!path.extname(id))id+='.ts';}return get(id); }
    async function load(relative){const m=await get(path.join(ROOT,relative));if(m.status==='unlinked')await m.link(linker);if(m.status==='linked')await m.evaluate();return m.namespace;}
    return {load,context,redisData,calls};
}
async function bootstrap() { const m=await modules(); for(const name of handlers){const exports=await m.load(`netlify/functions/${name}${name.endsWith('report')?'':'-submission'}-http.mjs`);assert.ok(Object.keys(exports).some(k=>k.startsWith('handle')));}assert.throws(blocked,/forbidden/);console.log('BOOTSTRAP PASS: eight real handlers; VM network denied; synthetic environment only'); }

class Element extends EventTarget {
    constructor(){super();this.dataset={};this.value='';this.hidden=false;this.disabled=false;this.textContent='';this.checked=false;this.attributes=new Map();}
    setAttribute(k,v){this.attributes.set(k,v);} removeAttribute(k){this.attributes.delete(k);}
    checkValidity(){return true;} reportValidity(){return true;} focus(){} scrollIntoView(){}
}
const SECRET='qa-secret', EMAIL='qa@example.invalid', TOKEN='t'.repeat(43);
const image=()=>new File([new Uint8Array([137,80,78,71])],'image.png',{type:'image/png'});
async function fixture(scope,m){
    const common={idioma_solicitud:'ca',email_contacto:EMAIL,email_verification_token:TOKEN,aceptacion_privacidad:'true','bot-field':''};
    const fields={
        agenda:{titol:'Agenda de prova',resum:'Resum de prova '.repeat(5),descripcio:'Descripcio de prova '.repeat(40),organitzador:'Associacio',lloc:'Plaça Major',data_inici:'2099-01-01',nombre_contacto:'Persona QA'},
        comunicat:{tipus_remitent:'entitat_associacio',autor:'Entitat QA',titol:'Comunicat de prova',resum:'Resum de prova '.repeat(5),contingut:'Contingut de prova '.repeat(40),nombre_contacto:'Persona QA'},
        veu:{titol:'Una veu de prova',resum:'Resum de prova '.repeat(5),contingut:'Contingut de prova '.repeat(40),tipo_autoria:'nom',autor_public:'Persona QA',nombre_contacto:'Persona QA'},
        millora:{categoria:'incidencies',zona:'centre',autor_public:'Persona QA',titol:'Millora de prova',resum:'Resum de prova '.repeat(5),contingut:'Contingut de prova '.repeat(40)},
        'foto-mes':{autor:'Persona QA',titol:'Foto de prova',lloc:'Pineda',aceptacion_autoria_publicacion:'true'},
        'communicat-report':{comunicat_document_id:'comunicat-1',comunicat_slug:'comunicat-prova',motivo:'informacion_falsa'},
        'content-report':{tipo_contenido:'agenda',contenido_document_id:'agenda-1',motivo:'informacion_falsa'},
    };
    if(scope==='comercio'){
        const client=await m.load('src/lib/commerceSubmission.ts');
        return client.buildCommerceFormData({...common,nombre:'Comerç QA',categoria_document_id:'cat_qa',descripcion_corta:'Descripcio curta',descripcion_completa:'Descripcio completa',direccion:'Carrer Major 1',telefono:'600000000',atencion_presencial:true,atencion_domicilio:false,atencion_online:false,recogida_local:false,reparto:false,horario_semanal:['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map((dia,i)=>i===0?{dia,cerrado:false,apertura_1:'09:00',cierre_1:'13:00'}:{dia,cerrado:true}),servicios:[{nombre:'Servei',descripcion:'Descripcio'}],redes_sociales:[],nombre_contacto:'Persona QA',aceptacion_privacidad:true,imagen_principal:image(),galeria:[]});
    }
    if(scope.endsWith('report'))delete common.aceptacion_privacidad;
    const form=new FormData();for(const [k,v]of Object.entries({...common,...fields[scope]}))form.set(k,v);
    if(scope==='foto-mes')form.set('imatge',image());
    return form;
}
const cases=[
 ['201',()=>new Response(JSON.stringify({ok:true}),{status:201}),true],
 ['201-extra',()=>new Response(JSON.stringify({other:1,ok:true}),{status:201}),true],
 ...[false,undefined,'true',1].map(ok=>['ok-'+String(ok),()=>new Response(JSON.stringify({ok}),{status:201}),false]),
 ...[null,[], 'string',1,true].map(v=>['shape-'+JSON.stringify(v),()=>new Response(JSON.stringify(v),{status:201}),false]),
 ...['{','<html>',''].map(v=>['body-'+v,()=>new Response(v,{status:201}),false]),
 ...[204,200,202,400,401,404,429,500,503].map(status=>['status-'+status,()=>new Response(status===204?null:'{"ok":true}',{status}),false]),
];
async function contractTests(functions=false) {
    let count=0;const failures=[];
    for(const scope of (functions?handlers:['agenda']))for(const [name,response,success]of cases){
        const c=clock();const m=await modules({...c,fetch:async()=>response()});
        try {
            if(functions){
                const core=await m.load('netlify/functions/_shared/verification-core.mjs');
                m.redisData.set('guiapineda:verification:token:'+core.hashVerificationValue(SECRET,'token',scope,TOKEN),core.hashVerificationValue(SECRET,'email',EMAIL));
                const exports=await m.load(`netlify/functions/${scope}${scope.endsWith('report')?'':'-submission'}-http.mjs`);
                const handle=Object.entries(exports).find(([k])=>k.startsWith('handle'))[1];
                const result=await handle(new Request('https://frontend.invalid/api',{method:'POST',body:await fixture(scope,m)}));
                const body=await result.json();assert.equal(result.status,success?201:503,JSON.stringify(body));assert.equal(body.ok,success);assert.equal(m.calls.getdel,1);
            }else{
                const transport=await m.load('netlify/functions/_shared/strapi-submission.mjs');
                const run=()=>transport.createInternalStrapiSubmission({payload:{},rawUrl:'https://strapi.invalid',secret:'s'.repeat(32),section:scope,label:'QA'});
                if(success)await run();else await assert.rejects(run);
            }
            assert.equal(c.pending.size,0);count++;
        }catch(error){failures.push(`${scope}/${name}: ${error.message}`);}
    }
    if(failures.length)throw new Error(failures.join('\n'));console.log(`CONTRACT PASS: ${count} ${functions?'handler':'unit'} cases`);
}

async function deadlineTests(functions=false){
    for(const scope of (functions?handlers:['agenda']))
    for(const name of ['headers','body','parse','network','interrupted']){
        const c=clock(); let signal, settled=false, accepted=false, publicStatus, consumes;
        const m=await modules({...c,fetch:async(_url,options)=>{signal=options.signal;
            if(name==='network')throw new Error('synthetic network');
            if(name==='headers')return new Promise(()=>{});
            return {status:201,json:async()=>{
                if(name==='body')return new Promise(()=>{});
                if(name==='interrupted')throw new Error('synthetic body interruption');
                c.elapse(15001);return {ok:true};
            }};
        }});
        const t=await m.load('netlify/functions/_shared/strapi-submission.mjs');
        let run=()=>t.createInternalStrapiSubmission({payload:{},rawUrl:'https://strapi.invalid',secret:'s'.repeat(32),section:'agenda',label:'QA'});
        if(functions){
            const core=await m.load('netlify/functions/_shared/verification-core.mjs');
            m.redisData.set('guiapineda:verification:token:'+core.hashVerificationValue(SECRET,'token',scope,TOKEN),core.hashVerificationValue(SECRET,'email',EMAIL));
            const exports=await m.load(`netlify/functions/${scope}${scope.endsWith('report')?'':'-submission'}-http.mjs`);
            const handle=Object.entries(exports).find(([k])=>k.startsWith('handle'))[1];
            const request=new Request('https://frontend.invalid/api',{method:'POST',body:await fixture(scope,m)});
            run=async()=>{const response=await handle(request);publicStatus=response.status;consumes=m.calls.getdel;throw new Error('public failure confirmed');};
        }
        const result=run().then(()=>{accepted=true;settled=true;},()=>{settled=true;});
        for(let i=0;i<100 && !signal && !settled;i++)await new Promise(resolve=>setImmediate(resolve));
        c.advance(15001);for(let i=0;i<30;i++)await Promise.resolve();
        assert.equal(settled,true,`${name}: deadline did not settle`);await result;
        if(functions){assert.equal(publicStatus,503);assert.equal(consumes,1);}
        assert.equal(accepted,false,`${name}: false success`);assert.equal(c.pending.size,0);
        if(['headers','body'].includes(name))assert.equal(signal.aborted,true);
    }
    console.log('DEADLINE PASS: headers/body ignoring abort, late parse, network, interrupted body');
}

async function clientFixture(scope='agenda',language='ca'){
    const elements=new Map();const form=new Element(),block=new Element(),email=new Element(),feedback=new Element();
    email.value=EMAIL;block.dataset={verificationScope:scope,verificationLanguage:language,submissionFeedbackTarget:scope+'-submit-error',submissionSafeMessage:'safe',submissionInvalidMessage:'invalid',submissionUncertainMessage:'uncertain'};
    for(const name of ['request','resend','confirm','code-step','code','success','error','token'])elements.set(`[data-verification-${name}]`,new Element());
    block.querySelector=selector=>elements.get(selector)??null;
    form.querySelector=selector=>selector==='[data-email-verification]'?block:selector==='[name="email_contacto"]'?email:selector==='#'+scope+'-submit-error'?feedback:null;
    form.matches=selector=>selector===`[data-${scope}-submission-flow]`;
    const storage=new Map();const sessionStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
    email.name='email_contacto';email.type='email';form.elements={namedItem:name=>name==='email_contacto'?email:null};
    const waits=[];const c=clock();let submissions=0,verifications=0, response=()=>new Response('{"ok":false,"reason":"submission:unavailable"}',{status:503});const navigations=[];
    class FormDataDouble {constructor(received){assert.equal(received,form);}}
    const m=await modules({...c,sessionStorage,HTMLInputElement:Element,HTMLTextAreaElement:class {},HTMLSelectElement:class {},RadioNodeList:class {},queueMicrotask,FormData:FormDataDouble,window:{setTimeout:(fn,ms)=>{waits.push(ms);fn();return 1;},location:{assign:url=>navigations.push(url)}},document:{getElementById:()=>null},fetch:async(url)=>{
        if(url.endsWith('request-code'))return new Response(JSON.stringify({ok:true,challengeId:'challenge',expiresIn:600}));
        if(url.endsWith('verify-code'))return new Response(JSON.stringify({ok:true,token:'token-'+ ++verifications,expiresIn:600}));
        submissions++;return response();
    }});
    const controller=await m.load('src/lib/emailVerificationController.ts');const transport=await m.load('src/lib/netlifySubmission.ts');
    const api=controller.initEmailVerificationController(form);
    let clearDraft=()=>{};
    if(scope!=='foto-mes'){const draft=await m.load('src/lib/submissionDraft.ts');clearDraft=draft.initSubmissionDraft(form,scope,['email_contacto']);form.dispatchEvent(new Event('input'));}
    const draftBefore=JSON.stringify([...storage]);
    async function verify(){elements.get('[data-verification-request]').dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));elements.get('[data-verification-code]').value='123456';elements.get('[data-verification-confirm]').dispatchEvent(new Event('click'));await new Promise(resolve=>setImmediate(resolve));assert.equal(api.isVerified(),true);}
    return {form,block,email,feedback,elements,c,controller,transport,api,verify,navigations,waits,storage,draftBefore,clearDraft,setResponse:fn=>response=fn,submissions:()=>submissions};
}
async function recoveryTests(){
    for(const scope of handlers.slice(0,5))for(const reason of ['verification:required','verification:invalid','submission:unavailable']){
        const f=await clientFixture(scope);
        const content={text:'Aportació',select:'centre',consent:true,files:[image()],draft:'existing draft'};
        f.form.content=content;const before=structuredClone(content);const file=content.files[0];
        f.form.reset=()=>assert.fail('Whole form reset forbidden');let edits=0;
        for(const event of ['input','change','reset'])f.form.addEventListener(event,()=>edits++);
        await f.verify();assert.equal(f.controller.initEmailVerificationController(f.form),f.api,'controller must be reused');
        let resets=0;f.form.addEventListener('guiapineda:email-verification-change',()=>resets++);
        f.setResponse(()=>new Response(JSON.stringify({ok:false,reason}),{status:reason.startsWith('verification')?400:503}));
        await assert.rejects(()=>f.transport.submitVerifiedSubmissionForm(f.form,{successUrl:'/success',minimumDuration:0}));
        assert.equal(f.api.isVerified(),false);assert.equal(f.api.getToken(),'');assert.equal(f.elements.get('[data-verification-code]').value,'');assert.equal(f.c.pending.size,0);assert.equal(resets,1);assert.equal(f.submissions(),1);assert.equal(f.email.value,EMAIL);assert.equal(f.elements.get('[data-verification-request]').hidden,false);
        assert.equal(JSON.stringify([...f.storage]),f.draftBefore);assert.equal(edits,0);assert.equal(f.form.content,content);assert.equal(content.files[0],file);assert.equal(content.text,before.text);assert.equal(content.select,before.select);assert.equal(content.consent,true);assert.equal(content.draft,before.draft);
        await f.verify();assert.notEqual(f.api.getToken(),'token-1');assert.equal(f.submissions(),1,'Verification must not resubmit');
        f.setResponse(()=>new Response('{"ok":true}',{status:201}));
        await f.transport.submitVerifiedSubmissionForm(f.form,{successUrl:'/success',minimumDuration:0,navigation:'caller'});
        f.clearDraft();assert.equal(f.storage.size,0);assert.equal(f.submissions(),2);assert.equal(f.navigations.length,0);f.api.reset();assert.equal(f.c.pending.size,0);
    }
    console.log('RECOVERY PASS: five scopes, invalid/required/post, controller reuse and unique reset');
}

async function tokenReuseTests(){
 for(const scope of handlers){
    const m=await modules({fetch:async()=>new Response('{"ok":true}',{status:201})});
    const core=await m.load('netlify/functions/_shared/verification-core.mjs');
    m.redisData.set('guiapineda:verification:token:'+core.hashVerificationValue(SECRET,'token',scope,TOKEN),core.hashVerificationValue(SECRET,'email',EMAIL));
    const exports=await m.load(`netlify/functions/${scope}${scope.endsWith('report')?'':'-submission'}-http.mjs`);
    const handle=Object.entries(exports).find(([k])=>k.startsWith('handle'))[1];
    for(const status of [201,400]){const response=await handle(new Request('https://frontend.invalid/api',{method:'POST',body:await fixture(scope,m)}));assert.equal(response.status,status);}
    assert.equal(m.calls.getdel,2);
 }
 console.log('TOKEN PASS: eight scopes reject second GETDEL use');
}

async function safeTests(){
 for(const scope of handlers.slice(0,5)){
  const f=await clientFixture(scope);await f.verify();const token=f.api.getToken();const timers=f.c.pending.size;
  f.setResponse(()=>new Response('{"ok":false,"reason":"request:too-large"}',{status:413}));
  await assert.rejects(()=>f.transport.submitVerifiedSubmissionForm(f.form,{successUrl:'/success',minimumDuration:0}),error=>error.kind==='pre-consumption-safe');
  assert.equal(f.api.getToken(),token);assert.equal(f.api.isVerified(),true);assert.equal(f.c.pending.size,timers);
  f.c.advance(600001);assert.equal(f.api.isVerified(),false);await f.verify();f.email.value='other@example.invalid';f.email.dispatchEvent(new Event('input'));assert.equal(f.api.isVerified(),false);
 }
 console.log('SAFE PASS: valid token preserved, expiry and email edits still invalidate');
}

async function ambiguityTests(){
 for(const scope of handlers.slice(0,5))for(const response of [()=>Promise.reject(new Error('private-network-detail')),()=>new Response('bad-json',{status:201}),()=>new Response('{"ok":false,"reason":"verification:unavailable"}',{status:503}),()=>new Response('{"ok":false,"reason":"unknown-private-value"}',{status:429})]){
  const f=await clientFixture(scope);await f.verify();f.setResponse(response);
  await assert.rejects(()=>f.transport.submitVerifiedSubmissionForm(f.form,{successUrl:'/success',minimumDuration:0}),error=>error.kind==='ambiguous' && !JSON.stringify(error).includes('private'));
  assert.equal(f.api.isVerified(),false);assert.equal(f.feedback.textContent,'uncertain');assert.equal(f.submissions(),1);assert.equal(JSON.stringify([...f.storage]),f.draftBefore);
 }
 console.log('AMBIGUOUS PASS: network, invalid JSON, uncertain verification, unknown response');
}

async function classificationTests(){
 const m=await modules();const {classifySubmissionFailure:classify}=await m.load('src/lib/netlifySubmission.ts');
 const contract=await fs.readFile(path.join(ROOT,'specs/012-verified-submission-reliability/contracts/submission-reliability.md'),'utf8');
 const required=['missing','type','empty','control-characters','too-short','too-long'],optional=['type','control-characters','too-long'];let count=0;
 const expect=(scope,status,reason,kind)=>{assert.equal(classify(scope,status,{ok:false,reason}).kind,kind,scope+'/'+status+'/'+reason);count++;};
 for(const scope of handlers.slice(0,5)){
  for(const [status,reasons]of [[405,['request:method-not-allowed']],[415,['request:unsupported-media-type','image:unsupported-type']],[413,['request:too-large','image:too-large']],[400,['request:invalid-form-data','request:duplicate-field','request:unexpected-file','image:invalid','image:empty']]])for(const reason of reasons){expect(scope,status,reason,'pre-consumption-safe');expect(scope,500,reason,'ambiguous');}
  const row=contract.split('\n').find(line=>line.startsWith('| '+scope+' |') && line.includes(scope==='foto-mes'?'autor |':'idioma_solicitud'));
  const columns=row.split('|').map(x=>x.trim());
  for(const [fieldList,suffixes]of [[columns[2],required],[columns[3],optional]])if(fieldList!=='ninguno')for(const field of fieldList.split(', '))for(const suffix of suffixes)expect(scope,400,field+':'+suffix,'pre-consumption-safe');
  const extra=contract.split('- '+scope+': ')[1].split(/\n- |\n\nEvidencia/)[0];
  assert.ok(extra);
  for(const reason of extra.replaceAll('\n',' ').replace(/\.$/,'').split(',').map(x=>x.trim()))expect(scope,400,reason,'pre-consumption-safe');
  expect(scope,400,'unlisted-field:missing','ambiguous');expect(scope,429,'request:too-large','ambiguous');
  expect(scope,400,'verification:invalid','verification-invalid');expect(scope,503,'submission:unavailable','post-consumption-failure');expect(scope,503,'verification:unavailable','ambiguous');
  assert.equal(classify(scope,400,{ok:true,reason:'request:invalid-form-data'}).kind,'ambiguous');
  const exports=await m.load(`netlify/functions/${scope}-submission-http.mjs`);const handle=Object.entries(exports).find(([k])=>k.startsWith('handle'))[1];
  const form=await fixture(scope,m);form.set('idioma_solicitud','xx');const before=m.calls.getdel;const response=await handle(new Request('https://frontend.invalid',{method:'POST',body:form}));const body=await response.json();assert.equal(response.status,400);assert.equal(classify(scope,400,body).kind,'pre-consumption-safe');assert.equal(m.calls.getdel,before);
 }
 console.log(`CLASSIFICATION PASS: ${count} finite tuples plus real parser rejection per scope`);
}
const REAL_DIST = path.join(ROOT, "dist");
const REAL_ASTRO = path.join(ROOT, ".astro");
const QA_ROOT_PREFIX = ".recovery-012-qa-";
const QA_ROOT_TEMPLATE = path.join(ROOT, QA_ROOT_PREFIX);
const QA_MARKER_NAME = ".feature-012-owner.json";
const QA_COPY_ENTRIES = Object.freeze(["src", "public", "astro.config.mjs", "tsconfig.json", "package.json", "package-lock.json"]);
const QA_CONTRACT = "feature-012-isolated-qa-root-v1";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OWNER = Object.freeze({ feature: "012-verified-submission-reliability", contract: QA_CONTRACT, version: 1 });

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
        seen.add(key); response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify(cmsFixture(key)));
    });
    let passed = false; let qaRoot; let identity; let generatedOwned = []; let primaryError; let cleanupError;
    const cleanup=createCleanupCoordinator("build");
    cleanup.add("cms-double",async()=>{await closeServer(server);if(port!==undefined)assert.equal(await portFree(port),true,"CMS double listener was not released");});
    cleanup.add("failed-qa-root",async()=>{if(!passed&&qaRoot&&identity)await removeOwnedQaRoot(qaRoot,identity);});
    try {
        ({ qaRoot, identity } = await createQaRoot(realAstroManifest));
        await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);}); port = server.address().port;
        if(injectFailure)throw new Error("injected build failure after owned resources were created");
        const result = await runChild(process.execPath, [path.join(ROOT, "node_modules/astro/bin/astro.mjs"), "build", "--root", qaRoot], { env: { PATH: process.env.PATH, HOME: os.tmpdir(), ASTRO_TELEMETRY_DISABLED: "1", STRAPI_URL: `http://127.0.0.1:${port}` } });
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
    const profile=await mkdtemp(path.join(os.tmpdir(),`guiapineda-recovery-012-${label}-`));
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

function cmsFixture(key){
 const collection=new URL(key,'http://fixture').pathname.split('/').at(-1);
 const category={id:1,documentId:'cat_qa',nombre:'Categoria QA',slug:'categoria-qa'};
 const common={id:1,documentId:'fixture-1',slug:'fixture-qa',titol:'Contingut de prova',resum:'Resum de prova',contingut:'Contingut de prova',autor:'Persona QA',autor_public:'Persona QA',publishedAt:'2026-01-01T00:00:00Z',createdAt:'2026-01-01T00:00:00Z',data_publicacio:'2026-01-01',visible:true};
 const data={home:[], 'categoria-comercios':[category],subcategorias:[],comercios:[{...common,nombre:'Comerç QA',categoria:category,descripcion_corta:'Descripcio',descripcion_completa:'Descripcio',direccion:'Carrer Major',horario_semanal:[],servicios:[],redes_sociales:[]}],comunicats:[{...common,tipus_remitent:'entitat_associacio'}],agendas:[{...common,data_inici:'2099-01-01',lloc:'Pineda',organitzador:'Entitat'}],veus:[common],millores:[{...common,categoria:'incidencies',zona:'centre'}]}[collection];
 assert.ok(data,collection);return {data,meta:{pagination:{page:1,pageSize:100,pageCount:1,total:data.length}}};
}
async function evaluate(cdp,expression){
 const result=await cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;
}

function installRecoveryShim(){
 const nativeFetch=window.fetch.bind(window);const state={mode:'post',submissions:[],tokens:0,used:[],events:0};window.__qa012=state;
 document.addEventListener('guiapineda:email-verification-change',()=>state.events++,true);
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status});
 window.fetch=async(input,init={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.href);
  if(url.pathname==='/api/verification/request-code')return reply({ok:true,challengeId:'challenge-012',expiresIn:600});
  if(url.pathname==='/api/verification/verify-code'){
   const data=JSON.parse(init.body);if(data.code!=='123456')return reply({ok:false},400);
   return reply({ok:true,token:'token-012-'+ ++state.tokens,expiresIn:600});
  }
  if(url.pathname.startsWith('/api/submissions/')){
   if(!(init.body instanceof FormData))throw new Error('Expected real FormData');
   const token=init.body.get('email_verification_token');state.submissions.push({url:url.pathname,token,fields:[...init.body.keys()]});
   if(state.mode==='safe')return reply({ok:false,reason:'request:too-large'},413);
   if(state.used.includes(token))return reply({ok:false,reason:'verification:invalid'},400);state.used.push(token);
   if(state.mode==='invalid')return reply({ok:false,reason:'verification:invalid'},400);
   if(state.mode==='post')return reply({ok:false,reason:'submission:unavailable'},503);
   if(state.mode==='ambiguous')throw new TypeError('Simulated lost response after receipt');
   return reply({ok:true},201);
  }
  return nativeFetch(input,init);
 };
}
function fillNativeForm(){
 const form=document.querySelector('form:has([data-email-verification])');if(!form)throw new Error('Missing form');window.__form012=form;
 for(const detail of document.querySelectorAll('details'))detail.open=true;
 const radios=new Set();
 for(const el of form.querySelectorAll('input,textarea,select')){
  if(el.type==='hidden'||el.type==='file'||el.hasAttribute('data-verification-code')||el.name==='bot-field')continue;
  if(el.type==='radio'){if(radios.has(el.name))continue;radios.add(el.name);el.checked=true;}
  else if(el.type==='checkbox'){el.checked=true;}
  else if(el.tagName==='SELECT'){el.value=[...el.options].find(o=>o.value)?.value??'';}
  else if(el.type==='email')el.value='qa012@example.invalid';
  else if(el.type==='date')el.value='2099-01-01';
  else if(el.type==='time')el.value=el.name.includes('final')?'12:00':'10:00';
  else if(el.type==='url')el.value='https://example.invalid';
  else if(el.tagName==='TEXTAREA')el.value='Contingut de prova. '.repeat(el.name==='resum'?4:35).slice(0,el.maxLength>0?el.maxLength:1000);
  else el.value=el.type==='tel'?'600000000':'Persona de prova';
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
 }
 return [...form.querySelectorAll('input[type=file]')].map(el=>el.id);
}
function snapshotNative(){
 const form=window.__form012;
 return {fields:[...new FormData(form)].filter(([k])=>k!=='email_verification_token').map(([k,v])=>[k,typeof v==='string'?v:{name:v.name,size:v.size,type:v.type}]),drafts:Object.fromEntries(Object.entries(sessionStorage).filter(([k])=>k.startsWith('guiapineda:submission-draft:')))};
}
async function runBrowser() {
    assert.ok([undefined,"--remaining","--regressions"].includes(process.argv[3]), "Unknown browser selection");
    let ownership=false,qaRoot,identity,profile,imagePath,preview,previewControl,chrome,debugPort,browserCdp,browserSocket,cdp,socket,fetchCdp,fetchSocket;
    const chromePids=new Set(),violations=[],completed=[];
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
        profile=await mkdtemp(path.join(os.tmpdir(),"guiapineda-recovery-012-"));
        previewControl=await createOwnedNodeControl(profile);
        preview=spawn(process.execPath,[path.join(ROOT,"node_modules/astro/bin/astro.mjs"),"preview","--root",qaRoot,"--host","127.0.0.1","--port","4173"],{cwd:ROOT,stdio:"ignore",env:{PATH:process.env.PATH,HOME:profile,ASTRO_TELEMETRY_DISABLED:"1",NODE_OPTIONS:"--require="+previewControl.preload}});
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
        await cdp.send("Page.addScriptToEvaluateOnNewDocument",{source:"("+installRecoveryShim.toString()+")();"});

        fetchCdp.on('Fetch.requestPaused',({requestId,request})=>{
            const url=new URL(request.url);
            if(url.origin==='http://127.0.0.1:4173'&&['GET','HEAD'].includes(request.method))void fetchCdp.send('Fetch.continueRequest',{requestId});
            else if(['data:','blob:'].includes(url.protocol))void fetchCdp.send('Fetch.continueRequest',{requestId});
            else {violations.push(request.url);void fetchCdp.send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
        });
        const routes={
         agenda:['/agenda/envia-una-activitat/','/es/agenda/enviar-una-actividad/','/en/agenda/send-an-activity/'],
         comunicat:['/envia-un-comunicat/','/es/enviar-comunicado/','/en/comunicats/send-an-announcement/'],
         veu:['/veus/envia-la-teva-veu/','/es/veus/envia-tu-voz/','/en/veus/send-your-voice/'],
         millora:['/millorem-pineda/envia-una-millora/','/es/millorem-pineda/enviar-una-mejora/','/en/millorem-pineda/send-an-improvement/'],
         'foto-mes':['/foto-del-mes/','/es/foto-del-mes/','/en/foto-del-mes/'],
        };
        const nav=async route=>{await cdp.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await waitFor(()=>evaluate(cdp,`location.pathname===${JSON.stringify(route)} && !!document.querySelector('[data-email-verification]:not([hidden])')`));};
        const verify=async()=>{
            await evaluate(cdp,`__form012.querySelector('[data-verification-request]').click()`);
            await waitFor(()=>evaluate(cdp,`!__form012.querySelector('[data-verification-code-step]').hidden`));
            await evaluate(cdp,`__form012.querySelector('[data-verification-code]').value='123456';__form012.querySelector('[data-verification-confirm]').click()`);
            await waitFor(()=>evaluate(cdp,`__form012.dataset.emailVerified==='true'`));
        };
        const selectedRoutes=Object.entries(routes).filter(([scope])=>process.argv[3]!=='--regressions' && (process.argv[3]!=='--remaining'||['veu','millora','foto-mes'].includes(scope)));
        for(const [scope,paths]of selectedRoutes)for(let language=0;language<3;language++)for(const failure of ['safe','invalid','post','ambiguous']){
            const id=scope+'/'+['ca','es','en'][language]+'/'+failure;console.log('BROWSER START '+id);
            await nav(paths[language]);await evaluate(cdp,'sessionStorage.clear()');
            const files=await evaluate(cdp,'('+fillNativeForm.toString()+')()');
            const {root}=await cdp.send('DOM.getDocument');
            for(const fileId of files){if(!fileId)continue;const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#'+fileId});await cdp.send('DOM.setFileInputFiles',{nodeId,files:[imagePath]});}
            await evaluate(cdp,`for(let i=0;i<5;i++){for(const button of __form012.querySelectorAll('button[id$="continue"]'))if(button.getClientRects().length&&!button.disabled)button.click();}`);
            await verify();
            const before=await evaluate(cdp,'('+snapshotNative.toString()+')()');
            await evaluate(cdp,`__qa012.mode=${JSON.stringify(failure)};__qa012.events=0;__form012.requestSubmit();__form012.requestSubmit()`);
            await waitFor(()=>evaluate(cdp,`__qa012.submissions.length===1 && !__form012.querySelector('#${scope}-submit-error').hidden`)).catch(async error=>{throw new Error(id+': '+JSON.stringify(await evaluate(cdp,`({state:__qa012,invalid:[...__form012.querySelectorAll(':invalid')].map(x=>({name:x.name,value:x.value})),buttons:[...__form012.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>({id:x.id,disabled:x.disabled}))})`))+error);});
            assert.deepEqual(await evaluate(cdp,'('+snapshotNative.toString()+')()'),before,id+' content changed');
            const result=await evaluate(cdp,`({verified:__form012.dataset.emailVerified,events:__qa012.events,text:__form012.querySelector('#${scope}-submit-error').textContent,expected:__form012.querySelector('[data-email-verification]').dataset[${JSON.stringify(failure==='safe'?'submissionSafeMessage':failure==='invalid'?'submissionInvalidMessage':'submissionUncertainMessage')}],token:__form012.querySelector('[data-verification-token]').value})`);
            assert.equal(result.text,result.expected);assert.ok(result.text);assert.equal(result.verified,failure==='safe'?'true':'false');assert.equal(result.events,failure==='safe'?0:1);
            if(failure!=='safe'){assert.equal(result.token,'');await verify();}
            assert.equal(await evaluate(cdp,'__qa012.submissions.length'),1,'Automatic resend');
            if(failure==='post') {
                await evaluate(cdp,`__qa012.events=0;__form012.requestSubmit();__form012.requestSubmit()`);
                await waitFor(()=>evaluate(cdp,`__qa012.submissions.length===2 && __form012.dataset.emailVerified==='false'`));
                assert.equal(await evaluate(cdp,'__qa012.events'),1,'Successive failure must reset once');
                assert.deepEqual(await evaluate(cdp,'('+snapshotNative.toString()+')()'),before,'Successive failure changed content');
                await evaluate(cdp,'__form012.requestSubmit()');
                assert.equal(await evaluate(cdp,'__qa012.submissions.length'),2,'Invalid authorization reused');
                await verify();
                assert.equal(await evaluate(cdp,'__qa012.submissions.length'),2,'Verification resubmitted');
            }

            await evaluate(cdp,`__qa012.mode='success';__form012.requestSubmit()`);
            await waitFor(()=>evaluate(cdp,`location.pathname===${JSON.stringify(['/enviat/','/es/enviado/','/en/sent/'][language])}`),15000);
            assert.equal(await evaluate(cdp,`sessionStorage.getItem('guiapineda:submission-draft:v1:${scope}')`),null);
            completed.push(id);console.log('BROWSER PASS '+id);
        }
        assert.equal(completed.length,selectedRoutes.length*12);
        if(process.argv[3]!=='--remaining'){
          let regressionCount=0;
          for(const scope of ['comercio','communicat-report','content-report'])for(let language=0;language<3;language++)for(const failure of (scope==='comercio'?['safe','post']:['post'])){
            const prefix=['','/es','/en'][language];
            const route=scope==='comercio'?['/alta-comerc/','/es/alta-comercio/','/en/businesses/add-a-business/'][language]:prefix+(scope==='communicat-report'?'/comunicats/fixture-qa/':'/agenda/fixture-qa/');
            const id=scope+'/'+['ca','es','en'][language]+'/'+failure;console.log('REGRESSION START '+id);
            await nav(route);await evaluate(cdp,'sessionStorage.clear()');
            const files=await evaluate(cdp,'('+fillNativeForm.toString()+')()');
            if(scope==='comercio'){
              await evaluate(cdp,`__form012.querySelector('[data-category-id]').click();__form012.querySelector('[data-attention="presencial"]').click();
                for(const day of __form012.querySelectorAll('.schedule-day')){const closed=day.querySelector('.schedule-closed');closed.checked=false;closed.dispatchEvent(new Event('change',{bubbles:true}));for(const [selector,value]of [['.schedule-open-1','09:00'],['.schedule-close-1','13:00'],['.schedule-open-2',''],['.schedule-close-2','']]){const input=day.querySelector(selector);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}}
                for(const input of __form012.querySelectorAll('input[type=url]')){input.value='https://example.invalid';input.dispatchEvent(new Event('input',{bubbles:true}));}`);
              const {root}=await cdp.send('DOM.getDocument');
              for(const fileId of files){if(!fileId)continue;const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#'+fileId});await cdp.send('DOM.setFileInputFiles',{nodeId,files:[imagePath]});}
              await evaluate(cdp,`for(let i=0;i<20;i++)for(const button of __form012.querySelectorAll('button[id$="continue"],button[id$="next"],#signup-start'))if(button.getClientRects().length&&!button.disabled)button.click()`);
            }
            await verify();const before=await evaluate(cdp,'('+snapshotNative.toString()+')()');
            await evaluate(cdp,`__qa012.mode=${JSON.stringify(failure)};__qa012.events=0;__form012.requestSubmit()`);
            await waitFor(()=>evaluate(cdp,'__qa012.submissions.length===1')).catch(async error=>{throw new Error(id+': '+JSON.stringify(await evaluate(cdp,`({state:__qa012,visible:[...__form012.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>({id:x.id,disabled:x.disabled})),invalid:[...__form012.querySelectorAll(':invalid')].map(x=>({name:x.name,id:x.id,value:x.value})),errors:[...__form012.querySelectorAll('[role=alert]')].map(x=>x.textContent)})`))+error);});
            await waitFor(()=>evaluate(cdp,`!__form012.querySelector('[type=submit]').disabled || __form012.dataset.emailVerified==='false'`));
            const result=await evaluate(cdp,`({email:__form012.querySelector('[name=email_contacto]').value,verified:__form012.dataset.emailVerified,events:__qa012.events,endpoint:__qa012.submissions[0].url,bridge:__form012.querySelector('[data-email-verification]').hasAttribute('data-submission-feedback-target')})`);
            assert.equal(result.bridge,false);assert.equal(result.endpoint,'/api/submissions/'+scope);assert.equal(result.email,scope==='content-report'?'':'qa012@example.invalid');
            assert.equal(result.verified,failure==='safe'?'true':'false');assert.equal(result.events,failure==='safe'?0:1);
            const after=await evaluate(cdp,'('+snapshotNative.toString()+')()');
            if(scope==='content-report'){const email=before.fields.find(([k])=>k==='email_contacto');email[1]='';}
            assert.deepEqual(after,before);
            if(scope==='content-report')await evaluate(cdp,`const email=__form012.querySelector('[name=email_contacto]');email.value='qa012@example.invalid';email.dispatchEvent(new Event('input',{bubbles:true}))`);
            if(failure!=='safe')await verify();assert.equal(await evaluate(cdp,'__qa012.submissions.length'),1);
            await evaluate(cdp,`__qa012.mode='success';__form012.requestSubmit()`);
            if(scope==='comercio')await waitFor(()=>evaluate(cdp,`location.pathname===${JSON.stringify(['/enviat/','/es/enviado/','/en/sent/'][language])}`),15000);
            else await waitFor(()=>evaluate(cdp,`__qa012.submissions.length===2 && !document.querySelector('[data-${scope==='content-report'?'content':'communicat'}-report-success]').hidden`));
            regressionCount++;console.log('REGRESSION PASS '+id);
          }
          assert.equal(regressionCount,12);
        }
        assert.deepEqual(violations,[]);
    } catch(error){primaryError=error;}
    try{await cleanup.run(primaryError?"failure":"pass");}catch(error){cleanupError=error;}
    process.off("SIGINT",onSignal);process.off("SIGTERM",onSignal);
    const failure=mergePrimaryAndCleanup(primaryError,cleanupError,"browser");if(failure)throw failure;
    console.log("BROWSER CLEANUP PASS — qa-root/profile removed; preview/Chrome/CDP closed; ports released; real .astro unchanged; real dist absent; zero owned resources");
}

async function transportRegression(){
 for(const name of ['omitted-automatic','explicit-automatic','caller','http-failure','json-failure','invalid-json']){
  const f=await clientFixture('millora');await f.verify();
  const failure=name.endsWith('failure')||name==='invalid-json';
  f.setResponse(()=>new Response(name==='invalid-json'?'bad-json':JSON.stringify({ok:!failure,reason:'submission:unavailable'}),{status:name==='http-failure'?503:name==='json-failure'?200:201}));
  const options={successUrl:'/success',minimumDuration:25};if(name!=='omitted-automatic')options.navigation=name==='explicit-automatic'?'automatic':'caller';
  const run=()=>f.transport.submitVerifiedSubmissionForm(f.form,options);if(failure)await assert.rejects(run);else await run();
  if(!failure)assert.deepEqual(f.waits,[25]);
  assert.equal(f.navigations.length,['omitted-automatic','explicit-automatic'].includes(name)?1:0);f.api.reset();
 }
 const f=await clientFixture();const other=new Element();other.matches=()=>true;
 await assert.rejects(()=>f.transport.submitVerifiedSubmissionForm(other,{successUrl:'/success',minimumDuration:0}),error=>error.kind==='pre-consumption-safe'&&!error.requestStarted);
 assert.equal(f.submissions(),0);
 await f.verify();const originalQuery=f.form.querySelector;f.form.querySelector=selector=>selector==='#agenda-submit-error'?null:originalQuery(selector);
 await assert.rejects(()=>f.transport.submitVerifiedSubmissionForm(f.form,{successUrl:'/success',minimumDuration:0}));
 assert.equal(f.elements.get('[data-verification-error]').textContent,'uncertain');assert.equal(f.elements.get('[data-verification-error]').hidden,false);
 console.log('TRANSPORT PASS: six migrated cases, missing controller blocks fetch, missing target fallback');
}
if(mode==='--bootstrap')await bootstrap();
else if(mode==='--unit'){await contractTests();await deadlineTests();await classificationTests();}
else if(mode==='--functions'){await contractTests(true);await deadlineTests(true);await tokenReuseTests();}
else if(mode==='--dom'){await recoveryTests();await safeTests();await ambiguityTests();await transportRegression();}
else if(mode==='--cleanup-owned'){const {qaRoot,identity}=await discoverOwnedQaRoot();await removeOwnedQaRoot(qaRoot,identity);console.log('Owned QA root removed');}
else if(mode==='--browser')await runBrowser();
else if(mode==='--build')await runBuild();
else if(mode==='--cleanup-probes')await runCleanupProbes();
else if(mode==='--cleanup-case')await runCleanupCase(process.argv[3]);
else if(mode==='--cleanup-signal-child')await runSignalChild();
else if(mode==='--build-failure-probe')await runBuild({injectFailure:true});
else throw new Error(`NOT IMPLEMENTED: ${mode}`);
