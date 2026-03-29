import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getTokens, saveTokens } from '../../auth/authTokens';

export function attachAuthHeaders(config: InternalAxiosRequestConfig) {
  const tokens = getTokens();
  for (const [key, value] of Object.entries(tokens)) {
    config.headers[key] = value;
  }
  return config;
}

export function saveAuthHeaders(response: AxiosResponse) {
  saveTokens(response.headers as Record<string, string | undefined>);
  return response;
}
