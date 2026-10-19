import {Link} from '../i18n/Link';
import { useCopy } from '../i18n/copy';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { useCityContext } from '../hooks/useCityContext';
import BranchMap from '../components/ui/BranchMap';
import BranchPicker from '../components/ui/BranchPicker';
import { BranchList } from '../components/ui/BranchDetails';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';
export default function BranchesPage() {
  const copy = useCopy();
  const { cities, selectedCity, selectCity } = useCityContext();
  return <InnerPageLayout title={copy("ФИЛИАЛЫ GL STUDY")} subtitle={copy("Выберите город — менеджер поможет подобрать удобный филиал и группу.")} accentWord={copy("ФИЛИАЛЫ")} seo={SEO_METADATA.branches} breadcrumbs={[{ label: 'Филиалы' }]}>
    <div className="container"><div className="study-actions" aria-label={copy("Город")}>{cities.map(c => <button className="study-button" key={c.id} aria-pressed={c.id === selectedCity.id} onClick={() => selectCity(c.id)}>{copy(c.name)}</button>)}</div>
      <nav className="full-links">{cities.map(c=><Link key={c.id} to={"/branches/"+c.id}>{copy(c.name)}</Link>)}</nav>{selectedCity.branches.length > 0 && <BranchPicker />}<div className={selectedCity.branches.some(branch => branch.lat !== undefined && branch.lng !== undefined) ? "study-columns" : undefined}><BranchList /><BranchMap city={selectedCity} branches={selectedCity.branches} /></div>
    </div><LeadFormSection />
  </InnerPageLayout>;
}
