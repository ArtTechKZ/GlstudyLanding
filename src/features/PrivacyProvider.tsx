import { useUi } from "../i18n/index";
import { useCityContext } from '../hooks/useCityContext';
import { clientEvent, type EventName, type EventDetails } from './client-events';
import { useClientReady } from '../context/clientReady';
import { startTransition, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getEarlyRuntime } from './early-runtime';
import { privacyLabels } from './privacy-labels';
import { PrivacyContext } from './privacy-context';
import { EMPTY_ADAPTERS, captureAttribution, restoreAttribution, persistAttribution, safePath, type Choices, type Attribution, type OptionalAdapter } from './privacy-model';
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
export function PrivacyProvider({ children, adapters = EMPTY_ADAPTERS }: { children: ReactNode; adapters?: readonly OptionalAdapter[] }) {
  const t = useUi();
  const location = useLocation();
  const ready = useClientReady();
  const {cities, selectedCity, activeBranch} = useCityContext();
  const runtime = getEarlyRuntime(privacyLabels(t));
  // Consent is authoritative in the shared store. Its React view transitions
  // after hydration so a stored choice cannot abort a pending SSG route boundary.
  const [choices,setChoices] = useState<Choices|null>(()=>window.__GL_SSG__||document.getElementById('root')?.dataset.ssg?null:runtime.consent.getSnapshot());
  const adapterStops=useRef(new Map<OptionalAdapter,()=>void>());
  useEffect(()=>{
    const sync=()=>{const next=runtime.consent.getSnapshot();for(const [adapter,stop]of adapterStops.current)if(!next?.[adapter.category]){adapterStops.current.delete(adapter);sentPages.current.delete(adapter);try{stop()}catch{/* An optional adapter cannot block a consent change. */}}startTransition(()=>setChoices(next))};
    const unsubscribe=runtime.consent.subscribe(sync);sync();return unsubscribe;
  },[runtime]);
  const [restored, setRestored] = useState(ready);
  function initialAttribution(initialChoices: Choices | null): Attribution | undefined {
    initialChoices ??= runtime.consent.getSnapshot();
    if (!ready || initialChoices?.advertising === false) return;
    const incoming = captureAttribution(location.search, location.pathname, document.referrer);
    try{return restoreAttribution(incoming,initialChoices,sessionStorage)}catch{return incoming}
  }
  const [attribution, setAttribution] = useState<Attribution | undefined>(() => initialAttribution(choices));
  if (ready && !restored) { setRestored(true); setAttribution(initialAttribution(runtime.consent.getSnapshot())); }
  const [previousChoices, setPreviousChoices] = useState(choices);
  if (previousChoices !== choices) { setPreviousChoices(choices); setAttribution(ready ? initialAttribution(choices) : undefined); }
  const [previousSearch, setPreviousSearch] = useState(location.search);
  // Adjust cumulative attribution only when Router supplies a new query; never store the full URL.
  if (previousSearch !== location.search) {
    setPreviousSearch(location.search);
    if (ready && choices?.advertising !== false) {
      const incoming = captureAttribution(location.search, location.pathname, document.referrer);
      if (KEYS.some(k => incoming[k])) setAttribution(prev => ({ ...(prev ?? incoming), ...Object.fromEntries(KEYS.filter(k => incoming[k]).map(k => [k, incoming[k]])) }));
    }
  }
  useEffect(() => {
    if (!ready) return;
    try {persistAttribution(attribution,runtime.consent.getSnapshot(),sessionStorage)} catch { /* In-memory fallback. */ }
  }, [ready, choices, attribution,runtime]);
  useEffect(() => {
    const stops=adapterStops.current;
    const started=adapters.filter(a => ready && runtime.consent.getSnapshot()?.[a.category]);
    for(const adapter of started)stops.set(adapter,adapter.start());
    return () => {for(const adapter of started){const stop=stops.get(adapter);stops.delete(adapter);stop?.()}};
  }, [ready, choices, adapters,runtime]);
  const sentPages = useRef(new Map<OptionalAdapter,string>());
  useEffect(() => { adapters.forEach(a => { if (ready && runtime.consent.getSnapshot()?.[a.category]) { const path = safePath(location.pathname); if (sentPages.current.get(a) !== path) { sentPages.current.set(a,path); a.page(path); } } else sentPages.current.delete(a); }); }, [ready, location.pathname, choices, adapters,runtime]);
  const emit = useCallback((name: EventName, details: EventDetails) => {
    const permission=runtime.consent.getSnapshot();
    if (!ready || !permission?.analytics) return false;
    const city = cities.find(c => c.id === details.city) ?? selectedCity;
    const branch = city.branches.find(b => b.id === details.branch)?.id ?? (city.id === selectedCity.id ? activeBranch?.id : undefined);
    const event = clientEvent(name,details,{city:city.id,branch,path:location.pathname,language:t.locale??'ru',attribution:permission.advertising?attribution:undefined});
    if (!event) return false;
    for (const adapter of adapters) if (adapter.category === 'analytics' && adapter.event) try { adapter.event(event); } catch { /* Optional instrumentation never blocks normal site actions. */ }
    return true;
  },[ready,cities,selectedCity,activeBranch?.id,location.pathname,attribution,adapters,runtime,t.locale]);
  function settings() { runtime.settings(privacyLabels(t)); }
  return <PrivacyContext.Provider value={{ choices, attribution: choices?.advertising === false ? undefined : attribution, settings, emit }}>
    {!choices && <section className="study-cookie" aria-label={t("PrivacyProvider.vybor.cookie")}><div><h2>{t("PrivacyProvider.nastroyki.privatnosti")}</h2><p>{t("PrivacyProvider.neobkhodimye.funktsii.obespechivayut.vybor.goroda")}</p></div><div className="study-actions"><button className="study-button" data-consent-action="all">{t("PrivacyProvider.prinyat.vse")}</button><button className="study-button" data-consent-action="necessary">{t("PrivacyProvider.tolko.neobkhodimye")}</button><button className="study-button" data-consent-action="settings">{t("PrivacyProvider.nastroit")}</button></div></section>}
    {children}
  </PrivacyContext.Provider>;
}
