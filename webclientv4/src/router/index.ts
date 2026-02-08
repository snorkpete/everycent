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
