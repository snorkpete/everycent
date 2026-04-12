<template>
  <EcPageLayout page-name="reports">
    <h2 class="reports-title">Reports</h2>
    <ul class="reports-list">
      <li>
        <RouterLink to="/reports/net-worth" class="reports-link" data-testid="net-worth-link">
          Net Worth Report
        </RouterLink>
      </li>
      <li>
        <a href="/#/reports/category-spending" class="reports-link" data-testid="category-spending-link">
          Category Spending Report
        </a>
      </li>
      <li>
        <a href="/#/reports/needs-vs-wants" class="reports-link" data-testid="needs-vs-wants-link">
          Needs vs Wants Report
        </a>
      </li>
    </ul>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import { useHeadingStore } from '../toolbar/headingStore';

const headingStore = useHeadingStore();

onMounted(() => {
  headingStore.setHeading('Reports');
});
</script>

<style scoped>
.reports-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--p-text-color);
}

.reports-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reports-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.9375rem;
}

.reports-link:hover {
  text-decoration: underline;
}
</style>
