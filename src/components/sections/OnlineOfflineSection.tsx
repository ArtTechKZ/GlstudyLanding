import { Link } from 'react-router-dom';
import './OnlineOfflineSection.scss';

export default function OnlineOfflineSection() {
  return (
    <section className="oo-section section" id="formats" aria-labelledby="oo-heading">
      <div className="container">
        <header className="oo-header">
          <div className="oo-tag-badge">
            <span className="oo-tag-dot" aria-hidden="true" />
            Форматы обучения
          </div>
          <h2 className="oo-heading" id="oo-heading">
            ВЫБЕРИ СВОЙ
            <br />
            <span className="oo-heading-accent">ФОРМАТ ОБУЧЕНИЯ</span>
          </h2>
          <p className="oo-sub">
            Занимайтесь в современных оборудованных аудиториях в филиалах GL Study или подключайтесь онлайн из любой точки Казахстана и мира.
          </p>
        </header>

        <div className="oo-grid">
          {/* Offline poster panel — with genuine brandbook workshop photo */}
          <article className="oo-card oo-card--offline gl-bg-pattern-gl-white">
            <div className="oo-card__content">
              <div className="oo-card__tag">🏫 Офлайн в филиалах</div>
              <h3 className="oo-card__title">В уютном<br />классе рядом</h3>
              <ul className="oo-card__list" aria-label="Особенности офлайн-обучения">
                <li>
                  <strong>Филиалы в городах:</strong> Алматы, Астана, Костанай
                </li>
                <li>
                  <strong>Живой контакт:</strong> командные проекты, дебаты и разговорные игры
                </li>
                <li>
                  <strong>Оснащение:</strong> современные интерактивные аудитории
                </li>
                <li>
                  <strong>Атмосфера:</strong> клуб единомышленников и языковая среда
                </li>
              </ul>

              <div className="oo-card__actions">
                <Link to="/branches" className="btn btn-primary oo-card__btn">
                  Выбрать филиал
                </Link>
                <Link to="/learning#offline" className="oo-card__link">
                  Об офлайн-обучении →
                </Link>
              </div>
            </div>

            {/* Photo from Brandbook p. 23 */}
            <div className="oo-card__media">
              <img
                src="/images/home/offline-class.webp"
                alt="Занятия в офлайн-классе GL Study"
                className="oo-card__img"
                width={800}
                height={1200}
                loading="lazy"
              />
              <div className="oo-card__badge-float">
                <span>Интерактивные аудитории</span>
              </div>
            </div>
          </article>

          {/* Online poster panel — with high-tech grid, Zoom live badges */}
          <article className="oo-card oo-card--online gl-bg-pattern-grid-violet">
            <div className="oo-card__content">
              <div className="oo-card__tag">💻 Онлайн из дома</div>
              <h3 className="oo-card__title">Из любой<br />точки мира</h3>
              <ul className="oo-card__list" aria-label="Особенности онлайн-обучения">
                <li>
                  <strong>Платформа:</strong> живые интерактивные уроки с преподавателем в Zoom
                </li>
                <li>
                  <strong>Гибкость:</strong> удобное вечернее и дневное расписание
                </li>
                <li>
                  <strong>Цифровые материалы:</strong> доступ к материалам курса 24/7
                </li>
                <li>
                  <strong>Экономия времени:</strong> учитесь дома без поездок по городу
                </li>
              </ul>

              <div className="oo-card__actions">
                <a href="#lead-form" className="btn btn-primary oo-card__btn">
                  Попробовать онлайн
                </a>
                <Link to="/learning#online" className="oo-card__link">
                  Об онлайн-обучении →
                </Link>
              </div>
            </div>

            {/* Interactive tech preview card */}
            <div className="oo-card__media oo-card__media--online">
              <div className="oo-online-preview">
                <div className="oo-online-preview__header">
                  <span className="oo-online-preview__status-dot" aria-hidden="true" />
                  <span>Zoom Live Class</span>
                  <span className="oo-online-preview__pill">HD Video</span>
                </div>
                <div className="oo-online-preview__body">
                  <div className="oo-online-stat">
                    <strong>100%</strong>
                    <span>живая речь</span>
                  </div>
                  <div className="oo-online-stat">
                    <strong>1-на-1</strong>
                    <span>или мини-группы</span>
                  </div>
                </div>
                <div className="oo-online-preview__footer">
                  <span>Доступ из любого города Казахстана</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
