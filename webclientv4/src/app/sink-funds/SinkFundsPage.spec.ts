import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SinkFundsPage from './SinkFundsPage.vue';
import SinkFundAllocationTable from './SinkFundAllocationTable.vue';
import SinkFundTransferDialog from './SinkFundTransferDialog.vue';
import SinkFundsToolbarMobile from './SinkFundsToolbarMobile.vue';
import { sinkFundApi } from './sinkFundApi';
import { useSinkFundStore } from './sinkFundStore';
import { buildSinkFund } from '../../test/factories';

const isMobile = ref(false);
vi.mock('../shared/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile,
    isCompact: ref(false),
  }),
}));

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

vi.mock('./sinkFundApi', () => ({
  sinkFundApi: {
    getAll: vi.fn(),
    get: vi.fn(),
    save: vi.fn(),
    transfer: vi.fn(),
    getTransactionsForAllocation: vi.fn(),
  },
}));

const sinkFundA = buildSinkFund({
  id: 1,
  name: 'Emergency Fund',
  current_balance: 50000,
  sink_fund_allocations: [],
});
const sinkFundB = buildSinkFund({
  id: 2,
  name: 'Holiday Fund',
  current_balance: 30000,
  sink_fund_allocations: [],
});

describe('SinkFundsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(sinkFundApi.getAll).mockResolvedValue([sinkFundA, sinkFundB]);
    vi.mocked(sinkFundApi.get).mockResolvedValue(sinkFundA);
    vi.mocked(sinkFundApi.save).mockResolvedValue(sinkFundA);
    mockRoute.query = {};
    isMobile.value = false;
  });

  function createWrapper(): VueWrapper {
    return mount(SinkFundsPage, {
      global: {
        plugins: [PrimeVue, pinia],
      },
    });
  }

  describe('on mount', () => {
    it('sets the page heading to "Sink Fund Obligations"', async () => {
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Sink Fund Obligations');
    });

    it('calls sinkFundApi.getAll on mount', async () => {
      createWrapper();
      await flushPromises();

      expect(sinkFundApi.getAll).toHaveBeenCalled();
    });

    it('does not call sinkFundApi.get if no sink_fund_id query param', async () => {
      createWrapper();
      await flushPromises();

      expect(sinkFundApi.get).not.toHaveBeenCalled();
    });

    it('calls sinkFundApi.get with id from query param on mount', async () => {
      mockRoute.query = { sink_fund_id: '2' };

      createWrapper();
      await flushPromises();

      expect(sinkFundApi.get).toHaveBeenCalledWith(2);
    });
  });

  describe('sink fund selector', () => {
    it('renders the sink fund select dropdown', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SINK_FUND_SELECT).exists()).toBe(true);
    });

    it('passes sinkFunds as options to the dropdown', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      expect(select.props()).toHaveProperty('options', [sinkFundA, sinkFundB]);
    });

    it('calls sinkFundApi.get and updates router when a sink fund is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      await select.vm.$emit('update:modelValue', 1);
      await flushPromises();

      expect(sinkFundApi.get).toHaveBeenCalledWith(1);
      expect(mockRouter.replace).toHaveBeenCalledWith({ query: { sink_fund_id: 1 } });
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit and Transfer Money buttons when not in edit mode', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(false);
    });

    it('shows Save, Cancel, and Add Obligation buttons when in edit mode', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(false);
    });

    it('opens transfer dialog when Transfer Money is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SinkFundTransferDialog).props('visible')).toBe(false);

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.findComponent(SinkFundTransferDialog).props('visible')).toBe(true);
    });

    it('enters edit mode when Edit is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      const store = useSinkFundStore();
      expect(store.isEditMode).toBe(true);
    });

    it('calls sinkFundApi.get to reload when Cancel is clicked', async () => {
      const detailFund = buildSinkFund({ id: 5, name: 'Detail Fund' });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);

      mockRoute.query = { sink_fund_id: '5' };
      const wrapper = createWrapper();
      await flushPromises();

      // Enter edit mode
      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      // Clear mock to track only the cancel-triggered call
      vi.mocked(sinkFundApi.get).mockClear();
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);

      await wrapper.find(CANCEL_BTN).trigger('click');
      await flushPromises();

      expect(sinkFundApi.get).toHaveBeenCalledWith(5);
      expect(store.isEditMode).toBe(false);
    });
  });

  describe('toolbar — save', () => {
    it('calls sinkFundApi.save when Save is clicked', async () => {
      const detailFund = buildSinkFund({ id: 1, name: 'Emergency Fund' });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);
      vi.mocked(sinkFundApi.save).mockResolvedValue(detailFund);

      mockRoute.query = { sink_fund_id: '1' };
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(sinkFundApi.save).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      const detailFund = buildSinkFund({ id: 1, name: 'Emergency Fund' });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);
      vi.mocked(sinkFundApi.save).mockResolvedValue(detailFund);

      mockRoute.query = { sink_fund_id: '1' };
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Sink fund saved');
    });

    it('shows an error notification if save fails', async () => {
      const detailFund = buildSinkFund({ id: 1, name: 'Emergency Fund' });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);
      vi.mocked(sinkFundApi.save).mockRejectedValue(new Error('Server error'));

      mockRoute.query = { sink_fund_id: '1' };
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalled();
    });
  });

  describe('toolbar — add obligation', () => {
    it('adds a new empty allocation to sinkFund when Add Obligation is clicked', async () => {
      const detailFund = buildSinkFund({ id: 1, sink_fund_allocations: [] });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);

      mockRoute.query = { sink_fund_id: '1' };
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(ADD_OBLIGATION_BTN).trigger('click');

      expect(store.sinkFund!.sink_fund_allocations).toHaveLength(1);
      expect(store.sinkFund!.sink_fund_allocations![0]).toMatchObject({
        name: '',
        amount: 0,
        status: 'open',
        unsaved: true,
      });
    });

    it('does nothing when Add Obligation is clicked and sinkFund is null', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      // sinkFund is null (no detail fetched), should not throw
      await wrapper.find(ADD_OBLIGATION_BTN).trigger('click');
      expect(store.sinkFund).toBeNull();
    });
  });

  describe('show closed toggle', () => {
    it('renders the show closed toggle', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(SHOW_CLOSED_TOGGLE).exists()).toBe(true);
    });
  });

  describe('content area', () => {
    it('shows loading placeholder when loading is true', async () => {
      // Make getAll hang to keep loading=true
      vi.mocked(sinkFundApi.getAll).mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(LOADING_PLACEHOLDER).exists()).toBe(true);
      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(false);
    });

    it('shows empty placeholder when not loading and no sink fund selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(true);
      expect(wrapper.find(LOADING_PLACEHOLDER).exists()).toBe(false);
    });

    it('renders SinkFundAllocationTable when a sink fund is selected', async () => {
      const detailFund = buildSinkFund({ id: 1, name: 'Emergency Fund' });
      vi.mocked(sinkFundApi.get).mockResolvedValue(detailFund);

      mockRoute.query = { sink_fund_id: '1' };
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SinkFundAllocationTable).exists()).toBe(true);
      expect(wrapper.find(EMPTY_PLACEHOLDER).exists()).toBe(false);
    });

    it('does not render SinkFundAllocationTable when no sink fund is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SinkFundAllocationTable).exists()).toBe(false);
    });
  });

  describe('responsive toolbar', () => {
    it('renders desktop toolbar when isMobile is false', async () => {
      isMobile.value = false;

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SinkFundsToolbarMobile).exists()).toBe(false);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
    });

    it('renders SinkFundsToolbarMobile when isMobile is true', async () => {
      isMobile.value = true;

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findComponent(SinkFundsToolbarMobile).exists()).toBe(true);
    });

    it('triggers sink fund fetch when mobile toolbar emits update:selectedSinkFundId', async () => {
      isMobile.value = true;

      const wrapper = createWrapper();
      await flushPromises();

      const mobileToolbar = wrapper.findComponent(SinkFundsToolbarMobile);
      await mobileToolbar.vm.$emit('update:selectedSinkFundId', 2);
      await flushPromises();

      expect(sinkFundApi.get).toHaveBeenCalledWith(2);
      expect(mockRouter.replace).toHaveBeenCalledWith({ query: { sink_fund_id: 2 } });
    });

    it('opens transfer dialog when mobile toolbar emits transfer', async () => {
      isMobile.value = true;
      mockRoute.query = { sink_fund_id: '1' };

      const wrapper = createWrapper();
      await flushPromises();

      const mobileToolbar = wrapper.findComponent(SinkFundsToolbarMobile);
      await mobileToolbar.vm.$emit('transfer');
      await flushPromises();

      const dialog = wrapper.findComponent(SinkFundTransferDialog);
      expect(dialog.props('visible')).toBe(true);
    });

    it('saves the sink fund when mobile toolbar emits save', async () => {
      isMobile.value = true;
      mockRoute.query = { sink_fund_id: '1' };

      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      await flushPromises();

      const mobileToolbar = wrapper.findComponent(SinkFundsToolbarMobile);
      await mobileToolbar.vm.$emit('save');
      await flushPromises();

      expect(sinkFundApi.save).toHaveBeenCalled();
    });

    it('exits edit mode when mobile toolbar emits cancel', async () => {
      isMobile.value = true;
      mockRoute.query = { sink_fund_id: '1' };

      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      expect(store.isEditMode).toBe(true);

      const mobileToolbar = wrapper.findComponent(SinkFundsToolbarMobile);
      await mobileToolbar.vm.$emit('cancel');
      await flushPromises();

      expect(store.isEditMode).toBe(false);
    });

    it('adds an obligation when mobile toolbar emits addObligation', async () => {
      isMobile.value = true;
      mockRoute.query = { sink_fund_id: '1' };

      const wrapper = createWrapper();
      await flushPromises();

      const store = useSinkFundStore();
      store.enterEditMode();
      const countBefore = store.sinkFund?.sink_fund_allocations?.length ?? 0;

      const mobileToolbar = wrapper.findComponent(SinkFundsToolbarMobile);
      await mobileToolbar.vm.$emit('addObligation');
      await flushPromises();

      expect(store.sinkFund?.sink_fund_allocations?.length).toBe(countBefore + 1);
    });
  });
});
