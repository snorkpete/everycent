<template>
  <div class="allocation-list">
      <div class="allocation-toolbar">
        <Button
          :label="grouping.isFixedDetailVisible.value ? 'All Allocations' : 'Variable Only'"
          :icon="grouping.isFixedDetailVisible.value ? 'pi pi-filter' : 'pi pi-filter-fill'"
          :outlined="grouping.isFixedDetailVisible.value"
          size="small"
          data-testid="variable-only-toggle"
          title="Toggle between showing all allocations and variable-only mode"
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
              <td class="amount-cell">{{ centsToDollars(grouping.categoryTotals(category).amount) }}</td>
              <td class="amount-cell">{{ centsToDollars(grouping.categoryTotals(category).spent) }}</td>
              <td
                class="amount-cell"
                :class="remainingClass(grouping.categoryTotals(category).remaining)"
              >
                {{ centsToDollars(grouping.categoryTotals(category).remaining) }}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td v-if="store.isEditMode"></td>
            </tr>

            <!-- Fixed subtotal row (variable-only mode) — below category header -->
            <tr
              v-if="!grouping.isFixedDetailVisible.value && grouping.fixedAllocations(category).length > 0"
              class="fixed-subtotal-row"
              :data-testid="`fixed-subtotal-${category.id}`"
            >
              <td>Fixed</td>
              <td class="amount-cell">{{ centsToDollars(grouping.fixedCategoryTotals(category).amount) }}</td>
              <td class="amount-cell">{{ centsToDollars(grouping.fixedCategoryTotals(category).spent) }}</td>
              <td
                class="amount-cell"
                :class="remainingClass(grouping.fixedCategoryTotals(category).remaining)"
              >
                {{ centsToDollars(grouping.fixedCategoryTotals(category).remaining) }}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td v-if="store.isEditMode"></td>
            </tr>

            <!-- Allocation rows -->
            <tr
              v-for="(allocation, index) in allocationsForCategory(category)"
              :key="allocation.id || `${category.id}-${index}`"
              :class="{ 'deleted-row': allocation.deleted }"
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
                <span v-else>
                  {{ allocation.name }}
                  <i
                    v-if="grouping.isFixedDetailVisible.value && allocation.is_fixed_amount"
                    class="pi pi-lock fixed-icon"
                    v-tooltip="'Fixed allocation'"
                  ></i>
                </span>
              </td>

              <!-- Amount -->
              <td class="amount-cell">
                <EcMoneyField
                  v-if="store.isEditMode"
                  v-model="allocation.amount"
                  label=""
                  :edit-mode="true"
                />
                <span v-else>{{ centsToDollars(allocation.amount ?? 0) }}</span>
              </td>

              <!-- Spent -->
              <td class="amount-cell">
                <span class="spent-cell">
                  <button
                    class="eye-btn"
                    title="Show transactions for this allocation"
                    data-testid="show-transactions-btn"
                    @click="showTransactions(allocation)"
                  >
                    <i class="pi pi-eye"></i>
                  </button>
                  <span>{{ centsToDollars(allocation.spent ?? 0) }}</span>
                </span>
              </td>

              <!-- Remaining -->
              <td
                class="amount-cell"
                :class="remainingClass(remaining(allocation))"
              >
                {{ centsToDollars(remaining(allocation)) }}
              </td>

              <!-- Class -->
              <td>
                <select
                  v-if="store.isEditMode"
                  v-model="allocation.allocation_class"
                  class="cell-select"
                  data-testid="allocation-class-select"
                >
                  <option
                    v-for="cls in allocationClasses"
                    :key="cls.id"
                    :value="cls.id"
                  >
                    {{ cls.name }}
                  </option>
                </select>
                <span v-else class="class-display">{{ titleCase(allocation.allocation_class) }}</span>
              </td>

              <!-- Fixed Amount? -->
              <td class="center-cell">
                <input
                  v-if="store.isEditMode"
                  v-model="allocation.is_fixed_amount"
                  type="checkbox"
                  data-testid="allocation-fixed-checkbox"
                />
                <span v-else>{{ allocation.is_fixed_amount ? 'Yes' : 'No' }}</span>
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

              <!-- Delete action -->
              <td v-if="store.isEditMode" class="center-cell">
                <button
                  class="delete-btn"
                  :title="allocation.deleted ? 'Undo delete' : 'Delete allocation'"
                  :data-testid="allocation.deleted ? 'undo-delete-btn' : 'delete-btn'"
                  @click="toggleDeleted(allocation)"
                >
                  <i :class="allocation.deleted ? 'pi pi-undo' : 'pi pi-trash'"></i>
                </button>
              </td>
            </tr>

            <!-- Add allocation button -->
            <tr v-if="store.isEditMode" class="add-row" :data-testid="`add-allocation-row-${category.id}`">
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
          <tr v-if="!grouping.isFixedDetailVisible.value" class="fixed-total-row" data-testid="fixed-total-row">
            <th>Fixed Total</th>
            <th class="amount-cell">{{ centsToDollars(grouping.fixedTotals.value.amount) }}</th>
            <th class="amount-cell">{{ centsToDollars(grouping.fixedTotals.value.spent) }}</th>
            <th class="amount-cell" :class="remainingClass(grouping.fixedTotals.value.remaining)">
              {{ centsToDollars(grouping.fixedTotals.value.remaining) }}
            </th>
            <th></th>
            <th></th>
            <th></th>
            <th v-if="store.isEditMode"></th>
          </tr>
          <tr class="total-row" data-testid="total-row">
            <th>Total</th>
            <th class="amount-cell">{{ centsToDollars(grouping.grandTotals.value.amount) }}</th>
            <th class="amount-cell">{{ centsToDollars(grouping.grandTotals.value.spent) }}</th>
            <th class="amount-cell" :class="remainingClass(grouping.grandTotals.value.remaining)">
              {{ centsToDollars(grouping.grandTotals.value.remaining) }}
            </th>
            <th></th>
            <th></th>
            <th></th>
            <th v-if="store.isEditMode"></th>
          </tr>
        </tfoot>
      </table>
    <div class="unallocated-badge" data-testid="unallocated-badge">
      Unallocated: {{ centsToDollars(grouping.unallocated.value) }}
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
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { remainingClass } from '../shared/util/remaining-class';
import { titleCase } from '../shared/util/title-case';
import { allocationClasses } from '../shared/constants/allocationClasses';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from './budgetApi';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const store = useBudgetStore();

