<template>
  <EcPageLayout page-name="transactions" variant="fixed">
    <template #toolbar-left>
      <TransactionSearchForm @fetch="onFetch" />
    </template>
    <template #toolbar-right>
      <Button
        v-tooltip="
          'Toggle description wrapping — truncates long descriptions by default; wrap shows the full text'
        "
        icon="pi pi-arrows-h"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': wrapDescriptions }]"
        data-testid="wrap-toggle-btn"
        @click="wrapDescriptions = !wrapDescriptions"
      />
      <Button
        v-tooltip="
          'Toggle calculator column — shows checkboxes to select transactions and sum their amounts'
        "
        icon="pi pi-calculator"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': showCalculatorColumn }]"
        data-testid="calculator-toggle-btn"
        @click="toggleCalculatorColumn"
      />
      <Button
        v-tooltip="'Refresh transactions'"
        icon="pi pi-refresh"
        text
        severity="secondary"
        size="small"
        data-testid="refresh-btn"
        @click="onRefresh"
      />
      <EcToolbarSeparator />
      <Button
        label="Import"
        outlined
        size="small"
        data-testid="import-btn"
        @click="showImportDialog = true"
      />
      <Button
        label="Import CAMT"
        outlined
        size="small"
        data-testid="import-camt-btn"
        @click="navigateToImport"
      />
      <Button
        label="Transfer"
        outlined
        severity="secondary"
        size="small"
        data-testid="transfer-btn"
        @click="showTransferDialog = true"
      />
      <EcToolbarSeparator />
      <Button
        v-if="!store.isEditMode"
        label="Edit"
        data-testid="edit-btn"
        size="small"
        @click="store.enterEditMode()"
      />
      <template v-else>
        <Button
          v-tooltip.top="'Suggest allocations based on previous budget\'s transactions'"
          icon="pi pi-sparkles"
          label="Auto Allocate"
          outlined
          size="small"
          data-testid="auto-allocate-btn"
          @click="onAutoAllocate"
        />
        <Button label="Save" data-testid="save-btn" size="small" @click="onSave" />
        <Button
          label="Cancel"
          severity="secondary"
          data-testid="cancel-btn"
          size="small"
          @click="onCancel"
        />
      </template>
    </template>

    <!-- Import Dialog -->
    <TransactionImportDialog v-model:visible="showImportDialog" @imported="onImport" />

    <!-- Transfer Dialog -->
    <AccountTransferDialog v-model:visible="showTransferDialog" @transferred="onTransferred" />

    <!-- Summary Bar + Table (unified card) -->
    <div class="content-card">
      <TransactionSummary
        :transactions="store.transactions"
        :bank-account="store.selectedBankAccount ?? undefined"
        :allocations="store.allocations"
      />
      <TransactionList
        :wrap-descriptions="wrapDescriptions"
        :show-calculator-column="showCalculatorColumn"
      />
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcToolbarSeparator from '../shared/layout/EcToolbarSeparator.vue';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useTransactionStore } from './transactionStore';
import { useSettingsStore } from '../settings/settingsStore';
import { useNotifications } from '../notifications/useNotifications';
import TransactionSearchForm from './TransactionSearchForm.vue';
import TransactionList from './TransactionList.vue';
import TransactionSummary from './TransactionSummary.vue';
import TransactionImportDialog from './TransactionImportDialog.vue';
import AccountTransferDialog from './AccountTransferDialog.vue';
import type { TransactionData } from './transaction.types';

const router = useRouter();
const store = useTransactionStore();
const headingStore = useHeadingStore();
const settingsStore = useSettingsStore();
const notifications = useNotifications();

const wrapDescriptions = ref(false);
const showCalculatorColumn = ref(false);
const showImportDialog = ref(false);
const showTransferDialog = ref(false);

onMounted(() => {
  headingStore.setHeading('Transactions');
  store.fetchMetadata();
  settingsStore.fetchAll();
});

function toggleCalculatorColumn() {
  showCalculatorColumn.value = !showCalculatorColumn.value;
  if (!showCalculatorColumn.value) {
    store.clearSelections();
  }
}

function onFetch(params: { budgetId: number; bankAccountId: number }) {
  store.fetch(params);
}

async function onSave() {
  try {
    await store.save(store.transactions);
    store.exitEditMode();
    notifications.success('Transactions saved');
  } catch {
    notifications.error(store.error ?? 'Failed to save transactions');
  }
}

function onCancel() {
  store.cancelEdit();
}

async function onAutoAllocate() {
  try {
    await store.autoAllocate();
    notifications.info('Auto-allocation complete');
  } catch {
    notifications.error('Failed to auto-allocate');
  }
}

async function onRefresh() {
  await store.refresh();
}

function onImport(transactions: TransactionData[]) {
  store.addImportedTransactions(transactions);
}

function onTransferred() {
  store.fetch({
    budgetId: store.selectedBudget!.id!,
    bankAccountId: store.selectedBankAccount!.id!,
  });
}

function navigateToImport() {
  const query: Record<string, string> = {};
  if (store.selectedBudget?.id) {
    query.budget_id = String(store.selectedBudget.id);
  }
  router.push({ name: 'import', query });
}
</script>

<style scoped>
/*
 * `:deep()` is required here because `icon-btn--active` is applied via `:class` on a PrimeVue
 * `<Button>` component, whose root element (`<button class="p-button">`) is owned by PrimeVue's
 * renderer. Scoped CSS cannot pierce a child component's DOM without `:deep()`.
 */
:deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}

.content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.75rem;
}
</style>
