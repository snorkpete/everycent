import { computed, ref, type ComputedRef } from 'vue';
import type { SpecialEventAllocationData, SpecialEventAllocationRow } from './specialEvent.types';

function byBudgetStartDate(a: SpecialEventAllocationData, b: SpecialEventAllocationData): number {
  const first = a.budget_start_date;
  const second = b.budget_start_date;
  if (first === second) return 0;
  if (first === undefined) return 1;
  if (second === undefined) return -1;
  return first.localeCompare(second);
}

function distinct(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => !!value))];
}

function toRow(members: SpecialEventAllocationData[]): SpecialEventAllocationRow {
  const ordered = [...members].sort(byBudgetStartDate);
  const name = ordered[0].name ?? '';
  const identified = ordered.filter(
    (allocation): allocation is SpecialEventAllocationData & { id: number } =>
      allocation.id != null,
  );
  const ids = identified.map((allocation) => allocation.id);

  return {
    key: ids.length > 0 ? ids.join('-') : `name-${name}`,
    ids,
    name,
    budget_name: distinct(ordered.map((allocation) => allocation.budget_name)).join(', '),
    allocation_category_name: distinct(
      ordered.map((allocation) => allocation.allocation_category_name),
    )
      .sort()
      .join(', '),
    amount: ordered.reduce((sum, allocation) => sum + (allocation.amount ?? 0), 0),
    spent: ordered.reduce((sum, allocation) => sum + (allocation.spent ?? 0), 0),
    dialogAllocations: identified.map((allocation) => ({
      id: allocation.id,
      name,
      label: allocation.budget_name,
    })),
  };
}

function mergeByName(allocations: SpecialEventAllocationData[]): SpecialEventAllocationRow[] {
  const groups = new Map<string, SpecialEventAllocationData[]>();
  for (const allocation of allocations) {
    const name = allocation.name ?? '';
    groups.set(name, [...(groups.get(name) ?? []), allocation]);
  }
  return [...groups.values()].map(toRow);
}

export function useSpecialEventAllocationRows(
  allocations: ComputedRef<SpecialEventAllocationData[]>,
) {
  const isSummed = ref(true);

  function toggleSummed() {
    isSummed.value = !isSummed.value;
  }

  const rows = computed(() =>
    isSummed.value ? mergeByName(allocations.value) : allocations.value.map((a) => toRow([a])),
  );

  const totalSpent = computed(() =>
    allocations.value.reduce((sum, allocation) => sum + (allocation.spent ?? 0), 0),
  );

  return { isSummed, toggleSummed, rows, totalSpent };
}
