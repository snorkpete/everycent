<template>
  <div class="import-page">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <label class="budget-label">Budget:</label>
        <Select
          v-model="selectedBudgetId"
          :options="store.budgetsForDropdown"
          option-label="name"
          option-value="id"
          placeholder="Select budget"
          data-testid="budget-select"
          class="budget-select"
          @update:model-value="onBudgetChange"
        />
        <Message
          v-if="store.selectedBudget && !store.isBudgetCurrent"
          severity="warn"
          :closable="false"
          data-testid="budget-warning"
          class="budget-warning"
        >
          Warning: This is not the current budget.
        </Message>
      </div>
      <div class="toolbar-right">
        <router-link :to="{ name: 'transactions' }" class="nav-link">
          <Button
            icon="pi pi-arrow-left"
            label="Transactions"
            text
            severity="secondary"
            size="small"
            data-testid="back-to-transactions-btn"
          />
        </router-link>
      </div>
    </div>

    <!-- Content area -->
    <div class="content-area">
      <!-- File Upload -->
      <div class="upload-section">
        <FileUpload
          mode="basic"
          accept=".zip"
          custom-upload
          auto
          choose-label="Select ZIP file"
          data-testid="file-upload"
          @select="onFileSelect"
        />
        <ProgressSpinner
          v-if="store.loading"
          class="loading-spinner"
          data-testid="loading-spinner"
          stroke-width="4"
          style="width: 2rem; height: 2rem"
        />
        <span v-if="store.loading" class="loading-text" data-testid="loading-text">Processing...</span>
      </div>

      <!-- Error display -->
      <Message
        v-if="store.error"
        severity="error"
        :closable="false"
        data-testid="error-message"
        class="error-message"
      >
        {{ store.error }}
      </Message>

      <!-- Parsed Phase: File Summary -->
      <template v-if="store.phase !== 'idle'">
        <table class="summary-table" data-testid="file-summary">
          <thead>
            <tr>
              <th>IBAN</th>
              <th>EveryCent Account</th>
              <th class="right">Total</th>
              <th class="right">To Add</th>
              <th class="right">To Skip</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in store.fileSummary"
              :key="row.iban"
              :class="{ 'unmatched-row': !row.matchedAccountName }"
              data-testid="summary-row"
            >
              <td>{{ row.iban }}</td>
              <td>
                <span v-if="row.matchedAccountName">{{ row.matchedAccountName }}</span>
                <span v-else class="missing-account" data-testid="missing-account">Bank account missing</span>
              </td>
              <td class="right">{{ row.totalTransactions }}</td>
              <td class="right">{{ row.inPeriodCount }}</td>
              <td class="right">{{ row.outOfPeriodCount }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Action buttons -->
        <div class="action-bar">
          <Button
            label="Preview"
            severity="secondary"
            data-testid="preview-btn"
            :disabled="!hasMatchedAccounts || store.loading"
            title="Check for duplicate transactions on the server"
            @click="onPreview"
          />
          <Button
            label="Import and Save"
            data-testid="save-btn"
            :disabled="!hasMatchedAccounts || store.phase === 'parsed' || store.loading"
            title="Save new transactions to the database"
            @click="onSave"
          />
        </div>
      </template>

      <!-- Preview Phase: Detailed Transaction List -->
      <template v-if="store.phase === 'preview'">
        <div
          v-for="(account, accountIndex) in store.previewAccounts"
          :key="account.bank_account_id"
          class="account-group"
          data-testid="account-group"
        >
          <div class="account-header">
            <h3 class="account-name" data-testid="account-name">
              {{ store.getBankAccountName(account.bank_account_id) }}
            </h3>
            <div class="balance-summary" data-testid="balance-summary">
              <span>Balance: {{ centsToDollars(account.current_balance) }}</span>
              <span>Net change: {{ centsToDollars(account.net) }}</span>
              <span>Projected: {{ centsToDollars(account.projected_balance) }}</span>
            </div>
          </div>

          <div class="table-scroll">
          <table class="preview-table">
            <thead>
              <tr>
                <th class="col-date">Date</th>
                <th class="col-description">Description</th>
                <th class="col-money right">Withdrawal</th>
                <th class="col-money right">Deposit</th>
                <th class="col-allocation">Allocation</th>
                <th class="col-status">Status</th>
                <th class="col-manual">Manual</th>
                <th class="col-action" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(transaction, txIndex) in account.transactions"
                :key="transaction.bank_ref ?? txIndex"
                data-testid="preview-row"
                :class="previewRowClass(transaction)"
              >
                <td class="col-date">{{ transaction.transaction_date }}</td>
                <td class="col-description">{{ transaction.description }}</td>
                <td class="col-money right">{{ centsToDollars(transaction.withdrawal_amount) }}</td>
                <td class="col-money right">{{ centsToDollars(transaction.deposit_amount) }}</td>
                <td class="col-allocation" />
                <td class="col-status">
                  <Tag
                    v-if="transaction.import_status === 'duplicate'"
                    value="Duplicate"
                    severity="secondary"
                    data-testid="status-duplicate"
                  />
                  <Tag
                    v-else-if="transaction.import_status === 'out_of_period'"
                    value="Out of period"
                    severity="warn"
                    data-testid="status-out-of-period"
                  />
                  <Tag
                    v-else-if="transaction.import_status === 'new'"
                    value="New"
                    severity="success"
                    data-testid="status-new"
                  />
                </td>
                <td class="col-manual center">
                  <input
                    type="checkbox"
                    :checked="!transaction.camt_imported"
                    :disabled="transaction.import_status === 'duplicate'"
                    title="Mark as manually entered (not auto-imported)"
                    @change="transaction.camt_imported = !($event.target as HTMLInputElement).checked"
                  />
                </td>
                <td class="col-action">
                  <Button
                    v-if="transaction.import_status !== 'duplicate'"
                    :icon="transaction.deleted ? 'pi pi-undo' : 'pi pi-trash'"
                    :severity="transaction.deleted ? 'secondary' : 'danger'"
                    text
                    size="small"
                    :data-testid="`delete-toggle-${accountIndex}-${txIndex}`"
                    :title="transaction.deleted ? 'Restore this transaction' : 'Exclude this transaction from import'"
                    @click="store.toggleDeleteTransaction(accountIndex, txIndex)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </template>

      <!-- Saved Phase -->
      <template v-if="store.phase === 'saved' && store.saveResult">
        <Message severity="success" :closable="false" data-testid="save-success">
          Import complete!
        </Message>

        <div
          v-for="account in store.saveResult.bank_accounts"
          :key="account.bank_account_id"
          class="save-summary"
          data-testid="save-summary"
        >
          <strong>{{ store.getBankAccountName(account.bank_account_id) }}</strong>:
          {{ account.transactions.length }} transactions
        </div>

        <router-link :to="{ name: 'transactions' }">
          <Button
            label="View Transactions"
            outlined
            data-testid="view-transactions-btn"
          />
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import { useHeadingStore } from '../toolbar/headingStore';
import { useImportStore } from './importStore';
import { budgetApi } from '../budgets/budgetApi';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import type { ImportTransaction } from './import.types';

const store = useImportStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();
const route = useRoute();

const selectedBudgetId = ref<number | null>(null);

const hasMatchedAccounts = computed(() =>
  store.fileSummary.some((row) => row.matchedAccountName != null),
);

onMounted(async () => {
  headingStore.setHeading('Import Transactions');
  store.resetPreview();
  await store.fetchMetadata();

  // Inherit budget from query param or auto-select current budget
  const budgetIdFromQuery = Number(route.query.budget_id);
  if (budgetIdFromQuery) {
    store.selectBudget(budgetIdFromQuery);
    selectedBudgetId.value = budgetIdFromQuery;
  } else {
    try {
      const currentBudgetId = await budgetApi.getCurrentBudgetId();
      store.selectBudget(currentBudgetId);
      selectedBudgetId.value = currentBudgetId;
    } catch {
      const firstOpen = store.budgets.find((b) => b.status === 'open');
      if (firstOpen?.id) {
        store.selectBudget(firstOpen.id);
        selectedBudgetId.value = firstOpen.id;
      }
    }
  }
});

function onBudgetChange(budgetId: number) {
  store.selectBudget(budgetId);
  store.resetPreview();
}

async function onFileSelect(event: { files: File[] }) {
  const file = event.files[0];
  if (!file) return;

  store.resetPreview();
  try {
    await store.parseFile(file);
  } catch {
    notifications.error(store.error ?? 'Failed to process file');
  }
}

async function onPreview() {
  try {
    await store.fetchPreview();
  } catch {
    notifications.error(store.error ?? 'Failed to load preview');
  }
}

async function onSave() {
  try {
    await store.saveImport();
    notifications.success('Import saved successfully');
  } catch {
    notifications.error(store.error ?? 'Failed to save import');
  }
}

function previewRowClass(transaction: ImportTransaction) {
  return {
    'preview-row--duplicate': transaction.import_status === 'duplicate',
    'preview-row--deleted': transaction.deleted && transaction.import_status !== 'duplicate',
    'preview-row--out-of-period': transaction.import_status === 'out_of_period' && !transaction.deleted,
  };
}
</script>

<style scoped>
.import-page {
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
  gap: 0.5rem;
  flex-shrink: 0;
}

.budget-label {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.budget-select {
  min-width: 14rem;
}

.budget-warning {
  margin: 0;
}

.content-area {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  flex-shrink: 0;
}

.loading-text {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.error-message {
  margin: 0;
}

/* ── File summary table ── */
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  overflow: hidden;
}

.summary-table th,
.summary-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  text-align: left;
}

.summary-table th {
  font-weight: 600;
  background-color: var(--p-surface-50);
}

.right {
  text-align: right;
}

.unmatched-row {
  background-color: #fef3c7;
}

.missing-account {
  color: #b45309;
  font-style: italic;
}

/* ── Action bar ── */
.action-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

/* ── Account groups (preview) ── */
.account-group {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
}

.account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-300);
}

.account-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.balance-summary {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.table-scroll {
  max-height: 50vh;
  overflow: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.preview-table th,
.preview-table td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--p-surface-200);
  font-size: 0.875rem;
}

.preview-table th {
  font-weight: 600;
  text-align: left;
  background-color: var(--p-surface-50);
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: 0 1px 0 var(--p-surface-300);
}

.col-date { width: 11%; }
.col-description { width: 30%; }
.col-money { width: 11%; }
.col-allocation { width: 18%; }
.col-status { width: 10%; }
.col-manual { width: 5%; text-align: center; }
.col-action { width: 5%; }

.center { text-align: center; }

.preview-table tbody tr:nth-child(even) {
  background-color: var(--p-surface-50);
}

.preview-row--duplicate {
  opacity: 0.4;
}

.preview-row--deleted {
  opacity: 0.4;
  text-decoration: line-through;
}

.preview-row--out-of-period {
  opacity: 0.4;
  text-decoration: line-through;
}

.save-summary {
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.nav-link {
  text-decoration: none;
}
</style>
