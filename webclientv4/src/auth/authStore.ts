import { ref } from 'vue';
import { defineStore } from 'pinia';
import { authApi } from './authApi';
import { clearTokens, hasToken } from './authTokens';

function extractAuthError(e: unknown, fallback: string): string {
  const errors = (e as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
  return errors?.[0] ?? fallback;
}

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
      error.value = extractAuthError(e, 'Login failed');
      throw e;
    }
  }

  async function logInWithGoogle(credential: string) {
    error.value = null;
    try {
      await authApi.googleSignIn(credential);
      loggedIn.value = true;
    } catch (e: unknown) {
      loggedIn.value = false;
      error.value = extractAuthError(e, 'Google sign-in failed');
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
      loggedIn.value = response.success === true;
      return loggedIn.value;
    } catch {
      loggedIn.value = false;
      return false;
    }
  }

  return { loggedIn, error, logIn, logInWithGoogle, logOut, checkSession };
});
