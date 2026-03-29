<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    modal
    :closable="true"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="loading" class="loading-state" data-testid="loading-state">
      Loading transactions...
    </div>

    <div v-else-if="error" class="error-state" data-testid="error-state">
      Failed to load transactions.
    </div>

    <div v-else-if="transactions.length === 0" class="empty-state" data-testid="empty-state">
      No transactions found for this allocation.
    </div>

    <div v-else class="transactions-content">
      <table class="transactions-table" data-testid="transactions-table">
        <thead>
          <tr>
            <th class="date-col">Date</th>
            <th class="description-col">Description</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
            data-testid="transaction-row"
          >
            <td>{{ formatDate(transaction.transaction_date ?? '') }}</td>
            <td>{{ transaction.description }}</td>
            <td class="amount-cell">{{ centsToDollars(transaction.net_amount ?? 0) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row" data-testid="total-row">
            <td colspan="2">Total</td>
            <td class="amount-cell">{{ centsToDollars(total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import { centsToDollars } from './util/cents-to-dollars';
import { formatDate } from './util/format-date';
import type { TransactionData } from '../transactions/transaction.types';

const props = defineProps<{
  visible: boolean;
  allocationId: number;
  allocationName: string;
  fetchTransactions: (id: number) => Promise<TransactionData[]>;
}>();

defineEmits<{
  'update:visible': [value: boolean];
}>();

const transactions = ref<TransactionData[]>([]);
const loading = ref(false);
const error = ref(false);

const dialogTitle = computed(() => `Transactions for ${props.allocationName}`);

const total = computed(() => transactions.value.reduce((sum, t) => sum + (t.net_amount ?? 0), 0));

watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible && props.allocationId) {
      loading.value = true;
      transactions.value = [];
      error.value = false;
      try {
        transactions.value = await props.fetchTransactions(props.allocationId);
      } catch {
        error.value = true;
      } finally {
        loading.value = false;
      }
    }
  },
);
</script>

<style scoped>
.transactions-content {
  max-height: 60vh;
  overflow: auto;
}

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

.amount-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.total-row {
  font-weight: 600;
  border-top: 2px solid var(--p-surface-400);
}

.total-row td {
  border-bottom: none;
}

.loading-state,
.empty-state,
.error-state {
  padding: 1.5rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.error-state {
  color: var(--p-red-500);
}
</style>
