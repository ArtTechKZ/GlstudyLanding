import { useUi } from "../../i18n/index";
import { useEffect, useState, type ComponentProps } from 'react';
import type LiveBranchMap from './LiveBranchMap';
type Props = ComponentProps<typeof LiveBranchMap>;
export default function BranchMapLoader(props: Props) {
  const t = useUi();
  const [Component, setComponent] = useState<typeof LiveBranchMap>();
  const onState = props.onState;
  useEffect(() => {
    let cancelled = false;
    import('./LiveBranchMap').then(module => { if (!cancelled) setComponent(() => module.default); }).catch(() => { if (!cancelled) onState('error'); });
    return () => { cancelled = true; };
  }, [onState]);
  return Component ? <Component {...props} /> : <p role="status">{t("BranchMapLoader.zagruzka.komponenta.karty")}</p>;
}
