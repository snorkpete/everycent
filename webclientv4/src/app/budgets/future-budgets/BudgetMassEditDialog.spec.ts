import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetMassEditDialog from './BudgetMassEditDialog.vue';
import { centsToDollars } from '../../shared/util/centsToDollars';
import { DialogStub } from '../../../test/stubs';
import { buildFutureBudget } from '../../../test/factories';

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(BudgetMassEditDialog, {
    props: {
      visible: true,
      type: 'income',
      name: 'Salary',
      budgets: [buildFutureBudget()],
      amountsPerBudget: {},
      ...props,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('BudgetMassEditDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('dialog title', () => {
    it('shows the income/allocation name as the dialog title', () => {
      const wrapper = createWrapper({ type: 'income', name: 'Salary' });
      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('header')).toBe('Salary');
    });

    it('shows the allocation name for allocation type', () => {
      const wrapper = createWrapper({ type: 'allocation', name: 'Groceries' });
      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('header')).toBe('Groceries');
    });
  });

  describe('form initialisation', () => {
    it('populates name input from the name prop on open', async () => {
      const wrapper = createWrapper({ name: 'Bonus', visible: false });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const nameInput = wrapper.find('[data-testid="name-input"]');
      expect((nameInput.element as HTMLInputElement).value).toBe('Bonus');
    });

    it('populates amount from amountsPerBudget for existing entry', async () => {
      const budget = buildFutureBudget({ id: 1, name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: false,
        budgets: [budget],
        amountsPerBudget: { 1: { id: 10, amount: 500000 } },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const amountInput = wrapper.find('[data-testid="amount-input-0"] input');
      expect((amountInput.element as HTMLInputElement).value).toBe('5,000.00');
    });

    it('defaults amount to 0 for budgets not in amountsPerBudget', async () => {
      const budget = buildFutureBudget({ name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: false,
        budgets: [budget],
        amountsPerBudget: {},
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const amountInput = wrapper.find('[data-testid="amount-input-0"] input');
      expect((amountInput.element as HTMLInputElement).value).toBe('0.00');
    });

    it('reinitialises the form when the dialog reopens', async () => {
      const budget = buildFutureBudget({ name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: true,
        name: 'Old Name',
        budgets: [budget],
        amountsPerBudget: {},
      });
      await nextTick();

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, name: 'New Name' });
      await nextTick();

      const nameInput = wrapper.find('[data-testid="name-input"]');
      expect((nameInput.element as HTMLInputElement).value).toBe('New Name');
    });
  });

  describe('allocation-specific rows', () => {
    it('does not show info rows for income type', () => {
      const wrapper = createWrapper({ type: 'income' });

      expect(wrapper.text()).not.toContain('Total Income');
      expect(wrapper.text()).not.toContain('Already Allocated');
      expect(wrapper.text()).not.toContain('Discretionary Amount');
    });

    it('shows Total Income, Already Allocated, and Discretionary Amount for allocation type', () => {
      const wrapper = createWrapper({ type: 'allocation' });

      expect(wrapper.text()).toContain('Total Income');
      expect(wrapper.text()).toContain('Already Allocated');
      expect(wrapper.text()).toContain('Discretionary Amount');
    });
  });

  describe('Save button', () => {
    it('emits save with income payload', async () => {
      const budget = buildFutureBudget({ id: 5, name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: false,
        type: 'income',
        name: 'Salary',
        budgets: [budget],
        amountsPerBudget: { 5: { id: 10, amount: 500000 } },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toEqual({
        type: 'income',
        name: 'Salary',
        amounts: [{ id: 10, amount: 500000, budget_id: 5 }],
      });
    });

    it('emits save with allocation payload including category id and is_fixed_amount', async () => {
      const budget = buildFutureBudget({ id: 5, name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets: [budget],
        amountsPerBudget: { 5: { id: 20, amount: 150000 } },
        categoryId: 3,
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toEqual({
        type: 'allocation',
        name: 'Rent',
        amounts: [{ id: 20, amount: 150000, budget_id: 5, is_fixed_amount: false }],
        allocation_category_id: 3,
      });
    });

    it('uses the edited name value in the payload', async () => {
      const budget = buildFutureBudget({ id: 5, name: 'Jan 2025' });
      const wrapper = createWrapper({
        visible: false,
        type: 'income',
        name: 'Salary',
        budgets: [budget],
        amountsPerBudget: {},
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const nameInput = wrapper.find('[data-testid="name-input"]');
      await nameInput.setValue('New Name');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect((emitted![0][0] as { name: string }).name).toBe('New Name');
    });
  });

  describe('Cancel button', () => {
    it('emits update:visible false', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')).toEqual([[false]]);
    });
  });

  describe('column headers', () => {
    it('shows budget names as column headers', () => {
      const budgets = [
        buildFutureBudget({ name: 'Jan 2025' }),
        buildFutureBudget({ id: 2, name: 'Feb 2025' }),
      ];
      const wrapper = createWrapper({ budgets });

      expect(wrapper.text()).toContain('Jan 2025');
      expect(wrapper.text()).toContain('Feb 2025');
    });
  });

  describe('is_fixed_amount — allocation type', () => {
    it('shows a Fixed? checkbox row for allocation type', async () => {
      const budget = buildFutureBudget({ id: 1 });
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets: [budget],
        amountsPerBudget: { 1: { id: 10, amount: 150000, is_fixed_amount: false } },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      expect(wrapper.find('[data-testid="fixed-row"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="fixed-checkbox-0"]').exists()).toBe(true);
    });

    it('does not show Fixed? row for income type', () => {
      const wrapper = createWrapper({ type: 'income' });

      expect(wrapper.find('[data-testid="fixed-row"]').exists()).toBe(false);
    });

    it('initialises checkbox from amountsPerBudget is_fixed_amount value', async () => {
      const budget = buildFutureBudget({ id: 1 });
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets: [budget],
        amountsPerBudget: { 1: { id: 10, amount: 150000, is_fixed_amount: true } },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const checkbox = wrapper.find('[data-testid="fixed-checkbox-0"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    });

    it('defaults checkbox to false when is_fixed_amount not provided', async () => {
      const budget = buildFutureBudget({ id: 1 });
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets: [budget],
        amountsPerBudget: { 1: { id: 10, amount: 150000 } },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const checkbox = wrapper.find('[data-testid="fixed-checkbox-0"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('includes is_fixed_amount in save payload', async () => {
      const budget = buildFutureBudget({ id: 5 });
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets: [budget],
        amountsPerBudget: { 5: { id: 20, amount: 150000, is_fixed_amount: false } },
        categoryId: 3,
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const checkbox = wrapper.find('[data-testid="fixed-checkbox-0"]');
      await checkbox.setValue(true);
      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted![0][0]).toEqual({
        type: 'allocation',
        name: 'Rent',
        amounts: [{ id: 20, amount: 150000, budget_id: 5, is_fixed_amount: true }],
        allocation_category_id: 3,
      });
    });

    it('shows a Set All Fixed checkbox', async () => {
      const budgets = [
        buildFutureBudget({ id: 1 }),
        buildFutureBudget({ id: 2, name: 'Feb 2025' }),
      ];
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets,
        amountsPerBudget: {
          1: { id: 10, amount: 150000, is_fixed_amount: false },
          2: { id: 20, amount: 150000, is_fixed_amount: false },
        },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      expect(wrapper.find('[data-testid="set-all-fixed-row"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="set-all-fixed-checkbox"]').exists()).toBe(true);
    });

    it('set all fixed checkbox sets all per-budget checkboxes to checked', async () => {
      const budgets = [
        buildFutureBudget({ id: 1 }),
        buildFutureBudget({ id: 2, name: 'Feb 2025' }),
      ];
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets,
        amountsPerBudget: {
          1: { id: 10, amount: 150000, is_fixed_amount: false },
          2: { id: 20, amount: 150000, is_fixed_amount: false },
        },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      const setAllCheckbox = wrapper.find('[data-testid="set-all-fixed-checkbox"]');
      await setAllCheckbox.setValue(true);
      await nextTick();

      const checkbox0 = wrapper.find('[data-testid="fixed-checkbox-0"]');
      const checkbox1 = wrapper.find('[data-testid="fixed-checkbox-1"]');
      expect((checkbox0.element as HTMLInputElement).checked).toBe(true);
      expect((checkbox1.element as HTMLInputElement).checked).toBe(true);
    });

    it('set all fixed checkbox unchecks all per-budget checkboxes when unchecked', async () => {
      const budgets = [
        buildFutureBudget({ id: 1 }),
        buildFutureBudget({ id: 2, name: 'Feb 2025' }),
      ];
      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Rent',
        budgets,
        amountsPerBudget: {
          1: { id: 10, amount: 150000, is_fixed_amount: true },
          2: { id: 20, amount: 150000, is_fixed_amount: true },
        },
      });
      await wrapper.setProps({ visible: true });
      await nextTick();

      // First set all to true via the toggle, then uncheck it
      const setAllCheckbox = wrapper.find('[data-testid="set-all-fixed-checkbox"]');
      await setAllCheckbox.setValue(true);
      await nextTick();

      await setAllCheckbox.setValue(false);
      await nextTick();

      const checkbox0 = wrapper.find('[data-testid="fixed-checkbox-0"]');
      const checkbox1 = wrapper.find('[data-testid="fixed-checkbox-1"]');
      expect((checkbox0.element as HTMLInputElement).checked).toBe(false);
      expect((checkbox1.element as HTMLInputElement).checked).toBe(false);
    });

    it('does not show set all fixed row for income type', () => {
      const wrapper = createWrapper({ type: 'income' });

      expect(wrapper.find('[data-testid="set-all-fixed-row"]').exists()).toBe(false);
    });
  });

  describe('dynamic totaling', () => {
    it('updates Discretionary Amount live when the amount input changes', async () => {
      const income = 200000;
      const rentAllocation = 50000;
      const initialFoodAllocation = 30000;
      const updatedFoodAllocation = 40000;

      const budget = buildFutureBudget({
        id: 1,
        incomes: [{ id: 1, name: 'Salary', amount: income, budget_id: 1, bank_account_id: 1 }],
        allocations: [
          { id: 1, name: 'Rent', amount: rentAllocation, budget_id: 1, allocation_category_id: 1 },
          {
            id: 2,
            name: 'Food',
            amount: initialFoodAllocation,
            budget_id: 1,
            allocation_category_id: 1,
          },
        ],
      });

      const wrapper = createWrapper({
        visible: false,
        type: 'allocation',
        name: 'Food',
        budgets: [budget],
        amountsPerBudget: { 1: { id: 2, amount: initialFoodAllocation } },
      });

      await wrapper.setProps({ visible: true });
      await nextTick();

      const discretionaryCell = wrapper.find('[data-testid="discretionary-display-0"]');
      // Initial: income - rent - initialFood = 200000 - 50000 - 30000 = 120000 → $1,200.00
      const initialDiscretionary = income - rentAllocation - initialFoodAllocation;
      expect(discretionaryCell.text()).toContain(centsToDollars(initialDiscretionary));

      const amountInput = wrapper.find('[data-testid="amount-input-0"] input');
      await amountInput.setValue('400.00');
      await amountInput.trigger('change');
      await nextTick();

      // After: income - rent - updatedFood = 200000 - 50000 - 40000 = 110000 → $1,100.00
      const updatedDiscretionary = income - rentAllocation - updatedFoodAllocation;
      expect(discretionaryCell.text()).toContain(centsToDollars(updatedDiscretionary));
    });
  });
});
