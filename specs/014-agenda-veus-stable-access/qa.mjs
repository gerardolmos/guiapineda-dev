// Feature 014: isolated static builds and real Chrome DOM navigation. No CMS or submissions.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv[2] === 'baseline';
assert.ok(!process.argv[2] || baseline, 'Use no argument or baseline');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'guiapineda-014-'));
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const languages = [
  {lang:'ca', prefix:'', agenda:'Agenda Oberta', veus:'Veus de Pineda', aForm:'/agenda/envia-una-activitat/', vForm:'/veus/envia-la-teva-veu/', about:'/sobre-guiapineda', aEmpty:'Ara mateix no hi ha activitats properes publicades.', vEmpty:'Ara mateix no hi ha cap veu publicada.'},
  {lang:'es', prefix:'/es', agenda:'Agenda Abierta', veus:'Voces de Pineda', aForm:'/es/agenda/enviar-una-actividad/', vForm:'/es/veus/envia-tu-voz/', about:'/es/sobre-guiapineda', aEmpty:'Ahora mismo no hay próximas actividades publicadas.', vEmpty:'Ahora mismo no hay ninguna voz publicada.'},
  {lang:'en', prefix:'/en', agenda:'Open Agenda', veus:'Voices of Pineda', aForm:'/en/agenda/send-an-activity/', vForm:'/en/veus/send-your-voice/', about:'/en/about-guiapineda', aEmpty:'There are currently no upcoming activities published.', vEmpty:'There are currently no voices published.'},
];
const common = {id:1,documentId:'qa014',slug:'qa-014',titol:'QA 014',resum:'Contingut sintètic',contingut:'Contingut sintètic',autor:'QA',autor_public:'QA',publishedAt:'2026-01-01T00:00:00Z',data_publicacio:'2026-01-01',visible:true};
const fixture = (populated) => ({home:{},'categoria-comercios':[],subcategorias:[],comercios:[],comunicats:[],millores:[],agendas:populated?[{...common,data_inici:'2099-01-01',lloc:'Pineda',organitzador:'QA'}]:[],veus:populated?[common]:[]});
async function build(name, populated) {
  const dir=path.join(temp,name); await fs.mkdir(dir);
  for(const entry of ['src','public','astro.config.mjs','tsconfig.json','package.json']) await fs.cp(path.join(root,entry),path.join(dir,entry),{recursive:true});
  await fs.symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'));
  if(baseline) await fs.writeFile(path.join(dir,'src/components/SiteFooter.astro'),execFileSync('git',['show','HEAD:src/components/SiteFooter.astro'],{cwd:root}));
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
  for(const populated of baseline?[false]:[false,true]) builds.push({dist:await build(populated?'populated':'empty',populated),populated});
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
  for(const {dist,populated} of builds){active=dist;
    for(const width of [1280,390]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      for(const l of languages){
        const home=l.prefix||'/';
        for(const source of [home,l.prefix+'/tauler',l.about]){
          await go(source);
          const links=await evaluate(`Array.from(document.querySelectorAll('footer > div:first-child > div:nth-child(2) > ul a'),a=>({href:a.getAttribute('href'),label:a.textContent.trim()}))`);
          assert.deepEqual(links.slice(0,5).map(a=>a.href),[l.prefix+'/tauler',l.prefix||'/',l.about,l.prefix+'/comunicats',l.prefix+'/millorem-pineda']);
          assert.equal(links.length,baseline?5:7);
          if(!baseline)assert.deepEqual(links.slice(5),[{href:l.prefix+'/agenda',label:l.agenda},{href:l.prefix+'/veus',label:l.veus}]);
          if(baseline)assert.equal(await evaluate(`document.querySelectorAll('a[href="${l.prefix}/agenda"],a[href="${l.prefix}/agenda/"],a[href="${l.prefix}/veus"],a[href="${l.prefix}/veus/"]').length`),0);
          const header=await evaluate(`Array.from(document.querySelectorAll('header nav:first-of-type a'),a=>a.getAttribute('href'))`);
          assert.deepEqual(header.slice(0,4),[l.prefix+'/tauler',(l.prefix||'/')+'#categories',l.prefix+'/comunicats',l.prefix+'/millorem-pineda']);
        }
        for(const section of ['agenda','veus']){
          const index=l.prefix+'/'+section, form=section==='agenda'?l.aForm:l.vForm;
          await go(home);
          if(!baseline){
            const selector=`footer a[href="${index}"]`;
            await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
            await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
            assert.equal(await evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)});a.scrollIntoView();a.focus();const r=a.getBoundingClientRect();return document.activeElement===a&&r.width>0&&r.height>0&&a.matches(':focus-visible')})()`),true,'keyboard focus and visible link');
            if(!populated&&l.lang==='ca'&&width===1280&&section==='agenda'){
              const styles=await evaluate(`(async()=>{const current=document.querySelector(${JSON.stringify(selector)});await new Promise(r=>setTimeout(r,250));const added=getComputedStyle(current).outlineStyle;const previous=document.querySelector('footer a[href="/tauler"]');previous.focus();await new Promise(r=>setTimeout(r,250));const existing=getComputedStyle(previous).outlineStyle;current.focus();return {added,existing}})()`);
              assert.equal(styles.added,styles.existing,'preserve existing footer focus styling');
              console.log('FOCUS styling (added/existing): '+JSON.stringify(styles));
            }
            await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter' ,code:'Enter',windowsVirtualKeyCode:13});
            await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
            await until(()=>evaluate(`('/'+location.pathname.split('/').filter(Boolean).join('/'))===${JSON.stringify(index)}&&document.readyState==='complete'`));
          } else await go(index);
          assert.equal(await evaluate(`document.documentElement.lang`),l.lang);
          assert.equal(await evaluate(`document.querySelector('h1').textContent.trim()`),l[section]);
          for(const other of languages.filter(o=>o.lang!==l.lang)) {
            assert.equal(await evaluate(`document.querySelector('footer a[hreflang="${other.lang}"]').getAttribute('href').replace(/\\/$/,'')`),other.prefix+'/'+section);
          }
          if(!populated)assert.equal(await evaluate(`document.body.textContent.includes(${JSON.stringify(section==='agenda'?l.aEmpty:l.vEmpty)})`),true);
          await click(`#main-content a[href="${form}"]`,form);
          assert.equal(await evaluate(`!!document.querySelector('form')&&document.documentElement.lang===${JSON.stringify(l.lang)}`),true);
          if(populated){await go(index);await click(`#main-content a[href="${index}/qa-014"]`,index+'/qa-014');assert.equal(await evaluate(`document.querySelector('h1').textContent.trim()`),'QA 014');}
        }
        await go(l.prefix+'/tauler');
        if(populated){
          assert.equal(await evaluate(`document.querySelectorAll('[data-tauler-item]').length`),2);
          for(const type of ['agenda','veu']){
            await evaluate(`document.querySelector('[data-tauler-filter="${type}"]').click()`);
            assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('[data-tauler-item]')).filter(a=>!a.hidden).map(a=>a.dataset.taulerType)`),[type]);
          }
          await evaluate(`document.querySelector('[data-tauler-filter="all"]').click()`);
          assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-tauler-item]')).filter(a=>!a.hidden).length`),2);
        }
        if(populated){
          for(const section of ['agenda','veus']){await click(`[data-tauler-item] a[href="${l.prefix}/${section}/qa-014"]`,l.prefix+'/'+section+'/qa-014');await go(l.prefix+'/tauler');}
        }
        if(width===390){
          await evaluate(`document.querySelector('#site-menu-button').click()`);
          assert.equal(await evaluate(`document.querySelector('#site-menu-button').getAttribute('aria-expanded')`),'true');
          await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
          assert.equal(await evaluate(`document.querySelector('#site-menu-button').getAttribute('aria-expanded')`),'false');
        }
        assert.equal(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`),true,'no horizontal overflow');
        console.log(`DOM ${baseline?'baseline':populated?'populated':'empty'} ${l.lang} ${width}px: PASS`);
      }
    }
  }
  assert.deepEqual(blocked,[],'No external or API browser requests expected');
  console.log(baseline?'BASELINE: F02 reproduced; empty index CTAs intact in CA/ES/EN':'QA: stable links, localized indices/forms/details, existing navigation, Tauler filters and mobile menu PASS; no external requests');
} finally {
  ws?.close();
  if(chrome && chrome.exitCode===null){chrome.kill('SIGTERM');await once(chrome,'exit');}
  if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  await fs.rm(temp,{recursive:true,force:true});
  console.log('CLEANUP: owned Chrome, listener and temporary files removed');
}
