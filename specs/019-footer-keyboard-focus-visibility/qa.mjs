// Isolated Feature019: actual Astro footer/header, no application pages/CMS/backend imports.
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
const probe=process.argv[2]==='probe';
assert.ok(!process.argv[2]||baseline||probe);
const cases=['ca','es','en'].flatMap(lang=>[true,false].map(show=>({lang,show,route:lang==='ca'?'/':'/'+lang})));
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'guiapineda-019-'));
let server,chrome,ws,buildChild;let active;
const sharp=(await import('sharp')).default;
const evidence=baseline?null:await fs.mkdtemp(path.join(os.tmpdir(),'guiapineda019-evidence-'));
const shots=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let n=0;n<150;n++){try{const r=await fn();if(r)return r;}catch{}await sleep(40);}throw Error('Timeout');}
async function stop(child){if(child&&child.exitCode===null){child.kill('SIGTERM');await Promise.race([once(child,'exit'),sleep(1500)]);if(child.exitCode===null){child.kill('SIGKILL');await once(child,'exit');}}}
async function cleanup(){ws?.close();await stop(buildChild);await stop(chrome);if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await fs.rm(temp,{recursive:true,force:true});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{cleanup().finally(()=>process.exit(1));});
async function build(name,old){
 const dir=path.join(temp,name);await fs.mkdir(path.join(dir,'src/pages'),{recursive:true});
 const files=['src/components/SiteHeader.astro','src/components/SiteFooter.astro','src/components/SiteBrand.astro','src/components/LanguageSwitcher.astro','src/lib/languageSwitcher.ts','src/assets/images/marca.svg','src/assets/images/guiapinedaInv.svg','src/styles/global.css',...['ca','es','en'].map(l=>'src/i18n/'+l+'.json')];
 for(const f of files){await fs.mkdir(path.dirname(path.join(dir,f)),{recursive:true});await fs.copyFile(path.join(root,f),path.join(dir,f));}
 if(old)await fs.writeFile(path.join(dir,'src/components/SiteFooter.astro'),execFileSync('git',['show','1808ede5e2b5c2e38baa13c12a3495a63169523d:src/components/SiteFooter.astro'],{cwd:root}));
 await fs.symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'));
 await fs.writeFile(path.join(dir,'package.json'),' {"type":"module"}');
 await fs.writeFile(path.join(dir,'astro.config.mjs'),`import {defineConfig} from 'astro/config';import tailwindcss from '@tailwindcss/vite';export default defineConfig({vite:{plugins:[tailwindcss()]}});`);
 await fs.writeFile(path.join(dir,'src/cases.json'),JSON.stringify(cases));
 await fs.writeFile(path.join(dir,'src/pages/[id].astro'),`---
import Header from '../components/SiteHeader.astro';import Footer from '../components/SiteFooter.astro';import '../styles/global.css';import cases from '../cases.json';import ca from '../i18n/ca.json';import es from '../i18n/es.json';import en from '../i18n/en.json';import {getLanguageLinks} from '../lib/languageSwitcher';
export function getStaticPaths(){return cases.map((c,i)=>({params:{id:String(i)},props:c}));}
const {lang,route,show}=Astro.props;const t={ca,es,en}[lang];const {links}=getLanguageLinks(route);
---
<html lang={lang}><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head><body><Header lang={lang} currentLang={lang} pathname={route} links={links} t={t}/><main style="height:220px"><h1>QA synthetic</h1><button id="before">Before footer</button></main><Footer lang={lang} currentLang={lang} links={links} t={t} showLanguageSwitcher={show}/><button id="after">After footer</button></body></html>`);
 await fs.writeFile(path.join(dir,'deny-fetch.mjs'),`globalThis.fetch=()=>{throw Error('Network forbidden in isolated build')};`);
 buildChild=spawn(process.execPath,['--import',path.join(dir,'deny-fetch.mjs'),path.join(root,'node_modules/astro/bin/astro.mjs'),'build'],{cwd:dir,env:{PATH:process.env.PATH,HOME:temp,TMPDIR:temp,ASTRO_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 let out='';buildChild.stdout.on('data',x=>out+=x);buildChild.stderr.on('data',x=>out+=x);const [code]=await once(buildChild,'exit');assert.equal(code,0,out);console.log('BUILD',name,'PASS',cases.length,'synthetic pages');return path.join(dir,'dist');
}
try{
 const old=await build('baseline',true);const current=baseline?old:await build('current',false);active=old;
 if(!baseline){
  const cssFiles=(await fs.readdir(path.join(current,'_astro'))).filter(f=>f.endsWith('.css'));
  const css=(await Promise.all(cssFiles.map(f=>fs.readFile(path.join(current,'_astro',f),'utf8')))).join('');
  assert.match(css,/footer\[data-astro-cid-[^\]]+\] a:focus-visible\s*\{\s*outline-style:\s*solid\s*;?\s*\}/,'compiled scoped ancestor and global child');
  console.log('COMPILED SCOPE PASS');
 }
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

 async function visit(i,width){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});const url=origin+'/'+i+'/';await send('Page.navigate',{url});await until(()=>evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'`));await evaluate('document.fonts.ready');await sleep(60);}
 async function tab(shift=false){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:shift?8:0});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:shift?8:0});await sleep(220);}
 const inspect=`(()=>{const a=document.activeElement,s=getComputedStyle(a);const r=a.getBoundingClientRect();const bgs=[];const clips=[];for(let p=a.parentElement;p;p=p.parentElement){const c=getComputedStyle(p);if(c.backgroundColor!=='rgba(0, 0, 0, 0)')bgs.push(c.backgroundColor);if(['hidden','clip','scroll','auto'].includes(c.overflowX)||['hidden','clip','scroll','auto'].includes(c.overflowY))clips.push(p.tagName);}
 function rgb(color){const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data].slice(0,3);}
 return {text:a.getAttribute('aria-label')||a.textContent.trim(),href:a.getAttribute('href'),visible:a.matches(':focus-visible'),style:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor,offset:s.outlineOffset,shadow:s.boxShadow,rgb:rgb(s.outlineColor),bgs:bgs.map(rgb),clips,rect:[r.x,r.y,r.width,r.height]};})()`;
 const normal=`(()=>({links:[...document.querySelectorAll('a')].map(a=>{const s=getComputedStyle(a),r=a.getBoundingClientRect();return {text:a.textContent.trim(),href:a.getAttribute('href'),style:s.outlineStyle,color:s.color,bg:s.backgroundColor,box:[r.x,r.y,r.width,r.height]}}),span:[...document.querySelectorAll('footer [aria-current]')].map(a=>[a.tagName,a.textContent.trim(),a.getAttribute('aria-current')])}))()`;
 function lum(rgb){return rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);}
 const normals=new Map(),normalShots=new Map(),headerFocus=new Map(),focused=new Map();let forward=0,reverse=0,minContrast=100,pixelChecks=0;
 async function captureFocus(c,i,width,d,save=true){
  const [x,y,w,h]=d.rect,margin=8;assert.ok(x>=margin&&y>=margin&&x+w+margin<=width&&y+h+margin<=900,'outline viewport clipping');
  const png=Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64');const {data,info}=await sharp(png).raw().toBuffer({resolveWithObject:true});
  const near=(px,py)=>{const index=(py*info.width+px)*info.channels;return d.rgb.every((v,k)=>Math.abs(data[index+k]-v)<25);};
  const off=parseFloat(d.offset);const left=Math.round(x-off-1),right=Math.round(x+w+off),top=Math.round(y-off-1),bottom=Math.round(y+h+off);
  function hit(cx,cy){for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)if(near(cx+dx,cy+dy))return true;return false;}
  const sides=[hit(left,Math.round(y+h/2)),hit(right,Math.round(y+h/2)),hit(Math.round(x+w/2),top),hit(Math.round(x+w/2),bottom)];
  if(!sides.every(Boolean)){await fs.writeFile(path.join(evidence,'failure.png'),png);console.log('PIXEL FAILURE',JSON.stringify({c,i,width,d,sides,evidence}));}
  assert.ok(sides.every(Boolean),'visible outline pixels on all four sides');pixelChecks++;
  if(save&&c.show&&[0,1,8,9,10].includes(i)){
   const crop=await sharp(png).extract({left:Math.floor(x-margin),top:Math.floor(y-margin),width:Math.ceil(w+margin*2),height:Math.ceil(h+margin*2)}).png().toBuffer();
   const filename=`${c.lang}-${width}-${i}.png`;await fs.writeFile(path.join(evidence,filename),crop);shots.push({input:crop,lang:c.lang,width,index:i});
  }
 }
 if(probe){
  active=current;await visit(2,1280);await evaluate(`document.querySelector('#before').focus()`);
  for(let i=0;i<10;i++)await tab();
  await evaluate(`document.activeElement.style.outlineOffset='2px'`);
  const original=await evaluate(inspect);
  console.log('PROBE geometry',await evaluate(`JSON.stringify([...document.querySelectorAll('footer [lang]')].map(a=>{const r=a.getBoundingClientRect(),s=getComputedStyle(a);return {tag:a.tagName,lang:a.lang,rect:[r.x,r.y,r.width,r.height],position:s.position,zIndex:s.zIndex,bg:s.backgroundColor}}))`));
  await assert.rejects(captureFocus(cases[2],9,1280,original),/visible outline pixels/);
  await evaluate(`document.activeElement.style.position='relative';document.activeElement.style.zIndex='1'`);
  await captureFocus(cases[2],9,1280,await evaluate(inspect));
  console.log('PROBE stacking restores pixels; amber versus white contrast',contrast(original.rgb,[255,255,255]));
  await evaluate(`document.activeElement.style.position='';document.activeElement.style.zIndex='';document.activeElement.style.outlineOffset='-2px'`);
  await captureFocus(cases[2],9,1280,await evaluate(inspect));
  console.log('PROBE inset restores pixels without sibling overlap',evidence);
 } else {
 for(const [version,dist] of (baseline?[['baseline',old]]:[['baseline',old],['current',current]])){
 active=dist;
 for(const width of [1280,390])for(let n=0;n<cases.length;n++){
  const c=cases[n],key=width+':'+n;await visit(n,width);const nofocus=await evaluate(normal);const png=(await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data;
  if(version==='baseline'){normals.set(key,nofocus);normalShots.set(key,png);}else{assert.deepEqual(nofocus,normals.get(key));assert.ok(png===normalShots.get(key),'unfocused screenshot unchanged');}
  await evaluate(`document.querySelector('#site-header a').focus()`);const hf=await evaluate(inspect);if(version==='baseline')headerFocus.set(key,hf);else assert.deepEqual(hf,headerFocus.get(key));
  await evaluate(`document.querySelector('#before').focus()`);
  const count=c.show?11:9;assert.equal(await evaluate(`document.querySelectorAll('footer a').length`),count);const list=[];
  for(let i=0;i<count;i++){
   await tab();await evaluate(`document.activeElement.scrollIntoView({block:'center'})`);await sleep(20);const d=await evaluate(inspect);assert.equal(d.visible,true);assert.equal(d.style,version==='baseline'?'none':'solid');assert.equal(d.width,'2px');assert.equal(d.offset,i>=9?(version==='baseline'?'2px':'-2px'):'4px');assert.deepEqual(d.clips,[]);list.push(d);
   if(version==='current'){
    const previous=focused.get(key)[i];assert.equal(d.href,previous.href);assert.equal(d.text,previous.text);assert.equal(d.color,previous.color);assert.equal(d.offset,i>=9?'-2px':previous.offset);
    for(const bg of d.bgs){const ratio=contrast(d.rgb,bg);assert.ok(ratio>=3,'contrast');minContrast=Math.min(minContrast,ratio);}
    await captureFocus(c,i,width,d);forward++;
   }
  }
  if(version==='baseline')focused.set(key,list);
  for(let i=count-2;i>=0;i--){await tab(true);await evaluate(`document.activeElement.scrollIntoView({block:'center'})`);const d=await evaluate(inspect);assert.equal(d.href,list[i].href);assert.equal(d.text,list[i].text);assert.equal(d.visible,true);assert.equal(d.style,version==='baseline'?'none':'solid');if(version==='current'){await captureFocus(c,i,width,d,false);reverse++;}}
  console.log('CASE',version,c.lang,width,c.show,count,'PASS');
 }
 }
 assert.equal(blocked.length,0);if(!baseline){assert.equal(forward,120);assert.equal(reverse,108);
  // Contact sheet of actual focused screenshots, grouped by language/viewport.
  const overlays=[];let y=0;for(const lang of ['ca','es','en'])for(const width of [1280,390]){for(const [j,shot] of shots.filter(s=>s.lang===lang&&s.width===width).entries())overlays.push({input:shot.input,left:j*310,top:y});y+=100;}
  await sharp({create:{width:1550,height:600,channels:4,background:'#cccccc'}}).composite(overlays).png().toFile(path.join(evidence,'contact-sheet.png'));
 }
 }
 console.log('RESULT',JSON.stringify({baselineOnly:baseline,forward,reverse,pixelChecks,minContrast,evidence,externalRequests:blocked.length}));
}finally{await cleanup();console.log('CLEANUP PASS: owned browser/server/temp removed');}
