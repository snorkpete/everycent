<template>
  <!-- Mobile summary -->
  <div v-if="isMobile" class="transaction-summary transaction-summary--mobile">
    <div class="summary-grid-mobile">
      <div class="summary-cell-mobile">
        <span class="summary-label">Last Bal</span>
        <EcMoneyDisplay
          :model-value="lastBankBalance"
          emphasis="subtotal"
          data-testid="last-bank-balance"
        />
      </div>
      <div class="summary-cell-mobile summary-cell-mobile--right">
        <span class="summary-label">Bank Bal</span>
        <EcMoneyDisplay
          :model-value="currentBankBalance"
          emphasis="subtotal"
          data-testid="current-bank-balance"
        />
      </div>
      <div class="summary-cell-mobile">
        <span class="summary-label">Txns</span>
        <EcMoneyDisplay
          :model-value="transactionTotal"
          emphasis="subtotal"
          data-testid="transaction-total"
        />
      </div>
      <div v-if="showBudgetBalance" class="summary-cell-mobile summary-cell-mobile--right">
        <span class="summary-label">Diff</span>
        <EcMoneyDisplay
          :model-value="budgetDifference"
          highlight-mode="difference"
          emphasis="subtotal"
          data-testid="budget-difference"
        />
      </div>
      <div v-else-if="showUnpaidBalance" class="summary-cell-mobile summary-cell-mobile--right">
        <span class="summary-label">Unpaid</span>
        <EcMoneyDisplay
          :model-value="unpaidBalance"
          emphasis="subtotal"
          data-testid="unpaid-balance"
        />
      </div>
    </div>
  </div>

  <!-- Desktop summary -->
  <div v-else class="transaction-summary">
    <!-- Row 1: Last Balance | Transactions | Bank Balance -->
    <div class="summary-grid">
      <div class="summary-cell">
        <span class="summary-label">Last Balance</span>
        <EcMoneyDisplay
          :model-value="lastBankBalance"
          emphasis="subtotal"
          data-testid="last-bank-balance"
        />
      </div>
      <div class="summary-cell summary-cell--center">
        <span class="summary-label">Transactions</span>
        <EcMoneyDisplay
          :model-value="transactionTotal"
          emphasis="subtotal"
          data-testid="transaction-total"
        />
      </div>
      <div class="summary-cell summary-cell--right">
        <span class="summary-label">Bank Balance</span>
        <EcMoneyDisplay
          :model-value="currentBankBalance"
          emphasis="subtotal"
          data-testid="current-bank-balance"
        />
      </div>
    </div>

    <!-- Row 2: always present with fixed height, cells show conditionally by account type -->
    <div class="summary-grid summary-row-2" data-testid="summary-row-2">
      <!-- Left: Budget Balance (primary) | Unpaid Balance (credit card) | empty -->
      <div class="summary-cell">
        <template v-if="showBudgetBalance">
          <span class="summary-label">Budget Balance</span>
          <EcMoneyDisplay
            :model-value="currentBudgetBalance"
            emphasis="subtotal"
            data-testid="current-budget-balance"
          />
        </template>
        <template v-else-if="showUnpaidBalance">
          <span class="summary-label">Unpaid Balance</span>
          <EcMoneyDisplay
            :model-value="unpaidBalance"
            emphasis="subtotal"
            data-testid="unpaid-balance"
          />
        </template>
      </div>

      <!-- Center: Calculator total when selections exist -->
      <div class="summary-cell summary-cell--center">
        <Transition name="calc-fade">
          <div
            v-if="store.selectedTransactions.length > 0"
            class="calculator-pill"
            data-testid="calculator-total"
          >
            <span class="summary-label">Selected Total</span>
            <EcMoneyDisplay :model-value="store.selectedTotal" emphasis="subtotal" />
            <Button
              v-tooltip="'Clear all selected transactions'"
              icon="pi pi-times"
              text
              severity="secondary"
              size="small"
              class="calculator-clear-btn"
              data-testid="calculator-clear-btn"
              @click="store.clearSelections()"
            />
          </div>
        </Transition>
      </div>

      <!-- Right: Diff (primary) | Unpaid Diff (credit card) | empty -->
      <div class="summary-cell summary-cell--right">
        <template v-if="showBudgetBalance">
          <span class="summary-label">Diff</span>
          <EcMoneyDisplay
            :model-value="budgetDifference"
            highlight-mode="difference"
            emphasis="subtotal"
            data-testid="budget-difference"
          />
        </template>
        <template v-else-if="showUnpaidBalance">
          <span class="summary-label">Unpaid Diff</span>
          <EcMoneyDisplay
            :model-value="unpaidDifference"
            highlight-mode="difference"
            emphasis="subtotal"
            data-testid="unpaid-difference"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import { useSettingsStore } from '../settings/settingsStore';
