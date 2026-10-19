import ProgrammeLinks from '../components/ui/ProgrammeLinks';
import {Link} from '../i18n/Link';
import { useCopy } from '../i18n/copy';
import Icon from '../components/ui/Icon';
import { sitePath } from '../utils/sitePath';
import { useState } from 'react';

import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import CourseFacts from '../components/ui/CourseFacts';
import './LearningPage.scss';
import { TRIAL_PROCESS } from '../data/demo';
import { AdditionalLanguages, TrialProcess } from '../components/sections/BriefSections';
import CityPicker from '../components/ui/CityPicker';
import { SEO_METADATA } from '../data/seo';

const JUMP_LINKS = [
  { icon: 'child' as const, label: 'Детям с 6 лет', href: '#children' },
  { icon: 'teen' as const, label: 'Подросткам', href: '#teens' },
  { icon: 'business' as const, label: 'Взрослым', href: '#adults' },
  { icon: 'online' as const, label: 'Онлайн-занятия', href: '#online' },
  { icon: 'school' as const, label: 'Офлайн в классах', href: '#offline' },
];

const CHILDREN_PILLARS = [
  { icon: 'art' as const, title: 'Игровая методика', desc: 'Учим слова через песни, ассоциации и интерактивные игры без стресса и оценок.', color: 'orange' },
  { icon: 'speaking' as const, title: 'Разговорная речь', desc: 'С первых уроков дети начинают здороваться, задавать вопросы и отвечать на английском.', color: 'violet' },
  { icon: 'puzzle' as const, title: 'Логика и моторика', desc: 'Развиваем образное мышление, фонематический слух и правильное произношение.', color: 'violet-light' }
];

const TEENS_PILLARS = [
  { icon: 'phoneDevice' as const, title: 'Актуальные темы', desc: 'Обсуждаем технологии, социальные сети, музыку, путешествия и популярную культуру.', color: 'violet-light' },
  { icon: 'project' as const, title: 'Проектная работа', desc: 'Создаем презентации, дебаты и командные исследования на английском языке.', color: 'orange' },
  { icon: 'education' as const, title: 'Подготовка к будущему', desc: 'Формируем академическую базу для сдачи экзаменов и поступления в зарубежные вузы.', color: 'violet' }
];

const ADULTS_PILLARS = [
  { icon: 'business' as const, title: 'Деловой и разговорный', desc: 'Фокус на рабочих сценариях: переписка, переговоры, презентации и неформальный small talk.', color: 'violet' },
  { icon: 'time' as const, title: 'Гибкое расписание', desc: 'Индивидуальные и групповые занятия, расписание подбирается менеджером.', color: 'violet-light' },
  { icon: 'progress' as const, title: 'Четкие уровни (CEFR)', desc: 'Прохождение одного уровня занимает 4–6 месяцев. Перед обучением проводится диагностика.', color: 'orange' }
];

const ONLINE_BENEFITS = [
  { icon: 'online' as const, title: 'Живые онлайн-занятия', desc: 'Преподаватель в реальном времени ведет диалог, исправляет произношение и вовлекает каждого ученика.', color: 'violet' },
  { icon: 'chart' as const, title: 'Интерактивная доска и квизы', desc: 'Интерактивные упражнения, разговорная практика и работа с преподавателем.', color: 'orange' },
  { icon: 'fast' as const, title: 'Удобство и экономия времени', desc: 'Учитесь из дома или в поездках. Нужен только ноутбук или планшет со стабильным интернетом.', color: 'violet-light' }
];

const OFFLINE_FEATURES = [
  { icon: 'school' as const, title: 'Современные аудитории', desc: 'Уютные классы, оборудованные мультимедийными панелями, интерактивными материалами и зонами отдыха.', color: 'violet' },
  { icon: 'speaking' as const, title: 'Полное погружение в язык', desc: 'Уроки проходят преимущественно на английском. Живой диалог со сверстниками разрушает языковой барьер.', color: 'orange' },
  { icon: 'people' as const, title: 'Командные проекты и клубы', desc: 'Разговорная практика и командная работа. Бесплатный Speaking Club доступен всем.', color: 'violet-light' }
];

