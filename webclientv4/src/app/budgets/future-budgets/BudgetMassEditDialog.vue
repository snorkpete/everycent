<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    modal
    :style="{ width: '72rem', maxWidth: '95vw' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-body">
      <table class="mass-edit-table" :style="tableStyle">
        <thead>
          <tr>
            <th class="name-col sticky-col">Name</th>
            <th v-for="budget in budgets" :key="budget.id" class="amount-col">
              <span class="budget-header-main">{{ budgetHeaderLines(budget.name)[0] }}</span>
              <span class="budget-header-year">{{ budgetHeaderLines(budget.name)[1] }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="sticky-col">
              <InputText
                v-model="formName"
                class="name-input"
                data-testid="name-input"
              />
            </td>
            <td v-for="(_, i) in amounts" :key="amounts[i].budget_id">
              <EcMoneyField
                v-model="amounts[i].amount"
                label=""
                :edit-mode="true"
                :data-testid="`amount-input-${i}`"
              />
            </td>
          </tr>

          <template v-if="type === 'allocation'">
            <tr class="info-row info-row--first">
              <td class="info-label sticky-col">Total Income</td>
              <td v-for="row in amounts" :key="row.budget_id">
                <EcMoneyField :model-value="row.budgetIncome" label="" :edit-mode="false" />
              </td>
            </tr>
            <tr class="info-row">
              <td class="info-label sticky-col">Already Allocated</td>
              <td v-for="row in amounts" :key="row.budget_id">
                <EcMoneyField
                  :model-value="row.totalAllocationsWithoutCurrent"
                  label=""
                  :edit-mode="false"
                />
              </td>
            </tr>
            <tr class="info-row">
              <td class="info-label sticky-col">Discretionary Amount</td>
              <td
                v-for="(row, i) in amounts"
                :key="row.budget_id"
                :data-testid="`discretionary-display-${i}`"
              >
                <EcMoneyField
                  :model-value="
                    row.budgetIncome - row.totalAllocationsWithoutCurrent - row.amount
                  "
                  label=""
                  :edit-mode="false"
                  :highlight-positive="true"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="Save" data-testid="save-btn" @click="saveChanges" />
        <Button
          label="Cancel"
          severity="secondary"
          data-testid="cancel-btn"
          @click="$emit('update:visible', false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import EcMoneyField from '../../shared/form/money-field/EcMoneyField.vue';
import { budgetHeaderLines } from './budgetHeaderLines';
import type { AmountRow, FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

const props = defineProps<{
  visible: boolean;
  type: 'income' | 'allocation';
  name: string;
  budgets: FutureBudgetData[];
  amountsPerBudget: Record<number, { id: number; amount: number }>;
  categoryId?: number;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [payload: MassUpdatePayload];
}>();

const dialogTitle = computed(() => props.name);

// Name col 18rem + each budget col 8rem — forces the table to overflow the dialog body
// so only ~6 columns are visible before horizontal scrolling kicks in.
const tableStyle = computed(() => ({
  width: `calc(18rem + ${props.budgets.length} * 9rem)`,
}));

const formName = ref('');
const amounts = ref<AmountRow[]>([]);

function buildAmounts(): AmountRow[] {
  return props.budgets.map((budget) => {
    const existing = props.amountsPerBudget[budget.id] ?? { id: 0, amount: 0 };
    const originalAmount = existing.amount;

    const budgetIncome =
      props.type === 'allocation'
        ? budget.incomes.reduce((sum, i) => sum + i.amount, 0)
        : 0;

    const totalAllocationsWithoutCurrent =
      props.type === 'allocation'
        ? budget.allocations.reduce((sum, a) => sum + a.amount, 0) - originalAmount
        : 0;

    return {
      id: existing.id,
      amount: existing.amount,
      budget_id: budget.id,
      budgetIncome,
      totalAllocationsWithoutCurrent,
    };
  });
}

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      formName.value = props.name;
      amounts.value = buildAmounts();
    }
  },
);

function saveChanges() {
  const payload: MassUpdatePayload = {
    type: props.type,
    name: formName.value,
    amounts: amounts.value.map((row) => ({
      id: row.id,
      amount: row.amount,
      budget_id: row.budget_id,
    })),
  };

  if (props.type === 'allocation' && props.categoryId != null) {
    payload.allocation_category_id = props.categoryId;
  }

  emit('save', payload);
}
</script>

<style scoped>
.dialog-body {
  overflow-x: auto;
}

.mass-edit-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.mass-edit-table th,
.mass-edit-table td {
  padding: 0.4rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--p-surface-200);
}

.mass-edit-table th {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  border-bottom: 2px solid var(--p-surface-300);
}

.name-col {
  min-width: 18rem;
}

.amount-col {
  min-width: 9rem;
  width: 9rem;
}

.mass-edit-table th.amount-col,
.mass-edit-table td.amount-col {
  text-align: right;
}

.budget-header-main {
  display: block;
  font-size: 0.8rem;
}

.budget-header-year {
  display: block;
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
}

.name-input {
  width: 100%;
}

.info-row td {
  background-color: var(--p-surface-50);
}

.info-row--first td {
  border-top: 2px solid var(--p-surface-300);
  padding-top: 0.6rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Amount inputs fill their fixed column width */
.amount-col :deep(input) {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* Sticky first column — th and td share the class */
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: var(--p-surface-0);
}

/* info rows use a tinted background — carry it through on sticky cells */
.info-row .sticky-col {
  background-color: var(--p-surface-50);
}
</style>
