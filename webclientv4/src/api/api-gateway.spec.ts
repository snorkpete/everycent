import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import apiGateway, { attachAuthHeaders, saveAuthHeaders } from './api-gateway';

describe('api-gateway', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets base URL to localhost:3000 in non-production', () => {
    expect(apiGateway.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('sets Content-Type to application/json', () => {
    expect(apiGateway.defaults.headers['Content-Type']).toBe(
      'application/json',
    );
  });

  describe('request interceptor', () => {
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
      const accessToken = 'test-token';

      localStorage.setItem('access-token', accessToken);

      const config = { headers: new AxiosHeaders() };
      const result = attachAuthHeaders(config);

      expect(result.headers.get('access-token')).toBe(accessToken);
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

  describe('response interceptor', () => {
    it('saves auth headers from response to localStorage', () => {
      const accessToken = 'new-token';
      const client = 'new-client';
      const uid = 'new@example.com';
      const expiry = '12345';
      const tokenType = 'Bearer';

      const response = {
        headers: {
          'access-token': accessToken,
          client,
          uid,
          expiry,
          'token-type': tokenType,
        },
        data: {},
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      saveAuthHeaders(response);

      expect(localStorage.getItem('access-token')).toBe(accessToken);
      expect(localStorage.getItem('client')).toBe(client);
      expect(localStorage.getItem('uid')).toBe(uid);
      expect(localStorage.getItem('expiry')).toBe(expiry);
      expect(localStorage.getItem('token-type')).toBe(tokenType);
    });

    it('skips headers not present in response', () => {
      const accessToken = 'new-token';

      const response = {
        headers: { 'access-token': accessToken },
        data: {},
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      saveAuthHeaders(response);

      expect(localStorage.getItem('access-token')).toBe(accessToken);
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
