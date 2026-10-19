import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import type { Branch } from '../../types';
import { useCityContext } from '../../hooks/useCityContext';
import { COMPANY } from '../../data/company';
export function BranchDetails({ branch }: { branch?: Branch }) {
  const copy = useCopy();
  return <div className="study-branch-details">
    {branch?.address && <p>{copy(branch.address)}</p>}
    <p>{branch?.phone ? <a className="study-phone-number" href={`tel:${branch.phone}`}>{copy(branch.phone)}</a> : <>{copy("Общий телефон для подбора филиала: ")}<a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></>}</p>
    {branch?.whatsapp && <p><a href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a></p>}
    {branch?.schedule && <p>{copy(branch.schedule)}</p>}
    {branch?.programs === undefined && <p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p>}
  </div>;
}
export function BranchList() {
  const copy = useCopy();
  const t = useUi();
  const { selectedCity, activeBranch, selectBranch } = useCityContext();
  return <div className="study-branch-list">{selectedCity.branches.length===0 && <div className="study-panel"><h3>{copy(selectedCity.name)}</h3><p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p><p>{copy("Расписание занятий подбирается индивидуально с менеджером.")}</p><p>{copy("Общий телефон для подбора филиала: ")}<a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></p><a href="#lead-form" className="study-button" data-city={selectedCity.id} data-cta="city-enquiry">{copy("Записаться на бесплатный урок")}</a></div>}{selectedCity.branches.map(b => <article className="study-panel" key={b.id} aria-label={copy(b.name)}>
    <h3>{copy(b.name)}</h3><BranchDetails branch={b} />
    <button type="button" className="study-button" aria-pressed={activeBranch?.id === b.id} onClick={() => selectBranch(b.id)}>{t("BranchDetails.vybrat.filial")}</button>
    <a className="study-button" href="#lead-form" data-city={selectedCity.id} data-branch={b.id} data-cta="branch-enquiry">{t("BranchDetails.zapisatsya.v.etot.filial")}</a>
    {b.note && <p>{copy(b.note)}</p>}
  </article>)}</div>;
}
