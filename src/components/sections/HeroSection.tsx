import './HeroSection.scss';

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Главный экран">
      {/* Decorative violet backdrop stage with official brand grid */}
      <div className="hero__stage gl-bg-pattern-grid-white">
        <div className="container hero__inner">

          {/* Left content column */}
          <div className="hero__content">
            {/* Official Brand Slogan (PDF p. 7) */}
            <div className="hero__slogan-badge">
              <span className="hero__slogan-dot" aria-hidden="true" />
              «Учись здесь, Живи везде!»
            </div>

            {/* Main headline — WCAG-compliant white display type (Inter 800) */}
            <h1 className="hero__headline">
              <span className="hero__headline-line">Учи английский</span>
              <span className="hero__headline-line hero__headline-line--nowrap">с&nbsp;удовольствием</span>
              <span className="hero__headline-line hero__headline-line--brand">в&nbsp;GL&nbsp;STUDY</span>
            </h1>

            {/* Sub-tagline */}
            <p className="hero__sub">
              Детям, подросткам и взрослым — онлайн и офлайн в Казахстане.<br />
              Подготовка к IELTS и международные программы. Начни с бесплатного урока.
            </p>

            {/* CTA row */}
            <div className="hero__ctas">
              <a href="#lead-form" className="btn btn-primary hero__cta-main">
                Бесплатный урок
              </a>
              <a href="#directions" className="btn btn-outline-white hero__cta-secondary">
                Выбрать программу
              </a>
            </div>

            {/* Key trust badges row */}
            <div className="hero__trust-row">
              <div className="hero__trust-item">
                <span className="hero__trust-pin" aria-hidden="true" />
                <span>Все уровни от A1 до C1</span>
              </div>
              <div className="hero__trust-item">
                <span className="hero__trust-pin" aria-hidden="true" />
                <span>Индивидуальный трек</span>
              </div>
            </div>
          </div>

          {/* Right side — Authentic brand photo composition from Brandbook p. 31 */}
          <div className="hero__visual" aria-label="Студентка GL Study">
            <div className="hero__visual-card gl-bg-pattern-gl-white">
              {/* High-res student cutout extracted from Brandbook GL STUDY.pdf p. 31 */}
              <img
                src="/images/home/hero-student.webp"
                alt="Студентка языковой школы GL Study с учебниками"
                className="hero__student-img"
                width={800}
                height={1200}
                loading="eager"
                fetchPriority="high"
              />

              {/* Floating brand badges with genuine design-system assets */}
              <div className="hero__float-badge hero__float-badge--top">
                <img
                  src="/images/home/brand-pin.webp"
                  alt=""
                  className="hero__float-pin-icon"
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
                <div className="hero__float-text">
                  <strong>IELTS 7.5+</strong>
                  <small>Целевая подготовка</small>
                </div>
              </div>

              <div className="hero__float-badge hero__float-badge--bottom">
                <div className="hero__float-tag">GL STUDY 2026</div>
                <div className="hero__float-desc">
                  <strong>10+ лет опыта</strong>
                  <small>Алматы · Астана · Костанай</small>
                </div>
              </div>

              <div className="hero__float-badge hero__float-badge--pill">
                <span>100% живое общение</span>
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
