<template>
  <div class="transaction-list">
    <div class="table-wrapper">
      <table class="transactions-table">
        <thead>
          <tr>
            <th class="col-date">Date</th>
            <th class="col-description">Description</th>
            <th data-testid="allocation-header" class="col-allocation">{{ allocationHeaderName }}</th>
            <th class="col-money right">Withdrawn</th>
            <th class="col-money right">Deposited</th>
            <th class="col-paid">Paid?</th>
            <th class="col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(transaction, index) in localTransactions"
            :key="transaction.id ?? `new-${index}`"
            data-testid="transaction-row"
            :class="{ 'transaction-row--deleted': transaction.deleted }"
          >
            <td class="col-date">
              <EcDateField
                label=""
                :edit-mode="isEditMode"
                :model-value="transaction.transaction_date ?? ''"
                @update:model-value="transaction.transaction_date = $event"
              />
            </td>
            <td class="col-description">
              <EcTextField
                label=""
                :edit-mode="isEditMode"
                :model-value="transaction.description ?? ''"
                @update:model-value="transaction.description = $event"
              />
            </td>
            <td class="col-allocation">
              <template v-if="bankAccount?.is_sink_fund">
                <EcListField
                  label=""
                  :edit-mode="isEditMode"
                  :items="sinkFundAllocationItems"
                  :model-value="transaction.sink_fund_allocation_id ?? null"
                  @update:model-value="transaction.sink_fund_allocation_id = $event as number"
                />
              </template>
              <template v-else>
                <EcListField
                  label=""
                  :edit-mode="isEditMode"
                  :items="allocationItems"
                  group-by="allocation_category"
                  :model-value="transaction.allocation_id ?? null"
                  @update:model-value="onAllocationChange(transaction, $event as number)"
                />
              </template>
            </td>
            <td class="col-money right">
              <EcMoneyField
                label=""
                :edit-mode="isEditMode"
                :model-value="transaction.withdrawal_amount ?? 0"
                @update:model-value="transaction.withdrawal_amount = $event"
              />
            </td>
            <td class="col-money right">
              <EcMoneyField
                label=""
                :edit-mode="isEditMode"
                :model-value="transaction.deposit_amount ?? 0"
                @update:model-value="transaction.deposit_amount = $event"
              />
            </td>
            <td class="col-paid">
              <template v-if="isEditMode">
                <Checkbox
                  :model-value="transaction.status === 'paid'"
                  binary
                  @update:model-value="transaction.status = $event ? 'paid' : 'unpaid'"
                />
              </template>
              <template v-else>
                <span>{{ transaction.status === 'paid' ? 'Yes' : 'No' }}</span>
              </template>
            </td>
            <td class="col-action">
              <Button
                v-if="isEditMode"
                icon="pi pi-trash"
                severity="danger"
                text
                size="small"
                :data-testid="`delete-btn-${index}`"
                @click="deleteTransaction(transaction)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="list-actions">
      <template v-if="!isEditMode">
        <Button
          label="Edit"
          data-testid="edit-btn"
          @click="enterEditMode"
        />
      </template>
      <template v-else>
        <Button
          label="Save"
          data-testid="save-btn"
          @click="onSave"
        />
        <Button
          label="Cancel"
          severity="secondary"
          data-testid="cancel-btn"
          @click="onCancel"
        />
        <Button
          label="Add New Transaction"
          severity="secondary"
          data-testid="add-btn"
          @click="addTransaction"
        />
        <Button
          label="Import"
          severity="secondary"
          disabled
          data-testid="import-btn"
        />
        <Button
          label="Transfer"
          severity="secondary"
          disabled
          data-testid="transfer-btn"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import type { TransactionData, AllocationData, SinkFundAllocationData, BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const props = defineProps<{
  transactions: TransactionData[];
  allocations: AllocationData[];
  sinkFundAllocations: SinkFundAllocationData[];
  bankAccount?: BankAccountData;
  budget?: BudgetData;
}>();

const emit = defineEmits<{
  save: [transactions: TransactionData[]];
  cancel: [];
}>();

const isEditMode = ref(false);
const localTransactions = ref<TransactionData[]>(structuredClone(props.transactions));

watch(
  () => props.transactions,
  (newTransactions) => {
    localTransactions.value = structuredClone(newTransactions);
  },
);

const allocationHeaderName = computed(() => {
  return props.bankAccount?.is_sink_fund ? 'Sink Fund Allocation' : 'Allocation';
});

const allocationItems = computed((): ListItem[] =>
  props.allocations
    .filter((a): a is AllocationData & { id: number; name: string } => a.id != null && a.name != null)
    .map((a) => ({ ...a, id: a.id, name: a.name })),
);

const sinkFundAllocationItems = computed((): ListItem[] =>
  props.sinkFundAllocations
    .filter((a): a is SinkFundAllocationData & { id: number; name: string } => a.id != null && a.name != null)
    .map((a) => ({ ...a, id: a.id, name: a.name })),
);

function enterEditMode() {
  isEditMode.value = true;
}

function addTransaction() {
  const status = props.bankAccount?.is_credit_card ? 'unpaid' : 'paid';
  localTransactions.value.push({
    withdrawal_amount: 0,
    deposit_amount: 0,
    status,
  });
}

function deleteTransaction(transaction: TransactionData) {
  transaction.deleted = true;
}

function onAllocationChange(transaction: TransactionData, allocationId: number) {
  transaction.allocation_id = allocationId;
  if (allocationId > 0) {
    transaction.status = 'paid';
  } else {
    transaction.status = 'unpaid';
  }
}

function onSave() {
  isEditMode.value = false;
  emit('save', localTransactions.value);
}

function onCancel() {
  isEditMode.value = false;
  emit('cancel');
}
</script>

<style scoped>
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
}

.table-wrapper {
  overflow: auto;
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
}

.col-date { width: 12%; }
.col-description { width: 28%; }
.col-allocation { width: 22%; }
.col-money { width: 10%; }
.col-paid { width: 7%; }
.col-action { width: 6%; }

.right {
  text-align: right;
}

.transaction-row--deleted {
  opacity: 0.4;
  text-decoration: line-through;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
