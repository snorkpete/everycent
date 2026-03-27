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

function authenticateUser() {
  localStorage.setItem('access-token', 'valid-token');
  vi.mocked(authApi.validateToken).mockResolvedValue({
    data: { success: true },
  } as any);
}

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
    authenticateUser();

    await router.push('/');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('routes /setup/bank-accounts to setup-bank-accounts when authenticated', async () => {
    authenticateUser();

    await router.push('/setup/bank-accounts');

    expect(router.currentRoute.value.name).toBe('setup-bank-accounts');
  });

  it('routes /setup/allocation-categories to setup-allocation-categories when authenticated', async () => {
    authenticateUser();

    await router.push('/setup/allocation-categories');

    expect(router.currentRoute.value.name).toBe('setup-allocation-categories');
  });

  it('routes /setup/institutions to setup-institutions when authenticated', async () => {
    authenticateUser();

    await router.push('/setup/institutions');

    expect(router.currentRoute.value.name).toBe('setup-institutions');
  });

  it('routes /setup/settings to setup-settings when authenticated', async () => {
    authenticateUser();

    await router.push('/setup/settings');

    expect(router.currentRoute.value.name).toBe('setup-settings');
  });

  describe('page titles', () => {
    it('sets document title to "EveryCent" for home route', async () => {
      authenticateUser();

      await router.push('/');

      expect(document.title).toBe('EveryCent');
    });

    it.each([
      ['/login', 'Login - EveryCent'],
      ['/setup/bank-accounts', 'Bank Accounts - EveryCent'],
      ['/setup/allocation-categories', 'Allocation Categories - EveryCent'],
      ['/setup/institutions', 'Institutions - EveryCent'],
      ['/setup/settings', 'Settings - EveryCent'],
      ['/budgets/future', 'Future Budgets - EveryCent'],
      ['/budgets', 'Budgets - EveryCent'],
      ['/budgets/123', 'Budget - EveryCent'],
      ['/transactions', 'Transactions - EveryCent'],
      ['/import', 'Transaction Import - EveryCent'],
      ['/account-balances', 'Account Balances - EveryCent'],
      ['/sink-funds', 'Sink Funds - EveryCent'],
      ['/special-events', 'Special Events - EveryCent'],
      ['/special-events/1', 'Special Event - EveryCent'],
      ['/special-events/1/allocations', 'Special Event Allocations - EveryCent'],
    ])('route %s sets title to "%s"', async (path, expectedTitle) => {
      authenticateUser();

      await router.push(path);

      expect(document.title).toBe(expectedTitle);
    });
  });
});
