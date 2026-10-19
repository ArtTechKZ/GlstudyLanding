import type {Locale} from '../types';
import { createConsentStore } from './consent-model';
import { leadIntent } from './lead-intent';
import {safePath} from './privacy-model';
import type { RequestContext } from './lead-model';
import type { PrivacyLabels } from './privacy-labels';
export type EarlyLead = { request?: RequestContext; city?: string; branch?: string; draft: Record<string,string|boolean>; submit?: boolean };
type LeadReceiver = (lead: EarlyLead) => void;
// Both the inline entry and React share this single instance and consent model.
export function getEarlyRuntime(labels?: PrivacyLabels): EarlyRuntime {
  if (window.__GL_EARLY__) { if (labels) window.__GL_EARLY__.setLabels(labels); return window.__GL_EARLY__; }
  const consent = createConsentStore(Boolean(window.__GL_SSG__));
  let receiver: LeadReceiver | undefined, menuReceiver: (() => void) | undefined, localeReceiver: ((locale:Locale)=>unknown)|undefined, localePending:Locale|undefined;
  const readyForms=new WeakSet<HTMLFormElement>();
  let queued: EarlyLead = {draft:{}}, menuPending = false;
  const intentKey='gl_study_lead_intent_v1';
  if(!window.__GL_SSG__)try{
    const saved=JSON.parse(sessionStorage.getItem(intentKey)??'null');sessionStorage.removeItem(intentKey);
    const identifier=(value:unknown)=>typeof value==='string'&&/^[a-z0-9-]{1,100}$/i.test(value)?value:undefined;
    if(saved?.version===1&&Date.now()-saved.createdAt>=0&&Date.now()-saved.createdAt<300000&&['main','ielts','travel'].includes(saved.request?.type)&&typeof saved.request?.ctaId==='string'&&saved.request.ctaId.length<=100&&(saved.request.program===undefined||identifier(saved.request.program))&&typeof saved.request.page==='string'&&safePath(saved.request.page)===saved.request.page){queued={request:saved.request,city:identifier(saved.city),branch:identifier(saved.branch),draft:{}}}
  }catch{/* Storage denial leaves the canonical form link usable. */}
  let privacy: HTMLDialogElement | undefined, previous: HTMLElement | null = null, status: HTMLElement | undefined;
  const runtime: EarlyRuntime = {
    consent, labels,
    setLabels: copy=>{runtime.labels=copy;if(privacy?.open){privacy.setAttribute('aria-label',copy.title);for(const el of privacy.querySelectorAll<HTMLElement>('[data-privacy-copy]'))el.textContent=copy[el.dataset.privacyCopy as keyof PrivacyLabels]}if(status)status.textContent=copy.loading;},
    connectLocale:listener=>{localeReceiver=listener;if(localePending){const next=localePending;localePending=undefined;listener(next);status?.remove();status=undefined}return()=>{if(localeReceiver===listener)localeReceiver=undefined}},
    registerForm:form=>{
      readyForms.add(form);status?.remove();status=undefined;
      if(receiver&&Object.keys(queued.draft).length){const next=queued;queued={draft:{}};receiver(next)}
      return()=>{readyForms.delete(form)};
    },
    settings: nextLabels => {
      if (nextLabels) runtime.labels = nextLabels;
      const copy = runtime.labels; if (!copy || privacy?.open) return;
      previous = document.activeElement as HTMLElement;
      privacy = document.createElement('dialog'); privacy.className = 'study-dialog'; privacy.setAttribute('aria-label',copy.title);
      const header = document.createElement('div'); header.className='study-dialog__header';
      const title=document.createElement('h2');title.textContent=copy.title;title.dataset.privacyCopy="title";
      const close=document.createElement('button');close.type='button';close.className='study-button';close.textContent=copy.close;close.dataset.privacyCopy="close";
      const dismiss=()=>{privacy?.close();privacy?.remove();privacy=undefined;if(previous?.isConnected&&previous.checkVisibility())previous.focus();else document.querySelector<HTMLElement>('.gl-header__logo')?.focus()};
      close.onclick=dismiss;header.append(title,close);privacy.append(header);
      const paragraph=(key:keyof PrivacyLabels)=>{const p=document.createElement('p');p.dataset.privacyCopy=key;p.textContent=copy[key];privacy!.append(p)};
      paragraph('intro');
      const check=(name:string,key:keyof PrivacyLabels,checked:boolean,disabled=false)=>{const label=document.createElement('label');label.className='study-check';const input=document.createElement('input');input.type='checkbox';input.name=name;input.checked=checked;input.disabled=disabled;const span=document.createElement('span');span.dataset.privacyCopy=key;span.textContent=copy[key];label.append(input,span);privacy!.append(label);return input};
      const choice=consent.getSnapshot();check('necessary','necessary',true,true);const analytics=check('analytics','analytics',choice?.analytics??false),advertising=check('advertising','advertising',choice?.advertising??false);
      const save=document.createElement('button');save.type='button';save.className='study-button';save.textContent=copy.save;save.dataset.privacyCopy="save";
      save.onclick=()=>{if(!privacy?.open)return;consent.save(analytics.checked,advertising.checked);dismiss()};privacy.append(save);paragraph('revoke');
      privacy.oncancel=e=>{e.preventDefault();dismiss()};
      privacy.onkeydown=e=>{if(e.key!=='Tab')return;const items=[...privacy!.querySelectorAll<HTMLElement>('button,input:not(:disabled)')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus()}};
      document.body.append(privacy);privacy.showModal();close.focus();
    },
    connectLeads: listener => {
      receiver=listener;const pending=queued;queued={draft:{}};status?.remove();status=undefined;
      if(pending.request||pending.city||pending.branch||Object.keys(pending.draft).length)listener(pending);
      performance.mark('gl:lead-ready');return ()=>{if(receiver===listener)receiver=undefined};
    },
    connectMenu: listener=>{menuReceiver=listener;if(menuPending){menuPending=false;listener();status?.remove();status=undefined}return()=>{if(menuReceiver===listener)menuReceiver=undefined}},
  };
  window.__GL_EARLY__=runtime;
  const reflect=()=>{if(consent.getSnapshot())document.documentElement.dataset.glConsent='chosen';else delete document.documentElement.dataset.glConsent};
  if(!window.__GL_SSG__){reflect();consent.subscribe(reflect)}
  const pending=()=>{if(!runtime.labels||status)return;status=document.createElement('p');status.className='study-early-status';status.setAttribute('role','status');status.textContent=runtime.labels.loading;document.body.append(status)};
  const draft=(form:HTMLFormElement,changed?:HTMLElement)=>{for(const input of form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[name]'))if(input.name){queued.draft[input.name]=input instanceof HTMLInputElement&&input.type==='checkbox'?input.checked:input.value;if(input.name==='city'&&changed?.getAttribute('name')==='city'){queued.city=input.value;queued.branch=undefined}if(input.name==='branch'&&changed?.getAttribute('name')==='branch')queued.branch=input.value}};
  document.addEventListener('input',event=>{const form=(event.target as HTMLElement).closest<HTMLFormElement>('form.lead-form__form');if(form&&!readyForms.has(form))draft(form,event.target as HTMLElement)},true);
  document.addEventListener('change',event=>{
    const el=event.target as HTMLElement,form=el.closest<HTMLFormElement>('form.lead-form__form');
    if(form&&!readyForms.has(form))draft(form,el);
    if(!menuReceiver&&el.matches('.gl-header__city-select')){
      queued.city=(el as HTMLSelectElement).value;queued.branch=undefined;
      // Change native control values, not server markup. The visible SSG form
      // must reflect a header choice even before React can resolve the city.
      for(const select of document.querySelectorAll<HTMLSelectElement>('.gl-header__city-select,form.lead-form__form [name=city]'))select.value=queued.city;
      for(const select of document.querySelectorAll<HTMLSelectElement>('form.lead-form__form [name=branch]'))select.value='';
    }
  },true);
  document.addEventListener('submit',event=>{
    const form=event.target as HTMLFormElement;if(readyForms.has(form)||!form.matches('.lead-form__form'))return;
    event.preventDefault();event.stopImmediatePropagation();draft(form);queued.submit=true;
    const base=document.querySelector<HTMLAnchorElement>('.gl-header__logo')?.pathname??'/';const pathname='/'+location.pathname.slice(base.length);
    queued.request??={type:pathname.startsWith('/travel/')?'travel':pathname.startsWith('/ielts')?'ielts':'main',page:pathname.replace(/\/$/,'')||'/',ctaId:'inline-form'};pending();
    if(receiver){const next=queued;queued={draft:{}};receiver(next)}
  },true);
  document.addEventListener('click',event=>{
    const target=event.target;if(!(target instanceof Element))return;
    if(target.closest('[data-consent-settings]')){event.preventDefault();event.stopImmediatePropagation();runtime.settings();return}
    const action=target.closest<HTMLButtonElement>('[data-consent-action]');
    if(action){event.preventDefault();event.stopImmediatePropagation();if(consent.getSnapshot())return;performance.mark('gl:consent-handle');if(action.dataset.consentAction==='settings')runtime.settings();else consent.save(action.dataset.consentAction==='all',action.dataset.consentAction==='all');return}
    if(!menuReceiver&&target.closest('.gl-header__burger')){event.preventDefault();event.stopImmediatePropagation();menuPending=true;pending();return}
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const a=target.closest<HTMLAnchorElement>('a[href]');
    if(a?.dataset.locale&&['ru','kk','en'].includes(a.dataset.locale)){event.preventDefault();event.stopPropagation();const next=a.dataset.locale as Locale;if(localeReceiver)localeReceiver(next);else{localePending=next;pending()}return}
    if(!a||a.hash!=='#lead-form'||a.target==='_blank'||a.origin!==location.origin)return;
    const base=document.querySelector<HTMLAnchorElement>('.gl-header__logo')?.pathname??'/';if(!a.pathname.startsWith(base))return;
    const intent=leadIntent(a,'/'+location.pathname.slice(base.length));
    event.preventDefault();event.stopPropagation();
    const next={...queued,...intent,city:intent.city??queued.city,branch:intent.branch??queued.branch};
    if(receiver){queued={draft:{}};receiver(next);return}
    queued=next;
    const form=document.querySelector<HTMLFormElement>('form.lead-form__form');
    if(!form){
      // Only non-personal request metadata crosses this necessary navigation.
      try{sessionStorage.setItem(intentKey,JSON.stringify({version:1,createdAt:Date.now(),request:queued.request,city:queued.city,branch:queued.branch}))}catch{/* The URL still retains city/branch. */}
      const query=new URLSearchParams();if(queued.city)query.set('city',queued.city);if(queued.branch)query.set('branch',queued.branch);
      location.assign(base+(query.size?'?'+query:'')+'#lead-form');return;
    }
    form.scrollIntoView({behavior:'instant',block:'center'});form.querySelector<HTMLElement>('input:not([type=checkbox])')?.focus();
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!receiver){queued.request=undefined;queued.submit=false;menuPending=false;status?.remove();status=undefined}},true);
  performance.mark('gl:critical-ready');return runtime;
}
export interface EarlyRuntime {
  consent: ReturnType<typeof createConsentStore>; labels?: PrivacyLabels;
  settings: (labels?: PrivacyLabels)=>void;
  setLabels: (labels: PrivacyLabels)=>void;
  connectLocale: (listener:(locale:Locale)=>unknown)=>(()=>void);
  connectLeads: (listener:LeadReceiver)=>(()=>void);
  connectMenu: (listener:()=>void)=>(()=>void);
  registerForm: (form:HTMLFormElement)=>(()=>void);
}
