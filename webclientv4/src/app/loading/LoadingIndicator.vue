<template>
  <ProgressBar
    v-if="loadingStore.isLoading"
    mode="indeterminate"
    data-testid="progress-bar"
    class="loading-indicator"
  />
</template>

<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
import { useLoadingIndicatorStore } from './loadingIndicatorStore';

const loadingStore = useLoadingIndicatorStore();
</script>

<style scoped>
.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  height: 4px;
}
</style>
