import {publicReceipt} from './delivery-store.mjs';
const receipt=(body,lead,recipient)=>body?.delivered===true&&body.requestId===lead.id&&body.recipient===recipient&&typeof body.receiptId==='string'&&/^[-a-zA-Z0-9_:.]{1,150}$/.test(body.receiptId)&&typeof body.deliveredAt==='string'&&Number.isFinite(Date.parse(body.deliveredAt));
export function retryAfter(value,now){if(!value)return 0;const seconds=Number(value);return Math.min(3600000,Math.max(0,Number.isFinite(seconds)?seconds*1000:Date.parse(value)-now||0))}
export function createDeliveryWorker(store,config,{now=Date.now,fetchImpl=fetch}={}){
 let running=false;
 async function send(channel,lead,route){
  let response,body;try{response=await fetchImpl(channel.url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':lead.id,...(channel.token?{Authorization:'Bearer '+channel.token}:{})},body:JSON.stringify({requestId:lead.id,recipient:route.recipient,payload:JSON.parse(lead.payload),consent:JSON.parse(lead.consent)}),signal:AbortSignal.timeout(channel.timeoutMs??5000),redirect:'error'});try{body=await response.json()}catch{}
   if(response.ok&&receipt(body,lead,route.recipient))return {delivered:body};
   const rejected=body?.requestId===lead.id&&body?.accepted===false&&body?.delivered===false;
   const retryable=response.status===429||response.status>=500;return {error:response.ok?'invalid-receipt':'http-'+response.status,retryable,ambiguous:!rejected,delay:retryAfter(response.headers.get('retry-after'),now())};
  }catch{return {error:'network-or-timeout',retryable:true,ambiguous:true}}
 }
 async function reconcile(channel,lead,route){if(!channel.statusUrl)return null;try{const u=new URL(channel.statusUrl);u.searchParams.set('requestId',lead.id);const r=await fetchImpl(u,{headers:channel.token?{Authorization:'Bearer '+channel.token}:{},signal:AbortSignal.timeout(channel.timeoutMs??5000),redirect:'error'}),body=await r.json();if(!r.ok)return null;if(receipt(body,lead,route.recipient))return {delivered:body};if(body.requestId===lead.id&&body.found===false&&body.final===true)return {notFound:true};return null}catch{return null}}
 return {async tick(){if(running)return false;running=true;try{const lead=store.claim(now());if(!lead)return false;const route=JSON.parse(lead.route),channelName=lead.channel??route.primary,channel=config.channels[channelName];if(!channel){store.finish(lead.id,'failed',{error:'channel-unconfigured',now:now()});return true}
   // A crashed process or ambiguous previous outcome is reconciled before replay/fallback.
   let result;if(lead.previousState==='sending'||lead.previousState==='retry-pending'){
    const status=await reconcile(channel,lead,route);if(status?.delivered)result=status;
    else if(!status?.notFound&&!channel.idempotencySupported){store.finish(lead.id,'failed',{channel:channelName,error:'unknown-outcome-manual-reconciliation',now:now()});return true}
   }
   result??=await send(channel,lead,route);
   if(result.delivered){store.finish(lead.id,channelName===route.primary?'delivered-primary':'delivered-reserve',{channel:channelName,receipt:result.delivered.receiptId,now:now()});return true}
   let ambiguous=result.ambiguous;
   if(ambiguous){const status=await reconcile(channel,lead,route);if(status?.delivered){store.finish(lead.id,channelName===route.primary?'delivered-primary':'delivered-reserve',{channel:channelName,receipt:status.delivered.receiptId,now:now()});return true}if(status?.notFound)ambiguous=false}
   const max=config.maxAttempts??3;
   if(ambiguous){if(lead.attempts<max&&channel.idempotencySupported)store.finish(lead.id,'retry-pending',{channel:channelName,error:result.error,nextAt:now()+Math.max(result.delay??0,Math.min(60000,1000*2**lead.attempts)),now:now()});else store.finish(lead.id,'failed',{channel:channelName,error:'unknown-outcome-manual-reconciliation',now:now()});return true}
   if(result.retryable&&lead.attempts<max){store.finish(lead.id,'retry-pending',{channel:channelName,error:result.error,nextAt:now()+Math.max(result.delay??0,Math.min(60000,1000*2**lead.attempts)),now:now()});return true}
   if(channelName===route.primary&&route.reserve){store.finish(lead.id,'queued',{channel:route.reserve,error:result.error,resetAttempts:true,nextAt:now(),now:now()});return true}
   store.finish(lead.id,'failed',{channel:channelName,error:result.error,now:now()});return true;
  }finally{running=false}},status:publicReceipt};
}
