<template>
  <div class="sink-funds-page">
    <!-- Zone 1: Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <Select
          v-model="selectedSinkFundId"
          :options="store.sinkFunds"
          option-label="name"
          option-value="id"
          placeholder="Select Sink Fund"
          data-testid="sink-fund-select"
          @update:model-value="onSinkFundChange"
        />
      </div>
      <div class="toolbar-right">
        <ToggleSwitch
          v-model="store.showDeactivated"
          data-testid="show-closed-toggle"
          input-id="show-closed-toggle"
        />
        <label for="show-closed-toggle" class="toggle-label">Show Closed Obligations?</label>
        <span class="toolbar-separator" />
        <template v-if="!store.isEditMode">
          <Button
            label="Transfer Money"
            outlined
            severity="secondary"
            size="small"
            data-testid="transfer-btn"
          />
          <Button label="Edit" size="small" data-testid="edit-btn" @click="store.enterEditMode()" />
        </template>
        <template v-else>
          <Button
            label="Add Obligation"
            outlined
            size="small"
            data-testid="add-obligation-btn"
            @click="onAddObligation"
          />
          <Button label="Save" size="small" data-testid="save-btn" @click="onSave" />
          <Button
            label="Cancel"
            severity="secondary"
            size="small"
            data-testid="cancel-btn"
            @click="onCancel"
          />
        </template>
      </div>
    </div>

    <!-- Content card: placeholder for table (subtask 2) and summary (subtask 3) -->
    <div class="content-card">
      <div v-if="store.loading" class="loading-placeholder" data-testid="loading-placeholder">
        Loading…
      </div>
      <div v-else-if="!store.sinkFund" class="empty-placeholder" data-testid="empty-placeholder">
        Select a sink fund to view obligations.
      </div>
      <SinkFundAllocationTable v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSinkFundStore } from './sinkFundStore';
import { useNotifications } from '../notifications/useNotifications';
import SinkFundAllocationTable from './SinkFundAllocationTable.vue';

const route = useRoute();
const router = useRouter();
const store = useSinkFundStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const selectedSinkFundId = ref<number | null>(null);

onMounted(async () => {
  headingStore.setHeading('Sink Fund Obligations');
  await store.fetchList();

  const queryId = route.query.sink_fund_id ? Number(route.query.sink_fund_id) : null;
  if (queryId) {
    selectedSinkFundId.value = queryId;
    await store.fetchDetail(queryId);
  }
});

async function onSinkFundChange(id: number) {
  selectedSinkFundId.value = id;
  router.replace({ query: { sink_fund_id: id } });
  await store.fetchDetail(id);
}

async function onSave() {
  try {
    await store.save();
    notifications.success('Sink fund saved');
  } catch {
    notifications.error(store.error ?? 'Failed to save sink fund');
  }
}

async function onCancel() {
  await store.cancelEdit();
}

function onAddObligation() {
  if (!store.sinkFund) return;
  if (!store.sinkFund.sink_fund_allocations) {
    store.sinkFund.sink_fund_allocations = [];
  }
  store.sinkFund.sink_fund_allocations.push({
    name: '',
    amount: 0,
    status: 'open',
    unsaved: true,
  });
}
</script>

<style scoped>
.sink-funds-page {
  padding: 0.75rem 1.5rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.toolbar-separator {
  display: block;
  width: 1px;
  height: 1.25rem;
  background-color: var(--p-surface-300);
  margin: 0 0.25rem;
  flex-shrink: 0;
}

.toggle-label {
  font-size: 0.875rem;
  color: var(--p-text-color);
  white-space: nowrap;
  cursor: pointer;
}

.content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.75rem;
}

.loading-placeholder,
.empty-placeholder {
  padding: 2rem;
  color: var(--p-text-muted-color);
  text-align: center;
}
</style>
