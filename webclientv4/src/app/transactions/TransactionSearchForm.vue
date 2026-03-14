<template>
  <div class="transaction-search-form">
    <h3 class="form-title">Select Transactions to View</h3>
    <div class="form-fields">
      <div class="field">
        <label for="bank-account-select">Bank Account</label>
        <Select
          id="bank-account-select"
          v-model="selectedBankAccountId"
          :options="store.bankAccounts"
          option-label="name"
          option-value="id"
          placeholder="Select Bank Account"
          data-testid="bank-account-select"
          @update:model-value="onBankAccountChange"
        />
      </div>
      <div class="field">
        <label for="budget-select">Budget</label>
        <Select
          id="budget-select"
          v-model="selectedBudgetId"
          :options="store.budgetsForDropdown"
          option-label="name"
          option-value="id"
          placeholder="Select Budget"
          data-testid="budget-select"
          @update:model-value="onBudgetChange"
        />
      </div>
    </div>
    <div class="form-actions">
      <a
        :href="budgetLink"
        data-testid="go-to-budget-link"
        class="budget-link"
      >Go to Budget</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import { useTransactionStore } from './transactionStore';

const emit = defineEmits<{
  fetch: [params: { budgetId: number; bankAccountId: number }];
}>();

const store = useTransactionStore();
const route = useRoute();

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
    emit('fetch', {
      budgetId: selectedBudgetId.value,
      bankAccountId: selectedBankAccountId.value,
    });
  }
}
</script>

<style scoped>
.transaction-search-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
}

.form-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.budget-link {
  font-size: 0.9rem;
  color: var(--p-primary-color);
  text-decoration: none;
}

.budget-link:hover {
  text-decoration: underline;
}
</style>
