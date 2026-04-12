<template>
  <div class="transaction-summary transaction-summary--mobile">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../settings/settingsStore';
import { total } from '../shared/util/total';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const { bankAccount, transactions, allocations } = defineProps<{
  bankAccount?: BankAccountData;
  transactions: TransactionData[];
  allocations: AllocationData[];
}>();

const settingsStore = useSettingsStore();

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
</script>

<style scoped>
.transaction-summary--mobile {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.3rem 0.5rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;
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

.summary-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
</style>
