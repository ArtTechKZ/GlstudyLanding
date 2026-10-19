import {CONTENT_REVISION} from './data/content';
import { useUi } from "./i18n/index";
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
const ProgrammePage = lazy(() => import('./pages/ProgrammePage'));
const CityPage = lazy(() => import('./pages/CityPage'));
const LegalDocumentPage = lazy(() => import('./pages/LegalDocumentPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const IeltsPage = lazy(() => import('./pages/IeltsPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const TravelPage = lazy(() => import('./pages/TravelPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import {localizedRoutes} from './config/locale-routes.js';
import type { ReactElement } from 'react';

export default function App() {
  const t = useUi();
  const pages: Record<string, ReactElement> = { home: <HomePage />, learning: <LearningPage />, ielts: <IeltsPage />, branches: <BranchesPage />, travelPrague: <TravelPage slug="europe-winter-2027" />, travelMalaysia: <TravelPage slug="malaysia" />, legal: <LegalPage />, online: <ProgrammePage kind="online" />, offline: <ProgrammePage kind="offline" />, children: <ProgrammePage kind="children" />, teens: <ProgrammePage kind="teens" />, adults: <ProgrammePage kind="adults" />, ieltsKostanay: <ExamPage />, privacyPolicy: <LegalDocumentPage kind="privacy" />, personalDataConsent: <LegalDocumentPage kind="consent" />, notFound: <NotFoundPage />, ...Object.fromEntries(["kostanay","rudny","taraz","astana","almaty"].map(city=>["city_"+city,<CityPage cityId={city} key={city}/>])) };
  return (
    <div data-content-revision={CONTENT_REVISION} className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Suspense fallback={<main id="main-content" aria-busy="true"><p role="status">{t("App.zagruzka.stranitsy")}</p></main>}><Routes>
          {localizedRoutes.map(route => <Route key={route.path} path={route.path} element={pages[route.seo]} />)}
          <Route path="*" element={<NotFoundPage />} />
        </Routes></Suspense>
      </div>
      <Footer />
    </div>
  );
}
