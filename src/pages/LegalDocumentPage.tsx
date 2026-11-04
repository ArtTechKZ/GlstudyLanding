import InnerPageLayout from '../components/layout/InnerPageLayout';
import LegalDocumentView from '../components/ui/LegalDocumentView';
import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useCopy} from '../i18n/copy';
import {PRIVACY_POLICY} from '../data/legal-documents';
import './FullPages.scss';
// Privacy policy: client-supplied text (GL-STUDY-30). Consent: no text has been supplied yet, so only the status notice remains.
export default function LegalDocumentPage({kind}:{kind:'privacy'|'consent'}){
 const t=useUi(),copy=useCopy(),title=t(('Full.'+kind) as 'Full.online');
 const supplied=kind==='privacy'&&t.locale==='ru';
 return <InnerPageLayout title={title} subtitle={supplied?copy('Текст предоставлен заказчиком, юридическое согласование не подтверждено.'):t('Full.pending')} seo={{title:t('Full.docSeo',{title}),description:title+'. '+(supplied?copy('Текст предоставлен заказчиком, юридическое согласование не подтверждено.'):t('Full.legalPending'))}} breadcrumbs={[{label:title}]}>
 <div className="container full-page" data-legal-notice>
 {supplied?<>
 <section className="study-panel"><p>{copy('Текст опубликован без изменений по материалам заказчика. Юридическое согласование не подтверждено. Положения о ценах, платежах, формах заявок, аналитике и адресе сайта подлежат сверке с фактической реализацией сайта до публикации.')}</p></section>
 <LegalDocumentView document={PRIVACY_POLICY} headingId="privacy-policy-title"/></>
 :<section className="study-panel"><h2>{t('Full.pending')}</h2><p>{t('Full.legalPending')}</p>{t.locale!=='ru'&&<p>{t('Full.legalLanguage')}</p>}</section>}
 <Link to={kind==='privacy'?'/personal-data-consent':'/privacy-policy'}>{t(kind==='privacy'?'Full.consent':'Full.privacy')}</Link></div>
 </InnerPageLayout>}
