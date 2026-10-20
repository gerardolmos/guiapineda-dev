// Isolated Feature018: actual Astro header, no application pages/CMS/backend imports.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const baseline=process.argv[2]==='baseline';
assert.ok(!process.argv[2]||baseline);
const cases=[];
for(const lang of ['ca','es','en']){
 const prefix=lang==='ca'?'':'/'+lang;
 const forms={ca:['envia-una-activitat','envia-la-teva-veu'],es:['enviar-una-actividad','envia-tu-voz'],en:['send-an-activity','send-your-voice']}[lang];
 for(const [i,section] of ['agenda','veus'].entries())for(const suffix of ['', '/detall-qa','/'+forms[i]]){
  for(const trailing of ['', '/'])cases.push({lang,route:prefix+'/'+section+suffix+trailing,affected:true,core:trailing==='',expected:null});
 }
 for(const [route,expected] of [['/','guide'],['/categoria-qa','guide'],['/categoria-qa/comercio-qa','guide'],['/tauler','tauler'],['/comunicats','comunicats'],['/comunicats/detall-qa','comunicats'],['/millorem-pineda','millores'],['/millorem-pineda/detall-qa','millores'],['/millorem-pineda/form-qa','millores'],['/foto-del-mes',null],['/404',null],['/agenda-extra','guide'],['/veus-extra','guide']])cases.push({lang,route:prefix+route,expected});
 const aliases={ca:['/sobre-guiapineda','/enviat','/alta-comerc','/envia-un-comunicat'],es:['/sobre-guiapineda','/enviado','/alta-comercio','/enviar-comunicado'],en:['/about-guiapineda','/sent','/businesses/add-a-business','/comunicats/send-an-announcement']}[lang];
 for(const route of aliases)cases.push({lang,route:prefix+route,expected:route.startsWith('/comunicats')?'comunicats':'guide'});
}
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'guiapineda-018-'));
let server,chrome,ws,buildChild;let active;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<150;n++){try{const r=await fn();if(r)return r;}catch{}await sleep(40);}throw Error('Timeout');}
async function stop(child){if(child&&child.exitCode===null){child.kill('SIGTERM');await Promise.race([once(child,'exit'),sleep(1500)]);if(child.exitCode===null){child.kill('SIGKILL');await once(child,'exit');}}}
async function cleanup(){ws?.close();await stop(buildChild);await stop(chrome);if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await fs.rm(temp,{recursive:true,force:true});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{cleanup().finally(()=>process.exit(1));});
async function build(name,old){
 const dir=path.join(temp,name);await fs.mkdir(path.join(dir,'src/pages'),{recursive:true});
 const files=['src/components/SiteHeader.astro','src/components/SiteBrand.astro','src/components/LanguageSwitcher.astro','src/lib/languageSwitcher.ts','src/assets/images/marca.svg','src/assets/images/guiapinedaInv.svg','src/styles/global.css',...['ca','es','en'].map(l=>'src/i18n/'+l+'.json')];
 for(const f of files){await fs.mkdir(path.dirname(path.join(dir,f)),{recursive:true});await fs.copyFile(path.join(root,f),path.join(dir,f));}
 if(old)await fs.writeFile(path.join(dir,'src/components/SiteHeader.astro'),execFileSync('git',['show','HEAD:src/components/SiteHeader.astro'],{cwd:root}));
 await fs.symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'));
 await fs.writeFile(path.join(dir,'package.json'),' {"type":"module"}');
 await fs.writeFile(path.join(dir,'astro.config.mjs'),`import {defineConfig} from 'astro/config';import tailwindcss from '@tailwindcss/vite';export default defineConfig({vite:{plugins:[tailwindcss()]}});`);
 await fs.writeFile(path.join(dir,'src/cases.json'),JSON.stringify(cases));
 await fs.writeFile(path.join(dir,'src/pages/[id].astro'),`---
import Header from '../components/SiteHeader.astro';import '../styles/global.css';import cases from '../cases.json';import ca from '../i18n/ca.json';import es from '../i18n/es.json';import en from '../i18n/en.json';import {getLanguageLinks} from '../lib/languageSwitcher';
export function getStaticPaths(){return cases.map((c,i)=>({params:{id:String(i)},props:c}));}
const {lang,route}=Astro.props;const t={ca,es,en}[lang];const {links}=getLanguageLinks(route);
---
<html lang={lang}><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head><body><Header lang={lang} currentLang={lang} pathname={route} links={links} t={t}/><main><h1>QA synthetic</h1></main></body></html>`);
 await fs.writeFile(path.join(dir,'deny-fetch.mjs'),`globalThis.fetch=()=>{throw Error('Network forbidden in isolated build')};`);
 buildChild=spawn(process.execPath,['--import',path.join(dir,'deny-fetch.mjs'),path.join(root,'node_modules/astro/bin/astro.mjs'),'build'],{cwd:dir,env:{PATH:process.env.PATH,HOME:temp,TMPDIR:temp,ASTRO_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 let out='';buildChild.stdout.on('data',x=>out+=x);buildChild.stderr.on('data',x=>out+=x);const [code]=await once(buildChild,'exit');assert.equal(code,0,out);console.log('BUILD',name,'PASS',cases.length,'synthetic pages');return path.join(dir,'dist');
}
try{
 const old=await build('baseline',true);const current=baseline?old:await build('current',false);active=old;
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');let f=path.resolve(active,'.'+decodeURIComponent(u.pathname));assert.ok(f.startsWith(active+path.sep));if((await fs.stat(f)).isDirectory())f=path.join(f,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(await fs.readFile(f));}catch{res.statusCode=404;res.end();}});
 server.listen(0,'127.0.0.1');await once(server,'listening');const origin='http://127.0.0.1:'+server.address().port;
 const profile=path.join(temp,'chrome');chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--disable-extensions','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 const port=await until(async()=>Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]));
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await once(ws,'open');
 let id=0;const pending=new Map(),blocked=[];
 function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
 ws.addEventListener('message',({data})=>{const e=JSON.parse(data);if(e.id){const p=pending.get(e.id);pending.delete(e.id);e.error?p.reject(Error(JSON.stringify(e.error))):p.resolve(e.result);}else if(e.method==='Fetch.requestPaused'){const {request,requestId}=e.params;if(request.url.startsWith(origin+'/'))void send('Fetch.continueRequest',{requestId});else{blocked.push(request.url);void send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});}}});
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;}
 await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
 async function visit(i,width){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});const url=origin+'/'+i+'/?qa=1#synthetic';await send('Page.navigate',{url});await until(()=>evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'`));if(width===390){await evaluate(`document.querySelector('#site-menu-button').click()`);await until(()=>evaluate(`document.activeElement===document.querySelector('#site-mobile-menu nav a')`));}}
 const snapshot=`(()=>{const h=document.querySelector('#site-header');return {lists:[...h.querySelectorAll('nav')].filter(n=>!n.hasAttribute('data-language-switcher')).map(n=>[...n.querySelectorAll('a')]).filter(a=>a.length===4).map(a=>a.map(x=>{const s=getComputedStyle(x),r=x.getBoundingClientRect();return {text:x.textContent.trim(),href:x.getAttribute('href'),aria:x.getAttribute('aria-current'),cls:x.className,color:s.color,bg:s.backgroundColor,weight:s.fontWeight,box:[r.x,r.y,r.width,r.height]}})),languages:[...h.querySelectorAll('a[hreflang]')].map(x=>[x.textContent.trim(),x.getAttribute('href')]),overflow:document.documentElement.scrollWidth>innerWidth}})()`;
 const snapshots=new Map();let checks=0,affected=0;
 for(const [version,dist] of (baseline?[['baseline',old]]:[['baseline',old],['current',current]])){
 active=dist;
 for(const width of [1280,390])for(let i=0;i<cases.length;i++){
  const c=cases[i];await visit(i,width);const s=await evaluate(snapshot);assert.equal(s.lists.length,2);assert.equal(s.overflow,false);
  const expected=c.affected?(version==='baseline'?'guide':null):c.expected;
  for(const list of s.lists){const index={tauler:0,guide:1,comunicats:2,millores:3}[expected];assert.deepEqual(list.map(x=>x.aria),list.map((_,n)=>n===index?'page':null));}
  const key=width+':'+i;
  if(version==='baseline')snapshots.set(key,s);else{
   const before=snapshots.get(key);assert.deepEqual(s.languages,before.languages);
   if(!c.affected)assert.deepEqual(s,before);
   else {for(let n=0;n<2;n++){for(let j=0;j<4;j++){const a=s.lists[n][j],b=before.lists[n][j];assert.equal(a.text,b.text);assert.equal(a.href,b.href);assert.deepEqual(a.box,b.box);if(j!==1)assert.deepEqual(a,b);}const guide=s.lists[n][1],inactive=s.lists[n][0];assert.equal(guide.color,inactive.color);assert.equal(guide.bg,inactive.bg);assert.equal(guide.weight,inactive.weight);}if(c.core)affected++;}
  }
  if(width===390){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});assert.equal(await evaluate(`document.querySelector('#site-mobile-menu').hidden&&document.activeElement.id==='site-menu-button'`),true);await evaluate(`document.querySelector('#site-menu-button').click()`);await until(()=>evaluate(`document.activeElement===document.querySelector('#site-mobile-menu nav a')`));assert.equal(await evaluate(`(()=>{const a=document.querySelector('#site-mobile-menu nav a');a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();return document.querySelector('#site-mobile-menu').hidden})()`),true);}
  checks++;
 }
 console.log('BROWSER',version,'PASS',cases.length*2,'route/viewport checks');
 }
 assert.equal(blocked.length,0,JSON.stringify(blocked));if(!baseline)assert.equal(affected,36);
 console.log('RESULT PASS',JSON.stringify({checks,coreAffected:affected,queriesHashes:true,computedVisualComparison:!baseline,mobileFocusEscapeLinkClose:true,externalRequests:blocked.length}));
}finally{await cleanup();console.log('CLEANUP PASS: owned browser/server/temp removed');}
