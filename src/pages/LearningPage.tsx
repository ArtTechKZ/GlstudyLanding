import { sitePath } from '../utils/sitePath';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import LeadFormSection from '../components/sections/LeadFormSection';
import { SEO_METADATA } from '../data/seo';

const JUMP_LINKS = [
  { label: '👶 Детям (5–9)', href: '#children' },
  { label: '🎒 Подросткам (10–17)', href: '#teens' },
  { label: '💼 Взрослым (18+)', href: '#adults' },
  { label: '🖥️ Онлайн в Zoom', href: '#online' },
  { label: '🏫 Офлайн в классах', href: '#offline' },
];

const CHILDREN_PILLARS = [
  { icon: '🎨', title: 'Игровая методика', desc: 'Учим слова через песни, ассоциации и интерактивные игры без стресса и оценок.', color: 'orange' },
  { icon: '🗣️', title: 'Разговорная речь', desc: 'С первых уроков дети начинают здороваться, задавать вопросы и отвечать на английском.', color: 'violet' },
  { icon: '🧩', title: 'Логика и моторика', desc: 'Развиваем образное мышление, фонематический слух и правильное произношение.', color: 'violet-light' }
];

const TEENS_PILLARS = [
  { icon: '📱', title: 'Актуальные темы', desc: 'Обсуждаем технологии, социальные сети, музыку, путешествия и популярную культуру.', color: 'violet-light' },
  { icon: '🚀', title: 'Проектная работа', desc: 'Создаем презентации, дебаты и командные исследования на английском языке.', color: 'orange' },
  { icon: '🎓', title: 'Подготовка к будущему', desc: 'Формируем академическую базу для сдачи экзаменов и поступления в зарубежные вузы.', color: 'violet' }
];

const ADULTS_PILLARS = [
  { icon: '💼', title: 'Деловой и разговорный', desc: 'Фокус на рабочих сценариях: переписка, переговоры, презентации и неформальный small talk.', color: 'violet' },
  { icon: '⏱️', title: 'Гибкое расписание', desc: 'Утренние и вечерние группы, возможность онлайн-подключения и индивидуальные слоты.', color: 'violet-light' },
  { icon: '📈', title: 'Четкие уровни (CEFR)', desc: 'От A1 (Beginner) до C1 (Advanced) с контрольным тестированием каждые 2 месяца.', color: 'orange' }
];

const ONLINE_BENEFITS = [
  { icon: '🖥️', title: 'Живые занятия в Zoom', desc: 'Преподаватель в реальном времени ведет диалог, исправляет произношение и вовлекает каждого ученика.', color: 'violet' },
  { icon: '📊', title: 'Интерактивная доска и квизы', desc: 'Игровые викторины, парная работа в сессионных залах Zoom и интерактивные упражнения.', color: 'orange' },
  { icon: '⚡', title: 'Удобство и экономия времени', desc: 'Учитесь из дома или в поездках. Нужен только ноутбук или планшет со стабильным интернетом.', color: 'violet-light' }
];

const OFFLINE_FEATURES = [
  { icon: '🏫', title: 'Современные аудитории', desc: 'Уютные классы, оборудованные мультимедийными панелями, интерактивными материалами и зонами отдыха.', color: 'violet' },
  { icon: '🗣️', title: 'Полное погружение в язык', desc: 'Уроки проходят преимущественно на английском. Живой диалог со сверстниками разрушает языковой барьер.', color: 'orange' },
  { icon: '👥', title: 'Командные проекты и клубы', desc: 'Настольные игры на английском, киноклубы по выходным и разговорные клубы с носителями.', color: 'violet-light' }
];

