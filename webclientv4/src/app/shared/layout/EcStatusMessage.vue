<template>
  <div v-if="loading" class="ec-status-message" data-testid="status-message">Loading...</div>
  <div v-else-if="error" class="ec-status-message ec-status-message--error" data-testid="status-message">{{ error }}</div>
</template>

<script setup lang="ts">
const { loading, error } = defineProps<{
  loading?: boolean;
  error?: string | null;
}>();
</script>

<style scoped>
.ec-status-message {
  padding: 1rem;
  text-align: center;
  color: var(--p-text-muted-color);
}
.ec-status-message--error {
  color: var(--p-red-600);
}
</style>
