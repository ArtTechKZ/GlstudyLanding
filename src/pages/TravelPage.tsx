import { useParams, Link } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { TRAVEL_PROGRAMS } from '../data/demo';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';

interface TravelPageProps {
  slug?: string;
}

export default function TravelPage({ slug: propSlug }: TravelPageProps = {}) {
  const params = useParams<{ slug: string }>();
  const effectiveSlug = propSlug || params.slug;
  const program = TRAVEL_PROGRAMS.find(t => t.slug === effectiveSlug);

  if (!program) {
    return (
      <main id="main-content" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="section-heading" style={{ color: 'var(--gl-violet)', marginBottom: '1rem' }}>
            ПРОГРАММА НЕ НАЙДЕНА
          </h1>
          <p style={{ color: 'rgba(28,25,33,0.7)', marginBottom: '2rem' }}>
            Запрашиваемый тур не найден в расписании поездок.
          </p>
          <Link to="/#travel" className="btn btn-primary">
            ← Все зарубежные программы
          </Link>
        </div>
      </main>
    );
  }

  const isPrague = program.id === 'prague-2027';
  const seo = isPrague ? SEO_METADATA.travelPrague : SEO_METADATA.travelMalaysia;

  return (
    <InnerPageLayout
      title={program.title.toUpperCase()}
      subtitle={program.destination}
      accentWord={isPrague ? 'ПРАГИ' : 'МАЛАЙЗИИ'}
      tag={`Зарубежный тур • ${isPrague ? 'Чехия' : 'Малайзия'}`}
      heroColor={isPrague ? 'violet' : 'orange'}
      seo={seo}
      breadcrumbs={[
        { label: 'Зарубежные каникулы', href: '/#travel' },
        { label: program.title }
      ]}
    >
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', paddingBottom: 'var(--sp-8)' }}>

          {/* Key facts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {(program.dateStart && program.dateEnd) ? (
              <div style={{ background: 'var(--gl-orange-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)', color: 'var(--gl-black)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-violet)', display: 'block' }}>
                  Даты тура ✅
                </span>
                <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem', letterSpacing: '0.04em' }}>
                  02–12 января 2027
                </strong>
                <span style={{ display: 'block', fontSize: 'var(--fs-xs)', opacity: 0.8, marginTop: '2px' }}>
                  11 дней / 10 ночей
                </span>
              </div>
            ) : (
              <div style={{ background: 'var(--gl-violet-light)', border: '1px dashed var(--gl-violet)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-violet)', display: 'block' }}>
                  Даты тура
                </span>
                <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem', color: 'var(--gl-violet)', letterSpacing: '0.04em' }}>
                  Даты уточняются
                </strong>
                <span style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'rgba(0,0,0,0.7)', marginTop: '2px' }}>
                  Длительность: {program.duration}
                </span>
              </div>
            )}

            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.2)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-violet)', display: 'block' }}>
                Возрастная группа
              </span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem', color: 'var(--gl-black)', letterSpacing: '0.04em' }}>
                {program.ageMin}–{program.ageMax} лет
              </strong>
              <span style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'rgba(0,0,0,0.6)', marginTop: '2px' }}>
                В сопровождении кураторов
              </span>
            </div>

            <div style={{ background: 'var(--gl-violet-light)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-violet)', display: 'block' }}>
                Проживание и питание
              </span>
              <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--gl-black)' }}>
                {isPrague ? 'Отель + 2-раз. питание' : 'Отель 4★ + 3-раз. питание'}
              </strong>
              <span style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'rgba(0,0,0,0.7)', marginTop: '2px' }}>
                {isPrague ? 'Проездной + SIM в комплекте' : '2 человека в номере'}
              </span>
            </div>

            {program.price ? (
              <div style={{ background: 'var(--gl-violet)', color: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-orange-light)', display: 'block' }}>
                  Стоимость пакета ✅
                </span>
                <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.75rem', color: 'var(--gl-white)', lineHeight: 1, letterSpacing: '0.03em' }}>
                  {program.price}
                </strong>
                {program.priceNote && (
                  <span style={{ display: 'block', fontSize: 'var(--fs-xs)', opacity: 0.85, marginTop: '4px' }}>
                    {program.priceNote}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--gl-orange-light)', border: '1px dashed var(--gl-orange)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: 'var(--gl-violet)', display: 'block' }}>
                  Стоимость пакета
                </span>
                <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem', color: 'var(--gl-violet)', letterSpacing: '0.04em' }}>
                  Уточняйте у менеджера
                </strong>
                <span style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--gl-black)', opacity: 0.8, marginTop: '2px' }}>
                  Без скрытых комиссий
                </span>
              </div>
            )}
          </div>

          {/* Included program details */}
          {program.included && program.included.length > 0 && (
            <section>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-4)' }}>
                {isPrague ? 'ЧТО ВКЛЮЧЕНО В СТОИМОСТЬ' : 'В ПРОГРАММЕ ЛАГЕРЯ'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-2)' }}>
                {program.included.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 'var(--sp-3) var(--sp-4)',
                      background: 'var(--gl-white)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--fs-sm)',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <span style={{ color: 'var(--gl-orange)', fontWeight: 800, fontSize: '1.125rem' }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Not included */}
          {program.notIncluded && program.notIncluded.length > 0 && (
            <div style={{ background: 'var(--gl-surface-alt)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-sm)', textTransform: 'uppercase', color: 'var(--gl-black)', display: 'block', marginBottom: '0.5rem' }}>
                Оплачивается отдельно:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                {program.notIncluded.map(item => (
                  <span key={item} className="sticker" style={{ fontSize: 'var(--fs-xs)', borderColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--gl-black)' }}>
                    ✕ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional option (Prague Tri stolytsy) */}
          {program.additionalOption && (
            <section style={{ background: 'var(--gl-orange-light)', borderRadius: 'var(--radius-2xl)', padding: 'var(--sp-6)', color: 'var(--gl-black)', border: '1px solid rgba(242, 76, 10, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <div>
                  <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: '4px' }}>
                    Дополнительная экскурсия
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h2)', textTransform: 'uppercase', color: 'var(--gl-black)', margin: '4px 0 0' }}>
                    + {program.additionalOption.title}
                  </h3>
                </div>
                <div style={{ fontFamily: 'var(--font-accent)', fontWeight: 400, fontSize: '2.5rem', color: 'var(--gl-orange)', letterSpacing: '0.04em' }}>
                  {program.additionalOption.price}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-2)' }}>
                {program.additionalOption.includes.map((inc, i) => (
                  <div key={i} style={{ background: 'var(--gl-white)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                    ✓ {inc}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerary Structure — Honest CMS Placeholder */}
          {isPrague && (
            <div
              style={{
                background: 'var(--gl-violet-light)',
                border: '1px dashed var(--gl-violet)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--sp-6)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', color: 'var(--gl-violet)', marginBottom: '0.5rem' }}>
                📅 ПОШАГОВОЕ РАСПИСАНИЕ ПО ДНЯМ (DAY 1 – DAY 11)
              </h3>
              <p style={{ color: 'var(--gl-black)', opacity: 0.85, fontSize: 'var(--fs-sm)', lineHeight: 1.5, margin: 0 }}>
                Детальный поминутный маршрут и график экскурсий согласовываются принимающей стороной в Праге и куратором. Мы не публикуем вымышленные планы до официального подтверждения от принимающего университета.
              </p>
            </div>
          )}

          {program.groupMin && (
            <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0, 0, 0, 0.6)' }}>
              👥 Минимальный размер организованной группы: <strong>{program.groupMin} участников</strong>.
            </p>
          )}
        </div>
      </div>

      <LeadFormSection />
    </InnerPageLayout>
  );
}
