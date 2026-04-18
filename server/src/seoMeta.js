/**
 * Server-side SEO meta injection for marketing pages (per locale).
 *
 * Daris serves the same four "pages" under two locale subpaths, /en/* and
 * /ar/*, so crawlers can index each language version as a distinct URL.
 * For every request to a marketing route, the server injects:
 *   - <title>, <meta name="description">, Open Graph, Twitter Card
 *   - <link rel="canonical"> pointing to the current-locale URL
 *   - <link rel="alternate" hreflang="en|ar|x-default"> mutual pairs
 *   - <script type="application/ld+json"> structured data
 *
 * ...into index.html before the SPA hydrates. Crawlers without JS execution
 * (Bingbot, Yandex, legacy tools) still get fully populated metadata.
 *
 * Client-side @unhead/vue re-asserts matching tags after hydration. The two
 * sources are kept intentionally consistent. Server is the source of truth
 * for the first paint; client keeps them reactive during SPA navigation.
 */

const SITE_URL = 'https://daris.education';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Content keyed by page then locale. Descriptions sit ≤160 chars to avoid
// mobile truncation. Titles stay under 60 characters including separators.
const pageContent = {
  home: {
    en: {
      title: 'Daris | Online Quran, Arabic & Fiqh Lessons',
      description: 'Online Quran, Arabic, and Fiqh lessons in the methodology of Al-Azhar Al-Sharif. Bilingual teaching for men and children, worldwide.',
    },
    ar: {
      title: 'دارس | دروس القرآن والعربية والفقه عبر الإنترنت',
      description: 'دروس في القرآن الكريم واللغة العربية والفقه عبر الإنترنت، وفق منهج الأزهر الشريف. للرجال والأطفال حول العالم.',
    },
  },
  about: {
    en: {
      title: 'About Daris | Al-Azhar Methodology Online',
      description: 'How Daris teaches: structured, progressive curriculum in Quran, Arabic, and Islamic studies, in the methodology of Al-Azhar Al-Sharif.',
    },
    ar: {
      title: 'عن دارس | منهج الأزهر عبر الإنترنت',
      description: 'كيف يُدرّس دارس: منهج متدرّج في القرآن والعربية والعلوم الشرعية، وفق المنهجية المعتمدة في الأزهر الشريف.',
    },
  },
  programs: {
    en: {
      title: 'Programs | Quran, Arabic & Fiqh Courses · Daris',
      description: 'Daris programs: Quran recitation, tajwid, and tafsir; classical Arabic for non-native speakers; and Hanafi fiqh, taught in Arabic.',
    },
    ar: {
      title: 'البرامج | دروس القرآن والعربية والفقه · دارس',
      description: 'برامج دارس: القرآن تلاوةً وتجويداً وتفسيراً؛ العربية الفصحى لغير الناطقين بها؛ والفقه الحنفي باللغة العربية.',
    },
  },
  contact: {
    en: {
      title: 'Contact Daris | Start Your Learning Journey',
      description: 'Reach Daris via WhatsApp or email to start your learning journey. English and Arabic support. Share your goals, timezone, and level.',
    },
    ar: {
      title: 'تواصل مع دارس | ابدأ رحلة التعلم',
      description: 'تواصل مع دارس عبر واتساب أو البريد الإلكتروني لبدء رحلة التعلم. دعم بالعربية والإنجليزية. شاركنا أهدافك ومنطقتك الزمنية.',
    },
  },
  faq: {
    en: {
      title: 'FAQ | Online Quran, Arabic & Fiqh with Daris',
      description: 'Answers to the most common questions about Daris. Lesson format, ijazah, children\u2019s programs, languages, timezones, and how to start.',
    },
    ar: {
      title: 'الأسئلة الشائعة | دارس لدروس القرآن والعربية والفقه',
      description: 'أجوبة على أكثر الأسئلة تكراراً عن دارس: صيغة الدرس، الإجازة، برامج الأطفال، اللغات، المناطق الزمنية، وكيفية البدء.',
    },
  },
  articles: {
    en: {
      title: 'Articles | Online Quran, Arabic & Fiqh Studies · Daris',
      description: 'Long-form articles on learning Quran, Arabic, and fiqh online. Methodology, ijazah, classical Arabic, Hanafi tradition, and choosing a teacher.',
    },
    ar: {
      title: 'المقالات | دراسة القرآن والعربية والفقه عبر الإنترنت · دارس',
      description: 'مقالات مطوّلة عن الدراسة الإسلامية عبر الإنترنت: المنهجية، والإجازة، والعربية الفصحى، والمذهب الحنفي، واختيار المعلّم.',
    },
  },
};

