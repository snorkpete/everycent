<template>
  <div class="allocation-list">
    <div class="allocation-toolbar">
      <Button
        v-tooltip="'Toggle between showing all allocations and variable-only mode'"
        :label="isFixedDetailVisible ? 'All Allocations' : 'Variable Only'"
        :icon="isFixedDetailVisible ? 'pi pi-filter' : 'pi pi-filter-fill'"
        :outlined="isFixedDetailVisible"
        size="small"
        data-testid="variable-only-toggle"
        @click="toggleFixedDetail"
      />
    </div>
    <table class="allocations-table">
      <thead>
        <tr>
          <th class="name-col">Name</th>
          <th class="amount-col">Amount</th>
          <th class="spent-col">Spent</th>
          <th class="remaining-col">Remaining</th>
          <th class="class-col">Class</th>
          <th class="fixed-col">Fixed?</th>
          <th class="comment-col">Comment</th>
          <th v-if="store.isEditMode" class="action-col"></th>
        </tr>
      </thead>

      <tbody>
        <template v-for="category in store.allocationCategories" :key="category.id">
          <!-- Category sub-header -->
          <tr class="category-header" :data-testid="`category-header-${category.id}`">
            <td>{{ category.name }}</td>
            <td class="amount-cell">
              <EcMoneyDisplay
                :model-value="categoryTotals(category).amount"
                emphasis="subtotal"
                highlight-mode="none"
              />
            </td>
            <td class="amount-cell">
              <EcMoneyDisplay
                :model-value="categoryTotals(category).spent"
                emphasis="subtotal"
                highlight-mode="none"
              />
            </td>
            <td class="amount-cell">
              <EcMoneyDisplay
                :model-value="categoryTotals(category).remaining"
                emphasis="subtotal"
              />
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td v-if="store.isEditMode"></td>
          </tr>

          <!-- Allocation rows (fixed first, then adjustable) -->
          <tr
            v-for="(allocation, index) in [
              ...fixedAllocations(category),
              ...adjustableAllocations(category),
            ]"
            :key="allocation.id || `${category.id}-${index}`"
            :class="{
              'fixed-subtotal-row': isSummaryRow(allocation),
              'deleted-row': allocation.deleted,
            }"
            :data-testid="
              isSummaryRow(allocation) ? `fixed-subtotal-${category.id}` : 'allocation-row'
            "
          >
            <td>
              <input
                v-if="isEditable(allocation)"
                v-model="allocation.name"
                type="text"
                class="p-inputtext cell-input"
                data-testid="allocation-name-input"
              />
              <span v-else>
                {{ allocation.name }}
                <i
                  v-if="allocation.is_fixed_amount && !isSummaryRow(allocation)"
                  v-tooltip="'Fixed allocation'"
                  class="pi pi-lock fixed-icon"
                ></i>
              </span>
            </td>
            <td class="amount-cell">
              <EcMoneyField
                v-if="isEditable(allocation)"
                v-model="allocation.amount"
                label=""
                :edit-mode="true"
              />
              <EcMoneyDisplay
                v-else
                :model-value="allocation.amount ?? 0"
                :emphasis="emphasisFor(allocation)"
                highlight-mode="none"
              />
            </td>
            <td class="amount-cell">
              <span class="spent-cell">
                <button
                  v-if="!isSummaryRow(allocation)"
                  v-tooltip="'Show transactions for this allocation'"
                  class="eye-btn"
                  data-testid="show-transactions-btn"
                  @click="showTransactions(allocation)"
                >
                  <i class="pi pi-eye"></i>
                </button>
                <EcMoneyDisplay
                  :model-value="allocation.spent ?? 0"
                  :emphasis="emphasisFor(allocation)"
                  highlight-mode="none"
                />
              </span>
            </td>
            <td class="amount-cell">
              <EcMoneyDisplay
                :model-value="remaining(allocation)"
                :emphasis="emphasisFor(allocation)"
              />
            </td>
            <td>
              <select
                v-if="isEditable(allocation)"
                v-model="allocation.allocation_class"
                class="cell-select"
                data-testid="allocation-class-select"
              >
                <option v-for="cls in allocationClasses" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
              <span v-else-if="!isSummaryRow(allocation)" class="class-display">{{
                titleCase(allocation.allocation_class)
              }}</span>
            </td>
            <td class="center-cell">
              <input
                v-if="isEditable(allocation)"
                v-model="allocation.is_fixed_amount"
                type="checkbox"
                data-testid="allocation-fixed-checkbox"
              />
              <span v-else-if="!isSummaryRow(allocation)">{{
                allocation.is_fixed_amount ? 'Yes' : 'No'
              }}</span>
            </td>
            <td>
              <input
                v-if="isEditable(allocation)"
                v-model="allocation.comment"
                type="text"
                class="p-inputtext cell-input"
                data-testid="allocation-comment-input"
              />
              <span v-else-if="!isSummaryRow(allocation)">{{ allocation.comment }}</span>
            </td>
            <td v-if="store.isEditMode" class="center-cell">
              <button
                v-if="isEditable(allocation)"
                v-tooltip="allocation.deleted ? 'Undo delete' : 'Delete allocation'"
                class="delete-btn"
                :data-testid="allocation.deleted ? 'undo-delete-btn' : 'delete-btn'"
                @click="toggleDeleted(allocation)"
              >
                <i :class="allocation.deleted ? 'pi pi-undo' : 'pi pi-trash'"></i>
              </button>
            </td>
          </tr>

          <!-- Add allocation button -->
          <tr
            v-if="store.isEditMode"
            class="add-row"
            :data-testid="`add-allocation-row-${category.id}`"
          >
            <td :colspan="8">
              <button
                class="add-link"
                :data-testid="`add-allocation-btn-${category.id}`"
                @click="addAllocation(category)"
              >
                + Add {{ category.name }} Allocation
              </button>
            </td>
          </tr>
        </template>
      </tbody>

      <tfoot>
        <tr v-if="!isFixedDetailVisible" class="fixed-total-row" data-testid="fixed-total-row">
          <th>Fixed Total</th>
          <th class="amount-cell">
            <EcMoneyDisplay
              :model-value="fixedTotals.amount"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="amount-cell">
            <EcMoneyDisplay
              :model-value="fixedTotals.spent"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="amount-cell">
            <EcMoneyDisplay :model-value="fixedTotals.remaining" emphasis="total" />
          </th>
          <th></th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
        <tr class="total-row" data-testid="total-row">
          <th>Total</th>
          <th class="amount-cell">
            <EcMoneyDisplay
              :model-value="grandTotals.amount"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="amount-cell">
            <EcMoneyDisplay
              :model-value="grandTotals.spent"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="amount-cell">
            <EcMoneyDisplay :model-value="grandTotals.remaining" emphasis="total" />
          </th>
          <th></th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
      </tfoot>
    </table>
    <div class="unallocated-badge" data-testid="unallocated-badge">
      Unallocated: <EcMoneyDisplay :model-value="unallocated" />
    </div>
    <AllocationTransactionsDialog
      :visible="dialogVisible"
      :allocation-id="selectedAllocationId"
      :allocation-name="selectedAllocationName"
      :fetch-transactions="budgetApi.getTransactionsForAllocation"
      @update:visible="dialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import { useBudgetStore } from './budgetStore';
