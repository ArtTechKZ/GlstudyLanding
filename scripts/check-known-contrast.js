import {evidencePath} from './evidence-path.js';
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {chromium} from 'playwright';import {startLocalServer,projectRoot} from './local-server.js';
import {measureContrast} from './contrast-check.js';
const s=await startLocalServer('dev'),b=await chromium.launch({channel:'msedge'}),results=[];
try{const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.goto(s.baseURL+'/',{waitUntil:'networkidle'});
const links=p.locator('.directions__card--orange .directions__card-link');assert.equal(await links.count(),2);
for(const state of ['default','hover','focus']){
 for(let i=0;i<2;i++){const a=links.nth(i);await a.scrollIntoViewIfNeeded();if(state==='hover')await a.hover();if(state==='focus')await a.focus();
 const measured=await measureContrast(p,{selector:'.directions__card--orange .directions__card-link'});
 results.push({...measured[i],state});assert.equal(measured[i].status,'PASS');assert.ok(measured[i].ratio>=4.5,'normal text must meet 4.5:1');
 }}
const dir=path.join(projectRoot,evidencePath('.qa/study21'));fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'known-contrast.json'),JSON.stringify(results,null,2));
console.log('PASS: both formerly failing links meet 4.5:1 in default, hover and focus; no contrast exception.');
}finally{await b.close();await s.close()}

