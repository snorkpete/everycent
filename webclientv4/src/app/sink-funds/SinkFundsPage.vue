<template>
  <EcPageLayout page-name="sink-funds" variant="fixed">
    <template #toolbar>
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
            size="small"
            data-testid="transfer-btn"
            @click="showTransferDialog = true"
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
    </template>

    <div v-if="store.loading" class="loading-placeholder" data-testid="loading-placeholder">
      Loading…
    </div>
    <div v-else-if="!store.sinkFund" class="empty-placeholder" data-testid="empty-placeholder">
      Select a sink fund to view obligations.
    </div>
    <SinkFundAllocationTable v-else />

    <SinkFundTransferDialog v-model:visible="showTransferDialog" />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSinkFundStore } from './sinkFundStore';
import { useNotifications } from '../notifications/useNotifications';
import SinkFundAllocationTable from './SinkFundAllocationTable.vue';
import SinkFundTransferDialog from './SinkFundTransferDialog.vue';

const route = useRoute();
const router = useRouter();
const store = useSinkFundStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const selectedSinkFundId = ref<number | null>(null);
const showTransferDialog = ref(false);

onMounted(async () => {
  headingStore.setHeading('Sink Fund Obligations');
  await store.fetchAll();

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

.loading-placeholder,
.empty-placeholder {
  padding: 2rem;
  color: var(--p-text-muted-color);
  text-align: center;
}
</style>
