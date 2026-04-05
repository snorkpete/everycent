<template>
  <EcPageLayout page-name="home">
    <div
      v-if="lastTransactionDate !== undefined"
      class="last-transaction"
      data-testid="last-transaction"
    >
      <i class="pi pi-clock last-transaction__icon" />
      <template v-if="lastTransactionDate === null">
        <span>No transactions entered yet.</span>
      </template>
      <template v-else>
        <span
          >Everycent updated up to: <strong>{{ formatFriendlyDate(lastTransactionDate) }}</strong>
          <span class="last-transaction__relative"
            >({{ relativeDate(lastTransactionDate) }})</span
          ></span
        >
      </template>
    </div>

    <WhatsNew />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import WhatsNew from './WhatsNew.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { homeApi } from './homeApi';
import { relativeDate } from './relativeDate';
import { formatFriendlyDate } from './formatFriendlyDate';

const headingStore = useHeadingStore();

// `undefined` means "loading or error" (no indicator shown). `null` means
// "loaded, no transactions yet". A string means "loaded, has a date".
const lastTransactionDate = ref<string | null | undefined>(undefined);

onMounted(() => {
  headingStore.setHeading('Home');
  homeApi
    .getLastTransactionDate()
    .then((date) => {
      lastTransactionDate.value = date;
    })
    .catch(() => {
      // Freshness indicator is non-critical — keep it hidden on failure
      // rather than showing an error. Real data operations live on other pages.
      lastTransactionDate.value = undefined;
    });
});
</script>

<style scoped>
.last-transaction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  padding: 0.25rem 0 0.75rem;
}

.last-transaction__icon {
  font-size: 0.85rem;
}

.last-transaction__relative {
  margin-left: 0.25rem;
}
</style>
