import { clearTokens } from '../../auth/authTokens';

export function handle401(error: unknown): Promise<never> {
  const status = (error as { response?: { status?: number } }).response?.status;
  if (status === 401 && window.location.hash !== '#/login') {
    clearTokens();
    window.location.replace('/#/login');
  }
  return Promise.reject(error);
}
