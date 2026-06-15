import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, saveToken, clearToken, hasToken, AUTH_TOKEN_KEY } from './authTokens';

describe('authTokens', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getToken', () => {
    it('returns the token when present in localStorage', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');

      expect(getToken()).toBe('tok-abc');
    });

    it('returns null when the token is absent', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('saves the token to localStorage', () => {
      saveToken('new-token');

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token');
    });

    it('overwrites an existing token', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'old-token');
      saveToken('new-token');

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token');
    });
  });

  describe('clearToken', () => {
    it('removes the auth token from localStorage', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');

      clearToken();

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });

    it('does not remove unrelated localStorage keys', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');
      localStorage.setItem('theme', 'dark');

      clearToken();

      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('hasToken', () => {
    it('returns true when the token exists', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'tok-abc');

      expect(hasToken()).toBe(true);
    });

    it('returns false when the token is absent', () => {
      expect(hasToken()).toBe(false);
    });
  });
});
