import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from './index';
import { authApi } from '../auth/authApi';
import { settingsApi } from '../app/settings/settingsApi';
import { bankAccountApi } from '../app/bank-accounts/bankAccountApi';
import { allocationCategoryApi } from '../app/allocation-categories/allocationCategoryApi';

vi.mock('../auth/authApi', () => ({
  authApi: {
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

function authenticateUser() {
  localStorage.setItem('auth-token', 'valid-token');
  vi.mocked(authApi.validateToken).mockResolvedValue({
    success: true,
    data: { email: 'user@test.com' },
  });
}

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

  it('routes /chat/settings to chat-settings when authenticated', async () => {
    authenticateUser();

    await router.push('/chat/settings');

    expect(router.currentRoute.value.name).toBe('chat-settings');
  });

  it('redirects /setup/chat-settings to /chat/settings', async () => {
    authenticateUser();

    await router.push('/setup/chat-settings');

    expect(router.currentRoute.value.path).toBe('/chat/settings');
  });

  it('routes /chat/models to chat-models when authenticated', async () => {
    authenticateUser();

    await router.push('/chat/models');

    expect(router.currentRoute.value.name).toBe('chat-models');
  });

  it('routes /chat/usage to chat-usage when authenticated', async () => {
    authenticateUser();

    await router.push('/chat/usage');

    expect(router.currentRoute.value.name).toBe('chat-usage');
  });

  it('fetches settings on every authenticated navigation', async () => {
    authenticateUser();

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
      ['/chat/settings', 'Chat Settings - EveryCent'],
      ['/chat/models', 'Model Registry - EveryCent'],
      ['/chat/usage', 'Usage Log - EveryCent'],
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