import { useAllocationGrouping } from './useAllocationGrouping';
import { titleCase } from '../shared/util/title-case';
import { allocationClasses } from '../shared/constants/allocationClasses';
import { Emphasis } from '../shared/constants/emphasis';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from './budgetApi';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { Emphasis as EmphasisType } from '../shared/constants/emphasis';

const store = useBudgetStore();

const allocations = computed(() => store.budget?.allocations ?? []);
const categories = computed(() => store.allocationCategories);
const totalIncome = computed(
  () => store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
);

const {
  fixedAllocations,
  adjustableAllocations,
  categoryTotals,
  grandTotals,
  fixedTotals,
  unallocated,
  isFixedDetailVisible,
  showFixedDetail,
  hideFixedDetail,
} = useAllocationGrouping(allocations, categories, totalIncome, {
  displayDeletedAllocations: computed(() => store.isEditMode),
});

// Row helpers — drive all template conditionals
function isSummaryRow(allocation: AllocationData): boolean {
  return allocation.is_fixed_amount === true && !isFixedDetailVisible.value;
}

function isEditable(allocation: AllocationData): boolean {
  return store.isEditMode && !isSummaryRow(allocation);
}

function emphasisFor(allocation: AllocationData): EmphasisType {
  return isSummaryRow(allocation) ? Emphasis.Subtotal : Emphasis.Item;
}

