<template>
  <Button
    v-tooltip="tooltipText"
    :icon="isDeleted ? 'pi pi-undo' : 'pi pi-trash'"
    :severity="isDeleted ? 'secondary' : 'danger'"
    :data-testid="testId"
    text
    size="small"
    @click="emit('toggle')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

const { deleted = false, itemLabel = '', testIdPrefix = '' } = defineProps<{
  deleted?: boolean | null;
  itemLabel?: string;
  testIdPrefix?: string;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const isDeleted = computed(() => !!deleted);

const tooltipText = computed(() =>
  isDeleted.value ? `Restore this deleted ${itemLabel}` : `Delete this ${itemLabel}`,
);

const testId = computed(() => {
  if (!testIdPrefix) return undefined;
  return isDeleted.value ? `${testIdPrefix}-restore-btn` : `${testIdPrefix}-delete-btn`;
});
</script>
