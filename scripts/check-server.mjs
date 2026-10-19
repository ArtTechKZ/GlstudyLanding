import assert from 'node:assert/strict';
import {createLeadServer,validatePayload} from '../server/lead-api.mjs';
const payload={name:'Synthetic Test',phone:'+70000000000',cityId:'kostanay',ageGroup:'adults',program:'english-adults',format:'offline',channel:'phone',comment:'',consent:{given:true,version:'1.0-demo'},context:{type:'main',ctaId:'sandbox',page:'/programs/english-adults'}};
assert.deepEqual(validatePayload(payload),[]);
assert.ok(validatePayload({...payload,cityId:'unknown',consent:{given:false}}).length===2);
assert.ok(validatePayload({...payload,context:{...payload.context,type:'ielts'},ielts:{currentLevel:'B1',targetScore:'10',examDate:'2027-02-30'}}).length===2);
assert.ok(validatePayload({...payload,context:{...payload.context,type:'travel'},travel:{parentName:'Synthetic Test',childAge:9,program:'malaysia'}}).includes('travel'));
let writes=0,fail=false;const server=createLeadServer({maxPerMinute:100,saveSynthetic:async()=>{writes++;await new Promise(r=>setTimeout(r,15));if(fail)throw Error('fixture');return{id:'synthetic-receipt'}}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/api/leads`;
const post=(data=payload,key='synthetic-key-0001',headers={},antiSpam={website:'',startedAt:Date.now()-2000})=>fetch(url,{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json','Idempotency-Key':key,...headers},body:JSON.stringify({payload:data,antiSpam})});
try{
 const responses=await Promise.all([post(),post()]);assert.deepEqual(responses.map(r=>r.status),[200,200]);assert.equal(writes,1);const body=await responses[0].json();assert.equal(body.status,'sandbox');assert.equal(body.delivered,false);
 assert.equal((await post({...payload,comment:'changed'})).status,409);
 assert.equal((await post(payload,'synthetic-key-0002',{Origin:'https://other.test'})).status,403);
 assert.equal((await post(payload,'synthetic-key-0002',{}, {website:'bot',startedAt:Date.now()-2000})).status,422);
 assert.equal((await post({...payload,name:'Real person'},'synthetic-key-0002')).status,503);
 assert.equal((await post({...payload,branchId:'fake'},'synthetic-key-0002')).status,422);
 assert.equal((await post(payload,'bad')).status,400);
 assert.equal((await post(payload,'synthetic-key-0003',{'Content-Type':'text/plain'})).status,415);
 fail=true;assert.equal((await post(payload,'synthetic-key-retry')).status,503);fail=false;assert.equal((await post(payload,'synthetic-key-retry')).status,200);assert.equal(writes,3);
 assert.equal((await fetch(url,{method:'GET'})).status,405);
 const bad=await fetch(url,{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:'{broken'});assert.equal(bad.status,400);
 const huge=await post({...payload,comment:'x'.repeat(17000)},'synthetic-key-large');assert.equal(huge.status,413);
 console.log('PASS server: validation, origin, media type, size, anti-spam, synthetic-only gate, concurrent idempotency, conflict, retry; no delivery');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
const limited=createLeadServer({maxPerMinute:1});await new Promise(r=>limited.listen(0,'127.0.0.1',r));const u=`http://127.0.0.1:${limited.address().port}/api/leads`;try{const opts={method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:'{}'};await fetch(u,opts);assert.equal((await fetch(u,opts)).status,429)}finally{limited.closeAllConnections();await new Promise(r=>limited.close(r))}
