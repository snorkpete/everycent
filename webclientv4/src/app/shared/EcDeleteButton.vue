<template>
  <Button
    v-tooltip="tooltipText"
    :icon="deleted ? 'pi pi-undo' : 'pi pi-trash'"
    :severity="deleted ? 'secondary' : 'danger'"
    text
    size="small"
    @click="emit('toggle')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

const { deleted = false, itemLabel = '' } = defineProps<{
  deleted?: boolean;
  itemLabel?: string;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const tooltipText = computed(() =>
  deleted ? `Restore this deleted ${itemLabel}` : `Delete this ${itemLabel}`,
);
</script>
