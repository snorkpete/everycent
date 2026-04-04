<template>
  <EcPageLayout page-name="account-balances" variant="fixed" content-bg>
    <template #toolbar-left>
      <Button
        label="Adjust Account Balances"
        data-testid="adjust-balances-btn"
        outlined
        size="small"
        @click="showAdjustDialog = true"
      />
    </template>
    <template #toolbar-right>
      <Button
        v-tooltip="'Show zero balances as dashes'"
        :icon="dashIfZero ? 'pi pi-minus' : 'pi pi-hashtag'"
        text
        severity="secondary"
        size="small"
        :class="['icon-btn', { 'icon-btn--active': dashIfZero }]"
        data-testid="dash-zero-toggle"
        @click="dashIfZero = !dashIfZero"
      />
      <label class="toggle-label">
        <ToggleSwitch
          v-model="store.includeClosed"
          data-testid="include-closed-toggle"
          @update:model-value="onToggleChanged"
        />
        <span>Include Closed Accounts?</span>
      </label>
    </template>

    <!-- Summary Strip -->
    <AccountBalanceSummaryStrip v-if="!store.loading && !store.error" />

    <!-- Content -->
    <div class="content-area">
      <div v-if="store.loading" class="loading-message">Loading...</div>
      <div v-else-if="store.error" class="error-message">{{ store.error }}</div>
      <template v-else>
        <div v-if="store.currentAccounts.length" class="content-card">
          <AccountCategoryTable
            heading="Current Accounts"
            :accounts="store.currentAccounts"
            :dash-if-zero="dashIfZero"
            data-testid="current-accounts-table"
          />
        </div>
        <div v-if="store.cashAssetAccounts.length" class="content-card">
          <AccountCategoryTable
            heading="Cash Assets"
            :accounts="store.cashAssetAccounts"
            :dash-if-zero="dashIfZero"
            data-testid="cash-assets-table"
          />
        </div>
        <div v-if="store.nonCashAssetAccounts.length" class="content-card">
          <AccountCategoryTable
            heading="Non Cash Assets"
            :accounts="store.nonCashAssetAccounts"
            :dash-if-zero="dashIfZero"
            data-testid="non-cash-assets-table"
          />
        </div>
        <div v-if="store.creditCardAccounts.length" class="content-card">
          <AccountCategoryTable
            heading="Credit Cards"
            :accounts="store.creditCardAccounts"
            :dash-if-zero="dashIfZero"
            data-testid="credit-cards-table"
          />
        </div>
        <div v-if="store.loanAccounts.length" class="content-card">
          <AccountCategoryTable
            heading="Loans"
            :accounts="store.loanAccounts"
            :dash-if-zero="dashIfZero"
            data-testid="loans-table"
          />
        </div>
      </template>
    </div>

    <!-- Adjust Balances Dialog -->
    <AdjustBalancesDialog v-model:visible="showAdjustDialog" :accounts="store.accounts" />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import { useHeadingStore } from '../toolbar/headingStore';
import { useAccountBalanceStore } from './accountBalanceStore';
import AccountBalanceSummaryStrip from './AccountBalanceSummaryStrip.vue';
import AccountCategoryTable from './AccountCategoryTable.vue';
import AdjustBalancesDialog from './AdjustBalancesDialog.vue';

const headingStore = useHeadingStore();
const store = useAccountBalanceStore();

const dashIfZero = ref(true);
const showAdjustDialog = ref(false);

onMounted(() => {
  headingStore.setHeading('Account Balances');
  store.fetch();
});

async function onToggleChanged() {
  await store.fetch();
}
</script>

<style scoped>
:deep(.icon-btn--active.p-button) {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.content-area {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-bottom: 0.75rem;
}

.content-card {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.5rem;
}

.loading-message,
.error-message {
  padding: 1rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.error-message {
  color: var(--p-red-600);
}
</style>
