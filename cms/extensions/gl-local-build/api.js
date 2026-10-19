import {createHmac,randomUUID} from 'node:crypto';
const collections=new Set(['gl_cities','gl_branches','gl_programs','gl_texts','gl_images','gl_trips','gl_faq','gl_reviews','gl_teachers','gl_seo','gl_cta','gl_documents','gl_redirects','gl_schedules']);
export default {id:'gl-local-build',handler:async(_options,{data,env,flow})=>{
 const trigger=data?.$trigger,status=trigger?.payload?.status,scheduled=flow?.trigger==='schedule'&&flow?.name==='GL24 local scheduled snapshot'&&flow?.options?.cron==='* * * * *'&&trigger===null;if(!scheduled){if(data?.$accountability?.admin!==true)throw Error('Local build requires a publisher administrator');if(!collections.has(trigger?.collection)||!['published','archived'].includes(status)||status==='published'&&!/^[a-f\d]{64}$/.test(trigger.payload.approval_hash??''))throw Error('Not an approved publication event')}
 const secret=env.GL_BUILD_TRIGGER_SECRET;if(typeof secret!=='string'||secret.length<32)throw Error('Private local build secret missing');
 const body=JSON.stringify({id:randomUUID(),timestamp:new Date().toISOString(),event:scheduled?'schedule':status==='archived'?'archived':'published'}),signature=createHmac('sha256',secret).update(body).digest('hex');
 // This purpose-built internal operation accepts no URL, port, code, command, or secret from CMS content.
 const r=await fetch('http://127.0.0.1:8791/build-events',{method:'POST',headers:{'Content-Type':'application/json','X-GL-Signature':signature},body,signal:AbortSignal.timeout(5000),redirect:'error'});if(r.status!==202)throw Error('Local candidate queue rejected the event: '+r.status);return {status:'local-candidate-queued',published:false};
}};
