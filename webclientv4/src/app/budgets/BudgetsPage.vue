<template>
  <div class="budgets-page">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <Button
          label="Add New Budget"
          size="small"
          data-testid="add-budget-btn"
          @click="showAddDialog = true"
        />
        <Button
          label="Reopen Last Budget"
          severity="warn"
          size="small"
          data-testid="reopen-btn"
          @click="confirmReopenLast"
        />
      </div>
      <div class="toolbar-right">
        <Button
          icon="pi pi-refresh"
          text
          severity="secondary"
          size="small"
          data-testid="refresh-btn"
          title="Refresh budget list"
          @click="store.fetchAll()"
        />
      </div>
    </div>

    <!-- Budget List -->
    <div class="content-card">
      <table class="budget-table">
        <thead>
          <tr>
            <th class="name-col">Budget</th>
            <th class="status-col">Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="budget in store.budgets" :key="budget.id" data-testid="budget-row">
            <td class="name-cell">
              <a
                class="budget-name-link"
                :data-testid="`budget-name-link-${budget.id}`"
                @click.prevent="goToBudget(budget)"
                >{{ budget.name }}</a
              >
            </td>
            <td class="status-cell">
              <span
                class="status-badge"
                :class="budget.status === 'open' ? 'status-open' : 'status-closed'"
                :data-testid="`status-${budget.id}`"
              >
                {{ budget.status }}
              </span>
            </td>
            <td class="actions-cell">
              <Button
                label="View"
                size="small"
                outlined
                :data-testid="`view-btn-${budget.id}`"
                @click="goToBudget(budget)"
              />
              <Button
                v-if="store.canCopy(budget)"
                label="Copy"
                size="small"
                outlined
                severity="info"
                :data-testid="`copy-btn-${budget.id}`"
                @click="confirmCopy(budget)"
              />
              <Button
                v-if="store.canClose(budget)"
                label="Close"
                size="small"
                outlined
                severity="danger"
                :data-testid="`close-btn-${budget.id}`"
                @click="confirmClose(budget)"
              />
            </td>
          </tr>
          <tr v-if="store.budgets.length === 0 && !store.loading">
            <td colspan="3" class="empty-cell">No budgets found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog />

    <AddBudgetDialog
      :visible="showAddDialog"
      @update:visible="showAddDialog = $event"
      @save="onAddBudget"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBudgetListStore } from './budgetListStore';
import { useNotifications } from '../notifications/useNotifications';
import AddBudgetDialog from './AddBudgetDialog.vue';
import type { BudgetData } from './budget.types';

const store = useBudgetListStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();
const confirm = useConfirm();
const router = useRouter();

const showAddDialog = ref(false);

onMounted(() => {
  headingStore.setHeading('Budgets');
  store.fetchAll();
});

function goToBudget(budget: BudgetData) {
  router.push(`/budgets/${budget.id}`);
}

function confirmCopy(budget: BudgetData) {
  confirm.require({
    header: 'Copy Budget',
    message: 'Are you sure you want to COPY this budget?',
    acceptLabel: 'Copy',
    rejectLabel: 'Cancel',
    accept: () => onCopy(budget),
  });
}

function confirmClose(budget: BudgetData) {
  confirm.require({
    header: 'Close Budget Period?',
    message: 'Are you ready to close off this budget?',
    acceptLabel: 'Close',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: () => onClose(budget),
  });
}

function confirmReopenLast() {
  confirm.require({
    header: 'Reopen Last Budget',
    message: 'Are you sure you want to open the last closed budget?',
    acceptLabel: 'Reopen',
    rejectLabel: 'Cancel',
    accept: () => onReopenLast(),
  });
}

async function onCopy(budget: BudgetData) {
  try {
    await store.copyBudget(budget.id!);
    notifications.success('Budget copied');
  } catch {
    notifications.error(store.error ?? 'Failed to copy budget');
  }
}

async function onClose(budget: BudgetData) {
  try {
    await store.closeBudget(budget.id!);
    notifications.success('Budget closed');
  } catch {
    notifications.error(store.error ?? 'Failed to close budget');
  }
}

async function onReopenLast() {
  try {
    await store.reopenLastBudget();
    notifications.success('Last budget re-opened');
  } catch {
    notifications.error(store.error ?? 'Failed to reopen budget');
  }
}

async function onAddBudget(startDate: string) {
  try {
    await store.addBudget(startDate);
    notifications.success('Budget created');
  } catch {
    notifications.error(store.error ?? 'Failed to create budget');
  }
}
</script>

<style scoped>
.budgets-page {
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
  gap: 0.5rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.75rem;
}

/* ── Table ── */
.budget-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.budget-table th,
.budget-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  white-space: nowrap;
}

.budget-table thead th {
  font-weight: 600;
  background-color: var(--p-surface-50);
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: none;
  box-shadow: 0 2px 0 var(--p-surface-300);
}

/* ── Columns ── */
.name-col {
  width: 100%;
}

.name-cell {
  font-weight: 500;
}

.budget-name-link {
  color: var(--p-primary-color);
  text-decoration: none;
}

.budget-name-link:hover {
  text-decoration: underline;
}

.status-col {
  min-width: 5rem;
  text-align: center;
}

.status-cell {
  text-align: center;
}

.actions-col {
  min-width: 12rem;
  text-align: right;
}

.actions-cell {
  text-align: right;
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

/* ── Status badges ── */
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-open {
  background-color: var(--p-green-100);
  color: var(--p-green-800);
}

.status-closed {
  background-color: var(--p-surface-100);
  color: var(--p-text-muted-color);
}

/* ── Row hover ── */
.budget-table tbody tr:hover td {
  background-color: var(--p-surface-50);
}

/* ── Empty state ── */
.empty-cell {
  text-align: center;
  color: var(--p-text-muted-color);
  padding: 2rem 0.75rem !important;
}
</style>
