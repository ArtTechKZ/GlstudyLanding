import { useState, useId } from 'react';
import { useCityContext } from '../../hooks/useCityContext';
import './LeadFormSection.scss';

const CONSENT_VERSION = '1.0-demo';

interface FormState {
  name: string;
  phone: string;
  ageGroup: string;
  program: string;
  format: string;
  channel: string;
  comment: string;
  consent: boolean;
}

const INITIAL_STATE: FormState = {
  name: '', phone: '', ageGroup: '', program: '', format: '', channel: '', comment: '', consent: false
};

export default function LeadFormSection() {
  const { selectedCity } = useCityContext();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formId = useId();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Введите имя';
    if (!form.phone.trim()) errs.phone = 'Введите номер телефона';
    else if (!/^\+?[0-9\s\-()]{7,15}$/.test(form.phone.trim())) errs.phone = 'Некорректный номер';
    if (!form.consent) errs.consent = 'Необходимо дать согласие';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    alert(`Демонстрационный режим (согласие v${CONSENT_VERSION}):\nФорма корректна, но приём заявок не подключён.`);
  };

  return (
    <section className="lead-form section gl-bg-pattern-grid-white" id="lead-form" aria-labelledby="lead-form-heading">
      <div className="container">
        <div className="lead-form__layout">
          {/* Left poster column */}
          <div className="lead-form__poster">
            <div className="lead-form__tag">
              <span className="lead-form__tag-dot" aria-hidden="true" />
              Первый шаг бесплатно
            </div>

            <h2 className="lead-form__heading" id="lead-form-heading">
              ПОЛУЧИ
              <br />
              <span className="lead-form__heading-brand">БЕСПЛАТНЫЙ</span>
              <br />
              ПРОБНЫЙ УРОК
            </h2>

            <p className="lead-form__poster-desc">
              Заполни форму — мы свяжемся с вами, определим текущий уровень языка и согласуем удобное время вводного урока.
            </p>

            {/* Poster benefit bullets */}
            <div className="lead-form__benefits">
              <div className="lead-form__benefit-item">
                <img
                  src="/images/home/brand-pin.webp"
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>Тестирование уровня и персональные рекомендации</span>
              </div>
              <div className="lead-form__benefit-item">
                <img
                  src="/images/home/brand-pin.webp"
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>Знакомство с преподавателем и методикой GL Study</span>
              </div>
              <div className="lead-form__benefit-item">
                <img
                  src="/images/home/brand-pin.webp"
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>Без обязательств: выбор формата онлайн или в филиале</span>
              </div>
            </div>

            <div className="lead-form__poster-city">
              📍 Выбранный город: {selectedCity.name}
            </div>

            <div className="lead-form__demo-note" role="note">
              ⚠️ Демонстрационный режим — заявки не отправляются.
            </div>
          </div>

          {/* Right form panel */}
          <div className="lead-form__form-col">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="lead-form__form"
              aria-label="Форма заявки на бесплатный урок"
            >
              {/* Name */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-name`} className="lead-form__label">
                  Имя <span className="lead-form__required" aria-label="обязательное поле">*</span>
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  className={`lead-form__input${errors.name ? ' is-error' : ''}`}
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                />
                {errors.name && (
                  <span id={`${formId}-name-error`} className="lead-form__error" role="alert">
                    <span aria-hidden="true">⚠️</span> {errors.name}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-phone`} className="lead-form__label">
                  Телефон <span className="lead-form__required" aria-label="обязательное поле">*</span>
                </label>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+7 (___) ___-__-__"
                  className={`lead-form__input${errors.phone ? ' is-error' : ''}`}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-required="true"
                  aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
                />
                {errors.phone && (
                  <span id={`${formId}-phone-error`} className="lead-form__error" role="alert">
                    <span aria-hidden="true">⚠️</span> {errors.phone}
                  </span>
                )}
              </div>

              {/* Age group */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-age`} className="lead-form__label">Возраст ученика</label>
                <select id={`${formId}-age`} name="ageGroup" value={form.ageGroup} onChange={handleChange} className="lead-form__select">
                  <option value="">Выбрать возраст</option>
                  <option value="children">Дети (5–9 лет)</option>
                  <option value="teens">Подростки (10–17 лет)</option>
                  <option value="adults">Взрослые (18+)</option>
                </select>
              </div>

              {/* Program */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-program`} className="lead-form__label">Направление</label>
                <select id={`${formId}-program`} name="program" value={form.program} onChange={handleChange} className="lead-form__select">
                  <option value="">Выбрать программу</option>
                  <option value="english-children">Английский для детей</option>
                  <option value="english-teens">Английский для подростков</option>
                  <option value="english-adults">Английский для взрослых</option>
                  <option value="ielts-prep">Подготовка к IELTS</option>
                  <option value="travel">Зарубежные каникулы</option>
                </select>
              </div>

              {/* Format */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-format`} className="lead-form__label">Формат</label>
                <select id={`${formId}-format`} name="format" value={form.format} onChange={handleChange} className="lead-form__select">
                  <option value="">Выбрать формат</option>
                  <option value="online">Онлайн</option>
                  <option value="offline">Офлайн</option>
                </select>
              </div>

              {/* Contact channel */}
              <div className="lead-form__field">
                <label htmlFor={`${formId}-channel`} className="lead-form__label">Предпочтительная связь</label>
                <select id={`${formId}-channel`} name="channel" value={form.channel} onChange={handleChange} className="lead-form__select">
                  <option value="">Выбрать способ</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Звонок</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>

              {/* Comment */}
              <div className="lead-form__field lead-form__field--full">
                <label htmlFor={`${formId}-comment`} className="lead-form__label">Комментарий</label>
                <textarea
                  id={`${formId}-comment`}
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Дополнительные пожелания..."
                  className="lead-form__textarea"
                />
              </div>

              {/* Consent — unchecked by default, required */}
              <div className="lead-form__field lead-form__field--full">
                <label className={`lead-form__consent${errors.consent ? ' is-error' : ''}`}>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    className="lead-form__consent-check"
                    aria-required="true"
                    aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                  />
                  <span className="lead-form__consent-text">
                    Я согласен(а) на{' '}
                    <a href="/legal#consent" target="_blank" rel="noopener noreferrer" className="lead-form__consent-link">
                      обработку персональных данных
                    </a>{' '}
                    в соответствии с{' '}
                    <a href="/legal#privacy" target="_blank" rel="noopener noreferrer" className="lead-form__consent-link">
                      политикой конфиденциальности
                    </a>
                  </span>
                </label>
                {errors.consent && (
                  <span id={`${formId}-consent-error`} className="lead-form__error" role="alert">
                    <span aria-hidden="true">⚠️</span> {errors.consent}
                  </span>
                )}
              </div>

              <div className="lead-form__field lead-form__field--full">
                <button type="submit" className="btn btn-primary lead-form__submit">
                  Получить бесплатный урок
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
