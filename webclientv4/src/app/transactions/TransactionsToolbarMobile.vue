<template>
  <div class="transactions-toolbar-mobile">
    <div class="mobile-selectors">
      <Select
        :model-value="selectedBankAccountId"
        :options="store.bankAccounts"
        option-label="name"
        option-value="id"
        placeholder="Bank Account"
        data-testid="bank-account-select"
        class="mobile-select"
        @update:model-value="(value: number) => emit('update:selectedBankAccountId', value)"
      />
      <Select
        :model-value="selectedBudgetId"
        :options="store.currentAndPastBudgets"
        option-label="name"
        option-value="id"
        placeholder="Budget"
        data-testid="budget-select"
        class="mobile-select"
        @update:model-value="(value: number) => emit('update:selectedBudgetId', value)"
      />
    </div>
    <div class="action-bar">
      <Button
        v-tooltip="'Go to budget'"
        icon="pi pi-book"
        text
        severity="secondary"
        size="small"
        as="a"
        :href="budgetLink"
        data-testid="go-to-budget-link"
      />
      <Button
        v-tooltip="'Toggle between showing zeroes as numbers or dashes'"
        :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': dashIfZero }]"
        data-testid="dash-zero-toggle"
        @click="emit('update:dashIfZero', !dashIfZero)"
      />
      <Button
        v-tooltip="'Refresh transactions'"
        icon="pi pi-refresh"
        text
        severity="secondary"
        size="small"
        data-testid="refresh-btn"
        @click="emit('refresh')"
      />
      <Button
        v-tooltip="'Import or transfer transactions'"
        icon="pi pi-upload"
        text
        severity="secondary"
        size="small"
        data-testid="import-menu-btn"
        @click="toggleImportMenu"
      />
      <Menu ref="importMenuRef" :model="importMenuItems" :popup="true" />
      <div class="spacer" />
      <template v-if="!store.isEditMode">
        <Button label="Edit" size="small" data-testid="edit-btn" @click="store.enterEditMode()" />
      </template>
      <template v-else>
        <Button
          v-tooltip="'Suggest allocations based on previous budget\'s transactions'"
          icon="pi pi-sparkles"
          outlined
          size="small"
          data-testid="auto-allocate-btn"
          @click="emit('autoAllocate')"
        />
        <Button
          v-tooltip="'Add new transaction'"
          icon="pi pi-plus"
          outlined
          size="small"
          data-testid="add-btn-mobile"
          @click="emit('addTransaction')"
        />
        <Button label="Save" data-testid="save-btn" size="small" @click="emit('save')" />
        <Button
          label="Cancel"
          severity="secondary"
          data-testid="cancel-btn"
          size="small"
          @click="emit('cancel')"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Select from 'primevue/select';
import Tooltip from 'primevue/tooltip';
import { useTransactionStore } from './transactionStore';

const { selectedBankAccountId, selectedBudgetId, dashIfZero } = defineProps<{
  selectedBankAccountId: number | null;
  selectedBudgetId: number | null;
  dashIfZero: boolean;
}>();

const emit = defineEmits<{
  'update:selectedBankAccountId': [value: number];
  'update:selectedBudgetId': [value: number];
  'update:dashIfZero': [value: boolean];
  refresh: [];
  save: [];
  cancel: [];
  addTransaction: [];
  autoAllocate: [];
  showImportDialog: [];
  showTransferDialog: [];
  navigateToImport: [];
}>();

const vTooltip = Tooltip;

const store = useTransactionStore();

const budgetLink = computed(() => {
  if (selectedBudgetId) {
    return `#/budgets/${selectedBudgetId}`;
  }
  return '#/budgets';
});

const importMenuRef = ref();
const importMenuItems = computed(() => [
  {
    label: 'Import',
    icon: 'pi pi-upload',
    command: () => emit('showImportDialog'),
  },
  {
    label: 'Import CAMT',
    icon: 'pi pi-file',
    command: () => emit('navigateToImport'),
  },
  {
    label: 'Transfer',
    icon: 'pi pi-arrow-right-arrow-left',
    command: () => emit('showTransferDialog'),
  },
]);

function toggleImportMenu(event: Event) {
  importMenuRef.value.toggle(event);
}
</script>

<style scoped>
.transactions-toolbar-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.mobile-selectors {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-select {
  width: 100%;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.spacer {
  flex: 1;
}

:deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}
</style>
