<template>
  <EcPageLayout page-name="transactions" variant="fixed">
    <!-- Mobile: stacked selectors above toolbar -->
    <template v-if="isMobile" #toolbar>
      <div class="mobile-toolbar">
        <div class="mobile-selectors">
          <Select
            v-model="searchState.selectedBankAccountId"
            :options="store.bankAccounts"
            option-label="name"
            option-value="id"
            placeholder="Bank Account"
            data-testid="bank-account-select"
            class="mobile-select"
            @update:model-value="onBankAccountChange"
          />
          <Select
            v-model="searchState.selectedBudgetId"
            :options="store.currentAndPastBudgets"
            option-label="name"
            option-value="id"
            placeholder="Budget"
            data-testid="budget-select"
            class="mobile-select"
            @update:model-value="onBudgetChange"
          />
        </div>
        <div class="mobile-actions">
          <Button
            v-tooltip="'Go to budget'"
            icon="pi pi-book"
            text
            severity="secondary"
            size="small"
            as="a"
            :href="budgetLink"
            data-testid="go-to-budget-link"
          />
          <Button
            v-tooltip="'Toggle between showing zeroes as numbers or dashes'"
            :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
            text
            severity="secondary"
            size="small"
            :class="['icon-btn', { 'icon-btn--active': dashIfZero }]"
            data-testid="dash-zero-toggle"
            @click="dashIfZero = !dashIfZero"
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
          <Button
            v-tooltip="'Import or transfer transactions'"
            icon="pi pi-upload"
            text
            severity="secondary"
            size="small"
            data-testid="import-menu-btn"
            @click="toggleImportMenu"
          />
          <Menu ref="importMenuRef" :model="importMenuItems" :popup="true" />
          <Button
            v-if="!store.isEditMode"
            label="Edit"
            data-testid="edit-btn"
            size="small"
            @click="store.enterEditMode()"
          />
          <template v-else>
            <Button
              v-tooltip="'Add new transaction'"
              icon="pi pi-plus"
              outlined
              size="small"
              data-testid="add-btn-mobile"
              @click="store.addTransaction()"
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
        </div>
      </div>
    </template>

    <!-- Desktop: original toolbar -->
    <template v-if="!isMobile" #toolbar-left>
      <TransactionSearchForm @fetch="onFetch" />
    </template>
    <template v-if="!isMobile" #toolbar-right>
      <Button
        v-tooltip="'Toggle between showing zeroes as numbers or dashes'"
        :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': dashIfZero }]"
        data-testid="dash-zero-toggle"
        @click="dashIfZero = !dashIfZero"
      />
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
        :show-calculator-column="!isMobile && showCalculatorColumn"
        :dash-if-zero="dashIfZero"
      />
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcToolbarSeparator from '../shared/layout/EcToolbarSeparator.vue';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Select from 'primevue/select';
import { useHeadingStore } from '../toolbar/headingStore';
import { useTransactionStore } from './transactionStore';
import { useSettingsStore } from '../settings/settingsStore';
import { useNotifications } from '../notifications/useNotifications';
import { useResponsive } from '../shared/composables/useResponsive';
import TransactionSearchForm from './TransactionSearchForm.vue';
import TransactionList from './TransactionList.vue';
import TransactionSummary from './TransactionSummary.vue';
import TransactionImportDialog from './TransactionImportDialog.vue';
import AccountTransferDialog from './AccountTransferDialog.vue';
import type { TransactionData } from './transaction.types';

const { isMobile } = useResponsive();
const route = useRoute();
const router = useRouter();
const store = useTransactionStore();
const headingStore = useHeadingStore();
const settingsStore = useSettingsStore();
const notifications = useNotifications();

const dashIfZero = ref(true);
const wrapDescriptions = ref(false);
const showCalculatorColumn = ref(false);
const showImportDialog = ref(false);
const showTransferDialog = ref(false);

// Mobile: inline search state (mirrors TransactionSearchForm for mobile toolbar)
const searchState = ref({
  selectedBankAccountId: null as number | null,
  selectedBudgetId: null as number | null,
  initialised: false,
});

const budgetLink = computed(() => {
  if (searchState.value.selectedBudgetId) {
    return `#/budgets/${searchState.value.selectedBudgetId}`;
  }
  return '#/budgets';
});

// Mobile: popup menu for import/transfer actions
const importMenuRef = ref();
const importMenuItems = computed(() => [
  {
    label: 'Import',
    icon: 'pi pi-upload',
    command: () => {
      showImportDialog.value = true;
    },
  },
  {
    label: 'Import CAMT',
    icon: 'pi pi-file',
    command: () => navigateToImport(),
  },
  {
    label: 'Transfer',
    icon: 'pi pi-arrow-right-arrow-left',
    command: () => {
      showTransferDialog.value = true;
    },
  },
]);

function toggleImportMenu(event: Event) {
  importMenuRef.value.toggle(event);
}

onMounted(() => {
  headingStore.setHeading('Transactions');
  store.fetchMetadata();
  settingsStore.fetchAll();
  initMobileSearch();
});

// Mobile: initialise selectors from URL or defaults once metadata loads
function initMobileSearch() {
  if (!isMobile.value) return;
  const unwatch = watch(
    () => store.bankAccounts,
    (accounts) => {
      if (searchState.value.initialised || accounts.length === 0) return;

      const queryBudgetId = route.query.budget_id ? Number(route.query.budget_id) : null;
      const queryBankAccountId = route.query.bank_account_id
        ? Number(route.query.bank_account_id)
        : null;

      const firstAccount = accounts[0];
      const firstBudget = store.currentAndPastBudgets[0];

      searchState.value.selectedBankAccountId = queryBankAccountId ?? firstAccount?.id ?? null;
      searchState.value.selectedBudgetId = queryBudgetId ?? firstBudget?.id ?? null;

      searchState.value.initialised = true;
      emitMobileFetch();
      unwatch();
    },
    { immediate: true },
  );
}

function onBankAccountChange() {
  emitMobileFetch();
}

function onBudgetChange() {
  emitMobileFetch();
}

function emitMobileFetch() {
  if (searchState.value.selectedBudgetId && searchState.value.selectedBankAccountId) {
    router.replace({
      query: {
        budget_id: searchState.value.selectedBudgetId,
        bank_account_id: searchState.value.selectedBankAccountId,
      },
    });
    store.fetch({
      budgetId: searchState.value.selectedBudgetId,
      bankAccountId: searchState.value.selectedBankAccountId,
    });
  }
}

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

/* ── Mobile toolbar ── */
.mobile-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.mobile-selectors {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-select {
  width: 100%;
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
