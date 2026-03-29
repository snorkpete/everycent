import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AccountTransferDialog from './AccountTransferDialog.vue';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { transactionApi } from './transactionApi';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationData, BudgetData, SinkFundAllocationData } from './transaction.types';
import { DialogStub } from '../../test/stubs';

// Selectors
const TRANSFER_BTN = '[data-testid="transfer-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const FROM_SELECT = '[data-testid="from-account-select"]';
const TO_SELECT = '[data-testid="to-account-select"]';
const FROM_ALLOCATION_SELECT = '[data-testid="from-allocation-select"]';
const TO_ALLOCATION_SELECT = '[data-testid="to-allocation-select"]';
const FROM_SINK_FUND_SELECT = '[data-testid="from-sink-fund-select"]';
const TO_SINK_FUND_SELECT = '[data-testid="to-sink-fund-select"]';
const FROM_BALANCE_PREVIEW = '[data-testid="from-balance-preview"]';
const TO_BALANCE_PREVIEW = '[data-testid="to-balance-preview"]';

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
    getWithBalances: vi.fn(),
    transfer: vi.fn(),
  },
}));

vi.mock('./transactionApi', () => ({
  transactionApi: {
    getSinkFundAllocations: vi.fn(),
  },
}));

const checkingAccount: BankAccountData = {
  id: 1,
  name: 'Checking',
  is_sink_fund: false,
  current_balance: 100000,
};

const savingsAccount: BankAccountData = {
  id: 2,
  name: 'Savings',
  is_sink_fund: false,
  current_balance: 200000,
};

const sinkFundAccount: BankAccountData = {
  id: 3,
  name: 'Emergency Fund',
  is_sink_fund: true,
  current_balance: 50000,
};

const jan2025: BudgetData = { id: 1, name: 'Jan 2025', status: 'open' };

const sampleAllocations: AllocationData[] = [
  {
    id: 10,
    name: 'Groceries',
    allocation_category_id: 1,
    allocation_category: { id: 1, name: 'Food' },
  },
  {
    id: 11,
    name: 'Restaurants',
    allocation_category_id: 1,
    allocation_category: { id: 1, name: 'Food' },
  },
  {
    id: 20,
    name: 'Electricity',
    allocation_category_id: 2,
    allocation_category: { id: 2, name: 'Utilities' },
  },
];

const sinkFundAllocations: SinkFundAllocationData[] = [
  { id: 100, name: 'Emergency car repair' },
  { id: 101, name: 'Emergency medical' },
];

const mockStore = reactive({
  allocations: sampleAllocations as AllocationData[],
  selectedBudget: jan2025 as BudgetData | null,
});

