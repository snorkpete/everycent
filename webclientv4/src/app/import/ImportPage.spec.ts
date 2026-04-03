import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ImportPage from './ImportPage.vue';
import type { PreviewBankAccount, UnmatchedIban, SaveResponse } from './import.types';
import type { ImportPhase } from './importStore';
import type { BudgetData } from '../budgets/budget.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

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

const mockGetCurrentBudgetId = vi.fn().mockResolvedValue(1);
vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getCurrentBudgetId: () => mockGetCurrentBudgetId(),
  },
}));

const openBudget: BudgetData = {
  id: 1,
  name: 'Mar 2026',
  status: 'open',
  start_date: '2026-03-01',
  end_date: '2026-03-31',
};
const closedBudget: BudgetData = { id: 2, name: 'Feb 2026', status: 'closed' };
const checkingAccount: BankAccountData = {
  id: 10,
  name: 'Checking',
  account_no: 'NL01ABNA1234567890',
};

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

const mockStore = reactive({
  budgets: [openBudget, closedBudget] as BudgetData[],
  bankAccounts: [checkingAccount] as BankAccountData[],
  selectedBudget: openBudget as BudgetData | null,
  previewAccounts: [] as PreviewBankAccount[],
  unmatchedIbans: [] as UnmatchedIban[],
  saveResult: null as SaveResponse | null,
  loading: false,
  error: null as string | null,
  phase: 'idle' as ImportPhase,
  budgetsForDropdown: [openBudget, closedBudget] as BudgetData[],
  isBudgetCurrent: true,
  fileSummary: [] as {
    iban: string;
    matchedAccountName: string | null;
    totalTransactions: number;
    inPeriodCount: number;
    outOfPeriodCount: number;
  }[],
  fetchMetadata: vi.fn().mockResolvedValue(undefined),
  selectBudget: vi.fn(),
  parseAndPreview: vi.fn().mockResolvedValue(undefined),
  parseFile: vi.fn().mockResolvedValue(undefined),
  fetchPreview: vi.fn().mockResolvedValue(undefined),
  toggleDeleteTransaction: vi.fn(),
  saveImport: vi.fn().mockResolvedValue(undefined),
  resetPreview: vi.fn(),
  getBankAccountName: vi.fn().mockReturnValue('Checking'),
});

vi.mock('./importStore', () => ({
  useImportStore: () => mockStore,
}));

const mockRoute = reactive({
  query: {} as Record<string, string>,
});

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}));

const FileUploadStub = {
  name: 'FileUpload',
  template: '<div data-testid="file-upload" />',
  props: ['mode', 'accept', 'auto', 'customUpload', 'chooseLabel'],
  emits: ['uploader'],
};

const ProgressSpinnerStub = {
  name: 'ProgressSpinner',
  template: '<div data-testid="loading-spinner" />',
  props: ['strokeWidth', 'style'],
};

