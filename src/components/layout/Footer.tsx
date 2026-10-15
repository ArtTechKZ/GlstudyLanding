import { Link } from 'react-router-dom';
import { useCityContext } from '../../hooks/useCityContext';
import './Footer.scss';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { selectedCity, activeBranch } = useCityContext();
  const year = CURRENT_YEAR;

  return (
    <footer className="footer" id="contacts" aria-label="Контакты и подвал">
      {/* Main footer content */}
      <div className="footer__main">
        <div className="container footer__inner">
          {/* Logo + slogan */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="GL Study — главная">
              <img
                src="/brand/logo-white.svg"
                alt="GL Study"
                className="footer__logo-img"
                width="156"
                height="36"
                loading="lazy"
              />
            </Link>
            <p className="footer__slogan">
              «Учись здесь, Живи везде!»
            </p>
            <p className="footer__tagline">
              Школа английского языка<br />
              для детей, подростков и взрослых
            </p>
          </div>

          {/* Navigation */}
          <nav className="footer__nav" aria-label="Навигация подвала">
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">Обучение</h3>
              <ul role="list">
                <li><Link to="/learning#online">Онлайн-обучение</Link></li>
                <li><Link to="/learning#offline">Офлайн-обучение</Link></li>
                <li><Link to="/ielts">Подготовка к IELTS</Link></li>
                <li><Link to="/ielts#kostanay">IELTS в Костанае</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">Программы</h3>
              <ul role="list">
                <li><Link to="/learning#children">Детям (5–9 лет)</Link></li>
                <li><Link to="/learning#teens">Подросткам (10–17 лет)</Link></li>
                <li><Link to="/learning#adults">Взрослым (18+)</Link></li>
                <li><Link to="/travel/europe-winter-2027">Прага 2027</Link></li>
                <li><Link to="/travel/malaysia">Малайзия</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <h3 className="footer__nav-heading">Школа</h3>
              <ul role="list">
                <li><Link to="/branches">Филиалы</Link></li>
                <li><a href="/#reviews">Отзывы</a></li>
                <li><a href="/#faq">FAQ</a></li>
                <li><Link to="/legal#privacy">Политика конфиденциальности</Link></li>
                <li><Link to="/legal#consent">Согласие на обработку ПД</Link></li>
              </ul>
            </div>
          </nav>

          {/* Contacts — only real data */}
          <div className="footer__contacts">
            <h3 className="footer__contacts-heading">
              Контакты — {selectedCity.name}
            </h3>

            {activeBranch?.phone ? (
              <a href={`tel:${activeBranch.phone}`} className="footer__phone">
                {activeBranch.phone}
              </a>
            ) : (
              <p className="footer__contact-placeholder">
                Телефон: <em>ожидается от заказчика</em>
              </p>
            )}

            {activeBranch?.address ? (
              <address className="footer__address">{activeBranch.address}</address>
            ) : (
              <p className="footer__contact-placeholder">
                Адрес: <em>ожидается от заказчика</em>
              </p>
            )}

            <a href="/#lead-form" className="btn btn-primary footer__cta">
              Бесплатный урок
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {year} GL Study. Все права защищены.
          </p>
          <p className="footer__legal-note">
            Демонстрационный режим — сайт в разработке
          </p>
          <div className="footer__legal-links">
            <Link to="/legal#privacy">Политика конфиденциальности</Link>
            <Link to="/legal#consent">Согласие на обработку ПД</Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="footer__mobile-sticky" role="complementary" aria-label="Быстрые действия">
        <a href="/#lead-form" className="btn btn-primary footer__mobile-cta">
          Бесплатный урок
        </a>
        {activeBranch?.whatsapp ? (
          <a
            href={`https://wa.me/${activeBranch.whatsapp.replace(/\D/g, '')}`}
            className="btn btn-outline-white footer__whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в WhatsApp"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </footer>
  );
}
