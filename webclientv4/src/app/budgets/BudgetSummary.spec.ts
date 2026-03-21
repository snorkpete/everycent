import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { reactive } from 'vue';
import PrimeVue from 'primevue/config';
import BudgetSummary from './BudgetSummary.vue';
import type { BudgetDetailData } from './budget.types';
import type { SettingsData } from '../settings/settings.types';

// Selectors
const BUDGET_SUMMARY = '[data-testid="budget-summary"]';
const DISCRETIONARY_SECTION = '[data-testid="discretionary-section"]';
const TOTAL_DISCRETIONARY_ROW = '[data-testid="total-discretionary-row"]';
const WIFE_AMOUNT_ROW = '[data-testid="wife-amount-row"]';
const HUSBAND_AMOUNT_ROW = '[data-testid="husband-amount-row"]';
const SINGLE_PERSON_ROW = '[data-testid="single-person-row"]';
const WANTS_SUMMARY_SECTION = '[data-testid="wants-summary-section"]';
const NEEDS_ROW = '[data-testid="needs-row"]';
const WANTS_ROW = '[data-testid="wants-row"]';
const SAVINGS_ROW = '[data-testid="savings-row"]';

const sampleBudget: BudgetDetailData = {
  id: 1,
  name: 'Test Budget',
  incomes: [
    { id: 1, name: 'Salary', amount: 500000 },
    { id: 2, name: 'Side Income', amount: 100000 },
  ],
  allocations: [
    { id: 1, name: 'Rent', amount: 200000, allocation_class: 'need' },
    { id: 2, name: 'Groceries', amount: 50000, allocation_class: 'need' },
    { id: 3, name: 'Entertainment', amount: 30000, allocation_class: 'want' },
    { id: 4, name: 'Retirement', amount: 100000, allocation_class: 'savings' },
  ],
};

const coupleSettings: SettingsData = {
  family_type: 'couple',
  wife: 'Alice',
  husband: 'Bob',
  single_person: 'User',
};

const singleSettings: SettingsData = {
  family_type: 'single',
  wife: 'Alice',
  husband: 'Bob',
  single_person: 'Charlie',
};

const mockBudgetStore = reactive({
  budget: sampleBudget as BudgetDetailData | null,
  allocationCategories: [],
  isEditMode: false,
  loading: false,
  error: null as string | null,
  fetch: vi.fn(),
  save: vi.fn(),
  enterEditMode: vi.fn(),
  exitEditMode: vi.fn(),
  cancelEdit: vi.fn(),
});

const mockSettingsStore = reactive({
  settings: coupleSettings as SettingsData,
  bankAccounts: [],
  allocationCategories: [],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn(),
  save: vi.fn(),
});

vi.mock('./budgetStore', () => ({
  useBudgetStore: () => mockBudgetStore,
}));

vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => mockSettingsStore,
}));

