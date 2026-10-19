import {useUi} from '../../i18n';
import {formatTripDates,formatTripDuration,formatNumber} from '../../i18n/format';
import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import Icon from '../ui/Icon';
import { sitePath } from '../../utils/sitePath';

import { TRAVEL_PROGRAMS } from '../../data/demo';
import './TravelSection.scss';
import {SummerPrograms} from './BriefSections';

export default function TravelSection() {
  const copy = useCopy(),t=useUi();
  const prague = TRAVEL_PROGRAMS.find(t => t.id === 'prague-2027')!;
  const malaysia = TRAVEL_PROGRAMS.find(t => t.id === 'malaysia')!;

  return (
    <section className="travel section" id="travel" aria-labelledby="travel-heading">
      <div className="container">
        <header className="travel__header">
          <div className="travel__tag-badge">
            <span className="travel__tag-dot" aria-hidden="true" />
            {copy("Международные каникулы")}</div>
          <h2 className="travel__heading" id="travel-heading">
            {copy("ЗАРУБЕЖНЫЕ")}<br />
            <span className="travel__heading-accent">{copy("ПРОГРАММЫ")}</span>
          </h2>
          <p className="travel__sub">
            {copy("Изучайте английский язык и открывайте мир: зимние каникулы в Европе и языковые лагеря в Азии с полным сопровождением кураторов.")}</p>
        </header>

        <div className="travel__grid">
          {/* Prague / Europe card */}
          <article className="travel__card travel__card--prague gl-bg-pattern-gl-white">
            <div className="travel__card-photo-box">
              <img
                src={sitePath('/images/home/travel-prague.webp')}
                alt={copy("Архитектура Праги и Европы — зимняя образовательная программа GL Study")}
                className="travel__card-photo"
                width={800}
                height={635}
                loading="lazy"
              />
              <div className="travel__card-badge-top">
                <span className="travel__card-flag" aria-label={copy("Чехия")}>CZ</span>
                <span className="travel__tag">{formatTripDates(prague,t.locale??'ru')}</span>
                <span className="travel__tag">{t("Common.ageFrom",{age:formatNumber(prague.ageMin??10,t.locale??"ru")})}</span>
              </div>
            </div>

            <div className="travel__card-body">
              <h3 className="travel__card-title">{copy(prague.title)}</h3>
              <p className="travel__card-destination"><Icon name="location" size={18} /> {copy(prague.destination)}{copy(" + Дрезден (в основной программе)")}</p>

              <p>{formatTripDuration(prague,t)}{copy(". Виза и перелёт оплачиваются отдельно.")}</p>
              <ul className="travel__card-includes" aria-label={copy("Что включено в тур Прага")}>
                {prague.included?.slice(0, 4).map(item => (
                  <li key={item}><Icon name="check" size={18} /> {copy(item)}</li>
                ))}
              </ul>

              <div className="travel__addon">
                <div className="travel__addon-text">
                  <strong>{copy("+ Дополнительный тур 3 страны:")}</strong>
                  <span>{copy("Вена (Австрия), Братислава (Словакия), Будапешт (Венгрия)")}</span>
                </div>
              </div>

              <p className="travel__group-note">{copy("Сопровождение кураторов 24/7")}</p>
              <div className="travel__card-actions">
                <Link to="/travel/europe-winter-2027" className="btn travel__card-btn">
                  {copy("Узнать подробнее о туре")}</Link>
              </div>
            </div>
          </article>

          {/* Malaysia card */}
          <article className="travel__card travel__card--malaysia gl-bg-pattern-grid-violet">
            <div className="travel__card-photo-box">
              <img
                src={sitePath('/images/home/travel-malaysia.webp')}
                alt={copy("Куала-Лумпур, башни Петронас — программа обучения в Малайзии GL Study")}
                className="travel__card-photo"
                width={800}
                height={868}
                loading="lazy"
              />
              <div className="travel__card-badge-top">
                <span className="travel__card-flag" aria-label={copy("Малайзия")}>MY</span>
                <span className="travel__tag travel__tag--pending">{formatTripDates(malaysia,t.locale??'ru')}</span>
                <span className="travel__tag">{t("Common.ageFrom",{age:formatNumber(malaysia.ageMin??10,t.locale??"ru")})}</span>
              </div>
            </div>

            <div className="travel__card-body">
              <h3 className="travel__card-title">{copy(malaysia.title)}</h3>
              <p className="travel__card-destination"><Icon name="location" size={18} /> {copy(malaysia.destination)}</p>

              <p>{copy("Отель 4★, трёхразовое питание. Авиаперелёт оплачивается отдельно.")}</p>
              <ul className="travel__card-includes" aria-label={copy("Что включено в программу Малайзия")}>
                {malaysia.included?.slice(0, 4).map(item => (
                  <li key={item}><Icon name="check" size={18} /> {copy(item)}</li>
                ))}
              </ul>

              <div className="travel__card-actions">
                <Link to="/travel/malaysia" className="btn travel__card-btn">
                  {copy("Узнать подробнее о лагере")}</Link>
              </div>
            </div>
          </article>
        </div>
        <SummerPrograms />
      </div>
    </section>
  );
}
