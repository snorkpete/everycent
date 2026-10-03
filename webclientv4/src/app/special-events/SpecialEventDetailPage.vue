<template>
  <EcPageLayout page-name="special-event-detail" variant="fixed">
    <template #toolbar>
      <Button
        v-tooltip="'Return to special events list'"
        icon="pi pi-arrow-left"
        :label="isMobile ? undefined : 'Back'"
        severity="secondary"
        data-testid="back-btn"
        @click="goBack"
      />
      <Button
        v-tooltip="'Edit this special event\'s name, budget, and date'"
        :label="isMobile ? undefined : 'Edit Details'"
        :icon="isMobile ? 'pi pi-pencil' : undefined"
        data-testid="edit-btn"
        @click="editEvent"
      />
      <Button
        v-tooltip="'Add or remove allocations for this special event'"
        :label="isMobile ? undefined : 'Adjust Allocations'"
        :icon="isMobile ? 'pi pi-sliders-h' : undefined"
        data-testid="adjust-allocations-btn"
        @click="adjustAllocations"
      />
      <Button
        v-tooltip="
          'Toggle between merging same-named allocations across budgets and listing each budget separately'
        "
        :label="isMobile ? undefined : isSummed ? 'Summed' : 'By Budget'"
        :icon="isSummed ? 'pi pi-link' : 'pi pi-list'"
        :outlined="isSummed"
        data-testid="summed-toggle"
        @click="toggleSummed"
      />
      <Button
        v-tooltip="'Reload this special event\'s data'"
        :label="isMobile ? undefined : 'Refresh'"
        :icon="isMobile ? 'pi pi-refresh' : undefined"
        severity="secondary"
        data-testid="refresh-btn"
        :loading="store.loading"
        @click="refresh"
      />
    </template>

    <SpecialEventDetailMobile
      v-if="isMobile"
      :event="event"
      :allocations="rows"
      :total-spent="totalSpent"
    />

    <div v-else class="scroll-content">
      <div class="header-card" data-testid="event-header">
        <h2 class="event-name">{{ event?.name }}</h2>
        <div class="event-summary">
          <span
            >Budgeted:
            <EcMoneyDisplay :model-value="event?.budget_amount ?? 0" highlight-mode="none"
          /></span>
          <span
            >Actual: <EcMoneyDisplay :model-value="event?.actual_amount ?? 0" highlight-mode="none"
          /></span>
          <span v-if="event?.start_date">Start: {{ formatDate(event.start_date) }}</span>
        </div>
      </div>

      <DataTable :value="rows" data-key="key" data-testid="allocations-table">
        <Column field="name" header="Allocation" />
        <Column field="budget_name" header="Budget">
          <template #body="{ data }">
            <span
              v-tooltip="data.ids.length > 1 ? data.budget_name : undefined"
              class="budget-name-cell"
              data-testid="budget-name-cell"
              >{{ data.budget_name }}</span
            >
          </template>
        </Column>
        <Column field="allocation_category_name" header="Category" />
        <Column field="amount" header="Amount" style="text-align: right">
          <template #body="{ data }">
            <EcMoneyDisplay :model-value="data.amount ?? 0" highlight-mode="none" />
          </template>
        </Column>
        <Column field="spent" header="Spent" style="text-align: right">
          <template #body="{ data }">
            <span class="spent-cell">
              <EcShowTransactionsButton
                data-testid="show-transactions-btn"
                @click="showTransactions(data)"
              />
              <EcMoneyDisplay :model-value="data.spent ?? 0" highlight-mode="none" />
            </span>
          </template>
          <template #footer>
            <EcMoneyDisplay :model-value="totalSpent" highlight-mode="none" emphasis="total" />
          </template>
        </Column>
      </DataTable>

      <AllocationTransactionsDialog
        :visible="dialogVisible"
        :allocation-id="selectedAllocationId"
        :allocation-name="selectedAllocationName"
        :allocations="selectedAllocations"
        :fetch-transactions="budgetApi.getTransactionsForAllocation"
        @update:visible="dialogVisible = $event"
      />
    </div>

    <SpecialEventForm
      :visible="formVisible"
      :special-event="event"
      @update:visible="formVisible = $event"
      @save="onSubmit"
    />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSpecialEventStore } from './specialEventStore';
import { useNotifications } from '../notifications/useNotifications';
import { useResponsive } from '../shared/composables/useResponsive';
import { formatDate } from '../shared/util/formatDate';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import SpecialEventForm from './SpecialEventForm.vue';
import SpecialEventDetailMobile from './SpecialEventDetailMobile.vue';
import EcShowTransactionsButton from '../shared/EcShowTransactionsButton.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from '../budgets/budgetApi';
import { useSpecialEventAllocationRows } from './useSpecialEventAllocationRows';
import type { TransactionsDialogAllocation } from '../shared/allocationTransactions.types';
import type { SpecialEventData, SpecialEventAllocationRow } from './specialEvent.types';

const route = useRoute();
const router = useRouter();
const store = useSpecialEventStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();
const { isMobile } = useResponsive();

const formVisible = ref(false);
const dialogVisible = ref(false);
const selectedAllocationId = ref(0);
const selectedAllocationName = ref('');
const selectedAllocations = ref<TransactionsDialogAllocation[]>();

const event = computed(() => store.currentSpecialEvent);
const allocations = computed(() => event.value?.allocations ?? []);
const { isSummed, toggleSummed, rows, totalSpent } = useSpecialEventAllocationRows(allocations);

onMounted(() => {
  headingStore.setHeading('Special Event');
  const id = Number(route.params.id);
  if (id) {
    store.fetchOne(id);
  }
});

function showTransactions(row: SpecialEventAllocationRow) {
  selectedAllocationId.value = row.ids[0] ?? 0;
  selectedAllocationName.value = row.name;
  // Only a merged row needs the multi-allocation dialog; single rows use the original props.
  selectedAllocations.value = row.dialogAllocations.length > 1 ? row.dialogAllocations : undefined;
  dialogVisible.value = true;
}

function goBack() {
  router.push({ name: 'special-events' });
}

function editEvent() {
  formVisible.value = true;
}

function adjustAllocations() {
  router.push({ name: 'special-event-allocations', params: { id: route.params.id } });
}

function refresh() {
  const id = Number(route.params.id);
  if (id) {
    store.fetchOne(id);
  }
}

async function onSubmit(data: Partial<SpecialEventData>) {
  if (!data.id) return;
  try {
    await store.update(data.id, data);
    notifications.success('Special event updated');
    formVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to update special event');
  }
}
</script>

<style scoped>
.scroll-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-card {
  padding: 1rem 1.5rem;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  flex-shrink: 0;
}

.event-name {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.event-summary {
  display: flex;
  gap: 1.5rem;
  color: var(--p-surface-600);
  font-size: 0.9rem;
}

.budget-name-cell {
  display: inline-block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.spent-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.spent-cell :deep(.p-button) {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.spent-cell:hover :deep(.p-button) {
  opacity: 1;
}
</style>
