import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../auth/LoginPage.vue';
import { useAuthStore } from '../auth/authStore';
import { useSettingsStore } from '../app/settings/settingsStore';
import { budgetApi } from '../app/budgets/budgetApi';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { title: 'Login' },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../app/home/HomePage.vue'),
      // No meta.title — home page uses the bare "EveryCent" app name
    },
    {
      path: '/setup/bank-accounts',
      name: 'setup-bank-accounts',
      component: () => import('../app/bank-accounts/BankAccountsPage.vue'),
      meta: { title: 'Bank Accounts' },
    },
    {
      path: '/setup/allocation-categories',
      name: 'setup-allocation-categories',
      component: () => import('../app/allocation-categories/AllocationCategoriesPage.vue'),
      meta: { title: 'Allocation Categories' },
    },
    {
      path: '/setup/institutions',
      name: 'setup-institutions',
      component: () => import('../app/institutions/InstitutionsPage.vue'),
      meta: { title: 'Institutions' },
    },
    {
      path: '/setup/settings',
      name: 'setup-settings',
      component: () => import('../app/settings/SettingsPage.vue'),
      meta: { title: 'Settings' },
    },
    {
      path: '/budgets/future',
      name: 'future-budgets',
      component: () => import('../app/budgets/future-budgets/FutureBudgetsPage.vue'),
      meta: { title: 'Future Budgets' },
    },
    {
      path: '/budgets',
      name: 'budgets',
      component: () => import('../app/budgets/BudgetsPage.vue'),
      meta: { title: 'Budgets' },
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
      meta: { title: 'Budget' },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../app/transactions/TransactionsPage.vue'),
      meta: { title: 'Transactions' },
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('../app/import/ImportPage.vue'),
      meta: { title: 'Transaction Import' },
    },
    {
      path: '/account-balances',
      name: 'account-balances',
      component: () => import('../app/account-balances/AccountBalancesPage.vue'),
      meta: { title: 'Account Balances' },
    },
    {
      path: '/sink-funds',
      name: 'sink-funds',
      component: () => import('../app/sink-funds/SinkFundsPage.vue'),
      meta: { title: 'Sink Funds' },
    },
    {
      path: '/special-events',
      name: 'special-events',
      component: () => import('../app/special-events/SpecialEventsPage.vue'),
      meta: { title: 'Special Events' },
    },
    {
      path: '/special-events/:id',
      name: 'special-event-detail',
      component: () => import('../app/special-events/SpecialEventDetailPage.vue'),
      meta: { title: 'Special Event' },
    },
    {
      path: '/special-events/:id/allocations',
      name: 'special-event-allocations',
      component: () => import('../app/special-events/SpecialEventAllocationsEditor.vue'),
      meta: { title: 'Special Event Allocations' },
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

router.afterEach((to) => {
  const title = to.meta.title;
  document.title = title ? `${title} - EveryCent` : 'EveryCent';
});

export default router;
