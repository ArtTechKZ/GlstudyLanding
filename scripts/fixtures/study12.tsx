import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {UiProvider} from '../../src/i18n';
import {ru} from '../../src/i18n/ru';
import {CityProvider} from '../../src/hooks/useCityContext';
import {PrivacyProvider} from '../../src/features/privacy';
import {LeadProvider} from '../../src/features/leads';
import LeadActions from '../../src/features/LeadActions';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import DirectionsSection from '../../src/components/sections/DirectionsSection';
import '../../src/styles/global.scss';
import '../../src/styles/study.scss';
const messages=Object.fromEntries(Object.entries(ru).map(([key,value])=>[key,'Удлинённая тестовая подпись — '+value+' — дополнительный текст']));
// Isolated development fixture; no locale, catalog or pseudo copy is imported by
// the app entry, SSG, sitemap or production routes.
export function Fixture(){return <BrowserRouter><UiProvider messages={messages}><CityProvider><PrivacyProvider><LeadProvider><LeadActions><Header/><main id="main-content"><DirectionsSection/></main><Footer/></LeadActions></LeadProvider></PrivacyProvider></CityProvider></UiProvider></BrowserRouter>}
createRoot(document.getElementById('root')!).render(<Fixture/>);
