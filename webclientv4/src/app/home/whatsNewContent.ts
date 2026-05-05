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
    title: 'Special Events works on your phone',
    body: 'The Special Events list, detail, and allocation editor all now display properly on mobile — card layouts instead of cramped tables, and buttons that actually fit on screen.',
    date: '2026-05-05',
  },
  {
    title: 'Unpaid transactions stand out in red',
    body: "On the Transactions screen, any transaction that isn't marked Paid now shows in red — date, description, allocation, and amount — so unreconciled rows are easy to spot at a glance.",
    date: '2026-04-20',
  },
  {
    title: 'Tabbing past the allocation no longer picks the wrong one',
    body: 'When adding a new transaction and tabbing through the fields, the allocation dropdown used to jump to the first alphabetical option. It now defaults to a blank selection, so you can tab past it cleanly.',
    date: '2026-04-20',
  },
  {
    title: 'Reports with charts',
    body: 'The Reports section now has three screens — Net Worth, Category Spending, and Needs vs Wants — each with an interactive chart and a year filter so you can focus on a specific period.',
    date: '2026-04-12',
  },
  {
    title: 'EveryCent is now the main page',
    body: "No more typing /v4/ in the URL — the new version loads by default. The old version is still reachable from 'Old Version' in the menu if you need it.",
    date: '2026-04-12',
  },
  {
    title: 'Sign in with Google',
    body: "The 'Sign in with Google' button on the login page is now the preferred way to log in — your existing account is matched by email, so nothing else changes. Email and password still work as a fallback if you need them.",
    date: '2026-04-11',
  },
];

export const NOTEWORTHY: string[] = [
  'Account Balances is now mobile-friendly — values no longer get cut off on small screens.',
  'Click an account, category, or institution name to view its details — no need to hit Edit first.',
  'The Bank Accounts list (under Setup) now shows the bank name and category (Asset, Liability, Current) next to each account.',
  'On Account Balances, assets and their loans are now grouped together, so you can see the equity of each loan-backed asset at a glance.',
];
