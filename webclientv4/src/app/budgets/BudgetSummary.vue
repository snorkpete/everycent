<template>
  <div class="budget-summary" data-testid="budget-summary">
    <!-- Discretionary Amount -->
    <div class="summary-section" data-testid="discretionary-section">
      <h3 class="section-title">Summary</h3>
      <table class="summary-table">
        <tbody>
          <template v-if="familyType === 'single'">
            <tr data-testid="single-person-row">
              <td class="label-cell">{{ singlePerson }}'s Discretionary Amount</td>
              <td class="amount-cell">{{ centsToDollars(totalDiscretionaryAmount) }}</td>
            </tr>
          </template>
          <template v-else>
            <tr data-testid="total-discretionary-row">
              <td class="label-cell">Total Discretionary Amount</td>
              <td class="amount-cell">{{ centsToDollars(totalDiscretionaryAmount) }}</td>
            </tr>
            <tr data-testid="wife-amount-row">
              <td class="label-cell">{{ wife }}'s Amount</td>
              <td class="amount-cell">{{ centsToDollars(Math.floor(totalDiscretionaryAmount / 2)) }}</td>
            </tr>
            <tr data-testid="husband-amount-row">
              <td class="label-cell">{{ husband }}'s Amount</td>
              <td class="amount-cell">{{ centsToDollars(Math.floor(totalDiscretionaryAmount / 2)) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Wants Summary -->
    <div class="summary-section" data-testid="wants-summary-section">
      <h3 class="section-title">Wants Summary</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th class="label-cell">Need, Want or Savings</th>
            <th class="amount-cell">Amount</th>
            <th class="percent-cell">Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr data-testid="needs-row">
            <td class="label-cell">Needs</td>
            <td class="amount-cell">{{ centsToDollars(needsAmount) }}</td>
            <td class="percent-cell">{{ needsPercentage }}%</td>
          </tr>
          <tr data-testid="wants-row">
            <td class="label-cell">Wants</td>
            <td class="amount-cell">{{ centsToDollars(wantsAmount) }}</td>
            <td class="percent-cell">{{ wantsPercentage }}%</td>
          </tr>
          <tr data-testid="savings-row">
            <td class="label-cell">Savings</td>
            <td class="amount-cell">{{ centsToDollars(savingsAmount) }}</td>
            <td class="percent-cell">{{ savingsPercentage }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBudgetStore } from './budgetStore';
import { useSettingsStore } from '../settings/settingsStore';
import { centsToDollars } from '../shared/util/cents-to-dollars';

const budgetStore = useBudgetStore();
const settingsStore = useSettingsStore();

const familyType = computed(() => settingsStore.settings.family_type ?? 'couple');
const wife = computed(() => settingsStore.settings.wife ?? 'Wife');
const husband = computed(() => settingsStore.settings.husband ?? 'Husband');
const singlePerson = computed(() => settingsStore.settings.single_person ?? 'User');

const totalIncome = computed(() => {
  const incomes = budgetStore.budget?.incomes ?? [];
  return incomes.reduce((sum, i) => sum + (i.amount ?? 0), 0);
});

const totalAllocations = computed(() => {
  const allocations = budgetStore.budget?.allocations ?? [];
  return allocations.reduce((sum, a) => sum + (a.amount ?? 0), 0);
});

const totalDiscretionaryAmount = computed(() => totalIncome.value - totalAllocations.value);

const needsAmount = computed(() => {
  const allocations = budgetStore.budget?.allocations ?? [];
  return allocations
    .filter((a) => a.allocation_class === 'need')
    .reduce((sum, a) => sum + (a.amount ?? 0), 0);
});

const savingsAmount = computed(() => {
  const allocations = budgetStore.budget?.allocations ?? [];
  return allocations
    .filter((a) => a.allocation_class === 'savings')
    .reduce((sum, a) => sum + (a.amount ?? 0), 0);
});

const wantsAmount = computed(() => totalIncome.value - needsAmount.value - savingsAmount.value);

const needsPercentage = computed(() => {
  if (totalIncome.value === 0) return 0;
  return Math.round((needsAmount.value / totalIncome.value) * 100);
});

const savingsPercentage = computed(() => {
  if (totalIncome.value === 0) return 0;
  return Math.round((savingsAmount.value / totalIncome.value) * 100);
});

const wantsPercentage = computed(() => {
  if (totalIncome.value === 0) return 0;
  return 100 - needsPercentage.value - savingsPercentage.value;
});
</script>

<style scoped>
.budget-summary {
  padding: 1rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table th,
.summary-table td {
  padding: 0.35rem 0.5rem;
}

.label-cell {
  text-align: right;
  font-weight: bold;
  font-size: 0.875rem;
}

.amount-cell {
  text-align: right;
  width: 8rem;
}

.percent-cell {
  text-align: right;
  width: 6rem;
}

.summary-table thead th {
  border-bottom: 1px solid var(--p-surface-300);
  font-size: 0.875rem;
}
</style>
