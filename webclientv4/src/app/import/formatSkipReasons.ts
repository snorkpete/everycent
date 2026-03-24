import type { SkippedTransaction } from './import.types';

const SKIP_REASON_LABELS: Record<string, string> = {
  duplicate: 'duplicate',
  out_of_period: 'out of period',
  invalid_date: 'invalid date',
  user_excluded: 'manually excluded',
};

export function formatSkipReasons(skipped: SkippedTransaction[]): string {
  const counts = new Map<string, number>();
  for (const s of skipped) {
    counts.set(s.reason, (counts.get(s.reason) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => `${count} ${SKIP_REASON_LABELS[reason] ?? reason}`)
    .join(', ');
}
