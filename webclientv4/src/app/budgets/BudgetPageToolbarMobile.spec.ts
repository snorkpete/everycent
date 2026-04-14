import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetPageToolbarMobile from './BudgetPageToolbarMobile.vue';

const BACK_BTN = '[data-testid="back-btn"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';

let pinia: Pinia;

function createWrapper(props: { transactionsHref?: string } = {}): VueWrapper {
  return mount(BudgetPageToolbarMobile, {
    props: {
      transactionsHref: props.transactionsHref ?? '#/transactions?budget_id=1',
    },
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('BudgetPageToolbarMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  describe('layout', () => {
    it('renders the Back button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(BACK_BTN).exists()).toBe(true);
    });

    it('renders the View Transactions button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('Back button is icon-only with a tooltip', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(BACK_BTN);
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('View Transactions button is icon-only with a tooltip', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(VIEW_TRANSACTIONS_BTN);
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('View Transactions button links to the transactions href', () => {
      const wrapper = createWrapper({ transactionsHref: '#/transactions?budget_id=42' });

      const btn = wrapper.find(VIEW_TRANSACTIONS_BTN);
      expect(btn.attributes('href')).toBe('#/transactions?budget_id=42');
    });
  });

  describe('events', () => {
    it('emits back when the Back button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(BACK_BTN).trigger('click');

      expect(wrapper.emitted('back')).toBeDefined();
    });
  });
});
