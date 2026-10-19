import {parseLocalePath,localizedPath} from '../config/locale-routes.js';
import { useUi } from "../i18n/index";
import { startTransition, useEffect, useLayoutEffect, type ReactNode, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLeads } from './leads';
import StudyDialog from '../components/ui/StudyDialog';
import LeadFormSection from '../components/sections/LeadFormSection';
import { useCityContext } from '../hooks/useCityContext';
import { getEarlyRuntime, type EarlyLead } from './early-runtime';
import { leadIntent } from './lead-intent';
import { EMPTY_DRAFT, type LeadDraft } from './lead-model';
import { useRef } from 'react';
import { useClientReady } from '../context/clientReady';
export default function LeadActions({ children }: { children: ReactNode }) {
  const t = useUi();
  const { open, setOpen, begin, setDraft } = useLeads();
  const location = useLocation();
  const navigate = useNavigate();
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
    if (!location.hash || location.hash === '#lead-form') return;
    try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch { /* Malformed anchor. */ }
  }, [location.pathname, location.hash]);
  function capture(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (a?.hasAttribute('data-locale')) return;
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.origin !== window.location.origin) return;
    const base = import.meta.env.BASE_URL;
    if (!a.pathname.startsWith(base)) return;
    if (a.hash !== '#lead-form') {
      e.preventDefault(); navigate({ pathname: '/' + a.pathname.slice(base.length), search: a.search, hash: a.hash }); return;
    }
    e.preventDefault();
    if (a.dataset.city) selectCity(a.dataset.city);
    if (a.dataset.branch) selectBranch(a.dataset.branch);
    begin(leadIntent(a,location.pathname).request);
  }
  return <div onClickCapture={capture}>{children}{open && <StudyDialog title={t("LeadActions.demoforma.zayavki")} onClose={() => setOpen(false)}><LeadFormSection compact /></StudyDialog>}</div>;
}