const allocations = computed(() => store.budget?.allocations ?? []);
const categories = computed(() => store.allocationCategories);
const totalIncome = computed(() =>
  store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
);

const grouping = useAllocationGrouping(allocations, categories, totalIncome, {
  displayDeletedAllocations: computed(() => store.isEditMode),
});

const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

function showTransactions(allocation: AllocationData) {
  selectedAllocationId.value = allocation.id ?? 0;
  selectedAllocationName.value = allocation.name ?? '';
  dialogVisible.value = true;
}

function allocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  if (grouping.isFixedDetailVisible.value) {
    // Show all allocations in original order, respecting deleted visibility
    return allocations.value.filter((a) => {
      if (a.allocation_category_id !== category.id) return false;
      if (!store.isEditMode && a.deleted) return false;
      return true;
    });
  }
  // Variable-only mode: show only adjustable
  return grouping.adjustableAllocations(category);
}

function remaining(allocation: AllocationData): number {
  return (allocation.amount ?? 0) - (allocation.spent ?? 0);
}

function toggleFixedDetail() {
  if (grouping.isFixedDetailVisible.value) {
    grouping.hideFixedDetail();
  } else {
    grouping.showFixedDetail();
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
  store.budget.allocations.push(newAllocation);
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
  background-color: var(--p-primary-50, #f0f4ff);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.55rem 0.75rem;
  border-top: 2px solid var(--p-primary-200);
}

.allocations-table .category-header td:first-child {
  z-index: 15;
  box-shadow: inset 3px 0 0 var(--p-primary-400);
}

.category-class-badge {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
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

/* ── Remaining colour classes ── */
.amount-positive {
  color: #16a34a;
}

.amount-negative {
  color: #dc2626;
}

.amount-muted {
  color: var(--p-text-muted-color);
}

/* ── Column widths ── */
.name-col { width: 30%; }
.amount-col { width: 13%; }
.spent-col { width: 13%; }
.remaining-col { width: 13%; }
.class-col { width: 10%; }
.fixed-col { width: 8%; }
.action-col { width: 5%; }

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
  color: #dc2626;
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
  font-size: 0.95rem;
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
