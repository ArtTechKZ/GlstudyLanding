import {parseLocalePath,localizedPath} from '../config/locale-routes.js';
import { startTransition, useEffect, useLayoutEffect, type ReactNode, type MouseEvent } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { useLeads } from './leads';
import { useCityContext } from '../hooks/useCityContext';
import { getEarlyRuntime, type EarlyLead } from './early-runtime';
import { leadIntent } from './lead-intent';
import { EMPTY_DRAFT, type LeadDraft } from './lead-model';
import { useRef } from 'react';
import { useClientReady } from '../context/clientReady';
const samePath = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
function scrollToHash(hash: string) {
  try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(); } catch { /* Malformed anchor. */ }
}
export default function LeadActions({ children }: { children: ReactNode }) {
  const { begin, setDraft } = useLeads();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const lastPath = useRef(location.pathname);
  const ready=useClientReady();
  const { cities,selectCity, selectBranch } = useCityContext();
  const actions=useRef({begin,setDraft,navigate,location,cities,ready});
  const pending=useRef<{lead:EarlyLead;search:string;path:string}|null>(null);
  useLayoutEffect(()=>{actions.current={begin,setDraft,navigate,location,cities,ready}});
  useEffect(()=>getEarlyRuntime().connectLeads(lead=>startTransition(()=>{
    pending.current=null;
    const draft=Object.fromEntries(Object.entries(lead.draft).filter(([key])=>key in EMPTY_DRAFT)) as Partial<LeadDraft>;
    if(Object.keys(draft).length)actions.current.setDraft(d=>({...d,...draft}));
    if(lead.city||lead.branch){
      const current=actions.current,query=new URLSearchParams(current.location.search);
      const city=current.cities.find(c=>c.id===lead.city);
      if(city){query.set('city',city.id);query.delete('branch')}
      // A pre-hydration city select cannot update its dependent branch select.
      // Never carry the old city's branch into the new canonical selection.
      if(lead.branch&&(!city||city.branches.some(b=>b.id===lead.branch)))query.set('branch',lead.branch);
      const search=query.toString(),parsed=parseLocalePath(current.location.pathname);
      const path=city&&parsed.semanticPath.startsWith('/branches/')?localizedPath('/branches/'+city.id,parsed.locale):current.location.pathname;
      const changed=path!==current.location.pathname||search!==new URLSearchParams(current.location.search).toString();
      if(changed||!current.ready){
        pending.current={lead,search,path};
        if(changed)current.navigate({pathname:path,search,hash:current.location.hash});return;
      }
    }
    if(lead.request&&!actions.current.ready){
      const current=actions.current;
      pending.current={lead,search:new URLSearchParams(current.location.search).toString(),path:current.location.pathname};return;
    }
    if(lead.request)actions.current.begin(lead.request,lead.submit);
  })),[]);
  useEffect(()=>{
    const next=pending.current;
    if(!ready||!next||next.path!==location.pathname||next.search!==new URLSearchParams(location.search).toString())return;
    pending.current=null;
    // The committed Router render already supplies the resolved CityProvider
    // selection. Only now open the dialog and replay a requested validation.
    if(next.lead.request)actions.current.begin(next.lead.request,next.lead.submit);
  },[ready,location.pathname,location.search]);
  useEffect(() => {
    const pathChanged = lastPath.current !== location.pathname;
    lastPath.current = location.pathname;
    if (!location.hash) {
      // A new page starts at the top; back/forward keeps the browser's own restoration.
      if (pathChanged && navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    if (location.hash === '#lead-form') return;
    scrollToHash(location.hash);
  }, [location.pathname, location.hash, navigationType]);
  function capture(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (a?.hasAttribute('data-locale')) return;
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.origin !== window.location.origin) return;
    const base = import.meta.env.BASE_URL;
    if (!a.pathname.startsWith(base)) return;
    if (a.hash !== '#lead-form') {
      e.preventDefault();
      const pathname = '/' + a.pathname.slice(base.length);
      // Navigating to the current URL does not re-run the scroll effect, so repeat the scroll here.
      const sameTarget = samePath(pathname, location.pathname) && a.hash === location.hash;
      if (!sameTarget || a.search !== location.search) navigate({ pathname, search: a.search, hash: a.hash });
      if (sameTarget) { if (a.hash) scrollToHash(a.hash); else window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }
      return;
    }
    e.preventDefault();
    if (a.dataset.city) selectCity(a.dataset.city);
    if (a.dataset.branch) selectBranch(a.dataset.branch);
    begin(leadIntent(a,location.pathname).request);
  }
  // GL-STUDY-30: the demo lead dialog is no longer rendered — no public link targets #lead-form any more.
  // Contact now goes through WhatsApp (src/features/whatsapp.ts). Restore the dialog only with an approved lead endpoint.
  return <div onClickCapture={capture}>{children}</div>;
}
