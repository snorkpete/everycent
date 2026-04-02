export const HighlightMode = {
  None: 'none',
  Balance: 'balance',
  Difference: 'difference',
} as const;

export type HighlightMode = (typeof HighlightMode)[keyof typeof HighlightMode];
