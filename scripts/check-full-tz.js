import {evidencePath} from './evidence-path.js';
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {startLocalServer} from './local-server.js';import {localizedRoutes,approvedLocales} from '../src/config/locale-routes.js';import {checkCatalogs} from './localization-catalog-check.js';
const folder=evidencePath('.qa/study22');fs.mkdirSync(folder,{recursive:true});checkCatalogs();
const s=await startLocalServer('static'),b=await chromium.launch({channel:'msedge',args:['--disable-gpu']});const results=[],errors=[];
try{
 const nc=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),np=await nc.newPage();
 for(const route of localizedRoutes){const response=await np.goto(s.baseURL+route.path,{waitUntil:'load'});assert.equal(response.status(),200,route.path);assert.equal(await np.locator('h1').count(),1,route.path);assert.equal(await np.locator('html').getAttribute('lang'),route.locale);assert.ok((await np.title()).length>10);assert.equal(await np.locator('meta[name=robots]').getAttribute('content'),route.indexable?'index,follow':'noindex,follow');assert.equal(await np.locator('link[rel=alternate][hreflang]').count(),route.indexable?approvedLocales.length+1:0);results.push({route:route.path,noJS:true});}
 await nc.close();
 const p=await b.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 for(const route of localizedRoutes.filter(r=>!['home','learning','ielts','branches','travelPrague','travelMalaysia','legal','notFound'].includes(r.seo))){
  await p.goto(s.baseURL+route.path,{waitUntil:'networkidle'});await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length>0);
  if(route.semanticPath.startsWith('/branches/'))assert.equal(await p.locator('#city-select').inputValue(),route.semanticPath.split('/').at(-1));
  if(route.semanticPath.startsWith('/programs/')){await p.locator('a[data-cta^=enrol]').click();assert.equal(await p.getByRole('dialog').locator('[name=program]').inputValue(),route.semanticPath.split('/').at(-1));await p.keyboard.press('Escape');}
  if(['privacyPolicy','personalDataConsent'].includes(route.seo))assert.equal(await p.locator('main form').count(),0);
  const images=await p.locator('main img').evaluateAll(async es=>{await Promise.all(es.map(e=>e.decode().catch(()=>{})));return es.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)});assert.deepEqual(images,[],route.path);
  for(const width of [320,390,768,1280,1440]){await p.setViewportSize({width,height:900});await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route.path+' '+width);const clipped=await p.locator('h1').evaluate(e=>{const box=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].some(r=>r.width&&(r.left<box.left-1.5||r.right>box.right+1.5))});assert.equal(clipped,false,'H1 text containment '+route.path+' '+width);}
  if(route.locale==='ru'&&['online','children','city_kostanay','privacyPolicy'].includes(route.seo)){await p.setViewportSize({width:390,height:900});await p.screenshot({path:folder+'/'+route.seo+'-390.png',fullPage:true});}
 }
 await p.goto(s.baseURL+'/branches/rudny?utm_source=synthetic',{waitUntil:'networkidle'});await p.selectOption('#city-select','taraz');await p.waitForURL(/branches\/taraz/);assert.equal(await p.locator('#city-select').inputValue(),'taraz');assert.match(p.url(),/utm_source=synthetic/);
 for(const locale of ['','/kk','/en']){const response=await p.goto(s.baseURL+locale+'/unlisted-route',{waitUntil:'networkidle'});assert.equal(response.status(),404);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex,follow');}
 assert.deepEqual(errors,[]);fs.writeFileSync(folder+'/full-tz-checks.json',JSON.stringify({status:'PASS',noJS:results.length,newPageViewportChecks:39*5,results,errors},null,2));console.log('PASS all 63 registered locale routes without JS; 39 new translated pages × 5 widths, images, city URL/UTM, program CTA and 404');
}finally{await b.close();await s.close()}
