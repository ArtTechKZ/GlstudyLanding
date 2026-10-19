import {evidencePath} from './evidence-path.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {startLocalServer} from './local-server.js';
import {measureContrast} from './contrast-check.js';
const source=process.argv.includes('--source'), capture=process.argv.includes('--capture');
fs.mkdirSync(evidencePath('.qa/study09'),{recursive:true});
fs.writeFileSync(evidencePath('.qa/study09/fixture.html'),'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/scripts/fixtures/study09.tsx"></script></body></html>');
const s=await startLocalServer(source?'dev':'static');
const dev=source?s:await startLocalServer('dev');
const b=await chromium.launch({channel:'msedge'});
const results=[], errors=[];
let p;
const wait=async()=>{await p.waitForTimeout(140)};
async function home(width=1440,height=1000,options={}) {
 await p?.close();p=await b.newPage({viewport:{width,height},...options});
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(s.baseURL+'/',{waitUntil:'networkidle'});
 const consent=p.getByRole('button',{name:'Только необходимые',exact:true});if(await consent.count())await consent.click();
 await p.evaluate(async()=>{for(const img of document.querySelectorAll('#directions img')){img.loading='eager';await img.decode()}await document.fonts.ready});await p.locator('#directions').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-(document.querySelector('.gl-header')?.getBoundingClientRect().height??0)-12,behavior:'instant'}));if(options.javaScriptEnabled!==false)await p.waitForFunction(()=>document.querySelector('#directions').dataset.trackReady==='true');await wait();
}
async function metrics(){return p.locator('#directions').evaluate(e=>{const v=e.querySelector('.directions__viewport'),panel=e.querySelector('.directions__panel'),style=getComputedStyle(e);return{mode:e.dataset.mode,top:parseFloat(style.getPropertyValue('--directions-top')),start:scrollY+e.getBoundingClientRect().top+parseFloat(style.paddingTop)-parseFloat(style.getPropertyValue('--directions-top')),distance:v.scrollWidth-v.clientWidth,x:v.scrollLeft,panelTop:panel.getBoundingClientRect().top,height:panel.offsetHeight,sectionHeight:e.offsetHeight,padding:parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)}})}
async function scroll(y){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await wait()}
async function geometry(){const bad=await p.locator('#directions').evaluate(e=>{let bad=[];for(const card of e.querySelectorAll('article')){const c=card.getBoundingClientRect();for(const el of card.querySelectorAll('h3,p,a,img,.directions__card-bullet')){const r=el.getBoundingClientRect();if(r.left<c.left-1||r.right>c.right+1||r.top<c.top-1||r.bottom>c.bottom+1)bad.push(card.dataset.program+': '+el.className);if(el.matches('h3,p,a,.directions__card-bullet')){const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const t of range.getClientRects())if(t.width&&(t.left<r.left-1||t.right>r.right+1||t.top<r.top-1||t.bottom>r.bottom+1))bad.push('text overflow '+card.dataset.program+': '+el.className)}}}const image=card.querySelector('.directions__card-media').getBoundingClientRect(),actions=card.querySelector('.directions__card-actions').getBoundingClientRect();if(image.bottom>actions.top+1)bad.push('media/actions overlap')}
if(document.documentElement.scrollWidth>innerWidth+1)bad.push('document horizontal overflow');for(const el of e.querySelectorAll('.directions__header *')){const r=el.getBoundingClientRect();if(r.right>innerWidth+1)bad.push('header overflow '+el.className)}return bad});assert.deepEqual(bad,[])}
async function focusVisible(){const v=await p.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),v=e.closest('.directions__viewport').getBoundingClientRect(),head=document.querySelector('.gl-header').getBoundingClientRect().bottom;return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,vl:v.left,vr:v.right,head}});assert.ok(v.left>=v.vl-1&&v.right<=v.vr+1,JSON.stringify(v));assert.ok(v.top>=v.head-1&&v.bottom<=await p.evaluate(()=>innerHeight- (innerWidth<768?100:0)),JSON.stringify(v))}
try {
 for(const width of (process.argv.includes('--extras')?[]:(process.argv.find(a=>a.startsWith('--widths='))?.slice(9).split(',').map(Number)??[1440,1280,1024,768,390,320]))) {
  await home(width,width<768?844:1000);assert.equal(await p.locator('#directions article').count(),7);await geometry();const m=await metrics();assert.equal(m.mode,width>=1024?'sticky':'swipe');
  const widths=await p.locator('#directions article').evaluateAll(es=>es.map(e=>e.offsetWidth));assert.equal(new Set(widths).size,1);
  if(m.mode==='sticky'){
   for(const [label,f]of [['entry',0],['middle',.5],['last',1],['reverse',.5],['back',0]]){await scroll(m.start+m.distance*f);await p.waitForFunction(expected=>{const root=document.querySelector('#directions'),view=root.querySelector('.directions__viewport'),panel=root.querySelector('.directions__panel'),top=parseFloat(getComputedStyle(root).getPropertyValue('--directions-top'));return Math.abs(view.scrollLeft-expected)<2&&Math.abs(panel.getBoundingClientRect().top-top)<2},m.distance*f,{timeout:5000});const now=await metrics();assert.ok(Math.abs(now.x-m.distance*f)<2,`${width} ${label} offset`);assert.ok(Math.abs(now.panelTop-now.top)<2,`${width} ${label} pin`);if(capture&&width===1440&&['entry','last'].includes(label))await p.screenshot({path:evidencePath(`.qa/study09/after-${label}.png`)});}
   await scroll(m.start);await p.getByRole('button',{name:'Следующее направление',exact:true}).click();await p.waitForTimeout(750);assert.ok((await metrics()).x>20);await p.getByRole('button',{name:'Предыдущее направление',exact:true}).click();await p.waitForTimeout(750);assert.ok((await metrics()).x<2);
   await scroll(m.start+m.distance+m.height);assert.ok(await p.locator('#formats').evaluate(e=>e.getBoundingClientRect().top<innerHeight));
   await scroll(m.start);await p.getByRole('button',{name:'К следующему разделу ↓'}).click();assert.equal(await p.evaluate(()=>document.activeElement.id),'formats');assert.ok(await p.locator('#formats').evaluate(e=>e.getBoundingClientRect().top<innerHeight));
  } else {
   const view=p.locator('.directions__viewport');await view.evaluate(e=>e.scrollTo({left:e.scrollWidth,behavior:'instant'}));await wait();assert.ok((await metrics()).x>=m.distance-2);
   await view.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));await wait();assert.ok((await metrics()).x<2);
   await p.locator('.directions__card').first().evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-140));
   // Real touchscreen gesture, independent of buttons; vertical scrolling remains native.
   const cdp=await p.context().newCDPSession(p);const box=await view.boundingBox();const y=Math.max(160,box.y+200);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-60,y}]});
   for(let x=width-80;x>=55;x-=25)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(450);assert.ok((await metrics()).x>30,'native horizontal swipe');await cdp.detach();
  }
  await p.locator('.directions__card-link').first().focus();await wait();
  for(let i=0;i<14;i++){if(i)await p.keyboard.press('Tab');await wait();assert.ok(await p.evaluate(()=>!!document.activeElement.closest('.directions__card')));await focusVisible()}
  for(let i=0;i<13;i++){await p.keyboard.press('Shift+Tab');await wait();await focusVisible()}
  // The CTA keeps the 08 program/context handling; no real submission.
  await p.locator('[data-program=online] .directions__card-cta').focus();await p.keyboard.press('Enter');await p.getByRole('dialog').waitFor();assert.equal(await p.getByRole('dialog').locator('[name=program]').inputValue(),'online');await p.keyboard.press('Escape');
  results.push(`${width}px: finite track/swipe, 7 cards, geometry, 14 CTAs and reverse focus`);console.log('PASS',results.at(-1));
 }
 await home();await p.setViewportSize({width:390,height:844});await wait();assert.equal((await metrics()).mode,'swipe');await p.setViewportSize({width:1440,height:1000});await wait();assert.equal((await metrics()).mode,'sticky');
 await p.emulateMedia({reducedMotion:'reduce'});await wait();assert.equal((await metrics()).mode,'swipe');assert.equal(await p.locator('#directions').evaluate(e=>e.style.height),'');await geometry();
 await home(1440,600);assert.equal((await metrics()).mode,'swipe');await geometry();
 await home();await p.evaluate(()=>{const styles=[...document.querySelectorAll('#directions, #directions *')].map(e=>[e,getComputedStyle(e).fontSize]);for(const[e,size]of styles)e.style.fontSize=parseFloat(size)*2+'px';document.documentElement.style.fontSize='32px'});await wait();assert.equal((await metrics()).mode,'swipe');await geometry();results.push('resize, short height, reduced motion, actual 200% text: native horizontal fallback with uncut content');
 if(!source){await home(390,844,{javaScriptEnabled:false});assert.equal(await p.locator('#directions article').count(),7);assert.equal(await p.locator('#directions').getAttribute('data-mode'),null);assert.equal(await p.locator('.directions__viewport').evaluate(e=>getComputedStyle(e).overflowX),'auto');await geometry();results.push('SSG without JS: seven fixed-width cards in a native horizontal row');}
 await home();const contrast=await measureContrast(p,{selector:'.directions__navigation button,.directions__progress,.directions__media-note'});assert.deepEqual(contrast.filter(x=>x.status!=='PASS'),[]);
 for(const route of ['/travel/europe-winter-2027/','/travel/malaysia/']){await p.goto(s.baseURL+route,{waitUntil:'networkidle'});assert.ok(await p.getByText('Фотографии этой программы ещё не предоставлены.',{exact:false}).count());const summary=p.locator('summary.faq__question').first();await summary.focus();await p.keyboard.press('Enter');assert.equal(await summary.evaluate(e=>e.parentElement.open),true);await p.keyboard.press('Space');assert.equal(await summary.evaluate(e=>e.parentElement.open),false);assert.ok(await summary.evaluate(e=>e===document.activeElement));const c=await measureContrast(p,{selector:'.faq__question,.study-gallery p'});assert.deepEqual(c.filter(x=>x.status!=='PASS'),[])}results.push('Travel shared FAQ keyboard/disclosure, honest pending galleries and contrast');
 await p.goto(dev.origin+evidencePath('/.qa/study09/fixture.html'),{waitUntil:'networkidle'});const thumbs=p.locator('.study-gallery__thumbnails button');await thumbs.first().click();await p.keyboard.press('ArrowRight');assert.equal(await p.getByRole('dialog').locator('img').getAttribute('alt'),'Fixture: classroom illustration');await p.keyboard.press('ArrowLeft');await p.keyboard.press('Escape');assert.equal(await thumbs.first().evaluate(e=>e===document.activeElement),true);
 await thumbs.first().click();await p.getByRole('button',{name:'Следующее фото →',exact:true}).click();await p.getByRole('button',{name:'Следующее фото →',exact:true}).click();await p.getByRole('dialog').getByRole('status').filter({hasText:'Изображение недоступно'}).waitFor();await p.getByRole('button',{name:'Предыдущее фото',exact:false}).click();assert.ok(await p.getByRole('dialog').locator('img').isVisible());await p.getByRole('button',{name:'Закрыть',exact:true}).click();assert.ok(await thumbs.first().evaluate(e=>e===document.activeElement));
 await p.setViewportSize({width:320,height:640});await thumbs.nth(1).click();assert.ok(await p.getByRole('dialog').evaluate(e=>e.getBoundingClientRect().width<=innerWidth));for(let i=0;i<8;i++){await p.keyboard.press('Tab');assert.ok(await p.getByRole('dialog').evaluate(e=>e.contains(document.activeElement)))}await p.keyboard.press('Escape');results.push('Isolated gallery: distinct images, prev/next, arrow keys, Escape/close, focus return/trap, 320px, failed image recovery');
 assert.deepEqual(errors,[]);fs.writeFileSync(evidencePath('.qa/study09/checks.json'),JSON.stringify({source,results,errors},null,2));console.log('PASS',results.slice(process.argv.includes('--extras')?0:6).join('\nPASS '));
} catch(e){if(p)await p.screenshot({path:evidencePath('.qa/study09/failure.png')});throw e}finally{await p?.close();await b.close();if(dev!==s)await dev.close();await s.close()}
