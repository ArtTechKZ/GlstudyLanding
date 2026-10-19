import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import FaqAccordion from '../components/ui/FaqAccordion';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import './FullPages.scss';
export default function ExamPage(){const t=useUi();const title=t('Full.exam'),description=t('Full.examDesc');return <InnerPageLayout title={title} subtitle={description} seo={{title:title+' | GL Study',description}} breadcrumbs={[{label:t('Full.preparation'),href:'/ielts'},{label:title}]}>
 <div className="container full-page"><section className="study-panel"><h2>{t('Full.examVenue')}</h2><p>{description}</p><p>{t('Full.examSeparate')}</p><p>{t('Full.examPending')}</p><a href="#lead-form" className="btn btn-primary" data-program="ielts-prep" data-city="kostanay" data-cta="exam-consultation">{t('Full.consult')}</a></section>
 <section><h2>{t('Full.examParts')}</h2><div className="full-grid">{(['listen','read','write','speak'] as const).map(part=><p className="study-panel" key={part}>{t(('Full.'+part) as 'Full.online')}</p>)}</div></section>
 <section><h2>{t('Full.assessment')}</h2><p>{t('Full.prepA')}</p><Link to="/ielts">{t('Full.preparation')}</Link></section>
 <FaqAccordion items={[{id:'exam-dates',question:t('Full.examQ'),answer:t('Full.examPending')},{id:'exam-prep',question:t('Full.prepQ'),answer:t('Full.prepA')}]}/>
 </div><LeadFormSection/></InnerPageLayout>}
