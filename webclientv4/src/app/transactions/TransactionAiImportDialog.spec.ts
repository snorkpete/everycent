import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionAiImportDialog from './TransactionAiImportDialog.vue';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import { useTransactionStore } from './transactionStore';
import type { BudgetData } from '../budgets/budget.types';
import { DialogStub } from '../../test/stubs';
import { buildPromptApiMock } from '../../test/buildPromptApiMock';

// Selectors
const IMPORT_BTN = '[data-testid="save-btn"]';
const TEXTAREA = '[data-testid="ai-import-textarea"]';
const STATUS = '[data-testid="ai-import-status"]';
const DOWNLOAD_PROGRESS = '[data-testid="ai-import-download-progress"]';
const UNAVAILABLE = '[data-testid="ai-import-unavailable"]';
const DOWNLOAD_NOTE = '[data-testid="ai-import-download-note"]';

const mockNotifySuccess = vi.fn();
const mockNotifyError = vi.fn();

vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const october: BudgetData = {
  id: 1,
  name: 'Oct 2026',
  status: 'open',
  start_date: '2026-09-28',
  end_date: '2026-10-27',
};

function reply(transactions: unknown[]): string {
  return JSON.stringify({ transactions });
}

function row(description: string, status = 'completed') {
  return { date: '2026-10-06', description, amount: -9.5, status };
}

// A promise the test resolves manually, to pause the model mid-import
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

let pinia: Pinia;

