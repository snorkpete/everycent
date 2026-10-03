<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    modal
    :closable="true"
    :style="{ width: '32rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="loading" class="loading-state" data-testid="loading-state">
      Loading transactions...
    </div>

    <div v-else-if="error" class="error-state" data-testid="error-state">
      Failed to load transactions.
    </div>

    <div v-else-if="isEmpty" class="empty-state" data-testid="empty-state">
      No transactions found for this allocation.
    </div>

    <div v-else class="transactions-content">
      <AllocationTransactionsSections v-if="isMultiple" :sections="sections" />
      <AllocationTransactionsTable v-else :transactions="singleTransactions" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import AllocationTransactionsTable from './AllocationTransactionsTable.vue';
import AllocationTransactionsSections from './AllocationTransactionsSections.vue';
import type {
  AllocationTransactionSection,
  TransactionsDialogAllocation,
} from './allocationTransactions.types';
import type { TransactionData } from '../transactions/transaction.types';

const props = defineProps<{
  visible: boolean;
  allocationId: number;
  allocationName: string;
  /** Optional multi-allocation mode: one parallel request and one section per entry. */
  allocations?: TransactionsDialogAllocation[];
  fetchTransactions: (id: number) => Promise<TransactionData[]>;
}>();

defineEmits<{
  'update:visible': [value: boolean];
}>();

const sections = ref<AllocationTransactionSection[]>([]);
const loading = ref(false);
const error = ref(false);
// Decided once per open so the display always matches how the data was loaded.
const isMultiple = ref(false);

const dialogTitle = computed(() => `Transactions for ${props.allocationName}`);

const isEmpty = computed(() =>
  sections.value.every((section) => section.transactions.length === 0),
);

const singleTransactions = computed(() =>
  sections.value.flatMap((section) => section.transactions),
);

// Loading seam: one request in single mode, N parallel requests in multi mode,
// normalised to the same list-of-sections shape.
async function loadSections(): Promise<AllocationTransactionSection[]> {
  if (props.allocations) {
    const requested = props.allocations;
    const fetched = await Promise.all(
      requested.map((allocation) => props.fetchTransactions(allocation.id)),
    );
    return requested.map((allocation, index) => ({ allocation, transactions: fetched[index] }));
  }
  const allocation = { id: props.allocationId, name: props.allocationName };
  return [{ allocation, transactions: await props.fetchTransactions(allocation.id) }];
}

function hasTarget(): boolean {
  return props.allocations ? props.allocations.length > 0 : !!props.allocationId;
}

let latestRequest = 0;

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return;
    const requestId = ++latestRequest;
    isMultiple.value = !!props.allocations;
    sections.value = [];
    error.value = false;
    loading.value = false;
    if (!hasTarget()) return;
    loading.value = true;
    try {
      const loaded = await loadSections();
      if (requestId !== latestRequest) return;
      sections.value = loaded;
    } catch {
      if (requestId === latestRequest) error.value = true;
    } finally {
      if (requestId === latestRequest) loading.value = false;
    }
  },
);
</script>

<style scoped>
.transactions-content {
  max-height: 60vh;
  overflow: auto;
}

.loading-state,
.empty-state,
.error-state {
  padding: 1.5rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.error-state {
  color: var(--p-red-500);
}
</style>
