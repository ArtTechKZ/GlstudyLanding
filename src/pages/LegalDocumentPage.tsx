import InnerPageLayout from '../components/layout/InnerPageLayout';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import './FullPages.scss';
export default function LegalDocumentPage({kind}:{kind:'privacy'|'consent'}){const t=useUi(),title=t(('Full.'+kind) as 'Full.online');return <InnerPageLayout title={title} subtitle={t('Full.pending')} seo={{title:t('Full.docSeo',{title}),description:title+'. '+t('Full.legalPending')}} breadcrumbs={[{label:title}]}>
 <div className="container full-page" data-legal-notice><section className="study-panel"><h2>{t('Full.pending')}</h2><p>{t('Full.legalPending')}</p>{t.locale!=='ru'&&<p>{t('Full.legalLanguage')}</p>}</section><Link to={kind==='privacy'?'/personal-data-consent':'/privacy-policy'}>{t(kind==='privacy'?'Full.consent':'Full.privacy')}</Link></div>
 </InnerPageLayout>}
