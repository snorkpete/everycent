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
          <EcMoneyDisplay :model-value="data.budget_amount ?? 0" highlight-mode="none" />
        </template>
      </Column>
      <Column field="actual_amount" header="Actual" style="text-align: right">
        <template #body="{ data }">
          <EcMoneyDisplay :model-value="data.actual_amount ?? 0" highlight-mode="none" />
        </template>
      </Column>
      <Column header="Difference" style="text-align: right">
        <template #body="{ data }">
          <EcMoneyDisplay :model-value="calculateDifference(data)" highlight-mode="balance" />
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
      @save="onSubmit"
    />

    <ConfirmDialog />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSpecialEventStore } from './specialEventStore';
import { useNotifications } from '../notifications/useNotifications';
import { formatDate } from '../shared/util/formatDate';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import SpecialEventForm from './SpecialEventForm.vue';
import type { SpecialEventData } from './specialEvent.types';

const router = useRouter();
const store = useSpecialEventStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();
const confirm = useConfirm();

const formVisible = ref(false);
const selectedEvent = ref<SpecialEventData | null>(null);

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
  confirm.require({
    header: 'Confirm Delete',
    message: `Are you sure you want to delete "${event.name}"?`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: () => deleteEvent(event),
  });
}

async function deleteEvent(event: SpecialEventData) {
  if (!event.id) return;
  try {
    await store.remove(event.id);
    notifications.success('Special event deleted');
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
</style>
