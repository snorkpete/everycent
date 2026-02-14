<template>
  <Toolbar data-testid="toolbar">
    <template #start>
      <span class="app-title" data-testid="app-title">EveryCent</span>
      <span v-if="headingStore.heading" class="page-heading" data-testid="page-heading">
        {{ headingStore.heading }}
      </span>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import { useHeadingStore } from './headingStore';

const headingStore = useHeadingStore();
</script>

<style scoped>
.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-left: 0.5rem;
}

.page-heading {
  margin-left: 1.5rem;
  font-size: 1rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>
