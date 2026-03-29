<template>
  <div v-if="budgetStore.budget" class="summary-strip" data-testid="budget-summary-strip">
    <div class="strip-item">
      <span class="strip-label">Income</span>
      <span class="strip-value">{{ centsToDollars(totalIncome) }}</span>
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">Allocated</span>
      <span class="strip-value">{{ centsToDollars(totalAllocations) }}</span>
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">Unallocated</span>
      <span class="strip-value" :class="discretionaryClass" data-testid="unallocated-amount">
        {{ centsToDollars(discretionaryTotal) }}
      </span>
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">{{ discretionaryLabel }}</span>
      <span
        class="strip-value discretionary-value"
        :class="discretionaryClass"
        data-testid="discretionary-amount"
      >
        {{ centsToDollars(perPersonAmount) }}
      </span>
    </div>
    <div class="strip-item needs-wants-savings">
      <span class="nws-pill nws-need" title="Needs">N {{ needsPercentage }}%</span>
      <span class="nws-pill nws-want" title="Wants">W {{ wantsPercentage }}%</span>
      <span class="nws-pill nws-savings" title="Savings">S {{ savingsPercentage }}%</span>
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
  return incomes.filter((i) => !i.deleted).reduce((sum, i) => sum + (i.amount ?? 0), 0);
});

const totalAllocations = computed(() => {
  const allocations = budgetStore.budget?.allocations ?? [];
  return allocations.filter((a) => !a.deleted).reduce((sum, a) => sum + (a.amount ?? 0), 0);
});

const discretionaryTotal = computed(() => totalIncome.value - totalAllocations.value);

const perPersonAmount = computed(() => {
  if (familyType.value === 'single') return discretionaryTotal.value;
  return Math.floor(discretionaryTotal.value / 2);
});

const discretionaryLabel = computed(() => {
  if (familyType.value === 'single') {
    return `${singlePerson.value}'s Discretionary`;
  }
  return `${wife.value} / ${husband.value}`;
});

const discretionaryClass = computed(() => {
  if (discretionaryTotal.value < 0) return 'amount-negative';
  if (discretionaryTotal.value === 0) return 'amount-zero';
  return 'amount-positive';
});

// Needs/Wants/Savings percentages
const activeAllocations = computed(
  () => budgetStore.budget?.allocations?.filter((a) => !a.deleted) ?? [],
);

const needsAmount = computed(() =>
  activeAllocations.value
    .filter((a) => a.allocation_class === 'need')
    .reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

const savingsAmount = computed(() =>
  activeAllocations.value
    .filter((a) => a.allocation_class === 'savings')
    .reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

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
.summary-strip {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.strip-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.strip-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color);
}

.strip-value {
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--p-text-color);
}

.strip-divider {
  width: 1px;
  height: 1.2rem;
  background-color: var(--p-surface-300);
}

.discretionary-value {
  font-size: 1.05rem;
  font-weight: 700;
}

.amount-positive {
  color: #16a34a;
}

.amount-negative {
  color: #dc2626;
}

.amount-zero {
  color: var(--p-text-muted-color);
}

/* Needs/Wants/Savings pills */
.needs-wants-savings {
  margin-left: auto;
  gap: 0.35rem;
}

.nws-pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  letter-spacing: 0.02em;
}

.nws-need {
  background-color: #dbeafe;
  color: #1e40af;
}

.nws-want {
  background-color: #fef3c7;
  color: #92400e;
}

.nws-savings {
  background-color: #dcfce7;
  color: #166534;
}
</style>
