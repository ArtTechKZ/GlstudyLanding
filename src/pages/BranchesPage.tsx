import {Link} from '../i18n/Link';
import { useCopy } from '../i18n/copy';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { useCityContext } from '../hooks/useCityContext';
import { BranchRegistry } from '../components/ui/BranchDetails';
import ContactSection from '../components/sections/ContactSection';
import { SEO_METADATA } from '../data/seo';
import CompanyRequisites from '../components/ui/CompanyRequisites';
// Maps are hidden (see config/map.ts). Every entry of the branch table is listed once, grouped by status.
export default function BranchesPage() {
  const copy = useCopy();
  const { cities } = useCityContext();
  return <InnerPageLayout title={copy("ФИЛИАЛЫ GL STUDY")} subtitle={copy("Выберите город — менеджер поможет подобрать удобный филиал и группу.")} accentWord={copy("ФИЛИАЛЫ")} seo={SEO_METADATA.branches} breadcrumbs={[{ label: 'Филиалы' }]}>
    <div className="container">
      <nav className="full-links" aria-label={copy("Город")}>{cities.map(c=><Link key={c.id} to={"/branches/"+c.id}>{copy(c.name)}</Link>)}</nav>
      <BranchRegistry />
      <CompanyRequisites />
    </div><ContactSection />
  </InnerPageLayout>;
}
