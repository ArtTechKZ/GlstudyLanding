import {DirectusDataAdapter} from './directus-adapter.mjs';
// Install cms/extensions/gl-local-build first. The secret is injected through
// the CMS environment, never operation options, content or a browser bundle.
export async function installLocalBuildFlow({url,token}){
 if(!['127.0.0.1','localhost'].includes(new URL(url).hostname))throw Error('Loopback-only CMS build trigger');const adapter=new DirectusDataAdapter({url,token}),name='GL24 local approved content build',existing=(await adapter.request('flows?filter='+encodeURIComponent(JSON.stringify({name:{_eq:name}})))).data;if(existing.length)return {flowId:existing[0].id,existing:true};
 const call=async(resource,method,data)=>{const r=await fetch(new URL('/'+resource,url),{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error('CMS flow configuration rejected: '+r.status);return (await r.json()).data};
 const flow=await call('flows','POST',{name,status:'inactive',trigger:'event',accountability:'all',options:{type:'action',scope:['items.update'],collections:['gl_cities','gl_branches','gl_programs','gl_texts','gl_images','gl_trips','gl_faq','gl_reviews','gl_teachers','gl_seo','gl_cta','gl_documents','gl_redirects','gl_schedules']}});
 try{const queue=await call('operations','POST',{name:'Signed fixed loopback GL build',key:'queue_local_candidate',type:'gl-local-build',position_x:35,position_y:20,flow:flow.id,options:{}});
 const condition=await call('operations','POST',{name:'Publication or archive only',key:'publication_only',type:'condition',position_x:10,position_y:5,flow:flow.id,resolve:queue.id,options:{filter:{$trigger:{payload:{status:{_in:['published','archived']}}}}}});
 await call('flows/'+flow.id,'PATCH',{operation:condition.id,status:'active'});return {flowId:flow.id,status:'active',network:'fixed authenticated local candidate build; no deployment'};
 }catch(e){await call('flows/'+flow.id,'PATCH',{status:'inactive'}).catch(()=>{});throw e}
}

export async function installLocalScheduleFlow({url,token}){
 if(!['127.0.0.1','localhost'].includes(new URL(url).hostname))throw Error('Loopback-only CMS schedule');
 const adapter=new DirectusDataAdapter({url,token}),name='GL24 local scheduled snapshot';
 const existing=(await adapter.request('flows?filter='+encodeURIComponent(JSON.stringify({name:{_eq:name}})))).data;
 if(existing.length)return {flowId:existing[0].id,existing:true};
 const call=async(resource,method,body)=>{const r=await fetch(new URL('/'+resource,url),{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Native schedule configuration '+r.status);return (await r.json()).data};
 const flow=await call('flows','POST',{name,status:'inactive',trigger:'schedule',accountability:'all',options:{cron:'* * * * *'}});
 try{const operation=await call('operations','POST',{name:'Check approved snapshot publication windows',key:'scheduled_snapshot',type:'gl-local-build',flow:flow.id,position_x:10,position_y:5,options:{}});await call('flows/'+flow.id,'PATCH',{operation:operation.id,status:'active'});return {flowId:flow.id,status:'active',cron:'once per minute; rebuild only when snapshot revision changes',deployed:false}}catch(e){await call('flows/'+flow.id,'PATCH',{status:'inactive'}).catch(()=>{});throw e}
}
