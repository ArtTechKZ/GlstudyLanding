import fs from'node:fs';import assert from'node:assert/strict';import{chromium}from'playwright';import{startStaticServer}from'./static-server.js';import site from'./site-config.js';import{evidencePath}from'./evidence-path.js';import{readWhatsApp,whatsappProblems}from'./whatsapp-check.js';
// GL-STUDY-31 — this check replaces the former "blocked Connect chat" check (study17).
// Why it changed: GL-STUDY-30 removed the Connect chat opener and its status dialog from the public build, so the old
// expectations ([data-connect-open], "Чат временно недоступен", wa.me/77073106822) describe a withdrawn function.
// Shipped behaviour that this check now protects: no chat widget, no request to the chat provider before or after a
// cookie grant, and the contact paths that replaced it (WhatsApp with a prepared text, phone, e-mail) work on every route and width.
const dir=evidencePath('.qa/study17/connect');fs.mkdirSync(dir,{recursive:true});const s=await startStaticServer(),b=await chromium.launch({channel:'msedge'}),results=[];const provider='connect.tekvora.kz';
try{for(const route of [...site.routes,{path:'/missing-connect',target:'404.html'}]){
 // index.html deliberately retains the provider URL, but only as inert, never-instantiated template content (see the BLOCKED comment there).
 const html=fs.readFileSync('dist/'+route.target,'utf8');assert.equal(html.split(provider).length-1,1,'retained provider configuration appears once in '+route.target);assert.ok(html.includes('<template id="gl-connect-template"><script src="https://'+provider+'/'),'provider URL only inside the inert template in '+route.target);
 const c=await b.newContext(),p=await c.newPage();const requests=[];await c.route('**/*',r=>{const url=r.request().url();if(url.includes(provider))requests.push(url);return r.continue()});
 await p.goto(s.baseURL+route.path,{waitUntil:'networkidle'});
 const absent=async phase=>{assert.equal(await p.locator('[data-connect-open],[data-connect-status],iframe').count(),0,phase+' '+route.path);assert.equal(await p.getByRole('dialog').count(),0,phase+' dialog '+route.path);assert.ok(!/Чат временно недоступен|Connect/.test(await p.locator('body').innerText()),phase+' chat text '+route.path)};
 await absent('initial');
 // Granting every optional category must not start a chat either.
 await p.evaluate(()=>window.__GL_EARLY__?.consent.save(true,true));await p.waitForTimeout(300);await absent('after consent grant');await p.evaluate(()=>window.__GL_EARLY__?.consent.save(false,false));
 assert.deepEqual(requests,[],'no chat provider request '+route.path);
 const footer=await readWhatsApp(p,'footer');assert.ok(footer.length>=1,'footer WhatsApp replaces the chat '+route.path);assert.deepEqual(whatsappProblems(footer),[],'footer WhatsApp '+route.path);
 assert.ok(await p.locator('footer a[href="tel:+77073106822"]').count()>=1);assert.equal(await p.locator('footer a[href="mailto:grandluxe@yandex.ru"]').count(),1);
 results.push({route:route.path,status:'PASS chat absent; WhatsApp/tel/mail present',providerRequests:0,iframe:0});await c.close()}
for(const width of [1440,768,390,320]){const p=await b.newPage({viewport:{width,height:1000}});await p.goto(s.baseURL+'/',{waitUntil:'networkidle'});const link=p.locator('footer a[data-whatsapp]').first();await link.scrollIntoViewIfNeeded();assert.ok(await link.isVisible());
 const fit=f=>f.querySelectorAll&&[...f.querySelectorAll('.study-phone-number,a[data-whatsapp]')].every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1});
 assert.ok(await p.locator('footer').evaluate(fit),'footer contact paths fit '+width);
 // Text enlarged to 200% is checked from 390px up. At 320px the unbreakable phone number (a deliberate rule, see test:localized-render) cannot fit; this is reported, not hidden.
 if(width>=390){await p.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await p.locator('footer').evaluate(fit),'footer contact paths fit at text 200% '+width)}
 if([1440,390].includes(width))await p.locator('footer').screenshot({path:dir+'/footer-contacts-'+width+'.png'});await p.close()}
console.log('PASS chat withdrawn: 21 routes + 404, no widget/dialog/iframe or provider request before or after consent, provider URL only in the inert template; footer WhatsApp (decoded text), phone and e-mail at 1440/768/390/320 (text 200% from 390px).');}finally{fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));await b.close();await s.close()}
