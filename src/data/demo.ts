// Demonstration data; confirm business content before public release.

import type { City, Program, TravelProgram, FaqItem, Review } from '../types';



export const DEMO_CITIES: City[] = [
  {
    id: 'almaty',
    name: 'Алматы',
    isDefault: true,
    branches: [
      {
        id: 'almaty-1',
        cityId: 'almaty',
        name: 'Филиал 1',
        address: undefined,
        phone: undefined,
        whatsapp: undefined,
        status: 'active',
        note: 'Данные ожидаются от заказчика'
      }
    ]
  },
  {
    id: 'astana',
    name: 'Астана',
    branches: [
      {
        id: 'astana-1',
        cityId: 'astana',
        name: 'Филиал 1',
        status: 'active',
        note: 'Данные ожидаются от заказчика'
      }
    ]
  },
  {
    id: 'kostanay',
    name: 'Костанай',
    branches: [
      {
        id: 'kostanay-1',
        cityId: 'kostanay',
        name: 'Филиал (IELTS)',
        hasIelts: true,
        status: 'active',
        note: 'Данные ожидаются от заказчика'
      }
    ]
  }
];



export const DEMO_PROGRAMS: Program[] = [
  {
    id: 'english-children',
    slug: 'english-children',
    title: 'Английский для детей',
    shortDesc: 'Весёлые занятия, игровой формат, первые слова и фразы.',
    description: 'Занятия в игровой форме для малышей. Развиваем речь, слух и любовь к языку с первых уроков.',
    format: 'hybrid',
    ageGroup: 'children',
    ageRange: '5–9 лет',
    duration: undefined,
    price: undefined,
    published: true,
    order: 1
  },
  {
    id: 'english-teens',
    slug: 'english-teens',
    title: 'Английский для подростков',
    shortDesc: 'Современные темы, проекты, разговорная практика.',
    description: 'Программа для тех, кто хочет говорить на английском уверенно. Топики, дискуссии, проекты.',
    format: 'hybrid',
    ageGroup: 'teens',
    ageRange: '10–17 лет',
    published: true,
    order: 2
  },
  {
    id: 'english-adults',
    slug: 'english-adults',
    title: 'Английский для взрослых',
    shortDesc: 'Деловой и разговорный английский для профессионального роста.',
    description: 'Гибкое расписание, практичные темы, уровни от A1 до C1.',
    format: 'hybrid',
    ageGroup: 'adults',
    ageRange: '18+ лет',
    published: true,
    order: 3
  },
  {
    id: 'ielts-prep',
    slug: 'ielts-prep',
    title: 'Подготовка к IELTS',
    shortDesc: 'Все четыре раздела: Reading, Writing, Listening, Speaking.',
    description: 'Интенсивная подготовка к международному экзамену IELTS. Пробные тесты, разбор ошибок, стратегии.',
    format: 'hybrid',
    ageGroup: 'all',
    ageRange: '14+ лет',
    isIelts: true,
    published: true,
    order: 4
  },
  {
    id: 'online',
    slug: 'online',
    title: 'Онлайн-обучение',
    shortDesc: 'Учитесь из любой точки мира с живым преподавателем.',
    description: 'Занятия в Zoom с опытным преподавателем. Удобное расписание, интерактивные материалы.',
    format: 'online',
    ageGroup: 'all',
    ageRange: 'Все возрасты',
    published: true,
    order: 5
  },
  {
    id: 'offline',
    slug: 'offline',
    title: 'Офлайн-обучение',
    shortDesc: 'Классы в уютных и современно оснащённых филиалах.',
    description: 'Занятия в оборудованных аудиториях с живым общением и командной работой.',
    format: 'offline',
    ageGroup: 'all',
    ageRange: 'Все возрасты',
    published: true,
    order: 6
  },
  {
    id: 'travel',
    slug: 'travel',
    title: 'Зарубежные каникулы',
    shortDesc: 'Языковые лагеря и образовательные туры за рубежом.',
    description: 'Прага, Малайзия и другие направления. Учёба + приключения + международная среда.',
    format: 'offline',
    ageGroup: 'all',
    ageRange: '8–18 лет',
    published: true,
    order: 7
  }
];


