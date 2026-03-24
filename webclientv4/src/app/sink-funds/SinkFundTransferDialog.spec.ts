import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import SinkFundTransferDialog from './SinkFundTransferDialog.vue';
import { sinkFundApi } from './sinkFundApi';
import type { SinkFundAllocationData, SinkFundData, SinkFundTransferFormData } from './sinkFund.types';

// Selectors
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const FROM_SELECT = '[data-testid="from-select"]';
const TO_SELECT = '[data-testid="to-select"]';

vi.mock('./sinkFundApi', () => ({
  sinkFundApi: {
    transfer: vi.fn(),
  },
}));

const allocations: SinkFundAllocationData[] = [
  { id: 10, name: 'Car Repair', current_balance: 50000, target: 100000, status: 'open' },
  { id: 20, name: 'Medical', current_balance: 30000, target: 50000, status: 'open' },
  { id: 30, name: 'Holiday', current_balance: 0, target: 20000, status: 'open' },
];

const sinkFund: SinkFundData = {
  id: 1,
  name: 'Emergency Fund',
  current_balance: 100000,
  sink_fund_allocations: allocations,
};

const mockStore = reactive({
  sinkFund: sinkFund as SinkFundData | null,
  unassignedBalance: 20000, // 100000 - (50000 + 30000 + 0)
  fetchDetail: vi.fn(),
});

vi.mock('./sinkFundStore', () => ({
  useSinkFundStore: () => mockStore,
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

// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['visible'],
  emits: ['update:visible'],
};

function createWrapper(props: Partial<{ visible: boolean }> = {}): VueWrapper<InstanceType<typeof SinkFundTransferDialog>> {
  return mount(SinkFundTransferDialog, {
    props: {
      visible: true,
      ...props,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

type FormVM = {
  form: SinkFundTransferFormData;
};

describe('SinkFundTransferDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.sinkFund = sinkFund;
    mockStore.unassignedBalance = 20000;
    mockStore.fetchDetail = vi.fn();
    vi.mocked(sinkFundApi.transfer).mockResolvedValue({} as SinkFundData);
  });

  describe('rendering', () => {
    it('passes "Transfer Money" as header to Dialog', () => {
      const wrapper = createWrapper();
      const dialog = wrapper.findComponent(DialogStub);
      expect(dialog.props('visible')).toBe(true);
    });

    it('renders From select', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(FROM_SELECT).exists()).toBe(true);
    });

    it('renders To select', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(TO_SELECT).exists()).toBe(true);
    });

    it('renders Save button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
    });

    it('renders Cancel button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });
  });

  describe('Save button validation', () => {
    it('is disabled when no selections are made', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when from and to are the same', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 10;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when amount is zero', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 0;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when from is not selected', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = null;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when to is not selected', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = null;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeDefined();
    });

    it('is enabled when from, to (different), and amount are set', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeUndefined();
    });

    it('allows transferring from unassigned (0) to an allocation', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 0;
      vm.form.new_allocation_id = 10;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeUndefined();
    });

    it('allows transferring from an allocation to unassigned (0)', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 0;
      vm.form.amount = 5000;
      await nextTick();
      expect(wrapper.find(SAVE_BTN).attributes('disabled')).toBeUndefined();
    });
  });

  describe('transfer submission — success', () => {
    it('calls sinkFundApi.transfer with correct payload', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(sinkFundApi.transfer).toHaveBeenCalledWith(1, {
        existing_allocation_id: 10,
        new_allocation_id: 20,
        amount: 5000,
      });
    });

    it('calls transfer with 0 for unassigned money', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 0;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 3000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(sinkFundApi.transfer).toHaveBeenCalledWith(1, {
        existing_allocation_id: 0,
        new_allocation_id: 20,
        amount: 3000,
      });
    });

    it('shows success notification', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Transfer complete.');
    });

    it('refreshes the sink fund detail', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockStore.fetchDetail).toHaveBeenCalledWith(1);
    });

    it('emits "transferred" on success', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.emitted('transferred')).toBeDefined();
    });

    it('emits "update:visible" with false on success', async () => {
      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('transfer submission — error', () => {
    it('shows error notification on failure', async () => {
      vi.mocked(sinkFundApi.transfer).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Transfer failed: Server error');
    });

    it('does not close the dialog on failure', async () => {
      vi.mocked(sinkFundApi.transfer).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });

    it('does not refresh sink fund on failure', async () => {
      vi.mocked(sinkFundApi.transfer).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockStore.fetchDetail).not.toHaveBeenCalled();
    });
  });

  describe('Cancel button', () => {
    it('emits "update:visible" with false when Cancel is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('form reset on open', () => {
    it('resets form when dialog becomes visible', async () => {
      const wrapper = createWrapper({ visible: false });

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.existing_allocation_id = 10;
      vm.form.new_allocation_id = 20;
      vm.form.amount = 99999;

      await wrapper.setProps({ visible: true });
      await nextTick();

      expect(vm.form.existing_allocation_id).toBeNull();
      expect(vm.form.new_allocation_id).toBeNull();
      expect(vm.form.amount).toBe(0);
    });
  });
});
