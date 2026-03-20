import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import ProgramsView from '../views/ProgramsView.vue';
import ContactView from '../views/ContactView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/programs', name: 'programs', component: ProgramsView },
  { path: '/contact', name: 'contact', component: ContactView },

  // Auth routes
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

  // Dashboard routes
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
    meta: { auth: true, role: 'admin' },
  },

  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});
