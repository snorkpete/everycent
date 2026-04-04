import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import BudgetsPage from './BudgetsPage.vue';
import { buildBudget } from '../../test/factories';
import type { BudgetData } from './budget.types';

// Selectors
const ADD_BTN = '[data-testid="add-budget-btn"]';
const REOPEN_BTN = '[data-testid="reopen-btn"]';
const REFRESH_BTN = '[data-testid="refresh-btn"]';
const BUDGET_ROW = '[data-testid="budget-row"]';

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

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('./budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    copy: vi.fn(),
    close: vi.fn(),
    reopenLast: vi.fn(),
    create: vi.fn(),
  },
}));

// Stub ConfirmDialog to avoid teleport complexity
const ConfirmDialogStub = {
  name: 'ConfirmDialog',
  template: '<div data-testid="confirm-dialog" />',
};

// Stub AddBudgetDialog
const AddBudgetDialogStub = {
  name: 'AddBudgetDialog',
  template: '<div data-testid="add-budget-dialog" />',
  props: ['visible'],
  emits: ['update:visible', 'save'],
};

// Stub useConfirm — capture the last require call so tests can invoke accept
let lastConfirmCall: { accept?: () => void } = {};
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: (opts: { accept?: () => void }) => {
      lastConfirmCall = opts;
    },
  }),
}));

const budget1 = buildBudget({ id: 1, name: 'Mar 2025', status: 'open' });
const budget2 = buildBudget({ id: 2, name: 'Feb 2025', status: 'open' });
const budget3 = buildBudget({ id: 3, name: 'Jan 2025', status: 'closed' });
const allBudgets: BudgetData[] = [budget1, budget2, budget3];

describe('BudgetsPage', () => {
  let pinia: Pinia;
  let budgetApi: (typeof import('./budgetApi'))['budgetApi'];

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    lastConfirmCall = {};

    const mod = await import('./budgetApi');
    budgetApi = mod.budgetApi;

    vi.mocked(budgetApi.getAll).mockResolvedValue(allBudgets);
    vi.mocked(budgetApi.copy).mockResolvedValue(undefined as never);
    vi.mocked(budgetApi.close).mockResolvedValue(undefined as never);
    vi.mocked(budgetApi.reopenLast).mockResolvedValue(undefined as never);
    vi.mocked(budgetApi.create).mockResolvedValue(undefined as never);
  });

  function createWrapper(): VueWrapper {
    return mount(BudgetsPage, {
      global: {
        plugins: [PrimeVue, pinia],
        stubs: {
          ConfirmDialog: ConfirmDialogStub,
          AddBudgetDialog: AddBudgetDialogStub,
        },
      },
    });
  }

  describe('on mount', () => {
    it('sets the page heading to "Budgets"', async () => {
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Budgets');
    });

    it('calls budgetApi.getAll on mount', async () => {
      createWrapper();
      await flushPromises();

      expect(budgetApi.getAll).toHaveBeenCalled();
    });
  });

  describe('budget table', () => {
    it('renders a row for each budget', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const rows = wrapper.findAll(BUDGET_ROW);
      expect(rows).toHaveLength(3);
    });

    it('shows the budget name in each row', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const rows = wrapper.findAll(BUDGET_ROW);
      expect(rows[0].text()).toContain('Mar 2025');
      expect(rows[1].text()).toContain('Feb 2025');
      expect(rows[2].text()).toContain('Jan 2025');
    });

    it('links each budget name to the budget detail page', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const link = wrapper.find(`[data-testid="budget-name-link-${budget1.id}"]`);
      expect(link.exists()).toBe(true);
      expect(link.text()).toBe('Mar 2025');

      await link.trigger('click');
      expect(mockPush).toHaveBeenCalledWith(`/budgets/${budget1.id}`);
    });

    it('shows a status badge for each budget', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const openBadge = wrapper.find(`[data-testid="status-${budget1.id}"]`);
      expect(openBadge.text()).toBe('open');
      expect(openBadge.classes()).toContain('status-open');

      const closedBadge = wrapper.find(`[data-testid="status-${budget3.id}"]`);
      expect(closedBadge.text()).toBe('closed');
      expect(closedBadge.classes()).toContain('status-closed');
    });

    it('shows empty state when there are no budgets', async () => {
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('No budgets found.');
    });
  });

  describe('View button', () => {
    it('shows a View button for every budget', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(`[data-testid="view-btn-${budget1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="view-btn-${budget2.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="view-btn-${budget3.id}"]`).exists()).toBe(true);
    });

    it('navigates to /budgets/:id when View is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="view-btn-${budget1.id}"]`).trigger('click');

      expect(mockPush).toHaveBeenCalledWith(`/budgets/${budget1.id}`);
    });
  });

  describe('Copy button', () => {
    it('shows Copy button only for the first budget', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="copy-btn-${budget2.id}"]`).exists()).toBe(false);
      expect(wrapper.find(`[data-testid="copy-btn-${budget3.id}"]`).exists()).toBe(false);
    });

    it('shows confirmation dialog when Copy is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls budgetApi.copy and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(budgetApi.copy).toHaveBeenCalledWith(budget1.id);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget copied');
    });

    it('shows error notification when copy fails', async () => {
      vi.mocked(budgetApi.copy).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('Close button', () => {
    it('shows Close button only for the last open budget', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(`[data-testid="close-btn-${budget1.id}"]`).exists()).toBe(false);
      expect(wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="close-btn-${budget3.id}"]`).exists()).toBe(false);
    });

    it('shows confirmation dialog when Close is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls budgetApi.close and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(budgetApi.close).toHaveBeenCalledWith(budget2.id);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget closed');
    });

    it('shows error notification when close fails', async () => {
      vi.mocked(budgetApi.close).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('Reopen Last Budget button', () => {
    it('renders the Reopen Last Budget button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(REOPEN_BTN).exists()).toBe(true);
    });

    it('shows confirmation dialog when clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(REOPEN_BTN).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls budgetApi.reopenLast and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(REOPEN_BTN).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(budgetApi.reopenLast).toHaveBeenCalled();
      expect(mockNotifySuccess).toHaveBeenCalledWith('Last budget re-opened');
    });

    it('shows error notification when reopen fails', async () => {
      vi.mocked(budgetApi.reopenLast).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(REOPEN_BTN).trigger('click');
      await lastConfirmCall.accept!();
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('Add New Budget button', () => {
    it('renders the Add New Budget button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('opens the AddBudgetDialog when clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(ADD_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('calls budgetApi.create and shows success notification on save', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(ADD_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      await dialog.vm.$emit('save', '2025-04-01');
      await flushPromises();

      expect(budgetApi.create).toHaveBeenCalledWith({ start_date: '2025-04-01' });
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget created');
    });

    it('shows error notification when add fails', async () => {
      vi.mocked(budgetApi.create).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(ADD_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      await dialog.vm.$emit('save', '2025-04-01');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('Refresh button', () => {
    it('calls budgetApi.getAll when refresh button is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(REFRESH_BTN).trigger('click');
      await flushPromises();

      // Called once on mount and once on click
      expect(budgetApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
