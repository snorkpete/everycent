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
  'Chat now knows today\'s date, so questions like "how are we doing this month?" use the right period.',
  'Account Balances is now mobile-friendly — values no longer get cut off on small screens.',
  'Click an account, category, or institution name to view its details — no need to hit Edit first.',
  'The Bank Accounts list (under Setup) now shows the bank name and category (Asset, Liability, Current) next to each account.',
  'On Account Balances, assets and their loans are now grouped together, so you can see the equity of each loan-backed asset at a glance.',
];
