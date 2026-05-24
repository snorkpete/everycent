<template>
  <!-- TODO(Slice 7): Build out the usage log — paginated table of LLM usage records with cost summary -->
  <EcPageLayout page-name="llm-usage-log">
    <p>Coming soon</p>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import { useHeadingStore } from '../toolbar/headingStore';

const headingStore = useHeadingStore();

onMounted(() => {
  headingStore.setHeading('Usage Log');
});
</script>
