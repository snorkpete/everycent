<template>
  <div class="panel" data-testid="available-allocations-panel">
    <h3>Assign Allocations</h3>
    <div class="filter-stack">
      <Select
        :model-value="selectedBudgetId"
        :options="budgets"
        option-label="name"
        option-value="id"
        placeholder="Select Budget"
        fluid
        data-testid="budget-select"
        @update:model-value="$emit('update:selectedBudgetId', $event)"
      />
      <Select
        :model-value="selectedCategoryId"
        :options="allocationCategories"
        option-label="name"
        option-value="id"
        placeholder="All Categories"
        show-clear
        fluid
        data-testid="category-select"
        @update:model-value="$emit('update:selectedCategoryId', $event)"
      />
    </div>

    <ul v-if="groupedAllocations.length > 0" class="cards-list">
      <template v-for="(row, index) in groupedAllocations" :key="index">
        <li v-if="row._isCategoryHeader" class="category-header" data-testid="category-header">
          {{ row.name }}
        </li>
        <li v-else class="allocation-card" data-testid="available-allocation-card">
          <div class="card-main">
            <span class="card-name">{{ row.name }}</span>
            <EcMoneyDisplay :model-value="row.spent ?? 0" highlight-mode="none" />
            <Button
              v-tooltip="'Add this allocation to the special event'"
              icon="pi pi-plus"
              text
              rounded
              size="small"
              :data-testid="`add-btn-${row.id}`"
              :disabled="isAssigned(row)"
              @click="$emit('add', row)"
            />
          </div>
        </li>
      </template>
    </ul>
    <div v-else class="empty-state" data-testid="empty-available">
      {{
        selectedBudgetId ? 'No allocations in this budget.' : 'Select a budget to see allocations.'
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select';
import Button from 'primevue/button';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import type { BudgetData } from '../budgets/budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { AllocationData } from '../transactions/transaction.types';

defineProps<{
  budgets: BudgetData[];
  allocationCategories: AllocationCategoryData[];
  selectedBudgetId: number | null;
  selectedCategoryId: number | null;
  groupedAllocations: (AllocationData & { _isCategoryHeader?: boolean })[];
  isAssigned: (allocation: AllocationData) => boolean;
}>();

defineEmits<{
  'update:selectedBudgetId': [value: number | null];
  'update:selectedCategoryId': [value: number | null];
  add: [allocation: AllocationData];
}>();
</script>

<style scoped>
.panel {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 0.75rem;
}

.panel h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.filter-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-header {
  padding: 0.5rem 0 0.25rem;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.allocation-card {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-surface-200);
}

.allocation-card:last-child {
  border-bottom: none;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-name {
  flex: 1;
  min-width: 0;
  font-size: 0.9rem;
}

.empty-state {
  padding: 1rem 0;
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}
</style>
