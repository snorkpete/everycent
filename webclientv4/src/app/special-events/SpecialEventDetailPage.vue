<template>
  <div class="special-event-detail-page">
    <div class="toolbar">
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
    </div>

    <div class="header-card" data-testid="event-header">
      <h2 class="event-name">{{ event?.name }}</h2>
      <div class="event-summary">
        <span>Budgeted: {{ centsToDollars(event?.budget_amount) }}</span>
        <span>Actual: {{ centsToDollars(event?.actual_amount) }}</span>
        <span v-if="event?.start_date">Start: {{ formatDate(event.start_date) }}</span>
      </div>
    </div>

    <div class="content-card">
      <DataTable :value="allocations" data-testid="allocations-table">
        <Column field="name" header="Allocation" />
        <Column field="budget_name" header="Budget" />
        <Column field="allocation_category_name" header="Category" />
        <Column field="amount" header="Amount" style="text-align: right">
          <template #body="{ data }">
            {{ centsToDollars(data.amount) }}
          </template>
        </Column>
        <Column field="spent" header="Spent" style="text-align: right">
          <template #body="{ data }">
            {{ centsToDollars(data.spent) }}
          </template>
          <template #footer>
            <span class="total-label">{{ centsToDollars(totalSpent) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <SpecialEventForm
      :visible="formVisible"
      :special-event="event"
      @update:visible="formVisible = $event"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSpecialEventStore } from './specialEventStore';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { formatDate } from '../shared/util/format-date';
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
.special-event-detail-page {
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

.content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.75rem;
}

.total-label {
  font-weight: bold;
}
</style>
