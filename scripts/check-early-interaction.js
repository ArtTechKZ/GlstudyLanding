import {evidencePath} from './evidence-path.js';
import fs from 'node:fs';import assert from 'node:assert/strict';import{chromium}from'playwright';import{startStaticServer}from'./static-server.js';import{readWhatsApp,whatsappProblems}from'./whatsapp-check.js';
const folder=evidencePath('.qa/study14');fs.mkdirSync(folder,{recursive:true});const smoke=process.argv.includes('--smoke'),s=await startStaticServer({gzip:true}),b=await chromium.launch({channel:'msedge'}),results=[];
const modes=smoke?[{name:'normal',cpu:1}]:[{name:'normal',cpu:1},{name:'slow',cpu:4,latency:562.5,kbps:1474.56},{name:'severe',cpu:6,latency:900,kbps:600}];
async function scenario(mode,action,option={}){
 const c=await b.newContext({viewport:{width:option.headerCity?1440:390,height:option.headerCity?1000:844},deviceScaleFactor:1.75});let release;const gate=new Promise(r=>release=r);let released=false;
 await c.route(option.afterMain?/\/assets\/IeltsPage-[^/]+\.js$/:/\/assets\/main-[^/]+\.js$/,async r=>{await gate;try{await r.continue()}catch{/* Closed failed context. */}});
 await c.addInitScript(({blocked,stored})=>{
  window.__earlyTest={events:[],writes:[],mutations:[],banner:null};
  const set=Storage.prototype.setItem,get=Storage.prototype.getItem;
  if(stored!==undefined&&get.call(localStorage,'gl_study_cookie_v1')===null)set.call(localStorage,'gl_study_cookie_v1',stored);
  Storage.prototype.setItem=function(k,v){if(k==='gl_study_cookie_v1')window.__earlyTest.writes.push({time:performance.now(),value:v});if(blocked)throw new DOMException('Storage unavailable','SecurityError');return set.call(this,k,v)};
  Storage.prototype.getItem=function(k){if(blocked)throw new DOMException('Storage unavailable','SecurityError');return get.call(this,k)};
  for(const type of ['pointerdown','pointerup','click','keydown','keyup'])document.addEventListener(type,e=>window.__earlyTest.events.push({type,time:performance.now(),eventTime:e.timeStamp,deliveryLag:performance.now()-e.timeStamp,trusted:e.isTrusted,target:e.target?.outerHTML?.slice(0,280)}),true);
  new MutationObserver(()=>{window.__earlyMain??=document.querySelector('#root[data-ssg] main');if(window.__earlyTest.banner===null&&document.querySelector('.study-cookie'))window.__earlyTest.banner=performance.now()}).observe(document,{childList:true,subtree:true});
 },option);
 const p=await c.newPage(),cdp=await c.newCDPSession(p);const errors=[],requests=[],submissions=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('request',r=>{requests.push(r.url());if(r.method()!=='GET')submissions.push({method:r.method(),url:r.url()})});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:mode.cpu});if(mode.latency)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:mode.latency,downloadThroughput:mode.kbps*1024/8,uploadThroughput:675*1024/8});
 const click=async locator=>{await locator.scrollIntoViewIfNeeded();const rect=await locator.boundingBox();assert.ok(rect);const x=rect.x+rect.width/2,y=rect.y+rect.height/2;await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1,timestamp:Date.now()/1000});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1,timestamp:Date.now()/1000});if(option.rapid){await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:2,timestamp:Date.now()/1000});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:2,timestamp:Date.now()/1000})}};
 try{
 await p.goto(s.baseURL+(option.route??'/'),{waitUntil:'domcontentloaded',timeout:60000});
 if(option.afterMain)await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);else assert.equal(await p.evaluate(()=>performance.getEntriesByName('gl:hydration:start').length),0,'Must act before main starts');
 const expectedCity=typeof option.headerCity==='string'?option.headerCity:'astana';if(option.headerCity)await p.locator('.gl-header__city-select:visible').first().selectOption(expectedCity);
 if(action==='stored'){assert.equal(await p.locator('.study-cookie').isVisible(),false);release();released=true;await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);await p.locator('.study-cookie').waitFor({state:'detached'});assert.equal((await p.evaluate(()=>window.__earlyTest.writes)).length,0)}
 else if(action==='navigation'){
  // GL-STUDY-31: the former step clicked a "#lead-form" link on /legal/ and expected a native navigation to the home page form plus a one-time
  // sessionStorage intent. Those links and the form are gone; the kept guarantee is that an ordinary internal link works natively BEFORE the app
  // loads: the target page is SSG HTML, hydration has not started, no lead-intent metadata is written, and its WhatsApp links are correct.
  assert.equal(await p.locator('form').count(),0,'no form on the page');
  const original=p.url();await click(p.locator('a[href$="/branches"]:visible').first());await p.waitForURL(url=>url.href!==original&&/\/branches\/?$/.test(url.pathname),{waitUntil:'domcontentloaded'});
  assert.equal(await p.evaluate(()=>performance.getEntriesByName('gl:hydration:start').length),0);assert.ok(await p.locator('#root[data-ssg] main').count(),'navigated page is SSG HTML');
  assert.equal(await p.evaluate(()=>sessionStorage.getItem('gl_study_lead_intent_v1')),null,'no lead-intent metadata is written');
  assert.deepEqual(whatsappProblems(await readWhatsApp(p,'body')),[],'WhatsApp links on the navigated page');
  // An ordinary link (unlike the removed "#lead-form" links) never carried a pre-hydration city choice to the next page, so none is asserted here.
  release();released=true;await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);results.push({mode:mode.name,action,option,status:'PASS'});
 }
 else if(action==='whatsapp'){
  // GL-STUDY-31: replaces the former "form" scenario (typed into the lead form before hydration, expected the draft in a dialog after it).
  // WhatsApp links are read as data and never clicked. Kept guarantees: the link set is correct before the app loads, hydration does not change it,
  // the early city choice survives, nothing is submitted, no JS error and no external request (asserted for every scenario below).
  const scope=option.scope??'main';
  const before=await readWhatsApp(p,scope);assert.ok(before.length>0,'WhatsApp links in '+scope+' before hydration');assert.deepEqual(whatsappProblems(before),[],'SSG WhatsApp before hydration');
  if(option.text)assert.ok(before.some(l=>option.text.test(l.text??'')),'expected program context in the decoded message: '+option.text);
  release();released=true;await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);
  const after=await readWhatsApp(p,scope);assert.deepEqual(after.map(l=>l.href),before.map(l=>l.href),'hydration must not change WhatsApp links');
  if(option.headerCity)assert.equal(await p.locator('.gl-header__city-select:visible').first().inputValue(),expectedCity,'early city survives hydration');
 }else{
  const selector=action==='settings'?'settings':action==='all'?'all':'necessary';const button=p.locator(`[data-consent-action=${selector}]`);
  if(option.keyboard){await button.focus();await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})}else await click(button);
  if(action==='settings'){const d=p.getByRole('dialog');await d.waitFor();assert.equal(await d.locator('[name=analytics]').isChecked(),false);assert.equal(await d.locator('[name=advertising]').isChecked(),false);if(!option.categories||['analytics','both'].includes(option.categories))await click(d.locator('[name=analytics]'));if(['advertising','both'].includes(option.categories))await click(d.locator('[name=advertising]'));await click(d.getByRole('button',{name:'Сохранить выбор',exact:true}))}
  assert.equal(await p.locator('.study-cookie').isVisible(),false,'First delivered action must immediately hide chosen banner');
  const before=await p.evaluate(()=>({choice:window.__GL_EARLY__.consent.getSnapshot(),writes:window.__earlyTest.writes,events:window.__earlyTest.events,marks:performance.getEntriesByType('mark').map(e=>({name:e.name,time:e.startTime})),banner:window.__earlyTest.banner}));
  assert.equal(before.writes.length,1,'Exactly one canonical persistence attempt');assert.equal(before.choice.analytics,action==='all'||action==='settings'&&(!option.categories||['analytics','both'].includes(option.categories)));assert.equal(before.choice.advertising,action==='all'||action==='settings'&&['advertising','both'].includes(option.categories));assert.ok(before.events.some(e=>e.type==='click'&&e.trusted));assert.equal(before.marks.some(m=>m.name==='gl:hydration:start'),false);
  release();released=true;await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);await p.locator('.study-cookie').waitFor({state:'detached'});assert.equal((await p.evaluate(()=>window.__earlyTest.writes)).length,1,'Hydration must not re-save choice');
  const hydrated=await p.evaluate(()=>({marks:performance.getEntriesByType('mark').map(e=>({name:e.name,time:e.startTime})),js:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script'||r.name.endsWith('.js')).map(r=>({name:r.name.split('/').at(-1),start:r.startTime,end:r.responseEnd}))}));
  if(!option.blocked){const stored=await p.evaluate(()=>localStorage.getItem('gl_study_cookie_v1'));await p.reload({waitUntil:'networkidle',timeout:60000});assert.equal(await p.locator('.study-cookie').isVisible(),false,'Stored consent must hide SSG banner immediately');await p.waitForFunction(()=>performance.getEntriesByName('gl:hydration:commit').length);await p.locator('.study-cookie').waitFor({state:'detached'});assert.equal(await p.evaluate(()=>localStorage.getItem('gl_study_cookie_v1')),stored);assert.equal((await p.evaluate(()=>window.__earlyTest.writes)).length,0,'Reload must only read consent')}
  results.push({mode:mode.name,action,option,before,after:hydrated,status:'PASS'});
 }
 if(option.afterMain)assert.ok(await p.evaluate(()=>window.__earlyMain===document.querySelector('main')),'Suspended SSG main must be retained');assert.deepEqual(errors,[]);assert.deepEqual(submissions,[],'Demo must not submit to a server');assert.ok(requests.every(url=>url.startsWith(s.origin)||url.startsWith('data:')),'No optional external requests');if(action==='stored'||action==='whatsapp')results.push({mode:mode.name,action,option,status:'PASS'});console.log('PASS',mode.name,action,JSON.stringify(option));
 }catch(error){fs.writeFileSync(folder+'/early-failure.json',JSON.stringify({mode,action,option,error:String(error),details:await p.evaluate(()=>({active:document.activeElement?.outerHTML.slice(0,400),marks:performance.getEntriesByType('mark').map(e=>({name:e.name,time:e.startTime})),events:window.__earlyTest,choice:window.__GL_EARLY__?.consent.getSnapshot()}))},null,2));throw error}finally{if(!released)release();await c.close()}
}
try{for(const mode of modes){for(const action of ['necessary','all','settings'])await scenario(mode,action);if(!smoke)await scenario(mode,'necessary',{keyboard:true})}
await scenario(modes[0],'necessary',{blocked:true});await scenario(modes[0],'necessary',{stored:'{broken'});await scenario(modes[0],'stored',{stored:JSON.stringify({version:1,necessary:true,analytics:false,advertising:false,savedAt:Date.now()})});await scenario(modes[0],'whatsapp');
if(!smoke){
await scenario(modes[0],'necessary',{rapid:true});
for(const categories of ['none','advertising','both'])await scenario(modes[0],'settings',{categories});
for(const saved of [{version:2,savedAt:Date.now()},{version:1,savedAt:Date.now()-181*86400000}])await scenario(modes[0],'necessary',{stored:JSON.stringify({necessary:true,analytics:true,advertising:true,...saved})});
for(const route of ['/ielts/','/travel/malaysia/','/branches/'])await scenario(modes[1],'whatsapp',{route});
await scenario(modes[1],'whatsapp',{route:'/ielts/',afterMain:true});await scenario(modes[1],'whatsapp',{headerCity:true});
for(const [scope,text]of [['#additional-languages',/Курсы казахского языка/],['#summer-programs'],['#admissions'],['.oo-card--online']])await scenario(modes[1],'whatsapp',{scope,text,headerCity:'taraz'});
for(const route of ['/legal/'])await scenario(modes[1],'navigation',{route});await scenario(modes[1],'navigation',{route:'/legal/',headerCity:true});
const context=await b.newContext({viewport:{width:390,height:844}});const p=await context.newPage(),other=await context.newPage();await p.goto(s.baseURL+'/',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Только необходимые',exact:true}).click();await other.goto(s.baseURL+'/',{waitUntil:'networkidle'});await other.locator('[data-consent-settings]').click();await other.getByRole('dialog').locator('[name=advertising]').check();await other.getByRole('button',{name:'Сохранить выбор',exact:true}).click();await p.waitForFunction(()=>window.__GL_EARLY__.consent.getSnapshot()?.advertising===true);await other.locator('[data-consent-settings]').click();await other.getByRole('dialog').locator('[name=advertising]').uncheck();await other.getByRole('button',{name:'Сохранить выбор',exact:true}).click();await p.waitForFunction(()=>window.__GL_EARLY__.consent.getSnapshot()?.advertising===false);await context.close();results.push({action:'cross-tab grant/revoke',status:'PASS'});
const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await nojs.newPage();await page.goto(s.baseURL+'/',{waitUntil:'networkidle'});assert.equal(await page.locator('form').count(),0,'no personal-data form can exist without JS');const nojsLinks=await readWhatsApp(page,'body');assert.ok(nojsLinks.length>0,'WhatsApp anchors are plain HTML without JS');assert.deepEqual(whatsappProblems(nojsLinks),[],'noJS WhatsApp links');await nojs.close();results.push({action:'noJS page has no form and working WhatsApp anchors',status:'PASS'});
}
fs.writeFileSync(folder+'/early-interaction'+(smoke?'-smoke':'')+'.json',JSON.stringify({smoke,results},null,2));console.log('PASS first trusted click BEFORE main, consent exactly once, reload/memory/corrupt, keyboard, draft/queued submit and hydration');
}finally{await b.close();await s.close()}
