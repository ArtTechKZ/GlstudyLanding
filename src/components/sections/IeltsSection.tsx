import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import Icon from '../ui/Icon';
import { sitePath } from '../../utils/sitePath';

import './IeltsSection.scss';

const IELTS_FEATURES = [
  { icon: 'book' as const, title: 'Reading', desc: 'Академические и научно-популярные тексты, стратегии быстрого сканирования и работы со словарём' },
  { icon: 'writing' as const, title: 'Writing', desc: 'Task 1 (графики, диаграммы) и Task 2 (эссе, аргументация). Проверенные шаблоны и детальный фидбек' },
  { icon: 'listening' as const, title: 'Listening', desc: 'Все 4 секции, разбор британского, австралийского и американского произношения, ловушки тестов' },
  { icon: 'speaking' as const, title: 'Speaking', desc: 'Симуляция реального интервью с экзаменатором, расширение идиоматики и преодоление языкового барьера' },
];

export default function IeltsSection() {
  const copy = useCopy();
  return (
    <section className="ielts section gl-bg-pattern-grid-white" id="ielts" aria-labelledby="ielts-heading">
      <div className="container">
        <div className="ielts__layout">
          {/* Left headline column */}
          <div className="ielts__headline-col">
            <div className="ielts__tag">
              <span className="ielts__tag-dot" aria-hidden="true" />
              {copy("Международный экзамен")}</div>

            <h2 className="ielts__heading" id="ielts-heading">
              {copy("ПОДГОТОВКА")}<br />
              <span className="ielts__heading-brand">{copy("К IELTS")}</span>
              <br />
              {copy("И СДАЧА")}</h2>

            <p className="ielts__sub">
              {copy("Онлайн и офлайн, индивидуально или мини-группа 2–6 человек. Курс — 3 месяца, 36 часов. Рекомендуемый уровень Intermediate+. Диагностика перед обучением и пробные экзамены по четырём разделам.")}</p>

            {/* Visual poster composite with 3D target and graduate cap from Brandbook p. 31 */}
            <div className="ielts__poster-badge" aria-label={copy("3D графика IELTS")}>
              <img
                src={sitePath('/images/home/ielts-target.webp')}
                alt={copy("Целевая подготовка к IELTS")}
                className="ielts__poster-img ielts__poster-img--target"
                width={180}
                height={180}
                loading="lazy"
              />
              <img
                src={sitePath('/images/home/graduate-cap.webp')}
                alt={copy("Академическая шапочка — иллюстрация из брендбука")}
                className="ielts__poster-img ielts__poster-img--cap"
                width={180}
                height={166}
                loading="lazy"
              />
              <div className="ielts__poster-text">
                <strong>{copy("3 месяца")}</strong>
                <span>{copy("36 часов подготовки")}</span>
              </div>
            </div>

            {/* IDP note — neutral status without unconfirmed claims */}
            <div className="ielts__idp-note" role="note">
              <Icon name="info" size={18} /> {copy(" Перед обучением проводится диагностика уровня")}</div>

            <div className="ielts__actions">
              <a href="#lead-form" className="btn btn-primary ielts__cta">
                {copy("Получить консультацию")}</a>
              <Link to="/ielts" className="btn btn-outline-white ielts__more">
                {copy("Подробнее о курсе →")}</Link>
            </div>
          </div>

          {/* Right features column */}
          <div className="ielts__features-col">
            <div className="ielts__features-grid">
              {IELTS_FEATURES.map(f => (
                <div key={f.title} className="ielts__feature-card">
                  <div className="ielts__feature-top">
                    <span className="ielts__feature-icon" aria-hidden="true"><Icon name={f.icon} size={24} /></span>
                    <h3 className="ielts__feature-title">{copy(f.title)}</h3>
                  </div>
                  <p className="ielts__feature-desc">{copy(f.desc)}</p>
                </div>
              ))}
            </div>

            {/* Kostanay exam center note */}
            <div className="ielts__kostanay">
              <div className="ielts__kostanay-icon" aria-hidden="true"><Icon name="location" size={18} /></div>
              <div className="ielts__kostanay-content">
                <strong>{copy("IELTS в Костанае")}</strong>
                <p>{copy("Academic и General Training на компьютере. Место сдачи: ул. Тәуелсіздік, 83, кабинет 305.")}</p>
                <p className="ielts__kostanay-dates">
                  {copy("Ближайшие экзаменационные сессии: ")}<em>{copy("даты уточняются у координатора")}</em>
                </p>
                <Link to="/ielts-kostanay" className="ielts__kostanay-link">
                  {copy("Подробнее о сдаче экзамена →")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
