<template>
  <div class="page-header" :class="{ compact: isCompact }" data-testid="page-header">
    <h1 v-if="headingStore.heading" class="page-title" data-testid="page-title">
      {{ headingStore.heading }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useHeadingStore } from './headingStore';
import { useResponsive } from '../shared/composables/useResponsive';

const headingStore = useHeadingStore();
const { isCompact } = useResponsive();
</script>

<style scoped>
.page-header {
  padding: 1.1rem 1.5rem 0;
  min-height: 2rem;
}

.page-header.compact {
  padding-left: 3rem;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-surface-800);
  line-height: 1.3;
}
</style>
