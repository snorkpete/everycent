<template>
  <div class="transaction-list">
    <table class="transactions-table">
        <thead>
          <tr>
            <th :class="['col-calculator', { 'col-calculator--active': showCalculatorColumn }]" />
            <th class="col-date">Date</th>
            <th class="col-description">Description</th>
            <th data-testid="allocation-header" class="col-allocation">{{ allocationHeaderName }}</th>
            <th class="col-money right">Withdrawn</th>
            <th class="col-money right">Deposited</th>
            <th class="col-paid">Paid</th>
            <th class="col-action" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(transaction, index) in store.draftTransactions"
            :key="transaction.id ?? `new-${index}`"
            data-testid="transaction-row"
            :class="{ 'transaction-row--deleted': transaction.deleted, 'transaction-row--newly-imported': transaction.newlyImported }"
          >
            <td :class="['col-calculator', { 'col-calculator--active': showCalculatorColumn }]">
              <Checkbox
                v-if="showCalculatorColumn"
                :model-value="false"
                binary
                :data-testid="`calculator-checkbox-${index}`"
                class="calculator-checkbox"
              />
            </td>
            <td class="col-date">
              <EcDateField
                label=""
                :edit-mode="store.isEditMode"
                :model-value="transaction.transaction_date ?? ''"
                @update:model-value="transaction.transaction_date = $event"
              />
            </td>
            <td :class="['col-description', wrapDescriptions ? 'col-description--wrap' : 'col-description--truncate']">
              <EcTextField
                label=""
                :edit-mode="store.isEditMode"
                :model-value="transaction.description ?? ''"
                @update:model-value="transaction.description = $event"
              />
            </td>
            <td class="col-allocation">
              <template v-if="store.selectedBankAccount?.is_sink_fund">
                <EcListField
                  label=""
                  :edit-mode="store.isEditMode"
                  :items="sinkFundAllocationItems"
                  :model-value="transaction.sink_fund_allocation_id ?? null"
                  @update:model-value="transaction.sink_fund_allocation_id = $event as number"
                />
              </template>
              <template v-else>
                <EcListField
                  label=""
                  :edit-mode="store.isEditMode"
                  :items="allocationItems"
                  group-by="allocation_category"
                  :model-value="transaction.allocation_id ?? null"
                  @update:model-value="store.onAllocationChange(transaction, $event as number)"
                />
              </template>
            </td>
            <td class="col-money right">
              <EcMoneyField
                label=""
                :edit-mode="store.isEditMode"
                :model-value="transaction.withdrawal_amount ?? 0"
                @update:model-value="transaction.withdrawal_amount = $event"
              />
            </td>
            <td class="col-money right">
              <EcMoneyField
                label=""
                :edit-mode="store.isEditMode"
                :model-value="transaction.deposit_amount ?? 0"
                @update:model-value="transaction.deposit_amount = $event"
              />
            </td>
            <td class="col-paid">
              <template v-if="store.isEditMode">
                <Checkbox
                  :model-value="transaction.status === 'paid'"
                  binary
                  @update:model-value="transaction.status = $event ? 'paid' : 'unpaid'"
                />
              </template>
              <template v-else>
                <i
                  v-if="transaction.status === 'paid'"
                  class="pi pi-check paid-icon"
                  data-testid="paid-icon"
                />
              </template>
            </td>
            <td class="col-action">
              <Button
                v-if="store.isEditMode"
                icon="pi pi-trash"
                severity="danger"
                text
                size="small"
                :data-testid="`delete-btn-${index}`"
                @click="store.deleteTransaction(transaction)"
              />
            </td>
          </tr>
        </tbody>
        <tfoot v-if="store.isEditMode">
          <tr>
            <td :colspan="8" class="table-footer">
              <Button
                label="Add New Transaction"
                severity="secondary"
                size="small"
                data-testid="add-btn"
                @click="store.addTransaction()"
              />
            </td>
          </tr>
        </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import { useTransactionStore } from './transactionStore';

const props = defineProps<{
  wrapDescriptions?: boolean;
  showCalculatorColumn?: boolean;
}>();

const store = useTransactionStore();

const allocationHeaderName = computed(() => {
  return store.selectedBankAccount?.is_sink_fund ? 'Sink Fund Allocation' : 'Allocation';
});

const allocationItems = computed((): ListItem[] =>
  store.allocations
    .filter((a) => a.id != null && a.name != null)
    .map((a) => ({ ...a, id: a.id!, name: a.name! })),
);

const sinkFundAllocationItems = computed((): ListItem[] =>
  store.sinkFundAllocations
    .filter((a) => a.id != null && a.name != null)
    .map((a) => ({ ...a, id: a.id!, name: a.name! })),
);
</script>

<style scoped>
.transaction-list {
  overflow: auto;
  flex: 1;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.transactions-table th,
.transactions-table td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--p-surface-200);
  font-size: 0.875rem;
}

.transactions-table th {
  font-weight: 600;
  text-align: left;
  background-color: var(--p-surface-50);
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid var(--p-surface-300);
}

.col-calculator { width: 0; min-width: 0; max-width: 0; padding: 0; overflow: hidden; }
.col-calculator--active { width: 28px; min-width: 28px; max-width: 28px; padding: 0 4px; overflow: visible; }
.col-date { width: 11%; }
.col-description { width: 26%; }
.col-allocation { width: 21%; }
.col-money { width: 10%; }
.col-paid { width: 6%; }
.col-action { width: 5%; }

.col-description--truncate :deep(.text-display) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.col-description--wrap :deep(.text-display) {
  white-space: normal;
  word-break: break-word;
}

.right {
  text-align: right;
}

.transactions-table tbody tr:nth-child(even) {
  background-color: var(--p-surface-50);
}

.transaction-row--deleted {
  opacity: 0.4;
  text-decoration: line-through;
}

.transaction-row--newly-imported .col-date {
  border-left: 3px solid var(--p-blue-300);
}

.paid-icon {
  color: var(--p-green-600);
  font-size: 0.875rem;
}

.calculator-checkbox {
  display: block;
}

.table-footer {
  padding: 0.5rem;
  text-align: left;
}
</style>
