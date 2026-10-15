import { useState } from 'react';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';
import './IeltsPage.scss';

const IELTS_MODULES = [
  {
    code: 'READING',
    icon: '📖',
    title: 'Academic & General Reading',
    desc: 'Стратегии Skimming и Scanning, работа с академическими научными статьями, ловушки в вопросах True / False / Not Given.',
    color: 'violet'
  },
  {
    code: 'WRITING',
    icon: '✍️',
    title: 'Writing Task 1 & Task 2',
    desc: 'Разбор типов графиков, диаграмм и процессов (Task 1). Структура аргументированного эссе (Task 2) с проверкой по 4 критериям оценки IELTS.',
    color: 'orange'
  },
  {
    code: 'LISTENING',
    icon: '🎧',
    title: 'Listening All 4 Sections',
    desc: 'Тренировка восприятия британского, австралийского и североамериканского акцентов. Техники параллельного чтения вопросов и заполнения бланка.',
    color: 'violet-light'
  },
  {
    code: 'SPEAKING',
    icon: '🗣️',
    title: 'Speaking Simulation',
    desc: 'Практика всех трех частей устного интервью. Пополнение академического вокабуляра, работа над беглостью и уверенностью речи.',
    color: 'orange-light'
  }
];

const SCORE_TARGETS = [
  {
    band: '6.0 – 6.5',
    title: 'Бакалавриат за рубежом',
    desc: 'Базовый проходной балл большинства европейских, азиатских и турецких университетов.'
  },
  {
    band: '7.0 – 7.5',
    title: 'Магистратура и топ-вузы',
    desc: 'Требование ведущих программ Великобритании, США, Канады, а также программ «Болашак».'
  },
  {
    band: '8.0+',
    title: 'Преподавание и экспертная карьера',
    desc: 'Уровень профессионального владения (C1–C2) для международной карьеры и грантовых программ.'
  }
];

const IELTS_FAQ = [
  {
    q: 'Какой стартовый уровень английского нужен для начала подготовки?',
    a: 'Для комфортной подготовки к баллу 6.5+ рекомендуется иметь базовый уровень не ниже Intermediate (B1). Если уровень ниже, мы предлагаем предварительный курс General English.'
  },
  {
    q: 'Чем отличаются Academic и General модули?',
    a: 'Academic модуль предназначен для поступления в зарубежные колледжи и университеты. General Training чаще требуется для трудоустройства и иммиграционных программ.'
  },
  {
    q: 'Как часто проводятся пробные экзамены (Mock Tests)?',
    a: 'Каждые 2–3 недели студенты пишут полноценный пробный экзамен в условиях жесткого тайминга с детальным разбором ошибок.'
  }
];

