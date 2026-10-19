import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import type { Branch } from '../../types';
import { useCityContext } from '../../hooks/useCityContext';
export function BranchDetails({ branch }: { branch?: Branch }) {
  const copy = useCopy();
  const t = useUi();
  return <div className="study-branch-details">
    <p>{copy(branch?.address ?? t("BranchDetails.adres.utochnyaetsya"))}</p>
    <p>{branch?.phone ? <a className="study-phone-number" href={`tel:${branch.phone}`}>{copy(branch.phone)}</a> : t("BranchDetails.kontakty.utochnyayutsya")}</p>
    {branch?.whatsapp && <p><a href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a></p>}
    <p>{copy(branch?.schedule ?? t("BranchDetails.raspisanie.utochnyaetsya"))}</p>
    {branch?.programs === undefined && <p>{t("BranchDetails.programmy.etogo.filiala.utochnyayutsya.nizhe")}</p>}
  </div>;
}
export function BranchList() {
  const copy = useCopy();
  const t = useUi();
  const { selectedCity, activeBranch, selectBranch } = useCityContext();
  return <div className="study-branch-list">{selectedCity.branches.length===0 && <div className="study-panel"><h3>{copy(selectedCity.name)}</h3><p>{copy("Адреса, контакты и график филиалов уточняются. Менеджер поможет выбрать удобный район и центр.")}</p><a href="#lead-form" className="study-button" data-city={selectedCity.id} data-cta="city-enquiry">{copy("Записаться на бесплатный урок")}</a></div>}{selectedCity.branches.map(b => <article className="study-panel" key={b.id} aria-label={copy(b.name)}>
    <h3>{copy(b.name)}</h3><BranchDetails branch={b} />
    <button type="button" className="study-button" aria-pressed={activeBranch?.id === b.id} onClick={() => selectBranch(b.id)}>{t("BranchDetails.vybrat.filial")}</button>
    <a className="study-button" href="#lead-form" data-city={selectedCity.id} data-branch={b.id} data-cta="branch-enquiry">{t("BranchDetails.zapisatsya.v.etot.filial")}</a>
    {b.note && <p>{copy(b.note)}</p>}
  </article>)}</div>;
}
