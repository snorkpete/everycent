<template>
  <div class="summary-strip-mobile" data-testid="account-balance-summary-strip">
    <div class="strip-row">
      <div class="strip-cell" data-testid="summary-total-assets">
        <span class="strip-label">Assets</span>
        <EcMoneyDisplay :model-value="store.totalAssets" emphasis="subtotal" />
      </div>
      <div class="strip-cell" data-testid="summary-total-liabilities">
        <span class="strip-label">Liabilities</span>
        <EcMoneyDisplay :model-value="store.totalLiabilities" emphasis="subtotal" />
      </div>
      <div class="strip-cell" data-testid="summary-net-worth">
        <span class="strip-label strip-label--bold">Net Worth</span>
        <EcMoneyDisplay :model-value="store.netWorth" emphasis="headline" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccountBalanceStore } from './accountBalanceStore';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';

const store = useAccountBalanceStore();
</script>

<style scoped>
.summary-strip-mobile {
  padding: 0.375rem 0.75rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.strip-row {
  display: flex;
  gap: 0.5rem;
}

.strip-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.strip-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.strip-label--bold {
  font-weight: 700;
}
</style>
