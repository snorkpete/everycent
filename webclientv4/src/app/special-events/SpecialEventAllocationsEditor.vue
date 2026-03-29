<template>
  <div class="allocations-editor">
    <div class="toolbar">
      <Button
        label="Save"
        data-testid="save-btn"
        title="Save allocation changes for this special event"
        :loading="store.loading"
        @click="save"
      />
      <Button
        label="Cancel"
        severity="secondary"
        data-testid="cancel-btn"
        title="Discard changes and return to event details"
        @click="cancel"
      />
    </div>

    <div v-if="store.currentSpecialEvent" class="header-card" data-testid="event-header">
      <h2 class="event-name">{{ store.currentSpecialEvent.name }}</h2>
      <div class="event-summary">
        <span>Budgeted: {{ centsToDollars(store.currentSpecialEvent.budget_amount) }}</span>
        <span>Actual: {{ centsToDollars(totalSpent) }}</span>
      </div>
    </div>

    <div class="panels">
      <div class="panel current-allocations">
        <h3>Current Allocations</h3>
        <DataTable :value="currentAllocations" data-testid="current-allocations-table" size="small">
          <Column field="name" header="Allocation" />
          <Column field="budget_name" header="Budget" />
          <Column field="allocation_category_name" header="Category" />
          <Column
            field="amount"
            header="Amount"
            header-style="text-align: right"
            style="text-align: right"
          >
            <template #body="{ data }">
              {{ centsToDollars(data.amount) }}
            </template>
          </Column>
          <Column
            field="spent"
            header="Spent"
            header-style="text-align: right"
            style="text-align: right"
          >
            <template #body="{ data }">
              {{ centsToDollars(data.spent) }}
            </template>
            <template #footer>
              <span class="total-label">{{ centsToDollars(totalSpent) }}</span>
            </template>
          </Column>
          <Column header="" style="width: 3rem; text-align: center">
            <template #body="{ data }">
              <Button
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                :data-testid="`remove-btn-${data.id}`"
                title="Remove this allocation from the special event"
                @click="removeAllocation(data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="panel assign-allocations">
        <h3>Assign Allocations</h3>
        <div class="filter-row">
          <Select
            v-model="selectedBudgetId"
            :options="budgets"
            option-label="name"
            option-value="id"
            placeholder="Select Budget"
            data-testid="budget-select"
            @update:model-value="onBudgetChange"
          />
          <Select
            v-model="selectedCategoryId"
            :options="allocationCategories"
            option-label="name"
            option-value="id"
            placeholder="All Categories"
            show-clear
            data-testid="category-select"
            @update:model-value="onCategoryChange"
          />
        </div>

        <DataTable
          :value="groupedAllocations"
          data-testid="available-allocations-table"
          size="small"
        >
          <Column header="Name">
            <template #body="{ data: row }">
              <span v-if="row._isCategoryHeader" class="category-header">{{ row.name }}</span>
              <span v-else>{{ row.name }}</span>
            </template>
          </Column>
          <Column header="Budgeted" header-style="text-align: right" style="text-align: right">
            <template #body="{ data: row }">
              <span v-if="!row._isCategoryHeader">{{ centsToDollars(row.amount) }}</span>
            </template>
          </Column>
          <Column header="Spent" header-style="text-align: right" style="text-align: right">
            <template #body="{ data: row }">
              <span v-if="!row._isCategoryHeader">{{ centsToDollars(row.spent) }}</span>
            </template>
          </Column>
          <Column header="" style="width: 3rem; text-align: center">
            <template #body="{ data: row }">
              <Button
                v-if="!row._isCategoryHeader"
                icon="pi pi-plus"
                text
                rounded
                :data-testid="`add-btn-${row.id}`"
                title="Add this allocation to the special event"
                :disabled="isAllocationAssigned(row)"
                @click="addAllocation(row)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Select from 'primevue/select';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSpecialEventStore } from './specialEventStore';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { budgetApi } from '../budgets/budgetApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import type { SpecialEventAllocationData } from './specialEvent.types';
import type { BudgetData } from '../budgets/budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { AllocationData } from '../transactions/transaction.types';

const route = useRoute();
const router = useRouter();
const store = useSpecialEventStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const budgets = ref<BudgetData[]>([]);
const allocationCategories = ref<AllocationCategoryData[]>([]);
const availableAllocations = ref<AllocationData[]>([]);
const currentAllocations = ref<SpecialEventAllocationData[]>([]);

const selectedBudgetId = ref<number | null>(null);
const selectedCategoryId = ref<number | null>(null);

const totalSpent = computed(() =>
  currentAllocations.value.reduce((sum, a) => sum + (a.spent ?? 0), 0),
);

