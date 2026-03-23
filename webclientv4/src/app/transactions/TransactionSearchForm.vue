<template>
  <div class="transaction-search-form">
    <Select
      v-model="selectedBankAccountId"
      :options="store.bankAccounts"
      option-label="name"
      option-value="id"
      placeholder="Bank Account"
      data-testid="bank-account-select"
      @update:model-value="onBankAccountChange"
    />
    <Select
      v-model="selectedBudgetId"
      :options="store.budgetsForDropdown"
      option-label="name"
      option-value="id"
      placeholder="Budget"
      data-testid="budget-select"
      @update:model-value="onBudgetChange"
    />
    <a
      :href="budgetLink"
      data-testid="go-to-budget-link"
      class="budget-link"
    >Go to Budget</a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Select from 'primevue/select';
import { useRoute, useRouter } from 'vue-router';
import { useTransactionStore } from './transactionStore';

const emit = defineEmits<{
  fetch: [params: { budgetId: number; bankAccountId: number }];
}>();

const store = useTransactionStore();
const route = useRoute();
const router = useRouter();

const selectedBankAccountId = ref<number | null>(null);
const selectedBudgetId = ref<number | null>(null);
const initialised = ref(false);

const budgetLink = computed(() => {
  if (selectedBudgetId.value) {
    return `#/budgets/${selectedBudgetId.value}`;
  }
  return '#/budgets';
});

// Watch for bankAccounts to become available (loaded by TransactionsPage.fetchMetadata)
// and initialise the selection from URL params or defaults.
watch(
  () => store.bankAccounts,
  (accounts) => {
    if (initialised.value || accounts.length === 0) return;

    const queryBudgetId = route.query.budget_id ? Number(route.query.budget_id) : null;
    const queryBankAccountId = route.query.bank_account_id ? Number(route.query.bank_account_id) : null;

    const firstAccount = accounts[0];
    const firstBudget = store.budgetsForDropdown[0];

    selectedBankAccountId.value = queryBankAccountId ?? firstAccount?.id ?? null;
    selectedBudgetId.value = queryBudgetId ?? firstBudget?.id ?? null;

    initialised.value = true;
    emitFetch();
  },
  { immediate: true },
);

// When navigating to this page with different query params (e.g. from budget "View Transactions"),
// the component doesn't remount — only the URL changes. Detect this and re-sync.
watch(
  () => route.query,
  (query) => {
    if (!initialised.value || store.bankAccounts.length === 0) return;

    const queryBudgetId = query.budget_id ? Number(query.budget_id) : null;
    const queryBankAccountId = query.bank_account_id ? Number(query.bank_account_id) : null;

    if (queryBudgetId && queryBudgetId !== selectedBudgetId.value) {
      selectedBudgetId.value = queryBudgetId;
      emitFetch();
    }
    if (queryBankAccountId && queryBankAccountId !== selectedBankAccountId.value) {
      selectedBankAccountId.value = queryBankAccountId;
      emitFetch();
    }
  },
);

function onBankAccountChange(id: number) {
  selectedBankAccountId.value = id;
  emitFetch();
}

function onBudgetChange(id: number) {
  selectedBudgetId.value = id;
  emitFetch();
}

function emitFetch() {
  if (selectedBudgetId.value && selectedBankAccountId.value) {
    router.replace({
      query: { budget_id: selectedBudgetId.value, bank_account_id: selectedBankAccountId.value },
    });
    emit('fetch', {
      budgetId: selectedBudgetId.value,
      bankAccountId: selectedBankAccountId.value,
    });
  }
}
</script>

<style scoped>
.transaction-search-form {
  display: contents;
}

.budget-link {
  font-size: 0.9rem;
  color: var(--p-primary-color);
  text-decoration: none;
  white-space: nowrap;
  align-self: center;
}

.budget-link:hover {
  text-decoration: underline;
}
</style>
