<template>
  <header v-if="authStore.loggedIn" class="top-bar">
    <span class="app-title">EveryCent</span>
    <Button label="Log Out" severity="secondary" size="small" @click="logout" />
  </header>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from './auth/authStore';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logOut();
  router.push('/login');
}
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #ddd;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
