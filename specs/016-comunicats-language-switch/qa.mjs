// Feature 016: isolated language navigation; synthetic CMS/HTTP only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode=process.argv[2]??'browser';
assert.ok(['baseline','browser'].includes(mode));
const routes={ca:'/envia-un-comunicat',es:'/es/enviar-comunicado',en:'/en/comunicats/send-an-announcement'};
if(mode==='baseline'){
 const base='5eab8e1ca7e396f521b766a8693f2d683a9fef81';
 const read=p=>execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8'});
 const template=read('src/templates/CommunicatSubmissionPage.astro');
 assert.ok(template.includes('showLanguageSwitcher={false}'));
 assert.ok(!template.includes('import LanguageSwitcher'));
 assert.ok(!read('src/components/CommunicatSubmissionFlow.astro').includes('<nav'));
 for(const route of Object.values(routes))assert.ok(read('src/pages'+route+'.astro').includes('CommunicatSubmissionPage'));
 console.log('BASELINE reproduced: global switch hidden, no local selector; all three existing routes confirmed');
 process.exit(0);
}
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'guiapineda-016-'));
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const fixture = () => ({home:{},'categoria-comercios':[],subcategorias:[],comercios:[],comunicats:[],millores:[],agendas:[],veus:[]});
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

  const fields=['tipus_remitent','autor','titol','resum','contingut','nombre_contacto','email_contacto'];
  const values={tipus_remitent:'particular',autor:'Autora QA 016',titol:'Comunicació sintètica QA 016',resum:'Resum sintètic suficientment llarg per validar la proposta QA.',contingut:'Contingut sintètic de prova per al canvi de llengua. '.repeat(4),nombre_contacto:'Contacte QA',email_contacto:'qa016@example.invalid'};
  const key='guiapineda:submission-draft:v1:comunicat';
  const form='[data-comunicat-submission-flow]';
  let tokenSequence=0; const issued=new Set(), used=new Set(), submissions=[], verificationRequests=[];
  await send('Runtime.enable');
  await send('Runtime.addBinding',{name:'qaTransport'});
  ws.addEventListener('message',async({data})=>{
    const ev=JSON.parse(data);if(ev.method!=='Runtime.bindingCalled'||ev.params.name!=='qaTransport')return;
    const request=JSON.parse(ev.params.payload);let status=200,body={ok:true};
    if(request.path==='/api/verification/request-code'){
      verificationRequests.push(request.body);
      body={ok:true,challengeId:'challenge-'+String(tokenSequence).padStart(32,'0'),expiresIn:600};
    }else if(request.path==='/api/verification/verify-code'){
      assert.equal(request.body.code,'123456');assert.equal(request.body.scope,'comunicat');
      const token='qa016-'+String(++tokenSequence).padStart(32,'0');issued.add(token);body={ok:true,token,expiresIn:900};
    }else if(request.path==='/api/submissions/comunicat'){
      const payload=request.body;assert.ok(issued.has(payload.email_verification_token));assert.ok(!used.has(payload.email_verification_token));
      used.add(payload.email_verification_token);submissions.push(payload);status=201;
    }else{throw Error('Unexpected mocked endpoint '+request.path);}
    await send('Runtime.evaluate',{expression:`window.__qaResolve(${request.id},${status},${JSON.stringify(body)})`,contextId:ev.params.executionContextId});
  });
  function installFixture(){
    const original=window.fetch.bind(window);const pending=new Map();let seq=0;
    window.__qaResolve=(id,status,body)=>{pending.get(id)(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}}));pending.delete(id);};
    window.fetch=(input,options={})=>{
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      if(!url.pathname.startsWith('/api/'))return original(input,options);
      const body=options.body instanceof FormData?Object.fromEntries([...options.body].map(([k,v])=>[k,v instanceof File?{name:v.name,size:v.size}:v])):JSON.parse(options.body);
      return new Promise(resolve=>{const id=++seq;pending.set(id,resolve);window.qaTransport(JSON.stringify({id,path:url.pathname,body}));});
    };
  }
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installFixture.toString()})()`});
  async function click(selector){
    assert.equal(await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||!e.getClientRects().length)return false;e.click();return true})()`),true,selector);
  }
  async function fill(selector,value){await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
  async function snapshot(){return evaluate(`(()=>{const f=document.querySelector('${form}');return {fields:Object.fromEntries(${JSON.stringify(fields)}.map(n=>[n,f.elements.namedItem(n).value])),stored:sessionStorage.getItem('${key}'),files:f.elements.namedItem('imatge').files.length,consent:f.elements.namedItem('aceptacion_privacidad').checked,token:f.querySelector('[data-verification-token]').value,code:f.querySelector('[data-verification-code]').value,verified:f.dataset.emailVerified,language:f.elements.namedItem('idioma_solicitud').value,disabled:document.querySelector('#comunicat-review-send').disabled}})()`);}
  async function verify(){
    await click('[data-verification-request]');
    await until(()=>evaluate(`!document.querySelector('[data-verification-code-step]').hidden`));
    await fill('[data-verification-code]','123456');await click('[data-verification-confirm]');
    await until(()=>evaluate(`document.querySelector('${form}').dataset.emailVerified==='true'`));
  }
  async function review(){await click('#comunicat-author-continue');await click('#comunicat-content-continue');}
  async function navCheck(lang){
    const state=await evaluate(`(()=>{const nav=document.querySelector('[data-comunicat-language-switch] nav');const box=nav?.getBoundingClientRect();return {label:nav?.getAttribute('aria-label'),current:nav?.querySelector('[aria-current=page]')?.textContent.trim(),links:[...nav?.querySelectorAll('a')??[]].map(a=>({lang:a.lang,href:a.getAttribute('href'),hreflang:a.hreflang,tab:a.tabIndex})),visible:!!box&&box.width>0&&box.height>0&&box.left>=0&&box.right<=innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
    assert.equal(state.label,lang==='en'?'Language':'Idioma');assert.equal(state.current,lang.toUpperCase());assert.equal(state.visible,true);assert.equal(state.overflow,false);
    assert.deepEqual(state.links,Object.entries(routes).filter(([code])=>code!==lang).map(([code,href])=>({lang:code,href,hreflang:code,tab:0})));
    await evaluate(`document.querySelector('[data-comunicat-language-switch] a').focus()`);
    assert.equal(await evaluate(`document.activeElement.matches('[data-comunicat-language-switch] a')`),true);
  }
  let journeys=0;
  for(const viewport of [{name:'desktop',width:1280,height:900,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]){
    await send('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1});
    for(const from of Object.keys(routes))for(const to of Object.keys(routes).filter(l=>l!==from)){
      await go(routes[from]);await evaluate('sessionStorage.clear()');await go(routes[from]);
      await navCheck(from);
      await evaluate(`document.querySelector('input[name="tipus_remitent"][value="particular"]').click()`);
      await fill('[name=autor]',values.autor);await click('#comunicat-author-continue');await navCheck(from);
      for(const name of ['titol','resum','contingut'])await fill('[name='+name+']',values[name]);
      await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='),c=>c.charCodeAt(0))],'qa016.png',{type:'image/png'}));const e=document.querySelector('[name=imatge]');e.files=dt.files;e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await click('#comunicat-content-continue');await navCheck(from);
      for(const name of ['nombre_contacto','email_contacto'])await fill('[name='+name+']',values[name]);
      await verify();await click('#comunicat-privacy');
      const before=await snapshot();assert.deepEqual(before.fields,values);assert.equal(before.files,1);assert.equal(before.consent,true);assert.equal(before.verified,'true');assert.ok(before.token);assert.equal(before.disabled,false);
      const draft=JSON.parse(before.stored);assert.deepEqual(draft,{version:1,scope:'comunicat',fields:values});
      const priorSubmissions=submissions.length;
      await click(`[data-comunicat-language-switch] a[lang="${to}"]`);
      await until(()=>evaluate(`location.pathname===${JSON.stringify(routes[to])}&&document.readyState==='complete'&&document.documentElement.lang===${JSON.stringify(to)}`));
      await navCheck(to);const after=await snapshot();
      assert.deepEqual(after.fields,values);assert.equal(after.language,to);assert.equal(after.files,0);assert.equal(after.consent,false);assert.equal(after.token,'');assert.equal(after.code,'');assert.equal(after.verified,'false');assert.equal(after.disabled,true);assert.equal(submissions.length,priorSubmissions);
      assert.deepEqual(JSON.parse(after.stored),draft);
      assert.equal(await evaluate(`document.querySelector('#comunicat-step-author').hidden`),false);
      await review();await verify();const renewed=await snapshot();assert.notEqual(renewed.token,before.token);assert.equal(renewed.disabled,true);
      await click('#comunicat-privacy');assert.equal((await snapshot()).disabled,false);
      await click('#comunicat-review-send');
      const success={ca:'/enviat/',es:'/es/enviado/',en:'/en/sent/'}[to];
      await until(()=>evaluate(`location.pathname===${JSON.stringify(success)}&&document.readyState==='complete'`));
      assert.equal(submissions.length,priorSubmissions+1);const sent=submissions.at(-1);
      for(const name of fields)assert.equal(sent[name],values[name]);
      assert.equal(sent.idioma_solicitud,to);assert.equal(sent.email_verification_token,renewed.token);assert.equal(sent.aceptacion_privacidad,'true');assert.equal(sent.imatge.size,0);
      assert.equal(await evaluate(`sessionStorage.getItem('${key}')`),null);
      await go(routes[to]);assert.equal((await snapshot()).fields.titol,'');
      // Existing reset: clear fresh edited text, consent, verification and draft, then reload.
      await fill('[name=titol]','Reset QA 016');await evaluate(`document.querySelector('${form}').reset()`);
      await until(()=>evaluate(`sessionStorage.getItem('${key}')===null`));
      await go(routes[to]);const reset=await snapshot();assert.equal(reset.fields.titol,'');assert.equal(reset.files,0);assert.equal(reset.consent,false);assert.equal(reset.token,'');assert.equal(reset.verified,'false');
      journeys++;console.log(`DOM ${viewport.name} ${from}->${to}: routes/draft/exclusions/reverification/submission/reset PASS`);
    }
  }
  assert.deepEqual(blocked,[]);assert.equal(verificationRequests.length,journeys*2);
  console.log(`BROWSER PASS: ${journeys} transitions; 24 verifications; 12 submissions; no external services`);
} finally {
  ws?.close();
  if(chrome && chrome.exitCode===null){chrome.kill('SIGTERM');await once(chrome,'exit');}
  if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  await fs.rm(temp,{recursive:true,force:true});
  console.log('CLEANUP: owned Chrome, listener and temporary files removed');
}
