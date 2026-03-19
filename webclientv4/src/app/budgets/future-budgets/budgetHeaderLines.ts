/**
 * Splits a budget name on its last comma into two display lines.
 * e.g. "Apr 25 - May 24, 2025" → ["Apr 25 - May 24", "2025"]
 * e.g. "Jan 2025" → ["Jan 2025", ""]
 */
export function budgetHeaderLines(name: string): [string, string] {
  const lastComma = name.lastIndexOf(',');
  if (lastComma === -1) return [name, ''];
  return [name.slice(0, lastComma).trim(), name.slice(lastComma + 1).trim()];
}
