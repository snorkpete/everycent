<template>
  <div class="transaction-list">
    <table class="transactions-table" :class="{ mobile: isMobile }">
      <thead>
        <tr>
          <th v-if="!isMobile" class="col-calculator" />
          <th class="col-date">Date</th>
          <th class="col-description">Description</th>
          <template v-if="isMobile">
            <th v-if="store.isEditMode" class="col-money right">W/D</th>
            <th v-if="store.isEditMode" class="col-money right">Dep</th>
            <th v-if="!store.isEditMode" class="col-money right">Amount</th>
          </template>
          <template v-else>
            <th data-testid="allocation-header" class="col-allocation">
              {{ allocationHeaderName }}
            </th>
            <th class="col-money right">Withdrawn</th>
            <th class="col-money right">Deposited</th>
            <th class="col-paid">Paid</th>
            <th class="col-auto">Auto</th>
          </template>
          <th v-if="!isMobile" class="col-action">
            <Button
              v-if="store.isEditMode"
              v-tooltip.top="allDeleted ? 'Restore all transactions' : 'Delete all transactions'"
              :icon="allDeleted ? 'pi pi-undo' : 'pi pi-trash'"
              :severity="allDeleted ? 'secondary' : 'danger'"
              text
              size="small"
              data-testid="delete-all-btn"
              @click="toggleDeleteAll"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="(transaction, index) in store.transactions"
          :key="transaction.id ?? `new-${index}`"
        >
          <!-- Main row -->
          <tr
            data-testid="transaction-row"
            :class="{
              'ec-deleted': transaction.deleted,
              'transaction-row--newly-imported': transaction.newlyImported,
            }"
          >
            <td v-if="!isMobile" class="col-calculator">
              <Checkbox
                v-if="showCalculatorColumn"
                :model-value="transaction.selected ?? false"
                binary
                :data-testid="`calculator-checkbox-${index}`"
                class="calculator-checkbox"
                @update:model-value="transaction.selected = $event"
              />
            </td>
            <td class="col-date">
              <template v-if="isMobile && !store.isEditMode">
                <span class="mobile-date-cell">
                  <i
                    class="pi mobile-chevron"
                    :class="
                      isRowExpanded(transaction.id ?? 0) ? 'pi-chevron-down' : 'pi-chevron-right'
                    "
                    @click.stop="toggleRowExpanded(transaction.id ?? 0)"
                  ></i>
                  <span>{{ formatShortDate(transaction.transaction_date) }}</span>
                </span>
              </template>
              <template v-else>
                <EcDateField
                  label=""
                  :edit-mode="store.isEditMode"
                  :model-value="transaction.transaction_date ?? ''"
                  @update:model-value="transaction.transaction_date = $event"
                />
              </template>
            </td>
            <td
              :class="[
                'col-description',
                wrapDescriptions ? 'col-description--wrap' : 'col-description--truncate',
              ]"
            >
              <EcTextField
                label=""
                :edit-mode="store.isEditMode"
                :model-value="transaction.description ?? ''"
                @update:model-value="transaction.description = $event"
              />
            </td>
            <template v-if="isMobile">
              <template v-if="store.isEditMode">
                <td class="col-money right">
                  <EcMoneyField
                    label=""
                    :edit-mode="true"
                    :dash-if-zero="dashIfZero"
                    :model-value="transaction.withdrawal_amount ?? 0"
                    @update:model-value="transaction.withdrawal_amount = $event"
                  />
                </td>
                <td class="col-money right">
                  <EcMoneyField
                    label=""
                    :edit-mode="true"
                    :dash-if-zero="dashIfZero"
                    :model-value="transaction.deposit_amount ?? 0"
                    @update:model-value="transaction.deposit_amount = $event"
                  />
                </td>
              </template>
              <td v-else class="col-money right">
                <EcMoneyDisplay
                  :model-value="netAmount(transaction)"
                  :dash-if-zero="dashIfZero"
                  highlight-mode="balance"
                />
              </td>
            </template>
            <template v-else>
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
                  <div class="allocation-cell" :class="autoAllocationClass(transaction)">
                    <i
                      v-if="transaction.auto_match_type"
                      v-tooltip.top="`Auto-matched (${transaction.auto_match_type})`"
                      :class="
                        transaction.auto_match_type === 'exact'
                          ? 'pi pi-check-circle'
                          : 'pi pi-question-circle'
                      "
                      class="auto-indicator"
                    />
                    <EcListField
                      label=""
                      :edit-mode="store.isEditMode"
                      :items="allocationItems"
                      group-by="allocation_category"
                      filterable
                      :model-value="transaction.allocation_id ?? null"
                      @update:model-value="store.onAllocationChange(transaction, $event as number)"
                    />
                  </div>
                </template>
              </td>
              <td class="col-money right">
                <EcMoneyField
                  label=""
                  :edit-mode="store.isEditMode"
                  :dash-if-zero="dashIfZero"
                  :model-value="transaction.withdrawal_amount ?? 0"
                  @update:model-value="transaction.withdrawal_amount = $event"
                />
              </td>
              <td class="col-money right">
                <EcMoneyField
                  label=""
                  :edit-mode="store.isEditMode"
                  :dash-if-zero="dashIfZero"
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
              <td class="col-auto">
                <i
                  v-if="transaction.camt_imported"
                  class="pi pi-check paid-icon"
                  data-testid="auto-icon"
                />
              </td>
            </template>
            <td v-if="!isMobile" class="col-action">
              <EcDeleteButton
                v-if="store.isEditMode"
                :deleted="transaction.deleted"
                item-label="transaction"
                :test-id-prefix="`transaction-${index}`"
                @toggle="
                  transaction.deleted
                    ? store.undoDeleteTransaction(transaction)
                    : store.deleteTransaction(transaction)
                "
              />
            </td>
          </tr>

          <!-- Mobile detail row (expandable) -->
          <tr
            v-if="isMobile && !store.isEditMode && isRowExpanded(transaction.id ?? 0)"
            class="mobile-detail-row"
          >
            <td :colspan="3">
              <div class="mobile-detail-grid">
                <span class="mobile-detail-item">
                  <span class="mobile-detail-label">Withdrawn</span>
                  <EcMoneyDisplay
                    :model-value="transaction.withdrawal_amount ?? 0"
                    :dash-if-zero="dashIfZero"
                    highlight-mode="none"
                  />
                </span>
                <span class="mobile-detail-item">
                  <span class="mobile-detail-label">Deposited</span>
                  <EcMoneyDisplay
                    :model-value="transaction.deposit_amount ?? 0"
                    :dash-if-zero="dashIfZero"
                    highlight-mode="none"
                  />
                </span>
                <span class="mobile-detail-item">
                  <span class="mobile-detail-label">Allocation</span>
                  <span class="mobile-detail-value">{{ allocationName(transaction) }}</span>
                </span>
                <span class="mobile-detail-item">
                  <span class="mobile-detail-label">Status</span>
                  <span class="mobile-detail-value">
                    <i
                      v-if="transaction.status === 'paid'"
                      class="pi pi-check paid-icon"
                    />
                    <span v-else>Unpaid</span>
                  </span>
                </span>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot v-if="store.isEditMode">
        <tr>
          <td :colspan="isMobile ? 4 : 9" class="table-footer">
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
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import { useResponsive } from '../shared/composables/useResponsive';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import type { TransactionData } from './transaction.types';
import { useTransactionStore } from './transactionStore';

