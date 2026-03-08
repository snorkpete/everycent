<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    modal
    :style="{ width: '56rem', maxWidth: '95vw' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-body">
      <table class="mass-edit-table">
        <thead>
          <tr>
            <th class="name-col">Name</th>
            <th v-for="budget in budgets" :key="budget.id" class="amount-col">
              {{ budget.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <InputText
                v-model="formName"
                class="name-input"
                data-testid="name-input"
              />
            </td>
            <td v-for="(row, i) in amounts" :key="i">
              <EcMoneyField
                v-model="amounts[i].amount"
                label=""
                :edit-mode="true"
                :data-testid="`amount-input-${i}`"
              />
            </td>
          </tr>

          <template v-if="type === 'allocation'">
            <tr class="info-row">
              <td class="info-label">Total Income</td>
              <td v-for="(row, i) in amounts" :key="i">
                <EcMoneyField :model-value="row.budgetIncome" label="" :edit-mode="false" />
              </td>
            </tr>
            <tr class="info-row">
              <td class="info-label">Other Allocations</td>
              <td v-for="(row, i) in amounts" :key="i">
                <EcMoneyField
                  :model-value="row.totalAllocationsWithoutCurrent"
                  label=""
                  :edit-mode="false"
                />
              </td>
            </tr>
            <tr class="info-row">
              <td class="info-label">Discretionary Amount</td>
              <td
                v-for="(row, i) in amounts"
                :key="i"
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

const dialogTitle = computed(() =>
  props.type === 'income' ? 'Mass Edit Income' : 'Mass Edit Allocation',
);

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
  width: 100%;
  border-collapse: collapse;
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
  min-width: 14rem;
}

.amount-col {
  min-width: 6rem;
}

th.amount-col {
  text-align: right;
}

.name-input {
  width: 100%;
}

.info-row td {
  background-color: var(--p-surface-50);
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
</style>
