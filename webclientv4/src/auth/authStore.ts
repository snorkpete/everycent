import { ref } from 'vue';
import { defineStore } from 'pinia';
import { authApi } from './authApi';
import { clearToken, hasToken, saveToken } from './authTokens';

function extractAuthError(e: unknown, fallback: string): string {
  const errors = (e as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
  return errors?.[0] ?? fallback;
}

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);
  const error = ref<string | null>(null);

  async function logInWithGoogle(credential: string) {
    error.value = null;
    try {
      const response = await authApi.googleSignIn(credential);
      saveToken(response.data.token);
      loggedIn.value = true;
    } catch (e: unknown) {
      loggedIn.value = false;
      error.value = extractAuthError(e, 'Google sign-in failed');
      throw e;
    }
  }

  // Called by handle401 when the server rejects a session mid-flight.
  // Clears local auth state without calling the server (the server already
  // told us the session is gone). handle401 then redirects to /login.
  function invalidateSession() {
    clearToken();
    loggedIn.value = false;
  }

  async function logOut() {
    try {
      await authApi.signOut();
    } catch {
      // best-effort: logout always proceeds even if the server call fails
    }
    clearToken();
    loggedIn.value = false;
  }

  async function checkSession(): Promise<boolean> {
    if (loggedIn.value) return true;
    if (!hasToken()) return false;

    try {
      const response = await authApi.validateToken();
      if (response.success === true) {
        loggedIn.value = true;
        return true;
      }
    } catch {
      // fall through to invalidate below
    }

    // Token present but the server rejected it (or the request failed) —
    // clear the stale token so we don't re-validate it on every load.
    invalidateSession();
    return false;
  }

  return { loggedIn, error, logInWithGoogle, logOut, checkSession, invalidateSession };
});
