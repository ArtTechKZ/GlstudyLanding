import {useUi} from '../i18n';
import {formatTripDates,formatTripDuration,formatNumber,formatList} from '../i18n/format';
import {Link} from '../i18n/Link';
import { useCopy } from '../i18n/copy';
import {useParams} from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import FaqAccordion from '../components/ui/FaqAccordion';
import TripItinerary from '../components/ui/TripItinerary';
import LeadFormSection from '../components/sections/LeadFormSection';
import {TRAVEL_PROGRAMS} from '../data/demo';
import {COMPANY} from '../data/company';
import {SEO_METADATA} from '../data/seo';
import {sitePath} from '../utils/sitePath';
export default function TravelPage({slug}:{slug?:string}={}) {
  const copy = useCopy(),t=useUi();
 const params=useParams<{slug:string}>(), program=TRAVEL_PROGRAMS.find(p=>p.slug===(slug??params.slug));
 if(!program)return <main id="main-content" className="container"><h1>{copy("Программа не найдена")}</h1><Link to="/#travel">{copy("Все зарубежные программы")}</Link></main>;
 const isPrague=program.id==='prague-2027';
 const dates=formatTripDates(program,t.locale??'ru'),age=formatNumber(program.ageMin??10,t.locale??'ru');
 const faq=[
 {id:'dates',question:'Когда проходит программа и для какого возраста?',answer:t('Travel.datesAnswer',{dates,duration:formatTripDuration(program,t),age})},
 {id:'included',question:'Что входит в программу?',answer:program.included?.map(item=>copy(item)).join('; ')??''},
 {id:'extras',question:'Что оплачивается отдельно?',answer:program.notIncluded?.map(item=>copy(item)).join('; ')??''},
 {id:'stay',question:'Как организованы проживание, питание и сопровождение?',answer:isPrague?'Проживание и питание включены. Сопровождение кураторов 24/7.':'Отель 4★, трёхразовое питание. Сопровождение групп-лидеров.'},
 ...(program.additionalOption?[{id:'tour',question:'Куда проходит дополнительный тур?',answer:formatList(program.additionalOption.includes.map(item=>copy(item)),t.locale??'ru')}]:[])
 ];
 return <InnerPageLayout title={copy(program.title).toLocaleUpperCase(t.locale)} subtitle={copy(program.destination)} accentWord={copy(isPrague?'ПРАГИ':'МАЛАЙЗИИ')} tag={copy("Зарубежные каникулы")} heroColor={isPrague?'violet':'orange'} seo={isPrague?SEO_METADATA.travelPrague:SEO_METADATA.travelMalaysia} breadcrumbs={[{label:'Зарубежные каникулы',href:'/#travel'},{label:program.title}]}>
 <div className="container" style={{display:'grid',gap:'var(--sp-6)',paddingBottom:'var(--sp-8)'}}>
 <img className="travel-page__cover" src={sitePath(isPrague?'/images/home/travel-prague.webp':'/images/home/travel-malaysia.webp')} alt={copy(program.destination)} width={800} height={635}/>
 <div className="study-actions"><a href="#lead-form" className="study-button" data-cta="travel-consultation">{copy("Обсудить поездку")}</a><a className="study-button" href={COMPANY.internationalWhatsApp} target="_blank" rel="noreferrer">{copy("WhatsApp зарубежных программ")}</a></div>
 <div className="brief-block__grid">
 <div className="study-panel surface-orange-light"><h2>{copy("Даты программы")}</h2><strong>{dates}</strong><p>{formatTripDuration(program,t)}</p></div>
 <div className="study-panel"><h2>{copy("Возраст участников")}</h2><strong>{t("Common.ageFrom",{age})}</strong></div>
 <div className="study-panel surface-violet-light"><h2>{copy("Проживание и питание")}</h2><p>{copy(program.accommodation)}</p><p>{copy(program.meals)}</p></div>
 </div>
 <section><h2 className="section-heading">{copy("В ПРОГРАММЕ")}</h2><ul style={{paddingLeft:'1.5rem',lineHeight:1.8}}>{program.included?.map(item=><li key={item}>{copy(item)}</li>)}</ul></section>
 <section className="study-panel"><h2>{copy("Оплачивается отдельно")}</h2><p>{formatList(program.notIncluded?.map(item=>copy(item))??[],t.locale??'ru')}</p></section>
 {program.additionalOption&&<section className="study-panel surface-orange-light"><h2>{copy("Дополнительный тур: ")}{copy(program.additionalOption.title)}</h2><p>{copy(formatList(program.additionalOption.includes.map(item=>copy(item)),t.locale??'ru'))}</p><p>{copy("Условия проведения дополнительного тура уточняются.")}</p></section>}
 {!!program.itinerary?.length && <TripItinerary program={program}/>}<section className="study-panel"><h2>{t("Full.safety")}</h2><p>{copy(isPrague?"Сопровождение кураторов 24/7":"Сопровождение групп-лидеров")}</p><p>{t("Full.safetyPending")}</p></section><section className="study-panel surface-violet-light"><h2>{copy("Подробности поездки")}</h2><p>{copy("Программа по дням, город вылета, сроки подачи заявки, наличие мест и дополнительные условия уточняются у менеджера.")}</p></section>
 <section aria-labelledby="travel-faq-heading"><h2 className="section-heading" id="travel-faq-heading">{copy("Вопросы о программе")}</h2><FaqAccordion items={faq}/></section>
 </div><LeadFormSection/>
 </InnerPageLayout>;
}
