import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';
import apiGateway from '../api/api-gateway';

// Mock at the gateway layer, not authApi — this keeps the real authApi in the
// path so the store is tested against the same code it runs in production.
vi.mock('../api/api-gateway', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('logInWithGoogle', () => {
    it('saves body token, sets loggedIn to true on successful sign-in', async () => {
      const credential = 'google-credential-token';
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-google' } },
      });

      const store = useAuthStore();
      await store.logInWithGoogle(credential);

      expect(store.loggedIn).toBe(true);
      expect(store.error).toBeNull();
      expect(localStorage.getItem('auth-token')).toBe('tok-google');
      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', { credential });
    });

    it('sets error and does not save token on failed sign-in', async () => {
      const serverError = {
        response: { data: { errors: ['No account found for this Google identity'] } },
      };
      vi.mocked(apiGateway.post).mockRejectedValue(serverError);

      const store = useAuthStore();

      await expect(store.logInWithGoogle('bad-token')).rejects.toEqual(serverError);

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('No account found for this Google identity');
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('falls back to "Google sign-in failed" when error has no server error messages', async () => {
      const serverError = { response: { data: {} } };
      vi.mocked(apiGateway.post).mockRejectedValue(serverError);

      const store = useAuthStore();

      await expect(store.logInWithGoogle('bad-token')).rejects.toEqual(serverError);

      expect(store.error).toBe('Google sign-in failed');
    });

    it('sets generic error for failures without a response payload', async () => {
      vi.mocked(apiGateway.post).mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();

      await expect(store.logInWithGoogle('token')).rejects.toThrow('Network error');

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Google sign-in failed');
    });
  });

  describe('logOut', () => {
    it('calls signOut, clears token, and sets loggedIn to false', async () => {
      localStorage.setItem('auth-token', 'tok-abc');
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-abc' } },
      });
      vi.mocked(apiGateway.delete).mockResolvedValue({ status: 204 });

      const store = useAuthStore();
      await store.logInWithGoogle('credential');
      await store.logOut();

      expect(store.loggedIn).toBe(false);
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(apiGateway.delete).toHaveBeenCalledWith('/auth/sign_out');
    });

    it('clears token and sets loggedIn to false even when signOut rejects', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-abc' } },
      });
      vi.mocked(apiGateway.delete).mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();
      await store.logInWithGoogle('credential');

      await store.logOut();

      expect(store.loggedIn).toBe(false);
      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });

  describe('invalidateSession', () => {
    it('clears the token and sets loggedIn to false without calling the server', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-abc' } },
      });

      const store = useAuthStore();
      await store.logInWithGoogle('credential');

      store.invalidateSession();

      expect(store.loggedIn).toBe(false);
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(apiGateway.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkSession', () => {
    it('returns true immediately if already logged in', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-abc' } },
      });

      const store = useAuthStore();
      await store.logInWithGoogle('credential');

      const result = await store.checkSession();

      expect(result).toBe(true);
      expect(apiGateway.get).not.toHaveBeenCalled();
    });

    it('returns false if no token in localStorage', async () => {
      const store = useAuthStore();

      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
      expect(apiGateway.get).not.toHaveBeenCalled();
    });

    it('validates token and sets loggedIn on success', async () => {
      localStorage.setItem('auth-token', 'valid-token');
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true },
      });

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(true);
      expect(store.loggedIn).toBe(true);
      expect(apiGateway.get).toHaveBeenCalledWith('/auth/validate');
    });

    it('clears the stale token when validation returns success !== true', async () => {
      localStorage.setItem('auth-token', 'some-token');
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: false },
      });

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('clears the stale token when validation fails', async () => {
      localStorage.setItem('auth-token', 'expired-token');
      vi.mocked(apiGateway.get).mockRejectedValue(new Error('Unauthorized'));

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });
});
