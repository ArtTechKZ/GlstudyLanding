import { useState } from 'react';
import { DEMO_FAQ } from '../../data/demo';
import './FaqSection.scss';

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section className="faq section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq__layout">
          <div className="faq__heading-col">
            <h2 className="faq__heading" id="faq-heading">
              Часто
              <br />
              <span className="faq__heading-accent">задаваемые</span>
              <br />
              вопросы
            </h2>
            <p className="faq__sub">
              Не нашли ответ? Задайте вопрос — мы свяжемся.
            </p>
            <a href="#lead-form" className="btn btn-primary faq__cta">
              Задать вопрос
            </a>
          </div>

          <div className="faq__items">
            <dl className="faq__list">
              {DEMO_FAQ.map(item => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                    <dt>
                      <button
                        className="faq__question"
                        onClick={() => toggle(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${item.id}`}
                        id={`faq-btn-${item.id}`}
                      >
                        <span>{item.question}</span>
                        <span className="faq__icon" aria-hidden="true">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                    </dt>
                    <dd
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${item.id}`}
                      hidden={!isOpen}
                      className="faq__answer"
                    >
                      <p>{item.answer}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
