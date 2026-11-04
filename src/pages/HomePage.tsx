import { useCopy } from '../i18n/copy';
import { AdditionalLanguages, TrialProcess, AdmissionsSection, AdmissionPackages, AdditionalServices } from '../components/sections/BriefSections';
import HeroSection from '../components/sections/HeroSection';
import DirectionsSection from '../components/sections/DirectionsSection';
import OnlineOfflineSection from '../components/sections/OnlineOfflineSection';
import IeltsSection from '../components/sections/IeltsSection';
import TravelSection from '../components/sections/TravelSection';
import BranchesSection from '../components/sections/BranchesSection';
import ReviewsSection from '../components/sections/ReviewsSection';
import ContactSection from '../components/sections/ContactSection';
import FaqSection from '../components/sections/FaqSection';
import { usePageSeo } from '../hooks/usePageSeo';
import { SEO_METADATA } from '../data/seo';

export default function HomePage() {
  const copy = useCopy();
  usePageSeo(SEO_METADATA.home);
  return (
    <main id="main-content" aria-label={copy("Главная страница")}>
      {/* 1. Hero / первый экран */}
      <HeroSection />

      {/* 2. Направления обучения (7 программ) */}
      <DirectionsSection />
      <div className="container"><AdditionalLanguages /></div>

      {/* 3. Онлайн vs офлайн */}
      <OnlineOfflineSection />

      {/* 4. IELTS */}
      <IeltsSection />

      {/* 5. Зарубежные программы */}
      <TravelSection />
      <AdmissionsSection />
      <div className="container"><AdmissionPackages /><AdditionalServices /></div>

      {/* 6. Филиалы с картой */}
      <BranchesSection />

      {/* 7. Отзывы / компания */}
      <ReviewsSection />

      {/* 8. Форма заявки */}
      <div className="container"><TrialProcess /></div>
      <ContactSection kind="trial" />

      {/* 9. FAQ */}
      <FaqSection />
    </main>
  );
}
