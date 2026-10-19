import {Link} from '../../i18n/Link';
import {useUi} from '../../i18n';
export default function ProgrammeLinks(){const t=useUi();return <nav className="full-links" aria-label={t('Full.related')}>
{(['children','teens','adults'] as const).map(kind=><Link key={kind} data-program={'english-'+kind} to={'/programs/english-'+kind}>{t(('Full.'+kind) as 'Full.online')}</Link>)}
<Link to="/online" data-program="online">{t('Full.online')}</Link><Link to="/offline" data-program="offline">{t('Full.offline')}</Link><Link to="/ielts">{t('Full.preparation')}</Link></nav>}