import { useTransactionStore } from './transactionStore';
import { useResponsive } from '../shared/composables/useResponsive';
import { total } from '../shared/util/total';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const { bankAccount, transactions, allocations } = defineProps<{
  bankAccount?: BankAccountData;
  transactions: TransactionData[];
  allocations: AllocationData[];
}>();

const { isMobile } = useResponsive();
const settingsStore = useSettingsStore();
const store = useTransactionStore();

const lastBankBalance = computed(() => bankAccount?.closing_balance ?? 0);

const transactionTotal = computed(() => {
  if (!transactions.length) return 0;
  let totalWithdrawals = 0;
  let totalDeposits = 0;
  for (const t of transactions) {
    if (!t.deleted) {
      totalWithdrawals += t.withdrawal_amount ?? 0;
      totalDeposits += t.deposit_amount ?? 0;
    }
  }
  return totalDeposits - totalWithdrawals;
});

const currentBankBalance = computed(() => lastBankBalance.value + transactionTotal.value);

const showBudgetBalance = computed(() => {
  if (!bankAccount) return false;
  return bankAccount.id === settingsStore.settings.primary_budget_account_id;
});

const currentBudgetBalance = computed(() => {
  return total(allocations, 'amount') - total(allocations, 'spent');
});

const budgetDifference = computed(() => currentBankBalance.value - currentBudgetBalance.value);

const showUnpaidBalance = computed(() => {
  if (!bankAccount) return false;
  return bankAccount.account_type === 'credit_card' || bankAccount.is_credit_card === true;
});

const unpaidBalance = computed(() => {
  const unpaid = transactions.filter((t) => t.status !== 'paid' && !t.deleted);
  return total(unpaid, 'net_amount');
});

const unpaidDifference = computed(() => currentBankBalance.value - unpaidBalance.value);
</script>

<style scoped>
.transaction-summary {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.375rem 0.75rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  min-height: 1.5rem;
  align-items: baseline;
}

.summary-row-2 {
  min-height: 1.5rem;
}

.summary-cell {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0 0.5rem 0 0;
}

.summary-cell--center {
  padding: 0 0.5rem;
}

.summary-cell--right {
  padding: 0 0 0 0.5rem;
  justify-content: flex-end;
}

.summary-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* EcMoneyDisplay alignment within summary cells */
.summary-cell :deep(.money-display) {
  margin-left: auto;
}

/* Calculator pill — subtle highlight with animation */
.calculator-pill {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  background-color: var(--p-primary-50);
  border: 1px solid var(--p-primary-100);
  border-radius: 4px;
  padding: 0.125rem 0.25rem 0.125rem 0.5rem;
  width: 100%;
}

.calculator-clear-btn {
  padding: 0.125rem;
  align-self: center;
}

/* Fade transition for calculator total */
.calc-fade-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.calc-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.calc-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.calc-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ── Mobile summary ── */
.transaction-summary--mobile {
  padding: 0.3rem 0.5rem;
}

.summary-grid-mobile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.15rem 0.75rem;
  align-items: baseline;
}

.summary-cell-mobile {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.summary-cell-mobile--right {
  justify-content: flex-end;
}

.summary-cell-mobile :deep(.money-display) {
  margin-left: auto;
}
</style>
