import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import BudgetsPage from './BudgetsPage.vue';
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

function makeBudget(overrides: Partial<BudgetData> = {}): BudgetData {
  return {
    id: 1,
    name: 'Jan 2025',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    status: 'open',
    ...overrides,
  };
}

const budget1 = makeBudget({ id: 1, name: 'Mar 2025', status: 'open' });
const budget2 = makeBudget({ id: 2, name: 'Feb 2025', status: 'open' });
const budget3 = makeBudget({ id: 3, name: 'Jan 2025', status: 'closed' });

// Mock useConfirm — capture the last require call so tests can invoke accept
let lastConfirmCall: { accept?: () => void } = {};
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: (opts: { accept?: () => void }) => {
      lastConfirmCall = opts;
    },
  }),
}));

const mockStore = reactive({
  budgets: [budget1, budget2, budget3] as BudgetData[],
  loading: false,
  error: null as string | null,
  canCopy: (b: BudgetData) => b.id === budget1.id,
  canClose: (b: BudgetData) => b.id === budget2.id,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  copyBudget: vi.fn().mockResolvedValue(undefined),
  closeBudget: vi.fn().mockResolvedValue(undefined),
  reopenLastBudget: vi.fn().mockResolvedValue(undefined),
  addBudget: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./budgetListStore', () => ({
  useBudgetListStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(BudgetsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        ConfirmDialog: ConfirmDialogStub,
        AddBudgetDialog: AddBudgetDialogStub,
      },
    },
  });
}

describe('BudgetsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    lastConfirmCall = {};
    mockStore.budgets = [budget1, budget2, budget3];
    mockStore.error = null;
    mockStore.loading = false;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.copyBudget.mockResolvedValue(undefined);
    mockStore.closeBudget.mockResolvedValue(undefined);
    mockStore.reopenLastBudget.mockResolvedValue(undefined);
    mockStore.addBudget.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Budgets"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Budgets');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });
  });

  describe('budget table', () => {
    it('renders a row for each budget', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(BUDGET_ROW);
      expect(rows).toHaveLength(3);
    });

    it('shows the budget name in each row', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(BUDGET_ROW);
      expect(rows[0].text()).toContain('Mar 2025');
      expect(rows[1].text()).toContain('Feb 2025');
      expect(rows[2].text()).toContain('Jan 2025');
    });

    it('links each budget name to the budget detail page', async () => {
      const wrapper = createWrapper();

      const link = wrapper.find(`[data-testid="budget-name-link-${budget1.id}"]`);
      expect(link.exists()).toBe(true);
      expect(link.text()).toBe('Mar 2025');

      await link.trigger('click');
      expect(mockPush).toHaveBeenCalledWith(`/budgets/${budget1.id}`);
    });

    it('shows a status badge for each budget', () => {
      const wrapper = createWrapper();

      const openBadge = wrapper.find(`[data-testid="status-${budget1.id}"]`);
      expect(openBadge.text()).toBe('open');
      expect(openBadge.classes()).toContain('status-open');

      const closedBadge = wrapper.find(`[data-testid="status-${budget3.id}"]`);
      expect(closedBadge.text()).toBe('closed');
      expect(closedBadge.classes()).toContain('status-closed');
    });

    it('shows empty state when there are no budgets', async () => {
      mockStore.budgets = [];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).toContain('No budgets found.');
    });
  });

  describe('View button', () => {
    it('shows a View button for every budget', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(`[data-testid="view-btn-${budget1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="view-btn-${budget2.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="view-btn-${budget3.id}"]`).exists()).toBe(true);
    });

    it('navigates to /budgets/:id when View is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="view-btn-${budget1.id}"]`).trigger('click');

      expect(mockPush).toHaveBeenCalledWith(`/budgets/${budget1.id}`);
    });
  });

  describe('Copy button', () => {
    it('shows Copy button only for the first budget', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="copy-btn-${budget2.id}"]`).exists()).toBe(false);
      expect(wrapper.find(`[data-testid="copy-btn-${budget3.id}"]`).exists()).toBe(false);
    });

    it('shows confirmation dialog when Copy is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls store.copyBudget and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockStore.copyBudget).toHaveBeenCalledWith(budget1.id);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget copied');
    });

    it('shows error notification when copy fails', async () => {
      const errorMessage = 'Failed to copy budget';
      mockStore.copyBudget.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="copy-btn-${budget1.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Close button', () => {
    it('shows Close button only for the last open budget', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(`[data-testid="close-btn-${budget1.id}"]`).exists()).toBe(false);
      expect(wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="close-btn-${budget3.id}"]`).exists()).toBe(false);
    });

    it('shows confirmation dialog when Close is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls store.closeBudget and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockStore.closeBudget).toHaveBeenCalledWith(budget2.id);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget closed');
    });

    it('shows error notification when close fails', async () => {
      const errorMessage = 'Failed to close budget';
      mockStore.closeBudget.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();

      await wrapper.find(`[data-testid="close-btn-${budget2.id}"]`).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Reopen Last Budget button', () => {
    it('renders the Reopen Last Budget button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(REOPEN_BTN).exists()).toBe(true);
    });

    it('shows confirmation dialog when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REOPEN_BTN).trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('calls store.reopenLastBudget and shows success notification when confirmed', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REOPEN_BTN).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockStore.reopenLastBudget).toHaveBeenCalled();
      expect(mockNotifySuccess).toHaveBeenCalledWith('Last budget re-opened');
    });

    it('shows error notification when reopen fails', async () => {
      const errorMessage = 'Failed to reopen budget';
      mockStore.reopenLastBudget.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();

      await wrapper.find(REOPEN_BTN).trigger('click');
      await lastConfirmCall.accept!();
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Add New Budget button', () => {
    it('renders the Add New Budget button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('opens the AddBudgetDialog when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('calls store.addBudget and shows success notification on save', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      await dialog.vm.$emit('save', '2025-04-01');
      await nextTick();

      expect(mockStore.addBudget).toHaveBeenCalledWith('2025-04-01');
      expect(mockNotifySuccess).toHaveBeenCalledWith('Budget created');
    });

    it('shows error notification when add fails', async () => {
      const errorMessage = 'Failed to create budget';
      mockStore.addBudget.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();

      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'AddBudgetDialog' });
      await dialog.vm.$emit('save', '2025-04-01');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Refresh button', () => {
    it('calls fetchAll when refresh button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REFRESH_BTN).trigger('click');

      // Called once on mount and once on click
      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2);
    });
  });
});
