<template>
  <div class="summary-strip" data-testid="account-balance-summary-strip">
    <!-- Primary row: headline numbers -->
    <div class="strip-row strip-row--primary">
      <div class="strip-item">
        <span class="strip-label">Total Assets</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="store.totalAssets"
          highlight-mode="positive"
        />
      </div>
      <div class="strip-divider"></div>
      <div class="strip-item">
        <span class="strip-label">Total Liabilities</span>
        <EcMoneyField label="" :edit-mode="false" :model-value="store.totalLiabilities" />
      </div>
      <div class="strip-item strip-item--net-worth">
        <span class="strip-label">Net Worth</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="store.netWorth"
          highlight-mode="positive"
        />
      </div>
    </div>

    <!-- Secondary row: net worth breakdown by liquidity -->
    <div class="strip-row strip-row--secondary">
      <div class="strip-item strip-item--small">
        <span class="strip-label-small">Current Cash</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="store.netCurrentCash"
          highlight-mode="positive"
        />
      </div>
      <div class="strip-item strip-item--small">
        <span class="strip-label-small">Cash Assets</span>
        <EcMoneyField
          label=""
          :edit-mode="false"
          :model-value="store.netCashAssets"
          highlight-mode="positive"
        />
      </div>
      <div class="strip-item strip-item--small">
        <span class="strip-label-small">Non Cash Assets</span>
        <EcMoneyField label="" :edit-mode="false" :model-value="store.netNonCashAssets" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccountBalanceStore } from './accountBalanceStore';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';

const store = useAccountBalanceStore();
</script>

<style scoped>
.summary-strip {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.5rem 1rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

/* ── Rows ── */
.strip-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.strip-row--primary {
  min-height: 1.5rem;
}

.strip-row--secondary {
  align-self: flex-end;
  gap: 1.25rem;
}

/* ── Items ── */
.strip-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.strip-item--net-worth {
  margin-left: auto;
}

.strip-item--net-worth .strip-label {
  font-weight: 700;
}

/* ── Labels ── */
.strip-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.strip-label-small {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

/* ── Divider ── */
.strip-divider {
  width: 1px;
  height: 1.2rem;
  background-color: var(--p-surface-300);
}

/* ── EcMoneyField inline overrides ── */
.strip-item :deep(.ec-money-field) {
  display: inline;
  text-align: right;
}
.strip-item :deep(.ec-money-field .label) {
  display: none;
}
.strip-item :deep(.money-display) {
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.strip-item--net-worth :deep(.money-display) {
  font-size: 1.05rem;
  font-weight: 700;
}

.strip-item--small :deep(.money-display) {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
