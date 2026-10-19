import {resolvePage} from '../src/config/locale-routes.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {startStaticServer} from './static-server.js';
import {validatePublicRelease} from './public-release.js';
import site from './site-config.js';
import {evidencePath} from './evidence-path.js';

const urlIndex=process.argv.indexOf('--url');
const remote=urlIndex>=0?process.argv[urlIndex+1]:undefined;
if(remote)assert.equal(remote,'https://arttechkz.github.io/GlstudyLanding/');
const directory=process.env.GL_DIST_DIR??'dist';const files=validatePublicRelease(directory);
const dir=evidencePath(remote?'.qa/public-live':'.qa/public-local');fs.mkdirSync(dir,{recursive:true});
const server=remote?undefined:await startStaticServer({directory});
const base=remote?.replace(/\/$/,'')??server.baseURL;
const browser=await chromium.launch(process.env.GL_BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.GL_BROWSER_EXECUTABLE_PATH } : process.env.GL_BROWSER_CHANNEL === 'chromium' ? {} : { channel: process.env.GL_BROWSER_CHANNEL || 'msedge' }),results={pages:[],widths:[],assets:[],errors:[],posts:[],external:[]};
const filesContext=await browser.newContext();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
try{
  // Compare exact served bytes, including every CSS/JS/font/image, with checked dist.
  for(const file of files){
    const response=await filesContext.request.get(base+'/'+file,{timeout:30000});
    assert.equal(response.status(),200,'Static file '+file);
    assert.equal(sha(await response.body()),sha(fs.readFileSync(directory+'/'+file)),'Stale or changed served file '+file);
    if(/\.(?:js|css|woff2|webp)$/.test(file))assert.match(response.headers()['content-type'],{js:/javascript/,css:/text\/css/,woff2:/font\/woff2|application\/font/,webp:/image\/webp/}[file.split('.').at(-1)],'MIME '+file);
    results.assets.push({file,status:response.status(),type:response.headers()['content-type'],sha256:sha(await response.body())});
  }
  for(const route of [...site.routes,{path:'/missing-study20',target:'404.html'}]){
    const context=await browser.newContext({javaScriptEnabled:false}),p=await context.newPage();
    const response=await p.goto(base+route.path+(route.path==='/'?'':'/'),{waitUntil:'networkidle'});
    assert.equal(response.status(),route.target==='404.html'?404:200);
    assert.equal(await p.locator('html').getAttribute('lang'),'ru');
    assert.equal(await p.locator('h1').count(),1);assert.ok((await p.locator('h1').innerText()).trim());
    assert.equal(await p.locator('meta[property="og:title"]').getAttribute('content'),await p.title());
    assert.equal(await p.locator('meta[property="og:url"]').getAttribute('content'),await p.locator('link[rel=canonical]').getAttribute('href'));
    assert.ok(await p.locator('meta[name=description]').getAttribute('content'));
    assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),resolvePage(route.path)?.indexable?'index,follow':'noindex,follow');
    assert.equal(await p.locator('[data-connect-open], [data-locale=kk], [data-locale=en], link[hreflang=kk], link[hreflang=en]').count(),0);
    assert.ok((await p.locator('link[rel=canonical]').getAttribute('href')).startsWith(site.origin+site.base));
    if(route.target!=='404.html')assert.ok(await p.locator('script[type="application/ld+json"]').count());
    if(route.target==='404.html'||route.path==='/legal')assert.match(await p.locator('meta[name=robots]').getAttribute('content'),/noindex/);
    results.pages.push({path:route.path,status:response.status(),noJS:true,h1:await p.locator('h1').innerText()});await context.close();
  }
  for(const width of [1440,390,320]){
    const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await c.newPage();
    p.on('pageerror',e=>results.errors.push(e.message));
    p.on('request',r=>{if(r.method()!=='GET')results.posts.push(r.url());if(new URL(r.url()).origin!==new URL(base).origin)results.external.push(r.url());});
    await p.goto(base+'/?city=astana&utm_source=release20#main-content',{waitUntil:'networkidle'});
    await p.waitForFunction(()=>performance.getEntriesByName('gl:lead-ready').length);
    await p.locator('[data-consent-action=necessary]').click();
    assert.equal(await p.locator('.study-cookie').isVisible(),false,'First cookie click');
    assert.equal(await p.locator('.gl-header__city-select').first().inputValue(),'astana');
    const cityMenu=p.locator('.gl-header__burger');if(await cityMenu.isVisible()){await cityMenu.click();await p.locator('#mobile-menu').waitFor({state:'visible'});}const city=p.locator('.gl-header__city-select:visible').first();assert.equal(await city.locator('option').count(),5);
    for(const value of await city.locator('option').evaluateAll(es=>es.map(e=>e.value))){await city.selectOption(value);await p.waitForFunction(expected=>new URLSearchParams(location.search).get('city')===expected&&[...document.querySelectorAll('.gl-header__city-select')].some(e=>e.getClientRects().length&&e.value===expected),value);assert.equal(await city.inputValue(),value);assert.equal(new URL(p.url()).searchParams.get('utm_source'),'release20');assert.equal(new URL(p.url()).hash,'#main-content');}
    if(await cityMenu.isVisible()){await p.keyboard.press('Escape');await p.locator('#mobile-menu').waitFor({state:'hidden'});}
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await p.locator('[data-connect-open],iframe,[data-locale=kk],[data-locale=en]').count(),0);
    await p.screenshot({path:dir+'/home-'+width+'.png',fullPage:false});
    await p.locator('#directions').scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>document.querySelector('#directions').dataset.trackReady==='true');
    assert.equal(await p.locator('.directions__card').count(),7);
    const next=p.getByRole('button',{name:'Следующее направление',exact:true});await next.click();
    await p.waitForFunction(()=>document.querySelector('.directions__viewport').scrollLeft>0);
    const detail=p.locator('.directions__card a').first();await detail.focus();await p.keyboard.press('Tab');
    assert.ok(await p.locator('.directions__card').evaluateAll(es=>es.some(e=>e.contains(document.activeElement))));
    await p.locator('footer').scrollIntoViewIfNeeded();
    const phones=await p.locator('footer .study-phone-number').evaluateAll(es=>es.map(e=>{const r=document.createRange();r.selectNodeContents(e);return [...r.getClientRects()].filter(r=>r.width).length}));assert.ok(phones.length>=2&&phones.every(n=>n===1));
    assert.equal(await p.locator('footer a[href="tel:+77055589219"]').count(),1);assert.equal(await p.locator('footer a[href="https://wa.me/77073106822"]').count(),1);
    await p.locator('.footer__contacts').screenshot({path:dir+'/contacts-'+width+'.png'});
    const burger=p.locator('.gl-header__burger');if(await burger.isVisible()){await burger.click();await p.locator('#mobile-menu').waitFor({state:'visible'});await p.keyboard.press('Escape');await p.locator('#mobile-menu').waitFor({state:'hidden'});}
    await p.goto(base+'/ielts/',{waitUntil:'networkidle'});assert.match(await p.locator('h1').innerText(),/IELTS/);
    for(const path of ['/kk/','/en/']){const r=await p.goto(base+path,{waitUntil:'networkidle'});assert.equal(r.status(),404);assert.equal(await p.locator('html').getAttribute('lang'),'ru');assert.match(await p.locator('main').innerText(),/404|не найдена/i);}
    results.widths.push({width,keyboard:true,menu:true,cookieFirstClick:true,cityOptions:5,carousel:7,phones:true,unapprovedRoutes:404});await c.close();
  }
  assert.deepEqual(results.errors,[]);assert.deepEqual(results.posts,[]);assert.deepEqual(results.external,[]);
  console.log('PASS exact served dist, all registered RU routes + technical 404 without JS, assets/MIME, 1440/390/320, city/cookie/menu/keyboard/carousel/phones, KK/EN excluded, no Connect requests or POST.');
}finally{fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));await filesContext.close();await browser.close();await server?.close();}
