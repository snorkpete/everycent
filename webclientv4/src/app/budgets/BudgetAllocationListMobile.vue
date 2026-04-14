<!--
  Noted exception: this mobile component uses a <table> layout rather than the
  card/list pattern described in webclientv4/CLAUDE.md. Allocations are dense
  and benefit from column alignment even on narrow screens. The expand-on-tap
  detail row handles secondary fields.
  TODO: revisit whether a card layout actually serves this screen better once we
  have real mobile usage feedback — if so, migrate to match SinkFundAllocationListMobile.
-->
<template>
  <div class="allocation-list-mobile">
    <table class="ec-budget-table allocations-table-mobile">
      <thead>
        <tr class="allocation-toolbar-row">
          <th :colspan="store.isEditMode ? 4 : 3" class="allocation-toolbar-cell">
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
              <Button
                v-tooltip="'Toggle between showing zeroes as numbers or dashes'"
                :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
                :outlined="!dashIfZero"
                text
                size="small"
                data-testid="dash-zero-toggle"
                @click="dashIfZero = !dashIfZero"
              />
            </div>
          </th>
        </tr>
        <tr>
          <th class="name-col">Name</th>
          <th class="amount-col">Amount</th>
          <th class="remaining-col">Remaining</th>
          <th v-if="store.isEditMode" class="action-col"></th>
        </tr>
      </thead>

      <tbody>
        <template v-for="category in store.allocationCategories" :key="category.id">
          <!-- Category sub-header -->
          <tr
            class="ec-budget-table__category-header"
            :data-testid="`category-header-${category.id}`"
          >
            <td>{{ category.name }}</td>
            <td class="ec-budget-table__amount-cell">
              <EcMoneyDisplay
                :model-value="categoryTotals(category).amount"
                emphasis="subtotal"
                highlight-mode="none"
              />
            </td>
            <td class="ec-budget-table__amount-cell">
              <EcMoneyDisplay
                :model-value="categoryTotals(category).remaining"
                emphasis="subtotal"
              />
            </td>
            <td v-if="store.isEditMode"></td>
          </tr>

          <!-- Allocation rows -->
          <template
            v-for="(allocation, index) in allocationsForCategory(category)"
            :key="allocation.id || `${category.id}-${index}`"
          >
            <tr
              :class="{
                'ec-budget-table__fixed-subtotal': isSummaryRow(allocation),
                'ec-deleted': allocation.deleted,
              }"
              :data-testid="
                isSummaryRow(allocation) ? `fixed-subtotal-${category.id}` : 'allocation-row'
              "
            >
              <td>
                <span :class="{ 'mobile-name-cell': !isSummaryRow(allocation) }">
                  <i
                    v-if="!isSummaryRow(allocation)"
                    class="pi mobile-chevron"
                    :class="
                      isRowExpanded(allocation.id ?? 0) ? 'pi-chevron-down' : 'pi-chevron-right'
                    "
                    @click.stop="toggleRowExpanded(allocation.id ?? 0)"
                  ></i>
                  <EcTextField
                    :model-value="allocation.name ?? ''"
                    label=""
                    inline
                    :edit-mode="isEditable(allocation)"
                    data-testid="allocation-name-input"
                    @update:model-value="allocation.name = $event"
                  />
                  <i
                    v-if="
                      !isSummaryRow(allocation) &&
                      !isEditable(allocation) &&
                      allocation.is_fixed_amount
                    "
                    v-tooltip="'Fixed allocation'"
                    class="pi pi-lock ec-budget-table__fixed-icon"
                  ></i>
                </span>
              </td>
              <td class="ec-budget-table__amount-cell">
                <EcMoneyField
                  v-model="allocation.amount"
                  label=""
                  inline
                  :edit-mode="isEditable(allocation)"
                  :emphasis="emphasisFor(allocation)"
                  :dash-if-zero="dashIfZero"
                  highlight-mode="none"
                />
              </td>
              <td class="ec-budget-table__amount-cell">
                <EcMoneyDisplay
                  :model-value="remaining(allocation)"
                  :emphasis="emphasisFor(allocation)"
                  :dash-if-zero="dashIfZero"
                />
              </td>
              <td v-if="store.isEditMode" class="ec-budget-table__center-cell">
                <EcDeleteButton
                  v-if="isEditable(allocation)"
                  :deleted="allocation.deleted"
                  item-label="allocation"
                  test-id-prefix="allocation"
                  @toggle="toggleDeleted(allocation)"
                />
              </td>
            </tr>

            <!-- Mobile detail row (expand on tap) -->
            <tr
              v-if="!isSummaryRow(allocation) && isRowExpanded(allocation.id ?? 0)"
              class="mobile-detail-row"
            >
              <td :colspan="store.isEditMode ? 4 : 3">
                <span class="mobile-detail-item">
                  Spent:
                  <EcMoneyDisplay :model-value="allocation.spent ?? 0" highlight-mode="none" />
                  <EcShowTransactionsButton
                    data-testid="show-transactions-btn"
                    @click.stop="showTransactions(allocation)"
                  />
                </span>
                <span class="mobile-detail-item">
                  {{ category.name }}
                </span>
              </td>
            </tr>
          </template>

          <!-- Add allocation button -->
          <tr
            v-if="store.isEditMode"
            class="ec-budget-table__add-row"
            :data-testid="`add-allocation-row-${category.id}`"
          >
            <td :colspan="4">
              <button
                class="ec-budget-table__add-link"
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
        <tr
          v-if="!isFixedDetailVisible"
          class="ec-budget-table__fixed-total"
          data-testid="fixed-total-row"
        >
          <th>Fixed Total</th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="fixedTotals.amount"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay :model-value="fixedTotals.remaining" emphasis="total" />
          </th>
          <th v-if="store.isEditMode"></th>
        </tr>
        <tr class="total-row" data-testid="total-row">
          <th>Total</th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay
              :model-value="grandTotals.amount"
              emphasis="total"
              highlight-mode="none"
            />
          </th>
          <th class="ec-budget-table__amount-cell">
            <EcMoneyDisplay :model-value="grandTotals.remaining" emphasis="total" />
          </th>
          <th v-if="store.isEditMode"></th>
        </tr>
      </tfoot>
    </table>
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
import { Emphasis } from '../shared/constants/emphasis';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import EcShowTransactionsButton from '../shared/EcShowTransactionsButton.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from './budgetApi';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { Emphasis as EmphasisType } from '../shared/constants/emphasis';

