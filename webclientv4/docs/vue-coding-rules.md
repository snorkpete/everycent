# Vue 3 Coding Rules

Detailed coding rules and pattern explanations for `webclientv4`.
For quick reference and architectural constraints, see `../CLAUDE.md`.

## Architecture: Service → API + Store + Composable

Angular services split into three Vue equivalents:

| Angular Service | Vue 3 Equivalent | Location |
|---|---|---|
| HTTP calls | Plain functions | `api/someApi.ts` |
| Shared reactive state | Pinia store | `defineStore` |
| Shared logic without state | Composable | `useSomething.ts` |

## Component Pattern

```vue
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSomeStore } from './stores/someStore'

const store = useSomeStore()

const { budgetId } = defineProps<{ budgetId: number }>()
const emit = defineEmits<{ saved: [id: number] }>()

onMounted(() => { store.fetchData(budgetId) })

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

## Props: Destructure, Don't Use `withDefaults`

Use Vue 3.5+ reactive destructuring with defaults instead of `withDefaults`:

```typescript
// ✅ Correct — destructured with defaults
const { label = '', editMode, inline = false } = defineProps<{
  label?: string;
  editMode: boolean;
  inline?: boolean;
}>();

// ❌ Avoid — withDefaults macro
const props = withDefaults(defineProps<{ ... }>(), { label: '' });
```

Destructured props are reactive in Vue 3.5+. Access them directly by name, not via `props.x`. Migrate existing `withDefaults` usages as you touch the file.

## Store Pattern

```typescript
export const useSomeStore = defineStore('some', () => {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeItems = computed(() => items.value.filter(i => i.active))

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

Rules:
- Use setup-style `defineStore` (function form), not options form
- Always include `loading` and `error` refs
- Actions that fail must re-throw after setting `error.value` so callers can react
- Use `computed` for derived state
- **Never mutate store arrays from components** — always use store actions (e.g. `store.addAllocation()`, not `store.budget.allocations.push()`). The store owns its data; components request changes through actions.
- **All settings access goes through `useSettingsStore()`** — never fetch settings independently via an API call. The router guard loads settings on every route change, so `settingsStore` is guaranteed to be populated when any page renders.

## API Pattern

```typescript
// Plain functions — no framework dependency, easy to test
import apiClient from '@/api/client'
import type { Item } from '@/features/some/some.type'

export const someApi = {
  getAll: () => apiClient.get<Item[]>('/api/items').then(r => r.data),
  getById: (id: number) => apiClient.get<Item>(`/api/items/${id}`).then(r => r.data),
  save: (item: Item) => apiClient.put<Item>(`/api/items/${item.id}`, { item }).then(r => r.data),
}
```

Rules:
- Plain functions only — no class, no framework injection
- Import from `@/api/client`
- Always unwrap with `.then(r => r.data)`
- Use `bankAccountApi.getOpen()` for dropdowns (open accounts sorted by category, no closed accounts, no balance load)

## FormData Types

When the form representation differs from the API type, define a separate `FormData` type. Number fields bound to `EcTextField` must be strings in the form type — convert on save.

## EcMoneyField

Uses native `<input>` instead of PrimeVue InputText/InputNumber — the cents-conversion model (store integers, display formatted) didn't fit PrimeVue's number model. Key behaviour:
- Emits model updates on `input` for live binding
- Reformats display on `blur`
- `highlightMode?: 'positive' | 'zero'` — controls which sign gets colour treatment (default: negatives red)

## Naming

Use explicit variable names. Avoid abbreviations — `bankAccount` not `ba`, `allocation` not `alloc`, `transaction` not `tx`. The only acceptable short names are universally understood loop variables like `i`, `e` (in catch blocks), or single-letter callbacks in `.map(x => ...)` where the context is immediately obvious.

## Formatting

Don't collapse multi-element expressions onto one line. Array literals, `Promise.all` argument lists, object literals with multiple keys, and similar constructs should have one element per line for readability.

## Cloning Reactive Props

```typescript
// Correct — toRaw strips the Proxy before cloning
const draft = structuredClone(toRaw(props.item))

// Wrong — structuredClone throws on Proxy objects
const draft = structuredClone(props.item)
```

## Testing: Single Pinia Instance

Tests that use real Pinia stores must share one Pinia instance between `setActivePinia` and the component mount. Never call `createPinia()` twice.

```typescript
// ✅ Correct — one instance shared everywhere
let pinia: Pinia;

beforeEach(() => {
  pinia = createPinia();
  setActivePinia(pinia);
});

function createWrapper(): VueWrapper {
  return mount(MyPage, {
    global: { plugins: [pinia, PrimeVue] },
  });
}

// ❌ Wrong — two instances, stores don't share state
beforeEach(() => {
  setActivePinia(createPinia());      // instance A
});
function createWrapper(): VueWrapper {
  return mount(MyPage, {
    global: { plugins: [createPinia()] }, // instance B!
  });
}
```

## Testing: Mock at the API Boundary

Page specs should mock API modules, not stores. Use real Pinia stores so store logic is exercised.

```typescript
// ✅ Correct — mock the API, use real store
vi.mock('./someApi', () => ({
  someApi: { getAll: vi.fn(), save: vi.fn() },
}));

// In tests:
vi.mocked(someApi.getAll).mockResolvedValue([buildItem()]);

// ❌ Avoid — mocking the entire store
vi.mock('./someStore', () => ({
  useSomeStore: () => mockStore,
}));
```

**Exception:** Composables that bridge external services (e.g. `useNotifications` wraps PrimeVue toast) still need mocking because they depend on providers not available in unit tests.

## Testing: Assert on Rendered Output

Prefer asserting on what the user sees (rendered text, element presence) over internal state. Use input params to drive assertions when rendered output isn't practical (should be rare).
