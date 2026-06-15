import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { handle401 } from './errorInterceptor';
import { AUTH_TOKEN_KEY } from '../../auth/authTokens';

// Mock at the gateway layer (consistent with the other auth specs). handle401
// only calls the store's invalidateSession (no network), but mocking the gateway
// keeps the real authStore/authApi in the path without creating a live axios client.
vi.mock('../api-gateway', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('errorInterceptor', () => {
  const locationMock = { hash: '', replace: vi.fn() };

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    locationMock.replace.mockClear();
    locationMock.hash = '';
    vi.stubGlobal('location', locationMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('handle401', () => {
    it('clears the auth token from localStorage on a 401', async () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');

      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });

    it('does not remove unrelated localStorage keys on a 401', async () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');
      localStorage.setItem('theme', 'dark');

      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('sets loggedIn to false on a 401', async () => {
      const { useAuthStore } = await import('../../auth/authStore');
      const store = useAuthStore();
      store.loggedIn = true;

      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(store.loggedIn).toBe(false);
    });

    it('redirects to /#/login on a 401', async () => {
      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(locationMock.replace).toHaveBeenCalledWith('/#/login');
    });

    it('does not redirect when already on the login page', async () => {
      locationMock.hash = '#/login';

      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(locationMock.replace).not.toHaveBeenCalled();
    });

    it('does not redirect for non-401 errors', async () => {
      await handle401({ response: { status: 500 } }).catch(() => {});

      expect(locationMock.replace).not.toHaveBeenCalled();
    });

    it('rejects the promise with the original error', async () => {
      const error = new Error('network error');

      await expect(handle401(error)).rejects.toBe(error);
    });
  });
});
