import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { authApi } from './authApi';
import { clearTokens, hasToken } from './authTokens';

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);
  const error = ref<string | null>(null);

  async function logIn(email: string, password: string) {
    error.value = null;
    try {
      await authApi.signIn(email, password);
      loggedIn.value = true;
    } catch (e: unknown) {
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
    clearTokens();
    loggedIn.value = false;
  }

  async function checkSession(): Promise<boolean> {
    if (loggedIn.value) return true;

    if (!hasToken()) {
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

  return { loggedIn, error, logIn, logOut, checkSession };
});
