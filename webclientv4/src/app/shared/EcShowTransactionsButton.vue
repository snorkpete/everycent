<template>
  <Button
    v-tooltip="'Show transactions for this allocation'"
    icon="pi pi-eye"
    text
    size="small"
    severity="secondary"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button';

const emit = defineEmits<{
  click: [];
}>();
</script>