const LEARNING_FAQ = [
  {
    q: 'Как проходит бесплатный пробный урок?',
    a: TRIAL_PROCESS
  },
  {
    q: 'Что нужно для онлайн-занятий?',
    a: 'Устройство с камерой, микрофоном и стабильным интернетом. Расписание подбирается менеджером.'
  },
  {
    q: 'Сколько человек в группе?',
    a: 'Онлайн — индивидуально или группа до 6 человек, офлайн — индивидуально или группа до 10 человек. Занятия 2–3 раза в неделю.'
  },
  {
    q: 'Можно ли совмещать онлайн и офлайн?',
    a: 'Да! Доступен гибридный формат при наличии мест в группах или переход на онлайн во время поездок и каникул.'
  },
  {
    q: 'Что делать при пропуске занятия?',
    a: 'Преподаватель отправляет материалы и домашнее задание в чат группы, а куратор помогает согласовать отработку темы.'
  }
];

export default function LearningPage() {
  const copy = useCopy();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <InnerPageLayout
      title={copy("КУРСЫ АНГЛИЙСКОГО ЯЗЫКА")}
      subtitle={copy("General English с 6 лет: дети, подростки и взрослые. Индивидуальные и групповые занятия онлайн и офлайн. Один уровень — 4–6 месяцев, занятия — 2–3 раза в неделю.")}
      accentWord={copy("ОБУЧЕНИЕ")}
      tag={copy("Все программы GL Study")}
      heroColor="violet"
      seo={SEO_METADATA.learning}
      breadcrumbs={[{ label: 'Обучение' }]}
    >
      <div className="container"><ProgrammeLinks/>

        {/* Quick jump anchor navigation */}
        <nav aria-label={copy("Быстрая навигация по программам")} style={{ marginBottom: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {JUMP_LINKS.map(link => (
              <a
                key={link.href}
                href={sitePath(link.href)}
                className="btn btn-secondary"
                style={{
                  fontSize: 'var(--fs-sm)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none'
                }}
              >
                <Icon name={link.icon} size={18} /> {copy(link.label)}
              </a>
            ))}
          </div>
        </nav>

        {/* ─── SECTION 1: CHILDREN ────────────────────────────────────────── */}
        <section id="children" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker learning-age" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                {copy("С 6 лет")}</span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                {copy("АНГЛИЙСКИЙ ДЛЯ ДЕТЕЙ")}</h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              {copy("Записать ребёнка")}</a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            {copy("Занятия в игровой форме для малышей. Развиваем речь, слух и любовь к языку с первых уроков без стресса, скучных правил и школьных отметок.")}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {CHILDREN_PILLARS.map((p, i) => (
              <div
                key={i}
                className={`card surface-${p.color}`}
                style={{
                  padding: 'var(--sp-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-2)',
                  minHeight: '220px',
                  border: p.color === 'violet-light' ? '1px solid rgba(141, 59, 237, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={p.icon} size={24} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {copy(p.title)}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {copy(p.desc)}
                </p>
              </div>
            ))}
          </div>

          <CourseFacts items={[
            { label: 'Возраст', value: 'С 6 лет' },
            { label: 'Формат', value: 'Онлайн и Офлайн' },
            { label: 'Размер группы', value: 'Онлайн до 6 / офлайн до 10' },
            { label: 'Частота', value: '2–3 раза в неделю' },
          ]} />
        </section>

        {/* ─── SECTION 2: TEENS ───────────────────────────────────────────── */}
        <section id="teens" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker learning-age" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                {copy("Подросткам")}</span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                {copy("АНГЛИЙСКИЙ ДЛЯ ПОДРОСТКОВ")}</h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              {copy("Записать подростка")}</a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            {copy("Современная программа для тех, кто хочет свободно общаться, путешествовать, уверенно сдать школьные экзамены и подготовиться к международным тестам.")}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {TEENS_PILLARS.map((p, i) => (
              <div
                key={i}
                className={`card surface-${p.color}`}
                style={{
                  padding: 'var(--sp-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-2)',
                  minHeight: '220px',
                  border: p.color === 'violet-light' ? '1px solid rgba(141, 59, 237, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={p.icon} size={24} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {copy(p.title)}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {copy(p.desc)}
                </p>
              </div>
            ))}
          </div>

          <CourseFacts items={[
            { label: 'Возраст', value: 'Подросткам' },
            { label: 'Формат', value: 'Онлайн и Офлайн' },
            { label: 'Размер группы', value: 'Онлайн до 6 / офлайн до 10' },
            { label: 'Частота', value: '2–3 раза в неделю' },
          ]} />
        </section>

        {/* ─── SECTION 3: ADULTS ──────────────────────────────────────────── */}
        <section id="adults" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker learning-age" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                {copy("Взрослым")}</span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                {copy("АНГЛИЙСКИЙ ДЛЯ ВЗРОСЛЫХ")}</h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              {copy("Записаться на курс")}</a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            {copy("Практический разговорный и деловой английский для карьеры, релокации, путешествий и уверенного преодоления языкового барьера.")}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {ADULTS_PILLARS.map((p, i) => (
              <div
                key={i}
                className={`card surface-${p.color}`}
                style={{
                  padding: 'var(--sp-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sp-2)',
                  minHeight: '220px',
                  border: p.color === 'violet-light' ? '1px solid rgba(141, 59, 237, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={p.icon} size={24} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {copy(p.title)}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {copy(p.desc)}
                </p>
              </div>
            ))}
          </div>

          <CourseFacts items={[
            { label: 'Возраст', value: 'Взрослым' },
            { label: 'Формат', value: 'Онлайн и Офлайн' },
            { label: 'Размер группы', value: 'Индивидуально и в группе' },
            { label: 'Частота', value: '2–3 раза в неделю' },
          ]} />
        </section>

        {/* ─── SECTION 4: ONLINE FORMAT ───────────────────────────────────── */}
        <section data-program="online" id="online" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ background: 'var(--gl-violet-light)', borderRadius: 'var(--radius-2xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              {copy("Дистанционный формат")}</span>
            <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-3)' }}>
              {copy("ОНЛАЙН-ЗАНЯТИЯ")}</h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.8)', maxWidth: '42rem', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
              {copy("Живые интерактивные уроки с преподавателем из любой точки мира. Полноценная обратная связь, современные учебные материалы и гибкий график.")}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
              {ONLINE_BENEFITS.map((b, i) => (
                <div
                  key={i}
                  className={`card surface-${b.color}`}
                  style={{
                    padding: 'var(--sp-4) var(--sp-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-2)',
                    minHeight: '200px',
                    border: b.color === 'violet-light' ? '1px solid rgba(141, 59, 237, 0.2)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={b.icon} size={24} /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                    {copy(b.title)}
                  </h3>
                  <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                    {copy(b.desc)}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
              <div>
                <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block' }}>
                  {copy("Что нужно для подключения:")}</strong>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)' }}>
                  {copy("Ноутбук, планшет или ПК с камерой и микрофоном, стабильный доступ в интернет.")}</span>
              </div>
              <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                {copy("Попробовать онлайн")}</a>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: OFFLINE FORMAT ──────────────────────────────────── */}
        <section data-program="offline" id="offline" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ background: 'var(--gl-orange-light)', borderRadius: 'var(--radius-2xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', border: '1px solid rgba(242, 76, 10, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div>
                <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                  {copy("Очный формат")}</span>
                <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                  {copy("ОФЛАЙН-ОБУЧЕНИЕ В КЛАССАХ")}</h2>
              </div>
              <Link to="/branches" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                {copy("Выбрать филиал →")}</Link>
            </div>

            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.8)', maxWidth: '42rem', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
              {copy("Живое погружение в языковую среду в современных учебных центрах GL Study в Костанае, Рудном, Таразе, Астане и Алматы.")}</p>

            <CityPicker />
            <a href="#lead-form" className="study-button" data-program="offline" data-format="offline" data-cta="offline-free-trial">{copy("Записаться на бесплатный урок")}</a>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
              {OFFLINE_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className={`card surface-${f.color}`}
                  style={{
                    padding: 'var(--sp-4) var(--sp-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-2)',
                    minHeight: '200px',
                    border: f.color === 'violet-light' ? '1px solid rgba(141, 59, 237, 0.2)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}><Icon name={f.icon} size={24} /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                    {copy(f.title)}
                  </h3>
                  <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                    {copy(f.desc)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AdditionalLanguages />
        <TrialProcess />

        {/* ─── SECTION 7: FAQ ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--sp-12)' }}>
          <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-4)', textAlign: 'center' }}>
            {copy("ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ")}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxWidth: '48rem', margin: '0 auto' }}>
            {LEARNING_FAQ.map((faq, i) => (
              <div
                data-faq-item
                key={i}
                style={{
                  background: 'var(--gl-white)',
                  border: '1px solid rgba(141, 59, 237, 0.15)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden'
                }}
              >
                <button
                  data-faq-question
                  id={`learning-faq-${i}`}
                  aria-controls={`learning-faq-answer-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-4) var(--sp-5)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--gl-black)'
                  }}
                >
                  <span>{copy(faq.q)}</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--gl-violet)', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                    <Icon name="expand" />
                  </span>
                </button>
                <div data-faq-answer hidden={openFaq !== i} role="region" id={`learning-faq-answer-${i}`} aria-labelledby={`learning-faq-${i}`} style={{ padding: '0 var(--sp-5) var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6 }}>
                    {copy(faq.a)}
                  </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Trial lesson form */}
      <LeadFormSection />
    </InnerPageLayout>
  );
}
