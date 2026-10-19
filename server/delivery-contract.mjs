import {COMPANY} from '../src/data/company.ts';
import {createHash} from 'node:crypto';
import {normalizePhone,routingKind} from '../src/features/lead-contract.js';
import {DEMO_CITIES,DEMO_PROGRAMS,TRAVEL_PROGRAMS} from '../src/data/demo.ts';
import site from '../src/config/site.json' with {type:'json'};
export const hash=value=>createHash('sha256').update(typeof value==='string'?value:canonical(value)).digest('hex');
export function canonical(v){return JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x)}
// eslint-disable-next-line no-control-regex -- Reject control characters in submitted user text.
const safeText=(v,max,min=0)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
export function validateDeliveryPayload(p){
 const errors=[];if(!exact(p,['routing','name','phone','cityId','branchId','ageGroup','program','format','channel','comment','consent','context','attribution','ielts','travel','locale']))return {errors:['body']};
 const phone=typeof p.phone==='string'?normalizePhone(p.phone):'';
 if(!safeText(p.name,100,1))errors.push('name');if(!phone)errors.push('phone');if(!safeText(p.comment,1000))errors.push('comment');
 const city=DEMO_CITIES.find(c=>c.id===p.cityId);if(!city)errors.push('cityId');const branch=p.branchId?city?.branches.find(b=>b.id===p.branchId&&b.status==='active'):undefined;if(p.branchId&&!branch)errors.push('branchId');
 const context=p.context; if(!exact(context,['type','program','ctaId','page','format','intent'])||!['main','ielts','travel','callback'].includes(context?.type)||!safeText(context?.ctaId,100,1)||!site.routes.some(r=>r.path===context?.page))errors.push('context');
 const program=DEMO_PROGRAMS.find(x=>x.id===p.program&&x.published),trip=TRAVEL_PROGRAMS.find(x=>x.slug===p.program&&x.published);
 const planned=/^(?:language-(?:kazakh|czech|chinese|korean)|summer-(?:czech|malaysia|uk|cyprus|usa)|admissions)$/.test(p.program??'');if((context?.type!=='callback'||p.program!==undefined)&&!program&&!trip&&!planned)errors.push('program');
 if(context?.type!=='travel'&&context?.type!=='callback'&&!['children','teens','adults'].includes(p.ageGroup))errors.push('ageGroup');
 if(context?.type!=='travel'&&context?.type!=='callback'&&!['online','offline','hybrid'].includes(p.format))errors.push('format');
 if(context?.type!=='callback'&&!['phone','whatsapp'].includes(p.channel)||p.channel!==undefined&&!['phone','whatsapp'].includes(p.channel))errors.push('channel');
 if(program&&program.format!=='hybrid'&&p.format&&program.format!==p.format)errors.push('program-format');if(branch?.programs&&!branch.programs.includes(p.program))errors.push('branch-program');
 if(context?.program&&context.program!==p.program)errors.push('context-program');if(context?.format&&context.format!==p.format)errors.push('context-format');
 if(!exact(p.consent,['given','version'])||p.consent.given!==true||!safeText(p.consent.version,100,1))errors.push('consent');if(p.locale&&!['ru','kk','en'].includes(p.locale))errors.push('locale');
 if(p.ageGroup!==undefined&&!['children','teens','adults'].includes(p.ageGroup))errors.push('ageGroup');if(p.format!==undefined&&!['online','offline','hybrid'].includes(p.format))errors.push('format');if(context?.intent!==undefined&&!['international','language-start'].includes(context.intent))errors.push('context-intent');
 if(program?.ageGroup!=='all'&&program&&p.ageGroup!==program.ageGroup&&context?.type!=='callback')errors.push('program-ageGroup');
 if(context?.type==='ielts'){
  if(p.program!=='ielts-prep'||!exact(p.ielts,['currentLevel','targetScore','examDate']))errors.push('ielts');
  if(!['Не знаю','A1','A2','B1','B2','C1'].includes(p.ielts?.currentLevel))errors.push('ielts.currentLevel');if(typeof p.ielts?.targetScore!=='string'||!/^(?:[0-8](?:\.5)?|9)$/.test(p.ielts?.targetScore))errors.push('ielts.targetScore');
  const d=p.ielts?.examDate;if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d??'')||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)errors.push('ielts.examDate');
 }else if(p.ielts)errors.push('ielts-unexpected');
 if(context?.type==='travel'){
  if(!trip||!exact(p.travel,['parentName','childAge','program'])||!safeText(p.travel.parentName,100,1)||!Number.isInteger(p.travel.childAge)||p.travel.childAge<trip.ageMin||p.travel.childAge>99||p.travel.program!==p.program)errors.push('travel');
 }else if(p.travel)errors.push('travel-unexpected');
 if(p.attribution){if(!exact(p.attribution,['landing','referrer','utm_source','utm_medium','utm_campaign','utm_term','utm_content']))errors.push('attribution');else for(const [key,v] of Object.entries(p.attribution)){if(!safeText(v,120)||/@|(?:\+?\d[ ()-]*){10}|token|bearer|secret/i.test(v)||(key==='landing'&&!/^\/[a-z\d/_-]*$/i.test(v))||(key==='referrer'&&!/^(https?:\/\/)?[a-z\d.-]+$/i.test(v)))errors.push('attribution')}}
 // Client routing is never used to choose a destination. Reject supplied manager contacts.
 const route=p.routing,kind=context?routingKind(context,p.format):null;
 if(!route||route.kind!==kind)errors.push('routing');
 else if(kind==='course'&&(!exact(route,['kind','assignment','cityId','branchId','preferredArea','branchSelection'])||route.assignment!=='branch-manager'||route.cityId!==p.cityId||route.branchId!==p.branchId||route.branchSelection!==(p.branchId?'selected':'manager-clarifies')||route.preferredArea!==undefined&&!safeText(route.preferredArea,100)))errors.push('routing');
 else if(kind==='online'&&(!exact(route,['kind','assignment'])||route.assignment!=='unconfirmed'))errors.push('routing');
 else if(kind==='international'&&(!exact(route,['kind','assignment','destination'])||route.assignment!=='manual-whatsapp'||route.destination!==COMPANY.internationalWhatsApp))errors.push('routing');

 return {errors:[...new Set(errors)],payload:{...p,name:p.name?.trim(),phone,comment:p.comment?.trim(),...(p.travel?{travel:{...p.travel,parentName:p.travel.parentName?.trim()}}:{})}};
}
export function routeDelivery(p,routes){
 const kind=routingKind(p.context,p.format);
 const key=kind==='course'?'course:'+p.cityId+(p.branchId?':'+p.branchId:''):kind;const route=routes[key];
 if(!route||!/^[-a-zA-Z0-9_:.]{1,100}$/.test(route.recipient??''))return null;
 return {key,recipient:route.recipient,primary:route.primary,reserve:route.reserve};
}
export function readiness(config){
 const missing=[];if(!['demo','local-integration','approved-staging','production'].includes(config.mode))missing.push('environment');
 if(config.mode==='demo')return {ready:false,mode:'demo',missing:['delivery-disabled']};
 if(!config.database)missing.push('durable-database');if(!config.routes||!Object.keys(config.routes).length)missing.push('routing');
 const legal=config.consent;if(!legal?.version||!legal.text||!legal.documentId||!legal.localTest&&!legal.approved)missing.push('approved-consent');
 if(config.mode!=='local-integration'&&config.externalWriteApproved!==true)missing.push('external-write-approval');
 if(config.mode!=='local-integration'&&(!legal?.approved||legal.localTest))missing.push('production-legal');
 if(config.antibot&&(!['turnstile'].includes(config.antibot.provider)||!config.antibot.secret||!config.antibot.hostname||!config.antibot.action))missing.push('antibot-configuration');
 if(!config.origins?.length)missing.push('allowed-origins');if(config.mode!=='local-integration'&&!config.antibot)missing.push('antibot-provider');
 for(const origin of config.origins??[]){try{const u=new URL(origin);if(u.origin!==origin||(config.mode!=='local-integration'&&u.protocol!=='https:'))missing.push('origin-https')}catch{missing.push('invalid-origin')}}
 for(const [name,channel]of Object.entries(config.channels??{})){if(channel.timeoutMs!==undefined&&(!Number.isInteger(channel.timeoutMs)||channel.timeoutMs<10||channel.timeoutMs>10000))missing.push('channel-timeout:'+name);for(const value of [channel.url,channel.statusUrl].filter(v=>v!==undefined)){try{const u=new URL(value);if(u.username||u.password||u.hash||(u.protocol!=='https:'&&!(config.mode==='local-integration'&&u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname))))missing.push('channel-https:'+name)}catch{missing.push('invalid-channel-url:'+name)}}if(!channel.url)missing.push('channel-url:'+name);if(!channel.idempotencySupported&&!channel.statusUrl)missing.push('channel-reconciliation:'+name)}
 for(const r of Object.values(config.routes??{}))for(const name of [r.primary,r.reserve].filter(Boolean))if(!config.channels?.[name])missing.push('channel:'+name);
 return {ready:!missing.length,mode:config.mode,missing:[...new Set(missing)]};
}