vi.mock('./transactionStore', () => ({
  useTransactionStore: () => mockStore,
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

function createWrapper(props: Partial<{ visible: boolean }> = {}): VueWrapper {
  return mount(AccountTransferDialog, {
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

// Helper: mount with visible=true and wait for async data load
async function createAndLoad(props: Partial<{ visible: boolean }> = {}): Promise<VueWrapper> {
  const wrapper = createWrapper(props);
  await flushPromises();
  return wrapper;
}

type FormVM = {
  form: {
    from_id: number | null;
    to_id: number | null;
    amount: number;
    date: string;
    description: string;
    from_allocation_id: number | null;
    to_allocation_id: number | null;
    from_sink_fund_allocation_id: number | null;
    to_sink_fund_allocation_id: number | null;
  };
  onFromAccountChange: () => Promise<void>;
  onToAccountChange: () => Promise<void>;
};

describe('AccountTransferDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.allocations = sampleAllocations;
    mockStore.selectedBudget = jan2025;
    vi.mocked(bankAccountApi.getOpen).mockResolvedValue([
      checkingAccount,
      savingsAccount,
      sinkFundAccount,
    ]);
    vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue([
      checkingAccount,
      savingsAccount,
      sinkFundAccount,
    ]);
    vi.mocked(bankAccountApi.transfer).mockResolvedValue(undefined);
    vi.mocked(transactionApi.getSinkFundAllocations).mockResolvedValue(sinkFundAllocations);
  });

  describe('rendering', () => {
    it('renders From account select', async () => {
      const wrapper = await createAndLoad();
      expect(wrapper.find(FROM_SELECT).exists()).toBe(true);
    });

    it('renders To account select', async () => {
      const wrapper = await createAndLoad();
      expect(wrapper.find(TO_SELECT).exists()).toBe(true);
    });

    it('renders Transfer button', async () => {
      const wrapper = await createAndLoad();
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(true);
    });

    it('renders Cancel button', async () => {
      const wrapper = await createAndLoad();
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });
  });

  describe('data loading', () => {
    it('loads bank accounts with balances when dialog opens', async () => {
      await createAndLoad({ visible: true });

      expect(bankAccountApi.getWithBalances).toHaveBeenCalled();
    });

    it('does not load accounts when dialog is not visible', async () => {
      await createAndLoad({ visible: false });

      expect(bankAccountApi.getWithBalances).not.toHaveBeenCalled();
    });
  });

  describe('Transfer button validation', () => {
    it('is disabled when no from account is selected', async () => {
      const wrapper = await createAndLoad();

      expect(wrapper.find(TRANSFER_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when from and to are the same account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 1;
      vm.form.amount = 5000;
      await nextTick();

      expect(wrapper.find(TRANSFER_BTN).attributes('disabled')).toBeDefined();
    });

    it('is disabled when amount is zero', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 0;
      await nextTick();

      expect(wrapper.find(TRANSFER_BTN).attributes('disabled')).toBeDefined();
    });

    it('is enabled when from, to (different), and amount are set', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      expect(wrapper.find(TRANSFER_BTN).attributes('disabled')).toBeUndefined();
    });
  });

  describe('regular allocation dropdowns', () => {
    it('shows From Allocation select for non-sink-fund from account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1; // checkingAccount (not sink fund)
      await nextTick();

      expect(wrapper.find(FROM_ALLOCATION_SELECT).exists()).toBe(true);
      expect(wrapper.find(FROM_SINK_FUND_SELECT).exists()).toBe(false);
    });

    it('shows To Allocation select for non-sink-fund to account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.to_id = 2; // savingsAccount (not sink fund)
      await nextTick();

      expect(wrapper.find(TO_ALLOCATION_SELECT).exists()).toBe(true);
      expect(wrapper.find(TO_SINK_FUND_SELECT).exists()).toBe(false);
    });

    it('shows neither allocation select when no account selected', async () => {
      const wrapper = await createAndLoad();

      expect(wrapper.find(FROM_ALLOCATION_SELECT).exists()).toBe(false);
      expect(wrapper.find(FROM_SINK_FUND_SELECT).exists()).toBe(false);
      expect(wrapper.find(TO_ALLOCATION_SELECT).exists()).toBe(false);
      expect(wrapper.find(TO_SINK_FUND_SELECT).exists()).toBe(false);
    });
  });

  describe('sink fund allocation dropdowns', () => {
    it('shows From Sink Fund Allocation select for sink-fund from account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 3; // sinkFundAccount
      await vm.onFromAccountChange();
      await nextTick();

      expect(wrapper.find(FROM_SINK_FUND_SELECT).exists()).toBe(true);
      expect(wrapper.find(FROM_ALLOCATION_SELECT).exists()).toBe(false);
    });

    it('shows To Sink Fund Allocation select for sink-fund to account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.to_id = 3; // sinkFundAccount
      await vm.onToAccountChange();
      await nextTick();

      expect(wrapper.find(TO_SINK_FUND_SELECT).exists()).toBe(true);
      expect(wrapper.find(TO_ALLOCATION_SELECT).exists()).toBe(false);
    });

    it('fetches sink fund allocations for from sink fund account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 3;
      await vm.onFromAccountChange();

      expect(transactionApi.getSinkFundAllocations).toHaveBeenCalledWith(3);
    });

    it('fetches sink fund allocations for to sink fund account', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.to_id = 3;
      await vm.onToAccountChange();

      expect(transactionApi.getSinkFundAllocations).toHaveBeenCalledWith(3);
    });
  });

  describe('balance preview', () => {
    it('shows from balance preview when from account is selected', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1; // checkingAccount, balance 100000 cents
      vm.form.amount = 5000; // 50.00
      await nextTick();

      const preview = wrapper.find(FROM_BALANCE_PREVIEW);
      expect(preview.exists()).toBe(true);
      // 100000 - 5000 = 95000 cents = 950.00
      expect(preview.text()).toContain('950.00');
    });

    it('shows to balance preview when to account is selected', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.to_id = 2; // savingsAccount, balance 200000 cents
      vm.form.amount = 5000; // 50.00
      await nextTick();

      const preview = wrapper.find(TO_BALANCE_PREVIEW);
      expect(preview.exists()).toBe(true);
      // 200000 + 5000 = 205000 cents = 2050.00
      expect(preview.text()).toContain('2,050.00');
    });

    it('does not show from balance preview when no from account is selected', async () => {
      const wrapper = await createAndLoad();

      expect(wrapper.find(FROM_BALANCE_PREVIEW).exists()).toBe(false);
    });

    it('does not show to balance preview when no to account is selected', async () => {
      const wrapper = await createAndLoad();

      expect(wrapper.find(TO_BALANCE_PREVIEW).exists()).toBe(false);
    });
  });

  describe('transfer submission — success', () => {
    it('calls bankAccountApi.transfer with correct payload for regular accounts', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      vm.form.date = '2025-01-15';
      vm.form.description = 'Test transfer';
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(bankAccountApi.transfer).toHaveBeenCalledWith(1, {
        from: 1,
        to: 2,
        amount: 5000,
        date: '2025-01-15',
        description: 'Test transfer',
        budget_id: jan2025.id,
        from_allocation: undefined,
        to_allocation: undefined,
      });
    });

    it('omits description from payload when empty', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      vm.form.description = '';
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(bankAccountApi.transfer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ description: undefined }),
      );
    });

    it('shows success notification on success', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Transfer completed.');
    });

    it('emits "transferred" on success', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.emitted('transferred')).toBeDefined();
    });

    it('emits "update:visible" with false on success', async () => {
      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('transfer submission — error', () => {
    it('shows error notification on failure', async () => {
      vi.mocked(bankAccountApi.transfer).mockRejectedValue(new Error('Network error'));

      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith(expect.stringContaining('Transfer failed'));
    });

    it('does not close the dialog on failure', async () => {
      vi.mocked(bankAccountApi.transfer).mockRejectedValue(new Error('Network error'));

      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeUndefined();
    });

    it('does not emit "transferred" on failure', async () => {
      vi.mocked(bankAccountApi.transfer).mockRejectedValue(new Error('Network error'));

      const wrapper = await createAndLoad();

      const vm = wrapper.vm as unknown as FormVM;
      vm.form.from_id = 1;
      vm.form.to_id = 2;
      vm.form.amount = 5000;
      await nextTick();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      expect(wrapper.emitted('transferred')).toBeUndefined();
    });
  });

  describe('Cancel button', () => {
    it('emits "update:visible" with false when Cancel is clicked', async () => {
      const wrapper = await createAndLoad();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('form reset on open', () => {
    it('resets form when dialog becomes visible', async () => {
      const wrapper = await createAndLoad({ visible: false });

      const vm = wrapper.vm as unknown as FormVM;
      // Simulate some dirty form state
      vm.form.from_id = 1;
      vm.form.amount = 99999;
      vm.form.description = 'Old description';

      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(vm.form.from_id).toBeNull();
      expect(vm.form.amount).toBe(0);
      expect(vm.form.description).toBe('');
    });
  });
});
