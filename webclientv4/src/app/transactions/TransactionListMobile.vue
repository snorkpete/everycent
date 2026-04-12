<template>
  <div class="mobile-transaction-list">
    <div v-if="store.transactions.length === 0" class="empty-state" data-testid="empty-state">
      {{
        store.isEditMode
          ? 'No transactions yet. Tap + to add one.'
          : 'No transactions to display.'
      }}
    </div>

    <ul v-else class="cards-list">
      <li
        v-for="(transaction, index) in store.transactions"
        :key="transaction.id ?? `new-${index}`"
        class="transaction-card"
        :class="{
          'ec-deleted': transaction.deleted,
          'transaction-card--newly-imported': transaction.newlyImported,
        }"
        data-testid="transaction-card"
        @click="onCardClick(transaction, index)"
      >
        <div class="card-main">
          <i
            v-if="!store.isEditMode"
            class="pi card-chevron"
            :class="
              isExpanded(keyFor(transaction, index)) ? 'pi-chevron-down' : 'pi-chevron-right'
            "
          ></i>
          <span class="card-date">
            <template v-if="store.isEditMode">
              <EcDateField
                label=""
                :edit-mode="true"
                :model-value="transaction.transaction_date ?? ''"
                @update:model-value="transaction.transaction_date = $event"
                @click.stop
              />
            </template>
            <template v-else>
              {{ formatShortDate(transaction.transaction_date) }}
            </template>
          </span>
          <span class="card-description">
            <EcTextField
              v-if="store.isEditMode"
              label=""
              :edit-mode="true"
              :model-value="transaction.description ?? ''"
              @update:model-value="transaction.description = $event"
              @click.stop
            />
            <span v-else class="description-text">{{ transaction.description }}</span>
          </span>
          <span class="card-amount">
            <EcMoneyDisplay
              :model-value="netAmount(transaction)"
              :dash-if-zero="dashIfZero"
              highlight-mode="balance"
            />
          </span>
        </div>

        <!-- Edit mode: allocation row + deposit field + delete -->
        <div
          v-if="store.isEditMode"
          class="card-edit-detail"
          data-testid="card-edit-detail"
          @click.stop
        >
          <div class="edit-row">
            <div class="edit-amounts">
              <div class="edit-field">
                <span class="edit-label">Withdrawn</span>
                <EcMoneyField
                  label=""
                  :edit-mode="true"
                  :dash-if-zero="dashIfZero"
                  :model-value="transaction.withdrawal_amount ?? 0"
                  @update:model-value="transaction.withdrawal_amount = $event"
                />
              </div>
              <div class="edit-field">
                <span class="edit-label">Deposited</span>
                <EcMoneyField
                  label=""
                  :edit-mode="true"
                  :dash-if-zero="dashIfZero"
                  :model-value="transaction.deposit_amount ?? 0"
                  @update:model-value="transaction.deposit_amount = $event"
                />
              </div>
            </div>
            <div class="edit-field edit-field--allocation">
              <span class="edit-label">Allocation</span>
              <template v-if="store.selectedBankAccount?.is_sink_fund">
                <EcListField
                  label=""
                  :edit-mode="true"
                  :items="sinkFundAllocationItems"
                  :model-value="transaction.sink_fund_allocation_id ?? null"
                  @update:model-value="transaction.sink_fund_allocation_id = $event as number"
                />
              </template>
              <template v-else>
                <EcListField
                  label=""
                  :edit-mode="true"
                  :items="allocationItems"
                  group-by="allocation_category"
                  filterable
                  :model-value="transaction.allocation_id ?? null"
                  @update:model-value="store.onAllocationChange(transaction, $event as number)"
                />
              </template>
            </div>
          </div>
          <div class="edit-actions">
            <EcDeleteButton
              :deleted="transaction.deleted"
              item-label="transaction"
              :test-id-prefix="`transaction-${index}`"
              @toggle="
                transaction.deleted
                  ? store.undoDeleteTransaction(transaction)
                  : store.deleteTransaction(transaction)
              "
            />
          </div>
        </div>

        <!-- View mode: expanded detail -->
        <div
          v-if="!store.isEditMode && isExpanded(keyFor(transaction, index))"
          class="card-detail"
          data-testid="card-detail"
          @click.stop
        >
          <div class="detail-grid">
            <span class="detail-item" data-testid="detail-withdrawn">
              <span class="detail-label">Withdrawn</span>
              <EcMoneyDisplay
                :model-value="transaction.withdrawal_amount ?? 0"
                :dash-if-zero="dashIfZero"
                highlight-mode="none"
              />
            </span>
            <span class="detail-item" data-testid="detail-deposited">
              <span class="detail-label">Deposited</span>
              <EcMoneyDisplay
                :model-value="transaction.deposit_amount ?? 0"
                :dash-if-zero="dashIfZero"
                highlight-mode="none"
              />
            </span>
            <span class="detail-item" data-testid="detail-allocation">
              <span class="detail-label">Allocation</span>
              <span class="detail-value">{{ allocationName(transaction) }}</span>
            </span>
            <span class="detail-item" data-testid="detail-status">
              <span class="detail-label">Status</span>
              <span class="detail-value">
                <i v-if="transaction.status === 'paid'" class="pi pi-check paid-icon" />
                <span v-else>Unpaid</span>
              </span>
            </span>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="store.isEditMode" class="list-footer" data-testid="list-footer">
      <Button
        label="Add New Transaction"
        severity="secondary"
        size="small"
        data-testid="add-btn"
        @click="store.addTransaction()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import type { TransactionData } from './transaction.types';
