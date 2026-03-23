import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';
import { authApi } from './authApi';
import { AUTH_HEADER_KEYS } from './auth.types';

vi.mock('./authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
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
      vi.mocked(authApi.signIn).mockResolvedValue({} as never);

      const store = useAuthStore();
      await store.logIn('user@test.com', 'password');

      expect(store.loggedIn).toBe(true);
      expect(store.error).toBeNull();
      expect(authApi.signIn).toHaveBeenCalledWith('user@test.com', 'password');
    });

    it('sets error and clears credentials on failed login', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { errors: ['Invalid credentials'] } },
      };
      vi.mocked(authApi.signIn).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'wrong')).rejects.toEqual(
        axiosError,
      );

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Invalid credentials');
    });

    it('falls back to "Login failed" when axios error has no error messages', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: {} },
      };
      vi.mocked(authApi.signIn).mockRejectedValue(axiosError);

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'wrong')).rejects.toEqual(
        axiosError,
      );

      expect(store.error).toBe('Login failed');
    });

    it('sets generic error for non-axios failures', async () => {
      vi.mocked(authApi.signIn).mockRejectedValue(new Error('Network error'));

      const store = useAuthStore();

      await expect(store.logIn('user@test.com', 'pass')).rejects.toThrow(
        'Network error',
      );

      expect(store.loggedIn).toBe(false);
      expect(store.error).toBe('Login failed');
    });
  });

  describe('logOut', () => {
    it('clears loggedIn and removes auth keys from localStorage', async () => {
      for (const key of AUTH_HEADER_KEYS) {
        localStorage.setItem(key, 'some-value');
      }

      vi.mocked(authApi.signIn).mockResolvedValue({} as never);

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
      vi.mocked(authApi.signIn).mockResolvedValue({} as never);

      const store = useAuthStore();
      await store.logIn('user@test.com', 'password');

      const result = await store.checkSession();

      expect(result).toBe(true);
      expect(authApi.validateToken).not.toHaveBeenCalled();
    });

    it('returns false if no token in localStorage', async () => {
      const store = useAuthStore();

      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
      expect(authApi.validateToken).not.toHaveBeenCalled();
    });

    it('validates token and sets loggedIn on success', async () => {
      localStorage.setItem('access-token', 'valid-token');
      vi.mocked(authApi.validateToken).mockResolvedValue({
        data: { success: true },
      } as never);

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(true);
      expect(store.loggedIn).toBe(true);
      expect(authApi.validateToken).toHaveBeenCalled();
    });

    it('sets loggedIn to false when validation returns success !== true', async () => {
      localStorage.setItem('access-token', 'some-token');
      vi.mocked(authApi.validateToken).mockResolvedValue({
        data: { success: false },
      } as never);

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
    });

    it('returns false when token validation fails', async () => {
      localStorage.setItem('access-token', 'expired-token');
      vi.mocked(authApi.validateToken).mockRejectedValue(
        new Error('Unauthorized'),
      );

      const store = useAuthStore();
      const result = await store.checkSession();

      expect(result).toBe(false);
      expect(store.loggedIn).toBe(false);
    });
  });
});
