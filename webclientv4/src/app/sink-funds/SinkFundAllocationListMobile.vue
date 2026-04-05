<template>
  <div class="mobile-allocation-list">
    <div class="summary-strip" data-testid="summary-strip">
      <div class="summary-cell" data-testid="summary-cell-balance">
        <span class="summary-label">Account Balance</span>
        <EcMoneyDisplay
          :model-value="store.sinkFund?.current_balance ?? 0"
          highlight-mode="none"
          :dash-if-zero="dashIfZero"
        />
      </div>
      <div class="summary-cell" data-testid="summary-cell-unassigned">
        <span class="summary-label">Unassigned</span>
        <EcMoneyDisplay
          :model-value="store.unassignedBalance"
          highlight-mode="balance"
          :dash-if-zero="dashIfZero"
        />
      </div>
    </div>

    <div v-if="store.visibleAllocations.length === 0" class="empty-state" data-testid="empty-state">
      {{
        store.isEditMode
          ? 'No obligations yet. Tap + to add one.'
          : 'No obligations yet. Tap Edit to add one.'
      }}
    </div>

    <ul v-else class="cards-list">
      <li
        v-for="(allocation, index) in store.visibleAllocations"
        :key="keyFor(allocation, index)"
        class="obligation-card"
        :class="{
          'obligation-card--closed': allocation.status === 'closed',
          'obligation-card--unsaved': allocation.unsaved,
          'ec-deleted': allocation.deleted,
        }"
        data-testid="obligation-card"
        @click="toggleExpanded(keyFor(allocation, index))"
      >
        <div class="card-main">
          <i
            class="pi card-chevron"
            :class="isExpanded(keyFor(allocation, index)) ? 'pi-chevron-down' : 'pi-chevron-right'"
          ></i>
          <input
            v-if="store.isEditMode"
            v-model="allocation.name"
            type="text"
            class="p-inputtext card-name-input"
            data-testid="allocation-name-input"
            @click.stop
          />
          <span v-else class="card-name" data-testid="card-name">{{ allocation.name }}</span>
          <span class="card-balance" data-testid="card-balance">
            <EcMoneyDisplay
              :model-value="allocation.current_balance ?? 0"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </span>
        </div>

        <!-- @click.stop prevents interactions inside the expanded detail (editable fields,
             action buttons) from bubbling up to the <li> and collapsing the card. -->
        <div
          v-if="isExpanded(keyFor(allocation, index))"
          class="card-detail"
          data-testid="card-detail"
          @click.stop
        >
          <div class="detail-grid">
            <span class="detail-item" data-testid="detail-target">
              <span class="detail-label">Target</span>
              <EcMoneyField
                v-if="store.isEditMode"
                v-model="allocation.target"
                label=""
                :edit-mode="true"
                data-testid="allocation-target-input"
              />
              <EcMoneyDisplay
                v-else
                :model-value="allocation.target ?? 0"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </span>
            <span class="detail-item" data-testid="detail-outstanding">
              <span class="detail-label">Outstanding</span>
              <EcMoneyDisplay
                :model-value="outstanding(allocation)"
                highlight-mode="balance"
                :dash-if-zero="dashIfZero"
              />
            </span>
            <span class="detail-item" data-testid="detail-status">
              <span class="detail-label">Status</span>
              <span class="detail-value">{{ allocation.status }}</span>
            </span>
            <span class="detail-item" data-testid="detail-comment">
              <span class="detail-label">Comment</span>
              <input
                v-if="store.isEditMode"
                v-model="allocation.comment"
                type="text"
                class="p-inputtext"
                data-testid="allocation-comment-input"
              />
              <span v-else class="detail-value">{{ allocation.comment || '—' }}</span>
            </span>
          </div>
          <div v-if="store.isEditMode" class="edit-actions">
            <EcDeleteButton
              :deleted="allocation.deleted"
              item-label="obligation"
              test-id-prefix="obligation"
              @toggle="toggleDeleted(allocation)"
            />
            <button
              v-if="allocation.status === 'open'"
              type="button"
              class="status-btn"
              data-testid="deactivate-btn"
              @click="toggleStatus(allocation)"
            >
              <i class="pi pi-ban"></i>
              <span>Close</span>
            </button>
            <button
              v-else
              type="button"
              class="status-btn status-btn--reactivate"
              data-testid="reactivate-btn"
              @click="toggleStatus(allocation)"
            >
              <i class="pi pi-check-circle"></i>
              <span>Reopen</span>
            </button>
          </div>
          <Button
            v-else
            label="View Transactions"
            icon="pi pi-eye"
            outlined
            size="small"
            class="view-transactions-btn"
            data-testid="view-transactions-btn"
            @click.stop="onViewTransactions(allocation)"
          />
        </div>
      </li>
    </ul>

    <div class="totals-footer" data-testid="totals-footer">
      <span class="totals-label">Total</span>
      <EcMoneyDisplay
        :model-value="store.totalAssignedBalance"
        highlight-mode="none"
        :dash-if-zero="dashIfZero"
      />
    </div>

    <AllocationTransactionsDialog
      :visible="dialogVisible"
      :allocation-id="selectedAllocationId"
      :allocation-name="selectedAllocationName"
      :fetch-transactions="sinkFundApi.getTransactionsForAllocation"
      @update:visible="dialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { useSinkFundStore } from './sinkFundStore';
