import site from './site-config.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startLocalServer} from './local-server.js';
import {measureContrast} from './contrast-check.js';
import {evidencePath} from './evidence-path.js';

const dir=evidencePath('.qa/study21/visual');fs.mkdirSync(dir,{recursive:true});
const only=process.argv.find(value=>value.startsWith('--only='))?.slice(7).split(',');
if(only)for(const route of only)assert.ok(site.routes.some(r=>r.path===route),'Unknown focused route '+route);
const routes=site.routes.filter(r=>!only||only.includes(r.path)).map(r=>r.path==='/'?'/':r.path+'/');
const results=[],contrast=[],failures=[],errors=[];
const s=await startLocalServer(process.argv.includes('--source')?'dev':'static');
// CPU capture avoids Chromium GPU tiling artifacts on >16k px mobile pages.
const b=await chromium.launch({channel:'msedge',args:['--disable-gpu']});
try {
 for(const locale of ['ru','kk','en']) {
  const context=await b.newContext({reducedMotion:'reduce'});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,1280,768,390,320]) for(const route of routes) {
   const label=locale+'-'+width+'-'+(route==='/'?'home':route.replaceAll('/','-').slice(1,-1));
   await p.setViewportSize({width,height:1000});
   await p.goto(s.baseURL+(locale==='ru'?'':'/'+locale)+route,{waitUntil:'networkidle'});
   await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length>0);
   await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}));});
   const state=await p.evaluate(()=>{
    const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility==='visible'&&getComputedStyle(e).display!=='none';
    const heads=[...document.querySelectorAll('h1,h2')].filter(visible).map(e=>({text:e.textContent.slice(0,70),font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color}));
    const bad=[];
    for(const e of document.querySelectorAll('main h1,main h2,main h3,main p,main label,main a,footer a')){
     if(!visible(e)||e.closest('.directions__viewport'))continue;
     const r=e.getBoundingClientRect();if(r.width&&(r.left< -1||r.right>innerWidth+1))bad.push('bounds '+e.className+' '+e.textContent.slice(0,40));
     const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const t of range.getClientRects())if(t.width&&(t.left< -1||t.right>innerWidth+1))bad.push('text '+e.className+' '+e.textContent.slice(0,40));}
    }
    const surfaces=[...document.querySelectorAll('.hero__stage,.inner-page__hero,.ielts,.lead-form,.oo-card,.travel__card,.directions__card,.footer')].map(e=>({class:e.className,bg:getComputedStyle(e).backgroundColor}));
    const tokens=Object.fromEntries(['--gl-white','--gl-black','--gl-violet','--gl-orange','--gl-violet-light','--gl-orange-light','--gl-violet-alt','--gl-orange-alt'].map(k=>[k,getComputedStyle(document.documentElement).getPropertyValue(k).trim()]));
    const imgs=[...document.images].filter(i=>visible(i)&&(!i.complete||!i.naturalWidth)).map(i=>i.src);
    return {docWidth:document.documentElement.scrollWidth,width:innerWidth,heads,bad,surfaces,tokens,imgs,lang:document.documentElement.lang};
   });
   if(state.docWidth>width+1)failures.push(label+' page overflow '+state.docWidth);
   failures.push(...state.bad.map(x=>label+' '+x));
   if(state.lang!==locale)failures.push(label+' language mismatch');
   for(const h of state.heads)if(!h.font.includes('Inter')||h.weight!=='800')failures.push(label+' wrong heading font '+JSON.stringify(h));
   for(const surface of state.surfaces)if(surface.bg!=='rgb(255, 255, 255)')failures.push(label+' non-white main surface '+JSON.stringify(surface));
   if(state.imgs.length)failures.push(label+' failed images '+state.imgs.join(','));
   assert.deepEqual(Object.values(state.tokens).map(x=>x.length===4?'#'+[...x.slice(1)].map(c=>c+c).join('').toUpperCase():x.toUpperCase()),['#FFFFFF','#000000','#8D3BED','#F24C0A','#F5EDFD','#FEEFE9','#9345EE','#F35516']);
   if([1440,390].includes(width)) {
    // Audit actual text-bearing nodes, including compact labels and badges.
    await p.evaluate(()=>{for(const e of document.querySelectorAll('#root *')){const style=getComputedStyle(e);if(!e.getClientRects().length||style.visibility!=='visible'||e.closest('[aria-hidden=true]')||['SCRIPT','STYLE','OPTION'].includes(e.tagName))continue;if([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))e.setAttribute('data-contrast21','');}});
    const measured=await measureContrast(p,{selector:'[data-contrast21]'});
    contrast.push(...measured.map(x=>({...x,label})));
    failures.push(...measured.filter(x=>x.status==='FAIL').map(x=>label+' contrast '+JSON.stringify(x)));
    await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await p.screenshot({path:dir+'/'+label+'.png',fullPage:true,animations:'disabled'});
    if(route==='/'){const consent=p.locator('[data-consent-action=necessary]');if(await consent.count())await consent.click();await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:dir+'/'+label+'-hero.png'});}
   }
   results.push({label,...state});console.log('Checked '+label);
   fs.writeFileSync(dir+'/progress.json',JSON.stringify({count:results.length,failures},null,2));
  }
  await context.close();
 }
} finally {
 fs.writeFileSync(dir+'/audit.json',JSON.stringify({results,contrast,failures,errors},null,2));
 await b.close();await s.close();
}
assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
console.log(`PASS: ${results.length} route/locale/viewport combinations, fonts, tokens, white surfaces, geometry, loaded images and measured text contrast.`);
