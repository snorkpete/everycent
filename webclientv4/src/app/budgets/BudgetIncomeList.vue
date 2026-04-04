<template>
  <div class="budget-income-list">
    <div class="section-header">
      <h3 class="section-title">Incomes</h3>
      <Button
        v-if="store.isEditMode"
        v-tooltip="'Add a new income row'"
        icon="pi pi-plus"
        severity="secondary"
        size="small"
        outlined
        data-testid="add-income-btn"
        @click="addIncome"
      />
    </div>

    <table class="ec-budget-table income-table" :class="{ mobile: isMobile }">
      <thead>
        <tr>
          <th class="col-name">Name</th>
          <th class="col-amount">Amount</th>
          <th v-if="store.isEditMode" class="col-actions"></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(income, index) in incomes"
          :key="income.id ?? `new-${index}`"
          :class="{ 'ec-deleted': income.deleted }"
          data-testid="income-row"
        >
          <td class="col-name">
            <template v-if="store.isEditMode">
              <input
                v-model="income.name"
                type="text"
                class="p-inputtext inline-input"
                data-testid="income-name-input"
              />
            </template>
            <template v-else>
              {{ income.name }}
            </template>
          </td>

          <td class="col-amount">
            <EcMoneyField v-model="income.amount" inline :edit-mode="store.isEditMode" />
          </td>

          <td v-if="store.isEditMode" class="col-actions">
            <EcDeleteButton
              :deleted="income.deleted"
              item-label="income"
              :test-id-prefix="`income-${index}`"
              @toggle="toggleDeleted(income)"
            />
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr data-testid="income-total-row">
          <th class="col-name">Total</th>
          <th class="col-amount">
            <EcMoneyDisplay :model-value="totalAmount" emphasis="total" highlight-mode="none" />
          </th>
          <th v-if="store.isEditMode" class="col-actions"></th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import { useBudgetStore } from './budgetStore';
import { useResponsive } from '../shared/composables/useResponsive';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import EcDeleteButton from '../shared/EcDeleteButton.vue';
import type { IncomeData } from './budget.types';

const { isMobile } = useResponsive();
const store = useBudgetStore();

const incomes = computed(() => store.budget?.incomes ?? []);

const totalAmount = computed(() =>
  incomes.value.filter((i) => !i.deleted).reduce((sum, i) => sum + (i.amount ?? 0), 0),
);

function addIncome() {
  if (!store.budget) return;
  const newIncome: IncomeData = {
    id: 0,
    name: '',
    amount: 0,
    budget_id: store.budget.id,
    comment: '',
  };
  store.addIncome(newIncome);
}

function toggleDeleted(income: IncomeData) {
  income.deleted = !income.deleted;
}
</script>

<style scoped>
/* Shared budget table base — imported unscoped (Vue limitation) */
@import '../shared/styles/budget-table.css';

.budget-income-list {
  padding: 0.75rem 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--p-text-muted-color);
}

/* ── Table ── */
.income-table th,
.income-table td {
  white-space: nowrap;
}

/* ── Footer — thinner top border than shared default ── */
.income-table tfoot th {
  border-top: 2px solid var(--p-surface-400);
  /* position/z-index/bg/font-weight come from ec-budget-table shared rules */
}

/* ── Columns ── */
.col-name {
  min-width: 10rem;
}

.col-amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 8rem;
}

.col-actions {
  width: 3rem;
  text-align: center;
}

/* ── Inline inputs ── */
.inline-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* ── Mobile: relax min-widths, allow wrap ── */
.income-table.mobile th,
.income-table.mobile td {
  white-space: normal;
  padding: 0.4rem 0.5rem;
}

.income-table.mobile .col-name {
  min-width: 0;
}

.income-table.mobile .col-amount {
  min-width: 0;
}
</style>
