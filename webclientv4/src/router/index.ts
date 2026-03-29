import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../auth/LoginPage.vue';
import { useAuthStore } from '../auth/authStore';
import { useSettingsStore } from '../app/settings/settingsStore';
import { budgetApi } from '../app/budgets/budgetApi';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../HomePage.vue'),
    },
    {
      path: '/setup/bank-accounts',
      name: 'setup-bank-accounts',
      component: () => import('../app/bank-accounts/BankAccountsPage.vue'),
    },
    {
      path: '/setup/allocation-categories',
      name: 'setup-allocation-categories',
      component: () => import('../app/allocation-categories/AllocationCategoriesPage.vue'),
    },
    {
      path: '/setup/institutions',
      name: 'setup-institutions',
      component: () => import('../app/institutions/InstitutionsPage.vue'),
    },
    {
      path: '/setup/settings',
      name: 'setup-settings',
      component: () => import('../app/settings/SettingsPage.vue'),
    },
    {
      path: '/budgets/future',
      name: 'future-budgets',
      component: () => import('../app/budgets/future-budgets/FutureBudgetsPage.vue'),
    },
    {
      path: '/budgets',
      name: 'budgets',
      component: () => import('../app/budgets/BudgetsPage.vue'),
    },
    {
      path: '/budgets/current',
      name: 'current-budget',
      component: { template: '<div />' },
      beforeEnter: async () => {
        const budgetId = await budgetApi.getCurrentBudgetId();
        return { path: `/budgets/${budgetId}` };
      },
    },
    {
      path: '/budgets/:id',
      name: 'budget-detail',
      component: () => import('../app/budgets/BudgetPage.vue'),
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../app/transactions/TransactionsPage.vue'),
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('../app/import/ImportPage.vue'),
    },
    {
      path: '/account-balances',
      name: 'account-balances',
      component: () => import('../app/account-balances/AccountBalancesPage.vue'),
    },
    {
      path: '/sink-funds',
      name: 'sink-funds',
      component: () => import('../app/sink-funds/SinkFundsPage.vue'),
    },
    {
      path: '/special-events',
      name: 'special-events',
      component: () => import('../app/special-events/SpecialEventsPage.vue'),
    },
    {
      path: '/special-events/:id',
      name: 'special-event-detail',
      component: () => import('../app/special-events/SpecialEventDetailPage.vue'),
    },
    {
      path: '/special-events/:id/allocations',
      name: 'special-event-allocations',
      component: () => import('../app/special-events/SpecialEventAllocationsEditor.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  if (to.name === 'login') return true;

  const authStore = useAuthStore();
  const isLoggedIn = await authStore.checkSession();

  if (!isLoggedIn) {
    return { name: 'login' };
  }

  const settingsStore = useSettingsStore();
  await settingsStore.fetchAll();
});

export default router;
