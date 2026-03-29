<template>
  <div class="transaction-summary">
    <!-- Row 1: Last Balance | Transactions | Bank Balance -->
    <div class="summary-grid">
      <div class="summary-cell">
        <span class="summary-label">Last Balance</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="lastBankBalance"
          data-testid="last-bank-balance"
        />
      </div>
      <div class="summary-cell summary-cell--center">
        <span class="summary-label">Transactions</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="transactionTotal"
          data-testid="transaction-total"
        />
      </div>
      <div class="summary-cell summary-cell--right">
        <span class="summary-label">Bank Balance</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="currentBankBalance"
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
          <EcMoneyField
            label=""
            :edit-mode="false"
            :model-value="currentBudgetBalance"
            data-testid="current-budget-balance"
          />
        </template>
        <template v-else-if="showUnpaidBalance">
          <span class="summary-label">Unpaid Balance</span>
          <EcMoneyField
            label=""
            :edit-mode="false"
            :model-value="unpaidBalance"
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
            <EcMoneyField label="" :edit-mode="false" :model-value="store.selectedTotal" />
            <Button
              icon="pi pi-times"
              text
              severity="secondary"
              size="small"
              class="calculator-clear-btn"
              data-testid="calculator-clear-btn"
              title="Clear all selected transactions"
              @click="store.clearSelections()"
            />
          </div>
        </Transition>
      </div>

      <!-- Right: Diff (primary) | Unpaid Diff (credit card) | empty -->
      <div class="summary-cell summary-cell--right">
        <template v-if="showBudgetBalance">
          <span class="summary-label">Diff</span>
          <EcMoneyField
            label=""
            :edit-mode="false"
            :model-value="budgetDifference"
            highlight-mode="zero"
            data-testid="budget-difference"
          />
        </template>
        <template v-else-if="showUnpaidBalance">
          <span class="summary-label">Unpaid Diff</span>
          <EcMoneyField
            label=""
            :edit-mode="false"
            :model-value="unpaidDifference"
            highlight-mode="zero"
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
import { total } from '../shared/util/total';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const props = defineProps<{
  bankAccount?: BankAccountData;
  transactions: TransactionData[];
  allocations: AllocationData[];
}>();

const settingsStore = useSettingsStore();
const store = useTransactionStore();

const lastBankBalance = computed(() => props.bankAccount?.closing_balance ?? 0);

const transactionTotal = computed(() => {
  if (!props.transactions.length) return 0;
  let totalWithdrawals = 0;
  let totalDeposits = 0;
  for (const t of props.transactions) {
    if (!t.deleted) {
      totalWithdrawals += t.withdrawal_amount ?? 0;
      totalDeposits += t.deposit_amount ?? 0;
    }
  }
  return totalDeposits - totalWithdrawals;
});

const currentBankBalance = computed(() => lastBankBalance.value + transactionTotal.value);

const showBudgetBalance = computed(() => {
  if (!props.bankAccount) return false;
  return props.bankAccount.id === settingsStore.settings.primary_budget_account_id;
});

const currentBudgetBalance = computed(() => {
  return total(props.allocations, 'amount') - total(props.allocations, 'spent');
});

const budgetDifference = computed(() => currentBankBalance.value - currentBudgetBalance.value);

const showUnpaidBalance = computed(() => {
  if (!props.bankAccount) return false;
  return (
    props.bankAccount.account_type === 'credit_card' || props.bankAccount.is_credit_card === true
  );
});

const unpaidBalance = computed(() => {
  const unpaid = props.transactions.filter((t) => t.status !== 'paid' && !t.deleted);
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

.summary-cell--right :deep(.ec-money-field) {
  margin-left: 0;
}

.summary-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* Make EcMoneyField sit inline within summary cells */
.summary-cell :deep(.ec-money-field) {
  display: inline;
  margin-left: auto;
  text-align: right;
}
.summary-cell :deep(.ec-money-field .label) {
  display: none;
}
.summary-cell :deep(.money-display) {
  font-size: 0.875rem;
  font-weight: 600;
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
</style>
