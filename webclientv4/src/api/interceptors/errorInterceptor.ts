import { useAuthStore } from '../../auth/authStore';

export function handle401(error: unknown): Promise<never> {
  const status = (error as { response?: { status?: number } }).response?.status;
  // NOTE: the /#/login guard relies on hash-mode routing (createWebHashHistory).
  // If the router is ever migrated to path-based history, this check must change.
  if (status === 401 && window.location.hash !== '#/login') {
    useAuthStore().invalidateSession();
    window.location.replace('/#/login');
  }
  return Promise.reject(error);
}
