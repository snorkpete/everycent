import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetsListMobile from './BudgetsListMobile.vue';
import { useBudgetListStore } from './budgetListStore';
import { buildBudget, buildClosedBudget } from '../../test/factories';

const BUDGET_ROW = '[data-testid="budget-row"]';

let pinia: Pinia;
let store: ReturnType<typeof useBudgetListStore>;

function createWrapper(): VueWrapper {
  return mount(BudgetsListMobile, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('BudgetsListMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useBudgetListStore();
    store.budgets = [
      buildBudget({ id: 1, name: 'Mar 2025', status: 'open' }),
      buildBudget({ id: 2, name: 'Feb 2025', status: 'open' }),
      buildClosedBudget({ id: 3, name: 'Jan 2025', status: 'closed' }),
    ];
    store.loading = false;
    store.error = null;
  });

  describe('budget list rendering', () => {
    it('renders a card for each budget', () => {
      const wrapper = createWrapper();

      expect(wrapper.findAll(BUDGET_ROW)).toHaveLength(3);
    });

    it('shows the budget name in each card', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(BUDGET_ROW);
      expect(rows[0].text()).toContain('Mar 2025');
      expect(rows[1].text()).toContain('Feb 2025');
      expect(rows[2].text()).toContain('Jan 2025');
    });

    it('shows a status badge on each card', () => {
      const wrapper = createWrapper();

      const openBadge = wrapper.find('[data-testid="status-1"]');
      expect(openBadge.text()).toBe('open');
      expect(openBadge.classes()).toContain('status-open');

      const closedBadge = wrapper.find('[data-testid="status-3"]');
      expect(closedBadge.text()).toBe('closed');
      expect(closedBadge.classes()).toContain('status-closed');
    });

    it('links the budget name to the budget detail page', () => {
      const wrapper = createWrapper();

      const nameLink = wrapper.find('[data-testid="budget-name-link-1"]');
      expect(nameLink.exists()).toBe(true);
      expect(nameLink.text()).toBe('Mar 2025');
    });

    it('shows empty state when there are no budgets', () => {
      store.budgets = [];
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('No budgets found.');
    });

    it('does not show empty state while loading', () => {
      store.budgets = [];
      store.loading = true;
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain('No budgets found.');
    });
  });

  describe('navigation', () => {
    it('emits goToBudget when a card is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(BUDGET_ROW)[0].trigger('click');

      expect(wrapper.emitted('goToBudget')).toBeDefined();
      expect(wrapper.emitted('goToBudget')![0][0]).toMatchObject({ id: 1, name: 'Mar 2025' });
    });
  });

  describe('Copy button', () => {
    it('shows Copy button only for the first budget (canCopy)', () => {
      const wrapper = createWrapper();

      // canCopy = first budget in list
      expect(wrapper.find('[data-testid="copy-btn-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="copy-btn-2"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="copy-btn-3"]').exists()).toBe(false);
    });

    it('emits copyBudget when Copy is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="copy-btn-1"]').trigger('click');

      expect(wrapper.emitted('copyBudget')).toBeDefined();
      expect(wrapper.emitted('copyBudget')![0][0]).toMatchObject({ id: 1 });
    });

    it('does not trigger goToBudget when Copy is clicked (click.stop)', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="copy-btn-1"]').trigger('click');

      expect(wrapper.emitted('goToBudget')).toBeUndefined();
    });
  });

  describe('Close button', () => {
    it('shows Close button only for the last open budget (canClose)', () => {
      const wrapper = createWrapper();

      // canClose = last open budget. budgets[1] (id=2) is the last open one
      expect(wrapper.find('[data-testid="close-btn-1"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="close-btn-2"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="close-btn-3"]').exists()).toBe(false);
    });

    it('emits closeBudget when Close is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="close-btn-2"]').trigger('click');

      expect(wrapper.emitted('closeBudget')).toBeDefined();
      expect(wrapper.emitted('closeBudget')![0][0]).toMatchObject({ id: 2 });
    });

    it('does not trigger goToBudget when Close is clicked (click.stop)', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="close-btn-2"]').trigger('click');

      expect(wrapper.emitted('goToBudget')).toBeUndefined();
    });
  });

  describe('actions section visibility', () => {
    it('shows actions section when canCopy applies to a budget', () => {
      const wrapper = createWrapper();

      // budget 1 has copy button
      expect(wrapper.find('.budget-card__actions').exists()).toBe(true);
    });

    it('does not show actions section on a card where neither canCopy nor canClose applies', () => {
      // budget 3 (closed) is not first (canCopy=false) and not last open (canClose=false)
      const wrapper = createWrapper();
      const cards = wrapper.findAll('[data-testid="budget-row"]');
      // budget 3 is the closed one at index 2 — no copy, no close
      const closedCard = cards[2];
      expect(closedCard.find('.budget-card__actions').exists()).toBe(false);
    });
  });
});