// Per-article metadata. The same slugs live in src/content/articles/registry.js
// (which adds lazy component imports for the Vue runtime). Keep these two
// lists in sync. If an article is added or renamed, update both files.
// Articles are currently English-only; Arabic translations are a planned
// follow-up and AR article URLs redirect to EN at the router level.
const articleMeta = {
  'complete-guide-online-quran-learning': {
    title: 'The complete guide to online Quran learning · Daris',
    description: 'A practical guide to learning Quran online with a qualified teacher. Tajwid, memorisation, ijazah, and what to evaluate before enrolling.',
    date: '2026-04-17',
    tag: 'Quran',
  },
  'what-is-ijazah-and-how-to-earn-it-online': {
    title: 'What is ijazah, and how do you earn one online? · Daris',
    description: 'Ijazah explained. What the certification actually means in Islamic scholarship, and the realistic path to earning one through online Quran study.',
    date: '2026-04-17',
    tag: 'Quran',
  },
  'how-to-choose-online-quran-teacher': {
    title: 'How to choose an online Quran teacher (seven honest checks) · Daris',
    description: 'A checklist for evaluating online Quran teachers. Methodology, credentials, curriculum structure, lesson format, and the questions to ask first.',
    date: '2026-04-17',
    tag: 'Quran',
  },
  'online-quran-classes-uk-muslims': {
    title: 'Online Quran classes for UK Muslims: a practical guide · Daris',
    description: 'Guidance for UK-based Muslims considering online Quran lessons. GMT scheduling, finding a qualified teacher, fitting study around work and family.',
    date: '2026-04-17',
    tag: 'Guides',
  },
  'quranic-arabic-vs-modern-arabic': {
    title: 'Quranic Arabic vs. Modern Standard Arabic · Daris',
    description: 'The difference between Quranic Arabic and Modern Standard Arabic, what each is good for, and how to choose a course that fits your actual goal.',
    date: '2026-04-17',
    tag: 'Arabic',
  },
  'arabic-tutoring-for-non-native-speakers': {
    title: 'Arabic tutoring for non-native speakers · Daris',
    description: 'A realistic guide to learning Arabic as a non-native speaker. The progression that works, the resources worth buying, and where tutoring fits.',
    date: '2026-04-17',
    tag: 'Arabic',
  },
  'hanafi-fiqh-online-for-adults': {
    title: 'Hanafi fiqh online for adults · Daris',
    description: 'How Hanafi fiqh is taught online to adult learners. Recognised manuals, traditional sequence, aqeedah and hadith alongside, and the role of live teaching.',
    date: '2026-04-17',
    tag: 'Fiqh',
  },
  'private-islamic-tutor-what-to-expect': {
    title: 'Hiring an online Islamic tutor: what to expect in the first month · Daris',
    description: 'What actually happens in the first month with an online Islamic tutor. Goal-setting, assessment, first lessons, and how to tell it is working.',
    date: '2026-04-17',
    tag: 'Guides',
  },
};

