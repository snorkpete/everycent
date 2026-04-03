<template>
  <EcPageLayout page-name="sink-funds" variant="fixed">
    <template #toolbar-left>
      <Select
        v-model="selectedSinkFundId"
        :options="store.sinkFunds"
        option-label="name"
        option-value="id"
        placeholder="Select Sink Fund"
        data-testid="sink-fund-select"
        @update:model-value="onSinkFundChange"
      />
    </template>
    <template #toolbar-right>
      <ToggleSwitch
        v-model="store.showDeactivated"
        data-testid="show-closed-toggle"
        input-id="show-closed-toggle"
      />
      <label for="show-closed-toggle" class="toggle-label">Show Closed Obligations?</label>
      <EcToolbarSeparator />
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
    </template>

    <!-- Content card -->
    <div class="content-card">
      <div v-if="store.loading" class="loading-placeholder" data-testid="loading-placeholder">
        Loading…
      </div>
      <div v-else-if="!store.sinkFund" class="empty-placeholder" data-testid="empty-placeholder">
        Select a sink fund to view obligations.
      </div>
      <SinkFundAllocationTable v-else />
    </div>

    <SinkFundTransferDialog v-model:visible="showTransferDialog" />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcToolbarSeparator from '../shared/layout/EcToolbarSeparator.vue';
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
  store.addObligation();
}
</script>

<style scoped>
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
