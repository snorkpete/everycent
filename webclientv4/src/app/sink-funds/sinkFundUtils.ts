import type { SinkFundAllocationData } from './sinkFund.types';

export function outstanding(allocation: SinkFundAllocationData): number {
  const target = allocation.target ?? 0;
  if (target === 0) return 0;
  return (allocation.current_balance ?? 0) - target;
}
