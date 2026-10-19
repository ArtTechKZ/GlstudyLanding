import { useCopy } from '../../i18n/copy';
import { sitePath } from '../../utils/sitePath';
import { COMPANY } from '../../data/company';
import './ReviewsSection.scss';

export default function ReviewsSection() {
  const copy = useCopy();
  return (
    <section className="reviews section" id="reviews" aria-labelledby="reviews-heading">
      <div className="container">
        <header className="reviews__header">
          <div className="reviews__tag-badge">
            <span className="reviews__tag-dot" aria-hidden="true" />
            {copy("О школе и сообществе")}</div>
          <h2 className="reviews__heading" id="reviews-heading">
            {copy("Отзывы")}
          </h2>
          <p className="reviews__sub">
            {copy("Языковая среда, где каждый студент находит мотивацию учиться, общаться и достигать амбициозных целей.")}</p>
        </header>

        {/* Brand community & values visual showcase */}
        <div className="reviews__showcase">
          {/* Card 1: Official Slogan & Brand Merch (Brandbook p. 43) */}
          <article className="reviews__card reviews__card--slogan gl-bg-pattern-gl-white">
            <div className="reviews__card-body">
              <span className="reviews__card-tag">{copy("Фирменный слоган")}</span>
              <h3 className="reviews__card-title" lang="ru" data-official-slogan>{copy("«Учись здесь, Живи везде!»")}</h3>
              <p className="reviews__card-text">
                {copy("Главная философия школы: английский — это не просто предмет, а универсальный инструмент свободы, карьеры и путешествий.")}</p>
              <div className="reviews__values-list">
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>{copy("Работаем с 2000 года")}</span>
                </div>
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>{copy("Более 10 000 обученных учеников")}</span>
                </div>
                <div className="reviews__val-item">
                  <span className="reviews__val-bullet" aria-hidden="true">★</span>
                  <span>{copy("Более 2 000 участников зарубежных программ")}</span>
                </div>
              </div>
            </div>
            <div className="reviews__card-media">
              <img
                src={sitePath('/images/home/brand-wristbands.webp')}
                alt={copy("Фирменные браслеты GL Study с надписью Учись здесь, Живи везде")}
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
              <span className="reviews__card-tag reviews__card-tag--violet">{copy("Сообщество выпускников")}</span>
              <h3 className="reviews__card-title reviews__card-title--dark">{copy("Языковые лагеря и проекты")}</h3>
              <p className="reviews__card-text reviews__card-text--dark">
                {copy("Бесплатный Speaking Club открыт для всех. Узнайте у менеджера о ближайшей встрече и присоединяйтесь к разговорной практике.")}</p>
              <div className="reviews__feedback-cta-box">
                <p className="reviews__feedback-cta-text">
                  {copy("Выпускник или родитель? Поделитесь своими впечатлениями об обучении в GL Study.")}</p>
                <a href={COMPANY.instagram} target="_blank" rel="noreferrer" className="btn btn-violet reviews__feedback-btn">
                  {copy("Открыть Instagram")}</a>
              </div>
            </div>
            <div className="reviews__card-media">
              <img
                src={sitePath('/images/home/camp-students.webp')}
                alt={copy("Ученики языкового лагеря GL Study")}
                className="reviews__card-img"
                width={800}
                height={1067}
                loading="lazy"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
