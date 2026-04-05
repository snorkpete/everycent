// Formats an ISO date (YYYY-MM-DD) as "D MMM YYYY" (e.g. "4 Apr 2026").
// Locale is pinned to en-GB so output is stable across browsers. Intl can
// emit a non-breaking space between parts in some runtimes — normalised to
// a regular space so the output is predictable for assertions and display.
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatFriendlyDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return dateFormatter.format(date).replace(/\u00A0/g, ' ');
}
