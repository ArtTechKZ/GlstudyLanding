import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import Icon from '../ui/Icon';
import { COMPANY } from '../../data/company';
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
                <li><a href={sitePath('/#faq')}>{t('Footer.faq')}</a></li>
                <li><Link to="/privacy-policy">{t("Footer.politika.konfidentsialnosti")}</Link></li>
                <li><Link to="/personal-data-consent">{t("Footer.soglasie.na.obrabotku.pd")}</Link></li>
              </ul>
            </div>
          </nav>

          {/* Contacts — only real data */}
          <div className="footer__contacts">
            <p>{copy("Общий телефон для подбора филиала: ")}<a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></p>
            <p><a href={COMPANY.internationalWhatsApp} target="_blank" rel="noreferrer">{copy("WhatsApp зарубежных программ: ")}<span className="study-phone-number">{copy(COMPANY.internationalPhone)}</span></a></p>
            <p><a href={COMPANY.instagram} target="_blank" rel="noreferrer">Instagram @glstudy.kz</a></p>
            {!__GL_PUBLIC_RU__ && <div className="study-connect-entry">
              <button type="button" className="study-button" data-connect-open><Icon name="speaking" />{copy('Чат недоступен')}</button>
              <p>{copy('Чат временно недоступен. Свяжитесь с нами по телефону или в WhatsApp зарубежных программ.')}</p>
            </div>}
            <h3 className="footer__contacts-heading">{t("Footer.kontakty")}{copy(selectedCity.name)}
            </h3>
            {selectedCity.branches.length > 0 && <BranchPicker />}
            {activeBranch?.schedule && <p>{copy(activeBranch.schedule)}</p>}
            <p>{copy("Менеджер поможет выбрать удобный район, филиал и подходящую группу.")}</p>
            <p>{copy("Расписание занятий подбирается индивидуально с менеджером.")}</p>

            {activeBranch?.phone && (
              <a href={`tel:${activeBranch.phone}`} className="footer__phone study-phone-number">
                {copy(activeBranch.phone)}
              </a>
            )}

            {activeBranch?.address && (
              <address className="footer__address">{copy(activeBranch.address)}</address>
            )}

            <a href={sitePath('/#lead-form')} className="btn btn-primary footer__cta">{t("Footer.besplatnyy.urok")}</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {copy(year)}{t("Footer.gl.study.vse.prava.zashchishcheny")}</p>
          <p className="footer__legal-note">{t("Footer.demonstratsionnyy.rezhim.sayt.v.razrabotke")}</p>
          <div className="footer__legal-links">
            <button type="button" data-consent-settings onClick={settings} style={{ color: 'var(--gl-black)', textDecoration: 'underline', minHeight: 44 }}>{t("Footer.nastroyki.cookie")}</button>
            <Link to="/privacy-policy">{t("Footer.politika.konfidentsialnosti")}</Link>
            <Link to="/personal-data-consent">{t("Footer.soglasie.na.obrabotku.pd")}</Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="footer__mobile-sticky" role="complementary" aria-label={t("Footer.bystrye.deystviya")}>
        <a href={sitePath('/#lead-form')} className="btn btn-primary footer__mobile-cta">{t("Footer.besplatnyy.urok")}</a>
        {activeBranch?.whatsapp ? (
          <a
            href={`https://wa.me/${activeBranch.whatsapp.replace(/\D/g, '')}`}
            className="btn btn-outline-white footer__whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Footer.napisat.v.whatsapp")}
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </footer>
  );
}

