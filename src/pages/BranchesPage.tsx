import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { useCityContext } from '../hooks/useCityContext';
import { DEMO_CITIES } from '../data/demo';
import BranchMap from '../components/ui/BranchMap';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';

export default function BranchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity, selectCity } = useCityContext();

  const cityParam = searchParams.get('city');
  const activeCity = cityParam ? DEMO_CITIES.find(c => c.id === cityParam) : null;

  // Sync context if URL param is valid
  useEffect(() => {
    if (cityParam && DEMO_CITIES.some(c => c.id === cityParam)) {
      selectCity(cityParam);
    }
  }, [cityParam, selectCity]);

  const handleCityFilter = (cityId: string | null) => {
    if (cityId) {
      setSearchParams({ city: cityId });
      selectCity(cityId);
    } else {
      setSearchParams({});
    }
  };

  const displayedCities = activeCity ? [activeCity] : DEMO_CITIES;

  const pageTitle = activeCity ? `ФИЛИАЛЫ В Г. ${activeCity.name.toUpperCase()}` : 'ФИЛИАЛЫ И КАРТА';
  const pageSubtitle = activeCity
    ? `Обучение английскому языку в г. ${activeCity.name}. Адреса учебных аудиторий, расписание и контакты.`
    : 'Сеть современных учебных центров GL Study в городах Казахстана. Найдите ближайший филиал.';

  const breadcrumbs = activeCity
    ? [
        { label: 'Филиалы', href: '/branches' },
        { label: activeCity.name }
      ]
    : [{ label: 'Филиалы' }];

  return (
    <InnerPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      accentWord={activeCity ? activeCity.name.toUpperCase() : 'ФИЛИАЛЫ'}
      tag={activeCity ? `Казахстан • ${activeCity.name}` : 'Сеть школ'}
      heroColor="violet"
      seo={SEO_METADATA.branches}
      breadcrumbs={breadcrumbs}
    >
      <div className="container">

        {/* City Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--sp-6)' }}>
          <button
            onClick={() => handleCityFilter(null)}
            className={`btn ${!cityParam ? 'btn-violet' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1.25rem', fontSize: 'var(--fs-sm)', borderRadius: 'var(--radius-pill)' }}
          >
            Все города
          </button>
          {DEMO_CITIES.map(c => (
            <button
              key={c.id}
              onClick={() => handleCityFilter(c.id)}
              className={`btn ${cityParam === c.id ? 'btn-violet' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 1.25rem', fontSize: 'var(--fs-sm)', borderRadius: 'var(--radius-pill)' }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Branch listing & Map grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-10)' }}>

          {/* Cards column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {displayedCities.map(city => (
              <div key={city.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {!activeCity && (
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', color: 'var(--gl-violet)', margin: 'var(--sp-2) 0 0' }}>
                    г. {city.name}
                  </h3>
                )}

                {city.branches.map(branch => (
                  <article
                    key={branch.id}
                    className="branch-card"
                    style={{
                      background: 'var(--gl-white)',
                      borderRadius: 'var(--radius-2xl)',
                      padding: 'var(--sp-5)',
                      border: '1px solid rgba(141, 59, 237, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-2)',
                      boxShadow: '0 4px 16px rgba(141, 59, 237, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="sticker" style={{ fontSize: 'var(--fs-xs)', borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)' }}>
                        {branch.status === 'active' ? 'Действующий филиал' : 'Скоро открытие'}
                      </span>
                      {branch.hasIelts && (
                        <span style={{ background: 'var(--gl-violet)', color: 'var(--gl-white)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-pill)', fontSize: 'var(--fs-xs)', fontWeight: 700 }}>
                          IELTS Центр
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', margin: '4px 0' }}>
                      {branch.name}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--fs-sm)' }}>
                      <div>
                        <strong style={{ color: 'var(--gl-violet)', display: 'block', fontSize: 'var(--fs-xs)', textTransform: 'uppercase' }}>Адрес:</strong>
                        {branch.address ? (
                          <span>📍 {branch.address}</span>
                        ) : (
                          <span style={{ color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
                            Адрес ожидает подтверждения заказчиком
                          </span>
                        )}
                      </div>

                      <div>
                        <strong style={{ color: 'var(--gl-violet)', display: 'block', fontSize: 'var(--fs-xs)', textTransform: 'uppercase' }}>Телефон:</strong>
                        {branch.phone ? (
                          <a href={`tel:${branch.phone}`} style={{ color: 'var(--gl-black)', fontWeight: 600 }}>
                            📞 {branch.phone}
                          </a>
                        ) : (
                          <span style={{ color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
                            Телефон ожидает подтверждения
                          </span>
                        )}
                      </div>

                      {branch.schedule && (
                        <div>
                          <strong style={{ color: 'var(--gl-violet)', display: 'block', fontSize: 'var(--fs-xs)', textTransform: 'uppercase' }}>График:</strong>
                          <span>🕐 {branch.schedule}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'var(--sp-2)' }}>
                      <a href="#lead-form" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                        Записаться в этот филиал
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>

          {/* Map Column */}
          <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-2xl)', padding: 'var(--sp-4)', border: '1px solid rgba(141, 59, 237, 0.15)', boxShadow: '0 4px 16px rgba(141, 59, 237, 0.05)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)', color: 'var(--gl-black)' }}>
                {activeCity ? `КАРТА — Г. ${activeCity.name.toUpperCase()}` : `КАРТА ФИЛИАЛОВ`}
              </h3>
              <BranchMap
                city={activeCity || selectedCity}
                branches={activeCity ? activeCity.branches : selectedCity.branches}
              />
            </div>
          </div>

        </div>

      </div>

      <LeadFormSection />
    </InnerPageLayout>
  );
}
