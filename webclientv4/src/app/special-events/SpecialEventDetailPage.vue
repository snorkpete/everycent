<template>
  <EcPageLayout page-name="special-event-detail" variant="fixed">
    <template #toolbar>
      <Button
        v-tooltip="'Return to special events list'"
        icon="pi pi-arrow-left"
        label="Back"
        severity="secondary"
        data-testid="back-btn"
        @click="goBack"
      />
      <Button
        v-tooltip="'Edit this special event\'s name, budget, and date'"
        label="Edit Details"
        data-testid="edit-btn"
        @click="editEvent"
      />
      <Button
        v-tooltip="'Add or remove allocations for this special event'"
        label="Adjust Allocations"
        data-testid="adjust-allocations-btn"
        @click="adjustAllocations"
      />
      <Button
        v-tooltip="'Reload this special event\'s data'"
        label="Refresh"
        severity="secondary"
        data-testid="refresh-btn"
        :loading="store.loading"
        @click="refresh"
      />
    </template>

    <div class="header-card" data-testid="event-header">
      <h2 class="event-name">{{ event?.name }}</h2>
      <div class="event-summary">
        <span>Budgeted: <EcMoneyDisplay :model-value="event?.budget_amount ?? 0" highlight-mode="none" /></span>
        <span>Actual: <EcMoneyDisplay :model-value="event?.actual_amount ?? 0" highlight-mode="none" /></span>
        <span v-if="event?.start_date">Start: {{ formatDate(event.start_date) }}</span>
      </div>
    </div>

    <DataTable :value="allocations" data-testid="allocations-table">
      <Column field="name" header="Allocation" />
      <Column field="budget_name" header="Budget" />
      <Column field="allocation_category_name" header="Category" />
      <Column field="amount" header="Amount" style="text-align: right">
        <template #body="{ data }">
          <EcMoneyDisplay :model-value="data.amount ?? 0" highlight-mode="none" />
        </template>
      </Column>
      <Column field="spent" header="Spent" style="text-align: right">
        <template #body="{ data }">
          <EcMoneyDisplay :model-value="data.spent ?? 0" highlight-mode="none" />
        </template>
        <template #footer>
          <EcMoneyDisplay :model-value="totalSpent" highlight-mode="none" emphasis="total" />
        </template>
      </Column>
    </DataTable>

    <SpecialEventForm
      :visible="formVisible"
      :special-event="event"
      @update:visible="formVisible = $event"
      @submit="onSubmit"
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
import { formatDate } from '../shared/util/format-date';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import SpecialEventForm from './SpecialEventForm.vue';
import type { SpecialEventData } from './specialEvent.types';

const route = useRoute();
const router = useRouter();
const store = useSpecialEventStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const formVisible = ref(false);

const event = computed(() => store.currentSpecialEvent);
const allocations = computed(() => event.value?.allocations ?? []);
const totalSpent = computed(() => allocations.value.reduce((sum, a) => sum + (a.spent ?? 0), 0));

onMounted(() => {
  headingStore.setHeading('Special Event');
  const id = Number(route.params.id);
  if (id) {
    store.fetchOne(id);
  }
});

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
    await store.fetchOne(data.id);
    notifications.success('Special event updated');
    formVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to update special event');
  }
}
</script>

<style scoped>
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

</style>
