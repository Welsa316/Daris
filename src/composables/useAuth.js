import { ref, computed, readonly } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/config/api.js';

const user = ref(null);
const loading = ref(true);
const initialized = ref(false);

export function useAuth() {
  const router = useRouter();

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isEnrolled = computed(() => user.value?.role === 'enrolled_student');
  const isPending = computed(() =>
    user.value?.role === 'pending' || user.value?.role === 'pending_review'
  );
  const userRole = computed(() => user.value?.role || null);

  async function fetchUser() {
    try {
      loading.value = true;
      const data = await api.get('/api/auth/me');
      user.value = data.user;
    } catch {
      user.value = null;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    user.value = data.user;
    return data;
  }

  async function register(formData) {
    return api.post('/api/auth/register', formData);
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Proceed even if server call fails
    }
    user.value = null;
    router.push('/login');
  }

  async function logoutAll() {
    await api.post('/api/auth/logout-all');
    user.value = null;
    router.push('/login');
  }

  async function refreshToken() {
    try {
      const data = await api.post('/api/auth/refresh');
      if (data.user) {
        // Update role in case it changed
        if (user.value) {
          user.value.role = data.user.role;
        }
      }
      return true;
    } catch {
      user.value = null;
      return false;
    }
  }

  async function changePassword(currentPassword, newPassword) {
    const data = await api.post('/api/auth/change-password', { currentPassword, newPassword });
    user.value = null;
    return data;
  }

  async function forgotPassword(email) {
    return api.post('/api/auth/forgot-password', { email });
  }

  async function resetPassword(token, password) {
    return api.post('/api/auth/reset-password', { token, password });
  }

  async function verifyEmail(token) {
    return api.post('/api/auth/verify-email', { token });
  }

  async function resendVerification(email) {
    return api.post('/api/auth/resend-verification', { email });
  }

  // Initialize auth state on first use
  if (!initialized.value) {
    fetchUser();
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    initialized: readonly(initialized),
    isAuthenticated,
    isAdmin,
    isEnrolled,
    isPending,
    userRole,
    login,
    register,
    logout,
    logoutAll,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    fetchUser,
  };
}
