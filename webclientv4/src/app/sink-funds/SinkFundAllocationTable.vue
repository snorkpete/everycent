<template>
  <div class="allocation-list">
    <table class="allocations-table" data-testid="allocations-table">
      <thead>
        <tr>
          <th class="name-col">Name</th>
          <th class="balance-col">Current Balance</th>
          <th class="target-col">Target</th>
          <th class="outstanding-col">Outstanding</th>
          <th class="comment-col">Comment</th>
          <th class="status-col">Status</th>
          <th v-if="store.isEditMode" class="action-col"></th>
        </tr>
      </thead>

      <tbody>
        <!-- Summary row: Sink Fund Account Balance -->
        <tr class="summary-row" data-testid="summary-row-balance">
          <td>Sink Fund Account Balance</td>
          <td class="amount-cell">{{ centsToDollars(store.sinkFund?.current_balance ?? 0) }}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td v-if="store.isEditMode"></td>
        </tr>

        <!-- Summary row: Unassigned Money -->
        <tr class="summary-row" data-testid="summary-row-unassigned">
          <td>
            <span>Unassigned Money</span>
            <i
              v-tooltip.right="'Money not assigned to any financial goal/obligation'"
              class="pi pi-info-circle unassigned-info"
              data-testid="unassigned-tooltip"
            ></i>
          </td>
          <td class="amount-cell">{{ centsToDollars(store.unassignedBalance) }}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td v-if="store.isEditMode"></td>
        </tr>

        <!-- Allocation rows -->
        <tr
          v-for="(allocation, index) in store.visibleAllocations"
          :key="allocation.id || `new-${index}`"
          :class="{
            'deleted-row': allocation.deleted,
            'closed-row': allocation.status === 'closed',
          }"
          data-testid="allocation-row"
        >
          <!-- Name -->
          <td>
            <input
              v-if="store.isEditMode"
              v-model="allocation.name"
              type="text"
              class="p-inputtext cell-input"
              data-testid="allocation-name-input"
            />
            <span v-else>{{ allocation.name }}</span>
          </td>

          <!-- Current Balance (always read-only) -->
          <td class="amount-cell">
            <span class="balance-cell">
              <button
                v-tooltip="'Show transactions for this allocation'"
                class="eye-btn"
                data-testid="show-transactions-btn"
                @click="onShowTransactions(allocation)"
              >
                <i class="pi pi-eye"></i>
              </button>
              <span>{{ centsToDollars(allocation.current_balance ?? 0) }}</span>
            </span>
          </td>

          <!-- Target -->
          <td class="amount-cell">
            <EcMoneyField
              v-if="store.isEditMode"
              v-model="allocation.target"
              label=""
              :edit-mode="true"
            />
            <span v-else>{{ centsToDollars(allocation.target ?? 0) }}</span>
          </td>

          <!-- Outstanding -->
          <td class="amount-cell" :class="outstandingClass(outstanding(allocation))">
            {{ centsToDollars(outstanding(allocation)) }}
          </td>

          <!-- Comment -->
          <td>
            <input
              v-if="store.isEditMode"
              v-model="allocation.comment"
              type="text"
              class="p-inputtext cell-input"
              data-testid="allocation-comment-input"
            />
            <span v-else>{{ allocation.comment }}</span>
          </td>

          <!-- Status (always read-only) -->
          <td>{{ allocation.status }}</td>

          <!-- Actions (edit mode only) -->
          <td v-if="store.isEditMode" class="center-cell action-buttons">
            <button
              v-tooltip="allocation.deleted ? 'Undo delete' : 'Delete this obligation'"
              :class="allocation.deleted ? '' : 'delete-btn'"
              :data-testid="allocation.deleted ? 'undo-delete-btn' : 'delete-btn'"
              @click="toggleDeleted(allocation)"
            >
              <i :class="allocation.deleted ? 'pi pi-undo' : 'pi pi-trash'"></i>
            </button>
            <button
              v-if="allocation.status === 'open'"
              v-tooltip="'Close this obligation'"
              class="deactivate-btn"
              data-testid="deactivate-btn"
              @click="toggleStatus(allocation)"
            >
              <i class="pi pi-ban"></i>
            </button>
            <button
              v-else
              v-tooltip="'Reopen this obligation'"
              class="reactivate-btn"
              data-testid="reactivate-btn"
              @click="toggleStatus(allocation)"
            >
              <i class="pi pi-check-circle"></i>
            </button>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr class="total-row" data-testid="total-row">
          <th>Total</th>
          <th class="amount-cell">{{ centsToDollars(store.totalAssignedBalance) }}</th>
          <th class="amount-cell">{{ centsToDollars(store.totalTarget) }}</th>
          <th class="amount-cell" :class="outstandingClass(store.totalOutstanding)">
            {{ centsToDollars(store.totalOutstanding) }}
          </th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
      </tfoot>
    </table>
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
import { ref } from 'vue';
import Tooltip from 'primevue/tooltip';
import { useSinkFundStore } from './sinkFundStore';
import { sinkFundApi } from './sinkFundApi';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import type { SinkFundAllocationData } from './sinkFund.types';

