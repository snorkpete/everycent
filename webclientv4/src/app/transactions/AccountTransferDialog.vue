<template>
  <EcFormDialog
    :visible="visible"
    header="Bank Account Transfer"
    width="36rem"
    :always-edit="true"
    save-label="Transfer"
    :save-disabled="!canTransfer"
    @update:visible="$emit('update:visible', $event)"
    @save="runTransfer"
  >
    <!-- From account -->
    <div class="field">
      <label class="field-label">From Account</label>
      <Select
        v-model="form.from_id"
        :options="bankAccountsWithBalances"
        option-label="name"
        option-value="id"
        placeholder="Select account"
        data-testid="from-account-select"
        class="w-full"
        @update:model-value="onFromAccountChange"
      >
        <template #option="{ option }">
          {{ option.name }} ({{ formatBalance(option.current_balance ?? 0) }})
        </template>
      </Select>
      <span
        v-if="newFromBalance !== null"
        class="balance-preview"
        data-testid="from-balance-preview"
      >
        New balance: {{ formatBalance(newFromBalance) }}
      </span>
    </div>

    <!-- From allocation (regular account) -->
    <div v-if="fromAccount && !fromAccount.is_sink_fund" class="field">
      <label class="field-label">From Allocation (optional)</label>
      <Select
        v-model="form.from_allocation_id"
        :options="groupedAllocations"
        option-group-label="label"
        option-group-children="items"
        option-label="name"
        option-value="id"
        placeholder="Select allocation"
        data-testid="from-allocation-select"
        class="w-full"
        show-clear
      />
    </div>

    <!-- From sink fund allocation -->
    <div v-if="fromAccount && fromAccount.is_sink_fund" class="field">
      <label class="field-label">From Sink Fund Allocation (optional)</label>
      <Select
        v-model="form.from_sink_fund_allocation_id"
        :options="sinkFundAllocationsFrom"
        option-label="name"
        option-value="id"
        placeholder="Select sink fund allocation"
        data-testid="from-sink-fund-select"
        class="w-full"
        show-clear
      />
    </div>

    <!-- To account -->
    <div class="field">
      <label class="field-label">To Account</label>
      <Select
        v-model="form.to_id"
        :options="bankAccountsWithBalances"
        option-label="name"
        option-value="id"
        placeholder="Select account"
        data-testid="to-account-select"
        class="w-full"
        @update:model-value="onToAccountChange"
      >
        <template #option="{ option }">
          {{ option.name }} ({{ formatBalance(option.current_balance ?? 0) }})
        </template>
      </Select>
      <span v-if="newToBalance !== null" class="balance-preview" data-testid="to-balance-preview">
        New balance: {{ formatBalance(newToBalance) }}
      </span>
    </div>

    <!-- To allocation (regular account) -->
    <div v-if="toAccount && !toAccount.is_sink_fund" class="field">
      <label class="field-label">To Allocation (optional)</label>
      <Select
        v-model="form.to_allocation_id"
        :options="groupedAllocations"
        option-group-label="label"
        option-group-children="items"
        option-label="name"
        option-value="id"
        placeholder="Select allocation"
        data-testid="to-allocation-select"
        class="w-full"
        show-clear
      />
    </div>

    <!-- To sink fund allocation -->
    <div v-if="toAccount && toAccount.is_sink_fund" class="field">
      <label class="field-label">To Sink Fund Allocation (optional)</label>
      <Select
        v-model="form.to_sink_fund_allocation_id"
        :options="sinkFundAllocationsTo"
        option-label="name"
        option-value="id"
        placeholder="Select sink fund allocation"
        data-testid="to-sink-fund-select"
        class="w-full"
        show-clear
      />
    </div>

    <!-- Date -->
    <EcDateField v-model="form.date" label="Date" :edit-mode="true" />

    <!-- Description -->
    <div class="field">
      <label class="field-label">Description</label>
      <InputText
        v-model="form.description"
        placeholder="Description (optional)"
        data-testid="description-input"
        class="w-full"
      />
    </div>

    <!-- Amount -->
    <EcMoneyField v-model="form.amount" label="Amount" :edit-mode="true" />
  </EcFormDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { transactionApi } from './transactionApi';
import { useTransactionStore } from './transactionStore';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/centsToDollars';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import type { BankAccountData, AccountTransferData } from '../bank-accounts/bankAccount.types';
import type { SinkFundAllocationData, AllocationData } from './transaction.types';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  transferred: [];
}>();

const store = useTransactionStore();
const notifications = useNotifications();

