<template>
  <Toast />
  <LoadingIndicator />

  <template v-if="authStore.loggedIn">
    <div class="app-layout">
      <MenuSidebar />

      <div class="main-content">
        <AppToolbar />

        <div class="page-content">
          <router-view />
        </div>
      </div>
    </div>
  </template>

  <router-view v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from './auth/authStore';
import Toast from 'primevue/toast';
import LoadingIndicator from './app/loading/LoadingIndicator.vue';
import MenuSidebar from './app/menu/MenuSidebar.vue';
import AppToolbar from './app/toolbar/AppToolbar.vue';

const authStore = useAuthStore();
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
