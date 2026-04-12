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
  {
    title: 'Assign allocations on mobile',
    body: 'Editing a transaction on your phone now shows an allocation dropdown right in the edit row, so you can fix a miscategorised purchase without switching to your laptop.',
    date: '2026-04-06',
  },
  {
    title: 'Sink Funds now works on your phone',
    body: "Open a sink fund on mobile and you'll see a card-based list instead of a crammed table. Tap a card to peek at the target, outstanding, and comment; hit Edit to rename, retarget, or deactivate obligations the same way you would on desktop.",
    date: '2026-04-05',
  },
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
