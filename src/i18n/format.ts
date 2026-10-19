import type {Translator} from './core';
import type {Locale,TravelProgram} from '../types';
export const formatNumber=(value:number,locale:Locale)=>new Intl.NumberFormat(locale).format(value);
export const formatList=(values:string[],locale:Locale)=>new Intl.ListFormat(locale,{style:'long',type:'conjunction'}).format(values);
export function formatTripDates(program:Pick<TravelProgram,'dateStart'|'dateEnd'|'dateLabel'>,locale:Locale){
 if(locale==='ru'||!program.dateStart||!program.dateEnd)return program.dateLabel??'';
 const formatter=new Intl.DateTimeFormat(locale==='en'?'en-GB':'kk-KZ',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 return formatter.formatRange(new Date(program.dateStart+'T00:00:00Z'),new Date(program.dateEnd+'T00:00:00Z'));
}

export function formatNightCount(value:number,t:Translator){
 const locale=t.locale??'ru',rule=new Intl.PluralRules(locale).select(value);
 const category=['one','few','many','other'].includes(rule)?rule:'other';
 return formatNumber(value,locale)+' '+t(('Time.night.'+category) as 'Time.night.one'|'Time.night.few'|'Time.night.many'|'Time.night.other');
}
export function formatTripDuration(program:Pick<TravelProgram,'id'|'duration'>,t:Translator){
 const locale=t.locale??'ru';if(locale==='ru')return program.duration??'';
 const counts=program.duration?.match(/\d+/g)?.map(Number)??[];
 const unit=(value:number,name:'day'|'week')=>new Intl.NumberFormat(locale,{style:'unit',unit:name,unitDisplay:'long'}).format(value);
 if(program.id==='prague-2027'&&counts.length===2)return unit(counts[0],'day')+' / '+formatNightCount(counts[1],t);
 if(program.id==='malaysia'&&counts.length===1)return unit(counts[0],'week');
 return program.duration??'';
}
