<template>
  <EcFormDialog
    :visible="visible"
    header="Import via AI"
    width="44rem"
    :always-edit="true"
    save-label="Import"
    :save-disabled="!canImport"
    @update:visible="$emit('update:visible', $event)"
    @save="runImport"
  >
    <p class="intro">
      Paste transactions from any statement. The AI model runs in your browser, so the text doesn't
      leave this computer. Check the results before saving.
    </p>

    <Message
      v-if="!isChecking && !isAvailable"
      severity="warn"
      :closable="false"
      data-testid="ai-import-unavailable"
    >
      AI import needs the built-in AI model in desktop Chrome or Edge, which isn't available in this
      browser.
    </Message>
    <Message
      v-else-if="needsInstall"
      severity="info"
      :closable="false"
      data-testid="ai-import-download-note"
    >
      The first AI import downloads the browser's AI model (a few GB). This only happens once.
    </Message>

    <div class="field">
      <label class="field-label">Paste transaction text</label>
      <Textarea
        v-model="rawInput"
        rows="12"
        class="w-full import-textarea"
        placeholder="Paste the text from your bank or credit card statement here"
        :disabled="isBusy"
        data-testid="ai-import-textarea"
      />
    </div>

    <div v-if="statusText" class="status" data-testid="ai-import-status">
      <span>{{ statusText }}</span>
      <ProgressBar
        v-if="downloadProgress !== null"
        :value="Math.round(downloadProgress * 100)"
        data-testid="ai-import-download-progress"
      />
    </div>
  </EcFormDialog>
</template>

<script setup lang="ts">
// Deliberately duplicates the paste box and save flow of TransactionImportDialog,
// since this dialog needs much more state. Before adding a third import dialog,
// extract the shared parts into a common component first.
import { computed, ref, watch } from 'vue';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Textarea from 'primevue/textarea';
import type { TransactionData } from './transaction.types';
import { useTransactionStore } from './transactionStore';
import { aiTransactionImporter, AI_IMPORT_SYSTEM_PROMPT } from './importers/aiTransactionImporter';
import type { AiImportResult } from './importers/aiTransactionImporter';
import type { LanguageModelSession } from '../ai/languageModel.types';
import { getLanguageModelProvider } from '../ai/languageModelProvider';
import { useLanguageModelAvailability } from '../ai/useLanguageModelAvailability';
import { useNotifications } from '../notifications/useNotifications';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';

const { visible } = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  imported: [transactions: TransactionData[]];
}>();

const store = useTransactionStore();
const notifications = useNotifications();
const { isChecking, isAvailable, needsInstall, refresh } = useLanguageModelAvailability();

const rawInput = ref('');
const statusText = ref('');
const downloadProgress = ref<number | null>(null);
const isBusy = ref(false);
let abortController: AbortController | null = null;

const canImport = computed(
  () =>
    isAvailable.value && !isBusy.value && !!store.selectedBudget && rawInput.value.trim() !== '',
);

// Fresh state each time the dialog opens; stop any running import when it closes
watch(
  () => visible,
  (isVisible) => {
    if (isVisible) {
      rawInput.value = '';
      refresh();
    } else {
      abortController?.abort();
    }
  },
);

/**
 * Installs the model if needed (a one-time download), starts it, runs the importer
 * and emits the result. One AbortController covers the whole run so closing the dialog cancels it.
 * Finding nothing keeps the dialog open so the text can be adjusted and retried.
 */
async function runImport() {
  const budget = store.selectedBudget;
  if (!budget?.start_date || !budget.end_date) return;
  const { start_date: startDate, end_date: endDate } = budget;
  abortController = new AbortController();
  const { signal } = abortController;
  let session: LanguageModelSession | undefined;
  isBusy.value = true;

  try {
    const provider = getLanguageModelProvider();
    statusText.value = 'Starting the AI model…';
    await provider.installer.install({
      signal,
      onProgress: (fraction) => {
        statusText.value = 'Downloading the AI model (one-time)…';
        downloadProgress.value = fraction;
      },
    });
    downloadProgress.value = null;

    session = await provider.createSession({ systemPrompt: AI_IMPORT_SYSTEM_PROMPT, signal });

    const result = await aiTransactionImporter(rawInput.value, startDate, endDate, session, {
      signal,
      onProgress: (part, totalParts) => {
        statusText.value =
          totalParts > 1
            ? `Reading transactions (part ${part} of ${totalParts})…`
            : 'Reading transactions…';
      },
    });

    if (result.transactions.length === 0) {
      notifications.error("The AI model didn't find any transactions in that text");
      return;
    }
    emit('imported', result.transactions);
    notifications.success(summarise(result));
    emit('update:visible', false);
  } catch (e) {
    // Closing the dialog aborts the import; that isn't an error worth reporting
    if (!signal.aborted) {
      notifications.error(e instanceof Error ? e.message : 'AI import failed');
    }
  } finally {
    session?.destroy();
    isBusy.value = false;
    statusText.value = '';
    downloadProgress.value = null;
    abortController = null;
  }
}

function summarise({ transactions, skippedCount, invalidCount }: AiImportResult): string {
  const notes = [
    skippedCount > 0 ? `skipped ${skippedCount} declined or pending` : '',
    invalidCount > 0 ? `${invalidCount} couldn't be read — check against your statement` : '',
  ].filter(Boolean);
  const count = `Imported ${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`;
  return notes.length > 0 ? `${count} (${notes.join('; ')})` : count;
}
</script>

<style scoped>
.intro {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.import-textarea {
  font-family: monospace;
  font-size: 0.8125rem;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}
</style>
