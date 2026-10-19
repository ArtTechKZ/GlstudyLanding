import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import { useCopy } from '../i18n/copy';
import Icon from '../components/ui/Icon';
import { useState } from 'react';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';
import './IeltsPage.scss';

const IELTS_MODULES = [
  {
    code: 'READING',
    icon: 'book' as const,
    title: 'Academic & General Reading',
    desc: 'Стратегии Skimming и Scanning, работа с академическими научными статьями, ловушки в вопросах True / False / Not Given.',
    color: 'violet'
  },
  {
    code: 'WRITING',
    icon: 'writing' as const,
    title: 'Writing Task 1 & Task 2',
    desc: 'Разбор типов графиков, диаграмм и процессов (Task 1). Структура аргументированного эссе (Task 2) с проверкой по 4 критериям оценки IELTS.',
    color: 'orange'
  },
  {
    code: 'LISTENING',
    icon: 'listening' as const,
    title: 'Listening All 4 Sections',
    desc: 'Тренировка восприятия британского, австралийского и североамериканского акцентов. Техники параллельного чтения вопросов и заполнения бланка.',
    color: 'violet-light'
  },
  {
    code: 'SPEAKING',
    icon: 'speaking' as const,
    title: 'Speaking Simulation',
    desc: 'Практика всех трех частей устного интервью. Пополнение академического вокабуляра, работа над беглостью и уверенностью речи.',
    color: 'orange-light'
  }
];

const IELTS_FAQ = [
  {
    q: 'Какой стартовый уровень английского нужен для начала подготовки?',
    a: 'Рекомендуемый входной уровень — Intermediate и выше. Перед обучением проводится диагностика уровня.'
  },
  {
    q: 'Чем отличаются Academic и General модули?',
    a: 'Academic модуль предназначен для поступления в зарубежные колледжи и университеты. General Training чаще требуется для трудоустройства и иммиграционных программ.'
  },
  {
    q: 'Как часто проводятся пробные экзамены (Mock Tests)?',
    a: 'Во время курса проводятся полные пробные экзамены по четырём частям: Reading, Writing, Listening и Speaking. Периодичность уточняется у преподавателя.'
  }
];

