<template>
  <Dialog
    :visible="visible"
    header="Adjust Account Balances"
    modal
    :style="{ width: 'auto', minWidth: '30rem', maxWidth: '90vw' }"
    @update:visible="close"
  >
    <div class="dialog-content">
      <table class="adjust-table">
        <thead>
          <tr>
            <th class="row-label-col">Bank Account</th>
            <th v-for="account in accounts" :key="account.id" class="account-col">
              {{ account.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="current-balance-row">
            <td class="row-label">Current Balance</td>
            <td v-for="(account, index) in accounts" :key="account.id" class="money-col">
              <EcMoneyField
                :label="''"
                :edit-mode="false"
                :model-value="adjustments[index]?.currentBalance ?? 0"
              />
            </td>
          </tr>
          <tr>
            <td class="row-label">New Account Balance</td>
            <td v-for="(account, index) in accounts" :key="account.id" class="money-col">
              <EcMoneyField
                v-model="adjustments[index].new_balance"
                :label="''"
                :edit-mode="true"
                :data-testid="`new-balance-${account.id}`"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="Save" data-testid="save-btn" @click="onSave" />
        <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="close" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import { useAccountBalanceStore } from './accountBalanceStore';
import { useNotifications } from '../notifications/useNotifications';
import type { AccountBalanceData, BalanceAdjustmentData } from './accountBalance.types';

const props = defineProps<{
  visible: boolean;
  accounts: AccountBalanceData[];
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const store = useAccountBalanceStore();
const notifications = useNotifications();

const adjustments = ref<BalanceAdjustmentData[]>([]);

function initAdjustments(accounts: AccountBalanceData[]) {
  adjustments.value = accounts.map((a) => ({
    bank_account_id: a.id,
    new_balance: a.current_balance,
    currentBalance: a.current_balance,
  }));
}

// Always sync adjustments from accounts so the template never reads undefined indices.
// Re-initialise whenever accounts change (new data from store) or dialog opens.
watch(() => props.accounts, initAdjustments, { immediate: true });
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      initAdjustments(props.accounts);
    }
  },
);

async function onSave() {
  try {
    await store.adjustBalances(adjustments.value);
    notifications.success('Balances adjusted.');
    close();
  } catch {
    notifications.error(store.error ?? 'Failed to adjust balances');
  }
}

function close() {
  emit('update:visible', false);
}

defineExpose({ adjustments });
</script>

<style scoped>
.dialog-content {
  overflow-x: auto;
  padding: 0.5rem 0;
}

.adjust-table {
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 100%;
}

.adjust-table th,
.adjust-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  white-space: nowrap;
}

.adjust-table thead th {
  font-weight: 600;
  color: var(--p-text-muted-color);
  font-size: 0.8125rem;
  text-align: center;
}

.row-label-col {
  text-align: left !important;
  min-width: 10rem;
}

.row-label {
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.account-col {
  min-width: 8rem;
}

.money-col {
  min-width: 8rem;
}

.current-balance-row td {
  background-color: var(--p-surface-50);
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
