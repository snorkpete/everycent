import { describe, it, expect, beforeEach } from 'vitest';
import { getTokens, saveTokens, clearTokens, hasToken } from './authTokens';

describe('authTokens', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getTokens', () => {
    it('returns tokens present in localStorage', () => {
      localStorage.setItem('access-token', 'tok');
      localStorage.setItem('client', 'cli');
      localStorage.setItem('uid', 'user@test.com');

      const tokens = getTokens();

      expect(tokens['access-token']).toBe('tok');
      expect(tokens.client).toBe('cli');
      expect(tokens.uid).toBe('user@test.com');
    });

    it('omits keys not present in localStorage', () => {
      localStorage.setItem('access-token', 'tok');

      const tokens = getTokens();

      expect(tokens['access-token']).toBe('tok');
      expect(tokens.client).toBeUndefined();
      expect(tokens.expiry).toBeUndefined();
    });

    it('returns empty object when localStorage has no auth tokens', () => {
      expect(getTokens()).toEqual({});
    });
  });

  describe('saveTokens', () => {
    it('saves auth header values to localStorage', () => {
      saveTokens({
        'access-token': 'new-tok',
        client: 'new-cli',
        uid: 'new@test.com',
        expiry: '12345',
        'token-type': 'Bearer',
      });

      expect(localStorage.getItem('access-token')).toBe('new-tok');
      expect(localStorage.getItem('client')).toBe('new-cli');
      expect(localStorage.getItem('uid')).toBe('new@test.com');
      expect(localStorage.getItem('expiry')).toBe('12345');
      expect(localStorage.getItem('token-type')).toBe('Bearer');
    });

    it('skips undefined values', () => {
      saveTokens({ 'access-token': 'tok', client: undefined });

      expect(localStorage.getItem('access-token')).toBe('tok');
      expect(localStorage.getItem('client')).toBeNull();
    });

    it('ignores non-auth keys in the input', () => {
      saveTokens({ 'access-token': 'tok', 'x-custom': 'ignored' });

      expect(localStorage.getItem('access-token')).toBe('tok');
      expect(localStorage.getItem('x-custom')).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('removes all auth keys from localStorage', () => {
      localStorage.setItem('access-token', 'tok');
      localStorage.setItem('client', 'cli');
      localStorage.setItem('uid', 'user@test.com');

      clearTokens();

      expect(localStorage.getItem('access-token')).toBeNull();
      expect(localStorage.getItem('client')).toBeNull();
      expect(localStorage.getItem('uid')).toBeNull();
    });

    it('does not remove non-auth keys', () => {
      localStorage.setItem('access-token', 'tok');
      localStorage.setItem('theme', 'dark');

      clearTokens();

      expect(localStorage.getItem('access-token')).toBeNull();
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('hasToken', () => {
    it('returns true when access-token exists', () => {
      localStorage.setItem('access-token', 'tok');

      expect(hasToken()).toBe(true);
    });

    it('returns false when access-token is absent', () => {
      expect(hasToken()).toBe(false);
    });
  });
});
