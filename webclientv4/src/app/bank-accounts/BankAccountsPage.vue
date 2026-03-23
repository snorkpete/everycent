<template>
  <div class="bank-accounts-page">
    <div class="controls" data-testid="controls">
      <label class="toggle-label">
        <ToggleSwitch
          v-model="showClosed"
          data-testid="show-closed-toggle"
          input-id="show-closed"
        />
        <span>Show Closed Accounts</span>
      </label>
    </div>

    <ul class="account-list">
      <li
        v-for="account in visibleAccounts"
        :key="account.id"
        class="account-item"
        :class="{ 'account-item--closed': account.status === 'closed' }"
      >
        <span class="account-name">{{ account.name }}</span>
        <Tag
          v-if="account.status === 'closed'"
          value="Closed"
          severity="warn"
          icon="pi pi-ban"
          class="status-tag"
          data-testid="closed-tag"
        />
        <Button
          label="View"
          size="small"
          class="view-btn"
          :data-testid="`view-btn-${account.id}`"
          @click="viewAccount(account)"
        />
      </li>
    </ul>

    <div class="page-actions">
      <Button label="Add Bank Account" data-testid="add-btn" @click="addAccount" />
      <Button label="Refresh" severity="secondary" data-testid="refresh-btn" @click="refresh" />
    </div>

    <BankAccountEditDialog
      :visible="dialogVisible"
      :bank-account="selectedAccount"
      :initial-edit-mode="dialogEditMode"
      :institutions="store.institutions"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ToggleSwitch from 'primevue/toggleswitch';
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
  showClosed.value
    ? store.bankAccounts
    : store.bankAccounts.filter((a) => a.status !== 'closed'),
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
.bank-accounts-page {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.account-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  gap: 0.5rem;
}

.account-item:last-child {
  border-bottom: none;
}

.account-item--closed {
  background-color: var(--p-surface-50);
}

.account-item--closed .account-name {
  color: var(--p-text-muted-color);
}

.account-name {
  font-size: 0.9rem;
}

.status-tag {
  font-size: 0.75rem;
}

.view-btn {
  margin-left: auto;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
