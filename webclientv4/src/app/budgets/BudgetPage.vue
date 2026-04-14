<template>
  <EcPageLayout page-name="budget" variant="fixed">
    <!-- Mobile toolbar -->
    <template v-if="isMobile" #toolbar>
      <BudgetPageToolbarMobile
        :transactions-href="`#/transactions?budget_id=${route.params.id}`"
        @back="router.push('/budgets')"
      />
      <template v-if="!store.isEditMode">
        <Button label="Edit" data-testid="edit-btn" size="small" @click="store.enterEditMode()" />
      </template>
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
    </template>

    <!-- Desktop toolbar -->
    <template v-if="!isMobile" #toolbar-left>
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
    </template>
    <template v-if="!isMobile" #toolbar-right>
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
    </template>

    <!-- Budget Summary Strip -->
    <BudgetSummaryStripMobile v-if="isMobile" />
    <BudgetSummaryStrip v-else />

    <!-- Scrollable content area -->
    <div class="content-area">
      <div class="content-card" data-testid="incomes-section">
        <BudgetIncomeList />
      </div>
      <div class="content-card" data-testid="allocations-section">
        <BudgetAllocationListMobile v-if="isMobile" />
        <BudgetAllocationList v-else />
      </div>
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBudgetStore } from './budgetStore';
import { useNotifications } from '../notifications/useNotifications';
import { useSettingsStore } from '../settings/settingsStore';
import { useResponsive } from '../shared/composables/useResponsive';
import BudgetIncomeList from './BudgetIncomeList.vue';
import BudgetAllocationList from './BudgetAllocationList.vue';
import BudgetAllocationListMobile from './BudgetAllocationListMobile.vue';
import BudgetSummaryStrip from './BudgetSummaryStrip.vue';
import BudgetSummaryStripMobile from './BudgetSummaryStripMobile.vue';
import BudgetPageToolbarMobile from './BudgetPageToolbarMobile.vue';

const { isMobile } = useResponsive();
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