function remaining(allocation: AllocationData): number {
  return (allocation.amount ?? 0) - (allocation.spent ?? 0);
}

const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

function showTransactions(allocation: AllocationData) {
  selectedAllocationId.value = allocation.id ?? 0;
  selectedAllocationName.value = allocation.name ?? '';
  dialogVisible.value = true;
}

function toggleFixedDetail() {
  if (isFixedDetailVisible.value) {
    hideFixedDetail();
  } else {
    showFixedDetail();
  }
}

function toggleDeleted(allocation: AllocationData) {
  allocation.deleted = !allocation.deleted;
}

function addAllocation(category: AllocationCategoryData) {
  if (!store.budget) return;
  const newAllocation: AllocationData = {
    id: 0,
    name: '',
    amount: 0,
    spent: 0,
    budget_id: store.budget.id,
    allocation_category_id: category.id,
  };
  store.addAllocation(newAllocation);
}
</script>

<style scoped>
.allocation-list {
  min-height: 0;
}

/* ── Toolbar ── */
.allocation-toolbar {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

/* ── Base table ── */
.allocations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  --thead-height: 2.5rem;
}

.allocations-table th,
.allocations-table td {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  white-space: nowrap;
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

/* ── Sticky category headers ── */
.allocations-table .category-header td {
  position: sticky;
  top: var(--thead-height);
  z-index: 5;
  background-color: var(--p-primary-50);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.55rem 0.75rem;
  border-top: 2px solid var(--p-primary-200);
}

.allocations-table .category-header td:first-child {
  z-index: 15;
  box-shadow: inset 3px 0 0 var(--p-primary-400);
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

/* ── Amount cells ── */
.amount-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.allocations-table thead th.amount-col,
.allocations-table thead th.spent-col,
.allocations-table thead th.remaining-col {
  text-align: right;
}

/* ── Column widths ── */
.name-col {
  width: 30%;
}
.amount-col {
  width: 13%;
}
.spent-col {
  width: 13%;
}
.remaining-col {
  width: 13%;
}
.class-col {
  width: 10%;
}
.fixed-col {
  width: 8%;
}
.action-col {
  width: 5%;
}

/* ── Spent cell with eye icon ── */
.spent-cell {
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

.cell-select {
  width: 100%;
  font-size: 0.85rem;
  padding: 0.2rem 0.3rem;
  border: 1px solid var(--p-surface-300);
  border-radius: 4px;
  background-color: var(--p-surface-0);
}

.center-cell {
  text-align: center;
}

/* ── Delete button ── */
.delete-btn {
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

/* ── Deleted row ── */
.deleted-row {
  opacity: 0.4;
  text-decoration: line-through;
}

/* ── Add allocation link ── */
.add-row td {
  padding-top: 0.2rem;
  padding-bottom: 0.4rem;
  border-bottom: none;
}

.add-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--p-primary-color);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 500;
  opacity: 0.65;
  transition: opacity 0.15s;
}

.add-link:hover {
  opacity: 1;
}

/* ── Class display ── */
.class-display {
  font-size: 0.85rem;
}

/* ── Fixed indicator icon ── */
.fixed-icon {
  font-size: 0.75rem;
  margin-left: 0.35rem;
  color: var(--p-text-muted-color);
}

/* ── Fixed subtotal row ── */
.fixed-subtotal-row td {
  background-color: var(--p-surface-100);
  font-weight: 600;
  color: var(--p-text-color);
  border-bottom: 2px solid var(--p-surface-200);
}

/* ── Fixed total row (footer) ── */
.fixed-total-row th {
  background-color: var(--p-surface-50);
  font-weight: 500;
  font-style: italic;
  color: var(--p-text-muted-color);
}

/* ── Row hover ── */
.allocations-table tbody tr:hover td {
  background-color: var(--p-surface-100);
}
</style>