const store = useBudgetStore();

const expandedRows = ref(new Set<number>());

function toggleRowExpanded(allocationId: number) {
  if (expandedRows.value.has(allocationId)) {
    expandedRows.value.delete(allocationId);
  } else {
    expandedRows.value.add(allocationId);
  }
}

function isRowExpanded(allocationId: number): boolean {
  return expandedRows.value.has(allocationId);
}

const allocations = computed(() => store.budget?.allocations ?? []);
const categories = computed(() => store.allocationCategories);
const totalIncome = computed(
  () => store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
);

const {
  allocationsForCategory,
  categoryTotals,
  grandTotals,
  fixedTotals,
  isFixedDetailVisible,
  showFixedDetail,
  hideFixedDetail,
} = useAllocationGrouping(allocations, categories, totalIncome, {
  displayDeletedAllocations: computed(() => store.isEditMode),
});

const dashIfZero = ref(false);

function isSummaryRow(allocation: AllocationData): boolean {
  return allocation.is_fixed_amount === true && !isFixedDetailVisible.value;
}

function isEditable(allocation: AllocationData): boolean {
  return store.isEditMode && !isSummaryRow(allocation);
}

function emphasisFor(_allocation: AllocationData): EmphasisType {
  return Emphasis.Item;
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
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../shared/styles/budget-table.css';

.allocation-list-mobile {
  min-height: 0;
}

/* ── Toolbar (inside sticky thead, sits above column headers) ── */
.allocation-toolbar-row th {
  top: 0 !important;
  z-index: 11 !important;
}

.allocation-toolbar-cell {
  padding: 0.25rem 0.75rem !important;
  border-bottom: 1px solid var(--p-surface-200) !important;
  box-shadow: none !important;
}

/* Column header row sits below toolbar */
.allocations-table-mobile thead tr:nth-child(2) th {
  top: 2.25rem !important;
}

.allocation-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* ── Base table ── */
.allocations-table-mobile {
  --thead-height: 2.1rem;
}

.allocations-table-mobile th,
.allocations-table-mobile td {
  white-space: normal;
  padding: 0.4rem 0.5rem;
}

.allocations-table-mobile .name-col {
  width: auto;
}

.allocations-table-mobile td:last-child,
.allocations-table-mobile th:last-child {
  padding-right: 0.75rem;
}

/* ── Mobile name cell with chevron ── */
.mobile-name-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mobile-chevron {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0.2rem;
}

/* ── Mobile detail row ── */
.mobile-detail-row td {
  padding: 0.25rem 0.5rem 0.4rem 1.5rem;
  background-color: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.mobile-detail-item {
  margin-right: 1rem;
}

/* ── Amount column header alignment ── */
.allocations-table-mobile thead th.amount-col,
.allocations-table-mobile thead th.remaining-col {
  text-align: right;
}

/* ── Column widths ── */
.name-col {
  width: 50%;
}
.amount-col {
  width: 25%;
}
.remaining-col {
  width: 25%;
}
.action-col {
  width: 5%;
}

/* ── Row animation for variable-only toggle ── */
.allocations-table-mobile tbody tr {
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;
}
</style>
