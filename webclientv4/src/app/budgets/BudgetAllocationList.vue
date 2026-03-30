<template>
  <div class="allocation-list">
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
            <td class="amount-cell">{{ centsToDollars(categoryAmount(category)) }}</td>
            <td class="amount-cell">{{ centsToDollars(categorySpent(category)) }}</td>
            <td class="amount-cell" :class="remainingClass(categoryRemaining(category))">
              {{ centsToDollars(categoryRemaining(category)) }}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td v-if="store.isEditMode"></td>
          </tr>

          <!-- Fixed subtotal row (variable-only mode) — below category header -->
          <tr
            v-if="variableOnly && fixedAllocationsForCategory(category).length > 0"
            class="fixed-subtotal-row"
            :data-testid="`fixed-subtotal-${category.id}`"
          >
            <td>Fixed</td>
            <td class="amount-cell">{{ centsToDollars(fixedCategoryAmount(category)) }}</td>
            <td class="amount-cell">{{ centsToDollars(fixedCategorySpent(category)) }}</td>
            <td class="amount-cell" :class="remainingClass(fixedCategoryRemaining(category))">
              {{ centsToDollars(fixedCategoryRemaining(category)) }}
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
                  v-if="!variableOnly && allocation.is_fixed_amount"
                  v-tooltip="'Fixed allocation'"
                  class="pi pi-lock fixed-icon"
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
                  v-tooltip="'Show transactions for this allocation'"
                  class="eye-btn"
                  data-testid="show-transactions-btn"
                  @click="showTransactions(allocation)"
                >
                  <i class="pi pi-eye"></i>
                </button>
                <span>{{ centsToDollars(allocation.spent ?? 0) }}</span>
              </span>
            </td>

            <!-- Remaining -->
            <td class="amount-cell" :class="remainingClass(remaining(allocation))">
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
                <option v-for="cls in allocationClasses" :key="cls.id" :value="cls.id">
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
        <tr v-if="variableOnly" class="fixed-total-row" data-testid="fixed-total-row">
          <th>Fixed Total</th>
          <th class="amount-cell">{{ centsToDollars(totalFixedAmount) }}</th>
          <th class="amount-cell">{{ centsToDollars(totalFixedSpent) }}</th>
          <th class="amount-cell" :class="remainingClass(totalFixedRemaining)">
            {{ centsToDollars(totalFixedRemaining) }}
          </th>
          <th></th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
        <tr class="total-row" data-testid="total-row">
          <th>Total</th>
          <th class="amount-cell">{{ centsToDollars(totalAmount) }}</th>
          <th class="amount-cell">{{ centsToDollars(totalSpent) }}</th>
          <th class="amount-cell" :class="remainingClass(totalRemaining)">
            {{ centsToDollars(totalRemaining) }}
          </th>
          <th></th>
          <th></th>
          <th></th>
          <th v-if="store.isEditMode"></th>
        </tr>
      </tfoot>
    </table>
    <div class="unallocated-badge" data-testid="unallocated-badge">
      Unallocated: {{ centsToDollars(unallocated) }}
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
import { useBudgetStore } from './budgetStore';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from './budgetApi';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const props = withDefaults(
  defineProps<{
    variableOnly?: boolean;
  }>(),
  {
    variableOnly: false,
  },
);

const store = useBudgetStore();

const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');

function showTransactions(allocation: AllocationData) {
  selectedAllocationId.value = allocation.id ?? 0;
  selectedAllocationName.value = allocation.name ?? '';
  dialogVisible.value = true;
}

const allocationClasses = [
  { id: 'want', name: 'Want' },
  { id: 'need', name: 'Need' },
  { id: 'savings', name: 'Savings' },
];

function allAllocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  if (!store.budget?.allocations) return [];
  return store.budget.allocations.filter((a) => a.allocation_category_id === category.id);
}

function allocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  const all = allAllocationsForCategory(category);
  if (!props.variableOnly) return all;
  return all.filter((a) => !a.is_fixed_amount);
}

function activeAllocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  return allAllocationsForCategory(category).filter((a) => !a.deleted);
}

function fixedAllocationsForCategory(category: AllocationCategoryData): AllocationData[] {
  return allAllocationsForCategory(category).filter((a) => !a.deleted && a.is_fixed_amount);
}

function fixedCategoryAmount(category: AllocationCategoryData): number {
  return fixedAllocationsForCategory(category).reduce((sum, a) => sum + (a.amount ?? 0), 0);
}

function fixedCategorySpent(category: AllocationCategoryData): number {
  return fixedAllocationsForCategory(category).reduce((sum, a) => sum + (a.spent ?? 0), 0);
}

function fixedCategoryRemaining(category: AllocationCategoryData): number {
  return fixedCategoryAmount(category) - fixedCategorySpent(category);
}

const totalFixedAmount = computed(() =>
  activeAllocations.value
    .filter((a) => a.is_fixed_amount)
    .reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

const totalFixedSpent = computed(() =>
  activeAllocations.value
    .filter((a) => a.is_fixed_amount)
    .reduce((sum, a) => sum + (a.spent ?? 0), 0),
);

const totalFixedRemaining = computed(() => totalFixedAmount.value - totalFixedSpent.value);

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

const activeAllocations = computed(
  () => store.budget?.allocations?.filter((a) => !a.deleted) ?? [],
);

const totalAmount = computed(() =>
  activeAllocations.value.reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

const totalSpent = computed(() =>
  activeAllocations.value.reduce((sum, a) => sum + (a.spent ?? 0), 0),
);

const totalRemaining = computed(() => totalAmount.value - totalSpent.value);

const totalIncome = computed(
  () => store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
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
  store.addAllocation(newAllocation);
}
</script>

<style scoped>
.allocation-list {
  min-height: 0;
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
  color: var(--p-green-600);
}

.amount-negative {
  color: var(--p-red-600);
}

.amount-muted {
  color: var(--p-text-muted-color);
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
