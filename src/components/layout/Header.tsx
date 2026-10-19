import {parseLocalePath} from '../../config/locale-routes.js';
import {Link} from '../../i18n/Link';
import LanguagePicker from '../ui/LanguagePicker';
import { useCopy } from '../../i18n/copy';
import { useUi, type Translator } from "../../i18n/index";
import Icon from '../ui/Icon';
import { sitePath } from '../../utils/sitePath';
import { useState, useEffect, useCallback } from 'react';
import {useLocation} from 'react-router-dom';
import { useCityContext } from '../../hooks/useCityContext';
import './Header.scss';
import { COMPANY } from '../../data/company';
import { getEarlyRuntime } from '../../features/early-runtime';

const navLinks = (t: Translator) => [
  { label: t("Header.obuchenie"), href: '/learning' },
  { label: 'IELTS', href: '/ielts' },
  { label: t("Header.zarubezhnye.kanikuly"), href: '/#travel' },
  { label: t("Header.filialy"), href: '/branches' },
  { label: t("Header.otzyvy"), href: '/#reviews' },
  { label: t("Header.kontakty"), href: '/#contacts' },
];

export default function Header() {
  const copy = useCopy();
  const t = useUi();
  const NAV_LINKS = navLinks(t);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>getEarlyRuntime().connectMenu(()=>setMenuOpen(true)),[]);
  const [scrolled, setScrolled] = useState(false);
  const { cities, selectedCity, selectCity } = useCityContext();
  const location = useLocation();

  const [prevPath, setPrevPath] = useState(parseLocalePath(location.pathname).semanticPath);
  if (prevPath !== parseLocalePath(location.pathname).semanticPath) {
    setPrevPath(parseLocalePath(location.pathname).semanticPath);
    setMenuOpen(false);
  }

  // Sticky shadow on scroll
  useEffect(() => {
    const header = document.querySelector('.gl-header');
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--study-header-height', `${header!.getBoundingClientRect().height + 16}px`));
    if (header) observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Reuse the compact menu when enlarged text no longer fits the desktop row.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.gl-header')!, inner = header.querySelector<HTMLElement>('.gl-header__inner')!;
    const nav = header.querySelector<HTMLElement>('.gl-header__nav-list')!, controls = header.querySelector<HTMLElement>('.gl-header__controls')!, logo = header.querySelector<HTMLElement>('.gl-header__logo')!;
    let frame = 0;
    const fit = () => { frame = 0; header.dataset.compact = 'false'; const row = nav.getBoundingClientRect(), brand = logo.getBoundingClientRect(), actions = controls.getBoundingClientRect(); const overlaps = nav.offsetWidth > 0 && (row.left < brand.right - 1 || row.right > actions.left + 1); header.dataset.compact = String(innerWidth >= 768 && (actions.right > innerWidth - 12 || overlaps)); };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };
    const observer = new ResizeObserver(schedule); [inner,nav,controls].forEach(node => observer.observe(node));
    document.fonts.addEventListener('loadingdone',schedule); addEventListener('resize',schedule); schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.fonts.removeEventListener('loadingdone',schedule); removeEventListener('resize',schedule); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.querySelector<HTMLElement>('.gl-header__mobile-close')?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [menuOpen]);

  // Close menu on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(false);
    if (e.key === 'Tab' && menuOpen) {
      const targets = [...document.querySelectorAll<HTMLElement>('#mobile-menu a[href],#mobile-menu button,#mobile-menu select')].filter(node => node.getClientRects().length);
      const first = targets[0], last = targets.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }, [menuOpen, setMenuOpen]);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header
      className={`gl-header${scrolled ? ' gl-header--scrolled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div className="demo-banner" role="alert">
        <Icon name="tools" size={18} />{t("Header.demonstratsionnyy.rezhim.dannye.zaglushki.priyom")}</div>

      <div className="gl-header__bar">
        <div className="container gl-header__inner">
          {/* Logo with safe zone */}
          <Link to="/" className="gl-header__logo" aria-label={t("Header.gl.study.na.glavnuyu")}>
            <img
              src={sitePath('/brand/logo-color.svg')}
              alt="GL Study"
              className="gl-header__logo-img"
              width="148"
              height="34"
            />
          </Link>

          <a className="gl-header__phone" href={COMPANY.phoneHref}>{COMPANY.phone}</a>

          {/* Desktop nav */}
          <nav className="gl-header__nav" aria-label={t("Header.osnovnaya.navigatsiya")}>
            <ul className="gl-header__nav-list" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a href={sitePath(link.href)} className="gl-header__nav-link">
                    {copy(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side controls */}
          <div className="gl-header__controls">
            {/* City selector */}
            <div className="gl-header__city">
              <label htmlFor="city-select" className="sr-only">{t("Header.vybrat.gorod")}</label>
              <select
                id="city-select"
                value={selectedCity.id}
                onChange={e => selectCity(e.target.value)}
                className="gl-header__city-select"
                aria-label={t("Header.vybrat.gorod")}
              >
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{copy(city.name)}</option>
                ))}
              </select>
            </div>

            {/* Language switcher */}
            <LanguagePicker />

            {/* Phone — only shown when real data available */}

            {/* CTA */}
            <a href={sitePath('/#lead-form')} className="btn btn-violet gl-header__cta">{t("Header.besplatnyy.urok")}</a>

            {/* Mobile hamburger */}
            <button
              className={`gl-header__burger${menuOpen ? ' is-open' : ''}`}
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={copy(menuOpen ? t("Header.zakryt.menyu") : t("Header.otkryt.menyu"))}
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
        inert={!menuOpen}
        className={`gl-header__mobile${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t("Header.mobilnoe.menyu")}
      >
        <div className="gl-header__mobile-inner">
          <div className="gl-header__mobile-top">
            <Link to="/" onClick={() => setMenuOpen(false)} aria-label={t("Header.gl.study.glavnaya")}>
              <img
                src={sitePath('/brand/logo-color.svg')}
                alt="GL Study"
                className="gl-header__mobile-logo"
                width="140"
                height="32"
              />
            </Link>
            <button type="button" className="gl-header__mobile-close" aria-label={t("Header.zakryt.menyu")} onClick={() => setMenuOpen(false)}><Icon name="excluded" size={24}/></button>
          </div>

          <LanguagePicker />

          {/* City in mobile */}
          <div className="gl-header__mobile-city">
            <label htmlFor="city-select-mobile" className="gl-header__mobile-city-label">{t("Header.gorod")}</label>
            <select
              id="city-select-mobile"
              value={selectedCity.id}
              onChange={e => selectCity(e.target.value)}
              className="gl-header__city-select"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>{copy(city.name)}</option>
              ))}
            </select>
          </div>

          <p><a className="study-phone-number" href={COMPANY.phoneHref}>{copy(COMPANY.phone)}</a></p>
          <nav aria-label={t("Header.mobilnaya.navigatsiya")}>
            <ul className="gl-header__mobile-list" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={sitePath(link.href)}
                    className="gl-header__mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {copy(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={sitePath('/#lead-form')}
            className="btn btn-primary gl-header__mobile-cta"
            onClick={() => setMenuOpen(false)}
          >{t("Header.poluchit.besplatnyy.urok")}</a>
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

