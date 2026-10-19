import {describe,expect,it,vi} from 'vitest';
import {createLeadSubmission} from '../../src/features/lead-submission';
import {demoLeadHandler,type LeadHandler,type LeadPayload} from '../../src/features/lead-model';
const payload:LeadPayload={name:'Synthetic Test',phone:'+70000000000',cityId:'almaty',comment:'',consent:{given:true,version:'1.0-demo'},context:{type:'main',ctaId:'synthetic',page:'/'},routing:{kind:'online',assignment:'unconfirmed'}};
function fixture(){const status=vi.fn(),delivered=vi.fn(),error=vi.fn();return {status,delivered,error,operation:createLeadSubmission(status,delivered,error)}}
describe('the submission controller used by LeadFormSection',()=>{
  it('demo explicitly means delivered:false and never emits success',async()=>{
    const f=fixture();expect(await demoLeadHandler(payload,new AbortController().signal)).toEqual({status:'demo',delivered:false});
    expect(await f.operation.submit(demoLeadHandler,payload)).toBe('demo');expect(f.status.mock.calls.flat()).toEqual(['pending','demo']);expect(f.delivered).not.toHaveBeenCalled();
  });
  it('a pending double click cannot create a second operation',async()=>{
    let finish!:(value:{status:'demo';delivered:false})=>void;
    const handler=vi.fn<LeadHandler>(()=>new Promise(resolve=>{finish=resolve})),f=fixture();
    const first=f.operation.submit(handler,payload);expect(f.status).toHaveBeenLastCalledWith('pending');
    expect(await f.operation.submit(handler,payload)).toBe('duplicate');expect(handler).toHaveBeenCalledTimes(1);
    finish({status:'demo',delivered:false});expect(await first).toBe('demo');
  });
  it('preserves retry after a rejection and emits success only after confirmed delivery',async()=>{
    const handler=vi.fn<LeadHandler>().mockRejectedValueOnce(Error('synthetic')).mockResolvedValue({status:'accepted',delivered:true}),f=fixture();
    expect(await f.operation.submit(handler,payload)).toBe('error');expect(f.error).toHaveBeenCalledTimes(1);expect(f.delivered).not.toHaveBeenCalled();
    expect(await f.operation.submit(handler,payload)).toBe('accepted');expect(f.delivered).toHaveBeenCalledTimes(1);
    expect(await f.operation.submit(handler,payload)).toBe('duplicate');expect(handler).toHaveBeenCalledTimes(2);
  });
  it('cancellation aborts the actual signal, keeps the lock until settlement, and cannot emit late success',async()=>{
    let finish!:(value:{status:'accepted';delivered:true})=>void,signal:AbortSignal|undefined;
    const handler=vi.fn<LeadHandler>((_payload,s)=>{signal=s;return new Promise(resolve=>{finish=resolve})}),f=fixture();
    const first=f.operation.submit(handler,payload);f.operation.cancel();expect(signal?.aborted).toBe(true);
    expect(await f.operation.submit(handler,payload)).toBe('duplicate');finish({status:'accepted',delivered:true});
    expect(await first).toBe('cancelled');expect(f.delivered).not.toHaveBeenCalled();expect(f.error).not.toHaveBeenCalled();
    expect(await f.operation.submit(demoLeadHandler,payload)).toBe('demo');
  });
  it.each([{status:'accepted',delivered:false},{status:'accepted'},{status:'sandbox',delivered:false}])('rejects an unconfirmed server result %j',async result=>{
    const f=fixture();expect(await f.operation.submit(async()=>result as Awaited<ReturnType<LeadHandler>>,payload)).toBe('error');expect(f.delivered).not.toHaveBeenCalled();
  });
});
