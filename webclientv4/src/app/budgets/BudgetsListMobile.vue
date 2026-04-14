<template>
  <div class="budget-cards">
    <div
      v-for="budget in store.budgets"
      :key="budget.id"
      class="budget-card"
      data-testid="budget-row"
      @click="$emit('goToBudget', budget)"
    >
      <div class="budget-card__header">
        <span class="budget-card__name" :data-testid="`budget-name-link-${budget.id}`">
          {{ budget.name }}
        </span>
        <span
          class="status-badge"
          :class="budget.status === 'open' ? 'status-open' : 'status-closed'"
          :data-testid="`status-${budget.id}`"
        >
          {{ budget.status }}
        </span>
      </div>
      <div
        v-if="store.canCopy(budget) || store.canClose(budget)"
        class="budget-card__actions"
        @click.stop
      >
        <Button
          v-if="store.canCopy(budget)"
          label="Copy"
          size="small"
          outlined
          severity="info"
          :data-testid="`copy-btn-${budget.id}`"
          @click="$emit('copyBudget', budget)"
        />
        <Button
          v-if="store.canClose(budget)"
          label="Close"
          size="small"
          outlined
          severity="danger"
          :data-testid="`close-btn-${budget.id}`"
          @click="$emit('closeBudget', budget)"
        />
      </div>
    </div>
    <div v-if="store.budgets.length === 0 && !store.loading" class="empty-cell">
      No budgets found.
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useBudgetListStore } from './budgetListStore';
import type { BudgetData } from './budget.types';

const store = useBudgetListStore();

defineEmits<{
  goToBudget: [budget: BudgetData];
  copyBudget: [budget: BudgetData];
  closeBudget: [budget: BudgetData];
}>();
</script>

<style scoped>
.budget-cards {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--p-surface-100);
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.budget-card {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 0.75rem;
  cursor: pointer;
}

.budget-card:active {
  background-color: var(--p-surface-50);
}

.budget-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.budget-card__name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--p-primary-color);
}

.budget-card__actions {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* ── Status badges ── */
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-open {
  background-color: var(--p-green-100);
  color: var(--p-green-800);
}

.status-closed {
  background-color: var(--p-surface-100);
  color: var(--p-text-muted-color);
}

/* ── Empty state ── */
.empty-cell {
  text-align: center;
  color: var(--p-text-muted-color);
  padding: 2rem 0.75rem !important;
}
</style>
