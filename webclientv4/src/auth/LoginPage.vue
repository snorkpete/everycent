<template>
  <div class="login-container">
    <div class="login-card">
      <h2 data-testid="login-heading">EveryCent - Log In</h2>

      <div ref="googleButtonRef" class="google-button" data-testid="google-button-container" />

      <EcStatusMessage :error="authStore.error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './authStore';
import EcStatusMessage from '../app/shared/layout/EcStatusMessage.vue';

const router = useRouter();
const authStore = useAuthStore();

const googleButtonRef = ref<HTMLElement | null>(null);

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
</style>
