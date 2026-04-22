import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import type { VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import AccountBalancesToolbarMobile from './AccountBalancesToolbarMobile.vue';

vi.mock('./accountBalanceApi', () => ({
  accountBalanceApi: {
    getAll: vi.fn(),
    adjustBalances: vi.fn(),
  },
}));

const ADJUST_BTN = '[data-testid="adjust-balances-btn"]';
const DASH_ZERO_TOGGLE = '[data-testid="dash-zero-toggle"]';
const INCLUDE_CLOSED_TOGGLE = '[data-testid="include-closed-toggle"]';
const CLOSED_LABEL = '[data-testid="closed-label"]';

let pinia: Pinia;

function createWrapper(dashIfZero = false): VueWrapper {
  return mount(AccountBalancesToolbarMobile, {
    props: { dashIfZero },
    global: {
      plugins: [PrimeVue, pinia],
      directives: { tooltip: () => {} },
    },
  });
}

describe('AccountBalancesToolbarMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  describe('layout', () => {
    it('renders the Adjust button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADJUST_BTN).exists()).toBe(true);
    });

    it('renders the dash-if-zero toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(DASH_ZERO_TOGGLE).exists()).toBe(true);
    });

    it('renders the include-closed toggle', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(INCLUDE_CLOSED_TOGGLE).exists()).toBe(true);
    });

    it('renders the "Closed" label', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CLOSED_LABEL).exists()).toBe(true);
      expect(wrapper.find(CLOSED_LABEL).text()).toBe('Closed');
    });
  });

  describe('Adjust button', () => {
    it('emits adjust when Adjust button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADJUST_BTN).trigger('click');

      expect(wrapper.emitted('adjust')).toHaveLength(1);
    });
  });

  describe('dash-if-zero toggle', () => {
    it('emits update:dashIfZero with true when dashIfZero is false and toggle is clicked', async () => {
      const wrapper = createWrapper(false);

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');

      expect(wrapper.emitted('update:dashIfZero')?.[0]).toEqual([true]);
    });

    it('emits update:dashIfZero with false when dashIfZero is true and toggle is clicked', async () => {
      const wrapper = createWrapper(true);

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');

      expect(wrapper.emitted('update:dashIfZero')?.[0]).toEqual([false]);
    });
  });

  describe('include-closed toggle', () => {
    it('emits toggleClosed when the toggle switch is changed', async () => {
      const wrapper = createWrapper();

      wrapper.findComponent({ name: 'ToggleSwitch' }).vm.$emit('update:modelValue', true);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('toggleClosed')).toHaveLength(1);
    });

    it('binds store.includeClosed to the toggle switch', async () => {
      const { useAccountBalanceStore } = await import('./accountBalanceStore');
      const store = useAccountBalanceStore();
      store.includeClosed = true;

      const wrapper = createWrapper();

      const toggle = wrapper.findComponent({ name: 'ToggleSwitch' });
      expect(toggle.props('modelValue')).toBe(true);
    });
  });
});
