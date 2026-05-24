import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../auth/LoginPage.vue';
import { useAuthStore } from '../auth/authStore';
import { useSettingsStore } from '../app/settings/settingsStore';
import { useChatSettingsStore } from '../app/chat-settings/chatSettingsStore';
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
      path: '/setup/chat-settings',
      redirect: '/chat/settings',
    },
    {
      path: '/chat/settings',
      name: 'chat-settings',
      component: () => import('../app/chat-settings/ChatSettingsPage.vue'),
      meta: { title: 'Chat Settings' },
    },
    {
      path: '/chat/models',
      name: 'chat-models',
      component: () => import('../app/llm-models/LlmModelsPage.vue'),
      meta: { title: 'Model Registry' },
    },
    {
      path: '/chat/usage',
      name: 'chat-usage',
      component: () => import('../app/llm-usage/LlmUsageLogPage.vue'),
      meta: { title: 'Usage Log' },
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
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../app/reports/ReportsPage.vue'),
      meta: { title: 'Reports' },
    },
    {
      path: '/reports/net-worth',
      name: 'reports-net-worth',
      component: () => import('../app/reports/net-worth/NetWorthReportPage.vue'),
      meta: { title: 'Net Worth Report' },
    },
    {
      path: '/reports/category-spending',
      name: 'reports-category-spending',
      component: () => import('../app/reports/category-spending/CategorySpendingReportPage.vue'),
      meta: { title: 'Category Spending Report' },
    },
    {
      path: '/reports/needs-vs-wants',
      name: 'reports-needs-vs-wants',
      component: () => import('../app/reports/needs-vs-wants/NeedsVsWantsReportPage.vue'),
      meta: { title: 'Needs vs Wants Report' },
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
  const chatSettingsStore = useChatSettingsStore();
  await Promise.all([settingsStore.fetchAll(), chatSettingsStore.fetch()]);
});

router.afterEach((to) => {
  const title = to.meta.title;
  document.title = title ? `${title} - EveryCent` : 'EveryCent';
});

export default router;
