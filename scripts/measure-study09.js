import fs from 'node:fs';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { startLocalServer } from './local-server.js';
const phase = process.argv[2] || 'after';
if (!['before','after'].includes(phase)) throw new Error('Use before or after');
if (phase === 'before' && fs.existsSync('.qa/study09/before-lighthouse.json')) throw new Error('Baseline is already recorded; preserve it.');
const out = '.qa/study09'; fs.mkdirSync(out,{recursive:true});
const server = await startLocalServer('static');
let browser, chrome;
try {
 if(phase==='before') {
  browser=await chromium.launch({channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(server.baseURL+'/',{waitUntil:'networkidle'});
  await page.locator('#directions').screenshot({path:out+'/before-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#directions').screenshot({path:out+'/before-mobile.png'});
  try {
   await page.setViewportSize({width:1440,height:1000});
   await page.goto('https://itkidschool.tilda.ws/',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForTimeout(3000);
   fs.writeFileSync(out+'/reference-dom.txt',await page.locator('body').innerText());
   fs.writeFileSync(out+'/reference-structure.json',JSON.stringify(await page.locator('[class*=sticky], [class*=horizontal], .t396').evaluateAll(es=>es.map(e=>({id:e.closest('[id]')?.id,text:e.textContent.slice(0,150),top:e.getBoundingClientRect().top,height:e.getBoundingClientRect().height,position:getComputedStyle(e).position}))),null,2));
   await page.screenshot({path:out+'/reference-entry.png'});
   console.log('REFERENCE loaded',await page.title());
  } catch(e) { fs.writeFileSync(out+'/reference-error.txt',e.message); console.log('REFERENCE NOT OBSERVED',e.message); }
  await browser.close(); browser=null;
 }
 chrome=await chromeLauncher.launch({chromePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',chromeFlags:['--headless','--no-first-run']});
 const result=await lighthouse(server.baseURL+'/',{port:chrome.port,output:'html',onlyCategories:['performance','accessibility'],logLevel:'error'});
 fs.writeFileSync(out+'/'+phase+'-lighthouse.html',result.report);
 fs.writeFileSync(out+'/'+phase+'-lighthouse.json',JSON.stringify(result.lhr,null,2));
 const r=result.lhr;console.log(JSON.stringify({phase,url:r.finalDisplayedUrl,version:r.lighthouseVersion,config:r.configSettings,scores:Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score])),lcp:r.audits['largest-contentful-paint'].numericValue,cls:r.audits['cumulative-layout-shift'].numericValue},null,2));
} finally {await browser?.close(); await chrome?.kill();await server.close();}
