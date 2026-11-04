// GL Study — TypeScript type definitions


// ─── i18n / Locale ────────────────────────────────────────────────────────────
export type Locale = 'ru' | 'kk' | 'en';
export type {LocalizedContent,ContentTranslations} from '../i18n/content';

// ─── SEO ─────────────────────────────────────────────────────────────────────
export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

// ─── City / Branch ────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  cityId: string;
  name: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  lat?: number;
  lng?: number;
  schedule?: string;      // Class timetable is never invented; reception hours are a company-wide constant.
  programs?: string[];    // Program slugs offered at this branch (filters the programme cards — leave unset)
  instagram?: string;     // The branch's own Instagram handle, without @ or URL
  offerings?: string[];   // Human-readable products of this branch, exactly as supplied in the branch table
  hasIelts?: boolean;
  // active = open offline centre; online = online only; online_launch = online format starting; repair = centre under repair.
  status: BranchStatus;
  note?: string;
  photos?: string[];      // Licensed client photos only
}

export type BranchStatus = 'active' | 'coming_soon' | 'online' | 'online_launch' | 'repair';

export interface City {
  id: string;
  name: string;
  nameKk?: string;
  nameEn?: string;
  branches: Branch[];
  isDefault?: boolean;
  hasPage?: boolean;      // false: listed only in the branch registry, no /branches/{id} page or selector entry
}

export interface AdditionalService {
  id: string;
  title: string;
  points: string[];
  order: number;
}

export interface AdmissionPackage {
  id: string;
  title: string;
  description: string;
  duration: string;
  features: string[];
  order: number;
}

// ─── Programs ─────────────────────────────────────────────────────────────────
export type ProgramFormat = 'online' | 'offline' | 'hybrid';
export type AgeGroup = 'children' | 'teens' | 'adults' | 'all';

export interface Program {
  id: string;
  slug: string;
  title: string;
  titleKk?: string;
  titleEn?: string;
  translations?: Partial<Record<Exclude<Locale,'ru'>,Partial<Pick<Program,'title'|'description'|'shortDesc'|'ageRange'>>>>;
  description: string;
  shortDesc: string;
  format: ProgramFormat;
  ageGroup: AgeGroup;
  ageRange: string;       // e.g. "6–10 лет"
  duration?: string;      // e.g. "32 занятия / 60 мин"
  price?: string;
  image?: string;         // Licensed image
  features?: string[];
  isIelts?: boolean;
  published: boolean;
  order?: number;
}

// ─── Travel Programs ──────────────────────────────────────────────────────────
export interface TravelDay {
  dayNumber: number;
  title: string;
  description: string;
}

export interface TravelProgram {
  id: string;
  slug: string;
  title: string;
  destination: string;

  dateStart?: string;    // "2027-01-02"
  dateEnd?: string;      // "2027-01-12"
  dateLabel: string;
  duration: string;      // "11 дней / 10 ночей"
  ageMin: number;
  ageMax?: number;
  price?: string;
  priceNote?: string;    // "Виза и перелёт оплачиваются отдельно"
  groupMin?: number;     // Prague: 25
  included?: string[];
  notIncluded?: string[];
  accommodation?: string;
  meals?: string;
  itinerary?: TravelDay[];
  photos?: string[];       // Licensed photos only
  ctaLabel?: string;
  additionalOption?: {
    title: string;
    price?: string;
    includes: string[];
  };
  published: boolean;
}

// ─── Teachers ─────────────────────────────────────────────────────────────────
export interface Teacher {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  subjects?: string[];
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export type ReviewType = 'text' | 'video';

export interface Review {
  id: string;
  type: ReviewType;
  authorName?: string;
  text?: string;
  videoUrl?: string;
  rating?: number;
  program?: string;
  city?: string;
  photo?: string;
  published: boolean;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// ─── Lead / Form ──────────────────────────────────────────────────────────────
export type FormType = 'main' | 'ielts' | 'travel' | 'callback';
export type ContactChannel = 'whatsapp' | 'phone' | 'telegram' | 'email';

export interface LeadContext {
  formType: FormType;
  city?: string;
  branch?: string;
  program?: string;
  ctaLocation?: string;  // e.g. "hero", "directions-card", "ielts-section"
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  cityId?: string;
  ageGroup?: AgeGroup;
  programSlug?: string;
  format?: ProgramFormat;
  channel?: ContactChannel;
  comment?: string;
  consentGiven: boolean;
  consentVersion: string;
  // IELTS extra
  currentLevel?: string;
  targetScore?: string;
  examDate?: string;
  // Travel extra
  parentName?: string;
  childAge?: number;
  travelProgram?: string;
  // Context
  context?: LeadContext;
}

// ─── Cookie preferences ───────────────────────────────────────────────────────
export interface CookiePreferences {
  necessary: true;    // Always true, cannot be disabled
  analytics: boolean;
  advertising: boolean;
  consentDate?: string;
}