const LEARNING_FAQ = [
  {
    q: 'Как проходит бесплатный пробный урок?',
    a: 'На пробном уроке преподаватель знакомится со студентом, определяет точный уровень владения языком и рекомендует подходящую программу и формат.'
  },
  {
    q: 'Что нужно для онлайн-занятий в Zoom?',
    a: 'Ноутбук, планшет или компьютер с камерой, микрофоном и стабильное интернет-соединение от 10 Мбит/с. Ссылки на уроки отправляются в личный чат.'
  },
  {
    q: 'Сколько человек в группе?',
    a: 'Группы формируются компактными: 4–8 человек для детей и онлайн-форматов, 6–10 человек для подростков. Каждый студент получает достаточно разговорной практики.'
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <InnerPageLayout
      title="КУРСЫ АНГЛИЙСКОГО ЯЗЫКА"
      subtitle="Программы обучения для всех возрастов: дети, подростки и взрослые. Интерактивные занятия в Zoom и живые группы в комфортных филиалах."
      accentWord="ОБУЧЕНИЕ"
      tag="Все программы GL Study"
      heroColor="violet"
      seo={SEO_METADATA.learning}
      breadcrumbs={[{ label: 'Обучение' }]}
    >
      <div className="container">

        {/* Quick jump anchor navigation */}
        <nav aria-label="Быстрая навигация по программам" style={{ marginBottom: 'var(--sp-8)' }}>
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
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ─── SECTION 1: CHILDREN ────────────────────────────────────────── */}
        <section id="children" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                5–9 лет
              </span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                АНГЛИЙСКИЙ ДЛЯ ДЕТЕЙ
              </h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              Записать ребёнка
            </a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            Занятия в игровой форме для малышей. Развиваем речь, слух и любовь к языку с первых уроков без стресса, скучных правил и школьных отметок.
          </p>

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
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{p.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Course passport */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-2)' }}>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Возраст</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>5–9 лет</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Формат</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>Онлайн и Офлайн</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Размер группы</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>4–8 детей</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Длительность</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>45–60 мин</strong>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: TEENS ───────────────────────────────────────────── */}
        <section id="teens" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                10–17 лет
              </span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                АНГЛИЙСКИЙ ДЛЯ ПОДРОСТКОВ
              </h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              Записать подростка
            </a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            Современная программа для тех, кто хочет свободно общаться, путешествовать, уверенно сдать школьные экзамены и подготовиться к международным тестам.
          </p>

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
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{p.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Course passport */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-2)' }}>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Возраст</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>10–17 лет</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Формат</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>Онлайн и Офлайн</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Размер группы</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>6–10 студентов</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Длительность</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>60–80 мин</strong>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: ADULTS ──────────────────────────────────────────── */}
        <section id="adults" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div>
              <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                18+ лет
              </span>
              <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                АНГЛИЙСКИЙ ДЛЯ ВЗРОСЛЫХ
              </h2>
            </div>
            <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              Записаться на курс
            </a>
          </div>

          <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.75)', maxWidth: '42rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            Практический разговорный и деловой английский для карьеры, релокации, путешествий и уверенного преодоления языкового барьера.
          </p>

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
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{p.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Course passport */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-2)' }}>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Возраст</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>18+ лет</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Формат</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>Онлайн и Офлайн</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Размер группы</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>Мини-группы / Duo</strong>
            </div>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-3) var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-violet)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Длительность</span>
              <strong style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}>60–90 мин</strong>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: ONLINE FORMAT ───────────────────────────────────── */}
        <section id="online" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ background: 'var(--gl-violet-light)', borderRadius: 'var(--radius-2xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', border: '1px solid rgba(141, 59, 237, 0.15)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              Дистанционный формат
            </span>
            <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-3)' }}>
              ОНЛАЙН-ОБУЧЕНИЕ В ZOOM
            </h2>
            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.8)', maxWidth: '42rem', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
              Живые интерактивные уроки с преподавателем из любой точки мира. Полноценная обратная связь, современные учебные материалы и гибкий график.
            </p>

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
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{b.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                    {b.title}
                  </h3>
                  <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--gl-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-4) var(--sp-5)', border: '1px solid rgba(141, 59, 237, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
              <div>
                <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', textTransform: 'uppercase', display: 'block' }}>
                  Что нужно для подключения:
                </strong>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)' }}>
                  Ноутбук, планшет или ПК с камерой и микрофоном, интернет от 10 Мбит/с.
                </span>
              </div>
              <a href="#lead-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                Попробовать онлайн
              </a>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: OFFLINE FORMAT ──────────────────────────────────── */}
        <section id="offline" style={{ marginBottom: 'var(--sp-12)', scrollMarginTop: '100px' }}>
          <div style={{ background: 'var(--gl-orange-light)', borderRadius: 'var(--radius-2xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', border: '1px solid rgba(242, 76, 10, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div>
                <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
                  Очный формат
                </span>
                <h2 className="section-heading" style={{ color: 'var(--gl-black)', margin: 0 }}>
                  ОФЛАЙН-ОБУЧЕНИЕ В КЛАССАХ
                </h2>
              </div>
              <Link to="/branches" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                Смотреть адреса филиалов →
              </Link>
            </div>

            <p style={{ fontSize: 'var(--fs-body)', color: 'rgba(0,0,0,0.8)', maxWidth: '42rem', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
              Живое погружение в языковую среду в современных учебных центрах GL Study в Алматы, Астане и Костанае.
            </p>

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
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, opacity: 0.9 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: HOW TO START (3 STEPS) ──────────────────────────── */}
        <section style={{ marginBottom: 'var(--sp-12)' }}>
          <div style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto var(--sp-6)' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)', marginBottom: 'var(--sp-2)' }}>
              Простой старт
            </span>
            <h2 className="section-heading" style={{ color: 'var(--gl-black)' }}>
              3 ШАГА ДО РЕЗУЛЬТАТА
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-3)' }}>
            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-2xl)', padding: 'var(--sp-5)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                01
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Диагностика уровня
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Короткий тест и беседа с методистом позволяют точно определить текущий уровень владения языком.
              </p>
            </div>

            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-2xl)', padding: 'var(--sp-5)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-violet)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                02
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Бесплатный пробный урок
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Знакомство с преподавателем, платформой и форматом занятий без оплаты и обязательств.
              </p>
            </div>

            <div style={{ background: 'var(--gl-white)', border: '1px solid rgba(141, 59, 237, 0.15)', borderRadius: 'var(--radius-2xl)', padding: 'var(--sp-5)' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '2.5rem', color: 'var(--gl-orange)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
                03
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Подбор группы и старт
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                Подбираем комфортное расписание и группу вашего уровня в онлайн-формате или ближайшем филиале.
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7: FAQ ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--sp-12)' }}>
          <h2 className="section-heading" style={{ color: 'var(--gl-black)', marginBottom: 'var(--sp-4)', textAlign: 'center' }}>
            ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxWidth: '48rem', margin: '0 auto' }}>
            {LEARNING_FAQ.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--gl-white)',
                  border: '1px solid rgba(141, 59, 237, 0.15)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden'
                }}
              >
                <button
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
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--gl-violet)', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 var(--sp-5) var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
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
