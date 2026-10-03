<template>
  <table class="transactions-table" data-testid="transactions-table">
    <thead>
      <tr>
        <th class="date-col">Date</th>
        <th class="description-col">Description</th>
        <th class="amount-col">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="transaction in transactions" :key="transaction.id" data-testid="transaction-row">
        <td>{{ formatDate(transaction.transaction_date ?? '') }}</td>
        <td>{{ transaction.description }}</td>
        <td class="amount-col">
          <EcMoneyDisplay :model-value="transaction.net_amount ?? 0" highlight-mode="none" />
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row" data-testid="total-row">
        <td colspan="2">Total</td>
        <td class="amount-col">
          <EcMoneyDisplay :model-value="total" highlight-mode="none" emphasis="total" />
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from './util/formatDate';
import EcMoneyDisplay from './form/money-field/EcMoneyDisplay.vue';
import type { TransactionData } from '../transactions/transaction.types';

const { transactions } = defineProps<{
  transactions: TransactionData[];
}>();

const total = computed(() => transactions.reduce((sum, t) => sum + (t.net_amount ?? 0), 0));
</script>

<style scoped>
.transactions-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.transactions-table th,
.transactions-table td {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.date-col {
  width: 25%;
  white-space: nowrap;
}

.amount-col {
  width: 25%;
  white-space: nowrap;
  text-align: right;
}

.description-col {
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transactions-table thead th {
  font-weight: 600;
  background-color: var(--p-surface-50);
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 1;
}

.transactions-table tfoot td {
  position: sticky;
  bottom: 0;
  background-color: var(--p-surface-0);
}

.total-row {
  font-weight: 600;
  border-top: 2px solid var(--p-surface-400);
}

.total-row td {
  border-bottom: none;
}
</style>
