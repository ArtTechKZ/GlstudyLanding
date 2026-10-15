import { sitePath } from '../../utils/sitePath';
import { Link } from 'react-router-dom';
import { TRAVEL_PROGRAMS } from '../../data/demo';
import './TravelSection.scss';

export default function TravelSection() {
  const prague = TRAVEL_PROGRAMS.find(t => t.id === 'prague-2027')!;
  const malaysia = TRAVEL_PROGRAMS.find(t => t.id === 'malaysia')!;

  return (
    <section className="travel section" id="travel" aria-labelledby="travel-heading">
      <div className="container">
        <header className="travel__header">
          <div className="travel__tag-badge">
            <span className="travel__tag-dot" aria-hidden="true" />
            Международные каникулы
          </div>
          <h2 className="travel__heading" id="travel-heading">
            ЗАРУБЕЖНЫЕ
            <br />
            <span className="travel__heading-accent">ПРОГРАММЫ</span>
          </h2>
          <p className="travel__sub">
            Изучайте английский язык и открывайте мир: зимние каникулы в Европе и языковые лагеря в Азии с полным сопровождением кураторов.
          </p>
        </header>

        <div className="travel__grid">
          {/* Prague / Europe card */}
          <article className="travel__card travel__card--prague gl-bg-pattern-gl-white">
            <div className="travel__card-photo-box">
              <img
                src={sitePath('/images/home/travel-prague.webp')}
                alt="Архитектура Праги и Европы — зимняя образовательная программа GL Study"
                className="travel__card-photo"
                width={800}
                height={635}
                loading="lazy"
              />
              <div className="travel__card-badge-top">
                <span className="travel__card-flag" aria-label="Флаг Чехии">🇨🇿</span>
                <span className="travel__tag">02–12 января 2027</span>
                <span className="travel__tag">{prague.ageMin}–{prague.ageMax} лет</span>
              </div>
            </div>

            <div className="travel__card-body">
              <h3 className="travel__card-title">{prague.title}</h3>
              <p className="travel__card-destination">📍 {prague.destination} + Дрезден (в основной программе)</p>

              {/* STRICT WCAG: crisp white price on violet */}
              <div className="travel__card-price">
                <div className="travel__price-row">
                  <span className="travel__price-amount">{prague.price}</span>
                  <span className="travel__price-currency">/ участник</span>
                </div>
                <span className="travel__price-note">{prague.priceNote}</span>
              </div>

              <ul className="travel__card-includes" aria-label="Что включено в тур Прага">
                {prague.included?.slice(0, 4).map(item => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>

              <div className="travel__addon">
                <div className="travel__addon-text">
                  <strong>+ Дополнительный тур 3 страны:</strong>
                  <span>Вена (Австрия), Братислава (Словакия), Будапешт (Венгрия)</span>
                </div>
                <span className="travel__addon-price">250 €</span>
              </div>

              {prague.groupMin && (
                <p className="travel__group-note">
                  Минимальная группа: {prague.groupMin} человек · Сопровождение куратором 24/7
                </p>
              )}

              <div className="travel__card-actions">
                <Link to="/travel/europe-winter-2027" className="btn travel__card-btn">
                  Узнать подробнее о туре
                </Link>
              </div>
            </div>
          </article>

          {/* Malaysia card */}
          <article className="travel__card travel__card--malaysia gl-bg-pattern-grid-violet">
            <div className="travel__card-photo-box">
              <img
                src={sitePath('/images/home/travel-malaysia.webp')}
                alt="Куала-Лумпур, башни Петронас — программа обучения в Малайзии GL Study"
                className="travel__card-photo"
                width={800}
                height={868}
                loading="lazy"
              />
              <div className="travel__card-badge-top">
                <span className="travel__card-flag" aria-label="Флаг Малайзии">🇲🇾</span>
                <span className="travel__tag travel__tag--pending">Даты уточняются</span>
                <span className="travel__tag">{malaysia.ageMin}–{malaysia.ageMax} лет</span>
              </div>
            </div>

            <div className="travel__card-body">
              <h3 className="travel__card-title">{malaysia.title}</h3>
              <p className="travel__card-destination">📍 {malaysia.destination}</p>

              {/* Brandbook p. 23 feature */}
              <div className="travel__card-fact-badge">
                🎓 Малайзия принимает казахстанский сертификат ЕНТ
              </div>

              <div className="travel__card-price travel__card-price--pending">
                <span className="travel__price-pending">Стоимость рассчитывается индивидуально</span>
                <span className="travel__price-note">Уточняйте актуальные условия у куратора программы</span>
              </div>

              <ul className="travel__card-includes" aria-label="Что включено в программу Малайзия">
                {malaysia.included?.slice(0, 4).map(item => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>

              <div className="travel__card-actions">
                <Link to="/travel/malaysia" className="btn travel__card-btn">
                  Узнать подробнее о лагере
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
