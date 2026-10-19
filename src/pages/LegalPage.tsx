import {Link} from '../i18n/Link';
import {useUi} from '../i18n';
import {useLocale,useHydratedUrlPart} from '../i18n/locale-context';
import {Link as RouterLink} from 'react-router-dom';
import { useCopy } from '../i18n/copy';
import Icon from '../components/ui/Icon';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InnerPageLayout from '../components/layout/InnerPageLayout';
import { SEO_METADATA } from '../data/seo';

export default function LegalPage() {
  const copy = useCopy(),t=useUi(),{locale}=useLocale();
  const { hash } = useLocation();
  const sourceHash=useHydratedUrlPart(hash);

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  if(locale!=='ru')return <InnerPageLayout title={t('Legal.localTitle')} subtitle={t('Legal.localNotice')} tag="GL Study" heroColor="violet" seo={SEO_METADATA.legal} breadcrumbs={[{label:t('Legal.localTitle')}]}><div className="container study-panel" id="privacy" data-legal-notice><p id="consent">{t('Legal.localNotice')}</p><RouterLink className="study-button" to={'/legal'+sourceHash} hrefLang="ru" data-legal-source>{t('Legal.russianSource')}</RouterLink></div></InnerPageLayout>;
  return (
    <InnerPageLayout
      title={copy("ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ")}
      subtitle={copy("Политика конфиденциальности и Согласие на обработку персональных данных")}
      accentWord={copy("ИНФОРМАЦИЯ")}
      tag={copy("Документы • GL Study")}
      heroColor="violet"
      seo={SEO_METADATA.legal}
      breadcrumbs={[
        { label: 'Юридические документы' }
      ]}
    >
      <div className="container legal-documents" style={{ maxWidth: '900px', lineHeight: 1.7, color: 'var(--gl-black)', paddingBottom: 'var(--sp-8)' }}>

        <nav className="full-links"><Link to="/privacy-policy">{t("Full.privacy")}</Link><Link to="/personal-data-consent">{t("Full.consent")}</Link></nav>
        {/* Quick jump anchor navigation */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: 'var(--sp-6)',
            padding: '1rem',
            background: 'var(--gl-violet-light)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(141, 59, 237, 0.2)'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--gl-violet)', alignSelf: 'center', marginRight: '0.5rem' }}>
            {copy("Разделы страницы:")}</span>
          <a
            href="#privacy"
            className="btn btn-sm btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Icon name="document" size={18} /> {copy(" 1. Политика конфиденциальности")}</a>
          <a
            href="#consent"
            className="btn btn-sm btn-violet"
            style={{ textDecoration: 'none' }}
          >
            <Icon name="writing" size={18} /> {copy(" 2. Согласие на обработку персональных данных")}</a>
        </div>

        {/* Official legal notice disclaimer */}
        <div
          style={{
            background: 'var(--gl-orange-light)',
            border: '1px solid var(--gl-orange)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            marginBottom: 'var(--sp-6)',
            color: 'var(--gl-black)'
          }}
        >
          <strong style={{ color: 'var(--gl-violet)', display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>
            {copy("Обратите внимание (Юридический статус редакции):")}</strong>
          <span style={{ fontSize: 'var(--fs-sm)' }}>
            {copy("Тексты документов, представленные ниже, являются структурными образцами (версия 1.0-demo). Окончательная юридическая редакция подлежит согласованию и утверждению руководством компании GL Study и юристом в соответствии с Законом Республики Казахстан «О персональных данных и их защите» перед официальным публичным запуском сайта.")}</span>
        </div>

        {/* Document 1: Privacy Policy */}
        <section
          id="privacy"
          style={{
            background: 'var(--gl-white)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--sp-6)',
            marginBottom: 'var(--sp-6)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)' }}>
              {copy("Документ № 1")}</span>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-black)' }}>
              {copy("Якорь для прямых ссылок: #privacy")}</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h2)', textTransform: 'uppercase', color: 'var(--gl-violet)', marginBottom: '1.5rem' }}>
            {copy("Политика конфиденциальности")}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("1. Общие положения")}</h3>
              <p style={{ margin: 0 }}>
                {copy("Настоящая Политика конфиденциальности определяет порядок сбора, обработки, хранения и защиты персональных данных физических лиц, пользующихся сайтом и услугами языкового центра GL Study.")}</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("2. Состав собираемых данных")}</h3>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                {copy("В рамках отправки формы заявки на бесплатный пробный урок и консультации могут запрашиваться следующие данные:")}</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                <li>{copy("Имя учащегося или законного представителя")}</li>
                <li>{copy("Контактный номер телефона (WhatsApp / звонки)")}</li>
                <li>{copy("Город проживания и предпочтительный филиал / онлайн-формат")}</li>
                <li>{copy("Возрастная категория учащегося: дети с 6 лет, подростки и взрослые")}</li>
                <li>{copy("Выбранное направление обучения (общий английский, подготовка к IELTS, зарубежные программы)")}</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("3. Цели обработки персональных данных")}</h3>
              <p style={{ margin: 0 }}>
                {copy("Предоставленные данные используются исключительно в целях обратной связи с пользователем, согласования даты и времени бесплатного пробного урока, консультации по выбору программы обучения и информирования об изменениях в расписании.")}</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("4. Меры по обеспечению безопасности данных")}</h3>
              <p style={{ margin: 0 }}>
                {copy("GL Study принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования и распространения третьими лицами.")}</p>
            </div>
          </div>
        </section>

        {/* Document 2: Personal Data Consent */}
        <section
          id="consent"
          style={{
            background: 'var(--gl-white)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--sp-6)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span className="sticker" style={{ borderColor: 'var(--gl-violet)', color: 'var(--gl-violet)' }}>
              {copy("Документ № 2")}</span>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--gl-black)' }}>
              {copy("Якорь для прямых ссылок: #consent")}</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h2)', textTransform: 'uppercase', color: 'var(--gl-violet)', marginBottom: '1.5rem' }}>
            {copy("Согласие на обработку персональных данных")}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("1. Предмет согласия")}</h3>
              <p style={{ margin: 0 }}>
                {copy("Отправляя форму заявки на сайте GL Study и проставляя соответствующую отметку (чекбокс согласия), пользователь свободно, своей волей и в своем интересе дает информированное согласие оператору сайта на сбор, накопление, хранение, уточнение (обновление, изменение), использование и уничтожение своих персональных данных в соответствии с Законом РК «О персональных данных и их защите».")}</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("2. Перечень персональных данных, на обработку которых дается согласие")}</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                <li>{copy("Фамилия, имя, отчество субъекта персональных данных или законного представителя")}</li>
                <li>{copy("Контактный номер мобильного телефона")}</li>
                <li>{copy("Город и выбранный филиал / дистанционный (онлайн) формат обучения")}</li>
                <li>{copy("Возрастная группа или класс учащегося")}</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("3. Способы обработки и третьи лица")}</h3>
              <p style={{ margin: 0 }}>
                {copy("Обработка данных может осуществляться с использованием средств автоматизации либо без них. Данные не передаются третьим лицам в рекламных целях. Доступ к данным имеют только уполномоченные сотрудники образовательного центра GL Study.")}</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gl-black)' }}>
                {copy("4. Срок действия согласия и порядок его отзыва")}</h3>
              <p style={{ margin: 0 }}>
                {copy("Настоящее согласие вступает в силу с момента отправки заявки на сайте и действует до момента достижения целей обработки либо до дня отзыва согласия субъектом персональных данных путем направления соответствующего письменного обращения на контактный email или в офис образовательного центра GL Study.")}</p>
            </div>
          </div>
        </section>

      </div>
    </InnerPageLayout>
  );
}

