import { Link } from 'react-router-dom';
import './IeltsSection.scss';

const IELTS_FEATURES = [
  { icon: '📖', title: 'Reading', desc: 'Академические и научно-популярные тексты, стратегии быстрого сканирования и работы со словарём' },
  { icon: '✍️', title: 'Writing', desc: 'Task 1 (графики, диаграммы) и Task 2 (эссе, аргументация). Проверенные шаблоны и детальный фидбек' },
  { icon: '🎧', title: 'Listening', desc: 'Все 4 секции, разбор британского, австралийского и американского произношения, ловушки тестов' },
  { icon: '🗣️', title: 'Speaking', desc: 'Симуляция реального интервью с экзаменатором, расширение идиоматики и преодоление языкового барьера' },
];

export default function IeltsSection() {
  return (
    <section className="ielts section gl-bg-pattern-grid-white" id="ielts" aria-labelledby="ielts-heading">
      <div className="container">
        <div className="ielts__layout">
          {/* Left headline column */}
          <div className="ielts__headline-col">
            <div className="ielts__tag">
              <span className="ielts__tag-dot" aria-hidden="true" />
              Международный экзамен
            </div>

            <h2 className="ielts__heading" id="ielts-heading">
              ПОДГОТОВКА
              <br />
              <span className="ielts__heading-brand">К IELTS</span>
              <br />
              И СДАЧА
            </h2>

            <p className="ielts__sub">
              Комплексный интенсив от базового уровня до целевого балла 7.0–8.5.
              Проверенные методики, пробные тесты и координация сдачи в Казахстане.
            </p>

            {/* Visual poster composite with 3D target and graduate cap from Brandbook p. 31 */}
            <div className="ielts__poster-badge" aria-label="3D графика IELTS">
              <img
                src="/images/home/ielts-target.webp"
                alt="Целевая подготовка к IELTS"
                className="ielts__poster-img ielts__poster-img--target"
                width={180}
                height={180}
                loading="lazy"
              />
              <img
                src="/images/home/graduate-cap.webp"
                alt="Выпускница GL 2026"
                className="ielts__poster-img ielts__poster-img--cap"
                width={180}
                height={166}
                loading="lazy"
              />
              <div className="ielts__poster-text">
                <strong>Цель 7.5+</strong>
                <span>Гарантированная система подготовки</span>
              </div>
            </div>

            {/* IDP note — neutral status without unconfirmed claims */}
            <div className="ielts__idp-note" role="note">
              ℹ️ Информация о партнёрстве с IDP носит нейтральный статус до подтверждения прав
            </div>

            <div className="ielts__actions">
              <a href="#lead-form" className="btn btn-primary ielts__cta">
                Получить консультацию
              </a>
              <Link to="/ielts" className="btn btn-outline-white ielts__more">
                Подробнее о курсе →
              </Link>
            </div>
          </div>

          {/* Right features column */}
          <div className="ielts__features-col">
            <div className="ielts__features-grid">
              {IELTS_FEATURES.map(f => (
                <div key={f.title} className="ielts__feature-card">
                  <div className="ielts__feature-top">
                    <span className="ielts__feature-icon" aria-hidden="true">{f.icon}</span>
                    <h3 className="ielts__feature-title">{f.title}</h3>
                  </div>
                  <p className="ielts__feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Kostanay exam center note */}
            <div className="ielts__kostanay">
              <div className="ielts__kostanay-icon" aria-hidden="true">📍</div>
              <div className="ielts__kostanay-content">
                <strong>IELTS в Костанае</strong>
                <p>Подготовка и организационная координация сдачи экзамена в костанайском филиале GL Study.</p>
                <p className="ielts__kostanay-dates">
                  Ближайшие экзаменационные сессии: <em>даты уточняются у координатора</em>
                </p>
                <Link to="/ielts#kostanay" className="ielts__kostanay-link">
                  Подробнее о сдаче экзамена →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
