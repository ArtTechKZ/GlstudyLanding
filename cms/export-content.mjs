import {exportApprovedAssets} from './media-export.mjs';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {DirectusDataAdapter} from './directus-adapter.mjs';import {fields,publicFields,contentHash,validateSnapshot} from './content-contract.mjs';
const keys=['cities','branches','programs','texts','images','trips','faq','reviews','seo','cta','documents','redirects','teachers','schedules'];
export function recordFingerprint(record){return contentHash(Object.fromEntries(Object.entries(record).filter(([k])=>!['status','approved_ru','approved_kk','approved_en','approval_hash','publish_at','unpublish_at'].includes(k))))}
export function mapCmsContent(tables,{now=Date.now(),locales=['ru']}={}){
 const active=r=>{for(const date of [r.publish_at,r.unpublish_at].filter(Boolean))if(!Number.isFinite(Date.parse(date))||!date.endsWith('Z'))throw Error('Invalid publication schedule');if(r.publish_at&&Date.parse(r.publish_at)>now||r.unpublish_at&&Date.parse(r.unpublish_at)<=now)return false;if(r.approval_hash!==recordFingerprint(r))throw Error('Published content changed since approval: '+r.id);return true};
 const native=(record,mapping)=>Object.fromEntries(Object.entries(mapping).filter(([key,target])=>record[key]!=null&&(!Array.isArray(record[key])||record[key].length||Object.hasOwn(record.public_data??{},target))).map(([key,target])=>[target,record[key]]));
 const selected=Object.fromEntries(keys.map(k=>[k,(tables[k]??[]).filter(active)]));const entities=(key,extra=()=>({}))=>selected[key].map(r=>publicFields({...r.public_data,...extra(r)},fields[key]));
 const cities=entities('cities',r=>({id:r.slug,name:r.name_ru,nameKk:r.name_kk??undefined,nameEn:r.name_en??undefined,branches:[]})).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
 for(const b of selected.branches){const data=publicFields({...b.public_data,...native(b,{name_ru:'name',address:'address',phone:'phone',whatsapp:'whatsapp',latitude:'lat',longitude:'lng',schedule:'schedule',programs:'programs',photos:'photos'})},fields.branches),city=cities.find(c=>c.id===b.city);if(!city)throw Error('Orphan branch');city.branches.push({...data,cityId:city.id})}
 const programs=entities('programs',r=>({...native(r,{format:'format',age_group:'ageGroup'}),id:r.slug,slug:r.slug,title:r.title_ru,description:r.body_ru,published:true})).sort((a,b)=>a.order-b.order);
 const trips=entities('trips',r=>({...native(r,{included:'included',extra_costs:'notIncluded',itinerary:'itinerary',accommodation:'accommodation',gallery:'photos'}),slug:r.slug,title:r.title_ru,dateStart:r.date_start,dateEnd:r.date_end,ageMin:r.age_min,published:true})).sort((a,b)=>a.dateStart.localeCompare(b.dateStart));
 const faq=entities('faq',r=>({id:r.public_data?.id??r.id,question:r.title_ru,answer:r.body_ru,order:r.sort??0})).sort((a,b)=>a.order-b.order);
 const settings=selected.texts.find(x=>x.key==='site-settings')?.public_data;if(!settings)throw Error('Published site settings missing');const ui={ru:{},kk:{},en:{}};
 for(const t of selected.texts.filter(t=>t.key.startsWith('ui:'))){const key=t.key.slice(3);for(const locale of locales)if(t['approved_'+locale]&&t['body_'+locale])ui[locale][key]=t['body_'+locale]}
 for(const cta of selected.cta)if(typeof cta.key==='string'&&/^[A-Za-z][A-Za-z\d_.-]{0,150}$/.test(cta.key))for(const locale of locales)if(cta['approved_'+locale]&&cta['title_'+locale])ui[locale][cta.key]=cta['title_'+locale];
 const media=selected.images.filter(r=>r.rights_confirmed).map(r=>publicFields(r.public_data,fields.media)).sort((a,b)=>a.order-b.order);
 const seo=selected.seo.filter(r=>locales.includes(r.locale)).map(r=>publicFields(r,fields.seo));const redirects=entities('redirects');
 const routePrograms={'english-children':'/programs/english-children','english-teens':'/programs/english-teens','english-adults':'/programs/english-adults',online:'/online',offline:'/offline','ielts-prep':'/ielts'};
 const hiddenRoutes=[...Object.entries(routePrograms).filter(([id])=>!programs.some(p=>p.id===id)).map(([,route])=>route),...['europe-winter-2027','malaysia'].filter(slug=>!trips.some(p=>p.slug===slug)).map(slug=>'/travel/'+slug)];
 const data={cities,programs,trips,faq,reviews:selected.reviews.filter(r=>r.publication_consent===true).map(r=>publicFields(r.public_data,fields.reviews)).filter(x=>x.published),trialProcess:settings.trialProcess,company:publicFields(settings.company,fields.company),plannedLanguages:settings.plannedLanguages,summerDestinations:settings.summerDestinations,media,ui,seo,redirects,hiddenRoutes,legal:[]};
 // Legal files are never inferred from ordinary public_data: official operator approval is required separately.
 return validateSnapshot({schemaVersion:1,source:'directus-approved-snapshot',revision:contentHash(data),data});
}
export async function exportContent({url,token,target='src/data/content-snapshot.json',locales=['ru'],now=Date.now(),fetchImpl=fetch,localIntegration=false}){
 const u=new URL(url);if(localIntegration&&!['127.0.0.1','localhost'].includes(u.hostname))throw Error('Local CMS E2E requires loopback');if(!token)throw Error('Build read token required');const adapter=new DirectusDataAdapter({url,token,fetchImpl});
 for(let attempt=0;attempt<3;attempt++){const before=await adapter.revision(),tables={};for(const key of keys)tables[key]=await adapter.read(key,'ru');const after=await adapter.revision();if(before!==after)continue;
 for(const r of tables.images)if(r.approval_hash!==recordFingerprint(r))throw Error('Media not approved after edit');
 const approvedImages=await exportApprovedAssets(adapter,tables.images);const materialized={...tables,images:approvedImages};
 // The derivative paths are deterministic; approval applies to source fields, before materialization.
 for(const r of approvedImages)r.approval_hash=recordFingerprint(r);
 if(after!==await adapter.revision())continue;
 const snapshot=mapCmsContent(materialized,{now,locales}),resolved=path.resolve(target);fs.mkdirSync(path.dirname(resolved),{recursive:true});const text=JSON.stringify(snapshot,null,2)+'\n';if(fs.existsSync(resolved)&&fs.readFileSync(resolved,'utf8')===text)return {...snapshot,unchanged:true};const temp=resolved+'.'+process.pid+'.tmp';fs.writeFileSync(temp,text);fs.renameSync(temp,resolved);return {...snapshot,unchanged:false};
 }throw Error('CMS changed during export; previous snapshot retained');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const c=process.env.GL_CMS_ACCESS_FILE?JSON.parse(fs.readFileSync(process.env.GL_CMS_ACCESS_FILE,'utf8')):{url:process.env.DIRECTUS_URL,token:process.env.DIRECTUS_BUILD_TOKEN};const snapshot=await exportContent({...c,target:process.env.GL_CONTENT_SNAPSHOT??'src/data/content-snapshot.json',localIntegration:process.env.GL_CMS_LOCAL==='1'});console.log(JSON.stringify({revision:snapshot.revision,source:snapshot.source,unchanged:snapshot.unchanged,counts:Object.fromEntries(Object.entries(snapshot.data).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))}))}