export default function IeltsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <InnerPageLayout
      title="ПОДГОТОВКА К ЭКЗАМЕНУ IELTS"
      subtitle="Интенсивный курс по всем 4 модулям экзамена. Пробные тесты с таймингом, персональный разбор эссе и проверенные стратегии на высокий балл."
      accentWord="IELTS"
      tag="Международный сертификат"
      heroColor="violet"
      seo={SEO_METADATA.ielts}
      breadcrumbs={[{ label: 'Подготовка к IELTS' }]}
    >
      <div className="container">
        {/* Quick jump to Kostanay */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-6)' }}>
          <a
            href="#kostanay"
            className="btn btn-secondary"
            style={{
              fontSize: 'var(--fs-sm)',
              padding: '0.45rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none'
            }}
          >
            📍 Сдача и подготовка в Костанае (#kostanay) →
          </a>
        </div>

        {/* Block 1: 4 Modules */}
        <section style={{ marginBottom: 'var(--sp-10)' }}>
          <div style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto var(--sp-6)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              Все 4 раздела
            </span>
            <h2 className="section-heading" style={{ color: 'var(--gl-black)' }}>
              СТРУКТУРА КУРСА ПОДГОТОВКИ
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
            {IELTS_MODULES.map((m, i) => (
              <div
                key={i}
                className={`card ielts-module surface-${m.color}`}
                style={{
                  padding: 'var(--sp-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-2)',
                  minHeight: '260px',
                  border: m.color.includes('light') ? '1px solid rgba(141, 59, 237, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{m.icon}</span>
                  <span className="sticker ielts-module__badge" style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase' }}>
                    {m.code}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: m.color === 'orange' ? 'max(1.1875rem, var(--fs-h3))' : 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 2: Score targets */}
        <section style={{ marginBottom: 'var(--sp-10)' }}>
          <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-5)' }}>
            ЦЕЛЕВЫЕ БАЛЛЫ
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
            {SCORE_TARGETS.map((t, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--gl-white)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--sp-5)',
                  border: '1px solid rgba(141, 59, 237, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-2)'
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-accent)',
                    fontWeight: 800,
                    fontSize: '2.5rem',
                    color: 'var(--gl-violet)',
                    lineHeight: 1
                  }}
                >
                  Band {t.band}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', color: 'var(--gl-black)' }}>
                  {t.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0, 0, 0, 0.75)', lineHeight: 1.5 }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 3: IELTS in Kostanay (Integrated Section #kostanay) */}
        <section
          id="kostanay"
          style={{
            background: 'var(--gl-orange-light)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            marginBottom: 'var(--sp-10)',
            border: '1px solid rgba(242, 76, 10, 0.25)',
            scrollMarginTop: '100px'
          }}
        >
          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              Региональная программа • Костанай
            </span>
            <h2
              className="section-heading"
              style={{
                color: 'var(--gl-black)',
                marginTop: 'var(--sp-1)',
                marginBottom: 'var(--sp-2)'
              }}
            >
              СДАЧА IELTS В КОСТАНАЕ
            </h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0, 0, 0, 0.8)', maxWidth: '42rem', lineHeight: 1.6 }}>
              Специализированная подготовка, пробные тестирования и организационное сопровождение сдачи международного экзамена в костанайском филиале GL Study.
            </p>
          </div>

          {/* 3 Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                01
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Диагностика и пробный тест
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Определяем ваш текущий балл по 4 модулям (Reading, Listening, Writing, Speaking) в условиях реального экзаменационного тайминга.
              </p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-violet)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                02
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Целевая экспресс-подготовка
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Интенсивные занятия в костанайском филиале: разбор типичных ошибок, шаблоны для эссе и тренинг устной части.
              </p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                03
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Сопровождение регистрации
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Помогаем правильно зарегистрироваться на открытую экзаменационную сессию, подготовить документы и подтвердить слот.
              </p>
            </div>
          </div>

          {/* Dates & Location cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(242, 76, 10, 0.2)' }}>
              <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Ближайшие сессии в Костанае:
              </strong>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: 1.5 }}>
                Расписание экзаменационных сессий формируется в соответствии с графиком уполномоченного провайдера. Оставьте заявку, чтобы получить уведомление об открытии слотов.
              </p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.2)' }}>
              <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Филиал GL Study в Костанае:
              </strong>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: 1.5 }}>
                📍 Филиал (IELTS) • Точный адрес и график работы подтверждаются координатором.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Записаться на подготовку в Костанае
            </a>
          </div>
        </section>

        {/* Block 4: Honest IDP Note */}
        <div
          style={{
            background: 'var(--gl-violet-light)',
            border: '1px dashed rgba(141, 59, 237, 0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--sp-4) var(--sp-5)',
            marginBottom: 'var(--sp-10)',
            fontSize: 'var(--fs-sm)',
            color: 'var(--gl-black)',
            lineHeight: 1.5
          }}
        >
          ℹ️ <strong>Правовое уведомление:</strong> Подтверждение партнерства с IDP IELTS находится на стадии документального согласования. Точные цены курсов и даты экзаменационных сессий предоставляются куратором направления.
        </div>

        {/* Block 5: FAQ */}
        <section style={{ marginBottom: 'var(--sp-10)' }}>
          <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-4)' }}>
            ВОПРОСЫ О КУРСЕ IELTS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {IELTS_FAQ.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--gl-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(141, 59, 237, 0.15)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3) var(--sp-4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 600,
                    fontSize: 'var(--fs-body)',
                    color: 'var(--gl-black)',
                    textAlign: 'left'
                  }}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--gl-violet)', marginLeft: '1rem' }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 var(--sp-4) var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'rgba(0, 0, 0, 0.75)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Block 6: Lead form */}
      <LeadFormSection />
    </InnerPageLayout>
  );
}
