import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AUTH_HEADER_KEYS } from '../../auth/auth.types';

export function attachAuthHeaders(config: InternalAxiosRequestConfig) {
  for (const key of AUTH_HEADER_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      config.headers[key] = value;
    }
  }
  return config;
}

export function saveAuthHeaders(response: AxiosResponse) {
  for (const key of AUTH_HEADER_KEYS) {
    const value = response.headers[key];
    if (value) {
      localStorage.setItem(key, value);
    }
  }
  return response;
}
