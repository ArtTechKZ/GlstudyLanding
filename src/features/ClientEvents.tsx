import {parseLocalePath} from '../config/locale-routes.js';
import {useEffect,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {useCityContext} from '../hooks/useCityContext';
import {useClientReady} from '../context/clientReady';
import {usePrivacy} from './privacy-context';
// Delegates existing actions only. No global network queue, PII, or replay buffer.
export default function ClientEvents(){
 const {emit,choices}=usePrivacy(),ready=useClientReady(),location=useLocation();
 const {selectedCity,activeBranch}=useCityContext();
 const previous=useRef<{city:string;branch?:string;live:boolean}>({city:selectedCity.id,branch:activeBranch?.id,live:false});
 const semanticPath=parseLocalePath(location.pathname).semanticPath;
 const page=useRef('');
 useEffect(()=>{
  const eligible=ready&&choices?.analytics;
  if(!eligible){page.current='';return}
  if(page.current!==semanticPath){page.current=semanticPath;emit('page_view',{})}
 },[ready,choices?.analytics,semanticPath,emit]);
 useEffect(()=>{
  const old=previous.current,next={city:selectedCity.id,branch:activeBranch?.id,live:ready};previous.current=next;
  if(!ready||!old.live)return;
  if(old.city!==next.city)emit('city_select',{});
  if(next.branch&&old.branch!==next.branch)emit('branch_select',{});
 },[ready,selectedCity.id,activeBranch?.id,emit]);
 useEffect(()=>{
  const context=(element:Element)=>({city:element.closest('[data-city]')?.getAttribute('data-city')??undefined,branch:element.closest('[data-branch]')?.getAttribute('data-branch')??undefined,program:element.closest('[data-program]')?.getAttribute('data-program')??undefined,cta:element.getAttribute('data-cta')||element.id||undefined,position:element.closest('section')?.id||(element.closest('.faq__item,[data-faq-item]')?'faq':element.closest('.hero')?'hero':element.closest('.study-dialog')?'modal':element.closest('header')?'header':element.closest('footer')?'footer':element.closest('main')?'page':'navigation')});
  const click=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
   const element=event.target instanceof Element?event.target:null;if(!element)return;
   const faq=element.closest('[data-faq-question]');if(faq&&faq.getAttribute('aria-expanded')!=='true')emit('faq_open',{...context(faq),cta:faq.id});
   const a=element.closest('a[href]') as HTMLAnchorElement|null;if(!a||a.dataset.locale)return;
   const ctx=context(a),url=new URL(a.href,locationSafeOrigin());
   if(a.protocol==='tel:'){emit('phone_click',{...ctx,cta:ctx.cta||'phone'});return}
   if(['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname)){emit('whatsapp_click',{...ctx,cta:ctx.cta||'whatsapp'});return}
   if(url.hostname==='www.openstreetmap.org'&&url.pathname==='/directions'){emit('route_click',{...ctx,cta:ctx.cta||'route'});return}
   const lead=url.hash==='#lead-form';
   if(lead)emit('cta_click',{...ctx,cta:ctx.cta||a.className.split(' ').filter(x=>x!=='btn').join('-').slice(0,100)});
   if(a.hasAttribute('download')&&ctx.program)emit('program_download',ctx);
   const semanticTarget=parseLocalePath(url.pathname).semanticPath;
   if(!lead&&semanticTarget.startsWith('/programs/'))emit('program_click',{...ctx,program:semanticTarget.split('/').at(-1)});
   if(!lead&&['/online','/offline'].includes(semanticTarget))emit('format_click',{...ctx,value:semanticTarget==='/online'?'online':'offline',program:semanticTarget.slice(1)});
   if(!lead&&['#online','#offline'].includes(url.hash))emit('format_click',{...ctx,value:url.hash==='#online'?'online':'offline',program:url.hash.slice(1)});
   if(url.pathname.endsWith('/ielts')||url.pathname.endsWith('/ielts/')||ctx.program==='ielts-prep'||(lead&&(semanticPath.startsWith('/ielts')||ctx.position==='ielts')))emit('ielts_action',{...ctx,program:'ielts-prep'});
   if(url.hash==='#travel'||url.pathname.includes('/travel/')||ctx.program==='travel'||(lead&&semanticPath.startsWith('/travel/')))emit('travel_action',{...ctx,program:ctx.program??(url.pathname.includes('/travel/')?url.pathname.split('/').filter(Boolean).at(-1):undefined)});
  };
  const toggle=(event:Event)=>{const target=event.target;if(target instanceof HTMLDetailsElement&&target.open&&target.classList.contains('faq__item'))emit('faq_open',{...context(target),cta:target.id||'faq'})};
  document.addEventListener('click',click,true);document.addEventListener('toggle',toggle,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('toggle',toggle,true)};
 },[emit,semanticPath]);
 const depthState=useRef<{path:string;eligible:boolean;seen:Set<number>}>({path:'',eligible:false,seen:new Set()});
 useEffect(()=>{
  const eligible=Boolean(ready&&choices?.analytics),state=depthState.current;
  const depth=()=>Math.min(100,100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));
  const thresholds=[25,50,75,90] as const;
  if(state.path!==semanticPath||state.eligible!==eligible){state.path=semanticPath;state.eligible=eligible;state.seen=new Set(thresholds.filter(t=>t<=depth()))}
  if(!eligible)return;
  let frame=0;
  const update=()=>{frame=0;const value=depth();for(const t of thresholds)if(value>=t&&!state.seen.has(t)){state.seen.add(t);emit('scroll_depth',{value:t})}};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',scroll,{passive:true});return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame)};
 },[ready,choices?.analytics,semanticPath,emit]);
 return null;
}
function locationSafeOrigin(){return window.location.origin}
