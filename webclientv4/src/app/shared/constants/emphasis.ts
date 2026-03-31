export const Emphasis = {
  Item: 'item',
  Subtotal: 'subtotal',
  Total: 'total',
  Headline: 'headline',
} as const;

export type Emphasis = (typeof Emphasis)[keyof typeof Emphasis];