import { useTransactionStore } from './transactionStore';

defineProps<{
  dashIfZero?: boolean;
}>();

const store = useTransactionStore();

const expandedKey = ref<number | null>(null);

function keyFor(transaction: TransactionData, index: number): number {
  return transaction.id ?? -(index + 1);
}

function isExpanded(key: number): boolean {
  return expandedKey.value === key;
}

function toggleExpanded(key: number): void {
  expandedKey.value = expandedKey.value === key ? null : key;
}

function onCardClick(transaction: TransactionData, index: number): void {
  if (!store.isEditMode) {
    toggleExpanded(keyFor(transaction, index));
  }
}

function formatShortDate(date: string | null | undefined): string {
  if (!date) return '';
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
    return alloc?.name ?? '\u2014';
  }
  const alloc = store.allocations.find((a) => a.id === transaction.allocation_id);
  return alloc?.name ?? '\u2014';
}

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
.mobile-transaction-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.cards-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.transaction-card {
  border-bottom: 1px solid var(--p-surface-200);
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  user-select: none;
}

.transaction-card:active {
  background-color: var(--p-surface-100);
}

.transaction-card--newly-imported {
  border-left: 3px solid var(--p-blue-300);
  padding-left: calc(0.75rem - 3px);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-chevron {
  color: var(--p-text-muted-color);
  font-size: 0.65rem;
  flex-shrink: 0;
  padding: 0.2rem;
}

.card-date {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  min-width: 3rem;
}

.card-description {
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.card-amount {
  flex-shrink: 0;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.85rem;
}

/* ---- View-mode expanded detail ---- */
.card-detail {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--p-surface-300);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.detail-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.detail-value {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paid-icon {
  color: var(--p-green-600);
  font-size: 0.875rem;
}

/* ---- Edit-mode detail ---- */
.card-edit-detail {
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px dashed var(--p-surface-300);
}

.edit-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.edit-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.edit-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.edit-field--allocation :deep(.ec-list-field),
.edit-field--allocation :deep(.p-select) {
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

/* ---- Footer ---- */
.list-footer {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--p-surface-300);
  flex-shrink: 0;
}
</style>
