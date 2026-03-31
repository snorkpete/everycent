export function remainingClass(value: number): string {
  if (value > 0) return 'amount-positive';
  if (value < 0) return 'amount-negative';
  return 'amount-muted';
}
