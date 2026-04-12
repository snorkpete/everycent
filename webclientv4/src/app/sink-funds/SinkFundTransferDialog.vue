<template>
  <EcFormDialog
    :visible="visible"
    header="Transfer Money"
    width="22rem"
    :always-edit="true"
    :save-disabled="!canSave"
    @update:visible="$emit('update:visible', $event)"
    @save="onSave"
  >
    <!-- Transfer From -->
    <div class="field">
      <label class="field-label">Transfer From</label>
      <Select
        v-model="form.existing_allocation_id"
        :options="transferOptions"
        option-label="label"
        option-value="value"
        placeholder="Select allocation"
        data-testid="from-select"
        class="w-full"
      />
    </div>

    <!-- Transfer To -->
    <div class="field">
      <label class="field-label">Transfer To</label>
      <Select
        v-model="form.new_allocation_id"
        :options="transferOptions"
        option-label="label"
        option-value="value"
        placeholder="Select allocation"
        data-testid="to-select"
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
import { useSinkFundStore } from './sinkFundStore';
import { sinkFundApi } from './sinkFundApi';
import { useNotifications } from '../notifications/useNotifications';
import { centsToDollars } from '../shared/util/centsToDollars';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { SinkFundTransferFormData } from './sinkFund.types';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  transferred: [];
}>();

const store = useSinkFundStore();
const notifications = useNotifications();

function defaultForm(): SinkFundTransferFormData {
  return {
    existing_allocation_id: null,
    new_allocation_id: null,
    amount: 0,
  };
}

const form = ref<SinkFundTransferFormData>(defaultForm());

// Reset form when dialog opens
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      form.value = defaultForm();
    }
  },
);

// 0 is the API sentinel for "unassigned money" (not a real allocation id)
const UNASSIGNED_VALUE = 0;

const transferOptions = computed(() => {
  const options: { label: string; value: number }[] = [
    {
      label: `Unassigned Money - ${centsToDollars(store.unassignedBalance)}`,
      value: UNASSIGNED_VALUE,
    },
  ];

  for (const allocation of store.sinkFund?.sink_fund_allocations ?? []) {
    options.push({
      label: `${allocation.name} (${centsToDollars(allocation.current_balance)})`,
      value: allocation.id!,
    });
  }

  return options;
});

const canSave = computed(() => {
  const { existing_allocation_id, new_allocation_id, amount } = form.value;
  return (
    existing_allocation_id !== null &&
    new_allocation_id !== null &&
    existing_allocation_id !== new_allocation_id &&
    amount > 0
  );
});

async function onSave() {
  if (!store.sinkFund?.id) return;

  try {
    await sinkFundApi.transfer(store.sinkFund.id, {
      existing_allocation_id: form.value.existing_allocation_id!,
      new_allocation_id: form.value.new_allocation_id!,
      amount: form.value.amount,
    });
    notifications.success('Transfer complete.');
    await store.fetchDetail(store.sinkFund.id);
    emit('transferred');
    emit('update:visible', false);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    notifications.error(`Transfer failed: ${message}`);
  }
}

defineExpose({ form });
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
</style>
