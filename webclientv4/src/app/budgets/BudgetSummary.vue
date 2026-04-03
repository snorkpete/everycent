<template>
  <div class="budget-summary" data-testid="budget-summary">
    <div class="summary-header">
      <h3 class="section-title">Spending Breakdown</h3>
    </div>

    <div class="breakdown-bars">
      <div class="bar-row" data-testid="needs-row">
        <span class="bar-label">Needs</span>
        <div class="bar-track">
          <div class="bar-fill bar-need" :style="{ width: needsPercentage + '%' }"></div>
        </div>
        <EcMoneyDisplay class="bar-amount" :model-value="needsAmount" highlight-mode="none" />
        <span class="bar-percent">{{ needsPercentage }}%</span>
      </div>
      <div class="bar-row" data-testid="wants-row">
        <span class="bar-label">Wants</span>
        <div class="bar-track">
          <div class="bar-fill bar-want" :style="{ width: wantsPercentage + '%' }"></div>
        </div>
        <EcMoneyDisplay class="bar-amount" :model-value="wantsAmount" highlight-mode="none" />
        <span class="bar-percent">{{ wantsPercentage }}%</span>
      </div>
      <div class="bar-row" data-testid="savings-row">
        <span class="bar-label">Savings</span>
        <div class="bar-track">
          <div class="bar-fill bar-savings" :style="{ width: savingsPercentage + '%' }"></div>
        </div>
        <EcMoneyDisplay class="bar-amount" :model-value="savingsAmount" highlight-mode="none" />
        <span class="bar-percent">{{ savingsPercentage }}%</span>
      </div>
    </div>

    <!-- Discretionary detail for couples -->
    <div
      v-if="familyType !== 'single'"
      class="discretionary-detail"
      data-testid="discretionary-section"
    >
      <div class="detail-row" data-testid="wife-amount-row">
        <span class="detail-label">{{ wife }}'s Discretionary</span>
        <EcMoneyDisplay class="detail-amount" :model-value="Math.floor(totalDiscretionaryAmount / 2)" highlight-mode="none" />
      </div>
      <div class="detail-row" data-testid="husband-amount-row">
        <span class="detail-label">{{ husband }}'s Discretionary</span>
        <EcMoneyDisplay class="detail-amount" :model-value="Math.floor(totalDiscretionaryAmount / 2)" highlight-mode="none" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBudgetStore } from './budgetStore';
import { useSettingsStore } from '../settings/settingsStore';
import { useWantsNeedsBudgetBreakdown } from './useWantsNeedsBudgetBreakdown';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';

const budgetStore = useBudgetStore();
const settingsStore = useSettingsStore();

const familyType = computed(() => settingsStore.settings.family_type ?? 'couple');
const wife = computed(() => settingsStore.settings.wife ?? 'Wife');
const husband = computed(() => settingsStore.settings.husband ?? 'Husband');

// Includes all allocations (even deleted) — BudgetSummary shows the full budget picture
const allocations = computed(() => budgetStore.budget?.allocations ?? []);

const totalIncome = computed(() => {
  const incomes = budgetStore.budget?.incomes ?? [];
  return incomes.reduce((sum, i) => sum + (i.amount ?? 0), 0);
});

const totalAllocations = computed(() =>
  allocations.value.reduce((sum, a) => sum + (a.amount ?? 0), 0),
);

const totalDiscretionaryAmount = computed(() => totalIncome.value - totalAllocations.value);

const {
  needsAmount,
  savingsAmount,
  wantsAmount,
  needsPercentage,
  savingsPercentage,
  wantsPercentage,
} = useWantsNeedsBudgetBreakdown(allocations, totalIncome);
</script>

<style scoped>
.budget-summary {
  padding: 0.75rem 1rem;
}

.summary-header {
  margin-bottom: 0.5rem;
}

.section-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--p-text-muted-color);
}

/* ── Bar chart breakdown ── */
.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  width: 4rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: right;
  color: var(--p-text-muted-color);
}

.bar-track {
  flex: 1;
  height: 0.6rem;
  background-color: var(--p-surface-200);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.bar-need {
  background-color: var(--p-blue-500);
}

.bar-want {
  background-color: var(--p-amber-500);
}

.bar-savings {
  background-color: var(--p-green-500);
}

.bar-amount {
  width: 5.5rem;
  text-align: right;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: var(--p-text-color);
}

.bar-percent {
  width: 2.5rem;
  text-align: right;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}

/* ── Discretionary detail ── */
.discretionary-detail {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--p-surface-200);
  display: flex;
  gap: 2rem;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.detail-amount {
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
