import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from './index';
import { authApi } from '../auth/authApi';
import { settingsApi } from '../app/settings/settingsApi';
import { bankAccountApi } from '../app/bank-accounts/bankAccountApi';
import { allocationCategoryApi } from '../app/allocation-categories/allocationCategoryApi';

vi.mock('../auth/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('../app/settings/settingsApi', () => ({
  settingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('../app/bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('../app/allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

describe('router', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
    // Mock settings APIs so the router guard doesn't fail on authenticated routes
    vi.mocked(settingsApi.get).mockResolvedValue({});
    vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);
    vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);
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
    } as unknown);

    await router.push('/');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('routes /setup/bank-accounts to setup-bank-accounts when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as unknown);

    await router.push('/setup/bank-accounts');

    expect(router.currentRoute.value.name).toBe('setup-bank-accounts');
  });

  it('routes /setup/allocation-categories to setup-allocation-categories when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as unknown);

    await router.push('/setup/allocation-categories');

    expect(router.currentRoute.value.name).toBe('setup-allocation-categories');
  });

  it('routes /setup/institutions to setup-institutions when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as unknown);

    await router.push('/setup/institutions');

    expect(router.currentRoute.value.name).toBe('setup-institutions');
  });

  it('routes /setup/settings to setup-settings when authenticated', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as unknown);

    await router.push('/setup/settings');

    expect(router.currentRoute.value.name).toBe('setup-settings');
  });

  it('fetches settings on every authenticated navigation', async () => {
    localStorage.setItem('access-token', 'valid-token');
    vi.mocked(authApi.validateToken).mockResolvedValue({
      data: { success: true },
    } as unknown);

    await router.push('/');
    vi.mocked(settingsApi.get).mockClear();

    await router.push('/budgets');

    expect(settingsApi.get).toHaveBeenCalledTimes(1);
  });

  it('does not fetch settings when navigating to login', async () => {
    vi.mocked(settingsApi.get).mockClear();

    await router.push('/login');

    expect(settingsApi.get).not.toHaveBeenCalled();
  });
});
