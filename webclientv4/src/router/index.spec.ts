import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from './index';
import { authApi } from '../auth/authApi';

vi.mock('../auth/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe('router', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
    // Start at a known location
    await router.push('/login');
  });

  it('allows access to login route without auth', async () => {
    await router.push('/login');

    expect(router.currentRoute.value.name).toBe('login');
  });

  it('redirects to login when not authenticated', async () => {
    await router.push('/');

    expect(router.currentRoute.value.name).toBe('login');
  });

  it('allows access to protected routes when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as any);

    await router.push('/');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('routes /setup/bank-accounts to setup-bank-accounts when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as any);

    await router.push('/setup/bank-accounts');

    expect(router.currentRoute.value.name).toBe('setup-bank-accounts');
  });
});
