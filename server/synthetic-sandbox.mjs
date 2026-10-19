import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import {createHash,randomUUID} from 'node:crypto';
import site from '../src/config/site.json' with {type:'json'};
const cities=new Set(['kostanay','rudny','taraz','astana','almaty']);
const programmes=new Set(['english-children','english-teens','english-adults','ielts-prep','online','offline','travel','admissions','europe-winter-2027','malaysia',...['kazakh','czech','chinese','korean'].map(x=>'language-'+x),...['czech','malaysia','uk','cyprus','usa'].map(x=>'summer-'+x)]);
const text=(v,max,min=1)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max&&[...v].every(char=>char.charCodeAt(0)>8);
export function validatePayload(p){
 const errors=[];if(!p||typeof p!=='object'||Array.isArray(p))return ['body'];
 if(!text(p.name,100))errors.push('name');if(!/^\+7\d{10}$/.test(p.phone))errors.push('phone');
 if(!cities.has(p.cityId))errors.push('cityId');if(p.branchId)errors.push('branchId-unverified');
 if(!programmes.has(p.program))errors.push('program');
 if(!['children','teens','adults'].includes(p.ageGroup))errors.push('ageGroup');
 if(!['online','offline','hybrid'].includes(p.format))errors.push('format');if(!['phone','whatsapp'].includes(p.channel))errors.push('channel');
 if(!text(p.comment,1000,0))errors.push('comment');if(p.consent?.given!==true||p.consent?.version!=='1.0-demo')errors.push('consent');
 if(!['main','ielts','travel'].includes(p.context?.type)||!text(p.context?.ctaId,100)||!site.routes.some(r=>r.path===p.context?.page))errors.push('context');
 if(p.context?.type==='ielts'){
  if(!['Не знаю','A1','A2','B1','B2','C1','unknown'].includes(p.ielts?.currentLevel))errors.push('ielts.currentLevel');
  if(!/^(?:[0-8](?:\.5)?|9)$/.test(p.ielts?.targetScore))errors.push('ielts.targetScore');
  const d=p.ielts?.examDate;if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)errors.push('ielts.examDate');
 }
 if(p.context?.type==='travel'&&(!text(p.travel?.parentName,100)||!Number.isInteger(p.travel?.childAge)||p.travel.childAge<10||p.travel.childAge>99||!['malaysia','europe-winter-2027'].includes(p.travel?.program)))errors.push('travel');
 if(p.attribution){for(const [key,value]of Object.entries(p.attribution))if(!['landing','referrer','utm_source','utm_medium','utm_campaign','utm_term','utm_content'].includes(key)||!text(value,200))errors.push('attribution');}
 return errors;
}
// No CRM or delivery adapter is installed. This listener accepts synthetic data only.
// A future production endpoint must use approved consent, durable transactions and real receipt IDs.
export function createLeadServer({origin='http://127.0.0.1:5173',now=Date.now,maxPerMinute=10,saveSynthetic=async()=>({id:randomUUID()})}={}){
 const requests=new Map(),rate=new Map();
 return createServer(async(req,res)=>{
  const reply=(code,data,extra={})=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',...extra});res.end(JSON.stringify(data))};
  if(req.url!=='/api/leads')return reply(404,{error:'not_found'});
  if(req.method!=='POST')return reply(405,{error:'method_not_allowed'},{Allow:'POST'});
  if(req.headers.origin!==origin)return reply(403,{error:'origin_rejected'});
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']??''))return reply(415,{error:'json_required'});
  const time=now();for(const[k,v]of requests)if(time-v.time>86400000)requests.delete(k);for(const[k,v]of rate)if(time-v.time>60000)rate.delete(k);
  const ip=req.socket.remoteAddress;const bucket=rate.get(ip)??{time,count:0};bucket.count++;rate.set(ip,bucket);
  if(bucket.count>maxPerMinute)return reply(429,{error:'rate_limited'},{'Retry-After':'60'});
  let raw='';try{for await(const part of req){raw+=part;if(Buffer.byteLength(raw)>16384)return reply(413,{error:'payload_too_large'})}}catch{return reply(400,{error:'invalid_body'})}
  let envelope;try{envelope=JSON.parse(raw)}catch{return reply(400,{error:'invalid_json'})}
  const {payload,antiSpam}=envelope??{};
  if(antiSpam?.website||!Number.isFinite(antiSpam?.startedAt)||time-antiSpam.startedAt<1000||time-antiSpam.startedAt>3600000)return reply(422,{error:'antispam'});
  // Fail closed for any non-synthetic name/phone. Never logs request payloads.
  if(payload?.name!=='Synthetic Test'||payload?.phone!=='+70000000000'||(payload?.travel&&payload.travel.parentName!=='Synthetic Test'))return reply(503,{error:'demo_only',fallback:'company-phone'});
  const errors=validatePayload(payload);if(errors.length)return reply(422,{error:'validation',fields:errors});
  const key=req.headers['idempotency-key'];if(typeof key!=='string'||!/^[-\w]{16,100}$/.test(key))return reply(400,{error:'idempotency_required'});
  const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');const old=requests.get(key);
  if(old&&old.hash!==hash)return reply(409,{error:'idempotency_conflict'});
  if(old){const result=await old.result;return reply(result.code,result.body)}
  // Register promise before awaiting storage, preventing concurrent duplicate writes.
  const result=(async()=>{try{const receipt=await saveSynthetic(payload);if(!receipt?.id)throw Error('No receipt');return {code:200,body:{status:'sandbox',receipt:receipt.id,delivered:false}}}catch{return {code:503,body:{error:'storage_unavailable',retryable:true,fallback:'company-phone'}}}})();
  requests.set(key,{hash,time,result});const answer=await result;if(answer.code>=500)requests.delete(key);return reply(answer.code,answer.body);
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=createLeadServer();server.listen(8787,'127.0.0.1',()=>console.log('Synthetic-only lead sandbox: http://127.0.0.1:8787/api/leads; no CRM/delivery'));
}
