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
      <Button
        v-tooltip="'Show zero balances as dashes'"
        :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': dashIfZero }]"
        data-testid="dash-zero-toggle"
        @click="emit('update:dashIfZero', !dashIfZero)"
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
import Tooltip from 'primevue/tooltip';
import { useAccountBalanceStore } from './accountBalanceStore';

const vTooltip = Tooltip;

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

:deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}
</style>
