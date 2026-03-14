<template>
  <div class="transaction-summary">
    <div class="summary-row">
      <span class="summary-label">Last Bank Balance</span>
      <span class="summary-value" data-testid="last-bank-balance">{{ centsToDollars(lastBankBalance) }}</span>
    </div>

    <div class="summary-row">
      <span class="summary-label">Transaction Total</span>
      <span class="summary-value" data-testid="transaction-total">{{ centsToDollars(transactionTotal) }}</span>
    </div>

    <div class="summary-row summary-row--total">
      <span class="summary-label">Current Bank Balance</span>
      <span
        class="summary-value"
        data-testid="current-bank-balance"
        :class="{ positive: currentBankBalance > 0, negative: currentBankBalance < 0 }"
      >{{ centsToDollars(currentBankBalance) }}</span>
    </div>

    <template v-if="showBudgetBalance">
      <div class="summary-row" data-testid="budget-balance-section">
        <span class="summary-label">Current Budget Balance</span>
        <span class="summary-value" data-testid="current-budget-balance">{{ centsToDollars(currentBudgetBalance) }}</span>
      </div>

      <div class="summary-row summary-row--total">
        <span class="summary-label">Difference (Bank vs Budget)</span>
        <span
          class="summary-value"
          data-testid="budget-difference"
          :class="{ positive: budgetDifference > 0, negative: budgetDifference < 0 }"
        >{{ centsToDollars(budgetDifference) }}</span>
      </div>
    </template>

    <template v-if="showUnpaidBalance">
      <div class="summary-row" data-testid="unpaid-balance-section">
        <span class="summary-label">Unpaid Balance</span>
        <span
          class="summary-value"
          data-testid="unpaid-balance"
          :class="{ positive: unpaidBalance > 0, negative: unpaidBalance < 0 }"
        >{{ centsToDollars(unpaidBalance) }}</span>
      </div>

      <div class="summary-row">
        <span class="summary-label">Unpaid Difference</span>
        <span
          class="summary-value"
          data-testid="unpaid-difference"
          :class="{ positive: unpaidDifference > 0, negative: unpaidDifference < 0 }"
        >{{ centsToDollars(unpaidDifference) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../settings/settingsStore';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { total } from '../shared/util/total';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const props = defineProps<{
  bankAccount?: BankAccountData;
  transactions: TransactionData[];
  allocations: AllocationData[];
}>();

const settingsStore = useSettingsStore();

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
  return props.bankAccount.account_type === 'credit_card' || props.bankAccount.is_credit_card === true;
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
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
}

.summary-row--total {
  border-top: 1px solid var(--p-surface-300);
  margin-top: 0.25rem;
  padding-top: 0.4rem;
  font-size: 1rem;
}

.summary-label {
  font-weight: 500;
  flex: 2;
}

.summary-value {
  flex: 1;
  text-align: right;
}

.positive {
  color: var(--p-green-600);
}

.negative {
  color: var(--p-red-600);
}
</style>
