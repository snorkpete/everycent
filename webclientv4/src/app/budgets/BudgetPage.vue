<template>
  <div class="budget-page">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <Button
          label="Back to Budget List"
          icon="pi pi-arrow-left"
          outlined
          size="small"
          data-testid="back-btn"
          @click="router.push('/budgets')"
        />
        <a
          :href="`#/transactions?budget_id=${route.params.id}`"
          class="view-transactions-link"
          data-testid="view-transactions-btn"
          >View Transactions</a
        >
      </div>
      <div class="toolbar-right">
        <Button
          v-if="!store.isEditMode"
          label="Edit"
          data-testid="edit-btn"
          size="small"
          @click="store.enterEditMode()"
        />
        <template v-else>
          <Button label="Save" data-testid="save-btn" size="small" @click="onSave" />
          <Button
            label="Cancel"
            severity="secondary"
            data-testid="cancel-btn"
            size="small"
            @click="onCancel"
          />
        </template>
      </div>
    </div>

    <!-- Budget Summary Strip -->
    <BudgetSummaryStrip />

    <!-- Scrollable content area -->
    <div class="content-area">
      <div class="content-card" data-testid="incomes-section">
        <BudgetIncomeList />
      </div>
      <div class="content-card" data-testid="allocations-section">
        <BudgetAllocationList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBudgetStore } from './budgetStore';
import { useNotifications } from '../notifications/useNotifications';
import { useSettingsStore } from '../settings/settingsStore';
import BudgetIncomeList from './BudgetIncomeList.vue';
import BudgetAllocationList from './BudgetAllocationList.vue';
import BudgetSummaryStrip from './BudgetSummaryStrip.vue';

const route = useRoute();
const router = useRouter();
const store = useBudgetStore();
const headingStore = useHeadingStore();
const settingsStore = useSettingsStore();
const notifications = useNotifications();

function updateHeading() {
  const budgetName = store.budget?.name ?? '';
  headingStore.setHeading(budgetName ? `Budget: ${budgetName}` : 'Budget');
}

onMounted(async () => {
  const budgetId = Number(route.params.id);
  await Promise.all([store.fetch(budgetId), settingsStore.fetchAll()]);
  updateHeading();
});

watch(
  () => store.budget?.name,
  () => {
    updateHeading();
  },
);

async function onSave() {
  try {
    await store.save();
    notifications.success('Budget saved');
  } catch {
    notifications.error(store.error ?? 'Failed to save budget');
  }
}

async function onCancel() {
  await store.cancelEdit();
}
</script>

<style scoped>
.budget-page {
  padding: 0.75rem 1.5rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-bottom: 0.75rem;
}

.content-card {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.5rem;
}

.view-transactions-link {
  font-size: 0.875rem;
  color: var(--p-primary-color);
  text-decoration: none;
  white-space: nowrap;
  align-self: center;
}

.view-transactions-link:hover {
  text-decoration: underline;
}
</style>
