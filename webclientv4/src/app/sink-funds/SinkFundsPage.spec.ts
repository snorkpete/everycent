import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SinkFundsPage from './SinkFundsPage.vue';
import SinkFundAllocationTable from './SinkFundAllocationTable.vue';
import SinkFundTransferDialog from './SinkFundTransferDialog.vue';
import type { SinkFundData } from './sinkFund.types';

// Selectors
const SINK_FUND_SELECT = '[data-testid="sink-fund-select"]';
const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const ADD_OBLIGATION_BTN = '[data-testid="add-obligation-btn"]';
const TRANSFER_BTN = '[data-testid="transfer-btn"]';
const SHOW_CLOSED_TOGGLE = '[data-testid="show-closed-toggle"]';
const LOADING_PLACEHOLDER = '[data-testid="loading-placeholder"]';
const EMPTY_PLACEHOLDER = '[data-testid="empty-placeholder"]';
const ALLOCATIONS_TABLE = '[data-testid="allocations-table"]';

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

const mockRoute = { query: {} as Record<string, string> };
const mockRouter = { replace: vi.fn() };
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

const sinkFundA: SinkFundData = {
  id: 1,
  name: 'Emergency Fund',
  current_balance: 50000,
  sink_fund_allocations: [],
};
const sinkFundB: SinkFundData = {
  id: 2,
  name: 'Holiday Fund',
  current_balance: 30000,
  sink_fund_allocations: [],
};

const mockStore = reactive({
  sinkFunds: [sinkFundA, sinkFundB] as SinkFundData[],
  sinkFund: null as SinkFundData | null,
  loading: false,
  error: null as string | null,
  isEditMode: false,
  showDeactivated: false,
  visibleAllocations: [] as SinkFundData['sink_fund_allocations'],
  totalAssignedBalance: 0,
  unassignedBalance: 0,
  totalTarget: 0,
  totalOutstanding: 0,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  fetchDetail: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
  enterEditMode: vi.fn(),
  exitEditMode: vi.fn(),
  cancelEdit: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./sinkFundStore', () => ({
  useSinkFundStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(SinkFundsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('SinkFundsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.sinkFunds = [sinkFundA, sinkFundB];
    mockStore.sinkFund = null;
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.isEditMode = false;
    mockStore.showDeactivated = false;
    mockStore.visibleAllocations = [];
    mockStore.totalAssignedBalance = 0;
    mockStore.unassignedBalance = 0;
    mockStore.totalTarget = 0;
    mockStore.totalOutstanding = 0;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.fetchDetail.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
    mockStore.cancelEdit.mockResolvedValue(undefined);
    mockRoute.query = {};
  });

  describe('on mount', () => {
    it('sets the page heading to "Sink Fund Obligations"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Sink Fund Obligations');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });

    it('does not call fetchDetail if no sink_fund_id query param', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchDetail).not.toHaveBeenCalled();
    });

    it('calls fetchDetail with id from query param on mount', async () => {
      mockRoute.query = { sink_fund_id: '2' };

      createWrapper();
      await nextTick();

      expect(mockStore.fetchDetail).toHaveBeenCalledWith(2);
    });
  });

  describe('sink fund selector', () => {
    it('renders the sink fund select dropdown', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent(SINK_FUND_SELECT).exists()).toBe(true);
    });

    it('passes sinkFunds as options to the dropdown', () => {
      const wrapper = createWrapper();

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      expect(select.props()).toHaveProperty('options', [sinkFundA, sinkFundB]);
    });

    it('calls fetchDetail and updates router when a sink fund is selected', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      await select.vm.$emit('update:modelValue', 1);
      await nextTick();

      expect(mockStore.fetchDetail).toHaveBeenCalledWith(1);
      expect(mockRouter.replace).toHaveBeenCalledWith({ query: { sink_fund_id: 1 } });
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit and Transfer Money buttons when not in edit mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(false);
    });

    it('shows Save, Cancel, and Add Obligation buttons when in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(false);
    });

    it('opens transfer dialog when Transfer Money is clicked', async () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent(SinkFundTransferDialog).props('visible')).toBe(false);

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await nextTick();

      expect(wrapper.findComponent(SinkFundTransferDialog).props('visible')).toBe(true);
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

      expect(mockNotifySuccess).toHaveBeenCalledWith('Sink fund saved');
    });

    it('shows an error notification if save fails', async () => {
      const errorMessage = 'Save failed';
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

  describe('toolbar — add obligation', () => {
    it('adds a new empty allocation to sinkFund when Add Obligation is clicked', async () => {
      mockStore.isEditMode = true;
      mockStore.sinkFund = { ...sinkFundA, sink_fund_allocations: [] };
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(ADD_OBLIGATION_BTN).trigger('click');

      expect(mockStore.sinkFund.sink_fund_allocations).toHaveLength(1);
      expect(mockStore.sinkFund.sink_fund_allocations![0]).toMatchObject({
        name: '',
        amount: 0,
        status: 'open',
        unsaved: true,
      });
    });

    it('does nothing when Add Obligation is clicked and sinkFund is null', async () => {
      mockStore.isEditMode = true;
      mockStore.sinkFund = null;
      const wrapper = createWrapper();
      await nextTick();

      // Should not throw
      await wrapper.find(ADD_OBLIGATION_BTN).trigger('click');
    });
  });

  describe('show closed toggle', () => {
    it('renders the show closed toggle', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SHOW_CLOSED_TOGGLE).exists()).toBe(true);
    });
  });

  describe('content area', () => {
    it('shows loading placeholder when loading is true', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      expect(wrapper.find(LOADING_PLACEHOLDER).exists()).toBe(true);
      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(false);
    });

    it('shows empty placeholder when not loading and no sink fund selected', () => {
      mockStore.loading = false;
      mockStore.sinkFund = null;
      const wrapper = createWrapper();

      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(true);
      expect(wrapper.find(LOADING_PLACEHOLDER).exists()).toBe(false);
    });

    it('renders SinkFundAllocationTable when a sink fund is selected', async () => {
      mockStore.loading = false;
      mockStore.sinkFund = sinkFundA;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(SinkFundAllocationTable).exists()).toBe(true);
      expect(wrapper.find(ALLOCATIONS_TABLE).exists()).toBe(true);
      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(false);
    });

    it('does not render SinkFundAllocationTable when no sink fund is selected', () => {
      mockStore.loading = false;
      mockStore.sinkFund = null;
      const wrapper = createWrapper();

      expect(wrapper.findComponent(SinkFundAllocationTable).exists()).toBe(false);
    });
  });
});
