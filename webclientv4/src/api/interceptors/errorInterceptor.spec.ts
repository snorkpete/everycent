import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handle401 } from './errorInterceptor';

describe('errorInterceptor', () => {
  const locationMock = { hash: '', replace: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    locationMock.replace.mockClear();
    locationMock.hash = '';
    vi.stubGlobal('location', locationMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('handle401', () => {
    it('clears all auth tokens from localStorage on a 401', async () => {
      localStorage.setItem('access-token', 'token');
      localStorage.setItem('uid', 'user@example.com');

      await handle401({ response: { status: 401 } }).catch(() => {});

      expect(localStorage.getItem('access-token')).toBeNull();
      expect(localStorage.getItem('uid')).toBeNull();
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
