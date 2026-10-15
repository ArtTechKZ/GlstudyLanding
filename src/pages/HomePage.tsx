import HeroSection from '../components/sections/HeroSection';
import DirectionsSection from '../components/sections/DirectionsSection';
import OnlineOfflineSection from '../components/sections/OnlineOfflineSection';
import IeltsSection from '../components/sections/IeltsSection';
import TravelSection from '../components/sections/TravelSection';
import BranchesSection from '../components/sections/BranchesSection';
import ReviewsSection from '../components/sections/ReviewsSection';
import LeadFormSection from '../components/sections/LeadFormSection';
import FaqSection from '../components/sections/FaqSection';
import { usePageSeo } from '../hooks/usePageSeo';
import { SEO_METADATA } from '../data/seo';

export default function HomePage() {
  usePageSeo(SEO_METADATA.home);
  return (
    <main id="main-content" aria-label="Главная страница">
      {/* 1. Hero / первый экран */}
      <HeroSection />

      {/* 2. Направления обучения (7 программ) */}
      <DirectionsSection />

      {/* 3. Онлайн vs офлайн */}
      <OnlineOfflineSection />

      {/* 4. IELTS */}
      <IeltsSection />

      {/* 5. Зарубежные программы */}
      <TravelSection />

      {/* 6. Филиалы с картой */}
      <BranchesSection />

      {/* 7. Отзывы / компания */}
      <ReviewsSection />

      {/* 8. Форма заявки */}
      <LeadFormSection />

      {/* 9. FAQ */}
      <FaqSection />
    </main>
  );
}
