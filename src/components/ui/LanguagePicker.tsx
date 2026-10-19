import {useLocation} from 'react-router-dom';
import {useLocale,useHydratedUrlPart} from '../../i18n/locale-context';
import {useUi} from '../../i18n';
import {locales,localizedPath} from '../../config/locale-routes.js';
const names={ru:'Русский',kk:'Қазақша',en:'English'};
export default function LanguagePicker(){
 const language=useLocale(),t=useUi(),location=useLocation();
 const suffix=useHydratedUrlPart(location.search+location.hash);
 return <div className="gl-header__lang" aria-label={t('Header.yazyk')} aria-busy={!!language.loading}>{locales.map(locale=><a key={locale} href={import.meta.env.BASE_URL+localizedPath(location.pathname,locale).slice(1)+suffix} data-locale={locale} lang={locale} className={`gl-header__lang-btn${language.locale===locale?' gl-header__lang-btn--active':''}`} aria-current={language.locale===locale?'page':undefined} aria-disabled={!language.available.includes(locale)||undefined} aria-label={t('Language.switch',{language:names[locale]})} onClick={e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();language.selectLocale(locale)}}>{locale==='kk'?'ҚАЗ':locale.toUpperCase()}</a>)}<span className="sr-only" role="status">{language.failed?t('Language.loadFailed'):language.loading?t('Language.loading'):''}</span></div>;
}
