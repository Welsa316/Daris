/**
 * Article registry. The one place that knows every pillar article Daris
 * has published. Drives the index list view, the router's `/articles/:slug`
 * lookup, the server-side SEO meta injector, and the sitemap.
 *
 * Every entry declares its slug and metadata here, and lazy-imports its
 * Vue component so the main bundle stays small. Each article ships as its
 * own chunk.
 *
 * Articles are currently EN-only. Arabic translations are a tracked
 * follow-up. See the project plan file.
 */

export const articles = [
  {
    slug: 'complete-guide-online-quran-learning',
    title: 'The complete guide to online Quran learning',
    excerpt: 'What serious online Quran study actually looks like in 2026. What to expect from a good programme, what to avoid, and how to evaluate a teacher before you commit.',
    description: 'A practical guide to learning Quran online with a qualified teacher. Tajwid, memorisation, ijazah, and what to evaluate before enrolling.',
    date: '2026-04-17',
    tag: 'Quran',
    readMins: 12,
    component: () => import('@/views/articles/CompleteGuideOnlineQuranLearning.vue'),
  },
  {
    slug: 'what-is-ijazah-and-how-to-earn-it-online',
    title: 'What is ijazah, and how do you earn one online?',
    excerpt: 'Ijazah is the classical certification of authorised transmission. Here is how it actually works, what a sanad is, and what an online path to ijazah involves.',
    description: 'Ijazah explained. What the certification actually means in Islamic scholarship, and the realistic path to earning one through online Quran study.',
    date: '2026-04-17',
    tag: 'Quran',
    readMins: 10,
    component: () => import('@/views/articles/WhatIsIjazahAndHowToEarnItOnline.vue'),
  },
  {
    slug: 'how-to-choose-online-quran-teacher',
    title: 'How to choose an online Quran teacher (seven honest checks)',
    excerpt: 'Most "online Quran academy" listings blur together. Seven specific things to check before committing to any teacher, with the why behind each one.',
    description: 'A checklist for evaluating online Quran teachers. Methodology, credentials, curriculum structure, lesson format, and the questions to ask first.',
    date: '2026-04-17',
    tag: 'Quran',
    readMins: 8,
    component: () => import('@/views/articles/HowToChooseOnlineQuranTeacher.vue'),
  },
  {
    slug: 'online-quran-classes-uk-muslims',
    title: 'Online Quran classes for UK Muslims: a practical guide',
    excerpt: 'If you are in the UK and want structured Quran study with a qualified teacher, here is how to navigate timezones, scheduling, and what actually fits around a working week.',
    description: 'Guidance for UK-based Muslims considering online Quran lessons. GMT scheduling, finding a qualified teacher, fitting study around work and family.',
    date: '2026-04-17',
    tag: 'Guides',
    readMins: 9,
    component: () => import('@/views/articles/OnlineQuranClassesUKMuslims.vue'),
  },
  {
    slug: 'quranic-arabic-vs-modern-arabic',
    title: 'Quranic Arabic vs. Modern Standard Arabic: what to learn and why',
    excerpt: 'Both are Fuṣḥā. But what you study, and in what order, matters more than most courses admit. A plain-English guide to the real distinction.',
    description: 'The difference between Quranic Arabic and Modern Standard Arabic, what each is good for, and how to choose a course that fits your actual goal.',
    date: '2026-04-17',
    tag: 'Arabic',
    readMins: 11,
    component: () => import('@/views/articles/QuranicArabicVsModernArabic.vue'),
  },
  {
    slug: 'arabic-tutoring-for-non-native-speakers',
    title: 'Arabic tutoring for non-native speakers: what works and what wastes your time',
    excerpt: 'Apps, Duolingo, grammar videos, conversation partners. Plenty of tools, mixed results. What serious non-native learners actually need, and how tutoring fits.',
    description: 'A realistic guide to learning Arabic as a non-native speaker. The progression that works, the resources worth buying, and where tutoring fits.',
    date: '2026-04-17',
    tag: 'Arabic',
    readMins: 10,
    component: () => import('@/views/articles/ArabicTutoringForNonNativeSpeakers.vue'),
  },
  {
    slug: 'hanafi-fiqh-online-for-adults',
    title: 'Hanafi fiqh online for adults: what a serious programme looks like',
    excerpt: 'Adult learners coming to Hanafi fiqh online deserve more than a YouTube playlist. What recognised manuals, structured sequence, and teacher engagement actually look like.',
    description: 'How Hanafi fiqh is taught online to adult learners. Recognised manuals, traditional sequence, aqeedah and hadith alongside, and the role of live teaching.',
    date: '2026-04-17',
    tag: 'Fiqh',
    readMins: 9,
    component: () => import('@/views/articles/HanafiFiqhOnlineForAdults.vue'),
  },
  {
    slug: 'private-islamic-tutor-what-to-expect',
    title: 'Hiring an online Islamic tutor: what to expect in the first month',
    excerpt: 'Goal-setting conversation, level assessment, first few lessons, what "making progress" looks like. A grounded account rather than a marketing brochure.',
    description: 'What actually happens in the first month with an online Islamic tutor. Goal-setting, assessment, first lessons, and how to tell it is working.',
    date: '2026-04-17',
    tag: 'Guides',
    readMins: 8,
    component: () => import('@/views/articles/PrivateIslamicTutorWhatToExpect.vue'),
  },
];

/**
 * Resolve a slug to an article entry (or null if unknown).
 * Used by ArticleView to reject unknown slugs to the articles index.
 */
export function findArticle(slug) {
  return articles.find((a) => a.slug === slug) || null;
}
