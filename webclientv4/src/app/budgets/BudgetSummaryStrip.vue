<template>
  <!-- Mobile: stacked grid -->
  <div
    v-if="budgetStore.budget && isMobile"
    class="summary-strip summary-strip--mobile"
    data-testid="budget-summary-strip"
  >
    <div class="strip-grid">
      <div class="strip-item">
        <span class="strip-label">Income</span>
        <EcMoneyDisplay class="strip-value" :model-value="totalIncome" highlight-mode="none" />
      </div>
      <div class="strip-item">
        <span class="strip-label">Allocated</span>
        <EcMoneyDisplay class="strip-value" :model-value="totalAllocations" highlight-mode="none" />
      </div>
      <div class="strip-item">
        <span class="strip-label">Unallocated</span>
        <EcMoneyDisplay
          class="strip-value"
          :model-value="discretionaryTotal"
          highlight-mode="balance"
          data-testid="unallocated-amount"
        />
      </div>
      <div class="strip-item">
        <span class="strip-label">{{ discretionaryLabel }}</span>
        <EcMoneyDisplay
          class="strip-value"
          :model-value="perPersonAmount"
          highlight-mode="balance"
          data-testid="discretionary-amount"
        />
      </div>
    </div>
    <div class="nws-row">
      <span v-tooltip="'Needs'" class="nws-pill nws-need">N {{ needsPercentage }}%</span>
      <span v-tooltip="'Wants'" class="nws-pill nws-want">W {{ wantsPercentage }}%</span>
      <span v-tooltip="'Savings'" class="nws-pill nws-savings">S {{ savingsPercentage }}%</span>
    </div>
  </div>

  <!-- Desktop: horizontal strip -->
  <div v-else-if="budgetStore.budget" class="summary-strip" data-testid="budget-summary-strip">
    <div class="strip-item">
      <span class="strip-label">Income</span>
      <EcMoneyDisplay class="strip-value" :model-value="totalIncome" highlight-mode="none" />
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">Allocated</span>
      <EcMoneyDisplay class="strip-value" :model-value="totalAllocations" highlight-mode="none" />
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">Unallocated</span>
      <EcMoneyDisplay
        class="strip-value"
        :model-value="discretionaryTotal"
        highlight-mode="balance"
        data-testid="unallocated-amount"
      />
    </div>
    <div class="strip-divider"></div>
    <div class="strip-item">
      <span class="strip-label">{{ discretionaryLabel }}</span>
      <EcMoneyDisplay
        class="strip-value discretionary-value"
        :model-value="perPersonAmount"
        highlight-mode="balance"
        data-testid="discretionary-amount"
      />
    </div>
    <div class="strip-item needs-wants-savings">
      <span v-tooltip="'Needs'" class="nws-pill nws-need">N {{ needsPercentage }}%</span>
      <span v-tooltip="'Wants'" class="nws-pill nws-want">W {{ wantsPercentage }}%</span>
      <span v-tooltip="'Savings'" class="nws-pill nws-savings">S {{ savingsPercentage }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBudgetStore } from './budgetStore';
import { useResponsive } from '../shared/composables/useResponsive';
import { useSettingsStore } from '../settings/settingsStore';
import { useWantsNeedsBudgetBreakdown } from './useWantsNeedsBudgetBreakdown';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';

const { isMobile } = useResponsive();
const budgetStore = useBudgetStore();
const settingsStore = useSettingsStore();

const familyType = computed(() => settingsStore.settings.family_type ?? 'couple');
const wife = computed(() => settingsStore.settings.wife ?? 'Wife');
const husband = computed(() => settingsStore.settings.husband ?? 'Husband');
const singlePerson = computed(() => settingsStore.settings.single_person ?? 'User');

const activeAllocations = computed(
  () => budgetStore.budget?.allocations?.filter((a) => !a.deleted) ?? [],
);

const totalIncome = computed(() => {
  const incomes = budgetStore.budget?.incomes ?? [];
  return incomes.filter((i) => !i.deleted).reduce((sum, i) => sum + (i.amount ?? 0), 0);
});

const totalAllocations = computed(() =>
  activeAllocations.value.reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

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

const { needsPercentage, savingsPercentage, wantsPercentage } = useWantsNeedsBudgetBreakdown(
  activeAllocations,
  totalIncome,
);
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
  background-color: var(--p-blue-100);
  color: var(--p-blue-800);
}

.nws-want {
  background-color: var(--p-amber-100);
  color: var(--p-amber-800);
}

.nws-savings {
  background-color: var(--p-green-100);
  color: var(--p-green-800);
}

/* ── Mobile stacked layout ── */
.summary-strip--mobile {
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
}

.strip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 1rem;
}

.nws-row {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-surface-200);
}
</style>