import { sinkFundApi } from './sinkFundApi';
import type { SinkFundAllocationData } from './sinkFund.types';

defineProps<{
  dashIfZero: boolean;
}>();

const store = useSinkFundStore();

const expandedId = ref<number | null>(null);
const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

function keyFor(allocation: SinkFundAllocationData, index: number): number {
  return allocation.id ?? -(index + 1);
}

// Auto-expand a newly added obligation so the user can fill it in immediately.
watch(
  () => store.visibleAllocations.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      const lastIndex = newLen - 1;
      const lastAllocation = store.visibleAllocations[lastIndex];
      if (lastAllocation?.unsaved) {
        expandedId.value = keyFor(lastAllocation, lastIndex);
      }
    }
  },
);

function isExpanded(key: number): boolean {
  return expandedId.value === key;
}

function toggleExpanded(key: number): void {
  expandedId.value = expandedId.value === key ? null : key;
}

function outstanding(allocation: SinkFundAllocationData): number {
  const target = allocation.target ?? 0;
  if (target === 0) return 0;
  return (allocation.current_balance ?? 0) - target;
}

function onViewTransactions(allocation: SinkFundAllocationData): void {
  selectedAllocationId.value = allocation.id ?? 0;
  selectedAllocationName.value = allocation.name ?? '';
  dialogVisible.value = true;
}

function toggleDeleted(allocation: SinkFundAllocationData): void {
  allocation.deleted = !allocation.deleted;
}

function toggleStatus(allocation: SinkFundAllocationData): void {
  allocation.status = allocation.status === 'open' ? 'closed' : 'open';
}
</script>

<style scoped>
.mobile-allocation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.summary-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-300);
  flex-shrink: 0;
}

.summary-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.cards-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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

.obligation-card {
  border-bottom: 1px solid var(--p-surface-200);
  padding: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.obligation-card:active {
  background-color: var(--p-surface-100);
}

.obligation-card--closed {
  opacity: 0.55;
}

.obligation-card--unsaved {
  border-left: 3px solid var(--p-primary-400);
  padding-left: calc(0.75rem - 3px);
  background-color: var(--p-primary-50);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-chevron {
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.card-name {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-name-input {
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.card-balance {
  font-weight: 600;
  white-space: nowrap;
}

.card-detail {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--p-surface-300);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  margin-bottom: 0.75rem;
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
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-transactions-btn {
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: none;
  border: 1px solid var(--p-surface-300);
  border-radius: 4px;
  color: var(--p-text-muted-color);
  font-size: 0.8rem;
  cursor: pointer;
}

.status-btn:hover {
  border-color: var(--p-red-400);
  color: var(--p-red-600);
}

.status-btn--reactivate:hover {
  border-color: var(--p-green-400);
  color: var(--p-green-600);
}

.totals-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border-top: 1px solid var(--p-surface-300);
  font-weight: 700;
  flex-shrink: 0;
}

.totals-label {
  font-size: 0.875rem;
}
</style>
