<template>
  <div class="panel" data-testid="current-allocations-panel">
    <h3>Current Allocations</h3>
    <ul v-if="allocations.length > 0" class="cards-list">
      <li
        v-for="allocation in allocations"
        :key="allocation.id"
        class="allocation-card"
        data-testid="current-allocation-card"
      >
        <div class="card-main">
          <span class="card-name">{{ allocation.name }}</span>
          <EcMoneyDisplay :model-value="allocation.spent ?? 0" highlight-mode="none" />
          <Button
            v-tooltip="'Remove this allocation from the special event'"
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            size="small"
            :data-testid="`remove-btn-${allocation.id}`"
            @click="$emit('remove', allocation)"
          />
        </div>
      </li>
    </ul>
    <div v-else class="empty-state" data-testid="empty-state">No allocations assigned yet.</div>
    <div v-if="allocations.length > 0" class="total-row" data-testid="total-spent">
      <span>Total Spent</span>
      <EcMoneyDisplay :model-value="totalSpent" highlight-mode="none" emphasis="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import type { SpecialEventAllocationData } from './specialEvent.types';

defineProps<{
  allocations: SpecialEventAllocationData[];
  totalSpent: number;
}>();

defineEmits<{
  remove: [allocation: SpecialEventAllocationData];
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

.cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
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

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--p-surface-300);
  margin-top: 0.25rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.empty-state {
  padding: 1rem 0;
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}
</style>