function createWrapper(): VueWrapper {
  return mount(BudgetSummary, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('BudgetSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockBudgetStore.budget = {
      ...sampleBudget,
      incomes: [...sampleBudget.incomes],
      allocations: [...sampleBudget.allocations],
    };
    mockSettingsStore.settings = { ...coupleSettings };
  });

  describe('rendering', () => {
    it('renders the budget summary container', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(BUDGET_SUMMARY).exists()).toBe(true);
    });

    it('renders the discretionary section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(DISCRETIONARY_SECTION).exists()).toBe(true);
    });

    it('renders the wants summary section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(WANTS_SUMMARY_SECTION).exists()).toBe(true);
    });
  });

  describe('discretionary amount — couple', () => {
    // Total income: 500000 + 100000 = 600000
    // Total allocations: 200000 + 50000 + 30000 + 100000 = 380000
    // Discretionary: 600000 - 380000 = 220000
    const expectedDiscretionary = '2,200.00';
    const expectedHalf = '1,100.00';

    it('shows "Total Discretionary Amount" row', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(TOTAL_DISCRETIONARY_ROW);

      expect(row.exists()).toBe(true);
      expect(row.text()).toContain('Total Discretionary Amount');
      expect(row.text()).toContain(expectedDiscretionary);
    });

    it('shows wife amount with name from settings', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(WIFE_AMOUNT_ROW);

      expect(row.exists()).toBe(true);
      expect(row.text()).toContain("Alice's Amount");
      expect(row.text()).toContain(expectedHalf);
    });

    it('shows husband amount with name from settings', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(HUSBAND_AMOUNT_ROW);

      expect(row.exists()).toBe(true);
      expect(row.text()).toContain("Bob's Amount");
      expect(row.text()).toContain(expectedHalf);
    });

    it('does not show single person row for couple', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SINGLE_PERSON_ROW).exists()).toBe(false);
    });
  });

  describe('discretionary amount — single', () => {
    const expectedDiscretionary = '2,200.00';

    beforeEach(() => {
      mockSettingsStore.settings = { ...singleSettings };
    });

    it('shows single person discretionary row with name from settings', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(SINGLE_PERSON_ROW);

      expect(row.exists()).toBe(true);
      expect(row.text()).toContain("Charlie's Discretionary Amount");
      expect(row.text()).toContain(expectedDiscretionary);
    });

    it('does not show couple rows for single', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(TOTAL_DISCRETIONARY_ROW).exists()).toBe(false);
      expect(wrapper.find(WIFE_AMOUNT_ROW).exists()).toBe(false);
      expect(wrapper.find(HUSBAND_AMOUNT_ROW).exists()).toBe(false);
    });
  });

  describe('wants summary — amounts', () => {
    // Needs: 200000 + 50000 = 250000
    // Savings: 100000
    // Wants: totalIncome - needs - savings = 600000 - 250000 - 100000 = 250000

    it('shows needs amount', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(NEEDS_ROW);

      expect(row.text()).toContain('Needs');
      expect(row.text()).toContain('2,500.00');
    });

    it('shows wants amount (income minus needs minus savings)', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(WANTS_ROW);

      expect(row.text()).toContain('Wants');
      expect(row.text()).toContain('2,500.00');
    });

    it('shows savings amount', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(SAVINGS_ROW);

      expect(row.text()).toContain('Savings');
      expect(row.text()).toContain('1,000.00');
    });
  });

  describe('wants summary — percentages', () => {
    // Total income: 600000
    // Needs: 250000 → 250000/600000 * 100 = 41.67 → round to 42
    // Savings: 100000 → 100000/600000 * 100 = 16.67 → round to 17
    // Wants: 100 - 42 - 17 = 41

    it('shows needs percentage', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(NEEDS_ROW);

      expect(row.text()).toContain('42%');
    });

    it('shows wants percentage (remainder after needs and savings)', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(WANTS_ROW);

      expect(row.text()).toContain('41%');
    });

    it('shows savings percentage', () => {
      const wrapper = createWrapper();
      const row = wrapper.find(SAVINGS_ROW);

      expect(row.text()).toContain('17%');
    });
  });

  describe('edge cases', () => {
    it('handles null budget gracefully', () => {
      mockBudgetStore.budget = null;
      const wrapper = createWrapper();

      expect(wrapper.find(TOTAL_DISCRETIONARY_ROW).text()).toContain('0.00');
      expect(wrapper.find(NEEDS_ROW).text()).toContain('0.00');
    });

    it('handles zero income without dividing by zero', () => {
      mockBudgetStore.budget = {
        id: 1,
        name: 'Empty',
        incomes: [],
        allocations: [],
      };
      const wrapper = createWrapper();
      const zeroPercent = '0%';

      // All percentages should be 0 when there's no income
      const needsCells = wrapper.find(NEEDS_ROW).findAll('td');
      const wantsCells = wrapper.find(WANTS_ROW).findAll('td');
      const savingsCells = wrapper.find(SAVINGS_ROW).findAll('td');

      expect(needsCells[2].text()).toBe(zeroPercent);
      expect(wantsCells[2].text()).toBe(zeroPercent);
      expect(savingsCells[2].text()).toBe(zeroPercent);
    });

    it('uses default names when settings fields are not set', () => {
      mockSettingsStore.settings = {};
      const wrapper = createWrapper();

      expect(wrapper.find(WIFE_AMOUNT_ROW).text()).toContain("Wife's Amount");
      expect(wrapper.find(HUSBAND_AMOUNT_ROW).text()).toContain("Husband's Amount");
    });

    it('handles allocations with no allocation_class', () => {
      mockBudgetStore.budget = {
        id: 1,
        name: 'Test',
        incomes: [{ id: 1, name: 'Salary', amount: 100000 }],
        allocations: [{ id: 1, name: 'Misc', amount: 50000 }],
      };
      const wrapper = createWrapper();

      // No allocation_class means not need or savings, so wants = income - 0 - 0 = 100000
      expect(wrapper.find(WANTS_ROW).text()).toContain('1,000.00');
      expect(wrapper.find(NEEDS_ROW).text()).toContain('0.00');
      expect(wrapper.find(SAVINGS_ROW).text()).toContain('0.00');
    });
  });
});
