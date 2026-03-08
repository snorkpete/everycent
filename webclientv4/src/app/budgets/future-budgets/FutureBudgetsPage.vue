<template>
  <div class="future-budgets-page">
    <div class="table-wrapper">
      <table class="budgets-table">
        <thead>
          <tr>
            <th class="name-col"></th>
            <th v-for="budget in store.budgets" :key="budget.id" class="budget-col">
              {{ budget.name }}
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- ── Incomes ── -->
          <tr class="section-header" data-testid="incomes-section-header">
            <td :colspan="colSpan">Incomes</td>
          </tr>

          <tr v-for="name in store.incomeNames" :key="name" data-testid="income-row">
            <td>
              <button
                class="row-link"
                :data-testid="`edit-income-${name}`"
                @click="openIncomeDialog(name)"
              >
                {{ name }}
              </button>
            </td>
            <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
              {{ centsToDollars(incomeAmountFor(name, budget)) }}
            </td>
          </tr>

          <tr data-testid="add-income-row">
            <td :colspan="colSpan">
              <Button
                label="Add New Income"
                size="small"
                data-testid="add-income-btn"
                @click="openIncomeDialog('New Income')"
              />
            </td>
          </tr>

          <tr class="total-row" data-testid="total-income-row">
            <th>Total Income</th>
            <th v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
              {{ centsToDollars(store.totalIncomeForBudget(budget)) }}
            </th>
          </tr>

          <!-- ── Allocations ── -->
          <tr class="section-header" data-testid="allocations-section-header">
            <td :colspan="colSpan">Allocations</td>
          </tr>

          <template v-for="category in store.allocationCategories" :key="category.id">
            <tr class="category-header" :data-testid="`category-header-${category.id}`">
              <td>{{ category.name }}</td>
              <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
                {{ centsToDollars(categoryTotalFor(category, budget)) }}
              </td>
            </tr>

            <tr
              v-for="allocName in allocationNamesFor(category)"
              :key="allocName"
              data-testid="allocation-row"
            >
              <td>
                <button
                  class="row-link"
                  :data-testid="`edit-allocation-${allocName}`"
                  @click="openAllocationDialog(category, allocName)"
                >
                  {{ allocName }}
                </button>
              </td>
              <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
                {{ centsToDollars(allocationAmountFor(category, allocName, budget)) }}
              </td>
            </tr>

            <tr :data-testid="`add-allocation-row-${category.id}`">
              <td :colspan="colSpan">
                <Button
                  :label="`Add ${category.name} Allocation`"
                  size="small"
                  :data-testid="`add-allocation-btn-${category.id}`"
                  @click="openAllocationDialog(category, 'New Allocation')"
                />
              </td>
            </tr>
          </template>

          <tr class="total-row" data-testid="total-allocations-row">
            <th>Total Allocations</th>
            <th v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
              {{ centsToDollars(store.totalAllocationsForBudget(budget)) }}
            </th>
          </tr>
        </tbody>

        <tfoot>
          <tr class="total-row" data-testid="total-discretionary-row">
            <th>Total Discretionary Money</th>
            <th v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
              {{ centsToDollars(store.discretionaryForBudget(budget)) }}
            </th>
          </tr>

          <template v-if="store.settings.family_type === 'couple'">
            <tr data-testid="husband-row">
              <td>{{ store.settings.husband ?? 'Husband' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
                {{ centsToDollars(store.discretionaryForBudget(budget) / 2) }}
              </td>
            </tr>
            <tr data-testid="wife-row">
              <td>{{ store.settings.wife ?? 'Wife' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
                {{ centsToDollars(store.discretionaryForBudget(budget) / 2) }}
              </td>
            </tr>
          </template>

          <template v-else-if="store.settings.family_type === 'single'">
            <tr data-testid="single-person-row">
              <td>{{ store.settings.single_person ?? 'Person' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id" class="amount-cell">
                {{ centsToDollars(store.discretionaryForBudget(budget)) }}
              </td>
            </tr>
          </template>
        </tfoot>
      </table>
    </div>

    <div class="page-actions">
      <Button
        label="Refresh"
        severity="secondary"
        data-testid="refresh-btn"
        @click="store.fetchAll()"
      />
    </div>

    <BudgetMassEditDialog
      :visible="dialogVisible"
      :type="dialogType"
      :name="dialogName"
      :budgets="store.budgets"
      :amounts-per-budget="dialogAmountsPerBudget"
      :category-id="dialogCategoryId"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import { useHeadingStore } from '../../toolbar/headingStore';
import { useFutureBudgetsStore } from './futureBudgetsStore';
import { useNotifications } from '../../notifications/useNotifications';
import BudgetMassEditDialog from './BudgetMassEditDialog.vue';
import { centsToDollars } from '../../shared/util/cents-to-dollars';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

const store = useFutureBudgetsStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const dialogVisible = ref(false);
const dialogType = ref<'income' | 'allocation'>('income');
const dialogName = ref('');
const dialogAmountsPerBudget = ref<Record<number, { id: number; amount: number }>>({});
const dialogCategoryId = ref<number | undefined>(undefined);

const colSpan = computed(() => store.budgets.length + 1);

onMounted(() => {
  headingStore.setHeading('Future Budgets');
  store.fetchAll();
});

function incomeAmountFor(name: string, budget: FutureBudgetData): number {
  return store.incomeDisplayData[name]?.[budget.id]?.amount ?? 0;
}

function categoryTotalFor(category: AllocationCategoryData, budget: FutureBudgetData): number {
  if (category.id == null) return 0;
  const categoryData = store.allocationDisplayData[category.id];
  if (!categoryData) return 0;
  return Object.values(categoryData).reduce(
    (sum, byBudget) => sum + (byBudget[budget.id]?.amount ?? 0),
    0,
  );
}

function allocationNamesFor(category: AllocationCategoryData): string[] {
  if (category.id == null) return [];
  return Object.keys(store.allocationDisplayData[category.id] ?? {});
}

function allocationAmountFor(
  category: AllocationCategoryData,
  allocName: string,
  budget: FutureBudgetData,
): number {
  if (category.id == null) return 0;
  return store.allocationDisplayData[category.id]?.[allocName]?.[budget.id]?.amount ?? 0;
}

function openIncomeDialog(name: string) {
  dialogType.value = 'income';
  dialogName.value = name;
  dialogAmountsPerBudget.value = store.incomeDisplayData[name] ?? {};
  dialogCategoryId.value = undefined;
  dialogVisible.value = true;
}

function openAllocationDialog(category: AllocationCategoryData, allocName: string) {
  dialogType.value = 'allocation';
  dialogName.value = allocName;
  dialogAmountsPerBudget.value =
    category.id != null
      ? (store.allocationDisplayData[category.id]?.[allocName] ?? {})
      : {};
  dialogCategoryId.value = category.id;
  dialogVisible.value = true;
}

async function onSave(payload: MassUpdatePayload) {
  try {
    await store.massUpdate(payload);
    notifications.success('Changes saved');
    dialogVisible.value = false;
  } catch {
    // store.error is set by massUpdate before re-throwing
    notifications.error(store.error ?? 'Failed to save changes');
  }
}
</script>

<style scoped>
.future-budgets-page {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
}

.budgets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.budgets-table th,
.budgets-table td {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  white-space: nowrap;
}

.budgets-table thead th {
  font-weight: 600;
  background-color: var(--p-surface-50);
  border-bottom: 2px solid var(--p-surface-300);
  text-align: left;
}

.budgets-table tfoot td,
.budgets-table tfoot th {
  border-top: 2px solid var(--p-surface-300);
  border-bottom: none;
}

.name-col {
  min-width: 12rem;
}

.budget-col {
  min-width: 9rem;
}

.amount-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.section-header td {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  background-color: var(--p-surface-100);
  padding: 0.3rem 0.75rem;
}

.category-header td {
  font-weight: 600;
  background-color: var(--p-surface-50);
  border-top: 2px solid var(--p-primary-200);
}

.total-row th {
  font-weight: 600;
  background-color: var(--p-surface-50);
}

.row-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--p-text-color);
  cursor: pointer;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.15s;
}

.row-link:hover {
  text-decoration-color: currentColor;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