const { dashIfZero = false } = defineProps<{
  wrapDescriptions?: boolean;
  showCalculatorColumn?: boolean;
  dashIfZero?: boolean;
}>();

const { isMobile } = useResponsive();
const store = useTransactionStore();

const expandedRows = ref(new Set<number>());

function toggleRowExpanded(id: number) {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id);
  } else {
    expandedRows.value.add(id);
  }
}

function isRowExpanded(id: number): boolean {
  return expandedRows.value.has(id);
}

function formatShortDate(date: string | null | undefined): string {
  if (!date) return '';
  // Input is YYYY-MM-DD — show as DD/MM
  const parts = date.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return date;
}

function netAmount(transaction: TransactionData): number {
  return (transaction.deposit_amount ?? 0) - (transaction.withdrawal_amount ?? 0);
}

function allocationName(transaction: TransactionData): string {
  if (store.selectedBankAccount?.is_sink_fund) {
    const alloc = store.sinkFundAllocations.find(
      (a) => a.id === transaction.sink_fund_allocation_id,
    );
    return alloc?.name ?? '—';
  }
  const alloc = store.allocations.find((a) => a.id === transaction.allocation_id);
  return alloc?.name ?? '—';
}

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

const allDeleted = computed(
  () => store.transactions.length > 0 && store.transactions.every((t) => t.deleted),
);

function toggleDeleteAll() {
  const newState = !allDeleted.value;
  store.transactions.forEach((t) => {
    t.deleted = newState;
  });
}

function autoAllocationClass(transaction: TransactionData) {
  if (!transaction.auto_match_type) return {};
  return {
    'allocation-cell--exact': transaction.auto_match_type === 'exact',
    'allocation-cell--contains': transaction.auto_match_type === 'contains',
  };
}
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

.col-calculator {
  width: 2.5%;
  padding: 0 2px;
}
.col-date {
  width: 10%;
}
.col-description {
  width: 26.5%;
}
.col-allocation {
  width: 22%;
  overflow: hidden;
}
.col-money {
  width: 10%;
}
.col-paid {
  width: 4%;
  text-align: center;
}
.col-auto {
  width: 4%;
  text-align: center;
}
.col-action {
  width: 3.5%;
}

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

/* ── Auto-allocation indicators ── */
.allocation-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.auto-indicator {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.allocation-cell--exact .auto-indicator {
  color: var(--p-green-700);
}

.allocation-cell--contains .auto-indicator {
  color: var(--p-amber-700);
}

/* ── Mobile table ── */
.transactions-table.mobile th,
.transactions-table.mobile td {
  padding: 0.35rem 0.4rem;
  font-size: 0.8rem;
}

.transactions-table.mobile .col-date {
  width: 20%;
  white-space: nowrap;
}

.transactions-table.mobile .col-description {
  width: auto;
  white-space: normal;
  word-break: break-word;
}

.transactions-table.mobile .col-money {
  width: 22%;
  white-space: nowrap;
}

.transactions-table.mobile td:last-child,
.transactions-table.mobile th:last-child {
  padding-right: 0.75rem;
}

/* ── Mobile date cell with chevron ── */
.mobile-date-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mobile-chevron {
  font-size: 0.65rem;
  color: var(--p-text-muted-color);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0.2rem;
}

/* ── Mobile detail row ── */
.mobile-detail-row td {
  padding: 0.3rem 0.5rem 0.4rem 1.5rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
}

.mobile-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1rem;
  font-size: 0.75rem;
}

.mobile-detail-item {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.mobile-detail-label {
  color: var(--p-text-muted-color);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.03em;
}

.mobile-detail-value {
  font-size: 0.8rem;
}
</style>
