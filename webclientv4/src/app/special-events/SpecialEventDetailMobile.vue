<template>
  <div class="detail-mobile">
    <div class="header-card" data-testid="event-header">
      <h2 class="event-name">{{ event?.name }}</h2>
      <div class="summary-grid">
        <span class="summary-item" data-testid="summary-budget">
          <span class="summary-label">Budget</span>
          <EcMoneyDisplay :model-value="event?.budget_amount ?? 0" highlight-mode="none" />
        </span>
        <span class="summary-item" data-testid="summary-actual">
          <span class="summary-label">Actual</span>
          <EcMoneyDisplay :model-value="event?.actual_amount ?? 0" highlight-mode="none" />
        </span>
        <span v-if="event?.start_date" class="summary-item" data-testid="summary-date">
          <span class="summary-label">Start</span>
          <span>{{ formatDate(event.start_date) }}</span>
        </span>
        <span class="summary-item" data-testid="summary-spent">
          <span class="summary-label">Spent</span>
          <EcMoneyDisplay :model-value="totalSpent" highlight-mode="none" />
        </span>
      </div>
    </div>

    <ul v-if="allocations.length > 0" class="cards-list">
      <li
        v-for="allocation in allocations"
        :key="allocation.key"
        class="allocation-card"
        data-testid="allocation-card"
        @click="toggleExpanded(allocation.key)"
      >
        <div class="card-main">
          <i
            class="pi card-chevron"
            :class="expandedKey === allocation.key ? 'pi-chevron-down' : 'pi-chevron-right'"
          ></i>
          <span class="card-name" data-testid="card-name">{{ allocation.name }}</span>
          <span class="card-spent">
            <EcMoneyDisplay :model-value="allocation.spent ?? 0" highlight-mode="none" />
          </span>
          <!-- EcShowTransactionsButton emits click without the event, so @click.stop on it would throw -->
          <span class="card-eye" @click.stop>
            <EcShowTransactionsButton
              data-testid="show-transactions-btn"
              @click="showTransactions(allocation)"
            />
          </span>
        </div>

        <div
          v-if="expandedKey === allocation.key"
          class="card-detail"
          data-testid="card-detail"
          @click.stop
        >
          <div class="detail-grid">
            <span class="detail-item" data-testid="detail-budget-name">
              <span class="detail-label">Budget</span>
              <span>{{ allocation.budget_name }}</span>
            </span>
            <span class="detail-item" data-testid="detail-category">
              <span class="detail-label">Category</span>
              <span>{{ allocation.allocation_category_name }}</span>
            </span>
            <span class="detail-item" data-testid="detail-amount">
              <span class="detail-label">Budgeted</span>
              <EcMoneyDisplay :model-value="allocation.amount ?? 0" highlight-mode="none" />
            </span>
            <span class="detail-item" data-testid="detail-spent">
              <span class="detail-label">Spent</span>
              <EcMoneyDisplay :model-value="allocation.spent ?? 0" highlight-mode="none" />
            </span>
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="empty-state" data-testid="empty-state">
      No allocations yet. Tap Adjust Allocations to add some.
    </div>

    <AllocationTransactionsDialog
      :visible="dialogVisible"
      :allocation-id="selectedAllocationId"
      :allocation-name="selectedAllocationName"
      :allocations="selectedAllocations"
      :fetch-transactions="budgetApi.getTransactionsForAllocation"
      @update:visible="dialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import { formatDate } from '../shared/util/formatDate';
import EcShowTransactionsButton from '../shared/EcShowTransactionsButton.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from '../budgets/budgetApi';
import type { TransactionsDialogAllocation } from '../shared/allocationTransactions.types';
import type { SpecialEventData, SpecialEventAllocationRow } from './specialEvent.types';

defineProps<{
  event: SpecialEventData | null;
  allocations: SpecialEventAllocationRow[];
  totalSpent: number;
}>();

const expandedKey = ref<string | null>(null);
const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');
const selectedAllocations = ref<TransactionsDialogAllocation[]>();

function showTransactions(allocation: SpecialEventAllocationRow) {
  selectedAllocationId.value = allocation.ids[0] ?? 0;
  selectedAllocationName.value = allocation.name;
  // Only a merged row needs the multi-allocation dialog; single rows use the original props.
  selectedAllocations.value =
    allocation.dialogAllocations.length > 1 ? allocation.dialogAllocations : undefined;
  dialogVisible.value = true;
}

function toggleExpanded(key: string) {
  expandedKey.value = expandedKey.value === key ? null : key;
}
</script>

<style scoped>
.detail-mobile {
  flex: 1;
  overflow: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-card {
  padding: 0.75rem;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  flex-shrink: 0;
}

.event-name {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.allocation-card {
  padding: 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  cursor: pointer;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-chevron {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}

.card-name {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.card-spent {
  flex-shrink: 0;
}

.card-eye {
  flex-shrink: 0;
}

.card-detail {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--p-surface-200);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--p-text-muted-color);
}
</style>
