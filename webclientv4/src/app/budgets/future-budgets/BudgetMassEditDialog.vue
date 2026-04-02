<template>
  <EcFormDialog
    :visible="visible"
    :header="dialogTitle"
    width="72rem"
    :dialog-style="{ maxWidth: '95vw' }"
    :always-edit="true"
    @update:visible="$emit('update:visible', $event)"
    @save="saveChanges"
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
              <InputText v-model="formName" class="name-input" data-testid="name-input" />
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
            <tr data-testid="fixed-row">
              <td class="info-label sticky-col">Fixed?</td>
              <td v-for="(_, i) in amounts" :key="amounts[i].budget_id" class="center-cell">
                <input
                  v-model="amounts[i].is_fixed_amount"
                  type="checkbox"
                  :data-testid="`fixed-checkbox-${i}`"
                />
              </td>
            </tr>
            <tr data-testid="set-all-fixed-row">
              <td class="info-label sticky-col">Set All Fixed</td>
              <td class="center-cell" :colspan="budgets.length">
                <input
                  v-model="setAllFixed"
                  type="checkbox"
                  data-testid="set-all-fixed-checkbox"
                  @change="onSetAllFixedChange(setAllFixed)"
                />
              </td>
            </tr>
            <tr class="info-row info-row--first">
              <td class="info-label sticky-col">Total Income</td>
              <td v-for="row in amounts" :key="row.budget_id">
                <EcMoneyDisplay :model-value="row.budgetIncome" highlight-mode="none" />
              </td>
            </tr>
            <tr class="info-row">
              <td class="info-label sticky-col">Already Allocated</td>
              <td v-for="row in amounts" :key="row.budget_id">
                <EcMoneyDisplay
                  :model-value="row.totalAllocationsWithoutCurrent"
                  highlight-mode="none"
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
                <EcMoneyDisplay
                  :model-value="row.budgetIncome - row.totalAllocationsWithoutCurrent - row.amount"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </EcFormDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import InputText from 'primevue/inputtext';
import EcFormDialog from '../../shared/form/form-dialog/EcFormDialog.vue';
import EcMoneyField from '../../shared/form/money-field/EcMoneyField.vue';
import EcMoneyDisplay from '../../shared/form/money-field/EcMoneyDisplay.vue';
import { budgetHeaderLines } from './budgetHeaderLines';
import type { AmountRow, FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

const props = defineProps<{
  visible: boolean;
  type: 'income' | 'allocation';
  name: string;
  budgets: FutureBudgetData[];
  amountsPerBudget: Record<number, { id: number; amount: number; is_fixed_amount?: boolean }>;
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
      props.type === 'allocation' ? budget.incomes.reduce((sum, i) => sum + i.amount, 0) : 0;

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
      is_fixed_amount: 'is_fixed_amount' in existing ? existing.is_fixed_amount : false,
    };
  });
}

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      formName.value = props.name;
      amounts.value = buildAmounts();
      setAllFixed.value = amounts.value.length > 0 && amounts.value.every((a) => a.is_fixed_amount);
    }
  },
);

function saveChanges() {
  const payload: MassUpdatePayload = {
    type: props.type,
    name: formName.value,
    amounts: amounts.value.map((row) => {
      const entry: { id: number; amount: number; budget_id: number; is_fixed_amount?: boolean } = {
        id: row.id,
        amount: row.amount,
        budget_id: row.budget_id,
      };
      if (props.type === 'allocation') {
        entry.is_fixed_amount = row.is_fixed_amount ?? false;
      }
      return entry;
    }),
  };

  if (props.type === 'allocation' && props.categoryId != null) {
    payload.allocation_category_id = props.categoryId;
  }

  emit('save', payload);
}

const setAllFixed = ref(false);

function onSetAllFixedChange(checked: boolean) {
  for (const row of amounts.value) {
    row.is_fixed_amount = checked;
  }
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

.center-cell {
  text-align: center;
}
</style>
