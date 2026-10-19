import assert from 'node:assert/strict';
import {collections,permissions,rolePolicies,assertPublishable} from '../cms/schema.mjs';
import {DirectusDataAdapter} from '../cms/directus-adapter.mjs';
import {bootstrap} from '../cms/bootstrap.mjs';
assert.equal(collections.length,15);assert.equal(new Set(collections.map(c=>c.collection)).size,15);
for(const c of collections){assert.equal(c.meta.accountability,'all');assert.equal(c.meta.archive_value,'archived');assert.ok(c.fields.some(f=>f.field==='status'&&f.schema.default_value==='draft'));assert.equal(new Set(c.fields.map(f=>f.field)).size,c.fields.length);for(const f of c.fields.filter(f=>f.type==='boolean'))assert.ok(f.meta.special.includes('cast-boolean'));}
assert.ok(['administrator','editor','lead manager'].every(name=>rolePolicies[name].enforce_tfa));assert.deepEqual(rolePolicies['build service'],{admin_access:false,app_access:false,enforce_tfa:false});assert.ok(permissions('build service').every(p=>p.action==='read'&&p.collection!=='gl_leads'&&p.fields.includes('approval_hash')&&JSON.stringify(p.permissions).includes('published')&&JSON.stringify(p.permissions).includes('approved_ru')));assert.equal(rolePolicies.editor.admin_access,false);
assert.ok(permissions('editor').every(p=>p.collection!=='gl_leads'&&p.action!=='delete'));assert.ok(permissions('editor').filter(p=>p.action!=='read').every(p=>!p.validation.status._in.includes('published')));
assert.ok(permissions('lead manager').every(p=>p.collection==='gl_leads'));assert.deepEqual(permissions('lead manager').find(p=>p.action==='update').fields,['delivery_state']);
assert.throws(()=>assertPublishable({status:'draft',approved_ru:true}));
const calls=[];const adapter=new DirectusDataAdapter({url:'http://127.0.0.1:8055',token:'synthetic-token',fetchImpl:async(url,options)=>{calls.push({url:new URL(url),options});return {ok:true,json:async()=>({data:[{id:'synthetic-cms-record',status:'published',approved_ru:true}]})}}});
await adapter.getCities('ru');assert.equal(calls[0].url.pathname,'/items/gl_cities');assert.match(calls[0].url.searchParams.get('filter'),/approved_ru/);assert.equal(calls[0].options.headers.Authorization,'Bearer synthetic-token');
await assert.rejects(()=>adapter.read('leads','ru'));await assert.rejects(()=>adapter.read('cities','xx'));
const bad=new DirectusDataAdapter({url:'http://127.0.0.1:8055',fetchImpl:async()=>({ok:true,json:async()=>({data:[{status:'draft'}]})})});await assert.rejects(()=>bad.getCities('ru'));
await assert.rejects(()=>bootstrap({url:'https://production.test',token:'x'}));
const mutations=[];const result=await bootstrap({url:'http://127.0.0.1:8055',token:'synthetic-token',request:async(url,options)=>{mutations.push({path:new URL(url).pathname,options});return{ok:true,json:async()=>({data:options.method==='GET'?[]:{id:'synthetic-id'}})}}});assert.equal(result.collections,15);assert.equal(result.publicAccess,false);assert.equal(mutations.filter(c=>c.path==='/roles').length,4);assert.ok(!mutations.some(c=>c.path==='/users'));
console.log('PASS CMS preparation contracts: 15 models, approval/draft gates, 3 human roles + minimal build service, default-deny, adapter, guarded bootstrap. Production NOT DEPLOYED; actual local runtime is checked separately.');
