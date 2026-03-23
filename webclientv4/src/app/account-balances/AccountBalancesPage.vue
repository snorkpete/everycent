<template>
  <div class="account-balances-page">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <label class="toggle-label">
          <ToggleSwitch
            v-model="store.includeClosed"
            data-testid="include-closed-toggle"
            @update:model-value="onToggleChanged"
          />
          <span>Include Closed Accounts?</span>
        </label>
      </div>
      <div class="toolbar-right">
        <Button
          label="Adjust Account Balances"
          data-testid="adjust-balances-btn"
          outlined
          size="small"
          @click="showAdjustDialog = true"
        />
      </div>
    </div>

    <!-- Adjust Balances Dialog -->
    <AdjustBalancesDialog v-model:visible="showAdjustDialog" :accounts="store.accounts" />

    <!-- Content -->
    <div class="content-card">
      <div v-if="store.loading" class="loading-message">Loading...</div>
      <div v-else-if="store.error" class="error-message">{{ store.error }}</div>
      <div v-else class="content-scroll">
        <AccountCategoryTable
          heading="Current Accounts"
          :accounts="store.currentAccounts"
          data-testid="current-accounts-table"
        />
        <AccountCategoryTable
          heading="Cash Assets"
          :accounts="store.cashAssetAccounts"
          data-testid="cash-assets-table"
        />
        <AccountCategoryTable
          heading="Non Cash Assets"
          :accounts="store.nonCashAssetAccounts"
          data-testid="non-cash-assets-table"
        />

        <div class="summary-line" data-testid="total-assets-line">
          <span class="summary-label">Total Assets</span>
          <span class="summary-value">{{ formatMoney(store.totalAssets) }}</span>
        </div>

        <AccountCategoryTable
          heading="Credit Cards"
          :accounts="store.creditCardAccounts"
          data-testid="credit-cards-table"
        />
        <AccountCategoryTable
          heading="Loans"
          :accounts="store.loanAccounts"
          data-testid="loans-table"
        />

        <!-- Net Worth Summary -->
        <div class="net-worth-summary" data-testid="net-worth-summary">
          <div class="summary-line">
            <span class="summary-label">Total Liabilities</span>
            <span class="summary-value" data-testid="total-liabilities">{{
              formatMoney(store.totalLiabilities)
            }}</span>
          </div>
          <div class="summary-line">
            <span class="summary-label">Net Current Cash</span>
            <span class="summary-value" data-testid="net-current-cash">{{
              formatMoney(store.netCurrentCash)
            }}</span>
          </div>
          <div class="summary-line">
            <span class="summary-label">Net Cash Assets</span>
            <span class="summary-value" data-testid="net-cash-assets">{{
              formatMoney(store.netCashAssets)
            }}</span>
          </div>
          <div class="summary-line">
            <span class="summary-label">Net Non Cash Assets</span>
            <span class="summary-value" data-testid="net-non-cash-assets">{{
              formatMoney(store.netNonCashAssets)
            }}</span>
          </div>
          <div class="summary-line summary-line--net-worth">
            <span class="summary-label">Net Worth</span>
            <span class="summary-value" data-testid="net-worth">{{
              formatMoney(store.netWorth)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import { useHeadingStore } from '../toolbar/headingStore';
import { useAccountBalanceStore } from './accountBalanceStore';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import AccountCategoryTable from './AccountCategoryTable.vue';
import AdjustBalancesDialog from './AdjustBalancesDialog.vue';

const headingStore = useHeadingStore();
const store = useAccountBalanceStore();

const showAdjustDialog = ref(false);

onMounted(() => {
  headingStore.setHeading('Account Balances');
  store.fetch();
});

async function onToggleChanged() {
  await store.fetch();
}

function formatMoney(cents: number): string {
  return centsToDollars(cents);
}
</script>

<style scoped>
.account-balances-page {
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

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
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

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.loading-message,
.error-message {
  padding: 1rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.error-message {
  color: var(--p-red-600);
}

.summary-line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
  padding: 0.375rem 0;
  font-size: 0.9375rem;
}

.summary-label {
  font-weight: 500;
  color: var(--p-text-muted-color);
  min-width: 12rem;
  text-align: right;
}

.summary-value {
  font-variant-numeric: tabular-nums;
  min-width: 6rem;
  text-align: right;
}

.net-worth-summary {
  margin-top: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
  padding-top: 0.5rem;
}

.summary-line--net-worth {
  border-top: 2px solid var(--p-surface-300);
  margin-top: 0.25rem;
  padding-top: 0.5rem;
}

.summary-line--net-worth .summary-label,
.summary-line--net-worth .summary-value {
  font-weight: 700;
  font-size: 1rem;
  color: var(--p-text-color);
}
</style>
