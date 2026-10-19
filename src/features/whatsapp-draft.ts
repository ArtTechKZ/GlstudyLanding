import {COMPANY} from '../data/company';import {DEMO_CITIES} from '../data/demo';import {EMPTY_DRAFT,validateLead,normalizePhone,type LeadPayload} from './lead-model';
type PersonalField='name'|'phone'|'comment'|'parentName'|'childAge';
// Prepared adapter only. No public form imports it; it never opens a window,
// stores a draft, or claims delivery. A future approved UI must show the preview
// and recipient and require a separate explicit click.
export function prepareInternationalWhatsApp(payload:LeadPayload,approval:{scenarioApproved:boolean;personalFields?:PersonalField[]}={scenarioApproved:false}){
 if(!approval.scenarioApproved)throw Error('Manual WhatsApp scenario approval required');
 if(payload.routing.kind!=='international')throw Error('Only the confirmed international recipient is available');
 const errors=validateLead({...EMPTY_DRAFT,...payload,phone:payload.phone,consent:payload.consent?.given===true,currentLevel:payload.ielts?.currentLevel??'',targetScore:payload.ielts?.targetScore??'',examDate:payload.ielts?.examDate??'',parentName:payload.travel?.parentName??'',childAge:payload.travel?String(payload.travel.childAge):'',travelProgram:payload.travel?.program??''},payload.context.type);
 const city=DEMO_CITIES.find(c=>c.id===payload.cityId);if(Object.keys(errors).length||!city)throw Error('Valid form and consent required');
 const fields=new Set(approval.personalFields??[]),lines=['GL Study',`Город: ${city.name}`,`Программа: ${payload.program??payload.travel?.program??payload.context.type}`];
 const values:Record<PersonalField,string>={name:payload.name.trim(),phone:normalizePhone(payload.phone),comment:payload.comment,parentName:payload.travel?.parentName??'',childAge:payload.travel?String(payload.travel.childAge):''};
 const labels:Record<PersonalField,string>={name:'Имя',phone:'Телефон',comment:'Комментарий',parentName:'Родитель',childAge:'Возраст ребёнка'};
 for(const field of fields){if(!Object.hasOwn(values,field))throw Error('Unapproved personal field');if(values[field])lines.push(labels[field]+': '+values[field])}
 const preview=lines.join('\n'),url=new URL(COMPANY.internationalWhatsApp);url.searchParams.set('text',preview);
 return {recipient:COMPANY.internationalPhone,preview,href:url.href,event:'whatsapp_open' as const,delivered:false as const};
}