export const TRAVEL_PROGRAMS: TravelProgram[] = [
  {
    id: 'prague-2027',
    slug: 'europe-winter-2027',
    title: 'Европа начинается с Праги',
    destination: 'Прага, Чехия',

    dateStart: '2027-01-02',
    dateEnd: '2027-01-12',
    duration: '11 дней / 10 ночей',
    ageMin: 13,
    ageMax: 18,
    // ✅ CONFIRMED price
    price: '1 890 €',
    priceNote: 'Виза и авиаперелёт оплачиваются отдельно',
    // ✅ CONFIRMED group min
    groupMin: 25,
    // ✅ CONFIRMED included items
    included: [
      'Визовое приглашение',
      'Проживание',
      'Двухразовое питание',
      'Проездной по Праге',
      'SIM-карта',
      'Сопровождение куратора',
      'Занятия английским',
      'Экскурсии',
      'Посещение Madame Tussauds',
      'ТЦ Palladium',
      'Aquapalace',
      'Прогулка по Праге',
      'Экскурсия в университет',
      'Поездка в Дрезден',
      'Посещение музея',
      'Fashion Arena Prague Outlet',
      'Сертификат'
    ],
    notIncluded: ['Авиаперелёт', 'Виза'],
    additionalOption: {
      title: 'Тур «Три столицы»',
      price: '270 €',
      includes: [
        'Вена, Братислава, Будапешт',
        'Трансфер',
        'Отель 3★ с завтраком',
        'Гид и куратор'
      ]
    },
    // ⚠️ Itinerary NOT PROVIDED — awaiting client data
    itinerary: [],
    ctaLabel: 'Узнать подробнее',
    published: true
  },
  {
    id: 'malaysia',
    slug: 'malaysia',
    title: 'Языковой лагерь в Малайзии',
    destination: 'Куала-Лумпур, Малайзия',
    // ⚠️ Dates NOT PROVIDED
    dateStart: undefined,
    dateEnd: undefined,
    duration: '2 недели',
    ageMin: 8,
    ageMax: 18,
    // ⚠️ Price NOT PROVIDED — do NOT display a price
    price: undefined,
    priceNote: undefined,
    // ✅ CONFIRMED details
    accommodation: 'Отель 4★, 2 человека в номере',
    meals: '3-разовое питание',
    included: [
      '45–50 часов занятий английским',
      'Международная олимпиада',
      'Сертификаты и фирменные подарки',
      'Викторины и вечерние мероприятия',
      'Экскурсии',
      'Поездка на остров',
      'Транспорт по программе',
      'Фотоотчёты'
    ],
    ctaLabel: 'Узнать подробнее',
    published: true
  }
];


export const DEMO_FAQ: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Как проходит бесплатный пробный урок?',
    answer: 'Мы проводим тестирование уровня и знакомим с форматом занятий. Урок длится 45–60 минут с опытным преподавателем. Запишитесь через форму — мы свяжемся и согласуем удобное время.'
  },
  {
    id: 'faq-2',
    question: 'Какие форматы обучения доступны?',
    answer: 'GL Study предлагает онлайн-занятия (удалённо через видеосвязь) и офлайн в наших филиалах. Многие программы доступны в обоих форматах.'
  },
  {
    id: 'faq-3',
    question: 'Сколько учеников в группе?',
    answer: 'Данные о размере групп ожидаются от заказчика. Уточните у менеджера при записи.'
  },
  {
    id: 'faq-4',
    question: 'Как записаться на IELTS в Костанае?',
    answer: 'Сдача IELTS возможна в нашем костанайском центре. Актуальные даты экзаменов ожидаются — оставьте заявку, и мы сообщим о ближайшей сессии.'
  },
  {
    id: 'faq-5',
    question: 'Что входит в программу поездки в Прагу?',
    answer: 'Поездка «Европа начинается с Праги» (02–12 января 2027, 13–18 лет, 1 890 €) включает проживание, питание, проездной, SIM, куратора, занятия английским, экскурсии, Madame Tussauds, Aquapalace, Дрезден и сертификат. Виза и перелёт — отдельно.'
  },
  {
    id: 'faq-6',
    question: 'Есть ли рассрочка или скидки?',
    answer: 'Информация о ценах, скидках и рассрочке ожидается от заказчика.'
  },
  {
    id: 'faq-7',
    question: 'Как выбрать уровень для ребёнка?',
    answer: 'Мы проводим бесплатное тестирование уровня перед началом занятий. Наш преподаватель определит оптимальную группу и программу.'
  }
];

// ─── Reviews (DEMO — empty until real reviews provided) ──────────────────────

export const DEMO_REVIEWS: Review[] = [];
// No fake quotes, no invented names, no fabricated testimonials.