function createWrapper({ visible = true } = {}): VueWrapper {
  return mount(TransactionAiImportDialog, {
    props: { visible },
    global: {
      plugins: [pinia, PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

async function enterTextAndImport(wrapper: VueWrapper, text = 'statement text') {
  await flushPromises();
  await wrapper.find(TEXTAREA).setValue(text);
  await wrapper.find(IMPORT_BTN).trigger('click');
}

describe('TransactionAiImportDialog', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    useTransactionStore().selectedBudget = october;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('availability', () => {
    it('explains when the browser has no AI model and disables Import', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find(TEXTAREA).setValue('text');

      expect(wrapper.find(UNAVAILABLE).text()).toContain('desktop Chrome or Edge');
      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeDefined();
    });

    it('warns that the first import downloads the model', async () => {
      buildPromptApiMock({ availability: 'downloadable' });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(DOWNLOAD_NOTE).exists()).toBe(true);
      expect(wrapper.find(UNAVAILABLE).exists()).toBe(false);
    });

    it('shows no notice when the model is ready', async () => {
      buildPromptApiMock();
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(DOWNLOAD_NOTE).exists()).toBe(false);
      expect(wrapper.find(UNAVAILABLE).exists()).toBe(false);
    });
  });

  describe('Import button', () => {
    beforeEach(() => {
      buildPromptApiMock();
    });

    it('is disabled until text is entered', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeDefined();

      await wrapper.find(TEXTAREA).setValue('  ');
      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeDefined();

      await wrapper.find(TEXTAREA).setValue('text');
      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeUndefined();
    });

    it('does nothing if triggered without a budget', async () => {
      const mock = buildPromptApiMock();
      useTransactionStore().selectedBudget = null;
      const wrapper = createWrapper();

      wrapper.findComponent(EcFormDialog).vm.$emit('save');
      await flushPromises();

      expect(mock.createOptions).toEqual([]);
    });

    it('is disabled when no budget is selected', async () => {
      useTransactionStore().selectedBudget = null;
      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find(TEXTAREA).setValue('text');

      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeDefined();
    });
  });

  describe('importing', () => {
    it('sends the text and budget period to the model and emits the transactions', async () => {
      const mock = buildPromptApiMock({ responses: [reply([row('STREAMCO')])] });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper, '6 Oct STREAMCO -9,50');
      await flushPromises();

      expect(mock.prompts[0]).toContain('6 Oct STREAMCO -9,50');
      expect(mock.prompts[0]).toContain('2026-09-28 to 2026-10-27');
      expect(wrapper.emitted('imported')![0][0]).toEqual([
        {
          transaction_date: '2026-10-06',
          description: 'STREAMCO',
          withdrawal_amount: 950,
          deposit_amount: 0,
          status: 'unpaid',
        },
      ]);
      expect(wrapper.emitted('update:visible')![0][0]).toBe(false);
    });

    it('reports how many transactions were imported', async () => {
      buildPromptApiMock({ responses: [reply([row('ONE'), row('TWO')])] });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Imported 2 transactions');
    });

    it('uses the singular for one transaction', async () => {
      buildPromptApiMock({ responses: [reply([row('ONE')])] });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Imported 1 transaction');
    });

    it('mentions skipped and unreadable rows', async () => {
      buildPromptApiMock({
        responses: [reply([row('GOOD'), row('DECLINED', 'declined'), { bad: true }])],
      });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith(
        "Imported 1 transaction (skipped 1 declined or pending; 1 couldn't be read — check against your statement)",
      );
    });

    it('keeps the dialog open and reports an error when nothing was found', async () => {
      buildPromptApiMock({ responses: [reply([])] });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith(
        "The AI model didn't find any transactions in that text",
      );
      expect(wrapper.emitted('imported')).toBeUndefined();
      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });

    it('reports model errors and keeps the dialog open', async () => {
      buildPromptApiMock({ createError: new Error('Not enough disk space') });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Not enough disk space');
      expect(wrapper.emitted('update:visible')).toBeUndefined();
      expect(wrapper.find(TEXTAREA).attributes('disabled')).toBeUndefined();
    });

    it('reports a generic error for unexpected failures', async () => {
      vi.stubGlobal('LanguageModel', {
        availability: async () => 'available',
        create: () => Promise.reject('weird'),
      });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('AI import failed');
    });
  });

  describe('progress', () => {
    it('shows download progress while the model downloads, then reading progress', async () => {
      const gate = deferred();
      buildPromptApiMock({
        availability: 'downloadable',
        downloadProgress: [0.42],
        promptGate: gate.promise,
        responses: [reply([row('ONE')])],
      });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();

      expect(wrapper.find(STATUS).text()).toContain('Reading transactions…');
      expect(wrapper.find(DOWNLOAD_PROGRESS).exists()).toBe(false);
      expect(wrapper.find(TEXTAREA).attributes('disabled')).toBeDefined();
      expect(wrapper.find(IMPORT_BTN).attributes('disabled')).toBeDefined();

      gate.resolve();
      await flushPromises();
      expect(wrapper.find(STATUS).exists()).toBe(false);
    });

    it('shows the download bar while downloading', async () => {
      let reportProgress!: (fraction: number) => void;
      const created = deferred();
      vi.stubGlobal('LanguageModel', {
        availability: async () => 'downloadable',
        async create(options: { monitor: (m: object) => void }) {
          options.monitor({
            addEventListener: (_type: string, listener: (e: { loaded: number }) => void) => {
              reportProgress = (loaded) => listener({ loaded });
            },
          });
          await created.promise;
          throw new Error('stop here');
        },
      });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      reportProgress(0.42);
      await flushPromises();

      expect(wrapper.find(STATUS).text()).toContain('Downloading the AI model (one-time)…');
      expect(wrapper.find(DOWNLOAD_PROGRESS).exists()).toBe(true);

      created.resolve();
      await flushPromises();
      expect(wrapper.find(DOWNLOAD_PROGRESS).exists()).toBe(false);
    });

    it('shows which part of a long statement is being read', async () => {
      const gate = deferred();
      buildPromptApiMock({
        contextWindow: 1100,
        systemPromptTokens: 100,
        promptGate: gate.promise,
        responses: [reply([row('ONE')])],
      });
      const wrapper = createWrapper();
      const longText = ['A', 'B'].map((label) => `${label}\n${'x'.repeat(1000)}`).join('\n\n');

      await enterTextAndImport(wrapper, longText);
      await flushPromises();

      expect(wrapper.find(STATUS).text()).toContain('Reading transactions (part 1 of 2)…');
      gate.resolve();
      await flushPromises();
    });
  });

  describe('opening and closing', () => {
    it('clears the text each time the dialog opens', async () => {
      buildPromptApiMock();
      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find(TEXTAREA).setValue('old text');

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect((wrapper.find(TEXTAREA).element as HTMLTextAreaElement).value).toBe('');
    });

    it('re-checks availability when reopened', async () => {
      const wrapper = createWrapper({ visible: false });
      await flushPromises();
      expect(wrapper.find(UNAVAILABLE).exists()).toBe(true);

      buildPromptApiMock();
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(UNAVAILABLE).exists()).toBe(false);
    });

    it('stops a running import quietly when closed', async () => {
      const gate = deferred();
      const mock = buildPromptApiMock({ promptGate: gate.promise });
      const wrapper = createWrapper();

      await enterTextAndImport(wrapper);
      await flushPromises();
      await wrapper.setProps({ visible: false });
      await flushPromises();

      expect(mockNotifyError).not.toHaveBeenCalled();
      expect(wrapper.emitted('imported')).toBeUndefined();
      // The prompt copy and the session itself are both cleaned up
      expect(mock.destroyedSessions).toBe(2);
    });

    it('closes when Cancel is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')![0][0]).toBe(false);
    });

    it('does nothing when closed with no import running', async () => {
      buildPromptApiMock();
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.setProps({ visible: false });

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });
});
