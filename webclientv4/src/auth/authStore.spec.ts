import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';
import apiGateway from '../api/api-gateway';
import { AUTH_HEADER_KEYS } from './auth.types';

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
    vi.restoreAllMocks();
  });

  describe('logIn', () => {
    it('sets loggedIn to true on successful login', async () => {
      const email = 'user@test.com';
      const password = 'password';
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      const store = useAuthStore();
      await store.logIn(email, password);

      expect(store.loggedIn).toBe(true);
      expect(store.error).toBeNull();
      expect(apiGateway.post).toHaveBeenCalledWith('/auth/sign_in', { email, password });
    });

    it('sets error on failed login', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { errors: ['Invalid credentials'] } },
      };
      vi.mocked(apiGateway.post).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'wrong')).rejects.toEqual(axiosError);

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Invalid credentials');
    });

    it('falls back to "Login failed" when axios error has no error messages', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: {} },
      };
      vi.mocked(apiGateway.post).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'wrong')).rejects.toEqual(axiosError);

      expect(store.error).toBe('Login failed');
    });

    it('sets generic error for non-axios failures', async () => {
      vi.mocked(apiGateway.post).mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'pass')).rejects.toThrow('Network error');

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Login failed');
    });
  });

  describe('logInWithGoogle', () => {
    it('sets loggedIn to true on successful Google sign-in', async () => {
      const credential = 'google-credential-token';
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      const store = useAuthStore();
      await store.logInWithGoogle(credential);

      expect(store.loggedIn).toBe(true);
      expect(store.error).toBeNull();
      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', { credential });
    });

    it('sets error on failed Google sign-in', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { errors: ['No account found for this Google identity'] } },
      };
      vi.mocked(apiGateway.post).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logInWithGoogle('bad-token')).rejects.toEqual(axiosError);

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('No account found for this Google identity');
    });

    it('falls back to "Google sign-in failed" when axios error has no error messages', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: {} },
      };
      vi.mocked(apiGateway.post).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logInWithGoogle('bad-token')).rejects.toEqual(axiosError);

      expect(store.error).toBe('Google sign-in failed');
    });

    it('sets generic error for non-axios failures', async () => {
      vi.mocked(apiGateway.post).mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();

      await expect(store.logInWithGoogle('token')).rejects.toThrow('Network error');

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Google sign-in failed');
    });
  });

  describe('logOut', () => {
    it('clears loggedIn and removes auth keys from localStorage', async () => {
      for (const key of AUTH_HEADER_KEYS) {
        localStorage.setItem(key, 'some-value');
      }

      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      const store = useAuthStore();
      await store.logIn('user@test.com', 'password');
      store.logOut();

      expect(store.loggedIn).toBe(false);
      for (const key of AUTH_HEADER_KEYS) {
        expect(localStorage.getItem(key)).toBeNull();
      }
    });
  });

  describe('checkSession', () => {
    it('returns true immediately if already logged in', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      const store = useAuthStore();
      await store.logIn('user@test.com', 'password');

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
      localStorage.setItem('access-token', 'valid-token');
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true },
      });

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(true);
      expect(store.loggedIn).toBe(true);
      expect(apiGateway.get).toHaveBeenCalledWith('/auth/validate_token');
    });

    it('sets loggedIn to false when validation returns success !== true', async () => {
      localStorage.setItem('access-token', 'some-token');
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: false },
      });

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
    });

    it('returns false when token validation fails', async () => {
      localStorage.setItem('access-token', 'expired-token');
      vi.mocked(apiGateway.get).mockRejectedValue(new Error('Unauthorized'));

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
    });
  });
});
