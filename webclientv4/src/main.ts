import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import router from './router';
import App from './App.vue';

// Shift the violet palette one stop darker so the default 500 level maps to
// violet.600 (#7C3AED), matching Angular Material's deep-purple primary.
// The 900 and 950 stops both map to violet.950 — there is no darker step available.
const EveryCentTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.400}',
      400: '{violet.500}',
      500: '{violet.600}',
      600: '{violet.700}',
      700: '{violet.800}',
      800: '{violet.900}',
      900: '{violet.950}',
      950: '{violet.950}',
    },
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: EveryCentTheme,
    options: {
      darkModeSelector: false,
    },
  },
});
app.use(ToastService);
app.mount('#app');
