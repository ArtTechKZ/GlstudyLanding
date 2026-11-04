import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import WhatsAppLink from '../ui/WhatsAppLink';
import { CONTACTS, phoneHref } from '../../data/contacts';
import { COMPANY_REQUISITES } from '../../data/requisites';
import { useUi } from "../../i18n/index";
import { sitePath } from '../../utils/sitePath';

import { useCityContext } from '../../hooks/useCityContext';
import './Footer.scss';
import BranchPicker from '../ui/BranchPicker';
import { usePrivacy } from '../../features/privacy';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const copy = useCopy();
  const t = useUi();
  const { settings } = usePrivacy();
  const { selectedCity, activeBranch } = useCityContext();
  const year = CURRENT_YEAR;

  return (
    <footer className="footer" id="contacts" aria-label={t("Footer.kontakty.i.podval")}>
      {/* Main footer content */}
      <div className="footer__main">
        <div className="container footer__inner">
          {/* Logo + slogan */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label={t("Footer.gl.study.glavnaya")}>
              <img
                src={sitePath('/brand/logo-color.svg')}
                alt="GL Study"
                className="footer__logo-img"
                width="156"
                height="36"
                loading="lazy"
              />
            </Link>
            <p className="footer__slogan" lang="ru" data-official-slogan>{t("Footer.uchis.zdes.zhivi.vezde")}</p>
            <p className="footer__tagline">{t("Footer.shkola.angliyskogo.yazyka")}<br />{t("Footer.dlya.detey.podrostkov.i.vzroslykh")}</p>
          </div>

          {/* Navigation */}
          <nav className="footer__nav" aria-label={t("Footer.navigatsiya.podvala")}>
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">{t("Footer.obuchenie")}</h3>
              <ul role="list">
                <li><Link to="/online">{t("Footer.onlayn.obuchenie")}</Link></li>
                <li><Link to="/offline">{t("Footer.oflayn.obuchenie")}</Link></li>
                <li><Link to="/ielts">{t("Footer.podgotovka.k.ielts")}</Link></li>
                <li><Link to="/ielts-kostanay">{t("Footer.ielts.v.kostanae")}</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">{t("Footer.programmy")}</h3>
              <ul role="list">
                <li><Link to="/programs/english-children">{t("Footer.detyam.5.9.let")}</Link></li>
                <li><Link to="/programs/english-teens">{t("Footer.podrostkam.10.17.let")}</Link></li>
                <li><Link to="/programs/english-adults">{t("Footer.vzroslym.18")}</Link></li>
                <li><Link to="/travel/europe-winter-2027">{t("Footer.praga.2027")}</Link></li>
                <li><Link to="/travel/malaysia">{t("Footer.malayziya")}</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">{t("Footer.shkola")}</h3>
              <ul role="list">
                <li><Link to="/branches">{t("Footer.filialy")}</Link></li>
                <li><a href={sitePath('/#reviews')}>{t("Footer.otzyvy")}</a></li>
                <li><a href={sitePath('/#packages')}>{copy("Пакеты поступления")}</a></li>
                <li><a href={sitePath('/#services')}>{copy("Услуги")}</a></li>
                <li><a href={sitePath('/#faq')}>{t('Footer.faq')}</a></li>
                <li><Link to="/privacy-policy">{t("Footer.politika.konfidentsialnosti")}</Link></li>
                <li><Link to="/legal#offer">{copy("Публичная оферта")}</Link></li>
                <li><Link to="/personal-data-consent">{t("Footer.soglasie.na.obrabotku.pd")}</Link></li>
              </ul>
            </div>
          </nav>

          {/* Contacts — only real data */}
          <div className="footer__contacts">
            <p>{copy("Международный отдел: ")}<a className="study-phone-number" href={CONTACTS.internationalPhoneHref}>{copy(CONTACTS.internationalPhone)}</a></p>
            <p><WhatsAppLink kind="general" className="footer__whatsapp-link" cta="footer-whatsapp">{copy("WhatsApp: ")}<span className="study-phone-number">{copy(CONTACTS.whatsappDisplay)}</span></WhatsAppLink></p>
            <p><a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a></p>
            <p><a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram @{CONTACTS.instagramHandle}</a></p>
            <p>{copy(CONTACTS.receptionHours)}</p>
            <h3 className="footer__contacts-heading">{t("Footer.kontakty")}{copy(selectedCity.name)}
            </h3>
            {selectedCity.branches.length > 0 && <BranchPicker />}
            <p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p>
            <p>{copy("Расписание занятий подбирается индивидуально с менеджером.")}</p>

            {activeBranch?.phone && (
              <a href={phoneHref(activeBranch.phone)} className="footer__phone study-phone-number">
                {copy(activeBranch.phone)}
              </a>
            )}

            {activeBranch?.address && (
              <address className="footer__address">{copy(activeBranch.address)}</address>
            )}

            <WhatsAppLink kind="trial" className="btn btn-primary footer__cta" cta="footer-trial">{t("Footer.besplatnyy.urok")}</WhatsAppLink>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {copy(year)}{t("Footer.gl.study.vse.prava.zashchishcheny")}</p>
          <p className="footer__copy footer__requisites" data-footer-requisites><span lang="ru">{COMPANY_REQUISITES.shortName}</span> · {t("Footer.bin")} <span className="study-phone-number">{COMPANY_REQUISITES.bin}</span> · <Link to="/branches#requisites">{t("Footer.rekvizity")}</Link></p>
          <div className="footer__legal-links">
            <button type="button" data-consent-settings onClick={settings} style={{ color: 'var(--gl-black)', textDecoration: 'underline', minHeight: 44 }}>{t("Footer.nastroyki.cookie")}</button>
            <Link to="/privacy-policy">{t("Footer.politika.konfidentsialnosti")}</Link>
            <Link to="/personal-data-consent">{t("Footer.soglasie.na.obrabotku.pd")}</Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="footer__mobile-sticky" role="complementary" aria-label={t("Footer.bystrye.deystviya")}>
        <WhatsAppLink kind="trial" className="btn btn-primary footer__mobile-cta" cta="mobile-whatsapp" ariaLabel={t("Footer.napisat.v.whatsapp")}>WhatsApp</WhatsAppLink>
        <a href={CONTACTS.internationalPhoneHref} className="btn btn-outline-white footer__whatsapp" data-cta="mobile-call">{copy("Позвонить")}</a>
      </div>
    </footer>
  );
}