// 10 FAQ entries per locale. The same ten questions are rendered on the
// page and serialised into FAQPage schema below. One source of truth means
// answers cannot drift between the visible page and the crawler-facing
// JSON-LD. Keep in sync with the faq block of src/i18n/locales/{en,ar}.json.
const faqEntries = {
  en: [
    {
      q: 'What does a Daris lesson look like?',
      a: 'It depends on the subject. Quran students read aloud and the teacher corrects tajwid and articulation as it happens, working through a structured plan. Arabic runs the same way: grammar and reading with live correction. Fiqh is usually taught in a small group, in Arabic, using a recognised Hanafi manual. Every lesson is live and scheduled in the student\u2019s timezone.',
    },
    {
      q: 'How is Daris different from a Quran app or YouTube channel?',
      a: 'Apps drill vocabulary. Channels broadcast recitation. Neither replaces the part of Islamic study that has always needed a teacher: someone who hears you read, catches the mistake you can\u2019t hear yourself, explains what a classical text actually means, and adjusts your curriculum based on what you\u2019re struggling with this week. That\u2019s what Daris is built around.',
    },
    {
      q: 'Do you teach beginners, or only advanced students?',
      a: 'Both. Absolute beginners working on the correct articulation of Arabic letters are welcome, and so are advanced students polishing recitation at a serious level. Order and depth adapt to the student. The structure doesn\u2019t change.',
    },
    {
      q: 'Do you teach children?',
      a: 'Yes. Children have their own curriculum path: shorter lessons, age-appropriate material (stories of the prophets, the Prophetic seerah, the 40 Hadith of an-Nawawi), and a pace that respects attention span without dropping the standard of what\u2019s being learned.',
    },
    {
      q: 'What is ijazah?',
      a: 'An ijazah is a traditional certification from a qualified teacher that the student has recited the Quran (or read a specific text) with correct tajwid and without omissions or additions. It carries a sanad, a chain of transmission traceable through teachers over centuries. The Daris Quran track is built on the traditional sequence that leads in that direction. Whether a specific ijazah path is right for a given student is a conversation to have once the teacher has assessed their level.',
    },
    {
      q: 'Is the instruction in English or Arabic?',
      a: 'Quran and tajwid are available in English and Arabic. Fiqh and aqeedah are taught in Arabic only, which is how the tradition keeps its texts accurate. Arabic lessons are conducted in Arabic with English support where it helps, especially early on. General communication and scheduling can happen in either language.',
    },
    {
      q: 'Which timezones does Daris support?',
      a: 'Any. Lessons are scheduled in the student\u2019s local time. The student picks a weekly slot that fits their schedule, and that slot stays the slot unless both sides agree to move it.',
    },
    {
      q: 'What do I need to attend a lesson?',
      a: 'A reliable internet connection and a device with a microphone. Video is strongly preferred so the teacher can see the student\u2019s mouth position for tajwid correction. Nothing special to install. Lessons run over widely available video-call tools.',
    },
    {
      q: 'Can I combine multiple programs?',
      a: 'Yes. Many students take Quran alongside Arabic, or Arabic alongside fiqh. The weekly schedule is built from the student\u2019s goals: one program, two, or all three. No packaged tiers to fit into.',
    },
    {
      q: 'How do I get started?',
      a: 'Message Daris via WhatsApp or email with your goals, current level, how many lessons a week you\u2019d like, and your timezone. A short assessment sets the entry point. Lessons begin once a plan is agreed.',
    },
  ],
  ar: [
    {
      q: 'كيف يسير درس دارس؟',
      a: 'يعتمد على المادة. في القرآن: يقرأ الطالب بصوته، والمعلّم يصحّح التجويد ومخارج الحروف لحظياً، وفق خطة منظّمة. في العربية: نحو وقراءة بالتصحيح المباشر نفسه. في الفقه: عادةً في مجموعة صغيرة، باللغة العربية، وفق كتاب حنفي معتمد. كل درس مباشر ومُجدوَل حسب المنطقة الزمنية للطالب.',
    },
    {
      q: 'ما الفرق بين دارس وتطبيق القرآن أو قناة يوتيوب؟',
      a: 'التطبيقات تدرّب على المفردات. القنوات تبثّ التلاوة. وكلاهما لا يحلّ محلّ الجزء من التعليم الإسلامي الذي تطلّب دائماً معلّماً يسمع قراءتك، ويلتقط الخطأ الذي لا تسمعه بنفسك، ويشرح النصّ الكلاسيكي شرحاً حقيقياً، ويُعدّل منهجك حسب ما تعثر فيه هذا الأسبوع. هذا ما بُني عليه دارس.',
    },
    {
      q: 'هل تعلّمون المبتدئين، أم المتقدّمين فقط؟',
      a: 'كلاهما. يستخدم المنصّة المبتدئ الذي يعمل على مخارج الحروف، والطالب المتقدّم الذي يصقل التلاوة في مستوى الإجازة. ترتيب المادة وعمقها يتكيّفان مع الطالب؛ البنية لا تتغيّر.',
    },
    {
      q: 'هل تدرّسون الأطفال؟',
      a: 'نعم. للأطفال مسار خاص: دروس أقصر، ونصوص مناسبة للعمر (قصص الأنبياء، السيرة النبوية، الأربعين النووية)، ووتيرة تحترم قدرة الانتباه من غير أن تنزل بمعيار ما يُتعلَّم.',
    },
    {
      q: 'ما الإجازة؟',
      a: 'الإجازة شهادة تقليدية من معلّم مؤهَّل بأن الطالب قرأ القرآن (أو نصّاً بعينه) بتجويد صحيح من دون إسقاط ولا زيادة. ويحمل سنداً متّصلاً بسلسلة المعلّمين عبر القرون. مسار القرآن في دارس مبنيّ على التسلسل التقليدي الذي يسير في هذا الاتجاه. أمّا مناسبة مسار إجازة بعينه لطالب بعينه فتُناقَش بعد أن يقيّم المعلّم مستواه.',
    },
    {
      q: 'هل التدريس بالعربية أم بالإنجليزية؟',
      a: 'القرآن والتجويد متاحان بالإنجليزية والعربية. الفقه والعقيدة بالعربية فقط، وذلك حفاظاً على دقة النصوص الأصلية. العربية تُدرَّس بالعربية مع دعم بالإنجليزية حين يساعد، خاصة في البدايات. أمّا التواصل العام والجدولة فيمكن أن يكون بأيّ من اللغتين.',
    },
    {
      q: 'ما المناطق الزمنية التي يدعمها دارس؟',
      a: 'كل المناطق. تُجدوَل الدروس حسب التوقيت المحلي للطالب. يختار الطالب فترة أسبوعية تناسب جدوله، ويعمل الدرس فيها دائماً إلا إذا اتّفق الطرفان على تغييرها.',
    },
    {
      q: 'ما الذي أحتاجه لحضور الدرس؟',
      a: 'اتصال إنترنت موثوق وجهاز يحتوي على ميكروفون. الفيديو مفضّل بشدّة حتى يرى المعلّم وضع الفم للتصحيح في التجويد. لا برامج خاصة تُحمَّل. الدروس تجري عبر أدوات فيديو معروفة.',
    },
    {
      q: 'هل يمكن الجمع بين أكثر من برنامج؟',
      a: 'نعم. كثير من الطلاب يجمعون القرآن مع العربية، أو العربية مع الفقه. الجدول الأسبوعي يُبنى من أهداف الطالب، برنامجاً واحداً أو اثنين أو الثلاثة، لا من باقات جاهزة.',
    },
    {
      q: 'كيف أبدأ؟',
      a: 'راسل دارس عبر واتساب أو البريد الإلكتروني بأهدافك ومستواك الحالي وعدد الدروس الأسبوعية التي تستهدفها ومنطقتك الزمنية. تقييم قصير يحدّد نقطة الانطلاق. الدروس تبدأ بعد الاتفاق على خطة مناسبة.',
    },
  ],
};

