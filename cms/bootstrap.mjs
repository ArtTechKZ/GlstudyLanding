import recommendedSelfProfile from './recommended-self-profile.json' with {type:'json'};
import {collections,rolePolicies,permissions,fileRelations} from './schema.mjs';
import {pathToFileURL} from 'node:url';
// Provision only a blank local instance. No remote production mutations.
export async function bootstrap({url,token,request=fetch}){
 const base=new URL(url);if(!['127.0.0.1','localhost'].includes(base.hostname)||base.username||base.password)throw Error('Local sandbox only');if(!token)throw Error('Admin token required');
 const call=async(path,method='GET',body)=>{const response=await request(new URL(path,base),{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!response.ok){const error=await response.json().catch(()=>({}));throw Error('Directus '+path+': '+response.status+' '+(error.errors?.[0]?.extensions?.category??error.errors?.[0]?.extensions?.code??'request failed')+'; partial local setup may remain; no permissions were broadened');}return response.json()};
 const existing=await call('/collections');if(existing.data.some(c=>c.collection.startsWith('gl_')))throw Error('Not a blank sandbox; refusing overwrite');
 for(const collection of collections)await call('/collections','POST',collection);
 for(const relation of fileRelations){await call('/fields/'+relation.collection+'/'+relation.field,'PATCH',{meta:{interface:relation.collection==='gl_documents'?'file':'file-image',special:['file']}});await call('/relations','POST',relation)}
 for(const[name,options]of Object.entries(rolePolicies)){
  const {data:policy}=await call('/policies','POST',{name:'GL '+name,...options});
  const {data:role}=await call('/roles','POST',{name});
  await call('/access','POST',{role:role.id,policy:policy.id});
  if(options.app_access&&!options.admin_access)await call('/permissions','POST',{...recommendedSelfProfile,policy:policy.id});
  for(const permission of permissions(name))await call('/permissions','POST',{...permission,policy:policy.id});
 }
 // Public role receives NO permissions. Content export uses a server token.
 return {collections:collections.length,roles:Object.keys(rolePolicies),publicAccess:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const result=await bootstrap({url:process.env.DIRECTUS_URL,token:process.env.DIRECTUS_ADMIN_TOKEN});console.log(result)}
