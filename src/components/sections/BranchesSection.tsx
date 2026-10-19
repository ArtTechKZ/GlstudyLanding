import { useCopy } from '../../i18n/copy';
import {Link} from '../../i18n/Link';
import { useCityContext } from '../../hooks/useCityContext';
import BranchMap from '../ui/BranchMap';
import BranchPicker from '../ui/BranchPicker';
import { BranchList } from '../ui/BranchDetails';
import './BranchesSection.scss';
export default function BranchesSection() {
  const copy = useCopy();
  const { cities, selectedCity, selectCity } = useCityContext();
  return <section className="branches section" id="branches" aria-labelledby="branches-heading"><div className="container">
    <header className="branches__header"><div><h2 className="branches__heading" id="branches-heading">{copy("НАШИ ")}<span className="branches__heading-accent">{copy("ФИЛИ­АЛЫ")}</span></h2><p>{copy("Выберите город — менеджер поможет подобрать удобный филиал и группу.")}</p></div>
      <div className="study-actions" aria-label={copy("Город")}>{cities.map(c => <button className="study-button" key={c.id} aria-pressed={c.id === selectedCity.id} onClick={() => selectCity(c.id)}>{copy(c.name)}</button>)}</div></header>
    {selectedCity.branches.length > 0 && <BranchPicker />}<div className={selectedCity.branches.some(branch => branch.lat !== undefined && branch.lng !== undefined) ? "study-columns" : undefined}><BranchList /><BranchMap city={selectedCity} branches={selectedCity.branches} /></div>
    <Link className="study-button" to="/branches">{copy("Смотреть все филиалы →")}</Link>
  </div></section>;
}
