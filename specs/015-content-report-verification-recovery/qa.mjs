// Feature 015: classifier and isolated real browser recovery. Synthetic boundaries only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode=process.argv[2]??'unit';
assert.ok(['baseline','unit','browser'].includes(mode));
const base='b8a617c45de66db35bd1b8fbc4e3e9eb740b7e55';
if(mode==='baseline'){
 const source=execFileSync('git',['show',base+':src/lib/contentReportFlow.ts'],{cwd:root,encoding:'utf8'});
 const fn=source.slice(source.indexOf('export function classifyContentReportResponse'),source.indexOf('function initForm')).replace('export function','function');
 const classify=vm.runInNewContext(stripTypeScriptTypes(fn)+';classifyContentReportResponse');
 for(const reason of ['verification:required','verification:invalid']){
  assert.equal(classify(400,{ok:false,reason}),'invalidReference');
  console.log('BASELINE reproduced: '+reason+' -> invalidReference (expected recovery: verificationRequired)');
 }
 process.exit(0);
}
if(mode==='unit'){
 const {classifyContentReportResponse:classify}=await import(pathToFileURL(path.join(root,'src/lib/contentReportFlow.ts')));
 const cases=[];
 for(const reason of ['verification:required','verification:invalid']){
  cases.push([400,{ok:false,reason},'verificationRequired']);
  for(const body of [{reason},{ok:true,reason},{ok:0,reason},[{ok:false,reason}]])cases.push([400,body,'invalidReference']);
  for(const status of [200,401,403,404,500,503])cases.push([status,{ok:false,reason},'unavailable']);
 }
 for(const reason of ['report:invalid-reference','report:invalid-reason','report:honeypot','report:forbidden-field','request:invalid-form-data','verification:unavailable','verification:invalid-extra','unknown'])cases.push([400,{ok:false,reason},'invalidReference']);
 for(const body of [null,[],{},'verification:invalid',{ok:false}, {ok:false,reason:12}])cases.push([400,body,'invalidReference']);
 cases.push([201,{ok:true},'success'],[201,null,'unavailable'],[201,{ok:false},'unavailable'],[200,{ok:true},'unavailable'],[429,{ok:false},'limited'],[503,{ok:false,reason:'submission:unavailable'},'unavailable']);
 for(const [status,body,expected] of cases)assert.equal(classify(status,body),expected,JSON.stringify({status,body}));
 console.log('UNIT PASS: '+cases.length+' strict classification cases');process.exit(0);
}
const baseline=false;
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'guiapineda-015-'));
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const languages = [
  {lang:'ca', prefix:'', agenda:'Agenda Oberta', veus:'Veus de Pineda', aForm:'/agenda/envia-una-activitat/', vForm:'/veus/envia-la-teva-veu/', about:'/sobre-guiapineda', aEmpty:'Ara mateix no hi ha activitats properes publicades.', vEmpty:'Ara mateix no hi ha cap veu publicada.'},
  {lang:'es', prefix:'/es', agenda:'Agenda Abierta', veus:'Voces de Pineda', aForm:'/es/agenda/enviar-una-actividad/', vForm:'/es/veus/envia-tu-voz/', about:'/es/sobre-guiapineda', aEmpty:'Ahora mismo no hay próximas actividades publicadas.', vEmpty:'Ahora mismo no hay ninguna voz publicada.'},
  {lang:'en', prefix:'/en', agenda:'Open Agenda', veus:'Voices of Pineda', aForm:'/en/agenda/send-an-activity/', vForm:'/en/veus/send-your-voice/', about:'/en/about-guiapineda', aEmpty:'There are currently no upcoming activities published.', vEmpty:'There are currently no voices published.'},
];
const common = {id:1,documentId:'qa015',slug:'qa-015',titol:'QA 015',resum:'Contingut sintètic',contingut:'Contingut sintètic',autor:'QA',autor_public:'QA',publishedAt:'2026-01-01T00:00:00Z',data_publicacio:'2026-01-01',visible:true};
const category={id:1,documentId:'cat015',nombre:'Categoria QA',slug:'categoria-qa',activa:true};
const fixture = () => ({home:{},'categoria-comercios':[category],subcategorias:[],comercios:[{...common,activo:true,nombre:'Comercio QA',categoria:category,descripcion_corta:'Sintetico',direccion:'Pineda',horario_semanal:[],servicios:[],redes_sociales:[]}],comunicats:[{...common,tipus_remitent:'particular'}],millores:[{...common,categoria:'incidencies',zona:'centre'}],agendas:[{...common,data_inici:'2099-01-01',lloc:'Pineda',organitzador:'QA'}],veus:[common]});
async function build(name, populated) {
  const dir=path.join(temp,name); await fs.mkdir(dir);
  for(const entry of ['src','public','astro.config.mjs','tsconfig.json','package.json']) await fs.cp(path.join(root,entry),path.join(dir,entry),{recursive:true});
  await fs.symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'));
  const hook=path.join(dir,'fixture.mjs');
  await fs.writeFile(hook,`const fixtures=${JSON.stringify(fixture(populated))};globalThis.fetch=async(input)=>{const u=new URL(typeof input==='string'?input:input.url);if(u.origin!=='http://fixture.invalid'||!u.pathname.startsWith('/api/'))throw new Error('Blocked fetch: '+u);const key=u.pathname.slice(5);if(!Object.hasOwn(fixtures,key))throw new Error('Unexpected collection: '+key);return new Response(JSON.stringify({data:fixtures[key],meta:{pagination:{page:1,pageSize:100,pageCount:1}}}),{headers:{'content-type':'application/json'}})};`);
  const child=spawn(process.execPath,['--import',hook,path.join(root,'node_modules/astro/bin/astro.mjs'),'build'],{cwd:dir,env:{PATH:process.env.PATH,HOME:temp,TMPDIR:temp,STRAPI_URL:'http://fixture.invalid',ASTRO_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',v=>output+=v);child.stderr.on('data',v=>output+=v);
  const [code]=await once(child,'exit');
  if(code!==0) throw new Error(output);
  console.log(`BUILD ${name}: PASS (${output.match(/\d+ page\(s\) built/)?.[0] ?? 'completed'})`);
  return path.join(dir,'dist');
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn) {for(let n=0;n<100;n++){const result=await fn();if(result)return result;await sleep(50);}throw new Error('Timed out');}
let chrome, server, ws;
try {
  const builds=[];
  for(const populated of [true]) builds.push({dist:await build(populated?'populated':'empty',populated),populated});
  let active=builds[0].dist;
  server=http.createServer(async(req,res)=>{
    try {
      let target=path.join(active,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(!target.startsWith(active+path.sep)&&target!==active)throw new Error('Invalid path');
      if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');
      const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(target)]??'application/octet-stream';
      res.writeHead(200,{'content-type':type});res.end(await fs.readFile(target));
    }catch{res.writeHead(404);res.end('Not found');}
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const origin=`http://127.0.0.1:${server.address().port}`;
  const profile=path.join(temp,'chrome');
  chrome=spawn(chromePath,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  const port=await until(async()=>{try{return Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);}catch{return false;}});
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await once(ws,'open');
  let id=0;const pending=new Map(),blocked=[];
  ws.addEventListener('message',({data})=>{const event=JSON.parse(data);if(event.id){const p=pending.get(event.id);pending.delete(event.id);event.error?p.reject(new Error(JSON.stringify(event.error))):p.resolve(event.result);}else if(event.method==='Fetch.requestPaused'){
    const {request,requestId}=event.params;
    if(request.url.startsWith(origin+'/'))void send('Fetch.continueRequest',{requestId});
    else {blocked.push(request.url);void send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}
  }});
  function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
  async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  await send('Page.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  async function go(route){await send('Page.navigate',{url:origin+route});await until(()=>evaluate(`location.pathname===${JSON.stringify(route)} && document.readyState==='complete'`));}
  async function click(selector, route){assert.equal(await evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)});if(!a)return false;a.click();return true;})()`),true,selector);await until(()=>evaluate(`('/'+location.pathname.split('/').filter(Boolean).join('/'))===${JSON.stringify(route.replace(/\/$/,''))} && document.readyState==='complete'`));}
  function installFixture(){
    const native=window.fetch.bind(window);
    const state={requests:[],tokens:0,issued:[],used:[],failure:{status:400,reason:'verification:invalid'},unexpected:[]};window.__qa015=state;
    const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
    window.fetch=async(input,init={})=>{
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      if(url.pathname==='/api/verification/request-code')return reply({ok:true,challengeId:'challenge-'+String(state.tokens).padStart(32,'0'),expiresIn:600});
      if(url.pathname==='/api/verification/verify-code'){
        const data=JSON.parse(init.body);if(data.code!=='123456')return reply({ok:false,reason:'code:invalid'},400);
        const token='token-'+String(++state.tokens).padStart(32,'0');state.issued.push(token);return reply({ok:true,token,expiresIn:900});
      }
      if(url.pathname==='/api/submissions/content-report'){
        const payload=Object.fromEntries(init.body);state.requests.push(payload);
        const token=payload.email_verification_token;
        if(!state.issued.includes(token)||state.used.includes(token))return reply({ok:false,reason:'verification:invalid'},400);
        state.used.push(token);
        if(state.failure)return reply({ok:false,reason:state.failure.reason},state.failure.status);
        return reply({ok:true},201);
      }
      if(url.pathname.startsWith('/api/')){state.unexpected.push(url.pathname);throw Error('Unexpected API request');}
      return native(input,init);
    };
  }
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installFixture.toString()})()`});
  async function fill(selector,value){await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
  async function verify(){
    await fill('[data-report-email]','qa015@example.invalid');
    await evaluate(`document.querySelector('[data-verification-request]').click()`);
    await until(()=>evaluate(`!document.querySelector('[data-verification-code-step]').hidden`));
    await fill('[data-verification-code]','123456');
    await evaluate(`document.querySelector('[data-verification-confirm]').click()`);
    await until(()=>evaluate(`document.querySelector('[data-content-report-form]').dataset.emailVerified==='true'`));
  }
  async function snapshot(){return evaluate(`(()=>{const f=document.querySelector('[data-content-report-form]');return {reason:f.querySelector('[data-report-reason]').value,context:f.querySelector('[data-report-explanation]').value,email:f.querySelector('[data-report-email]').value,code:f.querySelector('[data-verification-code]').value,token:f.querySelector('[data-verification-token]').value,verified:f.dataset.emailVerified,disabled:f.querySelector('[data-report-submit]').disabled,error:f.querySelector('[data-content-report-error]').textContent,expected:f.dataset.verificationRequired,requests:window.__qa015.requests}})()`);}
  let journeys=0;
  for(const l of languages){
    for(const type of ['agenda','veu','millora','comercio']){
      const section={agenda:'agenda',veu:'veus',millora:'millorem-pineda',comercio:'categoria-qa'}[type];
      for(const reason of ['verification:required','verification:invalid']){
        await go(l.prefix+'/'+section+'/qa-015');
        assert.equal(await evaluate(`document.documentElement.lang`),l.lang);
        await evaluate(`document.querySelector('[data-content-report-details]').open=true;window.__qa015.failure={status:400,reason:${JSON.stringify(reason)}}`);
        await fill('[data-report-reason]','otro');await fill('[data-report-explanation]','Context QA 015 preserved');await verify();
        await evaluate(`document.querySelector('[data-report-submit]').click()`);
        await until(()=>evaluate(`!!document.querySelector('[data-content-report-error]').textContent`));
        const failed=await snapshot();
        assert.equal(failed.reason,'otro');assert.equal(failed.context,'Context QA 015 preserved');
        for(const key of ['email','code','token'])assert.equal(failed[key],'',key);
        assert.equal(failed.verified,'false');assert.equal(failed.disabled,true);assert.ok(failed.expected);assert.equal(failed.error,failed.expected);assert.equal(failed.requests.length,1);
        // A user retry action and a synthetic premature submit must not send the stale token.
        await evaluate(`document.querySelector('[data-report-retry]').click();document.querySelector('[data-content-report-form]').requestSubmit()`);
        await sleep(100);assert.equal((await snapshot()).requests.length,1);
        await evaluate(`document.querySelector('[data-content-report-details]').open=false`);
        await sleep(50);await evaluate(`document.querySelector('[data-content-report-details]').open=true`);
        assert.equal((await snapshot()).context,'Context QA 015 preserved');
        await verify();await evaluate(`window.__qa015.failure=null;document.querySelector('[data-report-submit]').click()`);
        await until(()=>evaluate(`!document.querySelector('[data-content-report-success]').hidden`));
        const done=await snapshot();assert.equal(done.requests.length,2);
        assert.notEqual(done.requests[0].email_verification_token,done.requests[1].email_verification_token);
        assert.equal(done.requests[1].explicacion,'Context QA 015 preserved');assert.equal(done.requests[1].tipo_contenido,type);
        assert.deepEqual(await evaluate(`window.__qa015.unexpected`),[]);
        journeys++;
      }
      console.log(`DOM ${l.lang}/${type}: both verification errors, reset, context, new token, no retry PASS`);
    }
  }
  for(const [status,reason,key] of [[400,'report:invalid-reference','invalidReference'],[400,'report:invalid-reason','invalidReference'],[429,'limited','limited'],[503,'submission:unavailable','unavailable']]){
    await go('/agenda/qa-015');await evaluate(`document.querySelector('[data-content-report-details]').open=true;window.__qa015.failure={status:${status},reason:${JSON.stringify(reason)}}`);
    await fill('[data-report-reason]','spam_fraude');await fill('[data-report-explanation]','');await verify();
    await evaluate(`document.querySelector('[data-report-submit]').click()`);await until(()=>evaluate(`!!document.querySelector('[data-content-report-error]').textContent`));
    const snap=await snapshot();assert.equal(snap.error,await evaluate(`document.querySelector('[data-content-report-form]').dataset.${key}`));assert.equal(snap.context,'');assert.equal(snap.reason,'spam_fraude');assert.equal(snap.token,'');assert.equal(snap.requests.length,1);
  }
  assert.deepEqual(blocked,[],'No external browser requests');
  console.log(`BROWSER PASS: ${journeys} recovery journeys + 4 error regressions; real controller, synthetic HTTP; no external services`);
} finally {
  ws?.close();
  if(chrome && chrome.exitCode===null){chrome.kill('SIGTERM');await once(chrome,'exit');}
  if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  await fs.rm(temp,{recursive:true,force:true});
  console.log('CLEANUP: owned Chrome, listener and temporary files removed');
}
