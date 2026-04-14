<template>
  <div
    v-if="budgetStore.budget"
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
</template>

<script setup lang="ts">
import { useBudgetSummary } from './useBudgetSummary';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';

const {
  budgetStore,
  totalIncome,
  totalAllocations,
  discretionaryTotal,
  perPersonAmount,
  discretionaryLabel,
  needsPercentage,
  savingsPercentage,
  wantsPercentage,
} = useBudgetSummary();
</script>

<!--
  TODO: .nws-pill, .strip-label, .strip-value, .strip-item style blocks are
  duplicated verbatim in BudgetSummaryStrip.vue (desktop). Style duplication
  between mobile/desktop variants usually signals a missing shared component —
  consider extracting an EcSummaryStrip / EcNwsPill primitive rather than
  dropping into a shared stylesheet.
-->
<style scoped>
.summary-strip--mobile {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.strip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 1rem;
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

.nws-row {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-surface-200);
}

/* Needs/Wants/Savings pills */
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
</style>
