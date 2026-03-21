<template>
  <div class="budget-detail-stub">
    <p>Budget editor not yet implemented. Budget ID: {{ route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHeadingStore } from '../toolbar/headingStore';

const route = useRoute();
const headingStore = useHeadingStore();

onMounted(() => {
  headingStore.setHeading('Budget');
});
</script>

<style scoped>
.budget-detail-stub {
  padding: 2rem;
  text-align: center;
  color: var(--p-text-muted-color);
}
</style>
