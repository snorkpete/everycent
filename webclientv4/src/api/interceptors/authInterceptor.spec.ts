import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders } from 'axios';
import { attachAuthHeaders } from './authInterceptor';
import { AUTH_TOKEN_KEY } from '../../auth/authTokens';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('attachAuthHeaders', () => {
    it('sets Authorization: Bearer <token> when a token exists', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'my-token');

      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.get('Authorization')).toBe('Bearer my-token');
    });

    it('leaves config unchanged when no token is stored', () => {
      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.has('Authorization')).toBe(false);
    });

    it('returns the config object', () => {
      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);
      expect(result).toBe(config);
    });
  });
});
