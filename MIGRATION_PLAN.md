# EveryCent: Vue 4 Migration Plan

## Decisions Made

### Tech Stack
- **Vue 3** with **Vite** and **TypeScript**
- **Composition API** with `<script setup>` (no Options API)
- **Pinia** for state management (composition-style `defineStore`)
- **PrimeVue 4** (styled mode, pick a preset theme during setup)
- **Vue Router 4**
- **Axios** for HTTP

### Conventions
- Types live in `.types.ts` files within their feature folder (e.g. `features/auth/auth.type.ts`)
- Feature-folder structure: each domain groups its components, stores, composables, types, and routes
- API calls are separated from stores — plain functions in `src/api/`
- Components never call the API directly; they go through Pinia stores
- PrimeVue DataTable for read-heavy views, custom layouts for edit-heavy views (like budget allocation editing)

### Auth Strategy
- Rails backend uses `devise_token_auth`
- Angular app configures auth through webclientv3/src/app/core/auth
- Token rotation is **disabled** on the server (`change_headers_on_each_request: false`)
- The Vue app must **read and write the same localStorage keys** as the Angular app so sessions are shared seamlessly between the two apps during migration
- **First task**: inspect what the Angular token library actually stores in localStorage, then replicate that exact format in the Vue auth layer

### Dev Server
- Vite runs on its own port (e.g. 4200) with a proxy to Rails (localhost:3000) for `/api` and `/auth`
- HMR enabled — fast feedback loop
- Production builds go to `public/v4/` and are served by Rails

### Environment Config
- Vite `.env` files for any environment-specific values
- In dev: API base URL is `/` (proxied by Vite to Rails)
- In production: API base URL is `/` (same-origin, served by Rails)
- Simpler than Angular's environment files — the proxy handles the dev case

---

## Project Structure

```
webclientv4/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── env.d.ts
├── .env.development          # VITE_API_BASE_URL=/ (plus any other dev config)
├── .env.production           # VITE_API_BASE_URL=/ (same-origin in prod)
└── src/
    ├── main.ts               # App bootstrap: createApp, Pinia, Router, PrimeVue
    ├── App.vue               # Root component with router-view
    ├── api/
    │   ├── client.ts         # Axios instance + devise_token_auth interceptors
    │   ├── authApi.ts        # Sign in, sign out, validate token
    │   ├── budgetApi.ts      # (later)
    │   ├── accountApi.ts     # (later)
    │   └── transactionApi.ts # (later)
    ├── router/
    │   └── index.ts          # Router setup + global auth guard
    ├── stores/               # App-wide Pinia stores (not feature-specific)
    │   └── (empty for now — auth store lives in features/auth/)
    ├── features/
    │   ├── auth/
    │   │   ├── auth.type.ts
    │   │   ├── stores/
    │   │   │   └── authStore.ts
    │   │   ├── LoginPage.vue
    │   │   └── routes.ts
    │   ├── budgets/          # (later)
    │   ├── transactions/     # (later)
    │   ├── accounts/         # (later)
    │   └── settings/         # (later)
    ├── shared/
    │   ├── components/       # Reusable UI components
    │   ├── composables/      # Reusable logic (useConfirmDialog, useLoadingState, etc.)
    │   └── utils/            # Pure functions (formatCurrency, date helpers, etc.)
    └── types/                # Shared types used across features (if any)
```

---

## Phase 1: Bootstrap & Auth (What to Build First)

### Step 0: Inspect the Angular codebase

Before writing any Vue code, examine these files to understand the exact auth behavior:

```bash
# Find which token library is used
cat webclientv3/package.json | grep -i token

# Look at how the Angular app configures the token service
grep -r "AngularTokenModule\|Angular2TokenService\|tokenService" webclientv3/src/app/ --include="*.ts" -l

# Find the auth-related components
find webclientv3/src/app -name "*login*" -o -name "*auth*" | head -20

# Check the Rails auth configuration
cat config/initializers/devise_token_auth.rb
cat config/initializers/cors.rb
grep -r "mount_devise_token_auth" config/routes.rb

# Check what's in localStorage while the Angular app is running
# (Do this in the browser — DevTools → Application → Local Storage)
```

Key things to determine:
1. **Exact localStorage format** used by the Angular token library
2. **Auth API endpoints** — confirm they're at `/auth/sign_in`, `/auth/sign_out`, `/auth/validate_token`
3. **Whether token rotation is off** — check `change_headers_on_each_request` in `devise_token_auth.rb`
4. **CORS config** — ensure the Rails CORS config exposes the auth headers and allows the Vite dev server origin

### Step 1: Scaffold the Vue project

