import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { authApi } from './authApi';
import { AUTH_HEADER_KEYS } from './auth.types';

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);
  const error = ref<string | null>(null);

  async function logIn(email: string, password: string) {
    error.value = null;
    try {
      await authApi.signIn(email, password);
      loggedIn.value = true;
    } catch (e: unknown) {
      clearCredentials();
      loggedIn.value = false;
      if (axios.isAxiosError(e)) {
        error.value = e.response?.data?.errors?.[0] ?? 'Login failed';
      } else {
        error.value = 'Login failed';
      }
      throw e;
    }
  }

  function logOut() {
    clearCredentials();
    loggedIn.value = false;
  }

  async function checkSession(): Promise<boolean> {
    if (loggedIn.value) return true;

    const token = localStorage.getItem('access-token');
    if (!token) {
      loggedIn.value = false;
      return false;
    }

    try {
      const response = await authApi.validateToken();
      loggedIn.value = response.data.success === true;
      return loggedIn.value;
    } catch {
      loggedIn.value = false;
      return false;
    }
  }

  function clearCredentials() {
    for (const key of AUTH_HEADER_KEYS) {
      localStorage.removeItem(key);
    }
  }

  return { loggedIn, error, logIn, logOut, checkSession };
});
