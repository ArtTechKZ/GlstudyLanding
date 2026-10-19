import {parseLocalePath} from '../config/locale-routes.js';
import {PLANNED_LANGUAGES,SUMMER_DESTINATIONS} from '../data/company';
import type {Locale} from '../types';
import site from '../config/site.json';
import {DEMO_PROGRAMS,TRAVEL_PROGRAMS} from '../data/demo';
import {captureAttribution,type Attribution} from './privacy-model';
export const EVENT_NAMES=['page_view','cta_click','form_start','submit_success','submit_error','phone_click','whatsapp_click','city_select','branch_select','route_click','format_click','ielts_action','travel_action','program_click','program_download','faq_open','scroll_depth'] as const;
export type EventName=typeof EVENT_NAMES[number];
export type EventDetails={city?:string;branch?:string;program?:string;cta?:string;position?:string;value?:'online'|'offline'|25|50|75|90};
export type ClientEvent={name:EventName;context:{city:string;branch?:string;program?:string;cta?:string;position?:string;language:Locale;path:string;attribution?:Attribution};value?:EventDetails['value']};
const ids=new Set([...DEMO_PROGRAMS,...TRAVEL_PROGRAMS].map(p=>p.id).concat(TRAVEL_PROGRAMS.map(p=>p.slug),PLANNED_LANGUAGES.map(p=>'language-'+p.id),SUMMER_DESTINATIONS.map(p=>'summer-'+p.id),['admissions']));
const identifier=(v:unknown)=>typeof v==='string'&&/^[a-z0-9_-]{1,100}$/i.test(v)?v:undefined;
export function clientEvent(name:EventName,details:EventDetails,context:{city:string;branch?:string;path:string;language:string;attribution?:Attribution}):ClientEvent|undefined{
 if(!EVENT_NAMES.includes(name))return;
 const path=/[?#]/.test(context.path)?'/404':parseLocalePath(context.path).semanticPath;
 const safe=site.routes.some(r=>r.path===path)?path:'/404';
 const inferred=path==='/ielts'?'ielts-prep':path.startsWith('/travel/')?path.split('/').at(-1):undefined;
 const program=details.program??inferred;
 const attribution=context.attribution?captureAttribution(new URLSearchParams(Object.fromEntries(Object.entries(context.attribution).filter(([key,value])=>key.startsWith('utm_')&&typeof value==='string'))).toString(),context.attribution.landing,context.attribution.referrer):undefined;
 return {name,context:{city:identifier(context.city)??'unknown',branch:identifier(context.branch),program:program&&ids.has(program)?program:undefined,cta:identifier(details.cta),position:identifier(details.position),language:['ru','kk','en'].includes(context.language)?context.language as Locale:'ru',path:safe,attribution},...(['online','offline',25,50,75,90].includes(details.value!)?{value:details.value}:{})};
}
