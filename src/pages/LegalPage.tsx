import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useLocale,useHydratedUrlPart} from '../i18n/locale-context';
import {Link as RouterLink} from 'react-router-dom';
import { useCopy } from '../i18n/copy';
import Icon from '../components/ui/Icon';
import LegalDocumentView from '../components/ui/LegalDocumentView';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { SEO_METADATA } from '../data/seo';
import { PRIVACY_POLICY, PUBLIC_OFFER } from '../data/legal-documents';

export default function LegalPage() {
  const copy = useCopy(),t=useUi(),{locale}=useLocale();
  const { hash } = useLocation();
  const sourceHash=useHydratedUrlPart(hash);

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  if(locale!=='ru')return <InnerPageLayout title={t('Legal.localTitle')} subtitle={t('Legal.localNotice')} tag="GL Study" heroColor="violet" seo={SEO_METADATA.legal} breadcrumbs={[{label:t('Legal.localTitle')}]}><div className="container study-panel" id="privacy" data-legal-notice><p id="offer">{t('Legal.localNotice')}</p><RouterLink className="study-button" to={'/legal'+sourceHash} hrefLang="ru" data-legal-source>{t('Legal.russianSource')}</RouterLink></div></InnerPageLayout>;
  // GL-STUDY-30: the demo sample texts are replaced by the privacy policy and public offer supplied by the client.
  // No separate consent text was supplied, so only the status page /personal-data-consent remains for it.
  return (
    <InnerPageLayout
      title={copy("ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ")}
      subtitle={copy("Политика конфиденциальности и Публичная оферта")}
      accentWord={copy("ИНФОРМАЦИЯ")}
      tag={copy("Документы • GL Study")}
      heroColor="violet"
      seo={SEO_METADATA.legal}
      breadcrumbs={[
        { label: 'Юридические документы' }
      ]}
    >
      <div className="container full-page legal-documents" style={{ maxWidth: '900px', paddingBottom: 'var(--sp-8)' }}>
        <nav className="full-links" aria-label={copy("Разделы страницы:")}>
          <a href="#privacy"><Icon name="document" size={18} /> {copy("Политика конфиденциальности")}</a>
          <a href="#offer"><Icon name="writing" size={18} /> {copy("Публичная оферта")}</a>
          <Link to="/privacy-policy">{t("Full.privacy")}</Link>
          <Link to="/personal-data-consent">{t("Full.consent")}</Link>
        </nav>

        <section className="study-panel" data-legal-notice>
          <p><strong>{copy("Обратите внимание (Юридический статус редакции):")}</strong> {copy("Тексты документов предоставлены заказчиком и опубликованы без изменений. Юридическое согласование не подтверждено. Положения о ценах, платежах, формах заявок, аналитике и адресе сайта подлежат сверке с фактической реализацией сайта до публикации.")}</p>
        </section>

        <section id="privacy" className="study-panel"><LegalDocumentView document={PRIVACY_POLICY} headingId="privacy-title" /></section>
        <section id="offer" className="study-panel"><LegalDocumentView document={PUBLIC_OFFER} headingId="offer-title" /></section>
      </div>
    </InnerPageLayout>
  );
}
