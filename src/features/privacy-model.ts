import {parseLocalePath} from '../config/locale-routes.js';
import type {ClientEvent} from './client-events';
import site from '../config/site.json';
import {ATTRIBUTION_KEY,type Choices} from './consent-model';
export { CONSENT_KEY, ATTRIBUTION_KEY, readChoices, type Choices } from './consent-model';
export type Attribution = { landing: string; referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string };
export interface OptionalAdapter { category: 'analytics' | 'advertising'; start: () => (() => void); page: (path: string) => void; event?: (event: ClientEvent) => void }
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
export const EMPTY_ADAPTERS: readonly OptionalAdapter[] = [];
export function safePath(path: string) {
  const normalized = /[?#]/.test(path)?'/404':parseLocalePath(path).semanticPath;
  return site.routes.some(r => r.path === normalized) ? normalized : '/404';
}
export function captureAttribution(search: string, pathname: string, referrer = ''): Attribution {
  const value: Attribution = { landing: safePath(pathname) };
  const params = new URLSearchParams(search);
  for (const k of KEYS) { const v = params.get(k); if (v?.trim() && v.length <= 120 && /^[\p{L}\p{N} _./:-]+$/u.test(v) && !/token|bearer/i.test(v) && v.replace(/\D/g,'').length<10) value[k] = v.trim(); }
  try { const url = new URL(referrer); if (/^https?:$/.test(url.protocol) && url.origin !== window.location.origin) value.referrer = url.origin; } catch { /* No external source. */ }
  return value;
}
export function restoreAttribution(incoming:Attribution,choices:Choices|null,storage:Pick<Storage,'getItem'>):Attribution|undefined{
  if(choices?.advertising===false)return;
  if(choices?.advertising)try{
    const saved=JSON.parse(storage.getItem(ATTRIBUTION_KEY)??'null');
    if(saved&&typeof saved.landing==='string')return {...captureAttribution(new URLSearchParams(saved).toString(),saved.landing,saved.referrer),...Object.fromEntries(KEYS.filter(k=>incoming[k]).map(k=>[k,incoming[k]]))};
  }catch{/* Corrupt or unavailable storage never supplies permission. */}
  return incoming;
}
export function persistAttribution(attribution:Attribution|undefined,choices:Choices|null,storage:Pick<Storage,'setItem'|'removeItem'>){
  try{if(choices?.advertising&&attribution)storage.setItem(ATTRIBUTION_KEY,JSON.stringify(attribution));else storage.removeItem(ATTRIBUTION_KEY)}catch{/* In-memory fallback. */}
}
