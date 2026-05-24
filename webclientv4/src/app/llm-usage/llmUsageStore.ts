import { ref } from 'vue';
import { defineStore } from 'pinia';
import { llmUsageApi } from './llmUsageApi';
import type { LlmUsageRecordData, LlmUsageSummary } from './llmUsage.types';

export const useLlmUsageStore = defineStore('llmUsage', () => {
  const records = ref<LlmUsageRecordData[]>([]);
  const totalCount = ref(0);
  const summary = ref<LlmUsageSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const perPage = ref(50);
  const startDate = ref<string | null>(null);
  const endDate = ref<string | null>(null);

  // Sequence counter: incremented on each fetch call.
  // Only the response matching the latest sequence is applied — earlier (stale) responses are discarded.
  let fetchSequence = 0;

  async function fetch() {
    loading.value = true;
    error.value = null;
    const sequence = ++fetchSequence;

    const params = {
      page: page.value,
      per_page: perPage.value,
      start_date: startDate.value ?? undefined,
      end_date: endDate.value ?? undefined,
    };
    const summaryParams = {
      start_date: startDate.value ?? undefined,
      end_date: endDate.value ?? undefined,
    };

    // Fetch records and summary independently so a summary failure does not
    // block the records from displaying.
    const [recordsResult, summaryResult] = await Promise.allSettled([
      llmUsageApi.getAll(params),
      llmUsageApi.getSummary(summaryParams),
    ]);

    // Discard stale responses from superseded fetch calls.
    if (sequence !== fetchSequence) return;

    if (recordsResult.status === 'fulfilled') {
      records.value = recordsResult.value.records;
      totalCount.value = recordsResult.value.total_count;
      error.value = null;
    } else {
      error.value =
        recordsResult.reason instanceof Error
          ? recordsResult.reason.message
          : 'Failed to load usage records';
    }

    if (summaryResult.status === 'fulfilled') {
      summary.value = summaryResult.value;
    }
    // Summary failure is silent — records still display without the totals row.

    loading.value = false;
  }

  async function setPage(newPage: number) {
    page.value = newPage;
    await fetch();
  }

  async function setDateRange(start: string | null, end: string | null) {
    startDate.value = start;
    endDate.value = end;
    page.value = 1;
    await fetch();
  }

  return {
    records,
    totalCount,
    summary,
    loading,
    error,
    page,
    perPage,
    startDate,
    endDate,
    fetch,
    setPage,
    setDateRange,
  };
});
