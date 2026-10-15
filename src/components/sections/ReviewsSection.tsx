import './ReviewsSection.scss';

export default function ReviewsSection() {
  return (
    <section className="reviews section" id="reviews" aria-labelledby="reviews-heading">
      <div className="container">
        <header className="reviews__header">
          <div className="reviews__tag-badge">
            <span className="reviews__tag-dot" aria-hidden="true" />
            О школе и сообществе
          </div>
          <h2 className="reviews__heading" id="reviews-heading">
            ЖИЗНЬ
            <br />
            <span className="reviews__heading-accent">GL STUDY</span>
          </h2>
          <p className="reviews__sub">
            Языковая среда, где каждый студент находит мотивацию учиться, общаться и достигать амбициозных целей.
          </p>
        </header>

        {/* Brand community & values visual showcase */}
        <div className="reviews__showcase">
          {/* Card 1: Official Slogan & Brand Merch (Brandbook p. 43) */}
          <article className="reviews__card reviews__card--slogan gl-bg-pattern-gl-white">
            <div className="reviews__card-body">
              <span className="reviews__card-tag">Фирменный слоган</span>
              <h3 className="reviews__card-title">«Учись здесь, Живи везде!»</h3>
              <p className="reviews__card-text">
                Главная философия школы: английский — это не просто предмет, а универсальный инструмент свободы, карьеры и путешествий.
              </p>
              <div className="reviews__values-list">
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>10+ лет опыта в Казахстане</span>
                </div>
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>Живое общение с 1-го занятия</span>
                </div>
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>Филиалы в Алматы, Астане и Костанае</span>
                </div>
              </div>
            </div>
            <div className="reviews__card-media">
              <img
                src="/images/home/brand-wristbands.webp"
                alt="Фирменные браслеты GL Study с надписью Учись здесь, Живи везде"
                className="reviews__card-img"
                width={800}
                height={640}
                loading="lazy"
              />
            </div>
          </article>

          {/* Card 2: Students & Camp Community (Brandbook p. 23) */}
          <article className="reviews__card reviews__card--community gl-bg-pattern-grid-violet">
            <div className="reviews__card-body">
              <span className="reviews__card-tag reviews__card-tag--violet">Сообщество выпускников</span>
              <h3 className="reviews__card-title reviews__card-title--dark">Языковые лагеря и проекты</h3>
              <p className="reviews__card-text reviews__card-text--dark">
                Студенты GL Study ежегодно участвуют в зарубежных программах, интенсивных разговорных клубах и готовятся к поступлению в ведущие вузы.
              </p>
              <div className="reviews__feedback-cta-box">
                <p className="reviews__feedback-cta-text">
                  Выпускник или родитель? Поделитесь своими впечатлениями об обучении в GL Study.
                </p>
                <a href="#lead-form" className="btn btn-violet reviews__feedback-btn">
                  Оставить отзыв
                </a>
              </div>
            </div>
            <div className="reviews__card-media">
              <img
                src="/images/home/camp-students.webp"
                alt="Ученики языкового лагеря GL Study"
                className="reviews__card-img"
                width={800}
                height={640}
                loading="lazy"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
