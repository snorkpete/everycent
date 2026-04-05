// Returns a human-friendly relative description of an ISO date (YYYY-MM-DD)
// compared to `now`. Boundaries are whole-day differences — a transaction
// dated today is "today" regardless of time-of-day.
export function relativeDate(isoDate: string, now: Date = new Date()): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const then = new Date(year, month - 1, day);
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((nowMidnight.getTime() - then.getTime()) / 86400000);

  if (days < 0) return 'in the future';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'last month';
  return `${Math.floor(days / 30)} months ago`;
}
