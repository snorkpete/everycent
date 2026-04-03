export const HighlightMode = {
  None: 'none',
  Balance: 'balance',
  Difference: 'difference',
  Income: 'income',
} as const;

export type HighlightMode = (typeof HighlightMode)[keyof typeof HighlightMode];
