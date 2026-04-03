<template>
  <EcPageLayout page-name="future-budgets">
    <div class="page-header">
      <Button
        v-tooltip="'Toggle between showing all allocations and variable-only mode'"
        :label="variableOnly ? 'Variable Only' : 'All Allocations'"
        :icon="variableOnly ? 'pi pi-filter-fill' : 'pi pi-filter'"
        :outlined="!variableOnly"
        size="small"
        data-testid="variable-only-toggle"
        @click="variableOnly = !variableOnly"
      />
      <Button
        label="Refresh"
        severity="secondary"
        data-testid="refresh-btn"
        @click="store.fetchAll()"
      />
    </div>

    <div class="table-wrapper">
      <table class="ec-budget-table budgets-table">
        <thead>
          <tr>
            <th class="name-col"></th>
            <th v-for="budget in store.budgets" :key="budget.id" class="budget-col">
              <span class="budget-header-main">{{ budgetHeaderLines(budget.name)[0] }}</span>
              <span class="budget-header-year">{{ budgetHeaderLines(budget.name)[1] }}</span>
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
            <td v-for="budget in store.budgets" :key="budget.id">
              <EcMoneyDisplay :model-value="incomeAmountFor(name, budget)" :highlight-mode="HighlightMode.None" />
            </td>
          </tr>

          <tr class="ec-budget-table__add-row" data-testid="add-income-row">
            <td :colspan="colSpan">
              <button
                class="ec-budget-table__add-link"
                data-testid="add-income-btn"
                @click="openIncomeDialog('New Income')"
              >
                + Add New Income
              </button>
            </td>
          </tr>

          <tr class="total-row" data-testid="total-income-row">
            <th>Total Income</th>
            <th v-for="budget in store.budgets" :key="budget.id">
              <EcMoneyDisplay
                :model-value="store.totalIncomeForBudget(budget)"
                :highlight-mode="HighlightMode.Income"
                :emphasis="Emphasis.Subtotal"
              />
            </th>
          </tr>

          <!-- ── Allocations ── -->
          <tr class="section-header" data-testid="allocations-section-header">
            <td :colspan="colSpan">Allocations</td>
          </tr>

          <template v-for="category in store.allocationCategories" :key="category.id">
            <tr class="ec-budget-table__category-header" :data-testid="`category-header-${category.id}`">
              <td>{{ category.name }}</td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="categoryTotalFor(category, budget)" :highlight-mode="HighlightMode.None" />
              </td>
            </tr>

            <!-- Fixed subtotal row (variable-only mode) — below category header -->
            <tr
              v-if="variableOnly && hasFixedAllocationsInCategory(category)"
              class="ec-budget-table__fixed-subtotal"
              :data-testid="`fixed-subtotal-${category.id}`"
            >
              <td>Fixed</td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="fixedTotalForCategory(category, budget)" :highlight-mode="HighlightMode.None" />
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
                  <i
                    v-if="category.id != null && isFixedInAllBudgets(category.id, allocName)"
                    v-tooltip="'Fixed in all budgets'"
                    class="pi pi-lock ec-budget-table__fixed-icon fixed-icon--all"
                  ></i>
                  <i
                    v-else-if="category.id != null && isFixedInSomeBudgets(category.id, allocName)"
                    v-tooltip="'Fixed in some budgets'"
                    class="pi pi-lock-open ec-budget-table__fixed-icon fixed-icon--some"
                  ></i>
                </button>
              </td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="allocationAmountFor(category, allocName, budget)" :highlight-mode="HighlightMode.None" />
              </td>
            </tr>

            <tr class="ec-budget-table__add-row" :data-testid="`add-allocation-row-${category.id}`">
              <td :colspan="colSpan">
                <button
                  class="ec-budget-table__add-link"
                  :data-testid="`add-allocation-btn-${category.id}`"
                  @click="openAllocationDialog(category, 'New Allocation')"
                >
                  + Add {{ category.name }} Allocation
                </button>
              </td>
            </tr>
          </template>

          <tr class="total-row" data-testid="total-allocations-row">
            <th>Total Allocations</th>
            <th v-for="budget in store.budgets" :key="budget.id">
              <EcMoneyDisplay
                :model-value="store.totalAllocationsForBudget(budget)"
                :highlight-mode="HighlightMode.None"
                :emphasis="Emphasis.Total"
              />
            </th>
          </tr>

          <!-- ── Per-person discretionary (moved out of tfoot so footer stays single-row) ── -->
          <template v-if="settingsStore.settings.family_type === 'couple'">
            <tr class="person-row" data-testid="husband-row">
              <td>{{ settingsStore.settings.husband ?? 'Husband' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="store.discretionaryForBudget(budget) / 2" :highlight-mode="HighlightMode.None" />
              </td>
            </tr>
            <tr class="person-row" data-testid="wife-row">
              <td>{{ settingsStore.settings.wife ?? 'Wife' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="store.discretionaryForBudget(budget) / 2" :highlight-mode="HighlightMode.None" />
              </td>
            </tr>
          </template>

          <template v-else-if="settingsStore.settings.family_type === 'single'">
            <tr class="person-row" data-testid="single-person-row">
              <td>{{ settingsStore.settings.single_person ?? 'Person' }}'s Amount</td>
              <td v-for="budget in store.budgets" :key="budget.id">
                <EcMoneyDisplay :model-value="store.discretionaryForBudget(budget)" :highlight-mode="HighlightMode.None" />
              </td>
            </tr>
          </template>
        </tbody>

        <!-- Single-row tfoot enables position: sticky; bottom: 0 -->
        <tfoot>
          <tr v-if="variableOnly" class="ec-budget-table__fixed-total" data-testid="fixed-total-row">
            <th>Fixed Total</th>
            <th v-for="budget in store.budgets" :key="budget.id">
              <EcMoneyDisplay
                :model-value="totalFixedForBudget(budget)"
                :highlight-mode="HighlightMode.None"
                :emphasis="Emphasis.Total"
              />
            </th>
          </tr>
          <tr class="total-row total-row--prominent" data-testid="total-discretionary-row">
            <th>Total Discretionary Money</th>
            <th v-for="budget in store.budgets" :key="budget.id">
              <EcMoneyDisplay
                :model-value="store.discretionaryForBudget(budget)"
                :highlight-mode="HighlightMode.Balance"
                :emphasis="Emphasis.Total"
              />
            </th>
          </tr>
        </tfoot>
      </table>
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
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import EcPageLayout from '../../shared/layout/EcPageLayout.vue';
import { useHeadingStore } from '../../toolbar/headingStore';
import { useFutureBudgetsStore } from './futureBudgetsStore';
import { useSettingsStore } from '../../settings/settingsStore';
import { useNotifications } from '../../notifications/useNotifications';
import BudgetMassEditDialog from './BudgetMassEditDialog.vue';
import EcMoneyDisplay from '../../shared/form/money-field/EcMoneyDisplay.vue';
import { HighlightMode } from '../../shared/constants/highlightMode';
import { Emphasis } from '../../shared/constants/emphasis';
import { budgetHeaderLines } from './budgetHeaderLines';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

const store = useFutureBudgetsStore();
const settingsStore = useSettingsStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const dialogVisible = ref(false);
const dialogType = ref<'income' | 'allocation'>('income');
const dialogName = ref('');
const dialogAmountsPerBudget = ref<Record<number, { id: number; amount: number }>>({});
const dialogCategoryId = ref<number | undefined>(undefined);
const variableOnly = ref(false);

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
  const allNames = Object.keys(store.allocationDisplayData[category.id] ?? {});
  if (!variableOnly.value) return allNames;
  return allNames.filter((name) => !isFixedInAllBudgets(category.id!, name));
}

function isFixedInAllBudgets(categoryId: number, allocName: string): boolean {
  const byBudget = store.allocationDisplayData[categoryId]?.[allocName];
  if (!byBudget) return false;
  return Object.values(byBudget).every((entry) => entry.is_fixed_amount);
}

function isFixedInSomeBudgets(categoryId: number, allocName: string): boolean {
  const byBudget = store.allocationDisplayData[categoryId]?.[allocName];
  if (!byBudget) return false;
  const values = Object.values(byBudget);
  return (
    values.some((entry) => entry.is_fixed_amount) && !values.every((entry) => entry.is_fixed_amount)
  );
}

function fixedTotalForCategory(category: AllocationCategoryData, budget: FutureBudgetData): number {
  if (category.id == null) return 0;
  const categoryData = store.allocationDisplayData[category.id];
  if (!categoryData) return 0;
  return Object.entries(categoryData).reduce((sum, [, byBudget]) => {
    const entry = byBudget[budget.id];
    if (entry?.is_fixed_amount) return sum + entry.amount;
    return sum;
  }, 0);
}

function hasFixedAllocationsInCategory(category: AllocationCategoryData): boolean {
  if (category.id == null) return false;
  const categoryData = store.allocationDisplayData[category.id];
  if (!categoryData) return false;
  return Object.values(categoryData).some((byBudget) =>
    Object.values(byBudget).some((entry) => entry.is_fixed_amount),
  );
}

function totalFixedForBudget(budget: FutureBudgetData): number {
  return store.allocationCategories.reduce(
    (sum, category) => sum + fixedTotalForCategory(category, budget),
    0,
  );
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
    category.id != null ? (store.allocationDisplayData[category.id]?.[allocName] ?? {}) : {};
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
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../../shared/styles/budget-table.css';

/* ── Page header ── */
.page-header {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ── Table wrapper: the scroll container — both axes ── */
.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 7rem);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
}

/* ── Base table ── */
.budgets-table {
  /*
    Fixed thead height so the sticky category-header top offset is exact.
    If you change the two-line header font sizes, update this too.
  */
  --thead-height: 3.5rem;
}

.budgets-table th,
.budgets-table td {
  white-space: nowrap;
}

/* Budget column headers right-aligned to match the amounts below */
.budgets-table thead th.budget-col {
  text-align: right;
}

/* ── Footer — extra bottom padding for visual breathing room ── */
.budgets-table tfoot th {
  padding-bottom: 10px;
}

/* ────────────────────────────
   STICKY: first column (left)
   z-index var(--z-table-row) so regular rows scroll cleanly behind it
──────────────────────────── */
.budgets-table td:first-child,
.budgets-table th:first-child {
  position: sticky;
  left: 0;
  z-index: var(--z-table-row);
  background-color: var(--p-surface-0);
}

/* Corner: thead ─ highest z-index beats both sticky axes */
.budgets-table thead th:first-child {
  z-index: var(--z-corner);
  background-color: var(--p-surface-50);
}

/* Corner: tfoot */
.budgets-table tfoot th:first-child {
  z-index: var(--z-corner);
  background-color: var(--p-surface-100);
}

/* ────────────────────────────
   STICKY: category headers
   The shared ec-budget-table__category-header rules set position/top/z-index/bg.
   Override background for FutureBudgetsPage (uses surface-50, not primary-50).
──────────────────────────── */
.budgets-table .ec-budget-table__category-header td {
  background-color: var(--p-surface-50);
}

/* Category header first cell: above sticky first-column regular rows */
.budgets-table .ec-budget-table__category-header td:first-child {
  background-color: var(--p-surface-50);
}

/* ── Section headers ── */
.section-header td {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  background-color: var(--p-surface-100);
  padding: 0.3rem 0.75rem;
}

.budgets-table .section-header td:first-child {
  background-color: var(--p-surface-100);
}

/* ── Fixed subtotal row — extra font-size vs shared default ── */
.ec-budget-table__fixed-subtotal td {
  font-size: 0.95rem;
}

/* ── Total rows ── */
.total-row th {
  font-weight: 600;
  background-color: var(--p-surface-100);
  box-shadow: inset 0 2px 0 var(--p-surface-400);
  border-bottom: 1px solid var(--p-surface-200);
}

.budgets-table .total-row th:first-child {
  background-color: var(--p-surface-100);
}

.total-row--prominent th {
  font-weight: 700;
  font-size: 0.9rem;
  background-color: var(--p-surface-100);
}

/* ── Per-person rows ── */
.person-row td {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
  font-style: italic;
}

.budgets-table .person-row td:first-child {
  background-color: var(--p-surface-0);
}

/* ── Column sizing ── */
.name-col {
  min-width: 12rem;
}

.budget-col {
  min-width: 8rem;
  text-align: right;
}

/* Budget body cells: right-align to match column headers */
.budgets-table td + td,
.budgets-table tbody th + th {
  text-align: right;
}

/* ── Budget header two-line ── */
.budget-header-main {
  display: block;
  font-size: 0.8rem;
}

.budget-header-year {
  display: block;
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
}

/* ── Row hover — also applies to th cells and first-child ── */
.budgets-table tbody tr:hover th {
  background-color: var(--p-surface-100);
}

.budgets-table tbody tr:hover td:first-child {
  background-color: var(--p-surface-100);
}

/* ── Row link ── */
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

/* ── Fixed indicator icon modifiers ── */
.fixed-icon--all,
.fixed-icon--some {
  color: var(--p-text-muted-color);
}
</style>
