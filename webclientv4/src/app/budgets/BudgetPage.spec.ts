import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetPage from './BudgetPage.vue';
import { budgetApi } from './budgetApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import { settingsApi } from '../settings/settingsApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { useHeadingStore } from '../toolbar/headingStore';
import {
  buildBudgetDetail,
  buildAllocationCategory,
  buildSettings,
  buildBankAccount,
} from '../../test/factories';

// Selectors
const BACK_BTN = '[data-testid="back-btn"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';
const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const INCOMES_SECTION = '[data-testid="incomes-section"]';
const ALLOCATIONS_SECTION = '[data-testid="allocations-section"]';

vi.mock('./budgetApi');
vi.mock('../allocation-categories/allocationCategoryApi');
vi.mock('../settings/settingsApi');
vi.mock('../bank-accounts/bankAccountApi');

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '213' } }),
  useRouter: () => ({ push: mockPush }),
}));

const sampleBudget = buildBudgetDetail({ id: 213, name: 'Mar 25 - Apr 24, 2026' });
const sampleCategories = [buildAllocationCategory({ id: 5, name: 'Food' })];
const sampleSettings = buildSettings();
const sampleBankAccounts = [buildBankAccount()];

let pinia: Pinia;

function createWrapper(): VueWrapper {
  return mount(BudgetPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('BudgetPage', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();

    vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
    vi.mocked(budgetApi.save).mockResolvedValue(sampleBudget);
    vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
    vi.mocked(settingsApi.get).mockResolvedValue(sampleSettings);
    vi.mocked(bankAccountApi.getOpen).mockResolvedValue(sampleBankAccounts);
  });

  describe('on mount', () => {
    it('calls budgetApi.get with the budget id from the route', async () => {
      createWrapper();
      await flushPromises();

      expect(budgetApi.get).toHaveBeenCalledWith(213);
    });

    it('calls allocationCategoryApi.getAll on mount', async () => {
      createWrapper();
      await flushPromises();

      expect(allocationCategoryApi.getAll).toHaveBeenCalled();
    });

    it('sets the heading to "Budget: {budget name}"', async () => {
      createWrapper();
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Budget: Mar 25 - Apr 24, 2026');
    });

    it('sets heading to "Budget" when budget has no name', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(
        buildBudgetDetail({ id: 213, name: undefined as unknown as string }),
      );
      createWrapper();
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Budget');
    });
  });

  describe('layout', () => {
    it('renders incomes placeholder section', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(INCOMES_SECTION).exists()).toBe(true);
    });

    it('renders allocations placeholder section', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(ALLOCATIONS_SECTION).exists()).toBe(true);
    });
  });

  describe('toolbar — navigation', () => {
    it('shows Back to Budget List button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(BACK_BTN).exists()).toBe(true);
    });

    it('navigates to /budgets when Back button is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(BACK_BTN).trigger('click');

      expect(mockPush).toHaveBeenCalledWith('/budgets');
    });

    it('shows View Transactions button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('links to /transactions with budget_id', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      const link = wrapper.find(VIEW_TRANSACTIONS_BTN);

      expect(link.attributes('href')).toBe('#/transactions?budget_id=213');
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit button in view mode', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('enters edit mode when Edit is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
    });

    it('calls cancelEdit and refetches when Cancel is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      vi.mocked(budgetApi.get).mockClear();
      vi.mocked(allocationCategoryApi.getAll).mockClear();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await flushPromises();

      // cancelEdit refetches the budget
      expect(budgetApi.get).toHaveBeenCalledWith(213);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
    });
  });

  describe('toolbar — save', () => {
    it('calls budgetApi.save when Save is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(budgetApi.save).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget saved');
    });

    it('shows an error notification if save fails', async () => {
      vi.mocked(budgetApi.save).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });
});
