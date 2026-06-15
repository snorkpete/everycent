import type { InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../../auth/authTokens';

export function attachAuthHeaders(config: InternalAxiosRequestConfig) {
  const token = getToken();
  if (token !== null) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}
