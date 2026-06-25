// Accepts a date-only ISO string (YYYY-MM-DD) or the date portion of an ISO
// timestamp (YYYY-MM-DDThh:mm:ss…), formatting either as dd-mm-yyyy.
export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}
