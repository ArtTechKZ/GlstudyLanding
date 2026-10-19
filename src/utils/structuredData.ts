import {parseLocalePath,resolvePage,pageHref} from '../config/locale-routes.js';
import {COMPANY} from '../data/company';
import site from '../config/site.json';
const text=(node:Element|null)=>node?.textContent?.replace(/\u00ad/g,'').replace(/\s+/g,' ').trim()??'';
const origin=new URL(site.base,site.origin).href;
const absolute=(href:string)=>{const url=new URL(href,site.origin);if(url.origin===site.origin&&!url.pathname.startsWith(site.base))url.pathname=site.base+url.pathname.replace(/^\//,'');return url.href};
const organization={'@type':'Organization','@id':origin+'#organization',name:'GL Study',url:origin,telephone:COMPANY.phone,sameAs:[COMPANY.instagram],logo:absolute(site.base+'brand/logo-color.svg')};
export function pageSchema(pathname:string,doc:Document):Record<string,unknown>|undefined{
 const {locale,semanticPath:path}=parseLocalePath(pathname);
 if(!resolvePage(pathname))return;
 const canonical=absolute(pageHref(path,locale));
 const graph:Record<string,unknown>[]=[organization];
 const crumbs=[...doc.querySelectorAll('.inner-page__breadcrumbs-list li')];
 if(crumbs.length)graph.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((item,index)=>{const label=item.querySelector('a,.inner-page__breadcrumb-current'),link=item.querySelector('a');return{'@type':'ListItem',position:index+1,name:text(label),item:link?absolute(link.getAttribute('href')!):canonical}})});
 function course(name:string,description:string,url:string,id:string){if(name&&description)graph.push({'@type':'Course','@id':canonical+'#course-'+id,name,description,url,inLanguage:locale,provider:{'@id':organization['@id']}})}
 if(path==='/')for(const card of doc.querySelectorAll<HTMLElement>('#directions article[data-program]')){
  if(card.dataset.program==='travel')continue;
  course(text(card.querySelector('h3')),text(card.querySelector('.directions__card-desc')),absolute(card.querySelector('a')!.getAttribute('href')!),card.dataset.program!);
 }
 if(path==='/learning')for(const id of ['children','teens','adults','online','offline']){const section=doc.getElementById(id);if(section)course(text(section.querySelector('h2')),text(section.querySelector(':scope > p')),canonical+'#'+id,id)}
 if(path==='/ielts'||path==='/online'||path==='/offline'||path.startsWith('/programs/'))course(text(doc.querySelector('h1')),text(doc.querySelector('.inner-page__subtitle')),canonical,'ielts');
 const questions=[...doc.querySelectorAll('.faq__item,[data-faq-item]')].map(item=>({name:text(item.querySelector('.faq__question,[data-faq-question]')),answer:text(item.querySelector('.faq__answer,[data-faq-answer]'))})).filter(item=>item.name&&item.answer);
 if(questions.length)graph.push({'@type':'FAQPage','@id':canonical+'#faq',mainEntity:questions.map(item=>({'@type':'Question',name:item.name,acceptedAnswer:{'@type':'Answer',text:item.answer}}))});
 // No LocalBusiness: confirmed addresses/phones are absent. No offers/ratings,
 // accreditation or invented legal identifiers are inferred from placeholder data.
 return {'@context':'https://schema.org','@graph':graph};
}
export function safeSchemaJson(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}
