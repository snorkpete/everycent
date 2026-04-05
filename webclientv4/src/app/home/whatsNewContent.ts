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
    title: 'Use Everycent comfortably on your phone',
    body: 'The Transactions list and the Budget view have been reworked for small screens, so you can add a transaction or check the budget without needing your laptop.',
    date: '2026-04-04',
  },
  {
    title: 'Zero balances now show as a dash',
    body: 'Accounts sitting at $0 appear as a dash instead of "$0.00" on the Account Balances page, so real balances stand out and the page reads cleaner. If you\'d rather see the zeros (to confirm a closed account, say), flip the toggle at the top of the page.',
    date: '2026-04-04',
  },
];

export const NOTEWORTHY: string[] = [
  'Click an account, category, or institution name to view its details — no need to hit Edit first.',
  'The Bank Accounts list (under Setup) now shows the bank name and category (Asset, Liability, Current) next to each account.',
  'On Account Balances, assets and their loans are now grouped together, so you can see the equity of each loan-backed asset at a glance.',
];
