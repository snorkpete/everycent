<template>
  <div class="page-header" data-testid="page-header">
    <h1 v-if="headingStore.heading" class="page-title" data-testid="page-title">
      {{ headingStore.heading }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useHeadingStore } from './headingStore';

const headingStore = useHeadingStore();
</script>

<style scoped>
.page-header {
  padding: 1.1rem 1.5rem 0;
  min-height: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
</style>
