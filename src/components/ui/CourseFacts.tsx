import { useCopy } from '../../i18n/copy';
import './CourseFacts.scss';

interface CourseFact {
  label: string;
  value: string;
}

export default function CourseFacts({ items }: { items: readonly CourseFact[] }) {
  const copy = useCopy();
  return (
    <dl className="course-facts">
      {items.map(({ label, value }) => (
        <div className="course-facts__item" key={label}>
          <dt className="course-facts__label">{copy(label)}</dt>
          <dd className="course-facts__value">{copy(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
