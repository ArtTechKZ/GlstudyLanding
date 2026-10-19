import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Branch, City } from '../../types';
import { useCityContext } from '../../hooks/useCityContext';
import StudyDialog from './StudyDialog';
import { BranchDetails } from './BranchDetails';
import BranchMapLoader from './BranchMapLoader';
export default function BranchMap({ city, branches }: { city: City; branches: Branch[] }) {
  const copy = useCopy();
  const t = useUi();
  const { activeBranch, selectBranch } = useCityContext();
  const [visible, setVisible] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window)), [expanded, setExpanded] = useState(false), [attempt, setAttempt] = useState(0), [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const ref = useRef<HTMLDivElement>(null);
  const points = useMemo(() => branches.filter(b => Number.isFinite(b.lat) && Number.isFinite(b.lng) && Math.abs(b.lat!) <= 90 && Math.abs(b.lng!) <= 180), [branches]);
  useEffect(() => { if (!('IntersectionObserver' in window)) return; const o = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); o.disconnect(); } }, { rootMargin: '150px' }); o.observe(ref.current!); return () => o.disconnect(); }, []);
  const content = <><p>{t("BranchMap.karta")}{copy(city.name)}</p>{points.length === 0 ? <p className="study-map-empty">{t("BranchMap.podtverzhdyonnye.koordinaty.filialov.poka.ne")}</p> : <>
    {state === 'loading' && <p role="status">{t("BranchMap.zagruzka.karty")}</p>}{state === 'error' && <div role="alert"><p>{t("BranchMap.ne.udalos.zagruzit.kartu.adresa")}</p><button className="study-button" onClick={() => { setState('loading'); setAttempt(v => v + 1); }}>{t("BranchMap.povtorit.zagruzku")}</button></div>}
    {visible && <BranchMapLoader key={`${city.id}-${attempt}-${expanded}`} branches={points} selected={activeBranch?.id} onSelect={selectBranch} onState={setState} />}
    {points.map(b => <button key={b.id} className="study-button" onClick={() => selectBranch(b.id)} aria-pressed={activeBranch?.id === b.id}>{t("BranchMap.otkryt")}{copy(b.name)}</button>)}
  </>}{activeBranch && <div className="study-map-details"><h3>{copy(activeBranch.name)}</h3><BranchDetails branch={activeBranch} />{points.some(b => b.id === activeBranch.id) && <a className="study-button" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?to=${activeBranch.lat},${activeBranch.lng}`}>{t("BranchMap.postroit.marshrut")}</a>}</div>}</>;
  return <div ref={ref} className="study-panel study-map" aria-label={t("BranchMap.karta.filialov.v0", {v0: copy(city.name)})}>
    <button className="study-button" onClick={() => { setVisible(true); setExpanded(true); }}>{t("BranchMap.otkryt.kartu.na.ves.ekran")}</button>
    {copy(!expanded && content)}{expanded && <StudyDialog title={t("BranchMap.karta.v0", {v0: copy(city.name)})} wide onClose={() => setExpanded(false)}>{copy(content)}</StudyDialog>}
  </div>;
}
