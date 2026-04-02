import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ImportPage from './ImportPage.vue';
import { useImportStore } from './importStore';
import type { PreviewBankAccount, SaveResponse } from './import.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import { buildBudget, buildClosedBudget } from '../../test/factories/budgetFactory';
import { buildBankAccount } from '../../test/factories/bankAccountFactory';

// Selectors
const BUDGET_WARNING = '[data-testid="budget-warning"]';
const FILE_UPLOAD = '[data-testid="file-upload"]';
const LOADING_SPINNER = '[data-testid="loading-spinner"]';
const ERROR_MESSAGE = '[data-testid="error-message"]';
const ACCOUNT_GROUP = '[data-testid="account-group"]';
const ACCOUNT_NAME = '[data-testid="account-name"]';
const PREVIEW_ROW = '[data-testid="preview-row"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const SAVE_SUCCESS = '[data-testid="save-success"]';
const SAVE_SUMMARY = '[data-testid="save-summary"]';
const UNMATCHED_IBAN = '[data-testid="unmatched-iban"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';

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

vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    getCurrentBudgetId: vi.fn(),
    autoAllocate: vi.fn(),
  },
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('./importApi', () => ({
  importApi: {
    preview: vi.fn(),
    save: vi.fn(),
  },
  buildPreviewPayload: vi.fn().mockReturnValue({
    budget_id: 1,
    bank_accounts: [],
  }),
}));

vi.mock('../transactions/importers/camt053Parser', () => ({
  parseCamt053Zip: vi.fn(),
}));

const mockRoute = { query: {} as Record<string, string> };
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}));

const FileUploadStub = {
  name: 'FileUpload',
  template: '<div data-testid="file-upload" />',
  props: ['mode', 'accept', 'auto', 'customUpload', 'chooseLabel'],
  emits: ['select'],
};

const ProgressSpinnerStub = {
  name: 'ProgressSpinner',
  template: '<div data-testid="loading-spinner" />',
  props: ['strokeWidth', 'style'],
};

const openBudget = buildBudget({
  id: 1,
  name: 'Mar 2026',
  status: 'open',
  start_date: '2026-03-01',
  end_date: '2026-03-31',
});

const closedBudget = buildClosedBudget({
  id: 2,
  name: 'Feb 2026',
  status: 'closed',
});

const checkingAccount: BankAccountData = buildBankAccount({
  id: 10,
  name: 'Checking',
  account_no: 'NL01ABNA1234567890',
});

const samplePreviewAccounts: PreviewBankAccount[] = [
  {
    bank_account_id: 10,
    current_balance: 100000,
    net: -5000,
    projected_balance: 95000,
    transactions: [
      {
        bank_ref: 'REF001',
        transaction_date: '2026-03-15',
        withdrawal_amount: 5000,
        deposit_amount: 0,
        description: 'Test payment',
        status: 'paid',
        import_status: 'new',
      },
      {
        bank_ref: 'REF002',
        transaction_date: '2026-03-10',
        withdrawal_amount: 3000,
        deposit_amount: 0,
        description: 'Duplicate payment',
        status: 'paid',
        import_status: 'duplicate',
      },
      {
        bank_ref: 'REF003',
        transaction_date: '2026-02-28',
        withdrawal_amount: 0,
        deposit_amount: 1000,
        description: 'Out of period',
        status: 'paid',
        import_status: 'out_of_period',
      },
    ],
  },
];

