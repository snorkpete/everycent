<template>
  <div class="account-category-table">
    <h3 class="section-heading">
      <span>{{ heading }}</span>
      <span class="heading-total"
        ><EcMoneyDisplay
          :model-value="totalCurrentBalance"
          emphasis="subtotal"
          :dash-if-zero="dashIfZero"
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
        <template v-for="account in accounts" :key="account.id">
          <tr>
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
              <EcMoneyDisplay
                :model-value="account.closing_balance"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </td>
            <td class="money-cell">
              <EcMoneyDisplay
                :model-value="account.expected_closing_balance"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </td>
            <td class="money-cell">
              <EcMoneyDisplay
                :model-value="account.current_balance"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </td>
          </tr>
          <tr v-for="loan in account.loans ?? []" :key="loan.id" class="loan-row">
            <td>
              <span class="name-cell loan-name">
                <router-link :to="`/transactions?bank_account_id=${loan.id}`">{{
                  loan.name
                }}</router-link>
              </span>
            </td>
            <td>{{ loan.institution?.name ?? '' }}</td>
            <td class="money-cell">
              <EcMoneyDisplay
                :model-value="loan.closing_balance"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </td>
            <td class="money-cell">
              <EcMoneyDisplay
                :model-value="loan.expected_closing_balance"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </td>
            <td class="money-cell">
              <EcMoneyDisplay
                :model-value="loan.current_balance"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </td>
          </tr>
          <tr v-if="(account.loans?.length ?? 0) > 0" class="equity-row">
            <th colspan="2" class="equity-label">Equity</th>
            <th class="money-cell">
              <EcMoneyDisplay
                :model-value="equityFor(account, 'closing_balance')"
                emphasis="subtotal"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </th>
            <th class="money-cell">
              <EcMoneyDisplay
                :model-value="equityFor(account, 'expected_closing_balance')"
                emphasis="subtotal"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </th>
            <th class="money-cell">
              <EcMoneyDisplay
                :model-value="equityFor(account, 'current_balance')"
                emphasis="subtotal"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </th>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <th colspan="2" class="total-label">Total</th>
          <th class="money-cell">
            <EcMoneyDisplay
              :model-value="totalClosingBalance"
              emphasis="total"
              highlight-mode="balance"
              :dash-if-zero="dashIfZero"
            />
          </th>
          <th class="money-cell">
            <EcMoneyDisplay
              :model-value="totalExpectedClosingBalance"
              emphasis="total"
              highlight-mode="balance"
              :dash-if-zero="dashIfZero"
            />
          </th>
          <th class="money-cell">
            <EcMoneyDisplay
              :model-value="totalCurrentBalance"
              emphasis="total"
              highlight-mode="balance"
              :dash-if-zero="dashIfZero"
            />
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '../shared/util/formatDate';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import type { AccountBalanceData } from './accountBalance.types';

const props = defineProps<{
  heading: string;
  accounts: AccountBalanceData[];
  dashIfZero?: boolean;
}>();

const firstAccount = computed(() => props.accounts[0] ?? null);

const closingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.closing_date) : '',
);

const nextClosingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.next_closing_date) : '',
);

type BalanceField = 'closing_balance' | 'expected_closing_balance' | 'current_balance';

function equityFor(account: AccountBalanceData, field: BalanceField): number {
  const loanTotal = (account.loans ?? []).reduce((sum, l) => sum + l[field], 0);
  return account[field] + loanTotal;
}

const flattenedAccounts = computed<AccountBalanceData[]>(() =>
  props.accounts.flatMap((a) => [a, ...(a.loans ?? [])]),
);

const totalClosingBalance = computed(() =>
  flattenedAccounts.value.reduce((sum, a) => sum + a.closing_balance, 0),
);

const totalExpectedClosingBalance = computed(() =>
  flattenedAccounts.value.reduce((sum, a) => sum + a.expected_closing_balance, 0),
);

const totalCurrentBalance = computed(() =>
  flattenedAccounts.value.reduce((sum, a) => sum + a.current_balance, 0),
);
</script>

<style scoped>
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../shared/styles/budget-table.css';

.account-category-table {
  padding: 0.75rem 0 0;
}

.account-category-table .account-table {
  /* Table spans full card width; cells handle horizontal padding */
  width: 100%;
}

.account-table td:first-child,
.account-table th:first-child {
  padding-left: 1rem;
}

.account-table td:last-child,
.account-table th:last-child {
  padding-right: 1rem;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  padding: 0 1rem;
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

.loan-name {
  padding-left: 1.25rem;
}

.equity-row th {
  border-top: 1px dashed var(--p-surface-300);
  border-bottom: none;
  background-color: transparent;
}

.equity-row .equity-label {
  text-align: right;
  color: var(--p-text-muted-color);
  font-weight: 500;
}
</style>