interface TransferFormData {
  from_id: number | null;
  to_id: number | null;
  from_allocation_id: number | null;
  to_allocation_id: number | null;
  from_sink_fund_allocation_id: number | null;
  to_sink_fund_allocation_id: number | null;
  date: string;
  description: string;
  amount: number;
}

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultForm(): TransferFormData {
  return {
    from_id: null,
    to_id: null,
    from_allocation_id: null,
    to_allocation_id: null,
    from_sink_fund_allocation_id: null,
    to_sink_fund_allocation_id: null,
    date: todayIso(),
    description: '',
    amount: 0,
  };
}

const form = ref<TransferFormData>(defaultForm());
const bankAccountsWithBalances = ref<BankAccountData[]>([]);
const sinkFundAllocationsFrom = ref<SinkFundAllocationData[]>([]);
const sinkFundAllocationsTo = ref<SinkFundAllocationData[]>([]);

// Reset and load when dialog opens
watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      form.value = defaultForm();
      sinkFundAllocationsFrom.value = [];
      sinkFundAllocationsTo.value = [];
      const [sorted, withBalances] = await Promise.all([
        bankAccountApi.getOpen(),
        bankAccountApi.getWithBalances(),
      ]);
      const balanceMap = new Map(withBalances.map((a) => [a.id, a.current_balance]));
      bankAccountsWithBalances.value = sorted.map((a) => ({
        ...a,
        current_balance: balanceMap.get(a.id) ?? 0,
      }));
    }
  },
  { immediate: true },
);

const fromAccount = computed<BankAccountData | null>(
  () => bankAccountsWithBalances.value.find((a) => a.id === form.value.from_id) ?? null,
);

const toAccount = computed<BankAccountData | null>(
  () => bankAccountsWithBalances.value.find((a) => a.id === form.value.to_id) ?? null,
);

const newFromBalance = computed<number | null>(() => {
  const acc = fromAccount.value;
  return acc ? (acc.current_balance ?? 0) - form.value.amount : null;
});

const newToBalance = computed<number | null>(() => {
  const acc = toAccount.value;
  return acc ? (acc.current_balance ?? 0) + form.value.amount : null;
});

const groupedAllocations = computed(() => {
  const byCategory = new Map<number, { label: string; items: AllocationData[] }>();
  for (const a of store.allocations) {
    const catId = a.allocation_category_id!;
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { label: a.allocation_category?.name ?? '', items: [] });
    }
    byCategory.get(catId)!.items.push(a);
  }
  return [...byCategory.values()].sort((a, b) => a.label.localeCompare(b.label));
});

const canTransfer = computed(
  () =>
    !!form.value.from_id &&
    !!form.value.to_id &&
    form.value.from_id !== form.value.to_id &&
    form.value.amount > 0,
);

function formatBalance(cents: number): string {
  return centsToDollars(cents);
}

async function onFromAccountChange() {
  form.value.from_allocation_id = null;
  form.value.from_sink_fund_allocation_id = null;
  sinkFundAllocationsFrom.value = [];

  if (fromAccount.value?.is_sink_fund) {
    sinkFundAllocationsFrom.value = await transactionApi.getSinkFundAllocations(
      fromAccount.value.id!,
    );
  }
}

async function onToAccountChange() {
  form.value.to_allocation_id = null;
  form.value.to_sink_fund_allocation_id = null;
  sinkFundAllocationsTo.value = [];

  if (toAccount.value?.is_sink_fund) {
    sinkFundAllocationsTo.value = await transactionApi.getSinkFundAllocations(toAccount.value.id!);
  }
}

async function runTransfer() {
  const payload: AccountTransferData = {
    from: form.value.from_id!,
    to: form.value.to_id!,
    amount: form.value.amount,
    date: form.value.date,
    description: form.value.description || undefined,
    budget_id: store.selectedBudget?.id,
  };

  if (fromAccount.value?.is_sink_fund) {
    payload.from_sink_fund_allocation = form.value.from_sink_fund_allocation_id ?? undefined;
  } else {
    payload.from_allocation = form.value.from_allocation_id ?? undefined;
  }

  if (toAccount.value?.is_sink_fund) {
    payload.to_sink_fund_allocation = form.value.to_sink_fund_allocation_id ?? undefined;
  } else {
    payload.to_allocation = form.value.to_allocation_id ?? undefined;
  }

  try {
    await bankAccountApi.transfer(form.value.from_id!, payload);
    notifications.success('Transfer completed.');
    emit('transferred');
    emit('update:visible', false);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    notifications.error(`Transfer failed: ${message}`);
  }
}

// Expose internal state and handlers for testing
defineExpose({ form, onFromAccountChange, onToAccountChange });
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.balance-preview {
  font-size: 0.8125rem;
  color: var(--p-text-muted-color);
  text-align: right;
}
</style>