export default function IeltsPage() {
  const copy = useCopy(),t=useUi();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <InnerPageLayout
      title={copy("ПОДГОТОВКА К ЭКЗАМЕНУ IELTS")}
      subtitle={copy("Интенсивный курс по всем 4 модулям экзамена. Пробные тесты с таймингом, персональный разбор эссе и проверенные стратегии на высокий балл.")}
      accentWord="IELTS"
      tag={copy("Международный сертификат")}
      heroColor="violet"
      seo={SEO_METADATA.ielts}
      breadcrumbs={[{ label: 'Подготовка к IELTS' }]}
    >
      <div className="container"><p><Link to="/ielts-kostanay">{t("Full.exam")}</Link></p>
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
            <Icon name="location" size={18} /> {copy(" Сдача и подготовка в Костанае (#kostanay) →")}</a>
        </div>

        {/* Block 1: 4 Modules */}
        <section style={{ marginBottom: 'var(--sp-10)' }}>
          <div style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto var(--sp-6)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              {copy("Все 4 раздела")}</span>
            <h2 className="section-heading" style={{ color: 'var(--gl-black)' }}>
              {copy("СТРУКТУРА КУРСА ПОДГОТОВКИ")}</h2>
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
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={m.icon} size={24} /></span>
                  <span className="sticker ielts-module__badge" style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase' }}>
                    {copy(m.code)}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: m.color === 'orange' ? 'max(1.1875rem, var(--fs-h3))' : 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {copy(m.title)}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {copy(m.desc)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="study-panel" style={{marginBottom:'var(--sp-6)'}}><h2 className="section-heading">{copy("УСЛОВИЯ ПОДГОТОВКИ")}</h2><p>{copy("Онлайн и офлайн, индивидуально или мини-группа 2–6 человек.")}</p><p>{copy("Курс — 3 месяца, 36 часов. Рекомендуемый входной уровень — Intermediate+.")}</p><p>{copy("Диагностика перед обучением и полные пробные экзамены Reading, Writing, Listening, Speaking.")}</p><a href="#lead-form" className="study-button" data-cta="ielts-course">{copy("Получить консультацию")}</a></section>

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
              {copy("Региональная программа • Костанай")}</span>
            <h2
              className="section-heading"
              style={{
                color: 'var(--gl-black)',
                marginTop: 'var(--sp-1)',
                marginBottom: 'var(--sp-2)'
              }}
            >
              {copy("СДАЧА IELTS В КОСТАНАЕ")}</h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0, 0, 0, 0.8)', maxWidth: '42rem', lineHeight: 1.6 }}>
              {copy("IELTS Academic и General Training проводятся на компьютере. Адрес проведения экзамена: ул. Тәуелсіздік, 83, кабинет 305. Это место сдачи экзамена, а не подтверждённый адрес филиала школы.")}</p>
          </div>

          {/* 3 Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                01
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {copy("Диагностика и пробный тест")}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                {copy("Определяем ваш текущий балл по 4 модулям (Reading, Listening, Writing, Speaking) в условиях реального экзаменационного тайминга.")}</p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-violet)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                02
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {copy("Целевая экспресс-подготовка")}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                {copy("Интенсивные занятия в костанайском филиале: разбор типичных ошибок, шаблоны для эссе и тренинг устной части.")}</p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                03
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {copy("Сопровождение регистрации")}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                {copy("Помогаем правильно зарегистрироваться на открытую экзаменационную сессию, подготовить документы и подтвердить слот.")}</p>
            </div>
          </div>

          {/* Dates & Location cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(242, 76, 10, 0.2)' }}>
              <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                {copy("Ближайшие сессии в Костанае:")}</strong>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: 1.5 }}>
                {copy("Расписание экзаменационных сессий формируется в соответствии с графиком уполномоченного провайдера. Оставьте заявку, чтобы получить уведомление об открытии слотов.")}</p>
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.2)' }}>
              <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                {copy("Место проведения экзамена:")}</strong>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: 1.5 }}>
                <Icon name="location" size={18} /> {copy(" ул. Тәуелсіздік, 83, кабинет 305. Ссылка на регистрацию и ближайшие даты уточняются.")}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <a href="#lead-form" data-city="kostanay" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              {copy("Записаться на подготовку в Костанае")}</a>
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
          <Icon name="info" size={18} /> <strong>{copy("Правовое уведомление:")}</strong> {copy(" Ссылка на регистрацию и ближайшие даты экзамена будут добавлены после подтверждения. Консультация через форму не заменяет официальную регистрацию на экзамен.")}</div>

        {/* Block 5: FAQ */}
        <section style={{ marginBottom: 'var(--sp-10)' }}>
          <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-4)' }}>
            {copy("ВОПРОСЫ О КУРСЕ IELTS")}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {IELTS_FAQ.map((faq, i) => (
              <div
                data-faq-item
                key={i}
                style={{
                  background: 'var(--gl-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(141, 59, 237, 0.15)',
                  overflow: 'hidden'
                }}
              >
                <button
                  data-faq-question
                  id={`ielts-faq-${i}`}
                  aria-controls={`ielts-faq-answer-${i}`}
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
                  <span>{copy(faq.q)}</span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--gl-violet)', marginLeft: '1rem' }}>
                    <Icon name={openFaq === i ? 'collapse' : 'expand'} />
                  </span>
                </button>
                <div data-faq-answer hidden={openFaq !== i} role="region" id={`ielts-faq-answer-${i}`} aria-labelledby={`ielts-faq-${i}`} style={{ padding: '0 var(--sp-4) var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'rgba(0, 0, 0, 0.75)', lineHeight: 1.6 }}>
                    {copy(faq.a)}
                  </div>
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
