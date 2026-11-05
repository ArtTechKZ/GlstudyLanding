import type {Translator} from './core';
import type {Locale,TravelProgram} from '../types';
export const formatNumber=(value:number,locale:Locale)=>new Intl.NumberFormat(locale).format(value);
export const formatList=(values:string[],locale:Locale)=>new Intl.ListFormat(locale,{style:'long',type:'conjunction'}).format(values);
// Browsers built without Kazakh ICU data (e.g. the SSG Chromium) render kk dates as "M01"
// and kk units in English, so Kazakh is formatted here instead of through Intl.
const KK_MONTHS=['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
function formatKkRange(start:Date,end:Date){
 const [y1,m1,d1]=[start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate()],[y2,m2,d2]=[end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate()];
 if(y1!==y2)return `${y1} ж. ${d1} ${KK_MONTHS[m1]} – ${y2} ж. ${d2} ${KK_MONTHS[m2]}`;
 return m1===m2?`${y1} ж. ${d1}–${d2} ${KK_MONTHS[m1]}`:`${y1} ж. ${d1} ${KK_MONTHS[m1]} – ${d2} ${KK_MONTHS[m2]}`;
}
export function formatTripDates(program:Pick<TravelProgram,'dateStart'|'dateEnd'|'dateLabel'>,locale:Locale){
 if(locale==='ru'||!program.dateStart||!program.dateEnd)return program.dateLabel??'';
 const start=new Date(program.dateStart+'T00:00:00Z'),end=new Date(program.dateEnd+'T00:00:00Z');
 if(locale==='kk')return formatKkRange(start,end);
 return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).formatRange(start,end);
}

export function formatNightCount(value:number,t:Translator){
 const locale=t.locale??'ru',rule=new Intl.PluralRules(locale).select(value);
 const category=['one','few','many','other'].includes(rule)?rule:'other';
 return formatNumber(value,locale)+' '+t(('Time.night.'+category) as 'Time.night.one'|'Time.night.few'|'Time.night.many'|'Time.night.other');
}
export function formatTripDuration(program:Pick<TravelProgram,'id'|'duration'>,t:Translator){
 const locale=t.locale??'ru';if(locale==='ru')return program.duration??'';
 const counts=program.duration?.match(/\d+/g)?.map(Number)??[];
 const unit=(value:number,name:'day'|'week')=>locale==='kk'?`${value} ${name==='day'?'күн':'апта'}`:new Intl.NumberFormat(locale,{style:'unit',unit:name,unitDisplay:'long'}).format(value);
 if(program.id==='prague-2027'&&counts.length===2)return unit(counts[0],'day')+' / '+formatNightCount(counts[1],t);
 if(program.id==='malaysia'&&counts.length===1)return unit(counts[0],'week');
 return program.duration??'';
}
