import { useCopy } from '../../i18n/copy';
import { sitePath } from '../../utils/sitePath';
import './HeroSection.scss';

export default function HeroSection() {
  const copy = useCopy();
  return (
    <section className="hero" aria-label={copy("Главный экран")}>
      {/* Decorative violet backdrop stage with official brand grid */}
      <div className="hero__stage gl-bg-pattern-grid-white">
        <div className="container hero__inner">

          {/* Left content column */}
          <div className="hero__content">
            {/* Official Brand Slogan (PDF p. 7) */}
            <div className="hero__slogan-badge" lang="ru" data-official-slogan>
              <span className="hero__slogan-dot" aria-hidden="true" />
              {copy("«Учись здесь, Живи везде!»")}</div>

            {/* Main headline — WCAG-compliant white display type (Inter 800) */}
            <h1 className="hero__headline">
              <span className="hero__headline-line">{copy("Учи англий­ский")}</span>
              <span className="hero__headline-line">{copy("с удо­воль­ствием")}</span>
              <span className="hero__headline-line hero__headline-line--brand">{copy("в GL STUDY")}</span>
            </h1>

            {/* Sub-tagline */}
            <p className="hero__sub">
              {copy("Детям, подросткам и взрослым — онлайн и офлайн в Казахстане.")}<br />
              {copy("Подготовка к IELTS и международные программы. Начни с бесплатного урока.")}</p>

            {/* CTA row */}
            <div className="hero__ctas">
              <a href="#lead-form" className="btn btn-primary hero__cta-main">
                {copy("Бесплат­ный урок")}</a>
              <a href="#directions" className="btn btn-outline-white hero__cta-secondary">
                {copy("Выбрать программу")}</a>
            </div>

            {/* Key trust badges row */}
            <div className="hero__trust-row">
              <div className="hero__trust-item">
                <span className="hero__trust-pin" aria-hidden="true" />
                <span>{copy("General English с 6 лет")}</span>
              </div>
              <div className="hero__trust-item">
                <span className="hero__trust-pin" aria-hidden="true" />
                <span>{copy("Индивидуальный трек")}</span>
              </div>
            </div>
          </div>

          {/* Right side — Authentic brand photo composition from Brandbook p. 31 */}
          <div className="hero__visual" aria-label={copy("Иллюстрация GL Study")}>
            <div className="hero__visual-card gl-bg-pattern-gl-white">
              {/* High-res student cutout extracted from Brandbook GL STUDY.pdf p. 31 */}
              <img
                src={sitePath('/images/home/hero-student.webp')}
                srcSet={`${sitePath('/images/home/hero-student-400.webp')} 400w, ${sitePath('/images/home/hero-student-640.webp')} 640w, ${sitePath('/images/home/hero-student.webp')} 800w`}
                sizes="(max-width: 767px) 300px, (max-width: 1023px) 360px, 480px"
                alt={copy("Девушка с учебниками — иллюстрация из брендбука")}
                className="hero__student-img"
                width={800}
                height={1200}
                loading="eager"
                fetchPriority="auto"
              />

              {/* Floating brand badges with genuine design-system assets */}
              <div className="hero__float-badge hero__float-badge--top">
                <img
                  src={sitePath('/images/home/brand-pin.webp')}
                  alt=""
                  className="hero__float-pin-icon"
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
                <div className="hero__float-text">
                  <strong>IELTS</strong>
                  <small>{copy("Целевая подготовка")}</small>
                </div>
              </div>

              <div className="hero__float-badge hero__float-badge--bottom">
                <div className="hero__float-tag">GL STUDY 2026</div>
                <div className="hero__float-desc">
                  <strong>{copy("С 2000 года")}</strong>
                  <small>{copy("5 городов Казахстана")}</small>
                </div>
              </div>

              <div className="hero__float-badge hero__float-badge--pill">
                <span>{copy("100% живое общение")}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Clean brand ambient lights using approved gradient stops */}
        <div className="hero__ambient hero__ambient--1" aria-hidden="true" />
        <div className="hero__ambient hero__ambient--2" aria-hidden="true" />
      </div>
    </section>
  );
}