function createWrapper(): VueWrapper {
  return mount(ImportPage, {
    global: {
      plugins: [PrimeVue, ToastService, createPinia()],
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

describe('ImportPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.budgets = [openBudget, closedBudget];
    mockStore.bankAccounts = [checkingAccount];
    mockStore.selectedBudget = openBudget;
    mockStore.previewAccounts = [];
    mockStore.unmatchedIbans = [];
    mockStore.saveResult = null;
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.phase = 'idle';
    mockStore.isBudgetCurrent = true;
    mockStore.fileSummary = [];
    mockStore.fetchMetadata.mockResolvedValue(undefined);
    mockStore.parseFile.mockResolvedValue(undefined);
    mockStore.fetchPreview.mockResolvedValue(undefined);
    mockStore.saveImport.mockResolvedValue(undefined);
    mockGetCurrentBudgetId.mockResolvedValue(1);
    mockRoute.query = {};
  });

  describe('on mount', () => {
    it('sets the page heading', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Import Transactions');
    });

    it('calls fetchMetadata', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchMetadata).toHaveBeenCalled();
    });

    it('auto-selects first open budget when no query param', async () => {
      createWrapper();
      await nextTick();
      await nextTick();

      expect(mockStore.selectBudget).toHaveBeenCalledWith(openBudget.id);
    });

    it('selects budget from query param when provided', async () => {
      mockRoute.query = { budget_id: '2' };
      createWrapper();
      await nextTick();
      await nextTick();

      expect(mockStore.selectBudget).toHaveBeenCalledWith(2);
    });
  });

  describe('budget warning', () => {
    it('shows warning when budget is not current', async () => {
      mockStore.isBudgetCurrent = false;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(BUDGET_WARNING).exists()).toBe(true);
    });

    it('hides warning when budget is current', async () => {
      mockStore.isBudgetCurrent = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(BUDGET_WARNING).exists()).toBe(false);
    });
  });

  describe('file upload', () => {
    it('renders file upload component', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(FILE_UPLOAD).exists()).toBe(true);
    });

    it('calls parseFile when file is selected', async () => {
      const wrapper = createWrapper();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });

      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await nextTick();

      expect(mockStore.parseFile).toHaveBeenCalledWith(file);
    });

    it('resets preview before processing new file', async () => {
      const wrapper = createWrapper();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });

      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await nextTick();

      expect(mockStore.resetPreview).toHaveBeenCalled();
    });

    it('shows error notification on parse failure', async () => {
      const errorMsg = 'Parse failed';
      mockStore.parseFile.mockImplementation(async () => {
        mockStore.error = errorMsg;
        throw new Error(errorMsg);
      });

      const wrapper = createWrapper();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });

      const fileUpload = wrapper.findComponent({ name: 'FileUpload' });
      await fileUpload.vm.$emit('select', { files: [file] });
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', async () => {
      mockStore.loading = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(LOADING_SPINNER).exists()).toBe(true);
    });

    it('hides spinner when not loading', () => {
      mockStore.loading = false;
      const wrapper = createWrapper();

      expect(wrapper.find(LOADING_SPINNER).exists()).toBe(false);
    });
  });

  describe('error display', () => {
    it('shows error message when error exists', async () => {
      mockStore.error = 'Something went wrong';
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ERROR_MESSAGE).exists()).toBe(true);
    });

    it('hides error message when no error', () => {
      mockStore.error = null;
      const wrapper = createWrapper();

      expect(wrapper.find(ERROR_MESSAGE).exists()).toBe(false);
    });
  });

  describe('preview display', () => {
    beforeEach(() => {
      mockStore.phase = 'preview';
      mockStore.previewAccounts = samplePreviewAccounts;
    });

    it('shows account groups in preview phase', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findAll(ACCOUNT_GROUP)).toHaveLength(1);
    });

    it('shows account name', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ACCOUNT_NAME).text()).toBe('Checking');
    });

    it('shows transaction rows', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findAll(PREVIEW_ROW)).toHaveLength(3);
    });

    it('applies duplicate styling to duplicate rows', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(PREVIEW_ROW);
      expect(rows[1].classes()).toContain('preview-row--duplicate');
    });

    it('applies out-of-period styling', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(PREVIEW_ROW);
      expect(rows[2].classes()).toContain('preview-row--out-of-period');
    });

    it('shows delete toggle for non-duplicate transactions', async () => {
      const wrapper = createWrapper();
      await nextTick();

      // First row (new) has delete toggle, second row (duplicate) does not
      expect(wrapper.find('[data-testid="delete-toggle-0-0-delete-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-toggle-0-1-delete-btn"]').exists()).toBe(false);
    });

    it('calls toggleDeleteTransaction when delete button clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find('[data-testid="delete-toggle-0-0-delete-btn"]').trigger('click');

      expect(mockStore.toggleDeleteTransaction).toHaveBeenCalledWith(0, 0);
    });

    it('shows Import button in preview phase', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
    });

    it('shows dynamic net change from non-deleted new transactions', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.find('[data-testid="balance-summary"]');
      // Only REF001 is 'new' (withdrawal 5000) → net = -5000 = -$50.00
      expect(summary.text()).toContain('Net change: -50.00');
    });

    it('shows dynamic projected balance', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.find('[data-testid="balance-summary"]');
      // current_balance 100000 + net -5000 = 95000 = $950.00
      expect(summary.text()).toContain('Projected: 950.00');
    });

    it('updates net and projected when a new transaction is deleted', async () => {
      // Deep clone so mutations don't affect other tests
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
      mockStore.previewAccounts = accounts;
      const wrapper = createWrapper();
      await nextTick();

      // Before delete: net = -5000 (-$50.00), projected = 95000 ($950.00)
      let summary = wrapper.find('[data-testid="balance-summary"]');
      expect(summary.text()).toContain('Net change: -50.00');
      expect(summary.text()).toContain('Projected: 950.00');

      // Mark the new transaction as deleted (mutate through the reactive proxy)
      mockStore.previewAccounts[0].transactions[0].deleted = true;
      await nextTick();

      // After delete: net = 0 ($0.00), projected = 100000 ($1,000.00)
      summary = wrapper.find('[data-testid="balance-summary"]');
      expect(summary.text()).toContain('Net change: 0.00');
      expect(summary.text()).toContain('Projected: 1,000.00');
    });

    it('hides preview when phase is idle', async () => {
      mockStore.phase = 'idle';
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findAll(ACCOUNT_GROUP)).toHaveLength(0);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
    });
  });

  describe('unmatched IBANs', () => {
    it('shows unmatched IBAN messages', async () => {
      mockStore.phase = 'preview';
      mockStore.unmatchedIbans = [{ iban: 'NL99UNKN0000000000', transactionCount: 5 }];
      const wrapper = createWrapper();
      await nextTick();

      const messages = wrapper.findAll(UNMATCHED_IBAN);
      expect(messages).toHaveLength(1);
      expect(messages[0].text()).toContain('NL99UNKN0000000000');
      expect(messages[0].text()).toContain('5 transactions skipped');
    });
  });

  describe('save flow', () => {
    const matchedFileSummary = [
      {
        iban: 'NL01ABNA1234567890',
        matchedAccountName: 'Checking',
        totalTransactions: 3,
        inPeriodCount: 2,
        outOfPeriodCount: 1,
      },
    ];

    it('calls saveImport when save button clicked', async () => {
      mockStore.phase = 'preview';
      mockStore.previewAccounts = samplePreviewAccounts;
      mockStore.fileSummary = matchedFileSummary;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.saveImport).toHaveBeenCalled();
    });

    it('shows success notification on save', async () => {
      mockStore.phase = 'preview';
      mockStore.previewAccounts = samplePreviewAccounts;
      mockStore.fileSummary = matchedFileSummary;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Import saved successfully');
    });

    it('shows error notification on save failure', async () => {
      const errorMsg = 'Save failed';
      mockStore.saveImport.mockImplementation(async () => {
        mockStore.error = errorMsg;
        throw new Error(errorMsg);
      });
      mockStore.phase = 'preview';
      mockStore.previewAccounts = samplePreviewAccounts;
      mockStore.fileSummary = matchedFileSummary;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('saved phase', () => {
    beforeEach(() => {
      mockStore.phase = 'saved';
      mockStore.saveResult = {
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
    });

    it('shows success message', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_SUCCESS).exists()).toBe(true);
    });

    it('shows save summary per account', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const summaries = wrapper.findAll(SAVE_SUMMARY);
      expect(summaries).toHaveLength(1);
      expect(summaries[0].text()).toContain('Checking');
      expect(summaries[0].text()).toContain('2 transactions saved');
    });

    it('shows link to transactions screen', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('shows skipped transaction count when transactions were skipped', async () => {
      mockStore.saveResult = {
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
      };
      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).toContain('1 transaction saved');
      expect(summary.text()).toContain('2 skipped');
    });

    it('does not show skipped info when nothing was skipped', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).not.toContain('skipped');
    });

    it('shows breakdown of skip reasons', async () => {
      mockStore.saveResult = {
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
      };
      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.find(SAVE_SUMMARY);
      expect(summary.text()).toContain('2 duplicate');
      expect(summary.text()).toContain('1 out of period');
      expect(summary.text()).toContain('1 manually excluded');
    });
  });
});
