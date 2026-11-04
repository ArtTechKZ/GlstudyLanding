import { useCopy } from '../../i18n/copy';
import { PLANNED_LANGUAGES, SUMMER_DESTINATIONS } from '../../data/company';
import { CONTACTS } from '../../data/contacts';
import { ADDITIONAL_SERVICES, ADMISSION_PACKAGES, kazakhBranches } from '../../data/demo';
import Icon from '../ui/Icon';
import WhatsAppLink from '../ui/WhatsAppLink';
import './BriefSections.scss';
export function AdditionalLanguages(){
  const copy = useCopy();const kazakh=kazakhBranches();
  // A language already taught in a branch is not "planned", even if a stale CMS export still lists it.
  const planned=PLANNED_LANGUAGES.filter(p=>!(p.id==='kazakh'&&kazakh.length));
  return <section className="brief-block" id="additional-languages" aria-labelledby="languages-heading">
 <h2 className="section-heading" id="languages-heading">{copy("ДОПОЛНИТЕЛЬНЫЕ ЯЗЫКИ")}</h2>
 {kazakh.length>0&&<article className="study-panel" data-program="language-kazakh" data-available="true"><h3>{copy("Казахский")}</h3><p>{copy("Курсы казахского языка проходят в филиалах: ")}{kazakh.map(b=>copy(b.name)).join(', ')}.</p><WhatsAppLink kind="program" title="Курсы казахского языка" cta="language-kazakh">{copy("Написать в WhatsApp")}</WhatsAppLink></article>}
 <p>{copy("Планируем запуск новых направлений, преимущественно онлайн. Открытие конкретных групп ещё не объявлено.")}</p>
 <div className="brief-block__grid">{planned.map(p=><article className="study-panel" key={p.id} data-program={`language-${p.id}`}><h3>{copy(p.title)}</h3><p>{copy("Планируемое направление")}</p><WhatsAppLink kind="program" title={p.title} cta={`language-${p.id}`}>{copy("Написать в WhatsApp")}</WhatsAppLink></article>)}</div></section>}
// Steps read as a numbered timeline; duration and Speaking Club sit in a side card next to the single CTA.
const TRIAL_STEPS=["Напишите нам в WhatsApp.","Менеджер свяжется с вами.","До урока пройдите диагностику уровня.","Вместе с менеджером подберите группу.","Познакомьтесь с преподавателем и учениками на бесплатном уроке в действующей группе."];
export function TrialProcess(){
  const copy = useCopy();return <section className="brief-block brief-trial" id="trial-process" aria-labelledby="trial-heading">
 <div className="brief-trial__main"><h2 className="section-heading" id="trial-heading">{copy("БЕСПЛАТНЫЙ ПРОБНЫЙ УРОК")}</h2>
 <ol className="brief-block__steps brief-trial__steps">{TRIAL_STEPS.map(step=><li key={step}>{copy(step)}</li>)}</ol></div>
 <aside className="brief-trial__side"><div className="brief-trial__fact"><Icon name="time" size={22}/><p>{copy('Групповой пробный урок длится 60 или 90 минут в зависимости от группы. Индивидуальный пробный урок проходит индивидуально; его продолжительность уточняется отдельно.')}</p></div>
 <div className="brief-trial__fact"><Icon name="speaking" size={22}/><p>{copy("Бесплатный Speaking Club доступен всем. Расписание уточняйте у менеджера.")}</p></div>
 <WhatsAppLink kind="trial" cta="trial-process">{copy("Написать в WhatsApp")}</WhatsAppLink></aside></section>}
export function SummerPrograms(){
  const copy = useCopy();return <section className="brief-block" id="summer-programs" aria-labelledby="summer-heading"><h2 className="section-heading" id="summer-heading">{copy("ЛЕТНИЕ ПРОГРАММЫ")}</h2><p>{copy("Выберите направление и узнайте подробнее о летней программе у менеджера зарубежных программ.")}</p><div className="brief-block__grid">{SUMMER_DESTINATIONS.map(p=><article className="study-panel" key={p.id} data-program={`summer-${p.id}`}><h3>{copy(p.title)}</h3><WhatsAppLink kind="program" title={p.title} cta={`summer-${p.id}`}>{copy("Написать в WhatsApp")}</WhatsAppLink></article>)}</div></section>}
export function AdmissionsSection(){
  const copy = useCopy();return <section className="brief-section section" id="admissions" aria-labelledby="admissions-heading"><div className="container"><div className="brief-block brief-block--admissions" data-program="admissions"><h2 className="section-heading" id="admissions-heading">{copy("ПОСТУПЛЕНИЕ ЗА РУБЕЖ")}</h2><p className="brief-block__lead">{copy("Более 25 стран · 1 800 университетов")}</p><p>{copy("Языковые программы, Foundation, бакалавриат и магистратура.")}</p><ul><li>{copy("Подбор страны, университета и программы")}</li><li>{copy("Помощь с документами")}</li><li>{copy("Визовые вопросы")}</li><li>{copy("Поиск проживания")}</li></ul><div className="study-actions"><WhatsAppLink kind="service" title="Поступление за рубеж" cta="admissions-consultation">{copy("Консультация в WhatsApp")}</WhatsAppLink><a className="study-button" href={CONTACTS.internationalPhoneHref}>{copy("Международный отдел: ")}<span className="study-phone-number">{copy(CONTACTS.internationalPhone)}</span></a></div></div></div></section>}
// Packages for admission abroad. Prices are intentionally not published (client rule); the three packages share one supplied composition.
export function AdmissionPackages(){
  const copy = useCopy();
  if(!ADMISSION_PACKAGES.length)return null; // Hidden until the snapshot carries confirmed packages.
  return <section className="brief-block" id="packages" aria-labelledby="packages-heading"><h2 className="section-heading" id="packages-heading">{copy("ПАКЕТЫ ПОСТУПЛЕНИЯ ЗА РУБЕЖ")}</h2><p>{copy("Три формата сопровождения. Подробности и подходящий вариант обсудите с менеджером.")}</p>
 <div className="brief-block__grid brief-block__grid--packages">{ADMISSION_PACKAGES.map(p=><article className="study-panel brief-package" key={p.id} data-program={`package-${p.id}`}><h3>{copy(p.title)}</h3><p>{copy(p.description)}</p><p className="brief-package__duration"><strong>{copy("Длительность: ")}{copy(p.duration)}</strong></p><ul className="brief-package__features">{p.features.map(f=><li key={f}>{copy(f)}</li>)}</ul><WhatsAppLink kind="program" title={p.title} cta={`package-${p.id}`}>{copy("Написать в WhatsApp")}</WhatsAppLink></article>)}</div></section>}
export function AdditionalServices(){
  const copy = useCopy();
  if(!ADDITIONAL_SERVICES.length)return null; // Hidden until the snapshot carries confirmed services.
  return <section className="brief-block" id="services" aria-labelledby="services-heading"><h2 className="section-heading" id="services-heading">{copy("ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ")}</h2>
 <div className="brief-block__grid">{ADDITIONAL_SERVICES.map(s=><article className="study-panel brief-service" key={s.id} data-service={s.id}><h3>{copy(s.title)}</h3><ul>{s.points.map(point=><li key={point}>{copy(point)}</li>)}</ul><WhatsAppLink kind="service" title={s.title} cta={`service-${s.id}`}>{copy("Консультация в WhatsApp")}</WhatsAppLink></article>)}</div></section>}
