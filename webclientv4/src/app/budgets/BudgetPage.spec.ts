import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetPage from './BudgetPage.vue';
import type { BudgetDetailData } from './budget.types';

// Selectors
const BACK_BTN = '[data-testid="back-btn"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';
const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const INCOMES_SECTION = '[data-testid="incomes-section"]';
const ALLOCATIONS_SECTION = '[data-testid="allocations-section"]';
const VARIABLE_ONLY_TOGGLE = '[data-testid="variable-only-toggle"]';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const sampleBudget: BudgetDetailData = {
  id: 213,
  name: 'Mar 25 - Apr 24, 2026',
  status: 'open',
  incomes: [{ id: 1, name: 'Salary', amount: 500000 }],
  allocations: [{ id: 1, name: 'Groceries', amount: 100000 }],
};

const mockStore = reactive({
  budget: sampleBudget as BudgetDetailData | null,
  allocationCategories: [{ id: 5, name: 'Food' }],
  isEditMode: false,
  loading: false,
  error: null as string | null,
  fetch: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
  enterEditMode: vi.fn(),
  exitEditMode: vi.fn(),
  cancelEdit: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./budgetStore', () => ({
  useBudgetStore: () => mockStore,
}));

const mockSettingsStore = reactive({
  settings: {},
  bankAccounts: [],
  allocationCategories: [],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  save: vi.fn(),
});

vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => mockSettingsStore,
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '213' } }),
  useRouter: () => ({ push: mockPush }),
}));

function createWrapper(): VueWrapper {
  return mount(BudgetPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('BudgetPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.budget = sampleBudget;
    mockStore.isEditMode = false;
    mockStore.error = null;
    mockStore.fetch.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
    mockStore.cancelEdit.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('calls store.fetch with the budget id from the route', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalledWith(213);
    });

    it('sets the heading to "Budget: {budget name}"', async () => {
      createWrapper();
      await nextTick();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Budget: Mar 25 - Apr 24, 2026');
    });

    it('sets heading to "Budget" when budget has no name', async () => {
      mockStore.budget = { id: 213, incomes: [], allocations: [] } as BudgetDetailData;
      createWrapper();
      await nextTick();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Budget');
    });
  });

  describe('layout', () => {
    it('renders incomes placeholder section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(INCOMES_SECTION).exists()).toBe(true);
    });

    it('renders allocations placeholder section', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ALLOCATIONS_SECTION).exists()).toBe(true);
    });
  });

  describe('toolbar — navigation', () => {
    it('shows Back to Budget List button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(BACK_BTN).exists()).toBe(true);
    });

    it('navigates to /budgets when Back button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(BACK_BTN).trigger('click');

      expect(mockPush).toHaveBeenCalledWith('/budgets');
    });

    it('shows View Transactions button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('links to /transactions with budget_id', () => {
      const wrapper = createWrapper();
      const link = wrapper.find(VIEW_TRANSACTIONS_BTN);

      expect(link.attributes('href')).toBe('#/transactions?budget_id=213');
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit button in view mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('calls store.enterEditMode when Edit is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(mockStore.enterEditMode).toHaveBeenCalled();
    });

    it('calls store.cancelEdit when Cancel is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      expect(mockStore.cancelEdit).toHaveBeenCalled();
    });
  });

  describe('toolbar — variable-only toggle', () => {
    it('shows a variable-only toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).exists()).toBe(true);
    });

    it('defaults to "All Allocations" label', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).text()).toContain('All Allocations');
    });

    it('toggles label to "Variable Only" when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(VARIABLE_ONLY_TOGGLE).trigger('click');

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).text()).toContain('Variable Only');
    });

    it('passes variableOnly prop to BudgetAllocationList', async () => {
      const wrapper = createWrapper();

      await wrapper.find(VARIABLE_ONLY_TOGGLE).trigger('click');

      const allocationList = wrapper.findComponent({ name: 'BudgetAllocationList' });
      expect(allocationList.props('variableOnly')).toBe(true);
    });
  });

  describe('toolbar — save', () => {
    it('calls store.save when Save is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.save).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget saved');
    });

    it('shows an error notification if save fails', async () => {
      const errorMessage = 'Failed to save budget';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });
});
