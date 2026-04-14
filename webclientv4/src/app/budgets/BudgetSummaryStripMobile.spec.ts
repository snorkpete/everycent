import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetSummaryStripMobile from './BudgetSummaryStripMobile.vue';
import { useBudgetStore } from './budgetStore';
import { useSettingsStore } from '../settings/settingsStore';
import { buildBudgetDetail, buildIncome, buildAllocation, buildSettings } from '../../test/factories';

const STRIP = '[data-testid="budget-summary-strip"]';
const UNALLOCATED = '[data-testid="unallocated-amount"]';
const DISCRETIONARY = '[data-testid="discretionary-amount"]';

let pinia: Pinia;
let budgetStore: ReturnType<typeof useBudgetStore>;
let settingsStore: ReturnType<typeof useSettingsStore>;

function createWrapper(): VueWrapper {
  return mount(BudgetSummaryStripMobile, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('BudgetSummaryStripMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    budgetStore = useBudgetStore();
    settingsStore = useSettingsStore();

    budgetStore.budget = buildBudgetDetail({
      id: 1,
      incomes: [buildIncome({ id: 1, name: 'Salary', amount: 300000, budget_id: 1 })],
      allocations: [buildAllocation({ id: 1, name: 'Groceries', amount: 100000, spent: 0, allocation_category_id: 1 })],
    });

    settingsStore.settings = buildSettings({
      family_type: 'couple',
      wife: 'Wife',
      husband: 'Husband',
      single_person: 'Alex',
    });
  });

  describe('visibility', () => {
    it('renders the strip when a budget is loaded', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(STRIP).exists()).toBe(true);
    });

    it('does not render the strip when budget is null', () => {
      budgetStore.budget = null;
      const wrapper = createWrapper();

      expect(wrapper.find(STRIP).exists()).toBe(false);
    });
  });

  describe('income display', () => {
    it('shows Income label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Income');
    });

    it('shows the total income amount', () => {
      const wrapper = createWrapper();

      // 300000 cents = 3,000.00
      expect(wrapper.text()).toContain('3,000.00');
    });

    it('excludes deleted incomes from the total', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [
          buildIncome({ id: 1, amount: 300000, deleted: true }),
          buildIncome({ id: 2, name: 'Freelance', amount: 100000 }),
        ],
        allocations: [],
      });
      const wrapper = createWrapper();

      // Only 100000 cents = 1,000.00 in income
      // Unallocated = 1000 - 0 = 1000
      expect(wrapper.find(UNALLOCATED).text()).toContain('1,000.00');
    });
  });

  describe('allocated display', () => {
    it('shows Allocated label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Allocated');
    });

    it('shows total allocated amount', () => {
      const wrapper = createWrapper();

      // 100000 cents = 1,000.00
      expect(wrapper.text()).toContain('1,000.00');
    });

    it('excludes deleted allocations from total', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 300000 })],
        allocations: [buildAllocation({ id: 1, amount: 100000, deleted: true })],
      });
      const wrapper = createWrapper();

      // Allocated = 0, Unallocated = income = 3000.00
      expect(wrapper.find(UNALLOCATED).text()).toContain('3,000.00');
    });
  });

  describe('unallocated display', () => {
    it('shows Unallocated label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Unallocated');
    });

    it('shows unallocated amount (income minus allocations)', () => {
      const wrapper = createWrapper();

      // 300000 - 100000 = 200000 cents = 2,000.00
      expect(wrapper.find(UNALLOCATED).text()).toContain('2,000.00');
    });
  });

  describe('discretionary display — couple mode', () => {
    it('shows Wife / Husband label in couple mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Wife / Husband');
    });

    it('shows per-person amount (unallocated / 2) in couple mode', () => {
      const wrapper = createWrapper();

      // 200000 / 2 = 100000 cents = 1,000.00
      expect(wrapper.find(DISCRETIONARY).text()).toContain('1,000.00');
    });
  });

  describe('discretionary display — single mode', () => {
    beforeEach(() => {
      settingsStore.settings = buildSettings({
        family_type: 'single',
        single_person: 'Alex',
      });
    });

    it("shows single person's discretionary label", () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain("Alex's Discretionary");
    });

    it('shows full discretionary amount (not halved) in single mode', () => {
      const wrapper = createWrapper();

      // 200000 cents = 2,000.00 (not halved)
      expect(wrapper.find(DISCRETIONARY).text()).toContain('2,000.00');
    });
  });

  describe('needs/wants/savings pills', () => {
    it('shows N pill', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('N ');
      expect(wrapper.text()).toMatch(/N \d+%/);
    });

    it('shows W pill', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toMatch(/W \d+%/);
    });

    it('shows S pill', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toMatch(/S \d+%/);
    });
  });

  describe('layout', () => {
    it('renders items in a 2×2 grid', () => {
      const wrapper = createWrapper();

      const gridItems = wrapper.findAll('.strip-item');
      expect(gridItems).toHaveLength(4);
    });

    it('renders the nws row with pills', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.nws-row').exists()).toBe(true);
    });
  });
});
