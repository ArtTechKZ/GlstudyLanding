import InnerPageLayout from '../components/layout/InnerPageLayout';
import ContactSection from '../components/sections/ContactSection';
import {BranchList} from '../components/ui/BranchDetails';
import ProgrammeLinks from '../components/ui/ProgrammeLinks';
import WhatsAppLink from '../components/ui/WhatsAppLink';
import {DEMO_CITIES} from '../data/demo';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useCopy} from '../i18n/copy';
import './FullPages.scss';
// Maps are hidden (see config/map.ts); addresses are shown as text by BranchList.
export default function CityPage({cityId}:{cityId:string}){
 const t=useUi(),copy=useCopy(),city=DEMO_CITIES.find(c=>c.id===cityId)!;
 const name=copy(city.name),title=t('Full.branchesTitle',{city:name}),description=t('Full.cityDesc',{city:name});
 return <InnerPageLayout title={title} subtitle={description} seo={{title:t('Full.citySeo',{city:name}),description}} breadcrumbs={[{label:copy('Филиалы'),href:'/branches'},{label:name}]}>
 <div className="container full-page" data-city={city.id}>
 <nav className="full-links" aria-label={t('Full.cities')}>{DEMO_CITIES.map(c=><Link key={c.id} to={'/branches/'+c.id} aria-current={c.id===city.id?'page':undefined}>{copy(c.name)}</Link>)}</nav>
 <section><h2>{t('Full.cityContacts')}</h2><p>{t('Full.cityPending')}</p><BranchList/></section>
 <section><h2>{t('Full.schedule')}</h2><p>{t('Full.schedulePending')}</p></section>
 <section><h2>{t('Full.availability')}</h2><p>{t('Full.availabilityPending')}</p><ProgrammeLinks/></section>
 <WhatsAppLink kind="general" className="btn btn-primary" cta="city-consultation">{t('Full.consult')}</WhatsAppLink>
 </div><ContactSection/></InnerPageLayout>
}
