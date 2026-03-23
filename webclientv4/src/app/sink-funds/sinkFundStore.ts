import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { sinkFundApi } from './sinkFundApi';
import type { SinkFundData } from './sinkFund.types';

export const useSinkFundStore = defineStore('sinkFund', () => {
  const sinkFunds = ref<SinkFundData[]>([]);
  const sinkFund = ref<SinkFundData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isEditMode = ref(false);
  const showDeactivated = ref(false);

  const visibleAllocations = computed(() => {
    if (!sinkFund.value?.sink_fund_allocations) return [];
    if (showDeactivated.value) return sinkFund.value.sink_fund_allocations;
    return sinkFund.value.sink_fund_allocations.filter((a) => a.status === 'open');
  });

  const totalAssignedBalance = computed(() =>
    (sinkFund.value?.sink_fund_allocations ?? []).reduce(
      (sum, a) => sum + (a.current_balance ?? 0),
      0,
    ),
  );

  const unassignedBalance = computed(
    () => (sinkFund.value?.current_balance ?? 0) - totalAssignedBalance.value,
  );

  const totalTarget = computed(() =>
    visibleAllocations.value
      .filter((a) => (a.target ?? 0) > 0)
      .reduce((sum, a) => sum + (a.target ?? 0), 0),
  );

  const totalOutstanding = computed(() =>
    visibleAllocations.value
      .filter((a) => (a.target ?? 0) > 0)
      .reduce((sum, a) => sum + ((a.current_balance ?? 0) - (a.target ?? 0)), 0),
  );

  async function fetchList() {
    loading.value = true;
    error.value = null;
    try {
      sinkFunds.value = await sinkFundApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load sink funds';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDetail(id: number) {
    loading.value = true;
    error.value = null;
    try {
      sinkFund.value = await sinkFundApi.get(id);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load sink fund';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function save() {
    if (!sinkFund.value) return;

    loading.value = true;
    error.value = null;
    try {
      const saved = await sinkFundApi.save(sinkFund.value);
      sinkFund.value = saved;
      isEditMode.value = false;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save sink fund';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function enterEditMode() {
    isEditMode.value = true;
  }

  function exitEditMode() {
    isEditMode.value = false;
  }

  async function cancelEdit() {
    if (!sinkFund.value?.id) return;
    isEditMode.value = false;
    await fetchDetail(sinkFund.value.id);
  }

  return {
    sinkFunds,
    sinkFund,
    loading,
    error,
    isEditMode,
    showDeactivated,
    visibleAllocations,
    totalAssignedBalance,
    unassignedBalance,
    totalTarget,
    totalOutstanding,
    fetchList,
    fetchDetail,
    save,
    enterEditMode,
    exitEditMode,
    cancelEdit,
  };
});