```bash
cd /path/to/everycent
mkdir webclientv4
cd webclientv4
npm create vite@latest . -- --template vue-ts
npm install vue-router@4 pinia axios primevue @primevue/themes primeicons
```

### Step 2: Configure Vite

Set up the dev proxy so `/api` and `/auth` requests go to Rails:

```typescript
// vite.config.ts
server: {
  port: 4200,
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true },
    '/auth': { target: 'http://localhost:3000', changeOrigin: true },
  },
},
build: {
  outDir: '../public/v4',
  emptyOutDir: true,
},
```

### Step 3: Set up PrimeVue in main.ts

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'  // or whichever theme you pick
import 'primeicons/primeicons.css'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,  // disable dark mode for now
    },
  },
})
app.mount('#app')
```

### Step 4: Build the auth layer

This is the critical piece. The order is:

1. **`features/auth/auth.type.ts`** — types for auth headers, credentials, user
2. **`api/client.ts`** — Axios instance with interceptors that read/write auth headers to localStorage (matching the Angular token library's format)
3. **`api/authApi.ts`** — sign in, sign out, validate token functions
4. **`features/auth/stores/authStore.ts`** — Pinia store wrapping the auth state and actions
5. **`router/index.ts`** — with a `beforeEach` guard that checks auth
6. **`features/auth/LoginPage.vue`** — simple login form using PrimeVue InputText + Button
7. **`App.vue`** — layout with router-view, maybe a top bar with logout button

### Step 5: Test the integration

1. Start Rails: `rails s` (port 3000)
2. Start Vue: `cd webclientv4 && npm run dev` (port 4200)
3. Open `http://localhost:4200`
4. You should be redirected to the login page
5. Log in with your credentials
6. The auth store should have the user data, localStorage should have the tokens
7. Open the Angular app — you should already be logged in (shared session!)
8. Log out from Vue — Angular should also lose the session

---

## Pattern Reference: Angular → Vue

### Services → API + Store + Composable

```
Angular Service               →  Vue 3 Equivalent
─────────────────────────────────────────────────
HTTP calls                    →  api/someApi.ts (plain functions)
Shared reactive state         →  Pinia store (defineStore)
Shared logic without state    →  composable (useSomething.ts)
```

### Component Pattern

```vue
<!-- Always use <script setup lang="ts"> -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSomeStore } from './stores/someStore'

const store = useSomeStore()

// Props (replaces @Input)
const props = defineProps<{
  budgetId: number
}>()

// Events (replaces @Output + EventEmitter)
const emit = defineEmits<{
  saved: [id: number]
}>()

// Lifecycle
onMounted(() => {
  store.fetchData(props.budgetId)
})

// Computed (replaces pipes and getters)
const total = computed(() =>
  store.items.reduce((sum, item) => sum + item.amount, 0)
)
</script>

<template>
  <!-- Use PrimeVue components + v-model, v-for, v-if -->
</template>

<style scoped>
/* Component-scoped styles */
</style>
```

### Store Pattern

```typescript
// Always use composition-style defineStore for best TS inference
export const useSomeStore = defineStore('some', () => {
  // State
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeItems = computed(() => items.value.filter(i => i.active))

  // Actions
  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      items.value = await someApi.getAll()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, activeItems, fetchItems }
})
```

### API Pattern

```typescript
// Plain functions, no framework dependency, easy to test
import apiClient from '@/api/client'
import type { Item } from '@/features/some/some.type'

export const someApi = {
  getAll: () => apiClient.get<Item[]>('/api/items').then(r => r.data),
  getById: (id: number) => apiClient.get<Item>(`/api/items/${id}`).then(r => r.data),
  save: (item: Item) => apiClient.put<Item>(`/api/items/${item.id}`, { item }).then(r => r.data),
}
```

---

## CORS: Likely Rails Change Needed

For the Vite dev server (port 4200) to talk to Rails (port 3000), the Rails CORS config must allow the Vite origin. Check `config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:4200', 'http://localhost:3000'  # add Vite's origin
    resource '*',
      headers: :any,
      expose: ['access-token', 'expiry', 'token-type', 'uid', 'client'],
      methods: [:get, :post, :options, :delete, :put, :patch]
  end
end
```

The `expose` array is critical — without it, the browser won't let JavaScript read the auth headers from the response, and token capture will silently fail.

**However**, if Vite's proxy is configured correctly, the browser sees all requests as same-origin (localhost:4200) so CORS may not be an issue during development. Test this early — if you get CORS errors, the Rails config above is the fix.

---

## What This Plan Does NOT Cover Yet

These will be tackled incrementally after auth is working:

- Budget list/detail screens
- Transaction management and import
- Account management
- Sink funds
- Settings/configuration
- Production build pipeline and Rails route setup for `/v4/`

Each of these follows the same pattern: types → API → store → components → routes.
