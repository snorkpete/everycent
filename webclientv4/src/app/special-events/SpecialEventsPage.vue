<template>
  <EcPageLayout page-name="special-events" variant="fixed">
    <template #toolbar>
      <Button label="Add Special Event" data-testid="add-btn" @click="addEvent" />
      <Button
        label="Refresh"
        severity="secondary"
        data-testid="refresh-btn"
        :loading="store.loading"
        @click="refresh"
      />
    </template>

    <DataTable :value="store.specialEvents" data-testid="events-table">
      <Column field="name" header="Name">
        <template #body="{ data }">
          <a class="event-link" :data-testid="`event-link-${data.id}`" @click="viewEvent(data)">
            {{ data.name }}
          </a>
        </template>
      </Column>
      <Column field="start_date" header="Start Date">
        <template #body="{ data }">
          {{ formatDate(data.start_date) }}
        </template>
      </Column>
      <Column field="budget_amount" header="Budget" style="text-align: right">
        <template #body="{ data }">
          {{ centsToDollars(data.budget_amount) }}
        </template>
      </Column>
      <Column field="actual_amount" header="Actual" style="text-align: right">
        <template #body="{ data }">
          {{ centsToDollars(data.actual_amount) }}
        </template>
      </Column>
      <Column header="Difference" style="text-align: right">
        <template #body="{ data }">
          <span :class="differenceClass(data)">
            {{ centsToDollars(calculateDifference(data)) }}
          </span>
        </template>
      </Column>
      <Column header="Actions" style="width: 120px; text-align: center">
        <template #body="{ data }">
          <Button
            v-tooltip="'Edit special event'"
            icon="pi pi-pencil"
            text
            severity="secondary"
            size="small"
            :data-testid="`edit-btn-${data.id}`"
            @click="editEvent(data)"
          />
          <Button
            v-tooltip="'Delete special event'"
            icon="pi pi-trash"
            text
            severity="danger"
            size="small"
            :data-testid="`delete-btn-${data.id}`"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <SpecialEventForm
      :visible="formVisible"
      :special-event="selectedEvent"
      @update:visible="formVisible = $event"
      @submit="onSubmit"
    />

    <Dialog
      :visible="deleteDialogVisible"
      header="Confirm Delete"
      modal
      :style="{ width: '25rem' }"
      @update:visible="deleteDialogVisible = $event"
    >
      <p>Are you sure you want to delete "{{ eventToDelete?.name }}"?</p>
      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Delete"
            severity="danger"
            data-testid="confirm-delete-btn"
            @click="deleteEvent"
          />
          <Button
            label="Cancel"
            severity="secondary"
            data-testid="cancel-delete-btn"
            @click="deleteDialogVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSpecialEventStore } from './specialEventStore';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/cents-to-dollars';
import { formatDate } from '../shared/util/format-date';
import SpecialEventForm from './SpecialEventForm.vue';
import type { SpecialEventData } from './specialEvent.types';

const router = useRouter();
const store = useSpecialEventStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const formVisible = ref(false);
const selectedEvent = ref<SpecialEventData | null>(null);
const deleteDialogVisible = ref(false);
const eventToDelete = ref<SpecialEventData | null>(null);

onMounted(() => {
  headingStore.setHeading('Special Events');
  refresh();
});

function refresh() {
  store.fetchAll();
}

function addEvent() {
  selectedEvent.value = null;
  formVisible.value = true;
}

function editEvent(event: SpecialEventData) {
  selectedEvent.value = event;
  formVisible.value = true;
}

function viewEvent(event: SpecialEventData) {
  router.push({ name: 'special-event-detail', params: { id: event.id } });
}

function confirmDelete(event: SpecialEventData) {
  eventToDelete.value = event;
  deleteDialogVisible.value = true;
}

async function deleteEvent() {
  if (!eventToDelete.value?.id) return;
  try {
    await store.remove(eventToDelete.value.id);
    notifications.success('Special event deleted');
    deleteDialogVisible.value = false;
    eventToDelete.value = null;
  } catch {
    notifications.error(store.error ?? 'Failed to delete special event');
  }
}

async function onSubmit(data: Partial<SpecialEventData>) {
  try {
    if (data.id) {
      const { id, ...payload } = data;
      await store.update(id, payload);
      notifications.success('Special event updated');
    } else {
      await store.create(data);
      notifications.success('Special event created');
    }
    formVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save special event');
  }
}

function calculateDifference(event: SpecialEventData): number {
  return (event.budget_amount ?? 0) - (event.actual_amount ?? 0);
}

function differenceClass(event: SpecialEventData): string {
  const diff = calculateDifference(event);
  if (diff < 0) return 'negative';
  if (diff > 0) return 'positive';
  return '';
}
</script>

<style scoped>
.event-link {
  color: var(--p-primary-color);
  cursor: pointer;
  text-decoration: none;
}

.event-link:hover {
  text-decoration: underline;
}

.negative {
  color: var(--p-red-600);
}

.positive {
  color: var(--p-green-600);
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
