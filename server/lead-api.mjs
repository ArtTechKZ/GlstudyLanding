import {createAntibotVerifier} from './antibot.mjs';
import {createServer} from 'node:http';import {randomUUID} from 'node:crypto';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import {validateDeliveryPayload,routeDelivery,readiness,hash} from './delivery-contract.mjs';import {DeliveryStore,publicReceipt} from './delivery-store.mjs';import {createDeliveryWorker} from './delivery-worker.mjs';
export {createLeadServer,validatePayload} from './synthetic-sandbox.mjs';
export function createDeliveryServer(config,{now=Date.now,store=new DeliveryStore(config.database??':memory:'),fetchImpl=fetch}={}){
 const ready=readiness(config),verifyAntibot=config.antibot&&ready.ready?createAntibotVerifier(config.antibot,{fetchImpl,now}):null,worker=createDeliveryWorker(store,config,{now,fetchImpl});let timer;
 const server=createServer(async(req,res)=>{
  const requestId=randomUUID(),origin=req.headers.origin;
  const allowed=config.origins?.includes(origin);
  const reply=(code,body,extra={})=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',...(allowed?{'Access-Control-Allow-Origin':origin,Vary:'Origin'}:{}),...extra});res.end(JSON.stringify({...body,traceId:requestId}))};
  const pathname=req.url?.split('?')[0];if(pathname==='/api/readiness'&&req.method==='GET')return reply(ready.ready?200:503,ready);
  if(!['/api/leads','/api/leads/status'].includes(pathname)||req.url!==pathname)return reply(404,{error:'not-found'});
  if(req.method==='OPTIONS'){if(!allowed)return reply(403,{error:'origin-rejected'});return reply(204,{}, {'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, Idempotency-Key','Access-Control-Max-Age':'600'})}
  if(req.method!=='POST')return reply(405,{error:'method-not-allowed'},{Allow:'POST, OPTIONS'});if(!allowed)return reply(403,{error:'origin-rejected'});
  if(!ready.ready)return reply(503,{error:'not-ready',missing:ready.missing,mode:ready.mode});
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??''))return reply(415,{error:'json-required'});
  try{
   if(!store.limit(hash((req.socket.remoteAddress??'unknown')+pathname),now(),pathname.endsWith('/status')?(config.maxStatusPerMinute??120):(config.maxPerMinute??20)))return reply(429,{error:'rate-limited'},{'Retry-After':'60'});
   let size=0,parts=[];for await(const part of req){size+=part.length;if(size>(config.maxBodyBytes??16384))return reply(413,{error:'body-too-large'});parts.push(part)}
   let envelope;try{envelope=JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{return reply(400,{error:'invalid-json'})}
   if(pathname.endsWith('/status')){const match=/^Bearer ([A-Za-z\d_-]{43})$/.exec(req.headers.authorization??''),lead=match?store.status(match[1]):null;if(!lead)return reply(404,{error:'not-found'});return reply(200,publicReceipt(lead))}
   if(!envelope||typeof envelope!=='object'||Object.keys(envelope).some(k=>!['payload','antiSpam'].includes(k)))return reply(422,{error:'invalid-envelope'});
   const spam=envelope.antiSpam;if(!spam||Object.keys(spam).some(k=>!['website','startedAt','token'].includes(k))||spam.website||!Number.isFinite(spam.startedAt)||now()-spam.startedAt<1000||now()-spam.startedAt>3600000)return reply(422,{error:'antispam'});
   if(verifyAntibot&&!await verifyAntibot(spam.token))return reply(422,{error:'antibot-rejected'});
   const result=validateDeliveryPayload(envelope.payload);if(result.errors.length)return reply(422,{error:'validation',fields:result.errors});const p=result.payload;
   if(config.mode==='local-integration'&&(p.name!=='Synthetic Test'||p.phone!=='+70000000000'||p.travel&&p.travel.parentName!=='Synthetic Test'))return reply(422,{error:'synthetic-data-required'});
   if(p.consent.version!==config.consent.version)return reply(422,{error:'consent-version'});
   const route=routeDelivery(p,config.routes);if(!route)return reply(422,{error:'recipient-unconfigured'});
   const key=req.headers['idempotency-key'];if(typeof key!=='string'||!/^[-A-Za-z\d_]{16,100}$/.test(key))return reply(400,{error:'idempotency-required'});
   const consent={given:true,version:config.consent.version,documentId:config.consent.documentId,sha256:hash(config.consent.text),recordedAt:new Date(now()).toISOString(),locale:p.locale??'ru',source:p.context.page,localTest:!!config.consent.localTest};
   const accepted=store.accept(key,p,route,consent,now());if(accepted.conflict)return reply(409,{error:'idempotency-conflict'});
   return reply(accepted.lead.state.startsWith('delivered-')?200:202,{...publicReceipt(accepted.lead),statusToken:accepted.lead.token,duplicate:accepted.duplicate,environment:config.mode});
  }catch{return reply(503,{error:'service-unavailable',retryable:true})}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 server.on('close',()=>{clearInterval(timer);store.close()});
 return {server,store,worker,readiness:ready,startWorker(interval=500){if(!timer)timer=setInterval(()=>worker.tick().catch(()=>{}),interval);timer.unref()}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const config=process.env.GL_LEAD_CONFIG?JSON.parse(fs.readFileSync(process.env.GL_LEAD_CONFIG,'utf8')):{mode:'demo',origins:['http://127.0.0.1:4173']};
 const app=createDeliveryServer(config);app.server.listen(Number(process.env.GL_LEAD_PORT??8787),'127.0.0.1',()=>console.log(JSON.stringify({service:'GL Study lead API',mode:config.mode,readiness:app.readiness,bind:'127.0.0.1',port:Number(process.env.GL_LEAD_PORT??8787)})));if(app.readiness.ready)app.startWorker();
}
