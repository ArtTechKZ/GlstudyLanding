import { useCopy } from '../../i18n/copy';
import Icon from './Icon';
import type { FaqItem } from '../../types';
import '../sections/FaqSection.scss';

// Native disclosure works with keyboard and in the SSG page without JavaScript.
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const copy = useCopy();
  return <div className="faq__list">{items.map(item => <details id={`faq-${item.id}`} className="faq__item" key={item.id}>
    <summary className="faq__question"><span>{copy(item.question)}</span><span className="faq__icon" aria-hidden="true"><Icon name="expand" /></span></summary>
    <div className="faq__answer"><p>{copy(item.answer)}</p></div>
  </details>)}</div>;
}
