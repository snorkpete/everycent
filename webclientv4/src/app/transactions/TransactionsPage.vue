<template>
  <div class="transactions-page">
    <div class="transactions-layout">
      <div class="search-and-summary">
        <TransactionSearchForm @fetch="onFetch" />
        <TransactionSummary
          :transactions="store.transactions"
          :bank-account="store.selectedBankAccount ?? undefined"
          :allocations="store.allocations"
        />
      </div>
      <TransactionList @save="onSave" @cancel="onCancel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useTransactionStore } from './transactionStore';
import { useNotifications } from '../notifications/useNotifications';
import TransactionSearchForm from './TransactionSearchForm.vue';
import TransactionList from './TransactionList.vue';
import TransactionSummary from './TransactionSummary.vue';

const store = useTransactionStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

onMounted(() => {
  headingStore.setHeading('Transactions');
  store.fetchMetadata();
});

function onFetch(params: { budgetId: number; bankAccountId: number }) {
  store.fetch(params);
}

async function onSave() {
  try {
    await store.save(store.draftTransactions);
    store.exitEditMode();
    notifications.success('Transactions saved');
  } catch {
    notifications.error(store.error ?? 'Failed to save transactions');
  }
}

function onCancel() {
  store.cancelEdit();
}
</script>

<style scoped>
.transactions-page {
  padding: 1rem 1.5rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.transactions-layout {
  display: grid;
  grid-template-areas:
    'search-summary'
    'list';
  grid-template-rows: auto 1fr;
  gap: 1rem;
  height: 100%;
}

.search-and-summary {
  grid-area: search-summary;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .search-and-summary {
    grid-template-columns: 1fr;
  }
}
</style>
