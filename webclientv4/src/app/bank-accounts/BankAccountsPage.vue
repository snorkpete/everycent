<template>
  <EcPageLayout page-name="bank-accounts">
    <EcItemList :items="visibleAccounts" key-field="id">
      <template #item="{ item: account }">
        <span class="account-info">
          <a
            class="account-name"
            :class="{ 'account-name--closed': account.status === 'closed' }"
            href="#"
            :data-testid="`account-link-${account.id}`"
            @click.prevent="viewAccount(account as BankAccountData)"
            >{{ account.name }}</a
          >
          <i
            v-if="account.is_sink_fund"
            v-tooltip.top="{ value: 'Sink fund account', showDelay: 0, hideDelay: 0 }"
            class="pi pi-wallet type-icon"
          />
          <i
            v-if="account.is_credit_card"
            v-tooltip.top="{ value: 'Credit card account', showDelay: 0, hideDelay: 0 }"
            class="pi pi-credit-card type-icon"
          />
          <Tag
            v-if="account.status === 'closed'"
            value="Closed"
            severity="warn"
            icon="pi pi-ban"
            class="status-tag"
            data-testid="closed-tag"
          />
        </span>
        <span class="account-meta">
          <span
            v-if="(account as BankAccountData).institution?.name"
            class="institution-name"
            >{{ (account as BankAccountData).institution?.name }}</span
          >
          <Tag
            v-if="account.account_category"
            :value="categoryLabel(account.account_category as string)"
            :severity="categorySeverity(account.account_category as string)"
            class="category-tag"
          />
        </span>
        <Button
          label="View"
          size="small"
          :data-testid="`view-btn-${account.id}`"
          @click="viewAccount(account as BankAccountData)"
        />
      </template>
      <template #controls>
        <label class="toggle-label">
          <ToggleSwitch
            v-model="showClosed"
            data-testid="show-closed-toggle"
            input-id="show-closed"
          />
          <span>Show Closed Accounts</span>
        </label>
      </template>
      <template #page-actions>
        <Button label="Add Bank Account" data-testid="add-btn" @click="addAccount" />
        <Button label="Refresh" severity="secondary" data-testid="refresh-btn" @click="refresh" />
      </template>
    </EcItemList>

    <BankAccountEditDialog
      :visible="dialogVisible"
      :bank-account="selectedAccount"
      :initial-edit-mode="dialogEditMode"
      :institutions="store.institutions"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ToggleSwitch from 'primevue/toggleswitch';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcItemList from '../shared/layout/EcItemList.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBankAccountStore } from './bankAccountStore';
import { useNotifications } from '../notifications/useNotifications';
import BankAccountEditDialog from './BankAccountEditDialog.vue';
import type { BankAccountData } from './bankAccount.types';

const store = useBankAccountStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const showClosed = ref(false);
const dialogVisible = ref(false);
const selectedAccount = ref<BankAccountData>({});
const dialogEditMode = ref(false);

const visibleAccounts = computed(() =>
  showClosed.value ? store.bankAccounts : store.bankAccounts.filter((a) => a.status !== 'closed'),
);

onMounted(() => {
  headingStore.setHeading('Setup Bank Accounts');
  refresh();
});

function refresh() {
  store.fetchAll();
  store.fetchInstitutions();
}

function viewAccount(account: BankAccountData) {
  selectedAccount.value = account;
  dialogEditMode.value = false;
  dialogVisible.value = true;
}

function addAccount() {
  selectedAccount.value = {};
  dialogEditMode.value = true;
  dialogVisible.value = true;
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    asset: 'Asset',
    liability: 'Liability',
    current: 'Current',
  };
  return labels[category] ?? category;
}

function categorySeverity(category: string): string {
  const severities: Record<string, string> = {
    asset: 'success',
    liability: 'danger',
    current: 'info',
  };
  return severities[category] ?? 'secondary';
}

async function onSave(account: BankAccountData) {
  try {
    await store.save(account);
    notifications.success('Bank account saved');
    dialogVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save bank account');
  }
}
</script>

<style scoped>
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.account-info {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.account-name {
  font-size: 0.9rem;
  color: var(--p-primary-color);
  text-decoration: none;
  cursor: pointer;
}

.account-name:hover {
  text-decoration: underline;
}

.account-name--closed {
  color: var(--p-text-muted-color);
}

.type-icon {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  cursor: help;
}

.status-tag {
  font-size: 0.75rem;
}

.account-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 0.75rem;
}

.institution-name {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.category-tag {
  font-size: 0.7rem;
}
</style>
