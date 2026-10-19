import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import CityPicker from '../ui/CityPicker';
import Icon from '../ui/Icon';
import { sitePath } from '../../utils/sitePath';

import './OnlineOfflineSection.scss';

export default function OnlineOfflineSection() {
  const copy = useCopy();
  return (
    <section className="oo-section section" id="formats" aria-labelledby="oo-heading">
      <div className="container">
        <header className="oo-header">
          <div className="oo-tag-badge">
            <span className="oo-tag-dot" aria-hidden="true" />
            {copy("Форматы обучения")}</div>
          <h2 className="oo-heading" id="oo-heading">
            {copy("ВЫБЕРИ СВОЙ")}<br />
            <span className="oo-heading-accent">{copy("ФОРМАТ ОБУЧЕНИЯ")}</span>
          </h2>
          <p className="oo-sub">
            {copy("Занимайтесь в современных оборудованных аудиториях в филиалах GL Study или подключайтесь онлайн из любой точки Казахстана и мира.")}</p>
        </header>

        <div className="oo-grid">
          {/* Offline poster panel — with genuine brandbook workshop photo */}
          <article data-program="offline" className="oo-card oo-card--offline gl-bg-pattern-gl-white">
            <div className="oo-card__content">
              <div className="oo-card__tag"><Icon name="school" size={18} /> {copy(" Офлайн в филиалах")}</div>
              <h3 className="oo-card__title">{copy("В уютном")}<br />{copy("классе рядом")}</h3>
              <ul className="oo-card__list" aria-label={copy("Особенности офлайн-обучения")}>
                <li>
                  <strong>{copy("Филиалы в городах:")}</strong> {copy(" Костанай, Рудный, Тараз, Астана, Алматы")}</li>
                <li>
                  <strong>{copy("Формат:")}</strong> {copy(" индивидуально или группа до 10 человек")}</li>
                <li>
                  <strong>{copy("Занятия:")}</strong> {copy(" 2–3 раза в неделю")}</li>
                <li>
                  <strong>{copy("Старт:")}</strong> {copy(" General English с 6 лет, бесплатный пробный урок")}</li>
              </ul>

              <CityPicker />
              <a href="#lead-form" className="study-button" data-format="offline" data-cta="offline-trial">{copy("Записаться на бесплатный урок")}</a>
              <div className="oo-card__actions">
                <Link to="/branches" className="btn btn-primary oo-card__btn">
                  {copy("Выбрать филиал")}</Link>
                <Link to="/offline" className="oo-card__link">
                  {copy("Об офлайн-обучении →")}</Link>
              </div>
            </div>

            {/* Photo from Brandbook p. 23 */}
            <div className="oo-card__media">
              <img
                src={sitePath('/images/home/offline-class.webp')}
                srcSet={`${sitePath('/images/home/offline-class-240.webp')} 240w, ${sitePath('/images/home/offline-class-480.webp')} 480w, ${sitePath('/images/home/offline-class.webp')} 800w`}
                sizes="(max-width: 767px) 90vw, 640px"
                alt={copy("Занятия в офлайн-классе GL Study")}
                className="oo-card__img"
                width={800}
                height={1200}
                loading="lazy"
              />
              <div className="oo-card__badge-float">
                <span>{copy("Интерактивные аудитории")}</span>
              </div>
            </div>
          </article>

          {/* Online poster panel — with brand grid and live lesson badge */}
          <article data-program="online" className="oo-card oo-card--online gl-bg-pattern-grid-violet">
            <div className="oo-card__content">
              <div className="oo-card__tag"><Icon name="online" size={18} /> {copy(" Онлайн из дома")}</div>
              <h3 className="oo-card__title">{copy("Из любой")}<br />{copy("точки мира")}</h3>
              <ul className="oo-card__list" aria-label={copy("Особенности онлайн-обучения")}>
                <li>
                  <strong>{copy("Занятия:")}</strong> {copy(" онлайн с преподавателем, 2–3 раза в неделю")}</li>
                <li>
                  <strong>{copy("Формат:")}</strong> {copy(" индивидуально или группа до 6 человек")}</li>
                <li>
                  <strong>{copy("Расписание:")}</strong> {copy(" подбирается менеджером")}</li>
                <li>
                  <strong>{copy("Старт:")}</strong> {copy(" General English с 6 лет, бесплатный пробный урок")}</li>
              </ul>

              <div className="oo-card__actions">
                <a href="#lead-form" className="btn btn-primary oo-card__btn">
                  {copy("Попробовать онлайн")}</a>
                <Link to="/online" className="oo-card__link">
                  {copy("Об онлайн-обучении →")}</Link>
              </div>
            </div>

            {/* Interactive tech preview card */}
            <div className="oo-card__media oo-card__media--online">
              <div className="oo-online-preview">
                <div className="oo-online-preview__header">
                  <span className="oo-online-preview__session">
                    <span className="oo-online-preview__status-dot" aria-hidden="true" />
                    <span>{copy("Онлайн-занятия")}</span>
                  </span>
                  <span className="oo-online-preview__pill">{copy('HD Video')}</span>
                </div>
                <div className="oo-online-preview__body">
                  <div className="oo-online-stat">
                    <strong>100%</strong>{copy(' ')}
                    <span>{copy("живая речь")}</span>
                  </div>
                  <div className="oo-online-stat">
                    <strong>{copy("1-на-1")}</strong>{copy(' ')}
                    <span>{copy("или мини-группы")}</span>
                  </div>
                </div>
                <div className="oo-online-preview__footer">
                  <span>{copy("Доступ из любого города Казахстана")}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
