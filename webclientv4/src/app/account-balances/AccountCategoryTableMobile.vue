<template>
  <div class="category-table-mobile" :class="{ 'category-table-mobile--expanded': expanded }">
    <div class="section-heading" data-testid="section-heading" @click="emit('toggle')">
      <span class="section-heading-left">
        <i
          class="pi section-chevron"
          :class="expanded ? 'pi-chevron-down' : 'pi-chevron-right'"
        ></i>
        <span>{{ heading }}</span>
      </span>
      <EcMoneyDisplay
        :model-value="totalCurrentBalance"
        emphasis="subtotal"
        :dash-if-zero="dashIfZero"
      />
    </div>

    <ul v-if="expanded" class="cards-list">
      <template v-for="account in accounts" :key="account.id">
        <li class="account-card" data-testid="account-card" @click="toggleExpanded(account.id)">
          <div class="card-main">
            <i
              class="pi card-chevron"
              :class="isExpanded(account.id) ? 'pi-chevron-down' : 'pi-chevron-right'"
            ></i>
            <span class="card-name" data-testid="account-name">
              {{ account.name }}
              <i
                v-if="account.account_type === 'sink_fund'"
                v-tooltip.top="{ value: 'Sink fund account', showDelay: 0, hideDelay: 0 }"
                class="pi pi-wallet sink-fund-icon"
              />
            </span>
            <span class="card-balance" data-testid="account-balance">
              <EcMoneyDisplay
                :model-value="account.current_balance"
                highlight-mode="none"
                :dash-if-zero="dashIfZero"
              />
            </span>
          </div>

          <div
            v-if="isExpanded(account.id)"
            class="card-detail"
            data-testid="card-detail"
            @click.stop
          >
            <span class="detail-item detail-item--full">
              <span class="detail-label">Institution</span>
              <span class="detail-value">{{ account.institution?.name ?? '' }}</span>
            </span>
            <div class="detail-grid">
              <span class="detail-item">
                <span class="detail-label">Balance {{ closingDateLabel }}</span>
                <EcMoneyDisplay
                  :model-value="account.closing_balance"
                  highlight-mode="none"
                  :dash-if-zero="dashIfZero"
                />
              </span>
              <span class="detail-item">
                <span class="detail-label">Balance {{ nextClosingDateLabel }}</span>
                <EcMoneyDisplay
                  :model-value="account.expected_closing_balance"
                  highlight-mode="none"
                  :dash-if-zero="dashIfZero"
                />
              </span>
            </div>

            <!-- Nested loans -->
            <template v-if="(account.loans?.length ?? 0) > 0">
              <div class="loans-section">
                <div class="loans-heading">Loans</div>
                <div
                  v-for="loan in account.loans"
                  :key="loan.id"
                  class="loan-card"
                  data-testid="loan-card"
                >
                  <div class="loan-main">
                    <span class="loan-name">{{ loan.name }}</span>
                    <EcMoneyDisplay
                      :model-value="loan.current_balance"
                      highlight-mode="balance"
                      :dash-if-zero="dashIfZero"
                    />
                  </div>
                </div>
                <div class="equity-row">
                  <span class="equity-label">Equity</span>
                  <EcMoneyDisplay
                    :model-value="equityFor(account)"
                    emphasis="subtotal"
                    highlight-mode="balance"
                    :dash-if-zero="dashIfZero"
                  />
                </div>
              </div>
            </template>

            <Button
              label="View Transactions"
              icon="pi pi-eye"
              outlined
              size="small"
              class="view-transactions-btn"
              data-testid="view-transactions-btn"
              @click.stop="navigateToTransactions(account.id)"
            />
          </div>
        </li>
      </template>
    </ul>

    <div v-if="expanded" class="totals-footer" data-testid="category-total">
      <span class="totals-label">Total</span>
      <EcMoneyDisplay
        :model-value="totalCurrentBalance"
        emphasis="total"
        highlight-mode="balance"
        :dash-if-zero="dashIfZero"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tooltip from 'primevue/tooltip';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import { formatDate } from '../shared/util/formatDate';
import type { AccountBalanceData } from './accountBalance.types';

const vTooltip = Tooltip;

const props = defineProps<{
  heading: string;
  accounts: AccountBalanceData[];
  dashIfZero?: boolean;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const router = useRouter();
const expandedId = ref<number | null>(null);

const firstAccount = computed(() => props.accounts[0] ?? null);

const closingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.closing_date) : '',
);

const nextClosingDateLabel = computed(() =>
  firstAccount.value ? formatDate(firstAccount.value.next_closing_date) : '',
);

const flattenedAccounts = computed<AccountBalanceData[]>(() =>
  props.accounts.flatMap((a) => [a, ...(a.loans ?? [])]),
);

const totalCurrentBalance = computed(() =>
  flattenedAccounts.value.reduce((sum, a) => sum + a.current_balance, 0),
);

function equityFor(account: AccountBalanceData): number {
  const loanTotal = (account.loans ?? []).reduce((sum, l) => sum + l.current_balance, 0);
  return account.current_balance + loanTotal;
}

function isExpanded(id: number): boolean {
  return expandedId.value === id;
}

function toggleExpanded(id: number): void {
  expandedId.value = expandedId.value === id ? null : id;
}

function navigateToTransactions(bankAccountId: number): void {
  router.push(`/transactions?bank_account_id=${bankAccountId}`);
}
</script>

<style scoped>
.category-table-mobile {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem;
  color: var(--p-text-color);
  cursor: pointer;
  user-select: none;
}

.section-heading:active {
  background-color: var(--p-surface-100);
}

.section-heading-left {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.section-chevron {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.cards-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.account-card {
  border-top: 1px solid var(--p-surface-200);
  padding: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.account-card:active {
  background-color: var(--p-surface-100);
}

.card-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-chevron {
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.card-name {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--p-text-color);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.sink-fund-icon {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  cursor: help;
}

.card-balance {
  font-weight: 600;
  white-space: nowrap;
}

.card-detail {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--p-surface-300);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.detail-item--full {
  margin-bottom: 0.375rem;
}

.detail-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.detail-value {
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Loans section ── */
.loans-section {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background-color: var(--p-surface-50);
  border-radius: 4px;
}

.loans-heading {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--p-text-muted-color);
  margin-bottom: 0.375rem;
}

.loan-card {
  padding: 0.375rem 0;
}

.loan-card + .loan-card {
  border-top: 1px solid var(--p-surface-200);
}

.loan-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.loan-name {
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.equity-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.375rem;
  border-top: 1px dashed var(--p-surface-300);
  margin-top: 0.375rem;
}

.equity-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.view-transactions-btn {
  width: 100%;
}

/* ── Footer ── */
.totals-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-50);
  border-top: 2px solid var(--p-surface-300);
  font-weight: 700;
}

.totals-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}
</style>
