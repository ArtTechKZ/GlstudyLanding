import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import { useId } from 'react';
import { useCityContext } from '../../hooks/useCityContext';
export default function BranchPicker() {
  const copy = useCopy();
  const t = useUi();
  const { selectedCity, activeBranch, selectBranch } = useCityContext();
  const id = useId();
  const branches = selectedCity.branches.filter(b => b.status === 'active');
  if (!branches.length) return null;
  return <div className="study-field"><label htmlFor={id}>{t("BranchPicker.filial")}{copy(selectedCity.name)}</label>
    <select id={id} name="branch" value={activeBranch?.id ?? ''} onChange={e => selectBranch(e.target.value)}>
      <option value="">{copy(selectedCity.branches.length ? t("BranchPicker.vyberite.filial") : 'Филиал уточнит менеджер')}</option>
      {branches.map(b => <option key={b.id} value={b.id}>{copy(b.name)}</option>)}
    </select></div>;
}