const vTooltip = Tooltip;

const store = useSinkFundStore();

const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

function outstanding(allocation: SinkFundAllocationData): number {
  const target = allocation.target ?? 0;
  if (target === 0) return 0;
  return (allocation.current_balance ?? 0) - target;
}

function outstandingClass(value: number): string {
  if (value > 0) return 'amount-positive';
  if (value < 0) return 'amount-negative';
  return 'amount-muted';
}

function toggleDeleted(allocation: SinkFundAllocationData) {
  allocation.deleted = !allocation.deleted;
}

function toggleStatus(allocation: SinkFundAllocationData) {
  allocation.status = allocation.status === 'open' ? 'closed' : 'open';
}

function onShowTransactions(allocation: SinkFundAllocationData) {
  selectedAllocationId.value = allocation.id ?? 0;
  selectedAllocationName.value = allocation.name ?? '';
  dialogVisible.value = true;
}
</script>

<style scoped>
.allocation-list {
  min-height: 0;
  overflow: auto;
  flex: 1;
}

/* ── Base table ── */
.allocations-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.875rem;
  --thead-height: 2.5rem;
  --summary-row-height: 2rem;
}

.allocations-table th,
.allocations-table td {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sticky header ── */
.allocations-table thead th {
  height: var(--thead-height);
  font-weight: 600;
  background-color: var(--p-surface-50);
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: none;
  box-shadow: 0 2px 0 var(--p-surface-300);
}

/* ── Column widths ── */
.name-col {
  width: 20%;
}
.balance-col {
  width: 12%;
}
.target-col {
  width: 10%;
}
.outstanding-col {
  width: 10%;
}
.comment-col {
  width: 16%;
}
.status-col {
  width: 6%;
}
.action-col {
  width: 6%;
}

/* ── Amount cells ── */
.amount-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.allocations-table thead th.balance-col,
.allocations-table thead th.target-col,
.allocations-table thead th.outstanding-col {
  text-align: right;
}

/* ── Outstanding colour classes ── */
.amount-positive {
  color: var(--p-green-600);
}

.amount-negative {
  color: var(--p-red-600);
}

.amount-muted {
  color: var(--p-text-muted-color);
}

/* ── Summary rows (sticky below header) ── */
.summary-row td {
  font-weight: 700;
  background-color: var(--p-surface-50);
  position: sticky;
  z-index: 9;
}

.summary-row:nth-of-type(1) td {
  top: var(--thead-height);
}

.summary-row:nth-of-type(2) td {
  top: calc(var(--thead-height) + var(--summary-row-height));
  box-shadow: 0 2px 0 var(--p-surface-300);
}

/* ── Balance cell with eye icon ── */
.balance-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.eye-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s;
}

tr:hover .eye-btn {
  opacity: 1;
}

.eye-btn:hover {
  color: var(--p-primary-color);
}

/* ── Edit mode inputs ── */
.cell-input {
  width: 100%;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
}

.center-cell {
  text-align: center;
}

/* ── Action buttons ── */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.action-buttons button {
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.delete-btn:hover {
  color: var(--p-red-600);
}

.deactivate-btn:hover {
  color: var(--p-red-600);
}

.reactivate-btn:hover {
  color: var(--p-green-600);
}

/* ── Deleted row ── */
.deleted-row {
  opacity: 0.4;
  text-decoration: line-through;
}

/* ── Closed row (shown via toggle) ── */
.closed-row {
  opacity: 0.4;
  text-decoration: line-through;
}

/* ── Unassigned info tooltip icon ── */
.unassigned-info {
  margin-left: 0.4rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  cursor: help;
}

/* ── Sticky footer ── */
.allocations-table tfoot th {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background-color: var(--p-surface-100);
  border-top: 3px solid var(--p-surface-400);
  border-bottom: none;
  font-weight: 600;
}

/* ── Row hover ── */
.allocations-table tbody tr:hover td {
  background-color: var(--p-surface-100);
}
</style>
