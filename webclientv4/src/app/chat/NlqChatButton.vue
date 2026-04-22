<template>
  <Button
    class="chat-fab"
    icon="pi pi-comments"
    rounded
    severity="info"
    v-tooltip.left="'Ask a question about your finances'"
    @click="$emit('toggle')"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button';

defineEmits<{
  toggle: [];
}>();
</script>

<style scoped>
.chat-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 2.75rem;
  height: 2.75rem;
  z-index: 1000;
}
</style>
