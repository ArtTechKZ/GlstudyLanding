import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import {BranchList} from '../components/ui/BranchDetails';
import BranchMap from '../components/ui/BranchMap';
import ProgrammeLinks from '../components/ui/ProgrammeLinks';
import {DEMO_CITIES} from '../data/demo';
import {COMPANY} from '../data/company';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useCopy} from '../i18n/copy';
import './FullPages.scss';
export default function CityPage({cityId}:{cityId:string}){
 const t=useUi(),copy=useCopy(),city=DEMO_CITIES.find(c=>c.id===cityId)!;
 const name=copy(city.name),title=t('Full.branchesTitle',{city:name}),description=t('Full.cityDesc',{city:name});
 return <InnerPageLayout title={title} subtitle={description} seo={{title:t('Full.citySeo',{city:name}),description}} breadcrumbs={[{label:copy('Филиалы'),href:'/branches'},{label:name}]}>
 <div className="container full-page" data-city={city.id}>
 <nav className="full-links" aria-label={t('Full.cities')}>{DEMO_CITIES.map(c=><Link key={c.id} to={'/branches/'+c.id} aria-current={c.id===city.id?'page':undefined}>{copy(c.name)}</Link>)}</nav>
 <section><h2>{t('Full.cityContacts')}</h2><p>{t('Full.cityPending')}</p><p>{t('Full.mainPhone')}: <a href={COMPANY.phoneHref} className="study-phone-number">{COMPANY.phone}</a></p><BranchList/></section>
 <section><h2>{t('Full.schedule')}</h2><p>{t('Full.schedulePending')}</p></section>
 <section><h2>{t('Full.availability')}</h2><p>{t('Full.availabilityPending')}</p><ProgrammeLinks/></section>
 <section><h2>{t('Full.map')}</h2><BranchMap city={city} branches={city.branches}/></section>
 <a href="#lead-form" className="btn btn-primary" data-city={city.id} data-cta="city-consultation">{t('Full.consult')}</a>
 </div><LeadFormSection/></InnerPageLayout>
}
