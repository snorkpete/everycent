export const AUTH_TOKEN_KEY = 'auth-token';

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function hasToken(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}
