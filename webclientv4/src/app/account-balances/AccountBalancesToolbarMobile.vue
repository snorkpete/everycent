<template>
  <div class="toolbar-mobile">
    <div class="action-bar">
      <Button
        label="Adjust"
        icon="pi pi-sliders-h"
        outlined
        size="small"
        data-testid="adjust-balances-btn"
        @click="emit('adjust')"
      />
      <div class="spacer" />
      <EcToggleButton
        :model-value="dashIfZero"
        variant="dashIfZero"
        tooltip="Show zero balances as dashes"
        data-testid="dash-zero-toggle"
        @update:model-value="emit('update:dashIfZero', $event)"
      />
      <ToggleSwitch
        v-model="store.includeClosed"
        data-testid="include-closed-toggle"
        input-id="include-closed-toggle"
        @update:model-value="emit('toggleClosed')"
      />
      <label for="include-closed-toggle" class="closed-label" data-testid="closed-label"
        >Closed</label
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import EcToggleButton from '../shared/EcToggleButton.vue';
import { useAccountBalanceStore } from './accountBalanceStore';

const { dashIfZero } = defineProps<{
  dashIfZero: boolean;
}>();

const emit = defineEmits<{
  'update:dashIfZero': [value: boolean];
  adjust: [];
  toggleClosed: [];
}>();

const store = useAccountBalanceStore();
</script>

<style scoped>
.toolbar-mobile {
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
