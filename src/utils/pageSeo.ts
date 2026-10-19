import {CONTENT} from '../data/content';
import type {SeoMeta} from '../types';
import {SEO_METADATA} from '../data/seo';
import {fullPageSeo} from '../data/fullPageSeo';
import site from '../config/site.json';
import {resolvePage,parseLocalePath,pageHref,approvedLocales} from '../config/locale-routes.js';
import {createTranslator} from '../i18n/core';
import {getCatalog} from '../i18n/catalogs';
import {createCopy} from '../i18n/copy';
import {pageSchema,safeSchemaJson} from './structuredData';
export function applyPageSeo(pathname:string,meta:SeoMeta|undefined,doc:Document){
 const route=resolvePage(pathname),{locale}=parseLocalePath(pathname),t=createTranslator(getCatalog(locale),locale),copy=createCopy(t);
 let current=route?fullPageSeo(route.seo,copy,t)??SEO_METADATA[route.seo]??meta:SEO_METADATA.notFound;
 if(!current)return;
 const cmsSeo=CONTENT.seo as {path:string;locale:string;title:string;description:string;noindex?:boolean}[];
 const override=cmsSeo.find(s=>s.path===route?.semanticPath&&s.locale===locale);
 if(override)current=override;
 const canonical=new URL(route?pageHref(route.semanticPath,locale):site.base+(locale==='ru'?'':locale+'/')+'404.html',site.origin).href;
 doc.documentElement.lang=locale;doc.title=copy(current.title);
 function set(attribute:'name'|'property',key:string,value:string){let el=doc.head.querySelector(`meta[${attribute}="${key}"]`);if(!el){el=doc.createElement('meta');el.setAttribute(attribute,key);doc.head.append(el)}el.setAttribute('content',value)}
 set('name','description',copy(current.description));set('name','robots',route?.indexable&&!override?.noindex?'index,follow':'noindex,follow');
 set('property','og:title',copy(current.title));set('property','og:description',copy(current.description));set('property','og:url',canonical);set('property','og:type','website');
 set('property','og:locale',{ru:'ru_RU',kk:'kk_KZ',en:'en_GB'}[locale]);
 set('property','og:image',new URL(site.base+'images/home/hero-student.webp',site.origin).href);
 let canonicalLink=doc.head.querySelector('link[rel="canonical"]');if(!canonicalLink){canonicalLink=doc.createElement('link');canonicalLink.setAttribute('rel','canonical');doc.head.append(canonicalLink)}canonicalLink.setAttribute('href',canonical);
 for(const link of doc.head.querySelectorAll('link[rel="alternate"][hreflang]'))link.remove();
 if(route?.indexable&&!override?.noindex)for(const lang of [...approvedLocales,'x-default'] as const){const link=doc.createElement('link');link.rel='alternate';link.hreflang=lang;link.href=new URL(pageHref(route.semanticPath,lang==='x-default'?'ru':lang),site.origin).href;doc.head.append(link)}
 const id='gl-study-jsonld';doc.getElementById(id)?.remove();const data=pageSchema(pathname,doc);
 if(data){const script=doc.createElement('script');script.id=id;script.type='application/ld+json';script.textContent=safeSchemaJson(data);doc.head.append(script)}
 return()=>{doc.getElementById(id)?.remove()};
}
