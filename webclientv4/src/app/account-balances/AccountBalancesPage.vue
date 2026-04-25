<template>
  <EcPageLayout page-name="account-balances" variant="fixed" content-bg>
    <!-- ── Mobile toolbar ── -->
    <template v-if="isMobile" #toolbar>
      <AccountBalancesToolbarMobile
        v-model:dash-if-zero="dashIfZero"
        @adjust="showAdjustDialog = true"
        @toggle-closed="onToggleChanged"
      />
    </template>

    <!-- ── Desktop toolbar ── -->
    <template v-if="!isMobile" #toolbar-left>
      <Button
        label="Adjust Account Balances"
        data-testid="adjust-balances-btn"
        outlined
        size="small"
        @click="showAdjustDialog = true"
      />
    </template>
    <template v-if="!isMobile" #toolbar-right>
      <EcToggleButton
        v-model="dashIfZero"
        variant="dashIfZero"
        tooltip="Show zero balances as dashes"
        data-testid="dash-zero-toggle"
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
    <AccountBalanceSummaryStripMobile v-if="isMobile && store.ready" />
    <AccountBalanceSummaryStrip v-if="!isMobile && store.ready" />

    <!-- Content -->
    <div class="content-area">
      <EcStatusMessage :loading="store.loading" :error="store.error" />
      <template v-if="store.ready">
        <template v-if="isMobile">
          <AccountCategoryTableMobile
            v-if="store.currentAccounts.length"
            heading="Current Accounts"
            :accounts="store.currentAccounts"
            :dash-if-zero="dashIfZero"
            :expanded="expandedCategory === 'current'"
            data-testid="current-accounts-table"
            @toggle="toggleCategory('current')"
          />
          <AccountCategoryTableMobile
            v-if="store.cashAssetAccounts.length"
            heading="Cash Assets"
            :accounts="store.cashAssetAccounts"
            :dash-if-zero="dashIfZero"
            :expanded="expandedCategory === 'cash-assets'"
            data-testid="cash-assets-table"
            @toggle="toggleCategory('cash-assets')"
          />
          <AccountCategoryTableMobile
            v-if="store.physicalAssetAccounts.length"
            heading="Non Cash Assets"
            :accounts="store.physicalAssetAccounts"
            :dash-if-zero="dashIfZero"
            :expanded="expandedCategory === 'non-cash-assets'"
            data-testid="non-cash-assets-table"
            @toggle="toggleCategory('non-cash-assets')"
          />
          <AccountCategoryTableMobile
            v-if="store.creditCardAccounts.length"
            heading="Credit Cards"
            :accounts="store.creditCardAccounts"
            :dash-if-zero="dashIfZero"
            :expanded="expandedCategory === 'credit-cards'"
            data-testid="credit-cards-table"
            @toggle="toggleCategory('credit-cards')"
          />
          <AccountCategoryTableMobile
            v-if="store.loanAccounts.length"
            heading="Other Loans"
            :accounts="store.loanAccounts"
            :dash-if-zero="dashIfZero"
            :expanded="expandedCategory === 'loans'"
            data-testid="loans-table"
            @toggle="toggleCategory('loans')"
          />
        </template>
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
          <div v-if="store.physicalAssetAccounts.length" class="content-card">
            <AccountCategoryTable
              heading="Non Cash Assets"
              :accounts="store.physicalAssetAccounts"
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
              heading="Other Loans"
              :accounts="store.loanAccounts"
              :dash-if-zero="dashIfZero"
              data-testid="loans-table"
            />
          </div>
        </template>
      </template>
    </div>

    <!-- Adjust Balances Dialog -->
    <AdjustBalancesDialog v-model:visible="showAdjustDialog" :accounts="store.accounts" />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcStatusMessage from '../shared/layout/EcStatusMessage.vue';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import EcToggleButton from '../shared/EcToggleButton.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useAccountBalanceStore } from './accountBalanceStore';
import { useResponsive } from '../shared/composables/useResponsive';
import AccountBalanceSummaryStrip from './AccountBalanceSummaryStrip.vue';
import AccountBalanceSummaryStripMobile from './AccountBalanceSummaryStripMobile.vue';
import AccountCategoryTable from './AccountCategoryTable.vue';
import AccountCategoryTableMobile from './AccountCategoryTableMobile.vue';
import AccountBalancesToolbarMobile from './AccountBalancesToolbarMobile.vue';
import AdjustBalancesDialog from './AdjustBalancesDialog.vue';

const headingStore = useHeadingStore();
const store = useAccountBalanceStore();
const { isMobile } = useResponsive();

const dashIfZero = ref(true);
const showAdjustDialog = ref(false);
const expandedCategory = ref<string | null>(null);

onMounted(() => {
  headingStore.setHeading('Account Balances');
  store.fetch();
});

async function onToggleChanged() {
  await store.fetch();
}

function toggleCategory(category: string) {
  expandedCategory.value = expandedCategory.value === category ? null : category;
}
</script>

<style scoped>
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
</style>
