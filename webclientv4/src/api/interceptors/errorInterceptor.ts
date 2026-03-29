import { AUTH_HEADER_KEYS } from '../../auth/auth.types';

export function handle401(error: unknown): Promise<never> {
  const status = (error as { response?: { status?: number } }).response?.status;
  if (status === 401 && window.location.hash !== '#/login') {
    for (const key of AUTH_HEADER_KEYS) {
      localStorage.removeItem(key);
    }
    window.location.replace('/#/login');
  }
  return Promise.reject(error);
}
