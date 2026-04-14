<template>
  <div class="login-container">
    <div class="login-card">
      <h2 data-testid="login-heading">EveryCent - Log In</h2>

      <div ref="googleButtonRef" class="google-button" data-testid="google-button-container" />

      <EcStatusMessage :error="authStore.error" />

      <button
        type="button"
        class="toggle-link"
        data-testid="password-toggle"
        @click="showPasswordForm = !showPasswordForm"
      >
        {{ showPasswordForm ? 'Hide password login' : 'Use password instead (not recommended)' }}
      </button>

      <form v-if="showPasswordForm" data-testid="login-form" @submit.prevent="login">
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="text"
            class="w-full"
            data-testid="email-input"
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            class="w-full"
            data-testid="password-input"
          />
        </div>
        <Button
          type="submit"
          label="Log In"
          :loading="loading"
          class="w-full"
          data-testid="login-button"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useAuthStore } from './authStore';
import EcStatusMessage from '../app/shared/layout/EcStatusMessage.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const googleButtonRef = ref<HTMLElement | null>(null);

const showPasswordForm = ref<boolean>(import.meta.env.DEV);

async function handleGoogleCredential(response: google.accounts.id.CredentialResponse) {
  try {
    await authStore.logInWithGoogle(response.credential);
    router.push('/');
  } catch {
    // error is already set in the store
  }
}

// If the button mysteriously stops rendering (0×0 iframe from /gsi/button)
// and nothing in our code or OAuth config has changed, check the `g_state`
// cookie on `accounts.google.com`: the `i_e.enable_itp_optimization` field
// is a Google-side A/B test bucket that has shipped broken values in the
// past. Value `0` (control) is known-working; non-zero values have silently
// broken the button widget for us before. Wait for the experiment cache to
// expire and re-roll, or clear the cookie.
onMounted(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google?.accounts?.id) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential,
  });

  if (googleButtonRef.value) {
    window.google.accounts.id.renderButton(googleButtonRef.value, {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      text: 'signin_with',
      size: 'large',
      width: 280,
      // Force English — Everycent has no localization; letting GSI auto-detect
      // renders the button in the browser's Accept-Language locale, which looks
      // out of place against the rest of the English UI.
      locale: 'en',
    });
  }
});

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
  border: 1px solid var(--p-surface-300);
  border-radius: 8px;
  box-shadow: 4px 4px 10px var(--p-surface-500);
}

.google-button {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}

.toggle-link {
  display: block;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1rem;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.w-full {
  width: 100%;
}
</style>
