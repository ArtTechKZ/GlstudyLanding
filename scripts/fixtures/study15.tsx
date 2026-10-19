import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {UiProvider} from '../../src/i18n';
import {contentRu} from '../../src/i18n/content-ru';
import type {UiMessages} from '../../src/i18n';
import {useLocale} from '../../src/i18n/locale-context';
import {CityProvider} from '../../src/hooks/useCityContext';
import {PrivacyProvider} from '../../src/features/privacy';
import {LeadProvider} from '../../src/features/leads';
import LeadActions from '../../src/features/LeadActions';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import HomePage from '../../src/pages/HomePage';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
const contentKey=(value:string)=>Object.entries(contentRu).find(([,v])=>v===value)![0];
// DRAFT, internal fixture only: partial synthetic translations, never a release.
const drafts:Partial<Record<'kk'|'en',UiMessages>>={
 kk:{'Header.obuchenie':'DRAFT Қазақша оқу','LeadFormSection.imya':'DRAFT Атыңыз *',[contentKey('ПОСТУПЛЕНИЕ ЗА РУБЕЖ')]:'DRAFT ШЕТЕЛДЕ ОҚУ'},
 en:{'Header.obuchenie':'DRAFT Learning','LeadFormSection.imya':'DRAFT Name *',[contentKey('ПОСТУПЛЕНИЕ ЗА РУБЕЖ')]:'DRAFT STUDY ABROAD'}
};
export function State(){const {locale,draft}=useLocale();return <output id="qa-locale">{locale}:{draft?'DRAFT':'RU'}</output>}
createRoot(document.getElementById('root')!).render(<BrowserRouter><UiProvider draftCatalogs={drafts}><CityProvider><PrivacyProvider><LeadProvider><LeadActions><p>DRAFT — internal localization fixture, not approved translations</p><State/><Header/><HomePage/><Footer/></LeadActions></LeadProvider></PrivacyProvider></CityProvider></UiProvider></BrowserRouter>);
