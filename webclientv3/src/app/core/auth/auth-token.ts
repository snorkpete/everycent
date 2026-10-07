// The Vue app (webclientv4) owns login and stores the session token under
// this key. v3 shares the same origin, so it just reads and clears it.
export const AUTH_TOKEN_KEY = "auth-token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
