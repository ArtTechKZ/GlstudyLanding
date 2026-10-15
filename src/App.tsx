import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LearningPage from './pages/LearningPage';
import IeltsPage from './pages/IeltsPage';
import BranchesPage from './pages/BranchesPage';
import TravelPage from './pages/TravelPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/ielts" element={<IeltsPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/travel/europe-winter-2027" element={<TravelPage slug="europe-winter-2027" />} />
          <Route path="/travel/malaysia" element={<TravelPage slug="malaysia" />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