// Per-page structured data builders. `schemaFor(page, locale)` returns an
// array of schema.org objects to emit as <script type="application/ld+json">.
function schemaFor(page, locale) {
  const common = {
    '@context': 'https://schema.org',
    inLanguage: locale === 'ar' ? 'ar' : 'en',
    datePublished: '2026-01-01',
    dateModified: TODAY,
  };

  if (page === 'home') {
    return [
      {
        ...common,
        '@type': 'EducationalOrganization',
        name: 'Daris',
        url: SITE_URL,
        logo: `${SITE_URL}/images/daris-logo.png`,
        description: pageContent.home[locale].description,
        availableLanguage: ['English', 'Arabic'],
        areaServed: 'Worldwide',
        knowsAbout: ['Quran recitation', 'Tajwid', 'Tafsir', 'Classical Arabic', 'Hanafi fiqh', 'Aqeedah', 'Hadith'],
        sameAs: ['https://wa.me/message/OCKC2UPLHGOOG1'],
      },
      {
        ...common,
        '@type': 'WebSite',
        name: 'Daris',
        url: SITE_URL,
        inLanguage: ['en', 'ar'],
      },
    ];
  }

  if (page === 'about') {
    return [
      {
        ...common,
        '@type': 'AboutPage',
        name: pageContent.about[locale].title,
        url: `${SITE_URL}/${locale}/about`,
        description: pageContent.about[locale].description,
        mainEntity: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
      },
    ];
  }

  if (page === 'programs') {
    const courseNames = locale === 'ar'
      ? { quran: 'القرآن الكريم', arabic: 'اللغة العربية', fiqh: 'الفقه والعلوم الشرعية' }
      : { quran: 'Quran Studies', arabic: 'Arabic Language', fiqh: 'Fiqh & Islamic Studies' };
    const courseDescs = locale === 'ar'
      ? {
          quran: 'تصحيح التلاوة، أحكام التجويد، وفهم التفسير.',
          arabic: 'نحو العربية الفصحى والمفردات والقراءة الموجهة مع النصوص الكلاسيكية.',
          fiqh: 'الفقه الحنفي، العقيدة، قصص الأنبياء، والأربعين النووية.',
        }
      : {
          quran: 'Recitation correction, tajwid rules, and tafsir understanding.',
          arabic: 'Classical Arabic grammar, vocabulary, and guided reading with classical texts.',
          fiqh: 'Hanafi fiqh, aqeedah, stories of the prophets, and the 40 Nawawi hadiths.',
        };
    return [
      {
        ...common,
        '@type': 'ItemList',
        name: pageContent.programs[locale].title,
        url: `${SITE_URL}/${locale}/programs`,
        itemListElement: [
          {
            '@type': 'ListItem', position: 1, item: {
              '@type': 'Course',
              name: courseNames.quran,
              description: courseDescs.quran,
              url: `${SITE_URL}/${locale}/programs#quran`,
              provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
              inLanguage: locale === 'ar' ? ['ar', 'en'] : ['en', 'ar'],
            },
          },
          {
            '@type': 'ListItem', position: 2, item: {
              '@type': 'Course',
              name: courseNames.arabic,
              description: courseDescs.arabic,
              url: `${SITE_URL}/${locale}/programs#arabic`,
              provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
              inLanguage: locale === 'ar' ? ['ar', 'en'] : ['en', 'ar'],
            },
          },
          {
            '@type': 'ListItem', position: 3, item: {
              '@type': 'Course',
              name: courseNames.fiqh,
              description: courseDescs.fiqh,
              url: `${SITE_URL}/${locale}/programs#fiqh`,
              provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
              inLanguage: 'ar',
            },
          },
        ],
      },
    ];
  }

  if (page === 'contact') {
    return [
      {
        ...common,
        '@type': 'ContactPage',
        name: pageContent.contact[locale].title,
        url: `${SITE_URL}/${locale}/contact`,
        mainEntity: {
          '@type': 'EducationalOrganization',
          name: 'Daris',
          url: SITE_URL,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Arabic'],
            email: 'hello@daris.education',
            url: 'https://wa.me/message/OCKC2UPLHGOOG1',
          },
        },
      },
    ];
  }

  if (page === 'faq') {
    // Google only surfaces FAQ rich results when the questions/answers on
    // the page match those in the schema. We build the schema from the
    // same `faqEntries` map that feeds i18n, so page content and JSON-LD
    // stay in lockstep.
    return [
      {
        ...common,
        '@type': 'FAQPage',
        name: pageContent.faq[locale].title,
        url: `${SITE_URL}/${locale}/faq`,
        mainEntity: faqEntries[locale].map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ];
  }

  if (page === 'articles') {
    // The articles index lists every pillar article. We emit a
    // CollectionPage + ItemList so crawlers see the structure and can
    // use the list as a hint for internal linking / sitelinks.
    return [
      {
        ...common,
        '@type': 'CollectionPage',
        name: pageContent.articles[locale].title,
        url: `${SITE_URL}/${locale}/articles`,
        description: pageContent.articles[locale].description,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: Object.entries(articleMeta).map(([slug, meta], i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/en/articles/${slug}`,
            name: meta.title.replace(' · Daris', ''),
          })),
        },
      },
    ];
  }

  return [];
}

/**
 * Build an Article schema for a single post. Called by the SPA fallback
 * when the URL matches `/en/articles/<slug>` and the slug is known.
 */
function articleSchema(slug) {
  const meta = articleMeta[slug];
  if (!meta) return [];
  const articleUrl = `${SITE_URL}/en/articles/${slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title.replace(' · Daris', ''),
      description: meta.description,
      inLanguage: 'en',
      datePublished: meta.date,
      dateModified: meta.date,
      image: `${SITE_URL}/images/daris-og.png`,
      author: { '@type': 'Organization', name: 'Daris', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Daris',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/daris-logo.png` },
      },
      mainEntityOfPage: articleUrl,
    },
  ];
}

/**
 * Route lookup. A request to /en/about is mapped to { page: 'about',
 * locale: 'en' }. Unknown paths return null so the SPA fallback serves
 * the default HTML (no meta injection).
 */
const ROUTE_MAP = {
  '/en': { page: 'home', locale: 'en' },
  '/en/': { page: 'home', locale: 'en' },
  '/en/about': { page: 'about', locale: 'en' },
  '/en/programs': { page: 'programs', locale: 'en' },
  '/en/faq': { page: 'faq', locale: 'en' },
  '/en/contact': { page: 'contact', locale: 'en' },
  '/en/articles': { page: 'articles', locale: 'en' },
  '/ar': { page: 'home', locale: 'ar' },
  '/ar/': { page: 'home', locale: 'ar' },
  '/ar/about': { page: 'about', locale: 'ar' },
  '/ar/programs': { page: 'programs', locale: 'ar' },
  '/ar/faq': { page: 'faq', locale: 'ar' },
  '/ar/contact': { page: 'contact', locale: 'ar' },
  '/ar/articles': { page: 'articles', locale: 'ar' },
};

export function resolveRoute(routePath) {
  // Normalise trailing slash so /en and /en/ both match home.
  const normalised = routePath.length > 1 && routePath.endsWith('/')
    ? routePath.slice(0, -1)
    : routePath;

  // Dynamic article routes: /en/articles/<slug>. Articles are English-only
  // for now; /ar/articles/<slug> redirects to the EN version at the router
  // level, so this resolver only needs to handle the EN path.
  const articleMatch = normalised.match(/^\/en\/articles\/([a-z0-9-]+)$/);
  if (articleMatch && articleMeta[articleMatch[1]]) {
    return { page: 'article', locale: 'en', slug: articleMatch[1] };
  }

  return ROUTE_MAP[normalised] || ROUTE_MAP[routePath] || null;
}

/**
 * Build the meta HTML string to inject into <head> for a given route.
 * Returns null if the route isn't a known marketing page (auth/dashboard
 * get no injection; the SPA fallback serves default HTML).
 */
export function buildMetaHtml(routePath) {
  const resolved = resolveRoute(routePath);
  if (!resolved) return null;

  const { page, locale, slug } = resolved;

  // Individual article: build content + schema from articleMeta and short-
  // circuit the rest of this function. Articles are English-only; we emit
  // no hreflang alternates because the AR counterpart does not exist yet.
  if (page === 'article') {
    const meta = articleMeta[slug];
    if (!meta) return null;
    const ogImage = `${SITE_URL}/images/daris-og.png`;
    const canonicalUrl = `${SITE_URL}/en/articles/${slug}`;
    const esc = (s) => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const articleMetaTags = `
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Daris" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="en_US" />
    <meta property="article:published_time" content="${meta.date}" />
    <meta property="article:modified_time" content="${meta.date}" />
    <meta property="article:section" content="${esc(meta.tag)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${canonicalUrl}" />`;
    const articleSchemaScripts = articleSchema(slug)
      .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join('\n    ');
    return `${articleMetaTags}\n    ${articleSchemaScripts}`;
  }

  const content = pageContent[page]?.[locale];
  if (!content) return null;

  const ogImage = `${SITE_URL}/images/daris-og.png`;
  const canonicalPath = page === 'home' ? `/${locale}` : `/${locale}/${page}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const enUrl = `${SITE_URL}${page === 'home' ? '/en' : `/en/${page}`}`;
  const arUrl = `${SITE_URL}${page === 'home' ? '/ar' : `/ar/${page}`}`;
  const ogLocale = locale === 'ar' ? 'ar_SA' : 'en_US';
  const ogLocaleAlt = locale === 'ar' ? 'en_US' : 'ar_SA';

  // Conservative escape. Titles/descriptions are authored strings in this
  // file (not user input), but double quotes would still break the HTML.
  const esc = (s) => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const metaTags = `
    <title>${esc(content.title)}</title>
    <meta name="description" content="${esc(content.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Daris" />
    <meta property="og:title" content="${esc(content.title)}" />
    <meta property="og:description" content="${esc(content.description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:locale:alternate" content="${ogLocaleAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(content.title)}" />
    <meta name="twitter:description" content="${esc(content.description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="en" href="${enUrl}" />
    <link rel="alternate" hreflang="ar" href="${arUrl}" />
    <link rel="alternate" hreflang="x-default" href="${enUrl}" />`;

  const schemaScripts = schemaFor(page, locale)
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');

  return `${metaTags}\n    ${schemaScripts}`;
}

/**
 * Pick an initial locale from Accept-Language for the bare-root redirect.
 * Any Accept-Language segment that starts with "ar" wins; everything else
 * falls back to English.
 */
export function pickLocaleFromHeader(acceptLanguage) {
  if (!acceptLanguage) return 'en';
  // "ar" or "ar-EG" or "en, ar;q=0.8": look for an ar tag at any position.
  return /\bar\b/i.test(acceptLanguage) ? 'ar' : 'en';
}
