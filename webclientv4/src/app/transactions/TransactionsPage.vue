<template>
  <div class="transactions-page">
    <!-- Zone 1: Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <TransactionSearchForm @fetch="onFetch" />
      </div>
      <div class="toolbar-right">
        <Button
          icon="pi pi-arrows-h"
          text
          severity="secondary"
          size="small"
          :class="['icon-btn', { 'icon-btn--active': wrapDescriptions }]"
          data-testid="wrap-toggle-btn"
          title="Toggle description wrapping — truncates long descriptions by default; wrap shows the full text"
          @click="wrapDescriptions = !wrapDescriptions"
        />
        <Button
          icon="pi pi-calculator"
          text
          severity="secondary"
          size="small"
          :class="['icon-btn', { 'icon-btn--active': showCalculatorColumn }]"
          data-testid="calculator-toggle-btn"
          title="Toggle calculator column — shows checkboxes to select transactions and sum their amounts"
          @click="toggleCalculatorColumn"
        />
        <Button
          icon="pi pi-refresh"
          text
          severity="secondary"
          size="small"
          data-testid="refresh-btn"
          title="Refresh transactions"
          @click="onRefresh"
        />
        <span class="toolbar-separator" />
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
        <span class="toolbar-separator" />
        <Button
          v-if="!store.isEditMode"
          label="Edit"
          data-testid="edit-btn"
          size="small"
          @click="store.enterEditMode()"
        />
        <template v-else>
          <Button
            label="Save"
            data-testid="save-btn"
            size="small"
            @click="onSave"
          />
          <Button
            label="Cancel"
            severity="secondary"
            data-testid="cancel-btn"
            size="small"
            @click="onCancel"
          />
        </template>
      </div>
    </div>

    <!-- Import Dialog -->
    <TransactionImportDialog
      v-model:visible="showImportDialog"
      @imported="onImport"
    />

    <!-- Transfer Dialog -->
    <AccountTransferDialog
      v-model:visible="showTransferDialog"
      @transferred="onTransferred"
    />

    <!-- Zones 2 + 3: Summary Bar + Table (unified card) -->
    <div class="content-card">
      <TransactionSummary
        :transactions="store.isEditMode ? store.draftTransactions : store.transactions"
        :bank-account="store.selectedBankAccount ?? undefined"
        :allocations="store.allocations"
      />
      <TransactionList
        :wrap-descriptions="wrapDescriptions"
        :show-calculator-column="showCalculatorColumn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
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
    await store.save(store.draftTransactions);
    store.exitEditMode();
    notifications.success('Transactions saved');
  } catch {
    notifications.error(store.error ?? 'Failed to save transactions');
  }
}

function onCancel() {
  store.cancelEdit();
}

async function onRefresh() {
  await store.refresh();
}

function onImport(transactions: TransactionData[]) {
  store.addImportedTransactions(transactions);
}

function onTransferred() {
  store.fetch({ budgetId: store.selectedBudget!.id!, bankAccountId: store.selectedBankAccount!.id! });
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
.transactions-page {
  padding: 0.75rem 1.5rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.toolbar-right :deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}

.toolbar-separator {
  display: block;
  width: 1px;
  height: 1.25rem;
  background-color: var(--p-surface-300);
  margin: 0 0.25rem;
  flex-shrink: 0;
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
