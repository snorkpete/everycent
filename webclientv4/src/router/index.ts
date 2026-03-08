import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../auth/LoginPage.vue';
import { useAuthStore } from '../auth/authStore';

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
  ],
});

router.beforeEach(async (to) => {
  if (to.name === 'login') return true;

  const authStore = useAuthStore();
  const isLoggedIn = await authStore.checkSession();

  if (!isLoggedIn) {
    return { name: 'login' };
  }
});

export default router;
