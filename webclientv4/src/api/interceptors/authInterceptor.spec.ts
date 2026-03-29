import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { attachAuthHeaders, saveAuthHeaders } from './authInterceptor';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('attachAuthHeaders', () => {
    it('attaches auth headers from localStorage to the request', () => {
      const accessToken = 'test-token';
      const client = 'test-client';
      const uid = 'test@example.com';

      localStorage.setItem('access-token', accessToken);
      localStorage.setItem('client', client);
      localStorage.setItem('uid', uid);

      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.get('access-token')).toBe(accessToken);
      expect(result.headers.get('client')).toBe(client);
      expect(result.headers.get('uid')).toBe(uid);
    });

    it('skips headers not present in localStorage', () => {
      localStorage.setItem('access-token', 'test-token');

      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.get('access-token')).toBe('test-token');
      expect(result.headers.has('client')).toBe(false);
      expect(result.headers.has('expiry')).toBe(false);
      expect(result.headers.has('token-type')).toBe(false);
      expect(result.headers.has('uid')).toBe(false);
    });

    it('does not attach any headers when localStorage is empty', () => {
      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.has('access-token')).toBe(false);
      expect(result.headers.has('client')).toBe(false);
      expect(result.headers.has('expiry')).toBe(false);
      expect(result.headers.has('token-type')).toBe(false);
      expect(result.headers.has('uid')).toBe(false);
    });

    it('returns the config object', () => {
      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);
      expect(result).toBe(config);
    });
  });

  describe('saveAuthHeaders', () => {
    it('saves auth headers from response to localStorage', () => {
      const response = {
        headers: {
          'access-token': 'new-token',
          client: 'new-client',
          uid: 'new@example.com',
          expiry: '12345',
          'token-type': 'Bearer',
        },
        data: {},
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      saveAuthHeaders(response);

      expect(localStorage.getItem('access-token')).toBe('new-token');
      expect(localStorage.getItem('client')).toBe('new-client');
      expect(localStorage.getItem('uid')).toBe('new@example.com');
      expect(localStorage.getItem('expiry')).toBe('12345');
      expect(localStorage.getItem('token-type')).toBe('Bearer');
    });

    it('skips headers not present in response', () => {
      const response = {
        headers: { 'access-token': 'new-token' },
        data: {},
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      saveAuthHeaders(response);

      expect(localStorage.getItem('access-token')).toBe('new-token');
      expect(localStorage.getItem('client')).toBeNull();
      expect(localStorage.getItem('expiry')).toBeNull();
      expect(localStorage.getItem('token-type')).toBeNull();
      expect(localStorage.getItem('uid')).toBeNull();
    });

    it('returns the response unchanged', () => {
      const response = {
        headers: {},
        data: { foo: 'bar' },
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      const result = saveAuthHeaders(response);
      expect(result).toBe(response);
    });
  });
});
