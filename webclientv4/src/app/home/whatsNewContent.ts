// Curated "what's new" content for wifey-facing home page.
// Tiered by impact: HIGHLIGHTS are things she should actively know about
// (changes that affect her workflow or need a moment of explanation).
// NOTEWORTHY are smaller quality-of-life improvements worth mentioning.
// Prune entries when they're no longer new.

export interface Highlight {
  title: string;
  body: string;
  date: string; // ISO date — display format handled by the component
}

export const HIGHLIGHTS: Highlight[] = [
  {
    title: 'Special events now add up across budgets',
    body: 'If a special event runs across more than one budget period (like a trip that spans two months), each allocation now shows once with the amounts added together. Use the Summed / By Budget button at the top to switch back to the per-budget view.',
    date: '2026-10-03',
  },
  {
    title: 'Report a problem right from chat',
    body: 'Chat has a new bug-reporting mode: turn it on, describe what went wrong in plain English, and it gathers the details and saves a report for Kion to look at later.',
    date: '2026-06-29',
  },
  {
    title: 'Ask Everycent your budget questions',
    body: 'The Chat section answers plain-English questions about your budget from your real data — e.g. "Where did we overspend last month?", "Are any sink funds running low?", "How much did we lean on savings this month?", or "Which categories do we keep misjudging?" (Still uses the local AI model on Kion\'s PC — ask before trying it.)',
    date: '2026-06-29',
  },
];

export const NOTEWORTHY: string[] = [
  "On a special event, click the eye icon next to an allocation to see the transactions behind what was spent. In the summed view, each budget's transactions are listed separately with a subtotal.",
];
