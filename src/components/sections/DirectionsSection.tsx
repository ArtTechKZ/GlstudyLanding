import { sitePath } from '../../utils/sitePath';
import { Link } from 'react-router-dom';
import { DEMO_PROGRAMS } from '../../data/demo';
import './DirectionsSection.scss';

// Image assets mapping from official Brandbook GL STUDY 2026
const CARD_MEDIA: Record<string, { image: string; alt: string; bullet: string }> = {
  'english-children': {
    image: sitePath('/images/home/direction-kids.webp'),
    alt: 'Девочка в наушниках с планшетом — английский для детей',
    bullet: 'Увлекательные уроки в игровой форме',
  },
  'english-teens': {
    image: sitePath('/images/home/direction-teens.webp'),
    alt: 'Подросток с тетрадями — английский для подростков',
    bullet: 'Свободная речь и подготовка к карьере',
  },
  'english-adults': {
    image: sitePath('/images/home/direction-adults.webp'),
    alt: 'Студентка с ноутбуком — английский для взрослых',
    bullet: 'Для работы, путешествий и личного роста',
  },
  'ielts-prep': {
    image: sitePath('/images/home/ielts-target.webp'),
    alt: '3D мишень со стрелой — подготовка к IELTS',
    bullet: 'Стратегии всех 4 блоков экзамена',
  },
};

// Strict brand color assignments for the 7 programs
const CARD_COLORS: Record<string, string> = {
  'english-children':  'violet',
  'english-teens':     'orange',
  'english-adults':    'violet-light',
  'ielts-prep':        'orange-light',
  'online':            'violet',
  'offline':           'violet-light',
  'travel':            'orange',
};

function getProgramLink(progId: string): string {
  switch (progId) {
    case 'english-children':
      return '/learning#children';
    case 'english-teens':
      return '/learning#teens';
    case 'english-adults':
      return '/learning#adults';
    case 'ielts-prep':
      return '/ielts';
    case 'online':
      return '/learning#online';
    case 'offline':
      return '/learning#offline';
    case 'travel':
      return '/#travel';
    default:
      return '/learning';
  }
}

export default function DirectionsSection() {
  const programs = DEMO_PROGRAMS.filter(p => p.published);

  return (
    <section className="directions section" id="directions" aria-labelledby="directions-heading">
      <div className="container">
        {/* Brand header */}
        <header className="directions__header">
          <div>
            <div className="directions__tag-badge">
              <span className="directions__tag-dot" aria-hidden="true" />
              Программы обучения
            </div>
            <h2 className="directions__heading" id="directions-heading">
              НАПРАВЛЕНИЯ
              <br />
              <span className="directions__heading-accent">ОБУЧЕНИЯ</span>
              <br />
              В GL STUDY
            </h2>
          </div>
          <p className="directions__sub">
            Индивидуальные и групповые курсы английского языка для любого возраста и уровня —
            с акцентом на разговорную практику и уверенный результат.
          </p>
        </header>

        {/* Dynamic cards grid with genuine brandbook assets and textures */}
        <div className="directions__grid" role="list">
          {programs.map((prog, i) => {
            const color = CARD_COLORS[prog.id] ?? 'violet';
            const media = CARD_MEDIA[prog.id];
            const hasMedia = Boolean(media);
            const gridPatternClass = (color === 'violet' || color === 'orange')
              ? 'gl-bg-pattern-grid-white'
              : 'gl-bg-pattern-grid-violet';

            return (
              <article
                key={prog.id}
                className={`directions__card directions__card--${color} directions__card--pos-${i} ${gridPatternClass}${hasMedia ? ' directions__card--has-media' : ''}`}
                role="listitem"
              >
                <div className="directions__card-inner">
                  {/* Top row: Age badge + format */}
                  <div className="directions__card-top">
                    <span className="directions__card-age">{prog.ageRange}</span>
                    <span className="directions__card-format">
                      {prog.format === 'online' && '🖥 Онлайн'}
                      {prog.format === 'offline' && '🏫 Офлайн'}
                      {prog.format === 'hybrid' && '🖥 Онлайн + 🏫 Офлайн'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="directions__card-title">{prog.title}</h3>

                  {/* Short description */}
                  <p className="directions__card-desc">{prog.shortDesc}</p>

                  {/* Feature bullet with 3D pin icon */}
                  {media?.bullet && (
                    <div className="directions__card-bullet">
                      <img
                        src={sitePath('/images/home/brand-pin.webp')}
                        alt=""
                        className="directions__card-pin-icon"
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                      <span>{media.bullet}</span>
                    </div>
                  )}

                  {/* Optional cutout character illustration from Brandbook */}
                  {hasMedia && (
                    <div className="directions__card-media" aria-hidden="true">
                      <img
                        src={media.image}
                        alt={media.alt}
                        className="directions__card-img"
                        width={240}
                        height={320}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="directions__card-actions">
                    <Link
                      to={getProgramLink(prog.id)}
                      className="directions__card-link"
                    >
                      Подробнее →
                    </Link>
                    <a
                      href="#lead-form"
                      className="btn directions__card-cta"
                    >
                      Записаться
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
