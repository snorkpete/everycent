<template>
  <div class="sink-funds-toolbar-mobile">
    <Select
      :model-value="selectedSinkFundId"
      :options="store.sinkFunds"
      option-label="name"
      option-value="id"
      placeholder="Select Sink Fund"
      data-testid="sink-fund-select"
      class="sink-fund-select"
      @update:model-value="(value: number) => emit('update:selectedSinkFundId', value)"
    />
    <div class="action-bar">
      <EcToggleButton
        :model-value="dashIfZero"
        variant="dashIfZero"
        tooltip="Toggle between showing zeroes as numbers or dashes"
        data-testid="dash-zero-toggle"
        @update:model-value="emit('update:dashIfZero', $event)"
      />
      <ToggleSwitch
        v-model="store.showDeactivated"
        data-testid="show-closed-toggle"
        input-id="show-closed-toggle"
      />
      <label for="show-closed-toggle" class="closed-label" data-testid="closed-label">Closed</label>
      <div class="spacer" />
      <template v-if="!store.isEditMode">
        <Button
          v-tooltip="'Transfer money between obligations'"
          icon="pi pi-arrow-right-arrow-left"
          text
          severity="secondary"
          size="small"
          data-testid="transfer-btn"
          @click="emit('transfer')"
        />
        <Button label="Edit" size="small" data-testid="edit-btn" @click="store.enterEditMode()" />
      </template>
      <template v-else>
        <Button
          v-tooltip="'Add obligation'"
          icon="pi pi-plus"
          outlined
          size="small"
          data-testid="add-obligation-btn"
          @click="emit('addObligation')"
        />
        <Button label="Save" size="small" data-testid="save-btn" @click="emit('save')" />
        <Button
          label="Cancel"
          severity="secondary"
          size="small"
          data-testid="cancel-btn"
          @click="emit('cancel')"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import EcToggleButton from '../shared/EcToggleButton.vue';
import { useSinkFundStore } from './sinkFundStore';

const { selectedSinkFundId, dashIfZero } = defineProps<{
  selectedSinkFundId: number | null;
  dashIfZero: boolean;
}>();

const emit = defineEmits<{
  'update:selectedSinkFundId': [value: number];
  'update:dashIfZero': [value: boolean];
  transfer: [];
  save: [];
  cancel: [];
  addObligation: [];
}>();

const store = useSinkFundStore();
</script>

<style scoped>
.sink-funds-toolbar-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.sink-fund-select {
  width: 100%;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.spacer {
  flex: 1;
}

.closed-label {
  font-size: 0.875rem;
  color: var(--p-text-color);
  white-space: nowrap;
  cursor: pointer;
}
</style>