describe('ImportPage', () => {
  let pinia: Pinia;

  async function setupApis() {
    const { budgetApi } = await import('../budgets/budgetApi');
    const { bankAccountApi } = await import('../bank-accounts/bankAccountApi');

    vi.mocked(budgetApi.getAll).mockResolvedValue([openBudget, closedBudget]);
    vi.mocked(budgetApi.getCurrentBudgetId).mockResolvedValue(1);
    vi.mocked(bankAccountApi.getOpen).mockResolvedValue([checkingAccount]);

    return { budgetApi, bankAccountApi };
  }

  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    mockRoute.query = {};
    await setupApis();
  });

  function createWrapper(): VueWrapper {
    return mount(ImportPage, {
      global: {
        plugins: [pinia, PrimeVue, ToastService],
        stubs: {
          FileUpload: FileUploadStub,
          ProgressSpinner: ProgressSpinnerStub,
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
  }

  /** Mount and wait for onMounted to finish (fetchMetadata + budget selection). */
  async function mountAndSettle(): Promise<VueWrapper> {
    const wrapper = createWrapper();
    await flushPromises();
    return wrapper;
  }

  /** Drive the store into 'preview' phase by setting state directly. */
  function driveToPreview(accounts: PreviewBankAccount[] = samplePreviewAccounts) {
    const store = useImportStore();
    store.previewAccounts = structuredClone(accounts);
    store.phase = 'preview';
  }

  /** Drive the store into 'saved' phase. */
  function driveToSaved(saveResult: SaveResponse) {
    const store = useImportStore();
    store.saveResult = saveResult;
    store.phase = 'saved';
  }

  describe('on mount', () => {
    it('sets the page heading', async () => {
      await mountAndSettle();

      expect(mockSetHeading).toHaveBeenCalledWith('Import Transactions');
    });

    it('fetches metadata (budgets and bank accounts)', async () => {
      const { budgetApi } = await import('../budgets/budgetApi');
      const { bankAccountApi } = await import('../bank-accounts/bankAccountApi');

      await mountAndSettle();

      expect(budgetApi.getAll).toHaveBeenCalled();
      expect(bankAccountApi.getOpen).toHaveBeenCalled();
    });

    it('auto-selects current budget when no query param', async () => {
      const { budgetApi } = await import('../budgets/budgetApi');

      await mountAndSettle();

      expect(budgetApi.getCurrentBudgetId).toHaveBeenCalled();
      const store = useImportStore();
      expect(store.selectedBudget?.id).toBe(1);
    });

    it('selects budget from query param when provided', async () => {
      mockRoute.query = { budget_id: '2' };

      await mountAndSettle();

      const store = useImportStore();
      expect(store.selectedBudget?.id).toBe(2);
    });
  });

  describe('budget warning', () => {
    it('shows warning when budget is not current', async () => {
      mockRoute.query = { budget_id: '2' };
      const wrapper = await mountAndSettle();

      expect(wrapper.find(BUDGET_WARNING).exists()).toBe(true);
    });

    it('hides warning when budget is current', async () => {
      const wrapper = await mountAndSettle();

      expect(wrapper.find(BUDGET_WARNING).exists()).toBe(false);
    });
  });

  describe('file upload', () => {
    it('renders file upload component', async () => {
      const wrapper = await mountAndSettle();

      expect(wrapper.find(FILE_UPLOAD).exists()).toBe(true);
    });

    it('calls parseFile when file is selected', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      vi.mocked(parseCamt053Zip).mockResolvedValue({ accounts: [] });

      const wrapper = await mountAndSettle();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });

      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await flushPromises();

      expect(parseCamt053Zip).toHaveBeenCalled();
    });

    it('resets preview before processing new file', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      vi.mocked(parseCamt053Zip).mockResolvedValue({ accounts: [] });

      const wrapper = await mountAndSettle();

      // Drive store into preview state first
      const store = useImportStore();
      store.phase = 'preview';
      store.previewAccounts = samplePreviewAccounts;
      await nextTick();

      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await flushPromises();

      // Phase is reset to 'parsed' (from successful parse) or 'idle' (from resetPreview)
      // Since parseCamt053Zip returns empty accounts, phase = 'parsed' and previewAccounts = []
      expect(store.previewAccounts).toEqual([]);
    });

    it('shows error notification on parse failure', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      const errorMsg = 'Parse failed';
      vi.mocked(parseCamt053Zip).mockRejectedValue(new Error(errorMsg));

      const wrapper = await mountAndSettle();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });

      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', async () => {
      const wrapper = await mountAndSettle();
      const store = useImportStore();
      store.loading = true;
      await nextTick();

      expect(wrapper.find(LOADING_SPINNER).exists()).toBe(true);
    });

    it('hides spinner when not loading', async () => {
      const wrapper = await mountAndSettle();

      expect(wrapper.find(LOADING_SPINNER).exists()).toBe(false);
    });
  });

  describe('error display', () => {
    it('shows error message when error exists', async () => {
      const wrapper = await mountAndSettle();
      const store = useImportStore();
      store.error = 'Something went wrong';
      await nextTick();

      expect(wrapper.find(ERROR_MESSAGE).exists()).toBe(true);
    });

    it('hides error message when no error', async () => {
      const wrapper = await mountAndSettle();

      expect(wrapper.find(ERROR_MESSAGE).exists()).toBe(false);
    });
  });

  describe('preview display', () => {
    async function mountInPreview(
      accounts: PreviewBankAccount[] = samplePreviewAccounts,
    ): Promise<VueWrapper> {
      const wrapper = await mountAndSettle();
      driveToPreview(accounts);
      await nextTick();
      return wrapper;
    }

    it('shows account groups in preview phase', async () => {
      const wrapper = await mountInPreview();

      expect(wrapper.findAll(ACCOUNT_GROUP)).toHaveLength(1);
    });

    it('shows account name', async () => {
      const wrapper = await mountInPreview();

      expect(wrapper.find(ACCOUNT_NAME).text()).toBe('Checking');
    });

    it('shows transaction rows', async () => {
      const wrapper = await mountInPreview();

      expect(wrapper.findAll(PREVIEW_ROW)).toHaveLength(3);
    });

    it('applies duplicate styling to duplicate rows', async () => {
      const wrapper = await mountInPreview();

      const rows = wrapper.findAll(PREVIEW_ROW);
      expect(rows[1].classes()).toContain('preview-row--duplicate');
    });

    it('applies out-of-period styling', async () => {
      const wrapper = await mountInPreview();

      const rows = wrapper.findAll(PREVIEW_ROW);
      expect(rows[2].classes()).toContain('preview-row--out-of-period');
    });

    it('shows delete toggle for non-duplicate transactions', async () => {
      const wrapper = await mountInPreview();

      expect(wrapper.find('[data-testid="delete-toggle-0-0"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-toggle-0-1"]').exists()).toBe(false);
    });

    it('calls toggleDeleteTransaction when delete button clicked', async () => {
      const wrapper = await mountInPreview();

      await wrapper.find('[data-testid="delete-toggle-0-0"]').trigger('click');
      await nextTick();

      const store = useImportStore();
      // After toggle, the transaction should be marked deleted
      expect(store.previewAccounts[0].transactions[0].deleted).toBe(true);
    });

    it('shows Import button in preview phase', async () => {
      const wrapper = await mountInPreview();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
    });

    it('shows dynamic net change from non-deleted new transactions', async () => {
      const wrapper = await mountInPreview();

      const summary = wrapper.find('[data-testid="balance-summary"]');
      // Only REF001 is 'new' (withdrawal 5000) → net = -5000 = -$50.00
      expect(summary.text()).toContain('Net change: -50.00');
    });

    it('shows dynamic projected balance', async () => {
      const wrapper = await mountInPreview();

      const summary = wrapper.find('[data-testid="balance-summary"]');
      // current_balance 100000 + net -5000 = 95000 = $950.00
      expect(summary.text()).toContain('Projected: 950.00');
    });

    it('updates net and projected when a new transaction is deleted', async () => {
      const accounts: PreviewBankAccount[] = [
        {
          bank_account_id: 10,
          current_balance: 100000,
          net: -5000,
          projected_balance: 95000,
          transactions: [
            {
              bank_ref: 'REF001',
              transaction_date: '2026-03-15',
              withdrawal_amount: 5000,
              deposit_amount: 0,
              description: 'Test payment',
              status: 'paid',
              import_status: 'new',
            },
            {
              bank_ref: 'REF002',
              transaction_date: '2026-03-10',
              withdrawal_amount: 3000,
              deposit_amount: 0,
              description: 'Duplicate payment',
              status: 'paid',
              import_status: 'duplicate',
            },
          ],
        },
      ];
      const wrapper = await mountInPreview(accounts);

      // Before delete: net = -5000 (-$50.00), projected = 95000 ($950.00)
      let summary = wrapper.find('[data-testid="balance-summary"]');
      expect(summary.text()).toContain('Net change: -50.00');
      expect(summary.text()).toContain('Projected: 950.00');

      // Mark the new transaction as deleted via the store action
      const store = useImportStore();
      store.toggleDeleteTransaction(0, 0);
      await nextTick();

      // After delete: net = 0 ($0.00), projected = 100000 ($1,000.00)
      summary = wrapper.find('[data-testid="balance-summary"]');
      expect(summary.text()).toContain('Net change: 0.00');
      expect(summary.text()).toContain('Projected: 1,000.00');
    });

    it('hides preview when phase is idle', async () => {
      const wrapper = await mountAndSettle();
      await nextTick();

      expect(wrapper.findAll(ACCOUNT_GROUP)).toHaveLength(0);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
    });
  });

  describe('unmatched IBANs', () => {
    it('shows unmatched IBAN messages', async () => {
      const wrapper = await mountAndSettle();
      const store = useImportStore();
      store.phase = 'preview';
      store.unmatchedIbans = [{ iban: 'NL99UNKN0000000000', transactionCount: 5 }];
      await nextTick();

      const messages = wrapper.findAll(UNMATCHED_IBAN);
      expect(messages).toHaveLength(1);
      expect(messages[0].text()).toContain('NL99UNKN0000000000');
      expect(messages[0].text()).toContain('5 transactions skipped');
    });
  });

  describe('save flow', () => {
    async function mountInPreviewWithSummary(): Promise<VueWrapper> {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      vi.mocked(parseCamt053Zip).mockResolvedValue({
        accounts: [
          {
            iban: 'NL01ABNA1234567890',
            bankAccountId: 10,
            transactions: [
              {
                bank_ref: 'REF001',
                transaction_date: '2026-03-15',
                withdrawal_amount: 5000,
                deposit_amount: 0,
                description: 'Test payment',
                status: 'paid',
              },
            ],
          },
        ],
      });

      const wrapper = await mountAndSettle();

      // Parse a file to get fileSummary populated
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await flushPromises();

      // Drive to preview phase (as if fetchPreview was called)
      driveToPreview(samplePreviewAccounts);
      await nextTick();

      return wrapper;
    }

    it('calls saveImport when save button clicked', async () => {
      const { importApi } = await import('./importApi');
      vi.mocked(importApi.save).mockResolvedValue({
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            saved_count: 2,
            skipped: [],
          },
        ],
      });

      const wrapper = await mountInPreviewWithSummary();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(importApi.save).toHaveBeenCalled();
    });

    it('shows success notification on save', async () => {
      const { importApi } = await import('./importApi');
      vi.mocked(importApi.save).mockResolvedValue({
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            saved_count: 2,
            skipped: [],
          },
        ],
      });

      const wrapper = await mountInPreviewWithSummary();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Import saved successfully');
    });

    it('shows error notification on save failure', async () => {
      const { importApi } = await import('./importApi');
      const errorMsg = 'Save failed';
      vi.mocked(importApi.save).mockRejectedValue(new Error(errorMsg));

      const wrapper = await mountInPreviewWithSummary();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('saved phase', () => {
    const baseSaveResult: SaveResponse = {
      bank_accounts: [
        {
          bank_account_id: 10,
          current_balance: 95000,
          net: 0,
          projected_balance: 95000,
          saved_count: 2,
          skipped: [],
        },
      ],
    };

    it('shows success message', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved(baseSaveResult);
      await nextTick();

      expect(wrapper.find(SAVE_SUCCESS).exists()).toBe(true);
    });

    it('shows save summary per account', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved(baseSaveResult);
      await nextTick();

      const summaries = wrapper.findAll(SAVE_SUMMARY);
      expect(summaries).toHaveLength(1);
      expect(summaries[0].text()).toContain('Checking');
      expect(summaries[0].text()).toContain('2 transactions saved');
    });

    it('shows link to transactions screen', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved(baseSaveResult);
      await nextTick();

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('shows skipped transaction count when transactions were skipped', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved({
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            saved_count: 1,
            skipped: [
              { bank_ref: 'DUP-001', reason: 'duplicate' },
              { bank_ref: 'OOP-001', reason: 'out_of_period' },
            ],
          },
        ],
      });
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).toContain('1 transaction saved');
      expect(summary.text()).toContain('2 skipped');
    });

    it('does not show skipped info when nothing was skipped', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved(baseSaveResult);
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).not.toContain('skipped');
    });

    it('shows breakdown of skip reasons', async () => {
      const wrapper = await mountAndSettle();
      driveToSaved({
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            saved_count: 1,
            skipped: [
              { bank_ref: 'DUP-001', reason: 'duplicate' },
              { bank_ref: 'DUP-002', reason: 'duplicate' },
              { bank_ref: 'OOP-001', reason: 'out_of_period' },
              { bank_ref: 'EXC-001', reason: 'user_excluded' },
            ],
          },
        ],
      });
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).toContain('2 duplicate');
      expect(summary.text()).toContain('1 out of period');
      expect(summary.text()).toContain('1 manually excluded');
    });
  });
});
