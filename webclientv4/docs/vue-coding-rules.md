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

const props = defineProps<{ budgetId: number }>()
const emit = defineEmits<{ saved: [id: number] }>()

onMounted(() => { store.fetchData(props.budgetId) })

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

## Cloning Reactive Props

```typescript
// Correct — toRaw strips the Proxy before cloning
const draft = structuredClone(toRaw(props.item))

// Wrong — structuredClone throws on Proxy objects
const draft = structuredClone(props.item)
```
