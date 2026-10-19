import type {LeadHandler,LeadPayload} from './lead-model';
const confirmedReceipts=new WeakMap<LeadHandler,Set<string>>();
export type SubmissionStatus='idle'|'pending'|'demo'|'accepted'|'queued'|'error';
// One in-memory operation per form; no storage, endpoint or PII in URLs.
export function createLeadSubmission(onStatus:(status:SubmissionStatus)=>void,onDelivered:()=>void,onError:()=>void){
  let active:AbortController|null=null,lastAccepted:string|undefined;
  return {
    async submit(handler:LeadHandler,payload:LeadPayload){
      const fingerprint=JSON.stringify(payload);
      if(active||lastAccepted===fingerprint)return 'duplicate' as const;
      const operation=new AbortController();active=operation;onStatus('pending');
      try{
        const result=await handler(payload,operation.signal);
        if(operation.signal.aborted)return 'cancelled' as const;
        if(result.status==='accepted'&&result.delivered===true){lastAccepted=fingerprint;onStatus('accepted');const seen=confirmedReceipts.get(handler)??new Set<string>();if(!result.requestId||!seen.has(result.requestId)){if(result.requestId){seen.add(result.requestId);confirmedReceipts.set(handler,seen)}onDelivered();}return 'accepted' as const;}
        if(result.status==='queued'&&result.delivered===false){onStatus('queued');return 'queued' as const;}
        if(result.status!=='demo'||result.delivered!==false)throw Error('Unconfirmed delivery');
        onStatus('demo');return 'demo' as const;
      }catch{
        if(operation.signal.aborted)return 'cancelled' as const;
        onStatus('error');onError();return 'error' as const;
      }finally{if(active===operation)active=null;}
    },
    cancel(){active?.abort();},
    newAttempt(){if(active)return false;lastAccepted=undefined;onStatus('idle');return true;},
  };
}
