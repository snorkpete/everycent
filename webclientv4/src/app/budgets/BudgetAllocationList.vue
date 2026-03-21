<template>
  <div class="allocation-list">
    <div class="table-wrapper">
      <table class="allocations-table">
        <thead>
          <tr>
            <th class="name-col">Name</th>
            <th class="amount-col">Amount</th>
            <th class="spent-col">Spent</th>
            <th class="remaining-col">Remaining</th>
            <th class="class-col">Class</th>
            <th class="fixed-col">Fixed Amount?</th>
            <th class="comment-col">Comment</th>
            <th v-if="store.isEditMode" class="action-col"></th>
          </tr>
        </thead>

        <tbody>
          <template v-for="category in store.allocationCategories" :key="category.id">
            <!-- Category sub-header -->
            <tr class="category-header" :data-testid="`category-header-${category.id}`">
              <td>{{ category.name }}</td>
              <td class="amount-cell">{{ centsToDollars(categoryAmount(category)) }}</td>
              <td class="amount-cell">{{ centsToDollars(categorySpent(category)) }}</td>
              <td
                class="amount-cell"
                :class="remainingClass(categoryRemaining(category))"
              >
                {{ centsToDollars(categoryRemaining(category)) }}
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
                <span v-else>{{ allocation.name }}</span>
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
                    @click="() => {}"
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
          <tr class="total-row" data-testid="total-row">
            <th>Total</th>
            <th class="amount-cell">{{ centsToDollars(totalAmount) }}</th>
            <th class="amount-cell">{{ centsToDollars(totalSpent) }}</th>
            <th class="amount-cell" :class="remainingClass(totalRemaining)">
              {{ centsToDollars(totalRemaining) }}
            </th>
            <th></th>
            <th></th>
            <th>
              <span class="unallocated-badge" data-testid="unallocated-badge">
                Unallocated: {{ centsToDollars(unallocated) }}
              </span>
            </th>
            <th v-if="store.isEditMode"></th>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBudgetStore } from './budgetStore';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const store = useBudgetStore();

const allocationClasses = [
  { id: 'want', name: 'Want' },
  { id: 'need', name: 'Need' },
  { id: 'savings', name: 'Savings' },
];

function allocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  if (!store.budget?.allocations) return [];
  return store.budget.allocations.filter(
    (a) => a.allocation_category_id === category.id,
  );
}

function activeAllocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  return allocationsForCategory(category).filter((a) => !a.deleted);
}

function categoryAmount(category: AllocationCategoryData): number {
  return activeAllocationsForCategory(category).reduce((sum, a) => sum + (a.amount ?? 0), 0);
}

function categorySpent(category: AllocationCategoryData): number {
  return activeAllocationsForCategory(category).reduce((sum, a) => sum + (a.spent ?? 0), 0);
}

function categoryRemaining(category: AllocationCategoryData): number {
  return categoryAmount(category) - categorySpent(category);
}

function remaining(allocation: AllocationData): number {
  return (allocation.amount ?? 0) - (allocation.spent ?? 0);
}

const activeAllocations = computed(() =>
  store.budget?.allocations?.filter((a) => !a.deleted) ?? [],
);

const totalAmount = computed(() =>
  activeAllocations.value.reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

const totalSpent = computed(() =>
  activeAllocations.value.reduce((sum, a) => sum + (a.spent ?? 0), 0),
);

const totalRemaining = computed(() => totalAmount.value - totalSpent.value);

const totalIncome = computed(() =>
  store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
);

const unallocated = computed(() => totalIncome.value - totalAmount.value);

function remainingClass(value: number): string {
  if (value > 0) return 'amount-positive';
  if (value < 0) return 'amount-negative';
  return 'amount-muted';
}

function titleCase(value: string | undefined): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrapper {
  overflow: auto;
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
  background-color: var(--p-surface-50);
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
.name-col { width: 22%; }
.amount-col { width: 10%; }
.spent-col { width: 10%; }
.remaining-col { width: 10%; }
.class-col { width: 8%; }
.fixed-col { width: 8%; }
.comment-col { width: 25%; }
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

/* ── Unallocated badge ── */
.unallocated-badge {
  display: inline-block;
  border-radius: 5px;
  border: 1px solid var(--p-surface-400);
  background-color: var(--p-surface-300);
  font-size: 0.8rem;
  color: var(--p-text-color);
  padding: 0.15rem 0.5rem;
  font-weight: 500;
}

/* ── Row hover ── */
.allocations-table tbody tr:hover td {
  background-color: var(--p-surface-100);
}
</style>
