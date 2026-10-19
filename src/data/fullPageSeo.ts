import {DEMO_CITIES} from './demo';
import {ru} from '../i18n/ru';
import type {SeoMeta} from '../types';
// createCopy resolves exact source strings through the same complete catalogs as UI.
export function fullPageSeo(key:string,copy:<T>(value:T)=>T,t:import('../i18n/core').Translator):SeoMeta|undefined{
 if(['online','offline','children','teens','adults'].includes(key)){
 const title=copy(ru[('Full.'+key) as keyof typeof ru]);return {title:t('Full.programSeo',{title}),description:copy(ru[('Full.'+key+'Desc') as keyof typeof ru])};}
 if(key==='ieltsKostanay')return {title:copy(ru['Full.exam'])+' | GL Study',description:copy(ru['Full.examDesc'])};
 if(key.startsWith('city_')){const city=copy(DEMO_CITIES.find(c=>c.id===key.slice(5))!.name);return {title:t('Full.citySeo',{city}),description:t('Full.cityDesc',{city})};}
 if(key==='privacyPolicy'||key==='personalDataConsent'){const title=copy(ru[key==='privacyPolicy'?'Full.privacy':'Full.consent']);return {title:t('Full.docSeo',{title}),description:title+'. '+copy(ru['Full.legalPending'])};}
}
