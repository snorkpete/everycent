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

    <!-- Row 2 (primary account): Budget Balance | [empty] | Diff -->
    <div
      v-if="showBudgetBalance"
      class="summary-grid"
      data-testid="budget-balance-section"
    >
      <div class="summary-cell">
        <span class="summary-label">Budget Balance</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="currentBudgetBalance"
          data-testid="current-budget-balance"
        />
      </div>
      <div class="summary-cell summary-cell--center" />
      <div class="summary-cell summary-cell--right">
        <span class="summary-label">Diff</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="budgetDifference"
          highlight-mode="zero"
          data-testid="budget-difference"
        />
      </div>
    </div>

    <!-- Row 2 (credit card): Unpaid Balance | [empty] | Unpaid Diff -->
    <div
      v-if="showUnpaidBalance"
      class="summary-grid"
      data-testid="unpaid-balance-section"
    >
      <div class="summary-cell">
        <span class="summary-label">Unpaid Balance</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="unpaidBalance"
          data-testid="unpaid-balance"
        />
      </div>
      <div class="summary-cell summary-cell--center" />
      <div class="summary-cell summary-cell--right">
        <span class="summary-label">Unpaid Diff</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="unpaidDifference"
          highlight-mode="zero"
          data-testid="unpaid-difference"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../settings/settingsStore';
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
  gap: 0.125rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.summary-cell {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.summary-cell--center {
  align-items: center;
}

.summary-cell--right {
  align-items: flex-end;
}

.summary-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.4;
}
</style>
