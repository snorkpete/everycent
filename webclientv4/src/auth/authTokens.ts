import { AUTH_HEADER_KEYS, type AuthCredentials } from './auth.types';

export function getTokens(): Partial<AuthCredentials> {
  const tokens: Partial<AuthCredentials> = {};
  for (const key of AUTH_HEADER_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      tokens[key] = value;
    }
  }
  return tokens;
}

export function saveTokens(headers: Record<string, string | undefined>) {
  for (const key of AUTH_HEADER_KEYS) {
    const value = headers[key];
    if (value !== undefined) {
      localStorage.setItem(key, value);
    }
  }
}

export function clearTokens() {
  for (const key of AUTH_HEADER_KEYS) {
    localStorage.removeItem(key);
  }
}

export function hasToken(): boolean {
  return localStorage.getItem(AUTH_HEADER_KEYS[0]) !== null;
}
