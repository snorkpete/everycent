import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import type { VueWrapper } from '@vue/test-utils';
import AccountBalanceSummaryStripMobile from './AccountBalanceSummaryStripMobile.vue';
import { buildAccountBalance } from '../../test/factories';

vi.mock('./accountBalanceApi', () => ({
  accountBalanceApi: {
    getAll: vi.fn(),
    adjustBalances: vi.fn(),
  },
}));

function createWrapper(): VueWrapper {
  return mount(AccountBalanceSummaryStripMobile, {
    global: {
      plugins: [pinia],
    },
  });
}

let pinia: Pinia;

describe('AccountBalanceSummaryStripMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  async function seedStore() {
    const { accountBalanceApi } = await import('./accountBalanceApi');
    vi.mocked(accountBalanceApi.getAll).mockResolvedValue([
      buildAccountBalance({
        id: 1,
        account_category: 'asset',
        is_cash: true,
        current_balance: 500000,
      }),
      buildAccountBalance({
        id: 2,
        account_category: 'liability',
        is_cash: true,
        current_balance: -300000,
      }),
    ]);

    const { useAccountBalanceStore } = await import('./accountBalanceStore');
    const store = useAccountBalanceStore();
    await store.fetch();
    await flushPromises();
  }

  it('renders the summary strip', async () => {
    await seedStore();
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(true);
  });

  it('displays Assets label and value', async () => {
    await seedStore();
    const wrapper = createWrapper();

    const cell = wrapper.find('[data-testid="summary-total-assets"]');
    expect(cell.text()).toContain('Assets');
    expect(cell.text()).toContain('5,000.00');
  });

  it('displays Liabilities label and value', async () => {
    await seedStore();
    const wrapper = createWrapper();

    const cell = wrapper.find('[data-testid="summary-total-liabilities"]');
    expect(cell.text()).toContain('Liabilities');
    expect(cell.text()).toContain('-3,000.00');
  });

  it('displays Net Worth label and value', async () => {
    await seedStore();
    const wrapper = createWrapper();

    const cell = wrapper.find('[data-testid="summary-net-worth"]');
    expect(cell.text()).toContain('Net Worth');
    expect(cell.text()).toContain('2,000.00');
  });

  it('uses EcMoneyDisplay for all three values', async () => {
    await seedStore();
    const wrapper = createWrapper();

    const moneyDisplays = wrapper.findAllComponents({ name: 'EcMoneyDisplay' });
    expect(moneyDisplays.length).toBe(3);
  });
});
