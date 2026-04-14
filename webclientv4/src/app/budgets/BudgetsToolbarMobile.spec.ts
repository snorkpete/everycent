import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetsToolbarMobile from './BudgetsToolbarMobile.vue';

const ADD_BTN = '[data-testid="add-budget-btn"]';
const REOPEN_BTN = '[data-testid="reopen-btn"]';
const REFRESH_BTN = '[data-testid="refresh-btn"]';

let pinia: Pinia;

function createWrapper(): VueWrapper {
  return mount(BudgetsToolbarMobile, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('BudgetsToolbarMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });
  describe('layout', () => {
    it('renders the Add New Budget button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('renders the Reopen Last Budget button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(REOPEN_BTN).exists()).toBe(true);
    });

    it('Add button is icon-only (no visible label text)', () => {
      const wrapper = createWrapper();

      // Icon-only buttons use v-tooltip instead of a label
      const btn = wrapper.find(ADD_BTN);
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('Reopen button is icon-only (no visible label text)', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(REOPEN_BTN);
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('renders the Refresh button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(REFRESH_BTN).exists()).toBe(true);
    });

    it('Refresh button is icon-only (no visible label text)', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(REFRESH_BTN);
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('events', () => {
    it('emits addBudget when Add button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADD_BTN).trigger('click');

      expect(wrapper.emitted('addBudget')).toBeDefined();
    });

    it('emits reopenLast when Reopen button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REOPEN_BTN).trigger('click');

      expect(wrapper.emitted('reopenLast')).toBeDefined();
    });

    it('emits refresh when Refresh button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REFRESH_BTN).trigger('click');

      expect(wrapper.emitted('refresh')).toBeDefined();
    });
  });
});
