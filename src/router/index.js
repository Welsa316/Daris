import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import ProgramsView from '../views/ProgramsView.vue';
import ContactView from '../views/ContactView.vue';
import FaqView from '../views/FaqView.vue';
import ArticlesIndexView from '../views/ArticlesIndexView.vue';
import ArticleView from '../views/ArticleView.vue';
import { i18n, setLocale } from '@/i18n';

// Build the eight canonical marketing routes: /en/<page> and /ar/<page>.
// Each route carries a `meta.locale` and a `meta.pageKey` so the SEO
// composable + nav guard can react to the URL instead of guessing from
// vue-i18n state. Non-marketing routes (auth, dashboard) keep their bare
// paths. they're not indexed and don't need locale-scoped URLs.
function marketingRoutes() {
  const pages = [
    { key: 'home', path: '', component: HomeView },
    { key: 'about', path: '/about', component: AboutView },
    { key: 'programs', path: '/programs', component: ProgramsView },
    { key: 'faq', path: '/faq', component: FaqView },
    { key: 'contact', path: '/contact', component: ContactView },
  ];
  const out = [];
  for (const locale of ['en', 'ar']) {
    for (const p of pages) {
      out.push({
        path: `/${locale}${p.path}`,
        name: `${p.key}-${locale}`,
        component: p.component,
        meta: { locale, pageKey: p.key, public: true },
      });
    }
  }
  // Articles: index + dynamic slug route. Currently English-only. when
  // Arabic translations land, mirror these two entries under `/ar/articles`.
  out.push({
    path: '/en/articles',
    name: 'articles-index-en',
    component: ArticlesIndexView,
    meta: { locale: 'en', pageKey: 'articles', public: true },
  });
  out.push({
    path: '/en/articles/:slug',
    name: 'article-en',
    component: ArticleView,
    meta: { locale: 'en', pageKey: 'article', public: true },
  });
  // Arabic visitors who reach either AR articles URL get bounced to the
  // English index until translations exist. Prevents a half-empty page.
  out.push({
    path: '/ar/articles',
    redirect: '/en/articles',
  });
  out.push({
    path: '/ar/articles/:slug',
    redirect: (to) => `/en/articles/${to.params.slug}`,
  });
  return out;
}

// Fallback redirects for old bare paths. The server issues a 301 for the
// same paths before any SPA rendering happens (see server/src/index.js),
// but if the client ever router-navigates to a bare path we still want
// it to land on a real locale-scoped URL rather than 404.
const bareRedirects = [
  { path: '/', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}` },
  { path: '/about', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}/about` },
  { path: '/programs', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}/programs` },
  { path: '/faq', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}/faq` },
  { path: '/contact', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}/contact` },
];

const routes = [
  ...marketingRoutes(),
  ...bareRedirects,

  // Auth routes (unscoped. not indexed, no SEO reason to fork URLs)
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPasswordView.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/auth/ResetPasswordView.vue'),
    meta: { guest: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../views/auth/VerifyEmailView.vue'),
  },
  {
    path: '/enrollment-status',
    name: 'enrollment-status',
    component: () => import('../views/auth/EnrollmentStatusView.vue'),
    meta: { auth: true },
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('../views/auth/ChangePasswordView.vue'),
    meta: { auth: true },
  },

  // Dashboard routes (auth-gated)
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/dashboard/StudentDashboard.vue'),
    meta: { auth: true, role: 'enrolled_student' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    // Both the sheikh ('admin') and a scoped 'teacher' use the same
    // dashboard surface; the server scopes their data and the UI hides
    // sheikh-only sections via `isAdmin` checks. The route guard accepts
    // either role; mismatches are redirected home.
    meta: { auth: true, roles: ['admin', 'teacher'] },
  },

  // Catch-all. redirect unknown paths to the current-locale home.
  { path: '/:pathMatch(.*)*', redirect: () => `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}` },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    // Preserve anchor scrolls (e.g. /en/programs#quran) and back-button
    // scroll positions. Everything else snaps to top.
    if (saved) return saved;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

// Nav guards for auth enforcement + locale sync.
router.beforeEach(async (to) => {
  // Sync vue-i18n to the URL's locale. This is what makes /en/* render
  // English content and /ar/* render Arabic, even on deep links and reloads.
  if (to.meta?.locale && i18n.global.locale.value !== to.meta.locale) {
    setLocale(to.meta.locale);
  }

  // Lazy import to avoid circular dependency (useAuth imports router)
  const { useAuth } = await import('@/composables/useAuth.js');
  const { user, initialized, isAdmin, isStaff } = useAuth();

  // Wait for initial auth check to complete
  if (!initialized.value) {
    await new Promise((resolve) => {
      const unwatch = watch(initialized, (val) => {
        if (val) { unwatch(); resolve(); }
      });
    });
  }

  const isAuthenticated = !!user.value;

  // Guest-only routes (login, register). redirect if already logged in.
  // Sheikh + teachers both land on /admin; everyone else on /dashboard.
  if (to.meta.guest && isAuthenticated) {
    return isStaff.value ? '/admin' : '/dashboard';
  }

  // Auth-required routes. redirect to login if not authenticated
  if (to.meta.auth && !isAuthenticated) {
    return '/login';
  }

  // Role-required routes. Single-role gates use `meta.role`; multi-role
  // gates use `meta.roles` (array). Mismatches go to the locale home.
  const role = user.value?.role;
  if (to.meta.role && role !== to.meta.role) {
    return `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}`;
  }
  if (to.meta.roles && !to.meta.roles.includes(role)) {
    return `/${i18n.global.locale.value === 'ar' ? 'ar' : 'en'}`;
  }
});