const groupedAllocations = computed(() => {
  const filtered = selectedCategoryId.value
    ? availableAllocations.value.filter(
        (a) => a.allocation_category_id === selectedCategoryId.value,
      )
    : availableAllocations.value;

  const categories = new Map<string, AllocationData[]>();

  // Uncategorized first
  const uncategorized = filtered.filter((a) => !a.allocation_category_id);
  if (uncategorized.length > 0) {
    categories.set('Uncategorized', uncategorized);
  }

  // Then each category with allocations
  allocationCategories.value.forEach((cat) => {
    const allocations = filtered.filter((a) => a.allocation_category_id === cat.id);
    if (allocations.length > 0) {
      categories.set(cat.name ?? 'Unknown', allocations);
    }
  });

  // Flatten: category header rows + allocation rows
  const result: (AllocationData & { _isCategoryHeader?: boolean })[] = [];
  categories.forEach((allocations, categoryName) => {
    result.push({
      name: categoryName,
      _isCategoryHeader: true,
    } as AllocationData & { _isCategoryHeader: boolean });
    result.push(...allocations);
  });

  return result;
});

function isAllocationAssigned(allocation: AllocationData): boolean {
  return currentAllocations.value.some((a) => a.id === allocation.id);
}

function addAllocation(allocation: AllocationData) {
  if (!isAllocationAssigned(allocation)) {
    currentAllocations.value = [
      ...currentAllocations.value,
      {
        id: allocation.id,
        name: allocation.name,
        amount: allocation.amount,
        spent: allocation.spent,
        budget_name: allocation.budget_name,
        allocation_category_name: allocation.allocation_category?.name,
        allocation_category_id: allocation.allocation_category_id,
      },
    ];
  }
}

function removeAllocation(allocation: SpecialEventAllocationData) {
  currentAllocations.value = currentAllocations.value.filter((a) => a.id !== allocation.id);
}

async function save() {
  const eventId = Number(route.params.id);
  if (!eventId) return;

  const allocationIds = currentAllocations.value
    .map((a) => a.id)
    .filter((id): id is number => id != null);

  try {
    await store.updateAllocations(eventId, {
      allocation_ids: allocationIds,
      actual_amount: totalSpent.value,
    });
    notifications.success('Special event allocations updated');
    router.push({ name: 'special-event-detail', params: { id: eventId } });
  } catch {
    notifications.error(store.error ?? 'Failed to update special event allocations');
  }
}

function cancel() {
  const eventId = Number(route.params.id);
  router.push({ name: 'special-event-detail', params: { id: eventId } });
}

function syncQueryParams() {
  const query: Record<string, string> = {};
  if (selectedBudgetId.value) {
    query.budget_id = String(selectedBudgetId.value);
  }
  if (selectedCategoryId.value) {
    query.allocation_category_id = String(selectedCategoryId.value);
  }
  router.replace({ query });
}

async function onBudgetChange() {
  syncQueryParams();
  if (selectedBudgetId.value) {
    await loadAllocationsForBudget(selectedBudgetId.value);
  } else {
    availableAllocations.value = [];
  }
}

function onCategoryChange() {
  syncQueryParams();
}

async function loadAllocationsForBudget(budgetId: number) {
  try {
    const allocations = await budgetApi.getAllocations(budgetId);
    availableAllocations.value = allocations;
  } catch {
    notifications.error('Failed to load allocations for selected budget');
  }
}

onMounted(async () => {
  headingStore.setHeading('Edit Allocations');
  const eventId = Number(route.params.id);

  // Load budgets and categories in parallel
  const [budgetList, categoryList] = await Promise.all([
    budgetApi.getAll(),
    allocationCategoryApi.getAll(),
  ]);
  budgets.value = budgetList;
  allocationCategories.value = categoryList;

  // Load the special event
  if (eventId) {
    await store.fetchOne(eventId);
    currentAllocations.value = [...(store.currentSpecialEvent?.allocations ?? [])];
  }

  // Restore from URL query params
  const budgetIdParam = Number(route.query.budget_id);
  const categoryIdParam = route.query.allocation_category_id
    ? Number(route.query.allocation_category_id)
    : null;

  if (budgetIdParam) {
    selectedBudgetId.value = budgetIdParam;
    await loadAllocationsForBudget(budgetIdParam);
  }
  if (categoryIdParam) {
    selectedCategoryId.value = categoryIdParam;
  }
});
</script>

<style scoped>
.allocations-editor {
  padding: 0.75rem 1.5rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.header-card {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 1rem;
  flex-shrink: 0;
}

.event-name {
  margin: 0 0 0.5rem;
}

.event-summary {
  display: flex;
  gap: 1.5rem;
  color: var(--p-text-muted-color);
}

.panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: auto;
  min-height: 0;
}

.panel {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 1rem;
}

.panel h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.filter-row > * {
  flex: 1;
}

.category-header {
  font-weight: bold;
}

.total-label {
  font-weight: bold;
}
</style>
