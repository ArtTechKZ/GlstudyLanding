import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { startLocalServer } from './local-server.js';
const diagnostic=process.argv.includes('--diagnostic'),count=diagnostic?1:3,folder='.qa/study11';
fs.mkdirSync(folder,{recursive:true});
const baseline=JSON.parse(fs.readFileSync('.qa/study09/after-lighthouse.json','utf8'));
const server=await startLocalServer('static');const runs=[];
try{for(let i=1;i<=count;i++){
 let chrome;
 try{
  chrome=await chromeLauncher.launch({chromePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',chromeFlags:['--headless','--no-first-run']});
  const {lhr,report}=await lighthouse(server.baseURL+'/',{port:chrome.port,output:'html',onlyCategories:['performance','accessibility'],logLevel:'error'});
  let number=i;if(diagnostic)while(fs.existsSync(`${folder}/diagnostic-${number}.json`))number++;
  const name=(diagnostic?'diagnostic':'final')+'-'+number;
  fs.writeFileSync(`${folder}/${name}.json`,JSON.stringify(lhr,null,2));fs.writeFileSync(`${folder}/${name}.html`,report);
  for(const key of ['formFactor','throttling','throttlingMethod','screenEmulation','emulatedUserAgent'])if(JSON.stringify(lhr.configSettings[key])!==JSON.stringify(baseline.configSettings[key]))throw Error('Changed conditions: '+key);
  const result={run:i,url:lhr.finalDisplayedUrl,version:lhr.lighthouseVersion,performance:lhr.categories.performance.score*100,accessibility:lhr.categories.accessibility.score*100,lcpMs:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue,tbt:lhr.audits['total-blocking-time'].numericValue,lcpElement:lhr.audits['lcp-breakdown-insight']?.details};runs.push(result);console.log(JSON.stringify(result));
 }finally{await chrome?.kill()}
}
 const median=key=>runs.map(r=>r[key]).sort((a,b)=>a-b)[Math.floor(runs.length/2)];
 const summary={diagnostic,conditions:'Same raw static server and LH13.5 mobile/simulated defaults as 09; fresh Chrome profile every run, sequential, no parallel heavy checks',runs,median:Object.fromEntries(['performance','accessibility','lcpMs','cls','tbt'].map(k=>[k,median(k)]))};fs.writeFileSync(`${folder}/${diagnostic?'diagnostic':'lighthouse-summary'}.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary.median));
}finally{await server.close()}
