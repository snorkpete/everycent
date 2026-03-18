import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import TransactionImportDialog from './TransactionImportDialog.vue';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { BudgetData } from '../budgets/budget.types';
import { transactionImporter } from './importers/transactionImporter';

// Selectors
const IMPORT_BTN = '[data-testid="import-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const TEXTAREA = '[data-testid="import-textarea"]';
const FORMAT_SELECT = '[data-testid="import-format-select"]';

vi.mock('./importers/transactionImporter', () => ({
  transactionImporter: vi.fn().mockReturnValue([]),
}));

const checkingAccount: BankAccountData = {
  id: 1,
  name: 'Checking',
  import_format: 'abn-amro-bank',
};

const jan2025: BudgetData = {
  id: 1,
  name: 'Jan 2025',
  status: 'open',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
};

const mockStore = reactive({
  selectedBankAccount: checkingAccount as BankAccountData | null,
  selectedBudget: jan2025 as BudgetData | null,
});

vi.mock('./transactionStore', () => ({
  useTransactionStore: () => mockStore,
}));

function createWrapper(props: Partial<{ visible: boolean }> = {}): VueWrapper {
  return mount(TransactionImportDialog, {
    props: {
      visible: true,
      ...props,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('TransactionImportDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.selectedBankAccount = checkingAccount;
    mockStore.selectedBudget = jan2025;
  });

  describe('rendering', () => {
    it('renders the dialog when visible=true', () => {
      const wrapper = createWrapper({ visible: true });
      expect(wrapper.find(TEXTAREA).exists()).toBe(true);
    });

    it('renders the textarea for raw bank input', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(TEXTAREA).exists()).toBe(true);
    });

    it('renders the Import button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(IMPORT_BTN).exists()).toBe(true);
    });

    it('renders the Cancel button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });

    it('renders the format select dropdown', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(FORMAT_SELECT).exists()).toBe(true);
    });
  });

  describe('import format pre-fill', () => {
    it('pre-fills format select from selectedBankAccount.import_format', async () => {
      const wrapper = createWrapper();
      await wrapper.find(TEXTAREA).setValue('some bank data');
      await wrapper.find(IMPORT_BTN).trigger('click');
      await nextTick();

      expect(transactionImporter).toHaveBeenCalledWith(
        'some bank data',
        jan2025.start_date,
        jan2025.end_date,
        checkingAccount.import_format,
      );
    });
  });

  describe('Import button', () => {
    it('calls transactionImporter with the raw input, date range, and selected format', async () => {
      const fakeResult = [{ description: 'Test Import', withdrawal_amount: 100, deposit_amount: 0 }];
      vi.mocked(transactionImporter).mockReturnValue(fakeResult);

      const wrapper = createWrapper();
      await wrapper.find(TEXTAREA).setValue('pasted bank data');
      await wrapper.find(IMPORT_BTN).trigger('click');
      await nextTick();

      expect(transactionImporter).toHaveBeenCalledWith(
        'pasted bank data',
        '2025-01-01',
        '2025-01-31',
        'abn-amro-bank',
      );
    });

    it('emits "imported" with filtered (non-deleted) transactions', async () => {
      const fakeResult = [
        { description: 'Keep', withdrawal_amount: 100, deposit_amount: 0 },
        { description: 'Remove', withdrawal_amount: 0, deposit_amount: 0, deleted: true },
      ];
      vi.mocked(transactionImporter).mockReturnValue(fakeResult);

      const wrapper = createWrapper();
      await wrapper.find(TEXTAREA).setValue('data');
      await wrapper.find(IMPORT_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('imported');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toEqual([fakeResult[0]]);
    });

    it('emits "update:visible" with false after import', async () => {
      const wrapper = createWrapper();
      await wrapper.find(TEXTAREA).setValue('data');
      await wrapper.find(IMPORT_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
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

  describe('when no bank account or budget is selected', () => {
    it('disables Import button when no budget is selected', async () => {
      mockStore.selectedBudget = null;
      const wrapper = createWrapper();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
      expect(importBtn.attributes('disabled')).toBeDefined();
    });
  });
});
