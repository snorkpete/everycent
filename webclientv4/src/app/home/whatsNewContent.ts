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
    title: "See the AI's reasoning in chat",
    body: 'When you ask Everycent a question, you can now expand a small box above each answer to peek at how the AI worked out its response — handy if you want to double-check why it gave a particular number.',
    date: '2026-05-25',
  },
  {
    title: 'Ask Everycent your budget questions',
    body: "A new 'Chat' section in the menu lets you ask plain-English questions about your budget — like \"where did I overspend in March?\" — and get answers backed by your data. Currently uses a local AI model on Kion's gaming PC; ask before trying it out.",
    date: '2026-05-24',
  },
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
];

export const NOTEWORTHY: string[] = [
  'Account Balances is now mobile-friendly — values no longer get cut off on small screens.',
  'Click an account, category, or institution name to view its details — no need to hit Edit first.',
  'The Bank Accounts list (under Setup) now shows the bank name and category (Asset, Liability, Current) next to each account.',
  'On Account Balances, assets and their loans are now grouped together, so you can see the equity of each loan-backed asset at a glance.',
];
