import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import ProgrammeLinks from '../components/ui/ProgrammeLinks';
import {TrialProcess} from '../components/sections/BriefSections';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useCopy} from '../i18n/copy';
import {DEMO_CITIES,DEMO_PROGRAMS} from '../data/demo';
import {sitePath} from '../utils/sitePath';
import './FullPages.scss';
export default function ProgrammePage({kind}:{kind:'online'|'offline'|'children'|'teens'|'adults'}){
 const t=useUi(),copy=useCopy();const format=kind==='online'||kind==='offline';
 const program=DEMO_PROGRAMS.find(p=>p.id===(format?kind:'english-'+kind));
 const title=program?copy(program.title):t(('Full.'+kind) as 'Full.online'),description=program?copy(program.description):t(('Full.'+kind+'Desc') as 'Full.onlineDesc');
 const image=kind==='online'?'hero-student':kind==='offline'?'offline-class':'direction-'+(kind==='children'?'kids':kind);
 return <InnerPageLayout title={title} subtitle={description} tag="General English" seo={{title:t('Full.programSeo',{title}),description}} breadcrumbs={[{label:copy('Обучение'),href:'/learning'},{label:title}]}>
 <div className="container full-page" data-program={format?kind:'english-'+kind}>
 <section className="full-intro"><div><h2>{t('Full.benefits')}</h2><p>{t('Full.assessmentDesc')}</p><ul><li>{t('Full.level')}</li><li>{t('Full.club')}</li></ul>
 <a className="btn btn-primary" href="#lead-form" data-cta={'enrol-'+kind} data-format={format?kind:undefined}>{t('Full.signUp')}</a></div>
 <img src={sitePath('/images/home/'+image+'.webp')} srcSet={kind==='online'?`${sitePath('/images/home/hero-student-400.webp')} 400w, ${sitePath('/images/home/hero-student-640.webp')} 640w, ${sitePath('/images/home/hero-student.webp')} 800w`:`${sitePath('/images/home/'+image+'-240.webp')} 240w, ${sitePath('/images/home/'+image+'-480.webp')} 480w, ${sitePath('/images/home/'+image+'.webp')} ${kind==='offline'?800:kind==='adults'?594:599}w`} sizes="(max-width: 650px) 90vw, 560px" width={kind==='offline'||kind==='online'?800:kind==='adults'?594:599} height={kind==='offline'||kind==='online'?1200:900} alt={title} /></section>
 <section><h2>{format?t('Full.ages'):t('Full.formats')}</h2>{format?<ProgrammeLinks/>:<div className="full-grid"><article className="study-panel"><h3>{t('Full.online')}</h3><p>{t('Full.onlineDesc')}</p><Link to="/online">{t('Full.online')}</Link></article><article className="study-panel"><h3>{t('Full.offline')}</h3><p>{t('Full.offlineDesc')}</p><Link to="/offline">{t('Full.offline')}</Link></article></div>}{(kind==='teens'||kind==='adults')&&<p>{t('Full.agePending')}</p>}</section>
 <section className="study-panel"><h2>{t('Full.schedule')}</h2><p>{t('Full.schedulePending')}</p></section>
 <section><h2>{t('Full.availability')}</h2><p>{t('Full.availabilityPending')}</p><nav className="full-links" aria-label={t('Full.cities')}>{DEMO_CITIES.map(city=><Link to={'/branches/'+city.id} key={city.id}>{copy(city.name)}</Link>)}</nav><Link to="/branches">{t('Full.map')}</Link></section>
 <TrialProcess/>{!format&&<ProgrammeLinks/>}
 </div><LeadFormSection/>
 </InnerPageLayout>
}
