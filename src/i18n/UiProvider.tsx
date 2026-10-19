import {useMemo,useState,useLayoutEffect,useRef,type ReactNode} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {createTranslator,type UiMessages} from './core';
import {UiContext} from './context';
import {LocaleContext} from './locale-context';
import type {Locale} from '../types';
import {locales,parseLocalePath,localizedPath} from '../config/locale-routes.js';
import {getCatalog,loadCatalog} from './catalogs';
import {getEarlyRuntime} from '../features/early-runtime';
import {connectLabels} from '../features/connect-labels';
export function UiProvider({children,messages,draftCatalogs}:{children:ReactNode;messages?:UiMessages;draftCatalogs?:Partial<Record<Locale,UiMessages>>}){
 const location=useLocation(),navigate=useNavigate();
 const [fixtureLocale,setFixtureLocale]=useState<Locale>('ru');
 const locale=draftCatalogs?fixtureLocale:parseLocalePath(location.pathname).locale;
 const [loading,setLoading]=useState<Locale>(),[failed,setFailed]=useState(false),sequence=useRef(0),latest=useRef(location),previousLocale=useRef(locale);
 const available=useMemo(()=>draftCatalogs?locales.filter(l=>l==='ru'||!!draftCatalogs[l]):locales,[draftCatalogs]);
 const translate=useMemo(()=>createTranslator({...getCatalog(draftCatalogs?'ru':locale),...draftCatalogs?.[locale],...messages},locale),[draftCatalogs,locale,messages]);
 const selection=useMemo(()=>({locale,available,draft:locale!=='ru',loading,failed,selectLocale:(value:unknown)=>{
  if(!available.includes(value as Locale))return false;
  const next=value as Locale;if(next===locale){sequence.current++;setLoading(undefined);setFailed(false);return true;}
  if(draftCatalogs){setFixtureLocale(next);return true}
  const ticket=++sequence.current;setLoading(next);setFailed(false);
  void loadCatalog(next).then(()=>{if(ticket!==sequence.current)return;setLoading(undefined);try{localStorage.setItem('gl_study_locale',next)}catch{/* RAM remains usable. */}navigate({pathname:localizedPath(latest.current.pathname,next),search:latest.current.search,hash:latest.current.hash})}).catch(()=>{if(ticket===sequence.current){setLoading(undefined);setFailed(true)}});
  return true;
 }}),[locale,available,draftCatalogs,loading,failed,navigate]);
 useLayoutEffect(()=>{latest.current=location;if(previousLocale.current!==locale){previousLocale.current=locale;sequence.current++;setLoading(undefined)}},[location,locale]);
 useLayoutEffect(()=>getEarlyRuntime().connectLocale(selection.selectLocale),[selection]);
 useLayoutEffect(()=>{document.documentElement.lang=locale;window.__GL_CONNECT_LABELS__=connectLabels(translate);dispatchEvent(new Event('gl:language-labels'))},[locale,translate]);
 return <LocaleContext value={selection}><UiContext value={translate}>{children}</UiContext></LocaleContext>;
}
