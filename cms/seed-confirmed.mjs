import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import {DEMO_CITIES,DEMO_PROGRAMS,TRAVEL_PROGRAMS,DEMO_FAQ} from '../src/data/demo.ts';
import {COMPANY} from '../src/data/company.ts';
export async function seedConfirmed({url,token}){
 const base=new URL(url);if(!['localhost','127.0.0.1'].includes(base.hostname)||!token)throw Error('Authenticated local sandbox only');
 const records=[];const add=(collection,key,value,data)=>records.push({collection,key,value,data:{status:'draft',approved_ru:true,approved_kk:false,approved_en:false,...data}});
 for(const c of DEMO_CITIES)add('cities','slug',c.id,{slug:c.id,name_ru:c.name,name_kk:c.nameKk,name_en:c.nameEn});
 for(const p of DEMO_PROGRAMS.filter(p=>p.id!=='travel')){
 const ielts=p.id==='ielts-prep',online=p.id==='online',offline=p.id==='offline';
 const body=ielts?'Онлайн и офлайн, индивидуально или мини-группа 2–6 человек. 3 месяца, 36 часов. Intermediate и выше; диагностика до начала курса.':online?'General English с 6 лет, индивидуально или группа до 6 человек; 2–3 раза в неделю.':offline?'General English с 6 лет, индивидуально или группа до 10 человек; 2–3 раза в неделю.':'General English: индивидуально и в группе, онлайн и офлайн. Один уровень — 4–6 месяцев; групповые занятия 2–3 раза в неделю.';
 add('programs','slug',p.slug,{slug:p.slug,title_ru:p.title,body_ru:body,age_group:p.ageGroup,age_min:p.id==='english-children'||online||offline?6:null,format:p.format,facts:{source:'GL_Study_Brief 16.10.2026',branch_availability:'awaiting-confirmation',schedule:'individual-with-manager'}});
 }
 for(const p of TRAVEL_PROGRAMS)add('trips','slug',p.slug,{slug:p.slug,title_ru:p.title,body_ru:p.destination,date_start:p.dateStart,date_end:p.dateEnd,age_min:p.ageMin,included:p.included,extra_costs:p.notIncluded,itinerary:[],accommodation:p.accommodation,supervision:p.included?.find(x=>x.includes('Сопровождение')),gallery:[]});
 for(const [i,q]of DEMO_FAQ.entries())add('faq','title_ru',q.question,{category:'general',title_ru:q.question,body_ru:q.answer,sort:i+1});
 add('texts','key','company-confirmed',{key:'company-confirmed',title_ru:'GL Study — подтверждённые сведения',body_ru:`С ${COMPANY.founded} года. ${COMPANY.students}. ${COMPANY.internationalStudents}. Общий телефон: ${COMPANY.phone}. Instagram: ${COMPANY.instagram}.`});
 let created=0,skipped=0;
 for(const item of records){const endpoint=new URL('/items/gl_'+item.collection,base);endpoint.searchParams.set('filter',JSON.stringify({[item.key]:{_eq:item.value}}));endpoint.searchParams.set('limit','1');const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+token}});if(!response.ok)throw Error('Seed read failed '+response.status);if((await response.json()).data.length){skipped++;continue}endpoint.search='';const write=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(item.data)});if(!write.ok)throw Error('Seed '+item.collection+': '+write.status+' '+await write.text());created++;}
 return {created,skipped,total:records.length,published:0,branches:0,legalDocuments:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const access=process.env.DIRECTUS_ADMIN_TOKEN?{url:process.env.DIRECTUS_URL,token:process.env.DIRECTUS_ADMIN_TOKEN}:JSON.parse(fs.readFileSync('.qa/study22/cms-runtime/sandbox-access.json','utf8'));console.log(await seedConfirmed(access))}
