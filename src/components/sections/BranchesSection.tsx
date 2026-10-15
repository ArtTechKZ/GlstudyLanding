import { Link } from 'react-router-dom';
import { useCityContext } from '../../hooks/useCityContext';
import BranchMap from '../ui/BranchMap';
import './BranchesSection.scss';

export default function BranchesSection() {
  const { cities, selectedCity, selectCity } = useCityContext();

  return (
    <section className="branches section" id="branches" aria-labelledby="branches-heading">
      <div className="container">
        <header className="branches__header">
          <div>
            <div className="branches__tag-badge">
              <span className="branches__tag-dot" aria-hidden="true" />
              Локации в Казахстане
            </div>
            <h2 className="branches__heading" id="branches-heading">
              НАШИ
              <br />
              <span className="branches__heading-accent">ФИЛИАЛЫ</span>
            </h2>
            <p className="branches__sub">
              GL Study работает в ключевых городах Казахстана с комфортными учебными центрами.
            </p>
          </div>

          {/* City filter tabs */}
          <div className="branches__city-tabs" role="tablist" aria-label="Выбор города">
            {cities.map(city => (
              <button
                key={city.id}
                role="tab"
                aria-selected={city.id === selectedCity.id}
                className={`branches__city-tab${city.id === selectedCity.id ? ' is-active' : ''}`}
                onClick={() => selectCity(city.id)}
              >
                {city.name}
              </button>
            ))}
          </div>
        </header>

        <div className="branches__layout">
          {/* Branch cards */}
          <div className="branches__cards">
            {selectedCity.branches.map(branch => (
              <div key={branch.id} className="branches__card">
                <div className="branches__card-header">
                  <div className="branches__card-city">г. {selectedCity.name}</div>
                  {branch.hasIelts && (
                    <div className="branches__card-badge">
                      ✓ Центр IELTS
                    </div>
                  )}
                </div>

                <h3 className="branches__card-name">{branch.name}</h3>

                {branch.address ? (
                  <p className="branches__card-address">
                    <span aria-label="Адрес">📍</span> {branch.address}
                  </p>
                ) : (
                  <p className="branches__card-info-item">
                    📍 Центральный район города · <span className="branches__card-info-sub">уточняйте адрес у координатора</span>
                  </p>
                )}

                {branch.phone ? (
                  <a href={`tel:${branch.phone}`} className="branches__card-phone">
                    📞 {branch.phone}
                  </a>
                ) : (
                  <p className="branches__card-info-item">
                    📞 Единый контакт-центр GL Study
                  </p>
                )}

                {branch.schedule ? (
                  <p className="branches__card-schedule">
                    🕐 {branch.schedule}
                  </p>
                ) : (
                  <p className="branches__card-schedule">
                    🕐 Пн–Сб: 09:00 – 20:00 (по расписанию групп)
                  </p>
                )}

                {branch.note && (
                  <p className="branches__card-note">{branch.note}</p>
                )}
              </div>
            ))}
          </div>

          {/* Lazy loaded map & accessible fallback */}
          <div className="branches__map-col">
            <BranchMap city={selectedCity} branches={selectedCity.branches} />
          </div>
        </div>

        <div className="branches__cta-row">
          <Link to="/branches" className="btn btn-primary branches__all-btn">
            Смотреть все филиалы →
          </Link>
        </div>
      </div>
    </section>
  );
}
