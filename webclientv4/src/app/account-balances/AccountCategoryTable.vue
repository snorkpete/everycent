<template>
  <div class="account-category-table">
    <h3 class="section-heading">{{ heading }}</h3>
    <table class="account-table">
      <thead>
        <tr>
          <th class="col-name">Name</th>
          <th class="col-institution">Institution</th>
          <th class="col-type">Account Type</th>
          <th class="col-category">Category</th>
          <th class="col-money">
            Balance At <em>{{ closingDateLabel }}</em>
          </th>
          <th class="col-money">
            Balance At <em>{{ nextClosingDateLabel }}</em>
          </th>
          <th class="col-money">Current Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in accounts" :key="account.id">
          <td>
            <a :href="`/#/transactions?bank_account_id=${account.id}`">{{ account.name }}</a>
          </td>
          <td>{{ account.institution?.name ?? '' }}</td>
          <td>{{ account.account_type }}</td>
          <td>{{ account.account_category }}</td>
          <td class="money-cell">{{ formatMoney(account.closing_balance) }}</td>
          <td class="money-cell">{{ formatMoney(account.expected_closing_balance) }}</td>
          <td class="money-cell">{{ formatMoney(account.current_balance) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <th colspan="4" class="total-label">Total</th>
          <th class="money-cell">{{ formatMoney(totalClosingBalance) }}</th>
          <th class="money-cell">{{ formatMoney(totalExpectedClosingBalance) }}</th>
          <th class="money-cell">{{ formatMoney(totalCurrentBalance) }}</th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { formatDate } from '../shared/util/format-date';
import type { AccountBalanceData } from './accountBalance.types';

const props = defineProps<{
  heading: string;
  accounts: AccountBalanceData[];
}>();

const firstAccount = computed(() => props.accounts[0] ?? null);

const closingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.closing_date) : '',
);

const nextClosingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.next_closing_date) : '',
);

const totalClosingBalance = computed(() =>
  props.accounts.reduce((sum, a) => sum + a.closing_balance, 0),
);

const totalExpectedClosingBalance = computed(() =>
  props.accounts.reduce((sum, a) => sum + a.expected_closing_balance, 0),
);

const totalCurrentBalance = computed(() =>
  props.accounts.reduce((sum, a) => sum + a.current_balance, 0),
);

function formatMoney(cents: number): string {
  return centsToDollars(cents);
}
</script>

<style scoped>
.account-category-table {
  margin-bottom: 1rem;
}

.section-heading {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--p-text-color);
}

.account-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.account-table th,
.account-table td {
  padding: 0.375rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--p-surface-200);
}

.account-table thead th {
  font-weight: 600;
  color: var(--p-text-muted-color);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.money-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.col-money {
  text-align: right;
  white-space: nowrap;
}

.total-row th {
  font-weight: 600;
  border-top: 2px solid var(--p-surface-300);
  border-bottom: none;
}

.total-label {
  text-align: right;
  color: var(--p-text-muted-color);
}

.account-table tbody tr:hover {
  background-color: var(--p-surface-50);
}

.account-table a {
  color: var(--p-primary-color);
  text-decoration: none;
}

.account-table a:hover {
  text-decoration: underline;
}
</style>
