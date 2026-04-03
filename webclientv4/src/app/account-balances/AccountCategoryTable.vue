<template>
  <div class="account-category-table">
    <h3 class="section-heading">
      <span>{{ heading }}</span>
      <span class="heading-total"
        ><EcMoneyDisplay :model-value="totalCurrentBalance" emphasis="subtotal"
      /></span>
    </h3>
    <table class="ec-budget-table account-table">
      <thead>
        <tr>
          <th class="col-name">Name</th>
          <th class="col-institution">Institution</th>
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
            <span class="name-cell">
              <router-link :to="`/transactions?bank_account_id=${account.id}`">{{
                account.name
              }}</router-link>
              <i
                v-if="account.account_type === 'sink_fund'"
                v-tooltip.top="{ value: 'Sink fund account', showDelay: 0, hideDelay: 0 }"
                class="pi pi-wallet sink-fund-icon"
              />
            </span>
          </td>
          <td>{{ account.institution?.name ?? '' }}</td>
          <td class="money-cell">
            <EcMoneyDisplay :model-value="account.closing_balance" highlight-mode="none" />
          </td>
          <td class="money-cell">
            <EcMoneyDisplay :model-value="account.expected_closing_balance" highlight-mode="none" />
          </td>
          <td class="money-cell">
            <EcMoneyDisplay :model-value="account.current_balance" highlight-mode="none" />
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <th colspan="2" class="total-label">Total</th>
          <th class="money-cell">
            <EcMoneyDisplay :model-value="totalClosingBalance" emphasis="total" />
          </th>
          <th class="money-cell">
            <EcMoneyDisplay :model-value="totalExpectedClosingBalance" emphasis="total" />
          </th>
          <th class="money-cell">
            <EcMoneyDisplay :model-value="totalCurrentBalance" emphasis="total" />
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '../shared/util/format-date';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
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
</script>

<style scoped>
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../../shared/styles/budget-table.css';

.account-category-table {
  padding: 0.75rem 1rem;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--p-text-color);
}

.heading-total {
  font-variant-numeric: tabular-nums;
  color: var(--p-text-muted-color);
  font-weight: 500;
  font-size: 0.875rem;
}

/* ── Header — smaller muted text ── */
.account-table thead th {
  color: var(--p-text-muted-color);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.account-table .money-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.account-table .col-money {
  text-align: right;
  white-space: nowrap;
}

/* ── Footer — different border style than shared default ── */
.total-row th {
  border-top: 2px solid var(--p-surface-300);
  border-bottom: none;
  font-size: 0.9375rem;
  /* bg-color and font-weight come from ec-budget-table shared rules */
}

.account-table .total-label {
  text-align: right;
  color: var(--p-text-muted-color);
}

/* ── Row hover — lighter than shared default ── */
.account-table tbody tr:hover td {
  background-color: var(--p-surface-50);
}

.account-table a {
  color: var(--p-primary-color);
  text-decoration: none;
}

.account-table a:hover {
  text-decoration: underline;
}

.name-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.sink-fund-icon {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  cursor: help;
}
</style>
