import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import type { Branch, City } from '../../types';
import { BRANCH_GROUPS, BRANCH_STATUS_LABELS, REGISTRY_CITY_ORDER } from '../../data/branch-status';
import { useCityContext } from '../../hooks/useCityContext';
import { COMPANY } from '../../data/company';
import { ALL_CITIES } from '../../data/demo';
import { CONTACTS, instagramUrl, phoneHref } from '../../data/contacts';
import WhatsAppLink from './WhatsAppLink';
import './BranchDetails.scss';


export function BranchDetails({ branch }: { branch?: Branch }) {
  const copy = useCopy();
  return <div className="study-branch-details">
    {branch?.status && <p className="branch-status" data-branch-status={branch.status}>{copy(BRANCH_STATUS_LABELS[branch.status])}</p>}
    {branch?.address && <p className="branch-address">{copy(branch.address)}</p>}
    <p>{branch?.phone ? <a className="study-phone-number" href={phoneHref(branch.phone)}>{copy(branch.phone)}</a> : <>{copy("Общий телефон для подбора филиала: ")}<a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></>}</p>
    {branch?.instagram && <p><a href={instagramUrl(branch.instagram)} target="_blank" rel="noopener noreferrer">Instagram @{branch.instagram}</a></p>}
    {branch?.offerings && branch.offerings.length > 0 && <ul className="branch-offerings" aria-label={copy("Направления филиала")}>{branch.offerings.map(item => <li key={item}>{copy(item)}</li>)}</ul>}
    {branch && branch.status !== 'repair' && <p className="branch-hours">{copy(CONTACTS.receptionHours)}</p>}
    {!branch && <p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p>}
  </div>;
}

export function BranchCard({ branch, cityName, selectable = true }: { branch: Branch; cityName?: string; selectable?: boolean }) {
  const copy = useCopy();
  const t = useUi();
  const { activeBranch, selectBranch } = useCityContext();
  return <article className="study-panel branch-card" key={branch.id} data-branch={branch.id} data-branch-status={branch.status} aria-label={copy(branch.name)}>
    {cityName && <p className="branch-card__city">{copy(cityName)}</p>}
    <h3>{copy(branch.name)}</h3><BranchDetails branch={branch} />
    {selectable && branch.status === 'active' && <button type="button" className="study-button" aria-pressed={activeBranch?.id === branch.id} onClick={() => selectBranch(branch.id)}>{t("BranchDetails.vybrat.filial")}</button>}
    {branch.status !== 'repair' && <WhatsAppLink kind="branch" title={branch.name} cta="branch-enquiry">{copy("Написать в WhatsApp")}</WhatsAppLink>}
    {branch.note && <p>{copy(branch.note)}</p>}
  </article>;
}

export function BranchList() {
  const copy = useCopy();
  const { selectedCity } = useCityContext();
  return <div className="study-branch-list">{selectedCity.branches.length===0 && <div className="study-panel"><h3>{copy(selectedCity.name)}</h3><p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p><p>{copy("Расписание занятий подбирается индивидуально с менеджером.")}</p><p>{copy("Общий телефон для подбора филиала: ")}<a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></p><WhatsAppLink kind="general" cta="city-enquiry">{copy("Написать в WhatsApp")}</WhatsAppLink></div>}{selectedCity.branches.map(b => <BranchCard key={b.id} branch={b} />)}</div>;
}

/** All locations of the branch table, grouped by status. Cities without their own page appear only here. */
export function BranchRegistry({ cities = ALL_CITIES }: { cities?: City[] }) {
  const copy = useCopy();
  const rank = (city: City) => { const at = REGISTRY_CITY_ORDER.indexOf(city.id); return at < 0 ? REGISTRY_CITY_ORDER.length : at; };
  const entries = [...cities].sort((a, b) => rank(a) - rank(b)).flatMap(city => city.branches.map(branch => ({ branch, city })));
  return <div className="branch-registry" data-branch-registry>{BRANCH_GROUPS.map(group => {
    const items = entries.filter(entry => entry.branch.status === group.status);
    if (!items.length) return null; // No empty group headings.
    return <section key={group.status} className="branch-registry__group" aria-labelledby={`branches-${group.status}`} data-branch-group={group.status}>
      <h2 id={`branches-${group.status}`}>{copy(group.heading)}</h2>
      <div className="study-branch-list branch-registry__list">{items.map(({ branch, city }) => <BranchCard key={branch.id} branch={branch} cityName={city.name} selectable={false} />)}</div>
    </section>;
  })}</div>;
}
