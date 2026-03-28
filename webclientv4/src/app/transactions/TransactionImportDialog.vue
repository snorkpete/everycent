<template>
  <Dialog
    :visible="visible"
    header="Import Transactions"
    modal
    :style="{ width: '44rem' }"
    @update:visible="close"
  >
    <div class="import-fields">
      <div class="field">
        <label class="field-label">Import Format</label>
        <Select
          v-model="selectedFormat"
          :options="importFormats"
          option-label="name"
          option-value="id"
          placeholder="Select format"
          data-testid="import-format-select"
          class="w-full"
        />
      </div>

      <div class="field">
        <label class="field-label">Paste bank statement data</label>
        <Textarea
          v-model="rawInput"
          rows="12"
          class="w-full import-textarea"
          placeholder="Paste the raw text from your bank statement here"
          data-testid="import-textarea"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Import"
          data-testid="import-btn"
          :disabled="!selectedFormat || !store.selectedBudget"
          @click="runImport"
        />
        <Button
          label="Cancel"
          severity="secondary"
          data-testid="cancel-btn"
          @click="close"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import type { TransactionData } from './transaction.types';
import { useTransactionStore } from './transactionStore';
import { transactionImporter } from './importers/transactionImporter';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  imported: [transactions: TransactionData[]];
}>();

const store = useTransactionStore();

const rawInput = ref('');
const selectedFormat = ref<string | undefined>(undefined);

const importFormats = [
  { id: 'abn-amro-bank', name: 'ABN Amro Bank Account' },
  { id: 'abn-amro-creditcard', name: 'ABN Amro Credit Card (old)' },
  { id: 'abn-amro-creditcard-2026', name: 'ABN Amro Credit Card (2026+)' },
  { id: 'new-bank-account', name: 'Scotia Bank Account' },
];

// Pre-fill format from selected bank account when dialog opens
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      rawInput.value = '';
      selectedFormat.value = store.selectedBankAccount?.import_format ?? undefined;
    }
  },
  { immediate: true },
);

function runImport() {
  const startDate = store.selectedBudget?.start_date ?? '';
  const endDate = store.selectedBudget?.end_date ?? '';

  const all = transactionImporter(rawInput.value, startDate, endDate, selectedFormat.value);

  emit('imported', all);
  emit('update:visible', false);
}

function close() {
  emit('update:visible', false);
}
</script>

<style scoped>
.import-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
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

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
