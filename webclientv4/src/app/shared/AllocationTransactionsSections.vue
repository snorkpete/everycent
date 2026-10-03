<template>
  <div class="sections">
    <section
      v-for="section in sections"
      :key="section.allocation.id"
      class="transactions-section"
      data-testid="transactions-section"
    >
      <h4 class="section-heading" data-testid="section-heading">
        {{ section.allocation.label ?? section.allocation.name }}
      </h4>
      <table
        v-if="section.transactions.length > 0"
        class="transactions-table"
        data-testid="transactions-table"
      >
        <thead>
          <tr>
            <th class="date-col">Date</th>
            <th class="description-col">Description</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in section.transactions"
            :key="transaction.id"
            data-testid="transaction-row"
          >
            <td>{{ formatDate(transaction.transaction_date ?? '') }}</td>
            <td>{{ transaction.description }}</td>
            <td class="amount-col">
              <EcMoneyDisplay :model-value="transaction.net_amount ?? 0" highlight-mode="none" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="subtotal-row" data-testid="subtotal-row">
            <td colspan="2">Subtotal</td>
            <td class="amount-col">
              <EcMoneyDisplay
                :model-value="sumOf(section.transactions)"
                highlight-mode="none"
                emphasis="subtotal"
              />
            </td>
          </tr>
        </tfoot>
      </table>
      <div v-else class="section-empty" data-testid="section-empty">No transactions found.</div>
    </section>

    <div v-if="sections.length > 1" class="grand-total-row" data-testid="grand-total-row">
      <span>Total</span>
      <EcMoneyDisplay :model-value="grandTotal" highlight-mode="none" emphasis="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from './util/formatDate';
import EcMoneyDisplay from './form/money-field/EcMoneyDisplay.vue';
import type { AllocationTransactionSection } from './allocationTransactions.types';
import type { TransactionData } from '../transactions/transaction.types';

const { sections } = defineProps<{
  sections: AllocationTransactionSection[];
}>();

function sumOf(transactions: TransactionData[]): number {
  return transactions.reduce((sum, transaction) => sum + (transaction.net_amount ?? 0), 0);
}

const grandTotal = computed(() =>
  sections.reduce((sum, section) => sum + sumOf(section.transactions), 0),
);
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
}

.subtotal-row {
  font-weight: 600;
}

.subtotal-row td {
  border-bottom: none;
}

.section-heading {
  margin: 0.75rem 0 0.25rem;
  font-size: 0.95rem;
}

.section-empty {
  padding: 0.5rem 0.75rem;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.grand-total-row {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  font-weight: 600;
  background-color: var(--p-surface-0);
  border-top: 2px solid var(--p-surface-400);
}
</style>
