<template>
  <EcPageLayout page-name="bank-accounts">
    <EcItemList :items="visibleAccounts" key-field="id">
      <template #item="{ item: account }">
        <span
          class="account-name"
          :class="{ 'account-name--closed': account.status === 'closed' }"
          >{{ account.name }}</span
        >
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
          :data-testid="`view-btn-${account.id}`"
          @click="viewAccount(account)"
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

.account-name {
  font-size: 0.9rem;
}

.account-name--closed {
  color: var(--p-text-muted-color);
}

.status-tag {
  font-size: 0.75rem;
}
</style>
