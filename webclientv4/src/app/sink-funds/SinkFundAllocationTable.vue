<template>
  <div class="allocation-list">
    <SinkFundAllocationListMobile v-if="isMobile" :dash-if-zero="dashIfZero" />
    <table v-else class="ec-budget-table allocations-table" data-testid="allocations-table">
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
          <td class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="store.sinkFund?.current_balance ?? 0"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </td>
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
          <td class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="store.unassignedBalance"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </td>
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
            'ec-deleted': allocation.deleted || allocation.status === 'closed',
          }"
          data-testid="allocation-row"
        >
          <!-- Name -->
          <td>
            <input
              v-if="store.isEditMode"
              v-model="allocation.name"
              type="text"
              class="p-inputtext ec-budget-table__cell-input"
              data-testid="allocation-name-input"
            />
            <span v-else>{{ allocation.name }}</span>
          </td>

          <!-- Current Balance (always read-only) -->
          <td class="ec-budget-table__amount-cell">
            <span class="balance-cell">
              <EcShowTransactionsButton
                data-testid="show-transactions-btn"
                @click="onShowTransactions(allocation)"
              />
              <EcMoneyDisplay
                :model-value="allocation.current_balance ?? 0"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </span>
          </td>

          <!-- Target -->
          <td class="ec-budget-table__amount-cell">
            <EcMoneyField
              v-if="store.isEditMode"
              v-model="allocation.target"
              label=""
              :edit-mode="true"
            />
            <EcMoneyDisplay
              v-else
              :model-value="allocation.target ?? 0"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </td>

          <!-- Outstanding -->
          <td class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="outstanding(allocation)"
              highlight-mode="balance"
              :dash-if-zero="dashIfZero"
            />
          </td>

          <!-- Comment -->
          <td>
            <input
              v-if="store.isEditMode"
              v-model="allocation.comment"
              type="text"
              class="p-inputtext ec-budget-table__cell-input"
              data-testid="allocation-comment-input"
            />
            <span v-else>{{ allocation.comment }}</span>
          </td>

          <!-- Status (always read-only) -->
          <td>{{ allocation.status }}</td>

          <!-- Actions (edit mode only) -->
          <td v-if="store.isEditMode" class="ec-budget-table__center-cell action-buttons">
            <EcDeleteButton
              :deleted="allocation.deleted"
              item-label="obligation"
              test-id-prefix="obligation"
              @toggle="toggleDeleted(allocation)"
            />
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
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="store.totalAssignedBalance"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="store.totalTarget"
              highlight-mode="none"
              :dash-if-zero="dashIfZero"
            />
          </th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="store.totalOutstanding"
              highlight-mode="balance"
              :dash-if-zero="dashIfZero"
            />
          </th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
      </tfoot>
    </table>
    <AllocationTransactionsDialog
      v-if="!isMobile"
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
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import EcShowTransactionsButton from '../shared/EcShowTransactionsButton.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import SinkFundAllocationListMobile from './SinkFundAllocationListMobile.vue';
import { useResponsive } from '../shared/composables/useResponsive';
import { outstanding } from './sinkFundUtils';
import type { SinkFundAllocationData } from './sinkFund.types';

const { dashIfZero = false } = defineProps<{
  dashIfZero?: boolean;
}>();

const vTooltip = Tooltip;

const store = useSinkFundStore();
const { isMobile } = useResponsive();

const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

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
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../shared/styles/budget-table.css';

.allocation-list {
  min-height: 0;
  overflow: auto;
  flex: 1;
}

/* ── Base table ── */
.allocations-table {
  table-layout: fixed;
  --thead-height: 2.5rem;
  --summary-row-height: 2rem;
}

/* Override shared budget-table footer offset for this table */
.allocations-table tfoot th {
  bottom: 0;
}

.allocations-table th,
.allocations-table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* ── Amount column header alignment ── */
.allocations-table thead th.balance-col,
.allocations-table thead th.target-col,
.allocations-table thead th.outstanding-col {
  text-align: right;
}

/* ── Summary rows (sticky below header) ── */
.summary-row td {
  font-weight: 700;
  background-color: var(--p-surface-50);
  position: sticky;
  z-index: var(--z-summary-row, 9);
}

.summary-row:nth-of-type(1) td {
  top: var(--thead-height);
}

.summary-row:nth-of-type(2) td {
  top: calc(var(--thead-height) + var(--summary-row-height));
  box-shadow: 0 2px 0 var(--p-surface-300);
}

/* ── Balance cell with eye icon (visible on hover only) ── */
.balance-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.balance-cell :deep(.p-button) {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.balance-cell:hover :deep(.p-button) {
  opacity: 1;
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

/* ── Unassigned info tooltip icon ── */
.unassigned-info {
  margin-left: 0.4rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  cursor: help;
}
</style>
