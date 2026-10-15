import { sitePath } from '../../utils/sitePath';
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCityContext } from '../../hooks/useCityContext';
import './Header.scss';

const NAV_LINKS = [
  { label: 'Обучение', href: '/learning' },
  { label: 'IELTS', href: '/ielts' },
  { label: 'Зарубежные каникулы', href: '/#travel' },
  { label: 'Филиалы', href: '/branches' },
  { label: 'Отзывы', href: '/#reviews' },
  { label: 'Контакты', href: '/#contacts' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cities, selectedCity, selectCity } = useCityContext();
  const location = useLocation();

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMenuOpen(false);
  }

  // Sticky shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(false);
  }, []);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header
      className={`gl-header${scrolled ? ' gl-header--scrolled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div className="demo-banner" role="alert">
        🔧 Демонстрационный режим — данные-заглушки, приём заявок не подключён
      </div>

      <div className="gl-header__bar">
        <div className="container gl-header__inner">
          {/* Logo with safe zone */}
          <Link to="/" className="gl-header__logo" aria-label="GL Study — на главную">
            <img
              src={sitePath('/brand/logo-color.svg')}
              alt="GL Study"
              className="gl-header__logo-img"
              width="148"
              height="34"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="gl-header__nav" aria-label="Основная навигация">
            <ul className="gl-header__nav-list" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a href={sitePath(link.href)} className="gl-header__nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side controls */}
          <div className="gl-header__controls">
            {/* City selector */}
            <div className="gl-header__city">
              <label htmlFor="city-select" className="sr-only">Выбрать город</label>
              <select
                id="city-select"
                value={selectedCity.id}
                onChange={e => selectCity(e.target.value)}
                className="gl-header__city-select"
                aria-label="Выбрать город"
              >
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* Language switcher */}
            <div className="gl-header__lang" aria-label="Язык">
              <button className="gl-header__lang-btn gl-header__lang-btn--active" aria-current="true">
                RU
              </button>
              <button
                className="gl-header__lang-btn"
                disabled
                title="Казахский язык — в разработке"
              >
                KK
              </button>
            </div>

            {/* Phone — only shown when real data available */}

            {/* CTA */}
            <a href={sitePath('/#lead-form')} className="btn btn-violet gl-header__cta">
              Бесплатный урок
            </a>

            {/* Mobile hamburger */}
            <button
              className={`gl-header__burger${menuOpen ? ' is-open' : ''}`}
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <span className="gl-header__burger-bar" aria-hidden="true" />
              <span className="gl-header__burger-bar" aria-hidden="true" />
              <span className="gl-header__burger-bar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        className={`gl-header__mobile${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
      >
        <div className="gl-header__mobile-inner">
          <div className="gl-header__mobile-top">
            <Link to="/" onClick={() => setMenuOpen(false)} aria-label="GL Study — главная">
              <img
                src={sitePath('/brand/logo-white.svg')}
                alt="GL Study"
                className="gl-header__mobile-logo"
                width="140"
                height="32"
              />
            </Link>
          </div>

          {/* City in mobile */}
          <div className="gl-header__mobile-city">
            <label htmlFor="city-select-mobile" className="gl-header__mobile-city-label">
              Город:
            </label>
            <select
              id="city-select-mobile"
              value={selectedCity.id}
              onChange={e => selectCity(e.target.value)}
              className="gl-header__city-select"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <nav aria-label="Мобильная навигация">
            <ul className="gl-header__mobile-list" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={sitePath(link.href)}
                    className="gl-header__mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={sitePath('/#lead-form')}
            className="btn btn-primary gl-header__mobile-cta"
            onClick={() => setMenuOpen(false)}
          >
            Получить бесплатный урок
          </a>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="gl-header__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
