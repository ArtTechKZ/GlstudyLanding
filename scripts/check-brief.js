import {localizedRoutes,approvedLocales,resolvePage} from '../src/config/locale-routes.js';
import {evidencePath} from './evidence-path.js';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {chromium} from 'playwright';
import {startLocalServer} from './local-server.js';import site from './site-config.js';
const dir=evidencePath('.qa/study15');fs.mkdirSync(dir,{recursive:true});const results=[],errors=[];
const ban=/\b(?:zoom|skype|google meet|microsoft teams)\b|\d[\d\s\u00a0]*(?:€|₸|EUR\b|KZT\b)|стоимость пакета|стоимость рассчитывается|5[–-]9 лет|13[–-]18 лет|8[–-]18 лет/iu;
const s=await startLocalServer('static'),b=await chromium.launch({channel:'msedge'});let dev;
try {
const p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
for(const route of [...site.routes,{path:'/missing-brief',target:'404.html'}]){
 const html=fs.readFileSync('dist/'+route.target,'utf8');const content=html.replace(/<style\b[\s\S]*?<\/style>/gi,'');assert.ok(!ban.test(content),`Forbidden SSG public content ${route.path}: ${content.match(ban)?.[0]}`);
 await p.goto(s.baseURL+route.path,{waitUntil:'networkidle'});await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);
 const publicText=await p.locator('body').textContent();assert.ok(!ban.test(publicText),`Forbidden visible content ${route.path}: ${publicText.match(ban)?.[0]}`);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('html').getAttribute('lang'),'ru');assert.equal(await p.locator('link[rel=alternate][hreflang]').count(),resolvePage(route.path)?.indexable?approvedLocales.length+1:0);
 const cityIds=await p.locator('#city-select option').evaluateAll(es=>es.map(e=>e.value));assert.deepEqual(cityIds,['almaty','astana','kostanay','rudny','taraz']);
 for(const city of ['rudny','taraz']){await p.selectOption('#city-select',city);await p.waitForFunction(id=>document.querySelector('#city-select').value===id,city);assert.equal(await p.locator('#city-select').inputValue(),city);assert.equal(await p.locator('footer a[href="tel:+77055589219"]').count(),1);}
 const whatsapp=await p.locator('a[href*="wa.me"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert.ok(whatsapp.length&&whatsapp.every(href=>href==='https://wa.me/77073106822'));assert.equal(await p.locator('footer a[href="https://www.instagram.com/glstudy.kz/"]').count(),1);
 results.push(`${route.path}: clean SSG/hydrated content, five cities, exact contacts, preserved RU content`);
}
for(const [route,date]of [['/travel/europe-winter-2027','2–12 января 2027'],['/travel/malaysia','3–17 января 2027']]){await p.goto(s.baseURL+route,{waitUntil:'networkidle'});const text=await p.locator('main').textContent();assert.ok(text.includes(date));assert.match(text,/С 10 лет/);assert.ok(!/не менее 25|Минимальный размер|страховка включена|Без скрытых комиссий/.test(text));}
await p.goto(s.baseURL+'/?city=almaty',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Только необходимые',exact:true}).click();
for(const width of [1440,390,320]){
 await p.setViewportSize({width,height:1000});await p.evaluate(()=>document.fonts.ready);
 for(const selector of ['#additional-languages','#admissions','#summer-programs','#trial-process']){const el=p.locator(selector);await el.scrollIntoViewIfNeeded();assert.equal(await el.count(),1);const box=await el.boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1);await el.screenshot({path:`${dir}/after-${selector.slice(1)}-${width}.png`});}
 assert.equal(await p.locator('#additional-languages article').count(),4);assert.equal(await p.locator('#summer-programs article').count(),5);
 for(const [selector,program] of [['#additional-languages article:first-child a','language-kazakh'],['#admissions a[href="#lead-form"]','admissions'],['#summer-programs article:first-child a','summer-czech']]){
 await p.locator(selector).click();const d=p.getByRole('dialog');await d.waitFor();assert.equal(await d.locator('[name=program]').inputValue(),program);assert.equal(await d.locator('[name=city]').inputValue(),'almaty');assert.equal(await d.locator('[name=preferredArea]').count(),1);await p.keyboard.press('Escape');
 }
}
results.push('New blocks and all CTA kinds at 1440/390/320: bounds, exact program context, city, district preference');
await p.close();dev=await startLocalServer('dev');const q=await b.newPage();await q.goto(dev.origin,{waitUntil:'networkidle'});
const model=await q.evaluate(async()=>{
 const {leadRouting}=await import('/src/features/lead-routing.ts');const{validateLead,EMPTY_DRAFT}=await import('/src/features/lead-model.ts');const {localeAlternates}=await import('/src/i18n/routes.ts');
 return {course:leadRouting({type:'main',ctaId:'test',page:'/'},'taraz',undefined,'offline','Центр'),online:leadRouting({type:'main',ctaId:'test',page:'/'},'rudny',undefined,'online'),international:leadRouting({type:'main',intent:'international',ctaId:'test',page:'/'},'almaty'),ages:[9,10,19].map(age=>!!validateLead({...EMPTY_DRAFT,name:'QA',phone:'+70000000000',parentName:'QA',consent:true,travelProgram:'malaysia',childAge:String(age)},'travel').childAge),alternates:localeAlternates('/',[{locale:'kk',contentApproved:false,legalApproved:false,seoApproved:false,uiComplete:false}])};
});assert.deepEqual(model.ages,[true,false,false]);assert.equal(model.course.branchSelection,'manager-clarifies');assert.equal(model.online.assignment,'unconfirmed');assert.equal(model.international.destination,'https://wa.me/77073106822');assert.deepEqual(model.alternates,[]);results.push('Typed routing, no invented branch, online unresolved, exact WhatsApp, approved minimum age without invented maximum, localization release gate');
await q.close();
const files=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of files('dist')){assert.ok(!/(?:^|[\\/])(?:\.env[^\\/]*|node_modules|src|scripts|docs|\.qa|archive)(?:[\\/]|$)|\.(?:docx|pdf|rar|zip|map)$/i.test(f),`Internal payload ${f}`);if(/\.(html|js|css|json|txt|xml)$/.test(f)){const v=fs.readFileSync(f,'utf8');assert.ok(!/PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-proj-[A-Za-z0-9_-]{20,}|DRAFT — internal|DRAFT Қазақша/.test(v),`secret/draft ${f}`)}}
assert.equal(fs.readdirSync('dist').filter(f=>f==='404.html').length,1);assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,localizedRoutes.filter(r=>r.indexable).length);assert.ok(fs.existsSync('dist/.nojekyll'));assert.deepEqual(errors,[]);results.push(`${new Set(localizedRoutes.map(r=>r.semanticPath)).size} semantic routes / ${localizedRoutes.length} localized URLs + technical 404, .nojekyll, no internal docs/drafts/secrets`);
fs.writeFileSync(dir+'/brief-checks.json',JSON.stringify({status:'PASS',results,model,errors},null,2));console.log(results.map(r=>'PASS '+r).join('\n'));
}finally{await b.close();await dev?.close();await s.close()}
