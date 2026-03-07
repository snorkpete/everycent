<template>
  <div class="login-container">
    <div class="login-card">
      <h2 data-testid="login-heading">EveryCent - Log In</h2>
      <form data-testid="login-form" @submit.prevent="login">
        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="text" class="w-full" data-testid="email-input" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <Password id="password" v-model="password" :feedback="false" toggle-mask class="w-full" data-testid="password-input" />
        </div>
        <p v-if="authStore.error" class="error" data-testid="error-message">{{ authStore.error }}</p>
        <Button type="submit" label="Log In" :loading="loading" class="w-full" data-testid="login-button" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useAuthStore } from './authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);

async function login() {
  loading.value = true;
  try {
    await authStore.logIn(email.value, password.value);
    router.push('/');
  } catch {
    // error is already set in the store
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  width: 320px;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 4px 4px 10px #888;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}

.error {
  color: var(--p-red-600);
  margin-bottom: 1rem;
}

.w-full {
  width: 100%;
}
</style>
