import { useCopy } from '../../i18n/copy';
import FaqAccordion from '../ui/FaqAccordion';
import WhatsAppLink from '../ui/WhatsAppLink';
import { DEMO_FAQ } from '../../data/demo';
import './FaqSection.scss';

export default function FaqSection() {
  const copy = useCopy();
  return (
    <section className="faq section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq__layout">
          <div className="faq__heading-col">
            <h2 className="faq__heading" id="faq-heading">
              {copy("Часто")}<br />
              <span className="faq__heading-accent">{copy("задаваемые")}</span>
              <br />
              {copy("вопросы")}</h2>
            <p className="faq__sub">
              {copy("Не нашли ответ? Задайте вопрос — мы свяжемся.")}</p>
            <WhatsAppLink kind="general" className="btn btn-primary faq__cta" cta="faq-question">
              {copy("Задать вопрос в WhatsApp")}</WhatsAppLink>
          </div>

          <div className="faq__items">
            <FaqAccordion items={DEMO_FAQ} />
          </div>
        </div>
      </div>
    </section>
  );
}
