import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AdjustBalancesDialog from './AdjustBalancesDialog.vue';
import type { AccountBalanceData } from './accountBalance.types';

// Selectors
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';

// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['visible', 'header', 'modal'],
  emits: ['update:visible'],
};

// Stub EcMoneyField to simplify testing
const EcMoneyFieldStub = {
  name: 'EcMoneyField',
  template: '<input :data-testid="$attrs[\'data-testid\']" />',
  props: ['label', 'editMode', 'modelValue'],
  emits: ['update:modelValue'],
};

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const mockStore = reactive({
  error: null as string | null,
  adjustBalances: vi.fn(),
});

vi.mock('./accountBalanceStore', () => ({
  useAccountBalanceStore: () => mockStore,
}));

const checkingAccount: AccountBalanceData = {
  id: 1,
  name: 'Joint Checking',
  account_type: 'checking_account',
  account_category: 'current',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 100000,
  expected_closing_balance: 90000,
  current_balance: 100000,
};

const savingsAccount: AccountBalanceData = {
  id: 2,
  name: 'Savings',
  account_type: 'savings_account',
  account_category: 'asset',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 200000,
  expected_closing_balance: 200000,
  current_balance: 200000,
};

function createWrapper(
  props: { visible: boolean; accounts: AccountBalanceData[] } = {
    visible: true,
    accounts: [checkingAccount, savingsAccount],
  },
): VueWrapper {
  return mount(AdjustBalancesDialog, {
    props,
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        Dialog: DialogStub,
        EcMoneyField: EcMoneyFieldStub,
      },
    },
  });
}

describe('AdjustBalancesDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.error = null;
    mockStore.adjustBalances.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('renders account names as column headers', () => {
      const wrapper = createWrapper();

      const headers = wrapper.findAll('thead th');
      expect(headers.some((h) => h.text() === 'Joint Checking')).toBe(true);
      expect(headers.some((h) => h.text() === 'Savings')).toBe(true);
    });

    it('renders Current Balance row label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Current Balance');
    });

    it('renders New Account Balance row label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('New Account Balance');
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

  describe('adjustments initialisation', () => {
    it('initialises adjustments from account current_balance values when visible', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const vm = wrapper.vm as { adjustments: Array<{ bank_account_id: number; new_balance: number; currentBalance: number }> };
      expect(vm.adjustments).toHaveLength(2);
      expect(vm.adjustments[0].bank_account_id).toBe(1);
      expect(vm.adjustments[0].new_balance).toBe(100000);
      expect(vm.adjustments[0].currentBalance).toBe(100000);
    });

    it('resets adjustments when dialog becomes visible again', async () => {
      const wrapper = createWrapper({ visible: false, accounts: [checkingAccount] });
      await nextTick();

      await wrapper.setProps({ visible: true });
      await nextTick();

      const vm = wrapper.vm as { adjustments: Array<{ new_balance: number }> };
      expect(vm.adjustments[0].new_balance).toBe(100000);
    });
  });

  describe('save', () => {
    it('calls store.adjustBalances with the adjustments', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockStore.adjustBalances).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ bank_account_id: 1, new_balance: 100000, currentBalance: 100000 }),
          expect.objectContaining({ bank_account_id: 2, new_balance: 200000, currentBalance: 200000 }),
        ]),
      );
    });

    it('shows success notification after saving', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Balances adjusted.');
    });

    it('emits update:visible false after saving', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')![0]).toEqual([false]);
    });

    it('shows error notification if save fails', async () => {
      mockStore.adjustBalances.mockImplementation(async () => {
        mockStore.error = 'Something went wrong';
        throw new Error('API error');
      });
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('cancel', () => {
    it('emits update:visible false when Cancel is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')![0]).toEqual([false]);
    });
  });
});
