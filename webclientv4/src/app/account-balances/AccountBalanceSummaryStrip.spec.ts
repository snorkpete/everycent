import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { reactive } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import AccountBalanceSummaryStrip from './AccountBalanceSummaryStrip.vue';

const mockStore = reactive({
  totalAssets: 500000,
  totalLiabilities: -300000,
  netCurrentCash: 100000,
  netCashAssets: 200000,
  netNonCashAssets: -100000,
  netWorth: 200000,
});

vi.mock('./accountBalanceStore', () => ({
  useAccountBalanceStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(AccountBalanceSummaryStrip, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('AccountBalanceSummaryStrip', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockStore.totalAssets = 500000;
    mockStore.totalLiabilities = -300000;
    mockStore.netCurrentCash = 100000;
    mockStore.netCashAssets = 200000;
    mockStore.netNonCashAssets = -100000;
    mockStore.netWorth = 200000;
  });

  it('renders the summary strip', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(true);
  });

  it('displays Total Assets label and value', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Total Assets');
    // 500000 cents = 5,000.00
    expect(wrapper.text()).toContain('5,000.00');
  });

  it('displays Total Liabilities label and value', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Total Liabilities');
    // -300000 cents = -3,000.00
    expect(wrapper.text()).toContain('-3,000.00');
  });

  it('displays Net Worth label and value', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Net Worth');
    expect(wrapper.text()).toContain('2,000.00');
  });

  it('displays Current Cash label and value in secondary row', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Current Cash');
    expect(wrapper.text()).toContain('1,000.00');
  });

  it('displays Cash Assets label and value in secondary row', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Cash Assets');
    expect(wrapper.text()).toContain('2,000.00');
  });

  it('displays Non Cash Assets label and value in secondary row', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Non Cash Assets');
    expect(wrapper.text()).toContain('-1,000.00');
  });

  it('uses EcMoneyField for values', () => {
    const wrapper = createWrapper();

    const moneyFields = wrapper.findAllComponents({ name: 'EcMoneyField' });
    expect(moneyFields.length).toBe(6);
  });
});
